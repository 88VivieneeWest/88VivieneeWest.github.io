(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const sstep=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x)};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- checkout ----------
   Payment runs on the hosted checkout page of a Russian payment service: it takes
   cards, SBP, SberPay, T-Pay and YooMoney, issues the 54-FZ receipt and pays out to
   the card or account set in its dashboard. Paste the payment link for the 5 000 RUB
   product from that dashboard into CHECKOUT_URL. If the service gives a separate link
   per payment method, put those in METHOD_URLS; empty ones fall back to CHECKOUT_URL. */
const CHECKOUT_URL='';
const METHOD_URLS={card:'',sbp:'',sberpay:'',tpay:'',yoomoney:''};
/* The buyer's e-mail is passed to the checkout so the service sends the receipt and
   the installer links there. The parameter name depends on the service
   (Prodamus: customer_email, Robokassa: Email); leave empty if it has no such field. */
const EMAIL_PARAM='';

/* ---------- copy: Russian lives in the HTML, English here ---------- */
const T={ru:{sndOn:'Звук вкл',sndOff:'Звук выкл',down:'Вниз',payOff:'Оплата подключается — загляните чуть позже.'},en:{
  navUi:'Interface',navEngine:'Engine',navPresets:'Presets',navDl:'Buy',sndOn:'Sound on',sndOff:'Sound off',down:'Down',
  blurb:'Nebbia is a reverb and a delay in one plug-in. Five spaces, echoes across the stereo field, four FX slots and a display that shows how the room sounds.',
  ctaDl:'Buy Nebbia',h1a:'Space,',h1b:'made',h1c:'visible.',
  hint:'[ click the fog — the impulse echoes away ]',
  uiH:'Live interface',uiP:'Not a screenshot — the plug-in itself. Turn the knobs, flip presets, hit Freeze, open the FX tab.',uiLive:'● live',
  uiNote:'[ best on a large screen — drag knobs up and down ]',
  engH:'Engine',engP:'Two full blocks and an output stage, wired three ways. Every control can be automated from your DAW.',
  st1:'spaces',st2:'note values',st3:'signal routes',st4:'FX slots',st5:'automatable parameters',
  freeze:'holds the tail',dTime:'10 – 2000 ms or 1/32 … 1/1',dSync:'triplets and dotted, locked to the DAW',dMod:'tape-style wobble up to 8 Hz',
  oWidth:'0 – 200 %, mono to extra-wide',oDuck:'the tail makes room for the dry signal',
  fxH:'Four slots. Five characters.',fxP:'Each effect sits after the reverb, after the delay, or after both. Slots run left to right.',
  fx1:'Up to 36 dB of drive, soft to wave-folding shape, tone from 1 to 18 kHz.',
  fx2:'Low · Mid · High at ±15 dB, with the mid sweeping 200 Hz – 8 kHz.',
  fx3:'Rate 0.05 – 8 Hz, depth and stereo spread — the tail starts to drift.',
  fx4:'Moving notches through the spectrum, feedback up to 90 %.',
  fx5:'Flips the tail around: 30 ms to 2 s, or in note values.',
  prH:'Presets',prP:'Tap a row to hear a short phrase through that preset. Sound turns on by itself.',
  cpH:'Works where you do',cpF:'Formats',cpMac:'11+ · Apple Silicon and Intel',cpWin:'10+ · x64 · VST3',cpV:'Version',
  buyH:'Buy',priceP:'One-time purchase. Installers for macOS and Windows under one licence.',
  payL:'Payment method',pmCard:'Bank card',pmCardS:'Mir, Visa, Mastercard issued in Russia',pmSbp:'SBP',pmSbpS:'QR code from any Russian bank app',
  pmSberS:'in the SberBank Online app',pmTS:'in the T-Bank app',pmYoo:'YooMoney',pmYooS:'YooMoney wallet',payBtn:'Pay',
  payNote:'Payment happens on the payment service’s secure page. Right after payment the receipt, your activation key and links to the macOS and Windows installers arrive at this address.',
  payOff:'Payments are being set up — check back soon.',mailL:'E-mail for the receipt and key',
  agree:'I accept the terms of the <a href="oferta.html" target="_blank">public offer</a> (in Russian), including delivery and refunds',
  termsH:'Delivery and refunds',tGetH:'How you get the plug-in',tGet:'Electronically only: right after payment your e-mail receives the receipt, an activation key and links to the macOS and Windows installers — usually within minutes, within 24 hours at most. Nothing is shipped.',
  tPayH:'Payment',tPay:'Bank card, SBP, SberPay, T-Pay or YooMoney on the payment service’s secure page. This site never sees or stores card details.',
  tRetH:'Refunds',tRet:'If the plug-in will not install or run on your computer and we could not help, you get your money back: write to us within 14 days of payment. Refunds go back the same way within 10 days. Details in <a href="oferta.html#app1">Appendix 1 to the offer</a>.',
  fCont:'Contact',fSeller:'Seller',fName:'Roman Andreevich Ustimchuk',fStatus:'Self-employed (NPD tax regime)',fInn:'Tax ID (INN) 910615636730',fDocs:'Documents',fOffer:'Public offer',fTerms:'Delivery and refunds',fReq:'Seller details',afterH:'After payment',
  dlMac:'VST3 + Audio Unit · Universal · macOS 11+',dlWin:'VST3 · x64 · Windows 10+',
  s1:'Run the installer. It puts the plug-in in the system folders where every DAW looks. The first time you open Nebbia it asks for the key from the e-mail — it works on one computer.',
  s2:'Restart your DAW. In Ableton turn on “Use VST3 Plug-in System Folders” and Rescan; in FL Studio use Manage plugins → Find plugins. Logic picks up the Audio Unit on its own.',
  s3:'If macOS won’t open the installer: right-click → Open → Open, or System Settings → Privacy &amp; Security → Open Anyway.',
  fTag:'Space, made visible.',fTop:'Back to top ↑',
}};
$$('[data-i18n]').forEach(e=>{T.ru[e.dataset.i18n]??=e.innerHTML});

