// ===== STATE =====
const STORAGE_KEY = "amendData_v1";

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {
    onboardingComplete:false,
    seenIntroVideo:false,
    user:{ preferredName:"", safeAnchor:"", safetyColour:"#58BB80" },
    practicePrefs:{ priorityOrder:["Move","Breathe","Ponder","Journal"], preferredDuration:"10 min", preferredIntensity:"Gentle", preferredTime:"Any" },
    assessmentAnswers:{},
    assessmentStep:0,
    themes:null,
    journalEntries:[],
    progress:{ daysActive:0, practicesCompleted:0, winsRecorded:0, safetyAnchorUses:0, last7Days:[0,0,0,0,0,0,0], lastActiveDate:null },
    settings:{ textSize:100, reducedMotion:false, showWoundLabels:true, reminderTime:"18:00" },
    coins:0,
    today:{ date:null, mood:null, practiceDone:false, swappedPracticeKey:null, promptIndex:0, landedToday:null },
    currentTab:"today"
  };
}

let state = loadState();

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayStr(){ return new Date().toISOString().slice(0,10); }

function ensureTodayFresh(){
  const t = todayStr();
  if(state.today.date !== t){
    const wasActive = state.today.date !== null;
    state.today = { date:t, mood:null, practiceDone:false, swappedPracticeKey:null, promptIndex: Math.floor(Math.random()*4), landedToday:null };
    if(wasActive){
      bumpStreak();
    }
    saveState();
  }
}

function bumpStreak(){
  state.progress.last7Days.shift();
  state.progress.last7Days.push(0);
}

function markActivityToday(amount=1){
  const arr = state.progress.last7Days;
  arr[arr.length-1] = Math.min(3, arr[arr.length-1] + amount);
  if(state.progress.lastActiveDate !== todayStr()){
    state.progress.daysActive++;
    state.progress.lastActiveDate = todayStr();
  }
  saveState();
}

// ===== APP ROOT =====
const app = document.getElementById("app");

function render(){
  saveState();
  if(!state.onboardingComplete){
    renderOnboarding();
  } else {
    ensureTodayFresh();
    renderMainApp();
  }
}

// ===== ICONS (simple inline SVG) =====
const ICONS = {
  today: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  practice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>`,
  journal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h11l3 3v13H5z"/><path d="M9 9h7M9 13h7M9 17h4"/></svg>`,
  progress: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M11 20V4M18 20v-7"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>`
};

