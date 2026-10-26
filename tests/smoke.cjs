/* Music Crates smoke test, no npm dependencies. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),sprites=fs.readFileSync('instruments.js','utf8'),game=fs.readFileSync('game.js','utf8');
new vm.Script(sprites,{filename:'instruments.js'});new vm.Script(game,{filename:'game.js'});
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
const used=new Set([...game.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]));
assert.deepEqual([...used].filter(id=>!ids.has(id)),[],'missing DOM elements');
assert.ok(html.includes('crazygames-sdk-v3.js'));
let events={},elements={},store={},timers=[];
function el(id){
 if(!elements[id])elements[id]={
 id,innerHTML:'',textContent:'',value:'',dataset:{},disabled:false,
 style:{setProperty(){}},parentElement:{getBoundingClientRect(){return {left:0,top:0};}},
 classList:{add(){},remove(){},contains(){return false;}},appendChild(){},remove(){},
 addEventListener(n,callback){events[id+':'+n]=callback;},querySelector(){return null;}
 };
 return elements[id];
}
const doc={hidden:false,documentElement:{lang:'en'},getElementById:el,querySelectorAll(){return[];},createElement(){return {style:{setProperty(){}},remove(){},textContent:'',className:''};},addEventListener(){}};
const ctx={window:{addEventListener(){}},document:doc,navigator:{language:'ru-RU'},performance:{now(){return 1000;}},localStorage:{getItem(k){return store[k]||null;},setItem(k,v){store[k]=v;}},console,
Math,Date,Set,Map,Number,Array,String,JSON,encodeURIComponent,performance: {now(){return 1000;}},requestAnimationFrame(){},clearTimeout(){},setTimeout(fn){timers.push(fn);return timers.length;}};
vm.createContext(ctx);
vm.runInContext(sprites,ctx,{filename:'instruments.js'});
assert.equal(ctx.window.MusicArt.total,16);
ctx.MusicArt=ctx.window.MusicArt;
vm.runInContext(game,ctx,{filename:'game.js'});
const snap=()=>ctx.window.MusicCratesDebug.snapshot();
assert.equal(doc.documentElement.lang,'ru');
assert.equal(snap().level,1);
assert.equal(snap().n,6);
assert.ok(el('board').innerHTML.includes('data-index="14"'));
assert.ok(snap().cells.filter(c=>c.kind==='box').length>20);
ctx.window.MusicCratesDebug.select(14);
ctx.window.MusicCratesDebug.select(15);
assert.equal(snap().cells[15].tier,1,'merge should upgrade identical instruments');
ctx.window.MusicCratesDebug.select(20);
ctx.window.MusicCratesDebug.select(21);
assert.equal(snap().cells[21].tier,1);
ctx.window.MusicCratesDebug.select(15);
ctx.window.MusicCratesDebug.select(21);
assert.equal(snap().cells[21].tier,2,'merge progression');
assert.equal(snap().highest,2);
assert.ok(snap().known.includes(2));
const damaged=ctx.window.MusicCratesDebug.step();
assert.ok(damaged.after<=damaged.before,'instruments should destroy boxes over time');
events['languageBtn:click']();
assert.equal(doc.documentElement.lang,'en');
events['languageBtn:click']();
assert.equal(doc.documentElement.lang,'es');
ctx.window.MusicCratesDebug.forceWin();
for(const fn of timers)if(typeof fn==='function')fn();
assert.ok(snap().cells.every(c=>c.kind!=='box'));
assert.ok(snap().coins>=110);
console.log('PASS Music Crates: startup, crates, two merges, tier progression, attacks, locales, victory');