const PRESETS=[
  {name:'small room',alg:'room',route:'par',mode:'mono',note:'1/16',beats:.25,decay:.8,pre:4,size:28,damp:55,fb:18,tone:9000,depth:6,rate:.4,mix:22,lc:90,hc:12000,
   ru:'маленькая комната и короткий слэп',en:'a small room and a short slap'},
  {name:'slapback',alg:'plate',route:'par',mode:'stereo',ms:112,decay:1.2,pre:0,size:35,damp:40,fb:12,tone:4500,depth:0,rate:.2,mix:30,lc:160,hc:7000,
   ru:'плейт и рокабилли-слэп на 112 ms',en:'a plate with a 112 ms rockabilly slap'},
  {name:'dub hall',alg:'hall',route:'dr',mode:'ping',note:'1/4d',beats:1.5,decay:3.4,pre:18,size:62,damp:38,fb:46,tone:6000,depth:14,rate:.6,mix:32,lc:140,hc:9200,
   ru:'пинг-понг в зал — пресет по умолчанию',en:'ping-pong into a hall — the default'},
  {name:'cathedral',alg:'hall',route:'rd',mode:'stereo',note:'1/2',beats:2,decay:14,pre:62,size:96,damp:22,fb:30,tone:5200,depth:35,rate:.25,mix:55,lc:220,hc:6500,
   ru:'четырнадцать секунд хвоста и широкое стерео',en:'fourteen seconds of tail, very wide'},
  {name:'tape echo',alg:'spring',route:'dr',mode:'mono',ms:330,decay:1.6,pre:8,size:40,damp:60,fb:62,tone:2800,depth:40,rate:1.8,mix:38,lc:200,hc:5000,
   ru:'пружина, плывущая лента, тёмный тон',en:'spring, wobbly tape, dark tone'},
];
const ROUTE={rd:'R › D',dr:'D › R',par:'Parallel'};
const BPM=120;
const dlyTime=p=>p.beats?p.beats*60/BPM:p.ms/1000;

/* ---------- text scramble ---------- */
const GLY='*#+=-/<>%';
const scrRun=new WeakMap();
function scramble(el,dur=1100){
  const txt=el.dataset.txt??(el.dataset.txt=el.textContent);
  if(reduced){el.textContent=txt;return}
  const n=txt.length,t0=performance.now(),id=(scrRun.get(el)||0)+1;
  const at=[...txt].map((_,i)=>dur*.55*(i/n)+Math.random()*dur*.45);
  scrRun.set(el,id);el.dataset.busy=1;
  (function step(now){
    if(scrRun.get(el)!==id)return;
    const e=now-t0;let s='',done=true;
    for(let i=0;i<n;i++){const c=txt[i];if(c===' '||c==='\n'||e>=at[i])s+=c;else{done=false;s+=GLY[Math.random()*GLY.length|0]}}
    el.textContent=s;
    if(done)delete el.dataset.busy;else requestAnimationFrame(step);
  })(t0);
}
/* idle glitch on the hero headline: a couple of letters flip to symbols for a beat */
function glitchLoop(){
  if(!reduced){
    const lines=$$('.hl').filter(l=>!l.dataset.busy),l=lines[Math.random()*lines.length|0];
    if(l){const txt=l.dataset.txt??(l.dataset.txt=l.textContent),a=[...txt],k=1+(Math.random()*3|0);
      for(let i=0;i<k;i++){const j=Math.random()*a.length|0;if(a[j]!==' ')a[j]=GLY[Math.random()*GLY.length|0]}
      l.textContent=a.join('');setTimeout(()=>{if(!l.dataset.busy)l.textContent=l.dataset.txt},140+Math.random()*220)}
  }
  setTimeout(glitchLoop,1600+Math.random()*2600);
}

