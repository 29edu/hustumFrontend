import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaBook,
  FaFire,
  FaChartLine,
  FaPlus,
  FaTasks,
  FaTimes,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { todoApi } from "../api/todoApi";
import { studyApi } from "../api/studyApi";
import { habitApi } from "../api/habitApi";

const DashboardPage = ({ user }) => {
  const { isDark } = useTheme();
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [studyStats, setStudyStats] = useState({
    totalDuration: 0,
    sessions: 0,
  });
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    startTime: "",
    endTime: "",
    status: "not started",
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

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

  const getProgressEmoji = (pct) => {
    if (pct === 100) return "💯";
    if (pct >= 75) return "💪";
    if (pct >= 50) return "😊";
    if (pct >= 25) return "😐";
    if (pct > 0) return "😟";
    return "😴";
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

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-[1600px] mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Today's Progress */}
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaCheckCircle className="text-blue-600 text-2xl" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl"
                      title={`${todayProgress}% complete`}
                    >
                      {getProgressEmoji(todayProgress)}
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      {todayProgress}%
                    </span>
                  </div>
                </div>
                <h3 className="text-gray-600 font-medium">Daily Progress</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {completedToday} of {todayTodos.length} tasks done
                </p>
              </div>

              {/* Study Time */}
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaBook className="text-purple-600 text-2xl" />
                  </div>
                  <span className="text-3xl font-bold text-purple-600">
                    {formatDuration(studyStats.totalDuration)}
                  </span>
                </div>
                <h3 className="text-gray-600 font-medium">Study Time</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {studyStats.sessions} sessions today
                </p>
              </div>

              {/* Habit Streak */}
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FaFire className="text-orange-600 text-2xl" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl"
                      title={`${getHabitCompletionRate()}% complete`}
                    >
                      {getProgressEmoji(getHabitCompletionRate())}
                    </span>
                    <span className="text-3xl font-bold text-orange-600">
                      {getHabitCompletionRate()}%
                    </span>
                  </div>
                </div>
                <h3 className="text-gray-600 font-medium">Habit Progress</h3>
                <p className="text-sm text-gray-500 mt-1">Today's completion</p>
              </div>
            </div>

            {/* Today Tasks */}
            <div
              className="rounded-2xl p-6 shadow-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaTasks className="text-green-600" />
                  {selectedDate.toDateString() === currentDate.toDateString()
                    ? "Today Tasks"
                    : selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }) + " Tasks"}
                </h2>
                {selectedDate.toDateString() !== currentDate.toDateString() && (
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Back to today
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {todayTodos.length > 0 ? (
                  todayTodos.map((todo) => (
                    <div
                      key={todo._id}
                      className="flex items-center justify-between p-4 rounded-xl transition-all"
                      style={{
                        backgroundColor:
                          todo.status === "completed"
                            ? isDark
                              ? "rgba(34,197,94,0.12)"
                              : "#f0fdf4"
                            : todo.status === "started"
                              ? isDark
                                ? "rgba(59,130,246,0.12)"
                                : "#eff6ff"
                              : isDark
                                ? "rgba(239,68,68,0.12)"
                                : "#fff5f5",
                        border: "1px solid",
                        borderColor:
                          todo.status === "completed"
                            ? isDark
                              ? "rgba(34,197,94,0.3)"
                              : "#bbf7d0"
                            : todo.status === "started"
                              ? isDark
                                ? "rgba(59,130,246,0.3)"
                                : "#bfdbfe"
                              : isDark
                                ? "rgba(239,68,68,0.3)"
                                : "#fecaca",
                        opacity: todo.status === "completed" ? 0.85 : 1,
                      }}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleComplete(todo)}
                        className="flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mr-3"
                        style={{
                          borderColor:
                            todo.status === "completed"
                              ? "#22c55e"
                              : todo.status === "started"
                                ? "#3b82f6"
                                : "#f87171",
                          backgroundColor:
                            todo.status === "completed"
                              ? "#22c55e"
                              : "transparent",
                        }}
                        title={
                          todo.status === "completed"
                            ? "Mark as pending"
                            : "Mark as completed"
                        }
                      >
                        {todo.status === "completed" && (
                          <svg
                            width="12"
                            height="12"
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

                      <div className="flex-1">
                        <h4
                          className="font-semibold"
                          style={{
                            color:
                              todo.status === "completed"
                                ? "#9ca3af"
                                : "var(--text-primary)",
                            textDecoration:
                              todo.status === "completed"
                                ? "line-through"
                                : "none",
                          }}
                        >
                          {todo.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {todo.startTime && todo.endTime
                            ? `${new Date(todo.startTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )} - ${new Date(todo.endTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}`
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
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            todo.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : todo.status === "started"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {todo.status}
                        </span>
                        <button
                          onClick={() => handleEditTask(todo)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-all hover:scale-110 active:scale-95 border border-blue-200 hover:border-blue-400 hover:shadow-md"
                          title="Edit task"
                        >
                          <img
                            src="/uploads/Icons/pencil.png"
                            alt="Edit"
                            className="w-5 h-5 object-contain"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(todo._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-all hover:scale-110 active:scale-95 border border-red-200 hover:border-red-400 hover:shadow-md"
                          title="Delete task"
                        >
                          <img
                            src="/uploads/Icons/delete.png"
                            alt="Delete"
                            className="w-5 h-5 object-contain"
                          />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    No tasks for today
                  </p>
                )}
              </div>
            </div>

            {/* Timeline View */}
            <div
              className="rounded-2xl p-6 shadow-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  {selectedDate.toDateString() === currentDate.toDateString()
                    ? "Today's Timeline"
                    : selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }) + "'s Timeline"}
                </h2>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {hours.map((hour) => {
                  const tasksAtHour = blocks.filter((b) => b.hour === hour);
                  return (
                    <div
                      key={hour}
                      className="flex items-start gap-4 py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-20 text-sm font-medium text-gray-500 flex-shrink-0">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {tasksAtHour.length > 0 ? (
                          tasksAtHour.map((task, idx) => {
                            const colors = [
                              "bg-blue-500",
                              "bg-purple-500",
                              "bg-pink-500",
                              "bg-indigo-500",
                              "bg-cyan-500",
                              "bg-teal-500",
                            ];
                            const colorClass = task.completed
                              ? "bg-green-500"
                              : colors[idx % colors.length];

                            const timeLabel = task.isStart
                              ? `${task.startHour.toString().padStart(2, "0")}:${task.startMinute?.toString().padStart(2, "0")} - ${task.endHour.toString().padStart(2, "0")}:${task.endMinute?.toString().padStart(2, "0")}`
                              : "";

                            return (
                              <div
                                key={`${task.todoId}-${task.hour}`}
                                className={`${colorClass} text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 group relative ${task.completed ? "line-through" : ""}`}
                                title={timeLabel || "Ongoing"}
                              >
                                {task.completed && <FaCheckCircle size={12} />}
                                <span>{task.title}</span>
                                {task.isStart && (
                                  <span className="text-xs opacity-80">
                                    ({timeLabel})
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.todoId);
                                  }}
                                  className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-white/20 rounded p-1 transition-all"
                                  title="Delete task"
                                >
                                  <img
                                    src="/uploads/Icons/delete.png"
                                    alt="Delete"
                                    className="w-3 h-3 object-contain brightness-0 invert"
                                  />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-gray-300 text-sm">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Calendar */}
          <div className="space-y-6">
            {/* Calendar */}
            <div
              className="rounded-2xl p-6 shadow-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth() - 1,
                        ),
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    ←
                  </button>
                  <button
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth() + 1,
                        ),
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const isToday =
                    day === currentDate.getDate() &&
                    selectedDate.getMonth() === currentDate.getMonth() &&
                    selectedDate.getFullYear() === currentDate.getFullYear();

                  const isSelected = day === selectedDate.getDate() && !isToday;

                  const hasTasks =
                    day &&
                    todos.some((todo) => {
                      const checkDate = todo.startTime
                        ? new Date(todo.startTime)
                        : todo.deadline
                          ? new Date(todo.deadline)
                          : null;
                      if (!checkDate) return false;
                      return (
                        checkDate.getDate() === day &&
                        checkDate.getMonth() === selectedDate.getMonth() &&
                        checkDate.getFullYear() === selectedDate.getFullYear()
                      );
                    });

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (day) {
                          setSelectedDate(
                            new Date(
                              selectedDate.getFullYear(),
                              selectedDate.getMonth(),
                              day,
                            ),
                          );
                        }
                      }}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all ${
                        !day
                          ? ""
                          : isToday
                            ? "bg-blue-600 text-white font-bold cursor-pointer"
                            : isSelected
                              ? "bg-blue-200 text-blue-800 font-bold ring-2 ring-blue-400 cursor-pointer"
                              : hasTasks
                                ? "bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 cursor-pointer"
                                : "hover:bg-gray-100 cursor-pointer"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className="rounded-2xl p-6 shadow-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="w-full flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all text-left"
                >
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <FaPlus className="text-white" />
                  </div>
                  <span className="font-semibold text-blue-900">
                    Add New Task
                  </span>
                </button>
                <button
                  onClick={() => handleNavigate("tracker")}
                  className="w-full flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all text-left"
                >
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <FaBook className="text-white" />
                  </div>
                  <span className="font-semibold text-purple-900">
                    Log Study Session
                  </span>
                </button>
                <button
                  onClick={() => handleNavigate("analysis")}
                  className="w-full flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all text-left"
                >
                  <div className="p-2 bg-green-600 rounded-lg">
                    <FaChartLine className="text-white" />
                  </div>
                  <span className="font-semibold text-green-900">
                    View Analytics
                  </span>
                </button>
              </div>
            </div>

            {/* Today's Habits */}
            <div
              className="rounded-2xl p-6 shadow-sm"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <FaFire className="text-orange-500" />
                  Today's Habits
                </h2>
                {habits.length > 0 &&
                  (() => {
                    const { completed, total } = getTodayHabitStats();
                    const pct =
                      total > 0 ? Math.round((completed / total) * 100) : 0;
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-orange-600">
                          {completed}/{total}
                        </span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-orange-600">
                          {pct}%
                        </span>
                      </div>
                    );
                  })()}
              </div>

              {habits.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">
                  No habits yet.{" "}
                  <button
                    onClick={() => handleNavigate("habit")}
                    className="text-orange-500 hover:underline font-medium"
                  >
                    Add habits
                  </button>
                </p>
              ) : (
                <div className="space-y-2">
                  {habits.map((habit) => {
                    const today = new Date().getDate();
                    const isDoneToday = habit.completedDays?.includes(today);
                    return (
                      <button
                        key={habit._id}
                        onClick={() => handleToggleHabit(habit._id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                        style={{
                          backgroundColor: isDoneToday
                            ? isDark
                              ? "rgba(249,115,22,0.15)"
                              : "#fff7ed"
                            : isDark
                              ? "rgba(255,255,255,0.05)"
                              : "#f9fafb",
                          border: "1px solid",
                          borderColor: isDoneToday
                            ? isDark
                              ? "rgba(249,115,22,0.4)"
                              : "#fed7aa"
                            : isDark
                              ? "rgba(255,255,255,0.1)"
                              : "#e5e7eb",
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className="flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all"
                          style={{
                            borderColor: isDoneToday ? "#f97316" : "#d1d5db",
                            backgroundColor: isDoneToday
                              ? "#f97316"
                              : "transparent",
                          }}
                        >
                          {isDoneToday && (
                            <svg
                              width="12"
                              height="12"
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

                        {/* Habit name */}
                        <span
                          className="flex-1 text-sm font-medium"
                          style={{
                            color: isDoneToday
                              ? "#9ca3af"
                              : "var(--text-primary)",
                            textDecoration: isDoneToday
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {habit.name}
                        </span>

                        {/* Monthly mini progress */}
                        <span className="text-xs text-gray-400">
                          {habit.completedDays?.length || 0}d this month
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl shadow-2xl max-w-md w-full p-6"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTask ? "Edit Task" : "Add New Task"}
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newTask.deadline}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadline: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTask.startTime ? newTask.startTime : ""}
                    onChange={(e) => {
                      setNewTask({ ...newTask, startTime: e.target.value });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTask.endTime ? newTask.endTime : ""}
                    onChange={(e) => {
                      setNewTask({ ...newTask, endTime: e.target.value });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="not started">Not Started</option>
                  <option value="started">Started</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                >
                  {editingTask ? "Update Task" : "Add Task"}
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
