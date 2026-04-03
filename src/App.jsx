import { useState, useEffect, useRef } from "react";

const EXERCISES = [
  "Développé couché",
  "Squat",
  "Soulevé de terre",
  "Tractions",
  "Dips",
  "Curl biceps",
  "Extensions triceps",
  "Presse à cuisse",
  "Rowing barre",
  "Élévations latérales",
];

const DEFAULT_REST = 90;

export default function App() {
  const [screen, setScreen] = useState("home");
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("rep_sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSession, setCurrentSession] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
  const [sets, setSets] = useState([]);
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [restTime, setRestTime] = useState(DEFAULT_REST);
  const [timer, setTimer] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("rep_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (timerActive && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive, timer]);

  const startSession = () => {
    const session = {
      id: Date.now(),
      date: new Date().toLocaleDateString("fr-FR"),
      exercises: [],
    };
    setCurrentSession(session);
    setSets([]);
    setScreen("session");
  };

  const addSet = () => {
    if (!reps) return;
    const newSet = {
      exercise: selectedExercise,
      reps: parseInt(reps),
      weight: weight ? parseFloat(weight) : null,
    };
    setSets((prev) => [...prev, newSet]);
    setReps("");
    setTimer(restTime);
    setTimerActive(true);
  };

  const finishSession = () => {
    if (sets.length === 0) {
      setScreen("home");
      return;
    }
    const grouped = {};
    sets.forEach((s) => {
      if (!grouped[s.exercise]) grouped[s.exercise] = [];
      grouped[s.exercise].push({ reps: s.reps, weight: s.weight });
    });
    const finished = {
      ...currentSession,
      exercises: Object.entries(grouped).map(([name, data]) => ({
        name,
        sets: data,
      })),
    };
    setSessions((prev) => [finished, ...prev]);
    setCurrentSession(null);
    setSets([]);
    setTimerActive(false);
    clearInterval(intervalRef.current);
    setScreen("home");
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const styles = {
    app: {
      fontFamily: "system-ui, sans-serif",
      maxWidth: 430,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#0f0f0f",
      color: "#fff",
      paddingBottom: 40,
    },
    header: {
      background: "#1a1a2e",
      padding: "20px 16px",
      textAlign: "center",
      fontSize: 22,
      fontWeight: "bold",
      color: "#e94560",
      letterSpacing: 1,
    },
    btn: {
      background: "#e94560",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      padding: "14px 28px",
      fontSize: 16,
      fontWeight: "bold",
      cursor: "pointer",
      width: "100%",
      marginTop: 12,
    },
    btnGray: {
      background: "#2a2a2a",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      padding: "12px 28px",
      fontSize: 15,
      cursor: "pointer",
      width: "100%",
      marginTop: 8,
    },
    input: {
      background: "#1e1e1e",
      border: "1px solid #333",
      borderRadius: 10,
      color: "#fff",
      padding: "12px 14px",
      fontSize: 16,
      width: "100%",
      boxSizing: "border-box",
      marginTop: 8,
    },
    card: {
      background: "#1a1a1a",
      borderRadius: 14,
      padding: 16,
      margin: "12px 16px",
    },
    label: { fontSize: 13, color: "#888", marginTop: 14, display: "block" },
    timer: {
      textAlign: "center",
      fontSize: 48,
      fontWeight: "bold",
      color: timerActive ? "#e94560" : "#333",
      margin: "16px 0",
    },
    setItem: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid #222",
      fontSize: 14,
    },
  };

  // HOME
  if (screen === "home") {
    return (
      <div style={styles.app}>
        <div style={styles.header}>💪 Rep Counter</div>
        <div style={{ padding: 16 }}>
          <button style={styles.btn} onClick={startSession}>
            ＋ Nouvelle séance
          </button>
          <button style={styles.btnGray} onClick={() => setScreen("history")}>
            📋 Historique
          </button>
        </div>
        {sessions.length > 0 && (
          <div style={styles.card}>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
              DERNIÈRE SÉANCE
            </div>
            <div style={{ fontWeight: "bold" }}>{sessions[0].date}</div>
            {sessions[0].exercises.map((e, i) => (
              <div key={i} style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>
                {e.name} — {e.sets.length} série(s)
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // SESSION
  if (screen === "session") {
    return (
      <div style={styles.app}>
        <div style={styles.header}>🏋️ Séance en cours</div>
        <div style={{ padding: 16 }}>
          <span style={styles.label}>Exercice</span>
          <select
            style={styles.input}
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {EXERCISES.map((ex) => (
              <option key={ex}>{ex}</option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <div style={{ flex: 1 }}>
              <span style={styles.label}>Répétitions</span>
              <input
                style={styles.input}
                type="number"
                placeholder="ex: 10"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={styles.label}>Poids (kg)</span>
              <input
                style={styles.input}
                type="number"
                placeholder="optionnel"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <button style={styles.btn} onClick={addSet}>
            ✅ Valider la série
          </button>

          <div style={styles.timer}>
            {timerActive || timer > 0 ? formatTime(timer) : "—"}
          </div>
          {timerActive && (
            <div style={{ textAlign: "center", color: "#888", fontSize: 13 }}>
              Temps de repos
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            {sets.map((s, i) => (
              <div key={i} style={styles.setItem}>
                <span>{s.exercise}</span>
                <span>
                  {s.reps} reps {s.weight ? `· ${s.weight} kg` : ""}
                </span>
              </div>
            ))}
          </div>

          <button style={{ ...styles.btnGray, marginTop: 24 }} onClick={finishSession}>
            🏁 Terminer la séance
          </button>
        </div>
      </div>
    );
  }

  // HISTORY
  if (screen === "history") {
    return (
      <div style={styles.app}>
        <div style={styles.header}>📋 Historique</div>
        <div style={{ padding: 16 }}>
          <button style={styles.btnGray} onClick={() => setScreen("home")}>
            ← Retour
          </button>
          {sessions.length === 0 && (
            <div style={{ color: "#555", textAlign: "center", marginTop: 40 }}>
              Aucune séance enregistrée
            </div>
          )}
          {sessions.map((s) => (
            <div key={s.id} style={styles.card}>
              <div style={{ fontWeight: "bold", marginBottom: 8 }}>{s.date}</div>
              {s.exercises.map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ color: "#e94560", fontSize: 14 }}>{e.name}</div>
                  {e.sets.map((set, j) => (
                    <div key={j} style={{ fontSize: 13, color: "#aaa" }}>
                      Série {j + 1} : {set.reps} reps{" "}
                      {set.weight ? `· ${set.weight} kg` : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}