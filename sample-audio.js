/* Melody Scanner recorded-instrument audio engine.
 * 18 locally hosted, legally reusable recordings; no audio CDN at runtime.
 * Each instrument family has its own sample and musical articulation.
 */
(()=>{'use strict';
const NOTES={
 piano:[[60,'piano-C4.ogg'],[64,'piano-E4.ogg'],[67,'piano-G4.ogg'],[72,'piano-C5.ogg']],
 ukulele:[[60,'uke-C4.flac'],[64,'uke-E4.flac'],[67,'uke-G4.flac'],[69,'uke-A4.flac']],
 guitar:[[52,'guitar-E3.flac'],[64,'guitar-E4.flac'],[67,'guitar-G4.flac'],[72,'guitar-C5.flac']]
};
const DRUMS=['kick','snare','hat','openhat','tom','crash'];
const ASSETS=Object.fromEntries([
 ...Object.entries(NOTES).flatMap(([family,notes])=>notes.map(([midi,file])=>[family+':'+midi,'assets/audio/'+file])),
 ...DRUMS.map(name=>['drum:'+name,'assets/audio/drum-'+name+'.flac'])
]);
const LIMIT=42;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
class MelodySampleEngine {
 constructor(getState,getArt){
  this.getState=getState;this.getArt=getArt;
  this.ctx=null;this.master=null;this.instrumentBus=null;this.musicBus=null;
  this.buffers=new Map();this.loadPromise=null;this.errors=[];
  this.muted=false;this.noteStep=0;this.drumStep=0;this.bgStep=0;
  this.nextBg=0;this.active=0;this.lastByFamily={};
  this.driveCurve=null;this.noiseBuffer=null;
 }
 get state(){return this.getState();}
 ensureContext(){
  if(this.ctx)return true;
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return false;
  try {
   const a=this.ctx=new AC();
   const limiter=a.createDynamicsCompressor();
   limiter.threshold.value=-20;limiter.knee.value=20;limiter.ratio.value=5;
   limiter.attack.value=.003;limiter.release.value=.17;
   this.master=a.createGain();this.master.gain.value=.56;
   this.master.connect(limiter);limiter.connect(a.destination);
   this.instrumentBus=a.createGain();this.musicBus=a.createGain();
   this.instrumentBus.connect(this.master);this.musicBus.connect(this.master);
   const len=Math.max(1,Math.round(a.sampleRate*.2));
   this.noiseBuffer=a.createBuffer(1,len,a.sampleRate);
   const channel=this.noiseBuffer.getChannelData(0);
   for(let i=0;i<len;i++)channel[i]=Math.random()*2-1;
   this.driveCurve=new Float32Array(2048);
   for(let i=0;i<this.driveCurve.length;i++){
    const x=(i/1023.5)-1;
    this.driveCurve[i]=Math.tanh(x*3.6)/Math.tanh(3.6);
   }
   this.levels();return true;
  }catch(e){console.warn('Audio setup unavailable',e);return false;}
 }
 async preload(){
  if(this.loadPromise)return this.loadPromise;
  if(!this.ensureContext()||typeof fetch!=='function')return Promise.resolve();
  const tasks=Object.entries(ASSETS);let next=0;
  // Limit simultaneous downloads/decodes, especially on mobile browsers.
  const worker=async()=>{
   while(next<tasks.length){
    const [key,path]=tasks[next++];
    try {
     const response=await fetch(path+'?v=recordings-v1');
     if(!response.ok)throw Error('HTTP '+response.status);
     const bytes=await response.arrayBuffer();
     const buffer=await this.ctx.decodeAudioData(bytes);
     if(!buffer||!buffer.length)throw Error('Empty sound');
     this.buffers.set(key,buffer);
    }catch(e){
     this.errors.push(key);
     console.warn('Could not load musical sample',key,e);
    }
   }
  };
  this.loadPromise=Promise.all([worker(),worker(),worker(),worker()]);
  return this.loadPromise;
 }
 unlock(){
  if(!this.ensureContext())return;
  if(!this.loadPromise)this.preload();
  if(this.ctx.state==='suspended'){
   try{this.ctx.resume()?.catch?.(()=>{});}catch(e){}
  }
 }
 levels(){
  if(!this.ctx)return;
  const s=this.state,now=this.ctx.currentTime;
  const volume=clamp(Number.isFinite(s.volume)?s.volume:.7,0,1);
  const music=clamp(Number.isFinite(s.music)?s.music:.3,0,1);
  this.master.gain.setTargetAtTime(this.muted?0:volume*.76,now,.045);
  this.instrumentBus.gain.setTargetAtTime(1,now,.04);
  // Instruments must stay foreground; ambience is intentionally quiet.
  this.musicBus.gain.setTargetAtTime(music*.12,now,.06);
 }
 setPortalMuted(on){this.muted=!!on;this.levels();}
 nearest(family,midi){
  const list=NOTES[family]||NOTES.piano;
  let chosen=list[0];
  for(const item of list)if(Math.abs(item[0]-midi)<Math.abs(chosen[0]-midi))chosen=item;
  return chosen[0];
 }
 voice(family,midi,at,velocity=.2,seconds=.55,level=1){
  if(!this.ctx||this.muted||this.active>=LIMIT)return false;
  const key=family+':'+this.nearest(family,midi);
  const buffer=this.buffers.get(key);
  if(!buffer)return this.fallbackVoice(family,midi,at,velocity,seconds,level);
  const a=this.ctx,root=Number(key.split(':')[1]),rate=Math.pow(2,(midi-root)/12);
  const source=a.createBufferSource();source.buffer=buffer;source.playbackRate.value=rate;
  const filter=a.createBiquadFilter(),envelope=a.createGain();
  const now=Math.max(a.currentTime+.003,at);
  filter.type='lowpass';
  filter.frequency.value=family==='ukulele'?clamp(5000+level*280,2500,8000):
   family==='guitar'?(level>=3?clamp(2200+level*280,2800,5300):7200):7800;
  envelope.gain.setValueAtTime(.0001,now);
  envelope.gain.linearRampToValueAtTime(Math.max(.0002,velocity),now+.008);
  const maxSound=buffer.duration/Math.max(.25,rate);
  const duration=Math.max(.08,Math.min(seconds,maxSound-.012));
  const stop=now+duration;
  envelope.gain.setValueAtTime(Math.max(.0002,velocity)*.77,Math.max(now+.014,stop-.12));
  envelope.gain.exponentialRampToValueAtTime(.0001,stop);
  if(family==='guitar'&&level>=3){
   const drive=a.createWaveShaper();drive.curve=this.driveCurve;drive.oversample='2x';
   const pre=a.createGain();pre.gain.value=level>=5?1.4:.88;
   source.connect(pre);pre.connect(drive);drive.connect(filter);
  }else source.connect(filter);
  filter.connect(envelope);envelope.connect(this.instrumentBus);
  this.active++;
  source.onended=()=>{this.active=Math.max(0,this.active-1);try{source.disconnect();filter.disconnect();envelope.disconnect();}catch(e){}};
  source.start(now);source.stop(stop+.012);
  return true;
 }
 fallbackVoice(family,midi,at,velocity,seconds,level){
  // Only used while samples are still downloading or audio decoding fails.
  if(!this.ctx||this.active>=LIMIT)return false;
  const a=this.ctx,t=Math.max(a.currentTime+.003,at),osc=a.createOscillator(),g=a.createGain();
  osc.type=family==='ukulele'?'triangle':family==='guitar'?'sawtooth':'sine';
  osc.frequency.value=440*Math.pow(2,(midi-69)/12);
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(Math.max(.001,velocity*.4),t+.009);
  const end=t+Math.min(.26,seconds);
  g.gain.exponentialRampToValueAtTime(.0001,end);
  osc.connect(g);g.connect(this.instrumentBus);this.active++;
  osc.onended=()=>{this.active=Math.max(0,this.active-1);try{osc.disconnect();g.disconnect();}catch(e){}};
  osc.start(t);osc.stop(end+.005);return true;
 }
 drum(which,at,vol=.3,speed=1){
  if(!this.ctx||this.muted||this.active>=LIMIT)return;
  const buffer=this.buffers.get('drum:'+which);
  if(!buffer){this.fallbackDrum(which,at,vol);return;}
  const a=this.ctx,t=Math.max(a.currentTime+.003,at),src=a.createBufferSource(),g=a.createGain();
  src.buffer=buffer;src.playbackRate.value=speed;
  const duration=Math.min(buffer.duration/Math.max(.1,speed),which==='crash'?2.5:which==='openhat'?1.1:.8);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.003);
  g.gain.setValueAtTime(vol*.77,Math.max(t+.012,t+duration-.07));
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  src.connect(g);g.connect(this.instrumentBus);this.active++;
  src.onended=()=>{this.active=Math.max(0,this.active-1);try{src.disconnect();g.disconnect();}catch(e){}};
  src.start(t);src.stop(t+duration+.01);
 }
 fallbackDrum(which,at,vol){
  if(!this.ctx)return;
  const a=this.ctx,t=Math.max(at,a.currentTime+.003),s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();
  s.buffer=this.noiseBuffer;
  f.type=which==='kick'?'lowpass':'highpass';f.frequency.value=which==='kick'?170:which==='snare'?850:4900;
  g.gain.setValueAtTime(Math.max(.001,vol*.55),t);
  g.gain.exponentialRampToValueAtTime(.0001,t+(which==='crash'?.18:.09));
  s.connect(f);f.connect(g);g.connect(this.instrumentBus);s.start(t);s.stop(t+.2);
 }
 note(tier){
  if(!this.ctx||this.muted||this.ctx.state!=='running')return;
  const info=this.getArt().approved[tier];if(!info)return;
  const a=this.ctx,now=a.currentTime+.006;
  const family=info.family,level=clamp(info.level||1,1,6);
  // Dense boards contain many instruments: avoid stacking identical notes
  // into an unintelligible wall of sound at the same instant.
  if(now-(this.lastByFamily[family]||-1)<.044)return;
  this.lastByFamily[family]=now;
  const step=this.noteStep++;
  const melody=[0,4,7,2,9,7,4,2,0,7,4,9],pitch=melody[step%melody.length];
  if(family==='keys'){
   const root=60+pitch+(level>=5?0:0);
   this.voice('piano',root,now,.28,level>=4?.88:.43,level);
   if(level>=3)this.voice('piano',root+7,now+.035,.14,.55,level);
   if(level>=5)this.voice('piano',root+12,now+.065,.1,.7,level);
   if(level>=6)this.voice('piano',root+4,now+.09,.1,.7,level);
  }else if(family==='ukulele'){
   const root=60+([0,4,7,9][step%4]);
   // A real ukulele is plucked/strummed, not an electronic piano note.
   this.voice('ukulele',root,now,.29,.52,level);
   if(level>=2)this.voice('ukulele',root+4,now+.042,.20,.46,level);
   if(level>=3)this.voice('ukulele',root+7,now+.084,.16,.5,level);
   if(level>=5)this.voice('ukulele',root+12,now+.12,.13,.48,level);
  }else if(family==='guitar'){
   const root=52+([0,3,5,7,10][step%5]);
   // Early models play a brighter clean lead; advanced guitars play
   // lower power-chord roots through the amplifier stage.
   const tone=level>=3?root:root+12;
   const power=level>=3;
   this.voice('guitar',tone,now,power?.28:.30,power?.85:.62,level);
   if(level>=2)this.voice('guitar',tone+7,now+.038,power?.17:.16,.7,level);
   if(level>=4)this.voice('guitar',tone+12,now+.078,.13,.78,level);
   if(level>=6)this.voice('guitar',tone+4,now+.11,.10,.72,level);
  }else if(family==='drums'){
   this.drumStep++;const beat=this.drumStep;
   const kick=beat%4===1||beat%8===4;
   if(kick)this.drum('kick',now,.45,1);
   if(beat%4===3||level>=5&&beat%4===0)this.drum('snare',now+.016,.33,.98);
   this.drum('hat',now+.027,.14+level*.012,1.02);
   if(level>=2&&beat%3===0)this.drum('tom',now+.05,.18,1);
   if(level>=4&&beat%4===0)this.drum('openhat',now+.025,.18,1);
   if(level>=5&&beat%8===1)this.drum('crash',now+.01,.16,1);
   if(level>=6&&beat%2===0)this.drum('snare',now+.10,.17,1.05);
  }
 }
 merge(tier){
  if(!this.ctx||this.ctx.state!=='running')return;
  const a=this.getArt().approved[tier];if(!a)return;
  const t=this.ctx.currentTime+.009;
  if(a.family==='drums'){
   this.drum('tom',t,.35);this.drum('snare',t+.075,.22);this.drum('crash',t+.15,.23);
   return;
  }
  const family=a.family==='keys'?'piano':a.family;
  const root=family==='guitar'?57:64;
  [0,4,7,12].forEach((d,i)=>this.voice(family,root+d,t+i*.072,.20,.43,a.level));
 }
 hit(damage,boss){
  // Game metal impacts are intentionally far quieter than played instruments.
  if(!this.ctx||this.ctx.state!=='running'||this.muted)return;
  const now=this.ctx.currentTime;
  if(now-(this.lastHit||0)<.14)return;
  this.lastHit=now;
  this.fallbackVoice('piano',boss?79:86,now+.005,.035,.055,1);
 }
 breakBox(boss){
  if(!this.ctx||this.ctx.state!=='running')return;
  this.drum(boss?'crash':'hat',this.ctx.currentTime+.005,boss?.25:.10);
 }
 win(){
  if(!this.ctx||this.ctx.state!=='running')return;
  const t=this.ctx.currentTime+.01;
  [60,64,67,72].forEach((n,i)=>this.voice('piano',n,t+i*.1,.25,1.3,4));
  this.drum('crash',t+.28,.23);
 }
 // Keep background music separate and soft. No competing drum machine:
 // the actual instruments on the grid perform the main soundtrack.
 rhythm(){
  if(!this.ctx||this.ctx.state!=='running'||this.muted||this.state.music<=0)return;
  const a=this.ctx,now=a.currentTime;
  if(now<this.nextBg)return;
  this.nextBg=now+2.1;
  const chord=[[48,55,60],[45,52,57],[53,60,65],[43,50,55]][this.bgStep++%4];
  for(const note of chord){
   const t=now+.02,o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();
   o.type='sine';o.frequency.value=440*Math.pow(2,(note-69)/12);
   f.type='lowpass';f.frequency.value=680;
   g.gain.setValueAtTime(.0001,t);
   g.gain.linearRampToValueAtTime(.062,t+.25);
   g.gain.setValueAtTime(.062,t+1.35);
   g.gain.exponentialRampToValueAtTime(.0001,t+2.05);
   o.connect(f);f.connect(g);g.connect(this.musicBus);
   o.start(t);o.stop(t+2.06);
  }
 }
 diagnostics(){return {loaded:this.buffers.size,expected:Object.keys(ASSETS).length,failed:[...this.errors],active:this.active};}
}
window.MelodySampleEngine=MelodySampleEngine;
window.MelodyAudioSamplePaths=Object.freeze({...ASSETS});
})();