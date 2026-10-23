'use strict';
/* HusoFit : appli perso de coaching (entraînement, nutrition, suivi). Tout est stocké sur le téléphone. */

// ---------- Outils ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const pad = (n) => String(n).padStart(2, '0');
const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return dkey(d); };
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.').replace(/\s/g, '')); return Number.isFinite(n) ? n : NaN; };
const nf = (n, d = 0) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: d });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const e1rm = (kg, reps) => (kg > 0 && reps > 0 ? (reps === 1 ? kg : kg * (1 + reps / 30)) : 0);
const fmtDay = (k, o = { weekday: 'long', day: 'numeric', month: 'long' }) => parseKey(k).toLocaleDateString('fr-FR', o);
const fmtShort = (k) => fmtDay(k, { weekday: 'short', day: 'numeric', month: 'short' });
const fmtClock = (sec) => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`; };
const fmtRest = (s) => (s >= 60 ? `${Math.floor(s / 60)} min${s % 60 ? ' ' + pad(s % 60) : ''}` : `${s} s`);
const fmtDur = (sec) => { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${pad(m % 60)}` : `${m} min`; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/></svg>',
  train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/></svg>',
  food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5c-1.6-1.3-5.2-1.6-6.6 1-1.5 2.7-.6 7 1.1 9.8 1.6 2.6 3.4 2.9 5.5 1.9 2.1 1 3.9.7 5.5-1.9 1.7-2.8 2.6-7.1 1.1-9.8-1.4-2.6-5-2.3-6.6-1z"/><path d="M12 7.5c0-2 1-3.5 3-4.5"/></svg>',
  progress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="M5 15.5l4.5-4.5 3.5 3 6-7"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  down: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  plates: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12h20"/><rect x="5" y="5" width="3" height="14" rx="1"/><rect x="16" y="5" width="3" height="14" rx="1"/><rect x="8.5" y="8" width="2" height="8" rx="1"/><rect x="13.5" y="8" width="2" height="8" rx="1"/></svg>',
  left: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  up: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

// ---------- Stockage (IndexedDB, repli sur localStorage) ----------
const Store = {
  db: null,
  open() {
    return new Promise((res) => {
      try {
        const r = indexedDB.open('husofit', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('kv');
        r.onsuccess = () => { this.db = r.result; res(); };
        r.onerror = () => res();
        r.onblocked = () => res();
      } catch (e) { res(); }
    });
  },
  get(k) {
    if (!this.db) { try { const v = localStorage.getItem('hf:' + k); return Promise.resolve(v ? JSON.parse(v) : undefined); } catch (e) { return Promise.resolve(undefined); } }
    return new Promise((res) => {
      try { const q = this.db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); } catch (e) { res(undefined); }
    });
  },
  set(k, v) {
    if (!this.db) { try { localStorage.setItem('hf:' + k, JSON.stringify(v)); } catch (e) { toast('Mémoire pleine : exporte une sauvegarde.'); } return Promise.resolve(); }
    return new Promise((res) => {
      try { const tx = this.db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => res(); } catch (e) { res(); }
    });
  },
  del(k) {
    if (!this.db) { try { localStorage.removeItem('hf:' + k); } catch (e) { /* rien */ } return Promise.resolve(); }
    return new Promise((res) => {
      try { const tx = this.db.transaction('kv', 'readwrite'); tx.objectStore('kv').delete(k); tx.oncomplete = () => res(); tx.onerror = () => res(); } catch (e) { res(); }
    });
  },
};

// ---------- État ----------
function defaultState() {
  return {
    v: 1,
    profile: { name: '', sex: 'h', age: 25, height: 178, weight: 75, activity: 1.55, goal: 'maintien', onboarded: false },
    targets: { kcal: 2600, p: 150, c: 320, f: 75, water: 2500, steps: 10000 },
    settings: { rest: 90, theme: 'auto', bar: 20 },
    programs: seedPrograms(),
    activeProgramId: 'ppl',
    customExercises: [],
    customFoods: [],
    recentFoods: [],
    sessions: [],
    live: null,
    days: {},
    weights: [],
    measures: [],
    photos: [],
    checkins: [],
    habits: SEED_HABITS.map((h) => ({ ...h })),
  };
}

let S = defaultState();
const ui = {
  tab: 'home', trainSeg: 'program', progSeg: 'weight', foodDate: dkey(), exMuscle: 'Tous', exQuery: '',
  weightRange: 90, measureSel: 'waist', liveOpen: true, cmpA: null, cmpB: null,
};

let saveTimer = null;
function save(now = false) {
  clearTimeout(saveTimer);
  if (now) return Store.set('state', S);
  saveTimer = setTimeout(() => Store.set('state', S), 250);
}

function day(k) {
  if (!S.days[k]) S.days[k] = { meals: { b: [], l: [], s: [], d: [] }, water: 0, steps: 0, habits: {} };
  const d = S.days[k];
  d.meals = d.meals || { b: [], l: [], s: [], d: [] };
  MEALS.forEach((m) => { d.meals[m.id] = d.meals[m.id] || []; });
  d.habits = d.habits || {};
  return d;
}
const peekDay = (k) => S.days[k] || null;

const allExercises = () => EXERCISES.concat(S.customExercises);
const exById = (id) => allExercises().find((e) => e.id === id) || { id, name: 'Exercice supprimé', muscle: '', equip: '' };
const allFoods = () => S.customFoods.concat(FOODS);
const foodById = (id) => allFoods().find((f) => f.id === id);
const activeProgram = () => S.programs.find((p) => p.id === S.activeProgramId) || S.programs[0] || null;

function dayTotals(d) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  if (!d) return t;
  MEALS.forEach((m) => (d.meals[m.id] || []).forEach((e) => { t.kcal += e.kcal; t.p += e.p; t.c += e.c; t.f += e.f; }));
  return t;
}

function sessionsSorted() { return S.sessions.slice().sort((a, b) => b.startedAt - a.startedAt); }

function lastSetsFor(exId) {
  for (const s of sessionsSorted()) {
    const e = s.exercises.find((x) => x.exId === exId);
    if (e && e.sets.length) return e.sets;
  }
  return null;
}

function exerciseHistory(exId) {
  return S.sessions.slice().sort((a, b) => a.startedAt - b.startedAt).flatMap((s) => {
    const e = s.exercises.find((x) => x.exId === exId);
    if (!e || !e.sets.length) return [];
    let best = 0, bestSet = null;
    e.sets.forEach((st) => { const v = e1rm(st.kg, st.reps); if (v > best) { best = v; bestSet = st; } });
    return [{ date: s.date, startedAt: s.startedAt, sets: e.sets, best, bestSet, sessionId: s.id }];
  });
}

function sessionVolume(s) { return s.exercises.reduce((a, e) => a + e.sets.reduce((b, st) => b + (st.kg || 0) * (st.reps || 0), 0), 0); }
function sessionSets(s) { return s.exercises.reduce((a, e) => a + e.sets.length, 0); }

function nextWorkout() {
  const prog = activeProgram();
  if (!prog || !prog.days.length) return null;
  const last = sessionsSorted().find((s) => s.programId === prog.id);
  let idx = 0;
  if (last) { const i = prog.days.findIndex((d) => d.id === last.dayId); idx = i < 0 ? 0 : (i + 1) % prog.days.length; }
  return { prog, day: prog.days[idx] };
}

function weightsSorted() { return S.weights.slice().sort((a, b) => (a.date < b.date ? -1 : 1)); }

function calcTargets(p) {
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'f' ? -161 : 5);
  const tdee = bmr * p.activity;
  const adj = { seche: 0.8, maintien: 1, prise: 1.1 }[p.goal] || 1;
  const kcal = Math.round((tdee * adj) / 10) * 10;
  const prot = Math.round(p.weight * (p.goal === 'seche' ? 2.2 : 2));
  const fat = Math.round(p.weight * 0.9);
  const carbs = Math.max(0, Math.round((kcal - prot * 4 - fat * 9) / 4));
  return { kcal, p: prot, c: carbs, f: fat, bmr: Math.round(bmr), tdee: Math.round(tdee) };
}

