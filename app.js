'use strict';
/* HusoFit : entraînement + suivi du poids et du tour de taille. Tout reste sur le téléphone. */

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
const nf1 = (n) => Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const e1rm = (kg, reps) => (kg > 0 && reps > 0 ? (reps === 1 ? kg : kg * (1 + reps / 30)) : 0);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDay = (k, o = { weekday: 'long', day: 'numeric', month: 'long' }) => parseKey(k).toLocaleDateString('fr-FR', o);
const fmtShort = (k) => cap(fmtDay(k, { weekday: 'short', day: 'numeric', month: 'short' }));
const fmtClock = (sec) => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`; };
const fmtRest = (s) => (s >= 60 ? `${Math.floor(s / 60)} min${s % 60 ? ' ' + pad(s % 60) : ''}` : `${s} s`);
const fmtDur = (sec) => { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)} h ${pad(m % 60)}` : `${m} min`; };
const isoWeek = (k) => { const d = parseKey(k); d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7)); const w1 = new Date(d.getFullYear(), 0, 4); return 1 + Math.round(((d - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7); };
const WD = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const ICON = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chev: '<svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l6 6-6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  plates: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12h20"/><rect x="5" y="5" width="3" height="14" rx="1"/><rect x="16" y="5" width="3" height="14" rx="1"/><rect x="8.5" y="8" width="2" height="8" rx="1"/><rect x="13.5" y="8" width="2" height="8" rx="1"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  x: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  up: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
  list: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3zm0 4H6v1a2 2 0 0 0 1 1.7zm10 0v2.7A2 2 0 0 0 18 8V7z"/></svg>',
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
        r.onerror = () => res(); r.onblocked = () => res();
      } catch (e) { res(); }
    });
  },
  get(k) {
    if (!this.db) { try { const v = localStorage.getItem('hf:' + k); return Promise.resolve(v ? JSON.parse(v) : undefined); } catch (e) { return Promise.resolve(undefined); } }
    return new Promise((res) => { try { const q = this.db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined); } catch (e) { res(undefined); } });
  },
  set(k, v) {
    if (!this.db) { try { localStorage.setItem('hf:' + k, JSON.stringify(v)); } catch (e) { /* plein */ } return Promise.resolve(); }
    return new Promise((res) => { try { const tx = this.db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => res(); } catch (e) { res(); } });
  },
};

// ---------- État ----------
function defaultState() {
  return { v: 2, settings: { rest: 90, theme: 'auto', bar: 20, iosTimer: false }, programs: [], activeProgramId: null, customExercises: [], sessions: [], live: null, checks: [], coachVersion: 0 };
}
let S = defaultState();
const ui = { tab: 'train', liveOpen: true, chart: 'kg' };

let saveTimer = null;
function save(now = false) { clearTimeout(saveTimer); if (now) return Store.set('state', S); saveTimer = setTimeout(() => Store.set('state', S), 250); return Promise.resolve(); }

// Passage de l'ancienne version (nutrition, habitudes…) à la version simplifiée
function migrate(old) {
  const s = defaultState();
  ['programs', 'activeProgramId', 'customExercises', 'sessions', 'live', 'checks', 'coachVersion'].forEach((k) => { if (old[k] !== undefined && old[k] !== null) s[k] = old[k]; });
  s.live = old.live || null;
  s.settings = Object.assign(defaultState().settings, old.settings || {});
  if (old.v !== 2) {
    const byDate = {};
    (old.weights || []).forEach((w) => { byDate[w.date] = { ...(byDate[w.date] || {}), date: w.date, kg: w.kg }; });
    (old.measures || []).forEach((m) => { if (Number.isFinite(m.waist)) byDate[m.date] = { ...(byDate[m.date] || {}), date: m.date, waist: m.waist }; });
    s.checks = Object.values(byDate).map((c) => ({ id: uid(), ...c }));
    const used = new Set((s.sessions || []).map((x) => x.programId));
    s.programs = (s.programs || []).filter((p) => !(['ppl', 'fullbody'].includes(p.id) && !used.has(p.id)));
    if (!s.programs.find((p) => p.id === s.activeProgramId)) s.activeProgramId = s.programs[0] ? s.programs[0].id : null;
  }
  s.v = 2;
  return s;
}

const allExercises = () => EXERCISES.concat(S.customExercises);
const exById = (id) => allExercises().find((e) => e.id === id) || { id, name: 'Exercice supprimé', muscle: '', equip: '' };
const activeProgram = () => S.programs.find((p) => p.id === S.activeProgramId) || S.programs[0] || null;
const sessionsSorted = () => S.sessions.slice().sort((a, b) => b.startedAt - a.startedAt);
const checksSorted = () => S.checks.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

function lastSetsFor(exId) {
  for (const s of sessionsSorted()) { const e = s.exercises.find((x) => x.exId === exId); if (e && e.sets.length) return e.sets; }
  return null;
}
function exerciseHistory(exId) {
  return S.sessions.slice().sort((a, b) => a.startedAt - b.startedAt).flatMap((s) => {
    const e = s.exercises.find((x) => x.exId === exId);
    if (!e || !e.sets.length) return [];
    let best = 0; e.sets.forEach((st) => { best = Math.max(best, e1rm(st.kg, st.reps)); });
    return [{ date: s.date, startedAt: s.startedAt, sets: e.sets, best }];
  });
}
const sessionVolume = (s) => s.exercises.reduce((a, e) => a + e.sets.reduce((b, st) => b + (st.kg || 0) * (st.reps || 0), 0), 0);
const sessionSets = (s) => s.exercises.reduce((a, e) => a + e.sets.length, 0);
const todayWd = () => ((new Date().getDay() + 6) % 7) + 1;

// Jours du programme déjà faits cette semaine (lundi → dimanche), quel que soit le jour où la séance a été faite
function doneThisWeek(prog) {
  const monday = addDays(dkey(), -(todayWd() - 1));
  return new Set(S.sessions.filter((s) => s.programId === prog.id && s.dayId && s.date >= monday).map((s) => s.dayId));
}
function nextWorkout() {
  const prog = activeProgram();
  if (!prog || !prog.days.length) return null;
  const planned = prog.days.filter((d) => d.weekday).sort((a, b) => a.weekday - b.weekday);
  if (planned.length) {
    const today = todayWd(), done = doneThisWeek(prog);
    const todo = planned.filter((d) => !done.has(d.id));
    const upcoming = todo.find((d) => d.weekday >= today);
    if (upcoming) return { prog, day: upcoming, inDays: upcoming.weekday - today };
    if (todo.length) return { prog, day: todo[0], inDays: 0, late: true };
    return { prog, day: planned[0], inDays: planned[0].weekday + 7 - today };
  }
  const last = sessionsSorted().find((s) => s.programId === prog.id);
  let idx = 0;
  if (last) { const i = prog.days.findIndex((d) => d.id === last.dayId); idx = i < 0 ? 0 : (i + 1) % prog.days.length; }
  return { prog, day: prog.days[idx], inDays: 0 };
}

// Programme envoyé par le coach (data.js) : ajouté ou mis à jour quand sa version change
function syncCoach() {
  if (typeof COACH_PROGRAM === 'undefined') return '';
  const C = COACH_PROGRAM;
  if ((S.coachVersion || 0) >= C.version) return '';
  const first = !S.coachVersion;
  const prog = { id: C.id, name: C.name, days: JSON.parse(JSON.stringify(C.days)), coach: true };
  const i = S.programs.findIndex((p) => p.id === C.id);
  if (i >= 0) S.programs[i] = prog; else S.programs.unshift(prog);
  (C.log || []).forEach((l) => {
    const id = `coach-${l.date}-${l.dayId}`;
    if (S.sessions.some((x) => x.id === id)) return;
    S.sessions.push({ id, date: l.date, startedAt: parseKey(l.date).getTime() + 18 * 3600000, duration: 0, name: l.name, programId: C.id, dayId: l.dayId, exercises: l.exercises.map((e) => ({ exId: e.exId, sets: e.sets.map(([kg, reps]) => ({ kg, reps })) })), prs: [], imported: true });
  });
  if (first) S.activeProgramId = C.id;
  S.coachVersion = C.version;
  save();
  return first ? 'Programme du coach ajouté' : 'Programme du coach mis à jour';
}

// ---------- Petits composants ----------
function toast(msg, undo = null) {
  $$('.toast').forEach((t) => t.remove());
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  if (undo) {
    const b = document.createElement('button'); b.className = 'toast-undo'; b.textContent = 'Annuler';
    b.addEventListener('click', (e) => { e.stopPropagation(); t.remove(); undo(); });
    t.appendChild(b);
  }
  document.body.appendChild(t); setTimeout(() => t.remove(), undo ? 4500 : 2200);
}

