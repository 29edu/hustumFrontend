import { useState, useMemo } from "react";
import {
  FaBook,
  FaBookOpen,
  FaBookmark,
  FaPlus,
  FaSearch,
  FaTimes,
  FaStar,
  FaTrash,
  FaEdit,
  FaChevronDown,
  FaCheck,
  FaFire,
  FaTrophy,
  FaList,
  FaThLarge,
  FaQuoteLeft,
  FaTag,
  FaFilter,
  FaSortAmountDown,
  FaRegStar,
  FaRegBookmark,
  FaClock,
  FaCalendarAlt,
  FaChartBar,
  FaArrowLeft,
  FaShare,
  FaGlobeAmericas,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

// ─── Constants ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "hustum_library_v1";
const GOAL_KEY = "hustum_library_goal_v1";

const STATUS = {
  READING: "reading",
  WANT: "want",
  READ: "read",
};

const STATUS_META = {
  [STATUS.READING]: {
    label: "Currently Reading",
    color: "#3b82f6",
    bg: "#eff6ff",
    darkBg: "rgba(59,130,246,0.15)",
    icon: FaBookOpen,
    emoji: "📖",
  },
  [STATUS.WANT]: {
    label: "Want to Read",
    color: "#f59e0b",
    bg: "#fffbeb",
    darkBg: "rgba(245,158,11,0.15)",
    icon: FaRegBookmark,
    emoji: "⭐",
  },
  [STATUS.READ]: {
    label: "Already Read",
    color: "#10b981",
    bg: "#f0fdf4",
    darkBg: "rgba(16,185,129,0.15)",
    icon: FaCheck,
    emoji: "✅",
  },
};

const CATEGORIES = [
  { id: "fiction", label: "Fiction", color: "#8b5cf6", emoji: "🌌" },
  { id: "non-fiction", label: "Non-Fiction", color: "#3b82f6", emoji: "📰" },
  { id: "self-help", label: "Self-Help", color: "#f59e0b", emoji: "💡" },
  { id: "technical", label: "Technical", color: "#06b6d4", emoji: "💻" },
  { id: "biography", label: "Biography", color: "#ec4899", emoji: "👤" },
  { id: "science", label: "Science", color: "#10b981", emoji: "🔬" },
  { id: "history", label: "History", color: "#f97316", emoji: "🏛️" },
  { id: "philosophy", label: "Philosophy", color: "#6366f1", emoji: "🧠" },
  { id: "business", label: "Business", color: "#84cc16", emoji: "💼" },
  { id: "psychology", label: "Psychology", color: "#ef4444", emoji: "🧬" },
  { id: "thriller", label: "Thriller", color: "#64748b", emoji: "🕵️" },
  { id: "romance", label: "Romance", color: "#f43f5e", emoji: "💕" },
  { id: "spirituality", label: "Spirituality", color: "#a78bfa", emoji: "🕊️" },
  { id: "other", label: "Other", color: "#94a3b8", emoji: "📚" },
];

const COVER_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#6366f1",
  "#84cc16",
  "#64748b",
  "#a78bfa",
  "#f43f5e",
  "#14b8a6",
  "#0ea5e9",
];

const SORT_OPTIONS = [
  { id: "dateDesc", label: "Newest Added" },
  { id: "dateAsc", label: "Oldest Added" },
  { id: "title", label: "Title A→Z" },
  { id: "author", label: "Author A→Z" },
  { id: "rating", label: "Highest Rated" },
  { id: "progress", label: "Most Progress" },
];

const genId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// ─── Helpers ────────────────────────────────────────────────────────────────
function loadBooks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
function loadGoal() {
  try {
    return (
      JSON.parse(localStorage.getItem(GOAL_KEY)) || {
        year: new Date().getFullYear(),
        target: 12,
      }
    );
  } catch {
    return { year: new Date().getFullYear(), target: 12 };
  }
}
function saveGoal(g) {
  localStorage.setItem(GOAL_KEY, JSON.stringify(g));
}

// ─── Star Rating ────────────────────────────────────────────────────────────
const StarRating = ({ value = 0, onChange, size = 16, readonly = false }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() =>
          !readonly && onChange && onChange(star === value ? 0 : star)
        }
        className={`transition-transform ${!readonly ? "hover:scale-125 cursor-pointer" : "cursor-default"}`}
        disabled={readonly}
      >
        {star <= value ? (
          <FaStar size={size} color="#f59e0b" />
        ) : (
          <FaRegStar size={size} color="#94a3b8" />
        )}
      </button>
    ))}
  </div>
);

