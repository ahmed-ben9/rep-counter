import { useState, useEffect, useRef, useCallback } from "react";

const MUSCLE_GROUPS = [
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

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function pad(n) { return String(n).padStart(2, "0"); }

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0a; --surface: #141414; --border: #222;
    --accent: #e8ff00; --accent2: #ff4d4d;
    --text: #f0f0f0; --muted: #555; --success: #00e676;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }
  .app { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; align-items: center; padding: 24px 16px 48px; }

  /* HEADER */
  .header { width: 100%; max-width: 420px; margin-bottom: 20px; display: flex; align-items: flex-start; justify-content: space-between; }
  .header-label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 2px; }
  .header-title { font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: 1; color: var(--text); }
  .history-tab-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; background: transparent; border: 1px solid var(--border); border-radius: 10px; padding: 8px 14px; color: var(--muted); cursor: pointer; font-size: 11px; font-family: 'DM Sans', sans-serif; transition: all 0.13s; }
  .history-tab-btn:hover { border-color: #444; color: var(--text); }
  .history-tab-btn.active { border-color: var(--accent); color: var(--accent); }
  .history-tab-btn .ht-icon { font-size: 16px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 420px; padding: 20px; margin-bottom: 12px; }
  .section-title { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }

  /* GROUPS */
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

  /* EXERCISES */
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

  /* CONFIG */
  .config-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .config-label { font-size: 12px; color: var(--muted); flex: 1; text-transform: uppercase; letter-spacing: 0.1em; }
  .stepper { display: flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  .stepper-btn { background: #1a1a1a; border: none; color: var(--text); width: 36px; height: 36px; font-size: 18px; cursor: pointer; transition: background 0.13s; }
  .stepper-btn:hover { background: #252525; }
  .stepper-val { width: 52px; text-align: center; font-size: 15px; font-weight: 600; background: #111; color: var(--text); display: flex; align-items: center; justify-content: center; }

  /* PLAN */
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

  /* BUTTONS */
  .start-btn { width: 100%; height: 58px; border-radius: 12px; border: none; background: var(--accent); color: #0a0a0a; font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.08em; cursor: pointer; margin-top: 16px; transition: opacity 0.13s; }
  .start-btn:hover { opacity: 0.88; }
  .start-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .reset-btn { background: transparent; border: 1px solid var(--border); border-radius: 8px; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 18px; cursor: pointer; transition: all 0.13s; }
  .reset-btn:hover { border-color: var(--accent2); color: var(--accent2); }
  .validate-btn { width: 100%; height: 56px; border-radius: 12px; border: 2px solid var(--success); background: transparent; color: var(--success); font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.08em; cursor: pointer; transition: all 0.13s; }
  .validate-btn:hover { background: rgba(0,230,118,0.07); }
  .validate-btn:disabled { opacity: 0.25; cursor: not-allowed; border-color: var(--muted); color: var(--muted); }

  /* STEP NAV */
  .step-nav { display: flex; gap: 6px; margin-bottom: 20px; width: 100%; max-width: 420px; }
  .step-pip { height: 3px; flex: 1; border-radius: 2px; background: var(--border); transition: background 0.3s; }
  .step-pip.done-pip { background: var(--success); }
  .step-pip.active-pip { background: var(--accent); }
  .divider { border: none; border-top: 1px solid var(--border); margin: 14px 0; }

  /* WORKOUT */
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

  /* REST TIMER */
  .rest-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: #050505;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 32px 24px;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .rest-title { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .rest-exercise { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--text); margin-bottom: 28px; text-align: center; }
  .rest-ring-wrap { position: relative; width: 220px; height: 220px; margin-bottom: 28px; }
  .rest-ring-svg { transform: rotate(-90deg); }
  .rest-ring-bg { fill: none; stroke: #1a1a1a; stroke-width: 8; }
  .rest-ring-prog { fill: none; stroke: var(--accent); stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  .rest-ring-prog.warning { stroke: var(--accent2); }
  .rest-time-center {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .rest-countdown { font-family: 'Bebas Neue', sans-serif; font-size: 72px; line-height: 1; letter-spacing: 0.02em; color: var(--accent); }
  .rest-countdown.warning { color: var(--accent2); }
  .rest-of { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .rest-controls { display: flex; gap: 12px; width: 100%; max-width: 340px; margin-bottom: 24px; }
  .rest-ctrl-btn {
    flex: 1; height: 52px; border-radius: 12px; border: 1px solid var(--border);
    background: #111; color: var(--text);
    font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.06em;
    cursor: pointer; transition: all 0.13s;
  }
  .rest-ctrl-btn:hover { border-color: #444; }
  .rest-ctrl-btn.primary { background: var(--accent); border-color: var(--accent); color: #0a0a0a; }
  .rest-ctrl-btn.primary:hover { opacity: 0.88; }
  .rest-ctrl-btn.danger { border-color: var(--accent2); color: var(--accent2); }
  .rest-duration-row {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px; background: #111; border: 1px solid var(--border);
    border-radius: 12px; width: 100%; max-width: 340px;
  }
  .rest-duration-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }
  .rest-presets { display: flex; gap: 6px; }
  .rest-preset-btn {
    background: transparent; border: 1px solid var(--border); border-radius: 6px;
    color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    padding: 5px 10px; cursor: pointer; transition: all 0.13s;
  }
  .rest-preset-btn:hover { border-color: #444; color: var(--text); }
  .rest-preset-btn.active-preset { border-color: var(--accent); color: var(--accent); }
  .rest-skip { font-size: 12px; color: var(--muted); text-decoration: underline; cursor: pointer; background: none; border: none; margin-top: 8px; }
  .rest-skip:hover { color: var(--text); }

  /* NOTIF BANNER */
  .notif-banner {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px; margin-bottom: 16px;
    font-size: 12px; width: 100%; max-width: 340px;
  }
  .notif-banner.info { background: rgba(232,255,0,0.07); border: 1px solid rgba(232,255,0,0.2); color: var(--accent); }
  .notif-banner.denied { background: rgba(255,77,77,0.07); border: 1px solid rgba(255,77,77,0.2); color: var(--accent2); }
  .notif-banner button { background: var(--accent); border: none; border-radius: 6px; color: #0a0a0a; font-size: 11px; font-weight: 700; padding: 4px 10px; cursor: pointer; white-space: nowrap; }

  /* DONE */
  .done-screen { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; }
  .done-emoji { font-size: 56px; }
  .done-title { font-family: 'Bebas Neue', sans-serif; font-size: 44px; color: var(--success); }
  .done-sub { font-size: 13px; color: var(--muted); line-height: 1.6; }
  .done-stats { display: flex; gap: 10px; margin-top: 4px; }
  .done-stat { background: #111; border: 1px solid var(--border); border-radius: 10px; padding: 12px 18px; text-align: center; }
  .done-stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: var(--accent); }
  .done-stat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }

  /* HISTORY */
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
`;

const REST_PRESETS = [60, 90, 120, 180];

// ── Beep sound via Web Audio API ──
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Three short ascending beeps
    [0, 0.18, 0.36].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880 + i * 220;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + 0.01);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + 0.14);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  } catch (_) {}
}

// ── Vibration ──
function vibrate() {
  try {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
  } catch (_) {}
}

// ── Notification ──
async function requestNotifPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

function sendNotification(exerciseName) {
  try {
    if (Notification.permission === "granted") {
      new Notification("⏱ Repos terminé !", {
        body: `C'est parti pour ${exerciseName} 💪`,
        icon: "https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/72x72/1f3cb.png",
        silent: true, // on gère le son nous-mêmes
      });
    }
  } catch (_) {}
}

export default function WorkoutCounter() {
  // Setup
  const [step, setStep] = useState("groups");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [customExercises, setCustomExercises] = useState({});
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [customGroup, setCustomGroup] = useState(null);
  const [totalSets, setTotalSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);
  // Workout
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [repInput, setRepInput] = useState("");
  // Rest timer — now timestamp-based
  const [showRest, setShowRest] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [restRemaining, setRestRemaining] = useState(90);
  const [restPaused, setRestPaused] = useState(false);
  // endTime: the absolute Date.time when rest will finish
  const endTimeRef = useRef(null);
  // pausedAt: remaining seconds when paused
  const pausedAtRef = useRef(null);
  const rafRef = useRef(null);
  // Notifications
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  // History
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [openSession, setOpenSession] = useState(null);
  // Pending next-state after rest
  const pendingNext = useRef(null);
  // Keep curEx accessible in RAF callback
  const curExRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await window.storage.get("workout-history");
        if (res && res.value) setHistory(JSON.parse(res.value));
      } catch (_) {}
    }
    load();
  }, []);

  // ── RAF-based timer (works in background) ──
  const tickRest = useCallback(() => {
    if (!endTimeRef.current) return;
    const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
    setRestRemaining(remaining);
    if (remaining <= 0) {
      cancelAnimationFrame(rafRef.current);
      // Alert user
      playBeep();
      vibrate();
      sendNotification(curExRef.current?.exName || "prochain exercice");
      setTimeout(() => finishRest(), 400);
    } else {
      rafRef.current = requestAnimationFrame(tickRest);
    }
  }, []);

  useEffect(() => {
    if (showRest && !restPaused) {
      // If resuming from pause, recalculate endTime from remaining
      if (pausedAtRef.current !== null) {
        endTimeRef.current = Date.now() + pausedAtRef.current * 1000;
        pausedAtRef.current = null;
      }
      rafRef.current = requestAnimationFrame(tickRest);
    } else {
      cancelAnimationFrame(rafRef.current);
      if (restPaused && endTimeRef.current) {
        // Save remaining time at pause moment
        pausedAtRef.current = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      }
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [showRest, restPaused, tickRest]);

  // Keep curExRef in sync
  useEffect(() => {
    curExRef.current = workoutPlan[currentExIdx] || null;
  }, [workoutPlan, currentExIdx]);

  async function saveHistory(newHistory) {
    try { await window.storage.set("workout-history", JSON.stringify(newHistory)); } catch (_) {}
    setHistory(newHistory);
  }

  function getGroupMeta(id) { return MUSCLE_GROUPS.find(g => g.id === id); }

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
    setCustomExercises(prev => ({ ...prev, [customGroup]: [...(prev[customGroup] || []), name] }));
    setCustomInput("");
  }

  function deleteCustomExercise(groupId, name) {
    setCustomExercises(prev => ({ ...prev, [groupId]: (prev[groupId] || []).filter(n => n !== name) }));
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
    endTimeRef.current = Date.now() + restDuration * 1000;
    pausedAtRef.current = null;
    setRestRemaining(restDuration);
    setRestPaused(false);
    setShowRest(true);
  }

  function finishRest() {
    cancelAnimationFrame(rafRef.current);
    endTimeRef.current = null;
    pausedAtRef.current = null;
    setShowRest(false);
    if (pendingNext.current) {
      pendingNext.current();
      pendingNext.current = null;
    }
  }

  function skipRest() { finishRest(); }

  function changeRestDuration(newDur) {
    setRestDuration(newDur);
    // If timer is running, reset it with new duration
    if (showRest && !restPaused) {
      endTimeRef.current = Date.now() + newDur * 1000;
      setRestRemaining(newDur);
    } else if (showRest && restPaused) {
      pausedAtRef.current = newDur;
      setRestRemaining(newDur);
    }
  }

  async function handleRequestNotif() {
    const perm = await requestNotifPermission();
    setNotifPermission(perm);
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

    if (!(isLastSet && isLastEx)) {
      startRest(doNext);
    } else {
      doNext();
    }
  }

  function deleteSession(id) {
    const newHistory = history.filter(s => s.id !== id);
    saveHistory(newHistory);
    setOpenSession(null);
  }

  function reset() {
    cancelAnimationFrame(rafRef.current);
    endTimeRef.current = null;
    pausedAtRef.current = null;
    setStep("groups"); setSelectedGroups([]); setSelectedExercises([]);
    setCustomInput(""); setCustomGroup(null); setTotalSets(3); setTargetReps(10);
    setWorkoutPlan([]); setCurrentExIdx(0); setCurrentSetIdx(0); setRepInput("");
    setShowRest(false); setShowHistory(false);
    pendingNext.current = null;
  }

  const curEx = workoutPlan[currentExIdx];
  const curGroupMeta = curEx ? getGroupMeta(curEx.group) : null;
  const totalRepsDone = workoutPlan.reduce((acc, ex) => acc + ex.sets.reduce((a, s) => a + (s.reps || 0), 0), 0);
  const STEPS = ["groups", "exercises", "config", "workout"];
  const restPct = restDuration > 0 ? restRemaining / restDuration : 0;
  const R = 96, CIRC = 2 * Math.PI * R;
  const isWarning = restRemaining <= 10;

  const histByDay = history.reduce((acc, s) => {
    const day = new Date(s.date).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});

  // ── REST OVERLAY ──
  if (showRest) {
    return (
      <>
        <style>{styles}</style>
        <div className="rest-overlay">
          <div className="rest-title">Temps de repos</div>
          <div className="rest-exercise">{curEx?.exName}</div>

          {/* Notification banner */}
          {notifPermission === "default" && (
            <div className="notif-banner info">
              <span>🔔</span>
              <span style={{ flex: 1 }}>Activer les alertes de fin de repos ?</span>
              <button onClick={handleRequestNotif}>Activer</button>
            </div>
          )}
          {notifPermission === "denied" && (
            <div className="notif-banner denied">
              <span>🔕</span>
              <span>Notifications bloquées — seul le son jouera.</span>
            </div>
          )}

          <div className="rest-ring-wrap">
            <svg className="rest-ring-svg" width="220" height="220" viewBox="0 0 220 220">
              <circle className="rest-ring-bg" cx="110" cy="110" r={R} />
              <circle
                className={`rest-ring-prog${isWarning ? " warning" : ""}`}
                cx="110" cy="110" r={R}
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - restPct)}
              />
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
                <button key={s}
                  className={`rest-preset-btn${restDuration === s ? " active-preset" : ""}`}
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
            <button className="rest-ctrl-btn primary" onClick={skipRest}>
              PASSER →
            </button>
          </div>
          <button className="rest-skip" onClick={skipRest}>Ignorer le repos</button>
        </div>
      </>
    );
  }

  // ── HISTORY VIEW ──
  if (showHistory) {
    return (
      <>
        <style>{styles}</style>
        <div className="app">
          <div className="header">
            <div className="header-left">
              <div className="header-label">Musculation</div>
              <div className="header-title">HISTORIQUE</div>
            </div>
            <button className="history-tab-btn active" onClick={() => setShowHistory(false)}>
              <span className="ht-icon">🏋️</span>Séance
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
  }

  // ── MAIN APP ──
  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-left">
            <div className="header-label">Musculation</div>
            <div className="header-title">REP<br />COUNTER</div>
          </div>
          <button className="history-tab-btn" onClick={() => setShowHistory(true)}>
            <span className="ht-icon">📋</span>
            Historique {history.length > 0 && `(${history.length})`}
          </button>
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
              {MUSCLE_GROUPS.map(g => (
                <button key={g.id}
                  className={`group-btn${selectedGroups.includes(g.id) ? " selected" : ""}`}
                  style={{ "--g-color": g.color }}
                  onClick={() => toggleGroup(g.id)}>
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
              {selectedGroups.length === 0
                ? "Sélectionne une ou plusieurs zones"
                : <><span>{selectedGroups.length}</span> zone{selectedGroups.length > 1 ? "s" : ""} sélectionnée{selectedGroups.length > 1 ? "s" : ""}</>
              }
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
                  ...(DEFAULT_EXERCISES[groupId] || []).map(n => ({ name: n, isCustom: false })),
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
                Ajouter un exercice personnalisé
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {selectedGroups.map(gid => {
                  const g = getGroupMeta(gid);
                  return (
                    <button key={gid}
                      onClick={() => setCustomGroup(gid)}
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
              {!customGroup && customInput && (
                <div style={{ fontSize: 11, color: "var(--accent2)", marginTop: 6 }}>Sélectionne d'abord un groupe</div>
              )}
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
                    <button key={s}
                      onClick={() => setRestDuration(s)}
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

        {/* ── DONE ── */}
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