// ---------- Glisser vers la gauche pour supprimer (comme sur iPhone) ----------
const SWIPE_W = 88;
const TRASH = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';
const swipeRow = (kind, id, cellHtml) => `<div class="swipe" data-kind="${kind}" data-id="${id}"><button class="swipe-act" data-a="swipeDel" aria-label="Supprimer"><span class="in">${TRASH}<span>Supprimer</span></span></button>${cellHtml}</div>`;
let sw = null, blockClickUntil = 0;
function closeSwipes(except) {
  $$('.swipe.open').forEach((x) => { if (x !== except) { x.classList.remove('open'); x.querySelector('.swipe-fg').style.transform = ''; setTimeout(() => { if (!x.classList.contains('open')) x.classList.remove('reveal'); }, 300); } });
}
function swipeDelete(row) {
  const kind = row.dataset.kind, id = row.dataset.id;
  row.style.maxHeight = row.offsetHeight + 'px';
  row.classList.add('removing');
  requestAnimationFrame(() => { row.style.maxHeight = '0px'; });
  setTimeout(() => {
    if (kind === 'session') {
      const i = S.sessions.findIndex((x) => x.id === id); if (i < 0) return;
      const [item] = S.sessions.splice(i, 1); save(); render();
      toast('Séance supprimée', () => { S.sessions.push(item); save(); render(); });
    } else if (kind === 'check') {
      const i = S.checks.findIndex((x) => x.id === id); if (i < 0) return;
      const [item] = S.checks.splice(i, 1); save(); render();
      toast('Mesure supprimée', () => { S.checks.push(item); save(); render(); });
    }
  }, 220);
}
document.addEventListener('pointerdown', (e) => {
  const fg = e.target.closest('.swipe-fg');
  if (!fg) { if (!e.target.closest('.swipe-act')) closeSwipes(); return; }
  const row = fg.parentElement;
  sw = { row, fg, x0: e.clientX, y0: e.clientY, base: row.classList.contains('open') ? -SWIPE_W : 0, x: 0, moving: false, w: row.offsetWidth };
});
document.addEventListener('pointermove', (e) => {
  if (!sw) return;
  const dx = e.clientX - sw.x0, dy = e.clientY - sw.y0;
  if (!sw.moving) {
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { sw.moving = true; closeSwipes(sw.row); sw.row.classList.add('reveal'); sw.fg.style.transition = 'none'; }
    else if (Math.abs(dy) > 8) { sw = null; return; } else return;
  }
  sw.x = Math.min(0, sw.base + dx);
  sw.fg.style.transform = `translateX(${sw.x}px)`;
  sw.row.classList.toggle('full', sw.x < -sw.w * 0.55);
});
document.addEventListener('pointerup', () => {
  if (!sw) return;
  const s0 = sw; sw = null;
  if (!s0.moving) { if (s0.row.classList.contains('open')) { blockClickUntil = Date.now() + 400; closeSwipes(); } return; }
  blockClickUntil = Date.now() + 400;
  s0.fg.style.transition = '';
  if (s0.x < -s0.w * 0.55) { s0.fg.style.transform = 'translateX(-100%)'; swipeDelete(s0.row); return; }
  s0.row.classList.remove('full');
  if (s0.x < -40) { s0.row.classList.add('open'); s0.fg.style.transform = `translateX(-${SWIPE_W}px)`; }
  else { s0.row.classList.remove('open'); s0.fg.style.transform = ''; setTimeout(() => { if (!s0.row.classList.contains('open')) s0.row.classList.remove('reveal'); }, 300); }
});
document.addEventListener('pointercancel', () => {
  if (sw && sw.moving) { sw.fg.style.transition = ''; sw.fg.style.transform = sw.row.classList.contains('open') ? `translateX(-${SWIPE_W}px)` : ''; sw.row.classList.remove('full'); }
  sw = null;
});
document.addEventListener('click', (e) => { if (Date.now() < blockClickUntil && e.target.closest('.swipe-fg')) { e.stopPropagation(); e.preventDefault(); } }, true);

function niceStep(range, n) { const raw = range / n, mag = Math.pow(10, Math.floor(Math.log10(raw))); const r = raw / mag; return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag; }
function lineChart(pts, unit = '') {
  if (pts.length < 2) return '<div class="empty">La courbe apparaîtra dès ta deuxième mesure.</div>';
  const W = 340, H = 180, L = 36, R = 14, T = 14, B = 24;
  const x0 = Math.min(...pts.map((p) => p.x)); let x1 = Math.max(...pts.map((p) => p.x)); if (x1 === x0) x1 = x0 + 1;
  let y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y)); if (y1 - y0 < 1e-9) { y0 -= 1; y1 += 1; }
  const step = niceStep(y1 - y0, 3); y0 = Math.floor(y0 / step) * step; y1 = Math.ceil(y1 / step) * step;
  const sx = (x) => L + ((x - x0) / (x1 - x0)) * (W - L - R), sy = (y) => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
  const dec = step < 1 ? 1 : 0;
  let g = '';
  for (let v = y0; v <= y1 + step / 2; v += step) g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${sy(v).toFixed(1)}" y2="${sy(v).toFixed(1)}"/><text class="axis" x="${L - 6}" y="${(sy(v) + 3.5).toFixed(1)}" text-anchor="end">${nf(v, dec)}</text>`;
  const dl = (ms) => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  g += `<text class="axis" x="${L}" y="${H - 6}">${dl(x0)}</text><text class="axis" x="${W - R}" y="${H - 6}" text-anchor="end">${dl(x1)}</text>`;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('');
  const area = `${line}L${sx(pts[pts.length - 1].x).toFixed(1)},${sy(y0).toFixed(1)}L${sx(pts[0].x).toFixed(1)},${sy(y0).toFixed(1)}Z`;
  const dots = pts.length <= 40 ? pts.slice(0, -1).map((p) => `<circle class="pt" cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="3"/>`).join('') : '';
  const lp = pts[pts.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution, dernière valeur ${nf(lp.y, 1)} ${unit}">${g}<path class="ar" d="${area}"/><path class="ln" d="${line}"/>${dots}<circle class="end" cx="${sx(lp.x).toFixed(1)}" cy="${sy(lp.y).toFixed(1)}" r="5"/></svg>`;
}
function delta(v, unit) {
  if (!Number.isFinite(v)) return '';
  const cls = Math.abs(v) < 0.05 ? 'flat' : v < 0 ? 'down' : 'up';
  return `<span class="delta ${cls}">${v > 0.04 ? '▲ +' : v < -0.04 ? '▼ −' : '= '}${nf(Math.abs(v), 1)} ${unit}</span>`;
}
const cell = ({ a = '', data = '', badge = '', t, s = '', v = '', chev = true, cls = '' }) => `<button class="cell ${cls}" ${a ? `data-a="${a}"` : ''} ${data}>${badge}<span class="main"><span class="t" style="display:block">${t}</span>${s ? `<span class="s" style="display:block">${s}</span>` : ''}</span>${v ? `<span class="v">${v}</span>` : ''}${chev ? `<span class="chev">${ICON.chev}</span>` : ''}</button>`;
const exLine = (e) => `${e.sets} × ${esc(e.reps)}${e.kg ? ` · ${nf(e.kg, 2)} kg` : ''}`;

