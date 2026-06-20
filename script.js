/* =========================================================
   LearnFlow — Application Logic (Vanilla JS)
   No frameworks. State lives in `state`, persisted to
   localStorage, re-rendered on every change via render().
========================================================= */

/* ---------------------------------------------------------
   CONSTANTS
--------------------------------------------------------- */
const LS_KEY = "learnflow_v1";
const LS_THEME = "learnflow_theme";

const QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "Small steps every day lead to extraordinary results.",
  "Your future is created by what you do today, not tomorrow.",
  "Focus on progress, not perfection.",
  "The expert in anything was once a beginner who refused to give up.",
  "Study while others sleep; succeed while others dream.",
  "Consistency beats intensity. Show up every day.",
  "Hard work quietly compounds into results no one can ignore.",
];

const PRIORITY_META = {
  High:   { color:"#DC2626", bg:"rgba(220,38,38,0.10)" },
  Medium: { color:"#D97706", bg:"rgba(217,119,6,0.12)" },
  Low:    { color:"#0F766E", bg:"rgba(15,118,110,0.10)" },
};
const DIFFICULTY_META = {
  Easy:   { color:"#0F766E", bg:"rgba(15,118,110,0.10)" },
  Medium: { color:"#D97706", bg:"rgba(217,119,6,0.12)" },
  Hard:   { color:"#DC2626", bg:"rgba(220,38,38,0.10)" },
};
const SUBJECT_COLORS = ["#0F766E","#38BDF8","#10B981","#6366F1","#D97706","#EC4899","#0EA5E9","#84CC16"];

/* ---------------------------------------------------------
   UTILITIES
--------------------------------------------------------- */
function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function addDays(dateStr, n){ const d = new Date(dateStr+"T00:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
function daysBetween(a,b){ const A=new Date(a+"T00:00:00"), B=new Date(b+"T00:00:00"); return Math.round((B-A)/86400000); }
function fmtDateLong(d){ return new Date(d+"T00:00:00").toLocaleDateString(undefined,{weekday:'long', year:'numeric', month:'long', day:'numeric'}); }
function fmtDateShort(d){ return new Date(d+"T00:00:00").toLocaleDateString(undefined,{month:'short', day:'numeric'}); }
function fmtTime12(t){
  if(!t) return '';
  const [h,m] = t.split(':').map(Number);
  const ampm = h>=12 ? 'PM' : 'AM';
  const hh = ((h+11)%12)+1;
  return `${hh}:${String(m).padStart(2,'0')} ${ampm}`;
}
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
function escapeHtml(str){
  if(str==null) return '';
  return String(str).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------------------------------------------------------
   SEED DATA
--------------------------------------------------------- */
function seedData(){
  const subjects = [
    { id: uid(), name:"Calculus II", teacher:"Dr. Aisha Khan", difficulty:"Hard", totalTopics:18, completedTopics:11, color: SUBJECT_COLORS[0] },
    { id: uid(), name:"Organic Chemistry", teacher:"Prof. Imran Siddiqui", difficulty:"Hard", totalTopics:22, completedTopics:9, color: SUBJECT_COLORS[1] },
    { id: uid(), name:"World Literature", teacher:"Ms. Hina Raza", difficulty:"Easy", totalTopics:14, completedTopics:12, color: SUBJECT_COLORS[2] },
    { id: uid(), name:"Computer Science", teacher:"Mr. Bilal Ahmed", difficulty:"Medium", totalTopics:20, completedTopics:14, color: SUBJECT_COLORS[3] },
  ];
  const sessions = [
    { id: uid(), subjectId: subjects[0].id, topic:"Integration by Parts", priority:"High", duration:"1h 30m", start:"08:00", end:"09:30", deadline: addDays(todayISO(),2), notes:"Focus on definite integrals, past paper Q4-Q9.", done:false, date: todayISO() },
    { id: uid(), subjectId: subjects[1].id, topic:"Reaction Mechanisms — SN1 vs SN2", priority:"Medium", duration:"1h", start:"10:00", end:"11:00", deadline: addDays(todayISO(),5), notes:"Review carbocation stability rules.", done:false, date: todayISO() },
    { id: uid(), subjectId: subjects[3].id, topic:"Binary Search Trees", priority:"Medium", duration:"45m", start:"14:00", end:"14:45", deadline: addDays(todayISO(),1), notes:"Implement deletion case with two children.", done:true, date: addDays(todayISO(),-1) },
    { id: uid(), subjectId: subjects[2].id, topic:"Modernist Poetry — Eliot", priority:"Low", duration:"1h", start:"16:30", end:"17:30", deadline: addDays(todayISO(),7), notes:"Annotate 'The Waste Land' sections I & II.", done:false, date: addDays(todayISO(),1) },
  ];
  const exams = [
    { id: uid(), name:"Calculus II Midterm", subjectId: subjects[0].id, date: addDays(todayISO(),12) },
    { id: uid(), name:"Organic Chemistry Final", subjectId: subjects[1].id, date: addDays(todayISO(),26) },
    { id: uid(), name:"CS Algorithms Quiz", subjectId: subjects[3].id, date: addDays(todayISO(),4) },
  ];
  const goals = [
    { id: uid(), text:"Study 15 hours this week", target:15, current:8.5, unit:"hours", done:false },
    { id: uid(), text:"Complete 3 chemistry chapters", target:3, current:1, unit:"chapters", done:false },
    { id: uid(), text:"Solve 20 calculus exercises", target:20, current:20, unit:"exercises", done:true },
    { id: uid(), text:"Read 2 literature essays", target:2, current:0, unit:"essays", done:false },
  ];
  const notes = [
    { id: uid(), title:"Integration Cheat Sheet", content:"∫u dv = uv − ∫v du. Always pick u using LIATE rule: Log, Inverse trig, Algebraic, Trig, Exponential.", pinned:true, subjectId: subjects[0].id, date: todayISO() },
    { id: uid(), title:"SN1 vs SN2 quick rules", content:"SN1: tertiary carbon, polar protic solvent, racemization. SN2: primary carbon, polar aprotic, backside attack, inversion.", pinned:true, subjectId: subjects[1].id, date: addDays(todayISO(),-1) },
    { id: uid(), title:"Essay structure reminder", content:"Thesis in intro, 3 body paragraphs each with topic sentence + evidence + analysis, conclusion restates significance.", pinned:false, subjectId: subjects[2].id, date: addDays(todayISO(),-3) },
  ];
  const studyLog = {};
  for(let i=13;i>=0;i--){
    const d = addDays(todayISO(), -i);
    studyLog[d] = +(Math.random()*3 + 1).toFixed(1);
  }
  return { subjects, sessions, exams, goals, notes, studyLog, streak:6, displayName:"Asma", totalHours:142.5 };
}

function loadData(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  const seeded = seedData();
  localStorage.setItem(LS_KEY, JSON.stringify(seeded));
  return seeded;
}
function saveData(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(state.data)); }catch(e){} }

/* ---------------------------------------------------------
   GLOBAL STATE
--------------------------------------------------------- */
const state = {
  data: loadData(),
  route: "dashboard",
  dark: localStorage.getItem(LS_THEME) === "dark",
  sidebarOpen: false,
  modal: null,          // { type, mode, payload }
  confirm: null,        // { title, message, onConfirm }
  filters: {
    planner: { search:"", priority:"All", subject:"All", sort:"latest" },
    subjects: { search:"" },
    notes: { search:"" },
  },
  pomodoro: {
    mode: "focus",
    secondsLeft: 25*60,
    running: false,
    sessionsToday: 0,
    timerId: null,
  },
  calendar: { cursor: (()=>{ const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })(), selected: todayISO() },
};

function subjMap(){
  const m = {};
  state.data.subjects.forEach(s => m[s.id] = s);
  return m;
}

function updateData(patch){
  const p = typeof patch === 'function' ? patch(state.data) : patch;
  Object.assign(state.data, p);
  saveData();
}

/* ---------------------------------------------------------
   ICONS — small inline SVG helper
--------------------------------------------------------- */
const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7.5 7.5 0 1 1-15 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/><path d="M10 11v6M14 11v6"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  chevLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  chevRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l16 9-16 9V3z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>',
  planner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-6 3 3 5-8"/></svg>',
};
function icon(name, size=16){
  return (ICONS[name] || '').replace('<svg ', `<svg width="${size}" height="${size}" `);
}

/* ---------------------------------------------------------
   TOASTS
--------------------------------------------------------- */
const TOAST_COLORS = { success:"#0F766E", info:"#38BDF8", warning:"#D97706" };
const TOAST_ICONS = { success:"check", info:"alert", warning:"alert" };

function showToast(message, type="success"){
  const host = document.getElementById('toastHost');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <div class="toast-icon" style="background:${TOAST_COLORS[type]}1A; color:${TOAST_COLORS[type]}">${icon(TOAST_ICONS[type],16)}</div>
    <p class="toast-msg">${escapeHtml(message)}</p>
    <button class="toast-close">${icon('x',14)}</button>
  `;
  el.querySelector('.toast-close').addEventListener('click', ()=> el.remove());
  host.appendChild(el);
  setTimeout(()=>{ el.style.transition = 'opacity .3s ease'; el.style.opacity='0'; setTimeout(()=>el.remove(), 300); }, 3400);
}

/* ---------------------------------------------------------
   MODAL / CONFIRM DIALOG
--------------------------------------------------------- */
function closeModal(){
  state.modal = null;
  document.getElementById('modalRoot').innerHTML = '';
}

function openConfirm(title, message, onConfirm){
  const root = document.getElementById('modalRoot');
  root.innerHTML = `
    <div class="modal-backdrop" id="confirmBackdrop">
      <div class="modal modal-sm animate-popIn">
        <div class="modal-header">
          <h3 class="modal-title">${escapeHtml(title)}</h3>
          <button class="icon-action" id="confirmCloseBtn">${icon('x',18)}</button>
        </div>
        <div class="modal-body">
          <p style="font-size:14px; opacity:.7; margin-bottom:24px;">${escapeHtml(message)}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary btn-md" id="confirmCancelBtn">Cancel</button>
            <button class="btn btn-danger btn-md" id="confirmDeleteBtn">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const backdrop = document.getElementById('confirmBackdrop');
  const close = ()=> closeModal();
  backdrop.addEventListener('mousedown', (e)=>{ if(e.target===backdrop) close(); });
  document.getElementById('confirmCloseBtn').addEventListener('click', close);
  document.getElementById('confirmCancelBtn').addEventListener('click', close);
  document.getElementById('confirmDeleteBtn').addEventListener('click', ()=>{ onConfirm(); close(); });
}