// ---------- Petits composants ----------
function toast(msg) {
  $$('.toast').forEach((t) => t.remove());
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

function ring(val, target) {
  const r = 52, C = 2 * Math.PI * r, pct = clamp(target ? val / target : 0, 0, 1);
  const col = val > target * 1.05 ? 'var(--red)' : 'var(--accent)';
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="11"/>${pct > 0 ? `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct)).toFixed(1)}"/>` : ''}</svg>`;
}

function macroBars(t, T) {
  return [['p', 'Protéines'], ['c', 'Glucides'], ['f', 'Lipides']].map(([k, n]) => {
    const pct = clamp(T[k] ? (t[k] / T[k]) * 100 : 0, 0, 100);
    return `<div class="macro"><div class="mh"><span class="row" style="gap:6px"><i class="dot ${k}"></i>${n}</span><span class="num"><b>${nf(t[k])}</b> / ${nf(T[k])} g</span></div><div class="bar ${k}"><i style="width:${pct}%"></i></div></div>`;
  }).join('');
}

function kcalBlock(t, T) {
  const left = T.kcal - t.kcal;
  return `<div class="kcal"><div class="ring">${ring(t.kcal, T.kcal)}<div class="lbl"><span class="big num">${nf(Math.abs(left))}</span><span class="small muted">${left >= 0 ? 'kcal restantes' : 'kcal en trop'}</span></div></div><div class="macros">${macroBars(t, T)}<div class="small muted num">${nf(t.kcal)} / ${nf(T.kcal)} kcal</div></div></div>`;
}

function niceStep(range, n) {
  const raw = range / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const r = raw / mag;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
}

// pts : [{x: ms, y}], avg : courbe lissée facultative
function lineChart(pts, { avg = null, unit = '' } = {}) {
  if (pts.length < 2) return '<div class="empty">Ajoute au moins deux valeurs pour voir la courbe.</div>';
  const W = 340, H = 170, L = 38, R = 14, T = 12, B = 24;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y).concat(avg ? avg.map((p) => p.y) : []);
  const x0 = Math.min(...xs); let x1 = Math.max(...xs); if (x1 === x0) x1 = x0 + 1;
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (y1 - y0 < 1e-9) { y0 -= 1; y1 += 1; }
  const step = niceStep(y1 - y0, 3);
  y0 = Math.floor(y0 / step) * step; y1 = Math.ceil(y1 / step) * step;
  const sx = (x) => L + ((x - x0) / (x1 - x0)) * (W - L - R);
  const sy = (y) => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
  const dec = step < 1 ? 1 : 0;
  let g = '';
  for (let v = y0; v <= y1 + step / 2; v += step) {
    g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${sy(v).toFixed(1)}" y2="${sy(v).toFixed(1)}"/><text class="axis" x="${L - 6}" y="${(sy(v) + 3.5).toFixed(1)}" text-anchor="end">${nf(v, dec)}</text>`;
  }
  const dl = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  g += `<text class="axis" x="${L}" y="${H - 6}" text-anchor="start">${dl(x0)}</text><text class="axis" x="${W - R}" y="${H - 6}" text-anchor="end">${dl(x1)}</text>`;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('');
  const area = `${line}L${sx(pts[pts.length - 1].x).toFixed(1)},${sy(y0).toFixed(1)}L${sx(pts[0].x).toFixed(1)},${sy(y0).toFixed(1)}Z`;
  const avgLine = avg && avg.length > 1 ? `<path class="avg" d="${avg.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('')}"/>` : '';
  const dots = pts.length <= 40 ? pts.slice(0, -1).map((p) => `<circle class="pt" cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="2.5"/>`).join('') : '';
  const lp = pts[pts.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe, dernière valeur ${nf(lp.y, 1)} ${unit}">${g}<path class="ar" d="${area}"/>${avgLine}<path class="ln" d="${line}"/>${dots}<circle class="end" cx="${sx(lp.x).toFixed(1)}" cy="${sy(lp.y).toFixed(1)}" r="5"/></svg>`;
}

function delta(v, unit, dec = 1) {
  if (!Number.isFinite(v)) return '';
  const cls = Math.abs(v) < 0.05 ? 'neutral' : v > 0 ? 'up' : 'down';
  return `<span class="delta ${cls}">${v > 0 ? '▲ +' : v < 0 ? '▼ −' : ''}${nf(Math.abs(v), dec)} ${unit}</span>`;
}

// ---------- Fenêtres (sheets) ----------
const sheets = [];
const topSheet = () => sheets[sheets.length - 1];
function openSheet(ctrl) {
  const w = document.createElement('div');
  w.className = 'sheet-wrap';
  w.addEventListener('click', (e) => { if (e.target === w) closeSheet(); });
  ctrl.el = w; sheets.push(ctrl);
  $('#sheets').appendChild(w);
  paintSheet(ctrl);
  return ctrl;
}
function paintSheet(ctrl = topSheet()) {
  if (!ctrl) return;
  const sc = ctrl.el.querySelector('.sheet')?.scrollTop || 0;
  ctrl.el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${ctrl.render()}</div>`;
  ctrl.el.querySelector('.sheet').scrollTop = sc;
  ctrl.after && ctrl.after(ctrl.el);
}
function closeSheet() { const c = sheets.pop(); if (c) { c.el.remove(); c.onClose && c.onClose(); } }
function closeAllSheets() { while (sheets.length) closeSheet(); }
const sheetHead = (title, sub = '') => `<div class="sheet-head"><div class="grow"><h2>${title}</h2>${sub ? `<div class="small muted">${sub}</div>` : ''}</div><button class="icon-btn" data-a="closeSheet" aria-label="Fermer">${ICON.x}</button></div>`;

function confirmSheet({ title, text = '', ok = 'Supprimer', onOk }) {
  openSheet({
    onOk,
    render: () => `${sheetHead(title)}${text ? `<p class="muted" style="margin:0">${text}</p>` : ''}<div class="grid2"><button class="btn" data-a="closeSheet">Annuler</button><button class="btn primary" data-a="confirmOk" style="background:var(--red);color:#fff">${ok}</button></div>`,
  });
}

// ---------- Vues ----------
const views = {};

views.home = () => {
  const k = dkey(), d = peekDay(k), t = dayTotals(d), T = S.targets;
  const hour = new Date().getHours();
  const hello = hour < 5 ? 'Bonne nuit' : hour < 18 ? 'Salut' : 'Bonsoir';
  const name = S.profile.name ? ` ${esc(S.profile.name)}` : '';
  const doneToday = S.sessions.filter((s) => s.date === k);
  const nx = nextWorkout();

  // semaine du lundi au dimanche
  const now = new Date(); const dow = (now.getDay() + 6) % 7;
  const monday = addDays(k, -dow);
  const sessionDays = new Set(S.sessions.map((s) => s.date));
  let doneWeek = 0;
  const week = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l, i) => {
    const dk = addDays(monday, i), done = sessionDays.has(dk);
    if (done) doneWeek++;
    return `<div class="d ${done ? 'done' : ''} ${dk === k ? 'today' : ''}">${l}<i>${done ? ICON.check.replace('<svg', '<svg width="14" height="14"') : parseKey(dk).getDate()}</i></div>`;
  }).join('');

  let workout;
  if (S.live) {
    workout = `<div class="card" id="liveBanner"><div class="card-head"><div class="grow"><div class="eyebrow">Séance en cours</div><h2>${esc(S.live.name)}</h2></div><span class="clock">${fmtClock((Date.now() - S.live.startedAt) / 1000)}</span></div><button class="btn primary block" data-a="liveOpen">Reprendre la séance</button></div>`;
  } else if (nx) {
    const exs = nx.day.exercises;
    workout = `<div class="card"><div class="card-head"><div class="grow"><div class="eyebrow">${doneToday.length ? 'Fait aujourd’hui · prochaine séance' : 'Séance du jour'}</div><h2>${esc(nx.day.name)}</h2><div class="small muted">${esc(nx.prog.name)} · ${exs.length} exercice${exs.length > 1 ? 's' : ''}</div></div>${doneToday.length ? '<span class="pill acc">✓ Fait</span>' : ''}</div>
      <div class="list">${exs.slice(0, 5).map((e) => `<div class="item" style="padding:8px 0"><span class="grow">${esc(exById(e.exId).name)}</span><span class="s num">${e.sets} × ${esc(e.reps)}</span></div>`).join('')}${exs.length > 5 ? `<div class="small muted" style="padding-top:6px">+ ${exs.length - 5} autre${exs.length - 5 > 1 ? 's' : ''}</div>` : ''}</div>
      <div class="row"><button class="btn primary grow" data-a="startWorkout" data-p="${nx.prog.id}" data-d="${nx.day.id}">Démarrer</button><button class="btn" data-a="startFree">Séance libre</button></div></div>`;
  } else {
    workout = `<div class="card"><h2>Aucun programme</h2><p class="muted" style="margin:0">Crée un programme dans l’onglet Entraînement, ou lance une séance libre.</p><button class="btn primary" data-a="startFree">Séance libre</button></div>`;
  }

  const w = d ? d.water : 0;
  const glasses = Math.max(1, Math.round(T.water / 250));
  const waterBar = Array.from({ length: Math.min(glasses, 14) }, (_, i) => `<i class="${w >= (i + 1) * (T.water / Math.min(glasses, 14)) - 1 ? 'on' : ''}"></i>`).join('');

  const habits = S.habits.map((h) => {
    const on = !!(d && d.habits[h.id]);
    return `<button class="item" data-a="habit" data-id="${h.id}" data-k="${k}"><span class="check ${on ? 'on' : ''}">${on ? ICON.check : ''}</span><span class="grow t" style="font-weight:500">${esc(h.name)}</span><span class="s">${streak(h.id) ? `${streak(h.id)} j` : ''}</span></button>`;
  }).join('') || '<div class="empty">Ajoute des habitudes dans l’onglet Plus.</div>';

  const ws = weightsSorted();
  const wToday = ws.find((x) => x.date === k);
  const wLast = ws[ws.length - 1];

  return `
  <header class="top"><div><div class="eyebrow">${cap(fmtDay(k))}</div><h1>${hello}${name}</h1></div></header>
  ${workout}
  <div class="card"><div class="card-head"><h3>Cette semaine</h3><span class="small muted num">${doneWeek} séance${doneWeek > 1 ? 's' : ''}</span></div><div class="week">${week}</div></div>
  <button class="card" data-a="tab" data-t="food" style="border:0;text-align:left"><div class="card-head"><h3>Nutrition</h3><span class="link">Journal ›</span></div>${kcalBlock(t, T)}</button>
  <div class="card"><div class="card-head"><h3>Eau</h3><span class="num"><b>${nf(w / 1000, 2)}</b> / ${nf(T.water / 1000, 1)} L</span></div><div class="water">${waterBar}</div>
    <div class="row"><button class="btn sm grow" data-a="water" data-v="250" data-k="${k}">+ 25 cl</button><button class="btn sm grow" data-a="water" data-v="500" data-k="${k}">+ 50 cl</button><button class="btn sm" data-a="water" data-v="-250" data-k="${k}" aria-label="Retirer 25 cl">−</button></div></div>
  <div class="grid2">
    <form class="card" data-submit="weightQuick"><div class="label">Poids du jour</div>
      ${wToday ? `<div class="stat"><span class="v">${nf(wToday.kg, 1)}<small>kg</small></span></div><button type="button" class="link" data-a="tab" data-t="progress" style="text-align:left">Voir la courbe ›</button>`
        : `<input type="text" inputmode="decimal" name="kg" id="home-kg" placeholder="${wLast ? nf(wLast.kg, 1) : '75,0'}" aria-label="Poids en kg"><button class="btn sm primary" type="submit">Enregistrer</button>`}
    </form>
    <div class="card"><div class="label">Pas</div><input type="text" inputmode="numeric" id="home-steps" value="${d && d.steps ? d.steps : ''}" placeholder="0" data-change="steps" data-k="${k}" aria-label="Nombre de pas">
      <div class="bar"><i style="width:${clamp(((d && d.steps) || 0) / T.steps * 100, 0, 100)}%"></i></div><div class="small muted num">Objectif ${nf(T.steps)}</div></div>
  </div>
  <div class="card"><div class="card-head"><h3>Habitudes</h3><span class="small muted num">${S.habits.filter((h) => d && d.habits[h.id]).length} / ${S.habits.length}</span></div><div class="list">${habits}</div></div>`;
};

function streak(hid) {
  let k = dkey(), n = 0;
  if (!(S.days[k] && S.days[k].habits[hid])) k = addDays(k, -1);
  while (S.days[k] && S.days[k].habits[hid]) { n++; k = addDays(k, -1); }
  return n;
}

// --- Entraînement ---
views.train = () => {
  const seg = `<div class="segment" role="tablist">${[['program', 'Programme'], ['history', 'Historique'], ['exercises', 'Exercices']].map(([v, n]) => `<button class="${ui.trainSeg === v ? 'on' : ''}" data-a="trainSeg" data-v="${v}">${n}</button>`).join('')}</div>`;
  let body = '';
  if (ui.trainSeg === 'program') body = trainProgram();
  else if (ui.trainSeg === 'history') body = trainHistory();
  else body = trainExercises();
  return `<header class="top"><div><div class="eyebrow">Entraînement</div><h1>${ui.trainSeg === 'program' ? 'Mon programme' : ui.trainSeg === 'history' ? 'Historique' : 'Exercices'}</h1></div></header>${seg}${body}`;
};

function trainProgram() {
  const prog = activeProgram();
  const nx = nextWorkout();
  const sel = `<div class="card"><div class="field"><label for="prog-sel">Programme actif</label><select id="prog-sel" data-change="activeProgram">${S.programs.map((p) => `<option value="${p.id}" ${prog && p.id === prog.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
    <div class="row wrap"><button class="btn sm" data-a="progNew">Nouveau</button>${prog ? `<button class="btn sm" data-a="progRename">Renommer</button><button class="btn sm danger" data-a="progDelete">Supprimer</button>` : ''}</div></div>`;
  if (!prog) return sel + '<div class="card"><div class="empty">Crée ton premier programme.</div></div>';
  const days = prog.days.map((dy) => `<div class="card"><div class="card-head"><div class="grow"><h2>${esc(dy.name)}</h2><div class="small muted">${dy.exercises.length} exercice${dy.exercises.length > 1 ? 's' : ''}</div></div>${nx && nx.day.id === dy.id ? '<span class="pill acc">Prochaine</span>' : ''}</div>
    <div class="list">${dy.exercises.map((e) => `<div class="item" style="padding:8px 0"><span class="grow">${esc(exById(e.exId).name)}</span><span class="s num">${e.sets} × ${esc(e.reps)} · ${fmtRest(e.rest)}</span></div>`).join('') || '<div class="empty">Aucun exercice pour l’instant.</div>'}</div>
    <div class="row"><button class="btn primary grow" data-a="startWorkout" data-p="${prog.id}" data-d="${dy.id}">Démarrer</button><button class="btn" data-a="dayEdit" data-d="${dy.id}">Modifier</button></div></div>`).join('');
  return `${sel}${days}<button class="btn block" data-a="dayAdd">+ Ajouter une journée</button><button class="btn block ghost" data-a="startFree">Lancer une séance libre</button>`;
}

function trainHistory() {
  const ss = sessionsSorted();
  if (!ss.length) return '<div class="card"><div class="empty">Tes séances terminées apparaîtront ici, avec le volume et tes records.</div></div>';
  let html = '', month = '';
  ss.forEach((s) => {
    const m = cap(parseKey(s.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }));
    if (m !== month) { if (month) html += '</div></div>'; month = m; html += `<div class="card"><h3>${m}</h3><div class="list">`; }
    html += `<button class="item" data-a="sessionOpen" data-id="${s.id}"><div class="grow"><div class="t">${esc(s.name)}</div><div class="s num">${cap(fmtShort(s.date))} · ${fmtDur(s.duration)} · ${sessionSets(s)} séries · ${nf(sessionVolume(s))} kg</div></div>${s.prs && s.prs.length ? `<span class="pill pr">${s.prs.length} PR</span>` : ''}</button>`;
  });
  return html + '</div></div>';
}

function exListHtml() {
  const q = norm(ui.exQuery.trim());
  const list = allExercises().filter((e) => (ui.exMuscle === 'Tous' || e.muscle === ui.exMuscle) && (!q || norm(e.name).includes(q)));
  if (!list.length) return '<div class="empty">Aucun exercice trouvé.</div>';
  return list.map((e) => {
    const h = exerciseHistory(e.id);
    const best = h.length ? Math.max(...h.map((x) => x.best)) : 0;
    return `<button class="item" data-a="exOpen" data-id="${e.id}"><div class="grow"><div class="t">${esc(e.name)}</div><div class="s">${esc(e.muscle)} · ${esc(e.equip)}${e.custom ? ' · perso' : ''}</div></div>${best ? `<div class="end"><div class="num" style="font-weight:600">${nf(best, 1)} kg</div><div class="s">1RM estimé</div></div>` : ''}</button>`;
  }).join('');
}

function trainExercises() {
  return `<div class="card"><input type="search" id="ex-q" placeholder="Rechercher un exercice" value="${esc(ui.exQuery)}" data-in="exQuery" aria-label="Rechercher un exercice">
    <div class="chips">${['Tous'].concat(MUSCLES).map((m) => `<button class="chip ${ui.exMuscle === m ? 'on' : ''}" data-a="exMuscle" data-v="${m}">${m}</button>`).join('')}</div>
    <div class="list" id="exList">${exListHtml()}</div></div>
    <button class="btn block" data-a="exCreate">+ Créer un exercice</button>`;
}

// --- Nutrition ---
views.food = () => {
  const k = ui.foodDate, d = peekDay(k), t = dayTotals(d), T = S.targets;
  const today = dkey();
  const label = k === today ? 'Aujourd’hui' : k === addDays(today, -1) ? 'Hier' : cap(fmtShort(k));
  const meals = MEALS.map((m) => {
    const items = d ? d.meals[m.id] : [];
    const sum = items.reduce((a, e) => a + e.kcal, 0);
    return `<div class="card"><div class="card-head"><h3>${m.name}</h3><span class="small muted num">${nf(sum)} kcal</span></div>
      ${items.length ? `<div class="list">${items.map((e) => `<button class="item" data-a="entryOpen" data-m="${m.id}" data-id="${e.id}"><div class="grow"><div class="t" style="font-weight:500">${esc(e.name)}</div><div class="s num">${entryQty(e)}P ${nf(e.p)} · G ${nf(e.c)} · L ${nf(e.f)}</div></div><div class="end num">${nf(e.kcal)}</div></button>`).join('')}</div>` : ''}
      <button class="btn sm" data-a="foodAdd" data-m="${m.id}" style="align-self:flex-start">+ Ajouter</button></div>`;
  }).join('');
  const w = d ? d.water : 0;
  return `<header class="top"><div><div class="eyebrow">Nutrition</div><h1>Journal</h1></div></header>
    <div class="row"><button class="icon-btn" data-a="foodDay" data-v="-1" aria-label="Jour précédent">${ICON.left}</button><div class="grow" style="text-align:center;font-weight:600">${label}</div><button class="icon-btn" data-a="foodDay" data-v="1" aria-label="Jour suivant" ${k >= today ? 'disabled style="opacity:.35"' : ''}>${ICON.right}</button></div>
    <div class="card">${kcalBlock(t, T)}</div>
    ${meals}
    <div class="card"><div class="card-head"><h3>Eau</h3><span class="num"><b>${nf(w / 1000, 2)}</b> / ${nf(T.water / 1000, 1)} L</span></div>
      <div class="row"><button class="btn sm grow" data-a="water" data-v="250" data-k="${k}">+ 25 cl</button><button class="btn sm grow" data-a="water" data-v="500" data-k="${k}">+ 50 cl</button><button class="btn sm" data-a="water" data-v="-250" data-k="${k}" aria-label="Retirer 25 cl">−</button></div></div>
    <button class="btn block ghost" data-a="copyYesterday">Copier les repas de la veille</button>`;
};

function entryQty(e) {
  if (e.mode === 'u') { const f = foodById(e.foodId); return `${nf(e.qty, 2)} × ${esc(f ? f.unit : 'portion')} · `; }
  if (e.grams) return `${nf(e.grams)} g · `;
  return '';
}

// --- Progrès ---
views.progress = () => {
  const seg = `<div class="segment">${[['weight', 'Poids'], ['measures', 'Mesures'], ['photos', 'Photos'], ['checkins', 'Bilans']].map(([v, n]) => `<button class="${ui.progSeg === v ? 'on' : ''}" data-a="progSeg" data-v="${v}">${n}</button>`).join('')}</div>`;
  const body = { weight: progWeight, measures: progMeasures, photos: progPhotos, checkins: progCheckins }[ui.progSeg]();
  return `<header class="top"><div><div class="eyebrow">Progrès</div><h1>Mon suivi</h1></div></header>${seg}${body}`;
};

function movingAvg(ws, days = 7) {
  return ws.map((w) => {
    const from = addDays(w.date, -(days - 1));
    const win = ws.filter((x) => x.date >= from && x.date <= w.date);
    return { x: parseKey(w.date).getTime(), y: win.reduce((a, x) => a + x.kg, 0) / win.length };
  });
}

function progWeight() {
  const ws = weightsSorted(), last = ws[ws.length - 1];
  const k = dkey();
  let stats = '<div class="empty">Pèse-toi le matin à jeun, après être allé aux toilettes, pour des mesures comparables.</div>';
  if (last) {
    const avg = movingAvg(ws).pop().y;
    const ref = ws.filter((x) => x.date <= addDays(last.date, -28)).pop() || ws[0];
    stats = `<div class="grid3"><div class="stat"><span class="label">Actuel</span><span class="v">${nf(last.kg, 1)}<small>kg</small></span></div><div class="stat"><span class="label">Moy. 7 j</span><span class="v">${nf(avg, 1)}<small>kg</small></span></div><div class="stat"><span class="label">Sur 4 sem.</span><span class="v" style="font-size:22px;padding-top:4px">${ref !== last ? delta(last.kg - ref.kg, 'kg') : '<span class="small muted">—</span>'}</span></div></div>`;
  }
  const range = ui.weightRange;
  const shown = range ? ws.filter((w) => w.date >= addDays(k, -range)) : ws;
  const chart = lineChart(shown.map((w) => ({ x: parseKey(w.date).getTime(), y: w.kg })), { avg: movingAvg(ws).filter((p) => !range || p.x >= parseKey(addDays(k, -range)).getTime()), unit: 'kg' });
  const hist = ws.slice().reverse().slice(0, 60).map((w, i, arr) => {
    const prev = arr[i + 1];
    return `<div class="item"><div class="grow"><div class="t num">${nf(w.kg, 1)} kg</div><div class="s">${cap(fmtShort(w.date))}</div></div>${prev ? delta(w.kg - prev.kg, 'kg') : ''}<button class="icon-btn plain" data-a="weightDel" data-id="${w.id}" aria-label="Supprimer">${ICON.x}</button></div>`;
  }).join('');
  return `<div class="card">${stats}<form class="row" data-submit="weightAdd"><input type="text" inputmode="decimal" name="kg" id="w-kg" placeholder="Poids (kg)" aria-label="Poids en kg"><input type="date" name="date" id="w-date" value="${k}" max="${k}" aria-label="Date" style="max-width:150px"><button class="btn primary" type="submit">OK</button></form></div>
    <div class="card"><div class="card-head"><h3>Courbe</h3><div class="chips">${[[30, '1 M'], [90, '3 M'], [180, '6 M'], [0, 'Tout']].map(([v, n]) => `<button class="chip ${range === v ? 'on' : ''}" data-a="weightRange" data-v="${v}">${n}</button>`).join('')}</div></div>${chart}<div class="small muted">Pointillés : moyenne sur 7 jours, plus fiable que la pesée du jour.</div></div>
    ${hist ? `<div class="card"><h3>Historique</h3><div class="list">${hist}</div></div>` : ''}`;
}

function progMeasures() {
  const ms = S.measures.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const cards = MEASURES.map((m) => {
    const vals = ms.filter((x) => Number.isFinite(x[m.id]));
    const last = vals[vals.length - 1], first = vals[0];
    return `<button class="card" data-a="measureSel" data-v="${m.id}" style="border:${ui.measureSel === m.id ? '2px solid var(--accent)' : '2px solid transparent'};text-align:left;gap:4px;padding:12px"><span class="label">${m.name}</span><span class="stat"><span class="v" style="font-size:24px">${last ? nf(last[m.id], 1) : '—'}<small>cm</small></span></span>${last && first !== last ? delta(last[m.id] - first[m.id], 'cm') : '<span class="small muted">&nbsp;</span>'}</button>`;
  }).join('');
  const sel = MEASURES.find((m) => m.id === ui.measureSel) || MEASURES[0];
  const pts = ms.filter((x) => Number.isFinite(x[sel.id])).map((x) => ({ x: parseKey(x.date).getTime(), y: x[sel.id] }));
  const hist = ms.slice().reverse().map((x) => `<div class="item"><div class="grow"><div class="t">${cap(fmtShort(x.date))}</div><div class="s num">${MEASURES.filter((m) => Number.isFinite(x[m.id])).map((m) => `${m.name.replace('Tour de taille', 'Taille')} ${nf(x[m.id], 1)}`).join(' · ')}</div></div><button class="icon-btn plain" data-a="measureDel" data-id="${x.id}" aria-label="Supprimer">${ICON.x}</button></div>`).join('');
  return `<button class="btn primary block" data-a="measureNew">+ Nouvelles mensurations</button>
    <div class="grid2">${cards}</div>
    <div class="card"><h3>${sel.name}</h3>${lineChart(pts, { unit: 'cm' })}</div>
    ${hist ? `<div class="card"><h3>Historique</h3><div class="list">${hist}</div></div>` : ''}`;
}

const photoCache = new Map();
async function photoSrc(id) {
  if (photoCache.has(id)) return photoCache.get(id);
  const v = await Store.get('photo:' + id);
  if (v) photoCache.set(id, v);
  return v;
}
function hydratePhotos(root = document) {
  $$('img[data-photo]', root).forEach(async (img) => { const s = await photoSrc(img.dataset.photo); if (s) img.src = s; });
}

function progPhotos() {
  const ps = S.photos.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.t - a.t));
  const add = ['Face', 'Profil', 'Dos'].map((p) => `<label class="btn sm grow" style="position:relative">${p}<input class="vh" type="file" accept="image/*" data-change="photoAdd" data-pose="${p}"></label>`).join('');
  const grid = ps.length ? `<div class="photos">${ps.map((p) => `<button data-a="photoOpen" data-id="${p.id}"><img data-photo="${p.id}" alt="Photo ${esc(p.pose)} du ${fmtShort(p.date)}"><span class="cap">${cap(fmtShort(p.date))} · ${esc(p.pose)}</span></button>`).join('')}</div>` : '<div class="empty">Prends tes photos toujours au même endroit, même lumière, même heure : la comparaison sera parlante.</div>';
  let cmp = '';
  if (ps.length >= 2) {
    const a = ui.cmpA && ps.find((p) => p.id === ui.cmpA) ? ui.cmpA : ps[ps.length - 1].id;
    const b = ui.cmpB && ps.find((p) => p.id === ui.cmpB) ? ui.cmpB : ps[0].id;
    const opts = (cur) => ps.map((p) => `<option value="${p.id}" ${p.id === cur ? 'selected' : ''}>${fmtShort(p.date)} · ${esc(p.pose)}</option>`).join('');
    cmp = `<div class="card"><h3>Avant / après</h3><div class="compare"><select id="cmp-a" data-change="cmpA" aria-label="Photo avant">${opts(a)}</select><select id="cmp-b" data-change="cmpB" aria-label="Photo après">${opts(b)}</select><img data-photo="${a}" alt="Avant"><img data-photo="${b}" alt="Après"></div></div>`;
  }
  return `<div class="card"><div class="label">Ajouter une photo</div><div class="row">${add}</div><div class="small muted">Les photos restent uniquement sur ton iPhone.</div></div>${cmp}<div class="card"><h3>Galerie</h3>${grid}</div>`;
}

