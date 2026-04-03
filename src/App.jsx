import { useState, useEffect, useRef } from "react";

const MUSCLE_ICONS = {
  dos: (color = "#4fc3f7", size = 28) => (
    <svg width={size} height={size} viewBox="0 0 48 56" fill="none">
      <path d="M24 4 C20 4 14 7 12 11 C10 14 11 17 14 18 C17 19 20 18 22 17 L24 16 L26 17 C28 18 31 19 34 18 C37 17 38 14 36 11 C34 7 28 4 24 4Z" fill={color} opacity="0.95"/>
      <path d="M12 19 C8 21 5 25 4 30 C3 35 5 40 8 43 C10 45 13 44 15 42 C17 40 18 36 18 32 L18 22 C16 21 14 20 12 19Z" fill={color} opacity="0.88"/>
      <path d="M36 19 C40 21 43 25 44 30 C45 35 43 40 40 43 C38 45 35 44 33 42 C31 40 30 36 30 32 L30 22 C32 21 34 20 36 19Z" fill={color} opacity="0.88"/>
      <path d="M18 22 C19 24 21 26 24 27 C27 26 29 24 30 22 L30 18 C28 19 26 20 24 20 C22 20 20 19 18 18Z" fill={color} opacity="0.75"/>
      <path d="M21 27 C20 30 20 34 21 38 L22 44 L23 44 L23 27Z" fill={color} opacity="0.6"/>
      <path d="M27 27 C28 30 28 34 27 38 L26 44 L25 44 L25 27Z" fill={color} opacity="0.6"/>
      <path d="M19 44 C20 47 22 50 24 51 C26 50 28 47 29 44 L26 43 L22 43Z" fill={color} opacity="0.7"/>
      <path d="M18 10 C20 12 22 13 24 13 C26 13 28 12 30 10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <line x1="24" y1="16" x2="24" y2="44" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  ),
  pecs: (color = "#e8ff00", size = 28) => (
    <svg width={size} height={size} viewBox="0 0 48 52" fill="none">
      <path d="M10 12 C8 14 7 17 8 20 C9 23 12 25 15 26 C18 27 21 26 23 24 L24 22 L22 14 C18 13 14 12 10 12Z" fill={color} opacity="0.9"/>
      <path d="M22 14 L24 22 L24 32 C22 33 19 33 17 31 C14 29 12 26 12 23 C11 20 11 17 13 15Z" fill={color} opacity="0.75"/>
      <path d="M38 12 C40 14 41 17 40 20 C39 23 36 25 33 26 C30 27 27 26 25 24 L24 22 L26 14 C30 13 34 12 38 12Z" fill={color} opacity="0.9"/>
      <path d="M26 14 L24 22 L24 32 C26 33 29 33 31 31 C34 29 36 26 36 23 C37 20 37 17 35 15Z" fill={color} opacity="0.75"/>
      <line x1="24" y1="11" x2="24" y2="32" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <ellipse cx="16" cy="18" rx="5" ry="4" fill="rgba(255,255,255,0.12)" transform="rotate(-15 16 18)"/>
      <ellipse cx="32" cy="18" rx="5" ry="4" fill="rgba(255,255,255,0.12)" transform="rotate(15 32 18)"/>
      <path d="M9 22 C6 24 5 27 6 30" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M39 22 C42 24 43 27 42 30" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
    </svg>
  ),
  epaules: (color = "#ff9800", size = 28) => (
    <svg width={size} height={size} viewBox="0 0 52 44" fill="none">
      <path d="M14 8 C10 9 7 12 6 16 C5 19 6 22 9 24 C11 25 14 25 16 23 L18 20 L16 12Z" fill={color} opacity="0.9"/>
      <path d="M6 16 C4 19 4 23 5 27 C6 30 9 32 12 31 C14 30 16 28 16 25 L16 23 C13 23 10 21 8 19Z" fill={color} opacity="0.85"/>
      <path d="M8 28 C7 31 8 34 10 36 C12 37 14 36 15 34 L16 30 C14 30 11 29 8 28Z" fill={color} opacity="0.7"/>
      <path d="M38 8 C42 9 45 12 46 16 C47 19 46 22 43 24 C41 25 38 25 36 23 L34 20 L36 12Z" fill={color} opacity="0.9"/>
      <path d="M46 16 C48 19 48 23 47 27 C46 30 43 32 40 31 C38 30 36 28 36 25 L36 23 C39 23 42 21 44 19Z" fill={color} opacity="0.85"/>
      <path d="M44 28 C45 31 44 34 42 36 C40 37 38 36 37 34 L36 30 C38 30 41 29 44 28Z" fill={color} opacity="0.7"/>
      <ellipse cx="11" cy="18" rx="3" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(-20 11 18)"/>
      <ellipse cx="41" cy="18" rx="3" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(20 41 18)"/>
      <path d="M22 4 C24 3 26 3 28 4 L28 10 C26 9 24 9 22 10Z" fill={color} opacity="0.4"/>
    </svg>
  ),
  jambes: (color = "#ce93d8", size = 28) => (
    <svg width={size} height={size} viewBox="0 0 44 60" fill="none">
      <path d="M10 6 C7 9 5 14 5 20 C5 26 7 31 10 34 L13 35 L14 20 L12 8Z" fill={color} opacity="0.9"/>
      <path d="M12 5 C14 4 16 4 17 5 L17 34 C15 35 13 35 12 34 L10 20Z" fill={color} opacity="0.8"/>
      <path d="M17 5 C19 5 21 7 22 10 L22 32 C21 34 19 35 17 34Z" fill={color} opacity="0.85"/>
      <ellipse cx="16" cy="36" rx="5" ry="3" fill={color} opacity="0.5"/>
      <path d="M11 38 C10 42 10 47 11 52 L13 56 L15 56 L16 52 L16 38Z" fill={color} opacity="0.7"/>
      <path d="M11 38 C8 41 7 45 8 50 C9 53 11 55 13 55 L13 38Z" fill={color} opacity="0.6"/>
      <path d="M34 6 C37 9 39 14 39 20 C39 26 37 31 34 34 L31 35 L30 20 L32 8Z" fill={color} opacity="0.9"/>
      <path d="M32 5 C30 4 28 4 27 5 L27 34 C29 35 31 35 32 34 L34 20Z" fill={color} opacity="0.8"/>
      <path d="M27 5 C25 5 23 7 22 10 L22 32 C23 34 25 35 27 34Z" fill={color} opacity="0.85"/>
      <ellipse cx="28" cy="36" rx="5" ry="3" fill={color} opacity="0.5"/>
      <path d="M33 38 C34 42 34 47 33 52 L31 56 L29 56 L28 52 L28 38Z" fill={color} opacity="0.7"/>
      <path d="M33 38 C36 41 37 45 36 50 C35 53 33 55 31 55 L31 38Z" fill={color} opacity="0.6"/>
      <ellipse cx="15" cy="18" rx="3" ry="8" fill="rgba(255,255,255,0.12)" transform="rotate(-5 15 18)"/>
      <ellipse cx="29" cy="18" rx="3" ry="8" fill="rgba(255,255,255,0.12)" transform="rotate(5 29 18)"/>
    </svg>
  ),
  bras: (color = "#f48fb1", size = 28) => (
    <svg width={size} height={size} viewBox="0 0 44 56" fill="none">
      <path d="M10 6 C7 8 5 12 5 17 C5 21 7 25 10 27 C12 28 14 28 15 26 L16 18 L13 8Z" fill={color} opacity="0.92"/>
      <path d="M13 6 C16 6 18 8 19 12 C20 16 19 21 17 24 L15 26 C14 24 13 21 12 18 L12 8Z" fill={color} opacity="0.8"/>
      <path d="M9 8 C6 11 5 16 5 21 C5 25 6 28 8 30 L10 30 L11 18 L10 8Z" fill={color} opacity="0.45"/>
      <path d="M10 28 C8 31 7 35 8 39 C9 43 11 46 13 47 L14 48 L15 46 L15 28Z" fill={color} opacity="0.7"/>
      <path d="M15 28 C17 31 18 35 17 39 L16 46 L15 46 L15 28Z" fill={color} opacity="0.55"/>
      <ellipse cx="13" cy="16" rx="3.5" ry="7" fill="rgba(255,255,255,0.18)" transform="rotate(-8 13 16)"/>
      <path d="M34 6 C37 8 39 12 39 17 C39 21 37 25 34 27 C32 28 30 28 29 26 L28 18 L31 8Z" fill={color} opacity="0.92"/>
      <path d="M31 6 C28 6 26 8 25 12 C24 16 25 21 27 24 L29 26 C30 24 31 21 32 18 L32 8Z" fill={color} opacity="0.8"/>
      <path d="M35 8 C38 11 39 16 39 21 C39 25 38 28 36 30 L34 30 L33 18 L34 8Z" fill={color} opacity="0.45"/>
      <path d="M34 28 C36 31 37 35 36 39 C35 43 33 46 31 47 L30 48 L29 46 L29 28Z" fill={color} opacity="0.7"/>
      <path d="M29 28 C27 31 26 35 27 39 L28 46 L29 46 L29 28Z" fill={color} opacity="0.55"/>
      <ellipse cx="31" cy="16" rx="3.5" ry="7" fill="rgba(255,255,255,0.18)" transform="rotate(8 31 16)"/>
    </svg>
  ),
  cardio: (color = "#ff4d4d", size = 28) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="34" cy="7" r="4" fill={color} opacity="0.9"/>
      <path d="M30 12 C28 14 27 17 28 20 L32 24 L36 20 L35 13Z" fill={color} opacity="0.85"/>
      <path d="M28 15 C25 16 22 18 20 21 L22 23 C24 21 27 19 29 17Z" fill={color} opacity="0.8"/>
      <path d="M32 24 C30 28 28 32 26 36 L29 37 C31 33 33 29 34 26Z" fill={color} opacity="0.85"/>
      <path d="M26 36 C24 37 23 38 22 38 L23 40 C25 39 27 38 29 37Z" fill={color} opacity="0.7"/>
      <path d="M34 26 C36 29 38 33 38 37 L35 37 C35 34 34 30 32 27Z" fill={color} opacity="0.75"/>
      <path d="M6 20 C8 18 10 19 12 18 C14 17 16 18 18 17" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M4 26 C7 24 9 25 11 24" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"/>
      <path d="M8 9 C8 7 9 6 11 6 C12 6 13 7 13 8 C13 7 14 6 15 6 C17 6 18 7 18 9 C18 11 13 14 13 14 C13 14 8 11 8 9Z" fill={color} opacity="0.8"/>
    </svg>
  ),
  abdos: (color = "#00e676", size = 28) => (
    <svg width={size} height={size} viewBox="0 0 36 56" fill="none">
      <path d="M9 6 C8 8 8 12 9 14 C11 15 14 15 16 14 L16 6 C14 5 11 5 9 6Z" fill={color} opacity="0.88"/>
      <path d="M27 6 C28 8 28 12 27 14 C25 15 22 15 20 14 L20 6 C22 5 25 5 27 6Z" fill={color} opacity="0.88"/>
      <path d="M9 16 C8 18 8 20 9 22 C11 23 14 23 16 22 L16 16Z" fill={color} opacity="0.85"/>
      <path d="M27 16 C28 18 28 20 27 22 C25 23 22 23 20 22 L20 16Z" fill={color} opacity="0.85"/>
      <path d="M9 24 C8 26 8 28 9 30 C11 31 14 31 16 30 L16 24Z" fill={color} opacity="0.82"/>
      <path d="M27 24 C28 26 28 28 27 30 C25 31 22 31 20 30 L20 24Z" fill={color} opacity="0.82"/>
      <path d="M10 32 C9 34 9 36 10 38 C12 39 14 39 16 38 L16 32Z" fill={color} opacity="0.75"/>
      <path d="M26 32 C27 34 27 36 26 38 C24 39 22 39 20 38 L20 32Z" fill={color} opacity="0.75"/>
      <path d="M8 14 C5 18 4 24 5 30 C6 34 8 36 10 36 L10 14Z" fill={color} opacity="0.35"/>
      <path d="M28 14 C31 18 32 24 31 30 C30 34 28 36 26 36 L26 14Z" fill={color} opacity="0.35"/>
      <line x1="18" y1="6" x2="18" y2="50" stroke={color} strokeWidth="1.5" opacity="0.4"/>
      <ellipse cx="12" cy="10" rx="2.5" ry="3" fill="rgba(255,255,255,0.15)"/>
      <ellipse cx="24" cy="10" rx="2.5" ry="3" fill="rgba(255,255,255,0.15)"/>
    </svg>
  ),
};

