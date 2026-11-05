import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const root=document.querySelector('#game'), scene=new THREE.Scene();scene.background=new THREE.Color(0x8ed8ff);scene.fog=new THREE.Fog(0x8ed8ff,35,95);
const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,150);camera.position.set(0,1.7,12);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;root.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x64748b,2));const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(-12,22,10);sun.castShadow=true;scene.add(sun);
const mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.8});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),mat(0x7bc96f));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
function box(x,y,z,w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function label(text,x,z,color='#fff'){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#14213ddd';ctx.roundRect(8,8,496,112,22);ctx.fill();ctx.font='bold 46px Arial';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,256,80);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.position.set(x,4.2,z);s.scale.set(6,1.5,1);scene.add(s)}
// Colorful Roblox-like training plaza
box(0,.1,0,42,.2,34,0xb5c8d8);
for(let i=-18;i<=18;i+=6){box(i,.22,0,.12,.03,32,0x9aafc0);box(0,.22,i*.7,40,.03,.12,0x9aafc0)}
// boxing bags: red area left
box(-13,.4,-3,8,.5,9,0xf4b2a7);label('БОКСЁРСКИЕ ГРУШИ',-13,-3,'#ffb2a5');
for(let i=0;i<3;i++){box(-15+i*2,.25,-3,1.2,.35,1.2,0x333b4d);const bag=new THREE.Mesh(new THREE.CylinderGeometry(.48,.55,2.2,16),mat(0xe94343));bag.position.set(-15+i*2,1.55,-3);bag.castShadow=true;scene.add(bag);box(-15+i*2,2.72,-3,.12,.4,.12,0x333333)}
// treadmills blue zone rear
box(0,.4,-12,9,.5,7,0x8dbdff);label('БЕГОВЫЕ ДОРОЖКИ',0,-12,'#a8caff');
for(let i=0;i<3;i++){box(-2.8+i*2.8,.65,-12,1.5,.25,3.5,0x26364d);box(-2.8+i*2.8,1.5,-13.5,.12,1.8,.12,0x26364d);box(-2.8+i*2.8,2.35,-13.5,1.1,.12,.12,0x26364d)}
// egg hatch yellow
box(-13,.35,10,8,.5,7,0xf5db72);label('ЯЙЦА И ПИТОМЦЫ',-13,10,'#ffe68a');
for(let i=0;i<3;i++){const e=new THREE.Mesh(new THREE.SphereGeometry(.8,20,16),mat([0xfff4cf,0xffc7dc,0xbfe9ff][i]));e.scale.y=1.25;e.position.set(-15+i*2,1.5,10);e.castShadow=true;scene.add(e)}
// glove shop black
box(0,.5,10,8,.7,7,0x343946);label('МАГАЗИН ПЕРЧАТОК',0,10,'#ffffff');box(0,1.5,10,3,1.2,.4,0x171b24);
for(let i=0;i<3;i++){const g=new THREE.Mesh(new THREE.SphereGeometry(.65,16,12),mat([0xe74b4b,0x397de8,0xe5b83d][i]));g.scale.set(.8,1.1,.65);g.position.set(-2+i*2,2.2,9.5);scene.add(g)}
// shoe shop green
box(13,.35,10,8,.5,7,0x8bdb9b);label('МАГАЗИН КРОССОВОК',13,10,'#c5ffd1');for(let i=0;i<3;i++){box(11+i*2,1,10,.9,.45,1.5,[0xffd24d,0x65b9ff,0xff7aa8][i])}
// decorative walls and trees
for(let x=-20;x<=20;x+=5){box(x,1,-18,.7,2,.7,0x62728a);const top=new THREE.Mesh(new THREE.ConeGeometry(1.5,3,8),mat(0x299b62));top.position.set(x,3.3,-18);scene.add(top)}
const state=JSON.parse(localStorage.getItem('gymrob')||'null')||{strength:1,speed:1,coins:500,glove:1,shoe:1,pet:1};
let currentZone=null,active=false,toastTimer;
function save(){localStorage.setItem('gymrob',JSON.stringify(state));updateHud()}
function updateHud(){for(const k of ['strength','speed','coins'])document.getElementById(k).textContent=state[k].toLocaleString('ru-RU')}
function toast(t){const el=document.querySelector('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1800)}
const panel=document.querySelector('#panel'),actions=document.querySelector('#panelActions');
function openPanel(zone){currentZone=zone;panel.classList.remove('hidden');document.querySelector('#panelTitle').textContent=zone.title;document.querySelector('#panelDesc').textContent=zone.desc;actions.innerHTML='';zone.buttons.forEach(b=>{const el=document.createElement('button');el.textContent=b.text;el.onclick=b.run;actions.append(el)})}
function closePanel(){panel.classList.add('hidden');currentZone=null}
document.querySelector('#closePanel').onclick=closePanel;
function actionButton(text,run){return {text,run}}
const zones=[
{title:'Боксёрские груши',desc:'Бей грушу, чтобы получать силу. Улучшения становятся дороже постепенно.',pos:[-13,-3],radius:5,buttons:[actionButton('УДАРИТЬ (+ сила)',()=>{state.strength+=state.glove*state.pet;state.coins+=2*state.pet;save();toast('Сила увеличена! +2 монеты') }),actionButton('ТРЕНИРОВКА СИЛЫ — 100 монет',()=>{if(state.coins<100)return toast('Не хватает монет');state.coins-=100;state.strength+=5;save();toast('+5 силы')})]},
{title:'Беговые дорожки',desc:'Беги, чтобы развивать скорость. Скорость немного ускоряет передвижение.',pos:[0,-12],radius:5,buttons:[actionButton('БЕЖАТЬ (+ скорость)',()=>{state.speed+=state.shoe*state.pet*.5;state.coins+=2;save();toast('Скорость увеличена!')})]},
{title:'Яйца питомцев',desc:'Питомцы дают небольшой бонус к тренировкам. Яйцо стоит 250 монет.',pos:[-13,10],radius:5,buttons:[actionButton('ВЫЛУПИТЬ ЯЙЦО — 250 🪙',()=>{if(state.coins<250)return toast('Не хватает монет');state.coins-=250;const pets=['Кубический щенок','Неоновый кот','Золотой нуб'];const pet=pets[Math.floor(Math.random()*pets.length)];state.pet=Math.min(3,state.pet+.25);save();toast('Выпал питомец: '+pet+'! Бонус тренировки повышен')})]},
{title:'Магазин перчаток',desc:'Перчатки умножают прирост силы. Каждая следующая дороже.',pos:[0,10],radius:5,buttons:[1,2,3].map((n)=>actionButton(['Перчатки x1.5 — 300 🪙','Перчатки x2 — 900 🪙','Перчатки x3 — 2500 🪙'][n-1],()=>{const costs=[300,900,2500],mult=[1.5,2,3];if(state.glove>=mult[n-1])return toast('Уже куплено');if(state.coins<costs[n-1])return toast('Не хватает монет');state.coins-=costs[n-1];state.glove=mult[n-1];save();toast('Куплены перчатки x'+state.glove)}))},
{title:'Магазин кроссовок',desc:'Кроссовки увеличивают скорость, которую получаешь на дорожке.',pos:[13,10],radius:5,buttons:[1,2,3].map((n)=>actionButton(['Кроссовки x1.5 — 300 🪙','Кроссовки x2 — 900 🪙','Кроссовки x3 — 2500 🪙'][n-1],()=>{const costs=[300,900,2500],mult=[1.5,2,3];if(state.shoe>=mult[n-1])return toast('Уже куплено');if(state.coins<costs[n-1])return toast('Не хватает монет');state.coins-=costs[n-1];state.shoe=mult[n-1];save();toast('Куплены кроссовки x'+state.shoe)}))}
];
function interact(){if(currentZone){closePanel();return}let best=null,dist=Infinity;for(const z of zones){const d=Math.hypot(camera.position.x-z.pos[0],camera.position.z-z.pos[1]);if(d<z.radius&&d<dist){best=z;dist=d}}if(best)openPanel(best);else toast('Подойди ближе к нужной зоне')}
document.querySelector('#actionBtn').onclick=interact;
document.querySelector('#menuBtn').onclick=()=>openPanel({title:'Твой профиль',desc:'Тренируйся и улучшай экипировку.',buttons:[actionButton('Сохранить прогресс',()=>{save();toast('Прогресс сохранён')})]});
document.addEventListener('keydown',e=>{if(e.code==='KeyE')interact();if(e.code==='Escape')closePanel()});
let yaw=0,pitch=0,keys={};document.addEventListener('keydown',e=>keys[e.code]=true);document.addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('click',()=>{if(active&&!('ontouchstart'in window)&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.()});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.002;pitch-=e.movementY*.002;pitch=Math.max(-1.3,Math.min(1.3,pitch));camera.rotation.set(pitch,yaw,0,'YXZ')}});
let joy={x:0,y:0};const stick=document.querySelector('#stick'),knob=document.querySelector('#stickKnob');stick.addEventListener('pointermove',e=>{if(e.buttons===0)return;const r=stick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy),scale=Math.min(1,45/(len||1));joy.x=dx*scale/45;joy.y=dy*scale/45;knob.style.transform='translate('+joy.x*32+'px,'+joy.y*32+'px)'});for(const ev of ['pointerup','pointercancel'])stick.addEventListener(ev,()=>{joy={x:0,y:0};knob.style.transform='translate(0,0)'});
document.querySelector('#play').onclick=()=>{document.querySelector('#start').classList.add('hidden');active=true;renderer.domElement.requestPointerLock?.()};
updateHud();
let last=performance.now();function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.05);last=now;if(active&&panel.classList.contains('hidden')){const forward=(keys.KeyW?1:0)-(keys.KeyS?1:0)-joy.y,right=(keys.KeyD?1:0)-(keys.KeyA?1:0)+joy.x;const v=5+Math.min(state.speed,30)*.16,dir=new THREE.Vector3(right,0,-forward);if(dir.lengthSq()>0){dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);camera.position.addScaledVector(dir,v*dt)}camera.position.x=THREE.MathUtils.clamp(camera.position.x,-19,19);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-15,15);camera.position.y=1.7;let near=null,nd=99;for(const z of zones){const d=Math.hypot(camera.position.x-z.pos[0],camera.position.z-z.pos[1]);if(d<z.radius&&d<nd){near=z;nd=d}}document.querySelector('#hint').textContent=near?'Нажми E или ДЕЙСТВИЕ — '+near.title:'WASD — движение · мышь — обзор · E — взаимодействие'}renderer.render(scene,camera)}requestAnimationFrame(loop);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
