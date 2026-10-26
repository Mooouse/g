/* Original procedural soundtrack: beat-locked drum rhythm and tier-dependent instruments. */
(() => {
'use strict';
class BeatAudio {
 constructor(){this.ctx=null;this.master=null;this.backing=null;this.fx=null;this.reverb=null;this.portalMuted=false;this.volume=.65;this.musicVolume=.45;this.muted=false;}
 unlock(){
   try{if(!this.ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;const a=this.ctx=new Audio();this.master=a.createGain();this.master.gain.value=.65;this.master.connect(a.destination);this.backing=a.createGain();this.fx=a.createGain();this.backing.connect(this.master);this.fx.connect(this.master);this.reverb=a.createConvolver();const b=a.createBuffer(2,Math.floor(a.sampleRate*.8),a.sampleRate);for(let ch=0;ch<2;ch++){let d=b.getChannelData(ch);for(let j=0;j<d.length;j++)d[j]=(Math.random()*2-1)*Math.pow(1-j/d.length,3)*.24;}this.reverb.buffer=b;this.reverbGain=a.createGain();this.reverbGain.gain.value=.14;this.fx.connect(this.reverb);this.reverb.connect(this.reverbGain);this.reverbGain.connect(this.master);this.setVolumes(this.volume,this.musicVolume);}
 if(this.ctx.state==='suspended')this.ctx.resume();return true;}catch(e){console.info('Audio unavailable:',e.message);return false;}
 }
 setVolumes(volume,musicVolume){this.volume=Math.max(0,Math.min(1,volume));this.musicVolume=Math.max(0,Math.min(1,musicVolume));if(!this.ctx)return;this.master.gain.setTargetAtTime(this.portalMuted||this.muted?0:this.volume,this.ctx.currentTime,.05);this.backing.gain.setTargetAtTime(this.musicVolume*.42,this.ctx.currentTime,.05);this.fx.gain.setTargetAtTime(.43,this.ctx.currentTime,.05);}
 mute(v){this.muted=!!v;this.setVolumes(this.volume,this.musicVolume);}
 setPortalMuted(v){this.portalMuted=!!v;this.setVolumes(this.volume,this.musicVolume);}
 note(midi,opts={}){if(!this.ctx)return;const a=this.ctx,now=opts.at??a.currentTime,volume=opts.volume??.22,length=opts.length??.35,tier=opts.tier??0,frequency=440*Math.pow(2,(midi-69)/12);
 const o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();o.type=['sine','triangle','triangle','sine','sine','sawtooth','square','sawtooth','triangle','sawtooth','sine','sawtooth','triangle','square','sine','sawtooth'][tier%16];o.frequency.setValueAtTime(frequency,now);
 if(tier<4)o.frequency.exponentialRampToValueAtTime(frequency*.994,now+.20);f.type='lowpass';f.frequency.value=({0:2400,1:3300,2:4000,3:2600,4:4400,5:1700,6:1300,7:2000,8:2700,9:1700,10:2800,11:2100,12:3600,13:2000,14:1200,15:3000})[tier]||2400;
 g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),now+(opts.attack??.009));g.gain.exponentialRampToValueAtTime(.0001,now+length);
 o.connect(f);f.connect(g);g.connect(opts.backing?this.backing:this.fx);o.start(now);o.stop(now+length+.03);
 if([1,3,5,8,12,15].includes(tier)){const h=a.createOscillator(),hg=a.createGain();h.type='sine';h.frequency.value=frequency*(tier===5?2:1.5);hg.gain.setValueAtTime(volume*.17,now);hg.gain.exponentialRampToValueAtTime(.0001,now+length*.8);h.connect(hg);hg.connect(opts.backing?this.backing:this.fx);h.start(now);h.stop(now+length+.02);}
 }
 noise(duration=.11,vol=.13,cut=1500,at){if(!this.ctx)return;const a=this.ctx,now=at??a.currentTime,buf=a.createBuffer(1,Math.ceil(a.sampleRate*duration),a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();src.buffer=buf;f.type='highpass';f.frequency.value=cut;g.gain.setValueAtTime(vol,now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);src.connect(f);f.connect(g);g.connect(this.backing);src.start(now);src.stop(now+duration);}
 kick(at){if(!this.ctx)return;const a=this.ctx,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(145,at);o.frequency.exponentialRampToValueAtTime(40,at+.19);g.gain.setValueAtTime(.36,at);g.gain.exponentialRampToValueAtTime(.0001,at+.22);o.connect(g);g.connect(this.backing);o.start(at);o.stop(at+.23);}
 snare(at){this.noise(.15,.18,900,at);if(this.ctx)this.note(48,{at,length:.06,volume:.11,backing:true});}
 tick(step,chord,bpm,tiers=[]){
 if(!this.ctx)return;const now=this.ctx.currentTime+.008,scale=[0,2,4,7,9,11];if(step%4===0)this.kick(now);if(step%8===4||step%8===12)this.snare(now);if(step%2===0)this.noise(.045,.055,5600,now);
 if(step%8===0)this.note(chord,{at:now,length:1.25,tier:9,volume:.12,backing:true});if(step%4===2)this.note(chord+7,{at:now,length:.27,tier:1,volume:.055,backing:true});
 for(let k=0;k<Math.min(tiers.length,5);k++){const tier=tiers[k],note=chord+12+scale[(step/2+k*2+tier)%6|0]+(tier>10?12:0);if((step+k*3)%4===0)this.note(note,{at:now,length:.22+Math.min(.6,tier*.045),tier,volume:.11/(1+k*.12)});}
 }
 play(tier=0){this.unlock();if(!this.ctx)return;const now=this.ctx.currentTime+.01,root=[60,62,65,67][Math.floor(tier/4)%4];[0,4,7,12].forEach((off,k)=>this.note(root+off+(tier%4)*2,{at:now+k*.075,length:.26+Math.min(.5,tier*.035),tier,volume:.25}));}
 merge(tier){this.play(tier);if(this.ctx){const now=this.ctx.currentTime;this.note(84, {at:now+.26,length:.75,tier,volume:.21});}}
 unlockTile(){this.unlock();if(this.ctx)this.note(76,{length:.19,volume:.09,tier:1});}
 upgrade(){this.play(8);}
 victory(){this.unlock();if(!this.ctx)return;const now=this.ctx.currentTime+.05;[60,64,67,72,76,79,84].forEach((m,i)=>this.note(m,{at:now+i*.13,length:1.05,volume:.22,tier:i+4}));}
}
window.BeatAudio=new BeatAudio();
})();