const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const art=fs.readFileSync('art.js','utf8'),game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
new vm.Script(art,{filename:'art.js'});new vm.Script(game,{filename:'game.js'});
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
const refs=new Set([...game.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]));
assert.deepEqual([...refs].filter(k=>!ids.has(k)),[],'referenced DOM IDs must exist');
assert.ok(html.includes('crazygames-sdk-v3.js'));
const noop=()=>{},events={},ui={};const gradient={addColorStop:noop};
const ctx=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get(o,k){return o[k]??noop},set(o,k,v){o[k]=v;return true;}});
function element(id){return ui[id]??(ui[id]={
id,width:1650,height:928,textContent:'',innerHTML:'',value:'',style:{},
classList:{add:noop,remove:noop,toggle:noop},
addEventListener(n,fn){events[id+':'+n]=fn;},
getContext(){return ctx;},
getBoundingClientRect(){const ratio=win.innerHeight>win.innerWidth*1.08?900/1560:1650/928;return {left:0,top:0,width:Math.min(win.innerWidth,win.innerHeight*ratio),height:Math.min(win.innerHeight,win.innerWidth/ratio)};},
setPointerCapture:noop
});}
const document={getElementById:element,hidden:false,addEventListener:noop,createElement(tag){assert.equal(tag,'canvas');return {width:0,height:0,getContext(){return ctx;}};}};
const store={getItem(){return null},setItem:noop};
const win={innerWidth:2560,innerHeight:1440,devicePixelRatio:2,addEventListener(n,fn){events['window:'+n]=fn;}};
class MockImage{constructor(){this.complete=true;this.naturalWidth=220;this.naturalHeight=200;this.src='';}}
const context={window:win,document,localStorage:store,navigator:{language:'ru-RU'},console,Math,JSON,Number,String,Date,Array,Set,Map,
Image:MockImage,performance:{now:()=>1000},setTimeout(fn){return 1;},clearTimeout:noop,requestAnimationFrame(fn){events.animation=fn;return 1},encodeURIComponent};
vm.createContext(context);
(async()=>{
vm.runInContext(art,context,{filename:'art.js'});const artMeta=context.window.GridMusicArt;
assert.equal(artMeta.total,7,'exactly seven user-approved sprites');
const expected=[
 ['keyboard_1','keys',1,1,1],['keyboard_2','keys',2,1,1],
 ['ukulele_1','ukulele',1,1,1],
 ['drums_1','drums',1,1,1],['drums_2','drums',2,2,2],
 ['guitar_1','guitar',1,1,2],['guitar_2','guitar',2,1,2]
];
for(let i=0;i<expected.length;i++){
 const [id,family,level,w,h]=expected[i],a=artMeta.approved[i];
 assert.deepEqual([a.id,a.family,a.level,a.w,a.h],[id,family,level,w,h]);
 assert.deepEqual({...artMeta.spans(i)},{w,h},id+' cell footprint');
 const file=a.file;assert.ok(file.startsWith('assets/pixel/'),'individual PNG sprite path');
 const data=fs.readFileSync(file);
 assert.ok(data.length>100,'PNG data not empty: '+id);
 // Regression guard: don't silently ship the old 200–1000 byte geometry placeholders.
 const minimumPixels={keyboard_1:2200,keyboard_2:2200,ukulele_1:1500,drums_1:2500,drums_2:9000,guitar_1:4200,guitar_2:4200};
 assert.ok(data.length>minimumPixels[id],id+' should contain a detailed remastered silhouette, not the previous blocky placeholder');
 assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','valid PNG signature: '+id);
 assert.equal(data.readUInt32BE(16),w*64,'native width: '+id);
 assert.equal(data.readUInt32BE(20),h*64,'native height: '+id);
 assert.equal(artMeta.src(i),file,'image path: '+id);
}
assert.equal(artMeta.style,'pixel-art-images');
const uiExpected={background_tile:[64,64],cell:[64,64],metal_block:[64,64],boss_block:[128,128],scanner:[16,64],charge_button:[128,48],sparkle:[16,16],
settings_icon:[32,32],shop_icon:[32,32],pause_icon:[32,32],coin:[24,24],result_panel:[128,64]};
for(const [name,dim] of Object.entries(uiExpected)){
 const file=artMeta.uiAssets[name];assert.ok(file,'UI asset path: '+name);
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','UI PNG signature: '+name);
 assert.equal(bytes.readUInt32BE(16),dim[0],'UI sprite width: '+name);
 assert.equal(bytes.readUInt32BE(20),dim[1],'UI sprite height: '+name);
}
assert.equal(artMeta.nextTier(0),1,'keyboard progression');
assert.equal(artMeta.nextTier(3),4,'drum progression');
assert.equal(artMeta.nextTier(5),6,'guitar progression');
for(const i of [1,2,4,6])assert.equal(artMeta.nextTier(i),null,'no unapproved merges');
assert.ok(artMeta.spawnTiers.every(t=>[0,2,3,5].includes(t)),'spawn only approved family starters');
vm.runInContext(game,context,{filename:'game.js'});
for(let i=0;i<10;i++)await Promise.resolve();
const dbg=win.GridGameDebug;assert.ok(dbg,'debug hooks available');
const fresh=dbg.getState();assert.equal(fresh.blocks.length,20);assert.ok(fresh.units.length>=7);assert.equal(fresh.coins,241);assert.equal(fresh.charge,16);assert.equal(fresh.blocks.find(x=>x.boss).hp,100000);
assert.equal(dbg.getGeometry().portrait,false);
const desktop=dbg.getGeometry();
assert.equal(desktop.width,1650,'logical width stays fixed');
assert.equal(desktop.height,928,'logical height stays fixed');
assert.ok(desktop.renderWidth>=1900,'keep enough backing pixels for sharp sprites');
assert.ok(desktop.renderWidth<=2200,'canvas does not exceed performance pixel budget');
assert.ok(desktop.renderHeight>=1050,'high DPI backing height');
assert.ok(desktop.renderWidth*desktop.renderHeight<=2600000,'canvas pixel budget protects performance');
assert.ok(desktop.renderScale>=1.1&&desktop.renderScale<=1.5,'adaptive scale avoids expensive full DPR');
assert.equal(ctx.imageSmoothingEnabled,false,'pixel art is never smoothed');
assert.equal(ctx.imageSmoothingQuality,'low','no interpolation');
// Simulated pointer mapping remains in logical coordinates after increasing backing resolution.
const center=desktop.units[0].rect;
const logicalPoint={x:center.x+center.w/2,y:center.y+center.h/2};
const canvasBounds=element('game').getBoundingClientRect();
const mouse={clientX:logicalPoint.x/1650*canvasBounds.width,clientY:logicalPoint.y/928*canvasBounds.height,pointerId:1};
assert.ok(events['game:pointerdown'],'pointer down handler');
events['game:pointerdown'](mouse);
events['game:pointerup'](mouse);
assert.ok(dbg.getState().units.some(u=>u.tier===fresh.units[0].tier),'pointer maps correctly to logical board');
events.animation(1020);
const scan=dbg.scan();assert.ok(scan.coins>fresh.coins,'scan should earn money');
assert.ok(dbg.getState().blocks.some((b,i)=>b.hp<fresh.blocks[i].hp),'scan must damage metal blocks');
const firstTier0=fresh.units.findIndex(u=>u.tier===0);
const secondTier0=fresh.units.findIndex((u,i)=>i>firstTier0&&u.tier===0);
assert.ok(firstTier0>=0&&secondTier0>=0,'two keyboards level 1 for merge');
assert.ok(dbg.merge(firstTier0,secondTier0),'same-family keyboards should merge into approved level 2');
assert.equal(dbg.getState().units.length,fresh.units.length-1);
assert.equal(dbg.getState().units.filter(u=>u.tier===1).length,fresh.units.filter(u=>u.tier===1).length+1);
const unapprovedIndex=dbg.getState().units.findIndex(u=>u.tier===2);
const anotherFamilyIndex=dbg.getState().units.findIndex(u=>u.tier===3);
assert.ok(!dbg.merge(unapprovedIndex,anotherFamilyIndex),'cross-family merge is prohibited');
const charge=dbg.getState().charge;dbg.spawn();assert.equal(dbg.getState().charge,charge-5);assert.equal(dbg.getState().units.length,fresh.units.length);
win.innerWidth=430;win.innerHeight=850;events['window:resize']();let geometry=dbg.getGeometry();
assert.equal(geometry.portrait,true);assert.equal(geometry.width,900);
assert.equal(geometry.height,1560);
assert.ok(geometry.renderWidth>=900,'mobile backing store not downsampled');
for(let b of geometry.blocks){assert.ok(b.rect.x>=0&&b.rect.x+b.rect.w<=geometry.width+1,'mobile blocks within viewport '+b.id);assert.ok(b.rect.y>=0&&b.rect.y+b.rect.h<=geometry.height+1,'mobile blocks within height '+b.id);}
events.animation(1070);
console.log('PASS — 19 standalone native pixel PNG sprites, no smoothing, separate family merges, mobile board, scanner and controls');
})().catch(e=>{console.error(e);process.exitCode=1;});
