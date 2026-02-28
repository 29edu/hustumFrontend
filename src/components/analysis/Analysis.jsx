import React, { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import { useTheme } from "../../context/ThemeContext";

const Analysis = () => {
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://hustumbackend.onrender.com/api/todos/analytics/today",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setDailyStats(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setDailyStats([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-[calc(100vh-4rem)]"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div style={{ color: "var(--text-muted)" }}>Loading analytics...</div>
      </div>
    );
  }

  if (!dailyStats || dailyStats.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-[calc(100vh-4rem)]"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div style={{ color: "var(--text-muted)" }}>
          No task data available yet. Start adding tasks to see analytics!
        </div>
      </div>
    );
  }

  // Prepare data for Google Area Chart
  const chartData = [
    ["Day", "Total Tasks", "Completed Tasks"],
    ...dailyStats.map((day) => [day.date, day.total, day.completed]),
  ];

  const chartOptions = {
    title: "Task Performance",
    backgroundColor: isDark ? "transparent" : "transparent",
    titleTextStyle: { color: isDark ? "#e2e8f0" : "#111827", fontSize: 16 },
    hAxis: {
      title: "Date",
      titleTextStyle: { color: isDark ? "#94a3b8" : "#333" },
      textStyle: { color: isDark ? "#94a3b8" : "#555" },
      gridlines: { color: isDark ? "#1e293b" : "#e5e7eb" },
      baselineColor: isDark ? "#334155" : "#e5e7eb",
    },
    vAxis: {
      title: "Number of Tasks",
      minValue: 0,
      titleTextStyle: { color: isDark ? "#94a3b8" : "#333" },
      textStyle: { color: isDark ? "#94a3b8" : "#555" },
      gridlines: { color: isDark ? "#1e293b" : "#e5e7eb" },
      baselineColor: isDark ? "#334155" : "#e5e7eb",
    },
    colors: ["#ef4444", "#22c55e"],
    areaOpacity: 0.3,
    lineWidth: 2,
    chartArea: { width: "80%", height: "70%" },
    legend: {
      position: "top",
      textStyle: { color: isDark ? "#e2e8f0" : "#111827" },
    },
  };

  // Calculate totals
  const totalTasks = dailyStats.reduce((sum, day) => sum + day.total, 0);
  const completedTasks = dailyStats.reduce(
    (sum, day) => sum + day.completed,
    0,
  );
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div
      className="h-[calc(100vh-4rem)] overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="h-full p-4">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Task Analysis
          </h1>
          <p className="text-gray-700 mb-4 text-sm">
            7-Day task completion overview
          </p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-100/60 to-blue-200/60 backdrop-blur-sm p-4 rounded-lg shadow">
              <h3 className="text-blue-900 font-semibold mb-1 text-sm">
                Total Tasks (7 days)
              </h3>
              <p className="text-3xl font-bold text-blue-700">{totalTasks}</p>
            </div>

            <div className="bg-gradient-to-br from-green-100/60 to-green-200/60 backdrop-blur-sm p-4 rounded-lg shadow">
              <h3 className="text-green-900 font-semibold mb-1 text-sm">
                Completed
              </h3>
              <p className="text-3xl font-bold text-green-700">
                {completedTasks}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-100/60 to-purple-200/60 backdrop-blur-sm p-4 rounded-lg shadow">
              <h3 className="text-purple-900 font-semibold mb-1 text-sm">
                Completion Rate
              </h3>
              <p className="text-3xl font-bold text-purple-700">
                {completionRate}%
              </p>
            </div>
          </div>

          {/* Google Area Chart */}
          <div className="bg-white/40 backdrop-blur-sm p-4 rounded-lg shadow-lg flex-1 min-h-0">
            <Chart
              chartType="AreaChart"
              width="100%"
              height="100%"
              data={chartData}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
