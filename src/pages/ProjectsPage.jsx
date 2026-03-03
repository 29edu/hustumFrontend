import { useState, useEffect, useMemo } from "react";
import {
  FaPlus,
  FaTimes,
  FaTrash,
  FaEdit,
  FaRocket,
  FaCode,
  FaBug,
  FaStar,
  FaLink,
  FaGithub,
  FaGlobe,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaFire,
  FaList,
  FaTh,
  FaExternalLinkAlt,
  FaTag,
  FaCalendarAlt,
  FaChartBar,
  FaLightbulb,
  FaBullseye,
  FaStream,
  FaDatabase,
  FaMobileAlt,
  FaDesktop,
  FaServer,
  FaGamepad,
  FaTools,
  FaClipboardList,
  FaPause,
  FaArchive,
  FaPlay,
  FaRegCircle,
  FaLayerGroup,
  FaBookmark,
  FaInfoCircle,
  FaEllipsisV,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { projectApi } from "../api/projectApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  upcoming: {
    label: "Upcoming",
    color: "#8b5cf6",
    bg: "#8b5cf615",
    icon: FaCalendarAlt,
  },
  planning: {
    label: "Planning",
    color: "#f59e0b",
    bg: "#f59e0b15",
    icon: FaClipboardList,
  },
  active: { label: "Active", color: "#10b981", bg: "#10b98115", icon: FaPlay },
  paused: { label: "Paused", color: "#64748b", bg: "#64748b15", icon: FaPause },
  completed: {
    label: "Completed",
    color: "#3b82f6",
    bg: "#3b82f615",
    icon: FaCheckCircle,
  },
  archived: {
    label: "Archived",
    color: "#94a3b8",
    bg: "#94a3b815",
    icon: FaArchive,
  },
};

const FEATURE_STATUS_CONFIG = {
  planned: { label: "Planned", color: "#8b5cf6", bg: "#8b5cf620" },
  "in-progress": { label: "In Progress", color: "#f59e0b", bg: "#f59e0b20" },
  completed: { label: "Done", color: "#10b981", bg: "#10b98120" },
  paused: { label: "Paused", color: "#64748b", bg: "#64748b20" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "#ef444420" },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "#64748b" },
  medium: { label: "Medium", color: "#f59e0b" },
  high: { label: "High", color: "#ef4444" },
  critical: { label: "Critical", color: "#dc2626" },
};

const CATEGORY_CONFIG = {
  web: { label: "Web", icon: FaGlobe },
  mobile: { label: "Mobile", icon: FaMobileAlt },
  desktop: { label: "Desktop", icon: FaDesktop },
  api: { label: "API", icon: FaServer },
  ml: { label: "ML / AI", icon: FaChartBar },
  data: { label: "Data", icon: FaDatabase },
  game: { label: "Game", icon: FaGamepad },
  tool: { label: "Tool", icon: FaTools },
  "open-source": { label: "Open Source", icon: FaCode },
  personal: { label: "Personal", icon: FaStar },
  freelance: { label: "Freelance", icon: FaBookmark },
  other: { label: "Other", icon: FaLayerGroup },
};

const LOG_TYPE_CONFIG = {
  note: { label: "Note", color: "#3b82f6", icon: FaInfoCircle },
  milestone: { label: "Milestone", color: "#10b981", icon: FaStar },
  blocker: { label: "Blocker", color: "#ef4444", icon: FaBug },
  release: { label: "Release", color: "#8b5cf6", icon: FaRocket },
  bugfix: { label: "Bug Fix", color: "#f59e0b", icon: FaBug },
};

const TECH_CATEGORY_COLORS = {
  frontend: "#3b82f6",
  backend: "#10b981",
  database: "#f59e0b",
  devops: "#8b5cf6",
  tool: "#64748b",
  other: "#ec4899",
};

const EMOJIS = [
  "🚀",
  "💻",
  "🎯",
  "🔥",
  "⚡",
  "🛠️",
  "🌐",
  "📱",
  "🎮",
  "🤖",
  "🔬",
  "📊",
  "🎨",
  "🔐",
  "💡",
  "🌟",
  "🏗️",
  "🔧",
  "📝",
  "🎵",
];

const daysUntil = (date) => {
  if (!date) return null;
  const diff = Math.ceil((new Date(date) - new Date()) / 86400000);
  return diff;
};

const fmtDate = (d) => {
  if (!d) return "No deadline";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const progressColor = (p) => {
  if (p >= 80) return "#10b981";
  if (p >= 50) return "#f59e0b";
  return "#3b82f6";
};

// ─── Circular Progress ────────────────────────────────────────────────────────
const CircleProgress = ({ value, size = 64, stroke = 6, color }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = ((100 - value) / 100) * circ;
  const col = color || progressColor(value);
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={fill}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: size * 0.22, fontWeight: 700, fill: col }}
      >
        {value}%
      </text>
    </svg>
  );
};