function weekSummary(endKey = dkey()) {
  const from = addDays(endKey, -6);
  const sess = S.sessions.filter((s) => s.date >= from && s.date <= endKey);
  const dayKs = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  const kcals = dayKs.map((k) => dayTotals(peekDay(k)).kcal).filter((v) => v > 0);
  const ws = S.weights.filter((w) => w.date >= from && w.date <= endKey);
  const prevWs = S.weights.filter((w) => w.date >= addDays(from, -7) && w.date < from);
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
  const wAvg = avg(ws.map((w) => w.kg)), wPrev = avg(prevWs.map((w) => w.kg));
  return { sessions: sess.length, kcal: avg(kcals), kcalDays: kcals.length, weight: wAvg, weightDelta: wAvg - wPrev };
}

function progCheckins() {
  const cs = S.checkins.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const ws = weekSummary();
  const last = cs[0];
  const due = !last || daysBetween(last.date, dkey()) >= 7;
  const list = cs.map((c) => `<button class="item" data-a="checkinOpen" data-id="${c.id}"><div class="grow"><div class="t">Bilan du ${fmtShort(c.date)}</div><div class="s num">${CHECKIN_SCALES.map((s) => `${s.name} ${c[s.id]}/5`).join(' · ')}</div></div></button>`).join('');
  return `<div class="card"><div class="card-head"><div class="grow"><div class="eyebrow">${due ? 'À faire' : `Prochain bilan dans ${7 - daysBetween(last.date, dkey())} j`}</div><h2>Bilan hebdomadaire</h2></div></div>
    <div class="grid3"><div class="stat"><span class="label">Séances</span><span class="v">${ws.sessions}</span></div><div class="stat"><span class="label">Moy. kcal</span><span class="v">${Number.isFinite(ws.kcal) ? nf(ws.kcal) : '—'}</span></div><div class="stat"><span class="label">Poids moy.</span><span class="v">${Number.isFinite(ws.weight) ? nf(ws.weight, 1) : '—'}</span></div></div>
    <button class="btn ${due ? 'primary' : ''} block" data-a="checkinNew">Faire mon bilan</button></div>
    <div class="card"><h3>Bilans précédents</h3>${list ? `<div class="list">${list}</div>` : '<div class="empty">Chaque semaine, note ton sommeil, ton énergie et ce qui a marché. C’est ce qui permet d’ajuster le plan.</div>'}</div>`;
}

