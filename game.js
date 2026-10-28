/* Melody Scanner — original canvas recreation of the observed grid-based gameplay. */
(()=>{'use strict';
const canvas=document.getElementById('game'),$=id=>document.getElementById(id),ART=window.GridMusicArt;
let ctx=canvas.getContext('2d');
const ASSET_BUILD='pixellab-stability-v7'; // bust cached placeholder PNGs
const KEY='melody-scanner-approved-assets-v1';
const OLD_KEY='melody-scanner-video-reference-v3';
const I={
ru:{title:'НАСТРОЙКИ',shop:'УЛУЧШЕНИЯ',volume:'ГРОМКОСТЬ',music:'МУЗЫКА',language:'ЯЗЫК',shopText:'Прокачивай звук, монеты и скорость сканера',power:'Сила звука',powerDesc:'Больше урона от инструментов',speed:'Скорость сканера',speedDesc:'Луч проходит чаще',wealth:'Заработок',wealthDesc:'Больше монет от урона',max:'МАКС',paused:'ПАУЗА',time:'ВРЕМЯ ВЫШЛО',retry:'ПОВТОРИТЬ',win:'УРОВЕНЬ ПРОЙДЕН!',next:'ДАЛЕЕ',help:'Перетаскивай одинаковые инструменты друг на друга. Луч запускает музыку и наносит урон. Зелёная кнопка создаёт инструменты.',charge:'Нажми на зелёную кнопку, чтобы получить инструмент!',noRoom:'Нет свободного места!',noCharge:'Недостаточно заряда',merged:'НОВЫЙ ИНСТРУМЕНТ!',money:'МОНЕТЫ',save:'Прогресс сохраняется',restart:'Enter — новый раунд',secret:'ЗОЛОТАЯ ЦЕЛЬ ПОВЕРЖЕНА!',hint:'Объединяй одинаковые инструменты!'},
en:{title:'SETTINGS',shop:'UPGRADES',volume:'VOLUME',music:'MUSIC',language:'LANGUAGE',shopText:'Improve your music, money and scanner speed',power:'Sound power',powerDesc:'Instruments deal more damage',speed:'Scan speed',speedDesc:'The beam moves faster',wealth:'Income',wealthDesc:'Earn more coins from damage',max:'MAX',paused:'PAUSED',time:"TIME'S UP",retry:'RETRY',win:'LEVEL COMPLETE!',next:'NEXT',help:'Drag matching instruments together to merge them. The scanning beam plays music and damages blocks. Use the green button to create instruments.',charge:'Press the green button to spawn an instrument!',noRoom:'No room for an instrument!',noCharge:'Not enough charge',merged:'NEW INSTRUMENT!',money:'COINS',save:'Progress is saved',restart:'Enter — restart round',secret:'GOLDEN TARGET DEFEATED!',hint:'Merge matching instruments!'},
es:{title:'AJUSTES',shop:'MEJORAS',volume:'VOLUMEN',music:'MÚSICA',language:'IDIOMA',shopText:'Mejora sonido, monedas y velocidad',power:'Potencia',powerDesc:'Los instrumentos hacen más daño',speed:'Velocidad',speedDesc:'El rayo pasa más rápido',wealth:'Ingresos',wealthDesc:'Gana más monedas por daño',max:'MÁX.',paused:'PAUSA',time:'SE ACABÓ EL TIEMPO',retry:'REINTENTAR',win:'¡NIVEL COMPLETADO!',next:'SIGUIENTE',help:'Arrastra instrumentos iguales para fusionarlos. El rayo musical daña los bloques. El botón verde crea nuevos instrumentos.',charge:'Pulsa el botón verde para crear instrumentos.',noRoom:'¡No hay espacio!',noCharge:'Carga insuficiente',merged:'¡NUEVO INSTRUMENTO!',money:'MONEDAS',save:'Progreso guardado',restart:'Enter — reiniciar',secret:'¡OBJETIVO DORADO DESTRUIDO!',hint:'¡Fusiona instrumentos iguales!'}
};
const txt=(key)=>I[state.lang]?.[key]||I.en[key]||key;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function random(seed){return()=>{seed|=0;seed=seed+0x6d2b79f5|0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}};
const configs=[
{c:0,r:0,w:1,h:2,hp:50},{c:1,r:0,w:2,h:2,hp:1000},{c:3,r:0,w:1,h:1,hp:10},{c:4,r:0,w:1,h:1,hp:20},{c:5,r:0,w:1,h:1,hp:40},
{c:3,r:1,w:2,h:1,hp:50},{c:6,r:0,w:2,h:2,hp:2000},{c:8,r:0,w:1,h:2,hp:7000},{c:9,r:0,w:1,h:1,hp:3000},
{c:9,r:1,w:1,h:2,hp:9000},{c:10,r:0,w:3,h:3,hp:100000,boss:true},{c:7,r:2,w:2,h:1,hp:600},{c:7,r:3,w:2,h:1,hp:300},
{c:6,r:4,w:2,h:2,hp:3000},{c:8,r:4,w:2,h:2,hp:5000},{c:9,r:3,w:2,h:1,hp:800},
{c:11,r:3,w:1,h:2,hp:4000},{c:12,r:3,w:1,h:2,hp:3000},{c:11,r:5,w:1,h:1,hp:1000},{c:12,r:5,w:1,h:1,hp:2000}
];
// Only the seven individually approved instrument sprites appear in this build.
// Positions fit the actual 13x6 game grid and its obstacle layout.
const starting=[
 {tier:5,c:0,r:2},  // Electric guitar 1 (1x2)
 {tier:6,c:6,r:2},  // Electric guitar 2 (1x2)
 {tier:4,c:4,r:4},  // Full drums 2 (2x2)
 {tier:0,c:1,r:2},{tier:0,c:2,r:2},
 {tier:1,c:3,r:2},{tier:1,c:4,r:2},
 {tier:2,c:5,r:2},  // Ukulele 1
 {tier:3,c:1,r:3},{tier:3,c:2,r:3}, // Compact drums 1
 {tier:2,c:3,r:3},{tier:2,c:4,r:3},
 {tier:0,c:5,r:3},{tier:0,c:0,r:4},
 {tier:2,c:1,r:4},{tier:3,c:2,r:4},
 {tier:0,c:3,r:4}
];
const startState=()=>({stage:1,coins:241,time:192,charge:16,chargeFill:.62,highest:6,upgrades:{power:0,speed:0,wealth:0},units:[],blocks:[],volume:.7,music:.46,lang:/^ru/i.test(navigator.language)?'ru':/^es/i.test(navigator.language)?'es':'en',tutorialSeen:false,finished:false});
let state=startState(),selected=null,dragging=null,hovered=null,hoveredChrome=false,paused=false,showResult='',scanner=-50,pass=0,frameLast=performance.now(),fx=[],hints=0,toast=null,checkpoint=0,portrait=false,LAY=null,imgs=[],booted=false,sdkReady=false,store=null,chargeHitBox=null,settingsHot=null,shopHot=null,pauseHot=null;
function clone(x){return JSON.parse(JSON.stringify(x));}
function initWorld(reset=false){
 const factor=1+Math.max(0,state.stage-1)*.14;
 const previous=reset?starting:state.units.filter(u=>u.tier>=0);
 state.blocks=configs.map((c,i)=>({...c,id:i,max:Math.ceil(c.hp*factor),hp:Math.ceil(c.hp*factor)}));
 state.units=previous.map(u=>({tier:u.tier,c:u.c,r:u.r,id:uid++}));
 state.time=192;state.finished=false;state.charge=Math.max(state.charge,16);
 for(const unit of [...state.units]){if(!canPlace(unit.c,unit.r,unit.tier,unit.id)){const pos=findFree(unit.tier,unit.id);if(pos){unit.c=pos.c;unit.r=pos.r}else state.units=state.units.filter(v=>v.id!==unit.id);}}
 selected=null;scanner=-25;pass=0;paused=false;showResult='';hints=0;
}
let uid=1;
const unitMotion=new Map();
const blockMotion=new Map();
let animClock=0, screenShake=0, beatVisual=0;
const easeOutBack=t=>{const p=1.14;return 1+(p+1)*Math.pow(t-1,3)+p*Math.pow(t-1,2)};
const easeOutCubic=t=>1-Math.pow(1-t,3);
const easeInOutCubic=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const tileCenter=(c,r,tier)=>{const span=ART.spans(tier),a=cellRect(c,r);return{x:a.x+(a.w+(span.w-1)*LAY.step)/2,y:a.y+(a.h+(span.h-1)*LAY.step)/2};};
function animateUnit(id,kind='spawn',from=null){
 const unit=state.units.find(u=>u.id===id);
 const dest=unit?tileCenter(unit.c,unit.r,unit.tier):null;
 const distance=from&&dest?Math.hypot(dest.x-from.x,dest.y-from.y):0;
 const duration=kind==='merge'?Math.min(1.15,Math.max(.44,.3+distance/950)):
                kind==='move'?Math.min(.7,Math.max(.27,.19+distance/1150)):.4;
 unitMotion.set(id,{kind,age:0,duration,from:from||dest,to:dest});
 if(kind==='merge'&&dest){
  fx.push({kind:'arrival',x:dest.x,y:dest.y,
   w:ART.spans(unit.tier).w*LAY.step-8,h:ART.spans(unit.tier).h*LAY.step-8,
   life:duration+.82,max:duration+.82});
 }
}
function animateHit(id,strength=1){blockMotion.set(id,{time:.36,force:Math.min(5,1+strength/600)});screenShake=Math.min(4,screenShake+.13);}

// Repair saved blocks by their stable ID. Filtering invalid HP used to remove
// blocks and shift all subsequent block IDs/coordinates on reload.
function repairBlocks(saved){
 const factor=1+Math.max(0,state.stage-1)*.14,byId=new Map();
 if(Array.isArray(saved))for(const b of saved)
  if(b&&Number.isInteger(b.id)&&b.id>=0&&b.id<configs.length&&!byId.has(b.id))byId.set(b.id,b);
 return configs.map((base,id)=>{
  const src=byId.get(id),normalMax=Math.ceil(base.hp*factor);
  const max=Number.isFinite(src?.max)&&src.max>0?src.max:normalMax;
  // Invalid/missing HP with a saved instrument on these cells means this
  // target was cleared before the numeric corruption. Never erase that unit.
  const occupied=Array.isArray(state.units)&&state.units.some(u=>{
   if(!u||!Number.isInteger(u.tier)||u.tier<0||u.tier>=ART.total||
      !Number.isInteger(u.c)||!Number.isInteger(u.r))return false;
   const size=ART.spans(u.tier);
   return u.c<base.c+base.w&&u.c+size.w>base.c&&
          u.r<base.r+base.h&&u.r+size.h>base.r;
  });
  const recoveredEmpty=Array.isArray(saved)&&saved.length>0&&occupied;
  const hp=Number.isFinite(src?.hp)?clamp(src.hp,0,max):(recoveredEmpty?0:normalMax);
  return {...base,id,max,hp};
 });
}
function repairUnits(){
 // Occupancy is rebuilt in order, so multi-cell items cannot overlap.
 if(!Array.isArray(state.units)){state.units=[];return;}
 const incoming=state.units.slice();
 state.units=[];
 for(const u of incoming){
  if(!u||!Number.isInteger(u.tier)||u.tier<0||u.tier>=ART.total)continue;
  let pos={c:u.c,r:u.r};
  if(!Number.isInteger(pos.c)||!Number.isInteger(pos.r)||!canPlace(pos.c,pos.r,u.tier))
   pos=findFree(u.tier,undefined,{c:Number.isFinite(u.c)?u.c:0,r:Number.isFinite(u.r)?u.r:0});
  if(pos)state.units.push({tier:u.tier,c:pos.c,r:pos.r,id:uid++});
 }
}
function read(){
 try{
  // The visual/merge overhaul changes the meaning of tiers. Keep resources,
  // stage, and settings from older saves, but rebuild the incompatible grid.
  const saveStore=store||localStorage;
  const raw=saveStore.getItem(KEY),legacy=!raw?saveStore.getItem(OLD_KEY):null;
  if(!raw&&!legacy)return;
  const obj=JSON.parse(raw||legacy);
  if(!obj||!Number.isInteger(obj.stage)||obj.stage<1||obj.stage>500)return;
  const base=startState();
  state={...base,...obj,upgrades:{...base.upgrades,...obj.upgrades}};
  state.coins=Number.isFinite(state.coins)?clamp(state.coins,0,1e12):base.coins;
  state.charge=Number.isFinite(state.charge)?clamp(state.charge,0,500):base.charge;
  state.chargeFill=Number.isFinite(state.chargeFill)?clamp(state.chargeFill,0,1):base.chargeFill;
  state.time=Number.isFinite(state.time)?clamp(state.time,0,192):base.time;
  state.volume=Number.isFinite(state.volume)?clamp(state.volume,0,1):base.volume;
  state.music=Number.isFinite(state.music)?clamp(state.music,0,1):base.music;
  state.highest=Number.isInteger(state.highest)?clamp(state.highest,0,ART.total-1):0;
  for(const k of ['power','speed','wealth']){
   const max=k==='speed'?8:12;
   state.upgrades[k]=Number.isFinite(state.upgrades[k])?clamp(Math.trunc(state.upgrades[k]),0,max):0;
  }
  if(!I[state.lang])state.lang='en';
  if(legacy){state.units=[];state.blocks=[];state.highest=6;state.finished=false;}
  state.blocks=repairBlocks(state.blocks);
  repairUnits();

 }catch(e){console.warn('Save unavailable',e);}
}
let saveTimer=0;
function persist(){try{(store||localStorage).setItem(KEY,JSON.stringify(state));}catch(e){}}
function save(immediate=false){
 clearTimeout(saveTimer);
 if(immediate===true)persist();
 else saveTimer=setTimeout(persist,100);
}
const gameEvent=method=>{try{if(sdkReady)window.CrazyGames?.SDK?.game?.[method]?.();}catch(e){}};
function gameMode(on){if(paused===!on)return;paused=!on;gameEvent(on?'gameplayStart':'gameplayStop');}
async function sdkInit(){
 try{const sdk=window.CrazyGames?.SDK;if(sdk){await Promise.race([sdk.init(),new Promise((_,rej)=>setTimeout(()=>rej(Error('timeout')),2300))]);sdkReady=true;try{sdk.game.loadingStart()}catch(e){}
 store=sdk.data?.getItem&&sdk.data?.setItem?sdk.data:localStorage;
 try{const f=s=>sound.setPortalMuted(!!s?.muteAudio);f(sdk.game?.settings);sdk.game?.addSettingsChangeListener?.(f);}catch(e){}
 }}catch(e){console.info('Standalone preview');}
 if(!store)store=localStorage;
 read();
 if(!state.blocks.length)initWorld(true);
 else{state.blocks=repairBlocks(state.blocks);repairUnits();}
 save(); // Persist repaired finite state on the next safe tick.
 setupImages();setView();bind();fillPanel();booted=true;gameEvent('loadingStop');gameEvent('gameplayStart');requestAnimationFrame(loop);
}
function canPlace(c,r,tier,ignore){
 const {w,h}=ART.spans(tier);if(c<0||r<0||c+w>13||r+h>6)return false;
 for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){
 if(state.blocks.some(b=>b.hp>0&&x>=b.c&&x<b.c+b.w&&y>=b.r&&y<b.r+b.h))return false;
 if(state.units.some(u=>u.id!==ignore&&x>=u.c&&x<u.c+ART.spans(u.tier).w&&y>=u.r&&y<u.r+ART.spans(u.tier).h))return false;
 }return true;
}
function findFree(tier,ignore,near=null){
 const rs=[];
 for(let r=0;r<6;r++)for(let c=0;c<13;c++)if(canPlace(c,r,tier,ignore))rs.push({c,r});
 if(!rs.length)return null;
 if(near){
  // When upgrading into a larger footprint, search *closest* valid slot
  // before moving across the board. Stable tie-breaking avoids random jumps.
  const cost=p=>(p.c-near.c)**2+(p.r-near.r)**2;
  rs.sort((a,b)=>cost(a)-cost(b)||Math.abs(a.r-near.r)-Math.abs(b.r-near.r)||a.c-b.c||a.r-b.r);
  return rs[0];
 }
 rs.sort((a,b)=>(a.c>6?40:0)+a.c*.2+a.r*.03-((b.c>6?40:0)+b.c*.2+b.r*.03));
 return rs[Math.floor(Math.random()*Math.min(7,rs.length))];
}
function occupiedUnit(c,r){return [...state.units].reverse().find(u=>c>=u.c&&c<u.c+ART.spans(u.tier).w&&r>=u.r&&r<u.r+ART.spans(u.tier).h);}
function matchAt(x,y){return state.blocks.find(b=>b.hp>0&&x>=b.c&&x<b.c+b.w&&y>=b.r&&y<b.r+b.h);}
function makeBlockText(v){
 if(!Number.isFinite(v))return '—';
 if(v>=99500)return Math.round(v/1000)+'K';
 if(v>=1000)return (v>=10000?Math.round(v/1000):Number((v/1000).toFixed(v%1000===0?0:1)))+'K';
 return String(Math.max(0,Math.ceil(v)));
}
// Damage is keyed by each family's real level, not its position in art.js.
// The legacy 16-entry lookup produced NaN for PixelLab tiers 16–23.
function unitDamage(tier){
 const a=ART.approved[tier];
 if(!a)return 1;
 const base={keys:8,ukulele:11,drums:20,guitar:26}[a.family]||8;
 const level=clamp(Number.isFinite(a.level)?a.level:1,1,6);
 const power=clamp(Number.isFinite(state.upgrades.power)?state.upgrades.power:0,0,12);
 return Math.max(1,Math.ceil(base*Math.pow(2.7,level-1)*(1+power*.27)));
}
function damageBlock(b,value,p){
 if(!b||!Number.isFinite(b.hp)||b.hp<=0||!Number.isFinite(value)||value<=0)return;
 const d=clamp(Math.round(value),1,1e8);
 b.hp=Math.max(0,b.hp-d);
 const earned=Math.max(1,Math.round(d*(.018+state.upgrades.wealth*.011)));
 state.coins=clamp((Number.isFinite(state.coins)?state.coins:0)+earned,0,1e12);
 state.chargeFill=(Number.isFinite(state.chargeFill)?state.chargeFill:0)+Math.min(.36,d/10000);
 if(state.chargeFill>=1){const a=Math.floor(state.chargeFill);state.charge=Math.min(999,(Number.isFinite(state.charge)?state.charge:0)+a);state.chargeFill-=a;}
 const point=p||{x:rectOfBlock(b).x+40,y:rectOfBlock(b).y+50};
 animateHit(b.id,d);burst(point.x,point.y,d,b.boss?'#fff9c0':'#74ecff');
 if(d>15&&Math.random()<.7)fx.push({kind:'coin',x:point.x+5,y:point.y-14,vx:20,vy:-110,life:1,max:1,text:'+$'+earned,color:'#fff071'});
 if(Math.random()<.25) sound.hit(d,b.boss);
 if(b.hp===0){
   const pos=rectOfBlock(b),x=pos.x+pos.w*.5,y=pos.y+pos.h*.5;
   scatter(x,y,b.boss?'#ffe789':'#d6fbff',28);
   fx.push({kind:'break',x,y,w:pos.w,h:pos.h,life:.62,max:.62,color:b.boss?'#ffd66c':'#dfdeed'});
   state.coins=clamp(state.coins+(b.boss?1500:Math.max(14,Math.floor(b.max/25))),0,1e12);
   state.charge=Math.min(999,(Number.isFinite(state.charge)?state.charge:0)+(b.boss?20:Math.max(1,Math.floor(b.max/1400))));
   sound.breakBox(b.boss);
   if(!b.boss&&Math.random()<.24){const tier=Math.random()<.15?1:0;const f=findFree(tier);if(f){const u={tier,...f,id:uid++};state.units.push(u);animateUnit(u.id);}}
 }
 if(state.blocks.every(k=>k.hp<=0)){state.finished=true;showResult=txt('win');gameEvent('gameplayStop');sound.win();if(state.stage%5===0)gameEvent('happytime');save();}
}
function emitInstrument(u){
 const p=rectOfUnit(u),cx=p.x+p.w*.5,cy=p.y+p.h*.5;
 sound.note(u.tier);scatter(cx,cy,'#6ffcff',7);
 fx.push({kind:'halo',x:cx,y:cy,r:10,life:.7,max:.7,color:'#24e7ef'});
 fx.push({kind:'note',x:cx+(Math.random()-.5)*32,y:cy-16,vx:(Math.random()-.5)*78,vy:-85,life:1.1,max:1.1,text:Math.random()<.5?'♪':'♫',color:'#fff6ff'});
 fx.push({kind:'aura',x:cx,y:cy,r:Math.max(p.w,p.h)*.45,life:.55,max:.55});
 beatVisual=1;
 let b=state.blocks.filter(b=>b.hp>0&&b.c>=u.c && b.r<u.r+ART.spans(u.tier).h && b.r+b.h>u.r).sort((a,b)=>a.c-b.c)[0];
 if(!b)b=state.blocks.filter(b=>b.hp>0&&!b.boss).sort((a,b)=>Math.abs((a.r+a.h/2)-(u.r+ART.spans(u.tier).h/2))-Math.abs((b.r+b.h/2)-(u.r+ART.spans(u.tier).h/2)))[0];
 if(!b)b=state.blocks.find(b=>b.hp>0);if(!b)return;
 const rect=rectOfBlock(b),dest={x:rect.x+rect.w*.35,y:rect.y+rect.h*.5};
 fx.push({kind:'beam',x:cx,y:cy,x2:dest.x,y2:dest.y,life:.23,max:.23});
 damageBlock(b,unitDamage(u.tier),dest);
}
function onScanColumn(c){
 for(const u of [...state.units])if(u.c===c)emitInstrument(u);
 const allBoxes=state.blocks.filter(b=>b.hp>0&&b.c===c);
 if(c===12&&allBoxes.length)state.chargeFill+=.18;
}
function spawn(){
 if(state.finished||showResult||paused)return;
 const cost=5;
 if(!Number.isFinite(state.charge))state.charge=0;
 if(state.charge<cost){popup(txt('noCharge'));return;}
 const pool=ART.spawnTiers||[0,2,3,5];
 // Preserve weighted randomness, but don't claim a full board merely
 // because the first random choice was a 1x2 guitar.
 const choices=[...pool].sort(()=>Math.random()-.5);
 let tier=null,pos=null;
 for(const candidate of choices){
  if(!Number.isInteger(candidate)||candidate<0||candidate>=ART.total)continue;
  const slot=findFree(candidate);
  if(slot){tier=candidate;pos=slot;break;}
 }
 if(!pos){popup(txt('noRoom'));return;}
 const freshUnit={...pos,tier,id:uid++};
 state.units.push(freshUnit);animateUnit(freshUnit.id);state.tutorialSeen=true;
 state.charge-=cost;state.coins=Math.max(0,(Number.isFinite(state.coins)?state.coins:0)-8);
 sound.note(tier);scatter(cellRect(pos.c,pos.r).x+45,cellRect(pos.c,pos.r).y+47,'#adfff1',12);save();
}
// Reserve the expanded merge footprint and move any displaced items to
// the nearest available cells. Animations follow each actual item, not
// an unrelated tracer; failed placements are fully rolled back.
function makeMergeRoom(tier,near){
 const size=ART.spans(tier),options=[];
 const intersects=(c,r,w,h,u)=>{
  const s=ART.spans(u.tier);
  return c<u.c+s.w&&c+w>u.c&&r<u.r+s.h&&r+h>u.r;
 };
 for(let r=0;r<=6-size.h;r++)for(let c=0;c<=13-size.w;c++){
  if(state.blocks.some(b=>b.hp>0&&c<b.c+b.w&&c+size.w>b.c&&r<b.r+b.h&&r+size.h>b.r))continue;
  const neighbors=state.units.filter(u=>intersects(c,r,size.w,size.h,u));
  if(neighbors.length>6)continue;
  const distance=(c-near.c)**2+(r-near.r)**2;
  options.push({c,r,neighbors,score:distance+neighbors.length*12});
 }
 options.sort((a,b)=>a.score-b.score||a.r-b.r||a.c-b.c);
 for(const option of options){
  const originals=option.neighbors.map(u=>({u,c:u.c,r:u.r}));
  for(const item of originals){item.u.c=-100;item.u.r=-100;}
  // Reserve destination while relocating all affected neighbors.
  const reservation={id:-1,tier,c:option.c,r:option.r};
  state.units.push(reservation);
  const sorted=[...originals].sort((a,b)=>{
   const sa=ART.spans(a.u.tier),sb=ART.spans(b.u.tier);
   return sb.w*sb.h-sa.w*sa.h;
  });
  let possible=true;
  for(const item of sorted){
   const slot=findFree(item.u.tier,item.u.id,{c:item.c,r:item.r});
   if(!slot){possible=false;break;}
   item.u.c=slot.c;item.u.r=slot.r;
  }
  state.units.pop();
  if(possible){
   for(const item of originals)animateUnit(item.u.id,'move',tileCenter(item.c,item.r,item.u.tier));
   return {c:option.c,r:option.r};
  }
  for(const item of originals){item.u.c=item.c;item.u.r=item.r;}
 }
 return null;
}
function merge(a,b){
 if(!a||!b||a.id===b.id||a.tier!==b.tier)return false;
 const t=ART.nextTier?.(a.tier);
 if(!Number.isInteger(t))return false;
 // Keep both original screen positions for a legible convergence animation.
 const aCenter=tileCenter(a.c,a.r,a.tier),bCenter=tileCenter(b.c,b.r,b.tier);
 state.tutorialSeen=true;
 state.units=state.units.filter(u=>u.id!==a.id&&u.id!==b.id);
 unitMotion.delete(a.id);unitMotion.delete(b.id);
 const candidates=[{c:b.c,r:b.r},{c:a.c,r:a.r}];
 let location=candidates.find(p=>canPlace(p.c,p.r,t));
 if(!location)location=findFree(t,undefined,{c:b.c,r:b.r});
 if(!location)location=makeMergeRoom(t,{c:b.c,r:b.r});
 if(!location){state.units.push(a,b);popup(txt('noRoom'));return false;}
 const u={...location,tier:t,id:uid++};
 state.units.push(u);
 animateUnit(u.id,'merge',bCenter);
 selected=u.id;
 const dest=tileCenter(u.c,u.r,u.tier);
 // Tiny incoming old-tier instrument flies to its partner, which then
 // becomes the new tier. Never animate an arbitrary full-screen tracer.
 fx.push({kind:'combine',tier:a.tier,x:aCenter.x,y:aCenter.y,
          x2:bCenter.x,y2:bCenter.y,life:.29,max:.29});
 fx.push({kind:'merge-ring',x:bCenter.x,y:bCenter.y,life:.44,max:.44});
 if(Math.hypot(dest.x-bCenter.x,dest.y-bCenter.y)>36){
  // Mark *where* a displaced upgrade is going to land, then keep it marked
  // briefly after arrival, so the player can always find it.
  fx.push({kind:'destination',x:dest.x,y:dest.y,
   w:ART.spans(t).w*LAY.step-12,h:ART.spans(t).h*LAY.step-12,
   life:unitMotion.get(u.id).duration+.8,max:unitMotion.get(u.id).duration+.8});
 }
 state.highest=Math.max(state.highest,t);
 state.charge=Math.min(999,state.charge+2);
 state.coins=clamp((Number.isFinite(state.coins)?state.coins:0)+10*(ART.approved[t]?.level||1),0,1e12);
 sound.merge(t);popup(txt('merged'));save();return true;
}
function moveUnit(a,c,r,from=null){
 if(!a||!canPlace(c,r,a.tier,a.id))return false;
 const previous=from||tileCenter(a.c,a.r,a.tier);
 a.c=c;a.r=r;selected=a.id;
 animateUnit(a.id,'move',previous);
 save();return true;
}
function burst(x,y,value,color){
 fx.push({kind:'damage',x,y,vx:(Math.random()-.5)*60,vy:-70,life:.8,max:.8,text:'-'+makeBlockText(value),color:'#fcfffe'});
 scatter(x,y,color,Math.min(10,Math.ceil(value/100)+3));
}
function scatter(x,y,color,n){n=Math.min(3,n);for(let i=0;i<n;i++)fx.push({kind:'particle',x,y,vx:(Math.random()-.5)*310,vy:(Math.random()-.5)*310,life:.45+Math.random()*.47,max:.9,size:2+Math.random()*4,color});}
function popup(t){toast={t,time:2.3};}
// Render at the device's actual pixel density, while all gameplay coordinates
// remain in the same logical 1650x928 / 900x1560 units. This prevents
// full-screen CSS upscaling from turning the approved art into a blurry mosaic.
let renderScale=1,staticScene=null;
// The game is pixel art: native logical resolution is both sharp and lightweight.
// No 40 FPS limiter. Render each browser animation frame (60/120/144 Hz).
function cacheStaticScene(){
 staticScene=null;
 if(typeof document.createElement!=='function')return;
 const off=document.createElement('canvas');off.width=LAY.W;off.height=LAY.H;
 const offctx=off.getContext('2d');if(!offctx)return;
 const original=ctx;
 try{ctx=offctx;drawBackground(0);drawCells();staticScene=off;}finally{ctx=original;}
}

function setView(){
 portrait=window.innerHeight>window.innerWidth*1.08;
 LAY=portrait?{W:900,H:1560,x:76,y:145,step:104,size:99,portrait:true}
             :{W:1650,H:928,x:160,y:105,step:103,size:97,portrait:false};
 // DOM rect is CSS pixels, not the backing-store size.
 const rect=canvas.getBoundingClientRect();
 const cssW=Math.max(1,rect.width||window.innerWidth),cssH=Math.max(1,rect.height||window.innerHeight);
 // A 64-pixel native sprite is pixelated by design. Draw the board once at
 // logical resolution instead of using a huge HiDPI backing store.
 // Browsers nearest-neighbor upscale the finished frame to the display.
 renderScale=1;
 canvas.width=Math.round(LAY.W*renderScale);
 canvas.height=Math.round(LAY.H*renderScale);
 ctx.setTransform(canvas.width/LAY.W,0,0,canvas.height/LAY.H,0,0);
 ctx.imageSmoothingEnabled=false;
 ctx.imageSmoothingQuality='low';
 layoutMobile();cacheStaticScene();
}
let mobilePos=[];
function layoutMobile(){
 mobilePos=[];const used=new Set(['4:0','5:0','4:1','5:1']);
 for(let i=0;i<configs.length;i++){const b=configs[i];if(b.boss){mobilePos[i]={x:4,y:0,w:2,h:2};continue;}
 let w=b.w>=2?2:1,h=(b.hp>12000||b.h>=3)?2:1;
 if(b.w===1&&b.h>=2)h=1;let found=null;
 for(let row=0;row<8&&!found;row++)for(let col=0;col<=6-w;col++){
 let ok=true;for(let yy=row;yy<row+h;yy++)for(let xx=col;xx<col+w;xx++)if(used.has(xx+':'+yy))ok=false;
 if(ok){found={x:col,y:row,w,h};break;}
 }
 if(!found)found={x:i%6,y:Math.floor(i/6)+3,w:1,h:1};
 for(let yy=found.y;yy<found.y+found.h;yy++)for(let xx=found.x;xx<found.x+found.w;xx++)used.add(xx+':'+yy);
 mobilePos[i]=found;
 }
}
function cellRect(c,r){const L=LAY;if(L.portrait){if(c<=6)return{x:L.x+c*L.step,y:L.y+r*L.step,w:L.size,h:L.size};return{x:L.x+(c-7)*L.step,y:885+r*L.step,w:L.size,h:L.size};}
 return{x:L.x+c*L.step,y:L.y+r*L.step,w:L.size,h:L.size};}
function rectOfUnit(u){const a=cellRect(u.c,u.r),s=ART.spans(u.tier);return{x:a.x,y:a.y,w:a.w+(s.w-1)*LAY.step,h:a.h+(s.h-1)*LAY.step};}
function rectOfBlock(b){
 if(LAY.portrait){const m=mobilePos[b.id];const size=100,step=104;return{x:76+m.x*step,y:789+m.y*step,w:size+(m.w-1)*step,h:size+(m.h-1)*step};}
 const p=cellRect(b.c,b.r);return{x:p.x,y:p.y,w:p.w+(b.w-1)*LAY.step,h:p.h+(b.h-1)*LAY.step};
}
function pointCell(x,y){if(LAY.portrait){const c=Math.floor((x-LAY.x)/LAY.step),r=Math.floor((y-LAY.y)/LAY.step);if(c>=0&&c<7&&r>=0&&r<6)return{c,r};return null;}
 let c=Math.floor((x-LAY.x)/LAY.step),r=Math.floor((y-LAY.y)/LAY.step);return c>=0&&c<13&&r>=0&&r<6?{c,r}:null;}
function unitAt(x,y){return [...state.units].reverse().find(u=>{let rect=rectOfUnit(u);return x>=rect.x&&x<rect.x+rect.w&&y>=rect.y&&y<rect.y+rect.h;});}
function blockAt(x,y){return state.blocks.find(b=>{if(b.hp<=0)return false;let p=rectOfBlock(b);return x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h;});}
function rounded(x,y,w,h,r){ctx.beginPath();ctx.rect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));ctx.closePath();}
function fillRound(x,y,w,h,r,fill){ctx.fillStyle=fill;rounded(x,y,w,h,r);ctx.fill();}
function strokeRound(x,y,w,h,r,color,width=2){ctx.lineWidth=width;ctx.strokeStyle=color;rounded(x,y,w,h,r);ctx.stroke();}
function gradient(x,y,w,h,stops){const g=ctx.createLinearGradient(x,y,x+w,y+h);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function textStroke(text,x,y,size,fill='#fff',align='center',stroke='#2c294c',line=3){
 ctx.textAlign=align;ctx.textBaseline='middle';ctx.font='900 '+size+'px monospace';ctx.lineJoin='round';ctx.lineWidth=line;ctx.strokeStyle=stroke;ctx.strokeText(text,x,y);ctx.fillStyle=fill;ctx.fillText(text,x,y);
}
const rnd=random(8908),sparkle=Array.from({length:110},()=>({x:rnd(),y:rnd(),r:4+rnd()*25,a:.035+rnd()*.08,angle:rnd()*3})),imgFilter=()=>{};
function readyImage(im){return !!(im&&im.complete&&im.naturalWidth>0);}
// High-contrast, quiet backdrop: detailed PixelLab art belongs to the instruments,
// not behind every cell. One rendered layer is cached by cacheStaticScene().
function drawBackground(t){
 const {W,H}=LAY;
 ctx.fillStyle='#716a83';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#575268';ctx.fillRect(0,0,W,83);
 ctx.fillStyle='#5c576d';ctx.fillRect(0,H-138,W,138);
 ctx.fillStyle='#a99ab6';ctx.fillRect(0,82,W,2);
 ctx.fillStyle='#a99ab6';ctx.fillRect(0,H-138,W,2);
}
// Simple matte slots: no repeated colorful ornament.
function drawCells(){
 const cols=LAY.portrait?7:13,rows=6;
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const p=cellRect(col,row);
  const x=Math.round(p.x),y=Math.round(p.y),w=Math.round(p.w),h=Math.round(p.h);
  ctx.fillStyle='#534c61';ctx.fillRect(x+1,y+2,w-2,h-2);
  ctx.fillStyle=((row+col)&1)?'#80768e':'#897e96';
  ctx.fillRect(x+4,y+4,w-8,h-10);
  ctx.fillStyle='#a99cb4';ctx.fillRect(x+5,y+4,w-10,3);
  ctx.fillStyle='#5a536a';ctx.fillRect(x+5,y+h-8,w-10,3);
 }
}
// Metal targets have their own visual hierarchy: big HP, little decoration.
function drawBlock(b){
 if(b.hp<=0)return;
 let {x,y,w,h}=rectOfBlock(b);
 x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
 const boss=!!b.boss;
 ctx.save();
 ctx.fillStyle='#111019';ctx.fillRect(x+4,y+7,w-5,h-6);
 ctx.fillStyle=boss?'#ba8a4b':'#818391';ctx.fillRect(x+2,y+2,w-5,h-7);
 ctx.fillStyle=boss?'#e5c47a':'#c0c4ce';ctx.fillRect(x+5,y+4,w-11,4);
 ctx.fillStyle=boss?'#342432':'#272632';ctx.fillRect(x+9,y+11,w-19,h-24);
 ctx.fillStyle=boss?'#4f3540':'#383541';ctx.fillRect(x+12,y+13,w-25,h-28);
 // Minimal rivets, not the distracting confetti texture.
 ctx.fillStyle=boss?'#ffe1a0':'#d9dce3';
 for(const [rx,ry] of [[x+5,y+7],[x+w-12,y+7],[x+5,y+h-15],[x+w-12,y+h-15]])
  ctx.fillRect(rx,ry,4,4);
 const value=makeBlockText(b.hp);
 const sz=clamp(Math.min((w-24)/Math.max(1,value.length*.65),h*.48,68),15,68);
 ctx.save();ctx.beginPath();ctx.rect(x+10,y+12,w-20,h-24);ctx.clip();
 textStroke(value,x+w*.5,y+h*.49,sz,'#f6f1e8','center','#17131d',Math.max(2,sz*.065));
 ctx.restore();
 if(b.hp<b.max){
   const progress=Math.max(0,Math.min(1,b.hp/b.max));
   ctx.fillStyle='#181520';ctx.fillRect(x+12,y+h-14,w-24,5);
   ctx.fillStyle=boss?'#e3b46b':'#68bdad';
   ctx.fillRect(x+12,y+h-14,Math.round((w-24)*progress),5);
 }
 // Damage affects HP only. Flashing entire tiles at scanner speed is disabled.
 ctx.restore();
}
// All movement is visual only: the logical grid updates instantly for collision
// correctness, while the sprite glides from its previous rendered position.
function spriteImage(tier,x,y,width,height,alpha=1,scale=1){
 const im=imgs[tier];
 if(!im?.complete||im.naturalWidth<=0)return;
 const aspect=im.naturalWidth/im.naturalHeight;
 const maxW=width*.94,maxH=height*.94;
 let w=Math.min(maxW,maxH*aspect),h=w/aspect;
 if(h>maxH){h=maxH;w=h*aspect;}
 ctx.save();ctx.globalAlpha=alpha;
 ctx.translate(x,y);ctx.scale(scale,scale);
 ctx.imageSmoothingEnabled=false;ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 ctx.drawImage(im,-Math.round(w*.5),-Math.round(h*.5),Math.round(w),Math.round(h));
 ctx.restore();
}
function drawUnit(u,draggingCenter=null){
 const p=rectOfUnit(u),dest=tileCenter(u.c,u.r,u.tier);
 const anim=draggingCenter?null:unitMotion.get(u.id);
 let center=draggingCenter||dest,scale=1;
 if(anim){
  const t=clamp(anim.age/anim.duration,0,1);
  if(anim.from&&anim.to){
   const k=easeInOutCubic(t);
   center={x:anim.from.x+(anim.to.x-anim.from.x)*k,
           y:anim.from.y+(anim.to.y-anim.from.y)*k};
  }
  if(anim.kind==='spawn')scale=.66+.34*easeOutBack(t);
  if(anim.kind==='merge')scale=.84+.16*easeOutBack(t);
  if(anim.kind==='move')scale=.97+.03*Math.sin(t*Math.PI);
 }
 // Selection follows moving item rather than highlighting its previous tile.
 if(selected===u.id&&!draggingCenter){
  ctx.save();ctx.globalAlpha=anim&&anim.kind==='merge'?.65:.9;
  ctx.strokeStyle='#f9deb0';ctx.lineWidth=3;
  const w=p.w-12,h=p.h-12;
  ctx.strokeRect(Math.round(center.x-w/2),Math.round(center.y-h/2),Math.round(w),Math.round(h));
  ctx.restore();
 }
 spriteImage(u.tier,Math.round(center.x),Math.round(center.y),p.w,p.h,1,scale);
}
// Scanner should indicate the active column without hiding instruments.
function drawScan(t){
 const x=Math.round(LAY.portrait?LAY.x+((scanner+LAY.step*7)%(LAY.step*7)):LAY.x+scanner);
 const top=LAY.portrait?145:98;
 const bottom=LAY.portrait?LAY.step*6+25:LAY.H-134;
 ctx.save();
 ctx.fillStyle='#5de4c32a';ctx.fillRect(x-5,top,10,bottom-top);
 ctx.fillStyle='#72efd5a8';ctx.fillRect(x-1,top,2,bottom-top);
 ctx.restore();
}
// Only understated, short-lived feedback remains. Disable giant neon rings.
// Small local highlights, not full-screen flashes. Short-lived animated
// motion is always tied to the object being upgraded or relocated.
function drawFx(dt){
 for(let i=fx.length-1;i>=0;i--){
  const p=fx[i];
  p.life-=dt;
  if(p.life<=0){fx.splice(i,1);continue;}
  const t=1-p.life/(p.max||1);
  ctx.save();
  if(p.kind==='combine'){
   const k=easeInOutCubic(t);
   spriteImage(p.tier,
    Math.round(p.x+(p.x2-p.x)*k),Math.round(p.y+(p.y2-p.y)*k),
    LAY.step*.76,LAY.step*.76,(1-t)*.8,.95-.22*t);
  }else if(p.kind==='merge-ring'){
   const radius=15+t*55;
   ctx.globalAlpha=(1-t)*.45;
   ctx.strokeStyle='#fff0bd';ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.stroke();
  }else if(p.kind==='arrival'||p.kind==='destination'){
   const pulse=.50+.5*Math.sin(t*Math.PI*3);
   ctx.globalAlpha=p.kind==='destination'?.32+.32*pulse:.18+.16*pulse;
   const w=p.w||LAY.size,h=p.h||LAY.size;
   const x=Math.round(p.x-w/2),y=Math.round(p.y-h/2);
   ctx.strokeStyle=p.kind==='destination'?'#fff0bd':'#c7f5dc';
   ctx.lineWidth=4;
   const length=15;
   for(const [cx,cy,dx,dy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){
    ctx.beginPath();ctx.moveTo(cx+dx*length,cy);ctx.lineTo(cx,cy);ctx.lineTo(cx,cy+dy*length);ctx.stroke();
   }
  }else if(p.kind==='particle'){
   // A handful of clean sparkles; no long tracer when dragging.
   p.x+=p.vx*dt;p.y+=p.vy*dt;
   ctx.fillStyle='#f4e5b7';ctx.globalAlpha=(1-t)*.7;
   ctx.fillRect(Math.round(p.x),Math.round(p.y),3,3);
  }
  ctx.restore();
 }
}
function drawChrome(){
 const W=LAY.W,H=LAY.H;
 const moneyX=LAY.portrait?W-48:W-148,moneyY=LAY.portrait?57:52;
 if(readyImage(gfx.coin))ctx.drawImage(gfx.coin,moneyX-205,moneyY-19,32,32);
 textStroke(Math.floor(Number.isFinite(state.coins)?state.coins:0).toLocaleString('en-US'),moneyX,moneyY,LAY.portrait?44:51,'#f1cc76','right','#1b1722',4);
 const safeTime=Number.isFinite(state.time)?Math.max(0,state.time):0;
 const min=Math.floor(safeTime/60),sec=Math.floor(safeTime%60);
 textStroke(min+':'+String(sec).padStart(2,'0'),W*.5,LAY.portrait?61:54,LAY.portrait?56:62,'#f4eee6','center','#17141e',4);
 settingsHot={x:15,y:14,w:58,h:58};shopHot={x:78,y:14,w:58,h:58};pauseHot={x:141,y:14,w:58,h:58};
 for(const [hit,name,glyph] of [[settingsHot,'settings_icon','⚙'],[shopHot,'shop_icon','✦'],[pauseHot,'pause_icon','Ⅱ']]){
  const im=gfx[name];
  ctx.fillStyle='#302938';ctx.fillRect(hit.x,hit.y,hit.w,hit.h);
  ctx.strokeStyle='#6a586c';ctx.lineWidth=2;ctx.strokeRect(hit.x+1,hit.y+1,hit.w-2,hit.h-2);
  if(readyImage(im))ctx.drawImage(im,hit.x+9,hit.y+9,hit.w-18,hit.h-18);
  else textStroke(glyph,hit.x+29,hit.y+29,24,'#f4e6d9');
 }
 const bx=W*.5-(LAY.portrait?210:160),by=LAY.portrait?1446:764,bw=LAY.portrait?420:325,bh=LAY.portrait?84:126;
 chargeHitBox={x:bx,y:by,w:bw,h:bh};
 ctx.fillStyle='#b89966';ctx.fillRect(bx,by,bw,bh);
 ctx.fillStyle='#24332e';ctx.fillRect(bx+6,by+6,bw-12,bh-12);
 ctx.fillStyle='#31554a';ctx.fillRect(bx+10,by+10,bw-20,bh-20);
 const safeCharge=Number.isFinite(state.charge)?Math.max(0,state.charge):0;
 const safeFill=Number.isFinite(state.chargeFill)?clamp(state.chargeFill,0,1):0;
 const progress=clamp(.12+safeFill*.36+Math.min(.52,safeCharge/120),0,1);
 ctx.fillStyle='#141e1a';ctx.fillRect(bx+18,by+bh-20,bw-36,8);
 ctx.fillStyle='#81e0ba';ctx.fillRect(bx+18,by+bh-20,Math.floor((bw-36)*progress),8);
 textStroke(String(Math.floor(safeCharge)),bx+bw/2,by+bh*.45,LAY.portrait?49:66,'#fff5db','center','#1a352b',4);
 if(toast)textStroke(toast.t,W*.5,LAY.portrait?1398:730,LAY.portrait?25:30,'#f9dcb4','center','#1b1722',3);
}
function drawResult(){
 if(!showResult)return;
 const W=LAY.W,H=LAY.H;
 ctx.save();ctx.fillStyle='#13111ac0';ctx.fillRect(0,0,W,H);
 const x=Math.round(W*.19),y=Math.round(H*.27),w=Math.round(W*.62),h=Math.round(H*.45);
 ctx.fillStyle='#b79968';ctx.fillRect(x,y,w,h);
 ctx.fillStyle='#32293b';ctx.fillRect(x+8,y+8,w-16,h-16);
 textStroke(showResult,W*.5,H*.42,clamp(W*.049,38,72),'#fff3d0','center','#241928',5);
 textStroke(txt(showResult===txt('time')?'retry':'next')+'  ▶',W*.5,H*.56,43,'#9be9ce','center','#263b34',4);
 textStroke(txt('restart'),W*.5,H*.65,20,'#f4d5f7','center','#3d3154',3);
 ctx.restore();
}
function render(dt){
 // Reset transient rendering state and redraw the *entire* opaque frame.
 // A previous pointer frame can never remain as a trailing duplicate.
 ctx.save();
 ctx.setTransform(canvas.width/LAY.W,0,0,canvas.height/LAY.H,0,0);
 ctx.globalCompositeOperation='source-over';
 ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 ctx.clearRect(0,0,LAY.W,LAY.H);
 if(staticScene){
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(staticScene,0,0,LAY.W,LAY.H);
 }else{drawBackground(performance.now());drawCells();}
 for(const b of state.blocks)drawBlock(b);
 drawScan(performance.now());
 for(const u of state.units)if(!dragging||dragging.id!==u.id)drawUnit(u);
 if(dragging){
  const u=state.units.find(unit=>unit.id===dragging.id);
  if(u)drawUnit(u,{x:dragging.dx-dragging.offsetX,y:dragging.dy-dragging.offsetY});
 }
 drawFx(dt);drawChrome();drawResult();
 ctx.restore();
}
function mainStep(dt){
 // A single invalid calculation must never poison coins, HP or the HUD.
 if(!Number.isFinite(state.coins))state.coins=0;
 if(!Number.isFinite(state.time))state.time=192;
 if(!Number.isFinite(state.charge))state.charge=0;
 if(!Number.isFinite(state.chargeFill))state.chargeFill=0;
 animClock+=dt;
 beatVisual=Math.max(0,beatVisual-dt*2.2);
 screenShake=Math.max(0,screenShake-dt*12);
 for(const [id,a] of unitMotion){a.age+=dt;if(a.age>=a.duration)unitMotion.delete(id);}
 for(const [id,a] of blockMotion){a.time-=dt;if(a.time<=0)blockMotion.delete(id);}
 sound.rhythm(dt);
 if(!paused&&!showResult&&!state.finished){
 state.time=Math.max(0,state.time-dt);
 const max=LAY.step*13+80;
 const speed=(LAY.step*13/5.5)*(1+state.upgrades.speed*.13);
 const old=scanner;scanner+=speed*dt;
 const first=Math.floor(old/LAY.step),last=Math.floor(scanner/LAY.step);
 for(let c=first+1;c<=last;c++)if(c>=0&&c<13)onScanColumn(c);
 if(scanner>max){scanner=-55;pass++;state.chargeFill+=.48;state.charge+=1;if(state.chargeFill>=1){state.charge+=Math.floor(state.chargeFill);state.chargeFill%=1;}save();}
 if(state.time<=0&&!state.finished){showResult=txt('time');gameEvent('gameplayStop');save();}
 }
 if(toast){toast.time-=dt;if(toast.time<=0)toast=null;}
}
function loop(now){
 // No artificial FPS cap: one game update and one full redraw per rAF.
 // Browsers pace requestAnimationFrame at the actual display refresh rate.
 const dt=clamp((now-frameLast)/1000,0,.085);
 frameLast=now;
 if(booted)mainStep(dt);
 render(dt);
 requestAnimationFrame(loop);
}
function worldPoint(e){const box=canvas.getBoundingClientRect();return{x:(e.clientX-box.left)/Math.max(1,box.width)*LAY.W,y:(e.clientY-box.top)/Math.max(1,box.height)*LAY.H};}
const inside=(p,r)=>r&&p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
function pointerDown(e){
 sound.unlock();if(showResult||paused)return;const p=worldPoint(e);let unit=unitAt(p.x,p.y);
 if(unit){const box=rectOfUnit(unit);dragging={id:unit.id,sx:p.x,sy:p.y,dx:p.x,dy:p.y,offsetX:p.x-(box.x+box.w/2),offsetY:p.y-(box.y+box.h/2),moved:false};canvas.setPointerCapture?.(e.pointerId);}
}
function pointerMove(e){const p=worldPoint(e);hoveredChrome=!LAY.portrait&&p.x<215&&p.y<81;if(dragging){dragging.dx=p.x;dragging.dy=p.y;if(Math.hypot(p.x-dragging.sx,p.y-dragging.sy)>15)dragging.moved=true;}}
function pointerUp(e){
 const p=worldPoint(e);
 if(dragging){let drag=dragging;dragging=null;let a=state.units.find(u=>u.id===drag.id);if(!a)return;
 if(drag.moved){let target=unitAt(p.x,p.y);if(target&&target.id!==a.id&&target.tier===a.tier&&ART.nextTier?.(a.tier)!=null){merge(a,target);return;}
 const tile=pointCell(p.x,p.y);
 if(tile&&moveUnit(a,tile.c,tile.r,{x:drag.dx-drag.offsetX,y:drag.dy-drag.offsetY}))return;
 popup(txt('noRoom'));return;
 }else{let b=selected?state.units.find(u=>u.id===selected):null;if(b&&b.id!==a.id&&a.tier===b.tier&&ART.nextTier?.(a.tier)!=null){merge(b,a);return;}selected=a.id;sound.note(a.tier);scatter(p.x,p.y,'#b3ffff',5);return;}}
 if(showResult){if(state.finished){state.stage++;initWorld(false);}else{state.time=192;showResult='';}
 gameEvent('gameplayStart');save();return;}
 if(inside(p,chargeHitBox)){spawn();return;}
 if(inside(p,settingsHot)){openPanel('settings');return;}
 if(inside(p,shopHot)){openPanel('shop');return;}
 if(inside(p,pauseHot)){paused=!paused;gameEvent(paused?'gameplayStop':'gameplayStart');return;}
 const b=blockAt(p.x,p.y);if(b){popup(makeBlockText(b.hp));return;}
 const tile=pointCell(p.x,p.y);if(tile){const u=occupiedUnit(tile.c,tile.r);if(u){if(selected){const a=state.units.find(v=>v.id===selected);if(a&&a.id!==u.id&&a.tier===u.tier&&ART.nextTier?.(u.tier)!=null){merge(a,u);return;}}selected=u.id;sound.note(u.tier);}else if(state.charge>=5){spawn();}}
}
function openPanel(name){
 paused=true;gameEvent('gameplayStop');$('panel').classList.remove('hidden');$('panelTitle').textContent=txt(name==='shop'?'shop':'title');$('settingsContent').classList.toggle('hidden',name!=='settings');$('shopContent').classList.toggle('hidden',name!=='shop');fillPanel();
}
function closePanel(){paused=false;$('panel').classList.add('hidden');frameLast=performance.now();if(!showResult)gameEvent('gameplayStart');}
const upgradeCost=type=>Math.ceil(({power:125,speed:170,wealth:140})[type]*Math.pow(1.85,state.upgrades[type]));
function fillPanel(){
 $('volText').textContent=txt('volume');$('musicText').textContent=txt('music');$('langText').textContent=txt('language');$('shopSubtitle').textContent=txt('shopText');
 $('volume').value=Math.round(state.volume*100);$('music').value=Math.round(state.music*100);$('language').value=state.lang;
 $('upgradeOptions').innerHTML=['power','speed','wealth'].map(type=>{const lv=state.upgrades[type],cost=upgradeCost(type),max=type==='speed'?8:12;return '<button class="upgrade" data-upgrade="'+type+'" '+(lv>=max||state.coins<cost?'disabled':'')+'><span><b class="name">'+txt(type)+' · '+lv+'/'+max+'</b><small class="desc">'+txt(type+'Desc')+'</small></span><b class="cost">'+(lv>=max?txt('max'):'$'+cost)+'</b></button>';}).join('');
}
function bind(){
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',()=>dragging=null);
 window.addEventListener('resize',setView);
 $('closePanel').addEventListener('click',closePanel);
 $('volume').addEventListener('input',e=>{state.volume=+e.target.value/100;sound.unlock();sound.levels();save();});
 $('music').addEventListener('input',e=>{state.music=+e.target.value/100;sound.unlock();sound.levels();save();});
 $('language').addEventListener('change',e=>{state.lang=e.target.value;fillPanel();save();});
 $('upgradeOptions').addEventListener('click',e=>{const k=e.target.closest('[data-upgrade]')?.dataset.upgrade;if(!k)return;const cost=upgradeCost(k);if(state.coins<cost)return;state.coins-=cost;state.upgrades[k]++;fillPanel();save();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)gameEvent('gameplayStop');else if(!paused&&!showResult){frameLast=performance.now();gameEvent('gameplayStart');}});
 window.addEventListener('pagehide',()=>save(true));
 window.addEventListener('keydown',e=>{if(e.code==='Enter'&&showResult){if(state.finished)state.stage++;initWorld(false);gameEvent('gameplayStart');save();}
 if(e.code==='Space'&&!e.repeat){e.preventDefault();spawn();}
 if(e.code==='KeyS')openPanel('settings');
 if(e.code==='KeyU')openPanel('shop');
 if(e.code==='KeyP'){paused=!paused;gameEvent(paused?'gameplayStop':'gameplayStart');}
 if(e.code==='Escape')closePanel();
 });
}
let instrumentAtlas=null;
let gfx={};
function setupImages(){
 imgs=Array.from({length:ART.total},(_,tier)=>{
  const im=new Image();
  im.src=ART.src(tier)+'?rev='+ASSET_BUILD;
  return im;
 });
 gfx={};
 for(const [name,path] of Object.entries(ART.uiAssets||{})){
  const im=new Image();
  gfx[name]=im;
  if(name==='background_tile'||name==='cell'){
   im.onload=()=>{if(LAY)cacheStaticScene();};
  }
  im.src=path+'?rev='+ASSET_BUILD;
 }
}
class AudioEngine{
 constructor(){
  this.ctx=null;this.main=null;this.bg=null;this.fx=null;this.reverb=null;this.muted=false;
  this.step=0;this.nextBeat=0;this.noteCount=0;this.lastHit=0;this.noiseBuffer=null;
 }
 unlock(){
  try{
   if(!this.ctx){
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    const a=this.ctx=new AC(),limiter=a.createDynamicsCompressor();
    limiter.threshold.value=-15;limiter.knee.value=13;limiter.ratio.value=3.5;
    limiter.attack.value=.003;limiter.release.value=.24;
    this.main=a.createGain();this.main.gain.value=.7;
    this.main.connect(limiter);limiter.connect(a.destination);
    this.bg=a.createGain();this.fx=a.createGain();
    this.bg.connect(this.main);this.fx.connect(this.main);
    // Compact room reverb gives strings/harps depth without masking the beat.
    const length=Math.round(a.sampleRate*.67),imp=a.createBuffer(2,length,a.sampleRate);
    for(let channel=0;channel<2;channel++){
     const data=imp.getChannelData(channel);
     for(let k=0;k<length;k++)data[k]=(Math.random()*2-1)*Math.pow(1-k/length,2.9);
    }
    this.reverb=a.createConvolver();this.reverb.buffer=imp;
    const wet=a.createGain();wet.gain.value=.15;
    this.fx.connect(this.reverb);this.reverb.connect(wet);wet.connect(this.main);
    this.noiseBuffer=a.createBuffer(1,Math.round(a.sampleRate*.24),a.sampleRate);
    const data=this.noiseBuffer.getChannelData(0);
    for(let k=0;k<data.length;k++)data[k]=Math.random()*2-1;
    this.nextBeat=a.currentTime+.02;
    this.levels();
   }
   if(this.ctx.state==='suspended'){const resume=this.ctx.resume();resume?.catch?.(()=>{});}
  }catch(e){console.info('Music audio unavailable');}
 }
 levels(){
  if(!this.ctx)return;
  const now=this.ctx.currentTime;
  this.main.gain.setTargetAtTime(this.muted?0:Math.min(1,state.volume),now,.055);
  this.bg.gain.setTargetAtTime(state.music*.29,now,.07);
  this.fx.gain.setTargetAtTime(.39,now,.07);
 }
 setPortalMuted(v){this.muted=!!v;this.levels();}
 noteFreq(midi){return 440*Math.pow(2,(midi-69)/12);}
 osc(freq,start,len,vol,type='sine',target='fx',filter=4500,attack=.008,detune=0){
  if(!this.ctx)return;
  const a=this.ctx,o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();
  o.type=type;o.frequency.setValueAtTime(freq,start);o.detune.value=detune;
  f.type='lowpass';f.frequency.value=filter;f.Q.value=.5;
  g.gain.setValueAtTime(.00008,start);
  g.gain.exponentialRampToValueAtTime(Math.max(vol,.0001),start+Math.min(attack,len*.4));
  g.gain.exponentialRampToValueAtTime(.00008,start+len);
  o.connect(f);f.connect(g);g.connect(target==='bg'?this.bg:this.fx);o.start(start);o.stop(start+len+.03);
 }
 noise(start,len,vol,cut=3000,target='bg'){
  if(!this.ctx||!this.noiseBuffer)return;
  const a=this.ctx,s=a.createBufferSource(),filter=a.createBiquadFilter(),g=a.createGain();
  s.buffer=this.noiseBuffer;filter.type='highpass';filter.frequency.value=cut;
  g.gain.setValueAtTime(Math.max(vol,.0001),start);g.gain.exponentialRampToValueAtTime(.00008,start+len);
  s.connect(filter);filter.connect(g);g.connect(target==='bg'?this.bg:this.fx);
  s.start(start);s.stop(start+Math.min(len,.22));
 }
 instrumentPatch(tier,midi,start,vol=.18){
  if(!this.ctx)return;
  const f=this.noteFreq(midi),patch=tier%16;
  if([0,1,3,7,11,14].includes(patch)){
   // Bright mini-keyboard and full-sized polyphonic synth.
   this.osc(f,start,.33,vol*.65,'triangle','fx',5700);
   this.osc(f*2,start,.22,vol*.28,'sine','fx',5500);
   if(patch>=7)this.osc(f*.998,start,.52,vol*.24,'sawtooth','fx',3100,.03,-4);
  }else if([2,4,5,6,8,10].includes(patch)){
   // Steel / nylon guitar, ukulele: plucked fundamental + short string overtones.
   this.osc(f,start,.55,vol*.80,'triangle','fx',3700,.003);
   this.osc(f*2,start,.24,vol*.22,'sine','fx',6100,.003);
   this.osc(f*3,start,.14,vol*.1,'sine','fx',6700,.002);
   this.noise(start,.024,vol*.08,4700,'fx');
  }else if([9,12,15].includes(patch)){
   // Harp: glass-like transient followed by slowly decaying soft body.
   this.osc(f,start,.96,vol*.62,'sine','fx',6200,.002);
   this.osc(f*2.01,start,.47,vol*.32,'triangle','fx',5300,.002);
   this.osc(f*3.0,start,.2,vol*.12,'sine','fx',6300,.002);
  }else if(patch===13){
   this.osc(f,start,.17,vol*.5,'triangle','fx',1750);
   this.noise(start,.11,vol*.15,1400,'fx');
  }else{
   this.osc(f,start,.85,vol*.42,'sine','fx',2600,.12);
   this.osc(f*2,start,.68,vol*.2,'triangle','fx',2200,.1);
  }
 }
 note(tier){
  this.unlock();if(!this.ctx)return;
  const a=this.ctx,t=a.currentTime+.006;
  const roots=[60,57,65,62],root=roots[Math.floor(this.step/16)%4],scale=[0,2,4,7,9,12,14,16,19];
  const midi=root+scale[(tier*2+this.noteCount)%scale.length]+(tier>=9?12:0);
  this.noteCount++;
  this.instrumentPatch(ART.approved[tier]?.family==='drums'?13:tier,midi,t,.22+Math.min(.06,tier*.005));
 }
 merge(tier){
  this.unlock();if(!this.ctx)return;
  const t=this.ctx.currentTime+.006,root=60+(state.stage%3)*2;
  [0,4,7,12,19].forEach((interval,i)=>this.instrumentPatch(ART.approved[tier]?.family==='drums'?13:Math.min(15,tier+4),root+interval,t+i*.075,.2));
 }
 hit(damage,boss){
  if(!this.ctx||state.volume<=0)return;
  const now=this.ctx.currentTime;if(now-this.lastHit<.035)return;
  this.lastHit=now;
  const f=80+Math.min(140,Math.log2(damage+1)*13);
  this.osc(f,now,.07,boss?.10:.053,'sine','fx',950,.003);
 }
 breakBox(boss){
  if(!this.ctx)return;
  const t=this.ctx.currentTime;
  this.osc(boss?155:350,t,.25,boss?.24:.12,'triangle','fx',1400,.004);
  this.osc(boss?233:523,t+.08,.32,boss?.21:.1,'sine','fx',3200);
  if(boss)this.merge(12);
 }
 kick(t){
  if(!this.ctx)return;
  const a=this.ctx,o=a.createOscillator(),g=a.createGain();o.type='sine';
  o.frequency.setValueAtTime(144,t);o.frequency.exponentialRampToValueAtTime(44,t+.15);
  g.gain.setValueAtTime(.29,t);g.gain.exponentialRampToValueAtTime(.0001,t+.19);
  o.connect(g);g.connect(this.bg);o.start(t);o.stop(t+.2);
 }
 snare(t){this.noise(t,.14,.17,1300,'bg');this.osc(188,t,.09,.09,'triangle','bg',850);}
 rhythm(dt){
  if(!this.ctx||this.ctx.state!=='running'||this.muted||state.music<=0)return;
  const a=this.ctx,now=a.currentTime;
  if(this.nextBeat<now-.22)this.nextBeat=now+.008;
  let scheduled=0;
  const chords=[[48,55,60,64],[45,52,57,60],[53,60,65,69],[43,50,55,59]];
  while(this.nextBeat<now+.13&&scheduled++<4){
   const t=this.nextBeat,step=this.step++,bar=Math.floor(step/16)%4;
   const chord=chords[bar],half=60/112/2;
   if(step%4===0)this.kick(t);
   if(step%8===4)this.snare(t);
   if(step%2===0)this.noise(t,.047,.055,6500,'bg');
   if(step%8===0){
    for(let i=0;i<chord.length;i++)
      this.osc(this.noteFreq(chord[i]),t,1.32,.058,'sine','bg',1500,.16);
   }
   if(step%2===0){
    let bass=chord[0]+(step%8===6?7:0);
    this.osc(this.noteFreq(bass-12),t,.29,.11,'triangle','bg',900,.006);
   }
   const melody=[0,null,2,4,3,null,1,2,4,3,2,null,1,2,0,null];
   if(melody[step%16]!==null){
    const pitch=chord[0]+12+[0,2,4,7,9][melody[step%16]]+(step%32>=16?0:0);
    this.osc(this.noteFreq(pitch),t,.19,.067,'sine','bg',3600,.012);
    this.osc(this.noteFreq(pitch)*2,t,.1,.015,'triangle','bg',4200,.01);
   }
   this.nextBeat+=half;
  }
 }
 win(){this.unlock();if(!this.ctx)return;const t=this.ctx.currentTime+.025;
  [60,64,67,72,76,79,84].forEach((m,i)=>this.instrumentPatch(12,m,t+i*.105,.21));
 }
}
const sound=new AudioEngine();
window.GridGameDebug={getState:()=>clone(state),getDamage:(tier)=>unitDamage(tier),getAnimations:()=>Array.from(unitMotion,([id,a])=>({id,kind:a.kind,age:a.age,duration:a.duration,from:a.from,to:a.to})),
getGeometry:()=>({width:LAY.W,height:LAY.H,renderWidth:canvas.width,renderHeight:canvas.height,renderScale,portrait,blocks:state.blocks.map(b=>({id:b.id,rect:rectOfBlock(b)})),units:state.units.map(u=>({id:u.id,rect:rectOfUnit(u)}))}),scan:()=>{let n=state.blocks.filter(b=>b.hp>0).length;for(const u of state.units)emitInstrument(u);return{before:n,after:state.blocks.filter(b=>b.hp>0).length,coins:state.coins};},spawn,merge:(a,b)=>merge(state.units[a],state.units[b]),restart:()=>initWorld(false),setCharge:n=>state.charge=n};
sdkInit();
})();