// ─── Deadline Badge ───────────────────────────────────────────────────────────
const DeadlineBadge = ({ date }) => {
  const days = daysUntil(date);
  if (days === null) return null;
  let bg = "#10b98120",
    color = "#10b981";
  if (days < 0) {
    bg = "#ef444420";
    color = "#ef4444";
  } else if (days <= 7) {
    bg = "#ef444420";
    color = "#ef4444";
  } else if (days <= 30) {
    bg = "#f59e0b20";
    color = "#f59e0b";
  }
  const label =
    days < 0
      ? `${Math.abs(days)}d overdue`
      : days === 0
        ? "Due today"
        : `${days}d left`;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: bg, color }}
    >
      <FaClock size={9} />
      {label}
    </span>
  );
};

// ─── Main ProjectsPage ────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailTab, setDetailTab] = useState("features");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = async () => {
    if (!user?.email) return;
    try {
      const [p, s] = await Promise.all([
        projectApi.getProjects(user.email),
        projectApi.getStats(user.email),
      ]);
      setProjects(p);
      setStats(s);
      if (selectedProject) {
        const refreshed = p.find((x) => x._id === selectedProject._id);
        if (refreshed) setSelectedProject(refreshed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.email]); // eslint-disable-line

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...projects];
    if (activeTab === "active")
      list = list.filter((p) => p.status === "active");
    else if (activeTab === "upcoming")
      list = list.filter((p) => ["upcoming", "planning"].includes(p.status));
    else if (activeTab === "completed")
      list = list.filter((p) => p.status === "completed");
    else if (activeTab === "paused")
      list = list.filter((p) => p.status === "paused");
    if (filterCategory)
      list = list.filter((p) => p.category === filterCategory);
    if (filterPriority)
      list = list.filter((p) => p.priority === filterPriority);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }
    return list.sort(
      (a, b) =>
        (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) ||
        new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  }, [projects, activeTab, filterCategory, filterPriority, searchQuery]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSaveProject = async (data) => {
    setSaving(true);
    try {
      let updated;
      if (editingProject) {
        updated = await projectApi.updateProject(editingProject._id, data);
      } else {
        updated = await projectApi.createProject({
          ...data,
          userId: user.email,
        });
      }
      await load();
      setShowProjectModal(false);
      setEditingProject(null);
      if (selectedProject && editingProject?._id === selectedProject._id) {
        const fresh = projects.find((p) => p._id === updated._id) || updated;
        setSelectedProject(fresh);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDeleteProject = async (id) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await projectApi.deleteProject(id);
    setSelectedProject(null);
    await load();
  };

  const handleSaveFeature = async (data) => {
    setSaving(true);
    try {
      if (editingFeature) {
        await projectApi.updateFeature(
          selectedProject._id,
          editingFeature._id,
          data,
        );
      } else {
        await projectApi.addFeature(selectedProject._id, data);
      }
      await load();
      setShowFeatureModal(false);
      setEditingFeature(null);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleDeleteFeature = async (featureId) => {
    await projectApi.deleteFeature(selectedProject._id, featureId);
    await load();
  };

  const handleFeatureStatusCycle = async (feature) => {
    const order = ["planned", "in-progress", "completed", "paused"];
    const next = order[(order.indexOf(feature.status) + 1) % order.length];
    await projectApi.updateFeature(selectedProject._id, feature._id, {
      status: next,
    });
    await load();
  };

  const handleSaveGoal = async (data) => {
    setSaving(true);
    try {
      await projectApi.addFutureGoal(selectedProject._id, data);
      await load();
      setShowGoalModal(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleSaveLog = async (data) => {
    setSaving(true);
    try {
      await projectApi.addLog(selectedProject._id, data);
      await load();
      setShowLogModal(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleSaveTech = async (data) => {
    setSaving(true);
    try {
      await projectApi.addTech(selectedProject._id, data);
      await load();
      setShowTechModal(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const togglePin = async (proj) => {
    await projectApi.updateProject(proj._id, { isPinned: !proj.isPinned });
    await load();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ color: "var(--text-muted)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading projects…</span>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-full p-4 sm:p-6"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            <span className="bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Projects
            </span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Track your builds — features, deadlines & the road ahead
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowProjectModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 4px 15px rgba(99,102,241,0.35)",
          }}
        >
          <FaPlus size={12} /> New Project
        </button>
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            {
              label: "Total",
              value: stats.total,
              color: "#6366f1",
              icon: FaLayerGroup,
            },
            {
              label: "Active",
              value: stats.active,
              color: "#10b981",
              icon: FaPlay,
            },
            {
              label: "Upcoming",
              value: stats.upcoming + stats.planning,
              color: "#8b5cf6",
              icon: FaCalendarAlt,
            },
            {
              label: "Completed",
              value: stats.completed,
              color: "#3b82f6",
              icon: FaCheckCircle,
            },
            {
              label: "Features",
              value: `${stats.completedFeatures}/${stats.totalFeatures}`,
              color: "#f59e0b",
              icon: FaCode,
            },
            {
              label: "Avg Progress",
              value: `${stats.overallProgress}%`,
              color: progressColor(stats.overallProgress),
              icon: FaChartBar,
            },
            // eslint-disable-next-line no-unused-vars
          ].map(({ label, value, color, icon: StatIcon }) => (
            <div
              key={label}
              className="rounded-2xl p-3 flex flex-col gap-2"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </span>
                <StatIcon size={13} style={{ color }} />
              </div>
              <span className="text-xl font-bold" style={{ color }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs + Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl flex-wrap"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "upcoming", label: "Upcoming" },
            { id: "completed", label: "Done" },
            { id: "paused", label: "Paused" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === t.id ? "#6366f1" : "transparent",
                color: activeTab === t.id ? "#fff" : "var(--text-secondary)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-32">
            <FaSearch
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="">All Priorities</option>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {[
              ["grid", FaTh],
              ["list", FaList],
              // eslint-disable-next-line no-unused-vars
            ].map(([m, ModeIcon]) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="p-1.5 rounded-lg transition-all"
                style={{
                  backgroundColor: viewMode === m ? "#6366f1" : "transparent",
                  color: viewMode === m ? "#fff" : "var(--text-muted)",
                }}
              >
                <ModeIcon size={13} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Layout: Cards + Detail panel ── */}
      <div className="flex gap-5">
        {/* Cards cloud */}
        <div
          className={`${selectedProject ? "hidden lg:block lg:w-[45%] xl:w-[40%]" : "w-full"} shrink-0`}
        >
          {filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 gap-4"
              style={{
                border: "2px dashed var(--border)",
                borderRadius: 16,
                color: "var(--text-muted)",
              }}
            >
              <span className="text-5xl">🗂️</span>
              <p className="text-sm font-medium">No projects found</p>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setShowProjectModal(true);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                }}
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {filtered.map((proj) => (
                <ProjectCard
                  key={proj._id}
                  project={proj}
                  isDark={isDark}
                  isSelected={selectedProject?._id === proj._id}
                  onSelect={() => {
                    setSelectedProject(proj);
                    setDetailTab("features");
                  }}
                  onEdit={() => {
                    setEditingProject(proj);
                    setShowProjectModal(true);
                  }}
                  onDelete={() => handleDeleteProject(proj._id)}
                  onPin={() => togglePin(proj)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedProject && (
          <div className="flex-1 min-w-0">
            <ProjectDetail
              project={selectedProject}
              isDark={isDark}
              detailTab={detailTab}
              setDetailTab={setDetailTab}
              onClose={() => setSelectedProject(null)}
              onEdit={() => {
                setEditingProject(selectedProject);
                setShowProjectModal(true);
              }}
              onAddFeature={() => {
                setEditingFeature(null);
                setShowFeatureModal(true);
              }}
              onEditFeature={(f) => {
                setEditingFeature(f);
                setShowFeatureModal(true);
              }}
              onDeleteFeature={handleDeleteFeature}
              onFeatureStatusCycle={handleFeatureStatusCycle}
              onAddGoal={() => setShowGoalModal(true)}
              onDeleteGoal={async (gid) => {
                await projectApi.deleteFutureGoal(selectedProject._id, gid);
                await load();
              }}
              onAddLog={() => setShowLogModal(true)}
              onDeleteLog={async (lid) => {
                await projectApi.deleteLog(selectedProject._id, lid);
                await load();
              }}
              onAddTech={() => setShowTechModal(true)}
              onDeleteTech={async (tid) => {
                await projectApi.deleteTech(selectedProject._id, tid);
                await load();
              }}
            />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
          saving={saving}
          isDark={isDark}
        />
      )}
      {showFeatureModal && (
        <FeatureModal
          feature={editingFeature}
          onSave={handleSaveFeature}
          onClose={() => {
            setShowFeatureModal(false);
            setEditingFeature(null);
          }}
          saving={saving}
          isDark={isDark}
        />
      )}
      {showGoalModal && (
        <FutureGoalModal
          onSave={handleSaveGoal}
          onClose={() => setShowGoalModal(false)}
          saving={saving}
          isDark={isDark}
        />
      )}
      {showLogModal && (
        <LogModal
          onSave={handleSaveLog}
          onClose={() => setShowLogModal(false)}
          saving={saving}
          isDark={isDark}
        />
      )}
      {showTechModal && (
        <TechModal
          onSave={handleSaveTech}
          onClose={() => setShowTechModal(false)}
          saving={saving}
          isDark={isDark}
        />
      )}
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  isDark,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onPin,
  viewMode,
}) {
  const st = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;
  const StIcon = st.icon;
  const cat = CATEGORY_CONFIG[project.category] || CATEGORY_CONFIG.other;
  const CatIcon = cat.icon;
  const completedFeatures =
    project.features?.filter((f) => f.status === "completed").length || 0;
  const totalFeatures = project.features?.length || 0;
  const progress =
    project.autoProgress && totalFeatures > 0
      ? Math.round((completedFeatures / totalFeatures) * 100)
      : project.progress || 0;

  if (viewMode === "list") {
    return (
      <div
        onClick={onSelect}
        className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all"
        style={{
          backgroundColor: isSelected
            ? isDark
              ? "#312e8120"
              : "#eef2ff"
            : "var(--bg-card)",
          border: `1px solid ${isSelected ? "#6366f1" : "var(--border)"}`,
          borderLeft: `4px solid ${project.color || "#6366f1"}`,
        }}
      >
        <span className="text-2xl">{project.emoji || "🚀"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">
              {project.title}
            </span>
            {project.isPinned && (
              <FaBookmark size={10} className="text-amber-500" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: st.bg, color: st.color }}
            >
              <StIcon size={9} className="inline mr-1" />
              {st.label}
            </span>
            <DeadlineBadge date={project.targetDate} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalFeatures > 0 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {completedFeatures}/{totalFeatures} features
            </span>
          )}
          <CircleProgress value={progress} size={40} stroke={4} />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 rounded-lg transition-all opacity-60 hover:opacity-100"
          style={{ color: "var(--text-muted)" }}
        >
          <FaEdit size={13} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col"
      style={{
        backgroundColor: "var(--bg-card)",
        border: `1px solid ${isSelected ? "#6366f1" : "var(--border)"}`,
        boxShadow: isSelected
          ? "0 0 0 2px #6366f140"
          : isDark
            ? "0 2px 8px rgba(0,0,0,0.3)"
            : "0 2px 8px rgba(0,0,0,0.06)",
        transform: isSelected ? "scale(1.01)" : undefined,
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Row 1: emoji + title + pin */}
        <div className="flex items-start gap-2">
          <span className="text-2xl">{project.emoji || "🚀"}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-bold text-sm leading-tight">
                {project.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin();
                  }}
                  className="p-1 rounded transition-all opacity-50 hover:opacity-100"
                  title={project.isPinned ? "Unpin" : "Pin"}
                >
                  <FaBookmark
                    size={10}
                    style={{
                      color: project.isPinned ? "#f59e0b" : "var(--text-muted)",
                    }}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1 rounded transition-all opacity-50 hover:opacity-100"
                >
                  <FaEdit size={11} style={{ color: "var(--text-muted)" }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1 rounded transition-all opacity-50 hover:opacity-100"
                >
                  <FaTrash size={11} className="text-red-400" />
                </button>
              </div>
            </div>
            {project.description && (
              <p
                className="text-xs mt-0.5 line-clamp-2"
                style={{ color: "var(--text-muted)" }}
              >
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Status + Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: st.bg, color: st.color }}
          >
            <StIcon size={9} />
            {st.label}
          </span>
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-muted)",
            }}
          >
            <CatIcon size={9} />
            {cat.label}
          </span>
          <span
            className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${PRIORITY_CONFIG[project.priority]?.color}18`,
              color: PRIORITY_CONFIG[project.priority]?.color,
            }}
          >
            {PRIORITY_CONFIG[project.priority]?.label}
          </span>
        </div>

        {/* Progress bar */}
        {totalFeatures > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {completedFeatures}/{totalFeatures} features
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: progressColor(progress) }}
              >
                {progress}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--bg-elevated)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${progressColor(progress)}, ${progressColor(progress)}bb)`,
                }}
              />
            </div>
          </div>
        )}

        {/* Deadline */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <DeadlineBadge date={project.targetDate} />
          {/* Tech tags */}
          <div className="flex gap-1 flex-wrap">
            {project.techStack?.slice(0, 3).map((t) => (
              <span
                key={t._id}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${TECH_CATEGORY_COLORS[t.category] || "#64748b"}22`,
                  color: TECH_CATEGORY_COLORS[t.category] || "#64748b",
                }}
              >
                {t.name}
              </span>
            ))}
            {(project.techStack?.length || 0) > 3 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  color: "var(--text-muted)",
                  backgroundColor: "var(--bg-elevated)",
                }}
              >
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Links */}
        {(project.githubUrl || project.liveUrl) && (
          <div
            className="flex gap-2 pt-1"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs transition-all hover:underline"
                style={{ color: "var(--text-muted)" }}
              >
                <FaGithub size={11} /> GitHub
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs transition-all hover:underline"
                style={{ color: "#3b82f6" }}
              >
                <FaGlobe size={11} /> Live
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Project Detail Panel ─────────────────────────────────────────────────────
function ProjectDetail({
  project,
  detailTab,
  setDetailTab,
  onClose,
  onEdit,
  onAddFeature,
  onEditFeature,
  onDeleteFeature,
  onFeatureStatusCycle,
  onAddGoal,
  onDeleteGoal,
  onAddLog,
  onDeleteLog,
  onAddTech,
  onDeleteTech,
}) {
  const completedFeatures =
    project.features?.filter((f) => f.status === "completed").length || 0;
  const totalFeatures = project.features?.length || 0;
  const progress =
    project.autoProgress && totalFeatures > 0
      ? Math.round((completedFeatures / totalFeatures) * 100)
      : project.progress || 0;

  const st = STATUS_CONFIG[project.status] || STATUS_CONFIG.planning;

  const TABS = [
    { id: "features", label: "Features", count: totalFeatures },
    { id: "roadmap", label: "Roadmap", count: project.futureGoals?.length },
    { id: "stack", label: "Tech Stack", count: project.techStack?.length },
    { id: "logs", label: "Activity", count: project.updateLogs?.length },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        minHeight: 500,
      }}
    >
      {/* Header */}
      <div
        className="relative"
        style={{
          background: `linear-gradient(135deg, ${project.color || "#6366f1"}22, ${project.color || "#8b5cf6"}11)`,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{
            background: `linear-gradient(90deg, ${project.color || "#6366f1"}, ${project.color || "#8b5cf6"}88)`,
          }}
        />
        <div className="p-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{project.emoji || "🚀"}</span>
              <div>
                <h2 className="text-lg font-bold leading-tight">
                  {project.title}
                </h2>
                {project.description && (
                  <p
                    className="text-sm mt-1 max-w-lg"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: st.bg, color: st.color }}
                  >
                    <st.icon size={9} />
                    {st.label}
                  </span>
                  <DeadlineBadge date={project.targetDate} />
                  {project.startDate && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Started {fmtDate(project.startDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <CircleProgress
                value={progress}
                size={56}
                stroke={5}
                color={project.color}
              />
              <button
                onClick={onEdit}
                className="p-2 rounded-xl transition-all"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                }}
              >
                <FaEdit size={14} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-all"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                }}
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* Links row */}
          {(project.githubUrl ||
            project.liveUrl ||
            project.designUrl ||
            project.docsUrl) && (
            <div className="flex gap-3 mt-3 flex-wrap">
              {[
                {
                  url: project.githubUrl,
                  label: "GitHub",
                  icon: FaGithub,
                  color: "#64748b",
                },
                {
                  url: project.liveUrl,
                  label: "Live",
                  icon: FaGlobe,
                  color: "#3b82f6",
                },
                {
                  url: project.designUrl,
                  label: "Design",
                  icon: FaLayerGroup,
                  color: "#ec4899",
                },
                {
                  url: project.docsUrl,
                  label: "Docs",
                  icon: FaBookmark,
                  color: "#f59e0b",
                },
              ]
                .filter((l) => l.url)
                // eslint-disable-next-line no-unused-vars
                .map(({ url, label, icon: LinkIcon, color }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all font-medium"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    <LinkIcon size={10} />
                    {label} <FaExternalLinkAlt size={8} />
                  </a>
                ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setDetailTab(t.id)}
              className="flex items-center gap-1.5 px-3 pt-2 pb-2.5 text-xs font-medium transition-all whitespace-nowrap border-b-2 rounded-t-lg"
              style={{
                borderBottomColor:
                  detailTab === t.id
                    ? project.color || "#6366f1"
                    : "transparent",
                color:
                  detailTab === t.id
                    ? project.color || "#6366f1"
                    : "var(--text-muted)",
                backgroundColor:
                  detailTab === t.id
                    ? `${project.color || "#6366f1"}10`
                    : "transparent",
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor:
                      detailTab === t.id
                        ? `${project.color || "#6366f1"}25`
                        : "var(--bg-elevated)",
                    color:
                      detailTab === t.id
                        ? project.color || "#6366f1"
                        : "var(--text-muted)",
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Features */}
        {detailTab === "features" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Features</h3>
              <button
                onClick={onAddFeature}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                }}
              >
                <FaPlus size={10} /> Add Feature
              </button>
            </div>

            {/* Feature status groups */}
            {Object.entries(FEATURE_STATUS_CONFIG).map(
              ([statusKey, statusConf]) => {
                const group =
                  project.features?.filter((f) => f.status === statusKey) || [];
                if (group.length === 0) return null;
                return (
                  <div key={statusKey} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: statusConf.bg,
                          color: statusConf.color,
                        }}
                      >
                        {statusConf.label}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {group.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {group.map((feat) => (
                        <FeatureRow
                          key={feat._id}
                          feature={feat}
                          onStatusCycle={() => onFeatureStatusCycle(feat)}
                          onEdit={() => onEditFeature(feat)}
                          onDelete={() => onDeleteFeature(feat._id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              },
            )}
            {(!project.features || project.features.length === 0) && (
              <div
                className="py-10 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                <FaCode size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No features yet</p>
              </div>
            )}
          </div>
        )}

        {/* Roadmap / Future Goals */}
        {detailTab === "roadmap" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm">Future Roadmap</h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Ideas & features you want to add later
                </p>
              </div>
              <button
                onClick={onAddGoal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                }}
              >
                <FaPlus size={10} /> Add Goal
              </button>
            </div>

            {project.futureGoals?.length > 0 ? (
              <div className="flex flex-col gap-2">
                {project.futureGoals.map((goal) => (
                  <div
                    key={goal._id}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <FaLightbulb
                      size={14}
                      className="mt-0.5 shrink-0"
                      style={{ color: "#f59e0b" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-sm">
                          {goal.title}
                        </span>
                        <button
                          onClick={() => onDeleteGoal(goal._id)}
                          className="opacity-40 hover:opacity-100 transition-all shrink-0"
                        >
                          <FaTrash size={11} className="text-red-400" />
                        </button>
                      </div>
                      {goal.description && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {goal.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: "#f59e0b18",
                            color: "#f59e0b",
                          }}
                        >
                          {goal.category}
                        </span>
                        {goal.estimatedQuarter && (
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            🗓 {goal.estimatedQuarter}
                          </span>
                        )}
                        <span
                          className="text-xs"
                          style={{
                            color: PRIORITY_CONFIG[goal.priority]?.color,
                          }}
                        >
                          {PRIORITY_CONFIG[goal.priority]?.label} priority
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="py-10 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                <FaLightbulb size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No future goals added yet</p>
              </div>
            )}
          </div>
        )}

        {/* Tech Stack */}
        {detailTab === "stack" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Tech Stack</h3>
              <button
                onClick={onAddTech}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
                }}
              >
                <FaPlus size={10} /> Add Tech
              </button>
            </div>
            {project.techStack?.length > 0 ? (
              <div>
                {Object.entries({
                  frontend: "Frontend",
                  backend: "Backend",
                  database: "Database",
                  devops: "DevOps",
                  tool: "Tools",
                  other: "Other",
                }).map(([cat, label]) => {
                  const items = project.techStack.filter(
                    (t) => t.category === cat,
                  );
                  if (!items.length) return null;
                  return (
                    <div key={cat} className="mb-4">
                      <p
                        className="text-xs font-bold uppercase tracking-wide mb-2"
                        style={{ color: TECH_CATEGORY_COLORS[cat] }}
                      >
                        {label}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {items.map((t) => (
                          <div
                            key={t._id}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium transition-all group"
                            style={{
                              backgroundColor: `${TECH_CATEGORY_COLORS[cat]}18`,
                              color: TECH_CATEGORY_COLORS[cat],
                            }}
                          >
                            {t.name}
                            <button
                              onClick={() => onDeleteTech(t._id)}
                              className="opacity-0 group-hover:opacity-100 transition-all ml-1"
                            >
                              <FaTimes size={9} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="py-10 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                <FaDatabase size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No tech stack added yet</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Logs */}
        {detailTab === "logs" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Activity Log</h3>
              <button
                onClick={onAddLog}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#10b981,#3b82f6)",
                }}
              >
                <FaPlus size={10} /> Add Entry
              </button>
            </div>
            {project.updateLogs?.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-3.5 top-0 bottom-0 w-0.5"
                  style={{ backgroundColor: "var(--border)" }}
                />
                <div className="flex flex-col gap-3">
                  {project.updateLogs.map((log) => {
                    const conf =
                      LOG_TYPE_CONFIG[log.type] || LOG_TYPE_CONFIG.note;
                    const LogIcon = conf.icon;
                    return (
                      <div
                        key={log._id}
                        className="flex items-start gap-3 relative pl-8 group"
                      >
                        {/* Dot */}
                        <div
                          className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${conf.color}20`,
                            border: `2px solid ${conf.color}40`,
                            zIndex: 1,
                          }}
                        >
                          <LogIcon size={11} style={{ color: conf.color }} />
                        </div>
                        <div
                          className="flex-1 rounded-xl p-3"
                          style={{
                            backgroundColor: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span
                                className="text-xs font-bold px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${conf.color}20`,
                                  color: conf.color,
                                }}
                              >
                                {conf.label}
                              </span>
                              <p className="text-sm mt-1.5">{log.text}</p>
                            </div>
                            <button
                              onClick={() => onDeleteLog(log._id)}
                              className="opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            >
                              <FaTrash size={11} className="text-red-400" />
                            </button>
                          </div>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {new Date(log.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className="py-10 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                <FaStream size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activity logs yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Feature Row ──────────────────────────────────────────────────────────────
function FeatureRow({ feature, onStatusCycle, onEdit, onDelete }) {
  const st =
    FEATURE_STATUS_CONFIG[feature.status] || FEATURE_STATUS_CONFIG.planned;
  const pri = PRIORITY_CONFIG[feature.priority] || PRIORITY_CONFIG.medium;
  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-xl group transition-all"
      style={{
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border)",
      }}
    >
      <button
        onClick={onStatusCycle}
        title="Click to cycle status"
        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ backgroundColor: st.bg, border: `2px solid ${st.color}60` }}
      >
        {feature.status === "completed" ? (
          <FaCheckCircle size={11} style={{ color: st.color }} />
        ) : (
          <FaRegCircle size={9} style={{ color: st.color }} />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${feature.status === "completed" ? "line-through opacity-60" : ""}`}
          >
            {feature.title}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${pri.color}18`, color: pri.color }}
          >
            {pri.label}
          </span>
        </div>
        {feature.description && (
          <p
            className="text-xs mt-0.5 truncate"
            style={{ color: "var(--text-muted)" }}
          >
            {feature.description}
          </p>
        )}
      </div>
      <DeadlineBadge date={feature.deadline} />
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={onEdit}
          className="p-1 rounded"
          style={{ color: "var(--text-muted)" }}
        >
          <FaEdit size={11} />
        </button>
        <button onClick={onDelete} className="p-1 rounded text-red-400">
          <FaTrash size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function ModalWrap({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="flex items-center justify-between p-4 sticky top-0"
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid var(--border)",
            zIndex: 1,
          }}
        >
          <span className="font-bold text-base">{title}</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: "var(--text-muted)" }}
          >
            <FaTimes size={16} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none";
const inputStyle = (isDark) => ({
  backgroundColor: isDark ? "#1e293b" : "#f8fafc",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
});
const labelCls = "block text-xs font-semibold mb-1";
const labelStyle = { color: "var(--text-muted)" };

function ProjectModal({ project, onSave, onClose, saving, isDark }) {
  const [form, setForm] = useState({
    title: project?.title || "",
    description: project?.description || "",
    status: project?.status || "planning",
    priority: project?.priority || "medium",
    category: project?.category || "web",
    color: project?.color || "#6366f1",
    emoji: project?.emoji || "🚀",
    startDate: project?.startDate ? project.startDate.split("T")[0] : "",
    targetDate: project?.targetDate ? project.targetDate.split("T")[0] : "",
    githubUrl: project?.githubUrl || "",
    liveUrl: project?.liveUrl || "",
    designUrl: project?.designUrl || "",
    docsUrl: project?.docsUrl || "",
    autoProgress: project?.autoProgress !== false,
    progress: project?.progress || 0,
    isPinned: project?.isPinned || false,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <ModalWrap
      title={project ? "Edit Project" : "New Project"}
      onClose={onClose}
      isDark={isDark}
    >
      <div className="flex flex-col gap-4">
        {/* Emoji picker */}
        <div>
          <label className={labelCls} style={labelStyle}>
            Emoji
          </label>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => set("emoji", e)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${form.emoji === e ? "ring-2 ring-indigo-500 scale-110" : ""}`}
                style={{
                  backgroundColor:
                    form.emoji === e ? "#6366f118" : "var(--bg-elevated)",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls} style={labelStyle}>
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Project title…"
              className={inputCls}
              style={inputStyle(isDark)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} style={labelStyle}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief project description…"
              rows={3}
              className={inputCls}
              style={inputStyle(isDark)}
            />
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputCls}
              style={inputStyle(isDark)}
            >
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              className={inputCls}
              style={inputStyle(isDark)}
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputCls}
              style={inputStyle(isDark)}
            >
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                style={{ backgroundColor: "transparent" }}
              />
              {[
                "#6366f1",
                "#10b981",
                "#f59e0b",
                "#3b82f6",
                "#ef4444",
                "#ec4899",
                "#8b5cf6",
                "#06b6d4",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => set("color", c)}
                  className={`w-6 h-6 rounded-full transition-all ${form.color === c ? "ring-2 ring-white ring-offset-1 scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className={inputCls}
              style={inputStyle(isDark)}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Target Deadline
            </label>
            <input
              type="date"
              value={form.targetDate}
              onChange={(e) => set("targetDate", e.target.value)}
              className={inputCls}
              style={inputStyle(isDark)}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              GitHub URL
            </label>
            <input
              value={form.githubUrl}
              onChange={(e) => set("githubUrl", e.target.value)}
              placeholder="https://github.com/…"
              className={inputCls}
              style={inputStyle(isDark)}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Live URL
            </label>
            <input
              value={form.liveUrl}
              onChange={(e) => set("liveUrl", e.target.value)}
              placeholder="https://…"
              className={inputCls}
              style={inputStyle(isDark)}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Design URL
            </label>
            <input
              value={form.designUrl}
              onChange={(e) => set("designUrl", e.target.value)}
              placeholder="Figma / design link…"
              className={inputCls}
              style={inputStyle(isDark)}
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Docs URL
            </label>
            <input
              value={form.docsUrl}
              onChange={(e) => set("docsUrl", e.target.value)}
              placeholder="Documentation link…"
              className={inputCls}
              style={inputStyle(isDark)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`w-9 h-5 rounded-full transition-all relative cursor-pointer ${form.autoProgress ? "bg-indigo-500" : "bg-slate-300"}`}
              onClick={() => set("autoProgress", !form.autoProgress)}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.autoProgress ? "left-4" : "left-0.5"}`}
              />
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Auto-calculate progress from features
            </span>
          </label>
        </div>
        {!form.autoProgress && (
          <div>
            <label className={labelCls} style={labelStyle}>
              Manual Progress ({form.progress}%)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => set("progress", Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        )}

        <div
          className="flex gap-3 pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title.trim()}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            {saving ? "Saving…" : project ? "Update" : "Create Project"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

function FeatureModal({ feature, onSave, onClose, saving, isDark }) {
  const [form, setForm] = useState({
    title: feature?.title || "",
    description: feature?.description || "",
    status: feature?.status || "planned",
    priority: feature?.priority || "medium",
    deadline: feature?.deadline ? feature.deadline.split("T")[0] : "",
    notes: feature?.notes || "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <ModalWrap
      title={feature ? "Edit Feature" : "Add Feature"}
      onClose={onClose}
      isDark={isDark}
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls} style={labelStyle}>
            Feature Title *
          </label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. User authentication"
            className={inputCls}
            style={inputStyle(isDark)}
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What does this feature do?"
            rows={2}
            className={inputCls}
            style={inputStyle(isDark)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputCls}
              style={inputStyle(isDark)}
            >
              {Object.entries(FEATURE_STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              className={inputCls}
              style={inputStyle(isDark)}
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>
            Deadline
          </label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => set("deadline", e.target.value)}
            className={inputCls}
            style={inputStyle(isDark)}
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Any extra notes…"
            rows={2}
            className={inputCls}
            style={inputStyle(isDark)}
          />
        </div>
        <div
          className="flex gap-3 pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title.trim()}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            {saving ? "Saving…" : feature ? "Update" : "Add Feature"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

function FutureGoalModal({ onSave, onClose, saving, isDark }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "feature",
    priority: "medium",
    estimatedQuarter: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <ModalWrap title="Add Future Goal" onClose={onClose} isDark={isDark}>
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls} style={labelStyle}>
            Goal Title *
          </label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Add dark mode support"
            className={inputCls}
            style={inputStyle(isDark)}
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Why is this important?"
            rows={2}
            className={inputCls}
            style={inputStyle(isDark)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputCls}
              style={inputStyle(isDark)}
            >
              {[
                "feature",
                "performance",
                "ux",
                "security",
                "integration",
                "other",
              ].map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              className={inputCls}
              style={inputStyle(isDark)}
            >
              {Object.entries(PRIORITY_CONFIG)
                .slice(0, 3)
                .map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>
            Estimated Quarter (e.g. Q3 2026)
          </label>
          <input
            value={form.estimatedQuarter}
            onChange={(e) => set("estimatedQuarter", e.target.value)}
            placeholder="Q3 2026"
            className={inputCls}
            style={inputStyle(isDark)}
          />
        </div>
        <div
          className="flex gap-3 pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title.trim()}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
          >
            {saving ? "Saving…" : "Add Goal"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

function LogModal({ onSave, onClose, saving, isDark }) {
  const [form, setForm] = useState({ text: "", type: "note" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <ModalWrap title="Add Activity Log" onClose={onClose} isDark={isDark}>
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls} style={labelStyle}>
            Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(LOG_TYPE_CONFIG).map(([k, v]) => (
              <button
                key={k}
                onClick={() => set("type", k)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor:
                    form.type === k ? `${v.color}20` : "var(--bg-elevated)",
                  color: form.type === k ? v.color : "var(--text-muted)",
                  border: `1px solid ${form.type === k ? v.color + "50" : "var(--border)"}`,
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>
            Entry *
          </label>
          <textarea
            value={form.text}
            onChange={(e) => set("text", e.target.value)}
            placeholder="What happened? Any updates, blockers, releases…"
            rows={4}
            className={inputCls}
            style={inputStyle(isDark)}
          />
        </div>
        <div
          className="flex gap-3 pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.text.trim()}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#10b981,#3b82f6)" }}
          >
            {saving ? "Saving…" : "Add Log"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

function TechModal({ onSave, onClose, saving, isDark }) {
  const [form, setForm] = useState({ name: "", category: "frontend" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <ModalWrap title="Add Technology" onClose={onClose} isDark={isDark}>
      <div className="flex flex-col gap-3">
        <div>
          <label className={labelCls} style={labelStyle}>
            Technology Name *
          </label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. React, Node.js, MongoDB"
            className={inputCls}
            style={inputStyle(isDark)}
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>
            Category
          </label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(TECH_CATEGORY_COLORS).map(([k, color]) => (
              <button
                key={k}
                onClick={() => set("category", k)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={{
                  backgroundColor:
                    form.category === k ? `${color}20` : "var(--bg-elevated)",
                  color: form.category === k ? color : "var(--text-muted)",
                  border: `1px solid ${form.category === k ? color + "50" : "var(--border)"}`,
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
        <div
          className="flex gap-3 pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name.trim()}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}
          >
            {saving ? "Saving…" : "Add Tech"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}
