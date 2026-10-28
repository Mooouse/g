const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const art=fs.readFileSync('art.js','utf8'),game=fs.readFileSync('game.js','utf8'),audio=fs.readFileSync('sample-audio.js','utf8'),planner=fs.readFileSync('drag-planner.js','utf8'),rouletteSource=fs.readFileSync('roulette-logic.js','utf8'),theme=fs.readFileSync('concert-theme.js','utf8'),html=fs.readFileSync('index.html','utf8');
new vm.Script(art,{filename:'art.js'});new vm.Script(game,{filename:'game.js'});new vm.Script(audio,{filename:'sample-audio.js'});new vm.Script(planner,{filename:'drag-planner.js'});new vm.Script(rouletteSource,{filename:'roulette-logic.js'});new vm.Script(theme,{filename:'concert-theme.js'});
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
const refs=new Set([...game.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]));
assert.deepEqual([...refs].filter(k=>!ids.has(k)),[],'referenced DOM IDs must exist');
assert.ok(html.includes('crazygames-sdk-v3.js'));
assert.ok(html.includes('roulette-logic.js')&&html.includes('concert-theme.js'),'concert resources load');
assert.ok(html.includes('sample-audio.js')&&html.indexOf('sample-audio.js')<html.indexOf('game.js'),'sample engine loads before game');
assert.ok(html.includes('drag-planner.js')&&html.indexOf('drag-planner.js')<html.indexOf('game.js'),'drag planner loads before game');
const noop=()=>{},events={},ui={};const gradient={addColorStop:noop};
const frameCounter={clears:0};
const ctx=new Proxy({clearRect(){frameCounter.clears++},createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get(o,k){return o[k]??noop},set(o,k,v){o[k]=v;return true;}});
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
vm.runInContext(art,context,{filename:'art.js'});vm.runInContext(audio,context,{filename:'sample-audio.js'});vm.runInContext(planner,context,{filename:'drag-planner.js'});vm.runInContext(rouletteSource,context,{filename:'roulette-logic.js'});vm.runInContext(theme,context,{filename:'concert-theme.js'});const artMeta=context.window.GridMusicArt;
assert.ok([7,24].includes(artMeta.total),'legacy release has seven tiers; PixelLab release has twenty-four');
const pixellab=artMeta.style==='pixellab-game-assets';
const expected=[
 ['keyboard_1','keys',1,1,1],['keyboard_2','keys',2,1,1],
 ['ukulele_1','ukulele',1,1,1],
 ['drums_1','drums',1,1,1],['drums_2','drums',2,2,2],
 ['guitar_1','guitar',1,1,2],['guitar_2','guitar',2,1,2]
];
if(pixellab){
 const counts={keys:0,ukulele:0,drums:0,guitar:0};
 for(const a of artMeta.approved){assert.ok(a.family in counts);counts[a.family]++;}
 assert.deepEqual({...counts},{keys:6,ukulele:6,drums:6,guitar:6});
 assert.equal(artMeta.total,24,'24 separately generated models');
 for(const a of artMeta.approved){
   const bytes=fs.readFileSync(a.file);
   assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG '+a.id);
   assert.equal(bytes.readUInt32BE(16),a.w*64,'width '+a.id);
   assert.equal(bytes.readUInt32BE(20),a.h*64,'height '+a.id);
 }
 for(let i=0;i<24;i++){
  const a=artMeta.approved[i],b=artMeta.approved[artMeta.nextTier(i)];
  if(a.level<6){assert.ok(b&&a.family===b.family&&b.level===a.level+1,'correct family upgrade for '+a.id);}
  else assert.equal(artMeta.nextTier(i),null,'level 6 is terminal: '+a.id);
 }
}
for(let i=0;i<expected.length;i++){
 const [id,family,level,w,h]=expected[i],a=artMeta.approved[i];
 assert.deepEqual([a.id,a.family,a.level,a.w,a.h],[id,family,level,w,h]);
 assert.deepEqual({...artMeta.spans(i)},{w,h},id+' cell footprint');
 const file=a.file;assert.ok(file.startsWith(pixellab?'assets/pixellab/':'assets/pixel/'),'individual PNG sprite path');
 const data=fs.readFileSync(file);
 assert.ok(data.length>100,'PNG data not empty: '+id);
 // Regression guard: don't silently ship the old 200–1000 byte geometry placeholders.
 const minimumPixels={keyboard_1:2200,keyboard_2:2200,ukulele_1:1500,drums_1:2500,drums_2:9000,guitar_1:4200,guitar_2:4200};
 assert.ok(data.length>(pixellab?450:minimumPixels[id]),id+' must be a detailed art asset');
 assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a','valid PNG signature: '+id);
 assert.equal(data.readUInt32BE(16),w*64,'native width: '+id);
 assert.equal(data.readUInt32BE(20),h*64,'native height: '+id);
 assert.equal(artMeta.src(i),file,'image path: '+id);
}
assert.ok(['pixel-art-images','pixellab-game-assets'].includes(artMeta.style));
assert.equal(Object.keys(win.MelodyAudioSamplePaths).length,18,'18 real offline instrument recordings');
const samplePaths=win.MelodyAudioSamplePaths;
for(const [key,path] of Object.entries(samplePaths)){
 assert.ok(path.startsWith('assets/audio/'),'same-origin audio sample '+key);
 const bytes=fs.readFileSync(path);
 const magic=bytes.subarray(0,4).toString('ascii');
 assert.ok(magic==='fLaC'||magic==='OggS','audio content magic for '+path);
 assert.ok(bytes.length>12000,'recorded instrument has meaningful audio data: '+path);
}
const families=new Set(Object.keys(samplePaths).map(k=>k.split(':')[0]));
assert.deepEqual([...families].sort(),['drum','guitar','piano','ukulele'],'every instrument has a unique real recording family');
assert.ok(audio.includes('this.buffers.get(key)'),'instrument samples are actually used for voice playback');
assert.ok(audio.includes('this.drum('),'drums play physical percussion samples');

