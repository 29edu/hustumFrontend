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
        `${import.meta.env.VITE_API_URL}/api/todos/analytics/today`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setDailyStats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setDailyStats([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-[calc(100vh-4rem)]"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{
              borderColor: "var(--border)",
              borderTopColor: "transparent",
            }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Loading analytics…
          </p>
        </div>
      </div>
    );
  }

  if (!dailyStats || dailyStats.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <span className="text-5xl">📊</span>
        <p
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          No data yet
        </p>
        <p
          className="text-sm text-center max-w-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Start adding and completing tasks to see your analytics here.
        </p>
      </div>
    );
  }

  // Totals
  const totalTasks = dailyStats.reduce((s, d) => s + d.total, 0);
  const completedTasks = dailyStats.reduce((s, d) => s + d.completed, 0);
  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const bestDay = dailyStats.reduce(
    (best, d) => (d.completed > (best?.completed ?? -1) ? d : best),
    null,
  );

  // Chart
  const chartData = [
    ["Day", "Total Tasks", "Completed"],
    ...dailyStats.map((d) => [d.date, d.total, d.completed]),
  ];
  const chartOptions = {
    backgroundColor: "transparent",
    bar: { groupWidth: "60%" },
    hAxis: {
      textStyle: { color: isDark ? "#94a3b8" : "#6b7280", fontSize: 11 },
      gridlines: { color: "transparent" },
      baselineColor: isDark ? "#334155" : "#e5e7eb",
    },
    vAxis: {
      minValue: 0,
      textStyle: { color: isDark ? "#94a3b8" : "#6b7280", fontSize: 11 },
      gridlines: { color: isDark ? "#1e293b" : "#f1f5f9", count: 4 },
      baselineColor: isDark ? "#334155" : "#e5e7eb",
      format: "#",
    },
    colors: ["#fca5a5", "#22c55e"],
    chartArea: {
      left: 50,
      right: 20,
      top: 10,
      bottom: 50,
      width: "100%",
      height: "78%",
    },
    legend: {
      position: "top",
      alignment: "end",
      textStyle: { color: isDark ? "#cbd5e1" : "#374151", fontSize: 12 },
    },
    tooltip: {
      textStyle: { color: "#111827", fontSize: 12 },
      showColorCode: true,
    },
    isStacked: false,
  };

  const summaryCards = [
    {
      emoji: "📋",
      label: "Total Tasks",
      value: totalTasks,
      sub: "7-day period",
      color: isDark ? "#60a5fa" : "#2563eb",
      bg: isDark ? "rgba(59,130,246,0.12)" : "#eff6ff",
      border: isDark ? "rgba(59,130,246,0.25)" : "#bfdbfe",
      bar: null,
    },
    {
      emoji: "✅",
      label: "Completed",
      value: completedTasks,
      sub: `${completionRate}% of total`,
      color: isDark ? "#4ade80" : "#16a34a",
      bg: isDark ? "rgba(34,197,94,0.12)" : "#f0fdf4",
      border: isDark ? "rgba(34,197,94,0.25)" : "#bbf7d0",
      bar: completionRate,
    },
    {
      emoji: "⏳",
      label: "Pending",
      value: pendingTasks,
      sub: `${totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}% of total`,
      color: isDark ? "#fbbf24" : "#d97706",
      bg: isDark ? "rgba(245,158,11,0.12)" : "#fffbeb",
      border: isDark ? "rgba(245,158,11,0.25)" : "#fde68a",
      bar: totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0,
    },
    {
      emoji: "🏆",
      label: "Best Day",
      value: bestDay ? `${bestDay.completed}` : "—",
      sub: bestDay ? bestDay.date : "No data",
      color: isDark ? "#c084fc" : "#7c3aed",
      bg: isDark ? "rgba(167,139,250,0.12)" : "#f5f3ff",
      border: isDark ? "rgba(167,139,250,0.25)" : "#ddd6fe",
      bar: null,
    },
  ];

  return (
    <div
      className="min-h-[calc(100vh-4rem)] overflow-y-auto"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Hero Header ───────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-6 py-5"
          style={{
            background: isDark
              ? "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)"
              : "linear-gradient(135deg,#ffffff 0%,#f8fafc 60%,#f1f5f9 100%)",
          }}
        >
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1
                className="text-2xl font-extrabold tracking-tight"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                📊 Task Analytics
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#475569" }}
              >
                Your 7-day productivity overview
              </p>
            </div>
            <div className="text-right">
              <p
                className="text-xs uppercase tracking-widest font-medium"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}
              >
                Completion rate
              </p>
              <p
                className="text-4xl font-extrabold leading-tight"
                style={{ color: isDark ? "#ffffff" : "#0f172a" }}
              >
                {completionRate}
                <span
                  className="text-xl font-semibold"
                  style={{
                    color: isDark ? "rgba(255,255,255,0.6)" : "#475569",
                  }}
                >
                  %
                </span>
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div
              className="flex justify-between text-xs mb-1.5"
              style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}
            >
              <span>{completedTasks} completed</span>
              <span>{totalTasks} total</span>
            </div>
            <div
              className="w-full h-2 rounded-full"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(21,128,61,0.2)",
              }}
            >
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${completionRate}%`,
                  backgroundColor:
                    completionRate >= 75
                      ? "#22c55e"
                      : completionRate >= 40
                        ? "#3b82f6"
                        : "#f59e0b",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Summary Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-4 flex flex-col gap-2"
              style={{
                backgroundColor: card.bg,
                border: `1px solid ${card.border}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{card.emoji}</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: card.color + "22",
                    color: card.color,
                  }}
                >
                  {card.sub}
                </span>
              </div>
              <div>
                <p
                  className="text-3xl font-extrabold"
                  style={{ color: card.color }}
                >
                  {card.value}
                </p>
                <p
                  className="text-xs font-medium mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {card.label}
                </p>
              </div>
              {card.bar !== null && (
                <div
                  className="w-full h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--border)" }}
                >
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${card.bar}%`,
                      backgroundColor: card.color,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Area Chart ────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="mb-4">
            <h2
              className="text-base font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              � Task Performance
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Total vs completed tasks per day (bar chart)
            </p>
          </div>
          <div style={{ height: 280 }}>
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="100%"
              data={chartData}
              options={chartOptions}
            />
          </div>
        </div>

        {/* ── Daily Breakdown ───────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="px-5 py-4 flex items-center gap-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="text-lg">🗓️</span>
            <h2
              className="text-base font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Daily Breakdown
            </h2>
          </div>

          <div>
            {dailyStats.map((day, i) => {
              const rate =
                day.total > 0
                  ? Math.round((day.completed / day.total) * 100)
                  : 0;
              const pending = day.total - day.completed;
              const rowEmoji =
                rate === 100
                  ? "🏆"
                  : rate >= 70
                    ? "🔥"
                    : rate >= 40
                      ? "📈"
                      : rate > 0
                        ? "⏳"
                        : "📋";
              const barColor =
                rate === 100
                  ? "#22c55e"
                  : rate >= 60
                    ? "#3b82f6"
                    : rate >= 30
                      ? "#f59e0b"
                      : rate > 0
                        ? "#ef4444"
                        : "var(--border)";

              return (
                <div
                  key={i}
                  className="px-5 py-3.5 flex items-center gap-4"
                  style={{
                    borderBottom:
                      i < dailyStats.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <span className="text-base w-5 text-center flex-shrink-0">
                    {rowEmoji}
                  </span>
                  <p
                    className="text-sm font-semibold w-24 flex-shrink-0"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {day.date}
                  </p>
                  <div
                    className="flex-1 h-2 rounded-full"
                    style={{ backgroundColor: "var(--border)" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${rate}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="text-xs flex items-center gap-1 font-medium"
                      style={{ color: "#16a34a" }}
                    >
                      ✅ {day.completed}
                    </span>
                    <span
                      className="text-xs flex items-center gap-1 font-medium"
                      style={{ color: "#d97706" }}
                    >
                      ⏳ {pending}
                    </span>
                    <span
                      className="text-xs font-bold w-9 text-right"
                      style={{
                        color:
                          barColor === "var(--border)"
                            ? "var(--text-faint)"
                            : barColor,
                      }}
                    >
                      {rate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