// ---------- Fenêtres modales ----------
const sheets = [];
const topSheet = () => sheets[sheets.length - 1];
function openSheet(ctrl) {
  const w = document.createElement('div'); w.className = 'sheet-wrap';
  w.addEventListener('click', (e) => { if (e.target === w) closeSheet(); });
  ctrl.el = w; sheets.push(ctrl); $('#sheets').appendChild(w); paintSheet(ctrl); return ctrl;
}
function paintSheet(ctrl = topSheet()) {
  if (!ctrl) return;
  const sc = ctrl.el.querySelector('.sheet') ? ctrl.el.querySelector('.sheet').scrollTop : 0;
  ctrl.el.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${ctrl.render()}</div>`;
  ctrl.el.querySelector('.sheet').scrollTop = sc;
  if (ctrl.after) ctrl.after(ctrl.el);
}
function closeSheet() { const c = sheets.pop(); if (c) { c.el.remove(); if (c.onClose) c.onClose(); } }
function closeAllSheets() { while (sheets.length) closeSheet(); }
const sheetHead = (title, right = '') => `<div class="sheet-head"><button class="link l" data-a="closeSheet">Fermer</button><div class="title">${title}</div><div class="r">${right}</div></div>`;
function confirmSheet({ title, text = '', ok = 'Supprimer', onOk }) {
  openSheet({ onOk, render: () => `${sheetHead('')}<div style="text-align:center" class="stack"><h2>${title}</h2>${text ? `<p class="muted small" style="margin:0">${text}</p>` : ''}</div><div class="stack"><button class="btn red block" data-a="confirmOk">${ok}</button><button class="btn block" data-a="closeSheet">Annuler</button></div>` });
}

// ---------- Vue Entraînement ----------
const DAY_ICONS = {
  upper: { c: 'linear-gradient(145deg,#4c9dff,#3a5bd9)', svg: '<path d="M6.5 19c-.8-3.6.4-7.4 3-9.8l2.4-2.4 2.6.9-.8 2.8-2.2.4-.9 2.6c2.2-1 5.2-.6 6.6 1.6 1.6 2.6-.4 5.4-3.6 5.4H8.4c-.9 0-1.7-.6-1.9-1.5z" fill="#fff"/>' },
  lower: { c: 'linear-gradient(145deg,#34d27b,#139e5a)', svg: '<path d="M9.5 3.5v7.5l-1.6 9h2.8l1.3-7.5M14.5 3.5v7.5l1.6 9h-2.8" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>' },
  push: { c: 'linear-gradient(145deg,#ffa62b,#f56a00)', svg: '<path d="M3.5 6.5h17M6 4v5M18 4v5" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/><path d="M12 20v-9M8.5 14.5 12 11l3.5 3.5" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>' },
  pull: { c: 'linear-gradient(145deg,#c86bf5,#8a3fe0)', svg: '<path d="M3.5 4.5h17" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/><path d="M7.5 4.5 10 10h4l2.5-5.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="12" cy="13.2" r="2" fill="#fff"/><path d="M12 15.5v4.5" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/>' },
  leg: { c: 'linear-gradient(145deg,#4fd1e8,#0f8fd6)', svg: '<path d="M9.5 3.5v7.5l-1.6 9h2.8l1.3-7.5M14.5 3.5v7.5l1.6 9h-2.8" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>' },
  other: { c: 'linear-gradient(145deg,#9a9aa1,#6c6c72)', svg: '<path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/>' },
};
function dayKind(name) {
  const n = norm(name);
  if (/upper|haut/.test(n)) return 'upper';
  if (/lower|bas/.test(n)) return 'lower';
  if (/push|pousse/.test(n)) return 'push';
  if (/pull|tir/.test(n)) return 'pull';
  if (/leg|jambe/.test(n)) return 'leg';
  return 'other';
}
const DAY_LETTER = ['', 'L', 'M', 'M', 'J', 'V', 'S', 'D'];
// Icônes au trait, blanches, façon iOS (type de séance et groupe musculaire)
const LINE = {
  dumbbell: '<path d="M6.5 7.5v9M17.5 7.5v9M3.8 10v4M20.2 10v4M6.5 12h11"/>',
  leg: '<path d="M8.5 3.5h5.5l-1.2 7.2 1.9 6.6v2.2h3.8"/><path d="M8.5 3.5l1.6 7.4-1.4 9.1"/>',
  push: '<path d="M4 5.5h16M7 3.5v4M17 3.5v4"/><path d="M12 20.5v-10M8.5 14 12 10.5l3.5 3.5"/>',
  pull: '<path d="M4 4h16"/><path d="M12 7.5v12M8.5 16 12 19.5l3.5-3.5"/>',
  press: '<path d="M4 4.5h16M7 2.5v4M17 2.5v4"/><path d="M8 20.5v-6l2-3.5M16 20.5v-6l-2-3.5"/><circle cx="12" cy="9" r="1.6"/>',
  arm: '<path d="M5 19.5c-.6-3.4.6-7 3.2-9.3l2.3-2.2 2.4.8-.7 2.6-2 .4-.9 2.5c2-.9 4.8-.6 6.1 1.5 1.5 2.4-.4 5-3.3 5H6.8c-.9 0-1.6-.6-1.8-1.3z"/>',
  abs: '<rect x="6.5" y="3.5" width="11" height="17" rx="4"/><path d="M12 3.5v17M6.8 9h10.4M6.8 14.5h10.4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  xmark: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
};
const lineIcon = (k, size = 24) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${LINE[k] || LINE.dumbbell}</svg>`;
const KIND_LINE = { upper: 'dumbbell', lower: 'leg', leg: 'leg', push: 'push', pull: 'pull', other: 'dumbbell' };
const MUSCLE_LINE = { Pectoraux: 'push', Dos: 'pull', 'Épaules': 'press', Biceps: 'arm', Triceps: 'arm', Quadriceps: 'leg', Ischios: 'leg', Fessiers: 'leg', Mollets: 'leg', Abdos: 'abs', Cardio: 'heart' };
const dayIcon = (d) => `<span class="line-ic">${lineIcon(KIND_LINE[dayKind(d.name)], 26)}</span>`;
const exIcon = (ex) => `<span class="ex-ic">${lineIcon(MUSCLE_LINE[ex.muscle] || 'dumbbell', 20)}</span>`;
const dayLabel = (d) => esc(d.name.replace(/\s·\s/, ' - '));

const views = {};
views.train = () => {
  const k = dkey(), prog = activeProgram(), nx = nextWorkout();
  const live = S.live ? `<div class="card" id="liveBanner"><div class="row"><div class="grow"><div class="overline">Séance en cours</div><h2>${esc(S.live.name)}</h2></div><span class="clock" style="font-size:17px">${fmtClock((Date.now() - S.live.startedAt) / 1000)}</span></div><button class="btn filled block" data-a="liveOpen">Reprendre</button></div>` : '';
  const doneSet = prog ? doneThisWeek(prog) : new Set();
  const when = (n) => (n.late ? 'À rattraper' : n.inDays === 0 ? 'Aujourd’hui' : n.inDays === 1 ? 'Demain' : 'Prochaine');
  const days = prog ? prog.days.map((d) => {
    const isNext = nx && !S.live && nx.day.id === d.id, isDone = doneSet.has(d.id);
    const v = isNext ? `<span class="tag next">${when(nx)}</span>` : isDone ? `<span class="tag done">✓</span>` : '';
    return cell({ a: 'dayOpen', cls: `day-row${isNext ? ' next' : ''}`, data: `data-d="${d.id}"`, badge: dayIcon(d), t: dayLabel(d), v });
  }).join('') : '';
  return `<header class="large"><div><h1>Entraînement</h1><div class="sub">${cap(fmtDay(k))}</div></div><button class="icon-btn" data-a="settings" aria-label="Réglages">${ICON.gear}</button></header>
    ${live}
    ${prog ? `<div class="section"><div class="section-h">${esc(prog.name)} · ${doneSet.size}/${prog.days.length} cette semaine</div><div class="day-pills">${days}</div><button class="link" data-a="dayAdd" style="align-self:center">+ Ajouter une journée</button></div>` : '<div class="card"><h2>Aucun programme</h2><p class="muted small" style="margin:0">Crée un programme ou lance une séance libre.</p></div>'}
    <div class="day-pills">
      ${cell({ a: 'startFree', cls: 'day-row', badge: `<span class="line-ic">${ICON.play}</span>`, t: 'Séance libre' })}
      ${cell({ a: 'exLibrary', cls: 'day-row', badge: `<span class="line-ic">${ICON.trophy}</span>`, t: 'Exercices et records' })}
      ${cell({ a: 'programs', cls: 'day-row', badge: `<span class="line-ic">${ICON.list}</span>`, t: 'Programmes', v: S.programs.length > 1 ? String(S.programs.length) : '' })}
    </div>`;
};

// ---------- Vue Historique ----------
views.history = () => {
  const ss = sessionsSorted();
  const month = dkey().slice(0, 7);
  const ms = ss.filter((s) => s.date.startsWith(month));
  let list = '', cur = '';
  ss.forEach((s) => {
    const m = cap(parseKey(s.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }));
    if (m !== cur) { if (cur) list += '</div></div>'; cur = m; list += `<div class="section"><div class="section-h">${m}</div><div class="group">`; }
    list += swipeRow('session', s.id, cell({ a: 'sessionOpen', cls: 'swipe-fg', data: `data-id="${s.id}"`, t: esc(s.name), s: `${fmtShort(s.date)}${s.duration ? ' · ' + fmtDur(s.duration) : ''} · ${sessionSets(s)} séries`, v: s.prs && s.prs.length ? `<span class="pill pr">${s.prs.length} record${s.prs.length > 1 ? 's' : ''}</span>` : '' }));
  });
  if (cur) list += '</div></div>';
  if (ss.length) list += '<div class="section-f">Glisse une séance vers la gauche pour la supprimer.</div>';
  return `<header class="large"><div><h1>Historique</h1></div></header>
    <div class="card"><div class="grid2"><div class="metric"><span class="k">Séances ce mois-ci</span><span class="v">${ms.length}</span></div><div class="metric"><span class="k">Volume ce mois-ci</span><span class="v">${nf(ms.reduce((a, s) => a + sessionVolume(s), 0) / 1000, 1)}<small>t</small></span></div></div></div>
    ${list || '<div class="card"><div class="empty">Tes séances terminées apparaîtront ici.</div></div>'}`;
};

// ---------- Vue Suivi ----------
views.track = () => {
  const cs = checksSorted();
  const series = (key) => cs.filter((c) => Number.isFinite(c[key]));
  const W = series('kg'), T = series('waist');
  const lastAny = cs[cs.length - 1];
  const due = !lastAny || daysBetween(lastAny.date, dkey()) >= 7;
  const metric = (label, list, key, unit) => {
    const last = list[list.length - 1], prev = list[list.length - 2];
    return `<div class="metric"><span class="k">${label}</span><span class="v">${last ? nf1(last[key]) : '—'}<small>${unit}</small></span>${prev ? delta(last[key] - prev[key], unit) : `<span class="delta flat">${last ? 'Première mesure' : 'Pas encore mesuré'}</span>`}</div>`;
  };
  const since = [];
  if (W.length > 1) since.push(`${W[W.length - 1].kg - W[0].kg > 0 ? '+' : '−'}${nf1(Math.abs(W[W.length - 1].kg - W[0].kg))} kg`);
  if (T.length > 1) since.push(`${T[T.length - 1].waist - T[0].waist > 0 ? '+' : '−'}${nf1(Math.abs(T[T.length - 1].waist - T[0].waist))} cm`);
  const sel = ui.chart === 'waist' ? T : W;
  const chart = lineChart(sel.map((c) => ({ x: parseKey(c.date).getTime(), y: c[ui.chart] })), ui.chart === 'kg' ? 'kg' : 'cm');
  const rows = cs.slice().reverse().map((c) => {
    const parts = [Number.isFinite(c.kg) ? `${nf1(c.kg)} kg` : '', Number.isFinite(c.waist) ? `${nf1(c.waist)} cm` : ''].filter(Boolean).join(' · ');
    return swipeRow('check', c.id, cell({ a: 'checkEdit', cls: 'swipe-fg', data: `data-id="${c.id}"`, t: fmtShort(c.date), s: `Semaine ${isoWeek(c.date)}`, v: parts }));
  }).join('');
  const tip = '<div class="section-f">Pour comparer d’une semaine à l’autre, mesure-toi le même jour, le matin à jeun, ruban au niveau du nombril.</div>';
  return `<header class="large"><div><h1>Suivi</h1><div class="sub">Poids et tour de taille, chaque semaine</div></div></header>
    <div class="card">
      <div class="grid2">${metric('Poids', W, 'kg', 'kg')}${metric('Tour de taille', T, 'waist', 'cm')}</div>
      ${since.length ? `<div class="foot">Depuis le ${fmtDay(cs[0].date, { day: 'numeric', month: 'long' })} : ${since.join(' · ')}</div>` : ''}
      <button class="btn ${due ? 'filled' : 'tinted'} block" data-a="checkNew">${due ? 'Ajouter ma mesure de la semaine' : 'Ajouter une mesure'}</button>
    </div>
    <div class="section"><div class="section-h">Évolution</div><div class="card">
      <div class="segment" role="tablist"><button class="${ui.chart === 'kg' ? 'on' : ''}" data-a="chart" data-v="kg">Poids</button><button class="${ui.chart === 'waist' ? 'on' : ''}" data-a="chart" data-v="waist">Tour de taille</button></div>
      ${chart}</div></div>
    ${rows ? `<div class="section"><div class="section-h">Toutes les mesures</div><div class="group">${rows}</div>${tip}</div>` : tip}`;
};