/* ---------------------------------------------------------
   ROUTING / NAV LABELS
--------------------------------------------------------- */
const ROUTE_LABELS = {
  dashboard: "Dashboard",
  planner: "Study Planner",
  subjects: "Subjects",
  goals: "Goals",
  pomodoro: "Pomodoro Timer",
  calendar: "Calendar",
  analytics: "Analytics",
  notes: "Notes",
  settings: "Settings",
};

function navigate(route){
  state.route = route;
  state.sidebarOpen = false;
  renderShellChrome();
  renderPage();
  window.scrollTo({ top:0, behavior:'instant' in window ? 'instant' : 'auto' });
}

/* ---------------------------------------------------------
   SHELL CHROME (sidebar active state, topbar title, exam pill)
--------------------------------------------------------- */
function renderShellChrome(){
  // Sidebar active link
  document.querySelectorAll('.nav-link').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.route === state.route);
  });
  // Topbar title
  document.getElementById('topbarTitle').textContent = ROUTE_LABELS[state.route];
  // Sidebar open/close (mobile)
  document.getElementById('sidebar').classList.toggle('open', state.sidebarOpen);
  document.getElementById('sidebarOverlay').classList.toggle('show', state.sidebarOpen);
  // Avatar initial
  document.getElementById('avatarInitial').textContent = (state.data.displayName || "S").slice(0,1).toUpperCase();
  // Exam pill (nearest upcoming exam)
  const upcoming = state.data.exams
    .filter(e => daysBetween(todayISO(), e.date) >= 0)
    .sort((a,b)=> daysBetween(todayISO(),a.date) - daysBetween(todayISO(),b.date))[0];
  const pill = document.getElementById('examPill');
  if(upcoming){
    pill.style.display = 'flex';
    pill.innerHTML = `${icon('alert',14)} ${escapeHtml(upcoming.name)} in ${daysBetween(todayISO(), upcoming.date)}d`;
  } else {
    pill.style.display = 'none';
  }
  // Theme icons
  document.getElementById('themeIconMoon').style.display = state.dark ? 'none' : 'block';
  document.getElementById('themeIconSun').style.display = state.dark ? 'block' : 'none';
}

/* ---------------------------------------------------------
   PAGE RENDER DISPATCH
--------------------------------------------------------- */
const PAGE_RENDERERS = {}; // populated by each page module below

function renderPage(){
  const page = document.getElementById('page');
  const renderer = PAGE_RENDERERS[state.route];
  page.innerHTML = renderer ? renderer() : '';
  page.classList.remove('animate-fadeUp');
  void page.offsetWidth; // restart animation
  page.classList.add('animate-fadeUp');
  bindPageEvents();
}

