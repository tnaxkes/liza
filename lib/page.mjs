const PHOTO_COUNT = 17;

const S = {
  start:
`привет 🤍

это бот. но писал его не бот, а я — от первой буквы до последней.
сегодня твой день, и я решил, что обычного сообщения в лс будет мало.`,

  ask:
`для начала докажи, что это правда ты, а не твоя мама читает мои сопли.

напиши что угодно. одно слово хватит.`,

  after_text:
`ну вот, теперь верю.

я весь день думал, с чего начать. и понял, что начать надо с того, что я редко говорю вслух.`,

  step2:
`с того, что ты для меня не «девушка», не «подруга», не «человек с которым общаюсь».

ты свой человек. как семья.
и я это понял не вчера и не сегодня.`,

  step3:
`дальше словами в телеграме не получится, слов слишком много.

я кое-что для тебя собрал. открывай кнопку внизу экрана 👇
только не листай быстро, я правда старался.`,

  finish:
`ну всё.

а теперь спустись вниз. я жду тебя там.
❤️`,
};

function PAGE(origin) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>с днём рождения</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
:root{
  --night:#0c0a10;
  --cream:#f7efe4;
  --amber:#ffc06b;
  --rose:#ff90a6;
  --dim:#a1959c;
}
html,body{height:100%;overflow:hidden}
body{
  background:var(--night);color:var(--cream);
  font-family:-apple-system,'SF Pro Text','Segoe UI',system-ui,sans-serif;
  user-select:none;-webkit-user-select:none;
  position:fixed;inset:0;
}
.serif{font-family:'Iowan Old Style',Georgia,'Times New Roman',serif}

