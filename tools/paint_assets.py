#!/usr/bin/env python3
"""Distinct hand-authored native-resolution pixel assets for Melody Scanner.
Draws independent RGBA sprites at one source pixel per pixel-art pixel.
No AI copy of existing game images; deterministic output, no AA or resampling.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import random

OUT=Path("assets/pixel")
OUT.mkdir(parents=True,exist_ok=True)
INK="#18172b"; DEEP="#27233a"; SHADE="#4b3a54"
SILVER="#9faaba"; LIGHTMETAL="#e4e9dc"; WHITE="#fff6d8"
GOLD="#f9c34f"; GDARK="#95511d"; GHI="#fff1a0"
ORANGE="#ef7c24"; OBRIGHT="#ffb64a"; ORUST="#9c3d25"
BLUE="#197bca"; BBRIGHT="#68d6ee"; BDARK="#174475"
RED="#bb2b52"; RBRIGHT="#f56c76"; RDARK="#631d3f"
GREEN="#57d6ac"; BG="#24203a"
def canvas(w,h,bg=(0,0,0,0)):
    im=Image.new("RGBA",(w,h),bg);return im,ImageDraw.Draw(im)
def rect(d,x,y,w,h,c):d.rectangle((int(x),int(y),int(x+w-1),int(y+h-1)),fill=c)
def poly(d,points,c):d.polygon(points,fill=c)
def line(d,points,c,w=1):d.line(points,fill=c,width=w,joint="curve")
def oval(d,x,y,w,h,c):d.ellipse((x,y,x+w-1,y+h-1),fill=c)
def border(d,x,y,w,h,c,t=2):
    rect(d,x,y,w,t,c);rect(d,x,y+h-t,w,t,c)
    rect(d,x,y,t,h,c);rect(d,x+w-t,y,t,h,c)
def dot_grid(d,x,y,dx,dy,nx,ny,c):
    for yy in range(ny):
        for xx in range(nx):rect(d,x+xx*dx,y+yy*dy,1,1,c)
def save(name,im):
    if im.mode!="RGBA":im=im.convert("RGBA")
    im.save(OUT/(name+".png"),optimize=True)
    print(name, im.size, (OUT/(name+".png")).stat().st_size)
def synth(level):
    im,d=canvas(64,64)
    if level==1:
        poly(d,[(7,18),(10,15),(53,15),(57,18),(57,50),(53,54),(10,54),(7,51)],INK)
        rect(d,10,18,44,33,ORUST);rect(d,11,17,42,29,ORANGE)
        rect(d,12,18,40,4,OBRIGHT);rect(d,12,44,40,5,"#c45725")
        for xx,cc in [(17,OBRIGHT),(31,RED),(39,GOLD),(47,GREEN)]:
            rect(d,xx-3,25,7,7,INK);rect(d,xx-2,26,5,4,cc);rect(d,xx-2,26,4,1,WHITE)
        rect(d,14,35,36,11,INK)
        for k in range(8):
            x=15+k*4.25
            rect(d,int(x),36,4,9,"#ffefdc");rect(d,int(x)+3,37,1,8,"#b8a9a0")
        for k in [0,1,3,4,5,6]:rect(d,int(18+k*4.25),36,3,5,DEEP)
        rect(d,13,50,38,1,GOLD)
        for x in [8,54]:
            rect(d,x,24,1,17,"#653746")
    else:
        poly(d,[(5,18),(9,13),(17,11),(47,11),(55,14),(59,19),(59,51),(55,55),(8,55),(5,51)],INK)
        poly(d,[(8,19),(11,16),(19,14),(45,14),(53,16),(56,19),(56,51),(53,52),(10,52),(8,50)],"#5043a2")
        rect(d,11,16,42,3,"#b6a0ff");rect(d,10,47,44,4,"#342665")
        rect(d,13,22,16,8,INK)
        rect(d,15,24,12,4,"#7ad5e2")
        rect(d,16,24,3,2,WHITE)
        for n,color in enumerate([RED,GOLD,GREEN,BBRIGHT]):
            x=33+(n%2)*10;y=21+(n//2)*8
            rect(d,x,y,8,8,INK);rect(d,x+1,y+1,6,5,color);rect(d,x+2,y+2,3,1,WHITE)
        rect(d,12,34,40,14,INK)
        for k in range(10):
            x=13+k*3.9
            rect(d,int(x),35,3,11,WHITE);rect(d,int(x)+2,36,1,9,"#9b9db8")
        for k in [0,1,3,4,5,7,8]:
            rect(d,int(16+k*3.9),35,2,6,DEEP)
        for x in [12,51]:rect(d,x,49,2,3,"#d5bdfa")
    save("keyboard_"+str(level),im)
def ukulele():
    im,d=canvas(64,64)
    # Headstock + four separate tuning pegs.
    poly(d,[(27,4),(37,4),(40,10),(38,16),(26,16),(24,10)],INK)
    poly(d,[(28,5),(36,5),(38,10),(36,14),(28,14),(26,10)],"#a2653d")
    for y in [7,11]:
        rect(d,22,y,4,3,SILVER);rect(d,38,y,4,3,SILVER)
    rect(d,28,15,8,22,INK);rect(d,29,16,6,22,"#7a4b32")
    rect(d,30,17,4,17,"#c08b5a")
    for y in [18,22,26,30,34]:
        rect(d,28,y,8,1,GOLD)
    poly(d,[(25,32),(19,34),(16,40),(18,45),(15,49),(16,55),(22,60),(40,60),(48,55),(49,49),(45,44),(48,39),(42,34),(38,32)],INK)
    poly(d,[(26,34),(21,36),(19,41),(22,46),(18,50),(19,54),(23,58),(40,58),(45,54),(46,50),(42,45),(45,41),(41,36),(37,34)],"#90552b")
    poly(d,[(27,35),(23,38),(22,41),(26,46),(22,51),(24,55),(29,56),(40,55),(43,52),(39,45),(42,39),(38,36)],"#e3a34f")
    poly(d,[(24,39),(29,37),(30,44),(25,50),(22,51),(26,46)],"#fac274")
    oval(d,27,35,11,11,INK);oval(d,29,37,7,7,"#6c3d26")
    oval(d,28,36,9,9,"#eec177")
    oval(d,30,38,5,5,INK)
    rect(d,26,49,13,5,INK);rect(d,27,50,11,2,"#65402b")
    rect(d,28,14,8,2,WHITE)
    for x in [30,31,33,34]:
        rect(d,x,15,1,36,"#f0d08c")
    save("ukulele_1",im)
def drum(d,cx,cy,r,body=ORANGE):
    # Front-facing pixel-drum body, octagonal, with metallic chrome trim.
    o=[(cx-r//2,cy-r),(cx+r//2,cy-r),(cx+r,cy-r//2),(cx+r,cy+r//2),
       (cx+r//2,cy+r),(cx-r//2,cy+r),(cx-r,cy+r//2),(cx-r,cy-r//2)]
    poly(d,o,INK)
    poly(d,[(cx-r//2+2,cy-r+2),(cx+r//2-2,cy-r+2),(cx+r-2,cy-r//2+2),
       (cx+r-2,cy+r//2-2),(cx+r//2-2,cy+r-2),(cx-r//2+2,cy+r-2),
       (cx-r+2,cy+r//2-2),(cx-r+2,cy-r//2+2)],SILVER)
    oval(d,cx-r+5,cy-r+5,2*r-10,2*r-10,body)
    oval(d,cx-r+8,cy-r+8,2*r-16,2*r-16,"#f4e9ce")
    for dx,dy in [(-r+4,0),(r-7,0),(0,-r+3),(0,r-7)]:
        rect(d,cx+dx,cy+dy,4,4,INK);rect(d,cx+dx+1,cy+dy,2,2,WHITE)
    rect(d,cx-r//3,cy-r//3,r//2,2,WHITE)
def drums(level):
    N=64 if level==1 else 128
    im,d=canvas(N,N);k=1 if level==1 else 2
    # Detailed drum kits become structurally richer, not a recolor.
    rect(d,10*k,20*k,3*k,37*k,SILVER)
    rect(d,6*k,56*k,12*k,2*k,DEEP)
    rect(d,4*k,16*k,22*k,3*k,GDARK)
    poly(d,[(5*k,16*k),(8*k,12*k),(22*k,12*k),(26*k,16*k),(22*k,19*k),(9*k,19*k)],GOLD)
    line(d,[(7*k,14*k),(22*k,14*k)],GHI,k)
    drum(d,35*k,42*k,17*k)
    drum(d,43*k,23*k,9*k,OBRIGHT)
    if level==2:
        drum(d,25*k,23*k,9*k,ORANGE)
        drum(d,16*k,45*k,10*k,OBRIGHT)
        rect(d,55*k,13*k,3*k,44*k,SILVER)
        rect(d,46*k,11*k,16*k,3*k,GDARK)
        poly(d,[(45*k,11*k),(48*k,8*k),(61*k,8*k),(63*k,11*k),(58*k,14*k),(48*k,14*k)],GOLD)
        rect(d,52*k,54*k,8*k,3*k,DARK if False else DEEP)
    else:
        rect(d,37,15,13,2,LIGHTMETAL)
    save("drums_"+str(level),im)
def guitar(level):
    im,d=canvas(64,128)
    guitarred=level==1
    body=RED if guitarred else BLUE;hi=RBRIGHT if guitarred else BBRIGHT
    dark=RDARK if guitarred else BDARK;metal=GOLD if guitarred else SILVER
    # Distinct headstock styles: rounded crown vs sharpened modern.
    if guitarred:
        poly(d,[(25,3),(40,3),(44,9),(42,19),(26,19),(23,10)],INK)
        poly(d,[(27,5),(39,5),(42,10),(40,16),(27,16),(25,10)],"#902942")
    else:
        poly(d,[(23,6),(40,1),(45,8),(43,19),(26,19)],INK)
        poly(d,[(26,7),(40,4),(43,9),(40,16),(27,17)],"#247dc5")
    for yy in [8,12,16]:
        rect(d,20,yy,5,3,metal);rect(d,43,yy,5,3,metal)
        rect(d,21,yy+1,2,1,WHITE);rect(d,45,yy+1,2,1,WHITE)
    # Long fretboard, uninterrupted silhouette.
    rect(d,27,19,12,55,INK);rect(d,29,20,8,55,"#754538" if guitarred else "#514a48")
    rect(d,31,21,4,51,"#8c5a42" if guitarred else "#74675e")
    for y in [25,31,37,43,48,53,57,61,65,69,72]:
        rect(d,28,y,10,1,LIGHTMETAL)
    for y in [33,49,59]:
        rect(d,32,y,2,2,WHITE)
    if guitarred:
        poly(d,[(24,69),(18,71),(12,79),(9,91),(10,106),(17,117),(24,123),(42,123),(50,119),(55,107),(54,90),(48,77),(40,71),(39,80),(28,80)],INK)
        poly(d,[(23,73),(18,75),(15,83),(12,94),(14,107),(19,115),(26,120),(41,120),(49,114),(52,104),(51,91),(46,80),(42,76),(41,84),(27,84)],body)
        poly(d,[(17,84),(20,78),(24,76),(26,85),(20,93),(18,109),(14,102),(14,92)],hi)
        rect(d,21,116,19,3,dark)
    else:
        poly(d,[(10,72),(18,64),(23,80),(29,82),(37,81),(48,65),(56,76),(51,89),(57,104),(50,119),(42,123),(19,123),(10,116),(8,101),(15,88)],INK)
        poly(d,[(13,76),(18,69),(24,84),(30,86),(39,84),(48,70),(52,77),(47,90),(53,104),(47,116),(40,120),(20,120),(13,113),(11,101),(19,88)],body)
        poly(d,[(15,78),(19,76),(22,85),(19,100),(13,109),(12,98)],hi)
        poly(d,[(45,85),(49,78),(51,77),(48,90),(53,103),(48,110)],"#0f518b")
        rect(d,17,114,23,4,dark)
    # Pickup count and hardware differentiate tiers.
    pickups=[(24,83),(24,98)] if guitarred else [(24,82),(24,94),(24,106)]
    for xx,yy in pickups:
        rect(d,xx-2,yy-2,21,10,INK);rect(d,xx,yy,17,6,metal)
        rect(d,xx+2,yy+1,13,3,"#3c3949")
        for k in range(6):rect(d,xx+2+k*2,yy+2,1,1,WHITE)
    rect(d,26,112,17,6,INK);rect(d,28,113,13,4,metal)
    for xx,yy in [(48,105),(44,112)]:
        rect(d,xx-2,yy-2,7,7,INK);rect(d,xx-1,yy-1,5,5,metal);rect(d,xx,yy,2,1,WHITE)
    if not guitarred:
        rect(d,29,116,12,2,LIGHTMETAL)
        rect(d,42,117,2,5,SILVER)
    for xx in [30,31,32,34,35,36]:rect(d,xx,18,1,97,"#f2dbad")
    save("guitar_"+str(level),im)
def terrain():
    im,d=canvas(64,64,"#201b34")
    for y in range(0,64,8):
        for x in range(0,64,8):
            col="#25203c" if ((x//8+y//8)&1) else "#201b34"
            rect(d,x,y,8,8,col)
    random.seed(1908)
    for i in range(13):
        x=random.randrange(4,60);y=random.randrange(4,60)
        rect(d,x,y,2,2,random.choice(["#3b2f58","#493b69","#302748"]))
    save("background_tile",im)
    im,d=canvas(64,64)
    rect(d,2,5,60,57,INK);rect(d,3,3,58,56,"#55416b")
    rect(d,5,5,54,51,"#363049");rect(d,6,6,52,4,"#81648b")
    rect(d,6,50,52,5,"#25233f")
    for xx in [9,54]:
        for yy in [11,47]:rect(d,xx,yy,2,2,"#9481a5")
    save("cell",im)
    im,d=canvas(64,64)
    rect(d,3,4,58,58,INK);rect(d,4,3,56,56,SILVER)
    rect(d,6,5,52,52,"#60748a");rect(d,7,6,50,5,LIGHTMETAL)
    rect(d,10,14,44,39,INK);rect(d,13,16,38,34,"#2b2a43")
    rect(d,13,16,38,5,"#3e475c");rect(d,14,47,36,2,"#111a2b")
    for xx in [7,52]:
        for yy in [7,51]:rect(d,xx,yy,5,5,INK);rect(d,xx+1,yy+1,3,3,LIGHTMETAL)
    save("metal_block",im)
    im,d=canvas(128,128)
    rect(d,3,5,122,120,INK);rect(d,5,3,118,118,GDARK)
    rect(d,9,8,110,110,GOLD);rect(d,12,11,104,8,GHI)
    rect(d,18,22,92,87,INK);rect(d,21,25,86,81,"#96263f")
    rect(d,25,29,78,74,RED);rect(d,25,30,78,7,RBRIGHT)
    for xx in [11,109]:
        for yy in [14,106]:
            rect(d,xx,yy,8,8,GDARK);rect(d,xx+1,yy+1,5,5,GHI)
    save("boss_block",im)
    im,d=canvas(16,64)
    for x,color in [(1,"#224b5b"),(3,"#286e7a"),(5,GREEN),(7,WHITE),(8,WHITE),(10,GREEN),(12,"#286e7a")]:
        rect(d,x,0,2,64,color)
    for y in range(0,64,16):
        rect(d,0,y,16,3,GHI);rect(d,4,y+3,8,1,GREEN)
    save("scanner",im)
    im,d=canvas(128,48)
    rect(d,2,4,124,43,INK);rect(d,3,2,122,40,"#ac602b")
    rect(d,7,5,114,35,GOLD);rect(d,9,7,110,28,"#43b692")
    rect(d,10,8,108,7,"#95f2bd")
    rect(d,10,32,108,5,"#1e785e")
    rect(d,8,39,112,3,"#764b2f")
    for xx in [14,110]:rect(d,xx,16,5,14,GHI)
    save("charge_button",im)
    im,d=canvas(16,16)
    poly(d,[(7,0),(10,5),(15,7),(10,10),(7,15),(5,10),(0,7),(5,5)],INK)
    poly(d,[(7,2),(9,6),(13,7),(9,9),(7,13),(6,9),(2,7),(6,6)],GOLD)
    rect(d,6,6,3,3,WHITE)
    save("sparkle",im)
def main():
    synth(1);synth(2);ukulele();drums(1);drums(2);guitar(1);guitar(2);terrain()
    print("DONE",len(list(OUT.glob("*.png"))),"separate pixel-art PNG files")
if __name__=="__main__":main()
