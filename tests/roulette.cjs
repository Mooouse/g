const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{}};vm.createContext(c);
vm.runInContext(fs.readFileSync('art.js','utf8'),c);
vm.runInContext(fs.readFileSync('roulette-logic.js','utf8'),c);
const {choose,weights,available}=c.window.MelodyRoulette,art=c.window.GridMusicArt;
assert.deepEqual([...weights],[58,25,11,4.5,1.3,.2]);
const all=available(art,()=>({c:1,r:3}));
assert.equal(all.length,24,'all four families and all tiers are obtainable when space exists');
for(let level=1;level<=6;level++){
 const start=weights.slice(0,level-1).reduce((s,v)=>s+v,0);
 const raw=(start+weights[level-1]*.5)/100;
 const win=choose(art,()=>({c:1,r:3}),(()=>{let i=0;return()=>++i===1?raw:0;})());
 assert.equal(win.level,level,'weighted rarity selects the correct level '+level);
 assert.equal(art.approved[win.tier].level,level,'instrument-specific levels determine rarity');
}
const onlyOne=choose(art,t=>art.approved[t].level===1&&art.approved[t].w===1&&art.approved[t].h===1?{c:11,r:5}:null,()=>.9999);
assert.equal(onlyOne.level,1,'reweight among fitting instruments rather than awarding unavailable legendary');
assert.equal(choose(art,()=>null,Math.random),null,'completely full grid does not charge for a lost prize');
const pick=choose(art,t=>t===23?{c:4,r:4}:null,()=>.1);
assert.equal(pick.tier,23,'a single mythic fit is still guaranteed when it is the only valid prize');
assert.deepEqual([pick.c,pick.r],[4,4],'award includes valid footprint coordinates');
let successes=0,high=0;
let seed=1234;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<10000;i++){
 const w=choose(art,()=>({c:2,r:2}),rng);
 successes++;if(w.level>=4)high++;
}
assert.ok(high>400&&high<900,'rare multi-level drops are neither impossible nor dominant');
console.log('PASS — rarity boundaries, 24 tiers, weighted random roll, space-aware results and no lost drops');