// --- Plus ---
views.more = () => {
  const T = S.targets;
  const habits = S.habits.map((h) => `<div class="item"><span class="grow">${esc(h.name)}</span><span class="s">${streak(h.id) ? `série ${streak(h.id)} j` : ''}</span><button class="icon-btn plain" data-a="habitDel" data-id="${h.id}" aria-label="Supprimer ${esc(h.name)}">${ICON.x}</button></div>`).join('');
  const tf = (k, label, unit) => `<div class="field"><label for="t-${k}">${label}</label><div class="row" style="gap:6px"><input type="text" inputmode="numeric" id="t-${k}" value="${T[k]}" data-change="target" data-k="${k}"><span class="small muted">${unit}</span></div></div>`;
  const th = S.settings.theme;
  return `<header class="top"><div><div class="eyebrow">Réglages</div><h1>${S.profile.name ? esc(S.profile.name) : 'Mon profil'}</h1></div></header>
    <div class="card"><div class="card-head"><h3>Objectifs quotidiens</h3><button class="link" data-a="calcOpen">Calculer</button></div>
      <div class="grid2">${tf('kcal', 'Calories', 'kcal')}${tf('p', 'Protéines', 'g')}${tf('c', 'Glucides', 'g')}${tf('f', 'Lipides', 'g')}${tf('water', 'Eau', 'ml')}${tf('steps', 'Pas', 'pas')}</div>
      <div class="small muted">Le calcul utilise la formule de Mifflin-St Jeor avec ton niveau d’activité.</div></div>
    <div class="card"><h3>Habitudes</h3><div class="list">${habits || '<div class="empty">Aucune habitude.</div>'}</div>
      <form class="row" data-submit="habitAdd"><input type="text" name="name" id="habit-new" placeholder="Nouvelle habitude" aria-label="Nouvelle habitude"><button class="btn primary" type="submit">Ajouter</button></form></div>
    <div class="card"><h3>Séance</h3><div class="grid2">
      <div class="field"><label for="s-rest">Repos par défaut</label><select id="s-rest" data-change="setting" data-k="rest">${[45, 60, 90, 120, 150, 180, 240].map((v) => `<option value="${v}" ${S.settings.rest === v ? 'selected' : ''}>${fmtRest(v)}</option>`).join('')}</select></div>
      <div class="field"><label for="s-bar">Barre</label><select id="s-bar" data-change="setting" data-k="bar">${[20, 15, 10].map((v) => `<option value="${v}" ${S.settings.bar === v ? 'selected' : ''}>${v} kg</option>`).join('')}</select></div></div></div>
    <div class="card"><h3>Apparence</h3><div class="segment">${[['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']].map(([v, n]) => `<button class="${th === v ? 'on' : ''}" data-a="theme" data-v="${v}">${n}</button>`).join('')}</div></div>
    <div class="card"><h3>Sauvegarde</h3><p class="small muted" style="margin:0">Tes données sont enregistrées uniquement sur cet iPhone. Exporte une sauvegarde de temps en temps (dans Fichiers ou iCloud Drive).</p>
      <div class="grid2"><button class="btn" data-a="exportData">Exporter</button><label class="btn" style="position:relative">Importer<input class="vh" type="file" accept="application/json,.json" data-change="importData"></label></div>
      <div class="small muted num">${S.sessions.length} séances · ${S.weights.length} pesées · ${S.photos.length} photos · ${Object.keys(S.days).length} jours de journal</div></div>
    <div class="card"><h3>Installer sur l’iPhone</h3><p class="small muted" style="margin:0">Dans Safari, touche le bouton Partager, puis « Sur l’écran d’accueil ». HusoFit s’ouvrira en plein écran comme une vraie appli et fonctionnera hors connexion.</p></div>
    <button class="btn danger block" data-a="profileEdit">Modifier mon profil</button>
    <button class="btn danger block" data-a="wipe">Effacer toutes les données</button>
    <div class="small muted" style="text-align:center">HusoFit · version 1.0</div>`;
};

