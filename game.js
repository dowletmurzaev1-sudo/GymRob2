import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const root=document.querySelector('#game'), scene=new THREE.Scene();scene.background=new THREE.Color(0x8ed8ff);scene.fog=new THREE.Fog(0x8ed8ff,35,95);
const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,150);camera.position.set(-14,1.7,-5.6);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;root.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x64748b,2));const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(-12,22,10);sun.castShadow=true;scene.add(sun);
const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.8});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),mat(0x7bc96f));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
function box(x,y,z,w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function label(text,x,z,color='#fff'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#14213ddd';ctx.roundRect(8,8,496,112,22);ctx.fill();ctx.font='bold 46px Arial';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,256,80);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.position.set(x,4.2,z);s.scale.set(6,1.5,1);scene.add(s)}
// ===== ЛЕСНАЯ ПОЛЯНА (бывший зал) — деревья вокруг центра карты =====
const treeSpots=[];
for(let x=-21;x<=21;x+=7)for(let z=-16;z<=16;z+=8){if(Math.abs(x)<4&&Math.abs(z)<5)continue;treeSpots.push([x+(Math.random()*3-1.5),z+(Math.random()*3-1.5)])}
for(const[tx,tz]of treeSpots){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.35,2,8),mat(0x7a5230));trunk.position.set(tx,1,tz);trunk.castShadow=true;scene.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.4,3,8),mat(0x2e8b46));crown.position.set(tx,3.4,tz);crown.castShadow=true;scene.add(crown)}
const clearing=new THREE.Mesh(new THREE.CircleGeometry(9,40),new THREE.MeshStandardMaterial({color:0x9ad88a,roughness:.9}));clearing.rotation.x=-Math.PI/2;clearing.position.set(0,.05,0);scene.add(clearing);
for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.5+Math.random()*.5,8,6),mat(0xffffff));m.scale.y=.35;m.position.set((Math.random()*16-8),.1,(Math.random()*14-7));scene.add(m)}
label('ЛЕСНАЯ ПОЛЯНА',0,0,'#dfffe9');
// деревянные домики-прилавки для зон поляны
for(const[zx,zz,name,col]of[[-6,4,'БОКСЁРСКИЕ ГРУШИ',0xf4b2a7],[0,-6,'БЕГОВЫЕ ДОРОЖКИ',0x8dbdff],[-8,-6,'ЯЙЦА И ПИТОМЦЫ',0xf5db72],[0,7,'МАГАЗИН ПЕРЧАТОК',0x343946],[8,4,'МАГАЗИН КРОССОВОК',0x8bdb9b]]){box(zx,.9,zz,3,1.8,2.4,col);const roof=new THREE.Mesh(new THREE.ConeGeometry(2.4,1,4),mat(0xb04a3a));roof.position.set(zx,2.4,zz);roof.rotation.y=Math.PI/4;scene.add(roof);label(name,zx,zz,'#ffffff')}

