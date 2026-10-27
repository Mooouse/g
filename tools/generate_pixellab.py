#!/usr/bin/env python3
"""Run at most 36 planned PixelLab requests; keep 4 generations in reserve.

SECURITY:
- Read PIXELLAB_API_KEY from environment only (GitHub Actions secret).
- Never print, write, upload or commit the key.
- Store a *pre-request* checkpoint on an isolated staging branch, so reruns
  will not inadvertently duplicate a paid generation.
- Every successful image is saved to a separate native-resolution PNG.
- Do not activate or publish artwork to live game until ALL 36 are complete.

Usage: PIXELLAB_API_KEY=... python tools/generate_pixellab.py
GitHub Action supplies the key securely; do not put tokens in shell commands.
"""
import os, sys, json, base64, subprocess
from pathlib import Path
from io import BytesIO
import requests
from PIL import Image
from pixellab_plan import assets

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"/"pixellab"
OUT.mkdir(parents=True,exist_ok=True)
STATE=OUT/"generation-state.json"
BRANCH="generated/pixellab-v1"
URL="https://api.pixellab.ai/v2/create-image-pixen"
TOTAL_LIMIT=40
PLANNED=36

def git(*args):
    result=subprocess.run(["git",*args],cwd=ROOT,check=True,stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE,text=True)
    return result.stdout.strip()
def persist(message):
    # Save checkpoint to the isolated branch, not main.
    git("add","assets/pixellab/")
    if subprocess.run(["git","diff","--cached","--quiet"],cwd=ROOT).returncode==0:
        return
    git("commit","-m",message)
    for _ in range(4):
        git("fetch","origin",BRANCH)
        try:
            git("rebase","origin/"+BRANCH)
            git("push","origin","HEAD:"+BRANCH)
            return
        except subprocess.CalledProcessError:
            continue
    raise RuntimeError("Could not checkpoint PixelLab artwork to staging branch")
def load():
    if STATE.exists():
        x=json.loads(STATE.read_text(encoding="utf-8"))
    else:
        x={"limit":TOTAL_LIMIT,"spent_attempts":0,"requests":{},"version":1}
    if x["limit"]!=TOTAL_LIMIT:raise ValueError("Generation budget unexpectedly changed")
    return x
def save(data):
    STATE.write_text(json.dumps(data,indent=2,sort_keys=True),encoding="utf-8")
def decode_image(response):
    image=response.get("image")
    if not isinstance(image,dict):raise ValueError("API did not return an image object")
    raw=image.get("base64")
    if not isinstance(raw,str):raise ValueError("Missing base64 image content")
    raw=raw.split(",",1)[-1]
    image_data=base64.b64decode(raw,validate=True)
    im=Image.open(BytesIO(image_data))
    im.load()
    return im.convert("RGBA")
def main():
    key=os.getenv("PIXELLAB_API_KEY")
    if not key:
        print("Missing GitHub Actions secret PIXELLAB_API_KEY; no requests sent.")
        return 3
    state=load()
    manual_retry=os.getenv("PIXELLAB_RETRY_FAILED","false").lower()=="true"
    mode=os.getenv("PIXELLAB_MODE","pilot")
    if mode not in ("pilot","full"):raise ValueError("Unknown safe PixelLab generation mode")
    for index,item in enumerate(assets):
        if mode=="pilot" and index>=1:break
        p=OUT/(item.name+".png")
        prev=state["requests"].get(item.name)
        if prev and prev["status"]=="completed" and p.exists():
            print("SKIP completed",item.name,flush=True)
            continue
        if prev and not (manual_retry and prev["status"]=="needs_review"):
            print("STOP: an existing attempt must be reviewed before any retry:",item.name,
                  "(no extra generation spent)",flush=True)
            return 4
        limit=TOTAL_LIMIT if manual_retry else PLANNED
        if state["spent_attempts"] >= limit:
            print("STOP: generation budget exhausted; no request sent.",flush=True)
            return 5
        # Journal BEFORE sending the paid request.
        state["spent_attempts"]+=1
        attempt=state["spent_attempts"]
        state["requests"][item.name]={"status":"request_started","attempt":attempt}
        save(state)
        persist(f"Checkpoint PixelLab request {attempt}/40 for {item.name}")
        transparent=item.family!="ui" or item.name in {
            "scanner","settings_icon","shop_icon","pause_icon","coin","sparkle"}
        payload={
            "description":item.prompt,
            "image_size":{"width":item.size[0],"height":item.size[1]},
            "detail":"highly detailed",
            "outline":"selective outline",
            "no_background":transparent,
            "enhance_prompt":False,
        }
        try:
            response=requests.post(URL,headers={
                "Authorization":"Bearer "+key,"Content-Type":"application/json"},
                json=payload,timeout=180)
            if response.status_code!=200:
                # Never log response bodies (might include user/account information).
                raise RuntimeError("PixelLab returned HTTP "+str(response.status_code))
            im=decode_image(response.json())
            if im.size!=item.size:
                raise ValueError("Incorrect generated size "+str(im.size))
            if transparent and im.getchannel("A").getextrema()==(255,255):
                raise ValueError("Missing transparent background")
            im.save(p,optimize=True)
            state["requests"][item.name]["status"]="completed"
            state["requests"][item.name]["bytes"]=p.stat().st_size
            state["requests"][item.name]["size"]=list(im.size)
            save(state)
            persist(f"Store PixelLab sprite {attempt}/40: {item.name}")
            print("OK",item.name,"size",im.size,"budget",attempt,"of",TOTAL_LIMIT,flush=True)
        except Exception as err:
            state["requests"][item.name]["status"]="needs_review"
            state["requests"][item.name]["reason"]=str(err)[:150]
            save(state)
            persist(f"Record PixelLab issue {attempt}/40 for {item.name}")
            print("STOP:",item.name,"failed. Generation will NOT retry automatically.",flush=True)
            return 6
    if mode=="pilot":print("PILOT COMPLETE: only one sprite attempted; full batch not launched.")
    else:print("BATCH COMPLETE: 36 unique sprites; four reserved for corrections.")
    return 0

if __name__=="__main__":sys.exit(main())
