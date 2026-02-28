import { useState, useEffect } from "react";
import {
  FaPlus,
  FaTimes,
  FaBookOpen,
  FaLaptopCode,
  FaServer,
  FaProjectDiagram,
  FaDatabase,
  FaNetworkWired,
  FaBrain,
  FaCode,
  FaChevronRight,
  FaLayerGroup,
  FaPencilAlt,
} from "react-icons/fa";
import { subjectTopicsApi } from "../api/subjectTopicsApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const PRESET_SUBJECTS = [
  { name: "DSA", icon: FaCode, color: "#f59e0b" },
  { name: "Operating System", icon: FaServer, color: "#8b5cf6" },
  { name: "System Design", icon: FaProjectDiagram, color: "#f59e0b" },
  { name: "Database Management", icon: FaDatabase, color: "#10b981" },
  { name: "Computer Networks", icon: FaNetworkWired, color: "#ef4444" },
  { name: "Machine Learning", icon: FaBrain, color: "#ec4899" },
  { name: "Web Development", icon: FaLaptopCode, color: "#06b6d4" },
  { name: "Other", icon: FaBookOpen, color: "#6b7280" },
];

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

const SUBJECT_ICONS = {
  DSA: FaCode,
  "Operating System": FaServer,
  "System Design": FaProjectDiagram,
  "Database Management": FaDatabase,
  "Computer Networks": FaNetworkWired,
  "Machine Learning": FaBrain,
  "Web Development": FaLaptopCode,
};

