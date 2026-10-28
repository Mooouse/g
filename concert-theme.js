/* Melody Scanner • Concert Edition. 2D Canvas stage/UI, cached with board geometry. */
(()=>{'use strict';
const TWOPI=Math.PI*2;
const bounded=(v,a,b)=>Math.max(a,Math.min(b,v));
const COLORS=['#a8d6ff','#52ffce','#57b5ff','#d985ff','#ffcf64','#ff82e7'];
const RARITY=['ОБЫЧНЫЙ','НЕОБЫЧНЫЙ','РЕДКИЙ','ЭПИЧЕСКИЙ','ЛЕГЕНДАРНЫЙ','МИФИЧЕСКИЙ'];
const RARITY_EN=['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC'];
const FAMILIES={keys:'Клавишные',ukulele:'Укулеле',drums:'Ударные',guitar:'Электрогитара'};
function rr(ctx,x,y,w,h,r=16){if(typeof ctx.roundRect==='function'){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}else{ctx.beginPath();ctx.rect(x,y,w,h);}}
function fill(ctx,x,y,w,h,color,r=14){ctx.fillStyle=color;rr(ctx,x,y,w,h,r);ctx.fill();}
function outline(ctx,x,y,w,h,color,r=14,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;rr(ctx,x,y,w,h,r);ctx.stroke();}
function gradient(ctx,x,y,w,h,stops){const g=ctx.createLinearGradient(x,y,x+w,y+h);for(const [pos,c] of stops)g.addColorStop(pos,c);return g;}
function radial(ctx,x,y,r,col){const g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'#00000000');return g;}
function type(ctx,value,x,y,size=24,color='#eff4ff',align='center',weight=800){
 ctx.fillStyle=color;ctx.font=weight+' '+size+'px system-ui,Arial,sans-serif';
 ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(String(value),x,y);
}
function pane(ctx,x,y,w,h,r=18,accent='#ffffff25'){
 ctx.save();ctx.shadowColor='#020515aa';ctx.shadowBlur=18;ctx.shadowOffsetY=7;
 fill(ctx,x,y,w,h,gradient(ctx,x,y,w,h,[[0,'#101d38f5'],[1,'#0b1029f5']]),r);
 ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 outline(ctx,x,y,w,h,accent,r,2);
 fill(ctx,x+7,y+7,w-14,2,'#b4d5ff13',2);
 ctx.restore();
}
function drawStage(ctx,L){
 const {W,H}=L;
 ctx.fillStyle=gradient(ctx,0,0,W,H,[[0,'#100c29'],[.42,'#221345'],[.78,'#090e26'],[1,'#090719']]);
 ctx.fillRect(0,0,W,H);
 // Static concert lighting: gradients are baked into the cached backdrop.
 const lights=[{x:.1,c:'#a322fd'},{x:.27,c:'#2359fa'},{x:.45,c:'#e52bdc'},{x:.64,c:'#156bf2'},{x:.84,c:'#c229ff'},{x:.97,c:'#e98338'}];
 for(const p of lights){
  const x=p.x*W,yt=H*.06,yb=H*.86,width=W*.16;
  ctx.save();const cone=ctx.createLinearGradient(x,yt,x,yb);
  cone.addColorStop(0,p.c+'44');cone.addColorStop(.55,p.c+'18');cone.addColorStop(1,p.c+'00');
  ctx.beginPath();ctx.moveTo(x-12,yt);ctx.lineTo(x+12,yt);ctx.lineTo(x+width,yb);ctx.lineTo(x-width,yb);ctx.closePath();ctx.fillStyle=cone;ctx.fill();
  ctx.fillStyle=radial(ctx,x,yt,85,p.c+'77');ctx.beginPath();ctx.arc(x,yt,85,0,TWOPI);ctx.fill();ctx.restore();
 }
 // Steel stage truss and rigging; no distracting animation.
 ctx.fillStyle='#080d20';ctx.fillRect(0,0,W,29);ctx.fillRect(0,102,W,7);
 for(let x=0;x<W;x+=91){
  ctx.strokeStyle='#58628a55';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x,1);ctx.lineTo(x+80,101);ctx.moveTo(x+80,1);ctx.lineTo(x,101);ctx.stroke();
  ctx.fillStyle='#26305b';ctx.fillRect(x,0,7,104);
 }
 for(const p of lights){
  const x=p.x*W;
  fill(ctx,x-16,30,32,19,'#09091b',5);fill(ctx,x-11,48,22,12,p.c,4);
  ctx.fillStyle=radial(ctx,x,66,26,p.c+'aa');ctx.beginPath();ctx.arc(x,66,26,0,TWOPI);ctx.fill();
 }
 // Stage floor sheen and two discreet speaker columns.
 ctx.fillStyle=gradient(ctx,0,H*.74,0,H*.3,[[0,'#06071900'],[.3,'#1b1340bb'],[1,'#080818']]);
 ctx.fillRect(0,H*.74,W,H*.26);
 for(const side of [0,1]){
  const x=side?W-92:18;
  fill(ctx,x,H*.46,75,H*.25,'#050717ee',9);outline(ctx,x,H*.46,75,H*.25,'#6c63b755',9);
  for(const y of [H*.535,H*.645]){
   ctx.fillStyle='#1b2142';ctx.beginPath();ctx.arc(x+38,y,24,0,TWOPI);ctx.fill();
   ctx.strokeStyle='#454b73';ctx.lineWidth=6;ctx.stroke();
   ctx.fillStyle='#111c39';ctx.beginPath();ctx.arc(x+38,y,11,0,TWOPI);ctx.fill();
  }
 }
 // Crowd silhouettes in the foreground are kept away from active cells.
 const crowdY=H*.91;
 ctx.save();ctx.fillStyle='#04071a';
 for(let n=0;n<Math.ceil(W/34);n++){
  const x=n*34+((n*37)%18),head=crowdY+((n*17)%31)-8;
  ctx.beginPath();ctx.arc(x,head,12+((n*11)%8),0,TWOPI);ctx.fill();
  ctx.beginPath();ctx.ellipse(x,head+36,23,30,0,Math.PI,0,true);ctx.fill();
  if(n%4===0){ctx.strokeStyle='#050717';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(x-6,head+15);ctx.lineTo(x-18,head-41);ctx.stroke();}
 }
 ctx.restore();
 // Tiny nonrandom star lights across the rear wall.
 for(let i=0;i<90;i++){
  const x=(i*187+41)%W,y=112+(i*73)%(H*.68);
  ctx.globalAlpha=.16+(i%5)*.085;fill(ctx,x,y,2+(i%3),2+(i%3),i%3?'#b7d1ff':'#f5a2fb',1);
 }ctx.globalAlpha=1;
}
function drawSlots(ctx,L,cell){
 const cols=L.portrait?7:13;
 const first=cell(0,0),last=cell(cols-1,5);
 const x=first.x-11,y=first.y-12,w=last.x+last.w-x+11,h=last.y+last.h-y+12;
 pane(ctx,x-8,y-8,w+16,h+16,17,'#975cde88');
 fill(ctx,x,y,w,h,gradient(ctx,x,y,w,h,[[0,'#161633f3'],[1,'#0c142af2']]),13);
 for(let r=0;r<6;r++)for(let c=0;c<cols;c++){
  const p=cell(c,r),pad=2;
  fill(ctx,p.x+pad,p.y+pad,p.w-pad*2,p.h-pad*2,((r+c)%2===0)?'#22203f':'#1b1c3a',8);
  outline(ctx,p.x+pad,p.y+pad,p.w-pad*2,p.h-pad*2,'#859bd03d',8,1.3);
  fill(ctx,p.x+8,p.y+7,p.w-16,2,'#b8aaf825',2);
 }
}
function drawTarget(ctx,b,rect,value){
 if(b.hp<=0)return;
 const {x,y,w,h}=rect,boss=!!b.boss;
 const front=boss?'#492037':'#20283e';
 ctx.save();
 ctx.shadowColor=boss?'#ffba3680':'#0c3efb36';ctx.shadowBlur=boss?18:6;
 fill(ctx,x+3,y+4,w-6,h-6,front,boss?11:8);
 ctx.shadowBlur=0;
 outline(ctx,x+4,y+4,w-8,h-8,boss?'#ffd06a':'#9aaddb',boss?11:8,boss?5:3);
 fill(ctx,x+10,y+9,w-20,Math.min(6,h*.09),boss?'#ffe9aa70':'#a2bdff50',3);
 if(boss){
  ctx.strokeStyle='#eabe7c55';ctx.lineWidth=2;
  ctx.strokeRect(x+13,y+15,w-26,h-30);
 }
 for(const [cx,cy] of [[x+10,y+11],[x+w-14,y+11],[x+10,y+h-15],[x+w-14,y+h-15]]){
  fill(ctx,cx,cy,4,4,boss?'#ffdb80':'#9ba9d9',1);
 }
 const sz=bounded(Math.min((w-22)/Math.max(1,value.length*.65),h*.43,boss?71:60),15,boss?71:60);
 type(ctx,value,x+w*.5,y+h*.49,sz,boss?'#fff1c6':'#f5f3ff','center',900);
 if(b.hp<b.max){
  fill(ctx,x+14,y+h-15,w-28,5,'#111126',3);
  fill(ctx,x+14,y+h-15,Math.max(0,(w-28)*b.hp/b.max),5,boss?'#ffc85a':'#45dbda',3);
 }
 ctx.restore();
}
function bar(ctx,x,y,w,h,ratio,color){
 fill(ctx,x,y,w,h,'#11152c',6);fill(ctx,x,y,w*bounded(ratio,0,1),h,color,6);
}
function hud(ctx,L,state,toast,paused=false){
 const W=L.W,H=L.H,P=L.portrait;
 const settings={x:P?13:29,y:21,w:58,h:56},pause={x:P?82:98,y:21,w:58,h:56};
 for(const [rect,ico] of [[settings,'⚙'],[pause,paused?'▶':'Ⅱ']]){
  pane(ctx,rect.x,rect.y,rect.w,rect.h,11,'#9b85df9c');
  type(ctx,ico,rect.x+rect.w*.5,rect.y+rect.h*.49,29,'#e5e7ff');
 }
 const tx=P?W*.5:W*.5,ty=P?49:48;
 pane(ctx,tx-(P?133:181),17,P?266:362,65,15,'#a778fa77');
 type(ctx,'♫',tx-(P?99:134),49,25,'#91e9ff');
 const seconds=Number.isFinite(state.time)?Math.max(0,state.time):0;
 const tm=Math.floor(seconds/60)+':'+String(Math.floor(seconds%60)).padStart(2,'0');
 type(ctx,tm,tx+24,44,P?35:42,'#f3f7ff');
 bar(ctx,tx-(P?115:144),71,P?230:288,4,seconds/192,'#48cfff');
 const bx=P?W-200:W-255;
 pane(ctx,bx,18,P?184:225,62,14,'#ffd5807f');
 type(ctx,'★',bx+28,48,28,'#ffd76d');
 type(ctx,Math.floor(Number.isFinite(state.coins)?state.coins:0).toLocaleString('en-US'),bx+(P?169:205),49,P?27:34,'#ffe7a0','right');
 if(!P){
  pane(ctx,17,188,210,309,16,'#5b76d688');
  type(ctx,'УРОВЕНЬ',42,220,23,'#add5ff','left',900);
  type(ctx,String(state.stage),201,221,33,'#ffffff','right',900);
  bar(ctx,36,249,170,9,1-seconds/192,'#c965ff');
  type(ctx,'ТВОЯ ЦЕЛЬ',36,298,19,'#c9dcff','left',800);
  type(ctx,'РАЗРУШИТЬ',36,337,25,'#f7f3ff','left',900);
  type(ctx,'ВСЕ БЛОКИ',36,368,25,'#f7f3ff','left',900);
  type(ctx,'♪ МУЗЫКА + MERGE',36,411,15,'#8d9dbd','left');
  type(ctx,'⚡ ЗАРЯД: '+Math.floor(Number.isFinite(state.charge)?state.charge:0),36,465,24,'#ffe1a0','left',900);
  pane(ctx,W-231,188,214,265,16,'#9549d482');
  type(ctx,'СЛУЧАЙНЫЙ',W-125,235,18,'#c9dcff');
  type(ctx,'ИНСТРУМЕНТ',W-125,265,18,'#c9dcff');
  fill(ctx,W-179,298,106,103,gradient(ctx,W-179,298,106,103,[[0,'#6b38d7'],[1,'#281d63']]),14);
  outline(ctx,W-179,298,106,103,'#a06cff',14,3);
  type(ctx,'?',W-126,342,74,'#e8d8ff');
  type(ctx,'Шанс на редкий приз',W-125,424,14,'#a4afd5');
 }
 const x=W*.5-(P?211:225),y=P?1444:773,w=P?422:450,h=P?90:111;
 const charge=Number.isFinite(state.charge)?Math.floor(state.charge):0;
 ctx.save();ctx.shadowColor='#d13cff8a';ctx.shadowBlur=24;
 fill(ctx,x,y,w,h,gradient(ctx,x,y,w,h,[[0,'#9c3dfb'],[.5,'#6733dd'],[1,'#3a1b8d']]),19);
 ctx.restore();outline(ctx,x,y,w,h,charge>=5?'#e4b8ff':'#756d99',19,3);
 fill(ctx,x+8,y+8,w-16,6,'#e8c7ff54',4);
 type(ctx,P?'КРУТИТЬ  ◈  5':'КРУТИТЬ РУЛЕТКУ',x+w*.5,y+(P?34:39),P?32:34,'#ffffff');
 type(ctx,P?'СЛУЧАЙНЫЙ ИНСТРУМЕНТ':'5 ЗАРЯДА  •  СЛУЧАЙНЫЙ ПРИЗ',x+w*.5,y+(P?68:78),P?15:18,'#d8c5ff');
 if(P){
  type(ctx,'УРОВЕНЬ '+state.stage,W*.5,110,29,'#dfe9ff');
  type(ctx,'⚡ '+Math.floor(Number.isFinite(state.charge)?state.charge:0),W-90,113,23,'#ffe0a3','right');
  type(ctx,'♫ MERGE • SCAN',W*.5,1410,20,'#9da9cf');
 }else{
  type(ctx,'MELODY',W*.5,125,29,'#e8d6ff', 'center',900);
  type(ctx,'SCANNER  •  CONCERT EDITION',W*.5,151,16,'#a5b3e0');
  type(ctx,'ОБЪЕДИНЯЙ  •  СОЗДАВАЙ  •  ПОБЕЖДАЙ',W*.5,733,19,'#bbc7e8');
 }
 if(toast)type(ctx,toast.t,W*.5,P?1402:758,P?24:24,'#ffe1a2');
 return {charge:{x,y,w,h},settings,pause};
}
function rouletteFrame(ctx,L,roll,art,images){
 if(!roll)return;
 const W=L.W,H=L.H,P=L.portrait;
 ctx.save();ctx.fillStyle='#06061bdf';ctx.fillRect(0,0,W,H);
 const w=P?790:1030,h=P?670:492,x=(W-w)/2,y=(H-h)/2;
 ctx.shadowColor='#9b4ffc91';ctx.shadowBlur=35;
 pane(ctx,x,y,w,h,26,'#b768f7');ctx.shadowBlur=0;
 const t=bounded(roll.age/roll.duration,0,1),reveal=roll.phase==='reveal';
 type(ctx,reveal?'ТВОЙ ИНСТРУМЕНТ':'СЛУЧАЙНОЕ ВЫПАДЕНИЕ',W*.5,y+54,P?34:38,'#f4eaff');
 type(ctx,reveal?'РЕДКОСТЬ ОПРЕДЕЛЕНА':'КРУТИМ РУЛЕТКУ...',W*.5,y+102,P?22:24,'#a6b9e3');
 const box=P?150:170,gap=P?6:16,total=box*5+gap*4,start=W*.5-total/2;
 // Carousel actually moves and decelerates; the chosen prize ends in
 // the exact center rather than jumping to a different item on reveal.
 const reel=roll.sequence||[0,1,2,3,roll.tier,4,5];
 const travel=(reel.length-5)*(1-Math.pow(1-t,2.6));
 const base=reveal?reel.length-5:Math.floor(travel);
 const fraction=reveal?0:travel-base;
 const cy=y+(P?170:142),step=box+gap;
 ctx.save();ctx.beginPath();ctx.rect(start,cy,total,box+13);ctx.clip();
 for(let k=0;k<6;k++){
  const tier=reel[base+k];
  if(!Number.isInteger(tier)||tier<0||tier>=art.total)continue;
  const item=art.approved[tier];if(!item)continue;
  const level=bounded(item.level,1,6),clr=COLORS[level-1],cx=start+(k-fraction)*step;
  const highlight=reveal&&k===2;
  ctx.save();
  if(highlight){ctx.shadowColor=clr;ctx.shadowBlur=26;}
  fill(ctx,cx,cy,box,box+10,gradient(ctx,cx,cy,box,box+10,[[0,highlight?'#36316e':'#1d213c'],[1,'#0e1730']]),17);
  outline(ctx,cx,cy,box,box+10,highlight?clr:'#656e99',17,highlight?4:2);
  ctx.restore();
  const img=images[tier];
  if(img?.complete&&img.naturalWidth>0){
   const aspect=img.naturalWidth/img.naturalHeight,maxW=box*.8,maxH=box*.74;
   const dw=Math.min(maxW,maxH*aspect),dh=dw/aspect;
   ctx.imageSmoothingEnabled=false;
   ctx.drawImage(img,cx+(box-dw)/2,cy+7+(box-dh)/2,dw,dh);
  }
  type(ctx,'LV '+level,cx+box/2,cy+box-1,P?18:19,clr);
 }
 ctx.restore();
 // Fixed selection window stays put while the cards slide behind it.
 outline(ctx,start+2*step-2,cy-2,box+4,box+14,reveal?COLORS[(art.approved[roll.tier]?.level||1)-1]:'#d29aff',18,4);
 type(ctx,'▼',W*.5,y+(P?154:132),32,'#ffe0a8');
 const lvl=art.approved[roll.tier]?.level||1;
 const name=(roll.lang==='en'?RARITY_EN:RARITY)[lvl-1];
 type(ctx,reveal?name:'✦  ✦  ✦',W*.5,y+(P?425:363),reveal?(P?43:48):34,reveal?COLORS[lvl-1]:'#c3caff');
 if(reveal)type(ctx,(FAMILIES[art.approved[roll.tier]?.family]||'Инструмент')+'  •  Уровень '+lvl,W*.5,y+(P?476:418),P?24:27,'#ffffff');
 else bar(ctx,x+100,y+(P?513:420),w-200,9,t,'#ba5cfc');
 if(reveal)type(ctx,'+1 ИНСТРУМЕНТ',W*.5,y+h-51,25,'#b5f6dc');
 ctx.restore();
}
function pause(ctx,L){
 const w=L.portrait?570:520,h=135,x=(L.W-w)/2,y=(L.H-h)/2;
 ctx.save();ctx.fillStyle='#060820bf';ctx.fillRect(0,0,L.W,L.H);
 pane(ctx,x,y,w,h,18,'#b781ff');
 type(ctx,'Ⅱ  ПАУЗА',L.W/2,y+58,L.portrait?36:43,'#ffffff');
 type(ctx,'Нажми ▶, чтобы продолжить',L.W/2,y+100,19,'#c5d0ef');
 ctx.restore();
}
function result(ctx,L,message,win,stage){
 const W=L.W,H=L.H,x=W*.19,y=H*.29,w=W*.62,h=H*.41;
 ctx.fillStyle='#08051ed9';ctx.fillRect(0,0,W,H);
 pane(ctx,x,y,w,h,27,win?'#f8c75d':'#ba78fd');
 type(ctx,win?'★   ★   ★':'♫',W*.5,y+72,win?65:55,win?'#ffdc73':'#dba4ff');
 type(ctx,message,W*.5,y+170,bounded(W*.035,31,56),'#f9f3ff');
 type(ctx,win?'УРОВЕНЬ '+stage+' ЗАВЕРШЁН':'ПОПРОБУЙ ЕЩЁ РАЗ',W*.5,y+244,28,'#c8d9fa');
 fill(ctx,W*.5-165,y+h-100,330,68,gradient(ctx,W*.5-165,y+h-100,330,68,[[0,'#ad46f4'],[1,'#5225b0']]),16);
 type(ctx,win?'▶  СЛЕДУЮЩИЙ':'▶  ЗАНОВО',W*.5,y+h-65,31,'#ffffff');
}
window.ConcertTheme={drawStage,drawSlots,drawTarget,hud,rouletteFrame,pause,result,COLORS,RARITY};
})();