// ─── Progress Bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ current, total, color = "#3b82f6" }) => {
  const pct =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {current} / {total} pages
        </span>
        <span className="text-xs font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--bg-elevated)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ─── Book Cover ─────────────────────────────────────────────────────────────
const BookCover = ({ book, size = "md" }) => {
  const dims = {
    sm: { w: "w-10", h: "h-14", text: "text-sm" },
    md: { w: "w-16", h: "h-22", text: "text-xl" },
    lg: { w: "w-24", h: "h-32", text: "text-3xl" },
  };
  const d = dims[size] || dims.md;
  const cat = CATEGORIES.find((c) => c.id === book.category);
  return (
    <div
      className={`${d.w} ${d.h} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md relative overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${book.coverColor || "#3b82f6"}, ${book.coverColor || "#3b82f6"}cc)`,
        minHeight: size === "lg" ? "128px" : size === "sm" ? "56px" : "88px",
        minWidth: size === "lg" ? "96px" : size === "sm" ? "40px" : "64px",
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: "linear-gradient(to bottom right, #fff, transparent)",
        }}
      />
      <span className={d.text}>{cat?.emoji || "📚"}</span>
    </div>
  );
};

// ─── Book Card ───────────────────────────────────────────────────────────────
const BookCard = ({ book, onView, onEdit, onDelete, isDark }) => {
  const statusMeta = STATUS_META[book.status];
  const cat = CATEGORIES.find((c) => c.id === book.category);

  return (
    <div
      className="group rounded-2xl flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lg cursor-pointer"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
      onClick={() => onView(book)}
    >
      {/* Cover + status strip */}
      <div
        className="relative p-4 flex gap-3"
        style={{
          background: isDark ? statusMeta.darkBg : statusMeta.bg,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <BookCover book={book} size="md" />
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3
            className="font-bold text-sm leading-tight line-clamp-2"
            style={{ color: "var(--text-primary)" }}
          >
            {book.title}
          </h3>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {book.author || "Unknown Author"}
          </p>
          {cat && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium w-fit mt-auto"
              style={{ background: cat.color + "20", color: cat.color }}
            >
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Status badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: statusMeta.color + "20",
              color: statusMeta.color,
            }}
          >
            {statusMeta.emoji} {statusMeta.label}
          </span>
          {book.dateFinished && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              <FaCalendarAlt size={9} className="inline mr-1" />
              {new Date(book.dateFinished).getFullYear()}
            </span>
          )}
        </div>

        {/* Progress bar for currently reading */}
        {book.status === STATUS.READING && book.totalPages > 0 && (
          <ProgressBar
            current={book.currentPage || 0}
            total={book.totalPages}
            color={statusMeta.color}
          />
        )}

        {/* Rating for read books */}
        {book.status === STATUS.READ && (
          <StarRating value={book.rating || 0} readonly size={13} />
        )}

        {/* Notes preview */}
        {book.notes && (
          <p
            className="text-xs italic line-clamp-2"
            style={{ color: "var(--text-muted)" }}
          >
            <FaQuoteLeft size={9} className="inline mr-1" />
            {book.notes}
          </p>
        )}

        {/* Actions — bottom right */}
        <div
          className="flex gap-1.5 justify-end mt-auto pt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(book);
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}
          >
            <FaEdit size={11} style={{ color: "var(--text-secondary)" }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(book.id);
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
            style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
          >
            <FaTrash size={11} color="#ef4444" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Book Row ────────────────────────────────────────────────────────────────
const BookRow = ({ book, onView, onEdit, onDelete }) => {
  const statusMeta = STATUS_META[book.status];
  const cat = CATEGORIES.find((c) => c.id === book.category);
  return (
    <div
      className="group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-150 hover:shadow-md cursor-pointer"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
      onClick={() => onView(book)}
    >
      <BookCover book={book} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {book.title}
          </span>
          {cat && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: cat.color + "20", color: cat.color }}
            >
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          {book.author || "Unknown Author"}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {book.status === STATUS.READ && (
          <StarRating value={book.rating || 0} readonly size={12} />
        )}
        {book.status === STATUS.READING && book.totalPages > 0 && (
          <span
            className="text-xs font-bold"
            style={{ color: statusMeta.color }}
          >
            {Math.round(((book.currentPage || 0) / book.totalPages) * 100)}%
          </span>
        )}
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{
            background: statusMeta.color + "20",
            color: statusMeta.color,
          }}
        >
          {statusMeta.emoji} {statusMeta.label}
        </span>
        <div
          className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(book);
            }}
            className="p-1.5 rounded-lg"
            style={{ background: "var(--bg-elevated)" }}
          >
            <FaEdit size={11} style={{ color: "var(--text-secondary)" }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(book.id);
            }}
            className="p-1.5 rounded-lg"
            style={{ background: "var(--bg-elevated)" }}
          >
            <FaTrash size={11} color="#ef4444" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Book Detail Modal ───────────────────────────────────────────────────────
