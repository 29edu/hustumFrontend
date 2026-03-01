import { useState, useEffect, useRef, useMemo } from "react";
import {
  FaTimes,
  FaPlus,
  FaLink,
  FaSearch,
  FaThumbsUp,
  FaTrash,
  FaEdit,
  FaThumbtack,
  FaExternalLinkAlt,
  FaTag,
  FaFire,
  FaCheck,
  FaBookmark,
  FaGlobe,
  FaKeyboard,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

/* ─── Helpers ──────────────────────────────────────────────── */

const CATEGORY_COLORS = {
  Work: {
    bg: "#3b82f6",
    light: "rgba(59,130,246,0.12)",
    darkLight: "rgba(59,130,246,0.2)",
  },
  Study: {
    bg: "#8b5cf6",
    light: "rgba(139,92,246,0.12)",
    darkLight: "rgba(139,92,246,0.2)",
  },
  Social: {
    bg: "#10b981",
    light: "rgba(16,185,129,0.12)",
    darkLight: "rgba(16,185,129,0.2)",
  },
  News: {
    bg: "#f59e0b",
    light: "rgba(245,158,11,0.12)",
    darkLight: "rgba(245,158,11,0.2)",
  },
  Tools: {
    bg: "#06b6d4",
    light: "rgba(6,182,212,0.12)",
    darkLight: "rgba(6,182,212,0.2)",
  },
  Fun: {
    bg: "#f43f5e",
    light: "rgba(244,63,94,0.12)",
    darkLight: "rgba(244,63,94,0.2)",
  },
  Other: {
    bg: "#64748b",
    light: "rgba(100,116,139,0.12)",
    darkLight: "rgba(100,116,139,0.2)",
  },
};

const DEFAULT_LINKS = [
  {
    id: "1",
    title: "Google",
    url: "https://google.com",
    category: "Tools",
    pinned: false,
    visits: 0,
    createdAt: Date.now(),
  },
  {
    id: "2",
    title: "YouTube",
    url: "https://youtube.com",
    category: "Fun",
    pinned: false,
    visits: 0,
    createdAt: Date.now(),
  },
  {
    id: "3",
    title: "GitHub",
    url: "https://github.com",
    category: "Work",
    pinned: true,
    visits: 0,
    createdAt: Date.now(),
  },
  {
    id: "4",
    title: "ChatGPT",
    url: "https://chat.openai.com",
    category: "Tools",
    pinned: true,
    visits: 0,
    createdAt: Date.now(),
  },
  {
    id: "5",
    title: "Wikipedia",
    url: "https://wikipedia.org",
    category: "Study",
    pinned: false,
    visits: 0,
    createdAt: Date.now(),
  },
  {
    id: "6",
    title: "Reddit",
    url: "https://reddit.com",
    category: "Social",
    pinned: false,
    visits: 0,
    createdAt: Date.now(),
  },
];

function getFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ─── Sub-components ───────────────────────────────────────── */

function FaviconImg({ url, title }) {
  const [errored, setErrored] = useState(false);
  const src = getFavicon(url);
  if (errored || !src) {
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
        style={{ background: "var(--accent)" }}
      >
        {title?.charAt(0)?.toUpperCase() || "?"}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={title}
      className="w-8 h-8 rounded-lg object-cover"
      style={{ background: "var(--bg-subtle)" }}
      onError={() => setErrored(true)}
    />
  );
}

function CategoryBadge({ category, isDark }) {
  const col = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        background: isDark ? col.darkLight : col.light,
        color: col.bg,
        border: `1px solid ${col.bg}30`,
      }}
    >
      {category}
    </span>
  );
}

/* ─── Add / Edit Form ──────────────────────────────────────── */

