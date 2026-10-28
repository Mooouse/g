/* Weighted instrument roulette: level rarity belongs to the instrument's family,
 * and only tiers that actually fit the board can be selected. Deterministic pure API.
 */
(()=>{'use strict';
 const WEIGHTS=Object.freeze([58,25,11,4.5,1.3,.2]);
 function available(art,findFree){
  const list=[];
  for(let tier=0;tier<art.total;tier++){
   const a=art.approved[tier];
   if(!a||!Number.isInteger(a.level)||a.level<1||a.level>6)continue;
   const pos=findFree(tier);
   if(pos&&Number.isInteger(pos.c)&&Number.isInteger(pos.r)){
    list.push({tier,level:a.level,c:pos.c,r:pos.r,family:a.family});
   }
  }
  return list;
 }
 function choose(art,findFree,rng=Math.random){
  const items=available(art,findFree);
  if(!items.length)return null;
  // Normalize over currently available levels: a blocked big instrument
  // can't be awarded and then deleted as a "prize".
  const levels=[...new Set(items.map(x=>x.level))];
  const total=levels.reduce((sum,level)=>sum+WEIGHTS[level-1],0);
  let pick=Math.max(0,Math.min(.999999999999,Number(rng())||0))*total;
  let level=levels[levels.length-1];
  for(const l of levels){pick-=WEIGHTS[l-1];if(pick<0){level=l;break;}}
  const candidates=items.filter(x=>x.level===level);
  const i=Math.min(candidates.length-1,Math.floor(Math.max(0,Math.min(.999999999,Number(rng())||0))*candidates.length));
  return {...candidates[i]};
 }
 window.MelodyRoulette={weights:WEIGHTS,choose,available};
})();