/* ---------------------------------------------------------
   REUSABLE: empty state markup
--------------------------------------------------------- */
function emptyStateHtml({ iconName, title, sub, actionHtml }){
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon(iconName, 34)}</div>
      <h4 class="empty-title">${escapeHtml(title)}</h4>
      <p class="empty-sub">${escapeHtml(sub)}</p>
      ${actionHtml || ''}
    </div>
  `;
}

function badgeHtml(text, color, bg){
  return `<span class="badge" style="color:${color}; background:${bg}">${escapeHtml(text)}</span>`;
}

/* =========================================================
   DASHBOARD
========================================================= */
let clockTimerId = null;

PAGE_RENDERERS.dashboard = function(){
  const d = state.data;
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  let weekHours = 0;
  for(let i=0;i<7;i++){ weekHours += d.studyLog[addDays(todayISO(), -i)] || 0; }

  const subjectsCompleted = d.subjects.filter(s => s.completedTopics >= s.totalTopics).length;
  const hoursGoal = d.goals.find(g => g.unit === "hours");
  const weeklyGoalTarget = hoursGoal ? hoursGoal.target : 15;
  const weeklyGoalPct = clamp(Math.round((weekHours/weeklyGoalTarget)*100), 0, 100);
  const upcomingExams = d.exams
    .filter(e => daysBetween(todayISO(), e.date) >= 0)
    .sort((a,b)=> daysBetween(todayISO(),a.date) - daysBetween(todayISO(),b.date));
  const todaysSessions = d.sessions.filter(s => s.date === todayISO()).sort((a,b)=> a.start.localeCompare(b.start));

  const summary = [
    { label:"Total Study Hours", value: d.totalHours.toFixed(1)+"h", iconName:"clock", accent:"#0F766E" },
    { label:"Subjects Completed", value: `${subjectsCompleted}/${d.subjects.length}`, iconName:"book", accent:"#38BDF8" },
    { label:"Weekly Goal Progress", value: `${weeklyGoalPct}%`, iconName:"target", accent:"#10B981" },
    { label:"Upcoming Exams", value: upcomingExams.length, iconName:"calendar", accent:"#D97706" },
    { label:"Current Streak", value: `${d.streak} days`, iconName:"flame", accent:"#DC2626" },
  ];

  const summaryHtml = summary.map(c => `
    <div class="card card-hover summary-card">
      <div class="summary-icon" style="background:${c.accent}16; color:${c.accent}">${icon(c.iconName,19)}</div>
      <p class="summary-value">${c.value}</p>
      <p class="summary-label">${c.label}</p>
    </div>
  `).join('');

  const sessionsHtml = todaysSessions.length === 0
    ? emptyStateHtml({
        iconName:"planner", title:"No sessions today",
        sub:"Plan a focused study block to make today count.",
        actionHtml:`<button class="btn btn-primary btn-md" data-action="go-planner">${icon('plus',16)} Add Session</button>`
      })
    : todaysSessions.map(s=>{
        const subj = subjMap()[s.subjectId];
        const pm = PRIORITY_META[s.priority];
        return `
          <div class="session-row">
            <div class="session-bar" style="background:${subj ? subj.color : '#0F766E'}"></div>
            <div class="session-main">
              <p class="session-topic">${escapeHtml(s.topic)}</p>
              <p class="session-meta">${escapeHtml(subj ? subj.name : '—')} · ${fmtTime12(s.start)} – ${fmtTime12(s.end)}</p>
            </div>
            ${badgeHtml(s.priority, pm.color, pm.bg)}
          </div>
        `;
      }).join('');

  const examsHtml = upcomingExams.length === 0
    ? emptyStateHtml({ iconName:"calendar", title:"No exams scheduled", sub:"You're all clear for now." })
    : upcomingExams.slice(0,4).map(e=>{
        const subj = subjMap()[e.subjectId];
        const days = daysBetween(todayISO(), e.date);
        const urgent = days <= 7;
        return `
          <div class="exam-row ${urgent ? 'urgent' : 'normal'}">
            <div style="min-width:0;">
              <p class="exam-name">${escapeHtml(e.name)}</p>
              <p class="exam-meta">${escapeHtml(subj ? subj.name : '—')} · ${fmtDateShort(e.date)}</p>
            </div>
            <div class="exam-count">
              <p class="exam-count-num" style="color:${urgent ? '#DC2626' : '#0F766E'}">${days}</p>
              <p class="exam-count-label">days left</p>
            </div>
          </div>
        `;
      }).join('');

  return `
    <div class="hero card grain">
      <div class="hero-blob"></div>
      <div class="hero-row">
        <div>
          <p class="hero-date">${fmtDateLong(todayISO())}</p>
          <h1 class="hero-welcome">Welcome back, ${escapeHtml(d.displayName || 'Student')} 👋</h1>
          <p class="hero-time font-mono" id="dashClock"></p>
        </div>
        <div class="hero-quote-wrap">
          <p class="hero-quote-label">Today's motivation</p>
          <p class="hero-quote">"${escapeHtml(quote)}"</p>
        </div>
      </div>
    </div>

    <div class="summary-grid">${summaryHtml}</div>

    <div class="dash-grid">
      <div class="card section-card">
        <div class="section-head">
          <h3 class="section-title">Today's Sessions</h3>
          <button class="section-link" data-action="go-planner">View planner ${icon('chevRight',14)}</button>
        </div>
        ${sessionsHtml}
      </div>
      <div class="card section-card">
        <div class="section-head">
          <h3 class="section-title">Exam Countdown</h3>
        </div>
        ${examsHtml}
      </div>
    </div>
  `;
};

function startDashboardClock(){
  if(clockTimerId) clearInterval(clockTimerId);
  const tick = ()=>{
    const el = document.getElementById('dashClock');
    if(!el) return;
    el.textContent = new Date().toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  };
  tick();
  clockTimerId = setInterval(tick, 1000);
}

/* =========================================================
   STUDY PLANNER
========================================================= */
PAGE_RENDERERS.planner = function(){
  const d = state.data;
  const f = state.filters.planner;

  let list = [...d.sessions];
  if(f.search.trim()){
    const q = f.search.toLowerCase();
    list = list.filter(s => s.topic.toLowerCase().includes(q) || (subjMap()[s.subjectId]?.name||'').toLowerCase().includes(q));
  }
  if(f.priority !== "All") list = list.filter(s => s.priority === f.priority);
  if(f.subject !== "All") list = list.filter(s => s.subjectId === f.subject);
  list.sort((a,b)=> f.sort === "latest"
    ? (b.date+b.start).localeCompare(a.date+a.start)
    : (a.date+a.start).localeCompare(b.date+b.start));

  const subjectOptions = d.subjects.map(s => `<option value="${s.id}" ${f.subject===s.id?'selected':''}>${escapeHtml(s.name)}</option>`).join('');

  const cardsHtml = list.length === 0
    ? emptyStateHtml({
        iconName:"planner", title:"No study sessions found",
        sub:"Try adjusting your filters, or add a new study session to get started.",
        actionHtml:`<button class="btn btn-primary btn-md" data-action="open-session-modal">${icon('plus',16)} Add Session</button>`
      })
    : `<div class="card-grid">${list.map(sessionCardHtml).join('')}</div>`;

  return `
    <div class="page-head">
      <div>
        <h2 class="page-head-title">Study Planner</h2>
        <p class="page-head-sub">Plan, organize, and track every study session.</p>
      </div>
      <button class="btn btn-primary btn-md" data-action="open-session-modal">${icon('plus',16)} Add Session</button>
    </div>

    <div class="card toolbar">
      <div class="input-icon-wrap">
        ${icon('search',16)}
        <input class="input" id="plannerSearch" type="text" placeholder="Search sessions or subjects…" value="${escapeHtml(f.search)}" />
      </div>
      <select class="input" id="plannerPriorityFilter">
        <option value="All" ${f.priority==='All'?'selected':''}>All Priorities</option>
        <option ${f.priority==='High'?'selected':''}>High</option>
        <option ${f.priority==='Medium'?'selected':''}>Medium</option>
        <option ${f.priority==='Low'?'selected':''}>Low</option>
      </select>
      <select class="input" id="plannerSubjectFilter">
        <option value="All" ${f.subject==='All'?'selected':''}>All Subjects</option>
        ${subjectOptions}
      </select>
      <select class="input" id="plannerSortOrder">
        <option value="latest" ${f.sort==='latest'?'selected':''}>Sort: Latest</option>
        <option value="oldest" ${f.sort==='oldest'?'selected':''}>Sort: Oldest</option>
      </select>
    </div>

    ${ list.length === 0 ? `<div class="card">${cardsHtml.includes('empty-state') ? cardsHtml : ''}</div>` : cardsHtml }

    ${examSectionHtml()}
  `;
};

function sessionCardHtml(s){
  const subj = subjMap()[s.subjectId];
  const pm = PRIORITY_META[s.priority];
  const overdue = daysBetween(todayISO(), s.deadline) < 0 && !s.done;
  return `
    <div class="card card-hover session-card ${s.done ? 'completed' : ''}" data-session-id="${s.id}">
      <div class="session-card-top">
        <div class="session-card-subj">
          <span class="dot" style="background:${subj ? subj.color : '#0F766E'}"></span>
          <span class="subj-name">${escapeHtml(subj ? subj.name : 'Unknown')}</span>
        </div>
        ${badgeHtml(s.priority, pm.color, pm.bg)}
      </div>
      <h4 class="session-card-title ${s.done ? 'done' : ''}">${escapeHtml(s.topic)}</h4>
      <div class="session-card-meta">
        <span>${icon('clock',13)} ${fmtTime12(s.start)}–${fmtTime12(s.end)}</span>
        <span>${icon('timer',13)} ${escapeHtml(s.duration)}</span>
      </div>
      <p class="session-card-deadline ${overdue ? 'overdue' : ''}">Deadline: ${fmtDateShort(s.deadline)} ${overdue ? '(overdue)' : ''}</p>
      ${s.notes ? `<p class="session-card-notes">${escapeHtml(s.notes)}</p>` : ''}
      <div class="session-card-footer">
        <button class="mark-done-btn ${s.done ? 'done' : ''}" data-action="toggle-session-done" data-id="${s.id}">
          ${icon('check',14)} ${s.done ? 'Completed' : 'Mark done'}
        </button>
        <div class="card-actions">
          <button class="icon-action" data-action="duplicate-session" data-id="${s.id}" title="Duplicate">${icon('copy',15)}</button>
          <button class="icon-action" data-action="edit-session" data-id="${s.id}" title="Edit">${icon('edit',15)}</button>
          <button class="icon-action danger-hover" data-action="delete-session" data-id="${s.id}" title="Delete">${icon('trash',15)}</button>
        </div>
      </div>
    </div>
  `;
}

/* ---------- Exam Countdown (lives inside Planner) ---------- */
function examSectionHtml(){
  const d = state.data;
  const sorted = [...d.exams].sort((a,b)=> daysBetween(todayISO(),a.date) - daysBetween(todayISO(),b.date));
  const body = sorted.length === 0
    ? emptyStateHtml({
        iconName:"calendar", title:"No exams added",
        sub:"Add upcoming exams to keep track of countdowns and deadlines.",
        actionHtml:`<button class="btn btn-primary btn-md" data-action="open-exam-modal">${icon('plus',16)} Add Exam</button>`
      })
    : `<div class="exam-grid">${sorted.map(examCardHtml).join('')}</div>`;

  return `
    <div class="card section-card" style="margin-top:32px;">
      <div class="section-head">
        <h3 class="section-title" style="display:flex; align-items:center; gap:8px;">
          <span style="color:#D97706; display:flex;">${icon('alert',18)}</span> Exam Countdown
        </h3>
        <button class="btn btn-primary btn-sm" data-action="open-exam-modal">${icon('plus',14)} Add Exam</button>
      </div>
      ${body}
    </div>
  `;
}

function examCardHtml(e){
  const subj = subjMap()[e.subjectId];
  const days = daysBetween(todayISO(), e.date);
  const urgent = days <= 7 && days >= 0;
  let daysLabel;
  if(days < 0) daysLabel = "Completed";
  else if(days === 0) daysLabel = "Today!";
  else daysLabel = `${days} day${days===1?'':'s'} remaining`;

  return `
    <div class="exam-card ${urgent ? 'urgent' : ''}">
      <div class="exam-card-top">
        <span class="dot" style="background:${subj ? subj.color : '#0F766E'}; margin-top:6px;"></span>
        <div class="exam-card-actions">
          <button class="icon-action" data-action="edit-exam" data-id="${e.id}">${icon('edit',13)}</button>
          <button class="icon-action danger-hover" data-action="delete-exam" data-id="${e.id}">${icon('trash',13)}</button>
        </div>
      </div>
      <p class="exam-card-title">${escapeHtml(e.name)}</p>
      <p class="exam-card-meta">${escapeHtml(subj ? subj.name : '—')} · ${fmtDateShort(e.date)}</p>
      <p class="exam-card-days" style="color:${days<0 ? '#9CA3AF' : urgent ? '#DC2626' : '#0F766E'}">${daysLabel}</p>
    </div>
  `;
}

/* =========================================================
   SUBJECTS
========================================================= */
PAGE_RENDERERS.subjects = function(){
  const d = state.data;
  const f = state.filters.subjects;
  let list = [...d.subjects];
  if(f.search.trim()){
    const q = f.search.toLowerCase();
    list = list.filter(s => s.name.toLowerCase().includes(q) || s.teacher.toLowerCase().includes(q));
  }

  const body = list.length === 0
    ? `<div class="card">${emptyStateHtml({
        iconName:"book", title:"No subjects yet",
        sub:"Add your first subject to start organizing your study plan.",
        actionHtml:`<button class="btn btn-primary btn-md" data-action="open-subject-modal">${icon('plus',16)} Add Subject</button>`
      })}</div>`
    : `<div class="card-grid">${list.map(subjectCardHtml).join('')}</div>`;

  return `
    <div class="page-head">
      <div>
        <h2 class="page-head-title">Subjects</h2>
        <p class="page-head-sub">Manage every subject and track topic completion.</p>
      </div>
      <button class="btn btn-primary btn-md" data-action="open-subject-modal">${icon('plus',16)} Add Subject</button>
    </div>

    <div class="input-icon-wrap" style="max-width:360px; margin-bottom:24px;">
      ${icon('search',16)}
      <input class="input" id="subjectsSearch" type="text" placeholder="Search subjects or teachers…" value="${escapeHtml(f.search)}" />
    </div>

    ${body}
  `;
};

function subjectCardHtml(s){
  const pct = s.totalTopics ? Math.round((s.completedTopics/s.totalTopics)*100) : 0;
  const dm = DIFFICULTY_META[s.difficulty];
  return `
    <div class="card card-hover subject-card">
      <div class="subject-card-top">
        <div class="subject-card-id">
          <div class="subject-avatar" style="background:${s.color}">${escapeHtml(s.name.slice(0,1).toUpperCase())}</div>
          <div style="min-width:0;">
            <p class="subject-name">${escapeHtml(s.name)}</p>
            <p class="subject-teacher">${icon('user',12)} ${escapeHtml(s.teacher || 'No teacher set')}</p>
          </div>
        </div>
        ${badgeHtml(s.difficulty, dm.color, dm.bg)}
      </div>
      <div class="subject-progress-row">
        <span class="subject-progress-count">${s.completedTopics}/${s.totalTopics} topics</span>
        <span class="subject-progress-pct" style="color:${s.color}">${pct}%</span>
      </div>
      <div class="progress-track thin"><div class="progress-fill" style="width:${pct}%; background:${s.color}"></div></div>
      <div class="subject-card-footer">
        <button class="icon-action" data-action="edit-subject" data-id="${s.id}">${icon('edit',15)}</button>
        <button class="icon-action danger-hover" data-action="delete-subject" data-id="${s.id}">${icon('trash',15)}</button>
      </div>
    </div>
  `;
}

/* =========================================================
   GOALS
========================================================= */
PAGE_RENDERERS.goals = function(){
  const d = state.data;
  const completedCount = d.goals.filter(g=>g.done).length;

  const body = d.goals.length === 0
    ? `<div class="card">${emptyStateHtml({
        iconName:"target", title:"No goals set",
        sub:"Set weekly goals to stay focused and track your study momentum.",
        actionHtml:`<button class="btn btn-primary btn-md" data-action="open-goal-modal">${icon('plus',16)} Create Goal</button>`
      })}</div>`
    : `<div class="card-grid goals-grid">${d.goals.map(goalCardHtml).join('')}</div>`;

  return `
    <div class="page-head">
      <div>
        <h2 class="page-head-title">Weekly Goals</h2>
        <p class="page-head-sub">${completedCount} of ${d.goals.length} goals completed this week.</p>
      </div>
      <button class="btn btn-primary btn-md" data-action="open-goal-modal">${icon('plus',16)} New Goal</button>
    </div>
    ${body}
  `;
};

function goalCardHtml(g){
  const pct = clamp(Math.round((g.current/g.target)*100), 0, 100);
  return `
    <div class="card card-hover goal-card">
      <div class="goal-top">
        <div class="goal-id">
          <button class="goal-check ${g.done ? 'done' : ''}" data-action="toggle-goal-done" data-id="${g.id}">
            ${g.done ? icon('check',14) : ''}
          </button>
          <p class="goal-text ${g.done ? 'done' : ''}">${escapeHtml(g.text)}</p>
        </div>
        <button class="icon-action danger-hover" data-action="delete-goal" data-id="${g.id}">${icon('trash',15)}</button>
      </div>
      <div class="goal-progress-row">
        <span class="goal-progress-count">${g.current}/${g.target} ${escapeHtml(g.unit)}</span>
        <span class="goal-progress-pct" style="color:${g.done ? '#10B981' : '#0F766E'}">${pct}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      ${!g.done ? `
        <div class="goal-controls">
          <button class="step-btn" data-action="goal-step" data-id="${g.id}" data-dir="-1">−</button>
          <input type="range" class="goal-slider" min="0" max="${g.target}" value="${g.current}" data-action="goal-slide" data-id="${g.id}" />
          <button class="step-btn" data-action="goal-step" data-id="${g.id}" data-dir="1">+</button>
        </div>
      ` : ''}
    </div>
  `;
}

/* =========================================================
   POMODORO TIMER
========================================================= */
const POMO_PRESETS = { focus: 25*60, short: 5*60, long: 15*60 };
const POMO_COLORS = { focus:"#0F766E", short:"#38BDF8", long:"#10B981" };
const POMO_LABELS = { focus:"Focus Time", short:"Short Break", long:"Long Break" };
const POMO_BTN_LABELS = { focus:"25 Min Focus", short:"5 Min Break", long:"15 Min Long Break" };

PAGE_RENDERERS.pomodoro = function(){
  const p = state.pomodoro;
  const d = state.data;
  const circumference = 2 * Math.PI * 110;

  return `
    <div class="page-head">
      <div>
        <h2 class="page-head-title">Pomodoro Timer</h2>
        <p class="page-head-sub">Stay locked in with focused work intervals.</p>
      </div>
    </div>

    <div class="pomo-grid">
      <div class="card pomo-main">
        <div class="pomo-modes">
          ${Object.keys(POMO_PRESETS).map(k => `
            <button class="pomo-mode-btn ${p.mode===k?'active':''}" data-action="pomo-switch-mode" data-mode="${k}"
              style="${p.mode===k ? `background:${POMO_COLORS[k]}` : ''}">${POMO_BTN_LABELS[k]}</button>
          `).join('')}
        </div>

        <div class="pomo-ring-wrap ${p.running ? 'running' : ''}">
          <svg width="100%" height="100%" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="110" fill="none" stroke="var(--line)" stroke-width="10" />
            <circle id="pomoRingProgress" cx="120" cy="120" r="110" fill="none" stroke="${POMO_COLORS[p.mode]}" stroke-width="10"
              stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
              transform="rotate(-90 120 120)" style="transition: stroke-dashoffset 1s linear;" />
          </svg>
          <div class="pomo-ring-text">
            <p class="pomo-time font-mono" id="pomoTimeDisplay">25:00</p>
            <p class="pomo-label" id="pomoLabelDisplay">${POMO_LABELS[p.mode]}</p>
          </div>
        </div>

        <div class="pomo-controls">
          <button class="pomo-reset-btn" data-action="pomo-reset">${icon('refresh',18)}</button>
          <button class="pomo-play-btn" data-action="pomo-toggle" id="pomoPlayBtn"
            style="background:linear-gradient(135deg, ${POMO_COLORS[p.mode]}, #38BDF8)">
            ${p.running ? icon('pause',24) : icon('play',24)}
          </button>
          <div class="pomo-count-btn">${p.sessionsToday}</div>
        </div>
      </div>

      <div class="pomo-side">
        <div class="card pomo-stat-card">
          <h4 class="section-title" style="font-size:15px; margin-bottom:14px;">Session Stats</h4>
          <div class="pomo-stat-row"><span>Completed today</span><span>${p.sessionsToday}</span></div>
          <div class="pomo-stat-row"><span>Current streak</span><span>${d.streak} days</span></div>
          <div class="pomo-stat-row"><span>Total hours</span><span>${d.totalHours}h</span></div>
        </div>
        <div class="card pomo-howitworks">
          <h4 class="section-title" style="font-size:14px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
            <span style="color:#0F766E; display:flex;">${icon('sparkle',15)}</span> How it works
          </h4>
          <p style="font-size:12.5px; opacity:.65; line-height:1.6;">Work in focused 25-minute intervals, then take a short 5-minute break. After 4 sessions, treat yourself to a longer 15-minute break.</p>
        </div>
      </div>
    </div>
  `;
};

function pomoUpdateDisplay(){
  const p = state.pomodoro;
  const mm = String(Math.floor(p.secondsLeft/60)).padStart(2,'0');
  const ss = String(p.secondsLeft%60).padStart(2,'0');
  const timeEl = document.getElementById('pomoTimeDisplay');
  if(timeEl) timeEl.textContent = `${mm}:${ss}`;

  const total = POMO_PRESETS[p.mode];
  const progress = ((total - p.secondsLeft) / total) * 100;
  const circumference = 2 * Math.PI * 110;
  const dash = circumference * (1 - progress/100);
  const ring = document.getElementById('pomoRingProgress');
  if(ring) ring.setAttribute('stroke-dashoffset', dash);

  const playBtn = document.getElementById('pomoPlayBtn');
  if(playBtn) playBtn.innerHTML = p.running ? icon('pause',24) : icon('play',24);
}

function pomoTick(){
  const p = state.pomodoro;
  if(p.secondsLeft <= 1){
    clearInterval(p.timerId);
    p.timerId = null;
    p.running = false;
    p.secondsLeft = 0;
    if(p.mode === 'focus'){
      p.sessionsToday += 1;
      showToast("Focus session complete! Take a break. 🎉");
    } else {
      showToast("Break's over — ready for the next focus block?");
    }
    if(state.route === 'pomodoro') renderPage();
    return;
  }
  p.secondsLeft -= 1;
  pomoUpdateDisplay();
}

function pomoToggle(){
  const p = state.pomodoro;
  p.running = !p.running;
  if(p.running){
    p.timerId = setInterval(pomoTick, 1000);
  } else {
    clearInterval(p.timerId);
    p.timerId = null;
  }
  pomoUpdateDisplay();
}

function pomoReset(){
  const p = state.pomodoro;
  clearInterval(p.timerId);
  p.timerId = null;
  p.running = false;
  p.secondsLeft = POMO_PRESETS[p.mode];
  pomoUpdateDisplay();
}

function pomoSwitchMode(mode){
  const p = state.pomodoro;
  clearInterval(p.timerId);
  p.timerId = null;
  p.mode = mode;
  p.running = false;
  p.secondsLeft = POMO_PRESETS[mode];
  renderPage();
}

/* =========================================================
   CALENDAR
========================================================= */
function buildEventsByDate(){
  const d = state.data;
  const map = {};
  const ensure = (key) => (map[key] ||= { sessions:[], exams:[], deadlines:[] });
  d.sessions.forEach(s => ensure(s.date).sessions.push(s));
  d.exams.forEach(e => ensure(e.date).exams.push(e));
  d.sessions.forEach(s => { if(s.deadline && s.deadline !== s.date) ensure(s.deadline).deadlines.push(s); });
  return map;
}

PAGE_RENDERERS.calendar = function(){
  const cal = state.calendar;
  const year = cal.cursor.getFullYear(), month = cal.cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const monthLabel = cal.cursor.toLocaleDateString(undefined, { month:'long', year:'numeric' });
  const eventsByDate = buildEventsByDate();

  let cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let dnum=1; dnum<=daysInMonth; dnum++) cells.push(dnum);

  const dayCellsHtml = cells.map(dnum=>{
    if(dnum===null) return `<div></div>`;
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dnum).padStart(2,'0')}`;
    const ev = eventsByDate[dateStr];
    const isToday = dateStr === todayISO();
    const isSelected = dateStr === cal.selected;
    let dotsHtml = '';
    if(ev){
      dotsHtml = `<div class="cal-day-dots">`;
      if(ev.sessions.length>0) dotsHtml += `<span class="cal-day-dot" style="background:${isSelected?'#fff':'#0F766E'}"></span>`;
      if(ev.exams.length>0) dotsHtml += `<span class="cal-day-dot" style="background:${isSelected?'#fff':'#DC2626'}"></span>`;
      if(ev.deadlines.length>0) dotsHtml += `<span class="cal-day-dot" style="background:${isSelected?'#fff':'#D97706'}"></span>`;
      dotsHtml += `</div>`;
    }
    const classes = ['cal-day'];
    if(isSelected) classes.push('selected'); else if(isToday) classes.push('today');
    return `<button class="${classes.join(' ')}" data-action="select-cal-day" data-date="${dateStr}">${dnum}${dotsHtml}</button>`;
  }).join('');

  const selEvents = eventsByDate[cal.selected] || { sessions:[], exams:[], deadlines:[] };
  const totalSel = selEvents.sessions.length + selEvents.exams.length + selEvents.deadlines.length;

  const sideEventsHtml = totalSel === 0
    ? emptyStateHtml({ iconName:"calendar", title:"Nothing scheduled", sub:"No sessions, exams, or deadlines on this day." })
    : [
        ...selEvents.sessions.map(s=>{
          const subj = subjMap()[s.subjectId];
          return `<div class="cal-event-item">
            <span style="color:#0F766E; flex-shrink:0; margin-top:2px;">${icon('planner',15)}</span>
            <div style="min-width:0;"><p class="cal-event-title">${escapeHtml(s.topic)}</p><p class="cal-event-meta">${escapeHtml(subj?subj.name:'—')} · ${fmtTime12(s.start)}</p></div>
          </div>`;
        }),
        ...selEvents.exams.map(e=>{
          const subj = subjMap()[e.subjectId];
          return `<div class="cal-event-item exam">
            <span style="color:#DC2626; flex-shrink:0; margin-top:2px;">${icon('alert',15)}</span>
            <div style="min-width:0;"><p class="cal-event-title">${escapeHtml(e.name)}</p><p class="cal-event-meta">${escapeHtml(subj?subj.name:'—')} · Exam day</p></div>
          </div>`;
        }),
        ...selEvents.deadlines.map(s=>{
          const subj = subjMap()[s.subjectId];
          return `<div class="cal-event-item deadline">
            <span style="color:#D97706; flex-shrink:0; margin-top:2px;">${icon('clock',15)}</span>
            <div style="min-width:0;"><p class="cal-event-title">${escapeHtml(s.topic)}</p><p class="cal-event-meta">${escapeHtml(subj?subj.name:'—')} · Deadline</p></div>
          </div>`;
        }),
      ].join('');

  return `
    <div class="page-head">
      <div>
        <h2 class="page-head-title">Calendar</h2>
        <p class="page-head-sub">View sessions, exams, and deadlines at a glance.</p>
      </div>
    </div>

    <div class="cal-grid">
      <div class="card cal-main">
        <div class="cal-head">
          <h3 class="cal-month-label">${monthLabel}</h3>
          <div class="cal-nav">
            <button class="cal-nav-btn arrow" data-action="cal-prev-month">${icon('chevLeft',15)}</button>
            <button class="cal-nav-btn today" data-action="cal-today">Today</button>
            <button class="cal-nav-btn arrow" data-action="cal-next-month">${icon('chevRight',15)}</button>
          </div>
        </div>
        <div class="cal-weekdays">
          ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w=>`<div class="cal-weekday">${w}</div>`).join('')}
        </div>
        <div class="cal-days">${dayCellsHtml}</div>
        <div class="cal-legend">
          <span><span class="cal-day-dot" style="background:#0F766E; width:8px; height:8px;"></span>Sessions</span>
          <span><span class="cal-day-dot" style="background:#DC2626; width:8px; height:8px;"></span>Exams</span>
          <span><span class="cal-day-dot" style="background:#D97706; width:8px; height:8px;"></span>Deadlines</span>
        </div>
      </div>

      <div class="card cal-side">
        <h4 class="cal-side-date">${fmtDateLong(cal.selected)}</h4>
        <p class="cal-side-count">${totalSel} item(s)</p>
        ${sideEventsHtml}
      </div>
    </div>
  `;
};

