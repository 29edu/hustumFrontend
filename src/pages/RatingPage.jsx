import { useState, useEffect, useCallback } from "react";
import { ratingApi } from "../api/ratingApi";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_CATEGORIES = [
  { name: "Productivity", emoji: "💼", color: "#6366f1" },
  { name: "Mood", emoji: "😊", color: "#ec4899" },
  { name: "Energy", emoji: "⚡", color: "#f59e0b" },
  { name: "Focus", emoji: "🎯", color: "#3b82f6" },
  { name: "Sleep", emoji: "😴", color: "#8b5cf6" },
  { name: "Exercise", emoji: "🏋️", color: "#10b981" },
  { name: "Diet", emoji: "🥗", color: "#84cc16" },
  { name: "Social", emoji: "👥", color: "#f97316" },
  { name: "Learning", emoji: "📚", color: "#06b6d4" },
  { name: "Creativity", emoji: "🎨", color: "#e879f9" },
];

const EMOJI_OPTIONS = [
  "💼",
  "😊",
  "⚡",
  "🎯",
  "😴",
  "🏋️",
  "🥗",
  "👥",
  "📚",
  "🎨",
  "💡",
  "🏆",
  "❤️",
  "🌟",
  "🎵",
  "💪",
  "🧠",
  "🌿",
  "☀️",
  "🔥",
  "🌙",
  "🎮",
  "✍️",
  "🧘",
  "💰",
  "🎭",
  "📸",
  "🍀",
  "🦋",
  "🎪",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDisplayDate = (dateStr) => {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const getScoreColor = (score) => {
  if (!score) return "#64748b";
  if (score <= 3) return "#ef4444"; // red
  if (score <= 5) return "#f59e0b"; // amber
  if (score === 6) return "#92400e"; // brown
  if (score === 7) return "#eab308"; // yellow
  if (score === 8) return "#7c3aed"; // violet
  if (score === 9) return "#3b82f6"; // blue
  return "#22c55e"; // green (10)
};

const getScoreEmoji = (score) => {
  if (!score) return "—";
  if (score <= 2) return "😞";
  if (score <= 4) return "😐";
  if (score <= 6) return "🙂";
  if (score <= 8) return "😄";
  return "🤩";
};

const getScoreLabel = (score) => {
  if (!score) return "Not rated";
  if (score <= 2) return "Poor";
  if (score <= 4) return "Fair";
  if (score <= 6) return "Good";
  if (score <= 8) return "Great";
  return "Perfect";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScorePills({ value, onChange, color }) {
  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
        const active = value === n;
        const bg = active ? getScoreColor(n) : "transparent";
        const border = active ? getScoreColor(n) : "var(--border-strong)";
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: `2px solid ${border}`,
              backgroundColor: bg,
              color: active ? "#fff" : "var(--text-muted)",
              fontWeight: active ? 700 : 500,
              fontSize: 13,
              transition: "all 0.15s",
              cursor: "pointer",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function SparkBars({ history, color }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-end gap-0.5 h-8">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: 4, backgroundColor: "var(--border)" }}
          />
        ))}
      </div>
    );
  }
  const max = 10;
  return (
    <div className="flex items-end gap-0.5 h-8" title="Last 7 days trend">
      {history.slice(-7).map((entry, i) => {
        const pct = (entry.score / max) * 100;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-end h-full group relative"
          >
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height: `${Math.max(pct, 5)}%`,
                backgroundColor: color || getScoreColor(entry.score),
                opacity: 0.85,
              }}
            />
            <span className="absolute -top-6 text-xs bg-black text-white px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
              {entry.date?.slice(5)} · {entry.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function RatingCard({ category, savedRating, history, onSave, isDark }) {
  const [score, setScore] = useState(savedRating?.score || 0);
  const [note, setNote] = useState(savedRating?.note || "");
  const [showNote, setShowNote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setScore(savedRating?.score || 0);
    setNote(savedRating?.note || "");
  }, [savedRating]);

  const handleSave = async () => {
    if (!score) return;
    setSaving(true);
    try {
      await onSave({
        category: category.name,
        score,
        note,
        emoji: category.emoji,
        color: category.color,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const scoreColor = getScoreColor(score);

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-card)",
        border: `2px solid ${score ? scoreColor + "55" : "var(--border)"}`,
        boxShadow: score ? `0 4px 20px ${scoreColor}22` : "none",
      }}
    >
      {/* Subtle background accent */}
      {score > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${scoreColor}11, transparent 70%)`,
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.emoji}</span>
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {category.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {score > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: scoreColor + "22", color: scoreColor }}
            >
              {getScoreLabel(score)}
            </span>
          )}
          <span className="text-2xl leading-none">{getScoreEmoji(score)}</span>
        </div>
      </div>

      {/* Score display */}
      {score > 0 && (
        <div className="flex items-center justify-center">
          <span
            className="text-5xl font-black leading-none"
            style={{ color: scoreColor, fontVariantNumeric: "tabular-nums" }}
          >
            {score}
          </span>
          <span
            className="text-lg self-end mb-1 ml-1"
            style={{ color: "var(--text-muted)" }}
          >
            /10
          </span>
        </div>
      )}

      {/* Score pills */}
      <ScorePills value={score} onChange={setScore} color={category.color} />

      {/* Trend */}
      <div>
        <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
          Last 7 days
        </div>
        <SparkBars history={history} color={category.color} />
      </div>

      {/* Note toggle */}
      <button
        onClick={() => setShowNote(!showNote)}
        className="text-xs text-left transition-colors"
        style={{
          color: showNote ? "var(--text-primary)" : "var(--text-muted)",
        }}
      >
        {showNote ? "▲ Hide note" : "▼ Add a note…"}
      </button>
      {showNote && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What influenced this score today?"
          rows={2}
          className="w-full text-xs rounded-lg px-2 py-1.5 resize-none outline-none"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!score || saving}
        className="w-full py-1.5 rounded-xl text-sm font-semibold transition-all duration-200"
        style={{
          backgroundColor: !score
            ? "var(--bg-elevated)"
            : saved
              ? "#22c55e"
              : scoreColor,
          color: !score ? "var(--text-muted)" : "#fff",
          cursor: !score ? "default" : "pointer",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Rating"}
      </button>
    </div>
  );
}

// ─── Add Custom Category Modal ─────────────────────────────────────────────────

function AddCategoryModal({ onAdd, onClose, isDark }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌟");
  const [color, setColor] = useState("#6366f1");

  const COLOR_OPTIONS = [
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#84cc16",
    "#f97316",
    "#06b6d4",
    "#e879f9",
    "#ef4444",
    "#14b8a6",
    "#78716c",
    "#64748b",
    "#a855f7",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      />
      <div
        className="relative rounded-2xl p-6 w-full max-w-sm z-10"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Add Custom Category
        </h3>

        {/* Name */}
        <label
          className="text-xs font-medium block mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Category Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Hydration, Reading…"
          className="w-full rounded-xl px-3 py-2 text-sm mb-4 outline-none"
          style={{
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />

        {/* Emoji picker */}
        <label
          className="text-xs font-medium block mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Pick an Emoji
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className="text-xl rounded-lg p-1 transition-all"
              style={{
                border:
                  emoji === e ? "2px solid #6366f1" : "2px solid var(--border)",
                backgroundColor: emoji === e ? "#6366f133" : "transparent",
              }}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Color picker */}
        <label
          className="text-xs font-medium block mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Pick a Color
        </label>
        <div className="flex flex-wrap gap-2 mb-6">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                backgroundColor: c,
                outline: color === c ? `3px solid ${c}` : "none",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>

        {/* Preview */}
        <div
          className="flex items-center gap-3 mb-4 p-3 rounded-xl"
          style={{ backgroundColor: "var(--bg-elevated)" }}
        >
          <span className="text-2xl">{emoji}</span>
          <span
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {name || "Category Name"}
          </span>
          <div
            className="ml-auto w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim()) return;
              onAdd({ name: name.trim(), emoji, color, isCustom: true });
              onClose();
            }}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function RatingPage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const userId = user?.email || "guest";

  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [categories, setCategories] = useState(PRESET_CATEGORIES);
  const [savedRatings, setSavedRatings] = useState({}); // { categoryName: ratingObj }
  const [history, setHistory] = useState({}); // { categoryName: [entries] }
  const [averages, setAverages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState("today"); // "today" | "stats"

  // Load ratings for current date + history
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dateRatings, hist, avgs] = await Promise.all([
        ratingApi.getRatingsByDate(userId, selectedDate),
        ratingApi.getHistory(userId, 30),
        ratingApi.getAverages(userId, 30),
      ]);

      // Map date ratings
      const rMap = {};
      dateRatings.forEach((r) => {
        rMap[r.category] = r;
      });
      setSavedRatings(rMap);

      // Map history by category
      const hMap = {};
      hist.forEach((r) => {
        if (!hMap[r.category]) hMap[r.category] = [];
        hMap[r.category].push(r);
      });
      setHistory(hMap);

      setAverages(avgs);

      // Add any custom categories from saved ratings/history that aren't in preset
      const knownNames = new Set(PRESET_CATEGORIES.map((c) => c.name));
      const extras = [];
      [...dateRatings, ...hist].forEach((r) => {
        if (r.isCustom && !knownNames.has(r.category)) {
          knownNames.add(r.category);
          extras.push({
            name: r.category,
            emoji: r.emoji || "🌟",
            color: r.color || "#6366f1",
            isCustom: true,
          });
        }
      });
      if (extras.length > 0) {
        setCategories((prev) => {
          const existingNames = new Set(prev.map((c) => c.name));
          const newOnes = extras.filter((e) => !existingNames.has(e.name));
          return [...prev, ...newOnes];
        });
      }
    } catch (err) {
      console.error("Error loading ratings:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (data) => {
    const rating = await ratingApi.upsertRating({
      userId,
      date: selectedDate,
      ...data,
    });
    setSavedRatings((prev) => ({ ...prev, [data.category]: rating }));
    // reload history & averages in background
    const [hist, avgs] = await Promise.all([
      ratingApi.getHistory(userId, 30),
      ratingApi.getAverages(userId, 30),
    ]);
    const hMap = {};
    hist.forEach((r) => {
      if (!hMap[r.category]) hMap[r.category] = [];
      hMap[r.category].push(r);
    });
    setHistory(hMap);
    setAverages(avgs);
  };

  const handleAddCategory = (cat) => {
    setCategories((prev) => [...prev, cat]);
  };

  // Computed overall today score
  const todayScores = Object.values(savedRatings).map((r) => r.score);
  const overallAvg = todayScores.length
    ? (todayScores.reduce((a, b) => a + b, 0) / todayScores.length).toFixed(1)
    : null;

  // Navigate dates
  const shiftDate = (delta) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    const today = toDateStr(new Date());
    const next = toDateStr(d);
    if (next <= today) setSelectedDate(next);
  };

  const isToday = selectedDate === toDateStr(new Date());

  return (
    <div className="min-h-screen px-4 py-6 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            Daily Ratings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Track how different areas of your life feel each day
          </p>
        </div>

        {/* Overall Score Badge */}
        {overallAvg && (
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${getScoreColor(parseFloat(overallAvg))}22, ${getScoreColor(parseFloat(overallAvg))}44)`,
              border: `2px solid ${getScoreColor(parseFloat(overallAvg))}55`,
            }}
          >
            <div>
              <div
                className="text-xs font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Today's Vibe
              </div>
              <div
                className="text-3xl font-black leading-none"
                style={{ color: getScoreColor(parseFloat(overallAvg)) }}
              >
                {overallAvg}
              </div>
            </div>
            <span className="text-3xl">
              {getScoreEmoji(parseFloat(overallAvg))}
            </span>
          </div>
        )}
      </div>

      {/* ── Date navigation ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => shiftDate(-1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: "var(--text-secondary)",
          }}
        >
          ‹
        </button>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        >
          📅 {formatDisplayDate(selectedDate)}
          {isToday && (
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "#3b82f622", color: "#3b82f6" }}
            >
              Today
            </span>
          )}
        </div>
        <button
          onClick={() => shiftDate(1)}
          disabled={isToday}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: isToday ? "var(--text-muted)" : "var(--text-secondary)",
            opacity: isToday ? 0.4 : 1,
          }}
        >
          ›
        </button>
        {!isToday && (
          <button
            onClick={() => setSelectedDate(toDateStr(new Date()))}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: "#3b82f622", color: "#3b82f6" }}
          >
            Back to Today
          </button>
        )}
      </div>

      {/* ── View Tabs ── */}
      <div className="flex gap-2 mb-6">
        {["today", "stats"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
            style={{
              backgroundColor: view === v ? "#6366f1" : "var(--bg-elevated)",
              color: view === v ? "#fff" : "var(--text-secondary)",
            }}
          >
            {v === "today" ? "📝 Check-in" : "📊 30-Day Stats"}
          </button>
        ))}
      </div>

      {/* ── Check-in view ── */}
      {view === "today" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl h-52 animate-pulse"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <RatingCard
                  key={cat.name}
                  category={cat}
                  savedRating={savedRatings[cat.name]}
                  history={history[cat.name] || []}
                  onSave={handleSave}
                  isDark={isDark}
                />
              ))}

              {/* Add category button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 h-36 border-dashed"
                style={{
                  backgroundColor: "transparent",
                  border: "2px dashed var(--border-strong)",
                  color: "var(--text-muted)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-elevated)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span className="text-3xl">＋</span>
                <span className="text-xs font-medium">Add Category</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Stats view ── */}
      {view === "stats" && (
        <div className="space-y-4">
          {averages.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-2xl"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-5xl mb-3">📊</span>
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                No data yet
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Start rating your days to see trends here
              </p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                {averages.map((avg) => (
                  <div
                    key={avg._id}
                    className="rounded-2xl p-4 flex flex-col items-center gap-1 text-center"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: `2px solid ${avg.color || getScoreColor(avg.avgScore)}33`,
                    }}
                  >
                    <span className="text-2xl">{avg.emoji || "⭐"}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {avg._id}
                    </span>
                    <div className="flex items-baseline gap-0.5">
                      <span
                        className="text-2xl font-black"
                        style={{ color: getScoreColor(avg.avgScore) }}
                      >
                        {avg.avgScore.toFixed(1)}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        /10
                      </span>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: getScoreColor(avg.avgScore) + "22",
                        color: getScoreColor(avg.avgScore),
                      }}
                    >
                      {getScoreLabel(Math.round(avg.avgScore))}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {avg.count} entries
                    </span>
                  </div>
                ))}
              </div>

              {/* Per-category history bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {averages.map((avg) => {
                  const catHistory = history[avg._id] || [];
                  const catMeta = categories.find((c) => c.name === avg._id);
                  return (
                    <div
                      key={avg._id}
                      className="rounded-2xl p-4"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{avg.emoji || "⭐"}</span>
                          <span
                            className="font-semibold text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {avg._id}
                          </span>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: getScoreColor(avg.avgScore) + "22",
                            color: getScoreColor(avg.avgScore),
                          }}
                        >
                          avg {avg.avgScore.toFixed(1)}
                        </span>
                      </div>

                      {/* Detailed bar chart — last 30 days */}
                      <div className="flex items-end gap-0.5 h-16">
                        {catHistory.slice(-30).map((entry, i) => {
                          const pct = (entry.score / 10) * 100;
                          const col = getScoreColor(entry.score);
                          return (
                            <div
                              key={i}
                              className="flex-1 flex flex-col items-center justify-end h-full group relative"
                            >
                              <div
                                className="w-full rounded-sm transition-all"
                                style={{
                                  height: `${Math.max(pct, 4)}%`,
                                  backgroundColor: col,
                                  opacity: 0.8,
                                }}
                              />
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                {entry.date?.slice(5)} · {entry.score}
                                {entry.note
                                  ? ` · "${entry.note.slice(0, 20)}"`
                                  : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {catHistory.length > 0
                            ? catHistory[0].date?.slice(5)
                            : ""}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {catHistory.length > 0
                            ? catHistory[catHistory.length - 1].date?.slice(5)
                            : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Add Category Modal ── */}
      {showAddModal && (
        <AddCategoryModal
          onAdd={handleAddCategory}
          onClose={() => setShowAddModal(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
