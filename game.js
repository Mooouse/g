(() => {
'use strict';
const $ = id => document.getElementById(id);
const DICTS = {
en:{
tagline:'THE MUSICAL MERGE ADVENTURE',soundOn:'THE STUDIO IS LIVE',journey:'YOUR JOURNEY',currentLevel:'CURRENT LEVEL',coins:'GOLD NOTES',power:'RESONANCE',create:'CREATE MUSIC',summon:'SUMMON INSTRUMENT',asideTip:'Merge matching instruments to create powerful soundwaves.',mainQuest:'MAIN QUEST',openAll:'Wake up the melody',objective:'Break every crystal seal to complete the composition.',unlocked:'UNLOCKED',magicBoard:'RESONANCE GRID',selectInstrument:'SELECT AN INSTRUMENT',tapTip:'TAP TWICE TO PLAY',energy:'ENERGY',playNote:'PLAY A NOTE',pulseDesc:'Deal damage to nearby seals',boardHint:'Select an instrument, merge matching ones, or move it onto a free tile.',forge:'THE FORGE',nowPlaying:'NOW PLAYING',damage:'SOUND POWER',range:'RESONANCE RANGE',upgrades:'STUDIO UPGRADES',discovered:'DISCOVERED SOUNDS',footerText:'BUILT FOR THE LOVE OF MUSIC',welcomeKicker:'A NEW MUSICAL ADVENTURE',welcomeText:'Merge enchanted instruments. Unleash beautiful melodies. Bring a silent world back to life.',beginAdventure:'BEGIN ADVENTURE',feature1:'MERGE',feature2:'CREATE',feature3:'DISCOVER',quickLesson:'A QUICK LESSON',skip:'Skip tutorial',levelComplete:'LEVEL COMPLETE',beautiful:'Beautifully played!',winText:'Your melody has awakened another part of the world.',goldNotes:'GOLD NOTES',nextLevel:'NEXT COMPOSITION',settings:'Settings',volume:'MASTER VOLUME',volumeHelp:'Music and instrument sounds',language:'LANGUAGE',howToPlay:'HOW TO PLAY',replayTutorial:'Replay tutorial',done:'DONE',tier:'TIER',tiles:'tiles',upgradePower:'Amplifier',upgradePowerDesc:'Stronger soundwaves',upgradeBattery:'Energy bank',upgradeBatteryDesc:'Increase max energy',upgradeTempo:'Rhythm engine',upgradeTempoDesc:'Faster energy recovery',maxed:'MAX',noMoney:'Not enough Gold Notes!',noSpace:'No free tile — break more seals!',summoned:'A new instrument has appeared!',selected:'Selected: {name}',mergeNeed:'Merge instruments of the same tier.',merged:'New sound discovered: {name}!',fullPower:'This instrument is already legendary!',noEnergy:'Low energy! It regenerates automatically.',hit:'Soundwave released!',move:'Instrument moved',locked:'Unlock the crystal with soundwaves.',winMoves:'{n} notes played',winMerges:'{n} merges',tutorial1Title:'Discover your first sound',tutorial1:'Select any instrument on the grid. Each one has its own musical voice.',tutorial2Title:'Merge matching instruments',tutorial2:'Tap one instrument and then another of the same tier. They combine into a stronger, more beautiful one.',tutorial3Title:'Unlock every crystal',tutorial3:'Play a note to strike nearby seals. Move instruments to free tiles and unlock every square to win.',tutorial4Title:'Grow your orchestra',tutorial4:'Earn Gold Notes, summon new instruments and upgrade your studio. Higher tiers unlock new tones.',continue:'CONTINUE',letsPlay:"LET’S PLAY",next:'NEXT',chapters:['Enchanted Woods','Velvet Skies','Moonlit Gardens','Crystal Palace','Starlight Opera','Golden Reverie'],names:['Amber Bell','Moon Tambourine','Rainbow Xylophone','Velvet Violin','Sunlit Harp','Brass Trumpet','Nocturne Piano','Aurora Guitar','Crystal Celesta','Lunar Harp','Celestial Organ','Astral Symphony'],tapToMove:'Tap a free tile to move this instrument.',maxRange:'{n} tiles',noSelection:'Select an instrument first.',tapAgain:'Tap it again or press Play a Note.'},
ru:{
tagline:'МУЗЫКАЛЬНОЕ ПРИКЛЮЧЕНИЕ',soundOn:'СТУДИЯ ОТКРЫТА',journey:'ТВОЙ ПУТЬ',currentLevel:'ТЕКУЩИЙ УРОВЕНЬ',coins:'ЗОЛОТЫЕ НОТЫ',power:'РЕЗОНАНС',create:'СОЗДАЙ МУЗЫКУ',summon:'СОЗДАТЬ ИНСТРУМЕНТ',asideTip:'Соединяй одинаковые инструменты, чтобы создавать мощные звуковые волны.',mainQuest:'ГЛАВНАЯ ЦЕЛЬ',openAll:'Разбуди мелодию',objective:'Разбей все кристаллы, чтобы завершить композицию.',unlocked:'ОТКРЫТО',magicBoard:'ПОЛЕ РЕЗОНАНСА',selectInstrument:'ВЫБЕРИ ИНСТРУМЕНТ',tapTip:'НАЖМИ ДВАЖДЫ — ИГРАТЬ',energy:'ЭНЕРГИЯ',playNote:'ИЗВЛЕЧЬ ЗВУК',pulseDesc:'Повреждает соседние кристаллы',boardHint:'Выбирай инструменты, соединяй одинаковые или перемещай на свободные клетки.',forge:'МАСТЕРСКАЯ',nowPlaying:'СЕЙЧАС ИГРАЕТ',damage:'СИЛА ЗВУКА',range:'РАДИУС ЗВУКА',upgrades:'УЛУЧШЕНИЯ СТУДИИ',discovered:'ОТКРЫТО ЗВУКОВ',footerText:'СОЗДАНО С ЛЮБОВЬЮ К МУЗЫКЕ',welcomeKicker:'НОВОЕ МУЗЫКАЛЬНОЕ ПРИКЛЮЧЕНИЕ',welcomeText:'Соединяй волшебные инструменты, сочиняй мелодии и возвращай музыку в молчаливый мир.',beginAdventure:'НАЧАТЬ ПРИКЛЮЧЕНИЕ',feature1:'СОЕДИНЯЙ',feature2:'ТВОРИ',feature3:'ОТКРЫВАЙ',quickLesson:'КОРОТКОЕ ОБУЧЕНИЕ',skip:'Пропустить обучение',levelComplete:'УРОВЕНЬ ПРОЙДЕН',beautiful:'Прекрасно сыграно!',winText:'Твоя мелодия пробудила ещё один уголок мира.',goldNotes:'ЗОЛОТЫЕ НОТЫ',nextLevel:'СЛЕДУЮЩИЙ УРОВЕНЬ',settings:'Настройки',volume:'ОБЩАЯ ГРОМКОСТЬ',volumeHelp:'Музыка и звуки инструментов',language:'ЯЗЫК',howToPlay:'КАК ИГРАТЬ',replayTutorial:'Пройти обучение снова',done:'ГОТОВО',tier:'УРОВЕНЬ',tiles:'клетки',upgradePower:'Усилитель',upgradePowerDesc:'Мощнее звуковые волны',upgradeBattery:'Аккумулятор',upgradeBatteryDesc:'Больше запас энергии',upgradeTempo:'Ритм-машина',upgradeTempoDesc:'Энергия быстрее восстанавливается',maxed:'МАКС.',noMoney:'Недостаточно золотых нот!',noSpace:'Нет свободных клеток — разбей кристаллы!',summoned:'Появился новый инструмент!',selected:'Выбран: {name}',mergeNeed:'Соединять можно инструменты одного уровня.',merged:'Открыт новый звук: {name}!',fullPower:'Этот инструмент уже легендарный!',noEnergy:'Мало энергии! Она восстановится сама.',hit:'Звуковая волна!',move:'Инструмент перемещён',locked:'Разбей кристалл звуковой волной.',winMoves:'Звуков: {n}',winMerges:'Объединений: {n}',tutorial1Title:'Открой первый звук',tutorial1:'Нажми на любой инструмент на поле. Каждый звучит по-своему.',tutorial2Title:'Соединяй одинаковые',tutorial2:'Выбери инструмент, затем другой такого же уровня. Из двух получится один более мощный и красивый.',tutorial3Title:'Открой все клетки',tutorial3:'Извлекай звуки, чтобы разбивать соседние кристаллы. Перемещай инструменты на свободные клетки.',tutorial4Title:'Собери оркестр',tutorial4:'Зарабатывай золотые ноты, создавай инструменты и улучшай студию. Новые уровни открывают новые тембры.',continue:'ПРОДОЛЖИТЬ',letsPlay:'ИГРАТЬ',next:'ДАЛЕЕ',chapters:['Зачарованный лес','Бархатные небеса','Лунный сад','Хрустальный дворец','Звёздная опера','Золотая грёза'],names:['Янтарный колокол','Лунный бубен','Радужный ксилофон','Бархатная скрипка','Солнечная арфа','Медная труба','Ночной рояль','Гитара авроры','Хрустальная челеста','Лунная арфа','Небесный орган','Астральная симфония'],tapToMove:'Нажми на свободную клетку для перемещения.',maxRange:'{n} кл.',noSelection:'Сначала выбери инструмент.',tapAgain:'Нажми ещё раз или извлеки звук.'},
es:{
tagline:'LA AVENTURA MUSICAL DE FUSIÓN',soundOn:'EL ESTUDIO ESTÁ ACTIVO',journey:'TU AVENTURA',currentLevel:'NIVEL ACTUAL',coins:'NOTAS DORADAS',power:'RESONANCIA',create:'CREA MÚSICA',summon:'INVOCAR INSTRUMENTO',asideTip:'Fusiona instrumentos iguales para crear poderosas ondas musicales.',mainQuest:'MISIÓN PRINCIPAL',openAll:'Despierta la melodía',objective:'Rompe todos los cristales para terminar la composición.',unlocked:'DESBLOQUEADAS',magicBoard:'TABLERO DE RESONANCIA',selectInstrument:'ELIGE UN INSTRUMENTO',tapTip:'DOS TOQUES PARA TOCAR',energy:'ENERGÍA',playNote:'TOCAR UNA NOTA',pulseDesc:'Daña cristales cercanos',boardHint:'Selecciona un instrumento, fusiona los iguales o muévelo a una casilla libre.',forge:'EL TALLER',nowPlaying:'SUENA AHORA',damage:'PODER SONORO',range:'ALCANCE',upgrades:'MEJORAS DEL ESTUDIO',discovered:'SONIDOS DESCUBIERTOS',footerText:'CREADO POR AMOR A LA MÚSICA',welcomeKicker:'UNA NUEVA AVENTURA MUSICAL',welcomeText:'Fusiona instrumentos mágicos. Crea melodías hermosas. Devuélvele la música a un mundo silencioso.',beginAdventure:'EMPEZAR AVENTURA',feature1:'FUSIONA',feature2:'CREA',feature3:'DESCUBRE',quickLesson:'TUTORIAL RÁPIDO',skip:'Saltar tutorial',levelComplete:'NIVEL COMPLETADO',beautiful:'¡Una hermosa melodía!',winText:'Tu melodía ha despertado otra parte del mundo.',goldNotes:'NOTAS DORADAS',nextLevel:'SIGUIENTE COMPOSICIÓN',settings:'Configuración',volume:'VOLUMEN GENERAL',volumeHelp:'Música y sonidos de instrumentos',language:'IDIOMA',howToPlay:'CÓMO JUGAR',replayTutorial:'Repetir tutorial',done:'LISTO',tier:'NIVEL',tiles:'casillas',upgradePower:'Amplificador',upgradePowerDesc:'Ondas sonoras más fuertes',upgradeBattery:'Batería',upgradeBatteryDesc:'Más energía máxima',upgradeTempo:'Motor rítmico',upgradeTempoDesc:'Recupera energía más rápido',maxed:'MÁX.',noMoney:'¡No tienes suficientes notas doradas!',noSpace:'¡Libera más casillas primero!',summoned:'¡Ha aparecido un instrumento!',selected:'Elegido: {name}',mergeNeed:'Fusiona instrumentos del mismo nivel.',merged:'¡Nuevo sonido: {name}!',fullPower:'¡Este instrumento ya es legendario!',noEnergy:'¡Poca energía! Se recupera automáticamente.',hit:'¡Onda sonora!',move:'Instrumento movido',locked:'Rompe el cristal con ondas sonoras.',winMoves:'{n} notas tocadas',winMerges:'{n} fusiones',tutorial1Title:'Descubre tu primer sonido',tutorial1:'Elige cualquier instrumento del tablero. Cada uno tiene su propia voz musical.',tutorial2Title:'Fusiona instrumentos iguales',tutorial2:'Toca un instrumento y luego otro del mismo nivel. Se convierten en uno más potente y hermoso.',tutorial3Title:'Libera todas las casillas',tutorial3:'Toca notas para romper los cristales cercanos. Mueve instrumentos a las casillas libres.',tutorial4Title:'Construye tu orquesta',tutorial4:'Gana notas doradas, invoca instrumentos y mejora tu estudio. Descubre nuevos sonidos.',continue:'CONTINUAR',letsPlay:'¡A JUGAR!',next:'SIGUIENTE',chapters:['Bosque Encantado','Cielos de Terciopelo','Jardines Lunares','Palacio de Cristal','Ópera Estelar','Ensueño Dorado'],names:['Campana de Ámbar','Pandereta Lunar','Xilófono Arcoíris','Violín de Terciopelo','Arpa Solar','Trompeta de Bronce','Piano Nocturno','Guitarra Aurora','Celesta de Cristal','Arpa Lunar','Órgano Celestial','Sinfonía Astral'],tapToMove:'Toca una casilla libre para mover el instrumento.',maxRange:'{n} casillas',noSelection:'Primero elige un instrumento.',tapAgain:'Tócalo de nuevo o reproduce una nota.'}
};
const MAX_TIER=11, KEY='melody-forge-v1';
const fresh=()=>({level:1,coins:100,upgrades:{power:0,battery:0,tempo:0},discovered:[0],starTier:0,energy:8,energyTime:Date.now(),volume:0.55,lang: /^ru/i.test(navigator.language)?'ru':/^es/i.test(navigator.language)?'es':'en',intro:false,tutorialDone:false,board:null,moves:0,merges:0});
let s=fresh(),selected=null,won=false,playing=false,step=0,toastTimer=null,gameReady=false,storage=null;
const t=(key,vars={})=>{let v=DICTS[s.lang]?.[key]??DICTS.en[key]??key;if(typeof v!=='string')return key;return v.replace(/\{(\w+)\}/g,(_,k)=>vars[k]??'');};
const instrumentName=i=>(DICTS[s.lang].names[i]||DICTS.en.names[i]);
const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
function seeded(seed){let x=(seed|0)>>>0;return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function makeBoard(level){
const n=level<5?5:level<16?6:7,rng=seeded(level*11717+923);
const board=Array.from({length:n*n},()=>({hp:1+Math.floor(rng()*Math.min(5,1+Math.floor(level/7))),tier:null,bonus:rng()<.11}));
const center=Math.floor(n/2)*n+Math.floor(n/2);
const opens=[center,center+1,center-n,center+n];
for(const i of opens){board[i].hp=0;board[i].bonus=false;}
const champion=cap(s.starTier||0,0,MAX_TIER);
board[center].tier=champion;board[center+1].tier=Math.max(0,champion-1);board[center-n].tier=Math.max(0,champion-1);
if(level>=4)board[center+n].tier=Math.max(0,champion-2);
return {n,cells:board};
}
function maxEnergy(){return 8+s.upgrades.battery*2;}
function regenSeconds(){return Math.max(2,4-s.upgrades.tempo*.5);}
function recover(){
const now=Date.now(),max=maxEnergy();s.energy=cap(s.energy,0,max);
if(s.energy>=max){s.energyTime=now;return;}
const ticks=Math.floor((now-s.energyTime)/(regenSeconds()*1000));
if(ticks>0){s.energy=Math.min(max,s.energy+ticks);s.energyTime+=ticks*regenSeconds()*1000;if(s.energy===max)s.energyTime=now;}
}
function pack(){return JSON.stringify({...s,energyTime:Date.now(),board:s.board});}
let saveTimer;
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{const val=pack();(storage||localStorage).setItem(KEY,val);}catch(e){console.warn('Save unavailable',e);}},100);}
function syncSDK(method){try{const sdk=window.CrazyGames?.SDK;if(gameReady&&sdk?.game?.[method])sdk.game[method]();}catch(e){console.debug('SDK event',e);}}
function startGameplay(){if(!playing){playing=true;syncSDK('gameplayStart');}}
function stopGameplay(){if(playing){playing=false;syncSDK('gameplayStop');}}
async function setupSDK(){
try{const sdk=window.CrazyGames?.SDK;if(sdk){
await Promise.race([sdk.init(),new Promise((_,reject)=>setTimeout(()=>reject(Error('SDK timeout')),2800))]);
gameReady=true;try{sdk.game.loadingStart();}catch(e){}
try{sdk.data.getItem(KEY);storage=sdk.data;}catch(e){storage=localStorage;}
}}catch(e){console.info('Local mode: CrazyGames SDK not active.',e.message);}
if(!storage)storage=localStorage;
try{const json=storage.getItem(KEY);if(json){const v=JSON.parse(json);if(v&&Number.isInteger(v.level)&&v.level>0){const d=fresh();s={...d,...v,upgrades:{...d.upgrades,...v.upgrades},discovered:Array.isArray(v.discovered)?v.discovered.filter(x=>Number.isInteger(x)&&x>=0&&x<=MAX_TIER):[0]};s.starTier=cap(Math.max(s.starTier||0,...s.discovered),0,MAX_TIER);s.level=cap(s.level,1,100000);s.coins=cap(Number(s.coins)||0,0,1e10);s.volume=cap(Number(s.volume)||0,0,1);if(!DICTS[s.lang])s.lang='en';if(!s.board||!Array.isArray(s.board.cells)||s.board.cells.length!==s.board.n*s.board.n||s.board.n<5||s.board.n>7)s.board=makeBoard(s.level);}}}catch(e){console.warn('Save corrupted',e);}
s.energyTime=Date.now();s.energy=cap(s.energy,0,maxEnergy());if(!s.board)s.board=makeBoard(s.level);
syncSDK('loadingStop');renderAll();
if(s.intro){$('welcomeOverlay').classList.add('hidden');if(s.tutorialDone)startGameplay();else tutorial(0);}
}
function showToast(message){const el=$('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2100);}
function renderLang(){document.documentElement.lang=s.lang;document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});$('langQuick').textContent=s.lang.toUpperCase();$('languageSelect').value=s.lang;refreshStatic();}
function refreshStatic(){const ch=Math.floor((s.level-1)/10)%DICTS.en.chapters.length;const title=DICTS[s.lang].chapters[ch];$('stageBadge').textContent=String(s.level).padStart(2,'0')+' — '+title.toUpperCase();$('leftLevel').textContent=String(s.level).padStart(2,'0');$('chapterName').textContent=title;$('chapterDetail').textContent=String((s.level-1)%10+1).padStart(2,'0')+' / 10';$('chapterProgress').style.width=(((s.level-1)%10+1)*10)+'%';$('rechargeText').textContent='+1 / '+regenSeconds()+'s';}
function renderAll(){renderLang();renderBoard();renderSelection();renderEconomy();$('volumeSlider').value=Math.round(s.volume*100);$('volumeLabel').textContent=Math.round(s.volume*100)+'%';$('welcomeInstrument').innerHTML='<img alt="" src="'+MelodyArt.src(4)+'">';}
function img(tier){return '<img draggable="false" alt="'+instrumentName(tier)+'" src="'+MelodyArt.src(tier)+'">';}
function renderBoard(changed=[]){
const {n,cells}=s.board;$('board').style.setProperty('--cols',n);
let unlocked=0;
$('board').innerHTML=cells.map((c,i)=>{if(c.hp===0)unlocked++;const classes=['cell',c.hp>0?'sealed':(c.tier===null?'empty':'open')];if(i===selected)classes.push('selected');if(selected!==null&&c.tier!==null&&s.board.cells[selected]?.tier===c.tier&&selected!==i)classes.push('merge-target');if(changed.includes(i))classes.push(c.hp===0?'revealed':'shaking');const face=c.hp>0?'<span class="cell-seal-top">✦</span><span class="crystal"></span><span class="seal-hp">'+c.hp+'</span>':c.tier===null?'':img(c.tier)+'<span class="cell-rank">✦ '+(c.tier+1)+'</span>';
return '<button class="'+classes.join(' ')+'" data-cell="'+i+'" role="gridcell" aria-label="'+(c.hp>0?'Crystal '+c.hp:c.tier===null?'Empty tile':instrumentName(c.tier))+'">'+face+'</button>';}).join('');
$('openCount').textContent=unlocked+'/'+cells.length;$('boardRank').textContent='♩ BPM '+Math.round(96+Math.min(s.level,25)*1.5);$('boardStatus').textContent=selected===null?t('selectInstrument'):instrumentName(cells[selected]?.tier||0).toUpperCase();
$('pulseButton').disabled=won||s.energy<1||selected===null;$('summonButton').disabled=won||s.coins<summonCost()||!cells.some(c=>c.hp===0&&c.tier===null);
}
function renderSelection(){
const c=selected!==null?s.board.cells[selected]:null;const tier=c?.tier;
$('selectedArt').innerHTML=tier===null||tier===undefined?'<span class="idle-note">♫</span>':img(tier);
$('selectedName').textContent=tier===null||tier===undefined?'—':instrumentName(tier);
$('selectedTier').textContent=tier===null||tier===undefined?t('selectInstrument'):t('tier')+' '+(tier+1);
$('selectedDamage').textContent=tier===null||tier===undefined?'—':String(damage(tier));
$('selectedRange').textContent=tier===null||tier===undefined?'—':t('maxRange',{n:range(tier)});
}
function upgradeCost(type){const lv=s.upgrades[type];return Math.round([65,70,80][['power','battery','tempo'].indexOf(type)]*Math.pow(1.75,lv));}
function summonCost(){return 35+Math.floor(s.level/8)*8;}
function renderEconomy(){
$('coinsValue').textContent=s.coins.toLocaleString(s.lang);$('powerValue').textContent=(1+s.upgrades.power)+'×';$('summonPrice').textContent='✦ '+summonCost();
$('energyNum').textContent=s.energy+' / '+maxEnergy();$('energyPips').style.setProperty('--pips',maxEnergy());$('energyPips').innerHTML=Array.from({length:maxEnergy()},(_,i)=>'<span class="'+(i<s.energy?'filled':'')+'"></span>').join('');
$('upgrades').innerHTML=[['power','ϟ','upgradePower','upgradePowerDesc'],['battery','♢','upgradeBattery','upgradeBatteryDesc'],['tempo','◷','upgradeTempo','upgradeTempoDesc']].map(([kind,icon,name,description])=>{const lvl=s.upgrades[kind],max=kind==='power'?9:kind==='battery'?4:4;return '<button class="upgrade" data-upgrade="'+kind+'" '+(lvl>=max||s.coins<upgradeCost(kind)?'disabled':'')+'><span class="upgrade-icon">'+icon+'</span><span class="upgrade-copy"><strong>'+t(name)+'</strong><small>'+t(description)+' · '+(lvl+'/'+max)+'</small></span><span class="upgrade-cost">'+(lvl>=max?t('maxed'):'✦ '+upgradeCost(kind))+'</span></button>';}).join('');
$('collectionCount').innerHTML=s.discovered.length+' <span>/ 12</span>';$('collectionDots').innerHTML=Array.from({length:12},(_,i)=>'<span title="'+(s.discovered.includes(i)?instrumentName(i):'???')+'" class="'+(s.discovered.includes(i)?'found':'')+'"></span>').join('');
}
function damage(tier){return 1+Math.floor(tier/2)+s.upgrades.power;}
function range(tier){return Math.min(3,1+Math.floor(tier/3));}
function choose(i){
if(won)return;const cell=s.board.cells[i],prior=selected===null?null:s.board.cells[selected];
if(cell.hp>0){if(prior&&prior.tier!==null){const n=s.board.n,x=i%n,y=Math.floor(i/n),a=selected%n,b=Math.floor(selected/n);if(Math.max(Math.abs(x-a),Math.abs(y-b))<=range(prior.tier)){playNote();return;}}showToast(t('locked'));return;}
if(cell.tier!==null){
if(selected===i){playNote();return;}
if(prior&&prior.tier!==null&&prior.tier===cell.tier){merge(selected,i);return;}
selected=i;audio.unlock();audio.playArpeggio(cell.tier);renderBoard();renderSelection();showToast(t('selected',{name:instrumentName(cell.tier)}));return;}
if(prior&&prior.tier!==null){cell.tier=prior.tier;prior.tier=null;selected=i;audio.playMove();renderBoard([i,selected]);renderSelection();save();showToast(t('move'));}
else showToast(t('noSelection'));
}
function merge(a,b){
const ca=s.board.cells[a],cb=s.board.cells[b];if(!ca||!cb||ca.tier===null||cb.tier!==ca.tier)return;
if(ca.tier>=MAX_TIER){showToast(t('fullPower'));return;}
const tier=ca.tier+1;ca.tier=null;cb.tier=tier;selected=b;s.merges++;
if(!s.discovered.includes(tier))s.discovered.push(tier);s.starTier=Math.max(s.starTier||0,tier);
s.coins+=12+tier*7;audio.playMerge(tier);renderBoard([a,b]);renderSelection();renderEconomy();save();showToast(t('merged',{name:instrumentName(tier)}));}
function playNote(){
if(won)return;if(selected===null||s.board.cells[selected]?.tier===null){showToast(t('noSelection'));return;}
recover();if(s.energy<1){showToast(t('noEnergy'));renderEconomy();return;}
const source=s.board.cells[selected],tier=source.tier,n=s.board.n,ox=selected%n,oy=Math.floor(selected/n),rng=range(tier),power=damage(tier),changed=[];
s.energy--;s.moves++;s.coins+=1+tier;
s.board.cells.forEach((c,i)=>{if(c.hp<=0)return;const dx=Math.abs(i%n-ox),dy=Math.abs(Math.floor(i/n)-oy);if(Math.max(dx,dy)<=rng){c.hp=Math.max(0,c.hp-power);changed.push(i);if(c.hp===0){s.coins+=5+Math.min(s.level,15);if(c.bonus){c.tier=(s.level>12&&seeded(s.level*61+i)()>.8)?1:0;s.discovered.push(c.tier);s.discovered=[...new Set(s.discovered)];}c.bonus=false;}}});
audio.playArpeggio(tier,true);renderBoard(changed);renderEconomy();
const cleared=s.board.cells.every(c=>c.hp===0);save();
if(cleared){setTimeout(winLevel,620);}else if(changed.length===0)showToast(t('tapToMove'));
}
function summon(){
if(won)return;const cells=s.board.cells,empty=cells.map((c,i)=>c.hp===0&&c.tier===null?i:-1).filter(i=>i>=0);
if(!empty.length){showToast(t('noSpace'));return;}const cost=summonCost();if(s.coins<cost){showToast(t('noMoney'));return;}
s.coins-=cost;const i=empty[Math.floor(seeded(s.level*999+s.moves*37+s.merges*71+Date.now())()*empty.length)];cells[i].tier=0;selected=i;audio.playArpeggio(0);renderBoard([i]);renderSelection();renderEconomy();save();showToast(t('summoned'));
}
function upgrade(kind){
const max=kind==='power'?9:4;if(!(kind in s.upgrades)||s.upgrades[kind]>=max)return;
const cost=upgradeCost(kind);if(s.coins<cost){showToast(t('noMoney'));return;}
s.coins-=cost;s.upgrades[kind]++;if(kind==='battery')s.energy=Math.min(maxEnergy(),s.energy+2);
audio.playUpgrade();renderBoard();renderSelection();renderEconomy();refreshStatic();save();
}
function winLevel(){
if(won)return;won=true;stopGameplay();
const reward=75+Math.floor(s.level*14);s.coins+=reward;audio.playVictory();
$('winCoins').textContent='+'+reward;$('winMoves').textContent=t('winMoves',{n:s.moves});$('winMerges').textContent=t('winMerges',{n:s.merges});$('winOverlay').classList.remove('hidden');renderEconomy();save();
if(s.level%10===0)syncSDK('happytime');
}
function nextLevel(){s.level++;s.board=makeBoard(s.level);s.moves=0;s.merges=0;s.energy=maxEnergy();s.energyTime=Date.now();selected=null;won=false;$('winOverlay').classList.add('hidden');renderAll();startGameplay();save();}
function language(lang){if(!DICTS[lang])return;s.lang=lang;renderAll();if(!$('tutorialOverlay').classList.contains('hidden'))tutorial(step);save();}
function tutorial(i){step=i;stopGameplay();$('welcomeOverlay').classList.add('hidden');$('settingsOverlay').classList.add('hidden');$('tutorialOverlay').classList.remove('hidden');$('tutorialTitle').textContent=t('tutorial'+(i+1)+'Title');$('tutorialText').textContent=t('tutorial'+(i+1));$('tutorialPips').innerHTML=Array.from({length:4},(_,k)=>'<span class="'+(k===i?'active':'')+'"></span>').join('');$('tutorialButtonText').textContent=i===3?t('letsPlay'):t('next');const art=MelodyArt.src(i===1?0:i===3?8:4);$('tutorialVisual').innerHTML=i===1?'<span class="tutorial-tile">'+img(0)+'</span><span class="tutorial-symbol">＋</span><span class="tutorial-tile">'+img(0)+'</span>':i===2?'<span class="tutorial-tile"><span class="crystal"></span></span><span class="tutorial-symbol">♫</span><span class="tutorial-tile">'+img(4)+'</span>':'<span class="tutorial-tile"><img alt="" src="'+art+'"></span>';}
function tutorialFinish(){s.tutorialDone=true;$('tutorialOverlay').classList.add('hidden');startGameplay();audio.start();save();}
function openSettings(){stopGameplay();$('settingsOverlay').classList.remove('hidden');}
function closeSettings(){$('settingsOverlay').classList.add('hidden');if($('tutorialOverlay').classList.contains('hidden')&&$('winOverlay').classList.contains('hidden')&&$('welcomeOverlay').classList.contains('hidden'))startGameplay();audio.start();}
class Music {
constructor(){this.ctx=null;this.master=null;this.timer=null;this.seq=0;}
unlock(){try{if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=s.volume*.25;this.master.connect(this.ctx.destination);}if(this.ctx.state==='suspended')this.ctx.resume();}catch(e){console.warn('Audio unavailable',e);}}
volume(){if(this.master)this.master.gain.setTargetAtTime(s.volume*.25,this.ctx.currentTime,.045);}
tone(midi,time,duration=.26,tier=0,volume=.3){
if(!this.ctx||!this.master||s.volume<=0)return;const ctx=this.ctx;const base=440*Math.pow(2,(midi-69)/12);
const osc=ctx.createOscillator(),g=ctx.createGain(),filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=tier>=6?2100:3600;
osc.type=([0,2,5,9].includes(tier)?'sine':([1,3,4,7].includes(tier)?'triangle':tier===10?'square':'sawtooth'));osc.frequency.setValueAtTime(base,time);
if([0,2,5].includes(tier)){osc.frequency.exponentialRampToValueAtTime(base*.997,time+Math.min(duration,.4));}
const attack=tier===10?.045:.008,fade=Math.max(.09,duration);
g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),time+attack);g.gain.exponentialRampToValueAtTime(.0001,time+fade);
osc.connect(filter);filter.connect(g);g.connect(this.master);osc.start(time);osc.stop(time+fade+.05);
if([0,4,8,9,11].includes(tier)){const o=ctx.createOscillator(),h=ctx.createGain();o.type='sine';o.frequency.value=base*(tier===0?2.01:1.5);h.gain.setValueAtTime(Math.max(.001,volume*.22),time);h.gain.exponentialRampToValueAtTime(.0001,time+fade*.72);o.connect(h);h.connect(this.master);o.start(time);o.stop(time+fade+.02);}
}
playArpeggio(tier,attack=false){this.unlock();if(!this.ctx)return;const now=this.ctx.currentTime+.015;const root=60+(s.level%4)*2;const notes=[0,4,7,12,16,19,24];const count=attack?Math.min(7,3+Math.floor(tier/2)):3;for(let j=0;j<count;j++)this.tone(root+notes[(j+tier)%notes.length],now+j*(attack?.087:.11),attack?.65:.36,tier,attack?.45:.2);}
playMerge(tier){this.playArpeggio(tier,true);if(this.ctx){const now=this.ctx.currentTime;this.tone(72+tier%6,now+.34,.8,tier,.37);}}
playUpgrade(){this.playArpeggio(6);}
playMove(){this.unlock();if(this.ctx)this.tone(67,this.ctx.currentTime,.13,0,.12);}
playVictory(){this.unlock();if(!this.ctx)return;const now=this.ctx.currentTime;[60,64,67,72,76,79,84].forEach((m,i)=>this.tone(m,now+i*.115,1.2,9,.30));}
start(){this.unlock();if(this.timer)return;this.timer=setInterval(()=>{if(!playing||document.hidden||!this.ctx||s.volume<=0)return;const now=this.ctx.currentTime+.02,step=this.seq++;const chord=[[48,55,60,64],[45,52,57,60],[53,60,65,69],[43,50,55,59]][Math.floor(step/16)%4];if(step%8===0){this.tone(chord[0]-12,now,1.5,4,.075);this.tone(chord[1],now,1.75,0,.053);}if(step%2===0)this.tone(chord[(step/2)%4|0]+12,now,.46,step%8===0?4:0,.045);if(step%16===15)this.tone(chord[2]+12,now,.75,8,.035);},305);}
}
const audio=new Music();
$('startButton').addEventListener('click',()=>{audio.start();$('welcomeOverlay').classList.add('hidden');s.intro=true;save();if(!s.tutorialDone)tutorial(0);else startGameplay();});
$('tutorialNext').addEventListener('click',()=>step===3?tutorialFinish():tutorial(step+1));
$('tutorialSkip').addEventListener('click',tutorialFinish);
$('board').addEventListener('click',e=>{const cell=e.target.closest('[data-cell]');if(cell)choose(Number(cell.dataset.cell));});
$('pulseButton').addEventListener('click',playNote);
$('summonButton').addEventListener('click',summon);
$('upgrades').addEventListener('click',e=>{const b=e.target.closest('[data-upgrade]');if(b)upgrade(b.dataset.upgrade);});
$('nextLevelButton').addEventListener('click',nextLevel);
$('settingsButton').addEventListener('click',openSettings);
$('closeSettings').addEventListener('click',closeSettings);
$('doneSettings').addEventListener('click',closeSettings);
$('replayTutorial').addEventListener('click',()=>tutorial(0));
$('volumeSlider').addEventListener('input',e=>{s.volume=Number(e.target.value)/100;$('volumeLabel').textContent=e.target.value+'%';audio.unlock();audio.volume();save();});
$('languageSelect').addEventListener('change',e=>language(e.target.value));
$('langQuick').addEventListener('click',()=>{const langs=['en','ru','es'];language(langs[(langs.indexOf(s.lang)+1)%langs.length]);});
setInterval(()=>{if(!s.board)return;const before=s.energy;recover();if(s.energy!==before){renderEconomy();renderBoard();save();}},1000);
window.addEventListener('pagehide',()=>{try{clearTimeout(saveTimer);(storage||localStorage).setItem(KEY,pack());}catch(e){}});
setupSDK();
})();