/* =========================================================
   ANALYTICS — custom inline SVG charts (no chart library)
========================================================= */
function svgBarChart(data, { width=520, height=180, barColor="#0F766E" } = {}){
  const max = Math.max(1, ...data.map(d=>d.value));
  const barW = Math.min(40, (width / data.length) * 0.55);
  const gap = (width - barW*data.length) / (data.length+1);
  const bars = data.map((d,i)=>{
    const h = (d.value/max) * (height-10);
    const x = gap + i*(barW+gap);
    return `
      <rect x="${x}" y="${height-h}" width="${barW}" height="${h}" rx="6" fill="${barColor}" opacity="0.92"></rect>
      <text x="${x+barW/2}" y="${height+18}" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.5">${d.label}</text>
      <text x="${x+barW/2}" y="${height-h-6}" text-anchor="middle" font-size="10.5" font-weight="700" fill="currentColor" opacity="0.7">${d.value}</text>
    `;
  }).join('');
  const gridLines = [0,0.25,0.5,0.75,1].map(t=>{
    const y = height-(height*t);
    return `<line x1="0" x2="${width}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-width="1" stroke-dasharray="3,4" />`;
  }).join('');
  return `<svg width="100%" viewBox="0 0 ${width} ${height+30}" style="overflow:visible;">${gridLines}${bars}</svg>`;
}

