/* Procedural illustrated SVG instruments. Original artwork; no third-party assets. */
(() => {
'use strict';
const palette=[
['#e9be83','#9868ad'],['#f3c8a5','#ad81d2'],['#dcb4f5','#9364ce'],['#d6a889','#a56dcc'],
['#f8d491','#ba78d7'],['#b6eeeb','#6b9cdb'],['#c6a6ee','#8875de'],['#f8a9d7','#8c83f4'],
['#8eede4','#599ab8'],['#ffdc8e','#d88fbd'],['#d8b7ff','#899be4'],['#f8deae','#9b87ec']];
const M=(d,fill='url(#metal)',stroke='#563b59',sw=3)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>';
const E=(cx,cy,rx,ry,fill='url(#metal)',stroke='#61445f',sw=3)=>'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const R=(x,y,w,h,rx,fill='url(#metal)',stroke='#503755',sw=2)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const L=(x1,y1,x2,y2,stroke='#f8dfba',sw=3)=>'<path d="M'+x1+' '+y1+'L'+x2+' '+y2+'" fill="none" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linecap="round"/>';
const circ=(cx,cy,r,fill)=>'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'"/>';
const keys=(x,y,count,w=9)=>Array.from({length:count},(_,i)=>R(x+i*w,y,w-1,22,1,i%2?'#f6e9d1':'#fff7e9','#5a465b',.8)).join('');
function instrument(i){
const gold='#fce5bc', light='#fff3d7', dark='#443054';
switch(i){
case 0:return R(76,37,8,21,4,'#b788b3')+E(80,33,13,12,'#e5b88d')+M('M80 46 Q50 47 41 103 Q78 121 119 103 Q107 52 80 46Z')+M('M38 105 Q80 119 122 105 L125 115 Q80 132 35 115Z','#fff2c9')+circ(80,128,8,'#f6c786')+L(67,69,78,56,'#fff3d2',4);
case 1:return '<g transform="rotate(-18 80 83)">'+E(80,85,51,44,'#b47db9')+E(80,85,39,33,'#493854','#eac999',7)+Array.from({length:8},(_,j)=>{const a=j*Math.PI/4;return E(80+47*Math.cos(a),85+41*Math.sin(a),8,6,'#e9d2ad','#8e6899',2)}).join('')+Array.from({length:12},(_,j)=>circ(55+(j%4)*17,63+Math.floor(j/4)*17,2.6,'#d5b3e7')).join('')+'</g>';
case 2:return '<g transform="rotate(-14 80 80)">'+R(35,43,90,88,8,'#4e3459')+Array.from({length:7},(_,j)=>R(42,49+j*11,73-j*6,9,3,['#e8b68d','#f0cda4','#dabfe7','#bda7f1','#9bc9e5','#9ce0d2','#efd2ad'][j],'#755573',1.4)).join('')+L(122,41,135,115,'#f2d5a9',4)+circ(135,115,6,'#ecc2bc')+'</g>';
case 3:return '<g transform="rotate(18 80 80)">'+M('M80 34 Q68 48 74 60 Q39 50 40 74 Q41 88 57 92 Q37 118 60 130 Q79 138 80 128 Q81 138 100 130 Q123 119 103 92 Q119 88 120 74 Q121 50 86 60 Q92 48 80 34Z','#b9787d','#5b375a',4)+R(75,24,10,93,5,'#593b5d')+E(80,95,11,7,'#f8ddb5')+Array.from({length:4},(_,j)=>L(77+j*2,27,77+j*2,123,'#ffeacf',.8)).join('')+L(44,47,125,128,'#f0cfa2',3)+'</g>';
case 4:return M('M60 135 Q52 80 72 37 Q90 14 117 41 Q101 41 97 52 Q72 41 73 135Z','#f1ce91','#986da8',4)+M('M73 54 Q96 30 109 52 L109 135 L73 135Z','#4c345a')+Array.from({length:8},(_,j)=>L(77+j*4,59-j*.9,77+j*4,133,'#ffecd1',1.7)).join('')+R(52,132,68,10,5,'#e1b27a')+circ(112,41,9,'#eec7d0');
case 5:return '<g transform="rotate(-19 80 80)">'+M('M32 73 Q38 58 46 67 L79 67 Q98 54 108 67 L132 47 Q147 53 149 71 L125 84 Q110 94 103 86 L59 86 Q43 94 32 83Z','#ebc888','#825795',4)+R(38,63,17,32,5,'#e8b78d')+Array.from({length:3},(_,j)=>R(67+j*12,56,5,16,2,'#fdf1ce')).join('')+E(140,60,18,13,'#f7dfae')+'</g>';
case 6:return '<g transform="rotate(-10 80 80)">'+M('M28 50 Q76 32 123 43 L140 89 Q120 114 38 104Z','#3a2d51','#d4b6e4',4)+M('M39 56 Q76 43 116 50 L120 84 Q83 98 38 87Z','#735985','#eacbad',2)+R(36,91,86,25,3,'#fff1df')+keys(40,92,9,9)+L(45,117,38,141,'#f9d29a',5)+L(115,114,121,142,'#f9d29a',5)+'</g>';
case 7:return '<g transform="rotate(25 80 80)">'+M('M70 92 Q48 72 41 99 Q22 111 42 131 Q58 145 83 124 L98 102 Q96 81 70 92Z','#ec9dc4','#683f85',4)+R(78,18,15,98,5,'#cfa47c')+R(77,13,17,18,4,'#f4d49b')+Array.from({length:6},(_,j)=>L(81+j*1.6,17,81+j*1.6,128,'#fff2df',.8)).join('')+R(61,113,41,6,3,'#b6b0d5')+circ(61,101,6,'#f3d4dc')+'</g>';
case 8:return R(29,89,102,43,6,'#5d7496')+R(38,99,84,24,4,'#f8ebdf')+keys(40,100,9,9)+M('M41 88 L29 62 L49 35 L67 64 L80 23 L96 63 L118 42 L132 72 L116 93Z','#b8f8ed','#6a81b8',3)+Array.from({length:5},(_,j)=>L(38+j*20,76,45+j*16,47,'#fff9f0',2)).join('')+L(41,133,41,146,'#f1d8c5',4)+L(118,133,118,146,'#f1d8c5',4);
case 9:return M('M42 134 Q29 65 76 28 Q111 20 128 54 Q108 38 97 60 L117 134Z','#f5d4a4','#8061ab',4)+M('M61 127 Q49 80 76 52 Q94 40 109 60 L103 127Z','#2c3252')+Array.from({length:10},(_,j)=>L(63+j*4,62-j,65+j*4,126,'#e8e4f7',1.4)).join('')+M('M32 132 Q80 140 129 130 L127 142 L31 144Z','#f2c78f')+circ(77,30,8,'#fbefb2');
case 10:return '<g>'+Array.from({length:7},(_,j)=>R(34+j*14,34+Math.abs(3-j)*8,10,85-Math.abs(3-j)*8,4,j%2?'#e7b8d5':'#d7c5ed','#775f9e',2)).join('')+M('M26 107 Q80 95 134 107 L131 134 L29 134Z','#ab8dc3','#654776',4)+R(35,109,90,17,3,'#fef2e7')+keys(38,110,9,9)+circ(80,22,7,'#ffe2a2')+'</g>';
default:return '<g>'+M('M80 15 L97 53 L137 48 L116 85 L138 118 L96 114 L80 149 L62 115 L22 118 L43 85 L23 49 L63 53Z','#bea7f4','#f2d5b2',4)+M('M80 38 L104 81 L80 122 L55 81Z','#e3faff','#9274c4',3)+Array.from({length:8},(_,j)=>{const a=j*Math.PI/4;return L(80+45*Math.cos(a),82+45*Math.sin(a),80+55*Math.cos(a),82+55*Math.sin(a),'#ffe4ad',2)}).join('')+circ(80,81,12,'#ffecb3')+'</g>';
}}
const cache=new Map();
function svg(tier){tier=Math.max(0,Math.min(11,Number(tier)||0));const [a,b]=palette[tier];return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"><defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+a+'"/><stop offset=".56" stop-color="'+b+'"/><stop offset="1" stop-color="'+a+'"/></linearGradient><radialGradient id="halo"><stop stop-color="'+b+'" stop-opacity=".37"/><stop offset="1" stop-color="'+b+'" stop-opacity="0"/></radialGradient></defs><circle cx="80" cy="82" r="77" fill="url(#halo)"/><circle cx="80" cy="82" r="62" stroke="'+a+'" opacity=".2" fill="none" stroke-dasharray="2 8"/><g opacity=".75"><path d="M21 34l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM133 19l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="'+a+'"/><circle cx="137" cy="129" r="3" fill="'+a+'"/></g>'+instrument(tier)+'</svg>';}
function src(tier){if(!cache.has(tier))cache.set(tier,'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg(tier)));return cache.get(tier);}
window.MelodyArt={svg,src,total:12};
})();