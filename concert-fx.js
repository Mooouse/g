/* Concert Edition: lightweight 2D timeline and particles for Canvas.
 * Inspired by GSAP/Mo.js easing and sequential micro-interactions; no 3D or CDN.
 * Sprites are pooled/capped; effects draw exclusively on the current frame.
 */
(()=>{'use strict';
 const TAU=Math.PI*2, MAX=68;
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 const out3=t=>1-Math.pow(1-clamp(t),3);
 const outBack=t=>{t=clamp(t)-1;return 1+2.15*t*t*t+1.15*t*t;};
 const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
 const rarity=['#cde0ff','#68f8bc','#69c8ff','#bc83ff','#ffd067','#fa8fed'];
 class ConcertFX{
  constructor(){
   this.items=[];this.reduce=false;this.quality=1;this.dropped=0;
   this.rng=12345;
  }
  random(){let x=this.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.rng=x|0;return(x>>>0)/4294967296;}
  setReducedMotion(v){this.reduce=!!v;if(this.reduce)this.items=[];}
  setQuality(q){this.quality=clamp(Number(q)||0,0,1);}
  add(p){
   if(this.reduce||this.quality<=0)return;
   if(this.items.length>=MAX){this.dropped++;this.items.shift();}
   this.items.push(p);
  }
  burst(x,y,color='#9eafff',strength=1){
   if(this.reduce||this.quality<=0)return;
   const amount=Math.min(20,Math.round((8+5*strength)*this.quality));
   const n=Math.max(3,amount);
   for(let i=0;i<n;i++){
    const a=TAU*(i+this.random()*.2)/n;
    const speed=(65+this.random()*125)*(strength>.9?1:0.8);
    this.add({kind:'spark',x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-45,
     age:0,duration:.38+this.random()*.24,size:2.3+this.random()*3,color,rotation:this.random()*TAU});
   }
  }
  merge(x,y,level=1,size=95){
   if(this.reduce)return;
   const color=rarity[clamp(Math.floor(level)-1,0,5)];
   this.add({kind:'ring',x,y,age:0,duration:.55,size:size*.32,color});
   this.add({kind:'ring',x,y,age:0,delay:.12,duration:.76,size:size*.18,color:'#e6faff'});
   this.burst(x,y,color,level>=5?2:1.15);
  }
  reward(x,y,level=1,w=95,h=95){
   if(this.reduce)return;
   const color=rarity[clamp(Math.floor(level)-1,0,5)];
   this.add({kind:'card',x,y,w,h,age:0,duration:level>=5?1.55:1.08,color});
   if(level>=3)this.burst(x,y,color,level>=5?2:1.1);
   if(level>=5)this.add({kind:'ring',x,y,size:Math.max(w,h)*.58,age:0,delay:.08,duration:1.1,color});
  }
  jackpot(x,y,level=1){
   if(this.reduce)return;
   const color=rarity[clamp(level-1,0,5)];
   this.add({kind:'ring',x,y,age:0,duration:1.15,size:80,color});
   if(level>=4){
    const count=Math.round(13*this.quality);
    for(let i=0;i<count;i++){
     this.add({kind:'confetti',x:x+(this.random()-.5)*350,y:y-60,
      vx:(this.random()-.5)*160,vy:-80-this.random()*100,
      age:0,duration:1.1+this.random()*.5,size:3+this.random()*5,
      color:[color,'#ffffff','#78dfff','#ffd76e'][i%4],rotation:this.random()*TAU});
    }
   }
  }
  victory(x,y){if(this.reduce)return;this.jackpot(x,y,6);this.burst(x,y,'#ffd777',2);}
  update(dt){
   dt=clamp(dt,0,.1);
   for(let i=this.items.length-1;i>=0;i--){
    const p=this.items[i];p.age+=dt;
    if(p.age>=(p.duration+(p.delay||0))){this.items.splice(i,1);continue;}
    if(p.kind==='spark'||p.kind==='confetti'){
     p.x+=p.vx*dt;p.y+=p.vy*dt;
     p.vy+=p.kind==='confetti'?320*dt:210*dt;
     p.rotation+=dt*(p.kind==='confetti'?3.4:1.3);
    }
   }
  }
  draw(ctx){
   if(this.reduce)return;
   for(const p of this.items){
    const age=p.age-(p.delay||0);if(age<0)continue;
    const t=clamp(age/p.duration),opacity=1-smooth(t);
    ctx.save();ctx.globalAlpha=opacity;
    if(p.kind==='ring'){
     ctx.strokeStyle=p.color;ctx.lineWidth=2.5+(1-t)*2;
     ctx.beginPath();ctx.arc(p.x,p.y,p.size+out3(t)*53,0,TAU);ctx.stroke();
    }else if(p.kind==='card'){
     const e=out3(t),w=p.w*(1.05+.22*e),h=p.h*(1.05+.22*e);
     ctx.strokeStyle=p.color;ctx.lineWidth=4*(1-t)+1;
     ctx.strokeRect(p.x-w/2,p.y-h/2,w,h);
     ctx.strokeStyle='#ffffff';ctx.globalAlpha=opacity*.6;ctx.lineWidth=2;
     const l=Math.min(w,h)*.21;
     for(const [sx,sy,dx,dy] of [[-1,-1,1,1],[1,-1,-1,1],[-1,1,1,-1],[1,1,-1,-1]]){
      const xx=p.x+sx*w/2,yy=p.y+sy*h/2;
      ctx.beginPath();ctx.moveTo(xx+dx*l,yy);ctx.lineTo(xx,yy);ctx.lineTo(xx,yy+dy*l);ctx.stroke();
     }
    }else{
     ctx.translate(p.x,p.y);ctx.rotate(p.rotation||0);
     ctx.fillStyle=p.color;
     if(p.kind==='confetti')ctx.fillRect(-p.size/2,-p.size/2,p.size*1.3,p.size*.65);
     else ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);
    }
    ctx.restore();
   }
  }
  drawAmbient(ctx,W,H,time,beat){
   if(this.reduce)return;
   // Five tiny fixed-position stage LEDs, no whole-screen flicker/flash.
   const pulse=.25+.2*Math.sin(time*1.9)+clamp(beat)*.08;
   ctx.save();
   for(let i=0;i<5;i++){
    const x=W*(.15+i*.18),y=H*.097;
    ctx.globalAlpha=pulse*(i%2?.42:.6);
    ctx.fillStyle=i%2?'#91d9ff':'#ed9fff';
    ctx.beginPath();ctx.arc(x,y,3.2,0,TAU);ctx.fill();
   }
   ctx.restore();
  }
  snapshot(){return {count:this.items.length,dropped:this.dropped,reduced:this.reduce,quality:this.quality};}
 }
 window.ConcertFX=ConcertFX;
 window.ConcertEasing={out3,outBack,smooth};
})();