const BookDetailModal = ({ book, onClose, onEdit, isDark }) => {
  const statusMeta = STATUS_META[book.status];
  const cat = CATEGORIES.find((c) => c.id === book.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="p-6 flex gap-5"
          style={{
            background: isDark ? statusMeta.darkBg : statusMeta.bg,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <BookCover book={book} size="lg" />
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {book.title}
            </h2>
            <p
              className="text-sm mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              by {book.author || "Unknown Author"}
            </p>
            {cat && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{ background: cat.color + "25", color: cat.color }}
              >
                {cat.emoji} {cat.label}
              </span>
            )}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span
                className="text-sm px-3 py-1 rounded-full font-medium"
                style={{
                  background: statusMeta.color + "20",
                  color: statusMeta.color,
                }}
              >
                {statusMeta.emoji} {statusMeta.label}
              </span>
              {book.totalPages > 0 && (
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  📄 {book.totalPages} pages
                </span>
              )}
              {book.dateAdded && (
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  <FaCalendarAlt size={12} className="inline mr-1" />
                  Added {new Date(book.dateAdded).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(book)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <FaEdit size={12} /> Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-opacity hover:opacity-70"
              style={{ background: "var(--bg-elevated)" }}
            >
              <FaTimes size={14} style={{ color: "var(--text-secondary)" }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Progress */}
          {book.status === STATUS.READING && book.totalPages > 0 && (
            <div>
              <h4
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Reading Progress
              </h4>
              <ProgressBar
                current={book.currentPage || 0}
                total={book.totalPages}
                color={statusMeta.color}
              />
            </div>
          )}

          {/* Rating */}
          {book.status === STATUS.READ && (
            <div>
              <h4
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Your Rating
              </h4>
              <div className="flex items-center gap-3">
                <StarRating value={book.rating || 0} readonly size={20} />
                {book.rating > 0 && (
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#f59e0b" }}
                  >
                    {book.rating} / 5
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {book.dateStarted && (
              <div
                className="p-3 rounded-xl"
                style={{ background: "var(--bg-elevated)" }}
              >
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Started Reading
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {new Date(book.dateStarted).toLocaleDateString()}
                </p>
              </div>
            )}
            {book.dateFinished && (
              <div
                className="p-3 rounded-xl"
                style={{ background: "var(--bg-elevated)" }}
              >
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Finished Reading
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {new Date(book.dateFinished).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {book.notes && (
            <div
              className="p-4 rounded-xl"
              style={{
                background: "var(--bg-elevated)",
                borderLeft: `3px solid ${statusMeta.color}`,
              }}
            >
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                <FaQuoteLeft size={10} className="inline mr-1" /> Notes &
                Thoughts
              </p>
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--text-primary)" }}
              >
                {book.notes}
              </p>
            </div>
          )}

          {/* Quotes */}
          {book.quotes?.length > 0 && (
            <div>
              <h4
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                Favourite Quotes
              </h4>
              <div className="space-y-2">
                {book.quotes.map((q, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl relative"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <FaQuoteLeft
                      size={12}
                      className="absolute top-3 left-3 opacity-30"
                      style={{ color: statusMeta.color }}
                    />
                    <p
                      className="text-sm italic pl-6"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Add/Edit Modal ──────────────────────────────────────────────────────────
const BookFormModal = ({ initial, onClose, onSave }) => {
  const { isDark } = useTheme();
  const isEdit = !!initial?.id;
  const blank = {
    title: "",
    author: "",
    category: "other",
    status: STATUS.WANT,
    coverColor: COVER_COLORS[0],
    totalPages: "",
    currentPage: "",
    rating: 0,
    notes: "",
    quotes: [],
    dateStarted: "",
    dateFinished: "",
  };
  const [form, setForm] = useState(
    initial
      ? {
          ...blank,
          ...initial,
          totalPages: initial.totalPages?.toString() || "",
          currentPage: initial.currentPage?.toString() || "",
        }
      : blank,
  );
  const [newQuote, setNewQuote] = useState("");
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave({
      ...form,
      totalPages: form.totalPages ? parseInt(form.totalPages) : 0,
      currentPage: form.currentPage ? parseInt(form.currentPage) : 0,
    });
  };

  const addQuote = () => {
    if (!newQuote.trim()) return;
    set("quotes", [...(form.quotes || []), newQuote.trim()]);
    setNewQuote("");
  };

  const removeQuote = (i) => {
    set(
      "quotes",
      form.quotes.filter((_, idx) => idx !== i),
    );
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "progress", label: "Progress" },
    { id: "notes", label: "Notes & Quotes" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{
          background: "#ffffff",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            className="text-base font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {isEdit ? "Edit Book" : "Add New Book"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-70"
          >
            <FaTimes size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 py-2.5 text-sm font-medium transition-colors"
              style={{
                color:
                  activeTab === t.id ? "var(--accent)" : "var(--text-muted)",
                borderBottom:
                  activeTab === t.id
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {activeTab === "basic" && (
            <>
              {/* Title */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Book Title *
                </label>
                <input
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--bg-elevated)",
                    border: errors.title
                      ? "1.5px solid #ef4444"
                      : "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Enter book title..."
                  value={form.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    setErrors((err) => ({ ...err, title: undefined }));
                  }}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Author */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Author
                </label>
                <input
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Author name..."
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => set("category", c.id)}
                      className="flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-all"
                      style={{
                        background:
                          form.category === c.id
                            ? c.color + "25"
                            : "var(--bg-elevated)",
                        border:
                          form.category === c.id
                            ? `1.5px solid ${c.color}`
                            : "1.5px solid var(--border)",
                        color:
                          form.category === c.id
                            ? c.color
                            : "var(--text-secondary)",
                        fontWeight: form.category === c.id ? "600" : "400",
                      }}
                    >
                      <span>{c.emoji}</span>
                      <span className="leading-tight text-center">
                        {c.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Reading Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set("status", key)}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-sm transition-all"
                      style={{
                        background:
                          form.status === key
                            ? isDark
                              ? meta.darkBg
                              : meta.bg
                            : "var(--bg-elevated)",
                        border:
                          form.status === key
                            ? `1.5px solid ${meta.color}`
                            : "1.5px solid var(--border)",
                        color:
                          form.status === key
                            ? meta.color
                            : "var(--text-secondary)",
                        fontWeight: form.status === key ? "700" : "400",
                      }}
                    >
                      <span className="text-lg">{meta.emoji}</span>
                      <span className="text-xs text-center leading-tight">
                        {meta.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Color */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cover Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COVER_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set("coverColor", c)}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{
                        background: c,
                        outline:
                          form.coverColor === c ? `3px solid ${c}` : "none",
                        outlineOffset: "2px",
                        transform:
                          form.coverColor === c ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "progress" && (
            <>
              {/* Rating */}
              {form.status === STATUS.READ && (
                <div>
                  <label
                    className="block text-xs font-semibold mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Your Rating
                  </label>
                  <StarRating
                    value={form.rating}
                    onChange={(v) => set("rating", v)}
                    size={24}
                  />
                </div>
              )}

              {/* Pages */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Total Pages
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1.5px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="e.g. 320"
                    value={form.totalPages}
                    onChange={(e) => set("totalPages", e.target.value)}
                  />
                </div>
                {form.status === STATUS.READING && (
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Current Page
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1.5px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="e.g. 145"
                      value={form.currentPage}
                      onChange={(e) => set("currentPage", e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Reading progress preview */}
              {form.status === STATUS.READING &&
                form.totalPages > 0 &&
                form.currentPage && (
                  <ProgressBar
                    current={parseInt(form.currentPage) || 0}
                    total={parseInt(form.totalPages)}
                    color={STATUS_META[STATUS.READING].color}
                  />
                )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Date Started
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1.5px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    value={form.dateStarted}
                    onChange={(e) => set("dateStarted", e.target.value)}
                  />
                </div>
                {form.status === STATUS.READ && (
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Date Finished
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1.5px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      value={form.dateFinished}
                      onChange={(e) => set("dateFinished", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "notes" && (
            <>
              {/* Notes */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Notes & Thoughts
                </label>
                <textarea
                  rows={5}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Write your thoughts, summary, or review..."
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>

              {/* Quotes */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Favourite Quotes
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1.5px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Add a memorable quote..."
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addQuote()}
                  />
                  <button
                    onClick={addQuote}
                    className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    <FaPlus size={13} />
                  </button>
                </div>
                {(form.quotes || []).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.quotes.map((q, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-xl"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <FaQuoteLeft
                          size={10}
                          className="flex-shrink-0 mt-1 opacity-40"
                          style={{ color: "var(--accent)" }}
                        />
                        <p
                          className="text-xs flex-1 italic leading-relaxed"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {q}
                        </p>
                        <button onClick={() => removeQuote(i)}>
                          <FaTimes
                            size={10}
                            color="#ef4444"
                            className="flex-shrink-0 opacity-60 hover:opacity-100"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-sm font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {isEdit ? "Save Changes" : "Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Stats Card ──────────────────────────────────────────────────────────────
const StatsCard = ({ label, value, icon: Icon, color, sub }) => (
  <div
    className="rounded-2xl p-4 flex items-center gap-3.5"
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: color + "20" }}
    >
      <Icon size={18} color={color} />
    </div>
    <div className="min-w-0">
      <div
        className="text-2xl font-black"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>
      <div
        className="text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

// ─── Reading Goal Card ───────────────────────────────────────────────────────
const ReadingGoalCard = ({ goal, readCount, onGoalChange }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(goal.target.toString());
  const pct =
    goal.target > 0
      ? Math.min(100, Math.round((readCount / goal.target) * 100))
      : 0;

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaTrophy size={16} color="#f59e0b" />
          <span
            className="font-bold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {goal.year} Reading Challenge
          </span>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs px-2 py-1 rounded-lg transition-colors"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--text-muted)",
          }}
        >
          {editing ? "Cancel" : "Edit Goal"}
        </button>
      </div>

      {editing ? (
        <div className="flex gap-2 items-center mb-3">
          <input
            type="number"
            min="1"
            max="365"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-24 px-3 py-1.5 rounded-xl text-sm outline-none"
            style={{
              background: "var(--bg-elevated)",
              border: "1.5px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            books this year
          </span>
          <button
            onClick={() => {
              onGoalChange(parseInt(val) || 1);
              setEditing(false);
            }}
            className="px-3 py-1.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Save
          </button>
        </div>
      ) : (
        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
          {readCount} of {goal.target} books read this year
        </p>
      )}

      <div
        className="w-full h-3 rounded-full overflow-hidden mb-1"
        style={{ background: "var(--bg-elevated)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background:
              pct >= 100
                ? "linear-gradient(90deg,#10b981,#06b6d4)"
                : "linear-gradient(90deg,#f59e0b,#f97316)",
          }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span
          className="text-xs font-bold"
          style={{ color: pct >= 100 ? "#10b981" : "#f59e0b" }}
        >
          {pct}% {pct >= 100 ? "🎉 Goal Reached!" : ""}
        </span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {Math.max(0, goal.target - readCount)} remaining
        </span>
      </div>
    </div>
  );
};

// ─── Main Library Page ────────────────────────────────────────────────────────
export default function LibraryPage() {
  const { isDark } = useTheme();
  const [books, setBooks] = useState(loadBooks);
  const [goal, setGoal] = useState(loadGoal);
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("dateDesc");
  const [view, setView] = useState("grid");
  const [detailBook, setDetailBook] = useState(null);
  const [formBook, setFormBook] = useState(null); // null = closed, {} = new, {...book} = edit
  const [showStats, setShowStats] = useState(true);

  const persist = (updated) => {
    setBooks(updated);
    saveBooks(updated);
  };

  const handleSave = (data) => {
    if (data.id) {
      persist(books.map((b) => (b.id === data.id ? { ...b, ...data } : b)));
    } else {
      persist([
        ...books,
        { ...data, id: genId(), dateAdded: new Date().toISOString() },
      ]);
    }
    setFormBook(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this book from your library?")) {
      persist(books.filter((b) => b.id !== id));
      if (detailBook?.id === id) setDetailBook(null);
    }
  };

  const handleGoalChange = (target) => {
    const g = { ...goal, target };
    setGoal(g);
    saveGoal(g);
  };

  // ─── Derived stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const readThisYear = books.filter(
      (b) =>
        b.status === STATUS.READ &&
        b.dateFinished &&
        new Date(b.dateFinished).getFullYear() === currentYear,
    ).length;
    const totalPages = books
      .filter((b) => b.status === STATUS.READ && b.totalPages)
      .reduce((sum, b) => sum + (b.totalPages || 0), 0);
    const avgRating =
      books.filter((b) => b.rating > 0).length > 0
        ? (
            books
              .filter((b) => b.rating > 0)
              .reduce((s, b) => s + b.rating, 0) /
            books.filter((b) => b.rating > 0).length
          ).toFixed(1)
        : 0;
    return {
      total: books.length,
      reading: books.filter((b) => b.status === STATUS.READING).length,
      want: books.filter((b) => b.status === STATUS.WANT).length,
      read: books.filter((b) => b.status === STATUS.READ).length,
      readThisYear,
      totalPages,
      avgRating,
    };
  }, [books]);

  // ─── Filtered & sorted list ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...books];
    if (activeStatus !== "all")
      list = list.filter((b) => b.status === activeStatus);
    if (activeCategory !== "all")
      list = list.filter((b) => b.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author || "").toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "dateAsc":
        list.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        break;
      case "dateDesc":
        list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "author":
        list.sort((a, b) => (a.author || "").localeCompare(b.author || ""));
        break;
      case "rating":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "progress":
        list.sort((a, b) => {
          const pa = a.totalPages > 0 ? (a.currentPage || 0) / a.totalPages : 0;
          const pb = b.totalPages > 0 ? (b.currentPage || 0) / b.totalPages : 0;
          return pb - pa;
        });
        break;
      default:
        break;
    }
    return list;
  }, [books, activeStatus, activeCategory, search, sort]);

  // Categories with counts are filtered in-render

  const statusTabs = [
    {
      id: "all",
      label: "All Books",
      count: books.length,
      color: "var(--accent)",
    },
    {
      id: STATUS.READING,
      label: "Reading",
      count: stats.reading,
      color: STATUS_META[STATUS.READING].color,
    },
    {
      id: STATUS.WANT,
      label: "Want to Read",
      count: stats.want,
      color: STATUS_META[STATUS.WANT].color,
    },
    {
      id: STATUS.READ,
      label: "Read",
      count: stats.read,
      color: STATUS_META[STATUS.READ].color,
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 px-4 sm:px-6 py-4 flex-shrink-0"
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          {/* Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}
            >
              <FaBook size={18} color="#fff" />
            </div>
            <div>
              <h1
                className="text-xl font-black"
                style={{ color: "var(--text-primary)" }}
              >
                My Library
              </h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {stats.total} books · {stats.reading} reading · {stats.read}{" "}
                finished
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xs">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <FaSearch size={13} style={{ color: "var(--text-muted)" }} />
              <input
                className="flex-1 text-sm bg-transparent outline-none"
                style={{ color: "var(--text-primary)" }}
                placeholder="Search books or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <FaTimes size={12} style={{ color: "var(--text-muted)" }} />
                </button>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Sort */}
            <div className="relative">
              <select
                className="pl-3 pr-8 py-2 rounded-xl text-sm appearance-none cursor-pointer outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <FaChevronDown
                size={10}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
            </div>

            {/* View toggle */}
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)" }}
            >
              {[
                { id: "grid", icon: FaThLarge },
                { id: "list", icon: FaList },
              ].map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className="w-9 h-9 flex items-center justify-center transition-all"
                  style={{
                    background:
                      view === id ? "var(--accent)" : "var(--bg-elevated)",
                    color: view === id ? "#fff" : "var(--text-muted)",
                  }}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>

            {/* Stats toggle */}
            <button
              onClick={() => setShowStats((v) => !v)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: showStats ? "var(--accent)" : "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: showStats ? "#fff" : "var(--text-muted)",
              }}
              title="Toggle Stats"
            >
              <FaChartBar size={14} />
            </button>

            {/* Add Book */}
            <button
              onClick={() => setFormBook({})}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                color: "#fff",
              }}
            >
              <FaPlus size={13} />
              <span className="hidden sm:inline">Add Book</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Section */}
        {showStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatsCard
              label="Total Books"
              value={stats.total}
              icon={FaBook}
              color="#3b82f6"
            />
            <StatsCard
              label="Reading Now"
              value={stats.reading}
              icon={FaBookOpen}
              color="#3b82f6"
            />
            <StatsCard
              label="Want to Read"
              value={stats.want}
              icon={FaRegBookmark}
              color="#f59e0b"
            />
            <StatsCard
              label="Books Read"
              value={stats.read}
              icon={FaCheck}
              color="#10b981"
            />
            <StatsCard
              label="Pages Read"
              value={
                stats.totalPages > 999
                  ? `${(stats.totalPages / 1000).toFixed(1)}k`
                  : stats.totalPages
              }
              icon={FaChartBar}
              color="#8b5cf6"
            />
            <StatsCard
              label="Avg Rating"
              value={stats.avgRating || "—"}
              icon={FaStar}
              color="#f59e0b"
              sub={stats.avgRating ? "out of 5" : "No ratings yet"}
            />
          </div>
        )}

        {/* Reading Goal */}
        {showStats && (
          <ReadingGoalCard
            goal={goal}
            readCount={stats.readThisYear}
            onGoalChange={handleGoalChange}
            isDark={isDark}
          />
        )}

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {statusTabs.map(({ id, label, count, color }) => (
            <button
              key={id}
              onClick={() => setActiveStatus(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
              style={{
                background:
                  activeStatus === id ? color + "20" : "var(--bg-card)",
                border:
                  activeStatus === id
                    ? `1.5px solid ${color}`
                    : "1.5px solid var(--border)",
                color: activeStatus === id ? color : "var(--text-secondary)",
              }}
            >
              {label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background:
                    activeStatus === id ? color + "30" : "var(--bg-elevated)",
                  color: activeStatus === id ? color : "var(--text-muted)",
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background:
                activeCategory === "all" ? "var(--accent)" : "var(--bg-card)",
              border:
                activeCategory === "all"
                  ? "1.5px solid var(--accent)"
                  : "1.5px solid var(--border)",
              color:
                activeCategory === "all" ? "#fff" : "var(--text-secondary)",
            }}
          >
            <FaGlobeAmericas size={10} /> All Categories
          </button>
          {CATEGORIES.map((c) => {
            const count = books.filter((b) => b.category === c.id).length;
            if (count === 0 && activeCategory !== c.id) return null;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background:
                    activeCategory === c.id ? c.color + "20" : "var(--bg-card)",
                  border:
                    activeCategory === c.id
                      ? `1.5px solid ${c.color}`
                      : "1.5px solid var(--border)",
                  color:
                    activeCategory === c.id ? c.color : "var(--text-secondary)",
                }}
              >
                {c.emoji} {c.label}
                {count > 0 && (
                  <span className="text-xs opacity-60">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Book List / Grid */}
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: "var(--bg-elevated)" }}
            >
              📚
            </div>
            <div className="text-center">
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {books.length === 0
                  ? "Your library is empty"
                  : "No books found"}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {books.length === 0
                  ? "Start tracking your reading journey by adding your first book!"
                  : "Try adjusting filters or search terms."}
              </p>
            </div>
            {books.length === 0 && (
              <button
                onClick={() => setFormBook({})}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                  color: "#fff",
                }}
              >
                <FaPlus size={13} /> Add Your First Book
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isDark={isDark}
                onView={setDetailBook}
                onEdit={(b) => setFormBook(b)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((book) => (
              <BookRow
                key={book.id}
                book={book}
                isDark={isDark}
                onView={setDetailBook}
                onEdit={(b) => setFormBook(b)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {detailBook && (
        <BookDetailModal
          book={detailBook}
          isDark={isDark}
          onClose={() => setDetailBook(null)}
          onEdit={(b) => {
            setDetailBook(null);
            setFormBook(b);
          }}
        />
      )}

      {formBook !== null && (
        <BookFormModal
          initial={formBook?.id ? formBook : null}
          onClose={() => setFormBook(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