const uiExpected={background_tile:[64,64],cell:[64,64],metal_block:[64,64],boss_block:[128,128],scanner:[16,64],charge_button:[128,48],sparkle:[16,16],
settings_icon:[32,32],shop_icon:[32,32],pause_icon:[32,32],coin:[24,24],result_panel:[128,64]};
for(const [name,legacyDim] of Object.entries(uiExpected)){
 // PixelLab images use 64 native pixels per game-grid cell.
 // The boss occupies 2x2, while charge and results panels are 2x1.
 // Never assume every UI graphic is square.
 const pixelLabDimensions={boss_block:[128,128],charge_button:[128,64],result_panel:[128,64]};
 const dim=pixellab?(pixelLabDimensions[name]||[64,64]):legacyDim;
 const file=artMeta.uiAssets[name];assert.ok(file,'UI asset path: '+name);
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','UI PNG signature: '+name);
 assert.equal(bytes.readUInt32BE(16),dim[0],'UI sprite width: '+name);
 assert.equal(bytes.readUInt32BE(20),dim[1],'UI sprite height: '+name);
}
assert.equal(artMeta.nextTier(0),1,'keyboard progression');
assert.equal(artMeta.nextTier(3),4,'drum progression');
assert.equal(artMeta.nextTier(5),6,'guitar progression');
if(!pixellab)for(const i of [1,2,4,6])assert.equal(artMeta.nextTier(i),null,'no unapproved merges');
assert.ok(artMeta.spawnTiers.every(t=>[0,2,3,5].includes(t)),'spawn only approved family starters');
vm.runInContext(game,context,{filename:'game.js'});
for(let i=0;i<10;i++)await Promise.resolve();
const dbg=win.GridGameDebug;assert.ok(dbg,'debug hooks available');
const fresh=dbg.getState();assert.equal(fresh.blocks.length,20);assert.ok(fresh.units.length>=7);assert.equal(fresh.coins,241);assert.equal(fresh.charge,16);assert.equal(fresh.blocks.find(x=>x.boss).hp,100000);
assert.equal(dbg.getGeometry().portrait,false);
const desktop=dbg.getGeometry();
assert.equal(desktop.width,1650,'logical width stays fixed');
assert.equal(desktop.height,928,'logical height stays fixed');
assert.equal(desktop.renderWidth,1650,'pixel-art canvas renders natively for high FPS');
assert.equal(desktop.renderHeight,928,'native vertical backing resolution');
assert.equal(desktop.renderScale,1,'no oversized HiDPI canvas');
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
// Two frames 8 ms apart must both redraw on a 120/144 Hz display.
const beforeFrames=frameCounter.clears;
events.animation(1008);
events.animation(1016);
assert.equal(frameCounter.clears,beforeFrames+2,'every display frame is rendered; no 40 FPS throttle');
assert.ok(!game.includes('TARGET_FRAME_MS'),'hard FPS cap removed');
assert.ok(!game.includes('ctx.globalAlpha=.58'),'old translucent dragged ghost removed');
assert.ok(game.includes('easeInOutCubic(t)'),'movement uses frame-rate-independent eased interpolation');
assert.ok(game.includes("kind==='move'"),'dropping a moved instrument also animates');
assert.ok(game.includes("render(dt)"),'animation is rendered on every browser frame');
events.animation(1020);
const scan=dbg.scan();assert.ok(scan.coins>fresh.coins,'scan should earn money');
assert.ok(dbg.getState().blocks.some((b,i)=>b.hp<fresh.blocks[i].hp),'scan must damage metal blocks');
const firstTier0=fresh.units.findIndex(u=>u.tier===0);
const secondTier0=fresh.units.findIndex((u,i)=>i>firstTier0&&u.tier===0);
assert.ok(firstTier0>=0&&secondTier0>=0,'two keyboards level 1 for merge');
assert.ok(dbg.merge(firstTier0,secondTier0),'same-family keyboards should merge into approved level 2');
assert.equal(dbg.getState().units.length,fresh.units.length-1);
assert.equal(dbg.getState().units.filter(u=>u.tier===1).length,fresh.units.filter(u=>u.tier===1).length+1);
const mergeMotions=dbg.getAnimations().filter(m=>m.kind==='merge');
assert.equal(mergeMotions.length,1,'merged upgrade must start a visible animation');
assert.ok(mergeMotions[0].duration>=.4,'merge animation remains perceivable');
assert.ok(Number.isFinite(mergeMotions[0].from.x)&&Number.isFinite(mergeMotions[0].to.x),'merge movement has concrete origin and destination');
assert.ok(game.includes('findFree(t,undefined,{c:b.c,r:b.r})'),'upgraded item selects nearest available slot');
assert.ok(game.includes("kind:'destination'"),'remote merges highlight their destination');
assert.ok(game.includes("kind:'combine'"),'two original instruments converge visibly');
// Pointer-based relocation of a 1x1 instrument must visibly glide, not teleport.
const moving=dbg.getState().units.find(u=>u.tier===0&&u.c===0&&u.r===4);
assert.ok(moving,'movement regression fixture exists at column 0 row 4');
const movingRect=dbg.getGeometry().units.find(u=>u.id===moving.id).rect;
const fromPointer={
 clientX:(movingRect.x+movingRect.w/2)/1650*canvasBounds.width,
 clientY:(movingRect.y+movingRect.h/2)/928*canvasBounds.height,pointerId:3
};
const toPointer={
 clientX:(280+79/2)/1650*canvasBounds.width,
 clientY:(180+5*84+79/2)/928*canvasBounds.height,pointerId:3
};
events['game:pointerdown'](fromPointer);
events['game:pointermove'](toPointer);
events['game:pointerup'](toPointer);
const movedUnit=dbg.getState().units.find(u=>u.id===moving.id);
assert.deepEqual([movedUnit.c,movedUnit.r],[0,5],'unit lands in requested free tile');
const moveAnim=dbg.getAnimations().find(m=>m.id===moving.id);
assert.equal(moveAnim.kind,'move','drop starts a glide transition');
assert.ok(moveAnim.duration>=.25,'drag release animation lasts long enough to see');
assert.ok(Number.isFinite(moveAnim.from.x)&&Number.isFinite(moveAnim.from.y),'release animation starts from actual pointer position');
assert.ok(Number.isFinite(moveAnim.to.x)&&Number.isFinite(moveAnim.to.y),'release animation ends at cell center');
assert.ok(Math.hypot(moveAnim.from.x-moveAnim.to.x,moveAnim.from.y-moveAnim.to.y)<104,'drop snaps only the last short distance, not back to its old cell');
// Real pointer drag: hovering an occupied different-family tile must
// show the pairwise exchange BEFORE release, then commit exactly that swap.
const beforeSwap=dbg.getState();
const draggedUnit=beforeSwap.units.find(u=>u.tier===0&&u.c===5&&u.r===3);
const swappedUnit=beforeSwap.units.find(u=>u.tier===2&&u.c===5&&u.r===2);
assert.ok(draggedUnit&&swappedUnit,'swap regression pair exists');
const startBox=dbg.getGeometry().units.find(u=>u.id===draggedUnit.id).rect;
const targetBox=dbg.getGeometry().units.find(u=>u.id===swappedUnit.id).rect;
const pointerAt=box=>({clientX:(box.x+box.w/2)/1650*canvasBounds.width,
 clientY:(box.y+box.h/2)/928*canvasBounds.height,pointerId:8});
