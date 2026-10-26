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
getBoundingClientRect(){return {left:0,top:0,width:this.width,height:this.height};},
setPointerCapture:noop
});}
const document={getElementById:element,hidden:false,addEventListener:noop};
const store={getItem(){return null},setItem:noop};
const win={innerWidth:1650,innerHeight:928,addEventListener(n,fn){events['window:'+n]=fn;}};
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
 const file=a.file;assert.ok(file.startsWith('assets/approved/'),id+' must be a real asset');
 const bytes=fs.readFileSync(file);assert.ok(bytes.length>2500,id+' nonempty');
 assert.equal(bytes.toString('ascii',0,4),'RIFF',id+' WEBP RIFF header');
 assert.equal(bytes.toString('ascii',8,12),'WEBP',id+' WebP type');
 assert.equal(artMeta.src(i),file,id+' sprite file path');
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
for(let b of geometry.blocks){assert.ok(b.rect.x>=0&&b.rect.x+b.rect.w<=geometry.width+1,'mobile blocks within viewport '+b.id);assert.ok(b.rect.y>=0&&b.rect.y+b.rect.h<=geometry.height+1,'mobile blocks within height '+b.id);}
events.animation(1070);
console.log('PASS — seven approved WebP assets, family progression, grid footprints, blocks, scanner, merge, spawn and mobile render');
})().catch(e=>{console.error(e);process.exitCode=1;});
