const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const lib='vendor/mojs/mo.umd.js';
assert.ok(fs.existsSync(lib)&&fs.statSync(lib).size>100000,'official bundled mo.js distributable exists');
assert.ok(fs.readFileSync('vendor/mojs/LICENSE.md','utf8').includes('MIT'),'mo.js license is retained');
const code=fs.readFileSync('mojs-game-fx.js','utf8');
new vm.Script(code,{filename:'mojs-game-fx.js'});
const played=[],created=[];
class Effect{
 constructor(opts){this.opts=opts;this.name=this.constructor.name;created.push(this);}
 tune(args){this.pos=args;return this;}
 replay(){played.push({name:this.name,...this.pos});return this;}
}
class Burst extends Effect{}
class Shape extends Effect{}
let time=2000;
const fakeWindow={mojs:{Burst,Shape},performance:{now:()=>time},document:{hidden:false},
 matchMedia:()=>({matches:false})};
const vmContext={window:fakeWindow};
vm.createContext(vmContext);vm.runInContext(code,vmContext);
const overlay={getBoundingClientRect:()=>({left:0,top:0})};
const canvas={getBoundingClientRect:()=>({left:20,top:40,width:660,height:371.2})};
const fx=new fakeWindow.MojsGameFX(overlay,canvas,()=>({W:1650,H:928}),fakeWindow);
assert.equal(fx.debug().enabled,true,'real mo.js constructors are discovered');
assert.equal(fx.merge(825,464,4),true);
assert.equal(played.length,2,'merges use real Burst and Shape simultaneously');
assert.equal(played[0].x,350,'logical canvas coordinates map to CSS pixels');
assert.equal(played[0].y,225.6,'vertical canvas scaling is correct');
assert.equal(created[0].opts.parent,overlay,'effects are scoped to inert viewport overlay');
assert.equal(created[0].opts.count,9,'merge emitter has bounded number of particles');
const initial=created.length;
for(let i=0;i<20;i++){time+=200;fx.merge(825,464,4);}
assert.equal(created.length,initial+6,'merge pool never grows beyond four burst/ring pairs');
time+=160;
fx.block(300,300,false);const before=played.length;
fx.block(300,300,false);assert.equal(played.length,before,'block events are throttled');
time+=160;
fx.block(300,300,false);assert.ok(played.length>before);
for(let i=0;i<30;i++){time+=200;fx.prize(820,420,6);}
assert.ok(fx.debug().poolCount<=9,'all pooled effects are bounded by type');
fx.swap(600,350);fx.victory(820,460);
assert.ok(played.length>80);
const count=played.length;
const reduced={...fakeWindow,matchMedia:()=>({matches:true})};
const reducedFx=new reduced.MojsGameFX(overlay,canvas,()=>({W:1650,H:928}),reduced);
assert.equal(reducedFx.merge(100,100,1),false,'reduced motion disables effects');
assert.equal(played.length,count);
fakeWindow.document.hidden=true;
assert.equal(fx.prize(820,420,6),false,'background tabs do not animate');
const game=fs.readFileSync('game.js','utf8');
for(const call of ['moFx.merge(', 'moFx.block(', 'moFx.prize(', 'moFx.swap(', 'moFx.victory('])
 assert.ok(game.includes(call),'game wires in mo.js event '+call);
const html=fs.readFileSync('index.html','utf8');
const a=html.indexOf('vendor/mojs/mo.umd.js'),b=html.indexOf('mojs-game-fx.js'),c=html.indexOf('game.js?');
assert.ok(a>0&&a<b&&b<c,'official UMD is loaded before bridge and gameplay');
assert.ok(html.includes('id="mojsEffects"'),'inert overlay is present');
console.log('PASS — real Mo.js Burst/Shape effects, pixel mapping, capped pools, throttling, reduced-motion and script wiring');