events['game:pointerdown'](pointerAt(startBox));
events['game:pointermove'](pointerAt(targetBox));
events.animation(1024);
const displayed=dbg.getDragPreview();
assert.equal(displayed.kind,'swap','occupied tile previews a swap, not no-room');
assert.equal(displayed.shifts.length,1,'preview shows where the displaced instrument goes');
assert.deepEqual([displayed.shifts[0].c,displayed.shifts[0].r],[5,3],'ghost instrument points to vacated source');
events['game:pointerup'](pointerAt(targetBox));
const afterSwap=dbg.getState();
const aAfter=afterSwap.units.find(u=>u.id===draggedUnit.id);
const bAfter=afterSwap.units.find(u=>u.id===swappedUnit.id);
assert.deepEqual([aAfter.c,aAfter.r],[5,2],'dragged keyboard lands on ukulele tile');
assert.deepEqual([bAfter.c,bAfter.r],[5,3],'ukulele swaps into the previous keyboard tile');
assert.ok(!dbg.getDragPreview(),'preview disappears after drop');

// Animated roulette must freeze the board and only award the prize after spin.
const prevRoll=dbg.getState();
assert.ok(dbg.roll(),'roulette begins when charge and a footprint are available');
const rollStart=dbg.getRoulette();
assert.equal(rollStart.phase,'spinning');
assert.equal(dbg.getState().units.length,prevRoll.units.length,'no instrument leaks before reveal');
assert.equal(dbg.getState().charge,prevRoll.charge-5,'charge spent exactly once');
dbg.advanceRoulette(1.6);
assert.equal(dbg.getRoulette().phase,'reveal','winning instrument is unveiled after spin');
assert.equal(dbg.getState().units.length,prevRoll.units.length+1,'exactly one prize appears');
dbg.advanceRoulette(2);
assert.equal(dbg.getRoulette(),null,'roulette overlay closes after reveal');

