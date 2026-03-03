import { useState, useEffect } from "react";
import {
  FaBook,
  FaPlus,
  FaSearch,
  FaLink,
  FaFilePdf,
  FaVideo,
  FaFileAlt,
  FaStar,
  FaTrash,
  FaEdit,
  FaExternalLinkAlt,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaTag,
  FaCheck,
  FaBars,
  FaCopy,
  FaGlobe,
  FaStickyNote,
  FaSortAmountDown,
  FaLayerGroup,
  FaCode,
  FaDatabase,
  FaBrain,
  FaLaptopCode,
  FaServer,
  FaAtom,
  FaPalette,
  FaChartBar,
  FaMobileAlt,
  FaCloud,
  FaShieldAlt,
} from "react-icons/fa";

// ─── Utility ──────────────────────────────────────────────────────────────────
const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const STORAGE_KEY = "study_material_subjects_v2";

const ICON_EMOJIS = [
  "🌐",
  "💻",
  "⚙️",
  "🗄️",
  "🧠",
  "⚛️",
  "🎨",
  "📊",
  "📱",
  "☁️",
  "🛡️",
  "📦",
  "🔣",
  "📖",
  "🔬",
  "📐",
  "🎯",
  "🚀",
];

const SUBJECT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

const RESOURCE_TYPES = [
  { value: "link", label: "Link", icon: "🔗", color: "#3b82f6" },
  { value: "video", label: "Video", icon: "🎬", color: "#ef4444" },
  { value: "pdf", label: "PDF", icon: "📄", color: "#f59e0b" },
  { value: "doc", label: "Doc", icon: "📝", color: "#10b981" },
  { value: "note", label: "Note", icon: "🗒️", color: "#8b5cf6" },
];

