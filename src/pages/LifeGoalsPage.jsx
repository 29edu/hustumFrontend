import { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaTimes,
  FaTrash,
  FaCheck,
  FaEdit,
  FaFlag,
  FaBookmark,
  FaBullseye,
  FaLightbulb,
  FaHeart,
  FaRocket,
  FaStar,
  FaLeaf,
  FaBrain,
  FaGlobe,
  FaDumbbell,
  FaDollarSign,
  FaGraduationCap,
  FaPrayingHands,
  FaCompass,
  FaPalette,
  FaUsers,
  FaEllipsisV,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaFilter,
  FaThumbtack,
  FaRegCircle,
  FaCheckCircle,
  FaFire,
  FaCalendarAlt,
  FaClock,
  FaChartLine,
  FaPen,
  FaList,
  FaMedal,
  FaJournalWhills,
  FaArrowLeft,
  FaInfoCircle,
  FaArchive,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import { lifeGoalApi } from "../api/lifeGoalApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "career", label: "Career", icon: FaRocket, color: "#6366f1" },
  { id: "personal", label: "Personal", icon: FaHeart, color: "#ec4899" },
  { id: "health", label: "Health", icon: FaDumbbell, color: "#10b981" },
  { id: "financial", label: "Financial", icon: FaDollarSign, color: "#f59e0b" },
  {
    id: "relationships",
    label: "Relationships",
    icon: FaUsers,
    color: "#f97316",
  },
  {
    id: "education",
    label: "Education",
    icon: FaGraduationCap,
    color: "#3b82f6",
  },
  {
    id: "spiritual",
    label: "Spiritual",
    icon: FaPrayingHands,
    color: "#8b5cf6",
  },
  { id: "adventure", label: "Adventure", icon: FaCompass, color: "#06b6d4" },
  { id: "creative", label: "Creative", icon: FaPalette, color: "#d946ef" },
  { id: "social", label: "Social", icon: FaGlobe, color: "#14b8a6" },
  { id: "other", label: "Other", icon: FaLeaf, color: "#84cc16" },
];

const GOAL_TYPES = [
  {
    id: "life",
    label: "Life Goal",
    icon: "🌟",
    desc: "A long-term vision for your life",
  },
  {
    id: "yearly",
    label: "Yearly",
    icon: "📅",
    desc: "Achieve this within a year",
  },
  {
    id: "monthly",
    label: "Monthly",
    icon: "🗓️",
    desc: "A goal for this month",
  },
  { id: "quarterly", label: "Quarterly", icon: "📊", desc: "3-month goal" },
];

const STATUSES = [
  { id: "not_started", label: "Not Started", color: "#94a3b8" },
  { id: "in_progress", label: "In Progress", color: "#3b82f6" },
  { id: "completed", label: "Completed", color: "#10b981" },
  { id: "paused", label: "Paused", color: "#f59e0b" },
  { id: "abandoned", label: "Abandoned", color: "#ef4444" },
];

const PRIORITIES = [
  { id: "low", label: "Low", color: "#94a3b8" },
  { id: "medium", label: "Medium", color: "#f59e0b" },
  { id: "high", label: "High", color: "#f97316" },
  { id: "critical", label: "Critical", color: "#ef4444" },
];

const MOODS = [
  { id: "great", label: "Great 🔥", color: "#10b981" },
  { id: "good", label: "Good 😊", color: "#3b82f6" },
  { id: "neutral", label: "Neutral 😐", color: "#94a3b8" },
  { id: "difficult", label: "Difficult 😓", color: "#f59e0b" },
  { id: "struggling", label: "Struggling 😔", color: "#ef4444" },
];

const GOAL_EMOJIS = [
  "🎯",
  "🌟",
  "🚀",
  "💪",
  "❤️",
  "🧠",
  "💰",
  "📚",
  "🏆",
  "🎨",
  "🌱",
  "✨",
  "🔥",
  "💡",
  "🎭",
  "🌍",
  "⚡",
  "🦋",
  "🌈",
  "🏔️",
  "💎",
  "🎪",
  "🧘",
  "🛡️",
];

const PRESET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#84cc16",
  "#14b8a6",
  "#d946ef",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR + i);

// ─── Small helpers ───────────────────────────────────────────────────────────

const getCategoryMeta = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[10];

const getStatusMeta = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0];

const getPriorityMeta = (id) =>
  PRIORITIES.find((p) => p.id === id) || PRIORITIES[1];

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

const isOverdue = (deadline) =>
  deadline && new Date(deadline) < new Date() && true;

// ─── Circular Progress SVG ───────────────────────────────────────────────────

