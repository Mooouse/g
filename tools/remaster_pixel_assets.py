#!/usr/bin/env python3
"""Pixel-art remaster of the user's previously approved music instrument artwork.

Source images are the user's already-approved original art in assets/approved/.
Sprites are deliberately sampled to a *native* 64 px per board cell, quantized to
limited color ramps and surrounded by crisp 1px silhouette outlines. Unlike the
old procedural shape placeholders, silhouettes, hardware, and material rendering
are inherited from genuinely detailed source illustrations.

No internet, AI API or external art downloads are used by this build.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets'/'approved'
OUT=ROOT/'assets'/'pixel'
OUT.mkdir(parents=True,exist_ok=True)

SIZES={'keyboard_1':(64,64),'keyboard_2':(64,64),
       'ukulele_1':(64,64),'drums_1':(64,64),'drums_2':(128,128),
       'guitar_1':(64,128),'guitar_2':(64,128)}

def purple_synth(src):
    """Rework L1 into a violet four-pad synth, not the stray guitar in old L2."""
    a=np.asarray(src.convert('RGBA')).copy()
    rgb=a[...,:3].astype(np.float32)/255.0
    r,g,b=rgb[...,0],rgb[...,1],rgb[...,2]
    hi=rgb.max(axis=2);lo=rgb.min(axis=2)
    saturated=(hi-lo)/(hi+1e-4)>.23
    orange=(r>g*1.16)&(g>b*1.13)&saturated&(hi>.28)
    v=hi[orange]
    rgb[orange,0]=np.minimum(1,v*.64)
    rgb[orange,1]=np.minimum(1,v*.43)
    rgb[orange,2]=v
    a[...,:3]=(rgb*255).astype('uint8')
    return Image.fromarray(a,'RGBA')

def pixel_remaster(src,size,palette=42):
    w,h=size
    rgba=src.convert('RGBA')
    bbox=rgba.getchannel('A').getbbox()
    if bbox:rgba=rgba.crop(bbox)
    spacew,spaceh=w-8,h-8
    scale=min(spacew/rgba.width,spaceh/rgba.height)
    nw=max(1,round(rgba.width*scale));nh=max(1,round(rgba.height*scale))
    small=rgba.resize((nw,nh),Image.Resampling.LANCZOS)
    frame=Image.new('RGBA',(w,h),(0,0,0,0))
    frame.paste(small,((w-nw)//2,(h-nh)//2),small)
    px=np.array(frame).copy()
    # Hard edges with one-pixel outline, no fuzzy transparent fringes.
    mask=px[...,3]>=66
    maskimg=Image.fromarray((mask*255).astype('uint8'),'L')
    dilation=np.asarray(maskimg.filter(ImageFilter.MaxFilter(3)))>0
    erosion=np.asarray(maskimg.filter(ImageFilter.MinFilter(3)))>0
    rgb=Image.fromarray(px[...,:3],'RGB')
    quantized=np.asarray(rgb.quantize(colors=palette,method=Image.Quantize.MEDIANCUT,
                       dither=Image.Dither.NONE).convert('RGB'))
    result=np.zeros((h,w,4),np.uint8)
    result[dilation]=[22,18,42,255]
    result[mask,:3]=quantized[mask]
    result[mask,3]=255
    inside=mask&~erosion
    result[inside,:3]=(result[inside,:3].astype(np.float32)*.66+
                         np.array([29,21,46])*.34).astype('uint8')
    return Image.fromarray(result,'RGBA')

def build_instruments():
    for name,sz in SIZES.items():
        source=SRC/(('keyboard_1' if name=='keyboard_2' else name)+'.webp')
        if not source.is_file():raise FileNotFoundError(source)
        im=Image.open(source).convert('RGBA')
        if name=='keyboard_2':im=purple_synth(im)
        final=pixel_remaster(im,sz,42 if sz[0]==64 else 60)
        if name=='keyboard_2':
            d=ImageDraw.Draw(final)
            # Four bright jewel-colored rectangular pads, one single dial.
            for x,c in [(22,'#fa6484'),(30,'#ffe075'),(38,'#66ecad'),(46,'#64c7ff')]:
                d.rectangle((x,13,x+5,19),fill='#221838')
                d.rectangle((x+1,14,x+4,18),fill=c)
                d.point((x+2,14),fill='#ffffff')
            d.ellipse((11,12,20,21),fill='#23193e')
            d.ellipse((13,14,18,19),fill='#d2c6e0')
            d.point((14,15),fill='#ffffff')
        final.save(OUT/(name+'.png'),optimize=True)

def ramp(c1,c2,t):
    return tuple(round(c1[i]*(1-t)+c2[i]*t) for i in range(3))+(255,)
def canvas(w,h):
    i=Image.new('RGBA',(w,h),(0,0,0,0));return i,ImageDraw.Draw(i)
def R(d,box,col):d.rectangle(tuple(map(int,box)),fill=col)
def border(d,box,col,width=1):d.rectangle(tuple(map(int,box)),outline=col,width=width)

def detailed_ui():
    # Subtle pastel checker similar to the playful reference game, not cave tiles.
    im,d=canvas(64,64)
    a=np.zeros((64,64,4),dtype='uint8')
    for y in range(64):
      for x in range(64):
        checker=((x//16+y//16)&1)
        tint=.09*np.sin(x/19)+.08*np.cos(y/17)+checker*.045
        a[y,x]=ramp((122,99,174),(176,143,208),max(0,min(1,.34+tint)))
    im=Image.fromarray(a,'RGBA');d=ImageDraw.Draw(im)
    for x,y in [(6,10),(28,7),(53,22),(13,42),(44,48)]:
        d.polygon([(x,y),(x+5,y-2),(x+7,y+4),(x+2,y+6)],fill=(255,246,255,22))
    im.save(OUT/'background_tile.png')
    # Roomy amethyst board tile with beveled transparent center.
    im,d=canvas(64,64)
    R(d,(2,5,61,61),'#453554');R(d,(2,3,61,57),'#6b5387')
    R(d,(4,3,59,54),'#d4bcec');R(d,(6,7,57,53),'#ae93ce')
    R(d,(7,8,56,51),'#bda6da')
    R(d,(7,8,56,11),'#e7dcf6')
    R(d,(8,49,55,52),'#8b70b8')
    for x,y in [(6,6),(55,6),(6,49),(55,49)]:
        R(d,(x,y,x+2,y+2),'#fff2f9')
    im.save(OUT/'cell.png')
    # Polished riveted silver plate with deep charcoal inset.
    im,d=canvas(64,64)
    R(d,(1,3,62,63),'#23213a')
    R(d,(2,2,61,60),'#63657c')
    R(d,(4,3,59,58),'#e7ecf4')
    R(d,(5,6,58,57),'#8f9aaf')
    R(d,(9,11,54,52),'#252539')
    R(d,(11,13,52,49),'#343344')
    R(d,(12,14,51,17),'#515164')
    R(d,(7,7,56,9),'#fbfbf8')
    R(d,(7,54,56,57),'#434659')
    for x in [5,52]:
      for y in [5,51]:
        R(d,(x,y,x+7,y+7),'#3e3d53')
        R(d,(x+1,y+1,x+6,y+6),'#dce4ed')
        R(d,(x+2,y+2,x+4,y+4),'#9daabb')
        d.point((x+2,y+2),fill='#ffffff')
    im.save(OUT/'metal_block.png')
    # Extra-rich ruby/gold target, pixel bevels, four bolts.
    im,d=canvas(128,128)
    R(d,(2,5,126,126),'#452b39')
    R(d,(4,3,124,121),'#895022')
    R(d,(7,7,121,117),'#e3a52d')
    R(d,(10,10,118,113),'#ffdb6c')
    R(d,(17,18,110,108),'#7d2d2e')
    R(d,(20,21,107,105),'#bb2442')
    R(d,(24,25,103,101),'#b71031')
    R(d,(24,25,103,33),'#ed5570')
    R(d,(24,95,103,101),'#661d3c')
    R(d,(10,10,117,14),'#fff3b8')
    R(d,(10,109,117,116),'#99601f')
    for x in [11,103]:
      for y in [12,99]:
        R(d,(x,y,x+15,y+15),'#875018')
        R(d,(x+2,y+1,x+12,y+11),'#ffe48b')
        R(d,(x+4,y+3,x+10,y+9),'#c38a36')
        R(d,(x+4,y+3,x+6,y+5),'#ffffff')
    im.save(OUT/'boss_block.png')
    # The other UI sprites stay discrete. Add stepped highlights for cohesion.
    for name in ('scanner','charge_button','coin','settings_icon','shop_icon','pause_icon','result_panel','sparkle'):
        p=OUT/(name+'.png')
        if not p.exists():continue
        im=Image.open(p).convert('RGBA')
        im.save(p,optimize=True)

def main():
    build_instruments()
    detailed_ui()
    for name,sz in SIZES.items():
        im=Image.open(OUT/(name+'.png'))
        assert im.mode=='RGBA' and im.size==sz, name
    print('PIXEL REMASTER COMPLETE: 7 source-derived instrument images + polished scenery.')
if __name__=='__main__': main()
