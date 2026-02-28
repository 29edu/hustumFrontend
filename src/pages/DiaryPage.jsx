import { useState, useEffect } from "react";
import RichTextEditor from "../components/diary/RichTextEditor";
import DiaryEntryCard from "../components/diary/DiaryEntryCard";
import { diaryApi } from "../api/diaryApi";

const DiaryPage = () => {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [currentDiary, setCurrentDiary] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchDiaries();
  }, []);

  const fetchDiaries = async () => {
    try {
      setLoading(true);
      const data = await diaryApi.getAllDiaries();
      setDiaries(data);
    } catch (error) {
      console.error("Error fetching diaries:", error);
      alert("Failed to fetch diary entries");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentDiary(null);
    setTitle("");
    setContent("");
    setShowEditor(true);
  };

  const handleOpenDiary = (diary) => {
    setCurrentDiary(diary);
    setTitle(diary.title);
    setContent(diary.content);
    setShowReader(true);
  };

  const handleEditDiary = (diary) => {
    setCurrentDiary(diary);
    setTitle(diary.title);
    setContent(diary.content);
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      alert("Please write something before saving!");
      return;
    }

    try {
      if (currentDiary) {
        // Update existing diary
        const updated = await diaryApi.updateDiary(currentDiary._id, {
          title: title || "Untitled Entry",
          content,
        });
        setDiaries(diaries.map((d) => (d._id === updated._id ? updated : d)));
      } else {
        // Create new diary
        const newDiary = await diaryApi.createDiary(
          title || "Untitled Entry",
          content,
        );
        setDiaries([newDiary, ...diaries]);
      }
      setShowEditor(false);
      setTitle("");
      setContent("");
      setCurrentDiary(null);
    } catch (error) {
      console.error("Error saving diary:", error);
      alert("Failed to save diary entry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this diary entry?")) {
      return;
    }

    try {
      await diaryApi.deleteDiary(id);
      setDiaries(diaries.filter((d) => d._id !== id));
    } catch (error) {
      console.error("Error deleting diary:", error);
      alert("Failed to delete diary entry");
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setShowReader(false);
    setTitle("");
    setContent("");
    setCurrentDiary(null);
  };

  // Read-only view (like a book page)
  if (showReader) {
    return (
      <div
        className="h-[calc(100vh-4rem)] overflow-hidden"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="h-full flex items-center justify-center p-6">
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl max-h-full overflow-hidden border border-white/20">
            {/* Header */}
            <div className="p-6 border-b border-white/20 flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {title}
                </h1>
                <p className="text-sm text-gray-700">
                  {new Date(currentDiary.createdAt).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditDiary(currentDiary)}
                  className="px-4 py-2 text-blue-600 hover:bg-white/20 rounded-lg transition-colors"
                  title="Edit"
                >
                  <img
                    src="/uploads/Icons/pencil.png"
                    alt="Edit"
                    className="w-5 h-5 object-contain"
                  />
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-800 hover:bg-white/20 rounded-lg transition-colors"
                  title="Close"
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
            </div>

            {/* Content - Book-like reading view */}
            <div
              className="p-8 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 12rem)" }}
            >
              <div
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
                style={{
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: "1.1rem",
                  lineHeight: "1.8",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div
        className="h-[calc(100vh-4rem)] overflow-hidden"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="h-full flex flex-col p-6">
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden border border-white/20">
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry Title (optional)"
                className="w-full text-2xl font-semibold text-gray-800 outline-none placeholder-gray-600 bg-transparent"
              />
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-auto p-6">
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-white/30 rounded-lg text-gray-800 hover:bg-white/20 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
              >
                {currentDiary ? "Update Entry" : "Save Entry"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-4rem)] overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Diary</h1>
            <p className="text-gray-800 mt-1">
              Capture your thoughts and memories
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-md flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Diary
          </button>
        </div>

        {/* Diary List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-800">Loading entries...</p>
              </div>
            </div>
          ) : diaries.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-12 h-12 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  No Diary Entries Yet
                </h2>
                <p className="text-gray-800 mb-6">
                  Start writing your first entry!
                </p>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Create Your First Entry
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {diaries.map((diary) => (
                <DiaryEntryCard
                  key={diary._id}
                  diary={diary}
                  onOpen={handleOpenDiary}
                  onEdit={handleEditDiary}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiaryPage;
