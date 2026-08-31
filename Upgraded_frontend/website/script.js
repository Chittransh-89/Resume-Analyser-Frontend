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

const ABOUT_TEXT = `This AI-powered platform combines Resume Analysis and Career Advisory into one unified system.

The Resume Analyzer evaluates resumes against job descriptions using semantic similarity, intelligent skill extraction, and ATS scoring powered by Groq LLaMA 3.

CareerBuddy, the AI career advisor, uses GitHub Models GPT-4o with RAG (ChromaDB) and live web search to provide personalized career guidance, learning resources, and YouTube tutorials.`;

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

  document.querySelectorAll('.eye').forEach(e => {
    e.style.animation = 'none';
    e.style.filter = 'drop-shadow(0 0 10px #22d3ee)';
    e.style.opacity = '1';
    setTimeout(() => {
      e.style.filter = '';
      e.style.animation = 'eyeGlow 2.5s ease-in-out infinite';
    }, 800);
  });

  robotBeam.style.width = '200px';
  robotAura.style.opacity = '1';

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

/* ══ CLASSIFICATION SECTION — File Upload ══ */
const classifyInput = document.getElementById('classifyFile');
const classifyNameDisplay = document.getElementById('classifyNameDisplay');

if (document.getElementById('dropClassify')) {
  document.getElementById('dropClassify').addEventListener('click', () => classifyInput.click());
}

if (classifyInput) {
  classifyInput.addEventListener('change', () => {
    if (classifyInput.files[0]) {
      classifyNameDisplay.textContent = classifyInput.files[0].name;
      document.getElementById('dropClassify').classList.add('has-file');
    }
  });
}

function showClassifyState(state) {
  const idle = document.getElementById('classifyIdle');
  const loading = document.getElementById('classifyLoading');
  const result = document.getElementById('classifyResult');
  if (idle) idle.classList.add('hidden');
  if (loading) loading.classList.add('hidden');
  if (result) result.classList.add('hidden');
  if (state === 'idle' && idle) idle.classList.remove('hidden');
  if (state === 'loading' && loading) loading.classList.remove('hidden');
  if (state === 'result' && result) result.classList.remove('hidden');
}

async function classifyDocument() {
  if (!classifyInput || !classifyInput.files[0]) {
    showToast('Please upload a PDF file first.');
    return;
  }

  const btn = document.getElementById('classifyBtn');
  const prevText = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }

  showClassifyState('loading');

  const formData = new FormData();
  formData.append('file', classifyInput.files[0]);

  try {
    const res = await fetchWithRetry('https://chittranshhf-resume-analyser-backend.hf.space/classify/', {
      method: 'POST',
      body: formData
    }, 2);

    if (!res.ok) {
      const txt = await res.text().catch(()=> '');
      throw new Error(`Server ${res.status}: ${txt.slice(0,200)}`);
    }

    const data = await res.json();
    console.log('CLASSIFY DATA:', data);

    showClassifyState('result');
    renderClassification(data);
    showToast('Classification complete ✓');

  } catch (err) {
    console.error('Classify failed:', err);
    showToast('Classification failed: ' + (err.message.includes('Failed to fetch') ? 'Backend is waking up (HF Space cold start) — please retry in 15s' : err.message));
    showClassifyState('idle');
  } finally {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerHTML = prevText; }
  }
}