// decorative walls and trees
for(let x=-20;x<=20;x+=5){box(x,1,-18,.7,2,.7,0x62728a);const top=new THREE.Mesh(new THREE.ConeGeometry(1.5,3,8),mat(0x299b62));top.position.set(x,3.3,-18);scene.add(top)}
// ===== РУИНЫ (severe zone) — hostile NPC wander here: 15 HP, give 27 exp + 15 coins, health bar above head =====
const ruins={cx:14,cz:-10,r:6};
box(ruins.cx,.15,ruins.cz,11,.3,10,0x8a8f98);label('🏚️ РУИНЫ',ruins.cx,ruins.cz,'#d8cfa8');
for(const[ox,oz,w,h,d]of[[-3,-2,2.4,1.8,1],[2.6,-2.4,1.6,2.4,.9],[-3.2,2,1.2,1.2,2],[2.8,2.2,2.2,1,.7],[0,-3.4,3.4,.9,.8]])box(ruins.cx+ox,h/2+.3,ruins.cz+oz,w,h,d,0xa9a293);
for(const[ox,oz]of[[-1.4,-.6],[1.6,.8]])box(ruins.cx+ox,1.35,ruins.cz+oz,.5,2.7,.5,0x93988f);
(function(){const crumble=new THREE.Mesh(new THREE.TorusKnotGeometry(.6,.22,48,6),mat(0x7d7f86));crumble.position.set(ruins.cx-.3,.9,ruins.cz+.4);crumble.castShadow=true;scene.add(crumble)})();
function makeBarBg(){const c=document.createElement('canvas');c.width=128;c.height=20;return c}
class Enemy{
 constructor(x,z,area){this.area=area;this.maxHp=15;this.hp=15;this.alive=true;this.pos=new THREE.Vector3(x,0,z);this.dest=this.randomDest();this.speed=1.5;this.atkCd=0;
  this.g=new THREE.Group();
  const skin=mat(0xcf4b4b);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.7,.9,.4),mat(0x7e2f2f));body.position.y=1.15;body.castShadow=true;this.g.add(body);
  const head=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),skin);head.position.y=1.9;head.castShadow=true;this.g.add(head);
  const eyeL=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,.04),mat(0x111111));eyeL.position.set(.12,1.95,.26);this.g.add(eyeL);const eyeR=eyeL.clone();eyeR.position.x=-.12;this.g.add(eyeR);
  for(const s of[-1,1]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.2,.7,.2),skin);arm.position.set(.47*s,1.2,0);this.g.add(arm);const leg=new THREE.Mesh(new THREE.BoxGeometry(.24,.7,.24),mat(0x4a2020));leg.position.set(.18*s,.35,0);this.g.add(leg)}
  // health bar above head (canvas sprite, redrawn on damage)
  this.barCanvas=makeBarBg();this.barTex=new THREE.CanvasTexture(this.barCanvas);
  this.barSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:this.barTex,transparent:true,depthTest:false}));
  this.barSprite.position.set(0,2.55,0);this.barSprite.scale.set(1.3,.2,1);this.g.add(this.barSprite);
  this.drawBar();scene.add(this.g);this.syncMesh()}
 randomDest(){const a=Math.random()*Math.PI*2,r=Math.random()*this.area.r;return new THREE.Vector3(this.area.cx+Math.cos(a)*r,0,this.area.cz+Math.sin(a)*r)}
 drawBar(){const ctx=this.barCanvas.getContext('2d');ctx.clearRect(0,0,128,20);ctx.fillStyle='#000000aa';ctx.fillRect(0,0,128,20);const pct=Math.max(0,this.hp/this.maxHp);ctx.fillStyle=pct>.5?'#3ee06f':pct>.25?'#ffcf40':'#ff4d4d';ctx.fillRect(2,2,124*pct,16);ctx.font='bold 13px Arial';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(this.hp+'/'+this.maxHp,64,15);this.barTex.needsUpdate=true}
 syncMesh(){this.g.position.copy(this.pos);this.g.lookAt(camera.position.x,this.pos.y,camera.position.z)}
 update(dt){if(!this.alive)return;const d=this.dest.clone().sub(this.pos);d.y=0;if(d.length()<.4)this.dest=this.randomDest();else this.pos.addScaledVector(d.normalize(),this.speed*dt);
  const pd=camera.position.clone().sub(this.pos);pd.y=0;const dist=pd.length();
  if(dist<1.5){this.atkCd-=dt;if(this.atkCd<=0){this.atkCd=1;playerHit(3)}}
  else if(dist<4.5){this.pos.addScaledVector(pd.normalize(),-this.speed*.8*dt)} // personal space
  this.syncMesh()}
 hit(dmg){if(!this.alive)return;this.hp-=dmg;this.drawBar();beep(320,.07);if(this.hp<=0){this.alive=false;state.exp+=27;state.coins+=15;save();toast('НПС повержен! +27 опыта · +15 монет 🪙');beep(180,.18);scene.remove(this.g);this.respawnAt=performance.now()+8000}}
}
const enemies=[new Enemy(12,-9,ruins),new Enemy(16,-11,ruins),new Enemy(15,-7,ruins)];
// player hp
let playerHp=100,lastRegen=0;
function updPlayerHpHud(){const el=document.getElementById('hp');if(el)el.textContent=playerHp}
function playerHit(d){if(!active)return;playerHp-=d;lastRegen=performance.now();updPlayerHpHud();if(playerHp<=0){playerHp=100;camera.position.set(spawnPos.x,1.7,spawnPos.z);toast('💀 Ты погиб! Возрождение в деревне')}}
// ===== ДЕРЕВНЯ у пруда — spawn point + sword merchant =====
const village={cx:-14,cz:-10,r:6},pond={cx:-14,cz:-10.5,r:3.2},spawnPos=new THREE.Vector3(-14,1.7,-5.6);
box(village.cx,.1,village.cz,12,.2,11,0xcdb98f);label('🏘️ ДЕРЕВНЯ',village.cx,village.cz-2,'#ffe9b8');
const water=new THREE.Mesh(new THREE.CircleGeometry(pond.r,28),new THREE.MeshStandardMaterial({color:0x3f9be0,roughness:.15,metalness:.1}));water.rotation.x=-Math.PI/2;water.position.set(pond.cx,.16,pond.cz);scene.add(water);
box(pond.cx,.1,pond.cz,pond.r*2+.6,.1,pond.r*2+.6,0xd9a066).renderOrder=-1;
for(const[ox,oz]of[[-4.4,-2.6],[4.2,-2.8],[-4.6,2.6]]){box(village.cx+ox,1,village.cz+oz,2,2,2,0xd9b98c);const roof=new THREE.Mesh(new THREE.ConeGeometry(1.7,1.2,4),mat(0xb04a3a));roof.position.set(village.cx+ox,2.6,village.cz+oz);roof.rotation.y=Math.PI/4;scene.add(roof)}
box(village.cx,.4,-15.6,12,.3,1,0x9c7b4f); // dock by pond edge
// merchant NPC (static, sells & buys swords)
const merchant=(function(){const g=new THREE.Group();const skin=mat(0xf1c27d);
 const body=new THREE.Mesh(new THREE.BoxGeometry(.75,1,.45),mat(0x2f6fd0));body.position.y=1.2;body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),skin);head.position.y=1.95;g.add(head);
 const hat=new THREE.Mesh(new THREE.BoxGeometry(.62,.16,.62),mat(0x1c4a94));hat.position.y=2.25;g.add(hat);
 for(const s of[-1,1]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.2,.7,.2),skin);arm.position.set(.5*s,1.2,0);g.add(arm);const leg=new THREE.Mesh(new THREE.BoxGeometry(.24,.7,.24),mat(0x333b4d));leg.position.set(.18*s,.35,0);g.add(leg)}
 g.position.set(village.cx+2.6,0,village.cz+3.4);scene.add(g);return g})();