/* ---------- language ---------- */
let LANG='ru';
try{LANG=new URLSearchParams(location.search).get('lang')||localStorage.getItem('nebbia-lang')||(navigator.language||'ru').slice(0,2)}catch(e){}
if(!T[LANG])LANG='en';
function setLang(l,animate){
  LANG=l;try{localStorage.setItem('nebbia-lang',l)}catch(e){}
  document.documentElement.lang=l;
  $$('[data-i18n]').forEach(e=>{
    const v=T[l][e.dataset.i18n]??T.ru[e.dataset.i18n];
    if(e.classList.contains('scr')||e.classList.contains('hl')){e.dataset.txt=v;if(animate)scramble(e,700);else e.textContent=v}
    else e.innerHTML=v;
  });
  $$('.lang b').forEach(b=>b.classList.toggle('on',b.dataset.l===l));
  $('.down').setAttribute('aria-label',T[l].down);
  paintSound();renderPresets();
}
$('#lang').onclick=()=>setLang(LANG==='ru'?'en':'ru',true);

/* ---------- buy ---------- */
try{const m=localStorage.getItem('nebbia-email');if(m)$('#email').value=m}catch(e){}
$('#pay').addEventListener('submit',e=>{
  e.preventDefault();
  const f=new FormData(e.target),base=METHOD_URLS[f.get('pm')]||CHECKOUT_URL,email=String(f.get('email')||'').trim();
  try{localStorage.setItem('nebbia-email',email)}catch(e){}
  if(base){
    const url=new URL(base);
    if(EMAIL_PARAM&&email)url.searchParams.set(EMAIL_PARAM,email);
    location.href=url.href;return;
  }
  const n=$('#payNote');n.textContent=T[LANG].payOff;n.classList.add('warn');
});

/* ---------- presets list ---------- */
function renderPresets(){
  $('#plist').innerHTML=PRESETS.map((p,i)=>`<li class="prow rv in" data-p="${i}" tabindex="0" role="button">
    <span class="n">0${i+1}</span>
    <h3 class="scr">${p.name}</h3>
    <div class="meta"><em>${p[LANG]}</em><span>${p.alg} · ${ROUTE[p.route]} · ${p.mode==='ping'?'ping-pong':p.mode}</span>
      <span>decay ${p.decay} s · ${p.note||p.ms+' ms'} · mix ${p.mix} %</span></div>
    <span class="play" aria-hidden="true"><svg width="14" height="16" viewBox="0 0 14 16"><path d="M1 1l12 7-12 7z" fill="currentColor"/></svg></span>
    <span class="tail"></span></li>`).join('');
}
$('#plist').addEventListener('click',e=>{const r=e.target.closest('.prow');if(r)playPreset(+r.dataset.p,r)});
$('#plist').addEventListener('keydown',e=>{const r=e.target.closest('.prow');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();playPreset(+r.dataset.p,r)}});
$('#plist').addEventListener('mouseover',e=>{const r=e.target.closest('.prow');if(r&&r!==lastHover){lastHover=r;scramble($('h3',r),500)}});
let lastHover=null;

/* ============================================================
   Sound: a tiny Nebbia in WebAudio — convolution reverb from a
   generated impulse, ping-pong delay with tape wobble, routing.
   ============================================================ */