const unapprovedIndex=dbg.getState().units.findIndex(u=>u.tier===2);
const anotherFamilyIndex=dbg.getState().units.findIndex(u=>u.tier===3);
assert.ok(!dbg.merge(unapprovedIndex,anotherFamilyIndex),'cross-family merge is prohibited');
const charge=dbg.getState().charge,beforeInstant=dbg.getState().units.length;dbg.spawn();assert.equal(dbg.getState().charge,charge-5);assert.equal(dbg.getState().units.length,beforeInstant+1);
win.innerWidth=430;win.innerHeight=850;events['window:resize']();let geometry=dbg.getGeometry();
assert.equal(geometry.portrait,true);assert.equal(geometry.width,900);
assert.equal(geometry.height,1560);
assert.ok(geometry.renderWidth>=900,'mobile backing store not downsampled');
for(let b of geometry.blocks){assert.ok(b.rect.x>=0&&b.rect.x+b.rect.w<=geometry.width+1,'mobile blocks within viewport '+b.id);assert.ok(b.rect.y>=0&&b.rect.y+b.rect.h<=geometry.height+1,'mobile blocks within height '+b.id);}
events.animation(1070);
// A regression scenario based on the reported screenshot: the obsolete
// 16-element damage table let tiers 16–23 produce NaN block HP and coin totals.
// JSON.stringify(NaN) persists these as null. Restore *by ID*, not array index.
for(let i=0;i<artMeta.total;i++){
 const d=dbg.getDamage(i);
 assert.ok(Number.isFinite(d)&&d>0,'finite damage for tier '+i);
}
if(pixellab){
 const damaged=fresh.blocks.map(b=>({...b}));
 damaged[2].hp=null;damaged[2].max=null; // corrupted damage or max
 const omitted=damaged.filter(b=>b.id!==8); // older code had dropped invalid blocks
 const saved={
  ...fresh,coins:null,chargeFill:null,blocks:omitted,
  units:[{tier:23,c:1,r:2,id:201},{tier:23,c:1,r:2,id:202},{tier:0,c:1,r:2,id:203},{tier:0,c:9,r:0,id:204}]
 };
 const brokenStore={getItem(){return JSON.stringify(saved)},setItem:noop};
 const badWindow={...win,GridMusicArt:artMeta,addEventListener:noop};
 const recoveryContext={...context,window:badWindow,localStorage:brokenStore};
 vm.createContext(recoveryContext);
 vm.runInContext(planner,recoveryContext,{filename:'drag-planner.js'});
  vm.runInContext(rouletteSource,recoveryContext,{filename:'roulette-logic.js'});vm.runInContext(theme,recoveryContext,{filename:'concert-theme.js'});vm.runInContext(game,recoveryContext,{filename:'game-recovery.js'});
 for(let i=0;i<10;i++)await Promise.resolve();
 const recovered=badWindow.GridGameDebug;
 assert.ok(recovered,'boot corrupted saved game');
 const fixed=recovered.getState();
 assert.ok(Number.isFinite(fixed.coins)&&fixed.coins>=0,'currency recovered from NaN/null');
 assert.ok(Number.isFinite(fixed.chargeFill),'charge-fill recovered from null');
 assert.equal(fixed.blocks.length,20,'all HP blocks preserved after restoring deleted entries');
 for(let id=0;id<20;id++){
  const b=fixed.blocks[id],original=fresh.blocks[id];
  assert.equal(b.id,id,'block id stays stable');
  assert.deepEqual([b.c,b.r,b.w,b.h],[original.c,original.r,original.w,original.h],'HP block grid geometry unchanged: '+id);
  assert.ok(Number.isFinite(b.hp)&&Number.isFinite(b.max),'no invalid HP or max: '+id);
 }
 assert.equal(fixed.blocks[2].hp,fresh.blocks[2].hp,'damaged block is safely restored');
  assert.equal(fixed.blocks[8].hp,0,'missing HP block stays destroyed when a saved item occupies it');
  assert.ok(fixed.units.some(u=>u.tier===0&&u.c===9&&u.r===0),'valid item survives a corrupted block save');
 const hits=(a,b)=>a.c<b.c+b.w&&a.c+a.w>b.c&&a.r<b.r+b.h&&a.r+a.h>b.r;
 const footprints=fixed.units.map(u=>({...u,...artMeta.spans(u.tier)}));
 for(let i=0;i<footprints.length;i++){
  const a=footprints[i];
  for(let j=i+1;j<footprints.length;j++)
   assert.ok(!hits(a,footprints[j]),'restored multi-cell instruments must not overlap');
  for(const block of fixed.blocks.filter(b=>b.hp>0))
   assert.ok(!hits(a,block),'restored instrument must not overlap metal block');
 }
 recovered.scan();
 const after=recovered.getState();
 assert.ok(Number.isFinite(after.coins),'scanning high-tier instruments never breaks coins');
 assert.ok(after.blocks.every(b=>Number.isFinite(b.hp)),'scanning high-tier instruments never breaks HP');
}

 // Crowded-grid regression: merging two nonadjacent 1x1 keyboards into
 // a 2x1 synth must slide a neighbor to the vacated source, not fail.
 // All 78 cells are occupied, so no plain findFree(2x1) can work.
 const fullBoard=[];
 for(let r=0;r<6;r++)for(let c=0;c<13;c++)
  fullBoard.push({tier:r===0&&(c===1||c===3)?1:0,c,r,id:r*13+c+1});
 const emptyBlocks=fresh.blocks.map(b=>({...b,hp:0}));
 function makeCrowded(units){
  const crowdedSave={...fresh,charge:30,blocks:emptyBlocks,units,finished:false};
  const local={getItem(){return JSON.stringify(crowdedSave)},setItem:noop};
  const w={...win,addEventListener:noop};
  const m=Object.create(Math);m.random=()=>.999; // original buggy spawn always chose 1x2 guitar
  const c={...context,window:w,Math:m,localStorage:local};
  vm.createContext(c);vm.runInContext(planner,c,{filename:'drag-planner.js'});vm.runInContext(rouletteSource,c,{filename:'roulette-logic.js'});vm.runInContext(theme,c,{filename:'concert-theme.js'});vm.runInContext(game,c,{filename:'game-crowded.js'});
  return w;
 }
 const crowdedWindow=makeCrowded(fullBoard);
 for(let i=0;i<10;i++)await Promise.resolve();
 const crowded=crowdedWindow.GridGameDebug;
 const full=crowded.getState();
 assert.equal(full.units.length,78,'full-board fixture contains all occupied tiles');
 const x=full.units.findIndex(u=>u.tier===1&&u.c===1&&u.r===0);
 const y=full.units.findIndex(u=>u.tier===1&&u.c===3&&u.r===0);
 assert.ok(crowded.merge(x,y),'adjacent movement makes room for a larger merged synth');
 const compact=crowded.getState();
 assert.equal(compact.units.length,77,'two sources become one upgraded instrument');
 assert.equal(compact.units.filter(u=>u.tier===7).length,1,'merge uses keyboard level 3');
 assert.ok(crowded.getAnimations().some(a=>a.kind==='move'),'neighbor reflow uses visible smooth motion');
 const occupied=new Set();
 for(const u of compact.units){
  const span=artMeta.spans(u.tier);
  for(let dy=0;dy<span.h;dy++)for(let dx=0;dx<span.w;dx++){
   const key=(u.c+dx)+':'+(u.r+dy);
   assert.ok(!occupied.has(key),'merged cells never overlap: '+key);
   occupied.add(key);
  }
 }
 assert.equal(occupied.size,78,'no item lost and every occupied tile remains valid');
 // One free 1x1 cell is enough to spawn a smaller instrument even when a
 // randomly selected two-cell guitar cannot fit.
 const nearlyFull=fullBoard.filter(u=>!(u.c===12&&u.r===5));
 const spawnWindow=makeCrowded(nearlyFull);
 for(let i=0;i<10;i++)await Promise.resolve();
 const nearly=spawnWindow.GridGameDebug;
 assert.equal(nearly.getState().units.length,77);
 nearly.spawn();
 assert.equal(nearly.getState().units.length,78,'spawn falls back to a fitting 1x1 model');

console.log('PASS — '+artMeta.total+' tiers, smooth source-to-target merge, nearest-slot relocation and destination indicator, uncapped FPS, repaired NaN saves, nonoverlapping multi-cell sprites, mobile gameplay');
})().catch(e=>{console.error(e);process.exitCode=1;});
