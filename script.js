window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('scrolled',window.scrollY>60)
  document.getElementById('back-top').classList.toggle('visible',window.scrollY>400)
})

// Langue par défaut : anglais
setLang('en')

function setLang(lang){
  document.documentElement.lang = lang
  document.getElementById('btn-fr').classList.toggle('active',lang==='fr')
  document.getElementById('btn-en').classList.toggle('active',lang==='en')
  document.getElementById('btn-es').classList.toggle('active',lang==='es')
  document.querySelectorAll('[data-fr]').forEach(el=>{
    const val=el.getAttribute('data-'+lang) || el.getAttribute('data-en')
    if(!val)return
    if(el.tagName==='INPUT'&&el.type!=='submit'){el.placeholder=val}
    else if(el.tagName==='OPTION'){el.textContent=val}
    else if(el.classList.contains('marquee-item')){
      const s=el.querySelector('span')
      el.childNodes[0].textContent=val+' '
    }
    else if(el.tagName==='text'||el.closest && el.closest('svg')){el.textContent=val}
    else{el.innerHTML=val}
  })
  const placeholders = {
    fr: {name:'Votre nom', email:'votre@email.com', msg:'Décrivez votre projet...'},
    en: {name:'Your name', email:'your@email.com', msg:'Describe your project...'},
    es: {name:'Tu nombre', email:'tu@email.com', msg:'Describe tu proyecto...'}
  }
  const p = placeholders[lang] || placeholders.en
  document.getElementById('f-name').placeholder = p.name
  document.getElementById('f-email').placeholder = p.email
  document.getElementById('f-msg').placeholder = p.msg
}

// FORMSPREE AJAX SUBMIT
const form=document.getElementById('contact-form')
if(form){
  form.addEventListener('submit',async e=>{
    e.preventDefault()
    const btn=form.querySelector('.form-submit')
    const success=document.getElementById('form-success')
    btn.textContent='...'
    btn.disabled=true
    try{
      const res=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}})
      if(res.ok){
        success.style.display='block'
        form.reset()
      } else {
        btn.textContent='Erreur réessayer'
      }
    } catch(err){
      btn.textContent='Erreur réessayer'
    }
    btn.disabled=false
  })
}

const cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring')
let mx=0,my=0,rx=0,ry=0
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px'})
function animRing(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing)}
animRing()
document.querySelectorAll('a,button,.work-card,.demo-reel-card,.service-card,#back-top,.nav-logo').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'))
  el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'))
})

const canvas=document.getElementById('hero-canvas'),ctx=canvas.getContext('2d')
let W,H,time=0

function resize(){
  W=canvas.width=canvas.offsetWidth
  H=canvas.height=canvas.offsetHeight
}

function draw(){
  ctx.clearRect(0,0,W,H)
  time+=0.008

  const centerY = H * 0.72
  const numWaves = 4

  for(let w=0;w<numWaves;w++){
    const waveAmp = 18 + w * 14
    const waveFreq = 0.018 - w * 0.003
    const speed = 0.6 + w * 0.2
    const alpha = 0.18 - w * 0.035
    const yOffset = w * 6

    ctx.beginPath()
    for(let x=0;x<=W;x+=2){
      const y1 = Math.sin(x * waveFreq + time * speed) * waveAmp
      const y2 = Math.sin(x * waveFreq * 2.3 + time * speed * 1.4) * (waveAmp * 0.3)
      const env = 0.6 + 0.4 * Math.sin(time * 0.3 + w * 0.8)
      const y = centerY + yOffset + (y1 + y2) * env

      if(x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.strokeStyle = `rgba(208,25,26,${alpha})`
    ctx.lineWidth = 1.2 - w * 0.2
    ctx.stroke()
  }

  ctx.beginPath()
  ctx.moveTo(0, centerY)
  ctx.lineTo(W, centerY)
  ctx.strokeStyle = 'rgba(208,25,26,0.06)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  requestAnimationFrame(draw)
}

window.addEventListener('resize',resize);resize();draw()

// MUTE GLOBAL
let globalMuted = false

function soundCrush(){
  const ctx = getCtx()
  const t = ctx.currentTime
  const steps = [660, 440, 220]
  steps.forEach((freq, i)=>{
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = 'square'
    const st = t + i * 0.028
    osc.frequency.setValueAtTime(freq, st)
    g.gain.setValueAtTime(0.026, st)
    g.gain.exponentialRampToValueAtTime(0.001, st + 0.025)
    osc.start(st); osc.stop(st + 0.03)
  })
}

function soundUncrush(){
  const ctx = getCtx()
  const t = ctx.currentTime
  const steps = [220, 440, 660]
  steps.forEach((freq, i)=>{
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = 'square'
    const st = t + i * 0.025
    osc.frequency.setValueAtTime(freq, st)
    g.gain.setValueAtTime(0.021, st)
    g.gain.exponentialRampToValueAtTime(0.001, st + 0.022)
    osc.start(st); osc.stop(st + 0.027)
  })
}

// Son retour accueil — bip chaleureux type console
function soundHome(){
  const ctx = getCtx()
  const t = ctx.currentTime
  const r = 0.95 + Math.random() * 0.1
  const pairs = [{f:330*r, d:0}, {f:440*r, d:0.07}]
  pairs.forEach(({f, d})=>{
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    const filt = ctx.createBiquadFilter()
    filt.type = 'lowpass'; filt.frequency.value = 2200; filt.Q.value = 0.8
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f, t + d)
    g.gain.setValueAtTime(0, t + d)
    g.gain.linearRampToValueAtTime(0.09, t + d + 0.012)
    g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.1)
    osc.start(t + d); osc.stop(t + d + 0.12)
  })
}