const A={ctx:null,on:false,irs:{},cur:null};
function audioInit(){
  if(A.ctx){A.ctx.resume();return}
  const C=A.ctx=new (window.AudioContext||window.webkitAudioContext)();
  const g=v=>{const n=C.createGain();n.gain.value=v;return n};
  const filt=(type,f)=>{const n=C.createBiquadFilter();n.type=type;n.frequency.value=f;return n};
  const comp=C.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;
  A.out=g(.9);A.out.connect(comp).connect(C.destination);
  A.src=g(1);A.dry=g(.8);A.wet=g(.5);
  A.lc=filt('highpass',140);A.hc=filt('lowpass',9200);
  A.src.connect(A.dry).connect(A.out);
  A.wet.connect(A.lc).connect(A.hc).connect(A.out);
  // reverb
  A.revIn=g(1);A.conv=C.createConvolver();A.revOut=g(1);
  A.revIn.connect(A.conv).connect(A.revOut).connect(A.wet);
  // ping-pong delay: L → tone → fb → R → fb → L
  A.dIn=g(1);A.dL=C.createDelay(3);A.dR=C.createDelay(3);A.fbL=g(.4);A.fbR=g(.4);A.tone=filt('lowpass',6000);
  A.pL=C.createStereoPanner();A.pR=C.createStereoPanner();A.dOut=g(1);
  A.dIn.connect(A.dL);A.dL.connect(A.pL).connect(A.dOut);
  A.dL.connect(A.tone).connect(A.fbL).connect(A.dR);A.dR.connect(A.pR).connect(A.dOut);
  A.dR.connect(A.fbR).connect(A.dL);
  A.dOut.connect(A.wet);
  // tape wobble
  A.lfo=C.createOscillator();A.lfoG=g(0);A.lfo.connect(A.lfoG);A.lfoG.connect(A.dL.delayTime);A.lfoG.connect(A.dR.delayTime);A.lfo.start();
  // routing sends
  A.sRev=g(1);A.sDly=g(1);A.d2r=g(0);A.r2d=g(0);
  A.src.connect(A.sRev).connect(A.revIn);A.src.connect(A.sDly).connect(A.dIn);
  A.dOut.connect(A.d2r).connect(A.revIn);A.revOut.connect(A.r2d).connect(A.dIn);
  applyPreset(PRESETS[2]);
}
function makeIR(p){
  const C=A.ctx,sr=C.sampleRate,pre=Math.floor(p.pre/1000*sr),len=Math.min(p.decay*1.15,7)+.05;
  const n=pre+Math.floor(len*sr),buf=C.createBuffer(2,n,sr),damp=p.damp/100,fadeN=Math.floor(.4*sr);
  for(let ch=0;ch<2;ch++){
    const d=buf.getChannelData(ch);let lp=0,sum=0;
    for(let i=pre;i<n;i++){
      const t=(i-pre)/sr,env=Math.exp(-6.9*t/p.decay);
      const k=(.25+.75*(1-damp))*Math.exp(-t*damp*2.2)+.04;   // darker as it decays
      lp+=k*((Math.random()*2-1)-lp);
      let s=lp*env;
      if(p.alg==='spring'&&i-pre>180)s+=.55*d[i-180]*(1-t/len);   // metallic comb
      if(n-i<fadeN)s*=(n-i)/fadeN;
      d[i]=s;sum+=s*s;
    }
    // early reflections for the small rooms
    if(p.alg==='room'||p.alg==='chamber')for(let r=0;r<10;r++){const at=pre+Math.floor((.004+Math.random()*.05*p.size/50)*sr);if(at<n)d[at]+=(Math.random()<.5?-1:1)*.6*(1-r/10)}
    const norm=1/Math.sqrt(sum/sr+1e-9)*.5;for(let i=0;i<n;i++)d[i]*=norm;
  }
  return buf;
}
function applyPreset(p){
  if(!A.ctx)return;
  const C=A.ctx,t=C.currentTime,set=(prm,v)=>prm.setTargetAtTime(v,t,.02);
  if(A.cur!==p){A.conv.buffer=A.irs[p.name]||(A.irs[p.name]=makeIR(p));A.cur=p}
  const dt=dlyTime(p);set(A.dL.delayTime,dt);set(A.dR.delayTime,dt);
  const fb=p.fb/100*.9;set(A.fbL.gain,fb);set(A.fbR.gain,fb);
  set(A.tone.frequency,p.tone);set(A.lc.frequency,p.lc);set(A.hc.frequency,p.hc);
  A.lfo.frequency.setValueAtTime(p.rate,t);set(A.lfoG.gain,p.depth/100*.004);
  const pan=p.mode==='ping'?1:p.mode==='stereo'?.45:0;set(A.pL.pan,-pan);set(A.pR.pan,pan);
  const m=p.mix/100;set(A.wet.gain,m*1.9);set(A.dry.gain,1-m*.55);
  set(A.sRev.gain,p.route==='dr'?0:1);set(A.sDly.gain,p.route==='rd'?0:1);
  set(A.d2r.gain,p.route==='dr'?1:0);set(A.r2d.gain,p.route==='rd'?.8:0);
}
function pluck(freq,when,vel=.5,pan=0){
  const C=A.ctx,o=C.createOscillator(),o2=C.createOscillator(),f=C.createBiquadFilter(),e=C.createGain(),pn=C.createStereoPanner();
  o.type='triangle';o.frequency.value=freq;o2.type='sine';o2.frequency.value=freq*2.005;
  f.type='lowpass';f.Q.value=2;f.frequency.setValueAtTime(freq*9,when);f.frequency.exponentialRampToValueAtTime(freq*1.5,when+.4);
  e.gain.setValueAtTime(0,when);e.gain.linearRampToValueAtTime(vel,when+.004);e.gain.exponentialRampToValueAtTime(.0001,when+.7);
  pn.pan.value=pan;
  o.connect(f);o2.connect(f);f.connect(e).connect(pn).connect(A.src);
  o.start(when);o2.start(when);o.stop(when+.75);o2.stop(when+.75);
}
const SCALE=[0,3,5,7,10];
const noteAt=i=>220*Math.pow(2,(12*Math.floor(i/5)+SCALE[((i%5)+5)%5])/12);
function paintSound(){const b=$('#snd');b.setAttribute('aria-pressed',A.on);$('span:last-child',b).textContent=T[LANG][A.on?'sndOn':'sndOff']}
function soundOn(){if(!A.on){audioInit();A.on=true;paintSound()}}
$('#snd').onclick=()=>{
  if(A.on){A.on=false;A.ctx&&A.ctx.suspend();paintSound();return}
  soundOn();applyPreset(PRESETS[2]);const t=A.ctx.currentTime+.05;pluck(noteAt(7),t,.45);pluck(noteAt(9),t+.12,.35);
};
let tailTimer=0;
function playPreset(i,row){
  soundOn();const p=PRESETS[i];applyPreset(p);
  const t=A.ctx.currentTime+.06,ph=[5,9,12,10];
  ph.forEach((n,k)=>pluck(noteAt(n),t+k*.17,.42,(k%2?.25:-.25)));
  $$('.prow').forEach(r=>r.classList.toggle('on',r===row));
  const tail=$('.tail',row),dur=Math.min(p.decay,8)+.6;
  tail.style.transition='none';tail.style.transform='scaleX(1)';tail.getBoundingClientRect();
  tail.style.transition=`transform ${dur}s cubic-bezier(.1,.6,.3,1)`;tail.style.transform='scaleX(0)';
  clearTimeout(tailTimer);tailTimer=setTimeout(()=>row.classList.remove('on'),dur*1000);
}