const CircularProgress = ({
  value = 0,
  size = 56,
  strokeWidth = 5,
  color = "#6366f1",
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(148,163,184,0.2)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.22}
        fontWeight="bold"
        fill={color}
      >
        {value}%
      </text>
    </svg>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div
    className="rounded-2xl p-4 flex items-center gap-4"
    style={{
      backgroundColor: "var(--card-bg)",
      border: "1px solid var(--border)",
    }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}22` }}
    >
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color }}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

// ─── Goal Card ───────────────────────────────────────────────────────────────

const GoalCard = ({ goal, onOpen, onTogglePin, onDelete }) => {
  const cat = getCategoryMeta(goal.category);
  const status = getStatusMeta(goal.status);
  const priority = getPriorityMeta(goal.priority);
  const stepsTotal = goal.steps?.length || 0;
  const stepsDone = goal.steps?.filter((s) => s.completed).length || 0;
  const overdue = isOverdue(goal.deadline);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer group relative"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onClick={() => onOpen(goal)}
    >
      {/* Top colour strip */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: goal.color || cat.color }}
      />

      {/* Pin / Menu */}
      <div
        className="absolute top-3 right-3 flex gap-1 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {goal.isPinned && (
          <FaThumbtack size={12} style={{ color: goal.color || cat.color }} />
        )}
        <button
          className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: "var(--bg-elevated)" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FaEllipsisV size={10} style={{ color: "var(--text-muted)" }} />
        </button>
        {menuOpen && (
          <div
            className="absolute top-6 right-0 w-40 rounded-xl py-1 z-20"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            <button
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-primary)" }}
              onClick={() => {
                onTogglePin(goal._id);
                setMenuOpen(false);
              }}
            >
              <FaThumbtack size={10} /> {goal.isPinned ? "Unpin" : "Pin goal"}
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:opacity-70 transition-opacity"
              style={{ color: "#ef4444" }}
              onClick={() => {
                onDelete(goal._id);
                setMenuOpen(false);
              }}
            >
              <FaTrash size={10} /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl leading-none">{goal.emoji || "🎯"}</span>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-sm leading-5 truncate pr-6"
              style={{ color: "var(--text-primary)" }}
            >
              {goal.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
              >
                {cat.label}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${status.color}22`,
                  color: status.color,
                }}
              >
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--bg-elevated)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${goal.progress}%`,
                backgroundColor: goal.color || cat.color,
              }}
            />
          </div>
          <span
            className="text-xs font-semibold"
            style={{ color: goal.color || cat.color }}
          >
            {goal.progress}%
          </span>
        </div>

        {/* Meta row */}
        <div
          className="flex items-center justify-between text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <div className="flex items-center gap-3">
            {stepsTotal > 0 && (
              <span className="flex items-center gap-1">
                <FaList size={9} /> {stepsDone}/{stepsTotal}
              </span>
            )}
            {goal.effortStarted && (
              <span
                className="flex items-center gap-1"
                style={{ color: "#10b981" }}
              >
                <FaFire size={9} /> Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Priority dot */}
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: priority.color }}
              title={priority.label}
            />
            {goal.deadline && (
              <span
                className="flex items-center gap-1"
                style={{ color: overdue ? "#ef4444" : "var(--text-muted)" }}
              >
                <FaClock size={9} />
                {formatDate(goal.deadline)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Add / Edit Goal Modal ────────────────────────────────────────────────────

const GoalFormModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(
    initial || {
      title: "",
      description: "",
      vision: "",
      motivation: "",
      obstacles: "",
      resources: "",
      category: "personal",
      type: "life",
      year: CURRENT_YEAR,
      month: new Date().getMonth() + 1,
      quarter: 1,
      priority: "medium",
      status: "not_started",
      deadline: "",
      effortStarted: false,
      progress: 0,
      tags: [],
      color: "#6366f1",
      emoji: "🎯",
    },
  );
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("basic");
  const isEdit = !!initial?._id;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-xl text-sm outline-none transition-all";
  const inputStyle = {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  const formTabs = ["basic", "details", "vision"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{form.emoji}</span>
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {isEdit ? "Edit Goal" : "New Life Goal"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:opacity-70 transition-opacity"
          >
            <FaTimes style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 gap-1 pt-3 flex-shrink-0">
          {formTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
              style={
                tab === t
                  ? { backgroundColor: form.color, color: "#fff" }
                  : {
                      color: "var(--text-muted)",
                      backgroundColor: "transparent",
                    }
              }
            >
              {t === "basic"
                ? "Basics"
                : t === "details"
                  ? "Details"
                  : "Vision & Strategy"}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {tab === "basic" && (
            <>
              {/* Emoji + Title */}
              <div className="flex gap-3">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl cursor-pointer relative"
                  style={{
                    backgroundColor: `${form.color}22`,
                    border: `2px solid ${form.color}`,
                  }}
                >
                  {form.emoji}
                </div>
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Goal title *"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>

              {/* Emoji picker */}
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Pick an emoji
                </p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => set("emoji", em)}
                      className="text-lg w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        backgroundColor:
                          form.emoji === em
                            ? `${form.color}33`
                            : "var(--bg-elevated)",
                        border:
                          form.emoji === em
                            ? `2px solid ${form.color}`
                            : "2px solid transparent",
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Category
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          set("category", cat.id);
                          set("color", cat.color);
                        }}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all"
                        style={{
                          backgroundColor:
                            form.category === cat.id
                              ? `${cat.color}22`
                              : "var(--bg-elevated)",
                          border:
                            form.category === cat.id
                              ? `2px solid ${cat.color}`
                              : "2px solid transparent",
                          color:
                            form.category === cat.id
                              ? cat.color
                              : "var(--text-muted)",
                        }}
                      >
                        <Icon size={14} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Type */}
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Goal Type
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => set("type", t.id)}
                      className="flex items-center gap-2 p-3 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor:
                          form.type === t.id
                            ? `${form.color}22`
                            : "var(--bg-elevated)",
                        border:
                          form.type === t.id
                            ? `2px solid ${form.color}`
                            : "2px solid transparent",
                      }}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{
                            color:
                              form.type === t.id
                                ? form.color
                                : "var(--text-primary)",
                          }}
                        >
                          {t.label}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {t.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Year/Month picker for time-based goals */}
              {form.type === "yearly" && (
                <div>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Year
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {YEARS.map((y) => (
                      <button
                        key={y}
                        onClick={() => set("year", y)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                          backgroundColor:
                            form.year === y ? form.color : "var(--bg-elevated)",
                          color: form.year === y ? "#fff" : "var(--text-muted)",
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {form.type === "monthly" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p
                      className="text-xs mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Month
                    </p>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={form.month}
                      onChange={(e) => set("month", Number(e.target.value))}
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p
                      className="text-xs mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Year
                    </p>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={form.year}
                      onChange={(e) => set("year", Number(e.target.value))}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {form.type === "quarterly" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p
                      className="text-xs mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Quarter
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((q) => (
                        <button
                          key={q}
                          onClick={() => set("quarter", q)}
                          className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all"
                          style={{
                            backgroundColor:
                              form.quarter === q
                                ? form.color
                                : "var(--bg-elevated)",
                            color:
                              form.quarter === q ? "#fff" : "var(--text-muted)",
                          }}
                        >
                          Q{q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-xs mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Year
                    </p>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={form.year}
                      onChange={(e) => set("year", Number(e.target.value))}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Priority + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Priority
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => set("priority", p.id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor:
                            form.priority === p.id
                              ? p.color
                              : "var(--bg-elevated)",
                          color:
                            form.priority === p.id
                              ? "#fff"
                              : "var(--text-muted)",
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Status
                  </p>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={form.status}
                    onChange={(e) => set("status", e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color */}
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Accent Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => set("color", c)}
                      className="w-7 h-7 rounded-lg transition-all"
                      style={{
                        backgroundColor: c,
                        transform:
                          form.color === c ? "scale(1.25)" : "scale(1)",
                        boxShadow:
                          form.color === c
                            ? `0 0 0 3px white, 0 0 0 5px ${c}`
                            : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Deadline + Effort */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Deadline (optional)
                  </p>
                  <input
                    type="date"
                    className={inputClass}
                    style={inputStyle}
                    value={form.deadline ? form.deadline.split("T")[0] : ""}
                    onChange={(e) => set("deadline", e.target.value)}
                  />
                </div>
                <div>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Progress %
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputClass}
                    style={inputStyle}
                    value={form.progress}
                    onChange={(e) =>
                      set(
                        "progress",
                        Math.min(100, Math.max(0, Number(e.target.value))),
                      )
                    }
                  />
                </div>
              </div>

              {/* Started effort */}
              <label
                className="flex items-center gap-3 cursor-pointer p-3 rounded-xl"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: form.effortStarted
                      ? form.color
                      : "var(--card-bg)",
                    border: `2px solid ${form.effortStarted ? form.color : "var(--border)"}`,
                  }}
                  onClick={() => set("effortStarted", !form.effortStarted)}
                >
                  {form.effortStarted && <FaCheck size={10} color="#fff" />}
                </div>
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    I have started putting in efforts
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Check this when you actively start working towards this goal
                  </p>
                </div>
              </label>

              {/* Tags */}
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Tags
                </p>
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{ backgroundColor: form.color, color: "#fff" }}
                  >
                    Add
                  </button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: `${form.color}22`,
                          color: form.color,
                        }}
                      >
                        #{t}
                        <button
                          onClick={() =>
                            set(
                              "tags",
                              form.tags.filter((x) => x !== t),
                            )
                          }
                        >
                          <FaTimes size={8} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "details" && (
            <>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Description
                </p>
                <textarea
                  rows={4}
                  className={inputClass}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="Describe this goal in detail..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Why does this goal matter to you? (Motivation)
                </p>
                <textarea
                  rows={3}
                  className={inputClass}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="What's your why? Why is this important?"
                  value={form.motivation}
                  onChange={(e) => set("motivation", e.target.value)}
                />
              </div>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Anticipated Obstacles
                </p>
                <textarea
                  rows={3}
                  className={inputClass}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="What might get in your way?"
                  value={form.obstacles}
                  onChange={(e) => set("obstacles", e.target.value)}
                />
              </div>
              <div>
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Resources Needed
                </p>
                <textarea
                  rows={3}
                  className={inputClass}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="What do you need to achieve this? (time, money, skills, people...)"
                  value={form.resources}
                  onChange={(e) => set("resources", e.target.value)}
                />
              </div>
            </>
          )}

          {tab === "vision" && (
            <>
              <div
                className="p-4 rounded-xl mb-2"
                style={{
                  backgroundColor: `${form.color}11`,
                  border: `1px solid ${form.color}33`,
                }}
              >
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: form.color }}
                >
                  ✨ Your Life Vision
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Paint a vivid picture of how you want to live your life. Use
                  present tense as if you've already achieved it.
                </p>
              </div>
              <textarea
                rows={8}
                className={inputClass}
                style={{ ...inputStyle, resize: "none" }}
                placeholder={`"I am living a life where I... I wake up every morning and feel... My days are filled with... I have achieved..."`}
                value={form.vision}
                onChange={(e) => set("vision", e.target.value)}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
            className="px-6 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: form.color,
              color: "#fff",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Goal"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Goal Detail Panel ────────────────────────────────────────────────────────

const GoalDetailPanel = ({
  goal: initialGoal,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [goal, setGoal] = useState(initialGoal);
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);

  // Steps
  const [stepInput, setStepInput] = useState("");
  const [addingStep, setAddingStep] = useState(false);

  // Milestones
  const [msInput, setMsInput] = useState("");
  const [msDate, setMsDate] = useState("");
  const [addingMs, setAddingMs] = useState(false);

  // Reflections
  const [refText, setRefText] = useState("");
  const [refMood, setRefMood] = useState("neutral");
  const [addingRef, setAddingRef] = useState(false);

  const cat = getCategoryMeta(goal.category);
  const status = getStatusMeta(goal.status);
  const priority = getPriorityMeta(goal.priority);
  const stepsTotal = goal.steps?.length || 0;
  const stepsDone = goal.steps?.filter((s) => s.completed).length || 0;
  const msTotal = goal.milestones?.length || 0;
  const msDone = goal.milestones?.filter((m) => m.achieved).length || 0;

  const refresh = (updated) => {
    setGoal(updated);
    onUpdate(updated);
  };

  const handleToggleStep = async (stepId) => {
    const updated = await lifeGoalApi.toggleStep(goal._id, stepId);
    refresh(updated);
  };

  const handleAddStep = async () => {
    if (!stepInput.trim()) return;
    setAddingStep(true);
    try {
      const updated = await lifeGoalApi.addStep(goal._id, stepInput.trim());
      refresh(updated);
      setStepInput("");
    } finally {
      setAddingStep(false);
    }
  };

  const handleDeleteStep = async (stepId) => {
    const updated = await lifeGoalApi.deleteStep(goal._id, stepId);
    refresh(updated);
  };

  const handleAddMilestone = async () => {
    if (!msInput.trim()) return;
    setAddingMs(true);
    try {
      const updated = await lifeGoalApi.addMilestone(
        goal._id,
        msInput.trim(),
        msDate || null,
      );
      refresh(updated);
      setMsInput("");
      setMsDate("");
    } finally {
      setAddingMs(false);
    }
  };

  const handleToggleMilestone = async (msId) => {
    const updated = await lifeGoalApi.toggleMilestone(goal._id, msId);
    refresh(updated);
  };

  const handleDeleteMilestone = async (msId) => {
    const updated = await lifeGoalApi.deleteMilestone(goal._id, msId);
    refresh(updated);
  };

  const handleAddReflection = async () => {
    if (!refText.trim()) return;
    setAddingRef(true);
    try {
      const updated = await lifeGoalApi.addReflection(
        goal._id,
        refText.trim(),
        refMood,
      );
      refresh(updated);
      setRefText("");
      setRefMood("neutral");
    } finally {
      setAddingRef(false);
    }
  };

  const handleDeleteReflection = async (refId) => {
    const updated = await lifeGoalApi.deleteReflection(goal._id, refId);
    refresh(updated);
  };

  const handleStatusChange = async (status) => {
    const updated = await lifeGoalApi.updateGoal(goal._id, { status });
    refresh(updated);
  };

  const handleProgressChange = async (progress) => {
    const updated = await lifeGoalApi.updateGoal(goal._id, { progress });
    refresh(updated);
  };

  const TABS = [
    { id: "overview", label: "Overview", icon: FaInfoCircle },
    { id: "steps", label: `Steps (${stepsDone}/${stepsTotal})`, icon: FaList },
    {
      id: "milestones",
      label: `Milestones (${msDone}/${msTotal})`,
      icon: FaMedal,
    },
    {
      id: "reflections",
      label: `Reflections (${goal.reflections?.length || 0})`,
      icon: FaJournalWhills,
    },
  ];

  const inputClass =
    "w-full px-3 py-2 rounded-xl text-sm outline-none transition-all";
  const inputStyle = {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <>
      {editing && (
        <GoalFormModal
          initial={goal}
          onClose={() => setEditing(false)}
          onSave={async (data) => {
            const updated = await lifeGoalApi.updateGoal(goal._id, data);
            refresh(updated);
          }}
        />
      )}

      <div
        className="fixed inset-0 z-40 flex items-stretch justify-end"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-2xl h-full flex flex-col overflow-hidden"
          style={{
            backgroundColor: "var(--bg-base)",
            borderLeft: "1px solid var(--border)",
          }}
        >
          {/* Panel Header */}
          <div
            className="relative flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${goal.color || cat.color}33, ${goal.color || cat.color}11)`,
            }}
          >
            {/* Decorative blob */}
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 -translate-y-1/2 translate-x-1/4"
              style={{ backgroundColor: goal.color || cat.color }}
            />
            <div className="relative z-10 p-6">
              <div className="flex items-start justify-between mb-4">
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl transition-all hover:opacity-70"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  <FaArrowLeft
                    size={14}
                    style={{ color: "var(--text-muted)" }}
                  />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all hover:opacity-80"
                    style={{
                      backgroundColor: goal.color || cat.color,
                      color: "#fff",
                    }}
                  >
                    <FaEdit size={11} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(goal._id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all hover:opacity-80"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      color: "#ef4444",
                    }}
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ backgroundColor: `${goal.color || cat.color}33` }}
                >
                  {goal.emoji || "🎯"}
                </div>
                <div className="flex-1 min-w-0">
                  <h1
                    className="text-xl font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {goal.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${cat.color}22`,
                        color: cat.color,
                      }}
                    >
                      {cat.label}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${status.color}22`,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${priority.color}22`,
                        color: priority.color,
                      }}
                    >
                      {priority.label} priority
                    </span>
                    {goal.effortStarted && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{
                          backgroundColor: "#10b98122",
                          color: "#10b981",
                        }}
                      >
                        <FaFire size={9} /> Active efforts
                      </span>
                    )}
                  </div>
                </div>
                <CircularProgress
                  value={goal.progress}
                  size={60}
                  color={goal.color || cat.color}
                />
              </div>

              {/* Quick status change */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStatusChange(s.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor:
                        goal.status === s.id ? s.color : "var(--bg-elevated)",
                      color:
                        goal.status === s.id ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Progress slider */}
              <div className="mt-3">
                <div
                  className="flex items-center justify-between text-xs mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>Progress</span>
                  <span
                    style={{ color: goal.color || cat.color }}
                    className="font-semibold"
                  >
                    {goal.progress}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={goal.progress}
                  onChange={(e) => handleProgressChange(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: goal.color || cat.color }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex px-4 pt-2 flex-shrink-0 overflow-x-auto gap-1"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-all border-b-2 -mb-px"
                  style={{
                    borderColor:
                      activeTab === t.id
                        ? goal.color || cat.color
                        : "transparent",
                    color:
                      activeTab === t.id
                        ? goal.color || cat.color
                        : "var(--text-muted)",
                  }}
                >
                  <Icon size={11} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === "overview" && (
              <>
                {/* Meta info */}
                <div className="grid grid-cols-2 gap-3">
                  {goal.deadline && (
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Deadline
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: isOverdue(goal.deadline)
                            ? "#ef4444"
                            : "var(--text-primary)",
                        }}
                      >
                        {formatDate(goal.deadline)}
                        {isOverdue(goal.deadline) && (
                          <span className="text-xs ml-1 text-red-400">
                            (Overdue)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {goal.effortStartDate && (
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Effort started
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {formatDate(goal.effortStartDate)}
                      </p>
                    </div>
                  )}
                  {goal.type !== "life" && (
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Timeframe
                      </p>
                      <p
                        className="text-sm font-semibold capitalize"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {goal.type === "monthly" &&
                          `${MONTHS[(goal.month || 1) - 1]} ${goal.year}`}
                        {goal.type === "yearly" && `Year ${goal.year}`}
                        {goal.type === "quarterly" &&
                          `Q${goal.quarter} ${goal.year}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {goal.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {goal.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: `${goal.color || cat.color}22`,
                          color: goal.color || cat.color,
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {goal.description && (
                  <Section
                    title="Description"
                    icon={FaBookmark}
                    color={goal.color || cat.color}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {goal.description}
                    </p>
                  </Section>
                )}
                {goal.vision && (
                  <Section
                    title="Vision"
                    icon={FaLightbulb}
                    color={goal.color || cat.color}
                  >
                    <p
                      className="text-sm leading-relaxed italic"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      "{goal.vision}"
                    </p>
                  </Section>
                )}
                {goal.motivation && (
                  <Section
                    title="Motivation (My Why)"
                    icon={FaHeart}
                    color={goal.color || cat.color}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {goal.motivation}
                    </p>
                  </Section>
                )}
                {goal.obstacles && (
                  <Section
                    title="Anticipated Obstacles"
                    icon={FaFlag}
                    color="#f59e0b"
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {goal.obstacles}
                    </p>
                  </Section>
                )}
                {goal.resources && (
                  <Section
                    title="Resources Needed"
                    icon={FaBrain}
                    color="#10b981"
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {goal.resources}
                    </p>
                  </Section>
                )}

                {!goal.description && !goal.vision && !goal.motivation && (
                  <div className="text-center py-10">
                    <span className="text-4xl">✍️</span>
                    <p
                      className="text-sm mt-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No details added yet. Click Edit to add your vision,
                      motivation and more.
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "steps" && (
              <>
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${goal.color || cat.color}11`,
                    border: `1px solid ${goal.color || cat.color}33`,
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: goal.color || cat.color }}
                  >
                    Steps are the concrete actions you take to achieve this
                    goal. Check them off as you complete them.
                  </p>
                </div>

                {/* Add step */}
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Add a step you've taken or plan to take..."
                    value={stepInput}
                    onChange={(e) => setStepInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddStep()}
                  />
                  <button
                    onClick={handleAddStep}
                    disabled={addingStep}
                    className="px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0"
                    style={{
                      backgroundColor: goal.color || cat.color,
                      color: "#fff",
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>

                {/* Steps list */}
                <div className="space-y-2">
                  {goal.steps?.length === 0 && (
                    <div className="text-center py-8">
                      <span className="text-3xl">👣</span>
                      <p
                        className="text-sm mt-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No steps yet. Add your first step above.
                      </p>
                    </div>
                  )}
                  {goal.steps?.map((step) => (
                    <div
                      key={step._id}
                      className="flex items-start gap-3 p-3 rounded-xl group"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <button
                        onClick={() => handleToggleStep(step._id)}
                        className="mt-0.5 flex-shrink-0 transition-all"
                      >
                        {step.completed ? (
                          <FaCheckCircle
                            size={18}
                            style={{ color: goal.color || cat.color }}
                          />
                        ) : (
                          <FaRegCircle
                            size={18}
                            style={{ color: "var(--text-muted)" }}
                          />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm"
                          style={{
                            color: step.completed
                              ? "var(--text-muted)"
                              : "var(--text-primary)",
                            textDecoration: step.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {step.title}
                        </p>
                        {step.completedAt && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Done {formatDate(step.completedAt)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteStep(step._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <FaTrash size={11} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  ))}
                </div>

                {stepsTotal > 0 && (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: "var(--bg-elevated)" }}
                  >
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--border)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(stepsDone / stepsTotal) * 100}%`,
                          backgroundColor: goal.color || cat.color,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: goal.color || cat.color }}
                    >
                      {stepsDone}/{stepsTotal} steps done
                    </span>
                  </div>
                )}
              </>
            )}

            {activeTab === "milestones" && (
              <>
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${goal.color || cat.color}11`,
                    border: `1px solid ${goal.color || cat.color}33`,
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: goal.color || cat.color }}
                  >
                    Milestones are major achievements along the way to your goal
                    — key checkpoints to celebrate.
                  </p>
                </div>

                {/* Add milestone */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      style={inputStyle}
                      placeholder="Add a milestone..."
                      value={msInput}
                      onChange={(e) => setMsInput(e.target.value)}
                    />
                    <button
                      onClick={handleAddMilestone}
                      disabled={addingMs}
                      className="px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0"
                      style={{
                        backgroundColor: goal.color || cat.color,
                        color: "#fff",
                      }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <input
                    type="date"
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Target date (optional)"
                    value={msDate}
                    onChange={(e) => setMsDate(e.target.value)}
                  />
                </div>

                {/* Milestones list */}
                <div className="space-y-2">
                  {goal.milestones?.length === 0 && (
                    <div className="text-center py-8">
                      <span className="text-3xl">🏁</span>
                      <p
                        className="text-sm mt-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No milestones yet. Add your first checkpoint.
                      </p>
                    </div>
                  )}
                  {goal.milestones?.map((ms) => (
                    <div
                      key={ms._id}
                      className="flex items-center gap-3 p-3 rounded-xl group"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <button
                        onClick={() => handleToggleMilestone(ms._id)}
                        className="flex-shrink-0"
                      >
                        {ms.achieved ? (
                          <FaMedal size={18} style={{ color: "#f59e0b" }} />
                        ) : (
                          <FaRegCircle
                            size={18}
                            style={{ color: "var(--text-muted)" }}
                          />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm"
                          style={{
                            color: ms.achieved
                              ? "var(--text-muted)"
                              : "var(--text-primary)",
                            textDecoration: ms.achieved
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {ms.title}
                        </p>
                        {ms.targetDate && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Target: {formatDate(ms.targetDate)}
                            {ms.achievedAt &&
                              ` · Achieved ${formatDate(ms.achievedAt)}`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteMilestone(ms._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <FaTrash size={11} style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "reflections" && (
              <>
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${goal.color || cat.color}11`,
                    border: `1px solid ${goal.color || cat.color}33`,
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: goal.color || cat.color }}
                  >
                    Reflect on your journey. Write about what's working, how you
                    feel, and what you're learning.
                  </p>
                </div>

                {/* Add reflection */}
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    className={inputClass}
                    style={{ ...inputStyle, resize: "none" }}
                    placeholder="How are you feeling about this goal today? What progress have you made? What challenges are you facing?"
                    value={refText}
                    onChange={(e) => setRefText(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {MOODS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setRefMood(m.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{
                            backgroundColor:
                              refMood === m.id ? m.color : "var(--bg-elevated)",
                            color:
                              refMood === m.id ? "#fff" : "var(--text-muted)",
                          }}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleAddReflection}
                      disabled={addingRef || !refText.trim()}
                      className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        backgroundColor: goal.color || cat.color,
                        color: "#fff",
                        opacity: !refText.trim() ? 0.5 : 1,
                      }}
                    >
                      <FaPen size={11} />
                    </button>
                  </div>
                </div>

                {/* Reflections list */}
                <div className="space-y-3">
                  {goal.reflections?.length === 0 && (
                    <div className="text-center py-8">
                      <span className="text-3xl">📖</span>
                      <p
                        className="text-sm mt-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No reflections yet. Start journaling your journey.
                      </p>
                    </div>
                  )}
                  {goal.reflections?.map((ref) => {
                    const mood =
                      MOODS.find((m) => m.id === ref.mood) || MOODS[2];
                    return (
                      <div
                        key={ref._id}
                        className="p-4 rounded-xl group relative"
                        style={{
                          backgroundColor: "var(--card-bg)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${mood.color}22`,
                              color: mood.color,
                            }}
                          >
                            {mood.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {formatDate(ref.createdAt)}
                            </span>
                            <button
                              onClick={() => handleDeleteReflection(ref._id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTrash size={10} style={{ color: "#ef4444" }} />
                            </button>
                          </div>
                        </div>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {ref.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Info Section sub-component ───────────────────────────────────────────────

const Section = ({ title, icon: Icon, color, children }) => (
  <div
    className="rounded-xl overflow-hidden"
    style={{
      backgroundColor: "var(--card-bg)",
      border: "1px solid var(--border)",
    }}
  >
    <div
      className="flex items-center gap-2 px-4 py-2.5"
      style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: `${color}11`,
      }}
    >
      <Icon size={12} style={{ color }} />
      <span className="text-xs font-semibold" style={{ color }}>
        {title}
      </span>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const LifeGoalsPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openGoal, setOpenGoal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchAll = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const [goalsData, statsData] = await Promise.all([
        lifeGoalApi.getGoals(user.email),
        lifeGoalApi.getStats(user.email),
      ]);
      setGoals(goalsData);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user?.email]);

  const handleCreate = async (data) => {
    const created = await lifeGoalApi.createGoal({
      ...data,
      userId: user.email,
    });
    setGoals((prev) => [created, ...prev]);
    fetchAll();
  };

  const handleUpdate = (updated) => {
    setGoals((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
    if (openGoal?._id === updated._id) setOpenGoal(updated);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    await lifeGoalApi.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g._id !== id));
    if (openGoal?._id === id) setOpenGoal(null);
    fetchAll();
  };

  const handleTogglePin = async (id) => {
    const goal = goals.find((g) => g._id === id);
    const updated = await lifeGoalApi.updateGoal(id, {
      isPinned: !goal.isPinned,
    });
    handleUpdate(updated);
  };

  const filtered = useMemo(() => {
    let list = [...goals];
    if (typeFilter !== "all") list = list.filter((g) => g.type === typeFilter);
    if (categoryFilter !== "all")
      list = list.filter((g) => g.category === categoryFilter);
    if (statusFilter !== "all")
      list = list.filter((g) => g.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          g.tags?.some((t) => t.includes(q)),
      );
    }
    return list;
  }, [goals, typeFilter, categoryFilter, statusFilter, searchQuery]);

  const pinned = filtered.filter((g) => g.isPinned);
  const unpinned = filtered.filter((g) => !g.isPinned);

  const TYPE_FILTERS = [
    { id: "all", label: "All" },
    { id: "life", label: "🌟 Life" },
    { id: "yearly", label: "📅 Yearly" },
    { id: "quarterly", label: "📊 Quarterly" },
    { id: "monthly", label: "🗓️ Monthly" },
  ];

  return (
    <div className="min-h-full" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 px-6 py-4"
        style={{
          backgroundColor: "var(--bg-base)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Life Goals
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Define your vision · Track your journey · Become who you want to
                be
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
              }}
            >
              <FaPlus size={13} /> New Goal
            </button>
          </div>

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatCard
                icon={FaBullseye}
                label="Total Goals"
                value={stats.total}
                color="#6366f1"
              />
              <StatCard
                icon={FaFire}
                label="In Progress"
                value={stats.byStatus?.in_progress || 0}
                color="#f97316"
              />
              <StatCard
                icon={FaCheck}
                label="Completed"
                value={stats.completed}
                color="#10b981"
              />
              <StatCard
                icon={FaChartLine}
                label="Avg Progress"
                value={`${stats.avgProgress}%`}
                color="#3b82f6"
                sub={`${stats.effortStarted} actively working`}
              />
            </div>
          )}

          {/* Search + Filters */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FaSearch
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Search goals, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: showFilters
                    ? "#6366f1"
                    : "var(--bg-elevated)",
                  color: showFilters ? "#fff" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                <FaFilter size={11} /> Filters
              </button>
            </div>

            {/* Type filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    backgroundColor:
                      typeFilter === f.id ? "#6366f1" : "var(--bg-elevated)",
                    color: typeFilter === f.id ? "#fff" : "var(--text-muted)",
                    border:
                      typeFilter === f.id ? "none" : "1px solid var(--border)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Extended filters */}
            {showFilters && (
              <div
                className="p-3 rounded-xl flex flex-wrap gap-4"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <p
                    className="text-xs mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Category
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setCategoryFilter("all")}
                      className="px-2.5 py-1 rounded-lg text-xs transition-all"
                      style={{
                        backgroundColor:
                          categoryFilter === "all"
                            ? "#6366f1"
                            : "var(--card-bg)",
                        color:
                          categoryFilter === "all"
                            ? "#fff"
                            : "var(--text-muted)",
                      }}
                    >
                      All
                    </button>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCategoryFilter(c.id)}
                        className="px-2.5 py-1 rounded-lg text-xs transition-all"
                        style={{
                          backgroundColor:
                            categoryFilter === c.id
                              ? c.color
                              : "var(--card-bg)",
                          color:
                            categoryFilter === c.id
                              ? "#fff"
                              : "var(--text-muted)",
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p
                    className="text-xs mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Status
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="px-2.5 py-1 rounded-lg text-xs transition-all"
                      style={{
                        backgroundColor:
                          statusFilter === "all" ? "#6366f1" : "var(--card-bg)",
                        color:
                          statusFilter === "all" ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      All
                    </button>
                    {STATUSES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStatusFilter(s.id)}
                        className="px-2.5 py-1 rounded-lg text-xs transition-all"
                        style={{
                          backgroundColor:
                            statusFilter === s.id ? s.color : "var(--card-bg)",
                          color:
                            statusFilter === s.id
                              ? "#fff"
                              : "var(--text-muted)",
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-indigo-500 animate-spin"
              style={{
                borderColor: "var(--border)",
                borderTopColor: "#6366f1",
              }}
            />
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6"
              style={{
                background: "linear-gradient(135deg, #6366f111, #8b5cf611)",
              }}
            >
              🌟
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Define Your Life Goals
            </h2>
            <p
              className="text-sm max-w-sm mb-6"
              style={{ color: "var(--text-muted)" }}
            >
              Start by adding your life goals — what you want to achieve, who
              you want to become, and how you want to live.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
              }}
            >
              <FaPlus /> Add Your First Goal
            </button>
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {pinned.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <FaThumbtack size={12} style={{ color: "#f59e0b" }} />
                  <h2
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    PINNED
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinned.map((g) => (
                    <GoalCard
                      key={g._id}
                      goal={g}
                      onOpen={setOpenGoal}
                      onTogglePin={handleTogglePin}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Goals grid */}
            {unpinned.length === 0 && pinned.length > 0 ? null : (
              <>
                {pinned.length > 0 && (
                  <h2
                    className="text-sm font-semibold mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ALL GOALS
                  </h2>
                )}
                {filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-3xl">🔍</span>
                    <p
                      className="text-sm mt-3"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No goals match your filters. Try adjusting them.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {unpinned.map((g) => (
                      <GoalCard
                        key={g._id}
                        goal={g}
                        onOpen={setOpenGoal}
                        onTogglePin={handleTogglePin}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Category stats */}
            {stats && Object.keys(stats.byCategory || {}).length > 0 && (
              <div className="mt-10">
                <h2
                  className="text-sm font-semibold mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  GOALS BY CATEGORY
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(stats.byCategory).map(([cat, count]) => {
                    const meta = getCategoryMeta(cat);
                    const Icon = meta.icon;
                    return (
                      <button
                        key={cat}
                        onClick={() =>
                          setCategoryFilter(
                            cat === categoryFilter ? "all" : cat,
                          )
                        }
                        className="p-3 rounded-xl flex items-center gap-3 transition-all hover:opacity-80"
                        style={{
                          backgroundColor: "var(--card-bg)",
                          border:
                            categoryFilter === cat
                              ? `2px solid ${meta.color}`
                              : "1px solid var(--border)",
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${meta.color}22` }}
                        >
                          <Icon size={14} style={{ color: meta.color }} />
                        </div>
                        <div className="text-left min-w-0">
                          <p
                            className="text-xs font-medium truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {meta.label}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {count} goal{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      {showAddModal && (
        <GoalFormModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreate}
        />
      )}

      {openGoal && (
        <GoalDetailPanel
          goal={openGoal}
          onClose={() => setOpenGoal(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default LifeGoalsPage;