function checkSheet(id = null) {
  const c = id ? S.checks.find((x) => x.id === id) : null;
  const last = checksSorted().pop();
  const k = dkey();
  openSheet({
    id,
    render: () => `${sheetHead(c ? 'Modifier la mesure' : 'Nouvelle mesure')}
      <form class="stack" data-submit="checkSave" style="gap:18px">
        <div class="form-group">
          <div class="fr"><label for="ck-date">Date</label><input type="date" id="ck-date" name="date" value="${c ? c.date : k}" max="${k}" style="flex-basis:170px"></div>
          <div class="fr"><label for="ck-kg">Poids</label><input type="text" inputmode="decimal" id="ck-kg" name="kg" value="${c && Number.isFinite(c.kg) ? nf1(c.kg) : ''}" placeholder="${last && Number.isFinite(last.kg) ? nf1(last.kg) : '75,0'}"><span class="u">kg</span></div>
          <div class="fr"><label for="ck-w">Tour de taille</label><input type="text" inputmode="decimal" id="ck-w" name="waist" value="${c && Number.isFinite(c.waist) ? nf1(c.waist) : ''}" placeholder="${last && Number.isFinite(last.waist) ? nf1(last.waist) : '85,0'}"><span class="u">cm</span></div>
        </div>
        <button class="btn filled block" type="submit">Enregistrer</button>
        ${c ? '<button class="btn red block" type="button" data-a="checkDel">Supprimer la mesure</button>' : ''}
      </form>`,
    after: (el) => { if (!c) setTimeout(() => { const i = el.querySelector('#ck-kg'); if (i) i.focus(); }, 300); },
  });
}

// ---------- Rendu principal ----------
function render() {
  $('#main').innerHTML = views[ui.tab]();
  $$('.tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.t === ui.tab));
  placeTabInd();
  renderLive();
}

// ---------- Barre d'onglets Liquid Glass : bulle qui suit le doigt ----------
let tabInd = null, tabDrag = null, tabBlockUntil = 0;
function initTabbar() {
  const nav = $('.tabbar nav');
  tabInd = document.createElement('span'); tabInd.className = 'tab-ind'; tabInd.setAttribute('aria-hidden', 'true');
  nav.prepend(tabInd);
  nav.addEventListener('pointerdown', (e) => {
    const r = nav.getBoundingClientRect();
    tabDrag = { x0: e.clientX, moved: false, r, w: tabInd.offsetWidth };
  });
  nav.addEventListener('pointermove', (e) => {
    if (!tabDrag) return;
    if (!tabDrag.moved && Math.abs(e.clientX - tabDrag.x0) < 6) return;
    if (!tabDrag.moved) { try { nav.setPointerCapture(e.pointerId); } catch (er) { /* rien */ } }
    tabDrag.moved = true;
    nav.classList.add('dragging');
    const { r, w } = tabDrag;
    const x = clamp(e.clientX - r.left - w / 2, 5, r.width - w - 5);
    tabInd.classList.add('drag');
    tabInd.style.transform = `translateX(${x}px) scale(1.12)`;
    const i = clamp(Math.floor(((e.clientX - r.left) / r.width) * 3), 0, 2);
    $$('.tabbar button').forEach((b, k) => b.classList.toggle('hover', k === i));
  });
  const end = (e) => {
    if (!tabDrag) return;
    const d = tabDrag; tabDrag = null;
    nav.classList.remove('dragging'); tabInd.classList.remove('drag');
    const hov = $('.tabbar button.hover');
    $$('.tabbar button').forEach((b) => b.classList.remove('hover'));
    if (d.moved && e.type === 'pointerup' && hov) {
      tabBlockUntil = Date.now() + 400;
      if (hov.dataset.t !== ui.tab) { ui.tab = hov.dataset.t; render(); window.scrollTo(0, 0); return; }
    }
    placeTabInd();
  };
  nav.addEventListener('pointerup', end);
  nav.addEventListener('pointercancel', end);
  nav.addEventListener('click', (e) => { if (Date.now() < tabBlockUntil) { e.stopPropagation(); e.preventDefault(); } }, true);
  window.addEventListener('resize', () => placeTabInd(false));
}
function placeTabInd(animate = true) {
  if (!tabInd) return;
  const on = $('.tabbar button.on'); if (!on) return;
  if (!animate) tabInd.style.transition = 'none';
  tabInd.style.width = on.offsetWidth + 'px';
  tabInd.style.transform = `translateX(${on.offsetLeft}px)`;
  if (!animate) { void tabInd.offsetWidth; tabInd.style.transition = ''; }
}

// ---------- Séance en cours ----------
function mkLiveEx(exId, tpl) {
  const prev = lastSetsFor(exId);
  const n = (tpl && tpl.sets) || (prev && prev.length) || 3;
  return { exId, target: tpl ? `${tpl.sets} × ${tpl.reps}` : '', repsT: tpl && /^\d+$/.test(String(tpl.reps).trim()) ? String(tpl.reps).trim() : '', kg: (tpl && tpl.kg) || 0, note: (tpl && tpl.note) || '', rest: (tpl && tpl.rest) || S.settings.rest, sets: Array.from({ length: n }, () => ({ kg: '', reps: '', done: false })) };
}
function startWorkout(progId, dayId) {
  if (S.live) { ui.liveOpen = true; render(); toast('Une séance est déjà en cours'); return; }
  const prog = S.programs.find((p) => p.id === progId);
  const dy = prog && prog.days.find((d) => d.id === dayId);
  S.live = { id: uid(), startedAt: Date.now(), name: dy ? dy.name : 'Séance libre', programId: prog ? prog.id : null, dayId: dy ? dy.id : null, exercises: dy ? dy.exercises.map((e) => mkLiveEx(e.exId, e)) : [], restEnd: null, restTotal: 0 };
  ui.liveOpen = true; save(); closeAllSheets(); render(); wakeLock();
}
let wl = null;
async function wakeLock() { try { if ('wakeLock' in navigator && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } catch (e) { wl = null; } }

const cleanNote = (n) => String(n || '').replace(/^\s*1-2 RIR\s*(·\s*)?/i, '').trim();
function liveExCard(e, i) {
  const ex = exById(e.exId), prev = lastSetsFor(e.exId) || [];
  const done = e.sets.filter((s) => s.done).length, allDone = done === e.sets.length && done > 0;
  if (allDone && e.collapsed !== false) {
    const best = e.sets.reduce((a, s) => Math.max(a, num(s.kg) || 0), 0);
    return `<button class="exc folded" data-a="liveExpand" data-e="${i}">${exIcon(ex)}<span class="grow"><span class="fn">${esc(ex.name)}</span><span class="fs">${done} séries${best ? ` · ${nf(best, 2)} kg` : ''}</span></span><span class="fok">${ICON.check}</span></button>`;
  }
  const rows = e.sets.map((s, j) => {
    const p = prev[j];
    const phKg = e.kg ? nf(e.kg, 2) : p ? nf(p.kg, 2) : j > 0 ? e.sets[j - 1].kg : '';
    const phR = p ? p.reps : j > 0 && e.sets[j - 1].reps !== '' ? e.sets[j - 1].reps : (e.repsT || '');
    return `<div class="row-wrap ${s.done ? 'done' : ''}">
      <input type="text" inputmode="numeric" id="ls-${i}-${j}-reps" value="${esc(s.reps)}" placeholder="${esc(phR)}" data-in="liveSet" data-e="${i}" data-s="${j}" data-f="reps" aria-label="Répétitions série ${j + 1}">
      <input type="text" inputmode="decimal" id="ls-${i}-${j}-kg" value="${esc(s.kg)}" placeholder="${esc(phKg)}" data-in="liveSet" data-e="${i}" data-s="${j}" data-f="kg" aria-label="Charge série ${j + 1}">
      <button class="tick ${s.done ? 'on' : ''}" data-a="liveToggle" data-e="${i}" data-s="${j}" aria-label="Valider la série ${j + 1}">${ICON.check}</button></div>`;
  }).join('');
  const note = cleanNote(e.note);
  const meta = [e.target ? esc(e.target) : '', e.kg ? `<b>${nf(e.kg, 2)} kg</b>` : '', note ? esc(note) : ''].filter(Boolean).join(' · ');
  return `<div class="exc"><div class="hd">${exIcon(ex)}<div class="grow"><h3>${esc(ex.name)}</h3>${meta ? `<div class="meta">${meta}</div>` : ''}</div>
      <button class="icon-btn plain" data-a="exHist" data-e="${i}" aria-label="Historique et options">${ICON.clock}</button>
      ${allDone ? `<button class="icon-btn plain" data-a="liveCollapse" data-e="${i}" aria-label="Réduire">${ICON.up}</button>` : ''}</div>
    <div class="sets"><div class="h">Reps</div><div class="h">kg</div><div class="h"></div>${rows}</div>
    <button class="link small" data-a="liveAddSet" data-e="${i}" style="align-self:flex-start;padding:0">+ Ajouter une série</button></div>`;
}

// Historique complet d'un exercice + options (disques, séries, retirer)
function exHistSheet(i) {
  const e = S.live.exercises[i], ex = exById(e.exId), h = exerciseHistory(e.exId).slice().reverse();
  openSheet({
    render: () => `${sheetHead(esc(ex.name))}
      ${h.length ? `<div class="group">${h.map((x) => cell({ t: fmtShort(x.date), s: x.sets.map((s) => `${s.reps} × ${nf(s.kg, 2)} kg`).join('<br>'), chev: false })).join('')}</div>` : '<div class="empty" style="text-align:center">Pas encore d’historique pour cet exercice.</div>'}
      <div class="group">
        ${cell({ a: 'platesLive', data: `data-e="${i}"`, t: 'Disques à charger' })}
        ${e.sets.length > 1 ? cell({ a: 'liveDelSet', data: `data-e="${i}"`, t: 'Retirer la dernière série', chev: false }) : ''}
        <button class="cell danger" data-a="liveRemoveEx" data-e="${i}">Retirer de la séance</button>
      </div>`,
  });
}

function renderLive() {
  const root = $('#live');
  if (!S.live || !ui.liveOpen) { root.hidden = true; root.innerHTML = ''; document.body.style.overflow = ''; renderRest(); return; }
  const L = S.live, sc = root.querySelector('.live') ? root.querySelector('.live').scrollTop : 0;
  root.hidden = false; document.body.style.overflow = 'hidden';
  root.innerHTML = `<div class="live"><div class="live-head"><div class="in">
      <div><button class="icon-btn" data-a="liveMin" aria-label="Réduire la séance">${ICON.down}</button></div>
      <div class="mid"><div class="n">${esc(L.name)}</div><div class="clock" id="clock">${fmtClock((Date.now() - L.startedAt) / 1000)}</div></div>
      <div style="justify-self:end"><button class="btn filled sm" data-a="liveFinish">Terminer</button></div></div></div>
    <div class="live-body">${L.exercises.map(liveExCard).join('') || '<div class="exc"><div class="empty">Ajoute ton premier exercice.</div></div>'}
      <div class="day-pills">
        <button class="cell day-row act" data-a="liveAddEx"><span class="line-ic">${lineIcon('plus', 24)}</span><span class="main"><span class="t">Ajouter un exercice</span></span></button>
        <button class="cell day-row act red" data-a="liveCancel"><span class="line-ic">${lineIcon('xmark', 24)}</span><span class="main"><span class="t">Abandonner la séance</span></span></button>
      </div></div></div>`;
  root.querySelector('.live').scrollTop = sc;
  renderRest();
}
// Barre du bas : chrono de repos pendant la séance, et mini-lecteur partout dans l'appli quand la séance est réduite
function renderRest() {
  const el = $('#rest'), L = S.live;
  const mini = !!L && !ui.liveOpen;
  if (!L || (!L.restEnd && !mini)) { el.hidden = true; el.innerHTML = ''; el.dataset.mode = ''; document.body.classList.remove('has-mini'); return; }
  const resting = !!L.restEnd;
  const mode = `${mini ? 'mini' : 'full'}-${resting ? 'rest' : 'run'}`;
  if (el.dataset.mode !== mode) {
    el.dataset.mode = mode;
    el.className = mini ? 'rest mini' : 'rest';
    const ctrls = '<button class="btn sm" data-a="restAdd" data-v="-15">−15</button><button class="btn sm" data-a="restAdd" data-v="15">+15</button><button class="btn sm filled" data-a="restSkip">Passer</button>';
    if (!mini) el.innerHTML = `<div class="prog"></div><div class="in"><div class="grow"><div class="foot">Repos</div><div class="t" id="restT"></div></div>${ctrls}</div>`;
    else if (resting) el.innerHTML = `<div class="prog"></div><div class="in"><button class="mini-open" data-a="liveOpen" aria-label="Rouvrir la séance"><span class="foot">Repos · ${esc(L.name)}</span><span class="t" id="restT"></span></button>${ctrls}</div>`;
    else el.innerHTML = `<div class="in"><button class="mini-open" data-a="liveOpen" aria-label="Rouvrir la séance"><span class="foot">Séance en cours</span><span class="mn">${esc(L.name)}</span></button><span class="clock" id="miniClock"></span><button class="btn sm filled" data-a="liveOpen">Ouvrir</button></div>`;
  }
  el.hidden = false;
  document.body.classList.toggle('has-mini', mini);
  if (resting) {
    const left = Math.max(0, (L.restEnd - Date.now()) / 1000);
    const t = $('#restT'); if (t) t.textContent = fmtClock(Math.ceil(left));
    const pr = el.querySelector('.prog'); if (pr) pr.style.width = `${clamp((left / (L.restTotal || 1)) * 100, 0, 100)}%`;
  } else {
    const c = $('#miniClock'); if (c) c.textContent = fmtClock((Date.now() - L.startedAt) / 1000);
  }
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
        g.gain.setValueAtTime(0.0001, t + o); g.gain.exponentialRampToValueAtTime(0.35, t + o + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + o + 0.2);
        osc.connect(g); g.connect(actx.destination); osc.start(t + o); osc.stop(t + o + 0.22);
      });
    }
  } catch (e) { /* son indisponible */ }
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) { /* rien */ }
}
function finishWorkout() {
  const L = S.live;
  const exercises = L.exercises.map((e) => ({ exId: e.exId, sets: e.sets.filter((s) => s.done).map((s) => ({ kg: num(s.kg) || 0, reps: Math.round(num(s.reps)) || 0 })) })).filter((e) => e.sets.length);
  const prs = [];
  exercises.forEach((e) => {
    const h = exerciseHistory(e.exId); const prevBest = h.length ? Math.max(...h.map((x) => x.best)) : 0;
    if (prevBest > 0 && Math.max(...e.sets.map((s) => e1rm(s.kg, s.reps))) > prevBest + 0.01) prs.push(e.exId);
  });
  const s = { id: L.id, date: dkey(new Date(L.startedAt)), startedAt: L.startedAt, duration: Math.round((Date.now() - L.startedAt) / 1000), name: L.name, programId: L.programId, dayId: L.dayId, exercises, prs };
  if (exercises.length) S.sessions.push(s);
  S.live = null;
  try { if (wl) wl.release(); } catch (e) { /* rien */ }
  save(true); closeAllSheets(); render();
  if (!exercises.length) { toast('Aucune série validée, rien d’enregistré'); return; }
  openSheet({
    render: () => `${sheetHead('')}<div style="text-align:center" class="stack"><h2>Séance terminée</h2><p class="muted small" style="margin:0">${esc(s.name)}</p></div>
      <div class="card"><div class="grid2"><div class="metric"><span class="k">Durée</span><span class="v">${fmtDur(s.duration)}</span></div><div class="metric"><span class="k">Volume</span><span class="v">${nf(sessionVolume(s))}<small>kg</small></span></div></div>
      ${prs.length ? `<div class="row"><span class="pill pr">Record</span><span class="small">${prs.map((id) => esc(exById(id).name)).join(', ')}</span></div>` : ''}</div>
      <button class="btn filled block" data-a="closeSheet">OK</button>`,
  });
}