/* ============================================================
   ASCII field renderer: every cell gets a value (0..1) and a
   tint from a field function; the background mosaic is drawn
   at one pixel per cell and scaled up, glyphs come from an atlas.
   ============================================================ */
const RAMP=' ·-:+=*IAEBN', GL='#%/';
const GLYPHS=RAMP+GL, NL=RAMP.length;
const TINT=['#d9d7d0','#ff4b1f','#a08cff','#4fe3bd'];
const TRGB=[[217,215,208],[255,75,31],[154,133,255],[79,227,189]];
function makeAtlas(cell,dpr){
  const cw=Math.ceil(cell*dpr),cv=document.createElement('canvas');
  cv.width=cw*GLYPHS.length;cv.height=cw*TINT.length;
  const x=cv.getContext('2d');x.font=`500 ${Math.round(cell*.78*dpr)}px "Geist Mono", ui-monospace, monospace`;
  x.textAlign='center';x.textBaseline='middle';
  TINT.forEach((c,r)=>{x.fillStyle=c;[...GLYPHS].forEach((g,i)=>x.fillText(g,i*cw+cw/2,r*cw+cw*.54))});
  return {cv,cw};
}
const FIELDS=[];
class Ascii{
  constructor(cv,o){
    this.cv=cv;this.ctx=cv.getContext('2d');this.o=o;this.on=false;this.out={v:0,c:0,g:0,b:-1};
    this.bg=document.createElement('canvas');this.bgx=this.bg.getContext('2d');
    new ResizeObserver(()=>this.resize()).observe(cv);
    new IntersectionObserver(([e])=>{this.on=e.isIntersecting}).observe(cv);
    FIELDS.push(this);
  }
  resize(){
    const r=this.cv.getBoundingClientRect();if(!r.width||!r.height)return;
    const dpr=Math.min(window.devicePixelRatio||1,2),cell=typeof this.o.cell==='function'?this.o.cell(r.width):this.o.cell;
    Object.assign(this,{W:r.width,H:r.height,dpr,cell,cols:Math.ceil(r.width/cell),rows:Math.ceil(r.height/cell)});
    this.cv.width=Math.round(r.width*dpr);this.cv.height=Math.round(r.height*dpr);
    this.bg.width=this.cols;this.bg.height=this.rows;this.img=this.bgx.createImageData(this.cols,this.rows);
    this.V=new Float32Array(this.cols*this.rows);this.C=new Uint8Array(this.V.length);this.G=new Uint8Array(this.V.length);
    this.atlas=makeAtlas(cell,dpr);
    // cell grid lines drawn over the mosaic
    const gl=this.grid=document.createElement('canvas');gl.width=this.cv.width;gl.height=this.cv.height;
    const gx=gl.getContext('2d'),cd=cell*dpr;gx.fillStyle=this.o.base;
    for(let i=0;i<=this.cols;i++)gx.fillRect(Math.round(i*cd)-dpr*.5,0,dpr,gl.height);
    for(let j=0;j<=this.rows;j++)gx.fillRect(0,Math.round(j*cd)-dpr*.5,gl.width,dpr);
    this.o.resize&&this.o.resize(this);
    this.draw(performance.now()/1000);
  }
  draw(t){
    if(!this.atlas)return;
    const {ctx,cols,rows,cell,dpr,V,C,G,out}=this,f=this.o.field,data=this.img.data,cd=cell*dpr,cw=this.atlas.cw,off=(cd-cw)/2;
    for(let j=0,k=0;j<rows;j++)for(let i=0;i<cols;i++,k++){
      out.v=0;out.c=0;out.g=0;out.b=-1;
      f(i*cell+cell/2,j*cell+cell/2,t,out,i,j,this);
      const v=clamp(out.v,0,1),c=out.c,rgb=TRGB[c],b=out.b<0?(c?.3*v:.13*v):out.b;
      V[k]=v;C[k]=c;G[k]=out.g;
      data[k*4]=rgb[0]*b;data[k*4+1]=rgb[1]*b;data[k*4+2]=rgb[2]*b;data[k*4+3]=255;
    }
    this.bgx.putImageData(this.img,0,0);
    ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(this.bg,0,0,cols*cd,rows*cd);
    ctx.drawImage(this.grid,0,0);
    for(let j=0,k=0;j<rows;j++)for(let i=0;i<cols;i++,k++){
      const v=V[k],gi=G[k]?NL+G[k]-1:Math.round(v*(NL-1));if(!gi)continue;
      ctx.globalAlpha=C[k]?.95:.2+.8*v;
      ctx.drawImage(this.atlas.cv,gi*cw,C[k]*cw,cw,cw,i*cd+off,j*cd+off,cw,cw);
    }
  }
}

