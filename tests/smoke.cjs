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
vm.runInContext(art,context,{filename:'art.js'});assert.equal(context.window.GridMusicArt.total,16);
assert.ok(context.window.GridMusicArt.svg(8).includes('<svg'));
vm.runInContext(game,context,{filename:'game.js'});
for(let i=0;i<10;i++)await Promise.resolve();
const dbg=win.GridGameDebug;assert.ok(dbg,'debug hooks available');
const fresh=dbg.getState();assert.equal(fresh.blocks.length,20);assert.ok(fresh.units.length>=12);assert.equal(fresh.coins,241);assert.equal(fresh.charge,16);assert.equal(fresh.blocks.find(x=>x.boss).hp,100000);
assert.equal(dbg.getGeometry().portrait,false);
events.animation(1020);
const scan=dbg.scan();assert.ok(scan.coins>fresh.coins,'scan should earn money');
assert.ok(dbg.getState().blocks.some((b,i)=>b.hp<fresh.blocks[i].hp),'scan must damage metal blocks');
assert.ok(dbg.merge(0,1),'equal instruments should merge');
assert.equal(dbg.getState().units.length,fresh.units.length-1);
const charge=dbg.getState().charge;dbg.spawn();assert.equal(dbg.getState().charge,charge-5);assert.equal(dbg.getState().units.length,fresh.units.length);
win.innerWidth=430;win.innerHeight=850;events['window:resize']();let geometry=dbg.getGeometry();
assert.equal(geometry.portrait,true);assert.equal(geometry.width,900);
for(let b of geometry.blocks){assert.ok(b.rect.x>=0&&b.rect.x+b.rect.w<=geometry.width+1,'mobile blocks within viewport '+b.id);assert.ok(b.rect.y>=0&&b.rect.y+b.rect.h<=geometry.height+1,'mobile blocks within height '+b.id);}
events.animation(1070);
console.log('PASS — reference layout, 20 metal blocks, 100K boss, scanner damage, merge, spawn, portrait layout, rendered frames');
})().catch(e=>{console.error(e);process.exitCode=1;});