const DEFAULT_SUBJECTS = [
  {
    id: generateId(),
    name: "Web Development",
    icon: "🌐",
    color: "#3b82f6",
    expanded: true,
    topics: [
      {
        id: generateId(),
        name: "JavaScript",
        resources: [
          {
            id: generateId(),
            title: "JavaScript.info",
            url: "https://javascript.info/",
            type: "link",
            tags: ["JS", "Tutorial"],
            notes: "Best modern JS guide",
            favorite: true,
            completed: false,
            addedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: generateId(),
        name: "React",
        resources: [
          {
            id: generateId(),
            title: "React Official Docs",
            url: "https://react.dev/",
            type: "link",
            tags: ["React", "Frontend"],
            notes: "",
            favorite: false,
            completed: false,
            addedAt: new Date().toISOString(),
          },
        ],
      },
    ],
  },
  {
    id: generateId(),
    name: "DSA",
    icon: "🔣",
    color: "#8b5cf6",
    expanded: false,
    topics: [
      {
        id: generateId(),
        name: "Practice",
        resources: [
          {
            id: generateId(),
            title: "LeetCode",
            url: "https://leetcode.com/",
            type: "link",
            tags: ["DSA", "Practice"],
            notes: "Daily practice",
            favorite: true,
            completed: false,
            addedAt: new Date().toISOString(),
          },
        ],
      },
    ],
  },
];

const loadSubjects = () => {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : DEFAULT_SUBJECTS;
  } catch {
    return DEFAULT_SUBJECTS;
  }
};

// ─── Tag chip ─────────────────────────────────────────────────────────────────
const TagChip = ({ label, onRemove }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
    style={{ background: "var(--accent-light)", color: "var(--accent)" }}
  >
    {label}
    {onRemove && (
      <button onClick={onRemove} className="hover:opacity-60">
        <FaTimes size={8} />
      </button>
    )}
  </span>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({
  title,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  children,
  wide = false,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
  >
    <div
      className="w-full rounded-2xl shadow-2xl flex flex-col"
      style={{
        background: "#ffffff",
        border: "1px solid var(--border)",
        maxWidth: wide ? 580 : 440,
        maxHeight: "90vh",
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:opacity-60"
          style={{ color: "var(--text-secondary)" }}
        >
          <FaTimes size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      <div
        className="flex items-center justify-end gap-3 px-6 py-4"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-70 transition-opacity"
          style={{
            background: "var(--bg-base)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-85 transition-opacity"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Resource Card ────────────────────────────────────────────────────────────
const ResourceCard = ({
  resource,
  onOpen,
  onFav,
  onComplete,
  onEdit,
  onDelete,
  onCopy,
  copied,
}) => {
  const t =
    RESOURCE_TYPES.find((r) => r.value === resource.type) || RESOURCE_TYPES[0];
  return (
    <div
      className="group relative rounded-2xl flex flex-col transition-all duration-200 hover:shadow-md"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        opacity: resource.completed ? 0.72 : 1,
      }}
    >
      {/* colour stripe */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* row 1 */}
        <div className="flex items-start justify-between gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: t.color + "18" }}
          >
            {t.icon}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
            <button
              onClick={onFav}
              title="Favourite"
              className="p-1.5 rounded-lg transition-colors hover:bg-yellow-100"
              style={{
                color: resource.favorite ? "#f59e0b" : "var(--text-secondary)",
              }}
            >
              <FaStar size={12} />
            </button>
            <button
              onClick={onComplete}
              title="Toggle done"
              className="p-1.5 rounded-lg transition-colors hover:bg-green-100"
              style={{
                color: resource.completed ? "#10b981" : "var(--text-secondary)",
              }}
            >
              <FaCheck size={12} />
            </button>
            <button
              onClick={onEdit}
              title="Edit"
              className="p-1.5 rounded-lg transition-colors hover:bg-blue-100"
              style={{ color: "var(--text-secondary)" }}
            >
              <FaEdit size={12} />
            </button>
            <button
              onClick={onDelete}
              title="Delete"
              className="p-1.5 rounded-lg transition-colors hover:bg-red-100"
              style={{ color: "#ef4444" }}
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>

        {/* title */}
        <h3
          className="font-semibold text-sm leading-snug line-clamp-2"
          style={{
            color: "var(--text-primary)",
            textDecoration: resource.completed ? "line-through" : "none",
          }}
        >
          {resource.title}
        </h3>

        {/* breadcrumb */}
        <p
          className="text-xs truncate"
          style={{ color: "var(--text-secondary)" }}
        >
          {resource.subjectIcon} {resource.subjectName} &rsaquo;{" "}
          {resource.topicName}
        </p>

        {/* url */}
        {resource.url && (
          <p
            className="text-xs font-mono truncate opacity-40"
            style={{ color: "var(--text-secondary)" }}
          >
            {resource.url}
          </p>
        )}

        {/* notes */}
        {resource.notes && (
          <p
            className="text-xs line-clamp-2 italic"
            style={{ color: "var(--text-secondary)" }}
          >
            {resource.notes}
          </p>
        )}

        {/* tags */}
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 5).map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
            {resource.tags.length > 5 && (
              <span
                className="text-xs opacity-50"
                style={{ color: "var(--text-secondary)" }}
              >
                +{resource.tags.length - 5}
              </span>
            )}
          </div>
        )}

        {/* badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: t.color + "15", color: t.color }}
          >
            {t.label}
          </span>
          {resource.favorite && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#f59e0b18", color: "#f59e0b" }}
            >
              ★ Fav
            </span>
          )}
          {resource.completed && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#10b98118", color: "#10b981" }}
            >
              ✓ Done
            </span>
          )}
        </div>

        {/* action buttons */}
        <div className="flex gap-2 mt-auto">
          {resource.url ? (
            <>
              <button
                onClick={() => onOpen(resource.url)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold hover:opacity-85 transition-opacity"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                <FaExternalLinkAlt size={10} /> Open
              </button>
              <button
                onClick={onCopy}
                title="Copy URL"
                className="px-3 py-2 rounded-xl text-xs font-medium hover:opacity-80 transition-opacity"
                style={{
                  background: copied ? "#10b98118" : "var(--bg-base)",
                  color: copied ? "#10b981" : "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {copied ? <FaCheck size={11} /> : <FaCopy size={11} />}
              </button>
            </>
          ) : (
            <div
              className="text-xs italic"
              style={{ color: "var(--text-secondary)" }}
            >
              No URL
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── List Row ─────────────────────────────────────────────────────────────────
const ResourceRow = ({
  resource,
  onOpen,
  onFav,
  onComplete,
  onEdit,
  onDelete,
  onCopy,
  copied,
}) => {
  const t =
    RESOURCE_TYPES.find((r) => r.value === resource.type) || RESOURCE_TYPES[0];
  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 hover:shadow-md"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        opacity: resource.completed ? 0.72 : 1,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: t.color + "18" }}
      >
        {t.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-medium text-sm"
            style={{
              color: "var(--text-primary)",
              textDecoration: resource.completed ? "line-through" : "none",
            }}
          >
            {resource.title}
          </span>
          {resource.favorite && <FaStar size={10} color="#f59e0b" />}
          {resource.completed && <FaCheck size={10} color="#10b981" />}
          {resource.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {resource.subjectIcon} {resource.subjectName} › {resource.topicName}
          </span>
          {resource.url && (
            <span
              className="text-xs font-mono truncate max-w-[200px] opacity-40"
              style={{ color: "var(--text-secondary)" }}
            >
              {resource.url}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onFav}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          style={{
            color: resource.favorite ? "#f59e0b" : "var(--text-secondary)",
          }}
        >
          <FaStar size={12} />
        </button>
        <button
          onClick={onComplete}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          style={{
            color: resource.completed ? "#10b981" : "var(--text-secondary)",
          }}
        >
          <FaCheck size={12} />
        </button>
        {resource.url && (
          <>
            <button
              onClick={() => onOpen(resource.url)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-85"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <FaExternalLinkAlt size={10} />
            </button>
            <button
              onClick={onCopy}
              className="px-2 py-1.5 rounded-lg text-xs hover:opacity-80"
              style={{
                background: copied ? "#10b98118" : "var(--bg-base)",
                color: copied ? "#10b981" : "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {copied ? <FaCheck size={11} /> : <FaCopy size={11} />}
            </button>
          </>
        )}
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: "var(--text-secondary)" }}
        >
          <FaEdit size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: "#ef4444" }}
        >
          <FaTrash size={12} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const StudyMaterialPage = () => {
  const [subjects, setSubjects] = useState(loadSubjects);
  const [selSubId, setSelSubId] = useState(null);
  const [selTopId, setSelTopId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterFav, setFilterFav] = useState(false);
  const [filterDone, setFilterDone] = useState(false);
  const [sort, setSort] = useState("date");
  const [view, setView] = useState("grid");
  const [sideOpen, setSideOpen] = useState(true);
  const [mobOpen, setMobOpen] = useState(false);

  const [copied, setCopied] = useState(null);

  // modals
  const [modal, setModal] = useState(null); // "addSubject" | "editSubject" | "addTopic" | "addResource" | "editResource"
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingResource, setEditingResource] = useState(null);

  // forms
  const [subForm, setSubForm] = useState({
    name: "",
    icon: "🌐",
    color: "#3b82f6",
  });
  const [topForm, setTopForm] = useState({ name: "" });
  const [resForm, setResForm] = useState({
    title: "",
    url: "",
    type: "link",
    tags: [],
    notes: "",
    tagInput: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  // ── subject ops ──
  const doAddSubject = () => {
    if (!subForm.name.trim()) return;
    const ns = {
      id: generateId(),
      name: subForm.name.trim(),
      icon: subForm.icon,
      color: subForm.color,
      expanded: true,
      topics: [],
    };
    setSubjects((p) => [...p, ns]);
    setSelSubId(ns.id);
    setSelTopId(null);
    closeModal();
  };
  const doEditSubject = () => {
    if (!subForm.name.trim()) return;
    setSubjects((p) =>
      p.map((s) =>
        s.id === editingSubject.id
          ? {
              ...s,
              name: subForm.name.trim(),
              icon: subForm.icon,
              color: subForm.color,
            }
          : s,
      ),
    );
    closeModal();
  };
  const delSubject = (id) => {
    setSubjects((p) => p.filter((s) => s.id !== id));
    if (selSubId === id) {
      setSelSubId(null);
      setSelTopId(null);
    }
  };
  const toggleExpand = (id) =>
    setSubjects((p) =>
      p.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s)),
    );

  // ── topic ops ──
  const doAddTopic = () => {
    if (!topForm.name.trim() || !selSubId) return;
    const nt = { id: generateId(), name: topForm.name.trim(), resources: [] };
    setSubjects((p) =>
      p.map((s) =>
        s.id === selSubId ? { ...s, topics: [...s.topics, nt] } : s,
      ),
    );
    setSelTopId(nt.id);
    closeModal();
  };
  const delTopic = (subId, topId) => {
    setSubjects((p) =>
      p.map((s) =>
        s.id === subId
          ? { ...s, topics: s.topics.filter((t) => t.id !== topId) }
          : s,
      ),
    );
    if (selTopId === topId) setSelTopId(null);
  };

  // ── resource ops ──
  const doAddResource = () => {
    if (!resForm.title.trim() || !selSubId || !selTopId) return;
    const nr = {
      id: generateId(),
      title: resForm.title.trim(),
      url: resForm.url.trim(),
      type: resForm.type,
      tags: resForm.tags,
      notes: resForm.notes.trim(),
      favorite: false,
      completed: false,
      addedAt: new Date().toISOString(),
    };
    setSubjects((p) =>
      p.map((s) =>
        s.id === selSubId
          ? {
              ...s,
              topics: s.topics.map((t) =>
                t.id === selTopId
                  ? { ...t, resources: [...t.resources, nr] }
                  : t,
              ),
            }
          : s,
      ),
    );
    closeModal();
  };
  const doEditResource = () => {
    if (!resForm.title.trim()) return;
    setSubjects((p) =>
      p.map((s) => ({
        ...s,
        topics: s.topics.map((t) => ({
          ...t,
          resources: t.resources.map((r) =>
            r.id === editingResource.id
              ? {
                  ...r,
                  title: resForm.title.trim(),
                  url: resForm.url.trim(),
                  type: resForm.type,
                  tags: resForm.tags,
                  notes: resForm.notes.trim(),
                }
              : r,
          ),
        })),
      })),
    );
    closeModal();
  };
  const delResource = (subId, topId, resId) =>
    setSubjects((p) =>
      p.map((s) =>
        s.id === subId
          ? {
              ...s,
              topics: s.topics.map((t) =>
                t.id === topId
                  ? {
                      ...t,
                      resources: t.resources.filter((r) => r.id !== resId),
                    }
                  : t,
              ),
            }
          : s,
      ),
    );
  const toggleFav = (subId, topId, resId) =>
    setSubjects((p) =>
      p.map((s) =>
        s.id === subId
          ? {
              ...s,
              topics: s.topics.map((t) =>
                t.id === topId
                  ? {
                      ...t,
                      resources: t.resources.map((r) =>
                        r.id === resId ? { ...r, favorite: !r.favorite } : r,
                      ),
                    }
                  : t,
              ),
            }
          : s,
      ),
    );
  const toggleDone = (subId, topId, resId) =>
    setSubjects((p) =>
      p.map((s) =>
        s.id === subId
          ? {
              ...s,
              topics: s.topics.map((t) =>
                t.id === topId
                  ? {
                      ...t,
                      resources: t.resources.map((r) =>
                        r.id === resId ? { ...r, completed: !r.completed } : r,
                      ),
                    }
                  : t,
              ),
            }
          : s,
      ),
    );

  // ── modal helpers ──
  const closeModal = () => {
    setModal(null);
    setEditingSubject(null);
    setEditingResource(null);
    setSubForm({ name: "", icon: "🌐", color: "#3b82f6" });
    setTopForm({ name: "" });
    setResForm({
      title: "",
      url: "",
      type: "link",
      tags: [],
      notes: "",
      tagInput: "",
    });
  };
  const openEditSubject = (s) => {
    setEditingSubject(s);
    setSubForm({ name: s.name, icon: s.icon, color: s.color });
    setModal("editSubject");
  };
  const openEditResource = (r) => {
    setEditingResource(r);
    setResForm({
      title: r.title,
      url: r.url,
      type: r.type,
      tags: [...r.tags],
      notes: r.notes,
      tagInput: "",
    });
    setModal("editResource");
  };
  const addTag = () => {
    const tag = resForm.tagInput.trim();
    if (tag && !resForm.tags.includes(tag))
      setResForm((p) => ({ ...p, tags: [...p.tags, tag], tagInput: "" }));
    else setResForm((p) => ({ ...p, tagInput: "" }));
  };
  const removeTag = (tag) =>
    setResForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  // ── copy ──
  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  // ── derived ──
  const selSub = subjects.find((s) => s.id === selSubId);
  const selTop = selSub?.topics.find((t) => t.id === selTopId);

  const allResources = () => {
    const res = [];
    const subs = selSubId
      ? subjects.filter((s) => s.id === selSubId)
      : subjects;
    for (const s of subs) {
      const tops = selTopId
        ? s.topics.filter((t) => t.id === selTopId)
        : s.topics;
      for (const t of tops)
        for (const r of t.resources)
          res.push({
            ...r,
            subjectId: s.id,
            subjectName: s.name,
            subjectColor: s.color,
            subjectIcon: s.icon,
            topicId: t.id,
            topicName: t.name,
          });
    }
    return res;
  };

  const filtered = (() => {
    let res = allResources();
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.url.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.notes.toLowerCase().includes(q) ||
          r.topicName.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q),
      );
    }
    if (filterType !== "all") res = res.filter((r) => r.type === filterType);
    if (filterFav) res = res.filter((r) => r.favorite);
    if (filterDone) res = res.filter((r) => r.completed);
    if (sort === "alpha") res.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "type") res.sort((a, b) => a.type.localeCompare(b.type));
    else res.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    return res;
  })();

  const totals = subjects.reduce(
    (acc, s) => {
      for (const t of s.topics) {
        acc.total += t.resources.length;
        acc.fav += t.resources.filter((r) => r.favorite).length;
        acc.done += t.resources.filter((r) => r.completed).length;
      }
      return acc;
    },
    { total: 0, fav: 0, done: 0 },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex overflow-hidden"
      style={{
        height: "100%",
        minHeight: 0,
        background: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* mobile overlay */}
      {mobOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobOpen(false)}
        />
      )}

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside
        className={`
          fixed lg:relative z-40 flex flex-col h-full overflow-hidden transition-all duration-300
          ${sideOpen ? "w-72" : "w-16"}
          ${mobOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {/* sidebar header */}
        <div
          className="flex items-center justify-between px-3 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {sideOpen && (
            <span
              className="font-bold text-base"
              style={{ color: "var(--text-primary)" }}
            >
              📚 Library
            </span>
          )}
          <button
            onClick={() => {
              setSideOpen(!sideOpen);
              setMobOpen(false);
            }}
            className="p-2 rounded-lg hover:opacity-60 transition-opacity ml-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            <FaBars size={16} />
          </button>
        </div>

        {sideOpen ? (
          <>
            {/* stats */}
            <div className="grid grid-cols-3 gap-1 p-3">
              {[
                ["Total", totals.total, "var(--accent)"],
                ["Fav", totals.fav, "#f59e0b"],
                ["Done", totals.done, "#10b981"],
              ].map(([label, val, color]) => (
                <div
                  key={label}
                  className="text-center rounded-xl py-2"
                  style={{ background: "var(--bg-base)" }}
                >
                  <div className="text-lg font-bold" style={{ color }}>
                    {val}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* all resources */}
            <button
              onClick={() => {
                setSelSubId(null);
                setSelTopId(null);
                setMobOpen(false);
              }}
              className="mx-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: !selSubId ? "var(--accent-light)" : "transparent",
                color: !selSubId ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              <FaLayerGroup size={13} /> All Resources
            </button>

            {/* subject list */}
            <div className="flex-1 px-3 pb-3 overflow-y-auto space-y-0.5">
              {subjects.map((sub) => (
                <div key={sub.id}>
                  <div
                    className="flex items-center gap-1.5 px-2 py-2 rounded-xl cursor-pointer group/sub transition-all"
                    style={{
                      background:
                        selSubId === sub.id && !selTopId
                          ? "var(--accent-light)"
                          : "transparent",
                    }}
                    onClick={() => {
                      setSelSubId(sub.id);
                      setSelTopId(null);
                      setMobOpen(false);
                    }}
                  >
                    <button
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(sub.id);
                      }}
                    >
                      {sub.expanded ? (
                        <FaChevronDown
                          size={9}
                          style={{ color: "var(--text-secondary)" }}
                        />
                      ) : (
                        <FaChevronRight
                          size={9}
                          style={{ color: "var(--text-secondary)" }}
                        />
                      )}
                    </button>
                    <span className="text-base leading-none">{sub.icon}</span>
                    <span
                      className="flex-1 text-sm font-medium truncate"
                      style={{
                        color:
                          selSubId === sub.id
                            ? "var(--accent)"
                            : "var(--text-primary)",
                      }}
                    >
                      {sub.name}
                    </span>
                    <span
                      className="text-xs rounded-full px-1.5 py-0.5"
                      style={{ background: sub.color + "20", color: sub.color }}
                    >
                      {sub.topics.reduce((a, t) => a + t.resources.length, 0)}
                    </span>
                    <button
                      className="opacity-0 group-hover/sub:opacity-100 p-1 rounded hover:bg-blue-100 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditSubject(sub);
                      }}
                    >
                      <FaEdit size={9} style={{ color: "var(--accent)" }} />
                    </button>
                    <button
                      className="opacity-0 group-hover/sub:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        delSubject(sub.id);
                      }}
                    >
                      <FaTrash size={9} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                  {sub.expanded && (
                    <div className="ml-6 space-y-0.5">
                      {sub.topics.map((top) => (
                        <div
                          key={top.id}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer group/top transition-all"
                          style={{
                            background:
                              selTopId === top.id
                                ? "var(--accent-light)"
                                : "transparent",
                          }}
                          onClick={() => {
                            setSelSubId(sub.id);
                            setSelTopId(top.id);
                            setMobOpen(false);
                          }}
                        >
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            –
                          </span>
                          <span
                            className="flex-1 text-xs truncate"
                            style={{
                              color:
                                selTopId === top.id
                                  ? "var(--accent)"
                                  : "var(--text-secondary)",
                            }}
                          >
                            {top.name}
                          </span>
                          <span
                            className="text-xs opacity-50"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {top.resources.length}
                          </span>
                          <button
                            className="opacity-0 group-hover/top:opacity-100 p-1 rounded hover:bg-red-100 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              delTopic(sub.id, top.id);
                            }}
                          >
                            <FaTrash size={8} style={{ color: "#ef4444" }} />
                          </button>
                        </div>
                      ))}
                      {selSubId === sub.id && (
                        <button
                          className="flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-xl w-full hover:opacity-70 transition-opacity"
                          style={{ color: "var(--accent)" }}
                          onClick={() => setModal("addTopic")}
                        >
                          <FaPlus size={9} /> Add topic
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={() => setModal("addSubject")}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
              >
                <FaPlus size={11} /> New Subject
              </button>
            </div>
          </>
        ) : (
          /* collapsed icon strip */
          <div className="flex flex-col items-center gap-2 py-3 px-1 overflow-y-auto">
            <button
              title="All"
              onClick={() => {
                setSideOpen(true);
                setSelSubId(null);
                setSelTopId(null);
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all hover:scale-110"
              style={{
                background: !selSubId
                  ? "var(--accent-light)"
                  : "var(--bg-base)",
              }}
            >
              📚
            </button>
            {subjects.map((s) => (
              <button
                key={s.id}
                title={s.name}
                onClick={() => {
                  setSideOpen(true);
                  setSelSubId(s.id);
                  setSelTopId(null);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all hover:scale-110"
                style={{
                  background:
                    selSubId === s.id
                      ? "var(--accent-light)"
                      : "var(--bg-base)",
                }}
              >
                {s.icon}
              </button>
            ))}
            <button
              title="New Subject"
              onClick={() => setModal("addSubject")}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              <FaPlus size={13} />
            </button>
          </div>
        )}
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* top bar */}
        <header
          className="flex-shrink-0 flex items-center gap-2 px-4 py-3 flex-wrap gap-y-2"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-card)",
          }}
        >
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setMobOpen(true)}
          >
            <FaBars size={17} />
          </button>
          {/* breadcrumb */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1
              className="text-base font-bold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {selTop
                ? `${selSub?.icon} ${selSub?.name} › ${selTop.name}`
                : selSub
                  ? `${selSub.icon} ${selSub.name}`
                  : "📚 All Study Materials"}
            </h1>
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
              }}
            >
              {filtered.length}
            </span>
          </div>
          {/* search */}
          <div
            className="relative"
            style={{ width: "clamp(180px,220px,100%)" }}
          >
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2"
              size={12}
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl outline-none"
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
            {search && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80"
                onClick={() => setSearch("")}
              >
                <FaTimes size={11} />
              </button>
            )}
          </div>
          {/* filters */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="all">All Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="date">Newest</option>
            <option value="alpha">A–Z</option>
            <option value="type">Type</option>
          </select>
          <button
            onClick={() => setFilterFav(!filterFav)}
            title="Favourites"
            className="p-2 rounded-xl transition-all"
            style={{
              background: filterFav ? "#f59e0b22" : "var(--bg-base)",
              border: `1px solid ${filterFav ? "#f59e0b" : "var(--border)"}`,
              color: filterFav ? "#f59e0b" : "var(--text-secondary)",
            }}
          >
            <FaStar size={13} />
          </button>
          <button
            onClick={() => setFilterDone(!filterDone)}
            title="Completed"
            className="p-2 rounded-xl transition-all"
            style={{
              background: filterDone ? "#10b98122" : "var(--bg-base)",
              border: `1px solid ${filterDone ? "#10b981" : "var(--border)"}`,
              color: filterDone ? "#10b981" : "var(--text-secondary)",
            }}
          >
            <FaCheck size={13} />
          </button>
          <button
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            title="Toggle view"
            className="p-2 rounded-xl"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {view === "grid" ? (
              <FaSortAmountDown size={13} />
            ) : (
              <FaLayerGroup size={13} />
            )}
          </button>
          {selSubId && selTopId && (
            <button
              onClick={() => setModal("addResource")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-85 transition-opacity"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <FaPlus size={11} /> Add Resource
            </button>
          )}
        </header>

        {/* body */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* tip: select topic */}
            {selSubId && !selTopId && (
              <div
                className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                }}
              >
                <FaTag size={14} />
                <span>
                  Select a topic from the sidebar to view or add resources.
                </span>
                <button
                  className="ml-auto font-semibold underline whitespace-nowrap"
                  onClick={() => setModal("addTopic")}
                >
                  <FaPlus size={10} className="inline" /> Add Topic
                </button>
              </div>
            )}

            {/* empty */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">📂</div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {search || filterType !== "all" || filterFav || filterDone
                    ? "No resources match your filters"
                    : "No resources yet"}
                </h3>
                <p
                  className="text-sm mb-5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {selTopId
                    ? 'Click "Add Resource" to save a link, video, PDF, or note.'
                    : selSubId
                      ? "Select or add a topic first."
                      : "Choose a subject and topic from the sidebar."}
                </p>
                {selSubId && selTopId && (
                  <button
                    onClick={() => setModal("addResource")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    <FaPlus size={12} /> Add Resource
                  </button>
                )}
              </div>
            )}

            {/* grid */}
            {view === "grid" && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filtered.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    onOpen={(url) =>
                      window.open(url, "_blank", "noopener,noreferrer")
                    }
                    onFav={() => toggleFav(r.subjectId, r.topicId, r.id)}
                    onComplete={() => toggleDone(r.subjectId, r.topicId, r.id)}
                    onEdit={() => {
                      setSelSubId(r.subjectId);
                      setSelTopId(r.topicId);
                      openEditResource(r);
                    }}
                    onDelete={() => delResource(r.subjectId, r.topicId, r.id)}
                    onCopy={() => copyUrl(r.url, r.id)}
                    copied={copied === r.id}
                  />
                ))}
              </div>
            )}

            {/* list */}
            {view === "list" && filtered.length > 0 && (
              <div className="space-y-2">
                {filtered.map((r) => (
                  <ResourceRow
                    key={r.id}
                    resource={r}
                    onOpen={(url) =>
                      window.open(url, "_blank", "noopener,noreferrer")
                    }
                    onFav={() => toggleFav(r.subjectId, r.topicId, r.id)}
                    onComplete={() => toggleDone(r.subjectId, r.topicId, r.id)}
                    onEdit={() => {
                      setSelSubId(r.subjectId);
                      setSelTopId(r.topicId);
                      openEditResource(r);
                    }}
                    onDelete={() => delResource(r.subjectId, r.topicId, r.id)}
                    onCopy={() => copyUrl(r.url, r.id)}
                    copied={copied === r.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Add / Edit Subject */}
      {(modal === "addSubject" || modal === "editSubject") && (
        <Modal
          title={modal === "editSubject" ? "Edit Subject" : "New Subject"}
          onClose={closeModal}
          onConfirm={modal === "editSubject" ? doEditSubject : doAddSubject}
          confirmLabel={modal === "editSubject" ? "Save" : "Create"}
        >
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Name *
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. System Design"
                value={subForm.name}
                onChange={(e) =>
                  setSubForm((p) => ({ ...p, name: e.target.value }))
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (modal === "editSubject" ? doEditSubject() : doAddSubject())
                }
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {ICON_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setSubForm((p) => ({ ...p, icon: e }))}
                    className="w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background:
                        subForm.icon === e
                          ? "var(--accent-light)"
                          : "var(--bg-base)",
                      border: `2px solid ${subForm.icon === e ? "var(--accent)" : "transparent"}`,
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Colour
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSubForm((p) => ({ ...p, color: c }))}
                    className="w-8 h-8 rounded-full transition-all hover:scale-110"
                    style={{
                      background: c,
                      outline: subForm.color === c ? `3px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "var(--bg-base)" }}
            >
              <span className="text-2xl">{subForm.icon}</span>
              <span
                className="font-semibold text-sm"
                style={{ color: subForm.color }}
              >
                {subForm.name || "Preview"}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Topic */}
      {modal === "addTopic" && (
        <Modal
          title="Add Topic"
          onClose={closeModal}
          onConfirm={doAddTopic}
          confirmLabel="Add"
        >
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Topic Name *
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Hooks, Sorting, REST APIs..."
              value={topForm.name}
              onChange={(e) => setTopForm({ name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && doAddTopic()}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
            {selSub && (
              <p
                className="text-xs mt-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Adding to: {selSub.icon} {selSub.name}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Add / Edit Resource */}
      {(modal === "addResource" || modal === "editResource") && (
        <Modal
          title={modal === "editResource" ? "Edit Resource" : "Add Resource"}
          onClose={closeModal}
          onConfirm={modal === "editResource" ? doEditResource : doAddResource}
          confirmLabel={modal === "editResource" ? "Save" : "Add"}
          wide
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Title *
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. MDN JavaScript"
                  value={resForm.title}
                  onChange={(e) =>
                    setResForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {RESOURCE_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() =>
                        setResForm((p) => ({ ...p, type: t.value }))
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background:
                          resForm.type === t.value
                            ? t.color + "22"
                            : "var(--bg-base)",
                        border: `1.5px solid ${resForm.type === t.value ? t.color : "var(--border)"}`,
                        color:
                          resForm.type === t.value
                            ? t.color
                            : "var(--text-secondary)",
                      }}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={resForm.url}
                onChange={(e) =>
                  setResForm((p) => ({ ...p, url: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm font-mono"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Notes
              </label>
              <textarea
                rows={3}
                placeholder="Brief description or tips..."
                value={resForm.notes}
                onChange={(e) =>
                  setResForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl outline-none text-sm resize-none"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Tags
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {resForm.tags.map((tag) => (
                  <TagChip
                    key={tag}
                    label={tag}
                    onRemove={() => removeTag(tag)}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag & press Enter..."
                  value={resForm.tagInput}
                  onChange={(e) =>
                    setResForm((p) => ({ ...p, tagInput: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 rounded-xl text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudyMaterialPage;
