import { useState, useEffect, useCallback, useRef } from "react";
import {
  FaBell,
  FaTimes,
  FaCheckDouble,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBullhorn,
  FaRocket,
  FaBolt,
  FaRegBell,
} from "react-icons/fa";
import { notificationApi } from "../../api/notificationApi";

/* ── Type metadata ────────────────────────────────── */
const TYPE_META = {
  info: {
    icon: FaInfoCircle,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.10)",
    label: "Info",
  },
  success: {
    icon: FaCheckCircle,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.10)",
    label: "Success",
  },
  warning: {
    icon: FaExclamationTriangle,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
    label: "Warning",
  },
  announcement: {
    icon: FaBullhorn,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.10)",
    label: "Announcement",
  },
  update: {
    icon: FaRocket,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.10)",
    label: "Update",
  },
  urgent: {
    icon: FaBolt,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.10)",
    label: "Urgent",
  },
};

const PRIORITY_RING = {
  urgent: "#ef4444",
  high: "#f59e0b",
  normal: "transparent",
};

/* ── Relative time helper ─────────────────────────── */
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ── Single notification card ─────────────────────── */
function NotificationCard({ notif, onRead, isDark }) {
  const meta = TYPE_META[notif.type] || TYPE_META.info;
  const Icon = meta.icon;
  const ring = PRIORITY_RING[notif.priority];
  const isPinned = notif.isPinned;

  return (
    <div
      onClick={() => !notif.isRead && onRead(notif._id)}
      className="group relative flex gap-3 rounded-xl p-3.5 cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: notif.isRead
          ? isDark
            ? "#1e293b"
            : "#ffffff"
          : isDark
            ? meta.color + "18"
            : meta.color + "12",
        border: `1px solid ${notif.isRead ? (isDark ? "#334155" : "#e2e8f0") : meta.color + "50"}`,
        outline: ring !== "transparent" ? `2px solid ${ring}40` : "none",
        outlineOffset: "1px",
        opacity: notif.isRead ? 0.72 : 1,
      }}
    >
      {/* Unread dot */}
      {!notif.isRead && (
        <span
          className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: meta.color }}
        />
      )}

      {/* Icon */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
        style={{
          backgroundColor: meta.bg,
          border: `1px solid ${meta.color}30`,
        }}
      >
        {notif.emoji ? (
          <span className="text-lg leading-none">{notif.emoji}</span>
        ) : (
          <Icon size={15} style={{ color: meta.color }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isPinned && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  backgroundColor: "#8b5cf620",
                  color: "#8b5cf6",
                  border: "1px solid #8b5cf640",
                }}
              >
                📌 Pinned
              </span>
            )}
            {notif.priority === "urgent" && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  backgroundColor: "#ef444420",
                  color: "#ef4444",
                  border: "1px solid #ef444440",
                }}
              >
                🔴 Urgent
              </span>
            )}
            {notif.priority === "high" && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  backgroundColor: "#f59e0b20",
                  color: "#f59e0b",
                  border: "1px solid #f59e0b40",
                }}
              >
                ⚡ High
              </span>
            )}
          </div>
          <span
            className="text-[11px] flex-shrink-0 mt-0.5"
            style={{ color: "var(--text-faint)" }}
          >
            {timeAgo(notif.createdAt)}
          </span>
        </div>

        <p
          className="text-sm font-semibold mt-1 leading-snug"
          style={{
            color: notif.isRead
              ? "var(--text-secondary)"
              : "var(--text-primary)",
          }}
        >
          {notif.title}
        </p>
        <p
          className="text-xs mt-0.5 leading-relaxed line-clamp-3"
          style={{ color: "var(--text-muted)" }}
        >
          {notif.message}
        </p>

        {/* Type badge */}
        <span
          className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.color}30`,
          }}
        >
          <Icon size={9} />
          {meta.label}
        </span>
      </div>
    </div>
  );
}

/* ── Main Panel ──────────────────────────────────────── */
const NotificationPanel = ({ token, onClose, isDark }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unread
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications(token);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleRead = async (id) => {
    try {
      await notificationApi.markAsRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAll = async () => {
    try {
      setMarkingAll(true);
      await notificationApi.markAllAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    } finally {
      setMarkingAll(false);
    }
  };

  const displayed =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 z-50 flex flex-col notif-panel-enter"
      style={{
        width: "min(420px, 96vw)",
        maxHeight: "min(600px, 85vh)",
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
        borderRadius: "16px",
        boxShadow: isDark
          ? "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)"
          : "0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{
          borderBottom: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
          background: isDark
            ? "linear-gradient(135deg, #1e293b 0%, #263044 100%)"
            : "linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            }}
          >
            <FaBell size={14} className="text-white" />
          </div>
          <div>
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Notifications
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: isDark
                  ? "rgba(59,130,246,0.15)"
                  : "rgba(59,130,246,0.08)",
                color: "#3b82f6",
                border: "1px solid rgba(59,130,246,0.25)",
              }}
              title="Mark all as read"
            >
              <FaCheckDouble size={10} />
              {markingAll ? "..." : "All read"}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = isDark
                ? "#263044"
                : "#f1f5f9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <FaTimes size={12} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="flex items-center gap-1 px-4 py-2"
        style={{
          borderBottom: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
          backgroundColor: isDark ? "#172033" : "#f8fafc",
        }}
      >
        {["all", "unread"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize"
            style={{
              backgroundColor:
                filter === f ? "#3b82f6" : isDark ? "#263044" : "#e2e8f0",
              color: filter === f ? "#fff" : isDark ? "#94a3b8" : "#475569",
              border:
                filter === f
                  ? "1px solid #3b82f6"
                  : isDark
                    ? "1px solid #334155"
                    : "1px solid #cbd5e1",
            }}
          >
            {f === "unread" && unreadCount > 0
              ? `Unread (${unreadCount})`
              : f === "unread"
                ? "Unread"
                : "All"}
          </button>
        ))}
        <span
          className="ml-auto text-xs"
          style={{ color: "var(--text-faint)" }}
        >
          {displayed.length} item{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
        style={{ backgroundColor: isDark ? "#1a2640" : "#f8fafc" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "#3b82f620", borderTopColor: "#3b82f6" }}
            />
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              Loading notifications…
            </p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: isDark ? "#263044" : "#e2e8f0",
                border: isDark ? "1px solid #334155" : "1px solid #cbd5e1",
              }}
            >
              <FaRegBell size={22} style={{ color: "var(--text-faint)" }} />
            </div>
            <div className="text-center">
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-secondary)" }}
              >
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-faint)" }}
              >
                {filter === "unread"
                  ? "You're all caught up 🎉"
                  : "Check back later for updates from the team"}
              </p>
            </div>
          </div>
        ) : (
          displayed.map((notif) => (
            <NotificationCard
              key={notif._id}
              notif={notif}
              onRead={handleRead}
              isDark={isDark}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {!loading && notifications.length > 0 && (
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{
            borderTop: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
            backgroundColor: isDark ? "#172033" : "#f1f5f9",
          }}
        >
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            {notifications.filter((n) => n.isRead).length}/
            {notifications.length} read
          </span>
          <button
            onClick={load}
            className="text-xs transition-colors"
            style={{ color: "#3b82f6" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export { NotificationPanel };

/* ── Bell Button (exported for use in Navbar) ─────── */
export function NotificationBell({ token, isDark }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapperRef = useRef(null);

  // Poll for unread count every 60 s
  const fetchCount = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationApi.getNotifications(token);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchCount();
    };
    run();
    const interval = setInterval(run, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchCount]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative"
        style={{
          backgroundColor: open
            ? "var(--accent)"
            : isDark
              ? "#1e293b"
              : "#f1f5f9",
          border: open
            ? "1px solid var(--accent)"
            : "1px solid var(--border-strong)",
          boxShadow: open ? "0 0 0 3px var(--accent-light)" : "none",
        }}
      >
        <FaBell
          size={14}
          style={{ color: open ? "#fff" : "var(--text-muted)" }}
          className={
            unreadCount > 0 && !open
              ? "animate-[wiggle_1.5s_ease-in-out_infinite]"
              : ""
          }
        />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none px-1"
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              boxShadow: "0 2px 6px rgba(239,68,68,0.5)",
              border: `2px solid ${isDark ? "#0f172a" : "#ffffff"}`,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="relative z-50">
            <NotificationPanel
              token={token}
              isDark={isDark}
              onClose={() => {
                setOpen(false);
                fetchCount();
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationPanel;