function renderClassification(data) {
  const v = data.validation || data;

  const docType = v.type || 'UNKNOWN';
  const isResume = v.resume !== false;
  const confidence = v.confidence || 0;
  const jobRole = v.job_role || 'UNKNOWN';

  // Type icon & badge
  const typeIcon = document.getElementById('crcTypeIcon');
  const typeBadge = document.getElementById('crcTypeBadge');

  if (typeIcon && typeBadge) {
    if (docType.includes('RESUME') || isResume) {
      typeIcon.textContent = '📄';
      typeBadge.textContent = 'RESUME';
      typeBadge.classList.remove('type-jd');
    } else {
      typeIcon.textContent = '📋';
      typeBadge.textContent = 'JOB DESCRIPTION';
      typeBadge.classList.add('type-jd');
    }
  }

  // Role
  const crcRole = document.getElementById('crcRole');
  if (crcRole) crcRole.textContent = jobRole.replace(/_/g, ' ');

  // Confidence bar + number
  const confPercent = Math.round(confidence * 100);
  const confBar = document.getElementById('crcConfBar');
  const confVal = document.getElementById('crcConfVal');

  if (confBar) {
    setTimeout(() => {
      confBar.style.width = confPercent + '%';
    }, 200);
  }

  if (confVal) {
    let current = 0;
    const confInterval = setInterval(() => {
      current += 1;
      confVal.textContent = current + '%';
      if (current >= confPercent) clearInterval(confInterval);
    }, 15);
  }

  // Resume status
  const statusEl = document.getElementById('crcResumeStatus');
  const statusIcon = document.getElementById('crcResumeIcon');
  const statusText = document.getElementById('crcResumeText');

  if (statusEl && statusIcon && statusText) {
    statusEl.classList.remove('is-resume', 'not-resume');
    statusText.classList.remove('text-yes', 'text-no');

    if (isResume) {
      statusEl.classList.add('is-resume');
      statusIcon.textContent = '✅';
      statusText.textContent = 'Yes — This is a Resume';
      statusText.classList.add('text-yes');
    } else {
      statusEl.classList.add('not-resume');
      statusIcon.textContent = '📋';
      statusText.textContent = 'No — This is a Job Description';
      statusText.classList.add('text-no');
    }
  }

  // JSON output
  const jsonEl = document.getElementById('crcJson');
  if (jsonEl) {
    jsonEl.textContent = JSON.stringify({ validation: v }, null, 2);
  }
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
    showToast('Please upload both Resume and Job Description PDF files.');
    return;
  }
  const btn = document.getElementById('analyzeBtn');
  const prevHTML = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; if(btn) btn.innerHTML = '⏳ Analyzing...'; }
  showState('loading');
  const formData = new FormData();
  formData.append('resume', resumeInput.files[0]);
  formData.append('jd', jdInput.files[0]);

  try {
    const res = await fetchWithRetry('https://chittranshhf-resume-analyser-backend.hf.space/analyze/', {
      method: 'POST',
      body: formData
    }, 2);
    if (!res.ok) {
      const txt = await res.text().catch(()=> '');
      // Detect HF space sleeping HTML
      if (txt.includes('<!DOCTYPE') || txt.includes('<html')) throw new Error('Backend is waking up (cold start) — retry in 10-20s');
      throw new Error(`Server ${res.status}: ${txt.slice(0,300)}`);
    }
    const data = await res.json();
    console.log('API DATA:', data);
    showState('result');
    renderResult(data);
    showToast('Analysis complete ✓');
  } catch (err) {
    console.error('Analyze failed:', err);
    const msg = err.message.includes('Failed to fetch') ? 'Backend unreachable — HF Space may be sleeping, retry in 15s' : err.message;
    showToast(msg);
    alert('Analysis failed: ' + msg + '\nBackend: https://chittranshhf-resume-analyser-backend.hf.space');
    showState('idle');
  } finally {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.innerHTML = prevHTML; }
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

/* ══ RENDER RESULT (SINGLE — NO DUPLICATE) ══ */
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