function svgLineChart(data, { width=520, height=180, color="#38BDF8" } = {}){
  const max = Math.max(1, ...data.map(d=>d.value));
  const stepX = width / (data.length-1 || 1);
  const points = data.map((d,i)=> [i*stepX, height - (d.value/max)*(height-20) - 10]);
  const pathD = points.map((p,i)=> (i===0?'M':'L')+p[0]+','+p[1]).join(' ');
  const areaD = pathD + ` L${width},${height} L0,${height} Z`;
  const dots = points.map(p=> `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${color}" stroke="var(--card)" stroke-width="2" />`).join('');
  const labels = data.map((d,i)=> `<text x="${i*stepX}" y="${height+18}" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.5">${d.label}</text>`).join('');
  const gradId = 'lineFill_' + Math.random().toString(36).slice(2,8);
  return `
    <svg width="100%" viewBox="0 0 ${width} ${height+30}" style="overflow:visible;">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#${gradId})" />
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}${labels}
    </svg>
  `;
}

function svgDonut(segments, { size=160, thickness=20 } = {}){
  const total = segments.reduce((s,x)=>s+x.value,0) || 1;
  const r = (size - thickness)/2;
  const c = 2*Math.PI*r;
  let offset = 0;
  const circles = segments.map(s=>{
    const frac = s.value/total;
    const dash = frac*c;
    const el = `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${thickness}"
      stroke-dasharray="${dash} ${c-dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${size/2} ${size/2})" stroke-linecap="butt" />`;
    offset += dash;
    return el;
  }).join('');
  const pct = Math.round((segments[0]?.value/total||0)*100);
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${thickness}" />
      ${circles}
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" font-size="20" font-weight="800" fill="currentColor">${pct}%</text>
    </svg>
  `;
}

PAGE_RENDERERS.analytics = function(){
  const d = state.data;

  const last7 = [];
  for(let i=6;i>=0;i--){
    const dt = addDays(todayISO(), -i);
    last7.push({ label: new Date(dt+"T00:00:00").toLocaleDateString(undefined,{weekday:'short'}), value: d.studyLog[dt] || 0 });
  }

  const last4weeks = [];
  for(let w=3; w>=0; w--){
    let sum = 0;
    for(let i=0;i<7;i++){ sum += d.studyLog[addDays(todayISO(), -(w*7+i))] || 0; }
    last4weeks.push({ label:`W${4-w}`, value:+sum.toFixed(1) });
  }

  const subjectPerf = d.subjects.map(s => ({
    label: s.name.length>14 ? s.name.slice(0,13)+'…' : s.name,
    value: s.totalTopics ? Math.round((s.completedTopics/s.totalTopics)*100) : 0,
    color: s.color
  }));

  const doneGoals = d.goals.filter(g=>g.done).length;
  const totalGoals = d.goals.length || 1;
  const goalCompletion = [
    { value: doneGoals, color:"#0F766E" },
    { value: totalGoals - doneGoals, color:"var(--line)" },
  ];

  const weekTotal = last7.reduce((s,x)=>s+x.value,0).toFixed(1);
  const avgDaily = (weekTotal/7).toFixed(1);

  const statCards = [
    { label:"This Week", value:`${weekTotal}h`, iconName:"clock", accent:"#0F766E" },
    { label:"Daily Average", value:`${avgDaily}h`, iconName:"chart", accent:"#38BDF8" },
    { label:"Goal Completion", value:`${Math.round((doneGoals/totalGoals)*100)}%`, iconName:"target", accent:"#10B981" },
  ];

  const perfRowsHtml = subjectPerf.length === 0
    ? emptyStateHtml({ iconName:"book", title:"No subjects yet", sub:"Add subjects to see performance analytics." })
    : subjectPerf.map(s => `
        <div class="perf-row">
          <div class="perf-row-head"><span>${escapeHtml(s.label)}</span><span>${s.value}%</span></div>
          <div class="progress-track thin"><div class="progress-fill" style="width:${s.value}%; background:${s.color}"></div></div>
        </div>
      `).join('');

  return `
    <div class="page-head">
      <div>
        <h2 class="page-head-title">Analytics</h2>
        <p class="page-head-sub">Insights into your study habits and performance.</p>
      </div>
    </div>

    <div class="analytics-stats">
      ${statCards.map(c => `
        <div class="card analytics-stat-card">
          <div class="analytics-stat-icon" style="background:${c.accent}16; color:${c.accent}">${icon(c.iconName,20)}</div>
          <div><p class="analytics-stat-value">${c.value}</p><p class="analytics-stat-label">${c.label}</p></div>
        </div>
      `).join('')}
    </div>

    <div class="charts-row">
      <div class="card chart-card">
        <h4 class="chart-title">Daily Study Hours (Last 7 Days)</h4>
        ${svgBarChart(last7, { barColor:"#0F766E" })}
      </div>
      <div class="card chart-card">
        <h4 class="chart-title">Weekly Study Hours (Last 4 Weeks)</h4>
        ${svgLineChart(last4weeks, { color:"#38BDF8" })}
      </div>
    </div>

    <div class="analytics-bottom">
      <div class="card chart-card">
        <h4 class="chart-title">Subject Performance</h4>
        ${perfRowsHtml}
      </div>
      <div class="card donut-card">
        <h4 class="chart-title" style="align-self:flex-start;">Goal Completion Rate</h4>
        ${svgDonut(goalCompletion)}
        <div class="donut-legend">
          <span><span class="legend-dot" style="background:#0F766E"></span>Completed</span>
          <span><span class="legend-dot" style="background:var(--line)"></span>Remaining</span>
        </div>
      </div>
    </div>
  `;
};

/* =========================================================
   NOTES
========================================================= */
PAGE_RENDERERS.notes = function(){
  const d = state.data;
  const f = state.filters.notes;
  let list = [...d.notes];
  if(f.search.trim()){
    const q = f.search.toLowerCase();
    list = list.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }
  const pinned = list.filter(n=>n.pinned);
  const rest = list.filter(n=>!n.pinned);

  let body;
  if(list.length === 0){
    body = `<div class="card">${emptyStateHtml({
      iconName:"note", title:"No notes found",
      sub:"Capture your first idea, formula, or reminder.",
      actionHtml:`<button class="btn btn-primary btn-md" data-action="open-note-modal">${icon('plus',16)} New Note</button>`
    })}</div>`;
  } else {
    body = '';
    if(pinned.length>0){
      body += `<p class="notes-section-label">${icon('pin',13)} Pinned</p>
        <div class="notes-columns" style="margin-bottom:24px;">${pinned.map(noteCardHtml).join('')}</div>`;
    }
    if(rest.length>0){
      if(pinned.length>0) body += `<p class="notes-section-label">All Notes</p>`;
      body += `<div class="notes-columns">${rest.map(noteCardHtml).join('')}</div>`;
    }
  }

  return `
    <div class="page-head">
      <div>
        <h2 class="page-head-title">Study Notes</h2>
        <p class="page-head-sub">Capture ideas, formulas, and reminders.</p>
      </div>
      <button class="btn btn-primary btn-md" data-action="open-note-modal">${icon('plus',16)} New Note</button>
    </div>

    <div class="input-icon-wrap" style="max-width:360px; margin-bottom:24px;">
      ${icon('search',16)}
      <input class="input" id="notesSearch" type="text" placeholder="Search notes…" value="${escapeHtml(f.search)}" />
    </div>

    ${body}
  `;
};

function noteCardHtml(n){
  const subj = subjMap()[n.subjectId];
  return `
    <div class="card card-hover note-card">
      <div class="note-top">
        <h4 class="note-title">${escapeHtml(n.title)}</h4>
        <button class="pin-btn ${n.pinned ? 'pinned' : ''}" data-action="toggle-note-pin" data-id="${n.id}">${icon('pin',15)}</button>
      </div>
      <p class="note-content">${escapeHtml(n.content)}</p>
      <div class="note-footer">
        <div class="note-meta">
          ${subj ? `<span class="dot" style="background:${subj.color}; width:6px; height:6px;"></span><span>${escapeHtml(subj.name)} ·</span>` : ''}
          <span>${fmtDateShort(n.date)}</span>
        </div>
        <button class="icon-action danger-hover" data-action="delete-note" data-id="${n.id}">${icon('trash',14)}</button>
      </div>
    </div>
  `;
}

/* =========================================================
   SETTINGS
========================================================= */
PAGE_RENDERERS.settings = function(){
  const d = state.data;
  const achievements = [
    { label:"7-Day Streak", earned: d.streak>=7, iconName:"flame" },
    { label:"50 Hours Logged", earned: d.totalHours>=50, iconName:"clock" },
    { label:"Goal Crusher", earned: d.goals.some(g=>g.done), iconName:"target" },
    { label:"Subject Master", earned: d.subjects.some(s=>s.completedTopics>=s.totalTopics), iconName:"award" },
  ];

  return `
    <div class="page-head">
      <div>
        <h2 class="page-head-title">Settings</h2>
        <p class="page-head-sub">Manage your profile, appearance, and data.</p>
      </div>
    </div>

    <div class="settings-wrap">
      <div class="card settings-card">
        <h4 class="settings-card-title">${icon('user',17)} Profile</h4>
        <div class="field">
          <label class="field-label">Display Name</label>
          <div class="profile-input-row">
            <input class="input" id="displayNameInput" type="text" value="${escapeHtml(d.displayName||'')}" placeholder="Your name" />
            <button class="btn btn-primary btn-md" data-action="save-display-name">Save</button>
          </div>
        </div>
      </div>

      <div class="card settings-card">
        <h4 class="settings-card-title">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          Appearance
        </h4>
        <div class="settings-row">
          <div>
            <p class="settings-row-label">Dark Mode</p>
            <p class="settings-row-sub">Switch between light and dark themes.</p>
          </div>
          <div class="switch ${state.dark ? 'on' : ''}" id="darkModeSwitch"><div class="switch-dot"></div></div>
        </div>
      </div>

      <div class="card settings-card">
        <h4 class="settings-card-title">${icon('award',17)} Achievement Badges</h4>
        <div class="badges-grid">
          ${achievements.map(a => `
            <div class="badge-tile ${a.earned ? 'earned' : ''}">
              <div class="badge-tile-icon">${icon(a.iconName,18)}</div>
              <p class="badge-tile-label">${escapeHtml(a.label)}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card settings-card danger-zone">
        <h4 class="settings-card-title danger-title">${icon('alert',17)} Danger Zone</h4>
        <p class="danger-desc">Permanently reset all subjects, sessions, exams, goals, and notes. This cannot be undone.</p>
        <button class="btn btn-danger btn-md" data-action="open-reset-confirm">Reset All Data</button>
      </div>
    </div>
  `;
};

/* =========================================================
   MODAL FORMS
========================================================= */

/* ---------- Session Form Modal ---------- */
function openSessionModal(editId){
  const d = state.data;
  const existing = editId ? d.sessions.find(s=>s.id===editId) : null;

  if(d.subjects.length === 0){
    document.getElementById('modalRoot').innerHTML = `
      <div class="modal-backdrop" id="genericBackdrop">
        <div class="modal modal-sm animate-popIn">
          <div class="modal-header"><h3 class="modal-title">Add Study Session</h3><button class="icon-action" id="genericCloseBtn">${icon('x',18)}</button></div>
          <div class="modal-body">
            <p style="font-size:14px; opacity:.7;">Create a subject first before scheduling a session.</p>
            <div class="modal-actions"><button class="btn btn-secondary btn-md" id="genericCancelBtn">Close</button></div>
          </div>
        </div>
      </div>`;
    bindGenericCloseHandlers();
    return;
  }

  const f = existing || { subjectId: d.subjects[0].id, topic:"", priority:"Medium", duration:"1h", start:"09:00", end:"10:00", deadline: todayISO(), notes:"", date: todayISO() };

  const subjectOptions = d.subjects.map(s => `<option value="${s.id}" ${f.subjectId===s.id?'selected':''}>${escapeHtml(s.name)}</option>`).join('');

  document.getElementById('modalRoot').innerHTML = `
    <div class="modal-backdrop" id="sessionBackdrop">
      <div class="modal animate-popIn">
        <div class="modal-header">
          <h3 class="modal-title">${existing ? 'Edit Session' : 'Add Study Session'}</h3>
          <button class="icon-action" id="sessionCloseBtn">${icon('x',18)}</button>
        </div>
        <div class="modal-body">
          <div class="modal-grid-2">
            <div class="field"><label class="field-label">Subject</label><select class="input" id="f_subjectId">${subjectOptions}</select></div>
            <div class="field"><label class="field-label">Priority</label>
              <select class="input" id="f_priority">
                <option ${f.priority==='High'?'selected':''}>High</option>
                <option ${f.priority==='Medium'?'selected':''}>Medium</option>
                <option ${f.priority==='Low'?'selected':''}>Low</option>
              </select>
            </div>
            <div class="field"><label class="field-label">Topic Name</label><input class="input" id="f_topic" type="text" placeholder="e.g. Integration by Parts" value="${escapeHtml(f.topic)}" /></div>
            <div class="field"><label class="field-label">Date</label><input class="input" id="f_date" type="date" value="${f.date}" /></div>
            <div class="field"><label class="field-label">Start Time</label><input class="input" id="f_start" type="time" value="${f.start}" /></div>
            <div class="field"><label class="field-label">End Time</label><input class="input" id="f_end" type="time" value="${f.end}" /></div>
            <div class="field"><label class="field-label">Study Duration</label><input class="input" id="f_duration" type="text" placeholder="e.g. 1h 30m" value="${escapeHtml(f.duration)}" /></div>
            <div class="field"><label class="field-label">Deadline</label><input class="input" id="f_deadline" type="date" value="${f.deadline}" /></div>
          </div>
          <div class="field" style="margin-top:16px;">
            <label class="field-label">Notes</label>
            <textarea class="input" id="f_notes" rows="3" placeholder="Anything to remember…">${escapeHtml(f.notes)}</textarea>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary btn-md" id="sessionCancelBtn">Cancel</button>
            <button class="btn btn-primary btn-md" id="sessionSaveBtn">${existing ? 'Save Changes' : 'Add Session'}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const backdrop = document.getElementById('sessionBackdrop');
  const close = ()=> closeModal();
  backdrop.addEventListener('mousedown', e=>{ if(e.target===backdrop) close(); });
  document.getElementById('sessionCloseBtn').addEventListener('click', close);
  document.getElementById('sessionCancelBtn').addEventListener('click', close);
  document.getElementById('sessionSaveBtn').addEventListener('click', ()=>{
    const topic = document.getElementById('f_topic').value.trim();
    if(!topic) return;
    const payload = {
      subjectId: document.getElementById('f_subjectId').value,
      priority: document.getElementById('f_priority').value,
      topic,
      date: document.getElementById('f_date').value,
      start: document.getElementById('f_start').value,
      end: document.getElementById('f_end').value,
      duration: document.getElementById('f_duration').value.trim() || '1h',
      deadline: document.getElementById('f_deadline').value,
      notes: document.getElementById('f_notes').value,
    };
    if(existing){
      Object.assign(existing, payload);
      saveData();
      showToast("Session updated successfully.");
    } else {
      d.sessions.push({ ...payload, id: uid(), done:false });
      saveData();
      showToast("Session added to your planner.");
    }
    close();
    renderPage();
  });
}

/* ---------- Subject Form Modal ---------- */
function openSubjectModal(editId){
  const d = state.data;
  const existing = editId ? d.subjects.find(s=>s.id===editId) : null;
  const f = existing || { name:"", teacher:"", difficulty:"Medium", totalTopics:10, completedTopics:0, color: SUBJECT_COLORS[Math.floor(Math.random()*SUBJECT_COLORS.length)] };
  let selectedColor = f.color;

  const swatchesHtml = SUBJECT_COLORS.map(c => `<button class="swatch ${c===selectedColor?'selected':''}" data-color="${c}" style="background:${c}; color:${c};"></button>`).join('');

  document.getElementById('modalRoot').innerHTML = `
    <div class="modal-backdrop" id="subjectBackdrop">
      <div class="modal animate-popIn">
        <div class="modal-header">
          <h3 class="modal-title">${existing ? 'Edit Subject' : 'Add Subject'}</h3>
          <button class="icon-action" id="subjectCloseBtn">${icon('x',18)}</button>
        </div>
        <div class="modal-body">
          <div class="modal-grid-2">
            <div class="field"><label class="field-label">Subject Name</label><input class="input" id="f_name" type="text" placeholder="e.g. Physics II" value="${escapeHtml(f.name)}" /></div>
            <div class="field"><label class="field-label">Teacher Name</label><input class="input" id="f_teacher" type="text" placeholder="e.g. Dr. Sara Khan" value="${escapeHtml(f.teacher)}" /></div>
            <div class="field"><label class="field-label">Difficulty Level</label>
              <select class="input" id="f_difficulty">
                <option ${f.difficulty==='Easy'?'selected':''}>Easy</option>
                <option ${f.difficulty==='Medium'?'selected':''}>Medium</option>
                <option ${f.difficulty==='Hard'?'selected':''}>Hard</option>
              </select>
            </div>
            <div class="field"><label class="field-label">Color Tag</label><div class="swatch-row" id="colorSwatchRow">${swatchesHtml}</div></div>
            <div class="field"><label class="field-label">Total Topics</label><input class="input" id="f_totalTopics" type="number" min="0" value="${f.totalTopics}" /></div>
            <div class="field"><label class="field-label">Completed Topics</label><input class="input" id="f_completedTopics" type="number" min="0" value="${f.completedTopics}" /></div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary btn-md" id="subjectCancelBtn">Cancel</button>
            <button class="btn btn-primary btn-md" id="subjectSaveBtn">${existing ? 'Save Changes' : 'Add Subject'}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('#colorSwatchRow .swatch').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      selectedColor = btn.dataset.color;
      document.querySelectorAll('#colorSwatchRow .swatch').forEach(b=>b.classList.toggle('selected', b===btn));
    });
  });

  const backdrop = document.getElementById('subjectBackdrop');
  const close = ()=> closeModal();
  backdrop.addEventListener('mousedown', e=>{ if(e.target===backdrop) close(); });
  document.getElementById('subjectCloseBtn').addEventListener('click', close);
  document.getElementById('subjectCancelBtn').addEventListener('click', close);
  document.getElementById('subjectSaveBtn').addEventListener('click', ()=>{
    const name = document.getElementById('f_name').value.trim();
    if(!name) return;
    const totalTopics = Math.max(0, +document.getElementById('f_totalTopics').value || 0);
    const completedTopics = clamp(+document.getElementById('f_completedTopics').value || 0, 0, totalTopics);
    const payload = {
      name,
      teacher: document.getElementById('f_teacher').value.trim(),
      difficulty: document.getElementById('f_difficulty').value,
      totalTopics, completedTopics,
      color: selectedColor,
    };
    if(existing){
      Object.assign(existing, payload);
      saveData();
      showToast("Subject updated successfully.");
    } else {
      d.subjects.push({ ...payload, id: uid() });
      saveData();
      showToast("Subject added.");
    }
    close();
    renderPage();
  });
}