function toggleMute(){
  const btn = document.getElementById('mute-btn')
  const iconSound = document.getElementById('icon-sound')
  const iconMuted = document.getElementById('icon-muted')
  globalMuted = !globalMuted
  if(globalMuted){
    soundCrush()
    setTimeout(()=>{
      if(audioCtx) audioCtx.suspend()
    }, 280)
    btn.classList.add('muted')
    iconSound.style.display = 'none'
    iconMuted.style.display = 'block'
  } else {
    if(audioCtx) audioCtx.resume()
    setTimeout(()=> soundUncrush(), 50)
    btn.classList.remove('muted')
    iconSound.style.display = 'block'
    iconMuted.style.display = 'none'
  }
}

// Arrêt auto quand une iframe est cliquée
const AudioCtx = window.AudioContext || window.webkitAudioContext
let audioCtx = null
function getCtx(){ if(!audioCtx) audioCtx = new AudioCtx(); return audioCtx }

// Son global doux, Nintendo-like, fréquence randomisée
function soundClick(){
  const ctx = getCtx()
  const rand = 0.82 + Math.random() * 0.36
  const baseFreq = 520 * rand
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'; filter.frequency.value = 2200; filter.Q.value = 0.8
  osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, ctx.currentTime + 0.055)
  gain.gain.setValueAtTime(0.0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0.056, ctx.currentTime + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08)
}

// Son CTA "Travailler ensemble" positif, lumineux, montée affirmée
function soundCTA(){
  const ctx = getCtx()
  const t = ctx.currentTime
  const r = 0.92 + Math.random() * 0.16 // pitch randomizer ±8%
  const pairs = [{f1:440*r, f2:660*r, delay:0}, {f1:550*r, f2:825*r, delay:0.07}]
  pairs.forEach(({f1, f2, delay})=>{
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    const filt = ctx.createBiquadFilter()
    filt.type = 'lowpass'; filt.frequency.value = 3000; filt.Q.value = 0.8
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f1, t + delay)
    osc.frequency.exponentialRampToValueAtTime(f2, t + delay + 0.06)
    g.gain.setValueAtTime(0.0, t + delay)
    g.gain.linearRampToValueAtTime(0.099, t + delay + 0.012)
    g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.13)
    osc.start(t + delay); osc.stop(t + delay + 0.15)
  })
  const osc3 = ctx.createOscillator()
  const g3 = ctx.createGain()
  osc3.connect(g3); g3.connect(ctx.destination)
  osc3.type = 'sine'
  osc3.frequency.setValueAtTime(1320*r, t + 0.1)
  osc3.frequency.exponentialRampToValueAtTime(1760*r, t + 0.18)
  g3.gain.setValueAtTime(0.0, t + 0.1)
  g3.gain.linearRampToValueAtTime(0.0495, t + 0.13)
  g3.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
  osc3.start(t + 0.1); osc3.stop(t + 0.24)
}