function escapeHtml(s){
  return (s||"").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// ===== ONBOARDING =====
let ob = { step:"welcome" }; // welcome -> foundation -> practiceSetup -> assessmentQ(n) -> results

function renderOnboarding(){
  app.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "screen active";
  app.appendChild(wrap);

  if(ob.step === "welcome") return renderWelcome(wrap);
  if(ob.step === "foundation") return renderFoundation(wrap);
  if(ob.step === "practiceSetup") return renderPracticeSetup(wrap);
  if(ob.step === "assessment") return renderAssessmentStep(wrap);
  if(ob.step === "results") return renderResults(wrap);
}

function renderWelcome(wrap){
  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div><div class="badge">Step 1 of 4</div></div>
    <div class="eyebrow">Welcome</div>
    <h1 class="headline">UNDERSTAND THE PATTERN.<br><span class="accent">MEET THE NEED.</span></h1>
    <p class="body">This is not about finding something wrong with you. It's about understanding what your system tends to do under pressure, and learning how to give yourself what you need now.</p>
    <div class="card accent-left">
      <strong>Keep it simple</strong><br>
      <span style="color:#bbb;font-size:14px;">One useful practice. One honest reflection. One grounded action.</span>
    </div>
    <p class="disclaimer">Amend is a self-guided companion tool, not a replacement for therapy or crisis support. If you are in crisis, call Lifeline on 13 11 14 (Australia).</p>
    <div class="btn-row">
      <button class="btn btn-secondary" disabled style="opacity:.4;">Back</button>
      <button class="btn btn-primary" id="next">Continue</button>
    </div>
  `;
  wrap.querySelector("#next").onclick = ()=>{ ob.step="foundation"; renderOnboarding(); };
}

function renderFoundation(wrap){
  const u = state.user;
  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div><div class="badge">Step 2 of 4</div></div>
    <div class="eyebrow">Set your foundation</div>
    <h1 class="headline">MAKE IT YOURS</h1>
    <p class="sub">A couple of quick details so the app speaks like it knows you. Everything except your name is optional.</p>
    <label class="field-label">Preferred name</label>
    <input type="text" id="name" value="${escapeHtml(u.preferredName)}" placeholder="What should we call you?">
    <label class="field-label">Safety anchor <span class="opt">(optional \u2014 a word, feeling or place that helps you feel safe)</span></label>
    <input type="text" id="anchor" value="${escapeHtml(u.safeAnchor)}" placeholder="e.g. a word, a feeling, where you feel it in your body">
    <div class="btn-row">
      <button class="btn btn-secondary" id="back">Back</button>
      <button class="btn btn-primary" id="next">Continue</button>
    </div>
  `;
  wrap.querySelector("#back").onclick = ()=>{ ob.step="welcome"; renderOnboarding(); };
  wrap.querySelector("#next").onclick = ()=>{
    u.preferredName = wrap.querySelector("#name").value.trim() || "Friend";
    u.safeAnchor = wrap.querySelector("#anchor").value.trim();
    ob.step="practiceSetup"; renderOnboarding();
  };
}

const PRACTICE_TYPES = [
  {key:"Move", desc:"Walk, gym, stretch"},
  {key:"Breathe", desc:"Breathing regulation"},
  {key:"Meditate", desc:"Body scan, quiet sitting"},
  {key:"Ponder", desc:"Short written ponder, reading"},
  {key:"Journal", desc:"Journaling, voice-note reflection, gratitude"},
  {key:"Connect", desc:"Talk to someone, ask for support, set a boundary"},
  {key:"Rest", desc:"Rest and recovery"}
];

function renderPracticeSetup(wrap){
  const pp = state.practicePrefs;
  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div><div class="badge">Step 3 of 4</div></div>
    <div class="eyebrow">Practice setup</div>
    <h1 class="headline">HOW DO YOU LIKE TO PROCESS?</h1>
    <p class="sub">Drag isn't required \u2014 use the arrows to put the practice types you want to see first at the top.</p>
    <div id="reorderList"></div>
    <label class="field-label" style="margin-top:18px;">Preferred duration</label>
    <div class="pill-row" id="durRow"></div>
    <label class="field-label">Preferred intensity</label>
    <div class="pill-row" id="intRow"></div>
    <label class="field-label">Preferred time</label>
    <div class="pill-row" id="timeRow"></div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="back">Back</button>
      <button class="btn btn-primary" id="next">Start assessment</button>
    </div>
  `;
  function renderReorder(){
    const list = wrap.querySelector("#reorderList");
    list.innerHTML = pp.priorityOrder.map((key,i)=>{
      const t = PRACTICE_TYPES.find(t=>t.key===key);
      return `<div class="reorder-row">
        <div><strong>${key}</strong><div style="font-size:12px;color:var(--gray);">${t?t.desc:""}</div></div>
        <div class="reorder-arrows">
          <button class="arrow-btn" data-dir="up" data-i="${i}" ${i===0?"disabled style='opacity:.3'":""}>\u2191</button>
          <button class="arrow-btn" data-dir="down" data-i="${i}" ${i===pp.priorityOrder.length-1?"disabled style='opacity:.3'":""}>\u2193</button>
        </div>
      </div>`;
    }).join("");
    list.querySelectorAll(".arrow-btn").forEach(btn=>{
      btn.onclick = ()=>{
        const i = +btn.dataset.i, dir = btn.dataset.dir;
        const j = dir==="up" ? i-1 : i+1;
        if(j<0 || j>=pp.priorityOrder.length) return;
        [pp.priorityOrder[i], pp.priorityOrder[j]] = [pp.priorityOrder[j], pp.priorityOrder[i]];
        renderReorder();
      };
    });
  }
  // add remaining types not yet in priority order
  PRACTICE_TYPES.forEach(t=>{ if(!pp.priorityOrder.includes(t.key)) pp.priorityOrder.push(t.key); });
  renderReorder();

  function pillRow(elId, options, current, onSelect){
    const el = wrap.querySelector(elId);
    el.innerHTML = options.map(o=>`<div class="pill ${o===current?'selected':''}" data-val="${o}">${o}</div>`).join("");
    el.querySelectorAll(".pill").forEach(p=>{
      p.onclick = ()=>{ onSelect(p.dataset.val); pillRow(elId, options, p.dataset.val, onSelect); };
    });
  }
  pillRow("#durRow", ["2 min","5 min","10 min","20 min","30 min"], pp.preferredDuration, v=>pp.preferredDuration=v);
  pillRow("#intRow", ["Gentle","Moderate","Active"], pp.preferredIntensity, v=>pp.preferredIntensity=v);
  pillRow("#timeRow", ["Any","Morning","Afternoon","Evening"], pp.preferredTime, v=>pp.preferredTime=v);

  wrap.querySelector("#back").onclick = ()=>{ ob.step="foundation"; renderOnboarding(); };
  wrap.querySelector("#next").onclick = ()=>{ ob.step="assessment"; state.assessmentStep=0; renderOnboarding(); };
}

function renderAssessmentStep(wrap){
  const i = state.assessmentStep;
  const total = QUESTIONS.length;
  const q = QUESTIONS[i];
  const selected = state.assessmentAnswers[i];
  const letters = ["A","B","C","D","E"];
  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div><div class="badge">Private</div></div>
    <div class="step-label">Step ${i+1} of ${total} \u00b7 Autosaved</div>
    <div class="progress-bar"><div class="progress-fill" style="width:${((i+1)/total)*100}%;"></div></div>
    <div class="eyebrow" style="margin-top:16px;">Core-wound reflection</div>
    <h1 class="headline" style="font-size:24px;">${q.q}</h1>
    <p class="sub">Choose what feels most familiar under pressure. There is no pass, fail, good or bad answer.</p>
    <div id="opts"></div>
    <div class="btn-row">
      <button class="btn btn-secondary" id="back">Back</button>
      <button class="btn btn-primary" id="next" ${selected===undefined?"disabled style='opacity:.4'":""}>${i===total-1?"See my themes":"Continue"}</button>
    </div>
    <a class="pause-link" id="pause">Pause and return later</a>
  `;
  const optsEl = wrap.querySelector("#opts");
  optsEl.innerHTML = q.opts.map((o,idx)=>{
    const letter = letters[idx];
    return `<div class="option-card ${selected===letter?'selected':''}" data-letter="${letter}">
      <div class="option-letter">${letter}</div><div class="option-text">${o}</div>
    </div>`;
  }).join("");
  optsEl.querySelectorAll(".option-card").forEach(card=>{
    card.onclick = ()=>{
      state.assessmentAnswers[i] = card.dataset.letter;
      renderAssessmentStep(wrap);
    };
  });
  wrap.querySelector("#back").onclick = ()=>{
    if(i===0){ ob.step="practiceSetup"; renderOnboarding(); }
    else { state.assessmentStep--; renderOnboarding(); }
  };
  const nextBtn = wrap.querySelector("#next");
  if(selected!==undefined){
    nextBtn.onclick = ()=>{
      if(i===total-1){
        state.themes = scoreThemes(state.assessmentAnswers);
        ob.step="results";
      } else {
        state.assessmentStep++;
      }
      renderOnboarding();
    };
  }
  wrap.querySelector("#pause").onclick = ()=>{ saveState(); alert("Saved. You can pick this back up anytime \u2014 just reopen Amend."); };
}

function renderResults(wrap){
  const th = state.themes;
  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div><div class="badge">Prototype result</div></div>
    <div class="eyebrow">Your current core-wound themes</div>
    <h1 class="headline">AWARENESS IS<br><span class="accent">THE BEGINNING.</span></h1>
    <p class="sub">These are not permanent labels. They are the themes most strongly reflected in your answers today.</p>
    <div class="card accent-left theme-card">
      <div class="theme-num">01</div>
      <div class="eyebrow">Primary theme</div>
      <h2 style="margin:0 0 8px;font-size:22px;">${th.primary.name}</h2>
      <p style="color:#ccc;font-size:14px;line-height:1.5;margin-bottom:0;">${th.primary.desc}</p>
      <div class="chip-row">${th.primary.traits.map(t=>`<div class="chip">${t}</div>`).join("")}</div>
    </div>
    <div class="card accent-left blue theme-card">
      <div class="theme-num">02</div>
      <div class="eyebrow" style="color:var(--blue);">Supporting theme</div>
      <h2 style="margin:0 0 8px;font-size:22px;">${th.supporting.name}</h2>
      <p style="color:#ccc;font-size:14px;line-height:1.5;margin-bottom:0;">${th.supporting.desc}</p>
      <div class="chip-row">${th.supporting.traits.map(t=>`<div class="chip">${t}</div>`).join("")}</div>
    </div>
    <button class="btn-text" id="howFormed" style="margin-bottom:10px;">\u25b6 How this result was formed</button>
    <button class="btn btn-primary" id="enter" style="margin-top:8px;">Enter my daily practice</button>
  `;
  wrap.querySelector("#howFormed").onclick = ()=>{
    alert("Each answer you chose belongs to one of five common protective patterns. The pattern that showed up most often becomes your primary theme; the next most common becomes your supporting theme. These can shift over time \u2014 you can retake this anytime from your Profile.");
  };
  wrap.querySelector("#enter").onclick = ()=>{
    state.onboardingComplete = true;
    render();
    if(!state.seenIntroVideo) showIntroVideo();
  };
}

function showIntroVideo(){
  openModal(`
    <div class="modal-handle"></div>
    <h2 style="margin-top:0;">Welcome to Amend</h2>
    <div style="background:#000;border:1px solid var(--card-border);border-radius:12px;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
      <div style="text-align:center;color:var(--gray);">
        <div style="font-size:40px;margin-bottom:8px;">\u25b6</div>
        <div style="font-size:13px;">Intro video placeholder<br>(2-3 min \u2014 safety anchor, core wounds, how Amend works)</div>
      </div>
    </div>
    <p class="body" style="font-size:14px;">A quick explainer on what a safety anchor is, how core wounds show up day to day, and how to get the most from Amend. This is a self-guided companion tool, not a replacement for therapy.</p>
    <button class="btn btn-primary" id="closeVid">Got it</button>
  `);
  document.getElementById("closeVid").onclick = ()=>{ state.seenIntroVideo=true; saveState(); closeModal(); };
}

// ===== MAIN APP =====
function renderMainApp(){
  app.innerHTML = "";
  const screen = document.createElement("div");
  screen.className = "screen active";
  app.appendChild(screen);

  if(state.currentTab==="today") renderToday(screen);
  else if(state.currentTab==="practice") renderPractice(screen);
  else if(state.currentTab==="journal") renderJournal(screen);
  else if(state.currentTab==="progress") renderProgress(screen);
  else if(state.currentTab==="profile") renderProfile(screen);

  renderTabBar();
  renderSafetyChip();
}

function renderTabBar(){
  let bar = document.getElementById("tabbar");
  if(!bar){ bar = document.createElement("div"); bar.id="tabbar"; bar.className="tabbar"; document.getElementById("app").appendChild(bar); }
  const tabs = [
    {key:"today", label:"Today", icon:ICONS.today},
    {key:"practice", label:"Practice", icon:ICONS.practice},
    {key:"journal", label:"Journal", icon:ICONS.journal},
    {key:"progress", label:"Progress", icon:ICONS.progress},
    {key:"profile", label:"Profile", icon:ICONS.profile}
  ];
  bar.innerHTML = tabs.map(t=>`
    <button class="tab-item ${state.currentTab===t.key?'active':''}" data-tab="${t.key}">
      ${t.icon}<span>${t.label}</span>
    </button>
  `).join("");
  bar.querySelectorAll(".tab-item").forEach(b=>{
    b.onclick = ()=>{ state.currentTab = b.dataset.tab; renderMainApp(); };
  });
}

function renderSafetyChip(){
  let chip = document.getElementById("safetyChip");
  if(chip) chip.remove();
  if(state.currentTab==="profile") return;
  chip = document.createElement("div");
  chip.id = "safetyChip"; chip.className = "safety-chip";
  chip.innerHTML = `\u26a1 Safety anchor`;
  chip.onclick = openSafetyAnchor;
  document.getElementById("app").appendChild(chip);
}

function openSafetyAnchor(){
  state.progress.safetyAnchorUses++;
  markActivityToday(1);
  const anchor = state.user.safeAnchor || "your breath";
  openModal(`
    <div class="modal-handle"></div>
    <div class="eyebrow">Safety anchor</div>
    <h2 style="margin:0 0 14px;">${escapeHtml(anchor)}</h2>
    <p class="body">Ground first. Then choose the next safe action.</p>
    <ul class="steps-list">
      <li>Feel your feet on the floor, or your hand on something solid.</li>
      <li>Take one slower breath out than in.</li>
      <li>Bring "${escapeHtml(anchor)}" to mind. Let it be true right now.</li>
    </ul>
    <button class="btn btn-primary" id="closeAnchor">I'm grounded</button>
  `);
  document.getElementById("closeAnchor").onclick = closeModal;
}

// ----- TODAY -----
function renderToday(wrap){
  const themes = state.themes || { primary:{key:"C",name:"Shame"} };
  const themeKey = themes.primary.key;
  const practiceKey = state.today.swappedPracticeKey || themeKey;
  const practice = PRACTICES_BY_THEME[practiceKey] || PRACTICES_BY_THEME["C"];
  const reframe = REFRAMES_BY_THEME[themeKey] || REFRAMES_BY_THEME["C"];
  const prompt = DAILY_PROMPTS[state.today.promptIndex % DAILY_PROMPTS.length];

  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div><div class="badge link" id="anchorLink">Safety anchor</div></div>
    <div class="eyebrow">Today \u00b7 ${state.user.preferredName || "Friend"}</div>
    <h2 style="margin:0 0 14px;font-size:18px;">How are you feeling today?</h2>
    <div class="mood-scale" id="moodScale">
      ${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button class="mood-btn ${state.today.mood===n?'selected':''}" data-n="${n}">${n}</button>`).join("")}
    </div>
    <div class="mood-labels"><span>Struggling</span><span>Great</span></div>

    <div class="card" id="reframeCard">
      <strong style="font-size:15px;">${reframe}</strong>
      <div style="margin-top:8px;">
        <button class="btn-text" id="whyHelps" style="padding:0;">\u25b6 Why this may help</button>
        <div id="whyHelpsBody" style="display:none;font-size:13px;color:#bbb;margin-top:8px;line-height:1.5;">
          Naming the real risk (and the one that isn't) helps your nervous system tell the difference between discomfort and danger \u2014 so you can stay present instead of bracing.
        </div>
      </div>
    </div>

    <div class="card">
      <div class="duration-tag">${practice.duration}</div>
      <h3 style="margin:0 0 6px;font-size:17px;">${practice.title}</h3>
      <p style="color:#bbb;font-size:13.5px;margin:0 0 4px;">${practice.rationale}</p>
      <ul class="steps-list">${practice.steps.map(s=>`<li>${s}</li>`).join("")}</ul>
      ${state.today.practiceDone
        ? `<div style="color:var(--green);font-weight:700;font-size:14px;text-align:center;padding:8px 0;">\u2713 Completed today</div>`
        : `<button class="btn btn-primary" id="completePractice">Complete practice</button>
           <button class="btn-text" id="swapPractice" style="display:block;margin:10px auto 0;">Choose something else</button>`
      }
    </div>

    <div class="card" id="promptCard">
      <div class="eyebrow">${prompt.label}</div>
      <p style="font-size:14px;color:#ddd;margin:0 0 10px;">${prompt.prompt}</p>
      <button class="btn-text" id="openPrompt" style="padding:0;">+ Add entry</button>
    </div>
  `;

  wrap.querySelector("#anchorLink").onclick = openSafetyAnchor;
  wrap.querySelectorAll(".mood-btn").forEach(b=>{
    b.onclick = ()=>{ state.today.mood = +b.dataset.n; markActivityToday(1); renderToday(wrap); };
  });
  wrap.querySelector("#whyHelps").onclick = ()=>{
    const el = wrap.querySelector("#whyHelpsBody");
    el.style.display = el.style.display==="none" ? "block" : "none";
  };
  if(!state.today.practiceDone){
    wrap.querySelector("#completePractice").onclick = ()=>{
      state.today.practiceDone = true;
      state.progress.practicesCompleted++;
      state.coins += 5;
      markActivityToday(2);
      renderToday(wrap);
      toast("Practice complete \u2014 +5 coins");
    };
    wrap.querySelector("#swapPractice").onclick = ()=>{
      const keys = Object.keys(PRACTICES_BY_THEME).filter(k=>k!==practiceKey);
      state.today.swappedPracticeKey = keys[Math.floor(Math.random()*keys.length)];
      saveState();
      renderToday(wrap);
    };
  }
  wrap.querySelector("#openPrompt").onclick = ()=>openJournalEntryModal(prompt.type, prompt.label);
}

function toast(msg){
  let t = document.getElementById("toastEl");
  if(t) t.remove();
  t = document.createElement("div");
  t.id = "toastEl";
  t.style = "position:fixed;bottom:160px;left:50%;transform:translateX(-50%);background:#1a1a1a;border:1px solid var(--card-border);color:#fff;padding:10px 18px;border-radius:30px;font-size:13px;z-index:200;";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 2200);
}

// ----- PRACTICE -----
function renderPractice(wrap){
  const groups = {};
  PRACTICE_LIBRARY.forEach(p=>{ (groups[p.type] = groups[p.type]||[]).push(p); });
  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div><div class="badge link">Safety anchor</div></div>
    <div class="eyebrow">Practice library</div>
    <h1 class="headline" style="font-size:24px;">CHOOSE WHAT FITS RIGHT NOW</h1>
    ${Object.entries(groups).map(([type, items])=>`
      <div class="eyebrow" style="margin-top:18px;">${type}</div>
      ${items.map(p=>`
        <div class="row-link">
          <div>
            <div class="rl-title">${p.title}</div>
            <div class="rl-sub">${p.desc}</div>
            <div class="rl-sub">${p.duration} \u00b7 ${p.intensity}</div>
          </div>
          <div class="rl-action" data-open="${p.title}">Open</div>
        </div>
      `).join("")}
    `).join("")}
  `;
  wrap.querySelectorAll("[data-open]").forEach(el=>{
    el.onclick = ()=>{
      const p = PRACTICE_LIBRARY.find(x=>x.title===el.dataset.open);
      openModal(`
        <div class="modal-handle"></div>
        <div class="duration-tag">${p.duration} \u00b7 ${p.intensity}</div>
        <h2 style="margin:8px 0;">${p.title}</h2>
        <p class="body">${p.desc}</p>
        <button class="btn btn-primary" id="donePractice">Mark complete</button>
      `);
      document.getElementById("donePractice").onclick = ()=>{
        state.progress.practicesCompleted++; state.coins += 5; markActivityToday(2);
        closeModal(); toast("Practice complete \u2014 +5 coins");
      };
    };
  });
  wrap.querySelector(".badge.link").onclick = openSafetyAnchor;
}

