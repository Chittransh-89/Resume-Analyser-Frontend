/* ══ STARFIELD ══ */
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
function resizeCanvas() { canvas.width = innerWidth; canvas.height = innerHeight; }
function initStars() {
  resizeCanvas();
  stars = Array.from({ length: 280 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.4,
    speed: Math.random() * 0.35 + 0.05,
    alpha: Math.random() * 0.8 + 0.1,
    twinkle: Math.random() * Math.PI * 2
  }));
}
function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    s.y += s.speed;
    s.twinkle += 0.02;
    if (s.y > canvas.height) s.y = 0;
    const alpha = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}
window.addEventListener('resize', () => { resizeCanvas(); });
initStars(); drawStars();

/* ══ PARTICLES ══ */
const pContainer = document.getElementById('particles');
for (let i = 0; i < 35; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 2.5 + 1;
  p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random() * 100}vw;
    bottom:0;
    opacity:${Math.random() * 0.3 + 0.1};
    animation-duration:${Math.random() * 12 + 8}s;
    animation-delay:${Math.random() * 8}s;
  `;
  pContainer.appendChild(p);
}

/* ══ NAVBAR ══ */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ══ ROBOT / HOLOGRAM ══ */
let holoOpen = false;
const robotWrap = document.getElementById('robotWrap');
const holoPanel = document.getElementById('holoPanel');
const holoPanelWrap = document.getElementById('holoPanelWrap');
const robotAura = document.getElementById('robotAura');
const robotBeam = document.getElementById('robotBeam');
const robotCta = document.getElementById('robotCta');
const typedText = document.getElementById('typedText');
const techStack = document.getElementById('techStack');

const ABOUT_TEXT = `This AI Resume Analyzer evaluates resumes using advanced Natural Language Processing techniques.

It compares resumes with job descriptions using semantic similarity and intelligent skill extraction.

The system provides ATS scoring, identifies missing skills, and enhances resume bullet points using LLaMA 3 via Groq API.`;

function typeText(text, el, speed, cb) {
  el.textContent = '';
  let i = 0;
  const iv = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) { clearInterval(iv); if (cb) cb(); }
  }, speed);
}

robotWrap.addEventListener('click', () => {
  if (holoOpen) return;
  holoOpen = true;
  robotCta.style.opacity = '0';

  /* Eye glow boost */
  document.querySelectorAll('.eye').forEach(e => {
    e.style.animation = 'none';
    e.style.filter = 'drop-shadow(0 0 10px #22d3ee)';
    e.style.opacity = '1';
    setTimeout(() => {
      e.style.filter = '';
      e.style.animation = 'eyeGlow 2.5s ease-in-out infinite';
    }, 800);
  });

  /* Beam */
  robotBeam.style.width = '200px';
  robotAura.style.opacity = '1';

  /* Open panel */
  setTimeout(() => {
    holoPanel.classList.add('open');
    typeText(ABOUT_TEXT, typedText, 22, () => {
      setTimeout(() => {
        techStack.style.opacity = '1';
        techStack.style.transition = 'opacity .8s ease';
      }, 400);
    });
  }, 500);
});

/* ══ DEMO ══ */
let demoRunning = false;
function runDemo() {
  if (demoRunning) return;
  demoRunning = true;
  const btn = document.getElementById('demoBtn');
  btn.disabled = true;
  btn.innerHTML = btn.innerHTML.replace('Show Demo', 'Running...');

  const arena = document.getElementById('demoArena');
  const demoResultHolo = document.getElementById('demoResultHolo');
  arena.classList.add('visible');
  demoResultHolo.classList.remove('visible');

  const steps = [
    { el: document.getElementById('ds1'), st: document.getElementById('st1'), delay: 400 },
    { el: document.getElementById('ds2'), st: document.getElementById('st2'), delay: 1200 },
    { el: document.getElementById('ds3'), st: document.getElementById('st3'), delay: 2200 },
  ];

  steps.forEach(({ el, st, delay }, idx) => {
    setTimeout(() => {
      el.classList.add('active');
      if (idx < 2) {
        setTimeout(() => { st.textContent = '✔'; }, 500);
      } else {
        /* Scanning animation for step 3 */
        let dots = 0;
        const iv = setInterval(() => { st.textContent = '.'.repeat(dots % 4); dots++; }, 350);
        setTimeout(() => {
          clearInterval(iv);
          st.textContent = '✔';
          showDemoResult();
        }, 1800);
      }
    }, delay);
  });
}

function showDemoResult() {
  const holo = document.getElementById('demoResultHolo');
  holo.classList.add('visible');
  setTimeout(() => {
    animateRing('demoProgress', 82);
    animateCounter('demoScoreVal', 0, 82, 1600);
  }, 300);
  setTimeout(() => {
    demoRunning = false;
    const btn = document.getElementById('demoBtn');
    btn.disabled = false;
    btn.innerHTML = btn.innerHTML.replace('Running...', 'Show Demo');
  }, 3000);
}

/* ══ FILE UPLOAD (Implementation) ══ */
const resumeInput = document.getElementById('resumeFile');
const jdInput = document.getElementById('jdFile');
const resumeNameDisplay = document.getElementById('resumeNameDisplay');
const jdNameDisplay = document.getElementById('jdNameDisplay');

document.getElementById('dropResume').addEventListener('click', () => resumeInput.click());
document.getElementById('dropJd').addEventListener('click', () => jdInput.click());

resumeInput.addEventListener('change', () => {
  if (resumeInput.files[0]) {
    resumeNameDisplay.textContent = resumeInput.files[0].name;
    document.getElementById('dropResume').classList.add('has-file');
  }
});
jdInput.addEventListener('change', () => {
  if (jdInput.files[0]) {
    jdNameDisplay.textContent = jdInput.files[0].name;
    document.getElementById('dropJd').classList.add('has-file');
  }
});

/* ══ ANALYZE ══ */
async function analyzeResume() {
  if (!resumeInput.files[0] || !jdInput.files[0]) {
    alert('Please upload both Resume and Job Description PDF files.');
    return;
  }
  showState('loading');
  const formData = new FormData();
  formData.append('file', resumeInput.files[0]);
  formData.append('jd', jdInput.files[0]);

  try {
    const res = await fetch('http://127.0.0.1:8000/analyze/', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(`Server: ${res.status}`);
    const data = await res.json();
    console.log('API DATA:', data);
    showState('result');
    renderResult(data);
  } catch (err) {
    console.error(err);
    alert('Backend not reachable. Make sure FastAPI is running on http://127.0.0.1:8000');
    showState('idle');
  }
}

function showState(state) {
  document.getElementById('idleState').classList.add('hidden');
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('resultState').classList.add('hidden');
  if (state === 'idle') document.getElementById('idleState').classList.remove('hidden');
  if (state === 'loading') document.getElementById('loadingState').classList.remove('hidden');
  if (state === 'result') document.getElementById('resultState').classList.remove('hidden');
}

/* ══ RENDER RESULT ══ */
const KEYWORDS = [
  "python","scikit-learn","machine learning","logistic regression","linear regression",
  "kaggle","pandas","numpy","ai","data","classification","predictive","models",
  "tensorflow","pytorch","keras","docker","kubernetes","aws","azure","gcp","fastapi",
  "spark","ci/cd","git","ml","regression","forecast","accuracy","pipeline","production",
  "deployed","designed","developed","nlp","transformers","bert","llm"
];

function highlightKw(text) {
  if (!text) return '';
  const rx = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`, 'gi');
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(rx, m => `<span class="keyword">${m}</span>`);
}