/* value noise */
const PERM=new Uint8Array(512);{let s=7;const p=[...Array(256).keys()];for(let i=255;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[p[i],p[j]]=[p[j],p[i]]}for(let i=0;i<512;i++)PERM[i]=p[i&255]}
function vn(x,y){
  const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),X=xi&255,Y=yi&255;
  const a=PERM[PERM[X]+Y],b=PERM[PERM[X+1]+Y],c=PERM[PERM[X]+Y+1],d=PERM[PERM[X+1]+Y+1];
  return (a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v)/255;
}
const fbm=(x,y)=>vn(x,y)*.55+vn(x*2.03+17.1,y*2.03+3.7)*.3+vn(x*4.1+5.3,y*4.1+11.9)*.15;
const hash=(i,j,k)=>{let h=(i*374761393+j*668265263+k*2147483647)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296};

/* ---------- hero: fog with the Nebbia mark cut out, pulses and echoes ---------- */
const H={rip:[],mx:-1e4,my:-1e4,sx:-1e4,sy:-1e4,next:0,boxes:[]};
const hero=$('#hero');
function heroResize(a){
  const W=a.W,Hh=a.H,mob=W<760,S=(mob?Math.min(Hh*.36,W*.62):Math.min(Hh*.44,W*.3))/20.5;
  Object.assign(H,{S,cell:a.cell,cx:mob?W*.5-8*S:W*.74-8*S,cy:mob?Hh*.33:Hh*.47,rDot:Math.max(3.6*S,a.cell*2.6),hw:Math.max(1.7*S,a.cell*1.5),
    arcs:[{R:9.4*S,sp:.86,op:1},{R:15*S,sp:.77,op:.6},{R:20.6*S,sp:.71,op:.3}]});
  const hr=hero.getBoundingClientRect(),box=(el,s,pad)=>{const r=el.getBoundingClientRect();return{l:r.left-hr.left,t:r.top-hr.top,r:r.right-hr.left,b:r.bottom-hr.top,s,pad}};
  H.boxes=[box($('#blurb'),.9,a.cell*2.2),box($('#headline'),.5,a.cell*2)];
}
function heroField(x,y,t,o,i,j){
  const c=H.cell;
  const fog=fbm(x*.0042+t*.045,y*.0058-t*.018)*.6+fbm(x*.0021-t*.03+31.7,y*.0029+t*.012+7.3)*.4;
  let v=.34+.66*sstep(.26,.74,fog);
  v*=.28+.72*sstep(36,150,y);                                      // calm under the header
  // the mark: dot + three arcs
  const rx=x-H.cx,ry=y-H.cy,rho=Math.sqrt(rx*rx+ry*ry),ang=Math.atan2(ry,rx);
  let dm=rho-H.rDot,part=0;
  for(let a=0;a<3;a++){
    const A=H.arcs[a];let d;
    if(Math.abs(ang)<A.sp)d=Math.abs(rho-A.R)-H.hw;
    else{const ea=ang>0?A.sp:-A.sp;d=Math.hypot(rx-Math.cos(ea)*A.R,ry-Math.sin(ea)*A.R)-H.hw}
    if(d<dm){dm=d;part=a+1}
  }
  const tick=Math.floor(t*5);
  if(dm<0){
    if(dm>-c*1.05){v=.42+.2*hash(i,j,tick);o.c=hash(i,j,0)<(part<2?1:H.arcs[part-1].op)?1:2}
    else v=hash(i,j,tick)<.02?.3:0;
  }
  // pulses (from the dot) and click impulses with their echoes
  let rp=0,rc=0;
  for(const r of H.rip){
    const age=t-r.t0;if(age<0)continue;
    const d=Math.abs(Math.hypot(x-r.x,y-r.y)-age*r.sp);if(d>r.w*3)continue;
    const k=Math.exp(-d*d/(r.w*r.w))*r.amp*Math.exp(-age/r.dec);if(k>rp){rp=k;rc=r.col}
  }
  if(rp>.06){v=dm<0?Math.max(v,rp*.8):Math.min(1,v+rp);if(rp>.2)o.c=rc}
  // the cursor blows a hole in the fog
  const dx=x-H.sx,dy=y-H.sy,dc=Math.sqrt(dx*dx+dy*dy);
  if(dc<190){const k=sstep(46,190,dc);v*=k;if(k>.08&&k<.55&&hash(i,j,tick)<.45){o.c=2;v=Math.max(v,.35)}}
  // keep copy readable
  for(const b of H.boxes){
    const ex=Math.max(b.l-x,0,x-b.r),ey=Math.max(b.t-y,0,y-b.b);
    const m=1-sstep(0,b.pad,Math.sqrt(ex*ex+ey*ey));if(m>0){v*=1-b.s*m;if(m>.5&&o.c)o.c=0}
  }
  // sparse coloured specks drifting in the fog, and glitching cells
  if(!o.c&&v>.25){const s=vn(x*.012+t*.3,y*.012);if(s>.86)o.c=s>.93?3:2}
  if(v>.2&&hash(i,j,tick)<.01)o.g=1+(hash(j,i,tick)*3|0);
  o.v=v;
}
function heroTick(t){
  if(t>H.next){
    H.rip.push({x:H.cx,y:H.cy,t0:t,sp:H.S*13,w:H.cell*.9,amp:.85,dec:2.2,col:1},
               {x:H.cx,y:H.cy,t0:t+.75,sp:H.S*13,w:H.cell*.7,amp:.4,dec:1.8,col:3});
    H.next=t+3.4;
  }
  H.rip=H.rip.filter(r=>t-r.t0<r.dec*3.5);
  H.sx+=(H.mx-H.sx)*.14;H.sy+=(H.my-H.sy)*.14;
  if(H.mx<-1e3){H.sx=H.mx;H.sy=H.my}
}
function impulse(x,y,t){
  H.rip.push({x,y,t0:t,sp:300,w:H.cell*1.7,amp:1,dec:3.2,col:2});
  for(let k=1;k<=4;k++)H.rip.push({x:x+(k%2?1:-1)*H.cell*3,y,t0:t+k*.75,sp:300,w:H.cell*.75,amp:Math.pow(.6,k),dec:2,col:3});
  if(H.rip.length>40)H.rip.splice(0,H.rip.length-40);
}
const heroAscii=new Ascii($('#field'),{cell:w=>w<760?11:w>1700?15:13,base:'#050505',field:heroField,resize:heroResize,tick:heroTick});
hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();H.mx=e.clientX-r.left;H.my=e.clientY-r.top});
hero.addEventListener('pointerleave',()=>{H.mx=H.my=-1e4});
hero.addEventListener('click',e=>{
  if(e.target.closest('a,button'))return;
  const r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  impulse(x,y,performance.now()/1000);
  if(reduced)heroAscii.draw(performance.now()/1000);
  if(A.on){applyPreset(PRESETS[2]);pluck(noteAt(Math.floor(x/r.width*12)+3),A.ctx.currentTime+.01,.5,clamp(x/r.width*2-1,-.8,.8))}
});

