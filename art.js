/* Melody Scanner pixel-art visual pack; native 64px grid, no antialiasing. */
(()=>{'use strict';
const approved=[
{id:'keyboard_1',family:'keys',level:1,w:1,h:1,file:'pixel:keyboard_1'},
{id:'keyboard_2',family:'keys',level:2,w:1,h:1,file:'pixel:keyboard_2'},
{id:'ukulele_1',family:'ukulele',level:1,w:1,h:1,file:'pixel:ukulele_1'},
{id:'drums_1',family:'drums',level:1,w:1,h:1,file:'pixel:drums_1'},
{id:'drums_2',family:'drums',level:2,w:2,h:2,file:'pixel:drums_2'},
{id:'guitar_1',family:'guitar',level:1,w:1,h:2,file:'pixel:guitar_1'},
{id:'guitar_2',family:'guitar',level:2,w:1,h:2,file:'pixel:guitar_2'}];
const next={0:1,3:4,5:6};
const R=(x,y,w,h,c)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>';
const P=(pts,c)=>'<polygon points="'+pts+'" fill="'+c+'"/>';
const DARK='#211c35',EDGE='#4b2b3b',METAL='#a8b8ca',LIGHT='#f7ecd5',WHITE='#fff7e8';
function synth(up){
 let b=R(5,15,54,38,DARK)+R(7,13,50,39,up?'#503a91':'#a84313')+R(9,12,46,37,up?'#8260d3':'#ff810e')+R(11,13,42,5,up?'#b79aff':'#ffc34c');
 b+=R(11,29,42,18,DARK)+R(13,31,38,14,'#d0c8b2');
 for(let k=0;k<7;k++)b+=R(13+k*5.4,31,4.5,12,WHITE)+R(17+k*5.4,31,1,12,'#8b8390');
 for(let k of [0,1,3,4,5])b+=R(16+k*5.4,31,3,7,DARK);
 b+=R(13,20,8,7,DARK)+R(15,21,4,5,'#ffc96a');
 for(let k=0;k<(up?4:3);k++)b+=R(27+k*7,20,5,6,DARK)+R(28+k*7,21,3,3,['#ef5b70','#f7d04a','#6de3ad','#6ebdff'][k]);
 b+=R(14,48,34,2,'#8f471c');return b;
}
function ukulele(){
 let b=R(28,4,10,24,DARK)+R(30,5,6,25,'#8c5634')+R(31,7,4,17,'#cd9464');
 for(let y=8;y<23;y+=4)b+=R(29,y,8,1,'#ead19b');
 b+=R(25,3,16,6,DARK)+R(27,4,12,5,'#b6763f');
 for(let y of [5,8]){b+=R(24,y,3,2,'#d6bb88')+R(40,y,3,2,'#d6bb88');}
 b+=P('21,26 27,21 37,21 43,27 45,34 42,41 48,47 45,55 39,60 25,60 19,55 17,48 23,41 20,34',DARK);
 b+=P('24,28 29,24 36,24 40,29 41,34 38,42 44,48 42,54 37,57 27,57 22,53 21,49 26,42 23,34','#b96d31');
 b+=P('26,29 31,26 37,28 38,36 34,43 40,49 38,54 29,55 24,51 30,42 26,35','#f1a84c');
 b+=R(29,30,6,7,DARK)+R(30,31,4,5,'#68402b')+R(28,48,9,3,DARK);
 for(let x=30;x<=35;x+=1.7)b+=R(x,8,.7,42,'#ffe4a6');return b;
}
function drums(two){
 let b='';
 const drum=(x,y,w,h)=>R(x-2,y-2,w+4,h+4,DARK)+R(x,y,w,h,'#e66d17')+R(x+3,y+3,w-6,h-5,'#faac35')+R(x-1,y-1,w+2,4,METAL)+R(x+1,y,w-2,2,LIGHT)+R(x-1,y+h-3,w+2,3,'#51566d');
 b+=R(16,31,31,26,DARK)+R(18,29,28,26,'#a8441d')+R(20,30,24,24,'#f9ebce')+R(23,34,7,3,'#fffdfa');
 b+=R(22,53,4,7,METAL)+R(41,53,4,7,METAL);
 b+=drum(two?13:34,21,two?16:14,13);if(two)b+=drum(35,21,16,13);
 b+=R(7,14,3,44,METAL)+R(5,56,7,3,DARK)+R(2,9,22,4,'#9c591d')+R(3,6,20,5,'#f4bd35')+R(6,6,14,2,'#fff0a3');
 if(two){b+=R(53,19,3,40,METAL)+R(46,16,16,4,'#ab6424')+R(45,13,17,5,'#f8c64b')+drum(4,38,13,18);}
 return b;
}
function guitar(up){
 let b='';
 const body=up?'#176acb':'#b20d41',hi=up?'#51c7ff':'#f16f87',trim=up?'#c5def9':'#f6bb55';
 // Tall native 64x128 sprite: unmistakably different body silhouettes.
 b+=R(28,4,11,61,DARK)+R(30,6,7,60,up?'#4b3950':'#74413b');
 b+=P(up?'25,3 41,3 43,11 40,17 39,21 27,21 24,16':'28,3 42,3 45,8 43,19 27,19 25,11',DARK);
 b+=P(up?'27,5 39,5 41,11 38,17 29,17 26,12':'29,5 40,5 42,10 41,17 28,17 27,10',up?'#157cda':'#ba2048');
 for(let j=0;j<3;j++){b+=R(22,7+j*5,4,2,trim)+R(42,7+j*5,4,2,trim);}
 for(let y=26;y<64;y+=5)b+=R(29,y,10,1,trim);
 const outline=up?'12,68 19,61 25,73 34,71 43,69 50,64 55,73 50,82 54,94 50,108 40,117 21,117 12,110 10,96 16,83':'13,74 20,66 28,72 41,70 49,77 53,90 52,107 44,116 21,116 11,106 10,93';
 b+=P(outline,DARK);
 const fill=up?'15,74 21,67 26,78 36,75 45,75 50,70 52,76 47,83 50,94 47,106 39,113 22,113 15,107 13,94 19,82':'16,77 22,71 29,76 41,74 47,80 50,93 49,106 42,112 23,112 15,105 13,93';
 b+=P(fill,body)+R(16,96,7,11,hi)+R(20,111,23,3,up?'#09458c':'#790a32');
 for(let y of [79,91])b+=R(25,y,21,9,DARK)+R(27,y+2,17,5,'#c9d5df')+R(28,y+3,15,3,'#596273');
 b+=R(27,102,19,5,trim)+R(44,90,4,4,trim)+R(44,97,4,4,trim);
 for(let x=30;x<=37;x+=1.4)b+=R(x,17,.6,88,'#f5d9ad');
 return b;
}
function svg(i){
 const a=approved[i]||approved[0],w=a.w*64,h=a.h*64;
 let art=i<2?synth(i===1):i===2?ukulele():i<5?drums(i===4):guitar(i===6);
 // 2x2 drum preserves detailed center artwork with 2x nearest-neighbor scaling.
 if(i===4)art='<g transform="scale(2)">'+art+'</g>';
 const frame='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" shape-rendering="crispEdges">'+art+'</svg>';
 return frame;
}
const cache=new Map();
const src=i=>{if(!cache.has(i))cache.set(i,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(i)));return cache.get(i);};
const spans=i=>{const a=approved[i];return a?{w:a.w,h:a.h}:{w:1,h:1};};
const nextTier=i=>Number.isInteger(next[i])?next[i]:null;
const spawnTiers=[0,0,0,2,2,3,3,5,5];
window.GridMusicArt={src,svg,spans,nextTier,approved,spawnTiers,total:7,style:'pixel-art'};
})();