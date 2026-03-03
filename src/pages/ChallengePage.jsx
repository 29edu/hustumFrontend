import { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaTimes,
  FaFire,
  FaTrophy,
  FaCalendarAlt,
  FaChartLine,
  FaBolt,
  FaRunning,
  FaBrain,
  FaBook,
  FaCode,
  FaAppleAlt,
  FaPeace,
  FaPalette,
  FaUsers,
  FaWallet,
  FaBriefcase,
  FaStar,
  FaCheckCircle,
  FaRegCircle,
  FaTrash,
  FaEdit,
  FaArchive,
  FaArrowLeft,
  FaLock,
  FaSmile,
  FaMeh,
  FaFrown,
  FaGrinStars,
  FaBan,
  FaFlag,
  FaMedal,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaEllipsisV,
} from "react-icons/fa";
import { challengeApi } from "../api/challengeApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "fitness", label: "Fitness", icon: FaRunning, color: "#ef4444" },
  { id: "learning", label: "Learning", icon: FaBrain, color: "#8b5cf6" },
  { id: "mindfulness", label: "Mindfulness", icon: FaPeace, color: "#06b6d4" },
  { id: "coding", label: "Coding", icon: FaCode, color: "#6366f1" },
  { id: "reading", label: "Reading", icon: FaBook, color: "#f59e0b" },
  { id: "nutrition", label: "Nutrition", icon: FaAppleAlt, color: "#10b981" },
  { id: "creativity", label: "Creativity", icon: FaPalette, color: "#ec4899" },
  { id: "social", label: "Social", icon: FaUsers, color: "#14b8a6" },
  { id: "finance", label: "Finance", icon: FaWallet, color: "#84cc16" },
  { id: "career", label: "Career", icon: FaBriefcase, color: "#f97316" },
  { id: "other", label: "Other", icon: FaStar, color: "#94a3b8" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", color: "#10b981", bg: "#d1fae5" },
  { id: "medium", label: "Medium", color: "#f59e0b", bg: "#fef3c7" },
  { id: "hard", label: "Hard", color: "#ef4444", bg: "#fee2e2" },
  { id: "extreme", label: "Extreme", color: "#7c3aed", bg: "#ede9fe" },
];

const MOODS = [
  { id: "great", label: "Great", icon: FaGrinStars, color: "#10b981" },
  { id: "good", label: "Good", icon: FaSmile, color: "#6366f1" },
  { id: "okay", label: "Okay", icon: FaMeh, color: "#f59e0b" },
  { id: "tough", label: "Tough", icon: FaFrown, color: "#ef4444" },
  { id: "skipped", label: "Skipped", icon: FaBan, color: "#94a3b8" },
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
  "#14b8a6",
  "#84cc16",
];

const QUICK_DURATIONS = [
  { label: "7 days", value: 7 },
  { label: "21 days", value: 21 },
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "75 days", value: 75 },
  { label: "100 days", value: 100 },
];

// ─── Utility Helpers ──────────────────────────────────────────────────────────

const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const today = toDateStr(new Date());

/**
 * Days elapsed since startDate, capped at durationDays, min 0
 */
const getDaysElapsed = (startDate, durationDays) => {
  const start = new Date(startDate + "T00:00:00");
  const todayD = new Date(today + "T00:00:00");
  const diff = Math.floor((todayD - start) / 86400000) + 1;
  return Math.min(Math.max(diff, 0), durationDays);
};

/**
 * Number of completed days in logs
 */
const getCompletedCount = (dailyLogs) =>
  dailyLogs.filter((l) => l.completed).length;

/**
 * Completion % = completedDays / daysElapsed * 100 (avoid div/0)
 */
const getCompletionPct = (challenge) => {
  const elapsed = getDaysElapsed(challenge.startDate, challenge.durationDays);
  if (elapsed === 0) return 0;
  const completed = getCompletedCount(challenge.dailyLogs);
  return Math.round((completed / elapsed) * 100);
};

/**
 * Overall progress % = completedDays / totalDays * 100
 */
