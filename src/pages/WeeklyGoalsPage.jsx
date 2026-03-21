import { useState, useEffect, useMemo } from "react";
import {
  FaPlus, FaTimes, FaCheckCircle, FaCircle,
  FaCalendarAlt, FaFire, FaChartBar, FaClock,
  FaLayerGroup, FaBullseye, FaChevronRight,
  FaFlagCheckered,
} from "react-icons/fa";
import { weeklyGoalApi } from "../api/weeklyGoalApi";
import { useAuth } from "../context/AuthContext";

/* ── helpers ───────────────────────────────────────── */
const fmtShort = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const fmtRange = (s, e) =>
  `${fmtShort(s)} – ${new Date(e).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })}`;

const daysDiff = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86400000);

const PRIORITIES = ["High", "Medium", "Low"];
const PRIO_PREFIX = { High: "[H]", Medium: "[M]", Low: "[L]" };
const PRIO_COLOR  = { High: "#EF4444", Medium: "#F59E0B", Low: "#10B981" };
const PRIO_BG     = { High: "#FEF2F2", Medium: "#FFFBEB", Low: "#F0FDF4" };

const encodeTitle = (title, prio) =>
  prio ? `${PRIO_PREFIX[prio]}${title}` : title;

const decodeTitle = (raw = "") => {
  for (const p of PRIORITIES) {
    if (raw.startsWith(PRIO_PREFIX[p]))
      return { title: raw.slice(PRIO_PREFIX[p].length), priority: p };
  }
  return { title: raw, priority: null };
};

const COLORS = [
  "#6366F1","#8B5CF6","#EC4899","#EF4444",
  "#F59E0B","#10B981","#06B6D4","#3B82F6",
];

/* ═══════════════════════════════════════════════════════
   Sub-components defined OUTSIDE the parent to prevent
   React remounting them on every parent re-render,
   which caused the input focus loss.
═══════════════════════════════════════════════════════ */

