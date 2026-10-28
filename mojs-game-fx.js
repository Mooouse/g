/* mo.js bridge for Melody Scanner Concert Edition.
 * Uses the real @mojs/core Burst and Shape APIs; all objects are reused.
 * No effect is scheduled per frame, and nothing intercepts pointer input.
 */
(()=>{'use strict';
 const palettes=[
  ['#c4ddff','#e7d2ff','#79c8f7'],
  ['#55ffc7','#a6fff0','#ffe9a1'],
  ['#6cc7ff','#a7efff','#fff1c5'],
  ['#c58cff','#f2a8ff','#a9e2ff'],
  ['#ffcc60','#fff1ae','#ef97ed'],
  ['#ff7de8','#ffd974','#f7e9ff']
 ];
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 class MojsGameFX{
  constructor(host,canvas,getLayout,env=window){
   this.host=host;this.canvas=canvas;this.getLayout=getLayout;this.env=env;
   this.enabled=!!(host&&canvas&&env.mojs&&typeof env.mojs.Burst==='function'&&typeof env.mojs.Shape==='function');
   this.reduced=!!env.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
   this.pools=new Map();this.counts=Object.create(null);this.lastTimes=new Map();
   this.played=0;this.skipped=0;
  }
  at(x,y){
   const layout=this.getLayout(),rect=this.canvas.getBoundingClientRect(),hostRect=this.host.getBoundingClientRect();
   if(!layout||!layout.W||!layout.H||!Number.isFinite(x)||!Number.isFinite(y))return null;
   return {x:rect.left-hostRect.left+x/layout.W*rect.width,
           y:rect.top-hostRect.top+y/layout.H*rect.height};
  }
  make(kind,level){
   const mojs=this.env.mojs,c=palettes[clamp((level|0)-1,0,5)];
   const defs={
    merge:{count:9,radius:68,duration:550,ring:84},
    block:{count:6,radius:46,duration:440,ring:51},
    prize:{count:level>=4?12:7,radius:level>=4?105:61,duration:level>=4?880:540,ring:level>=4?118:76},
    swap:{count:4,radius:36,duration:390,ring:45},
    victory:{count:16,radius:145,duration:1150,ring:158}
   };
   const options=defs[kind]||defs.block;
   const burst=new mojs.Burst({
    parent:this.host,x:0,y:0,opacity:1,
    radius:{0:options.radius},count:options.count,
    children:{
     shape:['circle','line','circle','polygon'],
     points:4,
     fill:c,
     stroke:'none',
     radius:{6:0},
     scale:{1:0.3},
     duration:options.duration,
     easing:'cubic.out',
     isSwirl:false
    }
   });
   const ring=new mojs.Shape({
    parent:this.host,x:0,y:0,shape:'circle',fill:'none',stroke:c[0],
    strokeWidth:{4:0},radius:{10:options.ring},
    opacity:{.72:0},duration:options.duration+130,easing:'cubic.out'
   });
   return {burst,ring};
  }
  effect(kind,x,y,level=1){
   if(!this.enabled||this.reduced||this.env.document?.hidden){this.skipped++;return false;}
   const pos=this.at(x,y);if(!pos)return false;
   // Stop scan-induced spam from overwhelming a busy 120/144 Hz screen.
   const now=(this.env.performance?.now?.()||Date.now());
   if(kind==='block'&&now-(this.lastTimes.get('block')||0)<155){this.skipped++;return false;}
   if(kind==='swap'&&now-(this.lastTimes.get('swap')||0)<95){this.skipped++;return false;}
   this.lastTimes.set(kind,now);
   const rarity=clamp(level|0,1,6);
   const key=kind+':'+(kind==='prize'||kind==='merge'?rarity:1);
   let group=this.pools.get(key);
   if(!group){group=[];this.pools.set(key,group);}
   const limit=kind==='block'?3:kind==='prize'?2:kind==='victory'?1:kind==='swap'?2:4;
   if(group.length<limit)group.push(this.make(kind,rarity));
   const index=(this.counts[key]||0)%group.length;this.counts[key]=(this.counts[key]||0)+1;
   const effect=group[index];
   for(const item of [effect.burst,effect.ring]){
    item.tune({x:pos.x,y:pos.y});
    item.replay();
   }
   this.played++;
   return true;
  }
  merge(x,y,level){return this.effect('merge',x,y,level);}
  block(x,y,boss=false){return this.effect('block',x,y,boss?5:2);}
  prize(x,y,level){return this.effect('prize',x,y,level);}
  swap(x,y){return this.effect('swap',x,y,2);}
  victory(x,y){return this.effect('victory',x,y,6);}
  debug(){return {enabled:this.enabled,reduced:this.reduced,played:this.played,skipped:this.skipped,
    poolCount:[...this.pools.values()].reduce((s,g)=>s+g.length,0)};}
 }
 window.MojsGameFX=MojsGameFX;
})();
