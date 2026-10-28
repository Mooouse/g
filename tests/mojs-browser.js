/* Real browser smoke: do not trust test mocks for the mo.js UMD loading path. */
try{
 const fx=new window.MojsGameFX(
  document.getElementById('effects'),
  document.getElementById('canvas'),()=>({W:600,H:340})
 );
 if(!fx.enabled)throw Error('Real mo.js constructors missing');
 for(const [kind,args] of [
  ['merge',[180,180,4]],['prize',[300,150,6]],['block',[390,170,true]],['swap',[270,120]],['victory',[320,180]]
 ])if(!fx[kind](...args))throw Error('Could not play '+kind);
 const s=fx.debug();
 if(s.played!==5||s.poolCount>10)throw Error('Unexpected effect count '+JSON.stringify(s));
 document.getElementById('result').textContent='MOJS_READY';
}catch(error){
 document.getElementById('result').textContent='MOJS_FAILURE: '+error.message;
 console.error(error);
}