function LinkForm({ initial, onSave, onCancel, isDark }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [url, setUrl] = useState(initial?.url || "");
  const [category, setCategory] = useState(initial?.category || "Other");
  const [customCat, setCustomCat] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const allCats = Object.keys(CATEGORY_COLORS);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = "https://" + finalUrl;
    const finalCat = customCat.trim() || category;
    const finalTitle = title.trim() || getDomain(finalUrl);
    onSave({ title: finalTitle, url: finalUrl, category: finalCat });
  };

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    border: "1px solid var(--border-strong)",
    color: "var(--text-primary)",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 13,
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label
          className="block text-xs font-semibold mb-1"
          style={{ color: "var(--text-faint)" }}
        >
          URL *
        </label>
        <input
          ref={inputRef}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
        />
      </div>
      <div>
        <label
          className="block text-xs font-semibold mb-1"
          style={{ color: "var(--text-faint)" }}
        >
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My favourite site"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
        />
      </div>

      {/* Category chips */}
      <div>
        <label
          className="block text-xs font-semibold mb-2"
          style={{ color: "var(--text-faint)" }}
        >
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {allCats.map((c) => {
            const col = CATEGORY_COLORS[c];
            const active = category === c && !customCat;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                  setCustomCat("");
                }}
                className="text-xs px-3 py-1 rounded-full transition-all"
                style={{
                  background: active
                    ? col.bg
                    : isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.05)",
                  color: active ? "#fff" : col.bg,
                  border: `1px solid ${active ? col.bg : col.bg + "50"}`,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
        <input
          value={customCat}
          onChange={(e) => setCustomCat(e.target.value)}
          placeholder="Or type a custom category…"
          className="mt-2"
          style={{ ...inputStyle, fontSize: 12 }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: "var(--accent)",
            boxShadow: "0 4px 12px var(--accent-light)",
          }}
        >
          <FaCheck size={11} />
          {initial ? "Save Changes" : "Add Link"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm transition-all"
          style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            color: "var(--text-muted)",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Link Card ────────────────────────────────────────────── */

function LinkCard({ link, onVisit, onPin, onEdit, onDelete, isDark }) {
  const [hovered, setHovered] = useState(false);
  const col = CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Other;

  return (
    <div
      className="relative group rounded-2xl p-4 transition-all duration-200 cursor-pointer"
      style={{
        background: isDark
          ? hovered
            ? "rgba(255,255,255,0.07)"
            : "rgba(255,255,255,0.04)"
          : hovered
            ? "rgba(0,0,0,0.04)"
            : "rgba(0,0,0,0.02)",
        border: `1px solid ${hovered ? "var(--border-strong)" : "var(--border)"}`,
        boxShadow: hovered
          ? isDark
            ? "0 8px 24px rgba(0,0,0,0.4)"
            : "0 8px 24px rgba(0,0,0,0.08)"
          : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onVisit(link)}
    >
      {/* Pin indicator */}
      {link.pinned && (
        <div
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: "var(--accent)",
            boxShadow: "0 2px 8px var(--accent-light)",
          }}
        >
          <FaThumbtack
            size={8}
            className="text-white"
            style={{ transform: "rotate(-30deg)" }}
          />
        </div>
      )}

      {/* Action buttons - shown on hover */}
      <div
        className="absolute top-2.5 right-2.5 flex gap-1 transition-all duration-150"
        style={{
          opacity: hovered && !link.pinned ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onPin(link.id)}
          title="Pin"
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
            color: "var(--text-muted)",
          }}
        >
          <FaThumbtack size={9} />
        </button>
        <button
          onClick={() => onEdit(link)}
          title="Edit"
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
            color: "var(--text-muted)",
          }}
        >
          <FaEdit size={9} />
        </button>
        <button
          onClick={() => onDelete(link.id)}
          title="Delete"
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
          style={{ background: "rgba(244,63,94,0.12)", color: "#f43f5e" }}
        >
          <FaTrash size={9} />
        </button>
      </div>

      {/* Content */}
      <div className="flex items-start gap-3">
        <FaviconImg url={link.url} title={link.title} />
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {link.title}
          </p>
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: "var(--text-faint)" }}
          >
            {getDomain(link.url)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <CategoryBadge category={link.category} isDark={isDark} />
        <div
          className="flex items-center gap-1"
          style={{ color: "var(--text-faint)" }}
        >
          {link.visits > 0 && (
            <span className="text-xs flex items-center gap-1">
              <FaFire
                size={9}
                style={{
                  color: link.visits > 5 ? "#f59e0b" : "var(--text-faint)",
                }}
              />
              {link.visits}
            </span>
          )}
          <FaExternalLinkAlt
            size={9}
            style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}
          />
        </div>
      </div>

      {/* Accent bottom line */}
      <div
        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transition-all duration-200"
        style={{
          background: col.bg,
          opacity: hovered ? 0.6 : 0,
        }}
      />
    </div>
  );
}