export default function TopicsPage({ onOpenSubject }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const userId = user?.email;

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSubject, setShowAddSubject] = useState(false);

  // Add subject form state
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customName, setCustomName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    if (userId) fetchSubjects();
  }, [userId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectTopicsApi.getSubjects(userId);
      setSubjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    const name =
      selectedPreset === "custom" ? customName.trim() : selectedPreset;
    if (!name) return;
    try {
      const newSubject = await subjectTopicsApi.createSubject({
        userId,
        name,
        color: selectedColor,
      });
      setSubjects((prev) => [...prev, newSubject]);
      setShowAddSubject(false);
      setSelectedPreset(null);
      setCustomName("");
      setSelectedColor(COLORS[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSubject = async (e, subjectId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this subject and all its sections and topics?"))
      return;
    try {
      await subjectTopicsApi.deleteSubject(subjectId);
      setSubjects((prev) => prev.filter((s) => s._id !== subjectId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleColorChange = async (subjectId, newColor) => {
    try {
      const updated = await subjectTopicsApi.updateSubjectColor(
        subjectId,
        newColor,
      );
      setSubjects((prev) =>
        prev.map((s) => (s._id === subjectId ? updated : s)),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const totalTopics = subjects.reduce(
    (sum, s) =>
      sum + (s.sections || []).reduce((ss, sec) => ss + sec.topics.length, 0),
    0,
  );
  const totalSections = subjects.reduce(
    (sum, s) => sum + (s.sections || []).length,
    0,
  );

  return (
    <div
      className="min-h-full p-6 md:p-8"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              📚 Core Subjects
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Select a subject to manage its sections and topics.
              {subjects.length > 0 && (
                <span
                  className="ml-2 font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {subjects.length} subjects · {totalSections} sections ·{" "}
                  {totalTopics} topics
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowAddSubject(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            <FaPlus size={13} />
            Add Subject
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && subjects.length === 0 && (
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="text-6xl mb-4">📖</div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No subjects yet
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Add a subject like DSA, OS, or DBMS to start tracking sections and
              topics.
            </p>
            <button
              onClick={() => setShowAddSubject(true)}
              className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              }}
            >
              Add Your First Subject
            </button>
          </div>
        )}

        {/* Subject Cards Grid */}
        {!loading && subjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {subjects.map((subject) => {
              const IconComponent = SUBJECT_ICONS[subject.name] || FaBookOpen;
              const sectionsCount = (subject.sections || []).length;
              const topicsCount = (subject.sections || []).reduce(
                (sum, sec) => sum + sec.topics.length,
                0,
              );
              return (
                <div
                  key={subject._id}
                  onClick={() => onOpenSubject(subject._id)}
                  className="rounded-2xl overflow-hidden shadow-sm cursor-pointer flex flex-col group"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* Coloured top banner */}
                  <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{ backgroundColor: subject.color }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                      >
                        <IconComponent size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">
                          {subject.name}
                        </h3>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "rgba(255,255,255,0.8)" }}
                        >
                          {sectionsCount} section
                          {sectionsCount !== 1 ? "s" : ""} · {topicsCount} topic
                          {topicsCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Colour edit */}
                      <label
                        className="relative p-2 rounded-lg cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                        title="Change colour"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaPencilAlt size={12} className="text-white" />
                        <input
                          type="color"
                          value={subject.color}
                          onChange={(e) =>
                            handleColorChange(subject._id, e.target.value)
                          }
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <button
                        onClick={(e) => handleDeleteSubject(e, subject._id)}
                        className="p-2 rounded-lg opacity-70"
                        style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                        title="Delete subject"
                      >
                        <img
                          src="/uploads/Icons/delete.png"
                          alt="Delete"
                          className="w-4 h-4 object-contain brightness-0 invert"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Section pills preview */}
                  <div className="flex-1 px-5 py-4">
                    {sectionsCount === 0 ? (
                      <p
                        className="text-sm italic"
                        style={{ color: "var(--text-faint)" }}
                      >
                        No sections yet — click to add sections like Arrays,
                        Linked List…
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(subject.sections || []).slice(0, 6).map((sec) => (
                          <span
                            key={sec._id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{
                              backgroundColor: `${subject.color}18`,
                              color: subject.color,
                              border: `1px solid ${subject.color}30`,
                            }}
                          >
                            <FaLayerGroup size={9} />
                            {sec.name}
                            <span
                              className="ml-0.5 font-bold"
                              style={{ opacity: 0.7 }}
                            >
                              {sec.topics.length}
                            </span>
                          </span>
                        ))}
                        {sectionsCount > 6 && (
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{
                              backgroundColor: "var(--bg-subtle)",
                              color: "var(--text-muted)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            +{sectionsCount - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: subject.color }}
                    >
                      Open subject
                    </span>
                    <FaChevronRight
                      size={12}
                      style={{ color: subject.color }}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Subject Modal ── */}
      {showAddSubject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Add New Subject
              </h2>
              <button
                onClick={() => {
                  setShowAddSubject(false);
                  setSelectedPreset(null);
                  setCustomName("");
                }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--bg-elevated)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Preset Subjects */}
              <div>
                <label
                  className="block text-sm font-semibold mb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Choose a subject
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_SUBJECTS.map(({ name, icon: Icon, color }) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedPreset(name === "Other" ? "custom" : name);
                        setSelectedColor(color);
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                      style={{
                        backgroundColor:
                          selectedPreset ===
                          (name === "Other" ? "custom" : name)
                            ? color
                            : "var(--bg-subtle)",
                        color:
                          selectedPreset ===
                          (name === "Other" ? "custom" : name)
                            ? "white"
                            : "var(--text-secondary)",
                        border: "1px solid",
                        borderColor:
                          selectedPreset ===
                          (name === "Other" ? "custom" : name)
                            ? color
                            : "var(--border)",
                      }}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom name (shown when "Other" is selected) */}
              {selectedPreset === "custom" && (
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Subject name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Compiler Design, Cloud Computing..."
                    autoFocus
                    className="w-full text-sm rounded-xl px-4 py-2.5 outline-none transition-all"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#3b82f6")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "var(--border)")
                    }
                  />
                </div>
              )}

              {/* Color Picker */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className="w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: c,
                        outline:
                          selectedColor === c ? `3px solid ${c}` : "none",
                        outlineOffset: "2px",
                      }}
                    />
                  ))}
                  {/* Any colour picker */}
                  <label
                    className="relative w-8 h-8 rounded-full cursor-pointer flex items-center justify-center overflow-hidden"
                    style={{
                      border: "2px dashed var(--border)",
                      backgroundColor: "var(--bg-subtle)",
                      outline: !COLORS.includes(selectedColor)
                        ? `3px solid ${selectedColor}`
                        : "none",
                      outlineOffset: "2px",
                    }}
                    title="Pick any colour"
                  >
                    <FaPencilAlt
                      size={10}
                      style={{
                        color: "var(--text-muted)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </label>
                  {/* Show current custom color swatch if not a preset */}
                  {!COLORS.includes(selectedColor) && (
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: selectedColor,
                        outline: `3px solid ${selectedColor}`,
                        outlineOffset: "2px",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Preview */}
              {selectedPreset && (
                <div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{ backgroundColor: selectedColor }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                  >
                    <FaBookOpen size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {selectedPreset === "custom"
                        ? customName || "Subject name"
                        : selectedPreset}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      0 sections · 0 topics
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="flex gap-3 px-6 py-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <button
                onClick={() => {
                  setShowAddSubject(false);
                  setSelectedPreset(null);
                  setCustomName("");
                }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                disabled={
                  !selectedPreset ||
                  (selectedPreset === "custom" && !customName.trim())
                }
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
                style={{
                  background:
                    selectedPreset &&
                    (selectedPreset !== "custom" || customName.trim())
                      ? `linear-gradient(135deg, ${selectedColor}, ${selectedColor}cc)`
                      : "var(--bg-subtle)",
                  color:
                    selectedPreset &&
                    (selectedPreset !== "custom" || customName.trim())
                      ? "white"
                      : "var(--text-faint)",
                }}
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