function soundConfirm(){
  const ctx = getCtx()
  const r = 0.95 + Math.random() * 0.1
  const notes = [330*r, 440*r, 550*r]
  notes.forEach((freq, i)=>{
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    const t = ctx.currentTime + i * 0.07
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(0.0, t)
    gain.gain.linearRampToValueAtTime(0.1, t + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    osc.start(t); osc.stop(t + 0.13)
  })
}

function soundSwitch(){
  const ctx = getCtx()
  const t = ctx.currentTime
  const r = 0.88 + Math.random() * 0.24
  const buf1 = ctx.createBuffer(1, ctx.sampleRate * 0.004, ctx.sampleRate)
  const d1 = buf1.getChannelData(0)
  for(let i=0;i<d1.length;i++) d1[i] = (Math.random()*2-1) * Math.exp(-i / (d1.length * 0.3))
  const n1 = ctx.createBufferSource()
  n1.buffer = buf1
  const f1 = ctx.createBiquadFilter()
  f1.type = 'bandpass'; f1.frequency.value = 3500*r; f1.Q.value = 2.5
  const g1 = ctx.createGain()
  n1.connect(f1); f1.connect(g1); g1.connect(ctx.destination)
  g1.gain.setValueAtTime(0.101, t)
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.004)
  n1.start(t); n1.stop(t + 0.006)
  const osc = ctx.createOscillator()
  const og = ctx.createGain()
  const fOsc = ctx.createBiquadFilter()
  fOsc.type = 'bandpass'; fOsc.frequency.value = 1200*r; fOsc.Q.value = 3
  osc.connect(fOsc); fOsc.connect(og); og.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1200*r, t + 0.001)
  osc.frequency.exponentialRampToValueAtTime(700*r, t + 0.035)
  og.gain.setValueAtTime(0.067, t + 0.001)
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
  osc.start(t + 0.001); osc.stop(t + 0.045)
}

// Son clic vidéo lancement type jeu vidéo
function soundPlay(){
  const ctx = getCtx()
  const t = ctx.currentTime
  const r = 0.9 + Math.random() * 0.2
  const notes = [330*r, 440*r, 554*r, 660*r]
  notes.forEach((freq, i)=>{
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    const filt = ctx.createBiquadFilter()
    filt.type = 'lowpass'; filt.frequency.value = 3500; filt.Q.value = 0.6
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination)
    osc.type = 'square'
    const st = t + i * 0.045
    osc.frequency.setValueAtTime(freq, st)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.08, st + 0.04)
    g.gain.setValueAtTime(0.0, st)
    g.gain.linearRampToValueAtTime(0.042, st + 0.008)
    g.gain.exponentialRampToValueAtTime(0.001, st + 0.09)
    osc.start(st); osc.stop(st + 0.1)
  })
  const osc2 = ctx.createOscillator()
  const g2 = ctx.createGain()
  osc2.connect(g2); g2.connect(ctx.destination)
  osc2.type = 'triangle'
  osc2.frequency.setValueAtTime(880*r, t + 0.18)
  osc2.frequency.exponentialRampToValueAtTime(1100*r, t + 0.26)
  g2.gain.setValueAtTime(0.0, t + 0.18)
  g2.gain.linearRampToValueAtTime(0.054, t + 0.2)
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
  osc2.start(t + 0.18); osc2.stop(t + 0.34)
}

// Assignation son play sur les vignettes Works
document.querySelectorAll('.lazy-thumb, .demo-reel-thumb').forEach(el=>{
  el.addEventListener('click', soundPlay)
})

// THEME JOUR/NUIT
function soundTheme(toLight){
  const ctx = getCtx()
  const t = ctx.currentTime
  const r = 0.93 + Math.random() * 0.14
  if(toLight){
    // Flash lumineux court — montée rapide
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    const filt = ctx.createBiquadFilter()
    filt.type = 'lowpass'; filt.frequency.value = 5000; filt.Q.value = 0.4
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(440 * r, t)
    osc.frequency.exponentialRampToValueAtTime(1200 * r, t + 0.08)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.09, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    osc.start(t); osc.stop(t + 0.14)
  } else {
    // Extinction douce — descente rapide
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880 * r, t)
    osc.frequency.exponentialRampToValueAtTime(220 * r, t + 0.1)
    g.gain.setValueAtTime(0.07, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    osc.start(t); osc.stop(t + 0.14)
  }
}

function toggleTheme(){
  const isLight = document.body.classList.toggle('light-mode')
  document.getElementById('icon-moon').style.display = isLight ? 'none' : 'block'
  document.getElementById('icon-sun').style.display = isLight ? 'block' : 'none'
  soundTheme(isLight)
}