const DEFAULT_MUSCLE_GROUPS = [
  { id: "dos",     label: "Dos",     color: "#4fc3f7", isCardio: false },
  { id: "pecs",    label: "Pecs",    color: "#e8ff00", isCardio: false },
  { id: "epaules", label: "Épaules", color: "#ff9800", isCardio: false },
  { id: "jambes",  label: "Jambes",  color: "#ce93d8", isCardio: false },
  { id: "bras",    label: "Bras",    color: "#f48fb1", isCardio: false },
  { id: "cardio",  label: "Cardio",  color: "#ff4d4d", isCardio: true  },
  { id: "abdos",   label: "Abdos",   color: "#00e676", isCardio: false },
];

const DEFAULT_EXERCISES = {
  dos:     ["Tractions", "Rowing barre", "Tirage poulie", "Soulevé de terre", "Rowing haltère"],
  pecs:    ["Développé couché", "Développé incliné", "Écarté haltères", "Pompes", "Dips"],
  epaules: ["Développé militaire", "Élévations latérales", "Oiseau", "Arnold press", "Shrugs"],
  jambes:  ["Squat", "Presse à cuisses", "Fentes", "Leg curl", "Mollets debout"],
  bras:    ["Curl biceps", "Marteau", "Barre EZ", "Dips triceps", "Extensions nuque"],
  cardio:  ["Course à pied", "Vélo", "Corde à sauter", "Rameur", "Natation"],
  abdos:   ["Crunchs", "Planche", "Relevé de jambes", "Bicycle", "Russian twist"],
};

const PRESET_THEMES = [
  { id:"dark",   name:"Défaut",       bg:"#0a0a0a", surface:"#141414", border:"#222222", accent:"#e8ff00", accent2:"#ff4d4d", text:"#f0f0f0", muted:"#555555", success:"#00e676" },
  { id:"blue",   name:"Bleu Nuit",    bg:"#060d1a", surface:"#0d1828", border:"#1a2d45", accent:"#00b4ff", accent2:"#ff6b6b", text:"#e8f4ff", muted:"#4a6080", success:"#00e5a0" },
  { id:"fire",   name:"Rouge Feu",    bg:"#0f0500", surface:"#1a0a00", border:"#2d1500", accent:"#ff6b00", accent2:"#ff2244", text:"#fff0e8", muted:"#664422", success:"#ffcc00" },
  { id:"nature", name:"Vert Nature",  bg:"#030d06", surface:"#071a0d", border:"#0f2d18", accent:"#00e676", accent2:"#ff6b6b", text:"#e8fff0", muted:"#2d5540", success:"#69ff47" },
  { id:"purple", name:"Violet Cosmos",bg:"#080510", surface:"#110d1e", border:"#1e1535", accent:"#b47cff", accent2:"#ff4d8b", text:"#f0e8ff", muted:"#4a3870", success:"#00e5c8" },
  { id:"light",  name:"Clair",        bg:"#f5f5f5", surface:"#ffffff", border:"#e0e0e0", accent:"#1a73e8", accent2:"#e53935", text:"#1a1a1a", muted:"#888888", success:"#00c853" },
];

const DEFAULT_THEME = { ...PRESET_THEMES[0], wallpaperUrl: "", wallpaperOpacity: "0.15" };
const REST_PRESETS = [60, 90, 120, 180];
const QUICK_REPS = [6, 8, 10, 12, 15];

function pad(n) { return String(n).padStart(2, "0"); }
function formatDate(iso) { return new Date(iso).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" }); }
function formatTime(iso) { return new Date(iso).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }); }
function formatDuration(s) {
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60;
  if(h>0) return `${h}h ${pad(m)}min`;
  if(m>0) return `${m}min ${pad(sec)}s`;
  return `${sec}s`;
}
function getLast30Days() {
  return Array.from({length:30},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(29-i));return d.toDateString();});
}