// ---------- Rendu principal ----------
function render() {
  const main = $('#main');
  main.innerHTML = views[ui.tab]();
  $$('.tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.t === ui.tab));
  hydratePhotos(main);
  renderLive();
}

// ---------- Séance en cours ----------
function mkLiveEx(exId, tpl) {
  const prev = lastSetsFor(exId);
  const n = (tpl && tpl.sets) || (prev && prev.length) || 3;
  return { exId, target: tpl ? `${tpl.sets} × ${tpl.reps}` : '', rest: (tpl && tpl.rest) || S.settings.rest, sets: Array.from({ length: n }, () => ({ kg: '', reps: '', done: false })) };
}

function startWorkout(progId, dayId) {
  if (S.live) { ui.liveOpen = true; render(); toast('Une séance est déjà en cours.'); return; }
  const prog = S.programs.find((p) => p.id === progId);
  const dy = prog && prog.days.find((d) => d.id === dayId);
  S.live = {
    id: uid(), startedAt: Date.now(), name: dy ? dy.name : 'Séance libre',
    programId: prog ? prog.id : null, dayId: dy ? dy.id : null,
    exercises: dy ? dy.exercises.map((e) => mkLiveEx(e.exId, e)) : [], restEnd: null, restTotal: 0,
  };
  ui.liveOpen = true;
  save(); render(); wakeLock();
}

let wl = null;
async function wakeLock() { try { if ('wakeLock' in navigator && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } catch (e) { wl = null; } }

function liveExCard(e, i) {
  const ex = exById(e.exId);
  const prev = lastSetsFor(e.exId) || [];
  const rows = e.sets.map((s, j) => {
    const p = prev[j];
    const phKg = p ? nf(p.kg, 2) : j > 0 && e.sets[j - 1].kg !== '' ? e.sets[j - 1].kg : '';
    const phR = p ? p.reps : j > 0 && e.sets[j - 1].reps !== '' ? e.sets[j - 1].reps : '';
    return `<div class="row-wrap ${s.done ? 'done' : ''}"><div class="n">${j + 1}</div><div class="prev num">${p ? `${nf(p.kg, 2)}×${p.reps}` : '—'}</div>
      <input type="text" inputmode="decimal" id="ls-${i}-${j}-kg" value="${esc(s.kg)}" placeholder="${esc(phKg)}" data-in="liveSet" data-e="${i}" data-s="${j}" data-f="kg" aria-label="Charge série ${j + 1}">
      <input type="text" inputmode="numeric" id="ls-${i}-${j}-reps" value="${esc(s.reps)}" placeholder="${esc(phR)}" data-in="liveSet" data-e="${i}" data-s="${j}" data-f="reps" aria-label="Répétitions série ${j + 1}">
      <button class="check ${s.done ? 'on' : ''}" data-a="liveToggle" data-e="${i}" data-s="${j}" aria-label="Valider la série ${j + 1}">${s.done ? ICON.check : ''}</button></div>`;
  }).join('');
  return `<div class="card"><div class="card-head"><div class="grow"><h3>${esc(ex.name)}</h3><div class="small muted">${e.target ? esc(e.target) + ' · ' : ''}repos ${fmtRest(e.rest)}</div></div>
      <button class="icon-btn plain" data-a="platesLive" data-e="${i}" aria-label="Calculer les disques">${ICON.plates}</button>
      <button class="icon-btn plain" data-a="liveRemoveEx" data-e="${i}" aria-label="Retirer l’exercice">${ICON.x}</button></div>
    <div class="sets"><div class="h">Série</div><div class="h">Préc.</div><div class="h">kg</div><div class="h">Reps</div><div class="h">OK</div>${rows}</div>
    <div class="row"><button class="btn sm" data-a="liveAddSet" data-e="${i}">+ Série</button>${e.sets.length > 1 ? `<button class="btn sm ghost" data-a="liveDelSet" data-e="${i}">Retirer une série</button>` : ''}</div></div>`;
}

function renderLive() {
  const root = $('#live');
  if (!S.live || !ui.liveOpen) { root.hidden = true; root.innerHTML = ''; document.body.style.overflow = ''; renderRest(); return; }
  const L = S.live;
  const sc = root.querySelector('.live') ? root.querySelector('.live').scrollTop : 0;
  root.hidden = false; document.body.style.overflow = 'hidden';
  root.innerHTML = `<div class="live"><div class="live-head"><div class="in">
      <button class="icon-btn" data-a="liveMin" aria-label="Réduire la séance">${ICON.down}</button>
      <div class="grow"><div class="eyebrow">Séance en cours</div><h2 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(L.name)}</h2></div>
      <span class="clock" id="clock">${fmtClock((Date.now() - L.startedAt) / 1000)}</span>
      <button class="btn primary sm" data-a="liveFinish">Terminer</button></div></div>
    <div class="live-body">${L.exercises.map(liveExCard).join('') || '<div class="card"><div class="empty">Ajoute ton premier exercice pour commencer.</div></div>'}
      <button class="btn block" data-a="liveAddEx">+ Ajouter un exercice</button>
      <button class="btn danger block" data-a="liveCancel">Abandonner la séance</button></div></div>`;
  root.querySelector('.live').scrollTop = sc;
  renderRest();
}

function renderRest() {
  const el = $('#rest');
  const L = S.live;
  if (!L || !L.restEnd || !ui.liveOpen) { el.hidden = true; el.innerHTML = ''; return; }
  const left = Math.max(0, (L.restEnd - Date.now()) / 1000);
  if (!el.firstChild) {
    el.innerHTML = '<div class="prog"></div><div class="in"><div class="grow"><div class="small" style="opacity:.7">Repos</div><div class="t" id="restT"></div></div><button class="btn" data-a="restAdd" data-v="-15">−15 s</button><button class="btn" data-a="restAdd" data-v="15">+15 s</button><button class="btn" data-a="restSkip">Passer</button></div>';
  }
  el.hidden = false;
  $('#restT').textContent = fmtClock(Math.ceil(left));
  el.querySelector('.prog').style.width = `${clamp((left / (L.restTotal || 1)) * 100, 0, 100)}%`;
}

let actx = null;
function unlockAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { actx = null; } }
function beep() {
  try {
    unlockAudio();
    if (actx) {
      const t = actx.currentTime;
      [0, 0.28, 0.56].forEach((o, i) => {
        const osc = actx.createOscillator(), g = actx.createGain();
        osc.frequency.value = i === 2 ? 1320 : 880;
        g.gain.setValueAtTime(0.0001, t + o);
        g.gain.exponentialRampToValueAtTime(0.35, t + o + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + o + 0.2);
        osc.connect(g); g.connect(actx.destination); osc.start(t + o); osc.stop(t + o + 0.22);
      });
    }
  } catch (e) { /* son indisponible */ }
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { /* rien */ }
}

function finishWorkout() {
  const L = S.live;
  const exercises = L.exercises.map((e) => ({ exId: e.exId, sets: e.sets.filter((s) => s.done).map((s) => ({ kg: num(s.kg) || 0, reps: Math.round(num(s.reps)) || 0 })) })).filter((e) => e.sets.length);
  const prs = [];
  exercises.forEach((e) => {
    const hist = exerciseHistory(e.exId);
    const prevBest = hist.length ? Math.max(...hist.map((h) => h.best)) : 0;
    const cur = Math.max(...e.sets.map((s) => e1rm(s.kg, s.reps)));
    if (prevBest > 0 && cur > prevBest + 0.01) prs.push(e.exId);
  });
  const s = { id: L.id, date: dkey(new Date(L.startedAt)), startedAt: L.startedAt, duration: Math.round((Date.now() - L.startedAt) / 1000), name: L.name, programId: L.programId, dayId: L.dayId, exercises, prs };
  if (exercises.length) S.sessions.push(s);
  S.live = null;
  try { wl && wl.release(); } catch (e) { /* rien */ }
  save(true); closeAllSheets(); render();
  if (!exercises.length) { toast('Aucune série validée : séance non enregistrée.'); return; }
  openSheet({
    render: () => `${sheetHead('Séance terminée')}<div class="grid3"><div class="stat"><span class="label">Durée</span><span class="v">${fmtDur(s.duration)}</span></div><div class="stat"><span class="label">Séries</span><span class="v">${sessionSets(s)}</span></div><div class="stat"><span class="label">Volume</span><span class="v">${nf(sessionVolume(s))}<small>kg</small></span></div></div>
      ${prs.length ? `<div class="card" style="background:var(--surface)"><div class="row"><span class="pill pr">Record</span><span class="grow">${prs.map((id) => esc(exById(id).name)).join(', ')}</span></div></div>` : ''}
      <button class="btn primary block" data-a="closeSheet">Super</button>`,
  });
}

// ---------- Fenêtres métier ----------
function pickerSheet(onPick) {
  const ctrl = {
    query: '', muscle: 'Tous', onPick,
    results() {
      const q = norm(this.query.trim());
      const list = allExercises().filter((e) => (this.muscle === 'Tous' || e.muscle === this.muscle) && (!q || norm(e.name).includes(q)));
      return list.map((e) => `<button class="item" data-a="pick" data-id="${e.id}"><div class="grow"><div class="t" style="font-weight:500">${esc(e.name)}</div><div class="s">${esc(e.muscle)} · ${esc(e.equip)}</div></div></button>`).join('') || '<div class="empty">Aucun exercice. Crée-le avec le bouton ci-dessous.</div>';
    },
    render() {
      return `${sheetHead('Choisir un exercice')}<input type="search" id="pick-q" placeholder="Rechercher" value="${esc(this.query)}" data-in="pickerQuery" aria-label="Rechercher un exercice">
        <div class="chips">${['Tous'].concat(MUSCLES).map((m) => `<button class="chip ${this.muscle === m ? 'on' : ''}" data-a="pickMuscle" data-v="${m}">${m}</button>`).join('')}</div>
        <div class="list" id="pickRes">${this.results()}</div><button class="btn block" data-a="exCreate">+ Créer un exercice</button>`;
    },
  };
  openSheet(ctrl);
}

function exCreateSheet(onDone) {
  openSheet({
    onDone,
    render: () => `${sheetHead('Nouvel exercice')}<form class="stack" data-submit="exCreate"><div class="field"><label for="exn">Nom</label><input type="text" id="exn" name="name" required placeholder="Ex. : Rowing machine Hammer"></div>
      <div class="grid2"><div class="field"><label for="exm">Muscle</label><select id="exm" name="muscle">${MUSCLES.map((m) => `<option>${m}</option>`).join('')}</select></div>
      <div class="field"><label for="exe">Matériel</label><select id="exe" name="equip">${['Barre', 'Haltères', 'Machine', 'Poulie', 'Poids du corps', 'Accessoire'].map((m) => `<option>${m}</option>`).join('')}</select></div></div>
      <button class="btn primary block" type="submit">Créer</button></form>`,
  });
}

function platesFor(total, bar) {
  let side = (total - bar) / 2;
  const out = [];
  if (side < 0) return { out, rest: side * 2 };
  [25, 20, 15, 10, 5, 2.5, 1.25].forEach((p) => { while (side >= p - 1e-9) { out.push(p); side -= p; } });
  return { out, rest: Math.round(side * 2 * 100) / 100 };
}

function platesSheet(kg) {
  const ctrl = {
    kg: kg || 60, bar: S.settings.bar,
    result() {
      const { out, rest } = platesFor(this.kg, this.bar);
      if (this.kg < this.bar) return `<div class="empty">La barre seule pèse déjà ${this.bar} kg.</div>`;
      const pl = (p) => `<span class="plate k${String(p).replace('.', '-')}">${nf(p, 2)}</span>`;
      const left = out.slice().reverse().map(pl).join(''), right = out.map(pl).join('');
      return `<div class="barbell" aria-hidden="true"><span class="sleeve"></span>${left}<span class="shaft"></span>${right}<span class="sleeve"></span></div>
        <div style="text-align:center"><div class="label">Par côté</div><div style="font-family:var(--font-display);font-size:24px;font-weight:700">${out.length ? out.map((p) => nf(p, 2)).join(' + ') + ' kg' : 'Barre seule'}</div>
        ${rest > 0 ? `<div class="small" style="color:var(--red)">Impossible au gramme près : il reste ${nf(rest, 2)} kg.</div>` : ''}</div>`;
    },
    render() {
      return `${sheetHead('Disques à charger')}<div class="grid2"><div class="field"><label for="pl-kg">Charge totale (kg)</label><input type="text" inputmode="decimal" id="pl-kg" value="${nf(this.kg, 2)}" data-in="plateKg"></div>
        <div class="field"><label for="pl-bar">Barre</label><select id="pl-bar" data-change="plateBar">${[20, 15, 10].map((v) => `<option value="${v}" ${this.bar === v ? 'selected' : ''}>${v} kg</option>`).join('')}</select></div></div>
        <div id="plRes">${this.result()}</div>`;
    },
  };
  openSheet(ctrl);
}

function dayEditSheet(progId, dayId) {
  openSheet({
    progId, dayId, type: 'day',
    get prog() { return S.programs.find((p) => p.id === this.progId); },
    get dy() { const p = this.prog; return p && p.days.find((d) => d.id === this.dayId); },
    onClose() { render(); },
    render() {
      const dy = this.dy;
      if (!dy) return sheetHead('Journée supprimée');
      const rows = dy.exercises.map((e, i) => `<div class="card" style="padding:12px;gap:8px"><div class="row"><b class="grow">${esc(exById(e.exId).name)}</b>
          <button class="icon-btn plain" data-a="dayMove" data-i="${i}" data-v="-1" aria-label="Monter" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${ICON.up}</button>
          <button class="icon-btn plain" data-a="dayMove" data-i="${i}" data-v="1" aria-label="Descendre" style="transform:rotate(180deg);${i === dy.exercises.length - 1 ? 'opacity:.3' : ''}" ${i === dy.exercises.length - 1 ? 'disabled' : ''}>${ICON.up}</button>
          <button class="icon-btn plain" data-a="dayExDel" data-i="${i}" aria-label="Retirer">${ICON.x}</button></div>
        <div class="grid3"><div class="field"><label for="de-${i}-s">Séries</label><input type="text" inputmode="numeric" id="de-${i}-s" value="${e.sets}" data-in="dayEx" data-i="${i}" data-f="sets"></div>
          <div class="field"><label for="de-${i}-r">Reps</label><input type="text" id="de-${i}-r" value="${esc(e.reps)}" data-in="dayEx" data-i="${i}" data-f="reps"></div>
          <div class="field"><label for="de-${i}-t">Repos (s)</label><input type="text" inputmode="numeric" id="de-${i}-t" value="${e.rest}" data-in="dayEx" data-i="${i}" data-f="rest"></div></div></div>`).join('');
      return `${sheetHead('Modifier la journée', esc(this.prog.name))}<div class="field"><label for="day-name">Nom</label><input type="text" id="day-name" value="${esc(dy.name)}" data-in="dayName"></div>
        ${rows || '<div class="empty">Aucun exercice.</div>'}
        <button class="btn block" data-a="dayExAdd">+ Ajouter un exercice</button>
        <div class="grid2"><button class="btn danger" data-a="dayDelete">Supprimer la journée</button><button class="btn primary" data-a="closeSheet">Terminé</button></div>`;
    },
  });
}

function textSheet({ title, label, value = '', ok = 'Enregistrer', onOk }) {
  openSheet({
    onOk,
    render: () => `${sheetHead(title)}<form class="stack" data-submit="textSheet"><div class="field"><label for="ts-v">${label}</label><input type="text" id="ts-v" name="v" value="${esc(value)}" required></div><button class="btn primary block" type="submit">${ok}</button></form>`,
    after: (el) => { const i = el.querySelector('#ts-v'); setTimeout(() => i && i.focus(), 250); },
  });
}

function sessionSheet(id) {
  const s = S.sessions.find((x) => x.id === id);
  if (!s) return;
  openSheet({
    sid: id,
    render: () => `${sheetHead(esc(s.name), `${cap(fmtDay(s.date))} · ${fmtDur(s.duration)}`)}
      <div class="grid3"><div class="stat"><span class="label">Séries</span><span class="v">${sessionSets(s)}</span></div><div class="stat"><span class="label">Volume</span><span class="v">${nf(sessionVolume(s))}<small>kg</small></span></div><div class="stat"><span class="label">Records</span><span class="v">${(s.prs || []).length}</span></div></div>
      ${s.exercises.map((e) => `<div class="card" style="gap:6px"><div class="row"><b class="grow">${esc(exById(e.exId).name)}</b>${(s.prs || []).includes(e.exId) ? '<span class="pill pr">PR</span>' : ''}</div><div class="small num">${e.sets.map((st, i) => `<div class="row" style="justify-content:space-between;padding:3px 0"><span class="muted">Série ${i + 1}</span><span>${nf(st.kg, 2)} kg × ${st.reps}</span></div>`).join('')}</div></div>`).join('')}
      <button class="btn danger block" data-a="sessionDel">Supprimer cette séance</button>`,
  });
}

function exSheet(id) {
  const ex = exById(id);
  const h = exerciseHistory(id);
  const best = h.reduce((a, x) => (x.best > a.best ? x : a), { best: 0 });
  const heaviest = h.flatMap((x) => x.sets).reduce((a, s) => (s.kg > a ? s.kg : a), 0);
  openSheet({
    exId: id,
    render: () => `${sheetHead(esc(ex.name), `${esc(ex.muscle)} · ${esc(ex.equip)}`)}
      <div class="grid3"><div class="stat"><span class="label">1RM estimé</span><span class="v">${best.best ? nf(best.best, 1) : '—'}<small>kg</small></span></div><div class="stat"><span class="label">Plus lourd</span><span class="v">${heaviest ? nf(heaviest, 2) : '—'}<small>kg</small></span></div><div class="stat"><span class="label">Séances</span><span class="v">${h.length}</span></div></div>
      <div class="card"><h3>Progression du 1RM estimé</h3>${lineChart(h.map((x) => ({ x: x.startedAt, y: x.best })), { unit: 'kg' })}<div class="small muted">Estimation d’Epley : charge × (1 + reps / 30).</div></div>
      ${h.length ? `<div class="card"><h3>Dernières séances</h3><div class="list">${h.slice().reverse().slice(0, 8).map((x) => `<div class="item"><div class="grow"><div class="t">${cap(fmtShort(x.date))}</div><div class="s num">${x.sets.map((s) => `${nf(s.kg, 2)}×${s.reps}`).join(' · ')}</div></div></div>`).join('')}</div></div>` : ''}
      <button class="btn block" data-a="platesFrom" data-kg="${heaviest || 60}">Calculer les disques</button>
      ${ex.custom ? '<button class="btn danger block" data-a="exDelete">Supprimer cet exercice</button>' : ''}`,
  });
}

function foodAddSheet(meal, date) {
  openSheet({
    meal, date, tab: 'search', query: '',
    results() {
      const q = norm(this.query.trim());
      let list;
      if (!q) {
        const rec = S.recentFoods.map(foodById).filter(Boolean);
        const recIds = new Set(rec.map((f) => f.id));
        list = (rec.length ? `<div class="label" style="padding-top:6px">Récents</div>${rec.map(foodRow).join('')}<div class="label" style="padding-top:12px">Tous les aliments</div>` : '') + allFoods().filter((f) => !recIds.has(f.id)).map(foodRow).join('');
      } else {
        list = allFoods().filter((f) => norm(f.name).includes(q)).map(foodRow).join('') || '<div class="empty">Introuvable. Crée-le dans l’onglet « Créer ».</div>';
      }
      return list;
    },
    render() {
      const mealName = MEALS.find((m) => m.id === this.meal).name;
      const seg = `<div class="segment">${[['search', 'Rechercher'], ['quick', 'Ajout rapide'], ['create', 'Créer']].map(([v, n]) => `<button class="${this.tab === v ? 'on' : ''}" data-a="foodTab" data-v="${v}">${n}</button>`).join('')}</div>`;
      let body = '';
      if (this.tab === 'search') {
        body = `<input type="search" id="food-q" placeholder="Rechercher un aliment" value="${esc(this.query)}" data-in="foodQuery" aria-label="Rechercher un aliment"><div class="list" id="foodRes">${this.results()}</div>`;
      } else if (this.tab === 'quick') {
        body = `<form class="stack" data-submit="foodQuick"><div class="field"><label for="fq-n">Nom</label><input type="text" id="fq-n" name="name" placeholder="Ex. : Restaurant, burger frites"></div>
          <div class="grid2"><div class="field"><label for="fq-k">Calories</label><input type="text" inputmode="decimal" id="fq-k" name="kcal" required placeholder="kcal"></div><div class="field"><label for="fq-p">Protéines (g)</label><input type="text" inputmode="decimal" id="fq-p" name="p" placeholder="0"></div>
          <div class="field"><label for="fq-c">Glucides (g)</label><input type="text" inputmode="decimal" id="fq-c" name="c" placeholder="0"></div><div class="field"><label for="fq-f">Lipides (g)</label><input type="text" inputmode="decimal" id="fq-f" name="f" placeholder="0"></div></div>
          <button class="btn primary block" type="submit">Ajouter</button></form>`;
      } else {
        body = `<form class="stack" data-submit="foodCreate"><div class="field"><label for="fc-n">Nom</label><input type="text" id="fc-n" name="name" required placeholder="Ex. : Barre protéinée Myprotein"></div>
          <div class="label">Valeurs pour 100 g (sur l’étiquette)</div>
          <div class="grid2"><div class="field"><label for="fc-k">Calories</label><input type="text" inputmode="decimal" id="fc-k" name="kcal" required></div><div class="field"><label for="fc-p">Protéines</label><input type="text" inputmode="decimal" id="fc-p" name="p" placeholder="0"></div>
          <div class="field"><label for="fc-c">Glucides</label><input type="text" inputmode="decimal" id="fc-c" name="c" placeholder="0"></div><div class="field"><label for="fc-f">Lipides</label><input type="text" inputmode="decimal" id="fc-f" name="f" placeholder="0"></div></div>
          <div class="grid2"><div class="field"><label for="fc-u">Portion (facultatif)</label><input type="text" id="fc-u" name="unit" placeholder="Ex. : barre"></div><div class="field"><label for="fc-g">Poids portion (g)</label><input type="text" inputmode="decimal" id="fc-g" name="portion" placeholder="Ex. : 60"></div></div>
          <button class="btn primary block" type="submit">Créer et ajouter</button></form>`;
      }
      return `${sheetHead('Ajouter un aliment', `${mealName} · ${this.date === dkey() ? 'aujourd’hui' : fmtShort(this.date)}`)}${seg}${body}`;
    },
  });
}

function foodRow(f) {
  return `<button class="item" data-a="foodPick" data-id="${f.id}"><div class="grow"><div class="t" style="font-weight:500">${esc(f.name)}</div><div class="s num">${f.portion ? `1 ${esc(f.unit)} (${nf(f.portion)} g) · ` : ''}100 g : P ${nf(f.p, 1)} · G ${nf(f.c, 1)} · L ${nf(f.f, 1)}</div></div><div class="end num">${nf(f.kcal)}<div class="s">kcal</div></div></button>`;
}

function calcEntry(food, mode, qty) {
  const grams = mode === 'u' ? qty * (food.portion || 100) : qty;
  const k = grams / 100;
  return { grams, kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k };
}

function qtySheet({ food, meal, date, entry = null }) {
  openSheet({
    food, meal, date, entry,
    mode: entry ? entry.mode || 'g' : food.portion ? 'u' : 'g',
    qty: entry ? (entry.mode === 'u' ? entry.qty : entry.grams) : food.portion ? 1 : 100,
    preview() {
      const c = calcEntry(this.food, this.mode, this.qty || 0);
      return `<div class="grid3" style="grid-template-columns:repeat(4,1fr)"><div class="stat"><span class="label">kcal</span><span class="v" style="font-size:24px">${nf(c.kcal)}</span></div><div class="stat"><span class="label"><i class="dot p"></i> Prot.</span><span class="v" style="font-size:24px">${nf(c.p, 1)}</span></div><div class="stat"><span class="label"><i class="dot c"></i> Gluc.</span><span class="v" style="font-size:24px">${nf(c.c, 1)}</span></div><div class="stat"><span class="label"><i class="dot f"></i> Lip.</span><span class="v" style="font-size:24px">${nf(c.f, 1)}</span></div></div>`;
    },
    render() {
      const f = this.food;
      return `${sheetHead(esc(f.name), `Pour 100 g : ${nf(f.kcal)} kcal · P ${nf(f.p, 1)} · G ${nf(f.c, 1)} · L ${nf(f.f, 1)}`)}
        ${f.portion ? `<div class="segment"><button class="${this.mode === 'u' ? 'on' : ''}" data-a="qtyMode" data-v="u">${esc(cap(f.unit))} (${nf(f.portion)} g)</button><button class="${this.mode === 'g' ? 'on' : ''}" data-a="qtyMode" data-v="g">Grammes</button></div>` : ''}
        <div class="grid2"><div class="field"><label for="q-qty">${this.mode === 'u' ? 'Nombre' : 'Quantité (g)'}</label><input type="text" inputmode="decimal" id="q-qty" value="${nf(this.qty, 2)}" data-in="qty"></div>
        <div class="field"><label for="q-meal">Repas</label><select id="q-meal" data-change="qtyMeal">${MEALS.map((m) => `<option value="${m.id}" ${m.id === this.meal ? 'selected' : ''}>${m.name}</option>`).join('')}</select></div></div>
        <div id="qPrev">${this.preview()}</div>
        ${this.entry ? '<div class="grid2"><button class="btn danger" data-a="entryDel">Supprimer</button><button class="btn primary" data-a="qtySave">Enregistrer</button></div>' : '<button class="btn primary block" data-a="qtySave">Ajouter</button>'}`;
    },
  });
}

function measureSheet() {
  const k = dkey();
  const last = S.measures.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).pop();
  openSheet({
    render: () => `${sheetHead('Nouvelles mensurations', 'En centimètres, mètre ruban à plat, sans serrer')}<form class="stack" data-submit="measureAdd">
      <div class="field"><label for="m-date">Date</label><input type="date" id="m-date" name="date" value="${k}" max="${k}"></div>
      <div class="grid2">${MEASURES.map((m) => `<div class="field"><label for="m-${m.id}">${m.name}</label><input type="text" inputmode="decimal" id="m-${m.id}" name="${m.id}" placeholder="${last && Number.isFinite(last[m.id]) ? nf(last[m.id], 1) : 'cm'}"></div>`).join('')}</div>
      <button class="btn primary block" type="submit">Enregistrer</button></form>`,
  });
}

