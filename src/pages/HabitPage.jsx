import { useState, useEffect } from "react";
import { habitApi } from "../api/habitApi";

const HabitPage = ({ user }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [daysInMonth, setDaysInMonth] = useState(31);

  useEffect(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;
    setCurrentMonth(monthStr);

    // Calculate days in current month
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    setDaysInMonth(days);
  }, []);

  useEffect(() => {
    if (currentMonth) {
      fetchHabits();
    }
  }, [currentMonth]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const data = await habitApi.getHabits(user.email, currentMonth);
      setHabits(data);
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      const newHabit = await habitApi.createHabit(
        user.email,
        newHabitName.trim(),
        currentMonth,
      );
      setHabits([...habits, newHabit]);
      setNewHabitName("");
    } catch (error) {
      console.error("Error creating habit:", error);
      alert("Failed to create habit");
    }
  };

  const handleToggleDay = async (habitId, day) => {
    try {
      const updatedHabit = await habitApi.toggleHabitDay(habitId, day);
      setHabits(habits.map((h) => (h._id === habitId ? updatedHabit : h)));
    } catch (error) {
      console.error("Error toggling day:", error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    try {
      await habitApi.deleteHabit(habitId);
      setHabits(habits.filter((h) => h._id !== habitId));
    } catch (error) {
      console.error("Error deleting habit:", error);
      alert("Failed to delete habit");
    }
  };

  const getMonthName = () => {
    if (!currentMonth) return "";
    const [year, month] = currentMonth.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const changeMonth = (direction) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + direction);
    const newMonthStr = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;
    setCurrentMonth(newMonthStr);

    // Update days in new month
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    setDaysInMonth(days);
  };

  if (loading && habits.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-4rem)] overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-[95%] mx-auto">
          {/* Header */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-gray-800 tracking-wider">
                HABIT TRACKER
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Previous month"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="text-center min-w-[200px]">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    Month
                  </p>
                  <p className="text-xl font-semibold text-gray-800">
                    {getMonthName()}
                  </p>
                </div>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Next month"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add Habit Form */}
            <form onSubmit={handleAddHabit} className="flex gap-3 mb-6">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Enter a new habit..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                Add Habit
              </button>
            </form>

            {/* Habit Grid */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 bg-white/30 backdrop-blur-sm px-3 py-2 text-left font-semibold text-gray-800 uppercase text-xs tracking-wide sticky left-0 z-10 min-w-[200px]">
                      Habit
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                      (day) => (
                        <th
                          key={day}
                          className="border border-gray-200 bg-white/30 backdrop-blur-sm px-1 py-2 text-center font-semibold text-gray-800 text-xs w-[32px]"
                        >
                          {day}
                        </th>
                      ),
                    )}
                    <th className="border border-gray-200 bg-white/30 backdrop-blur-sm px-2 py-2 text-center font-semibold text-gray-800 uppercase text-xs sticky right-0 z-10 w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {habits.length === 0 ? (
                    <tr>
                      <td
                        colSpan={daysInMonth + 2}
                        className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                      >
                        No habits yet. Add your first habit above!
                      </td>
                    </tr>
                  ) : (
                    habits.map((habit) => {
                      const completionRate = (
                        (habit.completedDays.length / daysInMonth) *
                        100
                      ).toFixed(1);
                      return (
                        <tr
                          key={habit._id}
                          className="hover:bg-white/20 transition-colors"
                        >
                          <td className="border border-gray-200 px-3 py-2 sticky left-0 bg-transparent z-10">
                            <div className="flex items-center gap-3">
                              {/* Circular Progress */}
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <svg className="w-12 h-12 transform -rotate-90">
                                  {/* Background circle */}
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="#e5e7eb"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  {/* Progress circle */}
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="#10b981"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 20}`}
                                    strokeDashoffset={`${
                                      2 *
                                      Math.PI *
                                      20 *
                                      (1 - completionRate / 100)
                                    }`}
                                    className="transition-all duration-300"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-xs font-bold text-gray-800">
                                    {completionRate}%
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    {habit.completedDays.length}/{daysInMonth}
                                  </span>
                                </div>
                              </div>
                              <span className="font-medium text-gray-800 text-sm">
                                {habit.name}
                              </span>
                            </div>
                          </td>
                          {Array.from(
                            { length: daysInMonth },
                            (_, i) => i + 1,
                          ).map((day) => {
                            const isCompleted =
                              habit.completedDays.includes(day);
                            return (
                              <td
                                key={day}
                                className="border border-gray-200 p-0 text-center cursor-pointer hover:bg-white/40 transition-colors bg-white/20"
                                onClick={() => handleToggleDay(habit._id, day)}
                              >
                                <div className="w-full h-full flex items-center justify-center py-2">
                                  {isCompleted ? (
                                    <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded flex items-center justify-center">
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="border border-gray-200 px-2 py-2 text-center sticky right-0 bg-white/30 backdrop-blur-sm z-10">
                            <button
                              onClick={() => handleDeleteHabit(habit._id)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                              title="Delete habit"
                            >
                              <img
                                src="/uploads/Icons/delete.png"
                                alt="Delete"
                                className="w-4 h-4 object-contain"
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitPage;
