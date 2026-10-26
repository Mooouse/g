/* Original hand-built high-detail music instrument sprites.
   Each instrument uses a matching aspect ratio: compact synths (square),
   portrait guitars (1×2), concert keyboards (2×1), harps (2×2). */
(()=>{'use strict';
const E=(x,y,rx,ry,f,s='#603951',sw=3)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+sw+'"/>';
const C=(x,y,r,f,s='#603951',sw=2)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+sw+'"/>';
const R=(x,y,w,h,r,f,s='#5e3e58',sw=3)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+sw+'"/>';
const P=(d,f,s='#603951',sw=3)=>'<path d="'+d+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>';
const L=(x,y,X,Y,s='#fef5d4',sw=2)=>'<path d="M'+x+' '+y+'L'+X+' '+Y+'" stroke="'+s+'" stroke-linecap="round" stroke-width="'+sw+'"/>';
const defs=`<defs>
<linearGradient id="wood" x1=".16" y1=".08" x2=".93" y2=".9"><stop stop-color="#ffe0a0"/><stop offset=".17" stop-color="#d89044"/><stop offset=".41" stop-color="#a95d2c"/><stop offset=".63" stop-color="#e6a755"/><stop offset=".84" stop-color="#985028"/><stop offset="1" stop-color="#4f2934"/></linearGradient>
<linearGradient id="red" x1=".08" y1=".03" x2=".96" y2=".96"><stop stop-color="#ffa87b"/><stop offset=".17" stop-color="#e54d37"/><stop offset=".44" stop-color="#a90e28"/><stop offset=".67" stop-color="#e3324a"/><stop offset="1" stop-color="#5a0d2d"/></linearGradient>
<linearGradient id="blue" x1=".09" y1=".01" x2=".89" y2="1"><stop stop-color="#c0f6ff"/><stop offset=".17" stop-color="#3eaddc"/><stop offset=".48" stop-color="#1863a2"/><stop offset=".72" stop-color="#2d8fc7"/><stop offset="1" stop-color="#17275f"/></linearGradient>
<linearGradient id="purple" x1=".05" y1=".04" x2="1" y2="1"><stop stop-color="#e9c5fc"/><stop offset=".21" stop-color="#9651be"/><stop offset=".51" stop-color="#5e278a"/><stop offset=".75" stop-color="#913aaf"/><stop offset="1" stop-color="#331847"/></linearGradient>
<linearGradient id="gold" x1=".12" y1=".02" x2=".84" y2="1"><stop stop-color="#fff6b9"/><stop offset=".15" stop-color="#ffc247"/><stop offset=".38" stop-color="#c77b17"/><stop offset=".55" stop-color="#ffd36e"/><stop offset=".79" stop-color="#a65b15"/><stop offset="1" stop-color="#ffdf87"/></linearGradient>
<linearGradient id="metal" x1=".06" y1="0" x2="1" y2=".9"><stop stop-color="#fffef7"/><stop offset=".25" stop-color="#b9b1c2"/><stop offset=".5" stop-color="#6b596f"/><stop offset=".73" stop-color="#f4ebed"/><stop offset="1" stop-color="#777083"/></linearGradient>
<linearGradient id="glass" x1=".08" y1=".04" x2=".98" y2=".94"><stop stop-color="#a8feff"/><stop offset=".25" stop-color="#247d9b"/><stop offset=".61" stop-color="#0e2b42"/><stop offset="1" stop-color="#11203c"/></linearGradient>
<linearGradient id="black" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#626175"/><stop offset=".3" stop-color="#1d1a2a"/><stop offset="1" stop-color="#080b1b"/></linearGradient>
<filter id="shadow" x="-30%" y="-25%" width="165%" height="165%"><feGaussianBlur in="SourceAlpha" stdDeviation="3"/><feOffset dy="4"/><feComponentTransfer><feFuncA type="linear" slope=".66"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glow"><feGaussianBlur stdDeviation="1.5"/></filter>
</defs>`;
function synth(tier,full=false,double=false){
 const palette=['#fa9726','#bd67e1','#30d6e0','#ed654e','#76e1ff','#f9b556','#d39afa','#5fd8ac'];
 const body=palette[tier%palette.length],w=full?218:166,h=double?201:full?112:143,x=(240-w)/2,y=double?13:full?55:36;
 let s='<g filter="url(#shadow)">'+R(x+1,y+2,w,h,13,'#252033','#b57442',5)
 +R(x+5,y+5,w-10,h-10,9,body,'#7d3d46',3);
 s+=P(`M${x+12} ${y+9}H${x+w-12}L${x+w-18} ${y+22}H${x+15}Z`,'#fff6d5a8','none',0);
 const top=double?61:full?50:58;
 s+=R(x+11,y+16,w-22,top-19,5,'url(#black)','#dba275',2);
 s+=C(x+31,y+31,full?13:15,'url(#gold)','#433147',3)+C(x+31,y+31,6,'#4b4d67','#f4d39d',2);
 for(let i=0;i<(full?6:4);i++){
  const kx=x+53+i*(full?21:20);
  s+=R(kx,y+22,8,22,2,['#ffe37e','#ff9bb5','#a5eeff','#a7ffce'][i%4],'#46384c',1);
  s+=L(kx+4,y+19,kx+4,y+42,'#fff8e0',1);
 }
 s+=R(x+w-51,y+20,37,24,3,'url(#glass)','#403b57',2);
 for(let k=0;k<5;k++)s+=R(x+w-45+k*6,y+34-(k*3)%12,4,5+(k*3)%12,1,'#ffda62','none',0);
 for(const row of (double?[0,1]:[0])){
  const ky=y+top+row*(h-top)/2,kwidth=w-25,kh=double?57:h-top-11;
  const nkeys=full?10:double?8:7;
  s+=R(x+11,ky,kwidth,kh,3,'#a97a62','#5b3543',2);
  for(let k=0;k<nkeys;k++){
   const kw=kwidth/nkeys;
   s+=R(x+12+k*kw,ky+2,kw-1,kh-4,2,'#fffcf0','#4f394f',1);
  }
  for(let k=0;k<nkeys-1;k++)if([0,1,3,4,5].includes(k%7)){
   const kw=kwidth/nkeys;
   s+=R(x+12+(k+.69)*kw,ky+2,kw*.55,kh*.54,2,'url(#black)','#292638',1);
  }
 }
 for(let k=0;k<3;k++)s+=C(x+13+k*10,y+h-5,2,'#ffdf86','#744d49',.6);
 return s+'</g>';
}
function stringsGuitar(tier){
 const guitarFill=['url(#red)','url(#blue)','url(#purple)','url(#wood)'][Math.abs(tier)%4];
 let s='<g filter="url(#shadow)">';
 s+=P('M62 83 C38 86 27 112 31 136 C34 156 48 168 46 183 C42 198 26 214 42 234 C64 267 125 258 139 226 C147 207 129 191 112 177 C101 160 121 150 126 133 C133 111 105 92 88 87Z',guitarFill,'#5a2d3b',6);
 s+=P('M50 204 Q43 227 63 237 Q83 247 106 226','none','#ffe8b0',2.3);
 s+=P('M39 119 Q48 95 72 95','none','#ffdcb0',2.6);
 s+=P('M86 91 C80 118 81 156 97 179','none','#f8cc8599',2.3);
 s+=P('M67 109 C92 102 110 121 107 145 C105 160 94 169 82 169 C62 166 54 153 55 139 C54 127 59 117 67 109Z','#ffd8a7','#5b3038',3);
 s+=C(81,141,21,'url(#black)','#efc478',5)+C(81,141,14,'#352339','#6a3950',1.5);
 s+=R(72,17,20,126,4,'url(#wood)','#654038',3);
 s+=P('M66 13 Q76 2 94 10 L99 32 Q93 41 73 38 L65 25Z','url(#wood)','#66403b',3);
 for(let j=0;j<6;j++){
   const yy=15+Math.floor(j/3)*11;
   s+=C(62+(j%3)*18,yy,4,'url(#gold)','#7c4e2e',1.3);
 }
 for(let k=0;k<6;k++){
  let off=k*.88;
  s+=L(77+off,24,75+k*2,217,'#fff3cc',1.15);
 }
 s+=R(60,212,42,11,2,'#453135','#d8ae6d',2);
 for(let j=0;j<11;j++)s+=L(74,50+j*7,91,50+j*7,'#f9d9a3',j===0?2:1);
 for(let j=0;j<4;j++)s+=C(100+j*6,224,2.3,'#fff2c5','#b78253',.7);
 s+=P('M108 178 Q124 189 123 211 Q115 201 112 207 Q114 190 108 178','none','#f9d487',1.4);
 return s+'</g>';
}
function ukulele(){
 let s='<g filter="url(#shadow)">';
 s+=P('M107 68 C87 70 77 84 80 101 C81 107 91 116 88 124 C83 137 66 143 67 163 C68 187 93 196 114 187 C129 181 134 167 130 151 C125 137 110 127 113 118 C119 98 133 96 130 82 C129 73 117 67 107 68Z','url(#wood)','#6a3440',6);
 s+=P('M78 157 Q87 181 103 179','none','#ffd693',2);
 s+=R(103,16,12,111,3,'url(#wood)','#713e35',2);
 s+=P('M98 8H121L124 26H100Z','url(#wood)','#694037',2.5);
 s+=C(107,121,13,'#472637','#ffe9a7',4);
 for(let k=0;k<4;k++){s+=L(105+k*2,17,103+k*3,179,'#fff3cd',1);s+=C(97+(k%2)*25,15+Math.floor(k/2)*10,3,'url(#gold)','#684041',1)}
 s+=R(91,162,38,7,3,'#5e322f','#ffdaa0',2);
 return s+'</g>';
}
function harp(tier){
 let s='<g filter="url(#shadow)">';
 s+=P('M42 194 Q45 93 71 33 Q84 6 114 18 Q163 43 194 47 Q198 63 180 72 Q143 58 122 48 Q110 138 107 208Z','url(#gold)','#874319',6);
 s+=P('M70 32 Q90 -1 122 17 Q160 37 190 42 Q202 50 186 60 Q152 48 117 34 Q103 31 97 45Z','url(#gold)','#975520',4);
 s+=P('M92 207 Q142 192 181 69 L185 195 Q151 218 92 214Z','url(#wood)','#a25d28',5);
 s+=P('M104 207L182 83L178 194Q138 208 104 207Z','#fff0bc','#855133',2);
 for(let k=0;k<13;k++){
  const x=102+k*6.1,top=51+k*.85,end=180-k*1.55;
  s+=L(x,top,end,202,'#fffbea',k%3===0?2.1:1.35);
 }
 s+=R(40,199,157,17,7,'url(#gold)','#8c441b',4);
 for(let k=0;k<8;k++)s+=C(54+k*18,208,3,'#fce2a0','#915124',.9);
 for(let k=0;k<7;k++)s+=C(77+k*17,39+k*.9,4,'url(#gold)','#a05b29',1);
 s+=P('M89 35 C89 23 99 19 105 22','none','#fff2c1',4);
 return s+'</g>';
}
function drumset(){
 let s='<g filter="url(#shadow)">';
 s+=L(53,128,30,215,'#d9c5d8',5)+L(165,128,190,215,'#d9c5d8',5);
 s+=R(35,85,62,70,12,'url(#red)','#733144',4)+R(113,85,70,70,12,'url(#blue)','#4a385f',4);
 s+=E(67,85,33,13,'#fff0cf','#624059',4)+E(148,85,36,13,'#fff0cf','#68435f',4);
 s+=C(108,165,55,'url(#purple)','#603a66',7)+C(108,165,41,'#192132','#f6e7cc',5);
 s+=C(108,165,28,'#3b335f','#8278ce',2);
 s+=L(46,32,87,92,'#fbe5b3',5)+L(174,32,132,91,'#fbe5b3',5);
 s+=E(50,38,45,9,'url(#gold)','#985625',3)+E(166,30,41,9,'url(#gold)','#965421',3);
 return s+'</g>';
}
function organ(){
 let s='<g filter="url(#shadow)">';
 s+=R(29,77,176,139,13,'url(#wood)','#633d3b',6);
 for(let k=0;k<10;k++)s+=R(39+k*16,27-(5-Math.abs(5-k))*3,12,82+(5-Math.abs(5-k))*3,3,'url(#metal)','#70687a',2);
 s+=R(42,119,149,36,5,'#fbf3e2','#82605d',3);
 for(let k=0;k<12;k++)s+=R(45+k*12,122,11.5,29,1,'#fffefa','#5d505e',.7);
 for(let k=0;k<9;k++)if(k%3!==2)s+=R(52+k*15,122,8,15,1,'url(#black)','#272333',1);
 s+=R(42,163,149,31,5,'#fff7e2','#734e4e',3);
 for(let k=0;k<12;k++)s+=R(45+k*12,166,11.5,25,1,'#fffefa','#5d505e',.7);
 return s+'</g>';
}
function orchestral(){let s=harp(12);s+='<g transform="translate(80,120) scale(.54)">'+drumset()+'</g>';return s;}
const palette=[
 {type:'synth',color:0,w:155,h:155}, {type:'synth',color:1,w:155,h:155},
 {type:'ukulele',w:220,h:200},{type:'synthwide',color:2,w:258,h:130},
 {type:'guitar',color:0,w:170,h:270},{type:'guitar',color:1,w:170,h:270},
 {type:'guitar',color:2,w:170,h:270},{type:'synthdouble',color:3,w:240,h:235},
 {type:'guitar',color:3,w:170,h:270},{type:'harp',w:230,h:230},
 {type:'guitar',color:2,w:170,h:270},{type:'synthdouble',color:5,w:245,h:234},
 {type:'harp',w:230,h:230},{type:'drums',w:230,h:230},
 {type:'organ',w:235,h:235},{type:'orchestra',w:230,h:230}
];
const svg=tier=>{
 tier=Math.max(0,Math.min(15,tier|0));const item=palette[tier];
 let body='',view='0 0 240 230';
 if(item.type==='synth'){body=synth(item.color,false,false);view='32 30 176 153';}
 if(item.type==='synthwide'){body=synth(item.color,true,false);view='8 51 224 124';}
 if(item.type==='synthdouble'){body=synth(item.color,true,true);view='8 7 224 216';}
 if(item.type==='ukulele'){body=ukulele();view='40 0 135 205';}
 if(item.type==='guitar'){body=stringsGuitar(item.color);view='15 0 140 264';}
 if(item.type==='harp'){body=harp(tier);view='27 7 179 215';}
 if(item.type==='drums'){body=drumset();view='20 19 189 208';}
 if(item.type==='organ'){body=organ();view='19 5 198 225';}
 if(item.type==='orchestra'){body=orchestral();view='22 0 202 231';}
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+item.w+'" height="'+item.h+'" viewBox="'+view+'" preserveAspectRatio="xMidYMid meet">'+defs+body+'</svg>';
};
const cache=new Map();
const src=tier=>{tier=Math.max(0,Math.min(15,tier|0));if(!cache.has(tier))cache.set(tier,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(tier)));return cache.get(tier);};
const spans=tier=>palette[Math.max(0,Math.min(15,tier|0))].type==='synthwide'?{w:2,h:1}:['guitar'].includes(palette[tier]?.type)?{w:1,h:2}:['synthdouble','harp','drums','organ','orchestra'].includes(palette[tier]?.type)?{w:2,h:2}:{w:1,h:1};
// Cropped and cleaned sprite art from the user-supplied gameplay reference video.
const videoFrames=[
 [24,38,102,105], [174,36,102,108], [316,48,114,98], [456,56,139,68],
 [36,188,83,164], [186,188,80,161], [348,187,57,169], [456,239,139,63],
 [6,384,139,133], [159,387,131,126], [305,383,136,135], [456,384,139,133]
];
const tierToVideo=[0,1,2,3,4,5,6,7,4,9,6,8,10,11,9,11];
window.GridMusicArt={
 src,svg,spans,total:16,
 atlasUrl:'sprites/video-instruments.webp',
 frameForTier(tier){return videoFrames[tierToVideo[Math.max(0,Math.min(15,tier|0))]];}
};
})();