document.querySelector('.nav-logo').addEventListener('click', soundHome)
document.querySelector('#back-top').addEventListener('click', soundHome)
document.querySelectorAll('.btn-primary').forEach(el=> el.addEventListener('click', soundCTA))
document.querySelectorAll('.form-submit').forEach(el=> el.addEventListener('click', soundConfirm))
document.querySelectorAll('.lang-btn').forEach(el=> el.addEventListener('click', soundSwitch))
document.querySelectorAll('a:not(.btn-primary), .work-card, .demo-reel-card, .service-card, .btn-ghost').forEach(el=>{
  el.addEventListener('click', soundClick)
})

// HAMBURGER MENU
function toggleMobileMenu(){
  const menu = document.getElementById('mobile-menu')
  const btn = document.getElementById('hamburger')
  const open = menu.classList.toggle('open')
  btn.classList.toggle('open', open)
  document.body.style.overflow = open ? 'hidden' : ''
}
function closeMobileMenu(){
  document.getElementById('mobile-menu').classList.remove('open')
  document.getElementById('hamburger').classList.remove('open')
  document.body.style.overflow = ''
}
function updateMobileLang(lang){
  document.getElementById('mob-btn-fr').classList.toggle('active', lang==='fr')
  document.getElementById('mob-btn-en').classList.toggle('active', lang==='en')
  document.getElementById('mob-btn-es').classList.toggle('active', lang==='es')
}

// FORM VALIDATION retour visuel si champs vides
const contactForm = document.getElementById('contact-form')
if(contactForm){
  const inputs = contactForm.querySelectorAll('input[required], textarea[required]')
  inputs.forEach(input=>{
    input.addEventListener('blur', ()=>{
      if(!input.value.trim()){
        input.style.borderColor = 'var(--red)'
      } else {
        input.style.borderColor = 'var(--border)'
      }
    })
    input.addEventListener('input', ()=>{
      if(input.value.trim()) input.style.borderColor = 'var(--border)'
    })
  })
}

// LAZY LOADING iframes chargées au clic
function lazyLoad(thumb){
  const src = thumb.getAttribute('data-src')
  if(!src || thumb.querySelector('iframe')) return
  const iframe = document.createElement('iframe')
  iframe.src = src + '?autoplay=1'
  iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none'
  iframe.allow = 'accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture'
  iframe.allowFullscreen = true
  thumb.innerHTML = ''
  thumb.appendChild(iframe)
}
function lazyLoadVimeo(thumb){
  const src = thumb.getAttribute('data-src')
  if(!src || thumb.querySelector('iframe')) return
  const iframe = document.createElement('iframe')
  iframe.src = src + '?autoplay=1'
  iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none'
  iframe.allow = 'autoplay;fullscreen;picture-in-picture'
  iframe.allowFullscreen = true
  thumb.innerHTML = ''
  thumb.appendChild(iframe)
}

function scrollCarousel(btn, dir) {
  const carousel = btn.closest('.inspi-cat-block').querySelector('.inspi-carousel');
  const slideW = carousel.querySelector('.inspi-slide').offsetWidth + 3;
  carousel.scrollBy({ left: dir * slideW * 4, behavior: 'smooth' });
  if (carousel._pauseAutoScroll) carousel._pauseAutoScroll();
}

/* ---------------------------------------------- */

function initAutoScrollCarousels() {
  document.querySelectorAll('.inspi-carousel').forEach(carousel => {
    carousel.style.scrollBehavior = 'auto';
    let direction = 1;
    let paused = false;
    let resumeTimer = null;
    const speed = 0.03; // px per ms — slow drift

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    const pauseTemporarily = () => {
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { paused = false; }, 2200);
    };
    carousel._pauseAutoScroll = pauseTemporarily;

    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', resume);
    carousel.addEventListener('touchstart', pause, { passive: true });
    carousel.addEventListener('touchend', pauseTemporarily, { passive: true });
    carousel.addEventListener('wheel', pauseTemporarily, { passive: true });

    let lastTime = null;
    function step(timestamp) {
      if (lastTime === null) lastTime = timestamp;
      const dt = Math.min(timestamp - lastTime, 100);
      lastTime = timestamp;
      if (!paused) {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (maxScroll > 0) {
          carousel.scrollLeft += direction * speed * dt;
          if (carousel.scrollLeft >= maxScroll) {
            carousel.scrollLeft = maxScroll;
            direction = -1;
          } else if (carousel.scrollLeft <= 0) {
            carousel.scrollLeft = 0;
            direction = 1;
          }
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
try { initAutoScrollCarousels(); } catch (e) { console.error('Auto-scroll carousels failed:', e); }