/* ─── Main LinksPanel ──────────────────────────────────────── */

const LinksPanel = ({ onClose }) => {
  const { isDark } = useTheme();

  const [links, setLinks] = useState(() => {
    try {
      const stored = localStorage.getItem("hustum_links");
      return stored ? JSON.parse(stored) : DEFAULT_LINKS;
    } catch {
      return DEFAULT_LINKS;
    }
  });

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const searchRef = useRef(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("hustum_links", JSON.stringify(links));
  }, [links]);

  // Focus search on open
  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 120);
  }, []);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ── Derived data ── */
  const allCategories = useMemo(() => {
    const cats = [...new Set(links.map((l) => l.category))];
    return ["All", "Pinned", ...cats];
  }, [links]);

  const filtered = useMemo(() => {
    let list = [...links];
    if (activeFilter === "Pinned") list = list.filter((l) => l.pinned);
    else if (activeFilter !== "All")
      list = list.filter((l) => l.category === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q),
      );
    }
    // Pinned first
    return [...list.filter((l) => l.pinned), ...list.filter((l) => !l.pinned)];
  }, [links, activeFilter, search]);

  const topVisited = useMemo(
    () =>
      [...links]
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 4)
        .filter((l) => l.visits > 0),
    [links],
  );

  /* ── Handlers ── */
  const handleVisit = (link) => {
    window.open(link.url, "_blank", "noopener,noreferrer");
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, visits: l.visits + 1 } : l)),
    );
  };

  const handlePin = (id) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)),
    );
  };

  const handleDelete = (id) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSave = ({ title, url, category }) => {
    if (editingLink) {
      setLinks((prev) =>
        prev.map((l) =>
          l.id === editingLink.id ? { ...l, title, url, category } : l,
        ),
      );
      setEditingLink(null);
    } else {
      setLinks((prev) => [
        {
          id: genId(),
          title,
          url,
          category,
          pinned: false,
          visits: 0,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    }
    setShowForm(false);
  };

  const panelBg = isDark ? "rgba(10,18,35,0.98)" : "rgba(255,255,255,0.98)";
  const sectionBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed left-0 right-0 z-50 settings-panel-enter"
        style={{
          top: 64,
          background: panelBg,
          borderBottom: "1px solid var(--border-strong)",
          boxShadow: isDark
            ? "0 20px 60px rgba(0,0,0,0.7)"
            : "0 20px 60px rgba(0,0,0,0.14)",
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-6xl mx-auto px-6 py-5">
          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 4px 14px var(--accent-light)",
                }}
              >
                <FaBookmark size={15} className="text-white" />
              </div>
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Quick Links
                </h2>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  {links.length} bookmarks saved · click to open in new tab
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Keyboard hint */}
              <span
                className="hidden md:flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
                style={{
                  color: "var(--text-faint)",
                  background: sectionBg,
                  border: "1px solid var(--border)",
                }}
              >
                <FaKeyboard size={10} />
                Esc to close
              </span>

              {/* Add button */}
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingLink(null);
                }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: showForm ? "var(--text-muted)" : "var(--accent)",
                  boxShadow: showForm
                    ? "none"
                    : "0 4px 14px var(--accent-light)",
                }}
              >
                {showForm ? <FaTimes size={12} /> : <FaPlus size={12} />}
                {showForm ? "Cancel" : "Add Link"}
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  color: "var(--text-muted)",
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)",
                }}
              >
                <FaTimes size={13} />
              </button>
            </div>
          </div>

          {/* ── Add / Edit Form ── */}
          {(showForm || editingLink) && (
            <div
              className="rounded-2xl p-5 mb-5"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
                border: "1px solid var(--accent)",
                boxShadow: "0 0 0 3px var(--accent-light)",
              }}
            >
              <p
                className="text-sm font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                {editingLink ? "✏️ Edit Bookmark" : "🔗 Add New Bookmark"}
              </p>
              <LinkForm
                initial={editingLink}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingLink(null);
                }}
                isDark={isDark}
              />
            </div>
          )}

          {/* ── Top Visited (shown only if exists, not searching) ── */}
          {topVisited.length > 0 && !search && activeFilter === "All" && (
            <div className="mb-5">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                style={{ color: "var(--text-faint)" }}
              >
                <FaFire size={10} style={{ color: "#f59e0b" }} />
                Most Visited
              </p>
              <div className="flex gap-2 flex-wrap">
                {topVisited.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleVisit(link)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
                    style={{
                      background: isDark
                        ? "rgba(245,158,11,0.08)"
                        : "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      color: "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isDark
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(245,158,11,0.14)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isDark
                        ? "rgba(245,158,11,0.08)"
                        : "rgba(245,158,11,0.08)")
                    }
                  >
                    <FaviconImg url={link.url} title={link.title} />
                    <span className="font-medium">{link.title}</span>
                    <span
                      className="text-xs flex items-center gap-0.5"
                      style={{ color: "#f59e0b" }}
                    >
                      <FaFire size={9} />
                      {link.visits}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Search + Filters row ── */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-48 max-w-72"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.04)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <FaSearch
                size={12}
                style={{ color: "var(--text-faint)", flexShrink: 0 }}
              />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search links…"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  width: "100%",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{ color: "var(--text-faint)", flexShrink: 0 }}
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>

            {/* Category filter chips */}
            <div className="flex gap-1.5 flex-wrap">
              {allCategories.map((cat) => {
                const active = activeFilter === cat;
                const col = CATEGORY_COLORS[cat];
                const isPinned = cat === "Pinned";
                const accentColor = isPinned
                  ? "#f59e0b"
                  : col?.bg || "var(--accent)";

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                    style={{
                      background: active
                        ? accentColor
                        : isDark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.04)",
                      color: active ? "#fff" : col?.bg || "var(--text-muted)",
                      border: `1px solid ${active ? accentColor : (col?.bg || "var(--border)") + "40"}`,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {isPinned ? "📌 " : ""}
                    {cat}
                    {cat !== "All" && cat !== "Pinned" && (
                      <span
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs"
                        style={{
                          background: active
                            ? "rgba(255,255,255,0.25)"
                            : isDark
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.08)",
                          fontSize: 10,
                        }}
                      >
                        {links.filter((l) => l.category === cat).length}
                      </span>
                    )}
                    {cat === "Pinned" && (
                      <span
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-xs"
                        style={{
                          background: active
                            ? "rgba(255,255,255,0.25)"
                            : isDark
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.08)",
                          fontSize: 10,
                        }}
                      >
                        {links.filter((l) => l.pinned).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Links Grid ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.04)",
                }}
              >
                <FaGlobe size={28} style={{ color: "var(--text-faint)" }} />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  No links found
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-faint)" }}
                >
                  {search
                    ? "Try a different search term"
                    : 'Click "Add Link" to get started'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filtered.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onVisit={handleVisit}
                  onPin={handlePin}
                  onEdit={(l) => {
                    setEditingLink(l);
                    setShowForm(false);
                  }}
                  onDelete={handleDelete}
                  isDark={isDark}
                />
              ))}

              {/* Add new — ghost card */}
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingLink(null);
                }}
                className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: "transparent",
                  border: `2px dashed ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
                  minHeight: 108,
                  color: "var(--text-faint)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.background = "var(--accent-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.1)";
                  e.currentTarget.style.color = "var(--text-faint)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.05)",
                  }}
                >
                  <FaPlus size={13} />
                </div>
                <span className="text-xs font-medium">Add Link</span>
              </button>
            </div>
          )}

          {/* ── Footer stats ── */}
          <div
            className="flex items-center justify-between mt-5 pt-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-4">
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                <FaLink
                  size={9}
                  style={{ display: "inline", marginRight: 4 }}
                />
                {links.length} links
              </span>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                <FaThumbtack
                  size={9}
                  style={{ display: "inline", marginRight: 4 }}
                />
                {links.filter((l) => l.pinned).length} pinned
              </span>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                <FaThumbsUp
                  size={9}
                  style={{ display: "inline", marginRight: 4 }}
                />
                {links.reduce((s, l) => s + l.visits, 0)} total visits
              </span>
            </div>
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              <FaTag size={9} style={{ display: "inline", marginRight: 4 }} />
              {[...new Set(links.map((l) => l.category))].length} categories
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinksPanel;
