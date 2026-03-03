import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../api/adminApi";

const TABS = ["Overview", "Users", "Activity", "Leaderboard"];

const StatCard = ({ label, value, sub, color = "#6366f1", icon }) => (
  <div
    className="rounded-xl p-5 flex flex-col gap-1 shadow"
    style={{
      backgroundColor: "var(--bg-card)",
      border: "1px solid var(--border)",
    }}
  >
    <div className="flex items-center justify-between mb-1">
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      {icon && <span className="text-xl">{icon}</span>}
    </div>
    <div className="text-3xl font-bold" style={{ color }}>
      {value ?? "—"}
    </div>
    {sub && (
      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
        {sub}
      </div>
    )}
  </div>
);

const Badge = ({ text, color }) => (
  <span
    className="text-xs px-2 py-0.5 rounded-full font-semibold"
    style={{ backgroundColor: `${color}22`, color }}
  >
    {text}
  </span>
);

const typeColors = {
  todo: "#6366f1",
  diary: "#f59e0b",
  habit: "#10b981",
  weeklyGoal: "#3b82f6",
  improvement: "#8b5cf6",
  research: "#06b6d4",
  lifeGoal: "#ec4899",
  rating: "#f97316",
};

const typeLabels = {
  todo: "Todo",
  diary: "Diary",
  habit: "Habit",
  weeklyGoal: "Weekly Goal",
  improvement: "Improvement",
  research: "Research",
  lifeGoal: "Life Goal",
  rating: "Rating",
};

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

