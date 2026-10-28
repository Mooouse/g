/* Regression checks for sampled musical instruments (no browser/audio device needed). */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const audioScript=fs.readFileSync('sample-audio.js','utf8');
const artScript=fs.readFileSync('art.js','utf8');
const played=[];
const noop=()=>{};
class FakeNode {
 connect(){return this;}
 disconnect(){}
}
function param(){return {value:0,setTargetAtTime:noop,setValueAtTime:noop,linearRampToValueAtTime:noop,exponentialRampToValueAtTime:noop};}
class FakeContext{
 constructor(){this.currentTime=5;this.sampleRate=48000;this.state='running';this.destination=new FakeNode();}
 createGain(){return Object.assign(new FakeNode(),{gain:param()});}
 createDynamicsCompressor(){return Object.assign(new FakeNode(),{threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()});}
 createBuffer(channels,frames){return {getChannelData:()=>new Float32Array(frames),length:frames};}
 createBiquadFilter(){return Object.assign(new FakeNode(),{frequency:param(),Q:param()});}
 createWaveShaper(){return new FakeNode();}
 createBufferSource(){
  const s=Object.assign(new FakeNode(),{playbackRate:{value:1},buffer:null});
  s.start=t=>played.push({kind:'sample',file:s.buffer.id,time:t,rate:s.playbackRate.value});
  s.stop=noop;return s;
 }
 createOscillator(){
  const o=Object.assign(new FakeNode(),{frequency:param()});
  o.start=t=>played.push({kind:'oscillator',time:t});o.stop=noop;
  return o;
 }
 decodeAudioData(data){return Promise.resolve({id:new TextDecoder().decode(data),duration:2,length:4000});}
 resume(){this.state='running';return Promise.resolve();}
}
const testWindow={AudioContext:FakeContext},mockFetch=async path=>({ok:true,arrayBuffer:async()=>new TextEncoder().encode(path).buffer});
const sandbox={window:testWindow,fetch:mockFetch,console,Math,Number,Array,Map,Set,Float32Array,Promise};
vm.createContext(sandbox);vm.runInContext(artScript,sandbox);vm.runInContext(audioScript,sandbox);
const art=testWindow.GridMusicArt;
const samplePaths=testWindow.MelodyAudioSamplePaths;
assert.equal(Object.keys(samplePaths).length,18,'local recordings for 4 musical families');
for(const path of Object.values(samplePaths))assert.ok(fs.existsSync(path),'recorded audio exists: '+path);
const state={volume:.7,music:.46};
const engine=new testWindow.MelodySampleEngine(()=>state,()=>art);
(async()=>{
 await engine.preload();
 assert.equal(engine.diagnostics().loaded,18,'all recordings decode into AudioBuffers');
 assert.equal(engine.diagnostics().failed.length,0,'audio files load correctly');
 engine.unlock();
 const familyTiers=[['piano',0],['ukulele',2],['drum',3],['guitar',5]];
 for(const [family,tier] of familyTiers){
  engine.ctx.currentTime+=.25;
  const start=played.length;
  engine.note(tier);
  const notes=played.slice(start).filter(x=>x.kind==='sample');
  assert.ok(notes.length>0,family+' produces a recorded sample voice');
  assert.ok(notes.some(x=>x.file.includes('/'+(family==='ukulele'?'uke':family==='drum'?'drum':family)+'-')),
   family+' playback selects its own family, never the same generic oscillator');
  assert.ok(notes.every(x=>Number.isFinite(x.rate)&&x.rate>0),'finite playback pitch');
 }
 const big=[10,15,19,23];
 for(const tier of big){
  engine.ctx.currentTime+=.25;
  const before=played.length;
  engine.note(tier);
  assert.ok(played.length>before,'level 6 renders audio for '+art.approved[tier].id);
 }
 engine.ctx.currentTime+=.5;
 const before=played.length;
 engine.merge(23);
 assert.ok(played.length>before,'merging a top-tier guitar has distinct instrument sound');
 engine.ctx.currentTime+=.2;
 const muteBefore=played.length;
 engine.setPortalMuted(true);
 engine.note(3);
 assert.equal(played.length,muteBefore,'portal mute silences played audio');
 engine.setPortalMuted(false);
 state.volume=0;
 engine.levels(); // Changing volume must never throw.
 assert.equal(engine.diagnostics().loaded,18);
 console.log('PASS — 18 decoded recordings, 4 distinguishable instrument families, 24-tier playback, merging, safe volume and portal mute');
})().catch(e=>{console.error(e);process.exitCode=1;});
