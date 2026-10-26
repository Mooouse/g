/* Dependency-free smoke test for Melody Forge. Run: node tests/smoke.cjs */
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
for(const file of ['art.js','game.js'])new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
const elements=new Map(),listeners={},memory={},timers=[];
function element(id){
if(!elements.has(id))elements.set(id,{
id,innerHTML:'',textContent:'',value:'',dataset:{},disabled:false,
style:{setProperty(){},set width(v){this._width=v;}},
classList:{add(){},remove(){},contains(){return false;}},
addEventListener(event,callback){listeners[id+':'+event]=callback;}
});
return elements.get(id);
}
const document={getElementById:element,documentElement:{lang:'en'},hidden:false,querySelectorAll(){return[];}};
const localStorage={getItem(key){return memory[key]||null;},setItem(key,v){memory[key]=v;},removeItem(key){delete memory[key];}};
const context={
console,document,localStorage,navigator:{language:'ru-RU'},Date,Math,Array,Number,String,JSON,Map,Set,
encodeURIComponent,setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(){},setInterval(){},
window:{addEventListener(){}}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('art.js','utf8'),context,{filename:'art.js'});
assert.ok(context.window.MelodyArt.svg(11).includes('<svg'));
context.MelodyArt=context.window.MelodyArt;
vm.runInContext(fs.readFileSync('game.js','utf8'),context,{filename:'game.js'});
assert.equal(element('leftLevel').textContent,'01');
assert.equal(element('energyNum').textContent,'8 / 8');
assert.equal(document.documentElement.lang,'ru');
assert.ok(element('board').innerHTML.includes('data-cell="12"'));
listeners['startButton:click']();
assert.ok(element('tutorialTitle').textContent.includes('Открой'));
listeners['tutorialSkip:click']();
function clickCell(i){listeners['board:click']({target:{closest:()=>({dataset:{cell:String(i)}})}});}
clickCell(12);clickCell(13);
assert.ok(element('selectedName').textContent.includes('бубен'),'same-tier merge should create a tambourine');
assert.ok(element('collectionCount').innerHTML.startsWith('2'),'merge reveals second instrument tier');
listeners['pulseButton:click']();
assert.equal(element('energyNum').textContent,'7 / 8');
assert.ok(parseInt(element('openCount').textContent)>4,'soundwave opens nearby seals');
listeners['langQuick:click']();
assert.equal(document.documentElement.lang,'es','language cycles through Spanish');
listeners['langQuick:click']();
assert.equal(document.documentElement.lang,'en','language cycles through English');
console.log('Melody Forge smoke test: PASS');
