'use strict';

/* ── State ── */
let isRunning = false;

/* ── API key toggle ── */
function toggleKey() {
  const inp = document.getElementById('apiKey');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

/* ── Main analysis ── */
async function runAnalysis() {
  if (isRunning) return;

  const apiKey  = document.getElementById('apiKey').value.trim();
  const name    = document.getElementById('name').value.trim();
  const company = document.getElementById('company').value.trim();
  const job     = document.getElementById('job').value.trim();
  const cv      = document.getElementById('cv').value.trim();

  if (!apiKey)  return showError('Please enter your Anthropic API key.');
  if (!job)     return showError('Please paste the job posting.');
  if (!cv)      return showError('Please paste your CV text.');

  setRunning(true);

  /* Show results section */
  const resultsSection = document.getElementById('resultsSection');
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  resetUI();

  const systemPrompt = `You are an expert recruiter and career coach. Analyse a candidate's CV against a job posting and write a professional cover letter.

Respond ONLY with valid JSON — no markdown, no backticks, no text before or after — using EXACTLY this structure:
{
  "score": <integer 0-100 reflecting true skill overlap>,
  "scoreLabel": "<short verdict e.g. 'Strong match' / 'Moderate match' / 'Low match'>",
  "matched": ["<matched skill/requirement>", ...],
  "missing": ["<gap or missing requirement>", ...],
  "advice": "<2-3 sentence coaching note on what to emphasise or address>",
  "coverLetter": "<full professional cover letter in English, 4 paragraphs, no placeholder brackets>",
  "tips": "<3-5 specific pre-submission tips, each on a new line starting with a dash>"
}

Score must be honest — do not inflate. A score above 80 means the candidate meets almost all requirements. Base it on concrete skill matches.`;

  const userMsg = `CANDIDATE: ${name || 'The candidate'}
TARGET COMPANY: ${company || 'the company'}

=== JOB POSTING ===
${job}

=== CANDIDATE CV ===
${cv}

Analyse the match and generate a tailored cover letter.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const raw  = data.content?.find(b => b.type === 'text')?.text || '';

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      /* Fallback: just show raw text in cover letter area */
      typeText('coverText', raw);
      setRunning(false);
      return;
    }

    renderScore(parsed);
    await typeText('coverText', parsed.coverLetter || '');
    renderTips(parsed.tips || '');

  } catch (err) {
    showError(err.message || 'Unknown error. Check the console.');
    console.error(err);
  }

  setRunning(false);
}

/* ── Render score card ── */
function renderScore(p) {
  const score = Math.min(100, Math.max(0, Math.round(p.score ?? 0)));

  /* Circle & number */
  const circle = document.getElementById('scoreCircle');
  document.getElementById('scoreNum').textContent = score;

  const cls = score >= 70 ? 'high' : score >= 45 ? 'mid' : 'low';
  const colours = { high: '#639922', mid: '#BA7517', low: '#A32D2D' };
  circle.style.borderColor = colours[cls];

  /* Bar */
  const bar = document.getElementById('scoreBar');
  requestAnimationFrame(() => {
    bar.style.width = score + '%';
    bar.className = 'score-bar bar-' + cls;
  });

  document.getElementById('scoreLabel').textContent = p.scoreLabel || '';

  /* Matched tags */
  const matchEl = document.getElementById('matchTags');
  (p.matched || []).forEach(m => {
    const t = document.createElement('span');
    t.className = 'tag tag-match';
    t.textContent = '✓ ' + m;
    matchEl.appendChild(t);
  });

  /* Missing tags */
  const missEl = document.getElementById('missTags');
  (p.missing || []).forEach(m => {
    const t = document.createElement('span');
    t.className = 'tag tag-miss';
    t.textContent = '✗ ' + m;
    missEl.appendChild(t);
  });

  /* Advice */
  if (p.advice) {
    document.getElementById('adviceText').textContent = p.advice;
    document.getElementById('adviceBox').style.display = 'flex';
  }
}

/* ── Type text with animation ── */
async function typeText(elId, text) {
  const el = document.getElementById(elId);
  el.classList.add('stream-cursor');
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    el.textContent += (i === 0 ? '' : ' ') + words[i];
    if (i % 4 === 0) await sleep(8);
  }
  el.classList.remove('stream-cursor');
}

/* ── Render tips ── */
function renderTips(tips) {
  document.getElementById('tipsText').textContent = tips;
}

/* ── Copy cover letter ── */
function copyText() {
  const text = document.getElementById('coverText').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2200);
  }).catch(() => {
    /* Fallback for older browsers */
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

/* ── UI helpers ── */
function setRunning(val) {
  isRunning = val;
  const btn = document.getElementById('runBtn');
  if (val) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-dots"><span>●</span><span>●</span><span>●</span></span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = '<span id="btnContent"><span class="btn-icon">✦</span> Analyse & Generate Cover Letter</span>';
  }
}

function resetUI() {
  document.getElementById('scoreNum').textContent  = '—';
  document.getElementById('scoreLabel').textContent = 'Analysing...';
  document.getElementById('scoreBar').style.width  = '0%';
  document.getElementById('scoreBar').className    = 'score-bar';
  document.getElementById('scoreCircle').style.borderColor = '#dddcd6';
  document.getElementById('matchTags').innerHTML   = '';
  document.getElementById('missTags').innerHTML    = '';
  document.getElementById('adviceBox').style.display = 'none';
  document.getElementById('coverText').textContent = '';
  document.getElementById('coverText').classList.remove('stream-cursor');
  document.getElementById('tipsText').textContent  = '';
}

function showError(msg) {
  const btn = document.getElementById('runBtn');
  btn.disabled = false;
  btn.innerHTML = '<span id="btnContent"><span class="btn-icon">✦</span> Analyse & Generate Cover Letter</span>';
  isRunning = false;
  alert('⚠️ ' + msg);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── Allow Enter in single-line fields to trigger analysis ── */
['name', 'company'].forEach(id => {
  document.getElementById(id)?.addEventListener('keydown', e => {
    if (e.key === 'Enter') runAnalysis();
  });
});