function checkinSheet(existing = null) {
  const ws = weekSummary();
  openSheet({
    existing,
    render: () => {
      if (existing) {
        const c = existing;
        return `${sheetHead(`Bilan du ${fmtShort(c.date)}`)}<div class="card">${CHECKIN_SCALES.map((s) => `<div class="row" style="justify-content:space-between"><span>${s.name}</span><b class="num">${c[s.id]} / 5</b></div><div class="bar"><i style="width:${c[s.id] * 20}%"></i></div>`).join('')}</div>
          ${c.summary ? `<div class="small muted num">Semaine : ${c.summary.sessions} séance(s) · ${Number.isFinite(c.summary.kcal) ? nf(c.summary.kcal) + ' kcal/j' : 'kcal non suivies'} · ${Number.isFinite(c.summary.weight) ? nf(c.summary.weight, 1) + ' kg en moyenne' : 'pas de pesée'}</div>` : ''}
          ${[['wins', 'Ce qui a bien marché'], ['struggles', 'Difficultés'], ['goal', 'Objectif de la semaine prochaine']].map(([k, n]) => (c[k] ? `<div class="card" style="gap:4px"><div class="label">${n}</div><div>${esc(c[k]).replace(/\n/g, '<br>')}</div></div>` : '')).join('')}
          <button class="btn danger block" data-a="checkinDel" data-id="${c.id}">Supprimer ce bilan</button>`;
      }
      return `${sheetHead('Bilan de la semaine', `${ws.sessions} séance(s) · ${Number.isFinite(ws.kcal) ? nf(ws.kcal) + ' kcal/j en moyenne' : 'nutrition non suivie'}${Number.isFinite(ws.weightDelta) ? ' · poids ' + (ws.weightDelta > 0 ? '+' : '−') + nf(Math.abs(ws.weightDelta), 1) + ' kg' : ''}`)}
        <form class="stack" data-submit="checkinAdd">
        ${CHECKIN_SCALES.map((s) => `<div class="field"><div class="row" style="justify-content:space-between"><label for="ci-${s.id}">${s.name}</label><b class="num" id="ci-${s.id}-v">3 / 5</b></div><input type="range" min="1" max="5" step="1" value="3" id="ci-${s.id}" name="${s.id}" data-in="rangeLbl"><div class="scale"><span>${s.inverse ? 'Faible' : 'Mauvais'}</span><span>${s.inverse ? 'Élevé' : 'Excellent'}</span></div></div>`).join('')}
        <div class="field"><label for="ci-wins">Ce qui a bien marché</label><textarea id="ci-wins" name="wins"></textarea></div>
        <div class="field"><label for="ci-str">Difficultés</label><textarea id="ci-str" name="struggles"></textarea></div>
        <div class="field"><label for="ci-goal">Objectif de la semaine prochaine</label><textarea id="ci-goal" name="goal"></textarea></div>
        <button class="btn primary block" type="submit">Enregistrer le bilan</button></form>`;
    },
  });
}

function calcSheet(onboarding = false) {
  openSheet({
    p: { ...S.profile }, onboarding,
    res() {
      const r = calcTargets(this.p);
      return `<div class="card" style="gap:8px"><div class="row" style="justify-content:space-between"><span class="muted">Métabolisme de base</span><b class="num">${nf(r.bmr)} kcal</b></div><div class="row" style="justify-content:space-between"><span class="muted">Dépense totale</span><b class="num">${nf(r.tdee)} kcal</b></div><div class="hr"></div>
        <div class="row" style="justify-content:space-between"><span>Objectif</span><b class="num" style="font-family:var(--font-display);font-size:24px">${nf(r.kcal)} kcal</b></div>
        <div class="row small num" style="justify-content:space-between"><span><i class="dot p"></i> P ${r.p} g</span><span><i class="dot c"></i> G ${r.c} g</span><span><i class="dot f"></i> L ${r.f} g</span></div></div>`;
    },
    render() {
      const p = this.p;
      const sel = (k, opts) => `<select id="cp-${k}" data-in="calcP" data-k="${k}">${opts.map(([v, n]) => `<option value="${v}" ${String(p[k]) === String(v) ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
      const inp = (k, unit) => `<input type="text" inputmode="numeric" id="cp-${k}" value="${p[k]}" data-in="calcP" data-k="${k}" aria-label="${unit}">`;
      return `${sheetHead(this.onboarding ? 'Bienvenue sur HusoFit' : 'Mon profil', this.onboarding ? 'Quelques infos pour calculer tes objectifs. Tu pourras tout changer plus tard.' : '')}
        <div class="field"><label for="cp-name">Prénom</label><input type="text" id="cp-name" value="${esc(p.name)}" data-in="calcP" data-k="name" placeholder="Ton prénom"></div>
        <div class="grid2"><div class="field"><label for="cp-sex">Sexe</label>${sel('sex', [['h', 'Homme'], ['f', 'Femme']])}</div><div class="field"><label for="cp-age">Âge</label>${inp('age', 'ans')}</div>
        <div class="field"><label for="cp-height">Taille (cm)</label>${inp('height', 'cm')}</div><div class="field"><label for="cp-weight">Poids (kg)</label>${inp('weight', 'kg')}</div></div>
        <div class="field"><label for="cp-activity">Activité</label>${sel('activity', [[1.2, 'Sédentaire (bureau, peu de marche)'], [1.375, 'Légère (1 à 3 séances/sem.)'], [1.55, 'Modérée (3 à 5 séances/sem.)'], [1.725, 'Élevée (6 à 7 séances/sem.)'], [1.9, 'Très élevée (travail physique + sport)']])}</div>
        <div class="field"><label for="cp-goal">Objectif</label>${sel('goal', [['seche', 'Perdre du gras (sèche)'], ['maintien', 'Maintenir / recomposition'], ['prise', 'Prendre du muscle']])}</div>
        <div id="calcRes">${this.res()}</div>
        <button class="btn primary block" data-a="calcApply">Appliquer ces objectifs</button>
        ${this.onboarding ? '<button class="btn ghost block" data-a="calcSkip">Plus tard</button>' : ''}`;
    },
  });
}

function photoSheet(id) {
  const p = S.photos.find((x) => x.id === id);
  if (!p) return;
  openSheet({
    render: () => `${sheetHead(`${esc(p.pose)} · ${fmtShort(p.date)}`)}<img data-photo="${p.id}" alt="Photo ${esc(p.pose)}" style="width:100%;border-radius:12px;background:var(--surface-2);min-height:200px"><button class="btn danger block" data-a="photoDel" data-id="${p.id}">Supprimer la photo</button>`,
    after: (el) => hydratePhotos(el),
  });
}

async function compressImage(file, max = 1280, q = 0.82) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', q);
  } finally { URL.revokeObjectURL(url); }
}

