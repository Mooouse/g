const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const env={window:{}};vm.createContext(env);
vm.runInContext(fs.readFileSync('drag-planner.js','utf8'),env,{filename:'drag-planner.js'});
const {create,overlap}=env.window.GridDragPlanner;
assert.equal(typeof create,'function');
const size={s:{w:1,h:1},v:{w:1,h:2},l:{w:2,h:2},h:{w:3,h:2}};
const spans=t=>size[t];
function planner(units,blocks=[],cols=13,rows=6){return create({units,blocks,spans,cols,rows});}
function assertLegal(units,blocks,actor,plan,cols=13,rows=6){
 assert.notEqual(plan.kind,'invalid');
 const after=units.map(u=>({...u}));
 const a=after.find(u=>u.id===actor);a.c=plan.c;a.r=plan.r;
 for(const s of plan.shifts){const item=after.find(u=>u.id===s.id);assert.ok(item);item.c=s.c;item.r=s.r;}
 const rects=after.map(u=>({...u,...spans(u.tier)}));
 const active=blocks.filter(b=>b.hp>0);
 for(let i=0;i<rects.length;i++){
  const x=rects[i];
  assert.ok(x.c>=0&&x.r>=0&&x.c+x.w<=cols&&x.r+x.h<=rows,'within board');
  for(let j=i+1;j<rects.length;j++)assert.ok(!overlap(x,rects[j]),'no instruments overlap '+x.id+'/'+rects[j].id);
  for(const b of active)assert.ok(!overlap(x,b),'no instruments over target '+x.id);
 }
}
const two=[{id:1,tier:'s',c:0,r:0},{id:2,tier:'s',c:1,r:0}];
let p=planner(two).exact(1,1,0);
assert.equal(p.kind,'swap');assert.deepEqual(JSON.parse(JSON.stringify(p.shifts)),[{id:2,c:0,r:0}]);assertLegal(two,[],1,p);
p=planner(two).near(1,1,0);assert.equal(p.kind,'swap','direct swap preferred to a nearby empty cell');
const stacked=[{id:1,tier:'v',c:0,r:0},{id:2,tier:'s',c:3,r:1}];
p=planner(stacked).exact(1,3,1);assert.equal(p.kind,'swap','different footprints swap when both destinations fit');assertLegal(stacked,[],1,p);
const full=[{id:1,tier:'l',c:0,r:0}];
let uid=2;
for(let r=0;r<2;r++)for(let c=3;c<5;c++)full.push({id:uid++,tier:'s',c,r});
p=planner(full,[],5,2).exact(1,3,0);
assert.equal(p.kind,'reflow','large item displaces 4 tiles into original 2x2 footprint');
assert.equal(p.shifts.length,4);assertLegal(full,[],1,p,5,2);
const blocked=[{id:1,tier:'s',c:0,r:0}];
const boss=[{c:1,r:0,w:1,h:1,hp:100}];
assert.equal(planner(blocked,boss,3,2).exact(1,1,0).kind,'invalid','cannot place over a live enemy');
assert.equal(planner(blocked,boss,3,2).near(1,1,0).kind,'move','nearest valid spot prevents false full-board warning');
const separate=[{id:1,tier:'l',c:0,r:0},{id:2,tier:'l',c:3,r:0}];
p=planner(separate).exact(1,3,0);
assert.equal(p.kind,'swap','2x2 drum kits exchange as intact items');assertLegal(separate,[],1,p);
const constrained=[{id:1,tier:'s',c:0,r:0},{id:2,tier:'l',c:2,r:0}];
const wall=[{c:0,r:1,w:2,h:1,hp:100}];
p=planner(constrained,wall,4,2).exact(1,2,0);
assert.equal(p.kind,'invalid','reject swap when victim cannot legally fit source and no spare cells exist');
// An available cell across the grid must be chosen instead of a false
// "no room" even when every immediate neighbor is blocked.
const far=[{id:1,tier:'s',c:0,r:0}];let nextId=2;
for(let row=0;row<3;row++)for(let col=0;col<4;col++)
 if(!(row===0&&col===0)&&!(row===2&&col===3))far.push({id:nextId++,tier:'s',c:col,r:row});
const farPlan=planner(far,[],4,3).near(1,2,0);
assert.equal(farPlan.kind,'move','falls back to faraway free cell if no local option');
assert.deepEqual([farPlan.c,farPlan.r],[3,2],'the only free cell is chosen');
assert.equal(farPlan.adjusted,true,'previews distinguish adjusted placement');
assertLegal(far,[],1,farPlan,4,3);
assert.equal(planner(two).exact(1,0,0).kind,'same');
assert.equal(planner(two).exact(1,20,0).kind,'invalid');
console.log('PASS — same/normal/swap/multicell reflow/blocked/smart-nearest plans and no illegal overlap');