export default function WorkoutCounter() {
  const [step, setStep] = useState("groups");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [totalSets, setTotalSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);
  const [weightUnit, setWeightUnit] = useState(() => { try{return localStorage.getItem("rc-unit")||"kg"}catch{return"kg"} });
  const [showWeight, setShowWeight] = useState(() => { try{return localStorage.getItem("rc-showweight")!=="false"}catch{return true} });
  const [customExercises, setCustomExercises] = useState(() => { try{return JSON.parse(localStorage.getItem("rc-custom-exercises")||"{}")}catch{return{}} });
  const [editableExercises, setEditableExercises] = useState(() => { try{return JSON.parse(localStorage.getItem("rc-exercises")||"null")||DEFAULT_EXERCISES}catch{return DEFAULT_EXERCISES} });
  const [customInput, setCustomInput] = useState("");
  const [customGroup, setCustomGroup] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [currentSetIdx, setCurrentSetIdx] = useState(0);
  const [repInput, setRepInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [sessionNote, setSessionNote] = useState("");
  const [validateFlash, setValidateFlash] = useState(false);
  const [cardioDistance, setCardioDistance] = useState("");
  const [cardioBpm, setCardioBpm] = useState("");
  const [cardioTimerActive, setCardioTimerActive] = useState(false);
  const [cardioTimerSeconds, setCardioTimerSeconds] = useState(0);
  const cardioTimerRef = useRef(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionTimerActive, setSessionTimerActive] = useState(false);
  const sessionTimerRef = useRef(null);
  const [showRest, setShowRest] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [restRemaining, setRestRemaining] = useState(90);
  const [restPaused, setRestPaused] = useState(false);
  const restInterval = useRef(null);
  const pendingNext = useRef(null);
  const pendingSessionRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [openSession, setOpenSession] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("themes");
  const [showStats, setShowStats] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [statsGroup, setStatsGroup] = useState("all");
  const [editingGroup, setEditingGroup] = useState(null);
  const [newExInput, setNewExInput] = useState("");
  const [wallpaperInput, setWallpaperInput] = useState("");
  const [weeklyProgram, setWeeklyProgram] = useState(() => { try{return JSON.parse(localStorage.getItem("rc-weekly")||"{}")}catch{return{}} });
  const [editingDay, setEditingDay] = useState(null);
  const [theme, setTheme] = useState(() => { try{return{...DEFAULT_THEME,...JSON.parse(localStorage.getItem("rc-theme")||"{}")}}catch{return DEFAULT_THEME} });

  useEffect(() => { try{setHistory(JSON.parse(localStorage.getItem("rc-history")||"[]"))}catch{} }, []);

  useEffect(() => {
    if(showRest&&!restPaused){
      restInterval.current=setInterval(()=>{
        setRestRemaining(r=>{
          if(r<=1){clearInterval(restInterval.current);if(navigator.vibrate)navigator.vibrate([200,100,200]);setTimeout(()=>finishRest(),400);return 0;}
          return r-1;
        });
      },1000);
    } else clearInterval(restInterval.current);
    return()=>clearInterval(restInterval.current);
  },[showRest,restPaused]);

  useEffect(()=>{
    if(sessionTimerActive){sessionTimerRef.current=setInterval(()=>setSessionSeconds(s=>s+1),1000);}
    else clearInterval(sessionTimerRef.current);
    return()=>clearInterval(sessionTimerRef.current);
  },[sessionTimerActive]);

  useEffect(()=>{
    if(cardioTimerActive){cardioTimerRef.current=setInterval(()=>setCardioTimerSeconds(s=>s+1),1000);}
    else clearInterval(cardioTimerRef.current);
    return()=>clearInterval(cardioTimerRef.current);
  },[cardioTimerActive]);

  function saveHistory(h){localStorage.setItem("rc-history",JSON.stringify(h));setHistory(h);}
  function saveTheme(t){localStorage.setItem("rc-theme",JSON.stringify(t));setTheme(t);}
  function saveExercises(e){localStorage.setItem("rc-exercises",JSON.stringify(e));setEditableExercises(e);}
  function saveCustomExercises(c){localStorage.setItem("rc-custom-exercises",JSON.stringify(c));setCustomExercises(c);}
  function saveWeekly(w){localStorage.setItem("rc-weekly",JSON.stringify(w));setWeeklyProgram(w);}

  const isBgLight=theme.bg==="#f5f5f5";
  const cardBg=isBgLight?"#ffffff":theme.surface;
  const inputBg=isBgLight?"#f0f0f0":"#111111";
  const planItemBg=isBgLight?"#f8f8f8":"#0f0f0f";

  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:${theme.bg};color:${theme.text};font-family:'DM Sans',sans-serif;}
    .app{min-height:100vh;background:${theme.bg};display:flex;flex-direction:column;align-items:center;padding:24px 16px 48px;position:relative;}
    ${theme.wallpaperUrl?`.app::before{content:'';position:fixed;inset:0;z-index:0;background-image:url('${theme.wallpaperUrl}');background-size:cover;background-position:center;opacity:${theme.wallpaperOpacity};pointer-events:none;}`:""}
    .app>*{position:relative;z-index:1;}
    .header{width:100%;max-width:420px;margin-bottom:20px;display:flex;align-items:flex-start;justify-content:space-between;}
    .header-label{font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${theme.muted};margin-bottom:2px;}
    .header-title{font-family:'Bebas Neue',sans-serif;font-size:52px;line-height:1;color:${theme.text};}
    .header-actions{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;}
    .icon-btn{display:flex;flex-direction:column;align-items:center;gap:3px;background:transparent;border:1px solid ${theme.border};border-radius:10px;padding:7px 10px;color:${theme.muted};cursor:pointer;font-size:10px;font-family:'DM Sans',sans-serif;transition:all 0.13s;}
    .icon-btn:hover{border-color:#555;color:${theme.text};}
    .icon-btn.active{border-color:${theme.accent};color:${theme.accent};}
    .card{background:${cardBg};border:1px solid ${theme.border};border-radius:16px;width:100%;max-width:420px;padding:20px;margin-bottom:12px;}
    .section-title{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${theme.muted};margin-bottom:14px;}
    .group-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
    .group-btn{display:flex;flex-direction:column;align-items:center;gap:5px;padding:10px 6px;border-radius:10px;border:1px solid ${theme.border};background:transparent;color:${theme.muted};cursor:pointer;font-size:11px;font-family:'DM Sans',sans-serif;transition:all 0.15s;position:relative;}
    .group-btn:hover{border-color:#555;color:${theme.text};transform:translateY(-1px);}
    .group-btn.selected{border-color:var(--gc);color:var(--gc);background:color-mix(in srgb,var(--gc) 8%,transparent);}
    .group-btn.selected::after{content:'✓';position:absolute;top:4px;right:6px;font-size:9px;color:var(--gc);}
    .tag-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;}
    .tag{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;border:1px solid;font-size:12px;}
    .group-hint{font-size:11px;color:${theme.muted};margin-top:10px;text-align:center;}
    .ex-list{display:flex;flex-direction:column;gap:6px;}
    .ex-item{display:flex;align-items:center;gap:10px;padding:11px 14px;background:${planItemBg};border:1px solid ${theme.border};border-radius:10px;cursor:pointer;transition:all 0.13s;}
    .ex-item:hover{border-color:#555;}
    .ex-item.selected{border-color:${theme.accent};}
    .ex-item-dot{width:8px;height:8px;border-radius:50%;border:1.5px solid ${theme.muted};background:transparent;flex-shrink:0;}
    .ex-item.selected .ex-item-dot{background:${theme.accent};border-color:${theme.accent};}
    .ex-item-label{font-size:14px;flex:1;}
    .ex-item-del{background:none;border:none;color:${theme.muted};cursor:pointer;font-size:16px;padding:0 4px;}
    .add-custom-row{display:flex;gap:8px;margin-top:10px;}
    .custom-input{flex:1;background:${inputBg};border:1px solid ${theme.border};border-radius:8px;color:${theme.text};font-family:'DM Sans',sans-serif;font-size:14px;padding:10px 14px;outline:none;}
    .custom-input:focus{border-color:${theme.accent};}
    .custom-input::placeholder{color:${theme.muted};}
    .add-btn{background:${theme.accent};border:none;border-radius:8px;color:#0a0a0a;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;padding:0 16px;cursor:pointer;white-space:nowrap;}
    .add-btn:disabled{opacity:0.3;cursor:not-allowed;}
    .config-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
    .config-label{font-size:12px;color:${theme.muted};flex:1;text-transform:uppercase;letter-spacing:0.1em;}
    .stepper{display:flex;border:1px solid ${theme.border};border-radius:8px;overflow:hidden;}
    .stepper-btn{background:${planItemBg};border:none;color:${theme.text};width:36px;height:36px;font-size:18px;cursor:pointer;}
    .stepper-val{width:52px;text-align:center;font-size:15px;font-weight:600;background:${inputBg};color:${theme.text};display:flex;align-items:center;justify-content:center;}
    .plan-list{display:flex;flex-direction:column;gap:8px;}
    .plan-item{display:flex;align-items:center;gap:10px;padding:12px 14px;background:${planItemBg};border:1px solid ${theme.border};border-radius:10px;}
    .plan-item.active-plan{border-color:${theme.accent};}
    .plan-item.done-plan{opacity:0.5;}
    .plan-idx{font-family:'Bebas Neue',sans-serif;font-size:20px;color:${theme.muted};width:20px;}
    .plan-item.active-plan .plan-idx{color:${theme.accent};}
    .plan-info{flex:1;min-width:0;}
    .plan-name{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .plan-detail{font-size:11px;color:${theme.muted};margin-top:2px;}
    .plan-status{font-size:10px;font-weight:600;text-transform:uppercase;}
    .plan-status.pending{color:${theme.muted};}
    .plan-status.active{color:${theme.accent};}
    .plan-status.done{color:${theme.success};}
    .start-btn{width:100%;height:58px;border-radius:12px;border:none;background:${theme.accent};color:#0a0a0a;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:0.08em;cursor:pointer;margin-top:16px;transition:opacity 0.15s,transform 0.1s;}
    .start-btn:disabled{opacity:0.3;cursor:not-allowed;}
    .start-btn:not(:disabled):active{transform:scale(0.98);}
    .reset-btn{background:transparent;border:1px solid ${theme.border};border-radius:8px;color:${theme.muted};font-family:'DM Sans',sans-serif;font-size:13px;padding:10px 18px;cursor:pointer;}
    .reset-btn:hover{border-color:${theme.accent2};color:${theme.accent2};}
    .validate-btn{width:100%;height:56px;border-radius:12px;border:2px solid ${theme.success};background:transparent;color:${theme.success};font-family:'Bebas Neue',sans-serif;font-size:20px;cursor:pointer;transition:all 0.15s;}
    .validate-btn:disabled{opacity:0.25;cursor:not-allowed;border-color:${theme.muted};color:${theme.muted};}
    .validate-btn.flash{background:color-mix(in srgb,${theme.success} 20%,transparent);}
    .step-nav{display:flex;gap:6px;margin-bottom:20px;width:100%;max-width:420px;}
    .step-pip{height:3px;flex:1;border-radius:2px;background:${theme.border};}
    .step-pip.done-pip{background:${theme.success};}
    .step-pip.active-pip{background:${theme.accent};}
    .divider{border:none;border-top:1px solid ${theme.border};margin:14px 0;}
    .progress-bar-wrap{width:100%;max-width:420px;margin-bottom:10px;}
    .progress-bar-label{display:flex;justify-content:space-between;font-size:10px;color:${theme.muted};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:5px;}
    .progress-bar-track{height:4px;background:${theme.border};border-radius:2px;overflow:hidden;}
    .progress-bar-fill{height:100%;background:${theme.accent};border-radius:2px;transition:width 0.4s ease;}
    .session-timer{width:100%;max-width:420px;display:flex;align-items:center;gap:8px;padding:10px 14px;background:${cardBg};border:1px solid ${theme.border};border-radius:10px;margin-bottom:12px;}
    .timer-label{font-size:11px;color:${theme.muted};text-transform:uppercase;letter-spacing:0.1em;flex:1;}
    .timer-val{font-family:'Bebas Neue',sans-serif;font-size:22px;color:${theme.accent};}
    .workout-ex-header{display:flex;flex-direction:column;gap:2px;margin-bottom:20px;}
    .workout-ex-label{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${theme.muted};}
    .workout-ex-name{font-family:'Bebas Neue',sans-serif;font-size:32px;line-height:1.05;}
    .set-track{display:flex;gap:8px;align-items:center;margin-bottom:24px;flex-wrap:wrap;}
    .set-bubble{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:36px;}
    .set-bubble-dot{width:12px;height:12px;border-radius:50%;border:2px solid #333;background:transparent;transition:all 0.2s;}
    .set-bubble-dot.done{background:${theme.success};border-color:${theme.success};}
    .set-bubble-dot.active{background:${theme.accent};border-color:${theme.accent};box-shadow:0 0 8px ${theme.accent};}
    .set-bubble-reps{font-size:10px;color:${theme.muted};min-height:14px;}
    .set-bubble-reps.filled{color:${theme.success};font-weight:600;}
    .go-zone{display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 0;}
    .go-label{font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${theme.muted};}
    .go-serie-num{font-family:'Bebas Neue',sans-serif;font-size:72px;line-height:1;color:${theme.accent};}
    .go-target{font-size:13px;color:${theme.muted};}
    .go-target span{color:${theme.text};font-weight:600;}
    .quick-reps{display:flex;gap:6px;margin-bottom:10px;}
    .qrep-btn{flex:1;height:38px;border-radius:8px;border:1px solid ${theme.border};background:${planItemBg};color:${theme.muted};font-family:'Bebas Neue',sans-serif;font-size:18px;cursor:pointer;transition:all 0.12s;}
    .qrep-btn:hover{border-color:${theme.accent};color:${theme.accent};}
    .qrep-btn.selected-qrep{border-color:${theme.accent};background:color-mix(in srgb,${theme.accent} 15%,transparent);color:${theme.accent};}
    .rep-entry-label{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${theme.muted};margin-bottom:8px;text-align:center;}
    .rep-numpad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;}
    .np-btn{height:56px;border-radius:10px;border:1px solid ${theme.border};background:${inputBg};color:${theme.text};font-family:'Bebas Neue',sans-serif;font-size:24px;cursor:pointer;transition:all 0.1s;}
    .np-btn:active{transform:scale(0.94);}
    .np-btn.del{font-size:18px;color:${theme.muted};}
    .np-btn.zero{grid-column:span 2;}
    .rep-display-val{font-family:'Bebas Neue',sans-serif;font-size:80px;line-height:1;text-align:center;color:${theme.muted};margin-bottom:8px;transition:color 0.15s;}
    .rep-display-val.has-val{color:${theme.accent};}
    .weight-row{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:10px 14px;background:${planItemBg};border-radius:10px;border:1px solid ${theme.border};}
    .weight-label{font-size:12px;color:${theme.muted};flex:1;}
    .weight-input{background:${inputBg};border:1px solid ${theme.border};border-radius:8px;color:${theme.text};font-family:'Bebas Neue',sans-serif;font-size:20px;text-align:center;width:90px;height:40px;outline:none;padding:0 10px;}
    .weight-input:focus{border-color:${theme.accent};}
    .weight-unit{font-size:13px;color:${theme.muted};}
    .record-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;background:rgba(255,204,0,0.12);border:1px solid #ffcc00;border-radius:20px;font-size:12px;color:#ffcc00;font-weight:600;margin-bottom:12px;animation:pulse 1.5s ease infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
    .cardio-live{display:flex;flex-direction:column;align-items:center;gap:16px;padding:8px 0 24px;}
    .cardio-timer-display{font-family:'Bebas Neue',sans-serif;font-size:88px;line-height:1;color:${theme.accent2};letter-spacing:0.04em;}
    .cardio-timer-display.running{animation:cpulse 1s ease infinite;}
    @keyframes cpulse{0%,100%{opacity:1}50%{opacity:0.75}}
    .cardio-controls{display:flex;gap:10px;width:100%;}
    .cardio-ctrl-btn{flex:1;height:52px;border-radius:12px;border:2px solid ${theme.border};background:transparent;color:${theme.text};font-family:'Bebas Neue',sans-serif;font-size:18px;cursor:pointer;transition:all 0.15s;}
    .cardio-ctrl-btn.start-c{border-color:${theme.accent2};color:${theme.accent2};}
    .cardio-ctrl-btn.pause-c{border-color:${theme.muted};color:${theme.muted};}
    .cardio-ctrl-btn.reset-c{font-size:14px;}
    .cardio-extra-fields{width:100%;display:flex;flex-direction:column;gap:10px;padding-top:16px;border-top:1px solid ${theme.border};}
    .cardio-field-row{display:flex;align-items:center;gap:10px;}
    .cardio-field-label{font-size:11px;color:${theme.muted};text-transform:uppercase;letter-spacing:0.08em;width:80px;}
    .cardio-field-input{flex:1;background:${inputBg};border:1px solid ${theme.border};border-radius:8px;color:${theme.text};font-family:'Bebas Neue',sans-serif;font-size:20px;text-align:center;height:42px;outline:none;padding:0 10px;}
    .cardio-field-input:focus{border-color:${theme.accent2};}
    .cardio-field-input::placeholder{color:${theme.muted};font-size:16px;}
    .cardio-field-unit{font-size:12px;color:${theme.muted};min-width:28px;}
    .cardio-bpm-input{background:${inputBg};border:1px solid ${theme.border};border-radius:8px;color:${theme.accent2};font-family:'Bebas Neue',sans-serif;font-size:20px;text-align:center;width:90px;height:42px;outline:none;padding:0 10px;}
    .cardio-bpm-input:focus{border-color:${theme.accent2};}
    .validate-cardio-btn{width:100%;height:56px;border-radius:12px;border:2px solid ${theme.accent2};background:transparent;color:${theme.accent2};font-family:'Bebas Neue',sans-serif;font-size:20px;cursor:pointer;margin-top:4px;transition:all 0.15s;}
    .validate-cardio-btn:disabled{opacity:0.3;cursor:not-allowed;}
    .note-area{width:100%;background:${inputBg};border:1px solid ${theme.border};border-radius:10px;color:${theme.text};font-family:'DM Sans',sans-serif;font-size:14px;padding:12px 14px;outline:none;resize:vertical;min-height:80px;margin-top:8px;}
    .note-area:focus{border-color:${theme.accent};}
    .note-area::placeholder{color:${theme.muted};}
    .rest-overlay{position:fixed;inset:0;z-index:100;background:rgba(5,5,5,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;animation:fadeIn 0.2s ease;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .rest-ring-wrap{position:relative;width:220px;height:220px;margin-bottom:28px;}
    .rest-ring-svg{transform:rotate(-90deg);}
    .rest-ring-bg{fill:none;stroke:#1a1a1a;stroke-width:8;}
    .rest-ring-prog{fill:none;stroke:${theme.accent};stroke-width:8;stroke-linecap:round;transition:stroke-dashoffset 1s linear;}
    .rest-ring-prog.warning{stroke:${theme.accent2};}
    .rest-time-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
    .rest-countdown{font-family:'Bebas Neue',sans-serif;font-size:72px;line-height:1;color:${theme.accent};}
    .rest-countdown.warning{color:${theme.accent2};}
    .rest-of{font-size:12px;color:${theme.muted};margin-top:2px;}
    .rest-controls{display:flex;gap:12px;width:100%;max-width:340px;margin-bottom:24px;}
    .rest-ctrl-btn{flex:1;height:52px;border-radius:12px;border:1px solid ${theme.border};background:#111;color:${theme.text};font-family:'Bebas Neue',sans-serif;font-size:18px;cursor:pointer;}
    .rest-ctrl-btn.primary{background:${theme.accent};border-color:${theme.accent};color:#0a0a0a;}
    .rest-duration-row{display:flex;align-items:center;gap:12px;padding:14px 20px;background:#111;border:1px solid ${theme.border};border-radius:12px;width:100%;max-width:340px;}
    .rest-duration-label{font-size:11px;color:${theme.muted};text-transform:uppercase;letter-spacing:0.1em;}
    .rest-presets{display:flex;gap:6px;}
    .rest-preset-btn{background:transparent;border:1px solid ${theme.border};border-radius:6px;color:${theme.muted};font-size:12px;font-weight:500;padding:5px 10px;cursor:pointer;font-family:'DM Sans',sans-serif;}
    .rest-preset-btn.active-preset{border-color:${theme.accent};color:${theme.accent};}
    .rest-skip{font-size:12px;color:${theme.muted};text-decoration:underline;cursor:pointer;background:none;border:none;margin-top:8px;}
    .done-screen{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;}
    .done-emoji{font-size:56px;}
    .done-title{font-family:'Bebas Neue',sans-serif;font-size:44px;color:${theme.success};}
    .done-sub{font-size:13px;color:${theme.muted};line-height:1.6;}
    .done-stats{display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;justify-content:center;}
    .done-stat{background:${inputBg};border:1px solid ${theme.border};border-radius:10px;padding:10px 14px;text-align:center;}
    .done-stat-val{font-family:'Bebas Neue',sans-serif;font-size:24px;color:${theme.accent};}
    .done-stat-label{font-size:10px;color:${theme.muted};text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;}
    .hist-empty{text-align:center;padding:40px 0;color:${theme.muted};font-size:14px;}
    .hist-day{margin-bottom:24px;}
    .hist-day-label{font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:${theme.muted};margin-bottom:8px;}
    .hist-session{background:${cardBg};border:1px solid ${theme.border};border-radius:12px;padding:14px 16px;margin-bottom:8px;cursor:pointer;}
    .hist-session.open{border-color:${theme.accent};}
    .hist-session-top{display:flex;align-items:center;gap:10px;}
    .hist-session-tags{display:flex;gap:5px;flex-wrap:wrap;flex:1;}
    .hist-stag{font-size:11px;padding:2px 8px;border-radius:20px;border:1px solid;font-weight:500;}
    .hist-session-meta{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
    .hist-session-time{font-size:11px;color:${theme.muted};}
    .hist-session-reps{font-family:'Bebas Neue',sans-serif;font-size:20px;color:${theme.accent};}
    .hist-detail{margin-top:14px;padding-top:14px;border-top:1px solid ${theme.border};display:flex;flex-direction:column;gap:10px;}
    .hist-ex-name{font-size:13px;font-weight:600;}
    .hist-sets-row{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0;}
    .hist-set-chip{background:${inputBg};border:1px solid ${theme.border};border-radius:6px;padding:3px 8px;font-size:12px;color:${theme.muted};}
    .hist-note{font-size:12px;color:${theme.muted};font-style:italic;padding:8px 12px;background:${inputBg};border-radius:8px;border-left:3px solid ${theme.accent};}
    .del-session-btn{background:none;border:none;color:${theme.muted};font-size:12px;cursor:pointer;text-decoration:underline;padding:0;}
    .settings-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.85);display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.2s ease;}
    .settings-panel{background:#111;border:1px solid ${theme.border};border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;padding:24px 20px 40px;}
    .settings-handle{width:36px;height:4px;background:${theme.border};border-radius:2px;margin:0 auto 20px;}
    .settings-title{font-family:'Bebas Neue',sans-serif;font-size:28px;margin-bottom:16px;}
    .settings-tabs{display:flex;gap:5px;margin-bottom:20px;flex-wrap:wrap;}
    .stab{flex:1;min-width:70px;padding:7px 4px;border-radius:8px;border:1px solid ${theme.border};background:transparent;color:${theme.muted};font-family:'DM Sans',sans-serif;font-size:10px;cursor:pointer;}
    .stab.active{border-color:${theme.accent};color:${theme.accent};}
    .themes-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
    .theme-card{border-radius:12px;border:2px solid transparent;cursor:pointer;overflow:hidden;}
    .theme-card.selected-theme{border-color:${theme.accent};}
    .theme-preview{height:52px;display:flex;flex-direction:column;justify-content:flex-end;padding:6px 8px;position:relative;}
    .theme-accent-strip{position:absolute;top:0;left:0;right:0;height:4px;}
    .theme-name{font-size:11px;font-weight:600;margin-top:4px;}
    .color-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;padding:10px 14px;background:${cardBg};border-radius:10px;border:1px solid ${theme.border};}
    .color-label{flex:1;font-size:13px;}
    .color-desc{font-size:11px;color:${theme.muted};}
    .color-picker{width:40px;height:40px;border:none;border-radius:8px;cursor:pointer;padding:2px;background:transparent;}
    .reset-all-btn{width:100%;height:44px;border-radius:10px;border:1px solid ${theme.accent2};background:transparent;color:${theme.accent2};font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;margin-top:8px;}
    .wallpaper-input{width:100%;background:${cardBg};border:1px solid ${theme.border};border-radius:8px;color:${theme.text};font-family:'DM Sans',sans-serif;font-size:13px;padding:10px 14px;outline:none;margin-bottom:8px;}
    .wallpaper-input:focus{border-color:${theme.accent};}
    .wallpaper-input::placeholder{color:${theme.muted};}
    .wallpaper-preview{width:100%;height:110px;border-radius:10px;border:1px solid ${theme.border};background:${cardBg};display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:8px;}
    .wallpaper-preview img{width:100%;height:100%;object-fit:cover;}
    .opacity-row{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
    .opacity-label{font-size:12px;color:${theme.muted};flex:1;}
    .opacity-val{font-size:13px;color:${theme.accent};width:36px;text-align:right;}
    .opacity-slider{flex:2;accent-color:${theme.accent};}
    .apply-wall-btn{width:100%;height:44px;border-radius:10px;border:none;background:${theme.accent};color:#0a0a0a;font-family:'Bebas Neue',sans-serif;font-size:18px;cursor:pointer;}
    .remove-wall-btn{width:100%;height:40px;border-radius:10px;border:1px solid ${theme.accent2};background:transparent;color:${theme.accent2};font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;margin-top:8px;}
    .ex-editor-group{margin-bottom:12px;border:1px solid ${theme.border};border-radius:10px;overflow:hidden;}
    .ex-editor-group-header{display:flex;align-items:center;gap:8px;padding:12px 14px;cursor:pointer;background:${cardBg};}
    .ex-editor-group-title{font-size:13px;font-weight:600;flex:1;}
    .ex-editor-group-count{font-size:11px;color:${theme.muted};}
    .ex-editor-body{padding:10px 14px 14px;}
    .ex-editor-item{display:flex;align-items:center;gap:8px;padding:7px 10px;background:${inputBg};border:1px solid ${theme.border};border-radius:8px;margin-bottom:5px;}
    .ex-editor-name{flex:1;font-size:13px;}
    .ex-editor-del{background:none;border:none;color:${theme.muted};cursor:pointer;font-size:16px;padding:0 4px;}
    .ex-add-row{display:flex;gap:6px;margin-top:8px;}
    .ex-add-input{flex:1;background:${inputBg};border:1px solid ${theme.border};border-radius:8px;color:${theme.text};font-size:13px;padding:8px 12px;outline:none;font-family:'DM Sans',sans-serif;}
    .ex-add-input:focus{border-color:${theme.accent};}
    .ex-add-input::placeholder{color:${theme.muted};}
    .ex-add-btn{background:${theme.accent};border:none;border-radius:8px;color:#0a0a0a;font-size:12px;font-weight:700;padding:0 14px;cursor:pointer;font-family:'DM Sans',sans-serif;}
    .ex-add-btn:disabled{opacity:0.3;cursor:not-allowed;}
    .export-btn{width:100%;height:50px;border-radius:12px;border:1px solid ${theme.border};background:${cardBg};color:${theme.text};font-family:'DM Sans',sans-serif;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;}
    .export-btn:hover{border-color:${theme.accent};color:${theme.accent};}
    .stats-overlay{position:fixed;inset:0;z-index:150;background:rgba(0,0,0,0.9);display:flex;align-items:flex-end;justify-content:center;animation:fadeIn 0.2s ease;}
    .stats-panel{background:#111;border:1px solid ${theme.border};border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;padding:24px 20px 40px;}
    .stats-filter{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;}
    .stats-filter-btn{padding:5px 12px;border-radius:20px;border:1px solid ${theme.border};background:transparent;color:${theme.muted};font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;}
    .stats-filter-btn.active{border-color:${theme.accent};color:${theme.accent};}
    .bar-chart{display:flex;align-items:flex-end;gap:3px;height:100px;width:100%;}
    .bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;}
    .bar{width:100%;border-radius:3px 3px 0 0;background:${theme.accent};opacity:0.7;min-height:2px;}
    .bar-label{font-size:8px;color:${theme.muted};writing-mode:vertical-rl;transform:rotate(180deg);max-height:30px;overflow:hidden;}
    .stats-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
    .stat-box{background:${cardBg};border:1px solid ${theme.border};border-radius:10px;padding:12px;text-align:center;}
    .stat-box-val{font-family:'Bebas Neue',sans-serif;font-size:28px;color:${theme.accent};}
    .stat-box-label{font-size:10px;color:${theme.muted};text-transform:uppercase;letter-spacing:0.1em;}
    .record-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:${cardBg};border:1px solid ${theme.border};border-radius:10px;margin-bottom:6px;}
    .record-info{flex:1;}
    .record-name{font-size:13px;font-weight:600;}
    .record-val{font-size:11px;color:${theme.muted};}
    .record-best{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#ffcc00;}
    .weekly-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:16px;}
    .day-col{display:flex;flex-direction:column;gap:4px;}
    .day-header{font-size:10px;text-align:center;color:${theme.muted};font-weight:600;padding:4px 0;text-transform:uppercase;}
    .day-header.today{color:${theme.accent};}
    .day-slot{min-height:36px;border:1px solid ${theme.border};border-radius:6px;background:${cardBg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;padding:4px 2px;}
    .day-slot.has-groups{border-color:${theme.accent};}
    .day-slot.is-today{box-shadow:0 0 0 2px ${theme.accent};}
    .day-slot-empty{font-size:16px;color:${theme.border};}
    .day-edit-panel{padding:14px;background:${cardBg};border:1px solid ${theme.border};border-radius:12px;margin-bottom:12px;}
    .day-edit-title{font-size:13px;font-weight:600;margin-bottom:10px;}
    .day-group-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
    .day-group-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border-radius:8px;border:1px solid ${theme.border};background:transparent;color:${theme.muted};cursor:pointer;font-size:10px;font-family:'DM Sans',sans-serif;}
    .day-group-btn.sel{border-color:var(--gc);color:var(--gc);}
    .weekly-start-btn{width:100%;height:50px;border-radius:12px;border:none;background:${theme.accent};color:#0a0a0a;font-family:'Bebas Neue',sans-serif;font-size:20px;cursor:pointer;}
    .weekly-start-btn:disabled{opacity:0.3;cursor:not-allowed;}
    .toggle-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:${cardBg};border:1px solid ${theme.border};border-radius:10px;margin-bottom:10px;}
    .toggle-label{flex:1;font-size:13px;}
    .toggle{position:relative;width:44px;height:24px;flex-shrink:0;}
    .toggle input{opacity:0;width:0;height:0;}
    .toggle-slider{position:absolute;inset:0;background:${theme.border};border-radius:24px;cursor:pointer;transition:0.3s;}
    .toggle input:checked+.toggle-slider{background:${theme.accent};}
    .toggle-slider:before{content:'';position:absolute;width:18px;height:18px;left:3px;bottom:3px;background:white;border-radius:50%;transition:0.3s;}
    .toggle input:checked+.toggle-slider:before{transform:translateX(20px);}
    .unit-row{display:flex;gap:6px;}
    .unit-btn{flex:1;height:36px;border-radius:8px;border:1px solid ${theme.border};background:transparent;color:${theme.muted};font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;}
    .unit-btn.active{border-color:${theme.accent};color:${theme.accent};}
  `;

  function getGroupMeta(id){return DEFAULT_MUSCLE_GROUPS.find(g=>g.id===id);}
  function isCardioGroup(id){return getGroupMeta(id)?.isCardio||false;}
  const DAYS=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
  const DAY_KEYS=["mon","tue","wed","thu","fri","sat","sun"];
  const todayIdx=(new Date().getDay()+6)%7;
  const hasMuscu=selectedExercises.some(ex=>!isCardioGroup(ex.group));

  function toggleGroup(id){setSelectedGroups(p=>p.includes(id)?p.filter(g=>g!==id):[...p,id]);setSelectedExercises([]);}
  function toggleExercise(ex){setSelectedExercises(p=>{const e=p.find(e=>e.name===ex.name&&e.group===ex.group);return e?p.filter(e=>!(e.name===ex.name&&e.group===ex.group)):[...p,ex];});}
  function addCustomExercise(){const n=customInput.trim();if(!n||!customGroup)return;saveCustomExercises({...customExercises,[customGroup]:[...(customExercises[customGroup]||[]),n]});setCustomInput("");}
  function deleteCustomExercise(g,n){saveCustomExercises({...customExercises,[g]:(customExercises[g]||[]).filter(x=>x!==n)});setSelectedExercises(p=>p.filter(e=>!(e.name===n&&e.group===g)));}

  function startWorkout(){
    const plan=selectedExercises.map(ex=>({
      exName:ex.name,group:ex.group,isCardio:isCardioGroup(ex.group),
      sets:isCardioGroup(ex.group)?[{status:"active",minutes:0,seconds:0,distance:"",bpm:""}]:Array.from({length:totalSets},()=>({reps:null,weight:null,status:"pending"}))
    }));
    if(plan.length>0)plan[0].sets[0].status="active";
    setWorkoutPlan(plan);setCurrentExIdx(0);setCurrentSetIdx(0);
    setRepInput("");setWeightInput("");setCardioTimerSeconds(0);setCardioTimerActive(false);
    setCardioDistance("");setCardioBpm("");setSessionSeconds(0);setSessionTimerActive(true);setStep("workout");
  }

  function numpadPress(v){setRepInput(p=>{if(v==="del")return p.slice(0,-1);const n=p+v;return parseInt(n)>999?p:n;});}

  function startRest(fn){pendingNext.current=fn;setRestRemaining(restDuration);setRestPaused(false);setShowRest(true);}
  function finishRest(){setShowRest(false);clearInterval(restInterval.current);if(pendingNext.current){pendingNext.current();pendingNext.current=null;}}
  function changeRestDuration(d){setRestDuration(d);setRestRemaining(d);}

  function flashValidate(){setValidateFlash(true);setTimeout(()=>setValidateFlash(false),300);}

  function validateSet(){
    const reps=parseInt(repInput)||0,weight=parseFloat(weightInput)||null;
    const isLastSet=currentSetIdx+1>=totalSets,isLastEx=currentExIdx+1>=workoutPlan.length;
    flashValidate();
    const up=workoutPlan.map((ex,ei)=>{
      if(ei===currentExIdx)return{...ex,sets:ex.sets.map((s,si)=>{
        if(si===currentSetIdx)return{reps,weight,status:"done"};
        if(!isLastSet&&si===currentSetIdx+1)return{...s,status:"active"};
        return s;
      })};
      if(isLastSet&&!isLastEx&&ei===currentExIdx+1)return{...ex,sets:ex.sets.map((s,si)=>si===0?{...s,status:"active"}:s)};
      return ex;
    });
    setWorkoutPlan(up);setRepInput("");setWeightInput("");
    const doNext=()=>{
      if(!isLastSet)setCurrentSetIdx(s=>s+1);
      else if(!isLastEx){setCurrentExIdx(e=>e+1);setCurrentSetIdx(0);}
      else finishWorkout(up);
    };
    if(!(isLastSet&&isLastEx))startRest(doNext);else doNext();
  }

  function validateCardio(){
    setCardioTimerActive(false);
    const mins=Math.floor(cardioTimerSeconds/60),secs=cardioTimerSeconds%60;
    const dist=parseFloat(cardioDistance)||null,bpm=parseInt(cardioBpm)||null;
    const isLastEx=currentExIdx+1>=workoutPlan.length;
    const up=workoutPlan.map((ex,ei)=>{
      if(ei===currentExIdx)return{...ex,sets:[{status:"done",minutes:mins,seconds:secs,distance:dist,bpm}]};
      if(!isLastEx&&ei===currentExIdx+1)return{...ex,sets:ex.sets.map((s,si)=>si===0?{...s,status:"active"}:s)};
      return ex;
    });
    setWorkoutPlan(up);setCardioTimerSeconds(0);setCardioDistance("");setCardioBpm("");
    if(!isLastEx){setCurrentExIdx(e=>e+1);setCurrentSetIdx(0);}else finishWorkout(up);
  }

  function finishWorkout(plan){
    setSessionTimerActive(false);
    const totalReps=plan.filter(e=>!e.isCardio).reduce((a,ex)=>a+ex.sets.reduce((b,s)=>b+(s.reps||0),0),0);
    const session={id:Date.now().toString(),date:new Date().toISOString(),groups:selectedGroups,
      exercises:plan.map(ex=>({exName:ex.exName,group:ex.group,isCardio:ex.isCardio,
        sets:ex.isCardio?ex.sets.map(s=>({minutes:s.minutes||0,seconds:s.seconds||0,distance:s.distance,bpm:s.bpm})):ex.sets.map(s=>({reps:s.reps||0,weight:s.weight}))})),
      totalReps,totalSets:totalSets*plan.filter(e=>!e.isCardio).length,targetReps,duration:sessionSeconds,note:""};
    pendingSessionRef.current=session;
    const nh=[session,...history];saveHistory(nh);setStep("done");
  }

  function saveNoteToSession(note){if(!pendingSessionRef.current)return;saveHistory(history.map(s=>s.id===pendingSessionRef.current.id?{...s,note}:s));}
  function deleteSession(id){saveHistory(history.filter(s=>s.id!==id));setOpenSession(null);}

  function reset(){
    setStep("groups");setSelectedGroups([]);setSelectedExercises([]);setCustomInput("");setCustomGroup(null);
    setTotalSets(3);setTargetReps(10);setWorkoutPlan([]);setCurrentExIdx(0);setCurrentSetIdx(0);
    setRepInput("");setWeightInput("");setSessionNote("");setCardioTimerSeconds(0);setCardioTimerActive(false);
    setCardioDistance("");setCardioBpm("");setShowRest(false);setShowHistory(false);setShowSettings(false);
    setShowStats(false);setShowWeekly(false);setSessionTimerActive(false);setSessionSeconds(0);
    pendingNext.current=null;pendingSessionRef.current=null;
  }

  function applyPreset(p){saveTheme({...theme,...p});}
  function updateThemeColor(k,v){saveTheme({...theme,[k]:v});}
  function applyWallpaper(){saveTheme({...theme,wallpaperUrl:wallpaperInput});}
  function removeWallpaper(){setWallpaperInput("");saveTheme({...theme,wallpaperUrl:""});}
  function addExerciseInEditor(gid){if(!newExInput.trim())return;saveExercises({...editableExercises,[gid]:[...(editableExercises[gid]||[]),newExInput.trim()]});setNewExInput("");}
  function removeExerciseInEditor(gid,name){saveExercises({...editableExercises,[gid]:(editableExercises[gid]||[]).filter(n=>n!==name)});}
  function toggleDayGroup(dk,gid){const c=weeklyProgram[dk]||[];saveWeekly({...weeklyProgram,[dk]:c.includes(gid)?c.filter(g=>g!==gid):[...c,gid]});}
  function startFromWeekly(){const g=weeklyProgram[DAY_KEYS[todayIdx]]||[];if(!g.length)return;setSelectedGroups(g);setShowWeekly(false);setStep("exercises");}

  function computeRecords(hist){const r={};hist.forEach(s=>s.exercises.forEach(ex=>{if(ex.isCardio)return;const mx=Math.max(...ex.sets.map(s=>s.reps||0));if(!r[ex.exName]||mx>r[ex.exName])r[ex.exName]=mx;}));return r;}
  function checkNewRecord(n,r){return r>(computeRecords(history)[n]||0);}
  function getChartData(){return getLast30Days().map(day=>{const sessions=history.filter(s=>new Date(s.date).toDateString()===day);let reps=0;sessions.forEach(s=>{if(statsGroup==="all")reps+=s.totalReps||0;else s.exercises.forEach(ex=>{if(ex.group===statsGroup&&!ex.isCardio)reps+=ex.sets.reduce((a,r)=>a+(r.reps||0),0);});});const d=new Date(day);return{reps,label:`${d.getDate()}/${d.getMonth()+1}`};});}
  function getStatsNumbers(){const f=statsGroup==="all"?history:history.filter(s=>s.exercises.some(e=>e.group===statsGroup));const tr=f.reduce((a,s)=>a+(s.totalReps||0),0);return{totalReps:tr,totalSessions:f.length,avgReps:f.length>0?Math.round(tr/f.length):0};}
  function exportCSV(){const lines=["Date,Exercice,Série,Reps,Poids"];history.forEach(s=>s.exercises.forEach(ex=>ex.sets.forEach((set,i)=>lines.push(`"${formatDate(s.date)}","${ex.exName}",${i+1},${set.reps||0},${set.weight||""}`))));const blob=new Blob([lines.join("\n")],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="workout.csv";a.click();}
  function exportJSON(){const blob=new Blob([JSON.stringify(history,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="workout.json";a.click();}

  const curEx=workoutPlan[currentExIdx];
  const curGroupMeta=curEx?getGroupMeta(curEx.group):null;
  const totalRepsDone=workoutPlan.filter(e=>!e.isCardio).reduce((a,ex)=>a+ex.sets.reduce((b,s)=>b+(s.reps||0),0),0);
  const totalExDone=workoutPlan.filter((ex)=>ex.isCardio?ex.sets[0]?.status==="done":ex.sets.every(s=>s.status==="done")).length;
  const progressPct=workoutPlan.length>0?(totalExDone/workoutPlan.length)*100:0;
  const effectiveSteps=hasMuscu?["groups","exercises","config","workout"]:["groups","exercises","workout"];
  const R=96,CIRC=2*Math.PI*R;
  const restPct=restDuration>0?restRemaining/restDuration:0;
  const isWarning=restRemaining<=10;
  const histByDay=history.reduce((acc,s)=>{const day=new Date(s.date).toDateString();if(!acc[day])acc[day]=[];acc[day].push(s);return acc;},{});
  const chartData=getChartData();
  const maxBar=Math.max(...chartData.map(d=>d.reps),1);
  const statsNumbers=getStatsNumbers();
  const records=computeRecords(history);
  const isNewRec=curEx&&!curEx.isCardio&&repInput&&parseInt(repInput)>0&&checkNewRecord(curEx.exName,parseInt(repInput));
  const cardioMin=Math.floor(cardioTimerSeconds/60);
  const cardioSec=cardioTimerSeconds%60;

  if(showRest) return (<>
    <style>{css}</style>
    <div className="rest-overlay">
      <div style={{fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:theme.muted,marginBottom:6}}>Temps de repos</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,marginBottom:28,textAlign:"center"}}>{curEx?.exName}</div>
      <div className="rest-ring-wrap">
        <svg className="rest-ring-svg" width="220" height="220" viewBox="0 0 220 220">
          <circle className="rest-ring-bg" cx="110" cy="110" r={R}/>
          <circle className={`rest-ring-prog${isWarning?" warning":""}`} cx="110" cy="110" r={R} strokeDasharray={CIRC} strokeDashoffset={CIRC*(1-restPct)}/>
        </svg>
        <div className="rest-time-center">
          <div className={`rest-countdown${isWarning?" warning":""}`}>{pad(Math.floor(restRemaining/60))}:{pad(restRemaining%60)}</div>
          <div className="rest-of">/ {pad(Math.floor(restDuration/60))}:{pad(restDuration%60)}</div>
        </div>
      </div>
      <div className="rest-duration-row">
        <div className="rest-duration-label">Durée</div>
        <div className="rest-presets">
          {REST_PRESETS.map(s=><button key={s} className={`rest-preset-btn${restDuration===s?" active-preset":""}`} onClick={()=>changeRestDuration(s)}>{s<60?`${s}s`:`${s/60}min`}</button>)}
        </div>
      </div>
      <div className="rest-controls" style={{marginTop:16}}>
        <button className="rest-ctrl-btn" onClick={()=>setRestPaused(p=>!p)}>{restPaused?"▶ REPRENDRE":"⏸ PAUSE"}</button>
        <button className="rest-ctrl-btn primary" onClick={finishRest}>PASSER →</button>
      </div>
      <button className="rest-skip" onClick={finishRest}>Ignorer</button>
    </div>
  </>);

  if(showHistory) return (<>
    <style>{css}</style>
    <div className="app">
      <div className="header">
        <div><div className="header-label">Musculation</div><div className="header-title">HISTO<br/>RIQUE</div></div>
        <div className="header-actions">
          <button className="icon-btn" onClick={exportCSV}>📥 CSV</button>
          <button className="icon-btn" onClick={exportJSON}>📥 JSON</button>
          <button className="icon-btn active" onClick={()=>setShowHistory(false)}>← Retour</button>
        </div>
      </div>
      {history.length===0?<div className="card"><div className="hist-empty"><div style={{fontSize:40,marginBottom:10}}>📋</div><div>Aucune séance enregistrée.</div></div></div>:(
        <div style={{width:"100%",maxWidth:420}}>
          {Object.entries(histByDay).map(([day,sessions])=>(
            <div key={day} className="hist-day">
              <div className="hist-day-label">{formatDate(sessions[0].date)}</div>
              {sessions.map(session=>{
                const isOpen=openSession===session.id;
                return <div key={session.id} className={`hist-session${isOpen?" open":""}`} onClick={()=>setOpenSession(isOpen?null:session.id)}>
                  <div className="hist-session-top">
                    <div className="hist-session-tags">{session.groups.map(gid=>{const g=getGroupMeta(gid);return g?<span key={gid} className="hist-stag" style={{color:g.color,borderColor:g.color,background:g.color+"15"}}>{g.label}</span>:null;})}</div>
                    <div className="hist-session-meta">
                      <div className="hist-session-time">{formatTime(session.date)}</div>
                      <div className="hist-session-reps">{session.totalReps} reps</div>
                      {session.duration&&<div style={{fontSize:10,color:theme.muted}}>⏱ {formatDuration(session.duration)}</div>}
                    </div>
                  </div>
                  {isOpen&&<div className="hist-detail" onClick={e=>e.stopPropagation()}>
                    {session.note&&<div className="hist-note">📝 {session.note}</div>}
                    {session.exercises.map((ex,i)=><div key={i}>
                      <div className="hist-ex-name">{ex.isCardio?"🏃 ":""}{ex.exName}</div>
                      <div className="hist-sets-row">{ex.isCardio?ex.sets.map((s,si)=><div key={si} className="hist-set-chip">⏱ {s.minutes||0}:{pad(s.seconds||0)}{s.distance?` · ${s.distance}km`:""}{s.bpm?` · ${s.bpm}bpm`:""}</div>):ex.sets.map((s,si)=><div key={si} className="hist-set-chip">S{si+1}: {s.reps}r{s.weight?` · ${s.weight}${weightUnit}`:""}</div>)}</div>
                    </div>)}
                    <button className="del-session-btn" onClick={()=>deleteSession(session.id)}>Supprimer</button>
                  </div>}
                </div>;
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  </>);

  if(showWeekly) return (<>
    <style>{css}</style>
    <div className="app">
      <div className="header">
        <div><div className="header-label">Musculation</div><div className="header-title">PROG<br/>RAMME</div></div>
        <button className="icon-btn active" onClick={()=>setShowWeekly(false)}>← Retour</button>
      </div>
      <div className="card" style={{width:"100%",maxWidth:420}}>
        <div className="section-title">Programme de la semaine</div>
        <div className="weekly-grid">
          {DAYS.map((day,i)=>{const key=DAY_KEYS[i];const groups=weeklyProgram[key]||[];return(
            <div key={key} className="day-col">
              <div className={`day-header${i===todayIdx?" today":""}`}>{day}</div>
              <div className={`day-slot${groups.length>0?" has-groups":""}${i===todayIdx?" is-today":""}`} onClick={()=>setEditingDay(editingDay===key?null:key)}>
                {groups.length>0?groups.map(g=><div key={g} style={{width:16,height:16}}>{MUSCLE_ICONS[g]?.(getGroupMeta(g)?.color,16)}</div>):<span className="day-slot-empty">+</span>}
              </div>
            </div>
          );})}
        </div>
        {editingDay&&<div className="day-edit-panel">
          <div className="day-edit-title">{DAYS[DAY_KEYS.indexOf(editingDay)]} — Groupes musculaires</div>
          <div className="day-group-grid">
            {DEFAULT_MUSCLE_GROUPS.map(g=>{const sel=(weeklyProgram[editingDay]||[]).includes(g.id);return(
              <button key={g.id} className={`day-group-btn${sel?" sel":""}`} style={{"--gc":g.color}} onClick={()=>toggleDayGroup(editingDay,g.id)}>
                {MUSCLE_ICONS[g.id]?.(sel?g.color:"#555",22)}{g.label}
              </button>
            );})}
          </div>
        </div>}
        {(weeklyProgram[DAY_KEYS[todayIdx]]||[]).length>0?(
          <div style={{marginTop:8}}>
            <div style={{fontSize:11,color:theme.muted,textAlign:"center",marginBottom:8}}>Aujourd'hui : {(weeklyProgram[DAY_KEYS[todayIdx]]||[]).map(g=>getGroupMeta(g)?.label).join(" · ")}</div>
            <button className="weekly-start-btn" onClick={startFromWeekly}>LANCER LA SÉANCE DU JOUR →</button>
          </div>
        ):<div style={{textAlign:"center",padding:"12px 0",fontSize:13,color:theme.muted}}>Aucune séance aujourd'hui — clique sur le jour pour en ajouter.</div>}
      </div>
    </div>
  </>);

  return (<>
    <style>{css}</style>

    {showSettings&&<div className="settings-overlay" onClick={()=>setShowSettings(false)}>
      <div className="settings-panel" onClick={e=>e.stopPropagation()}>
        <div className="settings-handle"/>
        <div className="settings-title">⚙️ PARAMÈTRES</div>
        <div className="settings-tabs">
          {[{id:"themes",label:"🎨 Thèmes"},{id:"colors",label:"🖌️ Couleurs"},{id:"wallpaper",label:"🖼️ Fond"},{id:"exercises",label:"💪 Exercices"},{id:"units",label:"⚖️ Unités"},{id:"export",label:"📥 Export"}].map(t=>
            <button key={t.id} className={`stab${settingsTab===t.id?" active":""}`} onClick={()=>setSettingsTab(t.id)}>{t.label}</button>
          )}
        </div>
        {settingsTab==="themes"&&<div>
          <div className="themes-grid">
            {PRESET_THEMES.map(p=><div key={p.id} className={`theme-card${theme.bg===p.bg&&theme.accent===p.accent?" selected-theme":""}`} onClick={()=>applyPreset(p)}>
              <div className="theme-preview" style={{background:p.surface}}>
                <div className="theme-accent-strip" style={{background:p.accent}}/>
                <span className="theme-name" style={{color:p.text}}>{p.name}</span>
              </div>
            </div>)}
          </div>
        </div>}
        {settingsTab==="colors"&&<div>
          {[{key:"bg",label:"Fond de page",desc:"Arrière-plan"},{key:"surface",label:"Cartes",desc:"Blocs"},{key:"accent",label:"Couleur principale",desc:"Boutons actifs"},{key:"accent2",label:"Alerte / Cardio",desc:""},{key:"text",label:"Texte",desc:""},{key:"success",label:"Succès",desc:"Validé"},{key:"muted",label:"Labels",desc:""},{key:"border",label:"Bordures",desc:""}].map(({key,label,desc})=>(
            <div key={key} className="color-row">
              <div><div className="color-label">{label}</div>{desc&&<div className="color-desc">{desc}</div>}</div>
              <input type="color" className="color-picker" value={theme[key]} onChange={e=>updateThemeColor(key,e.target.value)}/>
            </div>
          ))}
          <button className="reset-all-btn" onClick={()=>saveTheme(DEFAULT_THEME)}>Réinitialiser</button>
        </div>}
        {settingsTab==="wallpaper"&&<div>
          <p style={{fontSize:12,color:theme.muted,marginBottom:12,lineHeight:1.6}}>URL d'image directe (ex: imgbb.com)</p>
          <input className="wallpaper-input" placeholder="https://..." value={wallpaperInput} onChange={e=>setWallpaperInput(e.target.value)}/>
          <div className="wallpaper-preview">{wallpaperInput?<img src={wallpaperInput} alt="Aperçu"/>:<span style={{fontSize:12,color:theme.muted}}>Aperçu ici</span>}</div>
          <div className="opacity-row">
            <div className="opacity-label">Opacité</div>
            <input type="range" className="opacity-slider" min="0.05" max="0.6" step="0.05" value={theme.wallpaperOpacity} onChange={e=>saveTheme({...theme,wallpaperOpacity:e.target.value})}/>
            <div className="opacity-val">{Math.round(parseFloat(theme.wallpaperOpacity)*100)}%</div>
          </div>
          <button className="apply-wall-btn" onClick={applyWallpaper}>APPLIQUER</button>
          {theme.wallpaperUrl&&<button className="remove-wall-btn" onClick={removeWallpaper}>Supprimer le fond</button>}
        </div>}
        {settingsTab==="exercises"&&<div>
          {DEFAULT_MUSCLE_GROUPS.map(g=>{const isOpen=editingGroup===g.id;const exList=editableExercises[g.id]||[];return(
            <div key={g.id} className="ex-editor-group">
              <div className="ex-editor-group-header" onClick={()=>setEditingGroup(isOpen?null:g.id)}>
                <div style={{width:22,height:22}}>{MUSCLE_ICONS[g.id]?.(g.color,22)}</div>
                <span className="ex-editor-group-title" style={{color:g.color}}>{g.label}</span>
                <span className="ex-editor-group-count">{exList.length} exercices</span>
                <span style={{color:theme.muted,fontSize:12}}>{isOpen?"▲":"▼"}</span>
              </div>
              {isOpen&&<div className="ex-editor-body">
                {exList.map((name,i)=><div key={i} className="ex-editor-item">
                  <span className="ex-editor-name">{name}</span>
                  <button className="ex-editor-del" onClick={()=>removeExerciseInEditor(g.id,name)}>×</button>
                </div>)}
                <div className="ex-add-row">
                  <input className="ex-add-input" placeholder="Nouvel exercice..." value={editingGroup===g.id?newExInput:""} onChange={e=>setNewExInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addExerciseInEditor(g.id)}/>
                  <button className="ex-add-btn" disabled={!newExInput.trim()} onClick={()=>addExerciseInEditor(g.id)}>+ Ajouter</button>
                </div>
              </div>}
            </div>
          );})}
          <button className="reset-all-btn" onClick={()=>saveExercises(DEFAULT_EXERCISES)}>Réinitialiser</button>
        </div>}
        {settingsTab==="units"&&<div>
          <div className="toggle-row">
            <div className="toggle-label">Afficher le poids</div>
            <label className="toggle"><input type="checkbox" checked={showWeight} onChange={e=>{setShowWeight(e.target.checked);localStorage.setItem("rc-showweight",e.target.checked);}}/><span className="toggle-slider"/></label>
          </div>
          <div style={{fontSize:12,color:theme.muted,marginBottom:10}}>Unité de poids</div>
          <div className="unit-row">{["kg","lbs"].map(u=><button key={u} className={`unit-btn${weightUnit===u?" active":""}`} onClick={()=>{setWeightUnit(u);localStorage.setItem("rc-unit",u);}}>{u}</button>)}</div>
        </div>}
        {settingsTab==="export"&&<div>
          <button className="export-btn" onClick={exportCSV}>📊 Exporter en CSV</button>
          <button className="export-btn" onClick={exportJSON}>🗂️ Exporter en JSON</button>
        </div>}
      </div>
    </div>}

    {showStats&&<div className="stats-overlay" onClick={()=>setShowStats(false)}>
      <div className="stats-panel" onClick={e=>e.stopPropagation()}>
        <div className="settings-handle"/>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,marginBottom:4}}>📊 STATISTIQUES</div>
        <div style={{fontSize:12,color:theme.muted,marginBottom:16}}>30 derniers jours</div>
        <div className="stats-filter">
          <button className={`stats-filter-btn${statsGroup==="all"?" active":""}`} onClick={()=>setStatsGroup("all")}>Tout</button>
          {DEFAULT_MUSCLE_GROUPS.filter(g=>!g.isCardio).map(g=><button key={g.id} className={`stats-filter-btn${statsGroup===g.id?" active":""}`} onClick={()=>setStatsGroup(g.id)}>{g.label}</button>)}
        </div>
        <div className="stats-summary">
          <div className="stat-box"><div className="stat-box-val">{statsNumbers.totalSessions}</div><div className="stat-box-label">Séances</div></div>
          <div className="stat-box"><div className="stat-box-val">{statsNumbers.totalReps}</div><div className="stat-box-label">Reps</div></div>
          <div className="stat-box"><div className="stat-box-val">{statsNumbers.avgReps}</div><div className="stat-box-label">Moy/séance</div></div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:theme.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Reps par jour</div>
          <div className="bar-chart">{chartData.map((d,i)=><div key={i} className="bar-col"><div className="bar" style={{height:`${Math.max((d.reps/maxBar)*80,d.reps>0?6:2)}px`}}/>{i%5===0&&<div className="bar-label">{d.label}</div>}</div>)}</div>
        </div>
        {Object.keys(records).length>0&&<>
          <div style={{fontSize:11,color:theme.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>🏅 Records personnels</div>
          {Object.entries(records).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,best])=><div key={name} className="record-item">
            <span style={{fontSize:18}}>🥇</span>
            <div className="record-info"><div className="record-name">{name}</div><div className="record-val">Meilleure série</div></div>
            <div className="record-best">{best} reps</div>
          </div>)}
        </>}
      </div>
    </div>}

    <div className="app">
      <div className="header">
        <div><div className="header-label">Musculation</div><div className="header-title">REP<br/>COUNTER</div></div>
        <div className="header-actions">
          <button className="icon-btn" onClick={()=>setShowWeekly(true)}><span>📅</span>Programme</button>
          <button className="icon-btn" onClick={()=>setShowHistory(true)}><span>📋</span>{history.length>0?`(${history.length})`:"Historique"}</button>
          <button className="icon-btn" onClick={()=>setShowStats(true)}><span>📊</span>Stats</button>
          <button className={`icon-btn${showSettings?" active":""}`} onClick={()=>setShowSettings(s=>!s)}><span>⚙️</span>Réglages</button>
        </div>
      </div>

      {step==="workout"&&<>
        <div className="session-timer"><span>⏱️</span><span className="timer-label">Durée de la séance</span><span className="timer-val">{formatDuration(sessionSeconds)}</span></div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-label"><span>Progression</span><span>{totalExDone}/{workoutPlan.length} exercices</span></div>
          <div className="progress-bar-track"><div className="progress-bar-fill" style={{width:`${progressPct}%`}}/></div>
        </div>
      </>}

      {step!=="done"&&<div className="step-nav">
        {effectiveSteps.map((s,i)=>{const curr=effectiveSteps.indexOf(step);return<div key={s} className={`step-pip${i===curr?" active-pip":i<curr?" done-pip":""}`}/>;  })}
      </div>}

      {step==="groups"&&<div className="card">
        <div className="section-title">Zones musculaires · choix libre</div>
        <div className="group-grid">
          {DEFAULT_MUSCLE_GROUPS.map(g=><button key={g.id} className={`group-btn${selectedGroups.includes(g.id)?" selected":""}`} style={{"--gc":g.color}} onClick={()=>toggleGroup(g.id)}>
            {MUSCLE_ICONS[g.id]?.(selectedGroups.includes(g.id)?g.color:"#555",28)}{g.label}
          </button>)}
        </div>
        {selectedGroups.length>0&&<div className="tag-row">{selectedGroups.map(id=>{const g=getGroupMeta(id);return<span key={id} className="tag" style={{color:g.color,borderColor:g.color,background:g.color+"15"}}>{g.label}</span>;})}</div>}
        <p className="group-hint">{selectedGroups.length===0?"Sélectionne une ou plusieurs zones":<><span style={{color:theme.accent}}>{selectedGroups.length}</span> zone{selectedGroups.length>1?"s":""} sélectionnée{selectedGroups.length>1?"s":""}</>}</p>
        <button className="start-btn" disabled={selectedGroups.length===0} onClick={()=>setStep("exercises")}>CHOISIR LES EXERCICES →</button>
      </div>}

      {step==="exercises"&&<>
        <div className="card">
          <div className="section-title">Exercices · {selectedExercises.length} sélectionné{selectedExercises.length>1?"s":""}</div>
          {selectedGroups.map((groupId,gi)=>{
            const g=getGroupMeta(groupId);
            const allEx=[...(editableExercises[groupId]||[]).map(n=>({name:n,isCustom:false})),...(customExercises[groupId]||[]).map(n=>({name:n,isCustom:true}))];
            return <div key={groupId} style={{marginBottom:gi<selectedGroups.length-1?20:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                {MUSCLE_ICONS[groupId]?.(g.color,20)}
                <span style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",color:g.color}}>{g.label}</span>
                {g.isCardio&&<span style={{fontSize:10,background:g.color+"20",color:g.color,borderRadius:4,padding:"2px 6px",border:`1px solid ${g.color}40`}}>CARDIO</span>}
              </div>
              <div className="ex-list">
                {allEx.map(({name,isCustom})=>{
                  const isSel=selectedExercises.some(e=>e.name===name&&e.group===groupId);
                  return <div key={name} className={`ex-item${isSel?" selected":""}`} onClick={()=>toggleExercise({name,group:groupId})}>
                    <div className="ex-item-dot"/>
                    <div className="ex-item-label">{name}</div>
                    {isCustom&&<button className="ex-item-del" onClick={e=>{e.stopPropagation();deleteCustomExercise(groupId,name);}}>×</button>}
                  </div>;
                })}
              </div>
            </div>;
          })}
          <hr style={{border:"none",borderTop:`1px solid ${theme.border}`,margin:"14px 0"}}/>
          <div style={{fontSize:10,color:theme.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Ajouter un exercice temporaire</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {selectedGroups.map(gid=>{const g=getGroupMeta(gid);return <button key={gid} onClick={()=>setCustomGroup(gid)} style={{background:customGroup===gid?g.color+"20":"transparent",border:`1px solid ${customGroup===gid?g.color:theme.border}`,borderRadius:6,padding:"4px 10px",color:customGroup===gid?g.color:theme.muted,fontSize:12,cursor:"pointer"}}>{g.label}</button>;})}
          </div>
          <div className="add-custom-row">
            <input className="custom-input" placeholder="Nom de l'exercice…" value={customInput} onChange={e=>setCustomInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustomExercise()}/>
            <button className="add-btn" onClick={addCustomExercise} disabled={!customInput.trim()||!customGroup}>+ AJOUTER</button>
          </div>
        </div>
        <div style={{display:"flex",gap:10,width:"100%",maxWidth:420}}>
          <button className="reset-btn" style={{flex:1}} onClick={()=>setStep("groups")}>← Retour</button>
          <button className="start-btn" style={{flex:3,marginTop:0}} disabled={selectedExercises.length===0} onClick={()=>{if(!hasMuscu)startWorkout();else setStep("config");}}>
            {hasMuscu?`CONFIGURER (${selectedExercises.length}) →`:`LANCER (${selectedExercises.length}) →`}
          </button>
        </div>
      </>}

      {step==="config"&&<>
        <div className="card">
          <div className="section-title">Configuration — Musculation</div>
          <div className="config-row">
            <div className="config-label">Séries par exercice</div>
            <div className="stepper"><button className="stepper-btn" onClick={()=>setTotalSets(s=>Math.max(1,s-1))}>−</button><div className="stepper-val">{totalSets}</div><button className="stepper-btn" onClick={()=>setTotalSets(s=>Math.min(10,s+1))}>+</button></div>
          </div>
          <div className="config-row">
            <div className="config-label">Reps cibles</div>
            <div className="stepper"><button className="stepper-btn" onClick={()=>setTargetReps(r=>Math.max(1,r-1))}>−</button><div className="stepper-val">{targetReps}</div><button className="stepper-btn" onClick={()=>setTargetReps(r=>Math.min(50,r+1))}>+</button></div>
          </div>
          <div className="config-row" style={{marginBottom:0}}>
            <div className="config-label">Repos entre séries</div>
            <div style={{display:"flex",gap:6}}>
              {REST_PRESETS.map(s=><button key={s} onClick={()=>setRestDuration(s)} style={{background:restDuration===s?theme.accent:"transparent",border:`1px solid ${restDuration===s?theme.accent:theme.border}`,borderRadius:6,padding:"6px 10px",color:restDuration===s?"#0a0a0a":theme.muted,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>{s<60?`${s}s`:`${s/60}min`}</button>)}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="section-title">Programme de la séance</div>
          <div className="plan-list">
            {selectedExercises.map((ex,i)=>{const g=getGroupMeta(ex.group);const isC=isCardioGroup(ex.group);return(
              <div key={i} className="plan-item">
                <div className="plan-idx">{i+1}</div>
                <div style={{marginRight:6}}>{MUSCLE_ICONS[ex.group]?.(g.color,18)}</div>
                <div className="plan-info"><div className="plan-name">{ex.name}</div><div className="plan-detail" style={{color:g.color}}>{g.label} {isC?"· Cardio":`· ${totalSets}×${targetReps}`}</div></div>
              </div>
            );})}
          </div>
        </div>
        <div style={{display:"flex",gap:10,width:"100%",maxWidth:420}}>
          <button className="reset-btn" style={{flex:1}} onClick={()=>setStep("exercises")}>← Retour</button>
          <button className="start-btn" style={{flex:3,marginTop:0}} onClick={startWorkout}>LANCER LA SÉANCE →</button>
        </div>
      </>}

      {step==="workout"&&curEx&&<>
        <div className="card">
          <div className="workout-ex-header">
            <div className="workout-ex-label">Exercice {currentExIdx+1} / {workoutPlan.length}</div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
              {MUSCLE_ICONS[curEx.group]?.(curGroupMeta?.color,24)}
              <div className="workout-ex-name">{curEx.exName}</div>
            </div>
            <div style={{fontSize:12,color:curGroupMeta?.color,marginTop:2}}>{curGroupMeta?.label}{curEx.isCardio?" · Cardio":""}</div>
          </div>

          {curEx.isCardio?<div className="cardio-live">
            <div className={`cardio-timer-display${cardioTimerActive?" running":""}`}>{pad(cardioMin)}:{pad(cardioSec)}</div>
            <div className="cardio-controls">
              <button className={`cardio-ctrl-btn ${cardioTimerActive?"pause-c":"start-c"}`} onClick={()=>setCardioTimerActive(a=>!a)}>{cardioTimerActive?"⏸ PAUSE":"▶ START"}</button>
              <button className="cardio-ctrl-btn reset-c" onClick={()=>{setCardioTimerActive(false);setCardioTimerSeconds(0);}}>↺ Reset</button>
            </div>
            <div className="cardio-extra-fields">
              <div className="cardio-field-row">
                <div className="cardio-field-label">📍 Distance</div>
                <input className="cardio-field-input" type="number" placeholder="0.0" step="0.1" min="0" value={cardioDistance} onChange={e=>setCardioDistance(e.target.value)}/>
                <span className="cardio-field-unit">km</span>
              </div>
              <div className="cardio-field-row">
                <div className="cardio-field-label">❤️ BPM max</div>
                <input className="cardio-bpm-input" type="number" placeholder="—" min="0" max="250" value={cardioBpm} onChange={e=>setCardioBpm(e.target.value)}/>
                <span className="cardio-field-unit">bpm</span>
              </div>
            </div>
            <button className="validate-cardio-btn" onClick={validateCardio} disabled={cardioTimerSeconds===0&&!cardioDistance}>✓ TERMINER LA SESSION CARDIO</button>
          </div>:<>
            <div className="set-track">
              {curEx.sets.map((s,i)=><div key={i} className="set-bubble">
                <div className={`set-bubble-dot${s.status==="done"?" done":s.status==="active"?" active":""}`}/>
                <div className={`set-bubble-reps${s.reps!==null?" filled":""}`}>{s.reps!==null?`${s.reps}r`+(s.weight?` ${s.weight}${weightUnit}`:""):i===currentSetIdx?"…":""}</div>
              </div>)}
            </div>
            <div className="go-zone">
              <div className="go-label">Série en cours</div>
              <div className="go-serie-num">{currentSetIdx+1}<span style={{fontSize:32,color:theme.muted}}>/{totalSets}</span></div>
              <div className="go-target">Objectif : <span>{targetReps} reps</span></div>
            </div>
            {showWeight&&<div className="weight-row">
              <div className="weight-label">Poids utilisé (optionnel)</div>
              <input className="weight-input" type="number" placeholder="—" step="0.5" min="0" value={weightInput} onChange={e=>setWeightInput(e.target.value)}/>
              <span className="weight-unit">{weightUnit}</span>
            </div>}
            {isNewRec&&<div style={{display:"flex",justifyContent:"center",marginBottom:8}}><div className="record-badge">🏅 NOUVEAU RECORD !</div></div>}
            <div className="rep-entry-label">Reps effectuées</div>
            <div className="quick-reps">
              {QUICK_REPS.map(n=><button key={n} className={`qrep-btn${repInput===String(n)?" selected-qrep":""}`} onClick={()=>setRepInput(String(n))}>{n}</button>)}
            </div>
            <div className={`rep-display-val${repInput?" has-val":""}`}>{repInput||"—"}</div>
            <div className="rep-numpad">
              {["1","2","3","4","5","6","7","8","9"].map(n=><button key={n} className="np-btn" onClick={()=>numpadPress(n)}>{n}</button>)}
              <button className="np-btn zero" onClick={()=>numpadPress("0")}>0</button>
              <button className="np-btn del" onClick={()=>numpadPress("del")}>⌫</button>
            </div>
            <button className={`validate-btn${validateFlash?" flash":""}`} onClick={validateSet} disabled={!repInput||parseInt(repInput)===0}>✓ VALIDER · LANCER LE REPOS</button>
          </>}
        </div>
        <div className="card">
          <div className="section-title">Programme</div>
          <div className="plan-list">
            {workoutPlan.map((ex,ei)=>{
              const doneSets=ex.sets.filter(s=>s.status==="done").length;
              const isActive=ei===currentExIdx,isDone=doneSets===(ex.isCardio?1:totalSets);
              const g=getGroupMeta(ex.group);
              return <div key={ei} className={`plan-item${isActive?" active-plan":isDone?" done-plan":""}`}>
                <div className="plan-idx">{ei+1}</div>
                <div style={{marginRight:4}}>{MUSCLE_ICONS[ex.group]?.(g.color,16)}</div>
                <div className="plan-info"><div className="plan-name">{ex.exName}</div><div className="plan-detail">{ex.isCardio?"Cardio":`${doneSets}/${totalSets} séries`}</div></div>
                <div className={`plan-status${isDone?" done":isActive?" active":" pending"}`}>{isDone?"✓ OK":isActive?"EN COURS":"—"}</div>
              </div>;
            })}
          </div>
          <div style={{display:"flex",justifyContent:"center",marginTop:12}}><button className="reset-btn" onClick={reset}>Abandonner</button></div>
        </div>
      </>}

      {step==="done"&&<div className="card"><div className="done-screen">
        <div className="done-emoji">🏆</div>
        <div className="done-title">SÉANCE TERMINÉE !</div>
        <div className="done-sub">{selectedGroups.map(id=>getGroupMeta(id)?.label).join(" · ")}<br/>Séance enregistrée ✓</div>
        <div className="done-stats">
          <div className="done-stat"><div className="done-stat-val">{workoutPlan.length}</div><div className="done-stat-label">Exercices</div></div>
          <div className="done-stat"><div className="done-stat-val">{totalSets*workoutPlan.filter(e=>!e.isCardio).length}</div><div className="done-stat-label">Séries</div></div>
          <div className="done-stat"><div className="done-stat-val">{totalRepsDone}</div><div className="done-stat-label">Reps</div></div>
          <div className="done-stat"><div className="done-stat-val">{formatDuration(sessionSeconds)}</div><div className="done-stat-label">Durée</div></div>
        </div>
        <div style={{width:"100%",textAlign:"left"}}>
          <div style={{fontSize:11,color:theme.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>📝 Note de séance</div>
          <textarea className="note-area" placeholder="Comment s'est passée la séance ?..." value={sessionNote} onChange={e=>{setSessionNote(e.target.value);saveNoteToSession(e.target.value);}}/>
        </div>
        <div style={{width:"100%",marginTop:4,display:"flex",flexDirection:"column",gap:6}}>
          {workoutPlan.map((ex,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,padding:"4px 0",borderBottom:`1px solid ${theme.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>{MUSCLE_ICONS[ex.group]?.(getGroupMeta(ex.group)?.color,14)}<span>{ex.exName}</span></div>
            {ex.isCardio?<span style={{color:theme.accent2,fontSize:12}}>{ex.sets[0]?.minutes||0}:{pad(ex.sets[0]?.seconds||0)}{ex.sets[0]?.distance?` · ${ex.sets[0].distance}km`:""}{ex.sets[0]?.bpm?` · ${ex.sets[0].bpm}bpm`:""}</span>:<span style={{color:theme.success}}>{ex.sets.reduce((a,s)=>a+(s.reps||0),0)} reps{ex.sets.some(s=>s.weight)?` · ${ex.sets.filter(s=>s.weight).map(s=>`${s.weight}${weightUnit}`).join(", ")}`:""}</span>}
          </div>)}
        </div>
        <div style={{display:"flex",gap:10,width:"100%",marginTop:8}}>
          <button className="reset-btn" style={{flex:1}} onClick={()=>{setShowHistory(true);reset();}}>📋 Historique</button>
          <button className="validate-btn" style={{flex:2,border:`2px solid ${theme.accent}`,color:theme.accent}} onClick={reset}>NOUVELLE SÉANCE</button>
        </div>
      </div></div>}
    </div>
  </>);
}