// ---------- Fenêtres métier ----------
function exSearchSheet({ title, onPick = null }) {
  openSheet({
    query: '', muscle: 'Tous', onPick,
    results() {
      const q = norm(this.query.trim());
      const list = allExercises().filter((e) => (this.muscle === 'Tous' || e.muscle === this.muscle) && (!q || norm(e.name).includes(q)));
      if (!list.length) return '<div class="empty">Aucun exercice trouvé.</div>';
      if (this.onPick) return `<div class="group">${list.map((e) => cell({ a: 'pick', data: `data-id="${e.id}"`, t: esc(e.name), s: `${esc(e.muscle)} · ${esc(e.equip)}`, chev: false })).join('')}</div>`;
      const withH = list.map((e) => ({ e, h: exerciseHistory(e.id) })).sort((a, b) => b.h.length - a.h.length);
      return `<div class="group">${withH.map(({ e, h }) => cell({ a: 'exOpen', data: `data-id="${e.id}"`, t: esc(e.name), s: esc(e.muscle), v: h.length ? `${nf(Math.max(...h.map((x) => x.best)), 1)} kg` : '' })).join('')}</div><div class="section-f">À droite : ton 1RM estimé, la charge max théorique sur 1 répétition.</div>`;
    },
    render() {
      return `${sheetHead(title, '<button class="link b" data-a="exCreate">Créer</button>')}<input type="search" id="pick-q" placeholder="Rechercher" value="${esc(this.query)}" data-in="pickerQuery" aria-label="Rechercher un exercice">
        <div class="chips">${['Tous'].concat(MUSCLES).map((m) => `<button class="chip ${this.muscle === m ? 'on' : ''}" data-a="pickMuscle" data-v="${m}">${m}</button>`).join('')}</div><div id="pickRes">${this.results()}</div>`;
    },
  });
}
function exCreateSheet() {
  openSheet({
    render: () => `${sheetHead('Nouvel exercice')}<form class="stack" data-submit="exCreate"><div class="field"><label for="exn">Nom</label><input type="text" id="exn" name="name" required placeholder="Ex. : Rowing machine"></div>
      <div class="grid2"><div class="field"><label for="exm">Muscle</label><select id="exm" name="muscle">${MUSCLES.map((m) => `<option>${m}</option>`).join('')}</select></div>
      <div class="field"><label for="exe">Matériel</label><select id="exe" name="equip">${['Machine', 'Poulie', 'Haltères', 'Barre', 'Poids du corps', 'Accessoire'].map((m) => `<option>${m}</option>`).join('')}</select></div></div>
      <button class="btn filled block" type="submit">Créer</button></form>`,
  });
}
function exSheet(id) {
  const ex = exById(id), h = exerciseHistory(id);
  const best = h.reduce((a, x) => Math.max(a, x.best), 0);
  const heaviest = h.flatMap((x) => x.sets).reduce((a, s) => Math.max(a, s.kg), 0);
  openSheet({
    exId: id,
    render: () => `${sheetHead(esc(ex.name))}
      <div class="card"><div class="grid2"><div class="metric"><span class="k">1RM estimé</span><span class="v">${best ? nf(best, 1) : '—'}<small>kg</small></span></div><div class="metric"><span class="k">Plus lourd</span><span class="v">${heaviest ? nf(heaviest, 2) : '—'}<small>kg</small></span></div></div>
      ${lineChart(h.map((x) => ({ x: x.startedAt, y: x.best })), 'kg')}</div>
      ${h.length ? `<div class="section"><div class="section-h">Dernières séances</div><div class="group">${h.slice().reverse().slice(0, 8).map((x) => cell({ t: fmtShort(x.date), s: x.sets.map((s) => `${nf(s.kg, 2)}×${s.reps}`).join(' · '), chev: false })).join('')}</div></div>` : ''}
      <button class="btn tinted block" data-a="platesFrom" data-kg="${heaviest || 60}">Disques à charger</button>
      ${ex.custom ? '<button class="btn red block" data-a="exDelete">Supprimer cet exercice</button>' : ''}`,
  });
}
function platesFor(total, bar) {
  let side = (total - bar) / 2; const out = [];
  if (side < 0) return { out, rest: 0 };
  [25, 20, 15, 10, 5, 2.5, 1.25].forEach((p) => { while (side >= p - 1e-9) { out.push(p); side -= p; } });
  return { out, rest: Math.round(side * 2 * 100) / 100 };
}
function platesSheet(kg) {
  openSheet({
    kg: kg || 60, bar: S.settings.bar,
    result() {
      if (this.kg < this.bar) return `<div class="empty" style="text-align:center">La barre seule pèse déjà ${this.bar} kg.</div>`;
      const { out, rest } = platesFor(this.kg, this.bar);
      const pl = (p) => `<span class="plate k${String(p).replace('.', '-')}">${nf(p, 2)}</span>`;
      return `<div class="barbell" aria-hidden="true"><span class="sleeve"></span>${out.slice().reverse().map(pl).join('')}<span class="shaft"></span>${out.map(pl).join('')}<span class="sleeve"></span></div>
        <div style="text-align:center"><div class="foot">De chaque côté</div><div class="metric" style="align-items:center"><span class="v" style="font-size:28px">${out.length ? out.map((p) => nf(p, 2)).join(' + ') + ' kg' : 'Barre seule'}</span></div>${rest > 0 ? `<div class="foot" style="color:var(--red)">Il manque ${nf(rest, 2)} kg pour tomber juste.</div>` : ''}</div>`;
    },
    render() {
      return `${sheetHead('Disques à charger')}<div class="form-group"><div class="fr"><label for="pl-kg">Charge totale</label><input type="text" inputmode="decimal" id="pl-kg" value="${nf(this.kg, 2)}" data-in="plateKg"><span class="u">kg</span></div>
        <div class="fr"><label for="pl-bar">Barre</label><select id="pl-bar" data-change="plateBar" style="width:auto;background:transparent">${[20, 15, 10].map((v) => `<option value="${v}" ${this.bar === v ? 'selected' : ''}>${v} kg</option>`).join('')}</select></div></div>
        <div id="plRes">${this.result()}</div>`;
    },
  });
}
function daySheet(dayId) {
  openSheet({
    dayId,
    get dy() { const p = activeProgram(); return p && p.days.find((d) => d.id === this.dayId); },
    render() {
      const dy = this.dy; if (!dy) return sheetHead('');
      return `${sheetHead(esc(dy.name), '<button class="link b" data-a="dayEdit">Modifier</button>')}
        <div class="day-pills">${dy.exercises.map((e) => `<div class="cell day-row ex-row">${exIcon(exById(e.exId))}<span class="main"><span class="t">${esc(exById(e.exId).name)}</span></span></div>`).join('') || '<div class="empty">Aucun exercice.</div>'}</div>
        <button class="btn filled block" data-a="startWorkout" data-p="${activeProgram().id}" data-d="${dy.id}">${ICON.play} Commencer</button>`;
    },
  });
}
function dayEditSheet(dayId) {
  const progId = activeProgram().id;
  openSheet({
    progId, dayId,
    get prog() { return S.programs.find((p) => p.id === this.progId); },
    get dy() { const p = this.prog; return p && p.days.find((d) => d.id === this.dayId); },
    onClose() { render(); const under = topSheet(); if (under) paintSheet(under); },
    render() {
      const dy = this.dy; if (!dy) return sheetHead('Journée supprimée');
      const rows = dy.exercises.map((e, i) => `<div class="section"><div class="row" style="padding:0 4px"><b class="grow">${esc(exById(e.exId).name)}</b>
          <button class="icon-btn plain" data-a="dayMove" data-i="${i}" data-v="-1" aria-label="Monter" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${ICON.up}</button>
          <button class="icon-btn plain" data-a="dayMove" data-i="${i}" data-v="1" aria-label="Descendre" style="transform:rotate(180deg);${i === dy.exercises.length - 1 ? 'opacity:.3' : ''}" ${i === dy.exercises.length - 1 ? 'disabled' : ''}>${ICON.up}</button>
          <button class="icon-btn plain" data-a="dayExDel" data-i="${i}" aria-label="Retirer" style="color:var(--red)">${ICON.x}</button></div>
        <div class="form-group">
          <div class="fr"><label for="de-${i}-s">Séries</label><input type="text" inputmode="numeric" id="de-${i}-s" value="${e.sets}" data-in="dayEx" data-i="${i}" data-f="sets"></div>
          <div class="fr"><label for="de-${i}-r">Répétitions</label><input type="text" id="de-${i}-r" value="${esc(e.reps)}" data-in="dayEx" data-i="${i}" data-f="reps"></div>
          <div class="fr"><label for="de-${i}-k">Charge cible</label><input type="text" inputmode="decimal" id="de-${i}-k" value="${e.kg ? nf(e.kg, 2) : ''}" placeholder="—" data-in="dayEx" data-i="${i}" data-f="kg"><span class="u">kg</span></div>
          <div class="fr"><label for="de-${i}-t">Repos</label><input type="text" inputmode="numeric" id="de-${i}-t" value="${e.rest}" data-in="dayEx" data-i="${i}" data-f="rest"><span class="u">s</span></div>
          <div class="fr"><label for="de-${i}-n">Note</label><input type="text" id="de-${i}-n" value="${esc(e.note || '')}" placeholder="1-2 RIR…" data-in="dayEx" data-i="${i}" data-f="note" style="flex-basis:190px"></div>
        </div></div>`).join('');
      return `${sheetHead('Modifier', '<button class="link b" data-a="closeSheet">OK</button>')}
        <div class="form-group"><div class="fr"><label for="day-name">Nom</label><input type="text" id="day-name" value="${esc(dy.name)}" data-in="dayName" style="flex-basis:200px"></div>
        <div class="fr"><label for="day-wd">Jour</label><select id="day-wd" data-change="dayWd" style="width:auto;background:transparent">${['Aucun', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((n, v) => `<option value="${v}" ${Number(dy.weekday || 0) === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
        ${rows}
        <button class="btn tinted block" data-a="dayExAdd">Ajouter un exercice</button>
        <button class="btn red block" data-a="dayDelete">Supprimer la journée</button>`;
    },
  });
}
function programsSheet() {
  openSheet({
    render: () => `${sheetHead('Programmes')}<div class="group">${S.programs.map((p) => cell({ a: 'progPick', data: `data-id="${p.id}"`, t: esc(p.name), s: `${p.days.length} jour${p.days.length > 1 ? 's' : ''}${p.coach ? ' · envoyé par ton coach' : ''}`, v: p.id === (activeProgram() || {}).id ? `<span style="color:var(--blue)">${ICON.check.replace('<svg', '<svg width="18" height="18"')}</span>` : '', chev: false })).join('')}<button class="cell center" data-a="progNew">Nouveau programme</button></div>
      ${activeProgram() ? `<div class="group">${cell({ a: 'progRename', t: 'Renommer le programme actif' })}<button class="cell danger" data-a="progDelete">Supprimer le programme actif</button></div>` : ''}`,
  });
}
function textSheet({ title, label, value = '', onOk }) {
  openSheet({
    onOk,
    render: () => `${sheetHead(title)}<form class="stack" data-submit="textSheet"><div class="field"><label for="ts-v">${label}</label><input type="text" id="ts-v" name="v" value="${esc(value)}" required></div><button class="btn filled block" type="submit">Enregistrer</button></form>`,
    after: (el) => setTimeout(() => { const i = el.querySelector('#ts-v'); if (i) i.focus(); }, 300),
  });
}
function sessionSheet(id) {
  const s = S.sessions.find((x) => x.id === id); if (!s) return;
  openSheet({
    sid: id,
    render: () => `${sheetHead(esc(s.name))}<div class="foot" style="text-align:center;margin-top:-10px">${cap(fmtDay(s.date))}${s.duration ? ' · ' + fmtDur(s.duration) : ''} · ${nf(sessionVolume(s))} kg soulevés</div>
      ${s.exercises.map((e) => `<div class="section"><div class="section-h">${esc(exById(e.exId).name)}${(s.prs || []).includes(e.exId) ? ' · record' : ''}</div><div class="group">${e.sets.map((st, i) => cell({ t: `Série ${i + 1}`, v: `${nf(st.kg, 2)} kg × ${st.reps}`, chev: false })).join('')}</div></div>`).join('')}
      <button class="btn red block" data-a="sessionDel">Supprimer cette séance</button>`,
  });
}
function settingsSheet() {
  openSheet({
    render: () => `${sheetHead('Réglages')}
      <div class="section"><div class="section-h">Séance</div><div class="form-group">
        <div class="fr"><label for="s-rest">Repos par défaut</label><select id="s-rest" data-change="setting" data-k="rest" style="width:auto;background:transparent">${[45, 60, 90, 120, 150, 180, 240].map((v) => `<option value="${v}" ${S.settings.rest === v ? 'selected' : ''}>${fmtRest(v)}</option>`).join('')}</select></div>
        <div class="fr"><label for="s-bar">Barre</label><select id="s-bar" data-change="setting" data-k="bar" style="width:auto;background:transparent">${[20, 15, 10].map((v) => `<option value="${v}" ${S.settings.bar === v ? 'selected' : ''}>${v} kg</option>`).join('')}</select></div></div></div>
      <div class="section"><div class="section-h">Minuteur iPhone</div><div class="form-group">
        <div class="fr"><label for="s-ios">Utiliser le minuteur de l’iPhone</label><input type="checkbox" class="switch" id="s-ios" data-change="iosTimer" ${S.settings.iosTimer ? 'checked' : ''}></div></div>
        <div class="group" style="margin-top:8px">${cell({ a: 'timerGuide', t: 'Créer le raccourci (une seule fois)' })}</div>
        <div class="section-f">Le repos s’affiche dans la Dynamic Island et l’iPhone sonne quand c’est le moment de reprendre, même verrouillé.</div></div>
      <div class="section"><div class="section-h">Apparence</div><div class="segment">${[['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']].map(([v, n]) => `<button class="${S.settings.theme === v ? 'on' : ''}" data-a="theme" data-v="${v}">${n}</button>`).join('')}</div></div>
      <div class="section"><div class="section-h">Sauvegarde</div><div class="group">${cell({ a: 'exportData', t: '<span style="color:var(--blue)">Exporter mes données</span>', chev: false })}<label class="cell" style="cursor:pointer"><span class="main"><span class="t" style="color:var(--blue)">Importer une sauvegarde</span></span><input class="vh" type="file" accept="application/json,.json" data-change="importData"></label></div>
        <div class="section-f">Tes données restent sur cet iPhone. Exporte-les de temps en temps vers Fichiers ou iCloud Drive.</div></div>
      <div class="group"><button class="cell danger" data-a="wipe">Effacer toutes les données</button></div>`,
  });
}

// Lance le raccourci « HusoFit Repos » qui démarre le minuteur de l'iPhone (Dynamic Island + sonnerie)
const SHORTCUT = 'HusoFit Repos';
function runIosTimer(sec) {
  try { window.location.href = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT)}&input=text&text=${Math.round(sec)}`; } catch (e) { toast('Impossible d’ouvrir Raccourcis'); }
}
function timerGuideSheet() {
  const step = (n, html) => `<div class="cell" style="align-items:flex-start"><span class="badge blue" style="border-radius:50%;width:26px;height:26px">${n}</span><span class="main"><span class="t" style="display:block">${html}</span></span></div>`;
  openSheet({
    render: () => `${sheetHead('Minuteur iPhone')}
      <p class="muted small" style="margin:0">À faire une seule fois. Ensuite, chaque série validée lance le minuteur de l’iPhone : il s’affiche dans la Dynamic Island et sonne à la fin du repos, même téléphone verrouillé.</p>
      <div class="group">
        ${step(1, 'Ouvre l’appli <b>Raccourcis</b> et touche <b>+</b> en haut à droite.')}
        ${step(2, 'Touche le nom en haut et renomme le raccourci exactement <b>HusoFit Repos</b>.')}
        ${step(3, 'Touche <b>Ajouter une action</b>, cherche <b>Démarrer le minuteur</b> et ajoute-la.')}
        ${step(4, 'Touche le chiffre (<b>30</b>), puis choisis <b>Entrée du raccourci</b>.')}
        ${step(5, 'Touche <b>minutes</b> et choisis <b>secondes</b>. Touche <b>OK</b>.')}
      </div>
      <button class="btn tinted block" data-a="timerTest">Tester (10 secondes)</button>
      <div class="section-f">Après chaque série, l’iPhone passe une seconde par Raccourcis : glisse la barre du bas vers la droite pour revenir sur HusoFit. La première fois, iOS te demande l’autorisation : touche « Autoriser ».</div>`,
  });
}

function applyTheme() {
  const t = S.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#121212' : '#f2f2f2');
}

// ---------- Actions ----------
const A = {
  tab(el) { ui.tab = el.dataset.t; render(); window.scrollTo(0, 0); },
  closeSheet() { closeSheet(); },
  confirmOk() { const c = topSheet(); closeSheet(); c.onOk(); },
  settings() { settingsSheet(); },
  swipeDel(el) { swipeDelete(el.closest('.swipe')); },
  timerGuide() { timerGuideSheet(); },
  timerTest() { if (!S.settings.iosTimer) { S.settings.iosTimer = true; save(); } runIosTimer(10); },

  startWorkout(el) { unlockAudio(); startWorkout(el.dataset.p, el.dataset.d); },
  startFree() { unlockAudio(); startWorkout(null, null); },
  liveOpen() { ui.liveOpen = true; render(); wakeLock(); },
  liveMin() { ui.liveOpen = false; render(); },
  liveToggle(el) {
    unlockAudio();
    const L = S.live, e = L.exercises[+el.dataset.e], j = +el.dataset.s, s = e.sets[j];
    if (s.done) { s.done = false; save(); renderLive(); return; }
    const prev = (lastSetsFor(e.exId) || [])[j];
    if (s.kg === '') s.kg = e.kg ? nf(e.kg, 2) : prev ? nf(prev.kg, 2) : j > 0 ? e.sets[j - 1].kg : '';
    if (s.reps === '') s.reps = prev ? String(prev.reps) : j > 0 && e.sets[j - 1].reps !== '' ? e.sets[j - 1].reps : (e.repsT || '');
    if (!(num(s.reps) > 0)) { s.reps = ''; toast('Indique le nombre de répétitions'); const i = $(`#ls-${el.dataset.e}-${j}-reps`); if (i) i.focus(); return; }
    if (s.kg === '') s.kg = '0';
    s.done = true; L.restTotal = e.rest; L.restEnd = Date.now() + e.rest * 1000;
    if (e.sets.every((x) => x.done)) e.collapsed = true;
    save(); renderLive();
    if (S.settings.iosTimer) runIosTimer(e.rest);
  },
  liveExpand(el) { S.live.exercises[+el.dataset.e].collapsed = false; save(); renderLive(); },
  liveCollapse(el) { S.live.exercises[+el.dataset.e].collapsed = true; save(); renderLive(); },
  exHist(el) { exHistSheet(+el.dataset.e); },
  liveAddSet(el) { const e = S.live.exercises[+el.dataset.e]; e.sets.push({ kg: '', reps: '', done: false }); e.collapsed = false; save(); renderLive(); },
  liveDelSet(el) { const e = S.live.exercises[+el.dataset.e]; if (e.sets.length > 1) e.sets.pop(); save(); if (sheets.length) closeSheet(); renderLive(); },
  liveRemoveEx(el) {
    const i = +el.dataset.e, e = S.live.exercises[i];
    const go = () => { S.live.exercises.splice(i, 1); save(); closeAllSheets(); renderLive(); };
    if (e.sets.some((s) => s.done)) confirmSheet({ title: `Retirer ${esc(exById(e.exId).name)} ?`, text: 'Les séries validées seront perdues.', ok: 'Retirer', onOk: go }); else go();
  },
  liveAddEx() { exSearchSheet({ title: 'Exercice', onPick: (id) => { S.live.exercises.push(mkLiveEx(id, null)); save(); renderLive(); setTimeout(() => { const l = $('.live'); if (l) l.scrollTo({ top: l.scrollHeight, behavior: 'smooth' }); }, 50); } }); },
  liveFinish() {
    const done = S.live.exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
    const total = S.live.exercises.reduce((a, e) => a + e.sets.length, 0);
    openSheet({ render: () => `${sheetHead('')}<div style="text-align:center" class="stack"><h2>Terminer la séance ?</h2><p class="muted small" style="margin:0">${done} série${done > 1 ? 's' : ''} validée${done > 1 ? 's' : ''} sur ${total}. Seules les séries validées sont enregistrées.</p></div><div class="stack"><button class="btn filled block" data-a="liveSave">Terminer</button><button class="btn block" data-a="closeSheet">Continuer la séance</button></div>` });
  },
  liveSave() { finishWorkout(); },
  liveCancel() { confirmSheet({ title: 'Abandonner la séance ?', text: 'Rien ne sera enregistré.', ok: 'Abandonner', onOk: () => { S.live = null; save(); render(); } }); },
  restAdd(el) { const L = S.live; if (!L || !L.restEnd) return; const d = Number(el.dataset.v); L.restEnd += d * 1000; L.restTotal = Math.max(L.restTotal + d, 1); if (L.restEnd <= Date.now()) L.restEnd = null; save(); renderRest(); },
  restSkip() { if (S.live) { S.live.restEnd = null; save(); } renderRest(); },
  platesLive(el) { const e = S.live.exercises[+el.dataset.e]; const f = e.sets.filter((s) => s.kg !== '').pop(); const p = lastSetsFor(e.exId); platesSheet(f ? num(f.kg) : e.kg || (p ? p[0].kg : 60)); },
  platesFrom(el) { platesSheet(num(el.dataset.kg)); },

  dayOpen(el) { daySheet(el.dataset.d); },
  dayEdit() { dayEditSheet(topSheet().dayId); },
  dayAdd() { const p = activeProgram(); if (!p) return; const d = { id: uid(), name: `Jour ${p.days.length + 1}`, exercises: [] }; p.days.push(d); save(); render(); dayEditSheet(d.id); },
  dayMove(el) { const c = topSheet(), ex = c.dy.exercises, i = +el.dataset.i, j = i + Number(el.dataset.v); if (j < 0 || j >= ex.length) return; [ex[i], ex[j]] = [ex[j], ex[i]]; save(); paintSheet(c); },
  dayExDel(el) { const c = topSheet(); c.dy.exercises.splice(+el.dataset.i, 1); save(); paintSheet(c); },
  dayExAdd() { const c = topSheet(); exSearchSheet({ title: 'Exercice', onPick: (id) => { c.dy.exercises.push({ exId: id, sets: 3, reps: '8-12', rest: S.settings.rest, kg: 0, note: '' }); save(); paintSheet(c); } }); },
  dayDelete() { const c = topSheet(); confirmSheet({ title: `Supprimer « ${esc(c.dy.name)} » ?`, onOk: () => { const p = c.prog; p.days = p.days.filter((d) => d.id !== c.dayId); save(); closeAllSheets(); render(); } }); },
  pick(el) { const c = topSheet(); closeSheet(); c.onPick(el.dataset.id); },
  pickMuscle(el) { const c = topSheet(); c.muscle = el.dataset.v; paintSheet(c); },
  exLibrary() { exSearchSheet({ title: 'Exercices' }); },
  exOpen(el) { exSheet(el.dataset.id); },
  exCreate() { exCreateSheet(); },
  exDelete() { const c = topSheet(); confirmSheet({ title: 'Supprimer cet exercice ?', text: 'Tes séances passées le gardent.', onOk: () => { S.customExercises = S.customExercises.filter((e) => e.id !== c.exId); save(); closeAllSheets(); render(); } }); },
  programs() { programsSheet(); },
  progPick(el) { S.activeProgramId = el.dataset.id; save(); closeSheet(); render(); },
  progNew() { textSheet({ title: 'Nouveau programme', label: 'Nom', onOk: (v) => { const p = { id: uid(), name: v, days: [] }; S.programs.push(p); S.activeProgramId = p.id; save(); closeAllSheets(); render(); } }); },
  progRename() { const p = activeProgram(); textSheet({ title: 'Renommer', label: 'Nom', value: p.name, onOk: (v) => { p.name = v; save(); closeAllSheets(); render(); } }); },
  progDelete() { const p = activeProgram(); confirmSheet({ title: `Supprimer « ${esc(p.name)} » ?`, text: 'Tes séances passées restent dans l’historique.', onOk: () => { S.programs = S.programs.filter((x) => x.id !== p.id); S.activeProgramId = S.programs[0] ? S.programs[0].id : null; save(); closeAllSheets(); render(); } }); },
  sessionOpen(el) { sessionSheet(el.dataset.id); },
  sessionDel() { const c = topSheet(); confirmSheet({ title: 'Supprimer cette séance ?', onOk: () => { S.sessions = S.sessions.filter((s) => s.id !== c.sid); save(); closeAllSheets(); render(); } }); },

  chart(el) { ui.chart = el.dataset.v; render(); },
  checkNew() { checkSheet(); },
  checkEdit(el) { checkSheet(el.dataset.id); },
  checkDel() { const c = topSheet(); confirmSheet({ title: 'Supprimer cette mesure ?', onOk: () => { S.checks = S.checks.filter((x) => x.id !== c.id); save(); closeAllSheets(); render(); } }); },

  theme(el) { S.settings.theme = el.dataset.v; applyTheme(); save(); paintSheet(); },
  async exportData() {
    const blob = new Blob([JSON.stringify({ app: 'HusoFit', version: 2, exportedAt: new Date().toISOString(), state: S })], { type: 'application/json' });
    const name = `husofit-${dkey()}.json`;
    try { const file = new File([blob], name, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Sauvegarde HusoFit' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  },
  wipe() { confirmSheet({ title: 'Tout effacer ?', text: 'Séances et mesures seront supprimées de cet iPhone.', ok: 'Tout effacer', onOk: async () => { S = defaultState(); syncCoach(); await save(true); applyTheme(); closeAllSheets(); render(); } }); },
};

const IN = {
  liveSet(el) { S.live.exercises[+el.dataset.e].sets[+el.dataset.s][el.dataset.f] = el.value.trim(); save(); },
  pickerQuery(el) { const c = topSheet(); c.query = el.value; $('#pickRes', c.el).innerHTML = c.results(); },
  plateKg(el) { const c = topSheet(); c.kg = num(el.value) || 0; $('#plRes', c.el).innerHTML = c.result(); },
  dayName(el) { const c = topSheet(); c.dy.name = el.value.trim() || c.dy.name; save(); },
  dayEx(el) {
    const c = topSheet(), e = c.dy.exercises[+el.dataset.i], f = el.dataset.f;
    if (f === 'reps') e.reps = el.value.trim() || e.reps;
    else if (f === 'note') e.note = el.value.trim();
    else if (f === 'kg') { const v = num(el.value); e.kg = v > 0 ? v : 0; }
    else { const v = Math.round(num(el.value)); if (v > 0) e[f] = v; }
    save();
  },
};
const CH = {
  setting(el) { S.settings[el.dataset.k] = Number(el.value); save(); },
  iosTimer(el) { S.settings.iosTimer = el.checked; save(); if (el.checked) toast('Pense à créer le raccourci « HusoFit Repos »'); },
  plateBar(el) { const c = topSheet(); c.bar = Number(el.value); $('#plRes', c.el).innerHTML = c.result(); },
  dayWd(el) { const c = topSheet(); const v = Number(el.value); c.dy.weekday = v || undefined; save(); },
  importData(el) {
    const file = el.files && el.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let data; try { data = JSON.parse(reader.result); } catch (e) { data = null; }
      if (!data || data.app !== 'HusoFit' || !data.state) { toast('Ce fichier n’est pas une sauvegarde HusoFit'); return; }
      confirmSheet({ title: 'Remplacer tes données ?', text: `La sauvegarde du ${new Date(data.exportedAt).toLocaleDateString('fr-FR')} remplacera ce qui est sur cet iPhone.`, ok: 'Importer', onOk: async () => { S = migrate(data.state); syncCoach(); await save(true); applyTheme(); closeAllSheets(); render(); toast('Sauvegarde importée'); } });
    };
    reader.readAsText(file); el.value = '';
  },
};
const SUB = {
  checkSave(form) {
    const fd = new FormData(form), c = topSheet();
    const date = fd.get('date') || dkey(), kg = num(fd.get('kg')), waist = num(fd.get('waist'));
    const okKg = kg > 25 && kg < 350, okW = waist > 30 && waist < 250;
    if (!okKg && !okW) { toast('Entre ton poids et/ou ton tour de taille'); return; }
    const rec = { date }; if (okKg) rec.kg = Math.round(kg * 10) / 10; if (okW) rec.waist = Math.round(waist * 10) / 10;
    if (c.id) { const x = S.checks.find((y) => y.id === c.id); x.date = date; x.kg = rec.kg; x.waist = rec.waist; }
    else { const same = S.checks.find((y) => y.date === date); if (same) Object.assign(same, rec); else S.checks.push({ id: uid(), ...rec }); }
    save(); closeAllSheets(); ui.tab = 'track'; render(); toast('Mesure enregistrée');
  },
  textSheet(form) { const v = String(new FormData(form).get('v') || '').trim(); if (!v) return; const c = topSheet(); closeSheet(); c.onOk(v); },
  exCreate(form) {
    const fd = new FormData(form), name = String(fd.get('name') || '').trim(); if (!name) return;
    const ex = { id: 'c-' + uid(), name, muscle: fd.get('muscle'), equip: fd.get('equip'), custom: true };
    S.customExercises.push(ex); save(); closeSheet();
    const c = topSheet();
    if (c && c.onPick) { closeSheet(); c.onPick(ex.id); } else if (c && c.results) paintSheet(c);
    toast('Exercice créé');
  },
};

// ---------- Branchements ----------
document.addEventListener('click', (e) => { const el = e.target.closest('[data-a]'); if (!el || el.disabled) return; const f = A[el.dataset.a]; if (f) { e.preventDefault(); f(el, e); } });
document.addEventListener('input', (e) => { const el = e.target.closest('[data-in]'); if (el && IN[el.dataset.in]) IN[el.dataset.in](el); });
document.addEventListener('change', (e) => { const el = e.target.closest('[data-change]'); if (el && CH[el.dataset.change]) CH[el.dataset.change](el); });
document.addEventListener('submit', (e) => { const f = e.target.closest('[data-submit]'); if (!f) return; e.preventDefault(); if (SUB[f.dataset.submit]) SUB[f.dataset.submit](f); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheets.length) closeSheet(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') save(true);
  else { if (S.live && ui.liveOpen) wakeLock(); if (!sheets.length && !S.live) render(); }
});
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

setInterval(() => {
  const L = S.live; if (!L) return;
  const el = ui.liveOpen ? $('#clock') : $('#liveBanner .clock');
  if (el) el.textContent = fmtClock((Date.now() - L.startedAt) / 1000);
  if (L.restEnd && Date.now() >= L.restEnd) { L.restEnd = null; save(); beep(); toast('Repos terminé, c’est reparti !'); }
  renderRest();
}, 500);

// iOS 26 : dans l'appli installée, une page plus courte que l'écran reçoit une fenêtre trop petite
// (bande vide en bas). On donne à chaque page au moins la hauteur réelle de l'écran.
function fixViewportGap() {
  try {
    const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    if (!standalone) return;
    const portrait = window.innerHeight >= window.innerWidth;
    const full = portrait ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
    document.documentElement.style.setProperty('--screen-h', full + 'px');
    document.documentElement.classList.add('standalone');
  } catch (e) { /* rien */ }
}
window.addEventListener('orientationchange', () => setTimeout(fixViewportGap, 300));

async function boot() {
  fixViewportGap();
  await Store.open();
  const saved = await Store.get('state');
  if (saved && typeof saved === 'object') S = migrate(saved);
  const msg = syncCoach();
  save();
  initTabbar();
  applyTheme(); render(); placeTabInd(false);
  if (msg && saved) toast(msg);
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* rien */ }
  try { if ('serviceWorker' in navigator && location.protocol === 'https:' && document.documentElement.classList.contains('pwa')) navigator.serviceWorker.register('sw.js'); } catch (e) { /* rien */ }
}
boot();
