import { useState, useEffect } from "react";
import {
  FaArrowLeft,
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
  FaLayerGroup,
  FaChevronDown,
  FaChevronRight,
  FaTh,
  FaList,
  FaPencilAlt,
} from "react-icons/fa";
import { subjectTopicsApi } from "../api/subjectTopicsApi";
import { useAuth } from "../context/AuthContext";

const SUBJECT_ICONS = {
  DSA: FaCode,
  "Operating System": FaServer,
  "System Design": FaProjectDiagram,
  "Database Management": FaDatabase,
  "Computer Networks": FaNetworkWired,
  "Machine Learning": FaBrain,
  "Web Development": FaLaptopCode,
};

export default function SubjectDetailPage({ subjectId, onBack }) {
  const { user } = useAuth();
  const userId = user?.email;

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  // New section input
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSectionLoading, setAddingSectionLoading] = useState(false);

  // Per-section state
  const [expandedSections, setExpandedSections] = useState({});
  const [topicInputs, setTopicInputs] = useState({});
  const [addingTopicFor, setAddingTopicFor] = useState(null);

  // View mode
  const [viewMode, setViewMode] = useState("grid"); // "list" | "grid"

  useEffect(() => {
    if (subjectId && userId) fetchSubject();
  }, [subjectId, userId]);

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const all = await subjectTopicsApi.getSubjects(userId);
      const found = all.find((s) => s._id === subjectId);
      if (found) {
        setSubject(found);
        // default all sections expanded
        const expanded = {};
        (found.sections || []).forEach((sec) => (expanded[sec._id] = true));
        setExpandedSections(expanded);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    const name = newSectionName.trim();
    if (!name) return;
    try {
      setAddingSectionLoading(true);
      const updated = await subjectTopicsApi.addSection(subjectId, name);
      setSubject(updated);
      // auto-expand the new section
      const newSec = updated.sections[updated.sections.length - 1];
      setExpandedSections((prev) => ({ ...prev, [newSec._id]: true }));
      setNewSectionName("");
      setShowAddSection(false);
    } catch (e) {
      console.error(e);
    } finally {
      setAddingSectionLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Delete this section and all its topics?")) return;
    try {
      const updated = await subjectTopicsApi.deleteSection(
        subjectId,
        sectionId,
      );
      setSubject(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTopic = async (sectionId) => {
    const name = (topicInputs[sectionId] || "").trim();
    if (!name) return;
    try {
      setAddingTopicFor(sectionId);
      const updated = await subjectTopicsApi.addTopic(subjectId, sectionId, {
        name,
      });
      setSubject(updated);
      setTopicInputs((prev) => ({ ...prev, [sectionId]: "" }));
    } catch (e) {
      console.error(e);
    } finally {
      setAddingTopicFor(null);
    }
  };

  const handleDeleteTopic = async (sectionId, topicId) => {
    try {
      const updated = await subjectTopicsApi.deleteTopic(
        subjectId,
        sectionId,
        topicId,
      );
      setSubject(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleColorChange = async (newColor) => {
    try {
      const updated = await subjectTopicsApi.updateSubjectColor(
        subjectId,
        newColor,
      );
      setSubject(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (loading) {
    return (
      <div
        className="min-h-full flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div
        className="min-h-full flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <p style={{ color: "var(--text-muted)" }}>Subject not found.</p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
          style={{
            backgroundColor: "var(--bg-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <FaArrowLeft size={12} /> Back to Subjects
        </button>
      </div>
    );
  }

  const IconComponent = SUBJECT_ICONS[subject.name] || FaBookOpen;
  const totalTopics = (subject.sections || []).reduce(
    (sum, sec) => sum + sec.topics.length,
    0,
  );

  return (
    <div
      className="min-h-full p-6 md:p-8"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
          style={{
            color: "var(--text-secondary)",
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border)",
          }}
        >
          <FaArrowLeft size={12} />
          All Subjects
        </button>

        {/* Subject Hero Header */}
        <div
          className="rounded-2xl overflow-hidden mb-8 shadow-md"
          style={{ backgroundColor: subject.color }}
        >
          <div className="px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
              >
                <IconComponent size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {subject.name}
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {(subject.sections || []).length} section
                  {(subject.sections || []).length !== 1 ? "s" : ""} ·{" "}
                  {totalTopics} topic
                  {totalTopics !== 1 ? "s" : ""} covered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Colour edit */}
              <label
                className="relative p-2 rounded-xl cursor-pointer flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "white",
                }}
                title="Change colour"
              >
                <FaPencilAlt size={13} />
                <input
                  type="color"
                  value={subject.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </label>
              {/* View toggle */}
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <button
                  onClick={() => setViewMode("list")}
                  className="px-3 py-2 transition-all"
                  style={{
                    backgroundColor:
                      viewMode === "list"
                        ? "rgba(255,255,255,0.3)"
                        : "transparent",
                    color: "white",
                  }}
                  title="List view"
                >
                  <FaList size={13} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className="px-3 py-2 transition-all"
                  style={{
                    backgroundColor:
                      viewMode === "grid"
                        ? "rgba(255,255,255,0.3)"
                        : "transparent",
                    color: "white",
                  }}
                  title="Grid view"
                >
                  <FaTh size={13} />
                </button>
              </div>
              <button
                onClick={() => setShowAddSection(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: "white",
                }}
              >
                <FaPlus size={12} />
                Add Section
              </button>
            </div>
          </div>
        </div>

        {/* Add Section inline form */}
        {showAddSection && (
          <div
            className="rounded-2xl p-5 mb-6 flex items-center gap-3"
            style={{
              backgroundColor: "var(--card-bg)",
              border: `2px solid ${subject.color}`,
            }}
          >
            <FaLayerGroup
              size={16}
              style={{ color: subject.color }}
              className="flex-shrink-0"
            />
            <input
              autoFocus
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSection();
                if (e.key === "Escape") {
                  setShowAddSection(false);
                  setNewSectionName("");
                }
              }}
              placeholder={`New section e.g. Arrays, Linked List, Sorting…`}
              className="flex-1 text-sm rounded-xl px-3 py-2 outline-none"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleAddSection}
              disabled={!newSectionName.trim() || addingSectionLoading}
              className="px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: subject.color }}
            >
              {addingSectionLoading ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => {
                setShowAddSection(false);
                setNewSectionName("");
              }}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <FaTimes size={14} />
            </button>
          </div>
        )}

        {/* Empty sections state */}
        {(subject.sections || []).length === 0 && (
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="text-5xl mb-4">📂</div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No sections yet
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              Create sections to organise your topics — e.g. Arrays, Linked
              List, Sorting for DSA.
            </p>
            <button
              onClick={() => setShowAddSection(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ backgroundColor: subject.color }}
            >
              Add First Section
            </button>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (subject.sections || []).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {(subject.sections || []).map((section) => (
              <div
                key={section._id}
                className="rounded-2xl overflow-hidden shadow-sm flex flex-col"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Card header */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${subject.color}25` }}
                    >
                      <FaLayerGroup
                        size={11}
                        style={{ color: subject.color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-bold text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {section.name}
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {section.topics.length} topic
                        {section.topics.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSection(section._id)}
                    className="p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity shrink-0"
                    title="Delete section"
                  >
                    <img
                      src="/uploads/Icons/delete.png"
                      alt="Delete"
                      className="w-3.5 h-3.5 object-contain"
                    />
                  </button>
                </div>

                {/* Topics as pills */}
                <div className="flex-1 px-4 py-3">
                  {section.topics.length === 0 ? (
                    <p
                      className="text-xs italic"
                      style={{ color: "var(--text-faint)" }}
                    >
                      No topics yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {section.topics.map((topic, idx) => (
                        <div
                          key={topic._id}
                          className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{
                            backgroundColor: `${subject.color}18`,
                            color: subject.color,
                            border: `1px solid ${subject.color}30`,
                          }}
                        >
                          <span
                            className="w-4 h-4 rounded-full text-white flex items-center justify-center font-bold shrink-0"
                            style={{
                              backgroundColor: subject.color,
                              fontSize: 9,
                            }}
                          >
                            {idx + 1}
                          </span>
                          {topic.name}
                          <button
                            onClick={() =>
                              handleDeleteTopic(section._id, topic._id)
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                            title="Remove"
                          >
                            <FaTimes size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add topic input */}
                <div
                  className="px-4 py-3"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={topicInputs[section._id] || ""}
                      onChange={(e) =>
                        setTopicInputs((prev) => ({
                          ...prev,
                          [section._id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddTopic(section._id)
                      }
                      placeholder="Add topic…"
                      className="flex-1 text-xs rounded-lg px-2.5 py-2 outline-none transition-all"
                      style={{
                        backgroundColor: "var(--input-bg)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor = subject.color)
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "var(--border)")
                      }
                    />
                    <button
                      onClick={() => handleAddTopic(section._id)}
                      disabled={
                        !(topicInputs[section._id] || "").trim() ||
                        addingTopicFor === section._id
                      }
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-40 shrink-0"
                      style={{ backgroundColor: subject.color }}
                    >
                      <FaPlus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        <div className={viewMode === "list" ? "space-y-4" : "hidden"}>
          {(subject.sections || []).map((section) => {
            const isExpanded = expandedSections[section._id] !== false;
            return (
              <div
                key={section._id}
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Section header */}
                <div
                  className="px-5 py-4 flex items-center gap-3 cursor-pointer select-none"
                  style={{
                    borderLeft: `4px solid ${subject.color}`,
                    backgroundColor: `${subject.color}10`,
                  }}
                  onClick={() => toggleSection(section._id)}
                >
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${subject.color}25` }}
                    >
                      <FaLayerGroup
                        size={13}
                        style={{ color: subject.color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="font-bold text-base leading-tight truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {section.name}
                      </h3>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {section.topics.length} topic
                        {section.topics.length !== 1 ? "s" : ""} covered
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section._id);
                      }}
                      className="p-1.5 rounded-lg transition-colors opacity-50 hover:opacity-100"
                      style={{ color: "var(--text-muted)" }}
                      title="Delete section"
                    >
                      <img
                        src="/uploads/Icons/delete.png"
                        alt="Delete"
                        className="w-3.5 h-3.5 object-contain"
                        style={{ filter: "var(--icon-filter, none)" }}
                      />
                    </button>
                    {isExpanded ? (
                      <FaChevronDown
                        size={12}
                        style={{ color: "var(--text-muted)" }}
                      />
                    ) : (
                      <FaChevronRight
                        size={12}
                        style={{ color: "var(--text-muted)" }}
                      />
                    )}
                  </div>
                </div>

                {/* Section body */}
                {isExpanded && (
                  <div className="px-5 py-4">
                    {/* Topics list */}
                    {section.topics.length === 0 ? (
                      <p
                        className="text-sm italic mb-4"
                        style={{ color: "var(--text-faint)" }}
                      >
                        No topics yet — add what you've studied below.
                      </p>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {section.topics.map((topic, idx) => (
                          <div
                            key={topic._id}
                            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                            style={{
                              backgroundColor: "var(--bg-subtle)",
                              border: "1px solid var(--border)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--bg-elevated)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--bg-subtle)")
                            }
                          >
                            {/* Number badge */}
                            <span
                              className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
                              style={{
                                backgroundColor: subject.color,
                                minWidth: 24,
                              }}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-medium leading-snug"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {topic.name}
                              </p>
                              {topic.notes && (
                                <p
                                  className="text-xs mt-0.5 truncate"
                                  style={{ color: "var(--text-faint)" }}
                                >
                                  {topic.notes}
                                </p>
                              )}
                            </div>
                            <span
                              className="text-xs flex-shrink-0 hidden sm:block"
                              style={{ color: "var(--text-faint)" }}
                            >
                              {new Date(topic.createdAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                            <button
                              onClick={() =>
                                handleDeleteTopic(section._id, topic._id)
                              }
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg flex-shrink-0"
                              title="Remove topic"
                            >
                              <img
                                src="/uploads/Icons/delete.png"
                                alt="Remove"
                                className="w-3.5 h-3.5 object-contain"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add topic input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={topicInputs[section._id] || ""}
                        onChange={(e) =>
                          setTopicInputs((prev) => ({
                            ...prev,
                            [section._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddTopic(section._id)
                        }
                        placeholder={`Add topic to ${section.name}…`}
                        className="flex-1 text-sm rounded-xl px-3 py-2.5 outline-none transition-all"
                        style={{
                          backgroundColor: "var(--input-bg)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor = subject.color)
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor = "var(--border)")
                        }
                      />
                      <button
                        onClick={() => handleAddTopic(section._id)}
                        disabled={
                          !(topicInputs[section._id] || "").trim() ||
                          addingTopicFor === section._id
                        }
                        className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                        style={{ backgroundColor: subject.color }}
                      >
                        <FaPlus size={11} />
                        {addingTopicFor === section._id ? "Adding…" : "Add"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