/* ---------- Exam Form Modal ---------- */
function openExamModal(editId){
  const d = state.data;
  if(d.subjects.length === 0){
    document.getElementById('modalRoot').innerHTML = `
      <div class="modal-backdrop" id="genericBackdrop">
        <div class="modal modal-sm animate-popIn">
          <div class="modal-header"><h3 class="modal-title">Add Exam</h3><button class="icon-action" id="genericCloseBtn">${icon('x',18)}</button></div>
          <div class="modal-body">
            <p style="font-size:14px; opacity:.7;">Create a subject first before adding an exam.</p>
            <div class="modal-actions"><button class="btn btn-secondary btn-md" id="genericCancelBtn">Close</button></div>
          </div>
        </div>
      </div>`;
    bindGenericCloseHandlers();
    return;
  }
  const existing = editId ? d.exams.find(e=>e.id===editId) : null;
  const f = existing || { name:"", subjectId: d.subjects[0].id, date: addDays(todayISO(),7) };
  const subjectOptions = d.subjects.map(s => `<option value="${s.id}" ${f.subjectId===s.id?'selected':''}>${escapeHtml(s.name)}</option>`).join('');

  document.getElementById('modalRoot').innerHTML = `
    <div class="modal-backdrop" id="examBackdrop">
      <div class="modal animate-popIn">
        <div class="modal-header">
          <h3 class="modal-title">${existing ? 'Edit Exam' : 'Add Exam'}</h3>
          <button class="icon-action" id="examCloseBtn">${icon('x',18)}</button>
        </div>
        <div class="modal-body">
          <div class="field" style="margin-bottom:16px;"><label class="field-label">Exam Name</label><input class="input" id="f_name" type="text" placeholder="e.g. Calculus Midterm" value="${escapeHtml(f.name)}" /></div>
          <div class="field" style="margin-bottom:16px;"><label class="field-label">Subject</label><select class="input" id="f_subjectId">${subjectOptions}</select></div>
          <div class="field"><label class="field-label">Exam Date</label><input class="input" id="f_date" type="date" value="${f.date}" /></div>
          <div class="modal-actions">
            <button class="btn btn-secondary btn-md" id="examCancelBtn">Cancel</button>
            <button class="btn btn-primary btn-md" id="examSaveBtn">${existing ? 'Save Changes' : 'Add Exam'}</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const backdrop = document.getElementById('examBackdrop');
  const close = ()=> closeModal();
  backdrop.addEventListener('mousedown', e=>{ if(e.target===backdrop) close(); });
  document.getElementById('examCloseBtn').addEventListener('click', close);
  document.getElementById('examCancelBtn').addEventListener('click', close);
  document.getElementById('examSaveBtn').addEventListener('click', ()=>{
    const name = document.getElementById('f_name').value.trim();
    if(!name) return;
    const payload = {
      name,
      subjectId: document.getElementById('f_subjectId').value,
      date: document.getElementById('f_date').value,
    };
    if(existing){
      Object.assign(existing, payload);
      saveData();
      showToast("Exam updated.");
    } else {
      d.exams.push({ ...payload, id: uid() });
      saveData();
      showToast("Exam added — reminders are now active.");
    }
    close();
    renderPage();
  });
}

/* ---------- Goal Form Modal ---------- */
function openGoalModal(){
  document.getElementById('modalRoot').innerHTML = `
    <div class="modal-backdrop" id="goalBackdrop">
      <div class="modal modal-sm animate-popIn">
        <div class="modal-header">
          <h3 class="modal-title">Create Weekly Goal</h3>
          <button class="icon-action" id="goalCloseBtn">${icon('x',18)}</button>
        </div>
        <div class="modal-body">
          <div class="field" style="margin-bottom:16px;"><label class="field-label">Goal Description</label><input class="input" id="f_text" type="text" placeholder="e.g. Study 15 hours" /></div>
          <div class="modal-grid-2">
            <div class="field"><label class="field-label">Target</label><input class="input" id="f_target" type="number" min="1" value="10" /></div>
            <div class="field"><label class="field-label">Unit</label>
              <select class="input" id="f_unit">
                <option value="hours">hours</option><option value="chapters">chapters</option>
                <option value="exercises">exercises</option><option value="pages">pages</option>
                <option value="sessions">sessions</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary btn-md" id="goalCancelBtn">Cancel</button>
            <button class="btn btn-primary btn-md" id="goalSaveBtn">Create Goal</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const backdrop = document.getElementById('goalBackdrop');
  const close = ()=> closeModal();
  backdrop.addEventListener('mousedown', e=>{ if(e.target===backdrop) close(); });
  document.getElementById('goalCloseBtn').addEventListener('click', close);
  document.getElementById('goalCancelBtn').addEventListener('click', close);
  document.getElementById('goalSaveBtn').addEventListener('click', ()=>{
    const text = document.getElementById('f_text').value.trim();
    if(!text) return;
    const target = Math.max(1, +document.getElementById('f_target').value || 1);
    const unit = document.getElementById('f_unit').value;
    state.data.goals.push({ id: uid(), text, target, unit, current:0, done:false });
    saveData();
    showToast("New weekly goal created.");
    close();
    renderPage();
  });
}