/* атмосфера */
#glow{position:fixed;inset:-25%;z-index:0;filter:blur(80px);opacity:.7;
  background:
    radial-gradient(38% 38% at 25% 25%,#5a2a12,transparent),
    radial-gradient(42% 42% at 75% 35%,#3b1c40,transparent),
    radial-gradient(46% 46% at 50% 80%,#7a2f3d,transparent);
  animation:drift 22s ease-in-out infinite alternate}
@keyframes drift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-3%,2%) scale(1.12)}}
#grain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.045;
  background-image:repeating-radial-gradient(circle,#fff 0 1px,transparent 1px 3px)}
#dust{position:fixed;inset:0;z-index:1;pointer-events:none}
.d{position:absolute;width:2px;height:2px;border-radius:50%;background:var(--amber);opacity:0;animation:tw linear infinite}
@keyframes tw{0%{opacity:0;transform:translateY(0)}40%{opacity:.8}100%{opacity:0;transform:translateY(-60px)}}

#stage{position:relative;z-index:2;height:100%;width:100%}
.scene{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;padding:26px 22px calc(26px + env(safe-area-inset-bottom));
  opacity:0;transform:translateY(14px);filter:blur(6px);pointer-events:none;
  transition:opacity .8s cubic-bezier(.2,.8,.2,1),transform .8s cubic-bezier(.2,.8,.2,1),filter .8s ease}
.scene.on{opacity:1;transform:none;filter:none;pointer-events:auto}

.kick{font-size:.66rem;letter-spacing:3.5px;text-transform:uppercase;color:var(--amber);opacity:.75;margin-bottom:16px}
.big{font-size:2.3rem;line-height:1.1}
.lede{font-size:1rem;line-height:1.6;color:#f7efe4c4;max-width:310px;margin-top:14px}

.next{margin-top:26px;padding:13px 30px;border:1px solid rgba(255,192,107,.45);border-radius:40px;
  background:rgba(255,192,107,.1);color:var(--amber);font-size:.95rem;letter-spacing:.3px;cursor:pointer;
  transition:.2s;backdrop-filter:blur(6px)}
.next:active{transform:scale(.95)}
.hidden{display:none!important}
.fadein{opacity:0;animation:fi .8s ease forwards}
@keyframes fi{to{opacity:1}}

/* 0 — фитиль */
#igw{position:relative;width:170px;height:170px;display:flex;align-items:center;justify-content:center;touch-action:none}
#igw .bg{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(247,239,228,.13)}
#igw svg{position:absolute;inset:0;transform:rotate(-90deg)}
#igw circle{fill:none;stroke:var(--amber);stroke-width:2.5;stroke-linecap:round;
  stroke-dasharray:508;stroke-dashoffset:508;filter:drop-shadow(0 0 7px var(--amber))}
.core{width:66px;height:66px;border-radius:50%;
  background:radial-gradient(circle at 40% 35%,#fff2d0,var(--amber) 45%,#c9622a);
  box-shadow:0 0 34px rgba(255,192,107,.6);animation:pc 2s ease-in-out infinite}
@keyframes pc{0%,100%{transform:scale(1)}50%{transform:scale(1.09)}}

/* 1 — имя */
.ch{display:inline-block;opacity:0;transform:translateY(20px) scale(.7);
  animation:chin .55s cubic-bezier(.2,.9,.2,1) forwards;text-shadow:0 0 24px rgba(255,144,166,.5)}
@keyframes chin{to{opacity:1;transform:none}}

/* 2 — свечи */
.cakeWrap{position:relative;margin:10px 0 4px}
.candles{display:flex;gap:16px;justify-content:center;align-items:flex-end;height:80px}
.candle{position:relative;width:13px;height:56px;border-radius:3px;
  background:repeating-linear-gradient(180deg,#f7efe4 0 7px,#ffd9df 7px 14px);cursor:pointer}
.flame{position:absolute;left:50%;top:-19px;transform:translateX(-50%);
  width:13px;height:19px;border-radius:50% 50% 50% 50%/62% 62% 38% 38%;
  background:radial-gradient(circle at 50% 70%,#fff6d8,var(--amber) 55%,#e2622a);
  box-shadow:0 0 18px rgba(255,180,80,.8);animation:fl .55s ease-in-out infinite alternate;transform-origin:50% 100%}
@keyframes fl{from{transform:translateX(-50%) scaleY(1) rotate(-3deg)}to{transform:translateX(-50%) scaleY(1.16) rotate(3deg)}}
.candle.out .flame{animation:none;opacity:0;transition:opacity .3s}
.smoke{position:absolute;left:50%;top:-22px;width:5px;height:5px;border-radius:50%;background:#f7efe455;opacity:0}
.candle.out .smoke{animation:sm 1.3s ease-out forwards}
@keyframes sm{0%{opacity:.7;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-46px) scale(2.6)}}
.cake{width:190px;height:56px;border-radius:10px 10px 16px 16px;margin-top:2px;
  background:linear-gradient(180deg,#ffe0c2,#e8a06f 40%,#8e4a2e);
  box-shadow:0 14px 34px rgba(0,0,0,.5);position:relative;overflow:hidden}
.cake:after{content:'';position:absolute;top:11px;left:0;right:0;height:11px;background:#fff1dd;
  clip-path:polygon(0 0,100% 0,100% 40%,92% 100%,84% 40%,76% 100%,68% 40%,60% 100%,52% 40%,44% 100%,36% 40%,28% 100%,20% 40%,12% 100%,4% 40%,0 60%)}

/* 3 — «с тобой» */
.qBox{width:100%;max-width:330px}
.qRow{display:flex;flex-direction:column;gap:11px;margin-top:20px}
.qItem{padding:15px 18px;border-radius:16px;border:1px solid rgba(247,239,228,.14);
  background:rgba(247,239,228,.045);font-size:1rem;display:flex;justify-content:space-between;align-items:center;
  cursor:pointer;transition:.35s}
.qItem:active{transform:scale(.98)}
.qItem .ans{color:var(--rose);opacity:0;transform:translateX(10px);transition:.45s;font-size:.95rem;white-space:nowrap}
.qItem.done{border-color:rgba(255,144,166,.4);background:rgba(255,144,166,.09)}
.qItem.done .ans{opacity:1;transform:none}

/* 4 — плёнка */
.filmWrap{position:relative;width:100%;height:66vh;display:flex;align-items:center;justify-content:center}
.deck{position:relative;width:min(76vw,300px);height:100%;max-height:430px}
.pl{position:absolute;inset:0;border-radius:6px;background:#f7efe4;padding:9px 9px 42px;
  box-shadow:0 22px 46px rgba(0,0,0,.55);transition:transform .55s cubic-bezier(.2,.8,.2,1),opacity .45s ease;
  display:flex;flex-direction:column;will-change:transform}
.pl img{width:100%;height:100%;object-fit:cover;border-radius:3px;background:#221c22;display:block}
.pl .cap{position:absolute;bottom:12px;left:0;right:0;text-align:center;color:#5a4a50;font-size:.72rem;letter-spacing:2px}
.filmHint{margin-top:14px;font-size:.78rem;color:var(--dim);letter-spacing:1px}
.counter{position:absolute;top:-4px;left:50%;transform:translateX(-50%);font-size:.68rem;letter-spacing:3px;color:var(--amber);opacity:.8}

/* 5 — письмо */
#letter{justify-content:flex-start;padding-top:56px}
.paper{width:100%;max-width:340px;height:68vh;overflow-y:auto;text-align:left;
  -webkit-overflow-scrolling:touch;padding-right:4px;user-select:text;-webkit-user-select:text}
.paper::-webkit-scrollbar{width:2px}
.paper::-webkit-scrollbar-thumb{background:rgba(255,192,107,.4);border-radius:2px}
.paper p{font-size:1rem;line-height:1.72;margin-bottom:17px;color:#f7efe4dd}
.paper p.hi{color:var(--amber)}
.paper .sig{font-size:1.05rem;color:var(--rose);margin-top:8px}
.scrollCue{position:absolute;bottom:calc(16px + env(safe-area-inset-bottom));font-size:.74rem;color:var(--dim);
  animation:bob 2s ease-in-out infinite}
@keyframes bob{0%,100%{opacity:.4;transform:translateY(0)}50%{opacity:1;transform:translateY(4px)}}

/* 6 — финал */
svg.heart{width:130px;height:130px}
.heart path{fill:none;stroke:var(--rose);stroke-width:4;stroke-linecap:round;stroke-dasharray:1000;stroke-dashoffset:1000}
.scene.on svg.heart path{animation:draw 2.2s ease forwards,fillIn .9s ease 2s forwards,beat 1.5s ease-in-out 2.9s infinite}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes fillIn{to{fill:rgba(255,144,166,.22)}}
@keyframes beat{0%,100%{transform:scale(1)}45%{transform:scale(1.07)}}
.heart{transform-origin:center}
.fin{position:absolute;font-size:1.2rem;pointer-events:none;z-index:30;animation:fall linear forwards}
@keyframes fall{to{transform:translateY(108vh) rotate(420deg);opacity:0}}
#flash{position:fixed;inset:0;z-index:20;pointer-events:none;opacity:0;
  background:radial-gradient(circle,rgba(255,220,170,.95),transparent 62%)}
#flash.go{animation:fx .9s ease forwards}
@keyframes fx{0%{opacity:0;transform:scale(.3)}28%{opacity:1}100%{opacity:0;transform:scale(2.6)}}

#prog{position:absolute;top:calc(12px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);
  display:flex;gap:6px;z-index:6}
.pd{width:6px;height:6px;border-radius:50%;background:#ffffff2b;transition:.3s}
.pd.act{background:var(--amber);width:17px;border-radius:3px}

@media (prefers-reduced-motion:reduce){*{animation-duration:.01s!important;transition-duration:.15s!important}}
</style>
</head>
<body>
<div id="glow"></div><div id="grain"></div><div id="dust"></div><div id="flash"></div>
<div id="prog"></div>

<div id="stage">

  <!-- 0 -->
  <div class="scene on" data-i="0">
    <div class="kick">кое-что для тебя</div>
    <div id="igw">
      <div class="bg"></div>
      <svg viewBox="0 0 170 170"><circle cx="85" cy="85" r="81"></circle></svg>
      <div class="core"></div>
    </div>
    <div class="lede serif">удерживай, чтобы зажечь</div>
  </div>

  <!-- 1 -->
  <div class="scene" data-i="1">
    <div class="kick">сегодня — твой день</div>
    <div class="big serif" id="nameT"></div>
    <div class="lede serif">с днём рождения 🤍</div>
    <button class="next" onclick="next()">дальше</button>
  </div>

  <!-- 2 -->
  <div class="scene" data-i="2">
    <div class="kick">сначала — по традиции</div>
    <div class="cakeWrap">
      <div class="candles" id="candles"></div>
      <div class="cake"></div>
    </div>
    <div class="lede serif" id="candleTxt">задуй свечи. по одной, тапом.</div>
    <button class="next hidden" id="candleBtn" onclick="next()">загадала</button>
  </div>

  <!-- 3 -->
  <div class="scene" data-i="3">
    <div class="kick">небольшая проверка памяти</div>
    <div class="qBox">
      <div class="big serif" style="font-size:1.5rem">с кем?</div>
      <div class="qRow" id="qRow"></div>
    </div>
    <button class="next hidden" id="qBtn" onclick="next()">ну да, всё так</button>
  </div>

  <!-- 4 -->
  <div class="scene" data-i="4">
    <div class="kick">плёнка</div>
    <div class="filmWrap">
      <div class="counter" id="cnt"></div>
      <div class="deck" id="deck"></div>
    </div>
    <div class="filmHint">тапни, чтобы листать</div>
    <button class="next hidden" id="filmBtn" onclick="next()">дальше</button>
  </div>

  <!-- 5 -->
  <div class="scene" id="letter" data-i="5">
    <div class="kick">теперь главное</div>
    <div class="paper" id="paper"></div>
    <div class="scrollCue" id="cue">листай вниз ↓</div>
    <button class="next hidden" id="letterBtn" onclick="next()">я дочитала</button>
  </div>

  <!-- 6 -->
  <div class="scene" data-i="6">
    <svg class="heart" viewBox="0 0 100 100"><path d="M50 88 C15 62 6 42 16 27 C25 14 42 15 50 30 C58 15 75 14 84 27 C94 42 85 62 50 88 Z"/></svg>
    <div class="big serif" style="font-size:1.7rem;margin-top:6px">ну всё.</div>
    <div class="lede serif" id="finTxt">а теперь спустись вниз.<br>я жду тебя там.</div>
    <button class="next" id="finBtn" onclick="finish()">иду 🤍</button>
  </div>

</div>

<script>
const ORIGIN = "${origin}";
const TG = window.Telegram && window.Telegram.WebApp;
if (TG) { TG.ready(); TG.expand(); try{ TG.setHeaderColor('#0c0a10'); TG.setBackgroundColor('#0c0a10'); }catch(e){} }
const NAME = "Лиза";
const WHO = (TG && TG.initDataUnsafe && TG.initDataUnsafe.user && TG.initDataUnsafe.user.first_name) || NAME;
function track(step){
  try{ fetch(ORIGIN+"/track",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({step:step,name:WHO})}).catch(function(){}); }catch(e){}
}
function buzz(t){ try{ TG.HapticFeedback.impactOccurred(t||'light'); }catch(e){} }

const scenes=[...document.querySelectorAll('.scene')];
const TRACK=['открыла приложение','зажгла фитиль','задула свечи','прошла «с кем?»','долистала плёнку','дочитала письмо','дошла до финала'];
let cur=0;
const prog=document.getElementById('prog');
scenes.forEach(()=>{const d=document.createElement('div');d.className='pd';prog.appendChild(d)});
function paint(){[...prog.children].forEach((d,i)=>d.classList.toggle('act',i===cur))}
function go(i){
  scenes[cur].classList.remove('on'); cur=i; scenes[cur].classList.add('on'); paint(); buzz();
  track(TRACK[cur]||('шаг '+cur));
  if(cur===1) name1();
  if(cur===2) candles();
  if(cur===3) quiz();
  if(cur===4) film();
  if(cur===5) letter();
  if(cur===6) confetti();
}
function next(){ if(cur<scenes.length-1) go(cur+1) }
paint(); track('открыла приложение');

/* --- 0 фитиль --- */
(function(){
  const w=document.getElementById('igw'), c=w.querySelector('circle');
  const C=508; let v=0,hold=false,raf,done=false;
  function loop(){
    v = hold ? Math.min(1,v+0.022) : Math.max(0,v-0.035);
    c.style.strokeDashoffset=C*(1-v);
    if(v>=1&&!done){ done=true; const f=document.getElementById('flash'); f.classList.add('go'); buzz('heavy'); setTimeout(()=>go(1),620); return }
    raf=requestAnimationFrame(loop);
  }
  w.addEventListener('pointerdown',e=>{e.preventDefault();hold=true;cancelAnimationFrame(raf);loop()});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>w.addEventListener(ev,()=>hold=false));
})();

/* --- 1 имя --- */
let nd=false;
function name1(){
  if(nd)return; nd=true;
  const el=document.getElementById('nameT');
  [...NAME].forEach((ch,i)=>{const s=document.createElement('span');s.className='ch';s.textContent=ch;
    s.style.animationDelay=(0.08+i*0.075)+'s';el.appendChild(s)});
}

/* --- 2 свечи --- */
let cd=false;
function candles(){
  if(cd)return; cd=true;
  const box=document.getElementById('candles'); let left=3;
  for(let i=0;i<3;i++){
    const c=document.createElement('div'); c.className='candle';
    c.innerHTML='<div class="smoke"></div><div class="flame"></div>';
    c.onclick=()=>{ if(c.classList.contains('out'))return; c.classList.add('out'); buzz('medium'); left--;
      if(left===0){ document.getElementById('candleTxt').textContent='загадала желание? тогда оно сбудется, я прослежу.';
        document.getElementById('candleBtn').classList.remove('hidden'); } };
    box.appendChild(c);
  }
}

/* --- 3 с кем --- */
const Q=[['каток?','с тобой'],['галереи?','с тобой'],['любое место в мск?','с тобой'],['отдых вдвоём?','с тобой']];
let qd=false;
function quiz(){
  if(qd)return; qd=true;
  const row=document.getElementById('qRow'); let n=0;
  Q.forEach(([q,a])=>{
    const el=document.createElement('div'); el.className='qItem';
    el.innerHTML='<span>'+q+'</span><span class="ans">— '+a+'</span>';
    el.onclick=()=>{ if(el.classList.contains('done'))return; el.classList.add('done'); buzz(); n++;
      if(n===Q.length){ setTimeout(()=>document.getElementById('qBtn').classList.remove('hidden'),500) } };
    row.appendChild(el);
  });
}

/* --- 4 плёнка --- */
const N=${PHOTO_COUNT};
let fd=false;
function film(){
  if(fd)return; fd=true;
  const deck=document.getElementById('deck'); const cnt=document.getElementById('cnt');
  let top=0, seen=1;
  const cards=[];
  for(let i=N-1;i>=0;i--){
    const d=document.createElement('div'); d.className='pl';
    const rot=(i%2?1:-1)*(1.2+(i%3));
    d.style.transform='rotate('+rot+'deg)';
    d.dataset.rot=rot;
    const img=document.createElement('img');
    img.loading = i<3 ? 'eager' : 'lazy';
    img.src='/p/'+i+'.jpg';
    d.appendChild(img);
    const cap=document.createElement('div'); cap.className='cap'; cap.textContent='мы';
    d.appendChild(cap);
    deck.appendChild(d); cards[i]=d;
  }
  function upd(){ cnt.textContent=String(top+1).padStart(2,'0')+' / '+String(N).padStart(2,'0') }
  upd();
  deck.onclick=()=>{
    const c=cards[top]; buzz();
    c.style.transform='translate(-120%,-8%) rotate(-22deg)'; c.style.opacity='0';
    top++; seen++;
    if(top>=N){ setTimeout(()=>{ document.getElementById('filmBtn').classList.remove('hidden'); },350); cnt.textContent='это всё'; return }
    upd();
    if(seen>=Math.min(5,N)) document.getElementById('filmBtn').classList.remove('hidden');
  };
}

/* --- 5 письмо --- */
const LETTER=[
 ["h","поздравляю тебя с твоим днём."],
 ["","я никогда не встречал людей, которые стали бы мне настолько близки. ты для меня как будто член семьи, «свой» человек, и как будто уже большая часть моей жизни."],
 ["","всегда буду вспоминать смену в 23-м, где увидел тебя в первый раз. я тогда посчитал тебя мега красивой — считаю так и по сей день. но ты была в отряде постарше, активная, со всеми общалась, и я как-то побоялся подойти познакомиться."],
 ["","и я очень рад, что дальше нас всё равно свела судьба. пускай немного неожиданно."],
 ["","я помню всё с самого начала. как мы долго «дружили», много общались и гуляли. как ты стала мне подругой, потом лучшей подругой, а потом самой лучшей и близкой."],
 ["","помню, как ездил в говорово в снег и в дождь, в мороз и в темноту, и возвращался домой довольный — хотя все думали, что я гуляю в одинцово. помню, как ты начинала мне нравиться и я боялся сделать первый шаг."],
 ["","потом ты стала большой и чёткой страницей. все радостные моменты проходили с тобой, грустные тоже. мы проходили новые этапы, узнавали друг друга детальнее."],
 ["","мне кажется, я никого не знаю так, как тебя: все твои фразы, действия, привычки, даже выражения лица в конкретные моменты. а ты знаешь меня как никто другой. мне нравится, что мы с возрастом остаёмся вместе и узнаём друг друга лучше."],
 ["","с тобой мне комфортно. я чувствую себя как дома — и такого я не чувствовал ни с кем, кроме родителей."],
 ["h","как будто с тобой я был везде и попробовал всё."],
 ["","каток — с тобой. галереи — с тобой. любое место в мск — с тобой. я с тобой даже вдвоём отдыхать ездил, камон. у кого ещё такое есть — покажите."],
 ["","ты остаёшься той же большой частью меня. пускай этот год был ошибкой — назовём это так — я всё равно не забывал про тебя. пускай мы не общались и были забиты своими делами, внутри, в голове или в сердце, ты оставалась ровно на том же месте. я как будто был уверен, что это временно и рано или поздно всё вернётся на круги своя."],
 ["h","а теперь то, ради чего всё это."],
 ["","я искренне удивляюсь, как можно так реагировать, просто услышав твоё имя. хочу поздравить тебя по-настоящему: ты мега перспективная девочка, умная, целеустремлённая, при этом не избалованная и с хорошим окружением."],
 ["","радуйся и дорожи тем, что имеешь — потому что имеешь ты правда много. но и не забывай хвалить себя за собственные достижения: их тоже абы кто не добьётся."],
 ["","у тебя всегда есть открытый к тебе близкий человек в моём лице. я всегда готов приехать, помочь как могу — хоть эти твои неудобные полки собирать, — поговорить и сделать всё, чтобы тебе было спокойно и комфортно."],
 ["","я очень тебя ценю и рад, что с тобой познакомился."],
 ["sig","ещё раз — с твоим днём ❤️"]
];
let ld=false;
function letter(){
  if(ld)return; ld=true;
  const p=document.getElementById('paper');
  LETTER.forEach(([cls,txt],i)=>{
    const el=document.createElement('p');
    if(cls) el.className=cls==='sig'?'sig':'hi';
    el.textContent=txt; el.style.opacity='0';
    el.style.animation='fi .8s ease forwards'; el.style.animationDelay=(0.15+i*0.12)+'s';
    p.appendChild(el);
  });
  p.onscroll=()=>{
    if(p.scrollTop+p.clientHeight>=p.scrollHeight-40){
      document.getElementById('cue').style.display='none';
      document.getElementById('letterBtn').classList.remove('hidden');
    }
  };
  setTimeout(()=>{ if(p.scrollHeight<=p.clientHeight+10){
    document.getElementById('cue').style.display='none';
    document.getElementById('letterBtn').classList.remove('hidden'); } },900);
}

/* --- 6 финал --- */
function confetti(){
  const em=['🤍','❤️','✨','🎂','💫','🎈'];
  for(let i=0;i<46;i++){
    const c=document.createElement('div'); c.className='fin';
    c.textContent=em[Math.floor(Math.random()*em.length)];
    c.style.left=Math.random()*100+'vw'; c.style.top='-40px';
    c.style.animationDuration=(2.4+Math.random()*2.4)+'s';
    c.style.animationDelay=(Math.random()*1.4)+'s';
    document.body.appendChild(c); setTimeout(()=>c.remove(),6000);
  }
  buzz('heavy');
}
function finish(){
  track('нажала «иду»');
  try{ TG.sendData(JSON.stringify({done:true})); }
  catch(e){ document.getElementById('finTxt').innerHTML='а теперь спустись вниз.<br>я жду тебя там.'; }
}

/* пылинки */
const du=document.getElementById('dust');
for(let i=0;i<34;i++){const s=document.createElement('div');s.className='d';
  s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';
  s.style.animationDuration=(3+Math.random()*4)+'s';s.style.animationDelay=(Math.random()*5)+'s';du.appendChild(s)}
</script>
</body>
</html>`;
}

export { S, PAGE };