function renderResult(data) {
  /* Role */
  document.getElementById('roleDisplay').textContent =
    data.role_match?.resume_role || data.validation?.resume?.job_role || 'UNKNOWN';

  /* Scores */
  const final = Math.round(data.scores?.final || 0);
  const semantic = Math.round(data.scores?.semantic || 0);
  const skill = Math.round(data.scores?.skill || 0);

  setTimeout(() => {
    animateRing('rFinal', final);
    animateCounter('vFinal', 0, final, 1600);
    animateRing('rSemantic', semantic);
    animateCounter('vSemantic', 0, semantic, 1600);
    animateRing('rSkill', skill);
    animateCounter('vSkill', 0, skill, 1600);
  }, 300);

  /* Skills */
  const missing = data.skills?.missing || [];
  const matched = data.skills?.matched || [];
  document.getElementById('rMissing').innerHTML = missing.map(s =>
    `<span class="tag tag-missing">${s}</span>`).join('');
  document.getElementById('rMatched').innerHTML = matched.slice(0, 14).map(s =>
    `<span class="tag tag-matched">${s}</span>`).join('')
    + (matched.length > 14
      ? `<span class="tag tag-matched" style="opacity:.6">+${matched.length - 14}</span>`
      : '');

  /* ══ BULLETS — Original + Improved dono dikhao ══ */
  const bullets = data.improved_bullets || [];
  const list = document.getElementById('rBullets');
  list.innerHTML = '';

  bullets.slice(0, 8).forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'rbullet-card';
    card.style.animationDelay = (i * 0.08) + 's';

    /* Check if bullet is object or string */
    const isObject = typeof b === 'object' && b !== null;
    const originalText = isObject ? (b.original || '') : '';
    const improvedText = isObject ? (b.improved || '') : b;

    /* Build card HTML with original + improved */
    card.innerHTML = `
      ${originalText
        ? `<div class="bullet-original">
             <span class="b-label label-orig">✧ ORIGINAL</span>
             <p class="bullet-text-orig">${highlightKw(originalText)}</p>
           </div>
           <div class="bullet-arrow">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#22d3ee" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
               <path d="M12 5v14M19 12l-7 7-7-7"/>
             </svg>
           </div>`
        : ''
      }
      <div class="bullet-improved">
        <span class="b-label label-good">✦ IMPROVED</span>
        <p class="bullet-text-imp">${highlightKw(improvedText)}</p>
      </div>
    `;

    list.appendChild(card);
  });

  /* Reasoning */
  document.getElementById('rReasoning').textContent = data.reasoning || '';
}
/* ══ RING + COUNTER ANIMATORS ══ */
function animateRing(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (value / 100) * circumference;
  el.style.strokeDashoffset = offset;
}

function animateCounter(id, from, to, dur) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor(from + (to - from) * p);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ══ TOAST ══ */
function showToast(msg = 'Copied!') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* Page load pe toast hide karo */
window.addEventListener('load', () => {
  const t = document.getElementById('toast');
  t.style.opacity = '0';
  t.style.pointerEvents = 'none';
});

/* ══ SMOOTH SCROLL ══ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ══ CREDITS CARD — scroll reveal ══ */
const creditsCard = document.getElementById('creditsCard');

const creditsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        creditsCard.classList.add('visible');
        creditsObserver.unobserve(creditsCard);
      }
    });
  },
  { threshold: 0.25 }
);

if (creditsCard) creditsObserver.observe(creditsCard);