/* ---------- Note Form Modal ---------- */
function openNoteModal(){
  const d = state.data;
  const subjectOptions = d.subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
  document.getElementById('modalRoot').innerHTML = `
    <div class="modal-backdrop" id="noteBackdrop">
      <div class="modal animate-popIn">
        <div class="modal-header">
          <h3 class="modal-title">New Note</h3>
          <button class="icon-action" id="noteCloseBtn">${icon('x',18)}</button>
        </div>
        <div class="modal-body">
          <div class="field" style="margin-bottom:16px;"><label class="field-label">Title</label><input class="input" id="f_title" type="text" placeholder="Note title…" /></div>
          <div class="field" style="margin-bottom:16px;"><label class="field-label">Subject (optional)</label>
            <select class="input" id="f_subjectId"><option value="">No subject</option>${subjectOptions}</select>
          </div>
          <div class="field"><label class="field-label">Content</label><textarea class="input" id="f_content" rows="5" placeholder="Write your note…"></textarea></div>
          <div class="modal-actions">
            <button class="btn btn-secondary btn-md" id="noteCancelBtn">Cancel</button>
            <button class="btn btn-primary btn-md" id="noteSaveBtn">Save Note</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const backdrop = document.getElementById('noteBackdrop');
  const close = ()=> closeModal();
  backdrop.addEventListener('mousedown', e=>{ if(e.target===backdrop) close(); });
  document.getElementById('noteCloseBtn').addEventListener('click', close);
  document.getElementById('noteCancelBtn').addEventListener('click', close);
  document.getElementById('noteSaveBtn').addEventListener('click', ()=>{
    const title = document.getElementById('f_title').value.trim();
    if(!title) return;
    state.data.notes.unshift({
      id: uid(), title,
      content: document.getElementById('f_content').value,
      subjectId: document.getElementById('f_subjectId').value,
      pinned:false, date: todayISO(),
    });
    saveData();
    showToast("Note created.");
    close();
    renderPage();
  });
}

function bindGenericCloseHandlers(){
  const backdrop = document.getElementById('genericBackdrop');
  const close = ()=> closeModal();
  backdrop.addEventListener('mousedown', e=>{ if(e.target===backdrop) close(); });
  document.getElementById('genericCloseBtn').addEventListener('click', close);
  document.getElementById('genericCancelBtn').addEventListener('click', close);
}

/* =========================================================
   CENTRAL ACTION DISPATCH (event delegation per page render)
========================================================= */
function bindPageEvents(){
  const page = document.getElementById('page');

  // Generic data-action click delegation
  page.addEventListener('click', handlePageClick);

  // Planner filters
  const search = document.getElementById('plannerSearch');
  if(search){
    search.addEventListener('input', ()=>{ state.filters.planner.search = search.value; renderPage(); preserveFocus('plannerSearch'); });
  }
  const prFilter = document.getElementById('plannerPriorityFilter');
  if(prFilter) prFilter.addEventListener('change', ()=>{ state.filters.planner.priority = prFilter.value; renderPage(); });
  const subjFilter = document.getElementById('plannerSubjectFilter');
  if(subjFilter) subjFilter.addEventListener('change', ()=>{ state.filters.planner.subject = subjFilter.value; renderPage(); });
  const sortOrder = document.getElementById('plannerSortOrder');
  if(sortOrder) sortOrder.addEventListener('change', ()=>{ state.filters.planner.sort = sortOrder.value; renderPage(); });

  // Subjects search
  const subjSearch = document.getElementById('subjectsSearch');
  if(subjSearch) subjSearch.addEventListener('input', ()=>{ state.filters.subjects.search = subjSearch.value; renderPage(); preserveFocus('subjectsSearch'); });

  // Notes search
  const notesSearch = document.getElementById('notesSearch');
  if(notesSearch) notesSearch.addEventListener('input', ()=>{ state.filters.notes.search = notesSearch.value; renderPage(); preserveFocus('notesSearch'); });

  // Goal sliders
  document.querySelectorAll('[data-action="goal-slide"]').forEach(el=>{
    el.addEventListener('input', ()=>{
      const g = state.data.goals.find(x=>x.id===el.dataset.id);
      if(!g) return;
      g.current = clamp(+el.value, 0, g.target);
      g.done = g.current >= g.target;
      saveData();
      renderPage();
    });
  });

  // Settings: display name + dark mode switch
  const saveNameBtn = page.querySelector('[data-action="save-display-name"]');
  if(saveNameBtn){
    saveNameBtn.addEventListener('click', ()=>{
      const val = document.getElementById('displayNameInput').value.trim();
      if(!val) return;
      state.data.displayName = val;
      saveData();
      showToast("Display name updated.");
      renderShellChrome();
    });
  }
  const darkSwitch = document.getElementById('darkModeSwitch');
  if(darkSwitch) darkSwitch.addEventListener('click', toggleDarkMode);

  // Dashboard clock
  if(state.route === 'dashboard') startDashboardClock();
  else if(clockTimerId){ clearInterval(clockTimerId); clockTimerId = null; }

  // Pomodoro: sync visual state after render (in case timer was running)
  if(state.route === 'pomodoro') pomoUpdateDisplay();
}

function preserveFocus(id){
  const el = document.getElementById(id);
  if(el){ el.focus(); const v = el.value; el.value=''; el.value=v; }
}

function handlePageClick(e){
  const btn = e.target.closest('[data-action]');
  if(!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  switch(action){
    case 'go-planner': navigate('planner'); break;

    /* ---- Sessions ---- */
    case 'open-session-modal': openSessionModal(null); break;
    case 'edit-session': openSessionModal(id); break;
    case 'delete-session':
      openConfirm("Delete session?", "This study session will be permanently removed from your planner.", ()=>{
        state.data.sessions = state.data.sessions.filter(s=>s.id!==id);
        saveData(); showToast("Session deleted.", "warning"); renderPage();
      });
      break;
    case 'duplicate-session': {
      const s = state.data.sessions.find(x=>x.id===id);
      if(s) state.data.sessions.push({ ...s, id: uid(), topic: s.topic+" (copy)" });
      saveData(); showToast("Session duplicated."); renderPage();
      break;
    }
    case 'toggle-session-done': {
      const s = state.data.sessions.find(x=>x.id===id);
      if(s) s.done = !s.done;
      saveData(); renderPage();
      break;
    }

    /* ---- Subjects ---- */
    case 'open-subject-modal': openSubjectModal(null); break;
    case 'edit-subject': openSubjectModal(id); break;
    case 'delete-subject':
      openConfirm("Delete subject?", "All linked sessions will keep referencing this subject as 'Unknown'. This cannot be undone.", ()=>{
        state.data.subjects = state.data.subjects.filter(s=>s.id!==id);
        saveData(); showToast("Subject deleted.", "warning"); renderPage();
      });
      break;

    /* ---- Exams ---- */
    case 'open-exam-modal': openExamModal(null); break;
    case 'edit-exam': openExamModal(id); break;
    case 'delete-exam':
      openConfirm("Delete exam?", "This exam and its countdown will be permanently removed.", ()=>{
        state.data.exams = state.data.exams.filter(x=>x.id!==id);
        saveData(); showToast("Exam removed.", "warning"); renderPage();
      });
      break;

    /* ---- Goals ---- */
    case 'open-goal-modal': openGoalModal(); break;
    case 'toggle-goal-done': {
      const g = state.data.goals.find(x=>x.id===id);
      if(g){
        const wasDone = g.done;
        g.done = !g.done;
        if(g.done) g.current = g.target;
        saveData();
        if(!wasDone) showToast(`Goal completed: "${g.text}" 🎉`);
        renderPage();
      }
      break;
    }
    case 'goal-step': {
      const g = state.data.goals.find(x=>x.id===id);
      if(g){
        const dir = +btn.dataset.dir;
        g.current = clamp(g.current + dir, 0, g.target);
        g.done = g.current >= g.target;
        saveData(); renderPage();
      }
      break;
    }
    case 'delete-goal':
      openConfirm("Delete goal?", "This weekly goal will be permanently removed.", ()=>{
        state.data.goals = state.data.goals.filter(x=>x.id!==id);
        saveData(); showToast("Goal removed.", "warning"); renderPage();
      });
      break;

    /* ---- Notes ---- */
    case 'open-note-modal': openNoteModal(); break;
    case 'toggle-note-pin': {
      const n = state.data.notes.find(x=>x.id===id);
      if(n) n.pinned = !n.pinned;
      saveData(); renderPage();
      break;
    }
    case 'delete-note':
      openConfirm("Delete note?", "This note will be permanently deleted.", ()=>{
        state.data.notes = state.data.notes.filter(x=>x.id!==id);
        saveData(); showToast("Note deleted.", "warning"); renderPage();
      });
      break;

    /* ---- Pomodoro ---- */
    case 'pomo-switch-mode': pomoSwitchMode(btn.dataset.mode); break;
    case 'pomo-toggle': pomoToggle(); break;
    case 'pomo-reset': pomoReset(); break;

    /* ---- Calendar ---- */
    case 'cal-prev-month': {
      const c = state.calendar.cursor;
      state.calendar.cursor = new Date(c.getFullYear(), c.getMonth()-1, 1);
      renderPage();
      break;
    }
    case 'cal-next-month': {
      const c = state.calendar.cursor;
      state.calendar.cursor = new Date(c.getFullYear(), c.getMonth()+1, 1);
      renderPage();
      break;
    }
    case 'cal-today': {
      const t = new Date();
      state.calendar.cursor = new Date(t.getFullYear(), t.getMonth(), 1);
      state.calendar.selected = todayISO();
      renderPage();
      break;
    }
    case 'select-cal-day':
      state.calendar.selected = btn.dataset.date;
      renderPage();
      break;

    /* ---- Settings ---- */
    case 'open-reset-confirm':
      openConfirm("Reset all data?", "This will erase everything and restore default sample data. This action is permanent.", ()=>{
        localStorage.removeItem(LS_KEY);
        state.data = seedData();
        localStorage.setItem(LS_KEY, JSON.stringify(state.data));
        showToast("All data has been reset.", "warning");
        renderShellChrome();
        renderPage();
      });
      break;
  }
}

/* =========================================================
   DARK MODE
========================================================= */
function toggleDarkMode(){
  state.dark = !state.dark;
  document.documentElement.classList.toggle('dark', state.dark);
  localStorage.setItem(LS_THEME, state.dark ? 'dark' : 'light');
  renderShellChrome();
  if(state.route === 'settings') renderPage();
}

/* =========================================================
   APP INITIALIZATION
========================================================= */
function initApp(){
  // Apply persisted theme immediately
  document.documentElement.classList.toggle('dark', state.dark);

  // Sidebar nav links
  document.querySelectorAll('.nav-link').forEach(btn=>{
    btn.addEventListener('click', ()=> navigate(btn.dataset.route));
  });

  // Mobile menu open/close
  document.getElementById('menuBtn').addEventListener('click', ()=>{
    state.sidebarOpen = true;
    renderShellChrome();
  });
  document.getElementById('sidebarOverlay').addEventListener('click', ()=>{
    state.sidebarOpen = false;
    renderShellChrome();
  });

  // Theme toggle button
  document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);

  // Close sidebar on resize to desktop width
  window.addEventListener('resize', ()=>{
    if(window.innerWidth > 860 && state.sidebarOpen){
      state.sidebarOpen = false;
      renderShellChrome();
    }
  });

  // Initial render
  renderShellChrome();
  renderPage();
}

document.addEventListener('DOMContentLoaded', initApp);
