/* BEATBOUND — complete original browser game. No build tools required. */
(() => {
'use strict';
const $=id=>document.getElementById(id),ART=window.BeatArt,AUDIO=window.BeatAudio,KEY='beatbound-game-v2';
const I={
en:{
subtitle:'MAKE NOISE. BREAK THE GRID.',live:'LIVE SESSION',world:'THE SOUND LAB',level:'LEVEL',mission:'Wake up every tile. Make a masterpiece.',cleared:'CLEARED',studio:'SONIC PLAYFIELD',hintSelect:'Tap to play. Merge matching instruments. Every beat attacks nearby crystals.',combo:'GROOVE COMBO',burst:'SOUND BURST',burstTip:'Choose an instrument',energy:'BEAT ENERGY',currency:'SOUND COINS',selectedInstrument:'YOUR INSTRUMENT',attackArea:'RESONANCE RANGE',workshop:'THE WORKSHOP',summon:'DROP AN INSTRUMENT',summonHint:'A fresh sound for your stage',collection:'SOUND COLLECTION',collectHint:'Merge matching sounds to unlock new instruments.',footer:'BUILT FOR MUSIC LOVERS',controls:'STUDIO CONTROLS',settings:'SETTINGS',volume:'MASTER VOLUME',musicVolume:'BACKING TRACK',language:'LANGUAGE',replay:'REPLAY THE TUTORIAL ↗',done:'BACK TO GAME →',levelComplete:'COMPOSITION COMPLETE',amazing:'THAT SOUNDED AMAZING!',winDetail:'Every tile is alive. The next stage awaits.',nextLevel:'NEXT STAGE →',power:'Power amp',powerDesc:'More damage per wave',capacity:'Battery rack',capacityDesc:'More burst energy',tempo:'Tempo drive',tempoDesc:'Faster energy refill',max:'MAX',tier:'TIER',noCoins:'Not enough sound coins',noRoom:'Free a tile to drop a new instrument',newSound:'NEW SOUND DISCOVERED: {name}',summoned:'NEW INSTRUMENT!',selected:'{name} SELECTED',notSame:'Match the same tier to merge',crystal:'Crack this crystal with a soundwave',moreEnergy:'Energy recharges automatically',burstDone:'SOUND BURST!',moveDone:'INSTRUMENT MOVED',maxTier:'MAXIMUM TIER REACHED',victory:'STAGE CLEARED!',beats:'{n} BEATS',merges:'{n} MERGES',rangeValue:'{n}-TILE RADIUS',chapterNames:['THE FIRST SPARK','BASSLINE CITY','NEON ARCADE','MOONLIGHT STAGE','GOLDEN STUDIO','COSMIC CONCERT'],names:['Wood Claves','Brass Bell','Ocean Tambourine','Bongo Duo','Rainbow Xylophone','Golden Trumpet','Vintage Accordion','Rose Violin','Amber Guitar','Velvet Saxophone','Concert Piano','Wave Synth','Sunrise Harp','Dream Drum Kit','Cathedral Organ','Cosmic Orchestra'],coach1:'Start here: tap one of the instruments on the board. Hear its unique sound!',coach2:'Now combine two matching instruments: tap one, then tap the other (or drag one onto it).',coach3:'Hit SOUND BURST or wait for the glowing playhead. Instrument soundwaves crack the nearby crystals.',coachDone:'You got this — create your own orchestra!',pause:'MUSIC PAUSED',playing:'BEAT IS LIVE',tapAgain:'Tap it again to play or use SOUND BURST',chooseFirst:'Select an instrument first',noChanges:'Move this instrument closer to sealed tiles',daily:'NEW LEVEL',disabled:'PAUSED'},
ru:{
subtitle:'СОЗДАВАЙ РИТМ. ЛОМАЙ КЛЕТКИ.',live:'ЗВУК ВКЛЮЧЁН',world:'МУЗЫКАЛЬНАЯ СТУДИЯ',level:'УРОВЕНЬ',mission:'Открой все клетки. Создай свой музыкальный хит.',cleared:'ОТКРЫТО',studio:'МУЗЫКАЛЬНОЕ ПОЛЕ',hintSelect:'Нажимай на инструменты, соединяй одинаковые. Каждый бит разбивает кристаллы рядом.',combo:'РИТМ-КОМБО',burst:'ЗВУКОВОЙ УДАР',burstTip:'Выбери инструмент',energy:'ЭНЕРГИЯ ЗВУКА',currency:'ЗВУКОВЫЕ МОНЕТЫ',selectedInstrument:'ТВОЙ ИНСТРУМЕНТ',attackArea:'РАДИУС РЕЗОНАНСА',workshop:'МАСТЕРСКАЯ',summon:'ДОБАВИТЬ ИНСТРУМЕНТ',summonHint:'Новый звук для твоей сцены',collection:'КОЛЛЕКЦИЯ ЗВУКОВ',collectHint:'Соединяй одинаковые инструменты, чтобы открыть новые.',footer:'СДЕЛАНО С ЛЮБОВЬЮ К МУЗЫКЕ',controls:'НАСТРОЙКИ СТУДИИ',settings:'НАСТРОЙКИ',volume:'ОБЩАЯ ГРОМКОСТЬ',musicVolume:'ФОНОВАЯ МУЗЫКА',language:'ЯЗЫК',replay:'ПОВТОРИТЬ ОБУЧЕНИЕ ↗',done:'ВЕРНУТЬСЯ В ИГРУ →',levelComplete:'МЕЛОДИЯ ГОТОВА',amazing:'ЭТО БЫЛО МОЩНО!',winDetail:'Все клетки открыты! Следующая сцена уже ждёт.',nextLevel:'СЛЕДУЮЩИЙ УРОВЕНЬ →',power:'Усилитель',powerDesc:'Больше урона от волны',capacity:'Аккумулятор',capacityDesc:'Больше энергии для удара',tempo:'Ритм-машина',tempoDesc:'Энергия быстрее растёт',max:'МАКС.',tier:'РАНГ',noCoins:'Не хватает звуковых монет',noRoom:'Освободи клетку для нового инструмента',newSound:'НОВЫЙ ЗВУК: {name}',summoned:'НОВЫЙ ИНСТРУМЕНТ!',selected:'ВЫБРАН: {name}',notSame:'Соединяй инструменты одинакового ранга',crystal:'Разбей кристалл звуковой волной',moreEnergy:'Энергия восстановится сама',burstDone:'ЗВУКОВОЙ УДАР!',moveDone:'ИНСТРУМЕНТ ПЕРЕМЕЩЁН',maxTier:'ДОСТИГНУТ МАКСИМАЛЬНЫЙ РАНГ',victory:'УРОВЕНЬ ПРОЙДЕН!',beats:'{n} БИТОВ',merges:'{n} СОЕДИНЕНИЙ',rangeValue:'РАДИУС {n} КЛ.',chapterNames:['ПЕРВЫЙ ЗВУК','ГОРОД БАСОВ','НЕОНОВАЯ АРКАДА','ЛУННАЯ СЦЕНА','ЗОЛОТАЯ СТУДИЯ','КОСМИЧЕСКИЙ КОНЦЕРТ'],names:['Деревянные клавесы','Медный колокол','Морской бубен','Пара бонго','Радужный ксилофон','Золотая труба','Винтажный аккордеон','Розовая скрипка','Янтарная гитара','Бархатный саксофон','Концертный рояль','Синтезатор волн','Арфа рассвета','Барабанная установка','Кафедральный орган','Космический оркестр'],coach1:'Начни здесь: нажми на инструмент на поле и послушай его звук!',coach2:'Теперь соедини два одинаковых инструмента: нажми на один, затем на второй (или перетащи).',coach3:'Нажми «ЗВУКОВОЙ УДАР» или дождись бегущего ритма. Звуковые волны разбивают кристаллы вокруг.',coachDone:'Готово! Собирай свой музыкальный оркестр!',pause:'МУЗЫКА НА ПАУЗЕ',playing:'РИТМ ЗВУЧИТ',tapAgain:'Нажми ещё раз для звука или используй удар',chooseFirst:'Выбери инструмент',noChanges:'Передвинь инструмент ближе к кристаллам',daily:'НОВЫЙ УРОВЕНЬ',disabled:'ПАУЗА'},
es:{
subtitle:'CREA RITMOS. ROMPE LA CUADRÍCULA.',live:'SESIÓN ACTIVA',world:'LABORATORIO MUSICAL',level:'NIVEL',mission:'Despierta todas las casillas. Crea una obra maestra.',cleared:'ABIERTAS',studio:'TABLERO MUSICAL',hintSelect:'Toca y fusiona instrumentos iguales. Cada ritmo rompe cristales cercanos.',combo:'COMBO RÍTMICO',burst:'ONDA SONORA',burstTip:'Elige un instrumento',energy:'ENERGÍA MUSICAL',currency:'MONEDAS MUSICALES',selectedInstrument:'TU INSTRUMENTO',attackArea:'ALCANCE SONORO',workshop:'EL TALLER',summon:'AÑADIR INSTRUMENTO',summonHint:'Un nuevo sonido para la escena',collection:'COLECCIÓN DE SONIDOS',collectHint:'Fusiona instrumentos iguales para descubrir otros nuevos.',footer:'HECHO PARA LOS AMANTES DE LA MÚSICA',controls:'CONTROLES DEL ESTUDIO',settings:'AJUSTES',volume:'VOLUMEN PRINCIPAL',musicVolume:'MÚSICA DE FONDO',language:'IDIOMA',replay:'REPETIR TUTORIAL ↗',done:'VOLVER AL JUEGO →',levelComplete:'COMPOSICIÓN COMPLETA',amazing:'¡QUÉ BUEN RITMO!',winDetail:'¡Todas las casillas están despiertas! Te espera otra etapa.',nextLevel:'SIGUIENTE NIVEL →',power:'Amplificador',powerDesc:'Ondas de mayor daño',capacity:'Batería extra',capacityDesc:'Más energía para atacar',tempo:'Motor de ritmo',tempoDesc:'Recupera energía más rápido',max:'MÁX.',tier:'RANGO',noCoins:'No tienes suficientes monedas',noRoom:'Libera una casilla para añadir instrumentos',newSound:'NUEVO SONIDO: {name}',summoned:'¡NUEVO INSTRUMENTO!',selected:'ELEGIDO: {name}',notSame:'Solo se fusionan instrumentos del mismo rango',crystal:'Rompe este cristal con ondas sonoras',moreEnergy:'La energía se recarga automáticamente',burstDone:'¡ONDA SONORA!',moveDone:'INSTRUMENTO MOVIDO',maxTier:'RANGO MÁXIMO ALCANZADO',victory:'¡NIVEL SUPERADO!',beats:'{n} RITMOS',merges:'{n} FUSIONES',rangeValue:'ALCANCE {n}',chapterNames:['PRIMERA CHISPA','CIUDAD DEL BAJO','ARCADE NEÓN','ESCENARIO LUNAR','ESTUDIO DORADO','CONCIERTO CÓSMICO'],names:['Claves de Madera','Campana de Latón','Pandereta Marina','Bongós Dobles','Xilófono Arcoíris','Trompeta Dorada','Acordeón Vintage','Violín Rosa','Guitarra Ámbar','Saxofón de Terciopelo','Piano de Concierto','Sintetizador Wave','Arpa del Amanecer','Batería de Ensueño','Órgano de Catedral','Orquesta Cósmica'],coach1:'¡Empieza! Toca uno de los instrumentos del tablero y escucha su sonido.',coach2:'Ahora fusiona dos instrumentos iguales: toca uno y luego el otro (o arrastra).',coach3:'Pulsa ONDA SONORA o espera el ritmo automático. Las ondas rompen los cristales cercanos.',coachDone:'¡Perfecto! Construye tu orquesta musical.',pause:'MÚSICA PAUSADA',playing:'EL RITMO SUENA',tapAgain:'Tócalo de nuevo para sonar',chooseFirst:'Selecciona un instrumento',noChanges:'Acerca el instrumento a los cristales',daily:'NUEVO NIVEL',disabled:'PAUSA'}
};
const maxTier=15,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(seed)=>{let x=seed|0;return ()=>{x+=0x6d2b79f5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}};
const fresh=()=>({level:1,coins:150,highest:0,known:[0],upgrades:{power:0,capacity:0,tempo:0},board:null,energy:6,energyAt:Date.now(),volume:.65,musicVolume:.45,lang:/^ru/.test(navigator.language)?'ru':/^es/.test(navigator.language)?'es':'en',tutorial:0,finishedTutorial:false,beat:0,beats:0,merges:0,combo:0,win:false});
let S=fresh(),selected=null,active=true,started=false,sdkReady=false,store=null,lastTick=Date.now(),toastId=0,fxId=0,drag=null,dragBlockClickUntil=0,beaten=new Set(),recentFx=[],victoryScheduled=false;
const tr=(key,params={})=>{let str=I[S.lang]?.[key]??I.en[key]??key;return typeof str==='string'?str.replace(/\{(\w+)\}/g,(_,k)=>String(params[k]??'')):key;};
const name=tier=>(I[S.lang].names[tier]||I.en.names[tier]||'???');
function boardFor(level){
 const n=level<9?6:level<28?7:8,rr=rand(level*52817+123);
 const cells=Array.from({length:n*n},(_,i)=>{let hp=1+Math.floor(rr()*Math.min(6,1+Math.floor(level/6)));const rare=rr()<Math.min(.25,.07+level*.007);if(rare)hp+=1;return {hp,maxHp:hp,rare,tier:null,drop:rr()<.14};});
 const x=Math.floor(n/2),y=Math.floor(n/2),at=(a,b)=>b*n+a;
 const spots=[at(x,y),at(x-1,y),at(x,y-1),at(x-1,y-1),at(x,y+1),at(x-1,y+1)];
 spots.forEach(i=>{cells[i].hp=0;cells[i].maxHp=0;cells[i].rare=false;});
 const champion=clamp(S.highest||0,0,maxTier);
 cells[spots[0]].tier=champion;
 cells[spots[1]].tier=champion>0?champion-1:0;
 cells[spots[2]].tier=champion>0?champion-1:0;
 cells[spots[3]].tier=0;
 if(level>7)cells[spots[4]].tier=clamp(champion-2,0,maxTier);
 return {n,cells};
}
const maxEnergy=()=>6+S.upgrades.capacity*2,refreshSeconds=()=>Math.max(2.1,5-S.upgrades.tempo*.55);
function regen(){if(!S.board)return;let now=Date.now(),elapsed=(now-S.energyAt)/1000;if(!Number.isFinite(elapsed)||elapsed<0){S.energyAt=now;return;}if(S.energy>=maxEnergy()){S.energy=maxEnergy();S.energyAt=now;return;}let add=Math.floor(elapsed/refreshSeconds());if(add>0){S.energy=clamp(S.energy+add,0,maxEnergy());S.energyAt+=add*refreshSeconds()*1000;if(S.energy===maxEnergy())S.energyAt=now;}}
function pack(){return JSON.stringify(S);}
function save(){try{(store||localStorage).setItem(KEY,pack());}catch(e){console.info('Save not available',e.message);}}
function initSaved(){try{const json=(store||localStorage).getItem(KEY);if(json){const v=JSON.parse(json);if(v&&v.level>=1){let d=fresh();S={...d,...v,upgrades:{...d.upgrades,...v.upgrades}};S.level=clamp(Math.floor(Number(S.level)||1),1,999999);S.coins=clamp(Number(S.coins)||0,0,1e12);S.highest=clamp(Number(S.highest)||0,0,maxTier);S.known=Array.isArray(S.known)?S.known.filter(x=>Number.isInteger(x)&&x>=0&&x<=maxTier):[0];if(!I[S.lang])S.lang='en';S.volume=clamp(Number(S.volume)||0,0,1);S.musicVolume=clamp(Number(S.musicVolume)||0,0,1);if(!S.board||!Array.isArray(S.board.cells)||S.board.cells.length!==S.board.n*S.board.n||S.board.n<6||S.board.n>8)S.board=null;S.energy=clamp(Number(S.energy)||0,0,maxEnergy());}}}catch(e){console.warn('Save reset:',e.message);}
 if(!S.board)S.board=boardFor(S.level);
 S.energyAt=Date.now();regen();
}
function gameSDK(method){try{if(sdkReady)window.CrazyGames?.SDK?.game?.[method]?.();}catch(e){console.info('CrazyGames event:',e.message);}}
function gameplay(on){if(started===on)return;started=on;gameSDK(on?'gameplayStart':'gameplayStop');}
async function initSDK(){
 const sdk=window.CrazyGames?.SDK;
 if(sdk){try{await Promise.race([sdk.init(),new Promise((_,reject)=>setTimeout(()=>reject(Error('SDK timeout')),2600))]);sdkReady=true;try{sdk.game.loadingStart();}catch(e){}
 try{store=sdk.data?.getItem&&sdk.data?.setItem?sdk.data:localStorage;}catch(e){store=localStorage;}
 try{if(typeof sdk.game?.addEventListener==='function')sdk.game.addEventListener('mute',(v)=>AUDIO.setPortalMuted(!!v));}catch(e){}
 }catch(e){console.info('Standalone browser mode');}}
 if(!store)store=localStorage;
 initSaved();AUDIO.setVolumes(S.volume,S.musicVolume);renderAll();gameSDK('loadingStop');gameplay(true);
 if(!S.finishedTutorial)showCoach(Math.min(S.tutorial||0,2));
}
const tileTier=(i)=>S.board.cells[i]?.tier;
function tierStats(tier){return {damage:1+Math.floor(tier/3)+S.upgrades.power,range:Math.min(3,1+Math.floor(tier/4))};}
function popToast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastId);toastId=setTimeout(()=>$('toast').classList.remove('visible'),2100);}
function tutorialTick(action){
 if(S.finishedTutorial)return;
 if(S.tutorial===0&&action==='select'){S.tutorial=1;showCoach(1);}
 else if(S.tutorial===1&&action==='merge'){S.tutorial=2;showCoach(2);}
 else if(S.tutorial===2&&action==='burst'){endCoach();}
 save();
}
function showCoach(i){S.tutorial=i;$('coach').classList.remove('hidden');$('coachStep').textContent=String(i+1).padStart(2,'0')+' / 03';$('coachText').textContent=tr('coach'+(i+1));}
function endCoach(){S.finishedTutorial=true;$('coach').classList.add('hidden');save();}
function renderTranslations(){document.documentElement.lang=S.lang;document.querySelectorAll('[data-i18n]').forEach(node=>{node.textContent=tr(node.dataset.i18n);});$('languageToggle').textContent=S.lang.toUpperCase();$('langSelect').value=S.lang;$('volumeRange').value=Math.round(S.volume*100);$('volumeValue').textContent=Math.round(S.volume*100)+'%';$('musicRange').value=Math.round(S.musicVolume*100);$('musicValue').textContent=Math.round(S.musicVolume*100)+'%';if(!S.finishedTutorial)showCoach(S.tutorial);}
function renderAll(){renderTranslations();renderHud();renderBoard();renderSelection();renderShop();}
function renderHud(){
 const opened=S.board.cells.filter(c=>c.hp===0).length,percent=Math.floor(100*opened/S.board.cells.length);
 $('levelLabel').textContent=String(S.level).padStart(2,'0');
 $('zoneName').textContent=I[S.lang].chapterNames[Math.floor((S.level-1)/10)%6];
 $('progressValue').textContent=percent+'%';
 $('progressRing').style.setProperty('--p',percent+'%');
 $('coinCounter').textContent=Math.round(S.coins).toLocaleString(S.lang);
 $('comboCount').textContent='×'+(1+Math.min(25,S.combo)*.1).toFixed(1);
 $('energyText').textContent=S.energy+' / '+maxEnergy();
 $('energyFill').style.width=100*S.energy/maxEnergy()+'%';
 $('bpmBadge').textContent='♩ '+(108+Math.min(42,Math.floor(S.level/2))*2)+' BPM';
 $('burstBtn').disabled=S.win||selected===null||S.energy<=0;
 $('burstSub').textContent=selected===null?tr('burstTip'):name(tileTier(selected));
}
function renderBoard(flash=[]){
 const {n,cells}=S.board;
 $('board').style.setProperty('--count',n);
 const selectedTier=selected!==null?tileTier(selected):null;
 $('board').innerHTML=cells.map((cell,i)=>{
 let cl='tile '+(cell.hp>0?'locked':cell.tier!==null?'unlocked':'empty');
 if(cell.rare&&cell.hp>0)cl+=' special';
 if(selected===i)cl+=' selected';
 if(cell.hp===0&&cell.tier!==null&&i!==selected&&selectedTier===cell.tier)cl+=' possible';
 if(flash.includes(i))cl+=' '+(cell.hp===0?'open-fx':'hit-fx');
 if(beaten.has(i))cl+=' beat-fx';
 let html=cell.hp>0?'<span class="tile-ore"></span><span class="hp-bar"><i style="width:'+Math.round(100*cell.hp/cell.maxHp)+'%"></i></span>':cell.tier!==null?'<img alt="" draggable="false" src="'+ART.src(cell.tier)+'"><span class="tier-dot">'+(cell.tier+1)+'</span>':'';
 if(cell.hp>0&&cell.rare)html+='<span class="spark-label">✦</span>';
 return '<button type="button" class="'+cl+'" data-i="'+i+'" role="gridcell" aria-label="'+(cell.hp>0?'Crystal '+cell.hp:cell.tier!==null?name(cell.tier):'Empty')+'">'+html+'</button>';}).join('');
 $('summonBtn').disabled=S.win||S.coins<summonCost()||!cells.some(c=>c.hp===0&&c.tier===null);
 renderHud();
}
function renderSelection(){
 const idx=selected!==null?selected:S.board.cells.findIndex(c=>c.tier!==null);
 const tier=idx>=0?tileTier(idx):null;
 $('showcaseArt').src=ART.src(tier??0);
 $('showcaseArt').alt=tier===null?'':name(tier);
 $('instrumentLabel').textContent=tier===null?'—':name(tier);
 $('tierBadge').textContent=tr('tier')+' '+String((tier??0)+1).padStart(2,'0');
 $('instrumentPower').textContent='ϟ '+(tier===null?'—':tierStats(tier).damage);
 $('rangeLabel').textContent=tier===null?'—':tr('rangeValue',{n:tierStats(tier).range});
}
const summonCost=()=>30+Math.floor(S.level/7)*12;
const upgradeCosts={power:80,capacity:75,tempo:95},upgradeMax={power:12,capacity:5,tempo:5};
const upgradeCost=k=>Math.round(upgradeCosts[k]*Math.pow(1.65,S.upgrades[k]));
function renderShop(){
 $('summonCost').textContent='✦ '+summonCost();
 $('upgrades').innerHTML=[['power','ϟ','power','powerDesc'],['capacity','▣','capacity','capacityDesc'],['tempo','◷','tempo','tempoDesc']].map(([k,icon,n,d])=>{
 const lv=S.upgrades[k],max=upgradeMax[k],cost=upgradeCost(k);
 return '<button class="upgrade" data-upgrade="'+k+'" '+(lv>=max||S.coins<cost||S.win?'disabled':'')+'><span class="upg-icon">'+icon+'</span><span class="upg-copy"><strong>'+tr(n)+'</strong><small>'+tr(d)+' · '+lv+'/'+max+'</small></span><span class="upg-cost">'+(lv>=max?tr('max'):'✦ '+cost)+'</span></button>';
 }).join('');
 $('collectionCount').textContent=S.known.length+' / 16';
 $('discoveryTiles').innerHTML=Array.from({length:16},(_,i)=>'<span class="'+(S.known.includes(i)?'found':'')+'" title="'+(S.known.includes(i)?name(i):'???')+'">'+(S.known.includes(i)?'<img draggable="false" alt="'+name(i)+'" src="'+ART.src(i)+'">':'?')+'</span>').join('');
}
function startSound(){AUDIO.unlock();}
function choose(i,fromDrag=false){
 if(S.win||!active)return;const cell=S.board.cells[i],prior=selected===null?null:S.board.cells[selected];if(!cell)return;
 startSound();
 if(cell.hp>0){if(prior&&prior.tier!==null){const n=S.board.n,dist=Math.max(Math.abs(selected%n-i%n),Math.abs(Math.floor(selected/n)-Math.floor(i/n)));if(dist<=tierStats(prior.tier).range){burst();return;}}popToast(tr('crystal'));return;}
 if(cell.tier!==null){
   if(selected===i){AUDIO.play(cell.tier);popToast(tr('tapAgain'));return;}
   if(prior&&prior.tier!==null&&prior.tier===cell.tier){merge(selected,i);return;}
   selected=i;AUDIO.play(cell.tier);renderBoard();renderSelection();tutorialTick('select');popToast(tr('selected',{name:name(cell.tier)}));return;
 }
 if(prior&&prior.tier!==null){cell.tier=prior.tier;prior.tier=null;selected=i;AUDIO.play(cell.tier);renderBoard([i]);renderSelection();save();popToast(tr('moveDone'));return;}
 popToast(tr('chooseFirst'));
}
function merge(a,b){
 const v=S.board.cells[a],w=S.board.cells[b];
 if(!v||!w||v.hp!==0||w.hp!==0||v.tier===null||v.tier!==w.tier)return;
 if(v.tier>=maxTier){popToast(tr('maxTier'));return;}
 const tier=v.tier+1;v.tier=null;w.tier=tier;selected=b;S.merges++;S.coins+=9+8*tier;S.combo=Math.min(25,S.combo+2);S.highest=Math.max(S.highest,tier);
 const newTier=!S.known.includes(tier);if(newTier)S.known.push(tier);
 AUDIO.merge(tier);renderBoard([a,b]);renderSelection();renderShop();save();
 if(newTier)popToast(tr('newSound',{name:name(tier)}));else popToast(name(tier)+' · +'+(9+8*tier));
 tutorialTick('merge');
}
function damageArea(source,boost=1,visual=true){
 const tile=S.board.cells[source],tier=tile?.tier;
 if(tier===null||tier===undefined)return {damaged:0,unlocked:0};
 const {range,damage}=tierStats(tier),n=S.board.n,x=source%n,y=Math.floor(source/n),changed=[],opened=[];
 S.board.cells.forEach((c,i)=>{
   if(c.hp<=0)return;const dx=Math.abs(i%n-x),dy=Math.abs(Math.floor(i/n)-y);
   if(Math.max(dx,dy)>range)return;
   const power=Math.max(1,damage*boost-(c.rare?1:0)),before=c.hp;
   c.hp=Math.max(0,c.hp-power);
   if(c.hp<before)changed.push(i);
   if(c.hp===0){opened.push(i);S.coins+=8+Math.floor(S.level*.7)+(c.rare?12:0);
     if(c.drop&&S.board.cells.filter(p=>p.tier!==null).length<Math.floor(n*n*.57)){c.tier=0;S.known=[...new Set([...S.known,0])];}
   }
 });
 if(visual&&changed.length){pulseEffect(source);renderBoard(changed);}
 if(opened.length){S.combo=Math.min(25,S.combo+1);if(opened.length>1)AUDIO.unlockTile();}
 return {damaged:changed.length,unlocked:opened.length};
}
function pulseEffect(index){const node=$('board').querySelector('[data-i="'+index+'"]');const frame=$('board').parentElement;if(!node||!frame)return;const a=node.getBoundingClientRect(),b=frame.getBoundingClientRect();const ring=document.createElement('span');ring.className='burst-ring';ring.style.left=(a.left-b.left+a.width/2)+'px';ring.style.top=(a.top-b.top+a.height/2)+'px';$('impactFx').appendChild(ring);setTimeout(()=>ring.remove(),620);}
function burst(){
 if(S.win||!active)return;if(selected===null||tileTier(selected)===null){popToast(tr('chooseFirst'));return;}
 regen();if(S.energy<1){popToast(tr('moreEnergy'));renderHud();return;}
 startSound();S.energy--;S.energyAt=Math.min(S.energyAt,Date.now());S.beats++;let tier=tileTier(selected),result=damageArea(selected,2,true);AUDIO.play(tier);
 if(!result.damaged)popToast(tr('noChanges'));else popToast(tr('burstDone'));
 tutorialTick('burst');updateFromMove();save();
}
function summon(){
 if(S.win||!active)return;
 const available=S.board.cells.map((c,i)=>c.hp===0&&c.tier===null?i:-1).filter(i=>i>=0);
 if(!available.length){popToast(tr('noRoom'));return;}
 const cost=summonCost();if(S.coins<cost){popToast(tr('noCoins'));return;}
 S.coins-=cost;let i=available[Math.floor(rand(Date.now())()*available.length)];
 S.board.cells[i].tier=0;selected=i;startSound();AUDIO.play(0);renderBoard([i]);renderShop();renderSelection();save();popToast(tr('summoned'));
}
function upgrade(k){
 if(S.win||!active||!(k in S.upgrades))return;
 const lv=S.upgrades[k];if(lv>=upgradeMax[k])return;
 const cost=upgradeCost(k);if(S.coins<cost){popToast(tr('noCoins'));return;}
 S.coins-=cost;S.upgrades[k]++;
 if(k==='capacity')S.energy=Math.min(maxEnergy(),S.energy+2);
 AUDIO.upgrade();renderBoard();renderShop();renderSelection();save();
}
function updateFromMove(){
 renderHud();renderShop();renderSelection();
 if(!S.win&&S.board.cells.every(c=>c.hp===0)&&!victoryScheduled){victoryScheduled=true;setTimeout(win,700);}
}
function beatTick(){
 if(!S.board||S.win||!active||document.hidden)return;
 regen();
 const bpm=108+Math.min(42,Math.floor(S.level/2))*2,stepMs=60000/bpm/2;
 if(Date.now()-lastTick<stepMs)return;lastTick=Date.now();
 S.beat=(S.beat+1)%8;S.beats++;
 const beat=S.beat;const busy=S.board.cells.map((c,i)=>c.tier!==null?i:-1).filter(i=>i>=0);
 const attacking=busy.filter(i=>i%8===beat);
 let unlocked=0,damageCount=0;
 for(const i of attacking){const r=damageArea(i,1,false);unlocked+=r.unlocked;damageCount+=r.damaged;}
 const chord=[48,45,53,43][Math.floor(S.beats/16)%4]+Math.floor(S.level/10)%3;
 AUDIO.tick(beat,chord,bpm,attacking.map(i=>tileTier(i)));
 beaten=new Set(attacking);
 $('seqSteps').innerHTML=Array.from({length:8},(_,i)=>'<span class="'+(i===beat?'on':i===0||i===4?'bar-accent':'')+'"></span>').join('');
 $('beatReadout').textContent=String(beat+1).padStart(2,'0')+' / 08';
 if(damageCount){renderBoard();S.combo=Math.min(25,S.combo+unlocked*.4);}else S.combo=Math.max(0,S.combo-.07);
 if(S.beats%3===0||unlocked)save();
 updateFromMove();
}
function win(){
 if(S.win||!S.board.cells.every(c=>c.hp===0))return;
 victoryScheduled=false;S.win=true;gameplay(false);
 let award=95+Math.min(1500,S.level*20);S.coins+=award;
 $('winOverlay').classList.remove('hidden');$('rewardText').textContent='+'+award;
 $('winBeats').textContent=tr('beats',{n:S.beats});$('winMerges').textContent=tr('merges',{n:S.merges});
 AUDIO.victory();renderHud();renderShop();save();
 if(S.level%10===0)gameSDK('happytime');
}
function nextLevel(){
 S.level++;S.board=boardFor(S.level);S.energy=maxEnergy();S.energyAt=Date.now();S.beat=0;S.beats=0;S.merges=0;S.combo=0;S.win=false;selected=null;victoryScheduled=false;beaten=new Set();
 $('winOverlay').classList.add('hidden');lastTick=Date.now();renderAll();save();gameplay(true);
}
function changeLanguage(lang){if(!I[lang])return;S.lang=lang;renderAll();save();}
function openSettings(){active=false;gameplay(false);$('settingsOverlay').classList.remove('hidden');}
function closeSettings(){$('settingsOverlay').classList.add('hidden');active=true;lastTick=Date.now();if(!S.win)gameplay(true);}
function pointerTarget(evt){let b=evt.target.closest?.('[data-i]');return b?Number(b.dataset.i):-1;}
function pointerStart(e){const i=pointerTarget(e);if(i<0||S.board.cells[i].tier===null)return;drag={i,x:e.clientX,y:e.clientY,move:false};}
function pointerEnd(e){
 if(!drag)return;const d=drag;drag=null;
 if(Math.hypot(e.clientX-d.x,e.clientY-d.y)<12)return;
 const hit=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.('[data-i]');if(!hit)return;
 let dest=Number(hit.dataset.i);if(dest<0||dest===d.i)return;
 selected=d.i;dragBlockClickUntil=Date.now()+330;
 choose(dest,true);
}
function bind(){
 $('board').addEventListener('click',e=>{if(Date.now()<dragBlockClickUntil)return;let i=pointerTarget(e);if(i>=0)choose(i);});
 $('board').addEventListener('pointerdown',pointerStart);
 $('board').addEventListener('pointerup',pointerEnd);
 $('board').addEventListener('pointercancel',()=>drag=null);
 $('burstBtn').addEventListener('click',burst);
 $('summonBtn').addEventListener('click',summon);
 $('upgrades').addEventListener('click',e=>{let b=e.target.closest('[data-upgrade]');if(b)upgrade(b.dataset.upgrade);});
 $('nextLevelBtn').addEventListener('click',nextLevel);
 $('languageToggle').addEventListener('click',()=>{let seq=['en','ru','es'];changeLanguage(seq[(seq.indexOf(S.lang)+1)%3]);});
 $('langSelect').addEventListener('change',e=>changeLanguage(e.target.value));
 $('settingsToggle').addEventListener('click',openSettings);
 $('settingsClose').addEventListener('click',closeSettings);
 $('settingsDone').addEventListener('click',closeSettings);
 $('volumeRange').addEventListener('input',e=>{S.volume=+e.target.value/100;AUDIO.unlock();AUDIO.setVolumes(S.volume,S.musicVolume);$('volumeValue').textContent=e.target.value+'%';save();});
 $('musicRange').addEventListener('input',e=>{S.musicVolume=+e.target.value/100;AUDIO.unlock();AUDIO.setVolumes(S.volume,S.musicVolume);$('musicValue').textContent=e.target.value+'%';save();});
 $('replayTutorial').addEventListener('click',()=>{S.finishedTutorial=false;S.tutorial=0;closeSettings();showCoach(0);save();});
 $('helpBtn').addEventListener('click',()=>{S.finishedTutorial=false;S.tutorial=0;showCoach(0);save();});
 $('coachNext').addEventListener('click',()=>S.tutorial<2?showCoach(++S.tutorial):endCoach());
 $('coachClose').addEventListener('click',endCoach);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){gameplay(false);}else{lastTick=Date.now();if(active&&!S.win)gameplay(true);}});
 window.addEventListener('pagehide',save);
}
$('seqSteps').innerHTML=Array.from({length:8},(_,i)=>'<span class="'+(i===0?'on':'')+'"></span>').join('');
bind();initSDK();setInterval(beatTick,75);setInterval(()=>{if(!S.board||S.win)return;const before=S.energy;regen();if(before!==S.energy){renderHud();save();}},900);
window.BeatboundDebug={getSnapshot:()=>JSON.parse(pack()),unlockAll:()=>{S.board.cells.forEach(c=>c.hp=0);updateFromMove();},merge:(a,b)=>merge(a,b),burst:()=>burst(),nextLevel};
})();