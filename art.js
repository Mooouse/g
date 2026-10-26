/* Original vector instruments for the scanner-grid game. All illustrations are newly authored. */
(()=>{'use strict';
const defs='<defs><linearGradient id="gold" x2="1" y2="1"><stop stop-color="#fff1a5"/><stop offset=".36" stop-color="#f7b92b"/><stop offset=".65" stop-color="#b46d17"/><stop offset="1" stop-color="#ffdc75"/></linearGradient><linearGradient id="wood" x2="1" y2="1"><stop stop-color="#ffcc87"/><stop offset=".5" stop-color="#d77934"/><stop offset="1" stop-color="#803e29"/></linearGradient><linearGradient id="red" x2="1" y2="1"><stop stop-color="#ff9a66"/><stop offset=".29" stop-color="#ec302e"/><stop offset=".74" stop-color="#b3173c"/><stop offset="1" stop-color="#7f1044"/></linearGradient><linearGradient id="blue" x2="1" y2="1"><stop stop-color="#77f7f3"/><stop offset=".5" stop-color="#1c96d0"/><stop offset="1" stop-color="#153885"/></linearGradient><linearGradient id="purple" x2="1" y2="1"><stop stop-color="#ec9ef9"/><stop offset=".5" stop-color="#8745bc"/><stop offset="1" stop-color="#402f85"/></linearGradient><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".26" stop-color="#b5b4c5"/><stop offset=".55" stop-color="#737083"/><stop offset="1" stop-color="#e5dfed"/></linearGradient><filter id="shadow" x="-35%" y="-35%" width="170%" height="175%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.4"/><feOffset dy="3"/><feComponentTransfer><feFuncA type="linear" slope=".54"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
const P=(d,fill,stroke='#492534',sw=3)=>'<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>';
const R=(x,y,w,h,rx,fill,stroke='#553e5c',sw=2)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const C=(x,y,r,fill,stroke='#674454',sw=1)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const L=(x,y,X,Y,color='#f9e5b6',sw=2)=>'<path d="M'+x+' '+y+'L'+X+' '+Y+'" stroke="'+color+'" stroke-width="'+sw+'" stroke-linecap="round"/>';
function keys(x,y,num,w=16,height=40){let html='';for(let i=0;i<num;i++)html+=R(x+i*w,y,w-1,height,1,'#fff9ea','#524054',1.3);for(let i=0;i<num-1;i++)if([0,1,3,4,5].includes(i%7))html+=R(x+i*w+w*.64,y,7,height*.56,1,'#242632','#1d1e32',1);return html;}
function keyboard(tier,large=false,double=false){
const m=tier%3,body=['#ec942e','#9f58d0','#23bee0'][m],stroke=['#a95119','#623b9e','#186aa3'][m],w=large?178:153,x=(220-w)/2,y=large?43:61,h=double?142:100;
let o=R(x+1,y+4,w,h,13,'#2b1a34','#5d3b60',4)+R(x,y,w,h,12,body,stroke,5);
o+=R(x+8,y+8,w-16,double?37:34,6,'#363a50','#eab469',2);
o+=C(x+24,y+27,11,'url(#gold)','#524156',3);
for(let i=0;i<5;i++)o+=R(x+48+i*19,y+12,7,23,2,['#ffdf7a','#c9eafa','#f7bd87','#92f0cc','#ffb1dd'][i%5],'#503f57',1);
o+=R(x+w-44,y+13,34,16,3,'#1a7f9a','#383244',2);
o+=keys(x+9,y+(double?52:46),Math.floor((w-17)/16),16,double?39:43);
if(double)o+=keys(x+9,y+101,Math.floor((w-17)/16),16,32);
return o;
}
function guitar(tier){
const body=['url(#red)','url(#blue)','url(#purple)','url(#wood)'][tier%4];
let o=P('M104 60 C84 45 56 52 57 79 C60 95 75 99 77 112 C73 123 44 141 61 166 C83 194 142 193 159 166 C173 142 148 128 132 113 C129 97 155 93 158 77 C161 53 122 49 104 60Z',body,'#6b382e',5);
o+=P('M83 80 Q110 68 135 80 Q149 108 123 123 L90 122 Q65 104 83 80Z','#daaf65','#592e33',3);
o+=R(105,10,19,117,6,'url(#wood)','#6c362e',4)+R(101,5,27,27,5,'url(#wood)','#6a362a',3);
for(let i=0;i<4;i++){o+=C(99+(i%2)*31,10+Math.floor(i/2)*12,4,'#ffdc74','#8d682d');o+=L(109+i*3,15,109+i*3,178,'#fff9da',1);}
o+=C(114,113,18,'#4d2336','#fac97a',5)+C(114,113,10,'#311c32','#dfb079',2)+R(91,152,48,9,3,'#5c382c','#e7bc74',2);
o+=P('M62 153 Q76 164 83 159 M147 155 Q138 167 129 168','none','#ffd587',2);
for(let i=0;i<6;i++)o+=L(106,45+i*12,125,47+i*12,'#f4d09b',1);
return o;
}
function lute(){let o=P('M75 105 Q45 77 40 118 C31 159 69 177 100 153 L132 123 Q152 96 125 84 C106 77 91 99 75 105Z','url(#wood)','#753d2c',5);
o+=R(113,36,17,84,5,'url(#gold)','#925c2d',3)+R(108,31,27,20,4,'url(#wood)','#86502c',3)+C(88,125,15,'#592b29','#e9b975',4);
for(let i=0;i<4;i++)o+=L(117+i*2,41,78+i*4,145,'#ffecc0',1);
o+=R(61,139,42,7,3,'#5a2928','#dca968',2);
return o;}
function harp(){
let o=P('M40 172 L58 37 Q67 12 87 18 Q112 35 162 47 L148 64 Q111 49 91 45 L86 176Z','url(#gold)','#915225',6);
o+=P('M58 38 Q63 12 83 15 Q113 23 168 49 Q175 61 158 67 Q97 41 83 47Z','url(#gold)','#985222',4);
o+=P('M62 161 Q131 154 166 60 L164 157 Q136 172 62 173Z','url(#wood)','#925325',5);
for(let i=0;i<11;i++){const x=72+i*7.2;const endX=156-i*3.1;o+=L(x,49+i*.55,endX,161,'#fdf6d5',1.65);}
for(let i=0;i<5;i++)o+=C(72+i*21,167,4,'#ffd981','#986029',1);
return o;}
function art(tier){
const n=Math.max(0,Math.min(15,tier|0));let body;
if(n<=1)body=keyboard(n,false,false);
else if(n===2)body=lute();
else if(n===3)body=keyboard(2,true,false);
else if([4,5,6,10,11,14].includes(n))body=guitar([0,1,2,3,2,1][[4,5,6,10,11,14].indexOf(n)]);
else if([7,9,12,15].includes(n))body=keyboard((n+1)%3,true,true);
else body=harp();
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 200" width="220" height="200">'+defs+'<g filter="url(#shadow)">'+body+'</g></svg>';}
const cache=new Map();function src(tier){if(!cache.has(tier))cache.set(tier,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(art(tier)));return cache.get(tier);}
const spans=tier=>[0,1,2].includes(tier)?{w:1,h:1}:tier===3?{w:2,h:1}:[4,5,6,10,11,14].includes(tier)?{w:1,h:2}:{w:2,h:2};
window.GridMusicArt={src,svg:art,spans,total:16};
})();