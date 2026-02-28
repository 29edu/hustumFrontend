import { useState, useEffect } from "react";
import {
  FaClock,
  FaCheckCircle,
  FaBook,
  FaFire,
  FaChartLine,
  FaPlus,
  FaTimes,
  FaBolt,
  FaRegSun,
  FaMoon,
  FaArrowRight,
  FaTrophy,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { todoApi } from "../api/todoApi";
import { studyApi } from "../api/studyApi";
import { habitApi } from "../api/habitApi";
import { ratingApi } from "../api/ratingApi";

const QUOTES = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki",
  },
];

const DashboardPage = ({ user }) => {
  const { isDark } = useTheme();
  const [currentDate] = useState(new Date());
  const [liveTime, setLiveTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [studyStats, setStudyStats] = useState({
    totalDuration: 0,
    sessions: 0,
  });
  const [habits, setHabits] = useState([]);
  const [yesterdayRating, setYesterdayRating] = useState(null);
  const [, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [quoteIndex] = useState(() =>
    Math.floor(Math.random() * QUOTES.length),
  );
  const [activeTab, setActiveTab] = useState("today"); // "today" | "upcoming"
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    startTime: "",
    endTime: "",
    status: "not started",
  });

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  useEffect(() => {
    const fetchYesterdayRating = async () => {
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split("T")[0];
        const userId = user?.email;
        if (!userId) return;
        const data = await ratingApi.getRatingsByDate(userId, yStr);
        if (Array.isArray(data) && data.length > 0) {
          const total = data.reduce((s, r) => s + (r.score || 0), 0);
          setYesterdayRating({ total, count: data.length });
        } else {
          setYesterdayRating({ total: 0, count: 0 });
        }
      } catch {
        setYesterdayRating({ total: 0, count: 0 });
      }
    };
    fetchYesterdayRating();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const todosData = await todoApi.getAllTodos();
      setTodos(todosData);

      // Fetch today's study data
      const studyData = await studyApi.getAllStudies({
        date: new Date().toISOString().split("T")[0],
      });
      const totalDuration = studyData.reduce(
        (acc, s) => acc + (s.duration || 0),
        0,
      );
      setStudyStats({ totalDuration, sessions: studyData.length });

      // Fetch habits for current month
      const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      const habitsData = await habitApi.getHabits(user?.email || "user", month);
      setHabits(habitsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayTodos = () => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    return todos.filter((todo) => {
      if (todo.startTime) {
        const s = new Date(todo.startTime);
        const startDate = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}-${String(s.getDate()).padStart(2, "0")}`;
        if (startDate === dateStr) return true;
      }
      if (todo.deadline) {
        const dl = new Date(todo.deadline);
        const todoDate = `${dl.getFullYear()}-${String(dl.getMonth() + 1).padStart(2, "0")}-${String(dl.getDate()).padStart(2, "0")}`;
        return todoDate === dateStr;
      }
      return false;
    });
  };

  const getCompletedTodayCount = () => {
    return getTodayTodos().filter(
      (t) => t.status === "completed" || t.completed,
    ).length;
  };

  const getUpcomingTodos = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return todos
      .filter((todo) => {
        if (!todo.deadline) return false;
        const todoDate = new Date(todo.deadline);
        return (
          todoDate >= today && todo.status !== "completed" && !todo.completed
        );
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getTimeBlocks = () => {
    const todayTodos = getTodayTodos();
    const blocks = [];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    todayTodos.forEach((todo) => {
      if (todo.startTime && todo.endTime) {
        const start = new Date(todo.startTime);
        const end = new Date(todo.endTime);
        const startHour = start.getHours();
        const endHour = end.getHours();
        const startMinute = start.getMinutes();
        const endMinute = end.getMinutes();

        // Create a block spanning from start to end hour
        for (let h = startHour; h <= endHour; h++) {
          blocks.push({
            hour: h,
            title: todo.title,
            completed: todo.completed,
            todoId: todo._id,
            startHour,
            endHour,
            startMinute,
            endMinute,
            isStart: h === startHour,
            isEnd: h === endHour,
            isFull: h > startHour && h < endHour,
          });
        }
      } else if (todo.deadline) {
        const date = new Date(todo.deadline);
        const hour = date.getHours();
        blocks.push({
          hour,
          title: todo.title,
          completed: todo.completed,
          todoId: todo._id,
          startHour: hour,
          endHour: hour,
        });
      }
    });

    return { hours, blocks };
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getHabitCompletionRate = () => {
    if (habits.length === 0) return 0;
    const today = new Date().getDate();
    const completedToday = habits.filter((habit) =>
      habit.completedDays?.includes(today),
    ).length;
    return Math.round((completedToday / habits.length) * 100);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      // Map status to backend enum values
      let backendStatus = newTask.status;
      if (backendStatus === "not started") {
        backendStatus = "pending";
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        status: backendStatus,
        completed: false,
        deadline: newTask.deadline
          ? new Date(newTask.deadline).toISOString()
          : null,
        startTime: newTask.startTime
          ? new Date(`${today}T${newTask.startTime}:00`).toISOString()
          : null,
        endTime: newTask.endTime
          ? new Date(`${today}T${newTask.endTime}:00`).toISOString()
          : null,
      };

      if (editingTask) {
        // Update existing task
        await todoApi.updateTodo(editingTask._id, taskData);
      } else {
        // Create new task
        await todoApi.createTodo(taskData);
      }

      setShowTaskModal(false);
      setEditingTask(null);
      setNewTask({
        title: "",
        description: "",
        deadline: "",
        startTime: "",
        endTime: "",
        status: "not started",
      });
      fetchDashboardData();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const getGreeting = () => {
    const h = liveTime.getHours();
    if (h < 12)
      return {
        text: "Good Morning",
        icon: <FaRegSun className="text-yellow-400" />,
      };
    if (h < 17)
      return {
        text: "Good Afternoon",
        icon: <FaBolt className="text-orange-400" />,
      };
    return {
      text: "Good Evening",
      icon: <FaMoon className="text-indigo-400" />,
    };
  };

  const getRatingEmoji = (total) => {
    if (total < 10) return { emoji: "😴", label: "Very low", color: "#94a3b8" };
    if (total < 20) return { emoji: "😞", label: "Low", color: "#ef4444" };
    if (total < 30)
      return { emoji: "😔", label: "Below avg", color: "#f97316" };
    if (total < 40) return { emoji: "😐", label: "Average", color: "#f59e0b" };
    if (total < 50) return { emoji: "🙂", label: "Fair", color: "#eab308" };
    if (total < 60) return { emoji: "😊", label: "Good", color: "#84cc16" };
    if (total < 70)
      return { emoji: "😁", label: "Very good", color: "#22c55e" };
    if (total < 80) return { emoji: "🌟", label: "Great", color: "#10b981" };
    if (total < 90)
      return { emoji: "🔥", label: "Excellent", color: "#3b82f6" };
    return { emoji: "🏆", label: "Outstanding", color: "#8b5cf6" };
  };

  const formatLiveTime = () => {
    return liveTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatLiveDate = () => {
    return liveTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleNavigate = (section) => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: { section } }));
  };

  const handleToggleHabit = async (habitId) => {
    const today = new Date().getDate();
    try {
      const updatedHabit = await habitApi.toggleHabitDay(habitId, today);
      setHabits(habits.map((h) => (h._id === habitId ? updatedHabit : h)));
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const getTodayHabitStats = () => {
    const today = new Date().getDate();
    const completed = habits.filter((h) =>
      h.completedDays?.includes(today),
    ).length;
    return { completed, total: habits.length };
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await todoApi.deleteTodo(taskId);
        // Force refresh of dashboard data
        await fetchDashboardData();
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const handleToggleComplete = async (todo) => {
    const newStatus = todo.status === "completed" ? "pending" : "completed";
    const newCompleted = newStatus === "completed";
    try {
      await todoApi.updateTodo(todo._id, {
        ...todo,
        status: newStatus,
        completed: newCompleted,
      });
      await fetchDashboardData();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);

    // Format dates for form inputs
    let formattedDeadline = "";
    let formattedStartTime = "";
    let formattedEndTime = "";

    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      formattedDeadline = deadlineDate.toISOString().slice(0, 16);
    }

    if (task.startTime) {
      const startDate = new Date(task.startTime);
      formattedStartTime = startDate.toTimeString().slice(0, 5);
    }

    if (task.endTime) {
      const endDate = new Date(task.endTime);
      formattedEndTime = endDate.toTimeString().slice(0, 5);
    }

    setNewTask({
      title: task.title || "",
      description: task.description || "",
      deadline: formattedDeadline,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      status: task.status === "pending" ? "not started" : task.status,
    });

    setShowTaskModal(true);
  };

  const todayTodos = getTodayTodos();
  const completedToday = getCompletedTodayCount();
  const todayProgress =
    todayTodos.length > 0
      ? Math.round((completedToday / todayTodos.length) * 100)
      : 0;
  const { hours, blocks } = getTimeBlocks();
  const days = getDaysInMonth();
  const greeting = getGreeting();
  const ratingInfo =
    yesterdayRating && yesterdayRating.count > 0
      ? getRatingEmoji(yesterdayRating.total)
      : null;
  const quote = QUOTES[quoteIndex];
  const { completed: habitsCompleted, total: habitsTotal } =
    getTodayHabitStats();

  // ── Upcoming tasks ───────────────────────────────────────────────────────
  const upcomingTodos = getUpcomingTodos();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── HERO HEADER ──────────────────────────────────────────────── */}
        <div
          className="rounded-2xl sm:rounded-3xl overflow-hidden relative"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #1e293b 0%, #111827 50%, #0f172a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(148,163,184,0.25)",
          }}
        >
          {/* subtle grid pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.15) 40px,rgba(255,255,255,0.15) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.15) 40px,rgba(255,255,255,0.15) 41px)",
            }}
          />

          <div className="relative z-10 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left – greeting */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {greeting.icon}
                <span
                  className="text-sm font-medium tracking-wide uppercase"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.8)" : "#64748b",
                  }}
                >
                  {greeting.text}
                </span>
              </div>
              <h1
                className="text-2xl sm:text-4xl font-extrabold leading-tight"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                {user?.name || user?.username || "Welcome back"} 👋
              </h1>
              <p
                className="text-sm mt-1 max-w-md hidden sm:block"
                style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}
              >
                &ldquo;{quote.text}&rdquo;
                <span
                  className="ml-1"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.5)" : "#64748b",
                  }}
                >
                  — {quote.author}
                </span>
              </p>
            </div>

            {/* Right – live clock */}
            <div
              className="rounded-2xl px-5 py-4 text-right flex-shrink-0"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.85)",
                border: isDark ? "none" : "1px solid #e2e8f0",
                backdropFilter: "blur(10px)",
              }}
            >
              <p
                className="text-3xl sm:text-4xl font-mono font-bold tracking-tight tabular-nums"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                {formatLiveTime()}
              </p>
              <p
                className="text-xs sm:text-sm mt-1"
                style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}
              >
                {formatLiveDate()}
              </p>
            </div>
          </div>

          {/* Quote on mobile */}
          <div className="relative z-10 px-5 pb-4 sm:hidden">
            <p
              className="text-xs italic"
              style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#475569" }}
            >
              &ldquo;{quote.text}&rdquo; — {quote.author}
            </p>
          </div>
        </div>

        {/* ── PRODUCTIVITY SCORE + STATS ROW ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Yesterday's Rating */}
          <div
            className="col-span-2 sm:col-span-1 rounded-2xl p-4 sm:p-5 relative overflow-hidden"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {ratingInfo ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl leading-none">
                    {ratingInfo.emoji}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: ratingInfo.color + "22",
                      color: ratingInfo.color,
                    }}
                  >
                    {ratingInfo.label}
                  </span>
                </div>
                <p
                  className="font-semibold text-sm mt-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Yesterday's Mood
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Score: {yesterdayRating.total} · {yesterdayRating.count}{" "}
                  categor{yesterdayRating.count === 1 ? "y" : "ies"}
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((yesterdayRating.total / 100) * 100, 100)}%`,
                      backgroundColor: ratingInfo.color,
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl leading-none">🤷</span>
                </div>
                <p
                  className="font-semibold text-sm mt-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Yesterday's Mood
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  No rating logged yesterday
                </p>
              </>
            )}
          </div>

          {/* Daily Progress */}
          <div
            className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FaCheckCircle className="text-blue-600 text-lg" />
              </div>
              <span className="text-3xl font-extrabold text-blue-600">
                {todayProgress}%
              </span>
            </div>
            <p
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Daily Progress
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {completedToday}/{todayTodos.length} tasks done
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
          </div>

          {/* Study Time */}
          <div
            className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <FaBook className="text-purple-600 text-lg" />
              </div>
              <span className="text-3xl font-extrabold text-purple-600">
                {formatDuration(studyStats.totalDuration)}
              </span>
            </div>
            <p
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Study Time
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {studyStats.sessions} sessions today
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-purple-100">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-700"
                style={{
                  width: `${Math.min((studyStats.sessions / 5) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Habit Progress */}
          <div
            className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <FaFire className="text-orange-500 text-lg" />
              </div>
              <span className="text-3xl font-extrabold text-orange-500">
                {getHabitCompletionRate()}%
              </span>
            </div>
            <p
              className="font-semibold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Habit Progress
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {habitsCompleted}/{habitsTotal} habits today
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-700"
                style={{ width: `${getHabitCompletionRate()}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* ── LEFT / MAIN COLUMN ──────────────────────────────────────── */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Tasks section with tabs */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              {/* Card header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-5 pb-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  {/* Tabs */}
                  <div
                    className="flex rounded-xl p-1 gap-1"
                    style={{ backgroundColor: "var(--bg-elevated)" }}
                  >
                    {["today", "upcoming"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize"
                        style={{
                          backgroundColor:
                            activeTab === tab
                              ? "var(--bg-surface)"
                              : "transparent",
                          color:
                            activeTab === tab
                              ? "var(--text-primary)"
                              : "var(--text-muted)",
                          boxShadow:
                            activeTab === tab
                              ? "0 2px 6px rgba(0,0,0,0.1)"
                              : "none",
                        }}
                      >
                        {tab === "today" ? "Today" : "Upcoming"}
                        {tab === "today" && todayTodos.length > 0 && (
                          <span
                            className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor:
                                activeTab === "today"
                                  ? "#64748b"
                                  : "var(--bg-subtle)",
                              color:
                                activeTab === "today"
                                  ? "white"
                                  : "var(--text-muted)",
                            }}
                          >
                            {todayTodos.length}
                          </span>
                        )}
                        {tab === "upcoming" && upcomingTodos.length > 0 && (
                          <span
                            className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor:
                                activeTab === "upcoming"
                                  ? "#475569"
                                  : "var(--bg-subtle)",
                              color:
                                activeTab === "upcoming"
                                  ? "white"
                                  : "var(--text-muted)",
                            }}
                          >
                            {upcomingTodos.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {activeTab === "today" &&
                    selectedDate.toDateString() !==
                      currentDate.toDateString() && (
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className="text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        ← Today
                      </button>
                    )}
                </div>

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg,#475569,#334155)",
                    boxShadow: "0 4px 14px rgba(71,85,105,0.3)",
                  }}
                >
                  <FaPlus className="text-xs" />
                  Add Task
                </button>
              </div>

              {/* Task list */}
              <div className="p-4 sm:p-5 space-y-2 max-h-[420px] overflow-y-auto">
                {activeTab === "today" ? (
                  todayTodos.length > 0 ? (
                    todayTodos.map((todo) => {
                      const isCompleted = todo.status === "completed";
                      const isStarted = todo.status === "started";
                      return (
                        <div
                          key={todo._id}
                          className="flex items-center gap-3 p-3.5 rounded-xl"
                          style={{
                            backgroundColor: isCompleted
                              ? isDark
                                ? "rgba(34,197,94,0.10)"
                                : "#f0fdf4"
                              : isStarted
                                ? isDark
                                  ? "rgba(59,130,246,0.10)"
                                  : "#eff6ff"
                                : isDark
                                  ? "rgba(255,255,255,0.04)"
                                  : "#fafafa",
                            border: "1px solid",
                            borderColor: isCompleted
                              ? isDark
                                ? "rgba(34,197,94,0.25)"
                                : "#bbf7d0"
                              : isStarted
                                ? isDark
                                  ? "rgba(59,130,246,0.25)"
                                  : "#bfdbfe"
                                : "var(--border)",
                          }}
                        >
                          {/* circle checkbox */}
                          <button
                            onClick={() => handleToggleComplete(todo)}
                            className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                            style={{
                              borderColor: isCompleted
                                ? "#22c55e"
                                : isStarted
                                  ? "#3b82f6"
                                  : "#d1d5db",
                              backgroundColor: isCompleted
                                ? "#22c55e"
                                : "transparent",
                            }}
                          >
                            {isCompleted && (
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                              >
                                <path
                                  d="M1.5 5L4 7.5L8.5 2.5"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>

                          {/* content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-sm truncate"
                              style={{
                                color: isCompleted
                                  ? "var(--text-muted)"
                                  : "var(--text-primary)",
                                textDecoration: isCompleted
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {todo.title}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: "var(--text-faint)" }}
                            >
                              {todo.startTime && todo.endTime
                                ? `${new Date(todo.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} – ${new Date(todo.endTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
                                : todo.deadline
                                  ? new Date(todo.deadline).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "No time set"}
                            </p>
                          </div>

                          {/* badge */}
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 hidden sm:inline-flex"
                            style={{
                              backgroundColor: isCompleted
                                ? isDark
                                  ? "rgba(34,197,94,0.2)"
                                  : "#dcfce7"
                                : isStarted
                                  ? isDark
                                    ? "rgba(59,130,246,0.2)"
                                    : "#dbeafe"
                                  : isDark
                                    ? "rgba(239,68,68,0.2)"
                                    : "#fee2e2",
                              color: isCompleted
                                ? "#16a34a"
                                : isStarted
                                  ? "#2563eb"
                                  : "#dc2626",
                            }}
                          >
                            {isCompleted
                              ? "✅ Done"
                              : isStarted
                                ? "🔄 In Progress"
                                : "⏳ Pending"}
                          </span>

                          {/* actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditTask(todo)}
                              className="p-1.5 rounded-lg"
                              title="Edit"
                            >
                              <img
                                src="/uploads/Icons/pencil.png"
                                alt="Edit"
                                className="w-4 h-4 object-contain"
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(todo._id)}
                              className="p-1.5 rounded-lg"
                              title="Delete"
                            >
                              <img
                                src="/uploads/Icons/delete.png"
                                alt="Delete"
                                className="w-4 h-4 object-contain"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="text-5xl mb-3">📭</div>
                      <p
                        className="font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        No tasks for today
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--text-faint)" }}
                      >
                        Click &ldquo;Add Task&rdquo; to get started
                      </p>
                    </div>
                  )
                ) : upcomingTodos.length > 0 ? (
                  upcomingTodos.map((todo) => {
                    const deadline = todo.deadline
                      ? new Date(todo.deadline)
                      : null;
                    const daysLeft = deadline
                      ? Math.ceil(
                          (deadline - new Date()) / (1000 * 60 * 60 * 24),
                        )
                      : null;
                    const isUrgent = daysLeft !== null && daysLeft <= 1;
                    return (
                      <div
                        key={todo._id}
                        className="flex items-center gap-3 p-3.5 rounded-xl"
                        style={{
                          backgroundColor: isUrgent
                            ? isDark
                              ? "rgba(239,68,68,0.10)"
                              : "#fff5f5"
                            : isDark
                              ? "rgba(255,255,255,0.04)"
                              : "#fafafa",
                          border: "1px solid",
                          borderColor: isUrgent
                            ? isDark
                              ? "rgba(239,68,68,0.25)"
                              : "#fecaca"
                            : "var(--border)",
                        }}
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          {isUrgent && (
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-sm truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {todo.title}
                          </p>
                          {deadline && (
                            <p
                              className="text-xs mt-0.5"
                              style={{
                                color: isUrgent
                                  ? "#ef4444"
                                  : "var(--text-faint)",
                              }}
                            >
                              {isUrgent ? "⚠️ Due " : "Due "}
                              {deadline.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                        {daysLeft !== null && (
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                            style={{
                              backgroundColor: isUrgent
                                ? isDark
                                  ? "rgba(239,68,68,0.2)"
                                  : "#fee2e2"
                                : isDark
                                  ? "rgba(59,130,246,0.2)"
                                  : "#dbeafe",
                              color: isUrgent ? "#dc2626" : "#2563eb",
                            }}
                          >
                            {daysLeft === 0
                              ? "Today"
                              : daysLeft === 1
                                ? "Tomorrow"
                                : `${daysLeft}d left`}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditTask(todo)}
                            className="p-1.5 rounded-lg"
                          >
                            <img
                              src="/uploads/Icons/pencil.png"
                              alt="Edit"
                              className="w-4 h-4 object-contain"
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(todo._id)}
                            className="p-1.5 rounded-lg"
                          >
                            <img
                              src="/uploads/Icons/delete.png"
                              alt="Delete"
                              className="w-4 h-4 object-contain"
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="text-5xl mb-3">🎉</div>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--text-muted)" }}
                    >
                      All caught up!
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      No upcoming tasks
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <h2
                  className="font-bold flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <FaClock className="text-blue-500" />
                  {selectedDate.toDateString() === currentDate.toDateString()
                    ? "Today's Timeline"
                    : selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }) + " Timeline"}
                </h2>
              </div>

              <div className="p-4 sm:p-5 space-y-1 max-h-64 overflow-y-auto">
                {hours.map((hour) => {
                  const tasksAtHour = blocks.filter((b) => b.hour === hour);
                  if (tasksAtHour.length === 0 && hour < 6) return null;
                  return (
                    <div key={hour} className="flex items-start gap-3 group">
                      <div
                        className="w-14 text-xs font-mono font-semibold flex-shrink-0 pt-2"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                      <div
                        className="flex-1 border-l-2 border-dashed pl-3 py-1 min-h-[28px] flex flex-wrap gap-1.5"
                        style={{
                          borderColor:
                            tasksAtHour.length > 0
                              ? "#6366f1"
                              : "var(--border)",
                        }}
                      >
                        {tasksAtHour.map((task, idx) => {
                          const colors = [
                            "bg-blue-500",
                            "bg-violet-500",
                            "bg-pink-500",
                            "bg-indigo-500",
                            "bg-cyan-500",
                            "bg-teal-500",
                          ];
                          const colorClass = task.completed
                            ? "bg-emerald-500"
                            : colors[idx % colors.length];
                          return (
                            <span
                              key={`${task.todoId}-${task.hour}`}
                              className={`${colorClass} text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 relative`}
                            >
                              {task.completed && <FaCheckCircle size={10} />}
                              <span
                                className={task.completed ? "line-through" : ""}
                              >
                                {task.title}
                              </span>
                              {task.isStart &&
                                task.startMinute !== undefined && (
                                  <span className="opacity-70 text-[10px]">
                                    (
                                    {task.startHour.toString().padStart(2, "0")}
                                    :
                                    {task.startMinute
                                      .toString()
                                      .padStart(2, "0")}
                                    –{task.endHour.toString().padStart(2, "0")}:
                                    {task.endMinute
                                      ?.toString()
                                      .padStart(2, "0")}
                                    )
                                  </span>
                                )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.todoId);
                                }}
                                className="ml-0.5 rounded p-0.5"
                              >
                                <FaTimes size={8} />
                              </button>
                            </span>
                          );
                        })}
                        {tasksAtHour.length === 0 && (
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-faint)" }}
                          >
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div className="space-y-4 sm:space-y-6">
            {/* Calendar */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <h2
                  className="font-bold flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <FaRegCalendarAlt className="text-blue-500" />
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="flex gap-1">
                  {[
                    { dir: -1, label: "←" },
                    { dir: 1, label: "→" },
                  ].map(({ dir, label }) => (
                    <button
                      key={dir}
                      onClick={() =>
                        setSelectedDate(
                          new Date(
                            selectedDate.getFullYear(),
                            selectedDate.getMonth() + dir,
                          ),
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-7 mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div
                      key={i}
                      className="text-center text-xs font-bold py-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const isToday =
                      day === currentDate.getDate() &&
                      selectedDate.getMonth() === currentDate.getMonth() &&
                      selectedDate.getFullYear() === currentDate.getFullYear();
                    const isSelected = day === selectedDate.getDate();
                    const hasTasks =
                      day &&
                      todos.some((todo) => {
                        const checkDate = todo.startTime
                          ? new Date(todo.startTime)
                          : todo.deadline
                            ? new Date(todo.deadline)
                            : null;
                        return (
                          checkDate &&
                          checkDate.getDate() === day &&
                          checkDate.getMonth() === selectedDate.getMonth() &&
                          checkDate.getFullYear() === selectedDate.getFullYear()
                        );
                      });
                    return (
                      <div
                        key={index}
                        onClick={() =>
                          day &&
                          setSelectedDate(
                            new Date(
                              selectedDate.getFullYear(),
                              selectedDate.getMonth(),
                              day,
                            ),
                          )
                        }
                        className="aspect-square flex flex-col items-center justify-center text-sm rounded-xl relative"
                        style={{
                          cursor: day ? "pointer" : "default",
                          backgroundColor: isToday
                            ? "#334155"
                            : isSelected && !isToday
                              ? isDark
                                ? "rgba(100,116,139,0.25)"
                                : "#e2e8f0"
                              : "transparent",
                          color: isToday
                            ? "white"
                            : isSelected
                              ? "#334155"
                              : day
                                ? "var(--text-primary)"
                                : "transparent",
                          fontWeight: isToday || isSelected ? "700" : "400",
                        }}
                      >
                        {day}
                        {hasTasks && (
                          <div
                            className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: isToday
                                ? "rgba(255,255,255,0.7)"
                                : "#64748b",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <h2
                  className="font-bold flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <FaBolt className="text-yellow-500" />
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 space-y-2">
                {[
                  {
                    label: "Add New Task",
                    icon: <FaPlus />,
                    gradient: "linear-gradient(135deg,#3b82f6,#6366f1)",
                    shadow: "rgba(59,130,246,0.3)",
                    action: () => setShowTaskModal(true),
                  },
                  {
                    label: "Log Study Session",
                    icon: <FaBook />,
                    gradient: "linear-gradient(135deg,#8b5cf6,#a855f7)",
                    shadow: "rgba(139,92,246,0.3)",
                    action: () => handleNavigate("tracker"),
                  },
                  {
                    label: "View Analytics",
                    icon: <FaChartLine />,
                    gradient: "linear-gradient(135deg,#10b981,#059669)",
                    shadow: "rgba(16,185,129,0.3)",
                    action: () => handleNavigate("analysis"),
                  },
                  {
                    label: "Manage Habits",
                    icon: <FaFire />,
                    gradient: "linear-gradient(135deg,#f97316,#ef4444)",
                    shadow: "rgba(249,115,22,0.3)",
                    action: () => handleNavigate("habit"),
                  },
                ].map(({ label, icon, gradient, shadow, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "#f8fafc",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{
                        background: gradient,
                        boxShadow: `0 4px 10px ${shadow}`,
                      }}
                    >
                      <span className="text-white text-sm">{icon}</span>
                    </div>
                    <span
                      className="font-semibold text-sm flex-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {label}
                    </span>
                    <FaArrowRight
                      className="text-xs opacity-30"
                      style={{ color: "var(--text-faint)" }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Habits */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <h2
                  className="font-bold flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <FaFire className="text-orange-500" />
                  Today's Habits
                </h2>
                {habitsTotal > 0 && (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#f97316" }}
                    >
                      {habitsCompleted}/{habitsTotal}
                    </span>
                    <div
                      className="w-16 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--bg-elevated)" }}
                    >
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all duration-500"
                        style={{
                          width: `${habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                {habits.length === 0 ? (
                  <div className="flex flex-col items-center py-6">
                    <div className="text-3xl mb-2">🔥</div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No habits yet.
                    </p>
                    <button
                      onClick={() => handleNavigate("habit")}
                      className="text-xs font-medium mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Add your first habit →
                    </button>
                  </div>
                ) : (
                  habits.map((habit) => {
                    const today = new Date().getDate();
                    const isDoneToday = habit.completedDays?.includes(today);
                    return (
                      <button
                        key={habit._id}
                        onClick={() => handleToggleHabit(habit._id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                        style={{
                          backgroundColor: isDoneToday
                            ? isDark
                              ? "rgba(249,115,22,0.12)"
                              : "#fff7ed"
                            : isDark
                              ? "rgba(255,255,255,0.04)"
                              : "#fafafa",
                          border: "1px solid",
                          borderColor: isDoneToday
                            ? isDark
                              ? "rgba(249,115,22,0.35)"
                              : "#fed7aa"
                            : "var(--border)",
                        }}
                      >
                        <div
                          className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                          style={{
                            borderColor: isDoneToday ? "#f97316" : "#d1d5db",
                            backgroundColor: isDoneToday
                              ? "#f97316"
                              : "transparent",
                          }}
                        >
                          {isDoneToday && (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M1.5 5L4 7.5L8.5 2.5"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className="flex-1 text-sm font-medium truncate"
                          style={{
                            color: isDoneToday
                              ? "var(--text-muted)"
                              : "var(--text-primary)",
                            textDecoration: isDoneToday
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {habit.name}
                        </span>
                        <span
                          className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: isDark
                              ? "rgba(255,255,255,0.06)"
                              : "#f1f5f9",
                            color: "var(--text-faint)",
                          }}
                        >
                          {habit.completedDays?.length || 0}d
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADD/EDIT TASK MODAL ───────────────────────────────────────────── */}
      {showTaskModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Modal header */}
            <div
              className="px-6 pt-6 pb-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {editingTask ? "✏️ Edit Task" : "Add New Task"}
              </h2>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                  setNewTask({
                    title: "",
                    description: "",
                    deadline: "",
                    startTime: "",
                    endTime: "",
                    status: "not started",
                  });
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-lg leading-none"
                style={{ color: "var(--text-muted)" }}
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleAddTask} className="px-6 py-5 space-y-4">
              {/* Task Title */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Enter task title"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>

              {/* Deadline */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newTask.deadline}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadline: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {/* Start / End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTask.startTime}
                    onChange={(e) =>
                      setNewTask({ ...newTask, startTime: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1.5px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTask.endTime}
                    onChange={(e) =>
                      setNewTask({ ...newTask, endTime: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1.5px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Status dropdown */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                  }}
                >
                  <option value="not started">⏳ Not Started</option>
                  <option value="started">🔄 In Progress</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    setNewTask({
                      title: "",
                      description: "",
                      deadline: "",
                      startTime: "",
                      endTime: "",
                      status: "not started",
                    });
                  }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1.5px solid var(--border)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
                  style={{
                    backgroundColor: "#2563eb",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                  }}
                >
                  {editingTask ? "✏️ Update Task" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