const TopicRow = ({ topic, goalId, goalColor, onToggle, onDelete }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "7px 0", borderBottom: "1px solid var(--border)",
    opacity: topic.completed ? 0.55 : 1,
  }}>
    <button
      onClick={() => onToggle(goalId, topic._id)}
      style={{ flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      {topic.completed
        ? <FaCheckCircle size={17} style={{ color: goalColor }} />
        : <FaCircle     size={17} style={{ color: "#D1D5DB"  }} />}
    </button>
    <span style={{
      flex: 1, fontSize: 13, color: "var(--text-secondary)",
      textDecoration: topic.completed ? "line-through" : "none",
    }}>
      {topic.title}
    </span>
    <button
      onClick={() => onDelete(goalId, topic._id)}
      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#CBD5E1" }}
    >
      <FaTimes size={11} />
    </button>
  </div>
);

const AddTopicSection = ({ goal, topicInput, onInputChange, onAdd }) => (
  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
    <div style={{ display: "flex", gap: 8 }}>
      <input
        type="text"
        placeholder="Add a task and press Enter..."
        value={topicInput}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
        style={{
          flex: 1, fontSize: 13, padding: "8px 12px", borderRadius: 9,
          border: "1.5px solid var(--border-strong)",
          background: "var(--input-bg)", color: "var(--text-secondary)", outline: "none",
        }}
      />
      <button
        onClick={onAdd}
        disabled={!topicInput.trim()}
        style={{
          padding: "8px 14px", borderRadius: 9,
          background: goal.color, color: "#fff",
          border: "none", cursor: "pointer", fontWeight: 700,
          opacity: !topicInput.trim() ? 0.4 : 1,
        }}
      >
        <FaPlus size={12} />
      </button>
    </div>
  </div>
);

const TimelineBar = ({ goal, today }) => {
  const start   = new Date(goal.weekStart); start.setHours(0, 0, 0, 0);
  const end     = new Date(goal.weekEnd);   end.setHours(23, 59, 59, 999);
  const total   = Math.max(daysDiff(start, end), 1);
  const elapsed = Math.min(Math.max(daysDiff(start, today), 0), total);
  const pct     = Math.round((elapsed / total) * 100);
  const inRange = today >= start && today <= end;

  return (
    <div style={{ padding: "10px 16px 6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 500 }}>{fmtShort(start)}</span>
        <span style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 500 }}>{fmtShort(end)}</span>
      </div>
      <div style={{ position: "relative", height: 8, background: "var(--border)", borderRadius: 999 }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${pct}%`, borderRadius: 999,
          background: `linear-gradient(90deg, ${goal.color}, ${goal.color}99)`,
          transition: "width 0.4s ease",
        }} />
        {inRange && (
          <div style={{
            position: "absolute", top: "50%", left: `${pct}%`,
            transform: "translate(-50%,-50%)",
            width: 14, height: 14, borderRadius: "50%",
            background: goal.color, border: "2.5px solid var(--card-bg)",
            boxShadow: `0 0 0 2px ${goal.color}55`,
          }} title="Today" />
        )}
      </div>
      <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 5, textAlign: "right" }}>
        {pct}% of timeline elapsed
      </p>
    </div>
  );
};

const RangeCard = ({
  goal, today,
  collapsedGoals, setCollapsedGoals,
  topicInput,
  onInputChange, onAdd,
  onToggleTopic, onDeleteTopic,
  onDeleteGoal,
}) => {
  const progress  = goal.topics.length
    ? Math.round((goal.topics.filter(t => t.completed).length / goal.topics.length) * 100)
    : 0;
  const completed = goal.topics.filter(t => t.completed).length;
  const isDone    = goal.topics.length > 0 && progress === 100;
  const end       = new Date(goal.weekEnd); end.setHours(23, 59, 59, 999);
  const start     = new Date(goal.weekStart);
  const daysLeft  = daysDiff(today, end);
  const duration  = daysDiff(start, end);
  const isOverdue = daysLeft < 0;
  const isExpanded = !collapsedGoals.has(goal._id);

  const sortedTopics = [...goal.topics].sort(
    (a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0)
  );

  return (
    <div style={{
      borderRadius: 18, overflow: "hidden",
      background: "var(--card-bg)",
      border: isDone ? `2px solid ${goal.color}77` : "1px solid var(--border)",
      boxShadow: isDone ? `0 0 24px ${goal.color}22` : "0 2px 12px rgba(0,0,0,0.05)",
    }}>
      {/* header */}
      <div style={{
        padding: "16px 18px",
        background: `linear-gradient(135deg, ${goal.color}f0, ${goal.color}88)`,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(255,255,255,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FaCalendarAlt size={16} color="#fff" />
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, margin: 0, letterSpacing: -0.3 }}>
                {goal.subject}
              </p>
              <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 11, margin: "2px 0 0" }}>
                {fmtRange(goal.weekStart, goal.weekEnd)} · {duration + 1}d
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {isDone && <span style={{ fontSize: 16 }}>🎉</span>}
            <span style={{
              padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: isOverdue ? "#FEF2F2" : "rgba(255,255,255,0.25)",
              color: isOverdue ? "#EF4444" : "#fff",
            }}>
              {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Today!" : `${daysLeft}d left`}
            </span>
            <button
              onClick={() => onDeleteGoal(goal._id)}
              style={{ background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}
            >
              <FaTimes size={12} color="#fff" />
            </button>
          </div>
        </div>
        {/* progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.3)", borderRadius: 999 }}>
            <div style={{
              height: "100%", borderRadius: 999, background: "#fff",
              width: `${progress}%`, transition: "width 0.5s ease",
            }} />
          </div>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, minWidth: 34 }}>{progress}%</span>
          <span style={{ color: "rgba(255,255,255,0.78)", fontSize: 11 }}>
            {completed}/{goal.topics.length}
          </span>
        </div>
      </div>

      {/* timeline */}
      <TimelineBar goal={goal} today={today} />

      {/* expand toggle */}
      <button
        onClick={() => setCollapsedGoals(prev => {
          const next = new Set(prev);
          if (next.has(goal._id)) next.delete(goal._id); else next.add(goal._id);
          return next;
        })}
        style={{
          width: "100%", background: "none", border: "none",
          borderTop: "1px solid var(--border)",
          padding: "9px 18px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "var(--text-muted)", fontSize: 12, fontWeight: 600,
        }}
      >
        <span>{isExpanded ? "Hide tasks" : `Tasks (${goal.topics.length})`}</span>
        <FaChevronRight size={10} style={{
          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }} />
      </button>

      {/* task list */}
      {isExpanded && (
        <div>
          <div style={{ padding: "4px 16px 0", maxHeight: 260, overflowY: "auto" }}>
            {sortedTopics.length === 0 && (
              <p style={{
                color: "var(--text-faint)", fontSize: 13,
                textAlign: "center", padding: "18px 0", fontStyle: "italic",
              }}>
                No tasks yet — add one below
              </p>
            )}
            {sortedTopics.map((t) => (
              <TopicRow
                key={t._id} topic={t}
                goalId={goal._id} goalColor={goal.color}
                onToggle={onToggleTopic} onDelete={onDeleteTopic}
              />
            ))}
          </div>
          <AddTopicSection
            goal={goal}
            topicInput={topicInput}
            onInputChange={onInputChange}
            onAdd={onAdd}
          />
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   Main page component
═══════════════════════════════════════════════════════ */
const WeeklyGoalsPage = () => {
  const { user } = useAuth();
  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal]       = useState(false);
  const [newLabel, setNewLabel]         = useState("");
  const [newColor, setNewColor]         = useState(COLORS[0]);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate]     = useState("");

  const [topicInputs, setTopicInputs] = useState({});
  const [collapsedGoals, setCollapsedGoals] = useState(new Set());

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    weeklyGoalApi.getGoals(user.email)
      .then(setGoals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.email]);

  /* stats */
  const totalTopics     = goals.reduce((s, g) => s + g.topics.length, 0);
  const completedTopics = goals.reduce((s, g) => s + g.topics.filter(t => t.completed).length, 0);
  const overallPct      = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const activeRanges    = goals.filter(g => {
    const end = new Date(g.weekEnd); end.setHours(23,59,59,999); return end >= today;
  }).length;

  /* handlers */
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newLabel.trim() || !newStartDate || !newEndDate) return;
    try {
      const goal = await weeklyGoalApi.createGoal({
        userId: user.email,
        weekStart: new Date(newStartDate + "T00:00:00").toISOString(),
        weekEnd:   new Date(newEndDate   + "T23:59:59").toISOString(),
        subject: newLabel.trim(), color: newColor, topics: [],
      });
      setGoals(prev => [goal, ...prev]);
      setNewLabel(""); setNewColor(COLORS[0]);
      setNewStartDate(""); setNewEndDate("");
      setShowModal(false);
      setExpandedGoal(goal._id);
    } catch (err) { console.error(err); }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await weeklyGoalApi.deleteGoal(id);
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleAddTopic = async (goalId) => {
    const raw = (topicInputs[goalId] || "").trim();
    if (!raw) return;
    try {
      const updated = await weeklyGoalApi.addTopic(goalId, raw);
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g));
      setTopicInputs(prev => ({ ...prev, [goalId]: "" }));
    } catch (err) { console.error(err); }
  };

  const handleToggleTopic = async (goalId, topicId) => {
    try {
      const updated = await weeklyGoalApi.toggleTopic(goalId, topicId);
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTopic = async (goalId, topicId) => {
    try {
      const updated = await weeklyGoalApi.deleteTopic(goalId, topicId);
      setGoals(prev => prev.map(g => g._id === goalId ? updated : g));
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "4px solid #6366F1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-faint)", fontWeight: 500 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "20px 16px 40px" }}>
      <div style={{ width: "100%" }}>

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 26, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
              <FaBullseye style={{ color: "#6366F1" }} />
              Goals
            </h1>
            <p style={{ margin: "4px 0 0", color: "var(--text-faint)", fontSize: 13 }}>
              Plan and track your goals across any date range
            </p>
          </div>
          <button onClick={() => setShowModal(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
          }}>
            <FaPlus size={12} /> New Date Range
          </button>
        </div>

        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 26 }}>
          {[
            { icon: <FaLayerGroup size={14} />, label: "Total Ranges",    val: goals.length,   color: "#6366F1" },
            { icon: <FaChartBar  size={14} />, label: "Overall Progress", val: `${overallPct}%`, color: "#10B981" },
            { icon: <FaFire      size={14} />, label: "Active Ranges",    val: activeRanges,   color: "#F59E0B" },
            { icon: <FaClock     size={14} />, label: "Tasks Done",       val: `${completedTopics}/${totalTopics}`, color: "#EC4899" },
          ].map(({ icon, label, val, color }) => (
            <div key={label} style={{
              padding: "14px 16px", borderRadius: 14,
              background: "var(--card-bg)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                {icon}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>{val}</p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-faint)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* cards */}
        {goals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 20px", borderRadius: 18, border: "2px dashed var(--border-strong)", background: "var(--card-bg)" }}>
            <FaFlagCheckered size={40} style={{ color: "var(--border-strong)", marginBottom: 14 }} />
            <p style={{ fontSize: 17, fontWeight: 700, color: "var(--text-faint)", margin: "0 0 6px" }}>No ranges yet</p>
            <p style={{ fontSize: 13, color: "var(--text-faint)", margin: "0 0 22px" }}>Create your first goal range and start tracking tasks.</p>
            <button onClick={() => setShowModal(true)} style={{
              padding: "11px 22px", borderRadius: 11, border: "none",
              background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>
              <FaPlus size={11} style={{ marginRight: 7 }} /> New Date Range
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {goals.map((g) => (
              <RangeCard
                key={g._id}
                goal={g}
                today={today}
                collapsedGoals={collapsedGoals}
                setCollapsedGoals={setCollapsedGoals}
                topicInput={topicInputs[g._id] || ""}
                onInputChange={(val) => setTopicInputs(prev => ({ ...prev, [g._id]: val }))}
                onAdd={() => handleAddTopic(g._id)}
                onToggleTopic={handleToggleTopic}
                onDeleteTopic={handleDeleteTopic}
                onDeleteGoal={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
          <div style={{ background: "var(--card-bg)", borderRadius: 20, width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", border: "1px solid var(--border)" }}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>New Date Range</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)" }}><FaTimes size={18} /></button>
            </div>
            <form onSubmit={handleAddGoal} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>Title</label>
                <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g. Exam Prep, Sprint 3..." required autoFocus
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14, border: "1.5px solid var(--border-strong)", background: "var(--input-bg)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[{ label: "Start Date", val: newStartDate, set: setNewStartDate, min: "" },
                  { label: "End Date",   val: newEndDate,   set: setNewEndDate,   min: newStartDate }
                ].map(({ label, val, set, min }) => (
                  <div key={label}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</label>
                    <input type="date" value={val} min={min} onChange={e => set(e.target.value)} required
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 13, border: "1.5px solid var(--border-strong)", background: "var(--input-bg)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Color</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setNewColor(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, cursor: "pointer", border: "3px solid transparent", outline: newColor === c ? `3px solid ${c}` : "none", outlineOffset: 2 }} />
                  ))}
                </div>
              </div>
              {(newLabel || newStartDate) && (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: `${newColor}12`, border: `1.5px solid ${newColor}55`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: newColor, display: "flex", alignItems: "center", justifyContent: "center" }}><FaCalendarAlt size={14} color="#fff" /></div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>{newLabel || "Range title"}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--text-faint)" }}>
                      {newStartDate && newEndDate ? fmtRange(newStartDate + "T00:00:00", newEndDate + "T00:00:00") : "Pick dates above"}
                    </p>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid var(--border-strong)", background: "none", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#2563EB", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Create Range</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default WeeklyGoalsPage;