// ===== бродячие мирные НПС в деревне =====
const villagers=[];
class Villager{
 constructor(x,z,area,color){this.area=area;this.pos=new THREE.Vector3(x,0,z);this.dest=this.randomDest();this.speed=.9+Math.random()*.5;
  this.g=new THREE.Group();const skin=mat(0xf1c27d);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.7,.9,.4),mat(color));body.position.y=1.15;body.castShadow=true;this.g.add(body);
  const head=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),skin);head.position.y=1.9;head.castShadow=true;this.g.add(head);
  const eyeL=new THREE.Mesh(new THREE.BoxGeometry(.08,.08,.04),mat(0x111111));eyeL.position.set(.12,1.95,.26);this.g.add(eyeL);const eyeR=eyeL.clone();eyeR.position.x=-.12;this.g.add(eyeR);
  for(const s of[-1,1]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.2,.7,.2),skin);arm.position.set(.47*s,1.2,0);this.g.add(arm);const leg=new THREE.Mesh(new THREE.BoxGeometry(.24,.7,.24),mat(0x3b3f4d));leg.position.set(.18*s,.35,0);this.g.add(leg)}
  scene.add(this.g);this.syncMesh()}
 randomDest(){const a=Math.random()*Math.PI*2,r=Math.random()*this.area.r;return new THREE.Vector3(this.area.cx+Math.cos(a)*r,0,this.area.cz+Math.sin(a)*r)}
 syncMesh(){this.g.position.copy(this.pos);this.g.lookAt(camera.position.x,this.pos.y,camera.position.z)}
 update(dt){const d=this.dest.clone().sub(this.pos);d.y=0;if(d.length()<.4)this.dest=this.randomDest();else this.pos.addScaledVector(d.normalize(),this.speed*dt);this.syncMesh()}
}
villagers.push(new Villager(-12,-8,village,0x3aa14e),new Villager(-16,-12,village,0xd07a2f),new Villager(-13,-13,village,0x8a3ad0));