// ── User Detail Modal ──────────────────────────────────────
const UserDetailModal = ({ userId, onClose, onToggleAdmin, onDelete }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getUserDetail(userId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading)
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <div className="text-white text-lg">Loading…</div>
      </div>
    );

  if (!data) return null;

  const {
    user,
    profile,
    counts,
    todos,
    diary,
    habits,
    weeklyGoals,
    improvement,
    research,
    lifeGoals,
    ratings,
  } = data;

  const sections = [
    { label: "Todos", items: todos, render: (t) => t.title },
    { label: "Diary", items: diary, render: (d) => d.title || "Untitled" },
    { label: "Habits", items: habits, render: (h) => h.name },
    {
      label: "Weekly Goals",
      items: weeklyGoals,
      render: (w) =>
        w.title || `Week ${new Date(w.weekStart).toLocaleDateString()}`,
    },
    {
      label: "Improvement",
      items: improvement,
      render: (i) => `${i.date} — ${i.lackedAreas?.substring(0, 40) || ""}`,
    },
    { label: "Research", items: research, render: (r) => r.title },
    { label: "Life Goals", items: lifeGoals, render: (l) => l.title },
    {
      label: "Ratings",
      items: ratings,
      render: (r) => `${r.category} — ${r.score}/10 (${r.date})`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-6 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: "#6366f133", color: "#6366f1" }}
            >
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user.name}
                </h2>
                {user.isAdmin && <Badge text="Admin" color="#f59e0b" />}
              </div>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                {user.email}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl"
            style={{ color: "var(--text-muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Counts Grid */}
        <div className="p-6">
          <h3
            className="font-semibold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Activity Summary
          </h3>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {Object.entries(counts).map(([key, val]) => (
              <div
                key={key}
                className="rounded-lg p-3 text-center"
                style={{
                  backgroundColor: `${typeColors[key] || "#6366f1"}15`,
                  border: `1px solid ${typeColors[key] || "#6366f1"}30`,
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: typeColors[key] || "#6366f1" }}
                >
                  {val}
                </div>
                <div
                  className="text-xs capitalize"
                  style={{ color: "var(--text-muted)" }}
                >
                  {typeLabels[key] || key}
                </div>
              </div>
            ))}
          </div>

          {/* Profile Picture */}
          {profile?.profilePic && (
            <div className="mb-4">
              <img
                src={profile.profilePic}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          )}

          {/* Recent Data Sections */}
          {sections.map(({ label, items, render }) =>
            items?.length > 0 ? (
              <div key={label} className="mb-4">
                <div
                  className="text-sm font-semibold mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Recent {label} ({items.length})
                </div>
                <div className="space-y-1">
                  {items.slice(0, 5).map((item, i) => (
                    <div
                      key={i}
                      className="text-sm px-3 py-1.5 rounded-lg truncate"
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {render(item)}
                    </div>
                  ))}
                </div>
              </div>
            ) : null,
          )}

          {/* Actions */}
          <div
            className="flex gap-3 pt-4 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={() => onToggleAdmin(user._id, user.isAdmin)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                backgroundColor: user.isAdmin ? "#f59e0b22" : "#6366f122",
                color: user.isAdmin ? "#f59e0b" : "#6366f1",
                border: `1px solid ${user.isAdmin ? "#f59e0b44" : "#6366f144"}`,
              }}
            >
              {user.isAdmin ? "Remove Admin" : "Make Admin"}
            </button>
            <button
              onClick={() => onDelete(user._id, user.name)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: "#ef444422",
                color: "#ef4444",
                border: "1px solid #ef444444",
              }}
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Overview Tab ───────────────────────────────────────────
const OverviewTab = ({ data }) => {
  if (!data)
    return (
      <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
        Loading…
      </div>
    );

  const { users, content, userGrowth } = data;
  const todoRate =
    content.todos.total > 0
      ? Math.round((content.todos.completed / content.todos.total) * 100)
      : 0;

  const contentItems = [
    {
      label: "Todos",
      value: content.todos.total,
      color: typeColors.todo,
      icon: "✅",
    },
    {
      label: "Diary Entries",
      value: content.diary,
      color: typeColors.diary,
      icon: "📔",
    },
    {
      label: "Habits",
      value: content.habits,
      color: typeColors.habit,
      icon: "🔥",
    },
    {
      label: "Study Items",
      value: content.study,
      color: "#64748b",
      icon: "📚",
    },
    {
      label: "Weekly Goals",
      value: content.weeklyGoals,
      color: typeColors.weeklyGoal,
      icon: "🎯",
    },
    {
      label: "Improvement",
      value: content.improvement,
      color: typeColors.improvement,
      icon: "📈",
    },
    {
      label: "Research",
      value: content.research,
      color: typeColors.research,
      icon: "🔬",
    },
    {
      label: "Life Goals",
      value: content.lifeGoals,
      color: typeColors.lifeGoal,
      icon: "🌟",
    },
    {
      label: "Ratings",
      value: content.ratings,
      color: typeColors.rating,
      icon: "⭐",
    },
  ];

  const maxGrowth = Math.max(...(userGrowth || []).map((g) => g.count), 1);

  return (
    <div className="space-y-6">
      {/* Top user stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={users.total}
          color="#6366f1"
          icon="👥"
          sub={`${users.admins} admin${users.admins !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="New Today"
          value={users.newToday}
          color="#10b981"
          icon="🆕"
        />
        <StatCard
          label="New This Week"
          value={users.newThisWeek}
          color="#3b82f6"
          icon="📅"
        />
        <StatCard
          label="New This Month"
          value={users.newThisMonth}
          color="#f59e0b"
          icon="🗓️"
        />
      </div>

      {/* Todo completion */}
      <div
        className="rounded-xl p-5 shadow"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <span
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Todo Completion Rate
          </span>
          <span className="text-2xl font-bold" style={{ color: "#10b981" }}>
            {todoRate}%
          </span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--bg-surface)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${todoRate}%`, backgroundColor: "#10b981" }}
          />
        </div>
        <div
          className="flex justify-between text-xs mt-2"
          style={{ color: "var(--text-muted)" }}
        >
          <span>Completed: {content.todos.completed}</span>
          <span>Pending: {content.todos.pending}</span>
          <span>Total: {content.todos.total}</span>
        </div>
      </div>

      {/* Total content */}
      <div
        className="rounded-xl p-5 shadow"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <span
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Total Content Created
          </span>
          <span className="text-3xl font-bold" style={{ color: "#6366f1" }}>
            {content.totalContent.toLocaleString()}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {contentItems.map(({ label, value, color, icon }) => (
            <div
              key={label}
              className="rounded-lg p-2 text-center"
              style={{
                backgroundColor: `${color}12`,
                border: `1px solid ${color}25`,
              }}
            >
              <div className="text-lg">{icon}</div>
              <div className="text-lg font-bold" style={{ color }}>
                {value}
              </div>
              <div
                className="text-xs leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User growth chart */}
      {userGrowth?.length > 0 && (
        <div
          className="rounded-xl p-5 shadow"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            User Growth
          </h3>
          <div className="flex items-end gap-2 h-32">
            {userGrowth.map((g) => (
              <div
                key={g.label}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#6366f1" }}
                >
                  {g.count}
                </span>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.max((g.count / maxGrowth) * 100, 4)}%`,
                    backgroundColor: "#6366f1",
                    minHeight: 4,
                  }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)", fontSize: 9 }}
                >
                  {g.label.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Users Tab ──────────────────────────────────────────────
const UsersTab = ({ onViewUser, onToggleAdmin, onDelete }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page, limit: 15, search });
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Delete user "${name}" and ALL their data? This cannot be undone.`,
      )
    )
      return;
    setDeleting(id);
    try {
      await onDelete(id);
      fetchUsers();
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id, currentAdmin) => {
    await onToggleAdmin(id, currentAdmin);
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search by name or email…"
          className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />
        <div
          className="text-sm flex items-center"
          style={{ color: "var(--text-muted)" }}
        >
          {data && `${data.total} users`}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden shadow"
        style={{ border: "1px solid var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: "var(--bg-surface)" }}>
              <tr>
                {[
                  "User",
                  "Email",
                  "Role",
                  "Activity Score",
                  "Todos",
                  "Diary",
                  "Habits",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-8"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Loading…
                  </td>
                </tr>
              ) : (
                data?.users.map((u) => (
                  <tr
                    key={u._id}
                    className="transition-colors cursor-pointer hover:opacity-80"
                    style={{
                      borderTop: "1px solid var(--border)",
                      backgroundColor: "var(--bg-card)",
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor: "#6366f122",
                            color: "#6366f1",
                          }}
                        >
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <span
                          className="font-medium text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <Badge text="Admin" color="#f59e0b" />
                      ) : (
                        <Badge text="User" color="#6366f1" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="font-bold text-sm"
                        style={{ color: "#10b981" }}
                      >
                        {u.activityScore}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {u.counts.todos}
                    </td>
                    <td
                      className="px-4 py-3 text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {u.counts.diary}
                    </td>
                    <td
                      className="px-4 py-3 text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {u.counts.habits}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onViewUser(u._id)}
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: "#6366f122",
                            color: "#6366f1",
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleToggle(u._id, u.isAdmin)}
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: "#f59e0b22",
                            color: "#f59e0b",
                          }}
                        >
                          {u.isAdmin ? "Demote" : "Promote"}
                        </button>
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          disabled={deleting === u._id}
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: "#ef444422",
                            color: "#ef4444",
                          }}
                        >
                          {deleting === u._id ? "…" : "Del"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex gap-2 justify-center pt-2">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-8 h-8 rounded-lg text-sm font-semibold"
              style={{
                backgroundColor: p === page ? "#6366f1" : "var(--bg-surface)",
                color: p === page ? "#fff" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Activity Tab ───────────────────────────────────────────
const ActivityTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    adminApi
      .getRecentActivity()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allTypes = ["all", ...Object.keys(typeColors)];
  const activities =
    data?.activities?.filter(
      (a) => filterType === "all" || a.type === filterType,
    ) || [];

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {allTypes.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className="px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all"
            style={{
              backgroundColor:
                filterType === t
                  ? typeColors[t] || "#6366f1"
                  : "var(--bg-surface)",
              color: filterType === t ? "#fff" : "var(--text-muted)",
              border: `1px solid ${filterType === t ? typeColors[t] || "#6366f1" : "var(--border)"}`,
            }}
          >
            {t === "all" ? "All" : typeLabels[t] || t}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          className="text-center py-12"
          style={{ color: "var(--text-muted)" }}
        >
          Loading activity…
        </div>
      ) : (
        <div className="space-y-2">
          {activities.length === 0 && (
            <div
              className="text-center py-8"
              style={{ color: "var(--text-muted)" }}
            >
              No activity found
            </div>
          )}
          {activities.map((a, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: `${a.color}22`, color: a.color }}
              >
                {(typeLabels[a.type] || a.type)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge text={typeLabels[a.type] || a.type} color={a.color} />
                  {a.extra && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {a.extra}
                    </span>
                  )}
                </div>
                <div
                  className="text-sm font-medium mt-0.5 truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {a.label}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  by{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    {a.userName}
                  </span>
                  {" · "}
                  {timeAgo(a.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Leaderboard Tab ────────────────────────────────────────
const LeaderboardTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getTopUsers()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-3">
      <div className="text-sm" style={{ color: "var(--text-muted)" }}>
        Activity score = weighted sum of all created content across modules
      </div>
      {loading ? (
        <div
          className="text-center py-12"
          style={{ color: "var(--text-muted)" }}
        >
          Loading leaderboard…
        </div>
      ) : (
        (data?.users || []).map((u, i) => {
          const max = data.users[0]?.score || 1;
          const pct = Math.max((u.score / max) * 100, 2);
          return (
            <div
              key={u._id}
              className="rounded-xl p-4 shadow"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl w-6 text-center">
                  {medals[i] || `#${i + 1}`}
                </span>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: "#6366f122", color: "#6366f1" }}
                >
                  {u.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {u.name}
                    </span>
                    {u.isAdmin && <Badge text="Admin" color="#f59e0b" />}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {u.email}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-xl font-bold"
                    style={{ color: "#10b981" }}
                  >
                    {u.score}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    pts
                  </div>
                </div>
              </div>
              {/* Bar */}
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--bg-surface)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: "#6366f1" }}
                />
              </div>
              {/* Mini counts */}
              <div className="flex gap-3 mt-2 flex-wrap">
                {Object.entries(u.counts).map(([k, v]) =>
                  v > 0 ? (
                    <span
                      key={k}
                      className="text-xs"
                      style={{ color: typeColors[k] || "var(--text-muted)" }}
                    >
                      {typeLabels[k] || k}: {v}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// ── Main AdminDashboard ────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    adminApi
      .getOverview()
      .then(setOverview)
      .catch(console.error)
      .finally(() => setOverviewLoading(false));
  }, []);

  const handleToggleAdmin = async (id) => {
    try {
      await adminApi.toggleAdmin(id);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await adminApi.deleteUser(id);
      if (selectedUserId === id) setSelectedUserId(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-full p-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Admin Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Monitor users, content, and platform activity
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            backgroundColor: "#f59e0b22",
            color: "#f59e0b",
            border: "1px solid #f59e0b44",
          }}
        >
          🛡️ Admin Mode
        </div>
      </div>

      {/* Quick stats banner */}
      {overview && !overviewLoading && (
        <div
          className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "#6366f1" }}>
              {overview.users.total}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Total Users
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "#10b981" }}>
              {overview.content.totalContent}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              Total Content
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: "#f59e0b" }}>
              {overview.users.newThisMonth}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              New This Month
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 mb-5 p-1 rounded-xl"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === i ? "#6366f1" : "transparent",
              color: activeTab === i ? "#fff" : "var(--text-muted)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 0 && overviewLoading && (
          <div
            className="text-center py-12"
            style={{ color: "var(--text-muted)" }}
          >
            Loading overview…
          </div>
        )}
        {activeTab === 0 && !overviewLoading && <OverviewTab data={overview} />}
        {activeTab === 1 && (
          <UsersTab
            onViewUser={setSelectedUserId}
            onToggleAdmin={handleToggleAdmin}
            onDelete={handleDeleteUser}
          />
        )}
        {activeTab === 2 && <ActivityTab />}
        {activeTab === 3 && <LeaderboardTab />}
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onToggleAdmin={async (id, isAdmin) => {
            await handleToggleAdmin(id, isAdmin);
            setSelectedUserId(null);
          }}
          onDelete={async (id, name) => {
            if (!window.confirm(`Delete user "${name}" and ALL their data?`))
              return;
            await handleDeleteUser(id);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
}