// ----- JOURNAL -----
let journalFilter = "All";
function renderJournal(wrap){
  const prompt = DAILY_PROMPTS[state.today.promptIndex % DAILY_PROMPTS.length];
  const filters = ["All","Wins","Sticking points","Patterns","Check-ins","Reflections"];
  const typeMap = {Wins:"win","Sticking points":"stickingPoint",Patterns:"pattern","Check-ins":"checkIn",Reflections:"reflection"};
  let entries = state.journalEntries.slice().reverse();
  if(journalFilter!=="All") entries = entries.filter(e=>e.type===typeMap[journalFilter]);

  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div><div class="badge link">Safety anchor</div></div>
    <div class="eyebrow">Private journal</div>
    <h1 class="headline" style="font-size:24px;">NOTICE MORE.<br><span class="accent">FORCE LESS.</span></h1>
    <p class="sub">Write only what helps you understand the wound, the need and the chosen choice.</p>
    <div class="card">
      <div class="eyebrow">${prompt.label} prompt</div>
      <p style="font-size:14px;color:#ddd;margin:0 0 10px;">${prompt.prompt}</p>
      <button class="btn btn-secondary" id="answerPrompt">Respond to this</button>
    </div>
    <button class="btn-text" id="freeReflect" style="margin-bottom:14px;">+ Free reflection</button>
    <input type="text" id="search" placeholder="Search your entries">
    <div class="filter-chips">${filters.map(f=>`<div class="chip ${f===journalFilter?'active':''}" data-f="${f}">${f}</div>`).join("")}</div>
    <div id="entriesList">
      ${entries.length === 0 ? `
        <div class="empty-state">
          <div class="icon">\u270e</div>
          <p>No entries yet. Start with one honest sentence.<br>You do not need to complete every prompt.</p>
        </div>` : entries.map(e=>`
        <div class="entry-item">
          <div class="entry-meta"><span class="entry-tag">${e.type}</span><span>${new Date(e.timestamp).toLocaleDateString()}</span></div>
          <div style="font-size:14px;color:#eee;">${escapeHtml(e.text)}</div>
        </div>
      `).join("")}
    </div>
  `;
  wrap.querySelector(".badge.link").onclick = openSafetyAnchor;
  wrap.querySelector("#answerPrompt").onclick = ()=>openJournalEntryModal(prompt.type, prompt.label);
  wrap.querySelector("#freeReflect").onclick = ()=>openJournalEntryModal("reflection","Free reflection");
  wrap.querySelectorAll(".filter-chips .chip").forEach(c=>{
    c.onclick = ()=>{ journalFilter = c.dataset.f; renderJournal(wrap); };
  });
  wrap.querySelector("#search").oninput = (e)=>{
    const q = e.target.value.toLowerCase();
    const filtered = entries.filter(en=>en.text.toLowerCase().includes(q));
    wrap.querySelector("#entriesList").innerHTML = filtered.length===0 ? `<div class="empty-state"><p>No matching entries.</p></div>` :
      filtered.map(en=>`<div class="entry-item"><div class="entry-meta"><span class="entry-tag">${en.type}</span><span>${new Date(en.timestamp).toLocaleDateString()}</span></div><div style="font-size:14px;color:#eee;">${escapeHtml(en.text)}</div></div>`).join("");
  };
}

function openJournalEntryModal(type, label){
  openModal(`
    <div class="modal-handle"></div>
    <div class="eyebrow">${label}</div>
    <textarea id="entryText" placeholder="Write only what helps you understand it. One honest sentence is enough."></textarea>
    <button class="btn btn-primary" id="saveEntry">Save entry</button>
  `);
  document.getElementById("saveEntry").onclick = ()=>{
    const text = document.getElementById("entryText").value.trim();
    if(!text) return closeModal();
    state.journalEntries.push({ id:Date.now(), type, text, timestamp:Date.now() });
    if(type==="win") state.progress.winsRecorded++;
    state.coins += 3;
    markActivityToday(1);
    closeModal();
    toast("Entry saved \u2014 +3 coins");
    renderMainApp();
  };
}

// ----- PROGRESS -----
function renderProgress(wrap){
  const days = state.progress.last7Days;
  const dayLabels = ["6d","5d","4d","3d","2d","1d","Today"];
  const maxBar = 3;
  const typeCounts = {};
  state.journalEntries.forEach(e=>{ typeCounts[e.type] = (typeCounts[e.type]||0)+1; });
  const topType = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0];

  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div><div class="badge link">Safety anchor</div></div>
    <div class="eyebrow">Progress</div>
    <h1 class="headline" style="font-size:24px;">BUILD CAPACITY.<br><span class="accent">NOT PRESSURE.</span></h1>
    <p class="sub">Progress is noticing sooner, meeting the need and choosing differently. A streak is only one small measure.</p>
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-num">${state.progress.daysActive}</div><div class="stat-label">Days active</div></div>
      <div class="stat-box"><div class="stat-num">${state.progress.practicesCompleted}</div><div class="stat-label">Practices completed</div></div>
      <div class="stat-box"><div class="stat-num">${state.progress.winsRecorded}</div><div class="stat-label">Wins recorded</div></div>
      <div class="stat-box"><div class="stat-num">${state.progress.safetyAnchorUses}</div><div class="stat-label">Safety anchor uses</div></div>
    </div>
    <div class="eyebrow">Last seven days</div>
    <h3 style="margin:4px 0 10px;">Showing up</h3>
    <div class="bar-chart">
      ${days.map((d,i)=>`<div style="display:flex;flex-direction:column;flex:1;"><div class="bar" style="height:60px;"><div class="fill" style="height:${(d/maxBar)*100}%;"></div></div><div class="bar-day">${dayLabels[i]}</div></div>`).join("")}
    </div>
    <div class="card" style="margin-top:18px;">
      <div class="eyebrow">What is working</div>
      ${topType ? `<p style="font-size:14px;color:#ddd;margin:6px 0 0;">You've leaned on <strong>${topType[0]}</strong> entries most \u2014 that's worth noticing. Keep going.</p>`
                 : `<p style="font-size:14px;color:#999;margin:6px 0 0;">Complete a few practices and journal entries to see what's working for you.</p>`}
    </div>
  `;
  wrap.querySelector(".badge.link").onclick = openSafetyAnchor;
}

// ----- PROFILE -----
function renderProfile(wrap){
  const themes = state.themes;
  wrap.innerHTML = `
    <div class="header"><div class="wordmark">Amend<span class="dot">.</span></div></div>
    <div class="eyebrow">Profile</div>
    <h1 class="headline" style="font-size:24px;">${escapeHtml(state.user.preferredName || "Friend")}</h1>

    <div class="card">
      <div class="eyebrow">Current themes</div>
      <h3 style="margin:4px 0 10px;">${themes ? `${themes.primary.name} + ${themes.supporting.name}` : "Not yet completed"}</h3>
      <div class="btn-row" style="margin-top:0;">
        <button class="btn btn-secondary" id="viewResults">View results</button>
        <button class="btn btn-secondary" id="retake">Retake assessment</button>
      </div>
    </div>

    <div class="eyebrow" style="margin-top:6px;">Rewards</div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span style="font-size:14px;color:#ccc;">Coin balance</span><span class="coin">${state.coins} coins</span>
      </div>
      ${REWARD_CATALOGUE.map(r=>`
        <div class="row-link">
          <div><div class="rl-title">${r.name}</div><div class="rl-sub">${r.cost} coins</div></div>
          <div class="rl-action" data-redeem="${r.name}" data-cost="${r.cost}">Redeem</div>
        </div>
      `).join("")}
    </div>

    <div class="eyebrow" style="margin-top:6px;">Notices</div>
    ${NOTICES.map(n=>`
      <div class="notice-card">
        <div class="notice-date">${n.date}</div>
        <div class="notice-title">${n.title}</div>
        <div class="notice-body">${n.body}</div>
      </div>
    `).join("")}

    <div class="eyebrow" style="margin-top:6px;">Personalisation</div>
    <div class="card">
      <div class="row-link"><div><div class="rl-title">Practice preferences</div><div class="rl-sub">${state.practicePrefs.priorityOrder.join(" \u00b7 ")}</div></div><div class="rl-action" id="editPrefs">Edit</div></div>
      <div class="row-link"><div><div class="rl-title">Safety anchor</div><div class="rl-sub">${escapeHtml(state.user.safeAnchor) || "Not set"}</div></div><div class="rl-action" id="editAnchor">Edit</div></div>
      <div class="row-link"><div><div class="rl-title">Show wound labels</div><div class="rl-sub">Keep Today focused on needs by default</div></div><div class="toggle ${state.settings.showWoundLabels?'on':''}" id="toggleWound"><div class="knob"></div></div></div>
      <div class="row-link"><div><div class="rl-title">Reminder time</div><div class="rl-sub">Daily nudge to check in</div></div><input type="text" id="reminderTime" value="${state.settings.reminderTime}" style="width:80px;margin:0;padding:6px 8px;text-align:center;"></div>
    </div>

    <div class="eyebrow" style="margin-top:6px;">Support</div>
    <div class="card">
      <div class="row-link"><div><div class="rl-title">Book a session</div><div class="rl-sub">Talk to a counsellor or join a program</div></div><div class="rl-action" id="bookSession">Open</div></div>
      <div class="row-link"><div><div class="rl-title">Watch intro video again</div><div class="rl-sub">How Amend works</div></div><div class="rl-action" id="rewatchVid">Open</div></div>
    </div>

    <div class="eyebrow" style="margin-top:6px;">Accessibility</div>
    <div class="card">
      <div class="row-link"><div><div class="rl-title">Text size</div><div class="rl-sub">${state.settings.textSize}%</div></div>
        <div style="display:flex;gap:6px;"><button class="arrow-btn" id="textDown">\u2212</button><button class="arrow-btn" id="textUp">+</button></div></div>
      <div class="row-link"><div><div class="rl-title">Reduced motion</div><div class="rl-sub">Reduce transitions and scrolling animation</div></div><div class="toggle ${state.settings.reducedMotion?'on':''}" id="toggleMotion"><div class="knob"></div></div></div>
    </div>

    <div class="eyebrow" style="margin-top:6px;">App and privacy</div>
    <div class="card">
      <div class="row-link"><div><div class="rl-title">Install app</div><div class="rl-sub">Add Amend to your home screen</div></div><div class="rl-action" id="installInstr">Instructions</div></div>
      <div class="row-link"><div><div class="rl-title">Export data</div><div class="rl-sub">Download a private JSON backup</div></div><div class="rl-action" id="exportData">Export</div></div>
      <div class="row-link"><div><div class="rl-title">Import data</div><div class="rl-sub">Restore a validated Amend export</div></div><div class="rl-action" id="importData">Import</div></div>
      <div class="row-link"><div><div class="rl-title">Privacy information</div><div class="rl-sub">What is and is not stored</div></div><div class="rl-action" id="privacyInfo">Open</div></div>
      <div class="row-link"><div><div class="rl-title">Need additional help?</div><div class="rl-sub">Safety, professional and crisis support</div></div><div class="rl-action" id="needHelp">Open</div></div>
      <div class="row-link"><div><div class="rl-title">Delete all my data</div><div class="rl-sub">Permanently reset this device</div></div><button class="btn btn-danger" id="deleteAll" style="width:auto;padding:8px 14px;font-size:13px;">Delete</button></div>
    </div>
    <p class="disclaimer">Amend is a self-guided companion tool and does not replace professional mental health care. App 1.0.0-prototype \u00b7 Content 2026-06-wounds-needs-v1</p>
  `;

  wrap.querySelector("#viewResults").onclick = ()=>{ ob.step="results"; state.onboardingComplete=false; renderOnboarding();
    // patch: results screen "enter" button should just flip back, override:
    setTimeout(()=>{
      const enterBtn = document.getElementById("enter");
      if(enterBtn) enterBtn.textContent = "Back to today", enterBtn.onclick = ()=>{ state.onboardingComplete=true; render(); };
    },0);
  };
  wrap.querySelector("#retake").onclick = ()=>{
    if(confirm("Retake the core-wound assessment? Your previous result will be replaced.")){
      state.assessmentAnswers = {}; state.assessmentStep = 0; state.onboardingComplete=false; ob.step="assessment"; renderOnboarding();
    }
  };
  wrap.querySelectorAll("[data-redeem]").forEach(el=>{
    el.onclick = ()=>{
      const cost = +el.dataset.cost;
      if(state.coins < cost){ toast("Not enough coins yet"); return; }
      state.coins -= cost; saveState();
      toast(`Redeemed: ${el.dataset.redeem}`);
      renderProfile(wrap);
    };
  });
  wrap.querySelector("#toggleWound").onclick = ()=>{ state.settings.showWoundLabels = !state.settings.showWoundLabels; renderProfile(wrap); };
  wrap.querySelector("#toggleMotion").onclick = ()=>{ state.settings.reducedMotion = !state.settings.reducedMotion; document.body.style.setProperty('--motion', state.settings.reducedMotion?'none':''); renderProfile(wrap); };
  wrap.querySelector("#reminderTime").onchange = (e)=>{ state.settings.reminderTime = e.target.value; saveState(); };
  wrap.querySelector("#textUp").onclick = ()=>{ state.settings.textSize = Math.min(150, state.settings.textSize+10); applyTextSize(); renderProfile(wrap); };
  wrap.querySelector("#textDown").onclick = ()=>{ state.settings.textSize = Math.max(80, state.settings.textSize-10); applyTextSize(); renderProfile(wrap); };
  wrap.querySelector("#editPrefs").onclick = ()=>{ state.onboardingComplete=false; ob.step="practiceSetup"; renderOnboarding(); };
  wrap.querySelector("#editAnchor").onclick = ()=>{
    openModal(`<div class="modal-handle"></div><div class="eyebrow">Safety anchor</div>
      <input type="text" id="anchorEdit" value="${escapeHtml(state.user.safeAnchor)}" placeholder="A word, feeling or place that helps you feel safe">
      <button class="btn btn-primary" id="saveAnchor">Save</button>`);
    document.getElementById("saveAnchor").onclick = ()=>{ state.user.safeAnchor = document.getElementById("anchorEdit").value.trim(); closeModal(); renderProfile(wrap); };
  };
  wrap.querySelector("#bookSession").onclick = ()=>{ window.open("https://amendmovement.com", "_blank"); };
  wrap.querySelector("#rewatchVid").onclick = showIntroVideo;
  wrap.querySelector("#installInstr").onclick = ()=>{
    openModal(`<div class="modal-handle"></div><div class="eyebrow">Install app</div>
      <p class="body">On iPhone: tap the Share icon in Safari, then "Add to Home Screen".<br><br>On Android: tap the menu (\u22ee) in Chrome, then "Add to Home screen" or "Install app".</p>
      <button class="btn btn-primary" id="closeInstall">Got it</button>`);
    document.getElementById("closeInstall").onclick = closeModal;
  };
  wrap.querySelector("#exportData").onclick = ()=>{
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "amend-backup.json"; a.click();
  };
  wrap.querySelector("#importData").onclick = ()=>{
    const input = document.createElement("input"); input.type="file"; input.accept="application/json";
    input.onchange = (e)=>{
      const file = e.target.files[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        try{ const imported = JSON.parse(reader.result); state = imported; ob = { step: state.onboardingComplete ? "welcome" : "welcome" }; saveState(); render(); toast("Data restored"); }
        catch(err){ alert("That file couldn't be read as a valid Amend export."); }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  wrap.querySelector("#privacyInfo").onclick = ()=>{
    openModal(`<div class="modal-handle"></div><div class="eyebrow">Privacy information</div>
      <p class="body">Everything you write \u2014 journal entries, assessment answers, your safety anchor \u2014 is stored only on this device, in your browser's local storage. Nothing is sent to a server unless you choose to export and share it yourself. Deleting your data or uninstalling the app removes it permanently.</p>
      <button class="btn btn-primary" id="closePriv">Close</button>`);
    document.getElementById("closePriv").onclick = closeModal;
  };
  wrap.querySelector("#needHelp").onclick = ()=>{
    openModal(`<div class="modal-handle"></div><div class="eyebrow">Need additional help?</div>
      <p class="body"><strong>Lifeline</strong> \u2014 24/7 crisis support: 13 11 14<br><br>
      <strong>Suicide Call Back Service</strong> \u2014 1300 659 467<br><br>
      <strong>Book a session with Amend Movement</strong> for ongoing professional support.</p>
      <button class="btn btn-primary" id="closeHelp">Close</button>`);
    document.getElementById("closeHelp").onclick = closeModal;
  };
  wrap.querySelector("#deleteAll").onclick = ()=>{
    if(confirm("This permanently deletes everything stored on this device. This cannot be undone. Continue?")){
      localStorage.removeItem(STORAGE_KEY);
      state = loadState();
      ob = { step:"welcome" };
      render();
    }
  };
}

function applyTextSize(){
  document.documentElement.style.fontSize = (state.settings.textSize) + "%";
}

// ===== MODAL =====
function openModal(html){
  const overlay = document.getElementById("modalOverlay");
  const sheet = document.getElementById("modalSheet");
  sheet.innerHTML = `<button class="modal-close" id="modalCloseBtn">\u2715</button>` + html;
  overlay.classList.add("active");
  document.getElementById("modalCloseBtn").onclick = closeModal;
}
function closeModal(){
  document.getElementById("modalOverlay").classList.remove("active");
}
document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("modalOverlay").addEventListener("click", (e)=>{
    if(e.target.id==="modalOverlay") closeModal();
  });
  applyTextSize();
  render();
});