/* ---------- FX cards: one small animated field per effect ---------- */
const curve=(y,y0,w)=>{const d=y-y0;return Math.exp(-d*d/(w*w))};
const FXF={
  distortion(x,y,t,o,i,j,a){
    const u=x/a.W,drive=2.2+1.8*Math.sin(t*.9),s=Math.tanh(Math.sin(u*Math.PI*4-t*2.4)*drive)/Math.tanh(drive);
    const y0=a.H*(.5-.36*s),k=curve(y,y0,a.cell*1.1);
    o.v=Math.max(k,(y>Math.min(y0,a.H/2)&&y<Math.max(y0,a.H/2))?.12:0,.04);if(k>.4)o.c=1;
  },
  eq(x,y,t,o,i,j,a){
    const u=x/a.W,cpos=.5+.3*Math.sin(t*.55),g=Math.sin(t*.8),b=g*Math.exp(-((u-cpos)**2)/.012)+.25*Math.sin(t*.5+1)*(1-u)**3;
    const y0=a.H*(.55-.32*b),k=curve(y,y0,a.cell*1.1);
    o.v=Math.max(k,y>y0?.1:0,(j%4===0)?.06:0);if(k>.4)o.c=1;
  },
  chorus(x,y,t,o,i,j,a){
    const u=x/a.W,y1=a.H*(.5-.3*Math.sin(u*9-t*1.9)),y2=a.H*(.5-.3*Math.sin(u*9.6-t*2.3+.7));
    const k1=curve(y,y1,a.cell*1.05),k2=curve(y,y2,a.cell*1.05);o.v=Math.max(k1,k2,.04);
    if(k1>.4)o.c=2;if(k2>.4&&k2>k1)o.c=3;
  },
  phaser(x,y,t,o,i,j,a){
    const u=x/a.W;let h=.78;
    for(let n=0;n<3;n++){const c=(t*.12+n/3)%1,d=u-c;h-=.6*Math.exp(-d*d/.0016)}
    h=Math.max(.06,h*(.85+.15*Math.sin(u*30)));
    const top=a.H*(1-h);o.v=y>top?.35+.4*(1-(y-top)/(a.H-top+1)):.04;if(Math.abs(y-top)<a.cell){o.v=.9;o.c=1}
  },
  reverse(x,y,t,o,i,j,a){
    const u=x/a.W,ph=(t*.35)%1.25;
    const env=u<ph&&ph<=1.0001?Math.pow(u/ph,2.4):(ph>1&&u<1?Math.pow(u,2.4)*Math.max(0,1-(ph-1)*4):0);
    const amp=env*(.6+.4*vn(u*40,t*3))*a.H*.42,dy=Math.abs(y-a.H/2);
    o.v=dy<amp?.45+.5*(1-dy/(amp+1)):(dy<a.cell*.6?.12:.03);if(dy<amp&&dy>amp-a.cell)o.c=1;
  },
};
$$('.fxc').forEach(card=>new Ascii($('canvas',card),{cell:9,base:'#0b0b0b',field:FXF[card.dataset.fx]}));

