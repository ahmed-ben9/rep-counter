import { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  DONNÉES PAR DÉFAUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

const DEFAULT_THEME = {
  bg: "#0a0a0a",
  surface: "#141414",
  border: "#222222",
  accent: "#e8ff00",
  accent2: "#ff4d4d",
  text: "#f0f0f0",
  muted: "#555555",
  success: "#00e676",
  wallpaperUrl: "",
  wallpaperOpacity: "0.15",
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  UTILITAIRES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function pad(n) { return String(n).padStart(2, "0"); }

const REST_PRESETS = [60, 90, 120, 180];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  COMPOSANT PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function WorkoutCounter() {

  // ── État général ──
  const [step, setStep] = useState("groups");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [totalSets, setTotalSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);

  // ── Exercices personnalisés (ajout/suppression dans l'app) ──
  const [customExercises, setCustomExercises] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rc-custom-exercises") || "{}"); } catch { return {}; }
  });
  const [customInput, setCustomInput] = useState("");
  const [customGroup, setCustomGroup] = useState(null);

  // ── Workout ──
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [repInput, setRepInput] = useState("");

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

  // ── Thème et personnalisation ──
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return { ...DEFAULT_THEME, ...JSON.parse(localStorage.getItem("rc-theme") || "{}") }; }
    catch { return DEFAULT_THEME; }
  });
  const [wallpaperInput, setWallpaperInput] = useState(theme.wallpaperUrl || "");
  const [settingsTab, setSettingsTab] = useState("theme");
  const [editingGroup, setEditingGroup] = useState(null);
  const [newExInput, setNewExInput] = useState("");

  // ── Exercices de l'éditeur (copie locale pour édition) ──
  const [editableExercises, setEditableExercises] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rc-exercises") || "null");
      return saved || DEFAULT_EXERCISES;
    } catch { return DEFAULT_EXERCISES; }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  EFFETS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Charger l'historique
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rc-history") || "[]");
      setHistory(saved);
    } catch {}
  }, []);

  // Timer de repos
  useEffect(() => {
    if (showRest && !restPaused) {
      restInterval.current = setInterval(() => {
        setRestRemaining(r => {
          if (r <= 1) {
            clearInterval(restInterval.current);
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  SAUVEGARDE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function saveHistory(newHistory) {
    localStorage.setItem("rc-history", JSON.stringify(newHistory));
    setHistory(newHistory);
  }

  function saveTheme(newTheme) {
    localStorage.setItem("rc-theme", JSON.stringify(newTheme));
    setTheme(newTheme);
  }

  function saveExercises(newExercises) {
    localStorage.setItem("rc-exercises", JSON.stringify(newExercises));
    setEditableExercises(newExercises);
  }

  function saveCustomExercises(newCustom) {
    localStorage.setItem("rc-custom-exercises", JSON.stringify(newCustom));
    setCustomExercises(newCustom);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  CSS DYNAMIQUE (thème)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const dynamicCss = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: ${theme.bg};
      --surface: ${theme.surface};
      --border: ${theme.border};
      --accent: ${theme.accent};
      --accent2: ${theme.accent2};
      --text: ${theme.text};
      --muted: ${theme.muted};
      --success: ${theme.success};
    }
    body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }
    .app {
      min-height: 100vh;
      background: var(--bg);
      display: flex; flex-direction: column; align-items: center;
      padding: 24px 16px 48px;
      position: relative;
    }
    ${theme.wallpaperUrl ? `
    .app::before {
      content: '';
      position: fixed; inset: 0; z-index: 0;
      background-image: url('${theme.wallpaperUrl}');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;
      opacity: ${theme.wallpaperOpacity};
      pointer-events: none;
    }` : ""}
    .app > * { position: relative; z-index: 1; }

    .header { width: 100%; max-width: 420px; margin-bottom: 20px; display: flex; align-items: flex-start; justify-content: space-between; }
    .header-label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 2px; }
    .header-title { font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: 1; color: var(--text); }
    .icon-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; background: transparent; border: 1px solid var(--border); border-radius: 10px; padding: 8px 14px; color: var(--muted); cursor: pointer; font-size: 11px; font-family: 'DM Sans', sans-serif; transition: all 0.13s; }
    .icon-btn:hover { border-color: #444; color: var(--text); }
    .icon-btn.active { border-color: var(--accent); color: var(--accent); }
    .icon-btn .ib-icon { font-size: 16px; }
    .header-actions { display: flex; gap: 8px; }

    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 420px; padding: 20px; margin-bottom: 12px; }
    .section-title { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }

    .group-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .group-btn { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 12px 6px; border-radius: 10px; border: 1px solid var(--border); background: transparent; color: var(--muted); cursor: pointer; font-size: 12px; font-family: 'DM Sans', sans-serif; transition: all 0.13s; position: relative; }
    .group-btn .g-emoji { font-size: 20px; }
    .group-btn:hover { border-color: #444; color: var(--text); }
    .group-btn.selected { border-color: var(--g-color, var(--accent)); color: var(--g-color, var(--accent)); background: color-mix(in srgb, var(--g-color, var(--accent)) 8%, transparent); }
    .group-btn.selected::after { content: '✓'; position: absolute; top: 4px; right: 6px; font-size: 10px; color: var(--g-color, var(--accent)); }
    .group-hint { font-size: 11px; color: var(--muted); margin-top: 10px; text-align: center; }
    .group-hint span { color: var(--accent); }
    .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    .tag { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; border: 1px solid; font-size: 12px; }

    .ex-list { display: flex; flex-direction: column; gap: 6px; }
    .ex-item { display: flex; align-items: center; gap: 10px; padding: 11px 14px; background: #0f0f0f; border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.13s; }
    .ex-item:hover { border-color: #333; }
    .ex-item.selected { border-color: var(--accent); background: rgba(232,255,0,0.04); }
    .ex-item-dot { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--muted); background: transparent; flex-shrink: 0; transition: all 0.13s; }
    .ex-item.selected .ex-item-dot { background: var(--accent); border-color: var(--accent); }
    .ex-item-label { font-size: 14px; flex: 1; }
    .ex-item-del { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 16px; padding: 0 4px; transition: color 0.13s; }
    .ex-item-del:hover { color: var(--accent2); }
    .add-custom-row { display: flex; gap: 8px; margin-top: 10px; }
    .custom-input { flex: 1; background: #111; border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 10px 14px; outline: none; transition: border 0.13s; }
    .custom-input:focus { border-color: var(--accent); }
    .custom-input::placeholder { color: var(--muted); }
    .add-btn { background: var(--accent); border: none; border-radius: 8px; color: #0a0a0a; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; padding: 0 16px; cursor: pointer; white-space: nowrap; transition: opacity 0.13s; }
    .add-btn:hover { opacity: 0.85; }
    .add-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    .config-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .config-label { font-size: 12px; color: var(--muted); flex: 1; text-transform: uppercase; letter-spacing: 0.1em; }
    .stepper { display: flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    .stepper-btn { background: #1a1a1a; border: none; color: var(--text); width: 36px; height: 36px; font-size: 18px; cursor: pointer; transition: background 0.13s; }
    .stepper-btn:hover { background: #252525; }
    .stepper-val { width: 52px; text-align: center; font-size: 15px; font-weight: 600; background: #111; color: var(--text); display: flex; align-items: center; justify-content: center; }

    .plan-list { display: flex; flex-direction: column; gap: 8px; }
    .plan-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #0f0f0f; border: 1px solid var(--border); border-radius: 10px; transition: all 0.13s; }
    .plan-item.active-plan { border-color: var(--accent); background: rgba(232,255,0,0.03); }
    .plan-item.done-plan { border-color: #1a2a1a; background: #0d170d; }
    .plan-idx { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: var(--muted); width: 20px; }
    .plan-item.active-plan .plan-idx { color: var(--accent); }
    .plan-info { flex: 1; min-width: 0; }
    .plan-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .plan-detail { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .plan-status { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .plan-status.pending { color: var(--muted); }
    .plan-status.active { color: var(--accent); }
    .plan-status.done { color: var(--success); }

    .start-btn { width: 100%; height: 58px; border-radius: 12px; border: none; background: var(--accent); color: #0a0a0a; font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.08em; cursor: pointer; margin-top: 16px; transition: opacity 0.13s; }
    .start-btn:hover { opacity: 0.88; }
    .start-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .reset-btn { background: transparent; border: 1px solid var(--border); border-radius: 8px; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 18px; cursor: pointer; transition: all 0.13s; }
    .reset-btn:hover { border-color: var(--accent2); color: var(--accent2); }
    .validate-btn { width: 100%; height: 56px; border-radius: 12px; border: 2px solid var(--success); background: transparent; color: var(--success); font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.08em; cursor: pointer; transition: all 0.13s; }
    .validate-btn:hover { background: rgba(0,230,118,0.07); }
    .validate-btn:disabled { opacity: 0.25; cursor: not-allowed; border-color: var(--muted); color: var(--muted); }

    .step-nav { display: flex; gap: 6px; margin-bottom: 20px; width: 100%; max-width: 420px; }
    .step-pip { height: 3px; flex: 1; border-radius: 2px; background: var(--border); transition: background 0.3s; }
    .step-pip.done-pip { background: var(--success); }
    .step-pip.active-pip { background: var(--accent); }
    .divider { border: none; border-top: 1px solid var(--border); margin: 14px 0; }

    .workout-ex-header { display: flex; flex-direction: column; gap: 2px; margin-bottom: 20px; }
    .workout-ex-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }
    .workout-ex-name { font-family: 'Bebas Neue', sans-serif; font-size: 32px; line-height: 1.05; }
    .set-track { display: flex; gap: 8px; align-items: center; margin-bottom: 24px; flex-wrap: wrap; }
    .set-bubble { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 36px; }
    .set-bubble-dot { width: 12px; height: 12px; border-radius: 50%; border: 2px solid #333; background: transparent; transition: all 0.2s; }
    .set-bubble-dot.done { background: var(--success); border-color: var(--success); }
    .set-bubble-dot.active { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 8px var(--accent); }
    .set-bubble-reps { font-size: 10px; color: var(--muted); min-height: 14px; }
    .set-bubble-reps.filled { color: var(--success); font-weight: 600; }
    .go-zone { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 0; }
    .go-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); }
    .go-serie-num { font-family: 'Bebas Neue', sans-serif; font-size: 72px; line-height: 1; color: var(--accent); }
    .go-target { font-size: 13px; color: var(--muted); }
    .go-target span { color: var(--text); font-weight: 600; }
    .rep-entry-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; text-align: center; }
    .rep-numpad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
    .np-btn { height: 56px; border-radius: 10px; border: 1px solid var(--border); background: #111; color: var(--text); font-family: 'Bebas Neue', sans-serif; font-size: 24px; cursor: pointer; transition: all 0.1s; }
    .np-btn:hover { background: #1a1a1a; border-color: #333; }
    .np-btn:active { transform: scale(0.95); }
    .np-btn.del { font-size: 18px; color: var(--muted); }
    .np-btn.del:hover { color: var(--accent2); border-color: var(--accent2); }
    .np-btn.zero { grid-column: span 2; }
    .rep-display-val { font-family: 'Bebas Neue', sans-serif; font-size: 80px; line-height: 1; text-align: center; color: var(--muted); margin-bottom: 8px; letter-spacing: 0.02em; }
    .rep-display-val.has-val { color: var(--accent); }

    .rest-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(5,5,5,0.97); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .rest-title { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
    .rest-exercise { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--text); margin-bottom: 28px; text-align: center; }
    .rest-ring-wrap { position: relative; width: 220px; height: 220px; margin-bottom: 28px; }
    .rest-ring-svg { transform: rotate(-90deg); }
    .rest-ring-bg { fill: none; stroke: #1a1a1a; stroke-width: 8; }
    .rest-ring-prog { fill: none; stroke: var(--accent); stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
    .rest-ring-prog.warning { stroke: var(--accent2); }
    .rest-time-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .rest-countdown { font-family: 'Bebas Neue', sans-serif; font-size: 72px; line-height: 1; letter-spacing: 0.02em; color: var(--accent); }
    .rest-countdown.warning { color: var(--accent2); }
    .rest-of { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .rest-controls { display: flex; gap: 12px; width: 100%; max-width: 340px; margin-bottom: 24px; }
    .rest-ctrl-btn { flex: 1; height: 52px; border-radius: 12px; border: 1px solid var(--border); background: #111; color: var(--text); font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.06em; cursor: pointer; transition: all 0.13s; }
    .rest-ctrl-btn:hover { border-color: #444; }
    .rest-ctrl-btn.primary { background: var(--accent); border-color: var(--accent); color: #0a0a0a; }
    .rest-ctrl-btn.primary:hover { opacity: 0.88; }
    .rest-duration-row { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #111; border: 1px solid var(--border); border-radius: 12px; width: 100%; max-width: 340px; }
    .rest-duration-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }
    .rest-presets { display: flex; gap: 6px; }
    .rest-preset-btn { background: transparent; border: 1px solid var(--border); border-radius: 6px; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; padding: 5px 10px; cursor: pointer; transition: all 0.13s; }
    .rest-preset-btn:hover { border-color: #444; color: var(--text); }
    .rest-preset-btn.active-preset { border-color: var(--accent); color: var(--accent); }
    .rest-skip { font-size: 12px; color: var(--muted); text-decoration: underline; cursor: pointer; background: none; border: none; margin-top: 8px; }
    .rest-skip:hover { color: var(--text); }

    .done-screen { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; }
    .done-emoji { font-size: 56px; }
    .done-title { font-family: 'Bebas Neue', sans-serif; font-size: 44px; color: var(--success); }
    .done-sub { font-size: 13px; color: var(--muted); line-height: 1.6; }
    .done-stats { display: flex; gap: 10px; margin-top: 4px; }
    .done-stat { background: #111; border: 1px solid var(--border); border-radius: 10px; padding: 12px 18px; text-align: center; }
    .done-stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: var(--accent); }
    .done-stat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }

    .hist-empty { text-align: center; padding: 40px 0; color: var(--muted); font-size: 14px; }
    .hist-empty-icon { font-size: 40px; margin-bottom: 10px; }
    .hist-day { margin-bottom: 24px; }
    .hist-day-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
    .hist-session { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; margin-bottom: 8px; cursor: pointer; transition: all 0.13s; }
    .hist-session:hover { border-color: #333; }
    .hist-session.open { border-color: var(--accent); }
    .hist-session-top { display: flex; align-items: center; gap: 10px; }
    .hist-session-tags { display: flex; gap: 5px; flex-wrap: wrap; flex: 1; }
    .hist-stag { font-size: 11px; padding: 2px 8px; border-radius: 20px; border: 1px solid; font-weight: 500; }
    .hist-session-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .hist-session-time { font-size: 11px; color: var(--muted); }
    .hist-session-reps { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: var(--accent); }
    .hist-detail { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }
    .hist-ex { display: flex; flex-direction: column; gap: 4px; }
    .hist-ex-name { font-size: 13px; font-weight: 600; color: var(--text); }
    .hist-sets-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .hist-set-chip { background: #111; border: 1px solid var(--border); border-radius: 6px; padding: 3px 8px; font-size: 12px; color: var(--muted); }
    .hist-ex-total { font-size: 11px; color: var(--muted); margin-top: 2px; }
    .del-session-btn { background: none; border: none; color: var(--muted); font-size: 12px; cursor: pointer; text-decoration: underline; padding: 0; }
    .del-session-btn:hover { color: var(--accent2); }

    /* ── PARAMÈTRES ── */
    .settings-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.85); display: flex; align-items: flex-end; justify-content: center; animation: fadeIn 0.2s ease; }
    .settings-panel { background: #111; border: 1px solid var(--border); border-radius: 20px 20px 0 0; width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; padding: 24px 20px 40px; }
    .settings-handle { width: 36px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 20px; }
    .settings-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; margin-bottom: 16px; }
    .settings-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .stab { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.13s; }
    .stab.active { border-color: var(--accent); color: var(--accent); background: rgba(232,255,0,0.06); }
    .color-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding: 10px 14px; background: var(--surface); border-radius: 10px; border: 1px solid var(--border); }
    .color-label { flex: 1; font-size: 13px; color: var(--text); }
    .color-desc { font-size: 11px; color: var(--muted); }
    .color-picker { width: 40px; height: 40px; border: none; border-radius: 8px; cursor: pointer; padding: 2px; background: transparent; }
    .color-reset-btn { background: transparent; border: 1px solid var(--border); border-radius: 6px; color: var(--muted); font-size: 11px; padding: 4px 8px; cursor: pointer; white-space: nowrap; }
    .color-reset-btn:hover { border-color: var(--accent2); color: var(--accent2); }
    .wallpaper-section { margin-bottom: 16px; }
    .wallpaper-input { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 14px; outline: none; margin-bottom: 8px; }
    .wallpaper-input:focus { border-color: var(--accent); }
    .wallpaper-input::placeholder { color: var(--muted); }
    .wallpaper-preview { width: 100%; height: 120px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 8px; position: relative; }
    .wallpaper-preview img { width: 100%; height: 100%; object-fit: cover; }
    .wallpaper-preview-empty { font-size: 12px; color: var(--muted); }
    .opacity-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .opacity-label { font-size: 12px; color: var(--muted); flex: 1; }
    .opacity-val { font-size: 13px; color: var(--accent); width: 36px; text-align: right; }
    .opacity-slider { flex: 2; accent-color: var(--accent); }
    .apply-wall-btn { width: 100%; height: 44px; border-radius: 10px; border: none; background: var(--accent); color: #0a0a0a; font-family: 'Bebas Neue', sans-serif; font-size: 18px; cursor: pointer; }
    .remove-wall-btn { width: 100%; height: 40px; border-radius: 10px; border: 1px solid var(--accent2); background: transparent; color: var(--accent2); font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; margin-top: 8px; }
    .ex-editor-group { margin-bottom: 20px; }
    .ex-editor-group-header { display: flex; align-items: center; gap: 8px; padding: 10px 0; cursor: pointer; }
    .ex-editor-group-title { font-size: 13px; font-weight: 600; flex: 1; }
    .ex-editor-group-count { font-size: 11px; color: var(--muted); }
    .ex-editor-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 6px; }
    .ex-editor-name { flex: 1; font-size: 13px; color: var(--text); }
    .ex-editor-del { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 16px; padding: 0 4px; }
    .ex-editor-del:hover { color: var(--accent2); }
    .ex-add-row { display: flex; gap: 6px; margin-top: 8px; }
    .ex-add-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 13px; padding: 8px 12px; outline: none; font-family: 'DM Sans', sans-serif; }
    .ex-add-input:focus { border-color: var(--accent); }
    .ex-add-input::placeholder { color: var(--muted); }
    .ex-add-btn { background: var(--accent); border: none; border-radius: 8px; color: #0a0a0a; font-size: 12px; font-weight: 700; padding: 0 14px; cursor: pointer; white-space: nowrap; font-family: 'DM Sans', sans-serif; }
    .ex-add-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .reset-all-btn { width: 100%; height: 44px; border-radius: 10px; border: 1px solid var(--accent2); background: transparent; color: var(--accent2); font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; margin-top: 8px; }
  `;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  LOGIQUE WORKOUT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function getGroupMeta(id) { return DEFAULT_MUSCLE_GROUPS.find(g => g.id === id); }

  function toggleGroup(id) {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
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
    const newCustom = { ...customExercises, [customGroup]: [...(customExercises[customGroup] || []), name] };
    saveCustomExercises(newCustom);
    setCustomInput("");
  }

  function deleteCustomExercise(groupId, name) {
    const newCustom = { ...customExercises, [groupId]: (customExercises[groupId] || []).filter(n => n !== name) };
    saveCustomExercises(newCustom);
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

  function changeRestDuration(newDur) {
    setRestDuration(newDur);
    setRestRemaining(newDur);
  }

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
        };
        const newHistory = [session, ...history];
        saveHistory(newHistory);
        setStep("done");
      }
    };

    if (!(isLastSet && isLastEx)) startRest(doNext);
    else doNext();
  }

  function deleteSession(id) {
    const newHistory = history.filter(s => s.id !== id);
    saveHistory(newHistory);
    setOpenSession(null);
  }

  function reset() {
    setStep("groups"); setSelectedGroups([]); setSelectedExercises([]);
    setCustomInput(""); setCustomGroup(null); setTotalSets(3); setTargetReps(10);
    setWorkoutPlan([]); setCurrentExIdx(0); setCurrentSetIdx(0); setRepInput("");
    setShowRest(false); setShowHistory(false); setShowSettings(false);
    pendingNext.current = null;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  LOGIQUE PARAMÈTRES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  function updateThemeColor(key, val) {
    const newTheme = { ...theme, [key]: val };
    saveTheme(newTheme);
  }

  function applyWallpaper() {
    const newTheme = { ...theme, wallpaperUrl: wallpaperInput };
    saveTheme(newTheme);
  }

  function removeWallpaper() {
    setWallpaperInput("");
    const newTheme = { ...theme, wallpaperUrl: "" };
    saveTheme(newTheme);
  }

  function updateOpacity(val) {
    const newTheme = { ...theme, wallpaperOpacity: val };
    saveTheme(newTheme);
  }

  function resetTheme() {
    saveTheme(DEFAULT_THEME);
    setWallpaperInput("");
  }

  // Éditeur d'exercices dans les paramètres
  function addExerciseInEditor(groupId) {
    if (!newExInput.trim()) return;
    const newList = [...(editableExercises[groupId] || []), newExInput.trim()];
    saveExercises({ ...editableExercises, [groupId]: newList });
    setNewExInput("");
  }

  function removeExerciseInEditor(groupId, name) {
    const newList = (editableExercises[groupId] || []).filter(n => n !== name);
    saveExercises({ ...editableExercises, [groupId]: newList });
  }

  function resetExercises() {
    saveExercises(DEFAULT_EXERCISES);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  CALCULS DIVERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDU — REPOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (showRest) return (
    <>
      <style>{dynamicCss}</style>
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDU — HISTORIQUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (showHistory) return (
    <>
      <style>{dynamicCss}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="header-label">Musculation</div>
            <div className="header-title">HISTO<br />RIQUE</div>
          </div>
          <button className="icon-btn active" onClick={() => setShowHistory(false)}>
            <span className="ib-icon">🏋️</span>Séance
          </button>
        </div>
        {history.length === 0 ? (
          <div className="card">
            <div className="hist-empty">
              <div className="hist-empty-icon">📋</div>
              <div>Aucune séance enregistrée.</div>
              <div style={{ marginTop: 6, fontSize: 12 }}>Lance ta première séance !</div>
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
                        </div>
                      </div>
                      {isOpen && (
                        <div className="hist-detail" onClick={e => e.stopPropagation()}>
                          {session.exercises.map((ex, i) => {
                            const total = ex.sets.reduce((a, r) => a + r, 0);
                            return (
                              <div key={i} className="hist-ex">
                                <div className="hist-ex-name">{ex.exName}</div>
                                <div className="hist-sets-row">
                                  {ex.sets.map((r, si) => (
                                    <div key={si} className="hist-set-chip">S{si + 1} : {r} reps</div>
                                  ))}
                                </div>
                                <div className="hist-ex-total">{total} reps au total</div>
                              </div>
                            );
                          })}
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                            <span>{session.exercises.length} exercice{session.exercises.length > 1 ? "s" : ""}</span>
                            <span>{session.totalSets} séries · objectif {session.targetReps} reps</span>
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RENDU PRINCIPAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <>
      <style>{dynamicCss}</style>

      {/* ── PANNEAU PARAMÈTRES ── */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-handle" />
            <div className="settings-title">⚙️ PARAMÈTRES</div>

            {/* Onglets */}
            <div className="settings-tabs">
              <button className={`stab${settingsTab === "theme" ? " active" : ""}`} onClick={() => setSettingsTab("theme")}>🎨 Couleurs</button>
              <button className={`stab${settingsTab === "wallpaper" ? " active" : ""}`} onClick={() => setSettingsTab("wallpaper")}>🖼️ Fond d'écran</button>
              <button className={`stab${settingsTab === "exercises" ? " active" : ""}`} onClick={() => setSettingsTab("exercises")}>💪 Exercices</button>
            </div>

            {/* ── ONGLET COULEURS ── */}
            {settingsTab === "theme" && (
              <div>
                {[
                  { key: "bg",      label: "Fond de page",      desc: "Couleur d'arrière-plan principale" },
                  { key: "surface", label: "Fond des cartes",   desc: "Fond des blocs et panneaux" },
                  { key: "accent",  label: "Couleur principale", desc: "Boutons, timer, éléments actifs" },
                  { key: "accent2", label: "Couleur d'alerte",  desc: "Suppression, avertissements" },
                  { key: "text",    label: "Texte",             desc: "Couleur du texte principal" },
                  { key: "success", label: "Succès",            desc: "Séries validées, terminé" },
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
                <button className="reset-all-btn" onClick={resetTheme}>
                  Réinitialiser toutes les couleurs
                </button>
              </div>
            )}

            {/* ── ONGLET FOND D'ÉCRAN ── */}
            {settingsTab === "wallpaper" && (
              <div className="wallpaper-section">
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, lineHeight: 1.6 }}>
                  Colle l'URL d'une image (depuis internet) ou copie le lien direct d'une de tes photos hébergées en ligne.
                </p>

                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  URL de l'image
                </div>
                <input
                  className="wallpaper-input"
                  placeholder="https://exemple.com/ma-photo.jpg"
                  value={wallpaperInput}
                  onChange={e => setWallpaperInput(e.target.value)}
                />

                <div className="wallpaper-preview">
                  {wallpaperInput ? (
                    <img src={wallpaperInput} alt="Aperçu" onError={e => { e.target.style.display = "none"; }} />
                  ) : (
                    <div className="wallpaper-preview-empty">Aperçu du fond d'écran</div>
                  )}
                </div>

                <div className="opacity-row">
                  <div className="opacity-label">Opacité de l'image</div>
                  <input type="range" className="opacity-slider" min="0.05" max="0.6" step="0.05"
                    value={theme.wallpaperOpacity}
                    onChange={e => updateOpacity(e.target.value)} />
                  <div className="opacity-val">{Math.round(parseFloat(theme.wallpaperOpacity) * 100)}%</div>
                </div>

                <button className="apply-wall-btn" onClick={applyWallpaper}>
                  APPLIQUER LE FOND D'ÉCRAN
                </button>

                {theme.wallpaperUrl && (
                  <button className="remove-wall-btn" onClick={removeWallpaper}>
                    Supprimer le fond d'écran
                  </button>
                )}

                <div style={{ marginTop: 16, padding: 12, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 6 }}>💡 Comment utiliser tes propres photos ?</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
                    1. Va sur <strong style={{ color: "var(--text)" }}>imgbb.com</strong> (gratuit)<br />
                    2. Clique <strong style={{ color: "var(--text)" }}>"Choisir des images"</strong> et sélectionne ta photo<br />
                    3. Clique <strong style={{ color: "var(--text)" }}>"Téléverser"</strong><br />
                    4. Copie le lien <strong style={{ color: "var(--text)" }}>"Lien direct"</strong><br />
                    5. Colle-le dans le champ ci-dessus
                  </div>
                </div>
              </div>
            )}

            {/* ── ONGLET EXERCICES ── */}
            {settingsTab === "exercises" && (
              <div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
                  Modifie la liste par défaut des exercices. Ces changements s'appliquent à toutes tes prochaines séances.
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
                        <div>
                          {exList.map((name, i) => (
                            <div key={i} className="ex-editor-item">
                              <span className="ex-editor-name">{name}</span>
                              <button className="ex-editor-del"
                                onClick={() => removeExerciseInEditor(g.id, name)}>×</button>
                            </div>
                          ))}
                          <div className="ex-add-row">
                            <input className="ex-add-input"
                              placeholder="Nouvel exercice..."
                              value={editingGroup === g.id ? newExInput : ""}
                              onChange={e => setNewExInput(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && addExerciseInEditor(g.id)}
                            />
                            <button className="ex-add-btn"
                              disabled={!newExInput.trim()}
                              onClick={() => addExerciseInEditor(g.id)}>
                              + Ajouter
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="reset-all-btn" onClick={resetExercises}>
                  Réinitialiser la liste d'exercices par défaut
                </button>
              </div>
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
            <button className="icon-btn" onClick={() => setShowHistory(true)}>
              <span className="ib-icon">📋</span>
              {history.length > 0 ? `(${history.length})` : "Historique"}
            </button>
            <button className={`icon-btn${showSettings ? " active" : ""}`} onClick={() => setShowSettings(s => !s)}>
              <span className="ib-icon">⚙️</span>
              Réglages
            </button>
          </div>
        </div>

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
                        fontSize: 12, cursor: "pointer", transition: "all 0.13s"
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
                        fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.13s"
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
                {selectedGroups.map(id => getGroupMeta(id)?.label).join(" · ")}<br/>
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
