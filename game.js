/* Music Crates — musical merge-and-smash puzzle with original assets and audio. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),ART=window.MusicArt,STORAGE_KEY='music-crates-v1';
const TXT={
ru:{tagline:'СОЕДИНЯЙ • РАЗБИВАЙ • СОЗДАВАЙ',coins:'МОНЕТ',level:'УРОВЕНЬ',goal:'Разбивай коробки и открывай новые инструменты!',complete:'ОТКРЫТО',field:'ИГРОВОЕ ПОЛЕ',boxes:'КОРОБОК',hint:'Нажми на инструмент, чтобы сыграть и разбить соседние коробки.',play:'ИГРАТЬ!',playDesc:'Удар по коробкам',create:'НОВЫЙ ИНСТРУМЕНТ',selected:'ТВОЙ ИНСТРУМЕНТ',damage:'УРОН',radius:'РАДИУС',speed:'СКОРОСТЬ',upgradeTitle:'УЛУЧШЕНИЯ',collection:'КОЛЛЕКЦИЯ',footer:'МУЗЫКА В ТВОИХ РУКАХ',next:'ДАЛЕЕ ➜',skip:'ПРОПУСТИТЬ',settingsSub:'МУЗЫКАЛЬНАЯ СТУДИЯ',settings:'НАСТРОЙКИ',volume:'ГРОМКОСТЬ',music:'ФОНОВАЯ МУЗЫКА',language:'ЯЗЫК',replay:'ПОКАЗАТЬ ОБУЧЕНИЕ',done:'ГОТОВО',finishKicker:'УРОВЕНЬ ЗАВЕРШЁН',finishTitle:'НЕПЛОХОЙ КОНЦЕРТ!',finishText:'Все коробки разбиты. Следующая мелодия ждёт тебя!',nextLevel:'СЛЕДУЮЩИЙ УРОВЕНЬ ➜',power:'Громкость',powerDesc:'Урон каждого инструмента',tempo:'Темп',tempoDesc:'Атаки чаще',gold:'Удача',goldDesc:'Больше монет из коробок',max:'МАКС.',rank:'РАНГ',noCoins:'Не хватает монет',noSpace:'Нет свободной клетки. Разбей больше коробок!',newInstrument:'НОВЫЙ ИНСТРУМЕНТ!',merge:'НОВЫЙ ЗВУК: {name}!',notSame:'Объединяй одинаковые инструменты',maxRank:'Максимальный ранг уже открыт!',crate:'Разбей эту коробку звуковой волной!',outOfRange:'Слишком далеко — перемести инструмент ближе',selectedHint:'Выбран: {name}. Соедини или сыграй!',moved:'ИНСТРУМЕНТ ПЕРЕМЕЩЁН',newDrop:'ИЗ КОРОБКИ ВЫПАЛ ИНСТРУМЕНТ!',goldDrop:'ЗОЛОТАЯ КОРОБКА! +{n} МОНЕТ',goldSecret:'ТАЙНА ЗОЛОТОЙ КОРОБКИ РАСКРЫТА!',learn1:'Нажми на инструмент. Он играет ноту и повреждает коробки рядом.',learn2:'Соедини два одинаковых инструмента: нажми на первый, затем на второй. Или перетащи один на другой!',learn3:'Нажми «ИГРАТЬ!» для дополнительной атаки. Перемещай инструменты на пустые клетки, чтобы достать дальние коробки.',learnDone:'Играй, открывай инструменты и разбивай все коробки!',chapters:['ПЕРВЫЕ НОТЫ','ЗВУКОВАЯ ФАБРИКА','ГОРОД МЕЛОДИЙ','ЗОЛОТОЙ ЗАЛ','КОСМИЧЕСКАЯ МУЗЫКА','ВЕЛИКИЙ КОНЦЕРТ'],names:['Клавесы','Колокольчик','Бубен','Бонго','Ксилофон','Труба','Аккордеон','Скрипка','Гитара','Саксофон','Рояль','Синтезатор','Арфа','Барабаны','Орган','Космический оркестр']},
en:{tagline:'MERGE • SMASH • GROOVE',coins:'COINS',level:'LEVEL',goal:'Smash boxes, discover instruments, make music!',complete:'CLEARED',field:'GAME BOARD',boxes:'BOXES',hint:'Tap an instrument to play a note and break nearby boxes.',play:'PLAY NOTE!',playDesc:'Smash nearby boxes',create:'NEW INSTRUMENT',selected:'YOUR INSTRUMENT',damage:'DAMAGE',radius:'RANGE',speed:'SPEED',upgradeTitle:'UPGRADES',collection:'COLLECTION',footer:'MAKE YOUR OWN MUSIC',next:'NEXT ➜',skip:'SKIP',settingsSub:'MUSIC STUDIO',settings:'SETTINGS',volume:'MASTER VOLUME',music:'BACKGROUND MUSIC',language:'LANGUAGE',replay:'REPLAY TUTORIAL',done:'DONE',finishKicker:'LEVEL COMPLETE',finishTitle:'GREAT SHOW!',finishText:'All the boxes are gone. The next tune is waiting!',nextLevel:'NEXT LEVEL ➜',power:'Amplifier',powerDesc:'Stronger note damage',tempo:'Tempo',tempoDesc:'Attack more often',gold:'Lucky loot',goldDesc:'Earn more from boxes',max:'MAX',rank:'TIER',noCoins:'Not enough coins',noSpace:'No empty space. Break more boxes!',newInstrument:'NEW INSTRUMENT!',merge:'NEW SOUND: {name}!',notSame:'Only matching instruments can merge',maxRank:'Maximum tier reached!',crate:'Break this box with soundwaves!',outOfRange:'Too far — move closer to the box',selectedHint:'Selected: {name}. Merge or play!',moved:'INSTRUMENT MOVED',newDrop:'NEW INSTRUMENT FROM THE BOX!',goldDrop:'GOLDEN BOX! +{n} COINS',goldSecret:'THE GOLDEN BOX SECRET IS YOURS!',learn1:'Tap an instrument. It plays a musical note and damages nearby boxes.',learn2:'Merge two identical instruments: tap one, then the other — or drag one onto the other!',learn3:'Press PLAY NOTE for another attack. Move instruments onto empty tiles to reach distant boxes.',learnDone:'Play, discover new instruments and smash every box!',chapters:['FIRST NOTES','SOUND FACTORY','MELODY TOWN','GOLDEN HALL','COSMIC MUSIC','GRAND CONCERT'],names:['Claves','Copper Bell','Tambourine','Bongos','Xylophone','Trumpet','Accordion','Violin','Guitar','Saxophone','Piano','Synthesizer','Harp','Drum Kit','Organ','Cosmic Orchestra']},
es:{tagline:'FUSIONA • ROMPE • CREA',coins:'MONEDAS',level:'NIVEL',goal:'¡Rompe cajas y descubre nuevos instrumentos!',complete:'ABIERTAS',field:'TABLERO',boxes:'CAJAS',hint:'Toca un instrumento para hacer sonar una nota y romper las cajas cercanas.',play:'¡TOCAR!',playDesc:'Golpea las cajas',create:'NUEVO INSTRUMENTO',selected:'TU INSTRUMENTO',damage:'DAÑO',radius:'ALCANCE',speed:'VELOCIDAD',upgradeTitle:'MEJORAS',collection:'COLECCIÓN',footer:'CREA TU MÚSICA',next:'SIGUIENTE ➜',skip:'SALTAR',settingsSub:'ESTUDIO MUSICAL',settings:'AJUSTES',volume:'VOLUMEN',music:'MÚSICA DE FONDO',language:'IDIOMA',replay:'REPETIR TUTORIAL',done:'LISTO',finishKicker:'NIVEL COMPLETADO',finishTitle:'¡GRAN CONCIERTO!',finishText:'Ya no quedan cajas. ¡La siguiente melodía te espera!',nextLevel:'SIGUIENTE NIVEL ➜',power:'Amplificador',powerDesc:'Mayor daño de las notas',tempo:'Ritmo',tempoDesc:'Ataques más frecuentes',gold:'Botín afortunado',goldDesc:'Más monedas de las cajas',max:'MÁX.',rank:'RANGO',noCoins:'No tienes suficientes monedas',noSpace:'No hay casillas libres. ¡Rompe cajas!',newInstrument:'¡NUEVO INSTRUMENTO!',merge:'¡NUEVO SONIDO: {name}!',notSame:'Solo puedes fusionar instrumentos iguales',maxRank:'¡Rango máximo!',crate:'¡Rompe esta caja con ondas sonoras!',outOfRange:'Muy lejos — acerca el instrumento',selectedHint:'Elegido: {name}. ¡Fusiona o toca!',moved:'INSTRUMENTO MOVIDO',newDrop:'¡UN INSTRUMENTO EN LA CAJA!',goldDrop:'¡CAJA DORADA! +{n} MONEDAS',goldSecret:'¡DESCUBRISTE EL SECRETO DORADO!',learn1:'Toca un instrumento. Su nota musical daña las cajas cercanas.',learn2:'Fusiona dos instrumentos iguales: toca uno y luego el otro, o arrastra uno al otro.',learn3:'Pulsa ¡TOCAR! para otro ataque. Mueve instrumentos a casillas libres para llegar más lejos.',learnDone:'¡Descubre sonidos y rompe todas las cajas!',chapters:['PRIMERAS NOTAS','FÁBRICA SONORA','CIUDAD MUSICAL','SALÓN DORADO','MÚSICA CÓSMICA','GRAN CONCIERTO'],names:['Claves','Campana','Pandereta','Bongós','Xilófono','Trompeta','Acordeón','Violín','Guitarra','Saxofón','Piano','Sintetizador','Arpa','Batería','Órgano','Orquesta Cósmica']}};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n)),hash=(seed)=>{let t=seed|0;return ()=>{t+=0x6D2B79F5;let x=t;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return ((x^(x>>>14))>>>0)/4294967296}};
const newState=()=>({level:1,coins:110,highest:0,known:[0],upgrades:{power:0,tempo:0,gold:0},cells:null,n:0,volume:.67,musicVolume:.38,lang:/^ru/i.test(navigator.language)?'ru':/^es/i.test(navigator.language)?'es':'en',tutorialStep:0,tutorialDone:false,moves:0,merges:0,goldenOpened:0,won:false});
let state=newState(),selected=null,playing=true,sdkReady=false,storage=null,saveId=0,toastId=0,changed=new Map(),clickBlocked=0,pointerStart=null,winPending=false,autoElapsed=0,lastFrame=performance.now(),audioClock=0,beatIndex=0,musicReady=false;
const tr=(key,vars={})=>{const val=TXT[state.lang][key]??TXT.en[key]??key;return typeof val==='string'?val.replace(/\{(\w+)\}/g,(_,k)=>vars[k]??''):key};
const nme=tier=>TXT[state.lang].names[tier]||TXT.en.names[tier]||'???';
const instance=(tier)=>({kind:'inst',tier});
const empty=()=>({kind:'empty'});
function createLevel(level){
 const n=level<=8?6:level<=25?7:8,random=hash(level*59473+143),cells=Array.from({length:n*n},()=>{const hp=Math.max(1,1+Math.floor(level/7)+Math.floor(random()*(Math.min(4,2+Math.floor(level/12)))));return {kind:'box',hp,max:hp,gold:false,drop:random()<.23};});
 const cx=Math.floor(n/2)-1,cy=Math.floor(n/2)-1,at=(x,y)=>(cy+y)*n+(cx+x);
 const open=[at(0,0),at(1,0),at(0,1),at(1,1),at(-1,0)];
 open.forEach(i=>{if(i>=0&&i<cells.length)cells[i]=empty();});
 let tier=clamp(state.highest,0,15);cells[at(0,0)]=instance(tier);cells[at(1,0)]=instance(Math.max(0,tier-1));cells[at(0,1)]=instance(Math.max(0,tier-1));cells[at(1,1)]=instance(0);
 const goldenChance=level>=3&&(level%4===0||random()<.23);
 if(goldenChance){let locations=cells.map((c,i)=>c.kind==='box'?i:-1).filter(i=>i>=0);let chosen=locations[Math.floor(random()*locations.length)];cells[chosen]={kind:'box',hp:4+Math.ceil(level/3),max:4+Math.ceil(level/3),gold:true,drop:true};}
 return {cells,n};
}
function damage(tier){return Math.round(Math.pow(1.43,tier))+state.upgrades.power;}
function radius(tier){return clamp(1+Math.floor(tier/5),1,3);}
function attackInterval(){return 1700/Math.pow(1.14,state.upgrades.tempo);}
function createCost(){return 40+Math.floor(state.level/6)*13;}
const upgradeKinds=['power','tempo','gold'],maxUpgrade={power:18,tempo:9,gold:10},upgradeBase={power:80,tempo:95,gold:85};
const upgradeCost=k=>Math.round(upgradeBase[k]*Math.pow(1.62,state.upgrades[k]));
const coinMult=()=>1+state.upgrades.gold*.24;
function trackSave(){clearTimeout(saveId);saveId=setTimeout(save,150);}
function save(){try{(storage||localStorage).setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){console.warn('Save failed',e);}}
function load(){
 try{const raw=(storage||localStorage).getItem(STORAGE_KEY);if(!raw)return;const s=JSON.parse(raw);if(!s||typeof s!=='object'||!Number.isInteger(s.level)||s.level<1)return;
 const v=newState();state={...v,...s,upgrades:{...v.upgrades,...s.upgrades}};state.level=clamp(state.level,1,100000);state.coins=clamp(Number(state.coins)||0,0,1e12);state.highest=clamp(Number(state.highest)||0,0,15);state.volume=clamp(Number(state.volume)||0,0,1);state.musicVolume=clamp(Number(state.musicVolume)||0,0,1);if(!TXT[state.lang])state.lang='en';state.known=Array.isArray(state.known)?state.known.filter(x=>Number.isInteger(x)&&x>=0&&x<=15):[0];if(!state.known.includes(0))state.known.unshift(0);
 for(const k of upgradeKinds)state.upgrades[k]=clamp(Number(state.upgrades[k])||0,0,maxUpgrade[k]);
 if(!Array.isArray(state.cells)||state.cells.length!==state.n*state.n||state.n<6||state.n>8)state.cells=null;
 }catch(e){console.warn('Invalid save:',e);}
}
function initBoard(){if(!state.cells){const b=createLevel(state.level);state.cells=b.cells;state.n=b.n;}selected=null;state.won=false;}
function gameEvent(kind){try{if(sdkReady)window.CrazyGames?.SDK?.game?.[kind]?.();}catch(e){}}
async function initialize(){
 try{const sdk=window.CrazyGames?.SDK;if(sdk){await Promise.race([sdk.init(),new Promise((_,bad)=>setTimeout(()=>bad(new Error('SDK unavailable')),2300))]);sdkReady=true;try{sdk.game.loadingStart();}catch(e){}storage=sdk.data?.getItem&&sdk.data?.setItem?sdk.data:localStorage;try{const apply=x=>music.portalMute(!!x?.muteAudio);apply(sdk.game?.settings);sdk.game?.addSettingsChangeListener?.(apply);}catch(e){}}}catch(e){console.info('Standalone mode');}
 storage=storage||localStorage;load();initBoard();renderAll();gameEvent('loadingStop');gameEvent('gameplayStart');if(!state.tutorialDone)showTutorial(state.tutorialStep||0);
 requestAnimationFrame(loop);
}
function instrIndices(){return state.cells.map((c,i)=>c.kind==='inst'?i:-1).filter(i=>i>=0);}
function boxCount(){return state.cells.filter(c=>c.kind==='box').length;}
function currentTier(){return selected!==null&&state.cells[selected]?.kind==='inst'?state.cells[selected].tier:null;}
function renderAll(){setLanguage(state.lang);renderBoard();renderUI();renderShop();}
function setLanguage(lang){if(!TXT[lang])return;state.lang=lang;document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(x=>{x.textContent=tr(x.dataset.i18n)});$('languageBtn').textContent=lang.toUpperCase();$('language').value=lang;const vol=Math.round(state.volume*100),bg=Math.round(state.musicVolume*100);$('volume').value=vol;$('volumeLabel').textContent=vol+'%';$('musicVolume').value=bg;$('musicLabel').textContent=bg+'%';if(!state.tutorialDone)showTutorial(state.tutorialStep);renderUI();renderShop();}
function renderBoard(fx=[]){
 const n=state.n,tier=currentTier();$('board').style.setProperty('--columns',n);
 const animated=new Set(fx);
 $('board').innerHTML=state.cells.map((c,i)=>{
 const cl=['tile',c.kind==='box'?'crate':c.kind==='inst'?'instrument':'empty'];
 if(c.gold)cl.push('gold-box');if(i===selected)cl.push('selected');
 if(c.kind==='inst'&&i!==selected&&tier!==null&&c.tier===tier)cl.push('possible');
 if(animated.has(i))cl.push(c.kind==='box'?'fx-hit':c.kind==='inst'?'fx-merge':'fx-open');
 const content=c.kind==='box'?'<strong>'+(c.gold?'✦':'♫')+'</strong><span class="box-health"><i style="width:'+Math.round(100*c.hp/c.max)+'%"></i></span>':c.kind==='inst'?'<img draggable="false" alt="" src="'+ART.src(c.tier)+'"><span class="tier-mark">'+(c.tier+1)+'</span>':'';
 return '<button class="'+cl.join(' ')+'" type="button" data-index="'+i+'" role="gridcell" aria-label="'+(c.kind==='box'?'Box '+c.hp:c.kind==='inst'?nme(c.tier):'Empty')+'">'+content+'</button>';
 }).join('');
 renderCounters();
}
function renderCounters(){
 const left=boxCount(),total=state.cells.length,percent=Math.round((total-left)/total*100);
 $('boxesLeft').textContent=left;$('openPct').textContent=percent+'%';$('openBar').style.width=percent+'%';$('levelNum').textContent=state.level;$('chapterLabel').textContent=TXT[state.lang].chapters[Math.floor((state.level-1)/10)%6];$('coins').textContent=Math.round(state.coins).toLocaleString(state.lang);
 $('playBtn').disabled=state.won||instrIndices().length===0;$('createBtn').disabled=state.won||state.coins<createCost()||!state.cells.some(c=>c.kind==='empty');$('createCost').textContent='✦ '+createCost();
}
function renderUI(){
 renderCounters();let tier=currentTier();if(tier===null){const initial=state.cells.find(c=>c.kind==='inst');tier=initial?.tier??0;}
 $('currentImg').src=ART.src(tier);$('currentImg').alt=nme(tier);$('currentName').textContent=nme(tier);$('currentRank').textContent=tr('rank')+' '+(tier+1);
 $('damageStat').textContent=damage(tier);$('radiusStat').textContent=radius(tier);$('speedStat').textContent=(1.7/(attackInterval()/1000)).toFixed(1)+'×';
}
function renderShop(){
 $('upgradeList').innerHTML=[['power','♫'],['tempo','⏱'],['gold','✦']].map(([k,icon])=>{const level=state.upgrades[k],cost=upgradeCost(k);return '<button class="upgrade" data-upgrade="'+k+'" '+(state.won||level>=maxUpgrade[k]||state.coins<cost?'disabled':'')+'><span class="upgrade-glyph">'+icon+'</span><span class="upgrade-copy"><b>'+tr(k)+'</b><small>'+tr(k+'Desc')+' · '+level+'/'+maxUpgrade[k]+'</small></span><span class="upgrade-price">'+(level>=maxUpgrade[k]?tr('max'):'✦ '+cost)+'</span></button>';}).join('');
 $('collectionNum').textContent=state.known.length+'/16';
 $('collectionGrid').innerHTML=Array.from({length:16},(_,i)=>'<span class="'+(state.known.includes(i)?'found':'')+'" title="'+(state.known.includes(i)?nme(i):'???')+'">'+(state.known.includes(i)?'<img src="'+ART.src(i)+'" alt="">':'?')+'</span>').join('');
}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastId);toastId=setTimeout(()=>el.classList.remove('visible'),1800);}
function effect(index,kind='hit',text=''){
 if(!document.createElement)return;
 const node=$('board').querySelector('[data-index="'+index+'"]'),canvas=$('particles');if(!node)return;
 const r=node.getBoundingClientRect(),b=canvas.getBoundingClientRect(),x=r.left-b.left+r.width/2,y=r.top-b.top+r.height/2;
 if(text){const f=document.createElement('span');f.className='damage-float';f.textContent=text;f.style.left=(x-12)+'px';f.style.top=(y-6)+'px';canvas.appendChild(f);setTimeout(()=>f.remove(),820);}
 for(let k=0;k<(kind==='merge'?8:5);k++){const f=document.createElement('span');f.className='particle';f.textContent=['♪','✦','♫','✧'][k%4];f.style.left=x+'px';f.style.top=y+'px';f.style.setProperty('--tx',(Math.cos(k*2.4)*(.7+Math.random())*45)+'px');f.style.setProperty('--ty',(Math.sin(k*2.4)*(.7+Math.random())*43-13)+'px');canvas.appendChild(f);setTimeout(()=>f.remove(),820);}
}
function tutorialProgress(event){
 if(state.tutorialDone)return;
 if(state.tutorialStep===0&&event==='play'){state.tutorialStep=1;showTutorial(1);}
 else if(state.tutorialStep===1&&event==='merge'){state.tutorialStep=2;showTutorial(2);}
 else if(state.tutorialStep===2&&event==='button')endTutorial();
 trackSave();
}
function showTutorial(i=0){state.tutorialStep=clamp(i,0,2);$('tutorial').classList.remove('hidden');$('tutorialStep').textContent=(i+1)+'/3';$('tutorialMessage').textContent=tr('learn'+(i+1));}
function endTutorial(){state.tutorialDone=true;$('tutorial').classList.add('hidden');trackSave();}
function noteFor(tier){music.play(tier);musicReady=true;}
function near(a,b,range){const n=state.n;return Math.max(Math.abs(a%n-b%n),Math.abs(Math.floor(a/n)-Math.floor(b/n)))<=range;}
function playInstrument(index,powerBoost=1,manual=true,target=null){
 const src=state.cells[index];if(!src||src.kind!=='inst'||state.won)return false;
 const tier=src.tier,range=radius(tier),strength=damage(tier)*powerBoost,damaged=[],broken=[];
 if(manual)noteFor(tier);
 state.cells.forEach((cell,i)=>{
 if(cell.kind!=='box'||!near(index,i,range)||(target!==null&&i!==target))return;
 const dealt=Math.max(1,Math.ceil(strength/(cell.gold?1.3:1)));cell.hp=Math.max(0,cell.hp-dealt);damaged.push(i);
 if(cell.hp===0)broken.push({i,old:cell});});
 for(const {i,old} of broken){
 const gain=Math.round((old.gold?90:5+Math.min(14,Math.floor(state.level/3)))*coinMult());state.coins+=gain;
 if(old.gold){state.goldenOpened++;if(state.goldenOpened===1)toast(tr('goldSecret'));else toast(tr('goldDrop',{n:gain}));}
 if(old.drop||old.gold&&state.level>=10){
 let t=0;if(old.gold&&state.level>=10)t=Math.max(1,Math.min(state.highest-1,4));
 state.cells[i]=instance(t);if(!state.known.includes(t))state.known.push(t);
 }else state.cells[i]=empty();
 }
 if(damaged.length){state.moves++;if(manual){renderBoard(damaged);for(const idx of damaged.slice(0,6))effect(idx,'hit',broken.find(b=>b.i===idx)?'✦':'−'+Math.ceil(strength));}renderShop();renderUI();trackSave();}
 if(manual)tutorialProgress('play');
 if(broken.length)checkWin();
 return damaged.length>0;
}
function selectOrPlay(index){
 const c=state.cells[index];if(!c||state.won||!playing)return;
 music.unlock();
 if(c.kind==='box'){let src=selected!==null&&state.cells[selected]?.kind==='inst'&&near(selected,index,radius(state.cells[selected].tier))?selected:null;
 if(src===null){const nearby=instrIndices().filter(i=>near(i,index,radius(state.cells[i].tier)));src=nearby.sort((a,b)=>damage(state.cells[b].tier)-damage(state.cells[a].tier))[0]??null;}
 if(src===null){toast(tr('outOfRange'));return;}selected=src;playInstrument(src,1,true,index);renderBoard();renderUI();return;}
 if(c.kind==='inst'){
 const prev=selected!==null?state.cells[selected]:null;
 if(selected!==index&&prev?.kind==='inst'&&prev.tier===c.tier){merge(selected,index);return;}
 selected=index;playInstrument(index,1,true);renderBoard();renderUI();if(!state.tutorialDone&&state.tutorialStep===0)tutorialProgress('play');return;
 }
 const prev=selected!==null?state.cells[selected]:null;
 if(prev?.kind==='inst'){c.kind='inst';c.tier=prev.tier;delete c.hp;delete c.max;state.cells[selected]=empty();selected=index;renderBoard();renderUI();trackSave();toast(tr('moved'));}
 }
function merge(a,b){
 const first=state.cells[a],second=state.cells[b];if(!first||!second||first.kind!=='inst'||second.kind!=='inst'||first.tier!==second.tier)return false;
 if(first.tier>=15){toast(tr('maxRank'));return false;}
 const tier=first.tier+1;state.cells[a]=empty();state.cells[b]=instance(tier);state.highest=Math.max(state.highest,tier);if(!state.known.includes(tier))state.known.push(tier);state.merges++;
 state.coins+=12+tier*5;selected=b;noteFor(tier);music.playMerge(tier);renderBoard([a,b]);renderUI();renderShop();effect(b,'merge','★');trackSave();toast(tr('merge',{name:nme(tier)}));tutorialProgress('merge');return true;
}
function playButton(){
 if(state.won||!playing)return;
 let i=selected;if(i===null||state.cells[i]?.kind!=='inst'){i=instrIndices().sort((a,b)=>state.cells[b].tier-state.cells[a].tier)[0];}
 if(i===undefined)return;
 selected=i;const hit=playInstrument(i,2,true);
 if(!hit)toast(tr('outOfRange'));renderBoard();renderUI();tutorialProgress('button');
}
function createInstrument(){
 if(state.won)return;const spaces=state.cells.map((c,i)=>c.kind==='empty'?i:-1).filter(x=>x>=0),cost=createCost();if(!spaces.length){toast(tr('noSpace'));return;}if(state.coins<cost){toast(tr('noCoins'));return;}
 let choice=spaces[Math.floor(hash(Date.now())()*spaces.length)];state.coins-=cost;state.cells[choice]=instance(0);selected=choice;noteFor(0);renderBoard([choice]);renderUI();renderShop();trackSave();toast(tr('newInstrument'));
}
function improve(k){if(!(k in state.upgrades)||state.won)return;const level=state.upgrades[k],cost=upgradeCost(k);if(level>=maxUpgrade[k])return;if(state.coins<cost){toast(tr('noCoins'));return;}state.coins-=cost;state.upgrades[k]++;music.playMerge(Math.min(15,2+state.upgrades[k]));renderUI();renderShop();trackSave();}
function checkWin(){if(boxCount()>0||winPending||state.won)return;winPending=true;setTimeout(()=>{winPending=false;if(boxCount()>0)return;state.won=true;gameEvent('gameplayStop');const reward=Math.round((85+20*state.level)*coinMult());state.coins+=reward;$('rewardAmount').textContent='+'+reward;$('winOverlay').classList.remove('hidden');music.fanfare();renderUI();renderShop();trackSave();if(state.level%10===0)gameEvent('happytime');},650);}
function nextLevel(){state.level++;state.n=0;state.cells=null;initBoard();selected=null;state.won=false;winPending=false;autoElapsed=0;$('winOverlay').classList.add('hidden');renderAll();gameEvent('gameplayStart');trackSave();}
function openSettings(){playing=false;gameEvent('gameplayStop');$('settingsOverlay').classList.remove('hidden');}
function closeSettings(){$('settingsOverlay').classList.add('hidden');playing=true;lastFrame=performance.now();if(!state.won)gameEvent('gameplayStart');}
function loop(now){
 if(!state.cells){requestAnimationFrame(loop);return;}
 let dt=Math.min(.12,Math.max(0,(now-lastFrame)/1000));lastFrame=now;
 if(playing&&!state.won&&!document.hidden){
 autoElapsed+=dt*1000;
 if(autoElapsed>=attackInterval()){autoElapsed%=attackInterval();const units=instrIndices();let hits=0;for(const i of units){const t=state.cells[i]?.tier;if(t===null||t===undefined)continue;hits+=playInstrument(i,1,false)?1:0;}if(hits){renderBoard();renderUI();}}
 if(musicReady){audioClock+=dt*1000;if(audioClock>=260){audioClock%=260;music.rhythm(beatIndex++,instrIndices().map(i=>state.cells[i].tier));}}
 }
 requestAnimationFrame(loop);
}
class Sound{
 constructor(){this.ctx=null;this.master=null;this.musicGain=null;this.notesGain=null;this.portalMuted=false;this.lastNote=0;}
 unlock(){try{if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);this.musicGain=this.ctx.createGain();this.notesGain=this.ctx.createGain();this.musicGain.connect(this.master);this.notesGain.connect(this.master);this.levels();}if(this.ctx.state==='suspended')this.ctx.resume();}catch(e){console.info('No audio',e);}}
 levels(){if(!this.ctx)return;const at=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.portalMuted?0:state.volume,at,.06);this.musicGain.gain.setTargetAtTime(state.musicVolume*.28,at,.06);this.notesGain.gain.setTargetAtTime(.33,at,.06);}
 portalMute(value){this.portalMuted=value;this.levels();}
 tone(midi,tier,volume=.16,length=.38,background=false,when){if(!this.ctx||state.volume===0)return;const a=this.ctx,now=when??a.currentTime+.005,osc=a.createOscillator(),filter=a.createBiquadFilter(),g=a.createGain(),freq=440*Math.pow(2,(midi-69)/12);const voices=['sine','sine','triangle','triangle','sine','sawtooth','triangle','sawtooth','triangle','sawtooth','triangle','sawtooth','sine','square','triangle','sawtooth'];osc.type=voices[tier%16];osc.frequency.setValueAtTime(freq,now);filter.type='lowpass';filter.frequency.value=2100+tier*90;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),now+.015);g.gain.exponentialRampToValueAtTime(.0001,now+length);osc.connect(filter);filter.connect(g);g.connect(background?this.musicGain:this.notesGain);osc.start(now);osc.stop(now+length+.03);
 if([0,1,4,8,12,15].includes(tier)){const o=a.createOscillator(),gg=a.createGain();o.type='sine';o.frequency.value=freq*2;gg.gain.setValueAtTime(volume*.17,now);gg.gain.exponentialRampToValueAtTime(.0001,now+length*.7);o.connect(gg);gg.connect(background?this.musicGain:this.notesGain);o.start(now);o.stop(now+length+.01);}}
 play(tier){this.unlock();if(!this.ctx)return;let now=this.ctx.currentTime;const root=55+(state.level%4)*2,scale=[0,4,7,12,14,19];this.tone(root+12+scale[(tier+state.moves)%6],tier,.22,.55,false,now);}
 playMerge(tier){this.unlock();if(!this.ctx)return;let now=this.ctx.currentTime;[0,4,7,12].forEach((off,i)=>this.tone(60+off+(tier%4)*2,tier,.2,.6,false,now+i*.085));}
 fanfare(){this.unlock();if(!this.ctx)return;let now=this.ctx.currentTime;[60,64,67,72,76,79].forEach((v,i)=>this.tone(v,Math.min(15,i+7),.21,1,false,now+i*.11));}
 rhythm(step,tiers){
 if(!this.ctx||state.musicVolume<=0)return;const root=[48,45,53,43][Math.floor(step/16)%4],t=this.ctx.currentTime;
 if(step%4===0)this.tone(root,8,.23,.28,true,t);
 if(step%4===2)this.tone(49,3,.06,.09,true,t);
 if(step%2===0)this.tone(82,0,.024,.075,true,t);
 if(tiers.length&&step%2===0){let tier=tiers[Math.floor(step/2)%Math.min(5,tiers.length)];this.tone(root+12+[0,7,12,4][step%4],tier,.07,.29,true,t);}
 }
}
const music=new Sound();
function bind(){
 const board=$('board');
 board.addEventListener('click',e=>{if(Date.now()<clickBlocked)return;const cell=e.target.closest?.('[data-index]');if(cell)selectOrPlay(Number(cell.dataset.index));});
 board.addEventListener('pointerdown',e=>{const cell=e.target.closest?.('[data-index]');if(!cell)return;const i=Number(cell.dataset.index);if(state.cells[i]?.kind!=='inst')return;pointerStart={i,x:e.clientX,y:e.clientY};});
 board.addEventListener('pointerup',e=>{if(!pointerStart)return;const {i,x,y}=pointerStart;pointerStart=null;if(Math.hypot(e.clientX-x,e.clientY-y)<12)return;const node=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.('[data-index]');if(!node)return;const target=Number(node.dataset.index);if(target===i)return;selected=i;clickBlocked=Date.now()+400;selectOrPlay(target);});
 board.addEventListener('pointercancel',()=>pointerStart=null);
 $('playBtn').addEventListener('click',playButton);$('createBtn').addEventListener('click',createInstrument);
 $('upgradeList').addEventListener('click',e=>{const k=e.target.closest?.('[data-upgrade]')?.dataset.upgrade;if(k)improve(k)});
 $('languageBtn').addEventListener('click',()=>{const a=['ru','en','es'];setLanguage(a[(a.indexOf(state.lang)+1)%3]);trackSave();});
 $('language').addEventListener('change',e=>{setLanguage(e.target.value);trackSave();});
 $('settingsBtn').addEventListener('click',openSettings);$('closeSettings').addEventListener('click',closeSettings);$('saveSettings').addEventListener('click',closeSettings);
 $('volume').addEventListener('input',e=>{state.volume=Number(e.target.value)/100;music.unlock();music.levels();$('volumeLabel').textContent=e.target.value+'%';trackSave();});
 $('musicVolume').addEventListener('input',e=>{state.musicVolume=Number(e.target.value)/100;music.unlock();music.levels();$('musicLabel').textContent=e.target.value+'%';trackSave();});
 $('helpBtn').addEventListener('click',()=>{state.tutorialStep=0;state.tutorialDone=false;showTutorial(0);trackSave();});
 $('replayTutorial').addEventListener('click',()=>{closeSettings();state.tutorialStep=0;state.tutorialDone=false;showTutorial(0);trackSave();});
 $('tutorialNext').addEventListener('click',()=>state.tutorialStep>=2?endTutorial():showTutorial(++state.tutorialStep));
 $('tutorialSkip').addEventListener('click',endTutorial);$('nextLevel').addEventListener('click',nextLevel);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)gameEvent('gameplayStop');else{lastFrame=performance.now();if(playing&&!state.won)gameEvent('gameplayStart');}});
 window.addEventListener('pagehide',save);
}
bind();initialize();
window.MusicCratesDebug={snapshot:()=>JSON.parse(JSON.stringify(state)),select:selectOrPlay,merge,attack:playInstrument,step:()=>{const before=boxCount();for(const i of instrIndices())playInstrument(i,1,false);return {before,after:boxCount()}},forceWin:()=>{state.cells.forEach((c,i)=>{if(c.kind==='box')state.cells[i]=empty();});checkWin();},nextLevel};
})();