/* ---------- footer: the wordmark in characters ---------- */
const WM={mask:null,mx:-1e4,my:-1e4};
function wmResize(a){
  const cv=document.createElement('canvas');cv.width=a.cols;cv.height=a.rows;const x=cv.getContext('2d');
  x.font='700 100px Oswald, Impact, sans-serif';const m=x.measureText('NEBBIA');
  const hgt=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent||72;
  const s=Math.min(a.cols*.94/m.width,a.rows*.78/hgt);
  x.font=`700 ${100*s}px Oswald, Impact, sans-serif`;x.textAlign='center';x.textBaseline='alphabetic';x.fillStyle='#fff';
  x.fillText('NEBBIA',a.cols/2,a.rows/2+hgt*s/2-(m.actualBoundingBoxDescent||0)*s);
  const d=x.getImageData(0,0,a.cols,a.rows).data;WM.mask=new Float32Array(a.cols*a.rows);
  for(let k=0;k<WM.mask.length;k++)WM.mask[k]=d[k*4+3]/255;
}
function wmField(x,y,t,o,i,j,a){
  const m=WM.mask?WM.mask[j*a.cols+i]:0,fog=fbm(x*.006+t*.06,y*.008);
  const d=Math.hypot(x-WM.mx,y-WM.my),near=1-sstep(30,200,d);
  if(m>.5){o.v=.5+.5*fog;if(m<.95||near>.25&&hash(i,j,Math.floor(t*6))<near)o.c=1}
  else{o.v=fog*.16+near*.25*hash(i,j,Math.floor(t*8));if(m>.1){o.v=.5;o.c=1}}
}
const wmEl=$('#wordmark');
const wmAscii=new Ascii(wmEl,{cell:w=>w<760?8:12,base:'#050505',field:wmField,resize:wmResize});
wmEl.addEventListener('pointermove',e=>{const r=wmEl.getBoundingClientRect();WM.mx=e.clientX-r.left;WM.my=e.clientY-r.top});
wmEl.addEventListener('pointerleave',()=>{WM.mx=WM.my=-1e4});

/* ---------- one loop for every field, ~40 fps, only while on screen ---------- */
let last=0;
function loop(now){
  requestAnimationFrame(loop);
  if(now-last<24)return;last=now;
  const t=now/1000;
  for(const f of FIELDS)if(f.on&&f.atlas){f.o.tick&&f.o.tick(t);f.draw(t)}
}

/* ---------- reveal on scroll ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');
  [e.target,...$$('.scr',e.target)].filter(n=>n.classList.contains('scr')).forEach(n=>scramble(n));
  $$('.count',e.target).forEach(n=>{n.dataset.txt=String(n.dataset.n).padStart(2,'0');scramble(n,900)});
  io.unobserve(e.target);
}),{threshold:.18});
$$('.rv').forEach(e=>io.observe(e));

/* header background once the hero scrolls away */
const top=$('#top');
addEventListener('scroll',()=>top.classList.toggle('scrolled',scrollY>window.innerHeight*.6),{passive:true});

/* headline lines re-scramble on hover */
$$('.hl').forEach(l=>l.addEventListener('mouseenter',()=>scramble(l,600)));

/* the embedded plug-in follows the site: dark */
const ifr=$('.device iframe');
ifr.addEventListener('load',()=>{try{const d=ifr.contentDocument,lab=d&&d.getElementById('themeLabel');if(lab&&lab.textContent.trim()==='light')d.getElementById('theme').click()}catch(e){}});

/* ---------- start ---------- */
setLang(LANG,false);
Promise.all([document.fonts.load('500 16px "Geist Mono"'),document.fonts.load('700 100px Oswald')]).catch(()=>{}).then(()=>{
  FIELDS.forEach(f=>f.resize());
  $$('.hl').forEach((l,k)=>setTimeout(()=>scramble(l,1300),200+k*180));
  if(!reduced)requestAnimationFrame(loop);
  setTimeout(glitchLoop,3200);
});
})();
