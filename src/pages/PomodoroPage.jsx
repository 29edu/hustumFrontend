import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaCog,
  FaPlus,
  FaCheck,
  FaTrash,
  FaTimes,
  FaFire,
  FaClock,
  FaChartBar,
  FaVolumeUp,
  FaVolumeMute,
  FaKeyboard,
  FaLeaf,
  FaBolt,
  FaCoffee,
} from "react-icons/fa";

/* ─── Constants ─────────────────────────────────────── */
const MODES = {
  focus: {
    label: "Focus",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    minutes: 25,
  },
  short: {
    label: "Short Break",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    minutes: 5,
  },
  long: {
    label: "Long Break",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    minutes: 15,
  },
};
const SESSIONS_BEFORE_LONG = 4;

/* ─── Audio helpers (Web Audio API — no deps) ────── */
const createAudioCtx = () =>
  new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq = 880, duration = 0.25, type = "sine", volume = 0.35) {
  try {
    const ctx = createAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    void e;
  }
}

function playSessionEnd() {
  playTone(880, 0.18, "sine", 0.4);
  setTimeout(() => playTone(1100, 0.18, "sine", 0.35), 200);
  setTimeout(() => playTone(1320, 0.3, "sine", 0.3), 400);
}

function playTick() {
  playTone(600, 0.04, "triangle", 0.12);
}

/* ─── SVG Ring ───────────────────────────────────── */
const RADIUS = 110;
const CIRC = 2 * Math.PI * RADIUS;

const Ring = ({ progress, color }) => {
  const stroke = CIRC * (1 - progress);
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 280 280"
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* Track */}
      <circle
        cx="140"
        cy="140"
        r={RADIUS}
        fill="none"
        stroke="var(--border)"
        strokeWidth="10"
      />
      {/* Progress */}
      <circle
        cx="140"
        cy="140"
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={CIRC}
        strokeDashoffset={stroke}
        style={{
          transition: "stroke-dashoffset 0.5s ease, stroke 0.4s ease",
          filter: `drop-shadow(0 0 8px ${color}66)`,
        }}
      />
    </svg>
  );
};

/* ─── Settings Modal ──────────────────────────────── */
const SettingsModal = ({ settings, onSave, onClose }) => {
  const [local, setLocal] = useState({ ...settings });
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-5 shadow-2xl mx-4"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            <FaCog className="inline mr-2 text-indigo-400" size={16} />
            Timer Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg"
            style={{ color: "var(--text-muted)" }}
          >
            <FaTimes size={14} />
          </button>
        </div>

        {[
          {
            key: "focusMinutes",
            label: "Focus Duration",
            icon: <FaBolt size={13} className="text-red-400" />,
            min: 1,
            max: 90,
          },
          {
            key: "shortMinutes",
            label: "Short Break",
            icon: <FaLeaf size={13} className="text-emerald-400" />,
            min: 1,
            max: 30,
          },
          {
            key: "longMinutes",
            label: "Long Break",
            icon: <FaCoffee size={13} className="text-indigo-400" />,
            min: 5,
            max: 60,
          },
          {
            key: "longBreakAfter",
            label: "Sessions before Long Break",
            icon: <FaFire size={13} className="text-orange-400" />,
            min: 2,
            max: 8,
          },
        ].map(({ key, label, icon, min, max }) => (
          <div key={key} className="mb-4">
            <label
              className="flex items-center gap-2 text-sm font-semibold mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {icon}
              {label}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={min}
                max={max}
                value={local[key]}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, [key]: +e.target.value }))
                }
                className="flex-1 accent-indigo-500"
              />
              <span
                className="w-10 text-center text-sm font-bold rounded-lg px-1 py-0.5"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--text-primary)",
                }}
              >
                {local[key]}
              </span>
            </div>
          </div>
        ))}

        <div
          className="flex items-center justify-between mb-5 p-3 rounded-xl"
          style={{ backgroundColor: "var(--bg-subtle)" }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Auto-start next session
          </span>
          <button
            onClick={() => setLocal((p) => ({ ...p, autoStart: !p.autoStart }))}
            className="w-11 h-6 rounded-full relative transition-all"
            style={{
              backgroundColor: local.autoStart
                ? "#6366f1"
                : "var(--border-strong)",
            }}
          >
            <span
              className="absolute top-0.5 rounded-full bg-white w-5 h-5 shadow transition-all"
              style={{ left: local.autoStart ? "calc(100% - 22px)" : "2px" }}
            />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(local);
              onClose();
            }}
            className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────── */