function makeSword(scale=1){const g=new THREE.Group();const mk=(w,h,d,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.castShadow=true;return m};
 const blade=mk(.1,.95,.045,0xd7dde6);blade.position.y=.55;g.add(blade);
 const guard=mk(.34,.09,.09,0xb07a2f);guard.position.y=.06;g.add(guard);
 const grip=mk(.08,.3,.08,0x6b4a22);grip.position.y=-.12;g.add(grip);
 const pommel=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),mat(0xb07a2f));pommel.position.y=-.28;pommel.castShadow=true;g.add(pommel);
 g.scale.setScalar(scale);return g}
// first-time cleanup helper not needed; build visible display sword at stall
(function(){const stall=box(village.cx+2.6,.5,village.cz+2.6,1.6,.9,1,0x8a5a33);const sw=makeSword(1.4);sw.position.set(village.cx+2.6,1.7,village.cz+2.6);sw.rotation.z=.5;scene.add(sw)})();
camera.position.copy(spawnPos);
const state=JSON.parse(localStorage.getItem('gymrob')||'null')||{strength:1,speed:1,coins:500,glove:1,shoe:1,pet:1,exp:0,sword:0};
if(state.exp==null)state.exp=0;if(state.sword==null)state.sword=0;
let currentZone=null,active=false,toastTimer,sens=parseFloat(localStorage.getItem('gymrob_sens')||'.2'),vol=parseInt(localStorage.getItem('gymrob_vol')||'70');
function save(){localStorage.setItem('gymrob',JSON.stringify(state));updateHud()}
function updateHud(){for(const k of ['strength','speed','coins'])document.getElementById(k).textContent=state[k].toLocaleString('ru-RU');const e=document.getElementById('exp');if(e)e.textContent=state.exp.toLocaleString('ru-RU');updPlayerHpHud()}
function toast(t){const el=document.querySelector('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1800)}
const panel=document.querySelector('#panel'),actions=document.querySelector('#panelActions');
function openPanel(zone){currentZone=zone;panel.classList.remove('hidden');document.querySelector('#panelTitle').textContent=zone.title;document.querySelector('#panelDesc').textContent=zone.desc;actions.innerHTML='';zone.buttons.forEach(b=>{const el=document.createElement('button');el.textContent=b.text;el.onclick=b.run;actions.append(el)})}
function closePanel(){panel.classList.add('hidden');currentZone=null}
document.querySelector('#closePanel').onclick=closePanel;
function actionButton(text,run){return {text,run}}
const zones=[
{title:'Боксёрские груши',desc:'Бей грушу, чтобы получать силу. Улучшения становятся дороже постепенно.',pos:[-6,4],radius:4,buttons:[actionButton('УДАРИТЬ (+ сила)',()=>{state.strength+=state.glove*state.pet;state.coins+=2*state.pet;save();toast('Сила увеличена! +2 монеты') }),actionButton('ТРЕНИРОВКА СИЛЫ — 100 монет',()=>{if(state.coins<100)return toast('Не хватает монет');state.coins-=100;state.strength+=5;save();toast('+5 силы')})]},
{title:'Беговые дорожки',desc:'Беги, чтобы развивать скорость. Скорость немного ускоряет передвижение.',pos:[0,-6],radius:4,buttons:[actionButton('БЕЖАТЬ (+ скорость)',()=>{state.speed+=state.shoe*state.pet*.5;state.coins+=2;save();toast('Скорость увеличена!')})]},
{title:'Яйца питомцев',desc:'Питомцы дают небольшой бонус к тренировкам. Яйцо стоит 250 монет.',pos:[-8,-6],radius:4,buttons:[actionButton('ВЫЛУПИТЬ ЯЙЦО — 250 🪙',()=>{if(state.coins<250)return toast('Не хватает монет');state.coins-=250;const pets=['Кубический щенок','Неоновый кот','Золотой нуб'];const pet=pets[Math.floor(Math.random()*pets.length)];state.pet=Math.min(3,state.pet+.25);save();toast('Выпал питомец: '+pet+'! Бонус тренировки повышен')})]},
{title:'Магазин перчаток',desc:'Перчатки умножают прирост силы. Каждая следующая дороже.',pos:[0,7],radius:4,buttons:[1,2,3].map((n)=>actionButton(['Перчатки x1.5 — 300 🪙','Перчатки x2 — 900 🪙','Перчатки x3 — 2500 🪙'][n-1],()=>{const costs=[300,900,2500],mult=[1.5,2,3];if(state.glove>=mult[n-1])return toast('Уже куплено');if(state.coins<costs[n-1])return toast('Не хватает монет');state.coins-=costs[n-1];state.glove=mult[n-1];save();toast('Куплены перчатки x'+state.glove)}))},
{title:'Магазин кроссовок',desc:'Кроссовки увеличивают скорость, которую получаешь на дорожке.',pos:[8,4],radius:4,buttons:[1,2,3].map((n)=>actionButton(['Кроссовки x1.5 — 300 🪙','Кроссовки x2 — 900 🪙','Кроссовки x3 — 2500 🪙'][n-1],()=>{const costs=[300,900,2500],mult=[1.5,2,3];if(state.shoe>=mult[n-1])return toast('Уже куплено');if(state.coins<costs[n-1])return toast('Не хватает монет');state.coins-=costs[n-1];state.shoe=mult[n-1];save();toast('Куплены кроссовки x'+state.shoe)}))},
{title:'⚔️ Мечник в деревне',desc:'Мерчент продаёт и покупает мечи. Меч наносит 5 урона врагам в Руинах (ЛКМ / кнопка АТАКА).',pos:[village.cx+2.6,village.cz+3.4],radius:3.5,buttons:[
 actionButton('КУПИТЬ МЕЧ — 300 🪙',()=>{if(state.sword>=1)return toast('Меч уже у тебя!');if(state.coins<300)return toast('Не хватает монет');state.coins-=300;state.sword=1;save();equipSword(true);toast('⚔️ Меч куплен! Бей врагов в Руинах')})
,actionButton('ПРОДАТЬ МЕЧ — +200 🪙',()=>{if(state.sword<1)return toast('У тебя нет меча');state.sword=0;state.coins+=200;save();equipSword(false);toast('Меч продан за 200 монет')})
]},
{title:'🏚️ Руины',desc:'Опасная территория! Ходящие НПС имеют 15 HP. За каждого поверженного: +27 опыта и +15 монет. Нужно иметь меч!',pos:[ruins.cx,ruins.cz],radius:6,buttons:[
 actionButton('АТАКОВАТЬ БЛИЖАЙШЕГО НПС ⚔️',attackNearest),
 actionButton('ОТОЙТИ',closePanel)
]}
];
// sword in hand
let heldSword=null;
function equipSword(on){if(heldSword){camera.remove(heldSword);heldSword=null}if(on&&state.sword>=1){heldSword=makeSword(.7);heldSword.position.set(.42,-.35,-.7);heldSword.rotation.set(.2,0,-1.2);camera.add(heldSword)}}
let swingT=0;
function attackNearest(){if(!state.sword)return toast('Купи меч у торговца в деревне!');swingT=.3;let best=null,bd=4;for(const v of villagers)v.update(dt);
 for(const e of enemies){if(!e.alive)continue;const d=e.pos.distanceTo(camera.position);if(d<bd){bd=d;best=e}}if(best){best.hit(5);if(best.alive)toast('Удар мечом! Осталось HP: '+best.hp)}else toast('Никого рядом — подойди ближе')}
renderer.domElement.addEventListener('mousedown',e=>{if(e.button===0&&active&&panel.classList.contains('hidden')&&document.pointerLockElement===renderer.domElement)attackNearest()});
function interact(){if(currentZone){closePanel();return}let best=null,dist=Infinity;for(const z of zones){const d=Math.hypot(camera.position.x-z.pos[0],camera.position.z-z.pos[1]);if(d<z.radius&&d<dist){best=z;dist=d}}if(best)openPanel(best);else toast('Подойди ближе к нужной зоне')}
document.querySelector('#actionBtn').onclick=interact;
document.querySelector('#menuBtn').onclick=openSettings;
// ===== НАСТРОЙКИ (чувствительность + громкость) — интеграция Яндекс Игр =====
let YaGamesCtx=null;const audioCtxRef={ctx:null};
(function(){try{if(typeof YaGames!=='undefined'&&YaGames&&typeof YaGames.init==='function'){YaGames.init().then(ctx=>{YaGamesCtx=ctx;console.log('✅ Yandex Games SDK готов');try{ctx.features.LoadingAPI&&ctx.features.LoadingAPI.ready()}catch(e){}}).catch(()=>{console.log('SDK: не на платформе Яндекс Игр')})}}catch(e){}})();
function beep(freq,dur){try{if(vol<=0||!active)return;if(!audioCtxRef.ctx)audioCtxRef.ctx=new (window.AudioContext||window.webkitAudioContext)();const ctx=audioCtxRef.ctx,o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=freq;o.type='square';g.gain.value=vol/100*.08;o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+(dur||.08))}catch(e){}}
function openSettings(){openPanel({title:'⚙️ Настройки',desc:'Чувствительность мыши и громкость звука. Интеграция с Яндекс Играми подключена автоматически.',buttons:[],sliders:true})}
function buildSliders(){actions.innerHTML='';
 const s1=document.createElement('div');s1.className='settingRow';s1.innerHTML='<label>🖱️ Чувствительность мыши</label><input id="sensRange" type="range" min="5" max="100" value="'+Math.round(sens*100)+'"><b id="sensVal">'+Math.round(sens*100)+'%</b>';
 const s2=document.createElement('div');s2.className='settingRow';s2.innerHTML='<label>🔊 Громкость</label><input id="volRange" type="range" min="0" max="100" value="'+vol+'"><b id="volVal">'+vol+'%</b>';
 actions.append(s1,s2);
 const sr=s1.querySelector('#sensRange'),vr=s2.querySelector('#volRange');
 sr.oninput=()=>{sens=sr.value/100;s1.querySelector('#sensVal').textContent=sr.value+'%';localStorage.setItem('gymrob_sens',sens)};
 vr.oninput=()=>{vol=+vr.value;s2.querySelector('#volVal').textContent=vr.value+'%';localStorage.setItem('gymrob_vol',vol);beep(600,.06)};
 const btn=document.createElement('button');btn.textContent='Сохранить настройки';btn.onclick=()=>{closePanel();toast('Настройки сохранены ✅');beep(880,.1)};actions.append(btn)}
const _openPanel=openPanel;openPanel=function(zone){_openPanel(zone);if(zone.sliders)buildSliders()};
document.addEventListener('keydown',e=>{if(e.code==='KeyE')interact();if(e.code==='Escape')closePanel();if(e.code==='KeyF'&&active&&panel.classList.contains('hidden'))attackNearest()});
let yaw=0,pitch=0,keys={};document.addEventListener('keydown',e=>keys[e.code]=true);document.addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('click',()=>{if(active&&!('ontouchstart'in window)&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.()});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.002*(sens*5);pitch-=e.movementY*.002*(sens*5);pitch=Math.max(-1.3,Math.min(1.3,pitch));camera.rotation.set(pitch,yaw,0,'YXZ')}});
let joy={x:0,y:0};const stick=document.querySelector('#stick'),knob=document.querySelector('#stickKnob');stick.addEventListener('pointermove',e=>{if(e.buttons===0)return;const r=stick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy),scale=Math.min(1,45/(len||1));joy.x=dx*scale/45;joy.y=dy*scale/45;knob.style.transform='translate('+joy.x*32+'px,'+joy.y*32+'px)'});for(const ev of ['pointerup','pointercancel'])stick.addEventListener(ev,()=>{joy={x:0,y:0};knob.style.transform='translate(0,0)'});
document.querySelector('#play').onclick=()=>{document.querySelector('#start').classList.add('hidden');active=true;renderer.domElement.requestPointerLock?.()};
updateHud();equipSword(state.sword>=1);
let last=performance.now();function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.05);last=now;
 // enemies AI + respawn
 for(const v of villagers)v.update(dt);
 for(const e of enemies){if(!e.alive&&now>=e.respawnAt){e.alive=true;e.hp=e.maxHp;e.pos.set(e.area.cx+(Math.random()*4-2),0,e.area.cz+(Math.random()*4-2));e.dest=e.randomDest();e.drawBar();scene.add(e.g)}e.update(dt)}
 // player regen + swing animation + sword follow
 if(active){if(playerHp<100&&now-lastRegen>4000){playerHp=Math.min(100,playerHp+8*dt+.01);updPlayerHpHud()}
  if(swingT>0){swingT-=dt;if(heldSword)heldSword.rotation.x=-1.6*Math.sin((1-swingT/.3)*Math.PI)}else if(heldSword)heldSword.rotation.x=0}
 if(active&&panel.classList.contains('hidden')){const forward=(keys.KeyW?1:0)-(keys.KeyS?1:0)-joy.y,right=(keys.KeyD?1:0)-(keys.KeyA?1:0)+joy.x;const v=5+Math.min(state.speed,30)*.16,dir=new THREE.Vector3(right,0,-forward);if(dir.lengthSq()>0){dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);camera.position.addScaledVector(dir,v*dt)}camera.position.x=THREE.MathUtils.clamp(camera.position.x,-24,24);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-24,24);
  const pd=Math.hypot(camera.position.x-pond.cx,camera.position.z-pond.cz);if(pd<pond.r+.4){const push=new THREE.Vector3(camera.position.x-pond.cx,0,camera.position.z-pond.cz).normalize().multiplyScalar(pond.r+.4);camera.position.x=pond.cx+push.x;camera.position.z=pond.cz+push.z}
  camera.position.y=1.7;let near=null,nd=99;for(const z of zones){const d=Math.hypot(camera.position.x-z.pos[0],camera.position.z-z.pos[1]);if(d<z.radius&&d<nd){near=z;nd=d}}document.querySelector('#hint').textContent=near?'Нажми E или ДЕЙСТВИЕ — '+near.title:'WASD — движение · мышь — обзор · E — взаимодействие · ЛКМ — атака мечом'}
 renderer.render(scene,camera)}requestAnimationFrame(loop);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
