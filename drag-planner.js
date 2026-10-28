/* Pure tile-placement planner used by previews and drop commits.
 * Every proposed move is validated against actual multi-cell footprints.
 * No game state is mutated while dragging.
 */
(()=>{'use strict';
 const overlap=(a,b)=>a.c<b.c+b.w&&a.c+a.w>b.c&&a.r<b.r+b.h&&a.r+a.h>b.r;
 const rectangle=(u,spans)=>({...u,...spans(u.tier)});
 function create({units,blocks,spans,cols=13,rows=6}){
  const liveBlocks=blocks.filter(b=>b.hp>0).map(b=>({c:b.c,r:b.r,w:b.w,h:b.h}));
  const all=units.map(u=>rectangle(u,spans));
  const origin=id=>all.find(u=>u.id===id);
  const inBounds=p=>Number.isInteger(p.c)&&Number.isInteger(p.r)&&p.c>=0&&p.r>=0&&p.c+p.w<=cols&&p.r+p.h<=rows;
  const legal=(item,other)=>inBounds(item)&&!liveBlocks.some(b=>overlap(item,b))&&!other.some(b=>overlap(item,b));
  function exact(id,c,r){
   const moving=origin(id);if(!moving)return {kind:'invalid',c,r,shifts:[]};
   const position={...moving,c,r};
   if(!inBounds(position)||liveBlocks.some(b=>overlap(b,position)))
    return {kind:'invalid',c,r,shifts:[]};
   if(moving.c===c&&moving.r===r)return {kind:'same',c,r,shifts:[]};
   const other=all.filter(u=>u.id!==id);
   const victims=other.filter(u=>overlap(u,position));
   if(!victims.length)return {kind:'move',c,r,shifts:[]};
   const fixed=other.filter(u=>!victims.includes(u));
   // Single obstructing item: a true pairwise exchange, without
   // arbitrary inventory shuffle or permanently overlapping sprites.
   if(victims.length===1){
    const victim=victims[0],shift={...victim,c:moving.c,r:moving.r};
    if(legal(shift,[...fixed,position]))
     return {kind:'swap',c,r,shifts:[{id:victim.id,c:shift.c,r:shift.r}]};
   }
   // For large footprints, several small items may occupy the landing area.
   // Reserve that footprint, then move each affected item to the original
   // location or to a nearby empty cell. Bounded search keeps pointer fast.
   if(victims.length>6)return {kind:'invalid',c,r,shifts:[]};
   const ordered=[...victims].sort((a,b)=>b.w*b.h-a.w*a.h||a.id-b.id);
   const choices=new Map();
   for(const v of ordered){
    const cells=[];
    for(let row=0;row<=rows-v.h;row++)for(let col=0;col<=cols-v.w;col++){
     const candidate={...v,c:col,r:row};
     if(!legal(candidate,[...fixed,position]))continue;
     const sourceDistance=(col-moving.c)**2+(row-moving.r)**2;
     const formerDistance=(col-v.c)**2+(row-v.r)**2;
     cells.push({c:col,r:row,score:sourceDistance*2+formerDistance*.3});
    }
    cells.sort((a,b)=>a.score-b.score||a.r-b.r||a.c-b.c);
    choices.set(v.id,cells.slice(0,14));
   }
   let budget=1800;const resolved=[];
   function assign(index){
    if(index>=ordered.length)return true;
    if(--budget<0)return false;
    const v=ordered[index];
    for(const candidate of choices.get(v.id)){
     const placed={...v,c:candidate.c,r:candidate.r};
     if(resolved.some(item=>overlap(placed,item.rect)))continue;
     resolved.push({id:v.id,c:placed.c,r:placed.r,rect:placed});
     if(assign(index+1))return true;
     resolved.pop();
    }
    return false;
   }
   if(assign(0))return {kind:'reflow',c,r,shifts:resolved.map(({id,c,r})=>({id,c,r}))};
   return {kind:'invalid',c,r,shifts:[]};
  }
  function near(id,c,r){
   const original=exact(id,c,r);
   if(original.kind!=='invalid')return original;
   const actor=origin(id);
   if(!actor)return original;
   // Snap at most one tile away when a border/gap or adjacent obstacle
   // would otherwise cause a false "No room" despite nearby free cells.
   const offsets=[[0,-1],[-1,0],[1,0],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
   for(const [dc,dr] of offsets){
    const next=exact(id,c+dc,r+dr);
    if(next.kind==='move'||next.kind==='swap'||next.kind==='reflow')
     return {...next,adjusted:true};
   }
   // If no neighboring cell fits the instrument, pick the closest genuinely
   // free footprint anywhere on the board. An existing free slot should never
   // be reported as "no room". Avoid costly distant relocation searches.
   const spots=[];
   for(let row=0;row<=rows-actor.h;row++)for(let col=0;col<=cols-actor.w;col++)
    spots.push({c:col,r:row,distance:(col-c)**2+(row-r)**2});
   spots.sort((a,b)=>a.distance-b.distance||a.r-b.r||a.c-b.c);
   const others=all.filter(u=>u.id!==id);
   for(const spot of spots){
    if(spot.c===actor.c&&spot.r===actor.r)continue;
    const candidate={...actor,c:spot.c,r:spot.r};
    if(legal(candidate,others))
     return {kind:'move',c:spot.c,r:spot.r,shifts:[],adjusted:true};
   }
   return original;
  }
  return {exact,near};
 }
 window.GridDragPlanner={create,overlap};
})();