const PomodoroPage = () => {
  /* Settings */
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pomodoroSettings")) || {};
    } catch {
      return {};
    }
  });
  const mergedSettings = useMemo(
    () => ({
      focusMinutes: 25,
      shortMinutes: 5,
      longMinutes: 15,
      longBreakAfter: 4,
      autoStart: false,
      ...settings,
    }),
    [settings],
  );

  /* Timer state */
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(mergedSettings.focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0); // focus sessions done
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tickEnabled, setTickEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [flashRing, setFlashRing] = useState(false);

  /* Tasks */
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pomodoroTasks")) || [];
    } catch {
      return [];
    }
  });
  const [taskInput, setTaskInput] = useState("");
  const [activeTaskId, setActiveTaskId] = useState(null);

  /* History */
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pomodoroHistory")) || [];
    } catch {
      return [];
    }
  });

  /* Tab */
  const [tab, setTab] = useState("timer"); // "timer" | "tasks" | "stats"

  const intervalRef = useRef(null);
  const totalForMode = useCallback(
    (m) => {
      if (m === "focus") return mergedSettings.focusMinutes * 60;
      if (m === "short") return mergedSettings.shortMinutes * 60;
      return mergedSettings.longMinutes * 60;
    },
    [
      mergedSettings.focusMinutes,
      mergedSettings.shortMinutes,
      mergedSettings.longMinutes,
    ],
  );

  /* Persist tasks & history */
  useEffect(() => {
    localStorage.setItem("pomodoroTasks", JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem("pomodoroHistory", JSON.stringify(history));
  }, [history]);

  /* Timer tick */
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (tickEnabled && soundEnabled) playTick();
          if (t <= 1) {
            clearInterval(intervalRef.current);
            handleSessionEnd();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, tickEnabled, soundEnabled]);

  const handleSessionEnd = useCallback(() => {
    if (soundEnabled) playSessionEnd();

    // Flash ring
    setFlashRing(true);
    setTimeout(() => setFlashRing(false), 1200);

    if (mode === "focus") {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      // Log history
      const entry = {
        id: Date.now(),
        type: "focus",
        duration: mergedSettings.focusMinutes,
        task: tasks.find((t) => t.id === activeTaskId)?.text || null,
        at: new Date().toISOString(),
      };
      setHistory((h) => [entry, ...h].slice(0, 50));

      // Decide next mode
      const goLong = newCount % mergedSettings.longBreakAfter === 0;
      const nextMode = goLong ? "long" : "short";
      setMode(nextMode);
      const nextTime = goLong
        ? mergedSettings.longMinutes * 60
        : mergedSettings.shortMinutes * 60;
      setTimeLeft(nextTime);
      setRunning(mergedSettings.autoStart);
    } else {
      setMode("focus");
      setTimeLeft(mergedSettings.focusMinutes * 60);
      setRunning(mergedSettings.autoStart);
    }
  }, [mode, sessionCount, mergedSettings, tasks, activeTaskId, soundEnabled]);

  const toggleRunning = () => setRunning((r) => !r);

  const resetTimer = () => {
    setRunning(false);
    setTimeLeft(totalForMode(mode));
  };

  const switchMode = (m) => {
    setRunning(false);
    setMode(m);
    setTimeLeft(totalForMode(m));
  };

  const handleSaveSettings = (s) => {
    setSettings(s);
    localStorage.setItem("pomodoroSettings", JSON.stringify(s));
    setRunning(false);
    setMode("focus");
    setTimeLeft(s.focusMinutes * 60);
  };

  /* Keyboard shortcut */
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        toggleRunning();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Derived */
  const total = totalForMode(mode);
  const progress = (total - timeLeft) / total;
  const modeInfo = { ...MODES[mode], color: MODES[mode].color };
  modeInfo.color =
    mode === "focus" ? "#ef4444" : mode === "short" ? "#10b981" : "#6366f1";

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const todayHistory = history.filter((h) => {
    const d = new Date(h.at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const todayFocusMins = todayHistory.reduce(
    (a, h) => a + (h.type === "focus" ? h.duration : 0),
    0,
  );
  const streak = (() => {
    const days = new Set(history.map((h) => new Date(h.at).toDateString()));
    let s = 0;
    const cur = new Date();
    while (days.has(cur.toDateString())) {
      s++;
      cur.setDate(cur.getDate() - 1);
    }
    return s;
  })();

  const pendingTasks = tasks.filter((t) => !t.done);
  const doneTasks = tasks.filter((t) => t.done);

  const addTask = () => {
    const text = taskInput.trim();
    if (!text) return;
    setTasks((p) => [
      ...p,
      {
        id: Date.now(),
        text,
        done: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setTaskInput("");
  };

  const toggleTask = (id) =>
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const deleteTask = (id) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };
  const clearDone = () => setTasks((p) => p.filter((t) => !t.done));

  /* Tab button */
  const TabBtn = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setTab(id)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
      style={{
        backgroundColor: tab === id ? modeInfo.color : "transparent",
        color: tab === id ? "#fff" : "var(--text-muted)",
        border: tab === id ? "none" : "1px solid transparent",
      }}
    >
      <Icon size={12} />
      {label}
    </button>
  );

  /* Mode chip */
  const ModeChip = ({ id }) => {
    const info = MODES[id];
    const active = mode === id;
    return (
      <button
        onClick={() => switchMode(id)}
        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
        style={{
          backgroundColor: active ? modeInfo.color : "var(--bg-subtle)",
          color: active ? "#fff" : "var(--text-muted)",
          boxShadow: active ? `0 0 12px ${modeInfo.color}55` : "none",
        }}
      >
        {info.label}
      </button>
    );
  };

  /* Stat card */
  const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <div
      className="flex flex-col gap-1 p-4 rounded-2xl"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-faint)" }}
        >
          {label}
        </span>
      </div>
      <span
        className="text-2xl font-extrabold"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {sub}
        </span>
      )}
    </div>
  );

  return (
    <div
      className="min-h-full p-4 md:p-8"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <div className="min-w-0">
            <h1
              className="text-xl sm:text-2xl font-extrabold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              🍅 Pomodoro
            </h1>
            <p
              className="text-xs sm:text-sm mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Deep focus, one session at a time
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tick sound toggle */}
            <button
              onClick={() => setTickEnabled((t) => !t)}
              title={tickEnabled ? "Disable tick sound" : "Enable tick sound"}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: tickEnabled
                  ? `${modeInfo.color}20`
                  : "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: tickEnabled ? modeInfo.color : "var(--text-muted)",
              }}
            >
              <FaClock size={12} />
            </button>
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled((s) => !s)}
              title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: soundEnabled
                  ? `${modeInfo.color}20`
                  : "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: soundEnabled ? modeInfo.color : "var(--text-muted)",
              }}
            >
              {soundEnabled ? (
                <FaVolumeUp size={12} />
              ) : (
                <FaVolumeMute size={12} />
              )}
            </button>
            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              <FaCog size={13} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-6 overflow-x-auto"
          style={{
            backgroundColor: "var(--bg-subtle)",
            width: "fit-content",
            maxWidth: "100%",
          }}
        >
          <TabBtn id="timer" label="Timer" icon={FaClock} />
          <TabBtn id="tasks" label="Tasks" icon={FaCheck} />
          <TabBtn id="stats" label="Stats" icon={FaChartBar} />
        </div>

        {/* ── TIMER TAB ───────── */}
        {tab === "timer" && (
          <div className="flex flex-col items-center gap-5">
            {/* Mode chips */}
            <div className="flex gap-2 flex-wrap justify-center">
              <ModeChip id="focus" />
              <ModeChip id="short" />
              <ModeChip id="long" />
            </div>

            {/* Ring + time */}
            <div
              className="relative flex items-center justify-center"
              style={{ width: "min(280px, 80vw)", height: "min(280px, 80vw)" }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: modeInfo.bg,
                  transition: "background 0.4s",
                }}
              />
              <Ring
                progress={progress}
                color={flashRing ? "#f59e0b" : modeInfo.color}
              />
              <div className="absolute flex flex-col items-center gap-1 px-2">
                {/* Active task label */}
                {activeTaskId && (
                  <span
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full mb-1 max-w-30 truncate block text-center"
                    style={{
                      backgroundColor: `${modeInfo.color}20`,
                      color: modeInfo.color,
                    }}
                  >
                    {tasks.find((t) => t.id === activeTaskId)?.text}
                  </span>
                )}
                <span
                  className="text-5xl sm:text-6xl font-extrabold tabular-nums tracking-tighter"
                  style={{
                    color: "var(--text-primary)",
                    textShadow: running
                      ? `0 0 24px ${modeInfo.color}55`
                      : "none",
                  }}
                >
                  {mins}:{secs}
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: modeInfo.color }}
                >
                  {MODES[mode].label}
                </span>
                {/* Session dots */}
                <div className="flex gap-1.5 mt-2">
                  {Array.from({ length: mergedSettings.longBreakAfter }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full transition-all"
                        style={{
                          backgroundColor:
                            i < sessionCount % mergedSettings.longBreakAfter
                              ? modeInfo.color
                              : "var(--border-strong)",
                          transform:
                            i < sessionCount % mergedSettings.longBreakAfter
                              ? "scale(1.2)"
                              : "scale(1)",
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Reset */}
              <button
                onClick={resetTimer}
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
                title="Reset"
              >
                <FaRedo size={15} />
              </button>

              {/* Play/Pause */}
              <button
                onClick={toggleRunning}
                className="w-20 h-20 rounded-full flex items-center justify-center transition-all font-bold shadow-lg"
                style={{
                  background: running
                    ? `linear-gradient(135deg, ${modeInfo.color}cc, ${modeInfo.color})`
                    : `linear-gradient(135deg, ${modeInfo.color}, ${modeInfo.color}bb)`,
                  boxShadow: running
                    ? `0 0 32px ${modeInfo.color}66`
                    : `0 4px 20px ${modeInfo.color}44`,
                  transform: running ? "scale(1.05)" : "scale(1)",
                  color: "#fff",
                }}
                title="Space to toggle"
              >
                {running ? (
                  <FaPause size={24} />
                ) : (
                  <FaPlay size={24} style={{ marginLeft: 3 }} />
                )}
              </button>

              {/* Skip / next */}
              <button
                onClick={handleSessionEnd}
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
                title="Skip to next session"
              >
                <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                  ⏭
                </span>
              </button>
            </div>

            {/* Keyboard hint */}
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--text-faint)" }}
            >
              <FaKeyboard size={11} />
              <span>
                Press{" "}
                <kbd
                  className="px-1.5 py-0.5 rounded font-mono text-xs"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  Space
                </kbd>{" "}
                to start / pause
              </span>
            </div>

            {/* Session info row */}
            <div className="w-full grid grid-cols-3 gap-2">
              <div
                className="rounded-2xl p-2.5 text-center"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="text-xl font-extrabold"
                  style={{ color: "#ef4444" }}
                >
                  {sessionCount}
                </div>
                <div
                  className="text-xs mt-0.5 leading-tight"
                  style={{ color: "var(--text-faint)" }}
                >
                  Sessions
                </div>
              </div>
              <div
                className="rounded-2xl p-2.5 text-center"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="text-xl font-extrabold"
                  style={{ color: "#f59e0b" }}
                >
                  {streak}
                </div>
                <div
                  className="text-xs mt-0.5 leading-tight"
                  style={{ color: "var(--text-faint)" }}
                >
                  Streak 🔥
                </div>
              </div>
              <div
                className="rounded-2xl p-2.5 text-center"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="text-xl font-extrabold"
                  style={{ color: "#6366f1" }}
                >
                  {todayFocusMins}
                </div>
                <div
                  className="text-xs mt-0.5 leading-tight"
                  style={{ color: "var(--text-faint)" }}
                >
                  Focus min
                </div>
              </div>
            </div>

            {/* Recent log */}
            {history.length > 0 && (
              <div className="w-full">
                <h3
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-faint)" }}
                >
                  Recent Sessions
                </h3>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {history.slice(0, 8).map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm"
                      style={{
                        backgroundColor: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: "#ef4444", fontSize: 12 }}>
                          🍅
                        </span>
                        <span style={{ color: "var(--text-secondary)" }}>
                          {h.duration} min
                        </span>
                        {h.task && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "#6366f115",
                              color: "#6366f1",
                            }}
                          >
                            {h.task}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {new Date(h.at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TASKS TAB ───────── */}
        {tab === "tasks" && (
          <div className="flex flex-col gap-4">
            {/* Add task */}
            <div className="flex gap-2">
              <input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a task to focus on…"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: "var(--input-bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={addTask}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all"
                style={{
                  background: `linear-gradient(135deg, ${modeInfo.color}, ${modeInfo.color}bb)`,
                  boxShadow: `0 2px 12px ${modeInfo.color}44`,
                }}
              >
                <FaPlus size={13} />
              </button>
            </div>

            {tasks.length === 0 && (
              <div
                className="text-center py-12"
                style={{ color: "var(--text-faint)" }}
              >
                <div className="text-4xl mb-3">📋</div>
                <div className="text-sm">No tasks yet. Add one above!</div>
              </div>
            )}

            {/* Pending */}
            {pendingTasks.length > 0 && (
              <div>
                <h3
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-faint)" }}
                >
                  Pending ({pendingTasks.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer"
                      style={{
                        backgroundColor:
                          activeTaskId === task.id
                            ? `${modeInfo.color}12`
                            : "var(--bg-card)",
                        border: `1px solid ${activeTaskId === task.id ? modeInfo.color : "var(--border)"}`,
                      }}
                      onClick={() =>
                        setActiveTaskId(
                          activeTaskId === task.id ? null : task.id,
                        )
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(task.id);
                        }}
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                        style={{ borderColor: "var(--border-strong)" }}
                      />
                      <span
                        className="flex-1 text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {task.text}
                      </span>
                      {activeTaskId === task.id && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: `${modeInfo.color}20`,
                            color: modeInfo.color,
                          }}
                        >
                          Active
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all"
                        style={{ color: "var(--text-faint)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "0.4")
                        }
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Done */}
            {doneTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--text-faint)" }}
                  >
                    Done ({doneTasks.length})
                  </h3>
                  <button
                    onClick={clearDone}
                    className="text-xs font-semibold"
                    style={{ color: "#ef4444" }}
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {doneTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                      style={{
                        backgroundColor: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                        style={{
                          backgroundColor: "#10b981",
                          border: "2px solid #10b981",
                        }}
                      >
                        <FaCheck size={9} color="#fff" />
                      </button>
                      <span
                        className="flex-1 text-sm line-through"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded-lg"
                        style={{ color: "var(--text-faint)" }}
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STATS TAB ───────── */}
        {tab === "stats" && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={FaFire}
                label="Day Streak"
                value={`${streak}`}
                color="#f59e0b"
                sub="consecutive days"
              />
              <StatCard
                icon={FaClock}
                label="Today Focus"
                value={`${todayFocusMins}m`}
                color="#ef4444"
                sub={`${todayHistory.length} sessions`}
              />
              <StatCard
                icon={FaChartBar}
                label="Total Sessions"
                value={history.length}
                color="#6366f1"
                sub="all time"
              />
              <StatCard
                icon={FaCheck}
                label="Tasks Done"
                value={doneTasks.length}
                color="#10b981"
                sub={`${pendingTasks.length} remaining`}
              />
            </div>

            {/* Weekly breakdown */}
            {history.length > 0 && (
              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Last 7 Days
                </h3>
                <div className="flex items-end gap-2 h-24">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    const label = d.toLocaleDateString([], {
                      weekday: "short",
                    });
                    const count = history.filter(
                      (h) =>
                        new Date(h.at).toDateString() === d.toDateString() &&
                        h.type === "focus",
                    ).length;
                    const maxCount = 12;
                    const heightPct = Math.min((count / maxCount) * 100, 100);
                    const isToday =
                      d.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1 flex-1"
                      >
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: count > 0 ? modeInfo.color : "transparent",
                          }}
                        >
                          {count || ""}
                        </span>
                        <div
                          className="w-full rounded-t-lg transition-all"
                          style={{
                            height: `${Math.max(heightPct, 6)}%`,
                            backgroundColor:
                              count > 0
                                ? isToday
                                  ? modeInfo.color
                                  : `${modeInfo.color}60`
                                : "var(--border)",
                          }}
                        />
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: isToday
                              ? "var(--text-primary)"
                              : "var(--text-faint)",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Technique guide */}
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <h3
                className="text-sm font-bold mb-3 flex items-center gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                🍅 How the Pomodoro Technique Works
              </h3>
              {[
                [
                  "Work for 25 min",
                  "Focus on one task with no interruptions.",
                  "#ef4444",
                ],
                [
                  "Take a 5-min break",
                  "Rest your mind briefly after each session.",
                  "#10b981",
                ],
                [
                  "Long break after 4 sessions",
                  "Reward yourself with a 15-minute rest.",
                  "#6366f1",
                ],
                [
                  "Repeat & improve",
                  "Track sessions to build consistent deep work habits.",
                  "#f59e0b",
                ],
              ].map(([title, desc, color]) => (
                <div key={title} className="flex gap-3 mb-3 last:mb-0">
                  <div
                    className="w-2 mt-1.5 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {title}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reset history */}
            {history.length > 0 && (
              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem("pomodoroHistory");
                  setSessionCount(0);
                }}
                className="text-sm font-semibold py-2 rounded-xl"
                style={{
                  border: "1px solid #ef444440",
                  color: "#ef4444",
                  backgroundColor: "#ef444410",
                }}
              >
                Clear all history
              </button>
            )}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={mergedSettings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default PomodoroPage;
