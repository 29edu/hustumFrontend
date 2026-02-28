import { useState, useEffect } from "react";
import { FaBook, FaPlus, FaCalendar, FaClock } from "react-icons/fa";
import { studyApi } from "../api/studyApi";

const TrackerPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [studyEntries, setStudyEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formData, setFormData] = useState({
    topic: "",
    category: "JavaScript",
    notes: "",
    duration: 0,
    studyDate: new Date().toISOString().split("T")[0],
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const studyCategories = [
    "JavaScript",
    "React",
    "Node.js",
    "System Design",
    "Data Structures",
    "Algorithms",
    "Database",
    "DevOps",
    "HTML/CSS",
    "TypeScript",
    "Python",
    "Other",
  ];

  // Fetch study entries
  useEffect(() => {
    fetchStudyEntries();
  }, [selectedDate, selectedCategory]);

  const fetchStudyEntries = async () => {
    try {
      setLoading(true);
      const filters = {
        date: selectedDate,
        category: selectedCategory === "all" ? undefined : selectedCategory,
      };
      const data = await studyApi.getAllStudies(filters);
      setStudyEntries(data);
    } catch (error) {
      console.error("Error fetching study entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await studyApi.updateStudy(editingId, formData);
      } else {
        await studyApi.createStudy(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        topic: "",
        category: "JavaScript",
        notes: "",
        duration: 0,
        studyDate: new Date().toISOString().split("T")[0],
      });
      fetchStudyEntries();
    } catch (error) {
      console.error("Error saving study entry:", error);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      topic: entry.topic,
      category: entry.category,
      notes: entry.notes || "",
      duration: entry.duration || 0,
      studyDate: new Date(entry.studyDate).toISOString().split("T")[0],
    });
    setEditingId(entry._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = async () => {
    try {
      await studyApi.deleteStudy(deleteConfirm.id);
      setDeleteConfirm({ show: false, id: null });
      fetchStudyEntries();
    } catch (error) {
      console.error("Error deleting study entry:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  const handleToggleComplete = async (entry) => {
    try {
      await studyApi.updateStudy(entry._id, { completed: !entry.completed });
      fetchStudyEntries();
    } catch (error) {
      console.error("Error updating study entry:", error);
    }
  };

  const getTotalDuration = () => {
    return studyEntries.reduce((acc, entry) => acc + (entry.duration || 0), 0);
  };

  const formatDuration = (minutes) => {
    if (minutes === 0) return "0 minutes";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
    } else if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else {
      return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      JavaScript: "bg-yellow-100 text-yellow-700 border-yellow-300",
      React: "bg-cyan-100 text-cyan-700 border-cyan-300",
      "Node.js": "bg-green-100 text-green-700 border-green-300",
      "System Design": "bg-purple-100 text-purple-700 border-purple-300",
      "Data Structures": "bg-orange-100 text-orange-700 border-orange-300",
      Algorithms: "bg-red-100 text-red-700 border-red-300",
      Database: "bg-indigo-100 text-indigo-700 border-indigo-300",
      DevOps: "bg-blue-100 text-blue-700 border-blue-300",
      "HTML/CSS": "bg-pink-100 text-pink-700 border-pink-300",
      TypeScript: "bg-sky-100 text-sky-700 border-sky-300",
      Python: "bg-emerald-100 text-emerald-700 border-emerald-300",
      Other: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colors[category] || colors.Other;
  };

  const getCategoryButtonColor = (category, isActive) => {
    const activeColors = {
      JavaScript: "bg-yellow-500 text-white",
      React: "bg-cyan-500 text-white",
      "Node.js": "bg-green-500 text-white",
      "System Design": "bg-purple-500 text-white",
      "Data Structures": "bg-orange-500 text-white",
      Algorithms: "bg-red-500 text-white",
      Database: "bg-indigo-500 text-white",
      DevOps: "bg-blue-500 text-white",
      "HTML/CSS": "bg-pink-500 text-white",
      TypeScript: "bg-sky-500 text-white",
      Python: "bg-emerald-500 text-white",
      Other: "bg-gray-500 text-white",
    };

    const inactiveColors = {
      JavaScript:
        "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100",
      React:
        "bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100",
      "Node.js":
        "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
      "System Design":
        "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100",
      "Data Structures":
        "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100",
      Algorithms:
        "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
      Database:
        "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100",
      DevOps:
        "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100",
      "HTML/CSS":
        "bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100",
      TypeScript:
        "bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100",
      Python:
        "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
      Other:
        "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100",
    };

    return isActive
      ? activeColors[category]
      : inactiveColors[category] || inactiveColors.Other;
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Study Tracker
          </h1>
          <p className="text-gray-600">
            Track what you study and monitor your learning progress
          </p>
        </div>

        {/* Study Tracker Section */}
        <div
          className="rounded-2xl shadow-lg p-6"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Study Sessions
              </h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData({
                    topic: "",
                    category: "JavaScript",
                    notes: "",
                    duration: 0,
                    studyDate: new Date().toISOString().split("T")[0],
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <FaPlus size={14} />
                Add Study Session
              </button>
            </div>
            <div className="flex items-center gap-3">
              <FaCalendar className="text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-6 rounded-lg"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
              }}
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingId ? "Edit Study Session" : "Add New Study Session"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What did you study? *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    placeholder="e.g., React Hooks, Binary Trees, REST APIs..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {studyCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Date
                  </label>
                  <input
                    type="date"
                    value={formData.studyDate}
                    onChange={(e) =>
                      setFormData({ ...formData, studyDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Add any additional notes..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  {editingId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Category Filter for Study Entries */}
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {studyCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${getCategoryButtonColor(
                  cat,
                  selectedCategory === cat,
                )}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Study Entries List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : studyEntries.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <FaClock />
                  Total Study Time: {formatDuration(getTotalDuration())}
                </div>
                <div className="text-blue-700 font-medium">
                  {studyEntries.length} session(s)
                </div>
              </div>
              <div className="space-y-3">
                {studyEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-start justify-between p-4 rounded-lg hover:shadow-md transition-all"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {entry.topic}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}
                            >
                              {entry.category}
                            </span>
                            {entry.duration > 0 && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <FaClock size={10} />
                                {formatDuration(entry.duration)}
                              </span>
                            )}
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <img
                          src="/uploads/Icons/pencil.png"
                          alt="Edit"
                          className="w-4 h-4 object-contain"
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <img
                          src="/uploads/Icons/delete.png"
                          alt="Delete"
                          className="w-4 h-4 object-contain"
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FaBook size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No study sessions found
              </h3>
              <p className="text-gray-500">
                Add your first study session to start tracking!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Delete Study Session?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this study session? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackerPage;