function applyTheme() {
  const t = S.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = $('meta[name="theme-color"]');
  if (m) m.setAttribute('content', dark ? '#0d1013' : '#eef1f4');
}

// ---------- Actions (clics) ----------
const A = {
  tab(el) { ui.tab = el.dataset.t; if (ui.tab === 'food') ui.foodDate = dkey(); render(); window.scrollTo(0, 0); },
  closeSheet() { closeSheet(); },
  confirmOk() { const c = topSheet(); closeSheet(); c.onOk(); },

  habit(el) { const d = day(el.dataset.k); d.habits[el.dataset.id] = !d.habits[el.dataset.id]; save(); render(); },
  water(el) { const d = day(el.dataset.k); d.water = Math.max(0, d.water + Number(el.dataset.v)); save(); render(); },

  // séances
  startWorkout(el) { unlockAudio(); startWorkout(el.dataset.p, el.dataset.d); },
  startFree() { unlockAudio(); startWorkout(null, null); },
  liveOpen() { ui.liveOpen = true; render(); wakeLock(); },
  liveMin() { ui.liveOpen = false; render(); },
  liveToggle(el) {
    unlockAudio();
    const L = S.live, e = L.exercises[+el.dataset.e], j = +el.dataset.s, s = e.sets[j];
    if (s.done) { s.done = false; save(); renderLive(); return; }
    const prev = (lastSetsFor(e.exId) || [])[j];
    if (s.kg === '') s.kg = prev ? nf(prev.kg, 2) : j > 0 ? e.sets[j - 1].kg : '';
    if (s.reps === '') s.reps = prev ? String(prev.reps) : j > 0 ? e.sets[j - 1].reps : '';
    if (s.reps === '' || !(num(s.reps) > 0)) { toast('Indique le nombre de répétitions.'); const i = $(`#ls-${el.dataset.e}-${j}-reps`); i && i.focus(); return; }
    if (s.kg === '') s.kg = '0';
    s.done = true;
    L.restTotal = e.rest; L.restEnd = Date.now() + e.rest * 1000;
    save(); renderLive();
  },
  liveAddSet(el) { const e = S.live.exercises[+el.dataset.e]; e.sets.push({ kg: '', reps: '', done: false }); save(); renderLive(); },
  liveDelSet(el) { const e = S.live.exercises[+el.dataset.e]; if (e.sets.length > 1) e.sets.pop(); save(); renderLive(); },
  liveRemoveEx(el) {
    const i = +el.dataset.e, e = S.live.exercises[i];
    const go = () => { S.live.exercises.splice(i, 1); save(); renderLive(); };
    if (e.sets.some((s) => s.done)) confirmSheet({ title: `Retirer ${esc(exById(e.exId).name)} ?`, text: 'Les séries validées de cet exercice seront perdues.', ok: 'Retirer', onOk: go });
    else go();
  },
  liveAddEx() { pickerSheet((id) => { S.live.exercises.push(mkLiveEx(id, null)); save(); renderLive(); setTimeout(() => { const l = $('.live'); l && l.scrollTo({ top: l.scrollHeight, behavior: 'smooth' }); }, 50); }); },
  liveFinish() {
    const done = S.live.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
    const total = S.live.exercises.reduce((a, e) => a + e.sets.length, 0);
    openSheet({
      render: () => `${sheetHead('Terminer la séance ?')}<p class="muted" style="margin:0">${done} série${done > 1 ? 's' : ''} validée${done > 1 ? 's' : ''} sur ${total}. Seules les séries validées sont enregistrées.</p><div class="grid2"><button class="btn" data-a="closeSheet">Continuer</button><button class="btn primary" data-a="liveSave">Terminer</button></div>`,
    });
  },
  liveSave() { finishWorkout(); },
  liveCancel() { confirmSheet({ title: 'Abandonner la séance ?', text: 'Rien ne sera enregistré.', ok: 'Abandonner', onOk: () => { S.live = null; save(); render(); } }); },
  restAdd(el) { const L = S.live; if (!L || !L.restEnd) return; L.restEnd += Number(el.dataset.v) * 1000; L.restTotal = Math.max(L.restTotal + Number(el.dataset.v), 1); if (L.restEnd <= Date.now()) L.restEnd = null; save(); renderRest(); },
  restSkip() { if (S.live) { S.live.restEnd = null; save(); } renderRest(); },
  platesLive(el) {
    const e = S.live.exercises[+el.dataset.e];
    const filled = e.sets.filter((s) => s.kg !== '').pop();
    const prev = lastSetsFor(e.exId);
    platesSheet(filled ? num(filled.kg) : prev ? prev[0].kg : 60);
  },
  platesFrom(el) { platesSheet(num(el.dataset.kg)); },

  // programme
  trainSeg(el) { ui.trainSeg = el.dataset.v; render(); },
  progNew() { textSheet({ title: 'Nouveau programme', label: 'Nom du programme', ok: 'Créer', onOk: (v) => { const p = { id: uid(), name: v, days: [{ id: uid(), name: 'Jour 1', exercises: [] }] }; S.programs.push(p); S.activeProgramId = p.id; save(); render(); } }); },
  progRename() { const p = activeProgram(); textSheet({ title: 'Renommer', label: 'Nom du programme', value: p.name, onOk: (v) => { p.name = v; save(); render(); } }); },
  progDelete() { const p = activeProgram(); confirmSheet({ title: `Supprimer « ${esc(p.name)} » ?`, text: 'Tes séances passées restent dans l’historique.', onOk: () => { S.programs = S.programs.filter((x) => x.id !== p.id); S.activeProgramId = S.programs[0] ? S.programs[0].id : null; save(); render(); } }); },
  dayAdd() { const p = activeProgram(); if (!p) return; const d = { id: uid(), name: `Jour ${p.days.length + 1}`, exercises: [] }; p.days.push(d); save(); render(); dayEditSheet(p.id, d.id); },
  dayEdit(el) { dayEditSheet(activeProgram().id, el.dataset.d); },
  dayMove(el) { const c = topSheet(), ex = c.dy.exercises, i = +el.dataset.i, j = i + Number(el.dataset.v); if (j < 0 || j >= ex.length) return; [ex[i], ex[j]] = [ex[j], ex[i]]; save(); paintSheet(c); },
  dayExDel(el) { const c = topSheet(); c.dy.exercises.splice(+el.dataset.i, 1); save(); paintSheet(c); },
  dayExAdd() { const c = topSheet(); pickerSheet((id) => { c.dy.exercises.push({ exId: id, sets: 3, reps: '8-12', rest: S.settings.rest }); save(); paintSheet(c); }); },
  dayDelete() { const c = topSheet(); confirmSheet({ title: `Supprimer « ${esc(c.dy.name)} » ?`, onOk: () => { const p = c.prog; p.days = p.days.filter((d) => d.id !== c.dayId); save(); closeSheet(); } }); },
  pick(el) { const c = topSheet(); closeSheet(); c.onPick(el.dataset.id); },
  pickMuscle(el) { const c = topSheet(); c.muscle = el.dataset.v; paintSheet(c); },
  sessionOpen(el) { sessionSheet(el.dataset.id); },
  sessionDel() { const c = topSheet(); confirmSheet({ title: 'Supprimer cette séance ?', onOk: () => { S.sessions = S.sessions.filter((s) => s.id !== c.sid); save(); closeSheet(); render(); } }); },
  exMuscle(el) { ui.exMuscle = el.dataset.v; render(); },
  exOpen(el) { exSheet(el.dataset.id); },
  exCreate() { exCreateSheet(); },
  exDelete() { const c = topSheet(); confirmSheet({ title: 'Supprimer cet exercice ?', text: 'Il disparaîtra de la bibliothèque. Les séances passées gardent leurs séries.', onOk: () => { S.customExercises = S.customExercises.filter((e) => e.id !== c.exId); save(); closeSheet(); render(); } }); },

  // nutrition
  foodDay(el) { const n = addDays(ui.foodDate, Number(el.dataset.v)); if (n > dkey()) return; ui.foodDate = n; render(); },
  foodAdd(el) { foodAddSheet(el.dataset.m, ui.foodDate); },
  foodTab(el) { const c = topSheet(); c.tab = el.dataset.v; paintSheet(c); },
  foodPick(el) { const c = topSheet(); const f = foodById(el.dataset.id); qtySheet({ food: f, meal: c.meal, date: c.date }); },
  qtyMode(el) {
    const c = topSheet(); const nm = el.dataset.v; if (nm === c.mode) return;
    c.qty = nm === 'g' ? Math.round((c.qty || 0) * c.food.portion) : Math.round(((c.qty || 0) / c.food.portion) * 4) / 4 || 1;
    c.mode = nm; paintSheet(c);
  },
  qtySave() {
    const c = topSheet();
    if (!(c.qty > 0)) { toast('Indique une quantité.'); return; }
    const calc = calcEntry(c.food, c.mode, c.qty);
    const d = day(c.date);
    const entry = { id: c.entry ? c.entry.id : uid(), foodId: c.food.id, name: c.food.name, mode: c.mode, qty: c.qty, ...calc };
    if (c.entry) MEALS.forEach((m) => { d.meals[m.id] = d.meals[m.id].filter((e) => e.id !== c.entry.id); });
    d.meals[c.meal].push(entry);
    S.recentFoods = [c.food.id].concat(S.recentFoods.filter((x) => x !== c.food.id)).slice(0, 12);
    save(); closeAllSheets(); render(); toast(c.entry ? 'Modifié.' : `${c.food.name} ajouté.`);
  },
  entryOpen(el) {
    const d = day(ui.foodDate), e = d.meals[el.dataset.m].find((x) => x.id === el.dataset.id);
    if (!e) return;
    const f = e.foodId && foodById(e.foodId);
    if (f) { qtySheet({ food: f, meal: el.dataset.m, date: ui.foodDate, entry: e }); return; }
    openSheet({
      meal: el.dataset.m, entry: e, date: ui.foodDate,
      render: () => `${sheetHead(esc(e.name))}<div class="small muted num">${nf(e.kcal)} kcal · P ${nf(e.p)} · G ${nf(e.c)} · L ${nf(e.f)}</div><button class="btn danger block" data-a="entryDel">Supprimer</button>`,
    });
  },
  entryDel() { const c = topSheet(); const d = day(c.date); MEALS.forEach((m) => { d.meals[m.id] = d.meals[m.id].filter((e) => e.id !== c.entry.id); }); save(); closeAllSheets(); render(); },
  copyYesterday() {
    const y = peekDay(addDays(ui.foodDate, -1));
    if (!y || !MEALS.some((m) => (y.meals[m.id] || []).length)) { toast('Rien à copier : la veille est vide.'); return; }
    const d = day(ui.foodDate);
    MEALS.forEach((m) => (y.meals[m.id] || []).forEach((e) => d.meals[m.id].push({ ...e, id: uid() })));
    save(); render(); toast('Repas de la veille copiés.');
  },

  // progrès
  progSeg(el) { ui.progSeg = el.dataset.v; render(); },
  weightRange(el) { ui.weightRange = Number(el.dataset.v); render(); },
  weightDel(el) { S.weights = S.weights.filter((w) => w.id !== el.dataset.id); save(); render(); },
  measureNew() { measureSheet(); },
  measureSel(el) { ui.measureSel = el.dataset.v; render(); },
  measureDel(el) { confirmSheet({ title: 'Supprimer ces mensurations ?', onOk: () => { S.measures = S.measures.filter((m) => m.id !== el.dataset.id); save(); render(); } }); },
  photoOpen(el) { photoSheet(el.dataset.id); },
  photoDel(el) { const id = el.dataset.id; confirmSheet({ title: 'Supprimer cette photo ?', onOk: () => { S.photos = S.photos.filter((p) => p.id !== id); Store.del('photo:' + id); photoCache.delete(id); save(); closeAllSheets(); render(); } }); },
  checkinNew() { checkinSheet(); },
  checkinOpen(el) { checkinSheet(S.checkins.find((c) => c.id === el.dataset.id)); },
  checkinDel(el) { confirmSheet({ title: 'Supprimer ce bilan ?', onOk: () => { S.checkins = S.checkins.filter((c) => c.id !== el.dataset.id); save(); closeAllSheets(); render(); } }); },

  // plus
  habitDel(el) { S.habits = S.habits.filter((h) => h.id !== el.dataset.id); save(); render(); },
  theme(el) { S.settings.theme = el.dataset.v; applyTheme(); save(); render(); },
  calcOpen() { calcSheet(false); },
  profileEdit() { calcSheet(false); },
  calcApply() {
    const c = topSheet(); const r = calcTargets(c.p);
    S.profile = { ...c.p, onboarded: true };
    Object.assign(S.targets, { kcal: r.kcal, p: r.p, c: r.c, f: r.f });
    S.targets.water = Math.round((c.p.weight * 35) / 250) * 250;
    if (!S.weights.length && c.p.weight) S.weights.push({ id: uid(), date: dkey(), kg: c.p.weight });
    save(); closeSheet(); render(); toast('Objectifs mis à jour.');
  },
  calcSkip() { S.profile.onboarded = true; save(); closeSheet(); },
  async exportData() {
    const photos = {};
    for (const p of S.photos) { const v = await photoSrc(p.id); if (v) photos[p.id] = v; }
    const blob = new Blob([JSON.stringify({ app: 'HusoFit', version: 1, exportedAt: new Date().toISOString(), state: S, photos })], { type: 'application/json' });
    const name = `husofit-sauvegarde-${dkey()}.json`;
    try {
      const file = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Sauvegarde HusoFit' }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  },
  wipe() {
    confirmSheet({
      title: 'Tout effacer ?', text: 'Séances, journal, pesées, photos et bilans seront supprimés de cet iPhone. Exporte une sauvegarde avant si besoin.', ok: 'Tout effacer',
      onOk: async () => { for (const p of S.photos) await Store.del('photo:' + p.id); photoCache.clear(); S = defaultState(); await save(true); applyTheme(); ui.tab = 'home'; render(); calcSheet(true); },
    });
  },
};

// ---------- Saisies ----------
const IN = {
  liveSet(el) { const s = S.live.exercises[+el.dataset.e].sets[+el.dataset.s]; s[el.dataset.f] = el.value.trim(); save(); },
  exQuery(el) { ui.exQuery = el.value; $('#exList').innerHTML = exListHtml(); },
  pickerQuery(el) { const c = topSheet(); c.query = el.value; $('#pickRes', c.el).innerHTML = c.results(); },
  foodQuery(el) { const c = topSheet(); c.query = el.value; $('#foodRes', c.el).innerHTML = c.results(); },
  qty(el) { const c = topSheet(); c.qty = num(el.value) || 0; $('#qPrev', c.el).innerHTML = c.preview(); },
  dayName(el) { const c = topSheet(); c.dy.name = el.value.trim() || c.dy.name; save(); },
  dayEx(el) { const c = topSheet(); const e = c.dy.exercises[+el.dataset.i]; const f = el.dataset.f; if (f === 'reps') e.reps = el.value.trim() || e.reps; else { const v = Math.round(num(el.value)); if (v > 0) e[f] = v; } save(); },
  plateKg(el) { const c = topSheet(); c.kg = num(el.value) || 0; $('#plRes', c.el).innerHTML = c.result(); },
  calcP(el) {
    const c = topSheet(); const k = el.dataset.k;
    if (k === 'name' || k === 'sex' || k === 'goal') c.p[k] = el.value.trim();
    else { const v = num(el.value); if (v > 0) c.p[k] = v; }
    $('#calcRes', c.el).innerHTML = c.res();
  },
  rangeLbl(el) { const o = $(`#${el.id}-v`); if (o) o.textContent = `${el.value} / 5`; },
};

const CH = {
  steps(el) { const d = day(el.dataset.k); d.steps = Math.max(0, Math.round(num(el.value)) || 0); save(); render(); },
  target(el) { const v = Math.round(num(el.value)); if (v >= 0) { S.targets[el.dataset.k] = v; save(); toast('Objectif enregistré.'); } else el.value = S.targets[el.dataset.k]; },
  setting(el) { S.settings[el.dataset.k] = Number(el.value); save(); },
  activeProgram(el) { S.activeProgramId = el.value; save(); render(); },
  plateBar(el) { const c = topSheet(); c.bar = Number(el.value); $('#plRes', c.el).innerHTML = c.result(); },
  qtyMeal(el) { topSheet().meal = el.value; },
  cmpA(el) { ui.cmpA = el.value; render(); },
  cmpB(el) { ui.cmpB = el.value; render(); },
  async photoAdd(el) {
    const file = el.files && el.files[0];
    if (!file) return;
    toast('Enregistrement de la photo…');
    try {
      const data = await compressImage(file);
      const id = uid();
      await Store.set('photo:' + id, data);
      photoCache.set(id, data);
      S.photos.push({ id, date: dkey(), pose: el.dataset.pose, t: Date.now() });
      save(); render(); toast('Photo ajoutée.');
    } catch (e) { toast('Impossible de lire cette image.'); }
    el.value = '';
  },
  importData(el) {
    const file = el.files && el.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try { data = JSON.parse(reader.result); } catch (e) { toast('Ce fichier n’est pas une sauvegarde HusoFit.'); return; }
      if (!data || data.app !== 'HusoFit' || !data.state) { toast('Ce fichier n’est pas une sauvegarde HusoFit.'); return; }
      confirmSheet({
        title: 'Remplacer les données ?', text: `La sauvegarde du ${new Date(data.exportedAt).toLocaleDateString('fr-FR')} remplacera tout ce qui est sur cet iPhone.`, ok: 'Importer',
        onOk: async () => {
          S = Object.assign(defaultState(), data.state);
          for (const [id, v] of Object.entries(data.photos || {})) { await Store.set('photo:' + id, v); photoCache.set(id, v); }
          await save(true); applyTheme(); render(); toast('Sauvegarde importée.');
        },
      });
    };
    reader.readAsText(file);
    el.value = '';
  },
};

const SUB = {
  weightQuick(form) { const kg = num(new FormData(form).get('kg')); if (!(kg > 20 && kg < 400)) { toast('Entre un poids en kg, par ex. 74,6.'); return; } addWeight(dkey(), kg); render(); },
  weightAdd(form) {
    const fd = new FormData(form); const kg = num(fd.get('kg')); const date = fd.get('date') || dkey();
    if (!(kg > 20 && kg < 400)) { toast('Entre un poids en kg, par ex. 74,6.'); return; }
    addWeight(date, kg); render();
  },
  habitAdd(form) { const n = String(new FormData(form).get('name') || '').trim(); if (!n) return; S.habits.push({ id: uid(), name: n }); save(); render(); },
  textSheet(form) { const v = String(new FormData(form).get('v') || '').trim(); if (!v) return; const c = topSheet(); closeSheet(); c.onOk(v); },
  exCreate(form) {
    const fd = new FormData(form); const name = String(fd.get('name') || '').trim(); if (!name) return;
    const ex = { id: 'c-' + uid(), name, muscle: fd.get('muscle'), equip: fd.get('equip'), custom: true };
    S.customExercises.push(ex); save(); closeSheet();
    const c = topSheet();
    if (c && c.onPick) { closeSheet(); c.onPick(ex.id); } else render();
    toast('Exercice créé.');
  },
  foodQuick(form) {
    const fd = new FormData(form); const c = topSheet();
    const kcal = num(fd.get('kcal')); if (!(kcal >= 0)) { toast('Indique les calories.'); return; }
    const e = { id: uid(), foodId: null, name: String(fd.get('name') || '').trim() || 'Ajout rapide', kcal, p: num(fd.get('p')) || 0, c: num(fd.get('c')) || 0, f: num(fd.get('f')) || 0 };
    day(c.date).meals[c.meal].push(e); save(); closeAllSheets(); render(); toast('Ajouté.');
  },
  foodCreate(form) {
    const fd = new FormData(form); const c = topSheet();
    const kcal = num(fd.get('kcal')); const name = String(fd.get('name') || '').trim();
    if (!name || !(kcal >= 0)) { toast('Indique au moins le nom et les calories.'); return; }
    const portion = num(fd.get('portion')); const unit = String(fd.get('unit') || '').trim();
    const f = { id: 'cf-' + uid(), name, kcal, p: num(fd.get('p')) || 0, c: num(fd.get('c')) || 0, f: num(fd.get('f')) || 0, custom: true };
    if (portion > 0) { f.portion = portion; f.unit = unit || 'portion'; }
    S.customFoods.push(f); save();
    qtySheet({ food: f, meal: c.meal, date: c.date });
  },
  measureAdd(form) {
    const fd = new FormData(form); const m = { id: uid(), date: fd.get('date') || dkey() };
    let any = false;
    MEASURES.forEach((x) => { const v = num(fd.get(x.id)); if (v > 0) { m[x.id] = v; any = true; } });
    if (!any) { toast('Entre au moins une mesure.'); return; }
    S.measures.push(m); save(); closeSheet(); render(); toast('Mensurations enregistrées.');
  },
  checkinAdd(form) {
    const fd = new FormData(form); const c = { id: uid(), date: dkey(), summary: weekSummary() };
    CHECKIN_SCALES.forEach((s) => { c[s.id] = Number(fd.get(s.id)); });
    ['wins', 'struggles', 'goal'].forEach((k) => { c[k] = String(fd.get(k) || '').trim(); });
    S.checkins.push(c); save(); closeSheet(); render(); toast('Bilan enregistré. Bonne semaine !');
  },
};

function addWeight(date, kg) {
  S.weights = S.weights.filter((w) => w.date !== date);
  S.weights.push({ id: uid(), date, kg: Math.round(kg * 10) / 10 });
  if (date === dkey()) S.profile.weight = Math.round(kg * 10) / 10;
  save(); toast('Poids enregistré.');
}

// ---------- Branchements ----------
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const f = A[el.dataset.a];
  if (f) { e.preventDefault(); f(el, e); }
});
document.addEventListener('input', (e) => { const el = e.target.closest('[data-in]'); if (el && IN[el.dataset.in]) IN[el.dataset.in](el); });
document.addEventListener('change', (e) => { const el = e.target.closest('[data-change]'); if (el && CH[el.dataset.change]) CH[el.dataset.change](el); });
document.addEventListener('submit', (e) => { const f = e.target.closest('[data-submit]'); if (!f) return; e.preventDefault(); const h = SUB[f.dataset.submit]; if (h) h(f); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheets.length) closeSheet(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') save(true);
  else { if (S.live && ui.liveOpen) wakeLock(); if (!sheets.length && !S.live) render(); }
});
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

setInterval(() => {
  const L = S.live;
  if (!L) return;
  const el = ui.liveOpen ? $('#clock') : $('#liveBanner .clock');
  if (el) el.textContent = fmtClock((Date.now() - L.startedAt) / 1000);
  if (L.restEnd) {
    if (Date.now() >= L.restEnd) { L.restEnd = null; save(); beep(); toast('Repos terminé : série suivante !'); }
    renderRest();
  }
}, 500);

async function boot() {
  await Store.open();
  const saved = await Store.get('state');
  if (saved && typeof saved === 'object') {
    const base = defaultState();
    S = Object.assign(base, saved);
    S.profile = Object.assign(base.profile, saved.profile);
    S.targets = Object.assign(base.targets, saved.targets);
    S.settings = Object.assign(base.settings, saved.settings);
  }
  applyTheme();
  render();
  if (!S.profile.onboarded) calcSheet(true);
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* rien */ }
  try {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && document.documentElement.classList.contains('pwa')) {
      navigator.serviceWorker.register('sw.js');
    }
  } catch (e) { /* hors ligne indisponible */ }
}
boot();
