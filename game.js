/* Melody Scanner — original canvas recreation of the observed grid-based gameplay. */
(()=>{'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id),ART=window.GridMusicArt;
const KEY='melody-scanner-actual-gameplay-v1';
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
const starting=[
{tier:0,c:0,r:2},{tier:0,c:0,r:3},{tier:0,c:2,r:2},{tier:1,c:1,r:3},{tier:1,c:2,r:3},
{tier:2,c:3,r:3},{tier:2,c:4,r:4},{tier:3,c:4,r:2},{tier:4,c:5,r:4}
];
const startState=()=>({stage:1,coins:241,time:192,charge:16,chargeFill:.62,highest:4,upgrades:{power:0,speed:0,wealth:0},units:[],blocks:[],volume:.7,music:.46,lang:/^ru/i.test(navigator.language)?'ru':/^es/i.test(navigator.language)?'es':'en',tutorialSeen:false,finished:false});
let state=startState(),selected=null,dragging=null,hovered=null,paused=false,showResult='',scanner=-50,pass=0,frameLast=performance.now(),fx=[],hints=0,toast=null,checkpoint=0,portrait=false,LAY=null,imgs=[],booted=false,sdkReady=false,store=null,chargeHitBox=null,settingsHot=null,shopHot=null,pauseHot=null;
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
const easeOutBack=t=>{const p=1.70158;return 1+(p+1)*Math.pow(t-1,3)+p*Math.pow(t-1,2)};
function animateUnit(id,kind='spawn'){unitMotion.set(id,{kind,age:0,duration:kind==='merge'?.65:.48});}
function animateHit(id,strength=1){blockMotion.set(id,{time:.36,force:Math.min(5,1+strength/600)});screenShake=Math.min(4,screenShake+.13);}

function read(){
 try{const raw=(store||localStorage).getItem(KEY);if(!raw)return;const obj=JSON.parse(raw);if(!obj||!Number.isInteger(obj.stage)||obj.stage<1||obj.stage>500)return;
 const base=startState();state={...base,...obj,upgrades:{...base.upgrades,...obj.upgrades}};state.coins=clamp(Number(state.coins)||0,0,1e12);state.charge=clamp(Number(state.charge)||0,0,500);state.time=clamp(Number(state.time)||192,0,192);state.volume=clamp(Number(state.volume)||0,0,1);state.music=clamp(Number(state.music)||0,0,1);
 if(!I[state.lang])state.lang='en';if(!Array.isArray(state.units)||!Array.isArray(state.blocks)||!state.blocks.length){state.blocks=[];state.units=[];}
 state.units=state.units.filter(u=>Number.isInteger(u.tier)&&u.tier>=0&&u.tier<16);state.units.forEach(u=>u.id=uid++);
 state.blocks=state.blocks.filter(b=>b&&Number.isFinite(b.hp));
 }catch(e){console.warn('Save unavailable',e);}
}
let saveTimer=0;
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{(store||localStorage).setItem(KEY,JSON.stringify(state));}catch(e){}},100);}
const gameEvent=method=>{try{if(sdkReady)window.CrazyGames?.SDK?.game?.[method]?.();}catch(e){}};
function gameMode(on){if(paused===!on)return;paused=!on;gameEvent(on?'gameplayStart':'gameplayStop');}
async function sdkInit(){
 try{const sdk=window.CrazyGames?.SDK;if(sdk){await Promise.race([sdk.init(),new Promise((_,rej)=>setTimeout(()=>rej(Error('timeout')),2300))]);sdkReady=true;try{sdk.game.loadingStart()}catch(e){}
 store=sdk.data?.getItem&&sdk.data?.setItem?sdk.data:localStorage;
 try{const f=s=>sound.setPortalMuted(!!s?.muteAudio);f(sdk.game?.settings);sdk.game?.addSettingsChangeListener?.(f);}catch(e){}
 }}catch(e){console.info('Standalone preview');}
 if(!store)store=localStorage;read();if(!state.blocks.length)initWorld(true);else{state.blocks=state.blocks.map((b,i)=>({...configs[i],...b}));if(state.blocks.length!==configs.length)initWorld(true);}
 setupImages();setView();bind();fillPanel();booted=true;gameEvent('loadingStop');gameEvent('gameplayStart');requestAnimationFrame(loop);
}
function canPlace(c,r,tier,ignore){
 const {w,h}=ART.spans(tier);if(c<0||r<0||c+w>13||r+h>6)return false;
 for(let y=r;y<r+h;y++)for(let x=c;x<c+w;x++){
 if(state.blocks.some(b=>b.hp>0&&x>=b.c&&x<b.c+b.w&&y>=b.r&&y<b.r+b.h))return false;
 if(state.units.some(u=>u.id!==ignore&&x>=u.c&&x<u.c+ART.spans(u.tier).w&&y>=u.r&&y<u.r+ART.spans(u.tier).h))return false;
 }return true;
}
function findFree(tier,ignore){
 const rs=[];for(let r=0;r<6;r++)for(let c=0;c<13;c++)if(canPlace(c,r,tier,ignore))rs.push({c,r});
 if(!rs.length)return null;rs.sort((a,b)=>(a.c>6?40:0)+a.c*.2+a.r*.03-((b.c>6?40:0)+b.c*.2+b.r*.03));return rs[Math.floor(Math.random()*Math.min(7,rs.length))];
}
function occupiedUnit(c,r){return [...state.units].reverse().find(u=>c>=u.c&&c<u.c+ART.spans(u.tier).w&&r>=u.r&&r<u.r+ART.spans(u.tier).h);}
function matchAt(x,y){return state.blocks.find(b=>b.hp>0&&x>=b.c&&x<b.c+b.w&&y>=b.r&&y<b.r+b.h);}
function makeBlockText(v){
 if(v>=99500)return Math.round(v/1000)+'K';if(v>=1000)return (v>=10000?Math.round(v/1000):Number((v/1000).toFixed(v%1000===0?0:1)))+'K';return String(Math.max(0,Math.ceil(v)));
}
function unitDamage(tier){const base=[8,14,22,42,75,116,195,350,610,1040,1680,2640,4180,6550,10100,16000];return Math.ceil(base[tier]*(1+state.upgrades.power*.27));}
function damageBlock(b,value,p){
 if(!b||b.hp<=0)return;
 const d=Math.max(1,Math.round(value)),before=b.hp;
 b.hp=Math.max(0,b.hp-d);
 const earned=Math.max(1,Math.round(d*(.018+state.upgrades.wealth*.011)));
 state.coins+=earned;state.chargeFill+=Math.min(.36,d/10000);
 if(state.chargeFill>=1){const a=Math.floor(state.chargeFill);state.charge+=a;state.chargeFill-=a;}
 const point=p||{x:rectOfBlock(b).x+40,y:rectOfBlock(b).y+50};
 animateHit(b.id,d);burst(point.x,point.y,d,b.boss?'#fff9c0':'#74ecff');
 if(d>15&&Math.random()<.7)fx.push({kind:'coin',x:point.x+5,y:point.y-14,vx:20,vy:-110,life:1,max:1,text:'+$'+earned,color:'#fff071'});
 if(Math.random()<.25) sound.hit(d,b.boss);
 if(b.hp===0){
   const pos=rectOfBlock(b),x=pos.x+pos.w*.5,y=pos.y+pos.h*.5;
   scatter(x,y,b.boss?'#ffe789':'#d6fbff',28);
   fx.push({kind:'break',x,y,w:pos.w,h:pos.h,life:.62,max:.62,color:b.boss?'#ffd66c':'#dfdeed'});
   state.coins+=b.boss?1500:Math.max(14,Math.floor(b.max/25));
   state.charge+=b.boss?20:Math.max(1,Math.floor(b.max/1400));
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
 const cost=5;if(state.charge<cost){popup(txt('noCharge'));return;}
 const tier=Math.random()<.11?1:0;
 const pos=findFree(tier);if(!pos){popup(txt('noRoom'));return;}
 const freshUnit={...pos,tier,id:uid++};state.units.push(freshUnit);animateUnit(freshUnit.id);state.tutorialSeen=true;state.charge-=cost;state.coins=Math.max(0,state.coins-8);sound.note(tier);scatter(cellRect(pos.c,pos.r).x+45,cellRect(pos.c,pos.r).y+47,'#adfff1',12);save();
}
function merge(a,b){if(!a||!b||a.id===b.id||a.tier!==b.tier||a.tier>=15)return false;
 state.tutorialSeen=true;const t=a.tier+1;
 state.units=state.units.filter(u=>u.id!==a.id&&u.id!==b.id);
 const candidates=[{c:b.c,r:b.r},{c:a.c,r:a.r}];let location=candidates.find(p=>canPlace(p.c,p.r,t));
 if(!location)location=findFree(t);
 if(!location){state.units.push(a,b);popup(txt('noRoom'));return false;}
 const u={...location,tier:t,id:uid++};state.units.push(u);animateUnit(u.id,'merge');selected=u.id;state.highest=Math.max(state.highest,t);state.charge=Math.min(999,state.charge+2);state.coins+=10*t;
 const p=rectOfUnit(u);scatter(p.x+p.w*.5,p.y+p.h*.5,'#fff0a4',22);fx.push({kind:'merge',x:p.x+p.w*.5,y:p.y+p.h*.5,life:.8,max:.8});sound.merge(t);popup(txt('merged'));save();return true;
}
function moveUnit(a,c,r){if(!a||!canPlace(c,r,a.tier,a.id))return false;a.c=c;a.r=r;selected=a.id;save();return true;}
function burst(x,y,value,color){
 fx.push({kind:'damage',x,y,vx:(Math.random()-.5)*60,vy:-70,life:.8,max:.8,text:'-'+makeBlockText(value),color:'#fcfffe'});
 scatter(x,y,color,Math.min(10,Math.ceil(value/100)+3));
}
function scatter(x,y,color,n){for(let i=0;i<n;i++)fx.push({kind:'particle',x,y,vx:(Math.random()-.5)*310,vy:(Math.random()-.5)*310,life:.45+Math.random()*.47,max:.9,size:2+Math.random()*4,color});}
function popup(t){toast={t,time:2.3};}
function setView(){portrait=window.innerHeight>window.innerWidth*1.08;if(portrait){canvas.width=900;canvas.height=1560;LAY={W:900,H:1560,x:76,y:175,step:104,size:99,portrait:true}}else{canvas.width=1650;canvas.height=928;LAY={W:1650,H:928,x:160,y:105,step:103,size:97,portrait:false}}layoutMobile();}
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
 if(LAY.portrait){const m=mobilePos[b.id];const size=100,step=104;return{x:76+m.x*step,y:895+m.y*step,w:size+(m.w-1)*step,h:size+(m.h-1)*step};}
 const p=cellRect(b.c,b.r);return{x:p.x,y:p.y,w:p.w+(b.w-1)*LAY.step,h:p.h+(b.h-1)*LAY.step};
}
function pointCell(x,y){if(LAY.portrait){const c=Math.floor((x-LAY.x)/LAY.step),r=Math.floor((y-LAY.y)/LAY.step);if(c>=0&&c<7&&r>=0&&r<6)return{c,r};return null;}
 let c=Math.floor((x-LAY.x)/LAY.step),r=Math.floor((y-LAY.y)/LAY.step);return c>=0&&c<13&&r>=0&&r<6?{c,r}:null;}