const getOverallPct = (challenge) => {
  const completed = getCompletedCount(challenge.dailyLogs);
  return Math.round((completed / challenge.durationDays) * 100);
};

/**
 * Current streak (consecutive completed days ending today or yesterday)
 */
const getCurrentStreak = (challenge) => {
  const logMap = {};
  challenge.dailyLogs.forEach((l) => {
    if (l.completed) logMap[l.date] = true;
  });

  let streak = 0;
  const cursor = new Date(today + "T00:00:00");

  // Start from today and walk backwards
  while (true) {
    const ds = toDateStr(cursor);
    // Also accept if streak started earlier
    if (logMap[ds]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // Allow one gap (yesterday) to start the streak check
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        const prevDs = toDateStr(cursor);
        if (logMap[prevDs]) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  return streak;
};

const getCategoryInfo = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

const getDifficultyInfo = (id) =>
  DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[1];

const getDaysRemaining = (startDate, durationDays) => {
  const end = new Date(startDate + "T00:00:00");
  end.setDate(end.getDate() + durationDays - 1);
  const todayD = new Date(today + "T00:00:00");
  const diff = Math.floor((end - todayD) / 86400000);
  return Math.max(diff, 0);
};

const isChallengeDone = (startDate, durationDays) => {
  const end = new Date(startDate + "T00:00:00");
  end.setDate(end.getDate() + durationDays - 1);
  const todayD = new Date(today + "T00:00:00");
  return todayD > end;
};

const isChallengeNotStarted = (startDate) => {
  return today < startDate;
};

// ─── Circular Progress Ring ───────────────────────────────────────────────────

const ProgressRing = ({ pct, color, size = 80, strokeWidth = 7 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
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
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
};

// ─── Mini Calendar (detail view) ─────────────────────────────────────────────

const MiniCalendar = ({ challenge, onLogDay }) => {
  const [viewMonth, setViewMonth] = useState(() => {
    const start = new Date(challenge.startDate + "T00:00:00");
    return { year: start.getFullYear(), month: start.getMonth() };
  });

  const logMap = useMemo(() => {
    const m = {};
    challenge.dailyLogs.forEach((l) => {
      m[l.date] = l;
    });
    return m;
  }, [challenge.dailyLogs]);

  const daysInMonth = new Date(
    viewMonth.year,
    viewMonth.month + 1,
    0,
  ).getDate();
  const firstDow = new Date(viewMonth.year, viewMonth.month, 1).getDay();

  const endDate = new Date(challenge.startDate + "T00:00:00");
  endDate.setDate(endDate.getDate() + challenge.durationDays - 1);

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = new Date(
    viewMonth.year,
    viewMonth.month,
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    const d = new Date(viewMonth.year, viewMonth.month - 1);
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
  };
  const nextMonth = () => {
    const d = new Date(viewMonth.year, viewMonth.month + 1);
    setViewMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          <FaChevronLeft size={14} />
        </button>
        <span
          className="font-semibold text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {monthName}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium py-1"
            style={{ color: "var(--text-muted)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const inRange =
            dateStr >= challenge.startDate && dateStr <= toDateStr(endDate);
          const logEntry = logMap[dateStr];
          const isToday = dateStr === today;
          const isFuture = dateStr > today;
          const isCompleted = logEntry?.completed;
          const isSkipped = logEntry?.mood === "skipped";

          let bgColor = "transparent";
          let textColor = "var(--text-muted)";
          let border = "1px solid transparent";
          let cursor = "default";

          if (inRange) {
            if (isCompleted) {
              bgColor = challenge.color + "33";
              textColor = challenge.color;
              border = `1px solid ${challenge.color}66`;
            } else if (isSkipped) {
              bgColor = "#94a3b833";
              textColor = "#94a3b8";
              border = "1px solid #94a3b866";
            } else if (!isFuture) {
              bgColor = "#ef444422";
              textColor = "#ef4444";
              border = "1px solid #ef444444";
            } else {
              textColor = "var(--text-secondary)";
            }
            if (!isFuture && !challenge.isArchived) cursor = "pointer";
          }
          if (isToday && inRange) {
            border = `2px solid ${challenge.color}`;
          }

          return (
            <button
              key={dateStr}
              disabled={!inRange || isFuture || challenge.isArchived}
              onClick={() =>
                inRange &&
                !isFuture &&
                !challenge.isArchived &&
                onLogDay(dateStr, logEntry)
              }
              className="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                border,
                cursor,
                opacity: inRange ? 1 : 0.3,
              }}
              title={dateStr}
            >
              {isToday ? (
                <span className="relative flex items-center justify-center w-full h-full">
                  {day}
                </span>
              ) : (
                day
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {[
          {
            color: challenge.color + "33",
            border: challenge.color + "66",
            label: "Done",
          },
          { color: "#ef444422", border: "#ef444444", label: "Missed" },
          { color: "#94a3b833", border: "#94a3b866", label: "Skipped" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: l.color,
                border: `1px solid ${l.border}`,
              }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Challenge Card ───────────────────────────────────────────────────────────

const ChallengeCard = ({
  challenge,
  onCheckIn,
  onOpen,
  onDelete,
  onArchive,
  onEdit,
}) => {
  const { isDark } = useTheme();
  const cat = getCategoryInfo(challenge.category);
  const diff = getDifficultyInfo(challenge.difficulty);
  const pct = getCompletionPct(challenge);
  const overallPct = getOverallPct(challenge);
  const streak = getCurrentStreak(challenge);
  const daysRemaining = getDaysRemaining(
    challenge.startDate,
    challenge.durationDays,
  );
  const completed = getCompletedCount(challenge.dailyLogs);
  const done = isChallengeDone(challenge.startDate, challenge.durationDays);
  const notStarted = isChallengeNotStarted(challenge.startDate);
  const todayLog = challenge.dailyLogs.find((l) => l.date === today);
  const checkedToday = todayLog?.completed;
  const [menuOpen, setMenuOpen] = useState(false);

  const statusBadge = done
    ? {
        label: "Completed",
        color: "#10b981",
        bg: isDark ? "#064e3b" : "#d1fae5",
      }
    : notStarted
      ? {
          label: "Not Started",
          color: "#6366f1",
          bg: isDark ? "#1e1b4b" : "#e0e7ff",
        }
      : challenge.isArchived
        ? {
            label: "Archived",
            color: "#94a3b8",
            bg: isDark ? "#1e293b" : "#f1f5f9",
          }
        : {
            label: "Active",
            color: "#f59e0b",
            bg: isDark ? "#451a03" : "#fef3c7",
          };

  return (
    <div
      className="rounded-2xl overflow-hidden relative transition-all duration-200 hover:shadow-lg cursor-pointer"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: isDark
          ? "0 2px 8px rgba(0,0,0,0.3)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onClick={() => onOpen(challenge)}
    >
      {/* Color bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: challenge.color }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: cat.color + "22", color: cat.color }}
            >
              <cat.icon size={16} />
            </div>
            <div className="min-w-0">
              <h3
                className="font-semibold text-sm leading-tight truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {challenge.title}
              </h3>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {cat.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                color: statusBadge.color,
                backgroundColor: statusBadge.bg,
              }}
            >
              {statusBadge.label}
            </span>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <FaEllipsisV size={12} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-8 z-20 rounded-xl shadow-xl py-1 w-40"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {[
                    {
                      icon: FaEdit,
                      label: "Edit",
                      action: () => {
                        onEdit(challenge);
                        setMenuOpen(false);
                      },
                    },
                    {
                      icon: FaArchive,
                      label: challenge.isArchived ? "Unarchive" : "Archive",
                      action: () => {
                        onArchive(challenge._id);
                        setMenuOpen(false);
                      },
                    },
                    {
                      icon: FaTrash,
                      label: "Delete",
                      action: () => {
                        onDelete(challenge._id);
                        setMenuOpen(false);
                      },
                      danger: true,
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:opacity-80"
                      style={{
                        color: item.danger
                          ? "#ef4444"
                          : "var(--text-secondary)",
                      }}
                    >
                      <item.icon size={12} />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative shrink-0">
            <ProgressRing
              pct={pct}
              color={challenge.color}
              size={72}
              strokeWidth={6}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-base font-bold"
                style={{ color: challenge.color }}
              >
                {pct}%
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Overall
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {overallPct}%
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden mb-2"
              style={{ backgroundColor: "var(--border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${overallPct}%`,
                  backgroundColor: challenge.color,
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {completed}
                </span>
                /{challenge.durationDays} days
              </span>
              {streak > 0 && (
                <span
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: "#f97316" }}
                >
                  <FaFire size={11} />
                  {streak}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Difficulty + days remaining */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              color: diff.color,
              backgroundColor: isDark ? diff.color + "33" : diff.bg,
            }}
          >
            {diff.label}
          </span>
          {!done && !notStarted && !challenge.isArchived && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              <span
                className="font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {daysRemaining}
              </span>{" "}
              days left
            </span>
          )}
          {done && (
            <span
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "#10b981" }}
            >
              <FaTrophy size={11} /> Finished
            </span>
          )}
          {notStarted && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Starts {challenge.startDate}
            </span>
          )}
        </div>

        {/* Today check-in */}
        {!done && !notStarted && !challenge.isArchived && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCheckIn(challenge, todayLog);
            }}
            className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
            style={
              checkedToday
                ? {
                    backgroundColor: challenge.color + "22",
                    color: challenge.color,
                    border: `1px solid ${challenge.color}66`,
                  }
                : {
                    backgroundColor: challenge.color,
                    color: "#fff",
                    boxShadow: `0 4px 12px ${challenge.color}66`,
                  }
            }
          >
            {checkedToday ? (
              <>
                <FaCheckCircle size={14} /> Done today!
              </>
            ) : (
              <>
                <FaBolt size={14} /> Check in today
              </>
            )}
          </button>
        )}
        {done && (
          <div
            className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ backgroundColor: "#10b98122", color: "#10b981" }}
          >
            <FaTrophy size={14} /> Challenge Complete!
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Day Log Modal ────────────────────────────────────────────────────────────

const DayLogModal = ({ challenge, dateStr, existingLog, onSave, onClose }) => {
  const [completed, setCompleted] = useState(existingLog?.completed ?? true);
  const [note, setNote] = useState(existingLog?.note ?? "");
  const [mood, setMood] = useState(existingLog?.mood ?? "");

  const handleSave = () => {
    onSave({ date: dateStr, completed, note, mood });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h3
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Log Day
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {dateStr}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ color: "var(--text-muted)" }}
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Completed toggle */}
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Completed today?
            </span>
            <button
              onClick={() => setCompleted(!completed)}
              className="w-12 h-6 rounded-full relative transition-colors duration-200"
              style={{
                backgroundColor: completed ? challenge.color : "var(--border)",
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                style={{
                  transform: completed ? "translateX(26px)" : "translateX(2px)",
                }}
              />
            </button>
          </div>

          {/* Mood selector */}
          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              How was it?
            </label>
            <div className="flex gap-2 flex-wrap">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(mood === m.id ? "" : m.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={
                    mood === m.id
                      ? {
                          backgroundColor: m.color + "33",
                          color: m.color,
                          border: `1px solid ${m.color}66`,
                        }
                      : {
                          backgroundColor: "var(--bg-base)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  <m.icon size={12} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label
              className="text-sm font-medium block mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did it go? Any obstacles?"
              rows={3}
              className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none transition-all"
              style={{
                backgroundColor: "var(--bg-base)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
            style={{ backgroundColor: challenge.color }}
          >
            Save Log
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Challenge Detail Modal ───────────────────────────────────────────────────

const ChallengeDetail = ({ challenge, onClose, onLogDay, onCheckIn }) => {
  const cat = getCategoryInfo(challenge.category);
  const pct = getCompletionPct(challenge);
  const overallPct = getOverallPct(challenge);
  const streak = getCurrentStreak(challenge);
  const completed = getCompletedCount(challenge.dailyLogs);
  const elapsed = getDaysElapsed(challenge.startDate, challenge.durationDays);
  const done = isChallengeDone(challenge.startDate, challenge.durationDays);
  const todayLog = challenge.dailyLogs.find((l) => l.date === today);
  const checkedToday = todayLog?.completed;

  // Achievements
  const achievements = [];
  if (completed >= 7)
    achievements.push({ icon: FaMedal, label: "7 Day Club", color: "#f59e0b" });
  if (completed >= 21)
    achievements.push({
      icon: FaMedal,
      label: "21 Day Master",
      color: "#8b5cf6",
    });
  if (completed >= 30)
    achievements.push({
      icon: FaTrophy,
      label: "30 Day Champion",
      color: "#ef4444",
    });
  if (streak >= 7)
    achievements.push({
      icon: FaFire,
      label: "7 Day Streak",
      color: "#f97316",
    });
  if (overallPct >= 100)
    achievements.push({
      icon: FaStar,
      label: "Perfect Completion",
      color: "#10b981",
    });

  // Mood breakdown
  const moodCounts = {};
  challenge.dailyLogs.forEach((l) => {
    if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color banner */}
        <div
          className="h-2 rounded-t-3xl sm:rounded-t-3xl"
          style={{ backgroundColor: challenge.color }}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: cat.color + "22", color: cat.color }}
              >
                <cat.icon size={20} />
              </div>
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {challenge.title}
                </h2>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {cat.label} · {challenge.durationDays} days
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl"
              style={{
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-base)",
              }}
            >
              <FaTimes />
            </button>
          </div>

          {challenge.description && (
            <p
              className="text-sm mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              {challenge.description}
            </p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              {
                label: "Completion Rate",
                value: `${pct}%`,
                icon: FaChartLine,
                color: challenge.color,
              },
              {
                label: "Days Done",
                value: `${completed}/${challenge.durationDays}`,
                icon: FaCalendarAlt,
                color: "#6366f1",
              },
              {
                label: "Current Streak",
                value: streak,
                icon: FaFire,
                color: "#f97316",
              },
              {
                label: "Elapsed Days",
                value: `${elapsed}/${challenge.durationDays}`,
                icon: FaFlag,
                color: "#10b981",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-3 flex flex-col items-center gap-1"
                style={{
                  backgroundColor: "var(--bg-base)",
                  border: "1px solid var(--border)",
                }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
                <span
                  className="text-base font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs text-center leading-tight"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div className="mb-5 space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Day Completion Rate
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: challenge.color }}
                >
                  {pct}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--border)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: challenge.color }}
                />
              </div>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {completed} completed out of {elapsed} days elapsed
              </p>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Overall Progress
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "#6366f1" }}
                >
                  {overallPct}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--border)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${overallPct}%`,
                    backgroundColor: "#6366f1",
                  }}
                />
              </div>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {completed} completed out of {challenge.durationDays} total days
              </p>
            </div>
          </div>

          {/* Today check-in */}
          {!done &&
            !isChallengeNotStarted(challenge.startDate) &&
            !challenge.isArchived && (
              <button
                onClick={() => onCheckIn(challenge, todayLog)}
                className="w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 mb-5 transition-all"
                style={
                  checkedToday
                    ? {
                        backgroundColor: challenge.color + "22",
                        color: challenge.color,
                        border: `1px solid ${challenge.color}66`,
                      }
                    : {
                        backgroundColor: challenge.color,
                        color: "#fff",
                        boxShadow: `0 4px 16px ${challenge.color}55`,
                      }
                }
              >
                {checkedToday ? (
                  <>
                    <FaCheckCircle /> Today is logged!
                  </>
                ) : (
                  <>
                    <FaBolt /> Log Today ({today})
                  </>
                )}
              </button>
            )}

          {/* Calendar */}
          <div
            className="rounded-2xl p-4 mb-5"
            style={{
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
            }}
          >
            <h4
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              <FaCalendarAlt className="inline mr-2" size={13} />
              Calendar
            </h4>
            <MiniCalendar
              challenge={challenge}
              onLogDay={(dateStr, existing) =>
                onLogDay(challenge, dateStr, existing)
              }
            />
          </div>

          {/* Mood breakdown */}
          {Object.keys(moodCounts).length > 0 && (
            <div
              className="rounded-2xl p-4 mb-5"
              style={{
                backgroundColor: "var(--bg-base)",
                border: "1px solid var(--border)",
              }}
            >
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Mood Breakdown
              </h4>
              <div className="flex flex-wrap gap-2">
                {MOODS.filter((m) => moodCounts[m.id]).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                    style={{ backgroundColor: m.color + "22", color: m.color }}
                  >
                    <m.icon size={12} />
                    <span>{m.label}</span>
                    <span className="font-bold">{moodCounts[m.id]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: "var(--bg-base)",
                border: "1px solid var(--border)",
              }}
            >
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                <FaTrophy className="inline mr-2" size={13} />
                Achievements
              </h4>
              <div className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <div
                    key={a.label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
                    style={{ backgroundColor: a.color + "22", color: a.color }}
                  >
                    <a.icon size={12} />
                    {a.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

const ChallengeFormModal = ({ onSave, onClose, initial }) => {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    category: initial?.category || "fitness",
    difficulty: initial?.difficulty || "medium",
    startDate: initial?.startDate || today,
    durationDays: initial?.durationDays || 30,
    targetDescription: initial?.targetDescription || "",
    color: initial?.color || "#6366f1",
  });

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const endDate = useMemo(() => {
    const d = new Date(form.startDate + "T00:00:00");
    d.setDate(d.getDate() + Number(form.durationDays) - 1);
    return toDateStr(d);
  }, [form.startDate, form.durationDays]);

  const isValid = form.title.trim() && form.durationDays >= 1 && form.startDate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 pt-5 pb-4 flex items-center justify-between sticky top-0 z-10"
          style={{
            backgroundColor: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {initial ? "Edit Challenge" : "New Challenge"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl"
            style={{
              color: "var(--text-muted)",
              backgroundColor: "var(--bg-base)",
            }}
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label
              className="text-sm font-medium block mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              Challenge Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. 30-Day Morning Run"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-base)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="text-sm font-medium block mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="What do you want to achieve?"
              rows={2}
              className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none"
              style={{
                backgroundColor: "var(--bg-base)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setField("category", c.id)}
                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs transition-all"
                  style={
                    form.category === c.id
                      ? {
                          backgroundColor: c.color + "33",
                          color: c.color,
                          border: `2px solid ${c.color}`,
                        }
                      : {
                          backgroundColor: "var(--bg-base)",
                          color: "var(--text-muted)",
                          border: "2px solid transparent",
                        }
                  }
                >
                  <c.icon size={14} />
                  <span className="leading-none">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Difficulty
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setField("difficulty", d.id)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                  style={
                    form.difficulty === d.id
                      ? {
                          backgroundColor: isDark ? d.color + "44" : d.bg,
                          color: d.color,
                          border: `2px solid ${d.color}`,
                        }
                      : {
                          backgroundColor: "var(--bg-base)",
                          color: "var(--text-muted)",
                          border: "2px solid transparent",
                        }
                  }
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Start Date *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                className="text-sm font-medium block mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Duration (days) *
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={form.durationDays}
                onChange={(e) =>
                  setField("durationDays", Number(e.target.value))
                }
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Quick durations */}
          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_DURATIONS.map((q) => (
                <button
                  key={q.value}
                  onClick={() => setField("durationDays", q.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={
                    form.durationDays === q.value
                      ? {
                          backgroundColor: form.color + "33",
                          color: form.color,
                          border: `1px solid ${form.color}`,
                        }
                      : {
                          backgroundColor: "var(--bg-base)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* End date preview */}
          <div
            className="rounded-xl px-3 py-2 flex items-center justify-between"
            style={{
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
            }}
          >
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Ends on
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {endDate}
            </span>
          </div>

          {/* Color picker */}
          <div>
            <label
              className="text-sm font-medium block mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setField("color", c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    backgroundColor: c,
                    border:
                      form.color === c
                        ? "3px solid var(--text-primary)"
                        : "3px solid transparent",
                    transform: form.color === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => setField("color", e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-none bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Target */}
          <div>
            <label
              className="text-sm font-medium block mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              Success Target (optional)
            </label>
            <input
              value={form.targetDescription}
              onChange={(e) => setField("targetDescription", e.target.value)}
              placeholder="e.g. Run 5km every morning"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-base)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Actions */}
          <div className="pt-2 pb-2">
            <button
              onClick={() => isValid && onSave(form)}
              disabled={!isValid}
              className="w-full py-3 rounded-2xl font-semibold text-white transition-all"
              style={{
                backgroundColor: form.color,
                opacity: isValid ? 1 : 0.5,
                boxShadow: isValid ? `0 4px 16px ${form.color}55` : "none",
              }}
            >
              {initial ? "Save Changes" : `Start Challenge 🔥`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const { user } = useAuth();
  useTheme();
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active"); // all | active | done | archived
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailChallenge, setDetailChallenge] = useState(null);
  const [dayLogState, setDayLogState] = useState(null); // { challenge, dateStr, existingLog }

  useEffect(() => {
    if (user?.email) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [active, archived, statsData] = await Promise.all([
        challengeApi.getChallenges(user.email, false),
        challengeApi.getChallenges(user.email, true),
        challengeApi.getStats(user.email),
      ]);
      setChallenges([...active, ...archived]);
      setStats(statsData);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const refreshChallenge = async (id) => {
    try {
      const updated = await challengeApi.getChallengeById(id);
      setChallenges((prev) => prev.map((c) => (c._id === id ? updated : c)));
      if (detailChallenge?._id === id) setDetailChallenge(updated);
      // Refresh stats
      const statsData = await challengeApi.getStats(user.email);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (form) => {
    try {
      const newC = await challengeApi.createChallenge({
        ...form,
        userId: user.email,
      });
      setChallenges((prev) => [newC, ...prev]);
      setShowForm(false);
      const statsData = await challengeApi.getStats(user.email);
      setStats(statsData);
    } catch {
      alert("Failed to create challenge");
    }
  };

  const handleEdit = async (form) => {
    try {
      await challengeApi.updateChallenge(editTarget._id, form);
      await refreshChallenge(editTarget._id);
      setEditTarget(null);
    } catch {
      alert("Failed to update challenge");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this challenge? This cannot be undone.")) return;
    try {
      await challengeApi.deleteChallenge(id);
      setChallenges((prev) => prev.filter((c) => c._id !== id));
      if (detailChallenge?._id === id) setDetailChallenge(null);
      const statsData = await challengeApi.getStats(user.email);
      setStats(statsData);
    } catch {
      alert("Failed to delete");
    }
  };

  const handleArchive = async (id) => {
    try {
      const updated = await challengeApi.toggleArchive(id);
      setChallenges((prev) => prev.map((c) => (c._id === id ? updated : c)));
      if (detailChallenge?._id === id) setDetailChallenge(updated);
    } catch {
      alert("Failed to archive");
    }
  };

  // Called from card "Check in today" or from detail "Log today"
  const handleCheckIn = (challenge, existingLog) => {
    setDayLogState({ challenge, dateStr: today, existingLog });
  };

  // Called from calendar cell
  const handleLogDay = (challenge, dateStr, existingLog) => {
    setDayLogState({ challenge, dateStr, existingLog });
  };

  const handleSaveLog = async ({ date, completed, note, mood }) => {
    const { challenge } = dayLogState;
    try {
      await challengeApi.logDay(challenge._id, { date, completed, note, mood });
      await refreshChallenge(challenge._id);
      setDayLogState(null);
    } catch {
      alert("Failed to log day");
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const done = isChallengeDone(c.startDate, c.durationDays);
      let statusOk = false;
      if (filter === "all") statusOk = !c.isArchived;
      else if (filter === "active") statusOk = !c.isArchived && !done;
      else if (filter === "done") statusOk = !c.isArchived && done;
      else if (filter === "archived") statusOk = c.isArchived;
      if (!statusOk) return false;
      if (categoryFilter !== "all" && c.category !== categoryFilter)
        return false;
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [challenges, filter, categoryFilter, search]);

  // ── Stats helpers ──────────────────────────────────────────────────────────
  const activeChallenges = challenges.filter(
    (c) => !c.isArchived && !isChallengeDone(c.startDate, c.durationDays),
  );
  const avgRateToday = activeChallenges.length
    ? Math.round(
        activeChallenges.reduce((acc, c) => acc + getCompletionPct(c), 0) /
          activeChallenges.length,
      )
    : 0;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: "var(--border)", borderTopColor: "#6366f1" }}
          />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading challenges...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-12"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 px-4 sm:px-6 py-4"
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <FaTrophy style={{ color: "#f59e0b" }} /> Challenges
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {activeChallenges.length} active · {avgRateToday}% avg completion
              today
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              backgroundColor: "#6366f1",
              boxShadow: "0 4px 12px #6366f166",
            }}
          >
            <FaPlus size={13} /> New Challenge
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* ── Stats Banner ────────────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total",
                value: stats.totalChallenges,
                icon: FaFlag,
                color: "#6366f1",
              },
              {
                label: "Active",
                value: stats.activeChallenges,
                icon: FaBolt,
                color: "#f59e0b",
              },
              {
                label: "Days Done",
                value: stats.totalDaysCompleted,
                icon: FaCheck,
                color: "#10b981",
              },
              {
                label: "Best Streak",
                value: stats.longestStreak,
                icon: FaFire,
                color: "#f97316",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: s.color + "22", color: s.color }}
                >
                  <s.icon size={16} />
                </div>
                <div>
                  <div
                    className="text-xl font-bold leading-none"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "active", label: "Active" },
              { id: "done", label: "Completed" },
              { id: "all", label: "All" },
              { id: "archived", label: "Archived" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                style={
                  filter === t.id
                    ? { backgroundColor: "#6366f1", color: "#fff" }
                    : {
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search + category */}
          <div className="flex gap-2 flex-col sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search challenges..."
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Challenge Grid ───────────────────────────────────────────────── */}
        {filteredChallenges.length === 0 ? (
          <div
            className="rounded-2xl p-12 flex flex-col items-center justify-center"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px dashed var(--border)",
            }}
          >
            <FaTrophy
              size={36}
              style={{ color: "var(--text-muted)", marginBottom: 12 }}
            />
            <p
              className="font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {filter === "active"
                ? "No active challenges"
                : "No challenges found"}
            </p>
            <p
              className="text-sm mb-5 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              {filter === "active"
                ? "Start a new challenge and build a streak!"
                : "Try a different filter or search term."}
            </p>
            {filter === "active" && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#6366f1" }}
              >
                <FaPlus /> Start Your First Challenge
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((c) => (
              <ChallengeCard
                key={c._id}
                challenge={c}
                onCheckIn={handleCheckIn}
                onOpen={(ch) => setDetailChallenge(ch)}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onEdit={(ch) => setEditTarget(ch)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showForm && (
        <ChallengeFormModal
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}
      {editTarget && (
        <ChallengeFormModal
          initial={editTarget}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}
      {detailChallenge && (
        <ChallengeDetail
          challenge={
            challenges.find((c) => c._id === detailChallenge._id) ||
            detailChallenge
          }
          onClose={() => setDetailChallenge(null)}
          onCheckIn={handleCheckIn}
          onLogDay={handleLogDay}
        />
      )}
      {dayLogState && (
        <DayLogModal
          challenge={dayLogState.challenge}
          dateStr={dayLogState.dateStr}
          existingLog={dayLogState.existingLog}
          onSave={handleSaveLog}
          onClose={() => setDayLogState(null)}
        />
      )}
    </div>
  );
}