/* ══ RENDER RESULT (UPGRADED FOR NEW API) ══ */
function renderResult(data) {

  /* ═══ 1. DOCUMENT VALIDATION ═══ */
  const docVal = data.document_validation || {};
  
  // Role Display
  const resumeRoles = docVal.resume_roles || [];
  const jdRoles = docVal.jd_roles || [];
  const roleMatch = docVal.role_match;
  
  const roleDisplayEl = document.getElementById('roleDisplay');
  if (roleDisplayEl) {
    roleDisplayEl.innerHTML = `
      <div class="role-section">
        <div class="role-row">
          <span class="role-label">📄 Resume Role:</span>
          <span class="role-value">${resumeRoles.join(', ').replace(/_/g, ' ') || 'UNKNOWN'}</span>
        </div>
        <div class="role-row">
          <span class="role-label">💼 JD Role:</span>
          <span class="role-value">${jdRoles.join(', ').replace(/_/g, ' ') || 'UNKNOWN'}</span>
        </div>
        <div class="role-match-badge ${roleMatch ? 'match-yes' : 'match-no'}">
          ${roleMatch ? '✅ Role Matched' : '❌ Role Mismatch'}
        </div>
      </div>
    `;
  }

  /* ═══ 2. CANDIDATE INFO ═══ */
  const candidate = data.candidate || {};
  const candidateEl = document.getElementById('rCandidate');
  if (candidateEl) {
    candidateEl.innerHTML = `
      <div class="candidate-grid">
        <div class="candidate-item">
          <span class="cand-label">👤 Name</span>
          <span class="cand-value">${candidate.name || 'N/A'}</span>
        </div>
        <div class="candidate-item">
          <span class="cand-label">📧 Email</span>
          <span class="cand-value">${candidate.email || 'N/A'}</span>
        </div>
        <div class="candidate-item">
          <span class="cand-label">⏱️ Experience</span>
          <span class="cand-value">${candidate.experience_years || 'N/A'} ${typeof candidate.experience_years === 'number' ? 'years' : ''}</span>
        </div>
        <div class="candidate-item">
          <span class="cand-label">📂 Projects</span>
          <span class="cand-value">${candidate.projects_count || 0}</span>
        </div>
      </div>
    `;
  }

  /* ═══ 3. JOB NEEDS ═══ */
  const jobNeeds = data.job_needs || {};
  const jobNeedsEl = document.getElementById('rJobNeeds');
  if (jobNeedsEl) {
    const requiredSkills = jobNeeds.required_skills || [];
    const preferredSkills = jobNeeds.preferred_skills || [];
    
    jobNeedsEl.innerHTML = `
      <div class="job-title-display">
        <span class="job-label">🎯 Job Title:</span>
        <span class="job-title">${jobNeeds.title || 'UNKNOWN'}</span>
      </div>
      <div class="skills-required">
        <h4 class="skills-heading">Required Skills</h4>
        <div class="skills-tags">
          ${requiredSkills.map(s => `<span class="tag tag-required">${s}</span>`).join('')}
        </div>
      </div>
      <div class="skills-preferred">
        <h4 class="skills-heading">Preferred Skills</h4>
        <div class="skills-tags">
          ${preferredSkills.map(s => `<span class="tag tag-preferred">${s}</span>`).join('')}
        </div>
      </div>
    `;
  }

  /* ═══ 4. SCORES ═══ */
  const finalScore = Math.round(data.score?.final_score || 0);
  const semanticScore = Math.round(data.analysis?.semantic_score || 0);
  const verdict = data.score?.verdict || 'UNCERTAIN';

  setTimeout(() => {
    animateRing('rFinal', finalScore);
    animateCounter('vFinal', 0, finalScore, 1600);
    
    if (document.getElementById('rSemantic')) {
      animateRing('rSemantic', semanticScore);
      animateCounter('vSemantic', 0, semanticScore, 1600);
    }
  }, 300);

  // Verdict Badge
  const verdictEl = document.getElementById('rVerdict');
  if (verdictEl) {
    verdictEl.textContent = verdict.replace(/_/g, ' ');
    verdictEl.className = 'verdict-badge ' + getVerdictClass(verdict);
  }

  /* ═══ 5. SKILLS ANALYSIS ═══ */
  const analysis = data.analysis || {};
  const matched = analysis.matched_skills || [];
  const missing = analysis.missing_skills || [];

  const missingEl = document.getElementById('rMissing');
  if (missingEl) {
    missingEl.innerHTML = missing.length 
      ? missing.map(s => `<span class="tag tag-missing">${s}</span>`).join('')
      : '<span class="no-data">No missing skills! 🎉</span>';
  }

  const matchedEl = document.getElementById('rMatched');
  if (matchedEl) {
    matchedEl.innerHTML = matched.slice(0, 14).map(s =>
      `<span class="tag tag-matched">${s}</span>`).join('')
      + (matched.length > 14
        ? `<span class="tag tag-matched" style="opacity:.6">+${matched.length - 14}</span>`
        : '');
  }

  /* ═══ 6. REVIEW (Strengths / Weaknesses / Reason) ═══ */
  const review = data.review || {};

  const strengthsEl = document.getElementById('rStrengths');
  if (strengthsEl) {
    strengthsEl.innerHTML = (review.strengths || []).map(s =>
      `<li class="review-item strength-item">
        <span class="review-icon">💪</span>
        <span class="review-text">${s}</span>
      </li>`
    ).join('');
  }

  const weaknessesEl = document.getElementById('rWeaknesses');
  if (weaknessesEl) {
    weaknessesEl.innerHTML = (review.weaknesses || []).map(w =>
      `<li class="review-item weakness-item">
        <span class="review-icon">⚠️</span>
        <span class="review-text">${w}</span>
      </li>`
    ).join('');
  }

  const reasonEl = document.getElementById('rReasoning');
  if (reasonEl) {
    reasonEl.innerHTML = `
      <div class="reason-box">
        <span class="reason-icon">💡</span>
        <p class="reason-text">${review.reason || 'No reason available'}</p>
      </div>
    `;
  }

  /* ═══ 7. IMPROVEMENTS - LINE BY LINE ═══ */
  const improvements = data.improvements || {};
  const lineByLine = improvements.line_by_line || [];
  const topSuggestions = improvements.top_suggestions || [];
  const summary = improvements.summary || {};

  // Summary stats
  const summaryEl = document.getElementById('rImprovementSummary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="summary-stats">
        <div class="stat-box">
          <span class="stat-num">${summary.total_bullets || 0}</span>
          <span class="stat-label">Total Bullets</span>
        </div>
        <div class="stat-box stat-improved">
          <span class="stat-num">${summary.improved_count || 0}</span>
          <span class="stat-label">Improved</span>
        </div>
      </div>
    `;
  }

  // Line-by-line bullets
  const list = document.getElementById('rBullets');
  if (list) {
    list.innerHTML = '';

    lineByLine.slice(0, 10).forEach((b, i) => {
      const card = document.createElement('div');
      card.className = 'rbullet-card';
      card.style.animationDelay = (i * 0.08) + 's';

      const original = b.original || '';
      const improved = b.improved || '';
      const changed = b.changed;

      card.innerHTML = `
        <div class="bullet-status ${changed ? 'is-changed' : 'no-change'}">
          ${changed ? '✨ IMPROVED' : '✓ NO CHANGE NEEDED'}
        </div>
        <div class="bullet-original">
          <span class="b-label label-orig">✧ ORIGINAL</span>
          <p class="bullet-text-orig">${highlightKw(original)}</p>
        </div>
        ${changed ? `
          <div class="bullet-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="#22d3ee" stroke-width="2" stroke-linecap="round"
                 stroke-linejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>
          <div class="bullet-improved">
            <span class="b-label label-good">✦ IMPROVED</span>
            <p class="bullet-text-imp">${highlightKw(improved)}</p>
          </div>
        ` : ''}
      `;
      list.appendChild(card);
    });
  }

  /* ═══ 8. TOP SUGGESTIONS ═══ */
  const topSuggestionsEl = document.getElementById('rTopSuggestions');
  if (topSuggestionsEl) {
    topSuggestionsEl.innerHTML = topSuggestions.length
      ? `<ol class="top-suggestions-list">
          ${topSuggestions.map(s => `<li class="top-sug-item">${highlightKw(s)}</li>`).join('')}
        </ol>`
      : '<p class="no-data">No suggestions available</p>';
  }
}

/* ═══ HELPER: Verdict CSS Class ═══ */
function getVerdictClass(verdict) {
  const v = verdict.toUpperCase();
  if (v.includes('STRONG')) return 'verdict-strong';
  if (v.includes('GOOD')) return 'verdict-good';
  if (v.includes('WEAK') || v.includes('MODERATE')) return 'verdict-weak';
  if (v.includes('NO_MATCH') || v.includes('LOW')) return 'verdict-low';
  return 'verdict-uncertain';
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

// ═══════════════════════════════════════
// BACKEND HEALTH CHECK + FETCH WITH RETRY
// ═══════════════════════════════════════

const CAREER_BUDDY_API = "https://chittranshhf-resume-analyser-backend.hf.space";
const HEALTH_URL = `${CAREER_BUDDY_API}/api/health`;
let backendHealthy = false;
let brainLoaded = false;

// HF Spaces need retry for cold start — up to 40s
async function fetchWithRetry(url, options={}, retries=2, delayMs=6000){
  for(let attempt=0; attempt<=retries; attempt++){
    try{
      const controller = new AbortController();
      const timeout = setTimeout(()=> controller.abort(), 35000);
      const res = await fetch(url, { ...options, signal: controller.signal, mode: 'cors' });
      clearTimeout(timeout);
      // If HF returns 503 HTML (space sleeping), treat as retryable
      if(res.status===503 || res.status===502){
        const txt = await res.clone().text().catch(()=> '');
        if(txt.includes('Space') || txt.includes('html')) throw new Error('HF Space waking up');
      }
      return res;
    }catch(err){
      const isLast = attempt===retries;
      const retryable = err.name==='AbortError' || err.message.includes('Failed to fetch') || err.message.includes('waking');
      if(!isLast && retryable){
        console.warn(`Fetch attempt ${attempt+1} failed, retrying in ${delayMs}ms...`, err.message);
        updateHealthUI('warming', `Waking up... retry ${attempt+1}/${retries}`);
        await new Promise(r=> setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
}

function updateHealthUI(state, customMsg){
  const navDot = document.getElementById('navStatusDot');
  const navText = document.getElementById('navStatusText');
  const chatDot = document.getElementById('chatStatusDot');
  const chatText = document.getElementById('chatStatusText');
  const footDot = document.getElementById('footerStatusDot');
  const footText = document.getElementById('footerStatusText');

  const cfg = {
    online:   { color:'#22c55e', bg:'rgba(34,197,94,0.15)', border:'rgba(34,197,94,0.3)', msg:'Online — Ready' },
    warming:  { color:'#f59e0b', bg:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.3)', msg:'Warming up models...' },
    offline:  { color:'#ef4444', bg:'rgba(239,68,68,0.15)', border:'rgba(239,68,68,0.3)', msg:'Offline — retrying...' },
    checking: { color:'#94a3b8', bg:'rgba(148,163,184,0.1)', border:'rgba(148,163,184,0.2)', msg:'Checking...' }
  };
  const c = cfg[state] || cfg.checking;
  const msg = customMsg || c.msg;

  [navDot, chatDot, footDot].forEach(dot=>{
    if(!dot) return;
    dot.style.background = c.color;
    dot.style.boxShadow = `0 0 8px ${c.color}`;
    dot.style.animation = state==='offline' ? 'none' : 'statusBlink 2s ease-in-out infinite';
  });
  [navText, chatText, footText].forEach(el=>{
    if(!el) return;
    el.textContent = msg;
    el.style.color = c.color;
  });
  const navStatus = document.getElementById('navBackendStatus');
  const chatHeaderStatus = document.getElementById('chatHeaderStatus');
  const footerStatus = document.getElementById('footerStatus');
  [navStatus, chatHeaderStatus, footerStatus].forEach(box=>{
    if(!box) return;
    box.style.background = c.bg;
    box.style.borderColor = c.border;
  });
}

async function checkBackendHealth(){
  updateHealthUI('checking');
  try{
    const res = await fetch(HEALTH_URL, { mode:'cors', cache:'no-store' });
    if(!res.ok) throw new Error(`Health ${res.status}`);
    const data = await res.json();
    console.log('🏥 Health:', data);
    backendHealthy = data.status === 'online';
    brainLoaded = data.brain_loaded === true;
    if(!backendHealthy) updateHealthUI('offline', 'Backend offline');
    else if(!brainLoaded) updateHealthUI('warming', 'Online — models warming');
    else updateHealthUI('online', 'Online — Ready');
    return backendHealthy;
  }catch(err){
    console.warn('Health check failed:', err.message);
    backendHealthy = false;
    updateHealthUI('offline', 'Offline — HF Space sleeping?');
    return false;
  }
}

// Poll on load + every 30s
window.addEventListener('DOMContentLoaded', ()=>{
  checkBackendHealth();
  setInterval(checkBackendHealth, 30000);
});

// ✅ Saari markdown links new tab me khulengi
// ✅ Naya marked API compatible
const renderer = new marked.Renderer();
renderer.link = function(token) {
  // Naya marked version object deta hai
  const href = typeof token === 'object' ? token.href : token;
  const title = typeof token === 'object' ? token.title : arguments[1];
  const text = typeof token === 'object' ? token.text : arguments[2];
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title || ''}">${text}</a>`;
};
marked.setOptions({ renderer: renderer });

// Send message function — tera HTML isko call kar raha hai onclick
async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSendBtn");
  const message = input.value.trim();
  if (!message) return;

  // Input clear karo
  input.value = "";
  if(sendBtn) sendBtn.disabled = true;

  // User message display karo
  appendChatMessage("user", message);

  // Suggestions hide karo
  const sugg = document.getElementById("chatSuggestions");
  if(sugg) sugg.style.display = "none";

  // Typing indicator dikha
  const typingId = showTypingIndicator();

  try {
    const res = await fetchWithRetry(`${CAREER_BUDDY_API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message , use_web_search: true})
    }, 2, 6000);

    if(!res.ok){
      const txt = await res.text().catch(()=> '');
      throw new Error(`Server ${res.status}: ${txt.slice(0,200)}`);
    }

    const data = await res.json();
    console.log("📦 API Response:", data);
    console.log("google_links:", data.google_links);
    console.log("youtube_links:", data.youtube_links);
    console.log("response preview:", data.response?.substring(0, 200));

    // Typing indicator hata
    removeTypingIndicator(typingId);

    // If backend returns connection error but HTTP 200, surface it
    if(typeof data.response === 'string' && data.response.includes('Connection error')){
      appendChatMessage("bot", "⚠️ Backend is online but AI brain is warming up. Please retry in 10s. If persists, check HF Space secrets (GROQ_API_KEY).");
      updateHealthUI('warming', 'AI brain warming...');
      showToast('AI brain warming — retry in 10s');
    } else {
      // Bot response dikha
      appendChatMessage("bot", data);
      updateHealthUI('online', 'Online — Ready');
    }

  } catch (err) {
    console.error('Chat failed:', err);
    removeTypingIndicator(typingId);
    const isNetwork = err.message.includes('Failed to fetch') || err.name==='AbortError';
    const msg = isNetwork
      ? "❌ Backend se connect nahi ho pa raha. HF Space sleep kar raha ho sakta hai — 20s me auto-retry hoga. Backend: https://chittranshhf-resume-analyser-backend.hf.space"
      : `❌ Error: ${err.message}`;
    appendChatMessage("bot", msg);
    updateHealthUI('offline', 'Offline — retrying');
    showToast(isNetwork ? 'Backend waking up — retrying...' : err.message);
  } finally {
    if(sendBtn) sendBtn.disabled = false;
    // re-check health in background
    checkBackendHealth();
  }
}


// Suggestion chip click — tera HTML isko call kar raha hai
function askSuggestion(btn) {
  const text = btn.innerText.replace(/^[^\w]+/, "").trim(); // emoji hata
  document.getElementById("chatInput").value = text;
  sendChatMessage();
}


// Clear chat — tera clear button isko call karega
const chatClearBtn = document.getElementById("chatClearBtn");
if (chatClearBtn) chatClearBtn.addEventListener("click", async () => {
  try {
    await fetchWithRetry(`${CAREER_BUDDY_API}/api/chat/clear`, { method: "POST" }, 1, 2000);
  } catch(e){ console.warn('Clear chat backend failed:', e.message); }
  // UI clear karo — sirf welcome message rakho
  const chatMessages = document.getElementById("chatMessages");
  if(chatMessages){
    const allMsgs = chatMessages.querySelectorAll(".chat-msg");
    allMsgs.forEach((msg, i) => { if (i > 0) msg.remove(); });
  }
  const sugg = document.getElementById("chatSuggestions");
  if(sugg) sugg.style.display = "flex";
  showToast('Chat cleared');
});


// Enter key se bhi bhej sake
const chatInputEl = document.getElementById("chatInput");
if (chatInputEl) chatInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendChatMessage();
});


// ═══════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════

function appendChatMessage(role, data) {
  const chatMessages = document.getElementById("chatMessages");
  const isBot = role === "bot";
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Backend se structured data aa raha hai
  const text = typeof data === "string" ? data : (data?.response ?? "No response received");
  const usedWebSearch = typeof data === "object" ? (data?.used_web_search ?? false) : false;
  const ytLinks = typeof data === "object" ? (data?.youtube_links ?? []) : [];
  const googleLinks = typeof data === "object" ? (data?.google_links ?? []) : [];

  if (!text || text === "undefined" || text === "null") {
    console.error("❌ Empty response received:", data);
    return;
  }
  // Markdown parse
  const displayText = isBot ? marked.parse(text) : text;

  // Web Search Badge
  const webBadge = usedWebSearch ? `
    <div class="chat-badge web-search-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      Live Web Search
    </div>
  ` : "";

  // ✅ Google Links Section
  const googleSection = googleLinks.length > 0 ? `
    <div class="google-links-section">
      <div class="google-title">🔍 Google Search Links</div>
      ${googleLinks
        .filter(link => link && link !== "undefined" && link.startsWith("http"))
        .map(link => {
          // URL se readable title nikalo
          const query = decodeURIComponent(link.split("?q=")[1] || link);
          return `
            <a href="${link}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="google-link-card">
              🔍 ${query}
            </a>
          `;
        }).join("")}
    </div>
  ` : "";

  // YouTube Links Section
    // ✅ YouTube links — only valid URLs
  const ytSection = ytLinks.length > 0 ? `
    <div class="yt-links-section">
      <div class="yt-title">📺 YouTube Resources</div>
      ${ytLinks
        .filter(link => link && link !== "undefined" && link.startsWith("http"))
        // ✅ Naya - readable title
      .map(link => {
        const query = decodeURIComponent(link.split("search_query=")[1] || link);
        return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="yt-link-card">▶ ${query}</a>`;
      }).join("")}
      </div>
      ` : "";
      
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-msg ${isBot ? "bot-msg" : "user-msg"}`;

  msgDiv.innerHTML = isBot ? `
    <div class="chat-msg-avatar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="1.5">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    </div>
    <div class="chat-msg-bubble">
      <div class="chat-msg-name">CareerBuddy</div>
      ${webBadge}
      <div class="chat-msg-text formatted-response">${displayText}</div>
      ${googleSection}
      ${ytSection}
      <div class="chat-msg-time">${time}</div>
    </div>
  ` : `
    <div class="chat-msg-bubble user-bubble">
      <div class="chat-msg-text">${text}</div>
      <div class="chat-msg-time">${time}</div>
    </div>
  `;

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


function showTypingIndicator() {
  const id = "typing-" + Date.now();
  const chatMessages = document.getElementById("chatMessages");

  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-msg bot-msg";
  typingDiv.id = id;
  typingDiv.innerHTML = `
    <div class="chat-msg-avatar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="1.5">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    </div>
    <div class="chat-msg-bubble">
      <div class="chat-msg-name">CareerBuddy</div>
      <div class="chat-msg-text typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return id;
}


function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