function unitAt(x,y){return [...state.units].reverse().find(u=>{let rect=rectOfUnit(u);return x>=rect.x&&x<rect.x+rect.w&&y>=rect.y&&y<rect.y+rect.h;});}
function blockAt(x,y){return state.blocks.find(b=>{if(b.hp<=0)return false;let p=rectOfBlock(b);return x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h;});}
function rounded(x,y,w,h,r){const rr=Math.min(r,w*.5,h*.5);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();}
function fillRound(x,y,w,h,r,fill){ctx.fillStyle=fill;rounded(x,y,w,h,r);ctx.fill();}
function strokeRound(x,y,w,h,r,color,width=2){ctx.lineWidth=width;ctx.strokeStyle=color;rounded(x,y,w,h,r);ctx.stroke();}
function gradient(x,y,w,h,stops){const g=ctx.createLinearGradient(x,y,x+w,y+h);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function textStroke(text,x,y,size,fill='#fff',align='center',stroke='#2c294c',line=3){
 ctx.textAlign=align;ctx.textBaseline='middle';ctx.font='700 '+size+'px Fredoka, Arial Black, sans-serif';ctx.lineJoin='round';ctx.lineWidth=line;ctx.strokeStyle=stroke;ctx.strokeText(text,x,y);ctx.fillStyle=fill;ctx.fillText(text,x,y);
}
const rnd=random(8908),sparkle=Array.from({length:220},()=>({x:rnd(),y:rnd(),r:4+rnd()*25,a:.035+rnd()*.08,angle:rnd()*3})),imgFilter=()=>{};
function drawBackground(t){
 const {W,H}=LAY;let g=ctx.createLinearGradient(0,H*.1,W,H*.9);g.addColorStop(0,'#8460ed');g.addColorStop(.24,'#ae74e0');g.addColorStop(.58,'#c590d8');g.addColorStop(.81,'#a875ea');g.addColorStop(1,'#9066d8');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 let glow=ctx.createRadialGradient(W*.91,0,0,W*.91,0,W*.58);glow.addColorStop(0,'#ffe279');glow.addColorStop(.55,'#fbd28155');glow.addColorStop(1,'#ffba6600');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 glow=ctx.createRadialGradient(0,H*.93,0,0,H*.93,W*.55);glow.addColorStop(0,'#ffe78c');glow.addColorStop(1,'#ffe78c00');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 for(const v of sparkle){ctx.save();ctx.translate(v.x*W,v.y*H);ctx.rotate(v.angle);ctx.fillStyle='rgba(252,220,255,'+v.a+')';ctx.fillRect(-v.r/2,-v.r/2,v.r,v.r);ctx.restore();}
}
function drawCells(){
 const cols=LAY.portrait?7:13,rows=6;
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
 const p=cellRect(col,row),w=p.w,h=p.h;
 fillRound(p.x,p.y+3,w,h,14,'#644b9680');
 fillRound(p.x+2,p.y+1,w-4,h-5,13,'#d8a8f71c');
 strokeRound(p.x+2,p.y,w-4,h-5,13,'#694da485',3);
 }
}
function drawBlock(b){
 if(b.hp<=0)return;let {x,y,w,h}=rectOfBlock(b);
 ctx.save();ctx.shadowBlur=9;ctx.shadowColor='#36223c99';ctx.shadowOffsetY=5;
 fillRound(x+1,y+4,w,h-3,13,'#302b3d');ctx.restore();
 if(b.boss){
 const gold=gradient(x,y,w,h,[[0,'#ffefab'],[.2,'#fbbd48'],[.5,'#a45b12'],[.78,'#f9bd46'],[1,'#fff2ae']]);
 fillRound(x,y,w,h,19,'#783115');fillRound(x+4,y+3,w-8,h-8,16,gold);
 fillRound(x+18,y+19,w-36,h-37,8,'#a63317');fillRound(x+24,y+25,w-48,h-49,5,gradient(x,y+25,w,h-49,[[0,'#7c0613'],[.35,'#ce1022'],[.68,'#b70d23'],[1,'#690d22']]));
 strokeRound(x+22,y+23,w-44,h-46,6,'#f8d18d',3);
 for(const [xx,yy] of [[x+26,y+26],[x+w-26,y+26],[x+26,y+h-26],[x+w-26,y+h-26]]){
 let g=ctx.createRadialGradient(xx-7,yy-9,1,xx,yy,24);g.addColorStop(0,'#fffbd0');g.addColorStop(.35,'#ffcc3f');g.addColorStop(.7,'#cb7a15');g.addColorStop(1,'#703c0c');ctx.fillStyle=g;ctx.beginPath();ctx.arc(xx,yy,22,0,Math.PI*2);ctx.fill();strokeRound(xx-21,yy-21,42,42,20,'#f8e097',2);
 }
 textStroke(makeBlockText(b.hp),x+w*.5,y+h*.53,Math.min(72,w*.275),'#fff', 'center','#6e1d27',6);
 }else{
 fillRound(x,y,w,h,12,gradient(x,y,w,h,[[0,'#fcfcff'],[.23,'#777a8c'],[.45,'#e7e7f0'],[.75,'#8c8897'],[1,'#373747']]));
 fillRound(x+7,y+6,w-14,h-14,7,gradient(x+7,y+6,w-14,h-14,[[0,'#3a3b48'],[.5,'#161926'],[1,'#313442']]));
 strokeRound(x+8,y+7,w-16,h-16,7,'#a2a4b6',2);
 strokeRound(x+2,y+2,w-4,h-5,10,'#c0bfcc',2.5);
 for(const [xx,yy] of [[x+12,y+12],[x+w-12,y+12],[x+12,y+h-12],[x+w-12,y+h-12]]){
 const grad=ctx.createRadialGradient(xx-3,yy-5,0,xx,yy,12);grad.addColorStop(0,'#fff');grad.addColorStop(.4,'#bcbcc8');grad.addColorStop(1,'#616575');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(xx,yy,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#545568';ctx.lineWidth=1;ctx.stroke();
 }
 const label=makeBlockText(b.hp),size=clamp(Math.min(w*.52,h*.51,72),20,78);
 if(b.hp<b.max*.28){ctx.shadowBlur=16;ctx.shadowColor='#80fce1';}
 textStroke(label,x+w*.5,y+h*.52,size,'#f8faff','center','#222635',Math.max(3,size*.06));ctx.shadowBlur=0;
 }
}
function drawUnit(u,ghost=false){
 let p=rectOfUnit(u),im=imgs[u.tier],cx=p.x+p.w/2,cy=p.y+p.h/2;
 ctx.save();if(selected===u.id){ctx.shadowColor='#71fff0';ctx.shadowBlur=18;strokeRound(p.x+3,p.y+3,p.w-6,p.h-6,17,'#9bfff3',5);}
 if(ghost)ctx.globalAlpha=.58;
 const g=ctx.createRadialGradient(cx,cy,4,cx,cy,Math.max(p.w,p.h)*.63);g.addColorStop(0,'#75f8fb4e');g.addColorStop(1,'#43daea00');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx,cy,Math.max(p.w,85)*.63,Math.max(p.h,85)*.57,0,0,Math.PI*2);ctx.fill();
 if(im?.complete&&im.naturalWidth>0){
 const {w,h}=p;
 let ratio=im.naturalWidth/im.naturalHeight,maxW=w*.99,maxH=h*1.02;let drawW=Math.min(maxW,maxH*ratio),drawH=drawW/ratio;
 if(drawH>maxH){drawH=maxH;drawW=drawH*ratio;}
 ctx.drawImage(im,cx-drawW*.5,cy-drawH*.5,drawW,drawH);
 }else{ctx.font='65px sans-serif';ctx.textAlign='center';ctx.fillText('♫',cx,cy);}
 ctx.restore();
}
function drawScan(t){
 if(LAY.portrait){const x=LAY.x+((scanner+LAY.step*7)%(LAY.step*7));const g=ctx.createLinearGradient(x-28,0,x+28,0);g.addColorStop(0,'#3fffe900');g.addColorStop(.35,'#71f8fa66');g.addColorStop(.5,'#f8ffff');g.addColorStop(.62,'#36c5ffb3');g.addColorStop(1,'#b8fcff00');ctx.fillStyle=g;ctx.fillRect(x-28,150,56,LAY.step*6+25);return;}
 const x=LAY.x+scanner;const g=ctx.createLinearGradient(x-40,0,x+40,0);g.addColorStop(0,'#5dfce900');g.addColorStop(.30,'#81ffff77');g.addColorStop(.45,'#cfffffcc');g.addColorStop(.52,'#efffff');g.addColorStop(.63,'#6ad9ffdd');g.addColorStop(1,'#3efbff00');
 ctx.fillStyle=g;ctx.fillRect(x-41,0,82,LAY.H);ctx.fillStyle='#fffdfccc';ctx.fillRect(x-2.3,0,4.6,LAY.H);ctx.fillStyle='#b3faff88';ctx.fillRect(x+4,0,5,LAY.H);
}
function drawFx(dt){
 for(let i=fx.length-1;i>=0;i--){const p=fx[i];p.life-=dt;if(p.life<=0){fx.splice(i,1);continue;}
 const a=p.life/(p.max||1);ctx.save();ctx.globalAlpha=Math.min(1,a*1.4);
 if(p.kind==='halo'){ctx.strokeStyle=p.color;ctx.lineWidth=7*a;ctx.shadowColor=p.color;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(p.x,p.y,p.r+(1-a)*88,0,Math.PI*2);ctx.stroke();}
 else if(p.kind==='beam'){ctx.strokeStyle='#83faff';ctx.lineWidth=5*a;ctx.shadowBlur=14;ctx.shadowColor='#3ff6ff';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x2,p.y2);ctx.stroke();}
 else if(p.kind==='particle'){p.x+=p.vx*dt;p.y+=p.vy*dt;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2);ctx.fill();}
 else{p.x+=(p.vx||0)*dt;p.y+=(p.vy||-65)*dt;ctx.fillStyle=p.color;ctx.shadowColor='#8a4ec0';ctx.shadowBlur=7;ctx.textAlign='center';ctx.font='700 '+(p.kind==='damage'?36:45)+'px Fredoka, Arial';ctx.fillText(p.text,p.x,p.y);}
 ctx.restore();
 }
}
function drawChrome(){
 const W=LAY.W,H=LAY.H;
 const moneyX=LAY.portrait?W-45:W-154;
 textStroke(Math.floor(state.coins).toLocaleString('en-US').replace(/^/,'$'),moneyX,LAY.portrait?56:52,LAY.portrait?47:61,'#ffe348','right','#744a22',5);
 const min=Math.floor(Math.max(0,state.time)/60),sec=Math.floor(Math.max(0,state.time)%60);
 textStroke(min+':'+String(sec).padStart(2,'0'),W*.5,LAY.portrait?61:54,LAY.portrait?56:62,'#ddf9ff','center','#353450',5);
 settingsHot={x:16,y:14,w:58,h:58};shopHot={x:80,y:14,w:58,h:58};pauseHot={x:145,y:14,w:58,h:58};
 for(const [hit,icon] of [[settingsHot,'⚙'],[shopHot,'✦'],[pauseHot,paused?'▶':'Ⅱ']]){fillRound(hit.x,hit.y,hit.w,hit.h,15,'#49327694');strokeRound(hit.x,hit.y,hit.w,hit.h,15,'#e8c6ec80',2);textStroke(icon,hit.x+hit.w/2,hit.y+hit.h/2,31,'#fff0ff','center','#604778',2);}
 const bx=W*.5-(LAY.portrait?210:160),by=LAY.portrait?1510:764,bw=LAY.portrait?420:325,bh=LAY.portrait?84:126;
 chargeHitBox={x:bx,y:by,w:bw,h:bh};
 const outer=gradient(bx,by,bw,bh,[[0,'#ffffff'],[.24,'#b9aeb8'],[.47,'#fffdfd'],[.75,'#8d8394'],[1,'#f6eef5']]);
 fillRound(bx-7,by-7,bw+14,bh+13,18,'#393349af');fillRound(bx,by,bw,bh,17,outer);
 fillRound(bx+10,by+9,bw-20,bh-18,10,'#202641');
 ctx.save();rounded(bx+13,by+11,(bw-26)*clamp(state.chargeFill*.65+(.3+Math.min(.45,state.charge/100)),0,1),bh-22,7);ctx.clip();
 ctx.fillStyle=gradient(bx,by,bw,bh,[[0,'#6ef4d4'],[.7,'#38d7b7'],[1,'#45b99e']]);ctx.fillRect(bx+12,by+10,bw-24,bh-20);ctx.restore();
 strokeRound(bx+8,by+8,bw-16,bh-16,9,'#f4f6f0',3);
 textStroke(String(Math.floor(state.charge)),bx+bw/2,by+bh/2+3,LAY.portrait?61:73,'#fffefe','center','#29293e',5);
 if(!state.tutorialSeen){textStroke(txt('hint'),LAY.W*.5,LAY.portrait?837:733,LAY.portrait?21:22,'#fffcee','center','#64467c',4);}
 if(toast){textStroke(toast.t,W*.5,LAY.portrait?1448:720,LAY.portrait?29:33,'#fffdbf','center','#8a4e81',5);}
}
function drawResult(){
 if(!showResult)return;const W=LAY.W,H=LAY.H;
 ctx.fillStyle='#241438b8';ctx.fillRect(0,0,W,H);
 fillRound(W*.19,H*.27,W*.62,H*.45,30,gradient(W*.19,H*.27,W*.62,H*.45,[[0,'#8052bc'],[.6,'#442660'],[1,'#29224a']]));
 strokeRound(W*.19,H*.27,W*.62,H*.45,30,'#fff0ab',6);
 textStroke(showResult,W*.5,H*.42,clamp(W*.049,40,73),'#fff3d0','center','#452e6d',5);
 textStroke(txt(showResult===txt('time')?'retry':'next')+'  ▶',W*.5,H*.56,45,'#76ffd3','center','#33577a',4);
 textStroke(txt('restart'),W*.5,H*.65,20,'#f4d5f7','center','#543d67',2);
}
function render(dt){
 drawBackground(performance.now());drawCells();
 for(const b of state.blocks)drawBlock(b);
 for(const u of state.units)if(!dragging||dragging.id!==u.id)drawUnit(u);
 if(dragging){let u=state.units.find(u=>u.id===dragging.id);if(u){const p=rectOfUnit(u);ctx.save();ctx.translate(dragging.dx-p.x-p.w/2,dragging.dy-p.y-p.h/2);drawUnit(u,true);ctx.restore();}}
 drawScan(performance.now());drawFx(dt);drawChrome();drawResult();
}
function mainStep(dt){
 if(!paused&&!showResult&&!state.finished){
 state.time=Math.max(0,state.time-dt);
 const max=LAY.step*13+80;
 const speed=(LAY.step*13/3.8)*(1+state.upgrades.speed*.13);
 const old=scanner;scanner+=speed*dt;
 const first=Math.floor(old/LAY.step),last=Math.floor(scanner/LAY.step);
 for(let c=first+1;c<=last;c++)if(c>=0&&c<13)onScanColumn(c);
 if(scanner>max){scanner=-55;pass++;state.chargeFill+=.48;state.charge+=1;if(state.chargeFill>=1){state.charge+=Math.floor(state.chargeFill);state.chargeFill%=1;}save();}
 if(state.time<=0&&!state.finished){showResult=txt('time');gameEvent('gameplayStop');save();}
 }
 if(toast){toast.time-=dt;if(toast.time<=0)toast=null;}
}
function loop(now){
 let dt=clamp((now-frameLast)/1000,0,.06);frameLast=now;
 if(booted)mainStep(dt);
 render(dt);
 requestAnimationFrame(loop);
}
function worldPoint(e){const box=canvas.getBoundingClientRect();return{x:(e.clientX-box.left)/box.width*canvas.width,y:(e.clientY-box.top)/box.height*canvas.height};}
const inside=(p,r)=>r&&p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
function pointerDown(e){
 if(showResult)return;const p=worldPoint(e);let unit=unitAt(p.x,p.y);
 if(unit){dragging={id:unit.id,sx:p.x,sy:p.y,dx:p.x,dy:p.y,moved:false};canvas.setPointerCapture?.(e.pointerId);}
}
function pointerMove(e){const p=worldPoint(e);if(dragging){dragging.dx=p.x;dragging.dy=p.y;if(Math.hypot(p.x-dragging.sx,p.y-dragging.sy)>15)dragging.moved=true;}}
function pointerUp(e){
 const p=worldPoint(e);
 if(dragging){let drag=dragging;dragging=null;let a=state.units.find(u=>u.id===drag.id);if(!a)return;
 if(drag.moved){let target=unitAt(p.x,p.y);if(target&&target.id!==a.id&&target.tier===a.tier){merge(a,target);return;}
 const tile=pointCell(p.x,p.y);if(tile&&moveUnit(a,tile.c,tile.r))return;
 popup(txt('noRoom'));return;
 }else{let b=selected?state.units.find(u=>u.id===selected):null;if(b&&b.id!==a.id&&a.tier===b.tier){merge(b,a);return;}selected=a.id;sound.note(a.tier);scatter(p.x,p.y,'#b3ffff',5);return;}}
 if(showResult){if(state.finished){state.stage++;initWorld(false);}else{state.time=192;showResult='';}
 gameEvent('gameplayStart');save();return;}
 if(inside(p,chargeHitBox)){spawn();return;}
 if(inside(p,settingsHot)){openPanel('settings');return;}
 if(inside(p,shopHot)){openPanel('shop');return;}
 if(inside(p,pauseHot)){paused=!paused;gameEvent(paused?'gameplayStop':'gameplayStart');return;}
 const b=blockAt(p.x,p.y);if(b){popup(makeBlockText(b.hp));return;}
 const tile=pointCell(p.x,p.y);if(tile){const u=occupiedUnit(tile.c,tile.r);if(u){if(selected){const a=state.units.find(v=>v.id===selected);if(a&&a.id!==u.id&&a.tier===u.tier){merge(a,u);return;}}selected=u.id;sound.note(u.tier);}else if(state.charge>=5){spawn();}}
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
 window.addEventListener('pagehide',save);
 window.addEventListener('keydown',e=>{if(e.code==='Enter'&&showResult){if(state.finished)state.stage++;initWorld(false);gameEvent('gameplayStart');save();}
 if(e.code==='Space'&&!e.repeat){e.preventDefault();spawn();}
 if(e.code==='Escape')closePanel();
 });
}
function setupImages(){imgs=Array.from({length:ART.total},(_,tier)=>{const im=new Image();im.src=ART.src(tier);return im;});}
class AudioEngine{
 constructor(){this.ctx=null;this.main=null;this.bg=null;this.fx=null;this.muted=false;}
 unlock(){try{if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();const a=this.ctx;this.main=a.createGain();this.main.connect(a.destination);this.bg=a.createGain();this.bg.connect(this.main);this.fx=a.createGain();this.fx.connect(this.main);this.levels();}
 if(this.ctx.state==='suspended')this.ctx.resume();}catch(e){}}
 levels(){if(!this.ctx)return;let at=this.ctx.currentTime;this.main.gain.setTargetAtTime(this.muted?0:state.volume,at,.05);this.bg.gain.setTargetAtTime(state.music*.21,at,.05);this.fx.gain.setTargetAtTime(.36,at,.05);}
 setPortalMuted(m){this.muted=!!m;this.levels();}
 tone(n,type,at,len,vol,background=false){
 if(!this.ctx)return;const ctx=this.ctx,freq=440*Math.pow(2,(n-69)/12),o=ctx.createOscillator(),v=ctx.createGain(),l=ctx.createBiquadFilter();
 const types=['sine','sine','triangle','triangle','sawtooth','triangle','sawtooth','sawtooth','sine','triangle','sawtooth','triangle','sine','triangle','sawtooth','sawtooth'];o.type=types[type]||'sine';o.frequency.value=freq;l.type='lowpass';l.frequency.value=2500+Math.min(1800,type*140);
 v.gain.setValueAtTime(.0001,at);v.gain.exponentialRampToValueAtTime(Math.max(.001,vol),at+.015);v.gain.exponentialRampToValueAtTime(.0001,at+len);
 o.connect(l);l.connect(v);v.connect(background?this.bg:this.fx);o.start(at);o.stop(at+len+.035);
 }
 note(tier){this.unlock();if(!this.ctx)return;const a=this.ctx.currentTime+.012;let root=60+(state.stage%3)*2;const notes=[0,4,7,9,12,16,19,24];const m=root+notes[(tier+pass)%notes.length];this.tone(m,tier,a,.55,.28);if(tier>=6)this.tone(m+7,tier,a+.05,.6,.1);}
 merge(t){this.unlock();if(!this.ctx)return;const now=this.ctx.currentTime+.01;for(let i=0;i<5;i++)this.tone(60+[0,4,7,12,19][i],t,now+i*.095,.5,.18);}
 win(){this.merge(9);}
}
const sound=new AudioEngine();
window.GridGameDebug={getState:()=>clone(state),getGeometry:()=>({width:canvas.width,height:canvas.height,portrait,blocks:state.blocks.map(b=>({id:b.id,rect:rectOfBlock(b)})),units:state.units.map(u=>({id:u.id,rect:rectOfUnit(u)}))}),scan:()=>{let n=state.blocks.filter(b=>b.hp>0).length;for(const u of state.units)emitInstrument(u);return{before:n,after:state.blocks.filter(b=>b.hp>0).length,coins:state.coins};},spawn,merge:(a,b)=>merge(state.units[a],state.units[b]),restart:()=>initWorld(false),setCharge:n=>state.charge=n};
sdkInit();
})();