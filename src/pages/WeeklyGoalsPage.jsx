import { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFlagCheckered,
  FaBook,
  FaBullseye,
} from "react-icons/fa";
import { weeklyGoalApi } from "../api/weeklyGoalApi";
import { useAuth } from "../context/AuthContext";

// Helper: get the Monday of a given date's week
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper: get the Sunday of a given date's week
const getSunday = (monday) => {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const formatDateRange = (start, end) => {
  const opts = { month: "short", day: "numeric" };
  return `${new Date(start).toLocaleDateString("en-US", opts)} – ${new Date(end).toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
};

const isSameWeek = (weekStart, referenceMonday) => {
  return (
    new Date(weekStart).toDateString() ===
    new Date(referenceMonday).toDateString()
  );
};

const COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

const WeeklyGoalsPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Week offset: 0 = current week, 1 = next week, -1 = last week, etc.
  const [weekOffset, setWeekOffset] = useState(0);

  // Modals
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [addGoalWeekOffset, setAddGoalWeekOffset] = useState(0);
  const [newSubject, setNewSubject] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  // Add topic state per goal
  const [topicInputs, setTopicInputs] = useState({});

  const currentMonday = useMemo(() => {
    const base = getMonday(new Date());
    const d = new Date(base);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const currentSunday = useMemo(
    () => getSunday(currentMonday),
    [currentMonday],
  );

  const todayMonday = useMemo(() => getMonday(new Date()), []);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    weeklyGoalApi
      .getGoals(user.email)
      .then((data) => setGoals(data))
      .catch((err) => console.error("Error fetching weekly goals:", err))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const goalsForWeek = (monday) =>
    goals.filter((g) => isSameWeek(g.weekStart, monday));

  const currentWeekGoals = goalsForWeek(currentMonday);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const base = getMonday(new Date());
    const monday = new Date(base);
    monday.setDate(monday.getDate() + addGoalWeekOffset * 7);
    const sunday = getSunday(monday);

    try {
      const goal = await weeklyGoalApi.createGoal({
        userId: user.email,
        weekStart: monday.toISOString(),
        weekEnd: sunday.toISOString(),
        subject: newSubject.trim(),
        color: newColor,
        topics: [],
      });
      setGoals((prev) => [...prev, goal]);
      setNewSubject("");
      setNewColor(COLORS[0]);
      setShowAddGoal(false);
      // Navigate to that week
      setWeekOffset(addGoalWeekOffset);
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await weeklyGoalApi.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g._id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleAddTopic = async (goalId) => {
    const title = (topicInputs[goalId] || "").trim();
    if (!title) return;

    try {
      const updated = await weeklyGoalApi.addTopic(goalId, title);
      setGoals((prev) => prev.map((g) => (g._id === goalId ? updated : g)));
      setTopicInputs((prev) => ({ ...prev, [goalId]: "" }));
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };

  const handleToggleTopic = async (goalId, topicId) => {
    try {
      const updated = await weeklyGoalApi.toggleTopic(goalId, topicId);
      setGoals((prev) => prev.map((g) => (g._id === goalId ? updated : g)));
    } catch (error) {
      console.error("Error toggling topic:", error);
    }
  };

  const handleDeleteTopic = async (goalId, topicId) => {
    try {
      const updated = await weeklyGoalApi.deleteTopic(goalId, topicId);
      setGoals((prev) => prev.map((g) => (g._id === goalId ? updated : g)));
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const getProgress = (goal) => {
    if (!goal.topics.length) return 0;
    return Math.round(
      (goal.topics.filter((t) => t.completed).length / goal.topics.length) *
        100,
    );
  };

  const weekLabel = () => {
    if (weekOffset === 0) return "This Week";
    if (weekOffset === 1) return "Next Week";
    if (weekOffset === -1) return "Last Week";
    if (weekOffset > 0) return `${weekOffset} weeks from now`;
    return `${Math.abs(weekOffset)} weeks ago`;
  };

  const upcomingWeeks = useMemo(() => {
    // Show a preview summary: this week + next week goals count
    return [0, 1, 2].map((offset) => {
      const mon = new Date(todayMonday);
      mon.setDate(mon.getDate() + offset * 7);
      const sun = getSunday(mon);
      const weekGoals = goals.filter((g) => isSameWeek(g.weekStart, mon));
      return { offset, mon, sun, goals: weekGoals };
    });
  }, [goals, todayMonday]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading weekly goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaBullseye className="text-indigo-600" />
              Weekly Goals
            </h1>
            <p className="text-gray-500 mt-1">
              Plan and track your learning subjects week by week
            </p>
          </div>
          <button
            onClick={() => {
              setAddGoalWeekOffset(weekOffset);
              setShowAddGoal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-green-700 transition-all duration-200"
          >
            <FaPlus size={14} />
            Add Subject
          </button>
        </div>

        {/* Upcoming Weeks Overview Strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {upcomingWeeks.map(({ offset, mon, sun, goals: wg }) => (
            <button
              key={offset}
              onClick={() => setWeekOffset(offset)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                weekOffset === offset
                  ? "border-indigo-600 bg-indigo-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide mb-1 ${weekOffset === offset ? "text-indigo-600" : "text-gray-400"}`}
              >
                {offset === 0
                  ? "This Week"
                  : offset === 1
                    ? "Next Week"
                    : "In 2 Weeks"}
              </p>
              <p className="text-sm text-gray-700 font-medium">
                {formatDateRange(mon, sun)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {wg.length} subject{wg.length !== 1 ? "s" : ""}
                {wg.length > 0 && (
                  <span className="ml-1 text-indigo-500">
                    ·{" "}
                    {wg.reduce(
                      (a, g) => a + g.topics.filter((t) => t.completed).length,
                      0,
                    )}
                    /{wg.reduce((a, g) => a + g.topics.length, 0)} topics
                  </span>
                )}
              </p>
            </button>
          ))}
        </div>

        {/* Week Navigation */}
        <div
          className="flex items-center justify-between rounded-2xl shadow-sm px-6 py-4 mb-6"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <FaChevronLeft size={14} /> Previous
          </button>

          <div className="text-center">
            <span className="text-lg font-bold text-gray-900">
              {weekLabel()}
            </span>
            <p className="text-sm text-gray-500">
              {formatDateRange(currentMonday, currentSunday)}
            </p>
          </div>

          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            Next <FaChevronRight size={14} />
          </button>
        </div>

        {/* Goals for Selected Week */}
        {currentWeekGoals.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl border border-dashed"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-strong)",
            }}
          >
            <FaFlagCheckered size={40} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              No subjects for {weekLabel().toLowerCase()}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Add your first subject to start planning this week.
            </p>
            <button
              onClick={() => {
                setAddGoalWeekOffset(weekOffset);
                setShowAddGoal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <FaPlus size={13} /> Add Subject
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {currentWeekGoals.map((goal) => {
              const progress = getProgress(goal);
              const completed = goal.topics.filter((t) => t.completed).length;
              return (
                <div
                  key={goal._id}
                  className="rounded-2xl shadow-sm overflow-hidden"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* Card Header */}
                  <div
                    className="px-5 py-4 flex items-center justify-between rounded-t-2xl"
                    style={{ backgroundColor: goal.color }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.25)",
                          color: "white",
                        }}
                      >
                        <FaBook size={16} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight">
                          {goal.subject}
                        </h3>
                        <p
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          {completed}/{goal.topics.length} topics completed
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="transition-colors p-1.5 rounded hover:bg-white/20"
                      title="Delete subject"
                    >
                      <img
                        src="/uploads/Icons/delete.png"
                        alt="Delete"
                        className="w-4 h-4 object-contain brightness-0 invert"
                      />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-5 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 font-medium">
                        Progress
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: goal.color }}
                      >
                        {progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Topics List */}
                  <div className="px-5 py-3 space-y-2 max-h-56 overflow-y-auto">
                    {goal.topics.length === 0 && (
                      <p className="text-gray-400 text-sm italic text-center py-2">
                        No topics yet — add one below
                      </p>
                    )}
                    {goal.topics.map((topic) => (
                      <div
                        key={topic._id}
                        className="flex items-center gap-3 group"
                      >
                        <button
                          onClick={() => handleToggleTopic(goal._id, topic._id)}
                          className="flex-shrink-0 transition-colors"
                          style={{
                            color: topic.completed ? goal.color : "#D1D5DB",
                          }}
                        >
                          {topic.completed ? (
                            <FaCheckCircle size={18} />
                          ) : (
                            <FaCircle size={18} />
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            topic.completed
                              ? "line-through text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          {topic.title}
                        </span>
                        <button
                          onClick={() => handleDeleteTopic(goal._id, topic._id)}
                          className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Topic Input */}
                  <div className="px-5 py-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a topic..."
                        value={topicInputs[goal._id] || ""}
                        onChange={(e) =>
                          setTopicInputs((prev) => ({
                            ...prev,
                            [goal._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddTopic(goal._id)
                        }
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                      />
                      <button
                        onClick={() => handleAddTopic(goal._id)}
                        disabled={!(topicInputs[goal._id] || "").trim()}
                        className="px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-40"
                        style={{ backgroundColor: goal.color }}
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Add New Subject
              </h2>
              <button
                onClick={() => setShowAddGoal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="p-6 space-y-5">
              {/* Subject Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Subject / Topic Name
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Mathematics, React, Physics..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  autoFocus
                  required
                />
              </div>

              {/* Week Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign to Week
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[-1, 0, 1, 2, 3, 4].map((offset) => {
                    const mon = new Date(todayMonday);
                    mon.setDate(mon.getDate() + offset * 7);
                    const label =
                      offset === 0
                        ? "This Week"
                        : offset === 1
                          ? "Next Week"
                          : offset === -1
                            ? "Last Week"
                            : `+${offset} Weeks`;
                    return (
                      <button
                        key={offset}
                        type="button"
                        onClick={() => setAddGoalWeekOffset(offset)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                          addGoalWeekOffset === offset
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 text-gray-600 hover:border-indigo-300"
                        }`}
                      >
                        <div>{label}</div>
                        <div className="text-gray-400 font-normal mt-0.5 text-[10px]">
                          {mon.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-8 h-8 rounded-full transition-all duration-150 ${
                        newColor === c
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl border-2"
                style={{
                  borderColor: newColor,
                  backgroundColor: `${newColor}11`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: newColor }}
                >
                  <FaBook size={15} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {newSubject || "Subject name"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(() => {
                      const mon = new Date(todayMonday);
                      mon.setDate(mon.getDate() + addGoalWeekOffset * 7);
                      return formatDateRange(mon, getSunday(mon));
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold shadow transition-all hover:opacity-90"
                  style={{ backgroundColor: newColor }}
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyGoalsPage;
