/* Melody Scanner v5: independently authored, native-resolution PNG sprites.
   Every image lives in assets/pixel/ and is rendered with nearest-neighbor sampling. */
(()=>{'use strict';
 const root='assets/pixel/';
 const approved=[
  {id:'keyboard_1',family:'keys',level:1,w:1,h:1,file:root+'keyboard_1.png'},
  {id:'keyboard_2',family:'keys',level:2,w:1,h:1,file:root+'keyboard_2.png'},
  {id:'ukulele_1',family:'ukulele',level:1,w:1,h:1,file:root+'ukulele_1.png'},
  {id:'drums_1',family:'drums',level:1,w:1,h:1,file:root+'drums_1.png'},
  {id:'drums_2',family:'drums',level:2,w:2,h:2,file:root+'drums_2.png'},
  {id:'guitar_1',family:'guitar',level:1,w:1,h:2,file:root+'guitar_1.png'},
  {id:'guitar_2',family:'guitar',level:2,w:1,h:2,file:root+'guitar_2.png'}
 ];
 const uiAssets={
  background_tile:root+'background_tile.png',
  cell:root+'cell.png',
  metal_block:root+'metal_block.png',
  boss_block:root+'boss_block.png',
  scanner:root+'scanner.png',
  charge_button:root+'charge_button.png',
  sparkle:root+'sparkle.png'
 };
 const upgrades={0:1,3:4,5:6};
 const src=i=>approved[i]?.file||approved[0].file;
 const spans=i=>approved[i]?{w:approved[i].w,h:approved[i].h}:{w:1,h:1};
 const nextTier=i=>Number.isInteger(upgrades[i])?upgrades[i]:null;
 const spawnTiers=[0,0,0,2,2,3,3,5,5];
 window.GridMusicArt={src,spans,nextTier,spawnTiers,approved,uiAssets,total:approved.length,style:'pixel-art-images'};
})();