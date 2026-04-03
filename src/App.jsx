import { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  DONNÉES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_MUSCLE_GROUPS = [
  { id: "dos",     label: "Dos",     emoji: "🏋️", color: "#4fc3f7" },
  { id: "pecs",    label: "Pecs",    emoji: "💪", color: "#e8ff00" },
  { id: "epaules", label: "Épaules", emoji: "🔝", color: "#ff9800" },
  { id: "jambes",  label: "Jambes",  emoji: "🦵", color: "#ce93d8" },
  { id: "bras",    label: "Bras",    emoji: "💥", color: "#f48fb1" },
  { id: "cardio",  label: "Cardio",  emoji: "❤️", color: "#ff4d4d" },
  { id: "abdos",   label: "Abdos",   emoji: "🔥", color: "#00e676" },
];

const DEFAULT_EXERCISES = {
  dos:     ["Tractions", "Rowing barre", "Tirage poulie", "Soulevé de terre", "Rowing haltère"],
  pecs:    ["Développé couché", "Développé incliné", "Écarté haltères", "Pompes", "Dips"],
  epaules: ["Développé militaire", "Élévations latérales", "Oiseau", "Arnold press", "Shrugs"],
  jambes:  ["Squat", "Presse à cuisses", "Fentes", "Leg curl", "Mollets debout"],
  bras:    ["Curl biceps", "Marteau", "Barre EZ", "Dips triceps", "Extensions nuque"],
  cardio:  ["Course à pied", "Vélo", "Corde à sauter", "Rameur", "Burpees"],
  abdos:   ["Crunchs", "Planche", "Relevé de jambes", "Bicycle", "Russian twist"],
};

// ── Thèmes prédéfinis ──
const PRESET_THEMES = [
  {
    id: "dark",
    name: "Défaut",
    emoji: "⚡",
    bg: "#0a0a0a", surface: "#141414", border: "#222222",
    accent: "#e8ff00", accent2: "#ff4d4d", text: "#f0f0f0",
    muted: "#555555", success: "#00e676",
  },
  {
    id: "blue",
    name: "Bleu Nuit",
    emoji: "🌊",
    bg: "#060d1a", surface: "#0d1828", border: "#1a2d45",
    accent: "#00b4ff", accent2: "#ff6b6b", text: "#e8f4ff",
    muted: "#4a6080", success: "#00e5a0",
  },
  {
    id: "fire",
    name: "Rouge Feu",
    emoji: "🔥",
    bg: "#0f0500", surface: "#1a0a00", border: "#2d1500",
    accent: "#ff6b00", accent2: "#ff2244", text: "#fff0e8",
    muted: "#664422", success: "#ffcc00",
  },
  {
    id: "nature",
    name: "Vert Nature",
    emoji: "🌿",
    bg: "#030d06", surface: "#071a0d", border: "#0f2d18",
    accent: "#00e676", accent2: "#ff6b6b", text: "#e8fff0",
    muted: "#2d5540", success: "#69ff47",
  },
  {
    id: "purple",
    name: "Violet Cosmos",
    emoji: "🌌",
    bg: "#080510", surface: "#110d1e", border: "#1e1535",
    accent: "#b47cff", accent2: "#ff4d8b", text: "#f0e8ff",
    muted: "#4a3870", success: "#00e5c8",
  },
  {
    id: "light",
    name: "Clair",
    emoji: "☀️",
    bg: "#f5f5f5", surface: "#ffffff", border: "#e0e0e0",
    accent: "#1a73e8", accent2: "#e53935", text: "#1a1a1a",
    muted: "#888888", success: "#00c853",
  },
];

const DEFAULT_THEME = { ...PRESET_THEMES[0], wallpaperUrl: "", wallpaperOpacity: "0.15" };

const REST_PRESETS = [60, 90, 120, 180];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  UTILITAIRES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function pad(n) { return String(n).padStart(2, "0"); }

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${pad(m)}min`;
  if (m > 0) return `${m}min ${pad(s)}s`;
  return `${s}s`;
}

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toDateString());
  }
  return days;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  COMPOSANT PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function WorkoutCounter() {

  // ── Setup ──
  const [step, setStep] = useState("groups");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [totalSets, setTotalSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);

  // ── Exercices ──
  const [customExercises, setCustomExercises] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rc-custom-exercises") || "{}"); } catch { return {}; }
  });
  const [editableExercises, setEditableExercises] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rc-exercises") || "null") || DEFAULT_EXERCISES; } catch { return DEFAULT_EXERCISES; }
  });
  const [customInput, setCustomInput] = useState("");
  const [customGroup, setCustomGroup] = useState(null);

  // ── Workout ──
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [repInput, setRepInput] = useState("");
  const [sessionNote, setSessionNote] = useState("");

  // ── Minuteur de séance ──
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionTimerActive, setSessionTimerActive] = useState(false);
  const sessionTimerRef = useRef(null);

  // ── Repos ──
  const [showRest, setShowRest] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [restRemaining, setRestRemaining] = useState(90);
  const [restPaused, setRestPaused] = useState(false);
  const restInterval = useRef(null);
  const pendingNext = useRef(null);

  // ── Historique ──
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [openSession, setOpenSession] = useState(null);

  // ── Paramètres ──
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("themes");
  const [theme, setTheme] = useState(() => {
    try { return { ...DEFAULT_THEME, ...JSON.parse(localStorage.getItem("rc-theme") || "{}") }; }
    catch { return DEFAULT_THEME; }
  });
  const [wallpaperInput, setWallpaperInput] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [newExInput, setNewExInput] = useState("");

  // ── Graphiques ──
  const [showStats, setShowStats] = useState(false);
  const [statsGroup, setStatsGroup] = useState("all");

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  EFFETS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("rc-history") || "[]")); } catch {}
  }, []);

  // Timer de repos
  useEffect(() => {
    if (showRest && !restPaused) {
      restInterval.current = setInterval(() => {
        setRestRemaining(r => {
          if (r <= 1) {
            clearInterval(restInterval.current);
            // Vibration à la fin du repos
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            setTimeout(() => finishRest(), 400);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(restInterval.current);
    }
    return () => clearInterval(restInterval.current);
  }, [showRest, restPaused]);

  // Minuteur de séance
  useEffect(() => {
    if (sessionTimerActive) {
      sessionTimerRef.current = setInterval(() => {
        setSessionSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(sessionTimerRef.current);
    }
    return () => clearInterval(sessionTimerRef.current);
  }, [sessionTimerActive]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  SAUVEGARDE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function saveHistory(h) { localStorage.setItem("rc-history", JSON.stringify(h)); setHistory(h); }
  function saveTheme(t) { localStorage.setItem("rc-theme", JSON.stringify(t)); setTheme(t); }
  function saveExercises(e) { localStorage.setItem("rc-exercises", JSON.stringify(e)); setEditableExercises(e); }
  function saveCustomExercises(c) { localStorage.setItem("rc-custom-exercises", JSON.stringify(c)); setCustomExercises(c); }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  CSS DYNAMIQUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const isBgLight = theme.bg === "#f5f5f5";
  const cardBg = isBgLight ? "#ffffff" : theme.surface;
  const inputBg = isBgLight ? "#f0f0f0" : "#111111";
  const planItemBg = isBgLight ? "#f8f8f8" : "#0f0f0f";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: ${theme.bg}; --surface: ${cardBg}; --border: ${theme.border};
      --accent: ${theme.accent}; --accent2: ${theme.accent2};
      --text: ${theme.text}; --muted: ${theme.muted}; --success: ${theme.success};
    }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

    .app { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; align-items: center; padding: 24px 16px 48px; position: relative; }
    ${theme.wallpaperUrl ? `.app::before { content:''; position:fixed; inset:0; z-index:0; background-image:url('${theme.wallpaperUrl}'); background-size:cover; background-position:center; background-attachment:fixed; opacity:${theme.wallpaperOpacity}; pointer-events:none; }` : ""}
    .app > * { position: relative; z-index: 1; }

    .header { width:100%; max-width:420px; margin-bottom:20px; display:flex; align-items:flex-start; justify-content:space-between; }
    .header-label { font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); margin-bottom:2px; }
    .header-title { font-family:'Bebas Neue',sans-serif; font-size:52px; line-height:1; color:var(--text); }
    .header-actions { display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; }
    .icon-btn { display:flex; flex-direction:column; align-items:center; gap:3px; background:transparent; border:1px solid var(--border); border-radius:10px; padding:8px 12px; color:var(--muted); cursor:pointer; font-size:11px; font-family:'DM Sans',sans-serif; transition:all 0.13s; }
    .icon-btn:hover { border-color:#444; color:var(--text); }
    .icon-btn.active { border-color:var(--accent); color:var(--accent); }
    .icon-btn .ib-icon { font-size:15px; }

    /* Minuteur */
    .session-timer { width:100%; max-width:420px; display:flex; align-items:center; gap:8px; padding:10px 14px; background:var(--surface); border:1px solid var(--border); border-radius:10px; margin-bottom:12px; }
    .timer-icon { font-size:14px; }
    .timer-label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em; flex:1; }
    .timer-val { font-family:'Bebas Neue',sans-serif; font-size:22px; color:var(--accent); }

    .card { background:var(--surface); border:1px solid var(--border); border-radius:16px; width:100%; max-width:420px; padding:20px; margin-bottom:12px; }
    .section-title { font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); margin-bottom:14px; }

    .group-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
    .group-btn { display:flex; flex-direction:column; align-items:center; gap:5px; padding:12px 6px; border-radius:10px; border:1px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; font-size:12px; font-family:'DM Sans',sans-serif; transition:all 0.13s; position:relative; }
    .group-btn .g-emoji { font-size:20px; }
    .group-btn:hover { border-color:#444; color:var(--text); }
    .group-btn.selected { border-color:var(--g-color,var(--accent)); color:var(--g-color,var(--accent)); background:color-mix(in srgb,var(--g-color,var(--accent)) 8%,transparent); }
    .group-btn.selected::after { content:'✓'; position:absolute; top:4px; right:6px; font-size:10px; color:var(--g-color,var(--accent)); }
    .group-hint { font-size:11px; color:var(--muted); margin-top:10px; text-align:center; }
    .group-hint span { color:var(--accent); }
    .tag-row { display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; }
    .tag { display:flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; border:1px solid; font-size:12px; }

    .ex-list { display:flex; flex-direction:column; gap:6px; }
    .ex-item { display:flex; align-items:center; gap:10px; padding:11px 14px; background:${planItemBg}; border:1px solid var(--border); border-radius:10px; cursor:pointer; transition:all 0.13s; }
    .ex-item:hover { border-color:#333; }
    .ex-item.selected { border-color:var(--accent); }
    .ex-item-dot { width:8px; height:8px; border-radius:50%; border:1.5px solid var(--muted); background:transparent; flex-shrink:0; transition:all 0.13s; }
    .ex-item.selected .ex-item-dot { background:var(--accent); border-color:var(--accent); }
    .ex-item-label { font-size:14px; flex:1; }
    .ex-item-del { background:none; border:none; color:var(--muted); cursor:pointer; font-size:16px; padding:0 4px; }
    .ex-item-del:hover { color:var(--accent2); }
    .add-custom-row { display:flex; gap:8px; margin-top:10px; }
    .custom-input { flex:1; background:${inputBg}; border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; padding:10px 14px; outline:none; transition:border 0.13s; }
    .custom-input:focus { border-color:var(--accent); }
    .custom-input::placeholder { color:var(--muted); }
    .add-btn { background:var(--accent); border:none; border-radius:8px; color:#0a0a0a; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; padding:0 16px; cursor:pointer; white-space:nowrap; }
    .add-btn:disabled { opacity:0.3; cursor:not-allowed; }

    .config-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
    .config-label { font-size:12px; color:var(--muted); flex:1; text-transform:uppercase; letter-spacing:0.1em; }
    .stepper { display:flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
    .stepper-btn { background:${planItemBg}; border:none; color:var(--text); width:36px; height:36px; font-size:18px; cursor:pointer; }
    .stepper-val { width:52px; text-align:center; font-size:15px; font-weight:600; background:${inputBg}; color:var(--text); display:flex; align-items:center; justify-content:center; }

    .plan-list { display:flex; flex-direction:column; gap:8px; }
    .plan-item { display:flex; align-items:center; gap:10px; padding:12px 14px; background:${planItemBg}; border:1px solid var(--border); border-radius:10px; }
    .plan-item.active-plan { border-color:var(--accent); }
    .plan-item.done-plan { opacity:0.5; }
    .plan-idx { font-family:'Bebas Neue',sans-serif; font-size:20px; color:var(--muted); width:20px; }
    .plan-item.active-plan .plan-idx { color:var(--accent); }
    .plan-info { flex:1; min-width:0; }
    .plan-name { font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .plan-detail { font-size:11px; color:var(--muted); margin-top:2px; }
    .plan-status { font-size:10px; font-weight:600; text-transform:uppercase; }
    .plan-status.pending { color:var(--muted); }
    .plan-status.active { color:var(--accent); }
    .plan-status.done { color:var(--success); }

    .start-btn { width:100%; height:58px; border-radius:12px; border:none; background:var(--accent); color:#0a0a0a; font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:0.08em; cursor:pointer; margin-top:16px; }
    .start-btn:disabled { opacity:0.3; cursor:not-allowed; }
    .reset-btn { background:transparent; border:1px solid var(--border); border-radius:8px; color:var(--muted); font-family:'DM Sans',sans-serif; font-size:13px; padding:10px 18px; cursor:pointer; }
    .reset-btn:hover { border-color:var(--accent2); color:var(--accent2); }
    .validate-btn { width:100%; height:56px; border-radius:12px; border:2px solid var(--success); background:transparent; color:var(--success); font-family:'Bebas Neue',sans-serif; font-size:20px; cursor:pointer; }
    .validate-btn:disabled { opacity:0.25; cursor:not-allowed; border-color:var(--muted); color:var(--muted); }

    .step-nav { display:flex; gap:6px; margin-bottom:20px; width:100%; max-width:420px; }
    .step-pip { height:3px; flex:1; border-radius:2px; background:var(--border); transition:background 0.3s; }
    .step-pip.done-pip { background:var(--success); }
    .step-pip.active-pip { background:var(--accent); }
    .divider { border:none; border-top:1px solid var(--border); margin:14px 0; }

    .workout-ex-header { display:flex; flex-direction:column; gap:2px; margin-bottom:20px; }
    .workout-ex-label { font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--muted); }
    .workout-ex-name { font-family:'Bebas Neue',sans-serif; font-size:32px; line-height:1.05; }
    .set-track { display:flex; gap:8px; align-items:center; margin-bottom:24px; flex-wrap:wrap; }
    .set-bubble { display:flex; flex-direction:column; align-items:center; gap:3px; min-width:36px; }
    .set-bubble-dot { width:12px; height:12px; border-radius:50%; border:2px solid #333; background:transparent; transition:all 0.2s; }
    .set-bubble-dot.done { background:var(--success); border-color:var(--success); }
    .set-bubble-dot.active { background:var(--accent); border-color:var(--accent); box-shadow:0 0 8px var(--accent); }
    .set-bubble-reps { font-size:10px; color:var(--muted); min-height:14px; }
    .set-bubble-reps.filled { color:var(--success); font-weight:600; }
    .go-zone { display:flex; flex-direction:column; align-items:center; gap:8px; padding:20px 0; }
    .go-label { font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:var(--muted); }
    .go-serie-num { font-family:'Bebas Neue',sans-serif; font-size:72px; line-height:1; color:var(--accent); }
    .go-target { font-size:13px; color:var(--muted); }
    .go-target span { color:var(--text); font-weight:600; }
    .rep-entry-label { font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; text-align:center; }
    .rep-numpad { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
    .np-btn { height:56px; border-radius:10px; border:1px solid var(--border); background:${inputBg}; color:var(--text); font-family:'Bebas Neue',sans-serif; font-size:24px; cursor:pointer; transition:all 0.1s; }
    .np-btn:hover { background:var(--border); }
    .np-btn:active { transform:scale(0.95); }
    .np-btn.del { font-size:18px; color:var(--muted); }
    .np-btn.zero { grid-column:span 2; }
    .rep-display-val { font-family:'Bebas Neue',sans-serif; font-size:80px; line-height:1; text-align:center; color:var(--muted); margin-bottom:8px; }
    .rep-display-val.has-val { color:var(--accent); }

    /* Record badge */
    .record-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; background:rgba(255,204,0,0.12); border:1px solid #ffcc00; border-radius:20px; font-size:12px; color:#ffcc00; font-weight:600; margin-bottom:12px; animation:pulse 1.5s ease infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }

    /* Note séance */
    .note-area { width:100%; background:${inputBg}; border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; padding:12px 14px; outline:none; resize:vertical; min-height:80px; margin-top:8px; }
    .note-area:focus { border-color:var(--accent); }
    .note-area::placeholder { color:var(--muted); }

    /* Repos */
    .rest-overlay { position:fixed; inset:0; z-index:100; background:rgba(5,5,5,0.97); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 24px; animation:fadeIn 0.2s ease; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .rest-title { font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
    .rest-exercise { font-family:'Bebas Neue',sans-serif; font-size:28px; color:var(--text); margin-bottom:28px; text-align:center; }
    .rest-ring-wrap { position:relative; width:220px; height:220px; margin-bottom:28px; }
    .rest-ring-svg { transform:rotate(-90deg); }
    .rest-ring-bg { fill:none; stroke:#1a1a1a; stroke-width:8; }
    .rest-ring-prog { fill:none; stroke:var(--accent); stroke-width:8; stroke-linecap:round; transition:stroke-dashoffset 1s linear; }
    .rest-ring-prog.warning { stroke:var(--accent2); }
    .rest-time-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .rest-countdown { font-family:'Bebas Neue',sans-serif; font-size:72px; line-height:1; color:var(--accent); }
    .rest-countdown.warning { color:var(--accent2); }
    .rest-of { font-size:12px; color:var(--muted); margin-top:2px; }
    .rest-controls { display:flex; gap:12px; width:100%; max-width:340px; margin-bottom:24px; }
    .rest-ctrl-btn { flex:1; height:52px; border-radius:12px; border:1px solid var(--border); background:#111; color:var(--text); font-family:'Bebas Neue',sans-serif; font-size:18px; cursor:pointer; }
    .rest-ctrl-btn.primary { background:var(--accent); border-color:var(--accent); color:#0a0a0a; }
    .rest-duration-row { display:flex; align-items:center; gap:12px; padding:14px 20px; background:#111; border:1px solid var(--border); border-radius:12px; width:100%; max-width:340px; }
    .rest-duration-label { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em; }
    .rest-presets { display:flex; gap:6px; }
    .rest-preset-btn { background:transparent; border:1px solid var(--border); border-radius:6px; color:var(--muted); font-size:12px; font-weight:500; padding:5px 10px; cursor:pointer; font-family:'DM Sans',sans-serif; }
    .rest-preset-btn.active-preset { border-color:var(--accent); color:var(--accent); }
    .rest-skip { font-size:12px; color:var(--muted); text-decoration:underline; cursor:pointer; background:none; border:none; margin-top:8px; }

    /* Terminé */
    .done-screen { display:flex; flex-direction:column; align-items:center; text-align:center; gap:12px; }
    .done-emoji { font-size:56px; }
    .done-title { font-family:'Bebas Neue',sans-serif; font-size:44px; color:var(--success); }
    .done-sub { font-size:13px; color:var(--muted); line-height:1.6; }
    .done-stats { display:flex; gap:10px; margin-top:4px; flex-wrap:wrap; justify-content:center; }
    .done-stat { background:${inputBg}; border:1px solid var(--border); border-radius:10px; padding:12px 18px; text-align:center; }
    .done-stat-val { font-family:'Bebas Neue',sans-serif; font-size:26px; color:var(--accent); }
    .done-stat-label { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em; margin-top:2px; }

    /* Historique */
    .hist-empty { text-align:center; padding:40px 0; color:var(--muted); font-size:14px; }
    .hist-empty-icon { font-size:40px; margin-bottom:10px; }
    .hist-day { margin-bottom:24px; }
    .hist-day-label { font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
    .hist-session { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:14px 16px; margin-bottom:8px; cursor:pointer; }
    .hist-session.open { border-color:var(--accent); }
    .hist-session-top { display:flex; align-items:center; gap:10px; }
    .hist-session-tags { display:flex; gap:5px; flex-wrap:wrap; flex:1; }
    .hist-stag { font-size:11px; padding:2px 8px; border-radius:20px; border:1px solid; font-weight:500; }
    .hist-session-meta { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
    .hist-session-time { font-size:11px; color:var(--muted); }
    .hist-session-reps { font-family:'Bebas Neue',sans-serif; font-size:20px; color:var(--accent); }
    .hist-detail { margin-top:14px; padding-top:14px; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:10px; }
    .hist-ex-name { font-size:13px; font-weight:600; color:var(--text); }
    .hist-sets-row { display:flex; gap:6px; flex-wrap:wrap; }
    .hist-set-chip { background:${inputBg}; border:1px solid var(--border); border-radius:6px; padding:3px 8px; font-size:12px; color:var(--muted); }
    .hist-note { font-size:12px; color:var(--muted); font-style:italic; padding:8px 12px; background:${inputBg}; border-radius:8px; border-left:3px solid var(--accent); }
    .del-session-btn { background:none; border:none; color:var(--muted); font-size:12px; cursor:pointer; text-decoration:underline; padding:0; }
    .del-session-btn:hover { color:var(--accent2); }

    /* Paramètres */
    .settings-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.85); display:flex; align-items:flex-end; justify-content:center; animation:fadeIn 0.2s ease; }
    .settings-panel { background:#111; border:1px solid var(--border); border-radius:20px 20px 0 0; width:100%; max-width:480px; max-height:88vh; overflow-y:auto; padding:24px 20px 40px; }
    .settings-handle { width:36px; height:4px; background:var(--border); border-radius:2px; margin:0 auto 20px; }
    .settings-title { font-family:'Bebas Neue',sans-serif; font-size:28px; margin-bottom:16px; }
    .settings-tabs { display:flex; gap:6px; margin-bottom:20px; flex-wrap:wrap; }
    .stab { flex:1; min-width:80px; padding:8px 6px; border-radius:8px; border:1px solid var(--border); background:transparent; color:var(--muted); font-family:'DM Sans',sans-serif; font-size:11px; cursor:pointer; }
    .stab.active { border-color:var(--accent); color:var(--accent); background:rgba(232,255,0,0.06); }

    /* Thèmes prédéfinis */
    .themes-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px; }
    .theme-card { border-radius:12px; border:2px solid transparent; cursor:pointer; overflow:hidden; transition:all 0.15s; }
    .theme-card.selected-theme { border-color:var(--accent); }
    .theme-preview { height:52px; display:flex; flex-direction:column; justify-content:flex-end; padding:6px 8px; position:relative; }
    .theme-accent-strip { position:absolute; top:0; left:0; right:0; height:4px; }
    .theme-name { font-size:11px; font-weight:600; margin-top:4px; }
    .theme-emoji { font-size:18px; }

    /* Couleurs manuelles */
    .color-row { display:flex; align-items:center; gap:12px; margin-bottom:10px; padding:10px 14px; background:var(--surface); border-radius:10px; border:1px solid var(--border); }
    .color-label { flex:1; font-size:13px; color:var(--text); }
    .color-desc { font-size:11px; color:var(--muted); }
    .color-picker { width:40px; height:40px; border:none; border-radius:8px; cursor:pointer; padding:2px; background:transparent; }
    .wallpaper-input { width:100%; background:var(--surface); border:1px solid var(--border); border-radius:8px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px; padding:10px 14px; outline:none; margin-bottom:8px; }
    .wallpaper-input:focus { border-color:var(--accent); }
    .wallpaper-input::placeholder { color:var(--muted); }
    .wallpaper-preview { width:100%; height:110px; border-radius:10px; border:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:center; overflow:hidden; margin-bottom:8px; }
    .wallpaper-preview img { width:100%; height:100%; object-fit:cover; }
    .opacity-row { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
    .opacity-label { font-size:12px; color:var(--muted); flex:1; }
    .opacity-val { font-size:13px; color:var(--accent); width:36px; text-align:right; }
    .opacity-slider { flex:2; accent-color:var(--accent); }
    .apply-wall-btn { width:100%; height:44px; border-radius:10px; border:none; background:var(--accent); color:#0a0a0a; font-family:'Bebas Neue',sans-serif; font-size:18px; cursor:pointer; }
    .remove-wall-btn { width:100%; height:40px; border-radius:10px; border:1px solid var(--accent2); background:transparent; color:var(--accent2); font-family:'DM Sans',sans-serif; font-size:13px; cursor:pointer; margin-top:8px; }
    .reset-all-btn { width:100%; height:44px; border-radius:10px; border:1px solid var(--accent2); background:transparent; color:var(--accent2); font-family:'DM Sans',sans-serif; font-size:13px; cursor:pointer; margin-top:8px; }

    /* Éditeur exercices */
    .ex-editor-group { margin-bottom:16px; border:1px solid var(--border); border-radius:10px; overflow:hidden; }
    .ex-editor-group-header { display:flex; align-items:center; gap:8px; padding:12px 14px; cursor:pointer; background:var(--surface); }
    .ex-editor-group-title { font-size:13px; font-weight:600; flex:1; }
    .ex-editor-group-count { font-size:11px; color:var(--muted); }
    .ex-editor-body { padding:10px 14px 14px; }
    .ex-editor-item { display:flex; align-items:center; gap:8px; padding:7px 10px; background:${inputBg}; border:1px solid var(--border); border-radius:8px; margin-bottom:5px; }
    .ex-editor-name { flex:1; font-size:13px; }
    .ex-editor-del { background:none; border:none; color:var(--muted); cursor:pointer; font-size:16px; padding:0 4px; }
    .ex-editor-del:hover { color:var(--accent2); }
    .ex-add-row { display:flex; gap:6px; margin-top:8px; }
    .ex-add-input { flex:1; background:${inputBg}; border:1px solid var(--border); border-radius:8px; color:var(--text); font-size:13px; padding:8px 12px; outline:none; font-family:'DM Sans',sans-serif; }
    .ex-add-input:focus { border-color:var(--accent); }
    .ex-add-input::placeholder { color:var(--muted); }
    .ex-add-btn { background:var(--accent); border:none; border-radius:8px; color:#0a0a0a; font-size:12px; font-weight:700; padding:0 14px; cursor:pointer; font-family:'DM Sans',sans-serif; }
    .ex-add-btn:disabled { opacity:0.3; cursor:not-allowed; }

    /* Graphiques */
    .stats-overlay { position:fixed; inset:0; z-index:150; background:rgba(0,0,0,0.9); display:flex; align-items:flex-end; justify-content:center; animation:fadeIn 0.2s ease; }
    .stats-panel { background:#111; border:1px solid var(--border); border-radius:20px 20px 0 0; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; padding:24px 20px 40px; }
    .stats-title { font-family:'Bebas Neue',sans-serif; font-size:28px; margin-bottom:4px; }
    .stats-subtitle { font-size:12px; color:var(--muted); margin-bottom:16px; }
    .stats-filter { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:16px; }
    .stats-filter-btn { padding:5px 12px; border-radius:20px; border:1px solid var(--border); background:transparent; color:var(--muted); font-size:12px; cursor:pointer; font-family:'DM Sans',sans-serif; }
    .stats-filter-btn.active { border-color:var(--accent); color:var(--accent); background:rgba(232,255,0,0.08); }
    .chart-wrap { margin-bottom:20px; }
    .chart-title { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; }
    .bar-chart { display:flex; align-items:flex-end; gap:3px; height:100px; width:100%; }
    .bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; }
    .bar { width:100%; border-radius:3px 3px 0 0; background:var(--accent); opacity:0.7; min-height:2px; transition:height 0.3s; cursor:pointer; }
    .bar:hover { opacity:1; }
    .bar-label { font-size:8px; color:var(--muted); writing-mode:vertical-rl; transform:rotate(180deg); max-height:30px; overflow:hidden; }
    .stats-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px; }
    .stat-box { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:12px; text-align:center; }
    .stat-box-val { font-family:'Bebas Neue',sans-serif; font-size:28px; color:var(--accent); }
    .stat-box-label { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em; }
    .records-list { display:flex; flex-direction:column; gap:8px; }
    .record-item { display:flex; align-items:center; gap:10px; padding:10px 14px; background:var(--surface); border:1px solid var(--border); border-radius:10px; }
    .record-crown { font-size:18px; }
    .record-info { flex:1; }
    .record-name { font-size:13px; font-weight:600; }
    .record-val { font-size:11px; color:var(--muted); }
    .record-best { font-family:'Bebas Neue',sans-serif; font-size:22px; color:#ffcc00; }

    /* Export */
    .export-btn { width:100%; height:50px; border-radius:12px; border:1px solid var(--border); background:var(--surface); color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:10px; }
    .export-btn:hover { border-color:var(--accent); color:var(--accent); }

    /* Programme hebdo */
    .weekly-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:16px; }
    .day-col { display:flex; flex-direction:column; gap:4px; }
    .day-header { font-size:10px; text-align:center; color:var(--muted); font-weight:600; padding:4px 0; text-transform:uppercase; }
    .day-header.today { color:var(--accent); }
    .day-slot { min-height:36px; border:1px solid var(--border); border-radius:6px; background:var(--surface); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; cursor:pointer; padding:4px 2px; transition:all 0.13s; }
    .day-slot:hover { border-color:#444; }
    .day-slot.has-groups { border-color:var(--accent); background:rgba(232,255,0,0.05); }
    .day-slot.is-today { box-shadow:0 0 0 2px var(--accent); }
    .day-slot-emoji { font-size:12px; }
    .day-slot-empty { font-size:16px; color:var(--border); }
    .day-edit-panel { padding:14px; background:var(--surface); border:1px solid var(--border); border-radius:12px; margin-bottom:12px; }
    .day-edit-title { font-size:13px; font-weight:600; margin-bottom:10px; }
    .day-group-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
    .day-group-btn { display:flex; flex-direction:column; align-items:center; gap:3px; padding:8px 4px; border-radius:8px; border:1px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; font-size:11px; font-family:'DM Sans',sans-serif; }
    .day-group-btn.sel { border-color:var(--g-color,var(--accent)); color:var(--g-color,var(--accent)); }
    .day-group-btn .dg-emoji { font-size:16px; }
    .weekly-start-btn { width:100%; height:50px; border-radius:12px; border:none; background:var(--accent); color:#0a0a0a; font-family:'Bebas Neue',sans-serif; font-size:20px; cursor:pointer; }
    .weekly-start-btn:disabled { opacity:0.3; cursor:not-allowed; }

    /* Programme hebdo — onglet dans l'app */
    .weekly-tab { width:100%; max-width:420px; }
  `;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  PROGRAMME HEBDOMADAIRE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const [weeklyProgram, setWeeklyProgram] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rc-weekly") || "{}"); } catch { return {}; }
  });
  const [showWeekly, setShowWeekly] = useState(false);
  const [editingDay, setEditingDay] = useState(null);

  const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const todayIdx = (new Date().getDay() + 6) % 7; // 0=Lun

  function saveWeekly(w) {
    localStorage.setItem("rc-weekly", JSON.stringify(w));
    setWeeklyProgram(w);
  }

  function toggleDayGroup(dayKey, groupId) {
    const current = weeklyProgram[dayKey] || [];
    const next = current.includes(groupId)
      ? current.filter(g => g !== groupId)
      : [...current, groupId];
    saveWeekly({ ...weeklyProgram, [dayKey]: next });
  }

  function startFromWeekly() {
    const todayKey = DAY_KEYS[todayIdx];
    const groups = weeklyProgram[todayKey] || [];
    if (groups.length === 0) return;
    setSelectedGroups(groups);
    setShowWeekly(false);
    setStep("exercises");
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RECORDS PERSONNELS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function computeRecords(hist) {
    const records = {};
    hist.forEach(session => {
      session.exercises.forEach(ex => {
        const maxReps = Math.max(...ex.sets);
        if (!records[ex.exName] || maxReps > records[ex.exName]) {
          records[ex.exName] = maxReps;
        }
      });
    });
    return records;
  }

  function checkNewRecord(exName, reps) {
    const records = computeRecords(history);
    return reps > (records[exName] || 0);
  }

  // Vérifie si le rep en cours bat un record
  const currentRec = curExName => {
    if (!repInput || parseInt(repInput) === 0) return false;
    return checkNewRecord(curExName, parseInt(repInput));
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  GRAPHIQUES — calcul des données
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function getChartData() {
    const days = getLast30Days();
    return days.map(day => {
      const sessions = history.filter(s => new Date(s.date).toDateString() === day);
      let reps = 0;
      sessions.forEach(s => {
        if (statsGroup === "all") {
          reps += s.totalReps;
        } else {
          s.exercises.forEach(ex => {
            if (ex.group === statsGroup) reps += ex.sets.reduce((a, r) => a + r, 0);
          });
        }
      });
      return { day, reps, label: new Date(day).getDate() + "/" + (new Date(day).getMonth() + 1) };
    });
  }

  function getStatsNumbers() {
    const filtered = statsGroup === "all" ? history :
      history.filter(s => s.exercises.some(e => e.group === statsGroup));
    const totalReps = filtered.reduce((acc, s) => acc + s.totalReps, 0);
    const totalSessions = filtered.length;
    const avgReps = totalSessions > 0 ? Math.round(totalReps / totalSessions) : 0;
    return { totalReps, totalSessions, avgReps };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  EXPORT CSV
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function exportCSV() {
    const lines = ["Date,Heure,Groupes,Exercice,Série,Reps,Note"];
    history.forEach(s => {
      const date = formatDate(s.date);
      const time = formatTime(s.date);
      const groups = s.groups.map(g => getGroupMeta(g)?.label || g).join("+");
      const note = s.note || "";
      s.exercises.forEach(ex => {
        ex.sets.forEach((r, i) => {
          lines.push(`"${date}","${time}","${groups}","${ex.exName}",${i + 1},${r},"${note}"`);
        });
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "rep-counter-historique.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "rep-counter-historique.json"; a.click();
    URL.revokeObjectURL(url);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  LOGIQUE WORKOUT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function getGroupMeta(id) { return DEFAULT_MUSCLE_GROUPS.find(g => g.id === id); }

  function toggleGroup(id) {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    setSelectedExercises([]);
  }

  function toggleExercise(ex) {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.name === ex.name && e.group === ex.group);
      return exists ? prev.filter(e => !(e.name === ex.name && e.group === ex.group)) : [...prev, ex];
    });
  }

  function addCustomExercise() {
    const name = customInput.trim();
    if (!name || !customGroup) return;
    saveCustomExercises({ ...customExercises, [customGroup]: [...(customExercises[customGroup] || []), name] });
    setCustomInput("");
  }

  function deleteCustomExercise(groupId, name) {
    saveCustomExercises({ ...customExercises, [groupId]: (customExercises[groupId] || []).filter(n => n !== name) });
    setSelectedExercises(prev => prev.filter(e => !(e.name === name && e.group === groupId)));
  }

  function startWorkout() {
    const plan = selectedExercises.map(ex => ({
      exName: ex.name, group: ex.group,
      sets: Array.from({ length: totalSets }, () => ({ reps: null, status: "pending" }))
    }));
    if (plan.length > 0) plan[0].sets[0].status = "active";
    setWorkoutPlan(plan);
    setCurrentExIdx(0); setCurrentSetIdx(0); setRepInput("");
    setSessionSeconds(0); setSessionTimerActive(true);
    setStep("workout");
  }

  function numpadPress(val) {
    setRepInput(prev => {
      if (val === "del") return prev.slice(0, -1);
      const next = prev + val;
      return parseInt(next) > 999 ? prev : next;
    });
  }

  function startRest(nextFn) {
    pendingNext.current = nextFn;
    setRestRemaining(restDuration);
    setRestPaused(false);
    setShowRest(true);
  }

  function finishRest() {
    setShowRest(false);
    clearInterval(restInterval.current);
    if (pendingNext.current) { pendingNext.current(); pendingNext.current = null; }
  }

  function changeRestDuration(d) { setRestDuration(d); setRestRemaining(d); }

  function validateSet() {
    const reps = parseInt(repInput) || 0;
    const isLastSet = currentSetIdx + 1 >= totalSets;
    const isLastEx = currentExIdx + 1 >= workoutPlan.length;

    const updatedPlan = workoutPlan.map((ex, ei) => {
      if (ei === currentExIdx) {
        return {
          ...ex,
          sets: ex.sets.map((s, si) => {
            if (si === currentSetIdx) return { reps, status: "done" };
            if (!isLastSet && si === currentSetIdx + 1) return { ...s, status: "active" };
            return s;
          })
        };
      }
      if (isLastSet && !isLastEx && ei === currentExIdx + 1) {
        return { ...ex, sets: ex.sets.map((s, si) => si === 0 ? { ...s, status: "active" } : s) };
      }
      return ex;
    });

    setWorkoutPlan(updatedPlan);
    setRepInput("");

    const doNext = () => {
      if (!isLastSet) {
        setCurrentSetIdx(s => s + 1);
      } else if (!isLastEx) {
        setCurrentExIdx(e => e + 1);
        setCurrentSetIdx(0);
      } else {
        // Fin de séance
        setSessionTimerActive(false);
        const totalReps = updatedPlan.reduce((acc, ex) => acc + ex.sets.reduce((a, s) => a + (s.reps || 0), 0), 0);
        const session = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          groups: selectedGroups,
          exercises: updatedPlan.map(ex => ({
            exName: ex.exName, group: ex.group,
            sets: ex.sets.map(s => s.reps || 0)
          })),
          totalReps,
          totalSets: totalSets * updatedPlan.length,
          targetReps,
          duration: sessionSeconds,
          note: "",
        };
        // Stocker temporairement la session pour ajouter la note
        pendingSessionRef.current = session;
        const newHistory = [session, ...history];
        saveHistory(newHistory);
        setStep("done");
      }
    };

    if (!(isLastSet && isLastEx)) startRest(doNext);
    else doNext();
  }

  const pendingSessionRef = useRef(null);

  function saveNoteToSession(note) {
    if (!pendingSessionRef.current) return;
    const updatedHistory = history.map(s =>
      s.id === pendingSessionRef.current.id ? { ...s, note } : s
    );
    saveHistory(updatedHistory);
  }

  function deleteSession(id) {
    saveHistory(history.filter(s => s.id !== id));
    setOpenSession(null);
  }

  function reset() {
    setStep("groups"); setSelectedGroups([]); setSelectedExercises([]);
    setCustomInput(""); setCustomGroup(null); setTotalSets(3); setTargetReps(10);
    setWorkoutPlan([]); setCurrentExIdx(0); setCurrentSetIdx(0); setRepInput("");
    setShowRest(false); setShowHistory(false); setShowSettings(false);
    setShowStats(false); setShowWeekly(false); setSessionNote("");
    setSessionTimerActive(false); setSessionSeconds(0);
    pendingNext.current = null; pendingSessionRef.current = null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  PARAMÈTRES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function applyPreset(preset) {
    saveTheme({ ...theme, ...preset });
  }

  function updateThemeColor(key, val) { saveTheme({ ...theme, [key]: val }); }

  function applyWallpaper() { saveTheme({ ...theme, wallpaperUrl: wallpaperInput }); }

  function removeWallpaper() {
    setWallpaperInput("");
    saveTheme({ ...theme, wallpaperUrl: "" });
  }

  function addExerciseInEditor(groupId) {
    if (!newExInput.trim()) return;
    saveExercises({ ...editableExercises, [groupId]: [...(editableExercises[groupId] || []), newExInput.trim()] });
    setNewExInput("");
  }

  function removeExerciseInEditor(groupId, name) {
    saveExercises({ ...editableExercises, [groupId]: (editableExercises[groupId] || []).filter(n => n !== name) });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  VARIABLES UTILES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const curEx = workoutPlan[currentExIdx];
  const curGroupMeta = curEx ? getGroupMeta(curEx.group) : null;
  const totalRepsDone = workoutPlan.reduce((acc, ex) => acc + ex.sets.reduce((a, s) => a + (s.reps || 0), 0), 0);
  const STEPS = ["groups", "exercises", "config", "workout"];
  const R = 96, CIRC = 2 * Math.PI * R;
  const restPct = restDuration > 0 ? restRemaining / restDuration : 0;
  const isWarning = restRemaining <= 10;
  const histByDay = history.reduce((acc, s) => {
    const day = new Date(s.date).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});
  const chartData = getChartData();
  const maxBar = Math.max(...chartData.map(d => d.reps), 1);
  const statsNumbers = getStatsNumbers();
  const records = computeRecords(history);
  const isNewRec = curEx && repInput && parseInt(repInput) > 0 && checkNewRecord(curEx.exName, parseInt(repInput));

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDU — REPOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (showRest) return (
    <>
      <style>{css}</style>
      <div className="rest-overlay">
        <div className="rest-title">Temps de repos</div>
        <div className="rest-exercise">{curEx?.exName}</div>
        <div className="rest-ring-wrap">
          <svg className="rest-ring-svg" width="220" height="220" viewBox="0 0 220 220">
            <circle className="rest-ring-bg" cx="110" cy="110" r={R} />
            <circle className={`rest-ring-prog${isWarning ? " warning" : ""}`} cx="110" cy="110" r={R}
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - restPct)} />
          </svg>
          <div className="rest-time-center">
            <div className={`rest-countdown${isWarning ? " warning" : ""}`}>
              {pad(Math.floor(restRemaining / 60))}:{pad(restRemaining % 60)}
            </div>
            <div className="rest-of">/ {pad(Math.floor(restDuration / 60))}:{pad(restDuration % 60)}</div>
          </div>
        </div>
        <div className="rest-duration-row">
          <div className="rest-duration-label">Durée</div>
          <div className="rest-presets">
            {REST_PRESETS.map(s => (
              <button key={s} className={`rest-preset-btn${restDuration === s ? " active-preset" : ""}`}
                onClick={() => changeRestDuration(s)}>
                {s < 60 ? `${s}s` : `${s / 60}min`}
              </button>
            ))}
          </div>
        </div>
        <div className="rest-controls" style={{ marginTop: 16 }}>
          <button className="rest-ctrl-btn" onClick={() => setRestPaused(p => !p)}>
            {restPaused ? "▶ REPRENDRE" : "⏸ PAUSE"}
          </button>
          <button className="rest-ctrl-btn primary" onClick={finishRest}>PASSER →</button>
        </div>
        <button className="rest-skip" onClick={finishRest}>Ignorer le repos</button>
      </div>
    </>
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDU — HISTORIQUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (showHistory) return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="header-label">Musculation</div>
            <div className="header-title">HISTO<br />RIQUE</div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={exportCSV}>📥 CSV</button>
            <button className="icon-btn" onClick={exportJSON}>📥 JSON</button>
            <button className="icon-btn active" onClick={() => setShowHistory(false)}>
              <span className="ib-icon">🏋️</span>Retour
            </button>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="card">
            <div className="hist-empty">
              <div className="hist-empty-icon">📋</div>
              <div>Aucune séance enregistrée.</div>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: 420 }}>
            {Object.entries(histByDay).map(([day, sessions]) => (
              <div key={day} className="hist-day">
                <div className="hist-day-label">{formatDate(sessions[0].date)}</div>
                {sessions.map(session => {
                  const isOpen = openSession === session.id;
                  return (
                    <div key={session.id} className={`hist-session${isOpen ? " open" : ""}`}
                      onClick={() => setOpenSession(isOpen ? null : session.id)}>
                      <div className="hist-session-top">
                        <div className="hist-session-tags">
                          {session.groups.map(gid => {
                            const g = getGroupMeta(gid);
                            return g ? (
                              <span key={gid} className="hist-stag"
                                style={{ color: g.color, borderColor: g.color, background: g.color + "15" }}>
                                {g.emoji} {g.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                        <div className="hist-session-meta">
                          <div className="hist-session-time">{formatTime(session.date)}</div>
                          <div className="hist-session-reps">{session.totalReps} reps</div>
                          {session.duration && (
                            <div style={{ fontSize: 10, color: "var(--muted)" }}>⏱ {formatDuration(session.duration)}</div>
                          )}
                        </div>
                      </div>
                      {isOpen && (
                        <div className="hist-detail" onClick={e => e.stopPropagation()}>
                          {session.note && (
                            <div className="hist-note">📝 {session.note}</div>
                          )}
                          {session.exercises.map((ex, i) => {
                            const total = ex.sets.reduce((a, r) => a + r, 0);
                            return (
                              <div key={i}>
                                <div className="hist-ex-name">{ex.exName}</div>
                                <div className="hist-sets-row" style={{ margin: "4px 0" }}>
                                  {ex.sets.map((r, si) => (
                                    <div key={si} className="hist-set-chip">S{si + 1} : {r} reps</div>
                                  ))}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>{total} reps</div>
                              </div>
                            );
                          })}
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                            <span>{session.exercises.length} exercice{session.exercises.length > 1 ? "s" : ""}</span>
                            <span>{session.totalSets} séries</span>
                          </div>
                          <button className="del-session-btn" onClick={() => deleteSession(session.id)}>
                            Supprimer cette séance
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDU — PROGRAMME HEBDO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (showWeekly) return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="header-label">Musculation</div>
            <div className="header-title">PROG<br />RAMME</div>
          </div>
          <button className="icon-btn active" onClick={() => setShowWeekly(false)}>
            <span className="ib-icon">🏋️</span>Retour
          </button>
        </div>

        <div className="card weekly-tab">
          <div className="section-title">Programme de la semaine</div>
          <div className="weekly-grid">
            {DAYS.map((day, i) => {
              const key = DAY_KEYS[i];
              const groups = weeklyProgram[key] || [];
              const isToday = i === todayIdx;
              return (
                <div key={key} className="day-col">
                  <div className={`day-header${isToday ? " today" : ""}`}>{day}</div>
                  <div className={`day-slot${groups.length > 0 ? " has-groups" : ""}${isToday ? " is-today" : ""}`}
                    onClick={() => setEditingDay(editingDay === key ? null : key)}>
                    {groups.length > 0
                      ? groups.map(g => <span key={g} className="day-slot-emoji">{getGroupMeta(g)?.emoji}</span>)
                      : <span className="day-slot-empty">+</span>
                    }
                  </div>
                </div>
              );
            })}
          </div>

          {editingDay && (
            <div className="day-edit-panel">
              <div className="day-edit-title">
                {DAYS[DAY_KEYS.indexOf(editingDay)]} — Choisir les groupes musculaires
              </div>
              <div className="day-group-grid">
                {DEFAULT_MUSCLE_GROUPS.map(g => {
                  const sel = (weeklyProgram[editingDay] || []).includes(g.id);
                  return (
                    <button key={g.id} className={`day-group-btn${sel ? " sel" : ""}`}
                      style={{ "--g-color": g.color }}
                      onClick={() => toggleDayGroup(editingDay, g.id)}>
                      <span className="dg-emoji">{g.emoji}</span>
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bouton lancer séance d'aujourd'hui */}
          {(weeklyProgram[DAY_KEYS[todayIdx]] || []).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginBottom: 8 }}>
                Aujourd'hui : {(weeklyProgram[DAY_KEYS[todayIdx]] || []).map(g => getGroupMeta(g)?.label).join(" · ")}
              </div>
              <button className="weekly-start-btn" onClick={startFromWeekly}>
                LANCER LA SÉANCE DU JOUR →
              </button>
            </div>
          )}
          {(weeklyProgram[DAY_KEYS[todayIdx]] || []).length === 0 && (
            <div style={{ textAlign: "center", padding: "12px 0", fontSize: 13, color: "var(--muted)" }}>
              Aucune séance programmée aujourd'hui — clique sur le jour pour en ajouter une.
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDU PRINCIPAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <>
      <style>{css}</style>

      {/* ── PARAMÈTRES ── */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-handle" />
            <div className="settings-title">⚙️ PARAMÈTRES</div>
            <div className="settings-tabs">
              {[
                { id: "themes", label: "🎨 Thèmes" },
                { id: "colors", label: "🖌️ Couleurs" },
                { id: "wallpaper", label: "🖼️ Fond" },
                { id: "exercises", label: "💪 Exercices" },
                { id: "export", label: "📥 Export" },
              ].map(t => (
                <button key={t.id} className={`stab${settingsTab === t.id ? " active" : ""}`}
                  onClick={() => setSettingsTab(t.id)}>{t.label}</button>
              ))}
            </div>

            {/* ── THÈMES PRÉDÉFINIS ── */}
            {settingsTab === "themes" && (
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                  Sélectionne un thème prédéfini pour changer l'apparence en un clic.
                </div>
                <div className="themes-grid">
                  {PRESET_THEMES.map(preset => (
                    <div key={preset.id}
                      className={`theme-card${theme.bg === preset.bg && theme.accent === preset.accent ? " selected-theme" : ""}`}
                      onClick={() => applyPreset(preset)}>
                      <div className="theme-preview" style={{ background: preset.surface }}>
                        <div className="theme-accent-strip" style={{ background: preset.accent }} />
                        <span className="theme-emoji">{preset.emoji}</span>
                        <span className="theme-name" style={{ color: preset.text }}>{preset.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
                  Clique sur l'onglet "Couleurs" pour personnaliser manuellement.
                </div>
              </div>
            )}

            {/* ── COULEURS MANUELLES ── */}
            {settingsTab === "colors" && (
              <div>
                {[
                  { key: "bg",      label: "Fond de page",      desc: "Arrière-plan principal" },
                  { key: "surface", label: "Fond des cartes",   desc: "Blocs et panneaux" },
                  { key: "accent",  label: "Couleur principale", desc: "Boutons, timer actifs" },
                  { key: "accent2", label: "Couleur d'alerte",  desc: "Suppression, danger" },
                  { key: "text",    label: "Texte",             desc: "Texte principal" },
                  { key: "success", label: "Succès",            desc: "Séries validées" },
                  { key: "muted",   label: "Texte secondaire",  desc: "Labels, indications" },
                  { key: "border",  label: "Bordures",          desc: "Contour des éléments" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="color-row">
                    <div>
                      <div className="color-label">{label}</div>
                      <div className="color-desc">{desc}</div>
                    </div>
                    <input type="color" className="color-picker" value={theme[key]}
                      onChange={e => updateThemeColor(key, e.target.value)} />
                  </div>
                ))}
                <button className="reset-all-btn" onClick={() => saveTheme(DEFAULT_THEME)}>
                  Réinitialiser toutes les couleurs
                </button>
              </div>
            )}

            {/* ── FOND D'ÉCRAN ── */}
            {settingsTab === "wallpaper" && (
              <div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, lineHeight: 1.6 }}>
                  Colle une URL d'image. Pour tes propres photos, utilise <strong style={{ color: "var(--text)" }}>imgbb.com</strong> (gratuit) → téléverse → copie le "Lien direct".
                </p>
                <input className="wallpaper-input" placeholder="https://i.ibb.co/exemple.jpg"
                  value={wallpaperInput} onChange={e => setWallpaperInput(e.target.value)} />
                <div className="wallpaper-preview">
                  {wallpaperInput
                    ? <img src={wallpaperInput} alt="Aperçu" />
                    : <span style={{ fontSize: 12, color: "var(--muted)" }}>Aperçu ici</span>}
                </div>
                <div className="opacity-row">
                  <div className="opacity-label">Opacité</div>
                  <input type="range" className="opacity-slider" min="0.05" max="0.6" step="0.05"
                    value={theme.wallpaperOpacity}
                    onChange={e => saveTheme({ ...theme, wallpaperOpacity: e.target.value })} />
                  <div className="opacity-val">{Math.round(parseFloat(theme.wallpaperOpacity) * 100)}%</div>
                </div>
                <button className="apply-wall-btn" onClick={applyWallpaper}>APPLIQUER</button>
                {theme.wallpaperUrl && (
                  <button className="remove-wall-btn" onClick={removeWallpaper}>Supprimer le fond</button>
                )}
              </div>
            )}

            {/* ── EXERCICES ── */}
            {settingsTab === "exercises" && (
              <div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, lineHeight: 1.6 }}>
                  Clique sur un groupe pour le déplier et modifier sa liste d'exercices.
                </p>
                {DEFAULT_MUSCLE_GROUPS.map(g => {
                  const isOpen = editingGroup === g.id;
                  const exList = editableExercises[g.id] || [];
                  return (
                    <div key={g.id} className="ex-editor-group">
                      <div className="ex-editor-group-header"
                        onClick={() => setEditingGroup(isOpen ? null : g.id)}>
                        <span style={{ fontSize: 16 }}>{g.emoji}</span>
                        <span className="ex-editor-group-title" style={{ color: g.color }}>{g.label}</span>
                        <span className="ex-editor-group-count">{exList.length} exercices</span>
                        <span style={{ color: "var(--muted)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                      </div>
                      {isOpen && (
                        <div className="ex-editor-body">
                          {exList.map((name, i) => (
                            <div key={i} className="ex-editor-item">
                              <span className="ex-editor-name">{name}</span>
                              <button className="ex-editor-del"
                                onClick={() => removeExerciseInEditor(g.id, name)}>×</button>
                            </div>
                          ))}
                          <div className="ex-add-row">
                            <input className="ex-add-input" placeholder="Nouvel exercice..."
                              value={editingGroup === g.id ? newExInput : ""}
                              onChange={e => setNewExInput(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && addExerciseInEditor(g.id)} />
                            <button className="ex-add-btn" disabled={!newExInput.trim()}
                              onClick={() => addExerciseInEditor(g.id)}>+ Ajouter</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="reset-all-btn" onClick={() => saveExercises(DEFAULT_EXERCISES)}>
                  Réinitialiser les exercices par défaut
                </button>
              </div>
            )}

            {/* ── EXPORT ── */}
            {settingsTab === "export" && (
              <div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
                  Exporte ton historique complet pour le conserver ou l'analyser dans un tableur.
                </p>
                <button className="export-btn" onClick={exportCSV}>
                  📊 Exporter en CSV (Excel, Google Sheets)
                </button>
                <button className="export-btn" onClick={exportJSON}>
                  🗂️ Exporter en JSON (sauvegarde brute)
                </button>
                <div style={{ marginTop: 12, padding: 12, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
                  <strong style={{ color: "var(--accent)" }}>CSV</strong> — ouvre le fichier dans Excel ou Google Sheets pour faire des tableaux et graphiques.<br />
                  <strong style={{ color: "var(--accent)" }}>JSON</strong> — format technique pour sauvegarder et restaurer tes données.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GRAPHIQUES ── */}
      {showStats && (
        <div className="stats-overlay" onClick={() => setShowStats(false)}>
          <div className="stats-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-handle" />
            <div className="stats-title">📊 STATISTIQUES</div>
            <div className="stats-subtitle">30 derniers jours</div>

            <div className="stats-filter">
              <button className={`stats-filter-btn${statsGroup === "all" ? " active" : ""}`}
                onClick={() => setStatsGroup("all")}>Tout</button>
              {DEFAULT_MUSCLE_GROUPS.map(g => (
                <button key={g.id}
                  className={`stats-filter-btn${statsGroup === g.id ? " active" : ""}`}
                  onClick={() => setStatsGroup(g.id)}>
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>

            <div className="stats-summary">
              <div className="stat-box">
                <div className="stat-box-val">{statsNumbers.totalSessions}</div>
                <div className="stat-box-label">Séances</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-val">{statsNumbers.totalReps}</div>
                <div className="stat-box-label">Reps total</div>
              </div>
              <div className="stat-box">
                <div className="stat-box-val">{statsNumbers.avgReps}</div>
                <div className="stat-box-label">Moy/séance</div>
              </div>
            </div>

            <div className="chart-wrap">
              <div className="chart-title">Reps par jour (30 jours)</div>
              <div className="bar-chart">
                {chartData.map((d, i) => (
                  <div key={i} className="bar-col">
                    <div className="bar"
                      style={{ height: `${Math.max((d.reps / maxBar) * 80, d.reps > 0 ? 6 : 2)}px` }}
                      title={`${d.label} : ${d.reps} reps`} />
                    {i % 5 === 0 && <div className="bar-label">{d.label}</div>}
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(records).length > 0 && (
              <>
                <div className="chart-title" style={{ marginBottom: 8 }}>🏅 Records personnels</div>
                <div className="records-list">
                  {Object.entries(records)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([name, best]) => (
                      <div key={name} className="record-item">
                        <span className="record-crown">🥇</span>
                        <div className="record-info">
                          <div className="record-name">{name}</div>
                          <div className="record-val">Meilleure série</div>
                        </div>
                        <div className="record-best">{best} reps</div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── APP PRINCIPALE ── */}
      <div className="app">
        <div className="header">
          <div>
            <div className="header-label">Musculation</div>
            <div className="header-title">REP<br />COUNTER</div>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setShowWeekly(true)}>
              <span className="ib-icon">📅</span>Programme
            </button>
            <button className="icon-btn" onClick={() => setShowHistory(true)}>
              <span className="ib-icon">📋</span>
              {history.length > 0 ? `(${history.length})` : "Historique"}
            </button>
            <button className="icon-btn" onClick={() => setShowStats(true)}>
              <span className="ib-icon">📊</span>Stats
            </button>
            <button className={`icon-btn${showSettings ? " active" : ""}`} onClick={() => setShowSettings(s => !s)}>
              <span className="ib-icon">⚙️</span>Réglages
            </button>
          </div>
        </div>

        {step === "workout" && (
          <div className="session-timer">
            <span className="timer-icon">⏱️</span>
            <span className="timer-label">Durée de la séance</span>
            <span className="timer-val">{formatDuration(sessionSeconds)}</span>
          </div>
        )}

        {step !== "done" && (
          <div className="step-nav">
            {STEPS.map((s, i) => {
              const curr = STEPS.indexOf(step);
              return <div key={s} className={`step-pip${i === curr ? " active-pip" : i < curr ? " done-pip" : ""}`} />;
            })}
          </div>
        )}

        {/* ── GROUPES ── */}
        {step === "groups" && (
          <div className="card">
            <div className="section-title">Zones musculaires · choix libre</div>
            <div className="group-grid">
              {DEFAULT_MUSCLE_GROUPS.map(g => (
                <button key={g.id} className={`group-btn${selectedGroups.includes(g.id) ? " selected" : ""}`}
                  style={{ "--g-color": g.color }} onClick={() => toggleGroup(g.id)}>
                  <span className="g-emoji">{g.emoji}</span>{g.label}
                </button>
              ))}
            </div>
            {selectedGroups.length > 0 && (
              <div className="tag-row">
                {selectedGroups.map(id => {
                  const g = getGroupMeta(id);
                  return <span key={id} className="tag" style={{ color: g.color, borderColor: g.color, background: g.color + "15" }}>{g.emoji} {g.label}</span>;
                })}
              </div>
            )}
            <p className="group-hint">
              {selectedGroups.length === 0 ? "Sélectionne une ou plusieurs zones" :
                <><span>{selectedGroups.length}</span> zone{selectedGroups.length > 1 ? "s" : ""} sélectionnée{selectedGroups.length > 1 ? "s" : ""}</>}
            </p>
            <button className="start-btn" disabled={selectedGroups.length === 0} onClick={() => setStep("exercises")}>
              CHOISIR LES EXERCICES →
            </button>
          </div>
        )}

        {/* ── EXERCICES ── */}
        {step === "exercises" && (
          <>
            <div className="card">
              <div className="section-title">Exercices · {selectedExercises.length} sélectionné{selectedExercises.length > 1 ? "s" : ""}</div>
              {selectedGroups.map((groupId, gi) => {
                const g = getGroupMeta(groupId);
                const allEx = [
                  ...(editableExercises[groupId] || []).map(n => ({ name: n, isCustom: false })),
                  ...(customExercises[groupId] || []).map(n => ({ name: n, isCustom: true }))
                ];
                return (
                  <div key={groupId} style={{ marginBottom: gi < selectedGroups.length - 1 ? 20 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 15 }}>{g.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: g.color }}>{g.label}</span>
                    </div>
                    <div className="ex-list">
                      {allEx.map(({ name, isCustom }) => {
                        const isSelected = selectedExercises.some(e => e.name === name && e.group === groupId);
                        return (
                          <div key={name} className={`ex-item${isSelected ? " selected" : ""}`}
                            onClick={() => toggleExercise({ name, group: groupId })}>
                            <div className="ex-item-dot" />
                            <div className="ex-item-label">{name}</div>
                            {isCustom && (
                              <button className="ex-item-del"
                                onClick={e => { e.stopPropagation(); deleteCustomExercise(groupId, name); }}>×</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <hr className="divider" />
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                Ajouter un exercice temporaire
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {selectedGroups.map(gid => {
                  const g = getGroupMeta(gid);
                  return (
                    <button key={gid} onClick={() => setCustomGroup(gid)}
                      style={{
                        background: customGroup === gid ? g.color + "20" : "transparent",
                        border: `1px solid ${customGroup === gid ? g.color : "var(--border)"}`,
                        borderRadius: 6, padding: "4px 10px",
                        color: customGroup === gid ? g.color : "var(--muted)",
                        fontSize: 12, cursor: "pointer"
                      }}>
                      {g.emoji} {g.label}
                    </button>
                  );
                })}
              </div>
              <div className="add-custom-row">
                <input className="custom-input" placeholder="Nom de l'exercice…"
                  value={customInput} onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCustomExercise()} />
                <button className="add-btn" onClick={addCustomExercise} disabled={!customInput.trim() || !customGroup}>
                  + AJOUTER
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 420 }}>
              <button className="reset-btn" style={{ flex: 1 }} onClick={() => setStep("groups")}>← Retour</button>
              <button className="start-btn" style={{ flex: 3, marginTop: 0 }}
                disabled={selectedExercises.length === 0} onClick={() => setStep("config")}>
                CONFIGURER ({selectedExercises.length}) →
              </button>
            </div>
          </>
        )}

        {/* ── CONFIG ── */}
        {step === "config" && (
          <>
            <div className="card">
              <div className="section-title">Configuration</div>
              <div className="config-row">
                <div className="config-label">Séries par exercice</div>
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => setTotalSets(s => Math.max(1, s - 1))}>−</button>
                  <div className="stepper-val">{totalSets}</div>
                  <button className="stepper-btn" onClick={() => setTotalSets(s => Math.min(10, s + 1))}>+</button>
                </div>
              </div>
              <div className="config-row">
                <div className="config-label">Reps cibles</div>
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => setTargetReps(r => Math.max(1, r - 1))}>−</button>
                  <div className="stepper-val">{targetReps}</div>
                  <button className="stepper-btn" onClick={() => setTargetReps(r => Math.min(50, r + 1))}>+</button>
                </div>
              </div>
              <div className="config-row" style={{ marginBottom: 0 }}>
                <div className="config-label">Repos entre séries</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {REST_PRESETS.map(s => (
                    <button key={s} onClick={() => setRestDuration(s)}
                      style={{
                        background: restDuration === s ? "var(--accent)" : "transparent",
                        border: `1px solid ${restDuration === s ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 6, padding: "6px 10px",
                        color: restDuration === s ? "#0a0a0a" : "var(--muted)",
                        fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer"
                      }}>
                      {s < 60 ? `${s}s` : `${s / 60}min`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="section-title">Programme de la séance</div>
              <div className="plan-list">
                {selectedExercises.map((ex, i) => {
                  const g = getGroupMeta(ex.group);
                  return (
                    <div key={i} className="plan-item">
                      <div className="plan-idx">{i + 1}</div>
                      <div className="plan-info">
                        <div className="plan-name">{ex.name}</div>
                        <div className="plan-detail" style={{ color: g.color }}>{g.emoji} {g.label}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{totalSets}×{targetReps}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 420 }}>
              <button className="reset-btn" style={{ flex: 1 }} onClick={() => setStep("exercises")}>← Retour</button>
              <button className="start-btn" style={{ flex: 3, marginTop: 0 }} onClick={startWorkout}>
                LANCER LA SÉANCE →
              </button>
            </div>
          </>
        )}

        {/* ── WORKOUT ── */}
        {step === "workout" && curEx && (
          <>
            <div className="card">
              <div className="workout-ex-header">
                <div className="workout-ex-label">Exercice {currentExIdx + 1} / {workoutPlan.length}</div>
                <div className="workout-ex-name">{curEx.exName}</div>
                <div style={{ fontSize: 12, color: curGroupMeta?.color, marginTop: 2 }}>
                  {curGroupMeta?.emoji} {curGroupMeta?.label}
                </div>
              </div>
              <div className="set-track">
                {curEx.sets.map((s, i) => (
                  <div key={i} className="set-bubble">
                    <div className={`set-bubble-dot${s.status === "done" ? " done" : s.status === "active" ? " active" : ""}`} />
                    <div className={`set-bubble-reps${s.reps !== null ? " filled" : ""}`}>
                      {s.reps !== null ? `${s.reps}r` : i === currentSetIdx ? "…" : ""}
                    </div>
                  </div>
                ))}
              </div>
              <div className="go-zone">
                <div className="go-label">Série en cours</div>
                <div className="go-serie-num">
                  {currentSetIdx + 1}<span style={{ fontSize: 32, color: "var(--muted)" }}>/{totalSets}</span>
                </div>
                <div className="go-target">Objectif : <span>{targetReps} reps</span></div>
              </div>

              {/* Badge record */}
              {isNewRec && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                  <div className="record-badge">🏅 NOUVEAU RECORD !</div>
                </div>
              )}

              <div className="rep-entry-label">Entre le nombre de reps effectuées</div>
              <div className={`rep-display-val${repInput ? " has-val" : ""}`}>{repInput || "—"}</div>
              <div className="rep-numpad">
                {["1","2","3","4","5","6","7","8","9"].map(n => (
                  <button key={n} className="np-btn" onClick={() => numpadPress(n)}>{n}</button>
                ))}
                <button className="np-btn zero" onClick={() => numpadPress("0")}>0</button>
                <button className="np-btn del" onClick={() => numpadPress("del")}>⌫</button>
              </div>
              <button className="validate-btn" onClick={validateSet} disabled={!repInput || parseInt(repInput) === 0}>
                ✓ VALIDER · LANCER LE REPOS
              </button>
            </div>
            <div className="card">
              <div className="section-title">Programme</div>
              <div className="plan-list">
                {workoutPlan.map((ex, ei) => {
                  const doneSets = ex.sets.filter(s => s.status === "done").length;
                  const isActive = ei === currentExIdx;
                  const isDone = doneSets === totalSets;
                  const g = getGroupMeta(ex.group);
                  return (
                    <div key={ei} className={`plan-item${isActive ? " active-plan" : isDone ? " done-plan" : ""}`}>
                      <div className="plan-idx">{ei + 1}</div>
                      <div className="plan-info">
                        <div className="plan-name">{ex.exName}</div>
                        <div className="plan-detail">{g.emoji} {doneSets}/{totalSets} séries</div>
                      </div>
                      <div className={`plan-status${isDone ? " done" : isActive ? " active" : " pending"}`}>
                        {isDone ? "✓ OK" : isActive ? "EN COURS" : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                <button className="reset-btn" onClick={reset}>Abandonner</button>
              </div>
            </div>
          </>
        )}

        {/* ── TERMINÉ ── */}
        {step === "done" && (
          <div className="card">
            <div className="done-screen">
              <div className="done-emoji">🏆</div>
              <div className="done-title">SÉANCE TERMINÉE !</div>
              <div className="done-sub">
                {selectedGroups.map(id => getGroupMeta(id)?.label).join(" · ")}<br />
                Séance enregistrée ✓
              </div>
              <div className="done-stats">
                <div className="done-stat">
                  <div className="done-stat-val">{workoutPlan.length}</div>
                  <div className="done-stat-label">Exercices</div>
                </div>
                <div className="done-stat">
                  <div className="done-stat-val">{totalSets * workoutPlan.length}</div>
                  <div className="done-stat-label">Séries</div>
                </div>
                <div className="done-stat">
                  <div className="done-stat-val">{totalRepsDone}</div>
                  <div className="done-stat-label">Reps</div>
                </div>
                <div className="done-stat">
                  <div className="done-stat-val">{formatDuration(sessionSeconds)}</div>
                  <div className="done-stat-label">Durée</div>
                </div>
              </div>

              {/* Note de séance */}
              <div style={{ width: "100%", textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                  📝 Note de séance (optionnel)
                </div>
                <textarea className="note-area"
                  placeholder="Comment s'est passée la séance ? PR au squat ? Séance difficile ?..."
                  value={sessionNote}
                  onChange={e => {
                    setSessionNote(e.target.value);
                    saveNoteToSession(e.target.value);
                  }}
                />
              </div>

              <div style={{ width: "100%", marginTop: 4, display: "flex", flexDirection: "column", gap: 6 }}>
                {workoutPlan.map((ex, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                    <span>{ex.exName}</span>
                    <span style={{ color: "var(--success)" }}>{ex.sets.reduce((a, s) => a + (s.reps || 0), 0)} reps</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 8 }}>
                <button className="reset-btn" style={{ flex: 1 }} onClick={() => { setShowHistory(true); reset(); }}>
                  📋 Historique
                </button>
                <button className="validate-btn" style={{ flex: 2, border: "2px solid var(--accent)", color: "var(--accent)" }} onClick={reset}>
                  NOUVELLE SÉANCE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
