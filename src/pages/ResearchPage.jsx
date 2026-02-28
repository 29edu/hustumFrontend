import { useState, useEffect, useRef } from "react";
import { researchApi } from "../api/researchApi";

// ── Category colour palette (cycles by hash) ─────────────────────
const PALETTE = [
  {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  {
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
  },
  {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  {
    bg: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
];

const colorOf = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const blank = () => ({
  title: "",
  content: "",
  category: "",
  source: "",
  tags: "",
  isFavorite: false,
});

// ── Tag chip ──────────────────────────────────────────────────────
const TagChip = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
    #{label}
  </span>
);

// ── Research Card ─────────────────────────────────────────────────
const ResearchCard = ({ item, onOpen, onEdit, onDelete, onToggleFav }) => {
  const col = colorOf(item.category || "General");
  const excerpt =
    item.content.length > 180 ? item.content.slice(0, 180) + "…" : item.content;
  const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : [];

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
      onClick={() => onOpen(item)}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${col.dot}`} />

      <div className="flex flex-col flex-1 p-5">
        {/* Category + favorite */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${col.bg} ${col.text} ${col.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
            {item.category || "General"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFav(item);
            }}
            className={`p-1.5 rounded-full transition-colors ${item.isFavorite ? "text-amber-400" : "text-gray-300 hover:text-amber-400"}`}
            title={
              item.isFavorite ? "Remove from favourites" : "Add to favourites"
            }
          >
            <svg
              className="w-4 h-4"
              fill={item.isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z"
              />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-4">
          {excerpt}
        </p>

        {/* Source */}
        {item.source && (
          <div className="flex items-center gap-1.5 mt-3">
            <svg
              className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="text-xs text-gray-400 truncate">
              {item.source}
            </span>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((t) => (
              <TagChip key={t} label={t} />
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3 border-t border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-gray-400">
          {formatDate(item.createdAt)}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Detail Modal (read view) ──────────────────────────────────────
const DetailModal = ({ item, onClose, onEdit }) => {
  const col = colorOf(item.category || "General");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[88vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className={`h-1.5 w-full ${col.dot}`} />
        <div className="px-7 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-3 ${col.bg} ${col.text} ${col.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                {item.category || "General"}
              </span>
              <h2 className="text-xl font-bold text-gray-900 leading-snug">
                {item.title}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(item.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(item)}
                className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <p className="text-gray-700 text-sm leading-[1.85] whitespace-pre-wrap">
            {item.content}
          </p>
        </div>

        {/* Footer */}
        {(item.source || item.tags?.length > 0) && (
          <div className="px-7 py-4 border-t border-gray-100 space-y-2">
            {item.source && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="text-xs text-gray-500">{item.source}</span>
              </div>
            )}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <TagChip key={t} label={t} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Drawer (create / edit) ────────────────────────────────────────
const Drawer = ({ initial, allCategories, onSave, onClose }) => {
  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          tags: Array.isArray(initial.tags) ? initial.tags.join(", ") : "",
        }
      : blank(),
  );
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState(
    initial?.tags
      ? Array.isArray(initial.tags)
        ? initial.tags.join(", ")
        : initial.tags
      : "",
  );
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      titleRef.current?.focus();
      return;
    }
    if (!form.content.trim()) return;
    setSaving(true);
    try {
      const tags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await onSave({ ...form, tags });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div className="relative w-full max-w-lg h-full flex flex-col bg-white shadow-2xl animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {initial?._id ? "Edit Research Note" : "New Research Note"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Capture what you discovered
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. How the brain consolidates memory during sleep"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <input
              type="text"
              list="category-suggestions"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Brain, Physics, Philosophy…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
            <datalist id="category-suggestions">
              {allCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Your Notes <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={10}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Write everything you found, learned, or want to remember…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Source / Reference
            </label>
            <input
              type="text"
              value={form.source}
              onChange={(e) => set("source", e.target.value)}
              placeholder="Book, article URL, video, paper…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Tags{" "}
              <span className="text-gray-400 font-normal normal-case">
                (comma-separated)
              </span>
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="neuroscience, sleep, memory, learning"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
            {tagInput.trim() && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (
                    <TagChip key={t} label={t} />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.content.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {saving ? "Saving…" : initial?._id ? "Update Note" : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
const ResearchPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await researchApi.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      if (form._id) {
        const updated = await researchApi.update(form._id, form);
        setItems((prev) =>
          prev.map((i) => (i._id === updated._id ? updated : i)),
        );
      } else {
        const created = await researchApi.create(form);
        setItems((prev) => [created, ...prev]);
      }
      setShowDrawer(false);
      setEditItem(null);
    } catch {
      alert("Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this research note?")) return;
    try {
      await researchApi.delete(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      if (viewItem?._id === id) setViewItem(null);
    } catch {
      alert("Failed to delete");
    }
  };

  const handleToggleFav = async (item) => {
    try {
      const updated = await researchApi.update(item._id, {
        isFavorite: !item.isFavorite,
      });
      setItems((prev) =>
        prev.map((i) => (i._id === updated._id ? updated : i)),
      );
    } catch {
      /* silent */
    }
  };

  const openEdit = (item) => {
    setViewItem(null);
    setEditItem(item);
    setShowDrawer(true);
  };

  const openNew = () => {
    setEditItem(null);
    setShowDrawer(true);
  };

  // Derived state
  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category || "General"))),
  ];
  const allCategories = categories.slice(1);

  const filtered = items.filter((i) => {
    const matchCat =
      activeCategory === "All" || (i.category || "General") === activeCategory;
    const matchSearch =
      !search.trim() ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.content.toLowerCase().includes(search.toLowerCase()) ||
      (i.tags || []).some((t) =>
        t.toLowerCase().includes(search.toLowerCase()),
      );
    const matchFav = !showFavOnly || i.isFavorite;
    return matchCat && matchSearch && matchFav;
  });

  const favCount = items.filter((i) => i.isFavorite).length;

  return (
    <div
      className="min-h-[calc(100vh-4rem)]"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">
                🔬
              </span>
              Research Lab
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {items.length} note{items.length !== 1 ? "s" : ""} captured
            </p>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 w-52 transition-all"
              />
            </div>

            {/* Fav toggle */}
            <button
              onClick={() => setShowFavOnly((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${showFavOnly ? "bg-amber-50 border-amber-300 text-amber-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              title="Favourites"
            >
              <svg
                className="w-4 h-4"
                fill={showFavOnly ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z"
                />
              </svg>
              {favCount > 0 && <span>{favCount}</span>}
            </button>

            {/* New note */}
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Note
            </button>
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 1 && (
          <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const col = cat === "All" ? null : colorOf(cat);
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? cat === "All"
                        ? "bg-blue-600 text-white border-blue-600"
                        : `${col.bg} ${col.text} ${col.border}`
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cat !== "All" && col && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${active ? col.dot : "bg-gray-400"}`}
                    />
                  )}
                  {cat}
                  {cat !== "All" && (
                    <span className="text-xs opacity-60 ml-0.5">
                      {
                        items.filter((i) => (i.category || "General") === cat)
                          .length
                      }
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-4xl mb-5 shadow-inner">
              🔬
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Your Research Lab is empty
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Found something interesting? Add a research note and build your
              personal knowledge base.
            </p>
            <button
              onClick={openNew}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Add First Note
            </button>
          </div>
        )}

        {!loading && items.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-sm">
              No notes match your search or filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
                setShowFavOnly(false);
              }}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item) => (
              <ResearchCard
                key={item._id}
                item={item}
                onOpen={setViewItem}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleFav={handleToggleFav}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {viewItem && (
        <DetailModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={(i) => {
            setViewItem(null);
            openEdit(i);
          }}
        />
      )}

      {showDrawer && (
        <Drawer
          initial={editItem}
          allCategories={allCategories}
          onSave={handleSave}
          onClose={() => {
            setShowDrawer(false);
            setEditItem(null);
          }}
        />
      )}
    </div>
  );
};

export default ResearchPage;
