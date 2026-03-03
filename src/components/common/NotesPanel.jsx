import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaTimes,
  FaPlus,
  FaSearch,
  FaTrash,
  FaEdit,
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaCode,
  FaQuoteRight,
  FaHighlighter,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaStar,
  FaThumbtack,
  FaArchive,
  FaDownload,
  FaCopy,
  FaTag,
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaChevronDown,
  FaEllipsisV,
  FaMagic,
  FaPalette,
  FaCheckSquare,
  FaTable,
  FaImage,
  FaLink,
  FaUndo,
  FaRedo,
  FaMarkdown,
  FaFileAlt,
  FaKeyboard,
  FaExpand,
  FaCompress,
  FaEye,
  FaColumns,
  FaSortAmountDown,
  FaFilter,
  FaClock,
  FaCalendarAlt,
  FaBookmark,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

/* ─────────────────────── constants ─────────────────────── */
const DEFAULT_SUBJECTS = [
  {
    id: "math",
    name: "Mathematics",
    color: "#3b82f6",
    icon: "∑",
    sections: ["Calculus", "Algebra", "Statistics"],
  },
  {
    id: "physics",
    name: "Physics",
    color: "#8b5cf6",
    icon: "⚛",
    sections: ["Mechanics", "Electromagnetism", "Optics"],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    color: "#10b981",
    icon: "🧪",
    sections: ["Organic", "Inorganic", "Physical"],
  },
  {
    id: "cs",
    name: "Computer Science",
    color: "#f59e0b",
    icon: "💻",
    sections: ["Algorithms", "Data Structures", "OS"],
  },
  {
    id: "history",
    name: "History",
    color: "#ef4444",
    icon: "📜",
    sections: ["Ancient", "Modern", "Contemporary"],
  },
  {
    id: "english",
    name: "English",
    color: "#06b6d4",
    icon: "📖",
    sections: ["Grammar", "Literature", "Writing"],
  },
  {
    id: "personal",
    name: "Personal",
    color: "#ec4899",
    icon: "✨",
    sections: ["Ideas", "Goals", "Journal"],
  },
  {
    id: "general",
    name: "General",
    color: "#6b7280",
    icon: "📝",
    sections: ["Miscellaneous"],
  },
];

const NOTE_TYPES = [
  { id: "rich", label: "Rich Text", icon: FaFileAlt },
  { id: "markdown", label: "Markdown", icon: FaMarkdown },
  { id: "code", label: "Code", icon: FaCode },
  { id: "checklist", label: "Checklist", icon: FaCheckSquare },
];

const NOTE_COLORS = [
  "#ffffff",
  "#fef9c3",
  "#fce7f3",
  "#ede9fe",
  "#dbeafe",
  "#dcfce7",
  "#ffedd5",
  "#f1f5f9",
];

const NOTE_COLORS_DARK = [
  "#1e293b",
  "#422006",
  "#4a044e",
  "#312e81",
  "#1e3a5f",
  "#064e3b",
  "#431407",
  "#0f172a",
];

const TAG_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#6b7280",
];

const TEMPLATES = [
  {
    id: "lecture",
    name: "Lecture Notes",
    icon: "🎓",
    content: `<h2>Lecture: [Topic]</h2><p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><p><strong>Subject:</strong> </p><hr/><h3>Key Concepts</h3><ul><li></li></ul><h3>Important Points</h3><ul><li></li></ul><h3>Questions to Follow Up</h3><ul><li></li></ul><h3>Summary</h3><p></p>`,
  },
  {
    id: "study-plan",
    name: "Study Plan",
    icon: "📅",
    content: `<h2>Study Plan: [Subject]</h2><p><strong>Goal:</strong> </p><h3>Topics to Cover</h3><ul><li></li></ul><h3>Resources</h3><ul><li></li></ul><h3>Schedule</h3><ul><li><strong>Day 1:</strong> </li><li><strong>Day 2:</strong> </li><li><strong>Day 3:</strong> </li></ul>`,
  },
  {
    id: "summary",
    name: "Chapter Summary",
    icon: "📋",
    content: `<h2>Chapter Summary: [Chapter Name]</h2><p><strong>Chapter:</strong> &nbsp;&nbsp;&nbsp;<strong>Pages:</strong> </p><h3>Main Ideas</h3><p></p><h3>Key Terms</h3><ul><li><strong>Term:</strong> Definition</li></ul><h3>Important Formulas / Rules</h3><p></p><h3>My Understanding</h3><p></p>`,
  },
  {
    id: "flashcard-prep",
    name: "Flashcard Prep",
    icon: "🃏",
    content: `<h2>Flashcard Prep: [Topic]</h2><table><tr><th>Question / Term</th><th>Answer / Definition</th></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table>`,
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    icon: "🗣",
    content: `<h2>Meeting Notes</h2><p><strong>Date:</strong> ${new Date().toLocaleDateString()} &nbsp;<strong>Attendees:</strong> </p><h3>Agenda</h3><ul><li></li></ul><h3>Discussion Points</h3><ul><li></li></ul><h3>Action Items</h3><ul><li></li></ul>`,
  },
  {
    id: "problem-set",
    name: "Problem Set",
    icon: "🧮",
    content: `<h2>Problem Set: [Topic]</h2><h3>Problem 1</h3><p><em>Question:</em> </p><p><em>Solution:</em> </p><h3>Problem 2</h3><p><em>Question:</em> </p><p><em>Solution:</em> </p>`,
  },
];

const LANGUAGES = [
  "javascript",
  "python",
  "java",
  "c",
  "cpp",
  "html",
  "css",
  "sql",
  "bash",
  "typescript",
  "json",
  "yaml",
];

/* ─────────────────────── helpers ─────────────────────── */
const generateId = () =>
  `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();
const formatDate = (iso) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString();
};
const stripHtml = (html) =>
  (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const wordCount = (text) => text.split(/\s+/).filter(Boolean).length;

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem("hustum_notes") || "[]");
  } catch {
    return [];
  }
}
function saveNotes(notes) {
  localStorage.setItem("hustum_notes", JSON.stringify(notes));
}
function loadSubjects() {
  try {
    const s = localStorage.getItem("hustum_note_subjects");
    return s ? JSON.parse(s) : DEFAULT_SUBJECTS;
  } catch {
    return DEFAULT_SUBJECTS;
  }
}
function saveSubjects(subjects) {
  localStorage.setItem("hustum_note_subjects", JSON.stringify(subjects));
}

/* ─────────────────────── ChecklistEditor ─────────────── */
function ChecklistEditor({ value, onChange }) {
  const items = (() => {
    try {
      return JSON.parse(value || "[]");
    } catch {
      return [{ id: "1", text: "", checked: false }];
    }
  })();
  const setItems = (next) => onChange(JSON.stringify(next));
  return (
    <div className="flex flex-col gap-2 p-2">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2 group">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={() => {
              const n = [...items];
              n[i] = { ...n[i], checked: !n[i].checked };
              setItems(n);
            }}
            className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
          />
          <input
            value={item.text}
            onChange={(e) => {
              const n = [...items];
              n[i] = { ...n[i], text: e.target.value };
              setItems(n);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const n = [...items];
                n.splice(i + 1, 0, {
                  id: generateId(),
                  text: "",
                  checked: false,
                });
                setItems(n);
              }
              if (e.key === "Backspace" && !item.text && items.length > 1) {
                e.preventDefault();
                const n = items.filter((_, j) => j !== i);
                setItems(n);
              }
            }}
            placeholder="Checklist item..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{
              color: item.checked ? "var(--text-faint)" : "var(--text-primary)",
              textDecoration: item.checked ? "line-through" : "none",
            }}
          />
          <button
            onClick={() => setItems(items.filter((_, j) => j !== i))}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
          >
            <FaTimes size={11} />
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          setItems([...items, { id: generateId(), text: "", checked: false }])
        }
        className="flex items-center gap-2 text-xs mt-1 transition-colors"
        style={{ color: "var(--accent)" }}
      >
        <FaPlus size={10} /> Add item
      </button>
      <div className="mt-2 text-xs" style={{ color: "var(--text-faint)" }}>
        {items.filter((x) => x.checked).length}/{items.length} completed
      </div>
    </div>
  );
}

/* ─────────────────────── RichToolbar ─────────────────── */
const TB_BTN =
  "w-7 h-7 flex items-center justify-center rounded transition-all hover:scale-110";
const TB_S = { color: "var(--text-muted)" };
const TB_SH = { color: "#ca8a04" };
const TB_SEP = (
  <div
    className="w-px h-5 mx-0.5 rounded shrink-0"
    style={{ backgroundColor: "var(--border-strong)" }}
  />
);

function RichToolbar({ editorRef, onChange }) {
  const exec = useCallback(
    (command, val) => {
      editorRef.current?.focus();
      document.execCommand(command, false, val);
      onChange(editorRef.current?.innerHTML || "");
    },
    [editorRef, onChange],
  );

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 shrink-0"
      style={{
        backgroundColor: "var(--card-bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("bold");
        }}
        title="Bold (Ctrl+B)"
        className={TB_BTN}
        style={TB_S}
      >
        <FaBold size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("italic");
        }}
        title="Italic (Ctrl+I)"
        className={TB_BTN}
        style={TB_S}
      >
        <FaItalic size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("underline");
        }}
        title="Underline (Ctrl+U)"
        className={TB_BTN}
        style={TB_S}
      >
        <FaUnderline size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("strikeThrough");
        }}
        title="Strikethrough"
        className={TB_BTN}
        style={TB_S}
      >
        <FaStrikethrough size={11} />
      </button>
      {TB_SEP}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("formatBlock", "<h1>");
        }}
        title="Heading 1"
        className={`${TB_BTN} text-xs font-black`}
        style={TB_S}
      >
        H1
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("formatBlock", "<h2>");
        }}
        title="Heading 2"
        className={`${TB_BTN} text-xs font-bold`}
        style={TB_S}
      >
        H2
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("formatBlock", "<h3>");
        }}
        title="Heading 3"
        className={`${TB_BTN} text-xs font-semibold`}
        style={TB_S}
      >
        H3
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("formatBlock", "<p>");
        }}
        title="Paragraph"
        className={`${TB_BTN} text-xs`}
        style={TB_S}
      >
        ¶
      </button>
      {TB_SEP}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("insertUnorderedList");
        }}
        title="Bullet List"
        className={TB_BTN}
        style={TB_S}
      >
        <FaListUl size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("insertOrderedList");
        }}
        title="Numbered List"
        className={TB_BTN}
        style={TB_S}
      >
        <FaListOl size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("formatBlock", "<blockquote>");
        }}
        title="Blockquote"
        className={TB_BTN}
        style={TB_S}
      >
        <FaQuoteRight size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("formatBlock", "<pre>");
        }}
        title="Code Block"
        className={TB_BTN}
        style={TB_S}
      >
        <FaCode size={11} />
      </button>
      {TB_SEP}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("justifyLeft");
        }}
        title="Align Left"
        className={TB_BTN}
        style={TB_S}
      >
        <FaAlignLeft size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("justifyCenter");
        }}
        title="Align Center"
        className={TB_BTN}
        style={TB_S}
      >
        <FaAlignCenter size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("justifyRight");
        }}
        title="Align Right"
        className={TB_BTN}
        style={TB_S}
      >
        <FaAlignRight size={11} />
      </button>
      {TB_SEP}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("backColor", "#fef08a");
        }}
        title="Highlight"
        className={TB_BTN}
        style={TB_SH}
      >
        <FaHighlighter size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("undo");
        }}
        title="Undo (Ctrl+Z)"
        className={TB_BTN}
        style={TB_S}
      >
        <FaUndo size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("redo");
        }}
        title="Redo (Ctrl+Y)"
        className={TB_BTN}
        style={TB_S}
      >
        <FaRedo size={11} />
      </button>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          exec("removeFormat");
        }}
        title="Clear Formatting"
        className={TB_BTN}
        style={TB_S}
      >
        <FaMagic size={11} />
      </button>
    </div>
  );
}

/* ─────────────────────── CodeEditor ─────────────────── */
function CodeEditor({ value, onChange }) {
  const [lang, setLang] = useState(
    value?.split("\n")[0]?.startsWith("//lang:")
      ? value.split("\n")[0].replace("//lang:", "")
      : "javascript",
  );
  const code = value?.split("\n")[0]?.startsWith("//lang:")
    ? value.split("\n").slice(1).join("\n")
    : value || "";

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          backgroundColor: "var(--bg-subtle)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <FaCode size={12} style={{ color: "var(--accent)" }} />
        <select
          value={lang}
          onChange={(e) => {
            setLang(e.target.value);
            onChange(`//lang:${e.target.value}\n${code}`);
          }}
          className="text-xs px-2 py-1 rounded outline-none"
          style={{
            backgroundColor: "var(--bg-elevated)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
          {code.split("\n").length} lines
        </span>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Line numbers */}
        <div
          className="select-none text-right py-3 px-2 text-xs leading-6 overflow-hidden"
          style={{
            color: "var(--text-faint)",
            backgroundColor: "var(--bg-subtle)",
            minWidth: "3rem",
            fontFamily: "monospace",
          }}
        >
          {code.split("\n").map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(e) => onChange(`//lang:${lang}\n${e.target.value}`)}
          spellCheck={false}
          className="flex-1 resize-none outline-none p-3 text-sm leading-6"
          style={{
            fontFamily: '"Fira Code", "Cascadia Code", monospace',
            backgroundColor: "transparent",
            color: "var(--text-primary)",
            tabSize: 2,
          }}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const s = e.target.selectionStart,
                en = e.target.selectionEnd;
              const newVal = code.substring(0, s) + "  " + code.substring(en);
              onChange(`//lang:${lang}\n${newVal}`);
              setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = s + 2;
              }, 0);
            }
          }}
          placeholder={`// Write your ${lang} code here...`}
        />
      </div>
    </div>
  );
}

/* ─────────────────────── MarkdownPreview ─────────────── */
function MarkdownEditor({ value, onChange }) {
  const [preview, setPreview] = useState(false);
  const renderMd = (text) => {
    if (!text) return "";
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^#{3}\s(.+)$/gm, "<h3>$1</h3>")
      .replace(/^#{2}\s(.+)$/gm, "<h2>$1</h2>")
      .replace(/^#{1}\s(.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<s>$1</s>")
      .replace(
        /`(.+?)`/g,
        '<code style="background:var(--bg-subtle);padding:2px 4px;border-radius:3px;font-family:monospace;font-size:0.85em">$1</code>',
      )
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      .replace(
        /^> (.+)$/gm,
        '<blockquote style="border-left:3px solid var(--accent);padding-left:8px;color:var(--text-muted);margin:4px 0">$1</blockquote>',
      )
      .replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" style="color:var(--accent)" target="_blank">$1</a>',
      )
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br/>");
    return "<p>" + html + "</p>";
  };
  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          backgroundColor: "var(--bg-subtle)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <FaMarkdown size={13} style={{ color: "var(--accent)" }} />
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--text-secondary)" }}
        >
          Markdown
        </span>
        <button
          onClick={() => setPreview((p) => !p)}
          className="ml-auto flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all"
          style={{
            backgroundColor: preview ? "var(--accent)" : "var(--bg-elevated)",
            color: preview ? "#fff" : "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
        >
          {preview ? (
            <>
              <FaEdit size={10} /> Edit
            </>
          ) : (
            <>
              <FaEye size={10} /> Preview
            </>
          )}
        </button>
      </div>
      {preview ? (
        <div
          className="flex-1 overflow-auto p-4 prose max-w-none text-sm"
          style={{ color: "var(--text-primary)" }}
          dangerouslySetInnerHTML={{ __html: renderMd(value) }}
        />
      ) : (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Your Markdown here...&#10;&#10;**Bold**, *italic*, `code`, > quote&#10;&#10;- list item&#10;1. numbered item"
          className="flex-1 resize-none outline-none p-4 text-sm"
          style={{
            fontFamily: '"Fira Code", monospace',
            backgroundColor: "transparent",
            color: "var(--text-primary)",
            lineHeight: 1.7,
          }}
          spellCheck={false}
        />
      )}
    </div>
  );
}

/* ─────────────────────── NoteEditor ─────────────────── */
function NoteEditor({
  note,
  subjects,
  onSave,
  onDelete,
  isDark,
  isFullscreen,
  onToggleFullscreen,
}) {
  const editorRef = useRef(null);
  const [local, setLocal] = useState(note);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const saveTimer = useRef(null);

  // Set editor innerHTML on mount only (component remounted via key={note.id})
  useEffect(() => {
    if (note.type === "rich" && editorRef.current) {
      editorRef.current.innerHTML = note.content || "";
    }
  }, [note.type, note.content]);

  const autosave = useCallback(
    (updated) => {
      setLocal(updated);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => onSave(updated), 600);
    },
    [onSave],
  );

  const handleRichChange = useCallback(
    (html) => {
      setLocal((prev) => {
        const updated = { ...prev, content: html, updatedAt: now() };
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => onSave(updated), 600);
        return updated;
      });
    },
    [onSave],
  );

  const subject = subjects.find((s) => s.id === local.subjectId) || subjects[0];
  const noteColors = isDark ? NOTE_COLORS_DARK : NOTE_COLORS;
  const rawText =
    local.type === "rich" ? stripHtml(local.content) : local.content || "";
  const wc = wordCount(rawText);

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: isDark
          ? local.bgColor || "#1e293b"
          : local.bgColor || "#fff",
      }}
    >
      {/* Editor Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--card-bg)",
        }}
      >
        {/* Subject badge */}
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{
            backgroundColor: `${subject?.color}22`,
            color: subject?.color,
          }}
        >
          {subject?.icon} {subject?.name}
        </span>
        {local.section && (
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            / {local.section}
          </span>
        )}
        <div className="flex-1" />
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              autosave({ ...local, pinned: !local.pinned, updatedAt: now() })
            }
            title="Pin note"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110"
            style={{ color: local.pinned ? "#f59e0b" : "var(--text-faint)" }}
          >
            <FaThumbtack size={12} />
          </button>
          <button
            onClick={() =>
              autosave({ ...local, starred: !local.starred, updatedAt: now() })
            }
            title="Star note"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110"
            style={{ color: local.starred ? "#eab308" : "var(--text-faint)" }}
          >
            <FaStar size={12} />
          </button>
          <button
            onClick={() => setShowColorPicker((x) => !x)}
            title="Note color"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110"
            style={{ color: "var(--text-faint)" }}
          >
            <FaPalette size={12} />
          </button>
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110"
            style={{ color: "var(--text-faint)" }}
          >
            {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
          </button>
          <button
            onClick={() => {
              const text =
                local.type === "rich"
                  ? stripHtml(local.content)
                  : local.content || "";
              navigator.clipboard.writeText(text);
            }}
            title="Copy content"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110"
            style={{ color: "var(--text-faint)" }}
          >
            <FaCopy size={12} />
          </button>
          <button
            onClick={() => {
              const text =
                local.type === "rich"
                  ? stripHtml(local.content)
                  : local.content || "";
              const blob = new Blob([local.title + "\n\n" + text], {
                type: "text/plain",
              });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `${local.title || "note"}.${local.type === "markdown" ? "md" : local.type === "code" ? "txt" : "txt"}`;
              a.click();
            }}
            title="Download"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110"
            style={{ color: "var(--text-faint)" }}
          >
            <FaDownload size={12} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            title="Delete note"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110 text-red-400 hover:text-red-600"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>

      {/* Color picker */}
      {showColorPicker && (
        <div
          className="flex items-center gap-2 px-3 py-2 shrink-0"
          style={{
            backgroundColor: "var(--bg-elevated)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <FaPalette size={11} style={{ color: "var(--text-faint)" }} />
          <span className="text-xs mr-1" style={{ color: "var(--text-faint)" }}>
            Background:
          </span>
          {noteColors.map((c) => (
            <button
              key={c}
              onClick={() => {
                autosave({ ...local, bgColor: c, updatedAt: now() });
                setShowColorPicker(false);
              }}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125"
              style={{
                backgroundColor: c,
                borderColor:
                  (isDark
                    ? local.bgColor || "#1e293b"
                    : local.bgColor || "#fff") === c
                    ? "var(--accent)"
                    : "var(--border)",
              }}
            />
          ))}
        </div>
      )}

      {/* Title + Metadata */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <input
          value={local.title || ""}
          onChange={(e) =>
            autosave({ ...local, title: e.target.value, updatedAt: now() })
          }
          placeholder="Note title..."
          className="w-full text-lg font-bold outline-none bg-transparent"
          style={{ color: "var(--text-primary)" }}
        />
        {/* Section selector */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <select
            value={local.subjectId || ""}
            onChange={(e) =>
              autosave({
                ...local,
                subjectId: e.target.value,
                section: "",
                updatedAt: now(),
              })
            }
            className="text-xs px-2 py-1 rounded-lg outline-none"
            style={{
              backgroundColor: "var(--bg-subtle)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
          <select
            value={local.section || ""}
            onChange={(e) =>
              autosave({ ...local, section: e.target.value, updatedAt: now() })
            }
            className="text-xs px-2 py-1 rounded-lg outline-none"
            style={{
              backgroundColor: "var(--bg-subtle)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <option value="">No section</option>
            {(
              subjects.find((s) => s.id === local.subjectId)?.sections || []
            ).map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
          {/* Tags */}
          <div className="flex items-center flex-wrap gap-1">
            {(local.tags || []).map((tag) => (
              <span
                key={tag.label}
                className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
              >
                {tag.label}
                <button
                  onClick={() =>
                    autosave({
                      ...local,
                      tags: local.tags.filter((t) => t.label !== tag.label),
                      updatedAt: now(),
                    })
                  }
                  className="hover:opacity-70"
                >
                  <FaTimes size={8} />
                </button>
              </span>
            ))}
            <button
              onClick={() => setShowTagInput((x) => !x)}
              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-all"
              style={{
                backgroundColor: "var(--bg-subtle)",
                color: "var(--text-faint)",
                border: "1px dashed var(--border-strong)",
              }}
            >
              <FaTag size={8} /> Tag
            </button>
          </div>
        </div>
        {/* Tag input */}
        {showTagInput && (
          <div className="flex items-center gap-2 mt-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Tag name..."
              className="text-xs px-2 py-1 rounded-lg outline-none w-32"
              style={{
                backgroundColor: "var(--bg-subtle)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagInput.trim()) {
                  const color =
                    TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
                  autosave({
                    ...local,
                    tags: [
                      ...(local.tags || []),
                      { label: tagInput.trim(), color },
                    ],
                    updatedAt: now(),
                  });
                  setTagInput("");
                  setShowTagInput(false);
                }
              }}
              autoFocus
            />
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              press Enter
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 mt-1.5">
          <span
            className="text-xs flex items-center gap-1"
            style={{ color: "var(--text-faint)" }}
          >
            <FaClock size={9} />{" "}
            {formatDate(local.updatedAt || local.createdAt)}
          </span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            {wc} words · {rawText.length} chars
          </span>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>
            {NOTE_TYPES.find((t) => t.id === local.type)?.label || "Rich Text"}
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto min-h-0">
        {local.type === "rich" && (
          <>
            <RichToolbar editorRef={editorRef} onChange={handleRichChange} />
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() =>
                handleRichChange(editorRef.current?.innerHTML || "")
              }
              className="min-h-full p-4 outline-none text-sm leading-relaxed"
              style={{
                color: "var(--text-primary)",
                fontFamily: "inherit",
              }}
            />
          </>
        )}
        {local.type === "markdown" && (
          <MarkdownEditor
            value={local.content || ""}
            onChange={(v) =>
              autosave({ ...local, content: v, updatedAt: now() })
            }
          />
        )}
        {local.type === "code" && (
          <CodeEditor
            value={local.content || ""}
            onChange={(v) =>
              autosave({ ...local, content: v, updatedAt: now() })
            }
          />
        )}
        {local.type === "checklist" && (
          <ChecklistEditor
            value={local.content || "[]"}
            onChange={(v) =>
              autosave({ ...local, content: v, updatedAt: now() })
            }
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── NoteCard ─────────────────────── */
function NoteCard({ note, active, onClick, isDark, subject }) {
  const preview =
    note.type === "checklist"
      ? (() => {
          try {
            const i = JSON.parse(note.content || "[]");
            return `${i.filter((x) => x.checked).length}/${i.length} items`;
          } catch {
            return "";
          }
        })()
      : stripHtml(note.content || "").slice(0, 80);
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-3 rounded-xl transition-all duration-150 relative"
      style={{
        backgroundColor: active
          ? isDark
            ? "rgba(59,130,246,0.15)"
            : "#eff6ff"
          : isDark
            ? "transparent"
            : "transparent",
        border: active ? "1px solid var(--accent)" : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active)
          e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {note.pinned && (
        <FaThumbtack
          size={9}
          className="absolute top-2 right-2"
          style={{ color: "#f59e0b", transform: "rotate(25deg)" }}
        />
      )}
      <div className="flex items-center gap-1.5 mb-1">
        {note.starred && <FaStar size={9} style={{ color: "#eab308" }} />}
        <span
          className="text-xs font-semibold truncate flex-1"
          style={{ color: active ? "var(--accent)" : "var(--text-primary)" }}
        >
          {note.title || "Untitled"}
        </span>
      </div>
      {preview && (
        <p
          className="text-xs line-clamp-2 leading-relaxed"
          style={{ color: "var(--text-faint)" }}
        >
          {preview}
        </p>
      )}
      <div className="flex items-center gap-2 mt-1.5">
        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
          {formatDate(note.updatedAt || note.createdAt)}
        </span>
        {note.section && (
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${subject?.color}18`,
              color: subject?.color,
              fontSize: "0.6rem",
            }}
          >
            {note.section}
          </span>
        )}
        {(note.tags || []).slice(0, 2).map((tag) => (
          <span
            key={tag.label}
            className="text-xs px-1 rounded"
            style={{
              backgroundColor: `${tag.color}22`,
              color: tag.color,
              fontSize: "0.6rem",
            }}
          >
            {tag.label}
          </span>
        ))}
      </div>
    </button>
  );
}

/* ─────────────────────── Main NotesPanel ─────────────── */
const NotesPanel = ({ onClose }) => {
  const { isDark } = useTheme();
  const [subjects, setSubjects] = useState(loadSubjects);
  const [notes, setNotes] = useState(loadNotes);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [filterType, setFilterType] = useState("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectColor, setNewSubjectColor] = useState("#3b82f6");
  const [collapsedSubjects, setCollapsedSubjects] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [view, setView] = useState("split"); // "split" | "list" | "editor"

  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Persist
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  const createNote = useCallback(
    (template = null) => {
      const subjectId = selectedSubject === "all" ? "general" : selectedSubject;
      const note = {
        id: generateId(),
        title: template ? template.name : "",
        content: template ? template.content : "",
        type: "rich",
        subjectId,
        section: selectedSection === "all" ? "" : selectedSection,
        tags: [],
        pinned: false,
        starred: false,
        archived: false,
        bgColor: null,
        createdAt: now(),
        updatedAt: now(),
      };
      setNotes((prev) => [note, ...prev]);
      setActiveNoteId(note.id);
      setShowTemplates(false);
      if (view === "list") setView("editor");
    },
    [selectedSubject, selectedSection, view],
  );

  const createNoteWithType = useCallback(
    (type) => {
      const subjectId = selectedSubject === "all" ? "general" : selectedSubject;
      const note = {
        id: generateId(),
        title: "",
        content:
          type === "checklist"
            ? JSON.stringify([{ id: generateId(), text: "", checked: false }])
            : "",
        type,
        subjectId,
        section: selectedSection === "all" ? "" : selectedSection,
        tags: [],
        pinned: false,
        starred: false,
        archived: false,
        bgColor: null,
        createdAt: now(),
        updatedAt: now(),
      };
      setNotes((prev) => [note, ...prev]);
      setActiveNoteId(note.id);
      if (view === "list") setView("editor");
    },
    [selectedSubject, selectedSection, view],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        createNote();
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [createNote, onClose]);

  const saveNote = useCallback((updated) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  }, []);

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const sub = {
      id: `sub_${Date.now()}`,
      name: newSubjectName.trim(),
      color: newSubjectColor,
      icon: "📌",
      sections: [],
    };
    setSubjects((prev) => [...prev, sub]);
    setNewSubjectName("");
    setShowAddSubject(false);
  };

  // Filter & sort
  const filteredNotes = notes
    .filter((n) => {
      if (n.archived) return false;
      if (filterType !== "all") {
        if (filterType === "starred" && !n.starred) return false;
        if (filterType === "pinned" && !n.pinned) return false;
        if (
          !["all", "starred", "pinned"].includes(filterType) &&
          n.type !== filterType
        )
          return false;
      }
      if (selectedSubject !== "all" && n.subjectId !== selectedSubject)
        return false;
      if (selectedSection !== "all" && n.section !== selectedSection)
        return false;
      if (search) {
        const q = search.toLowerCase();
        const title = (n.title || "").toLowerCase();
        const content = stripHtml(
          n.type === "checklist" ? "" : n.content || "",
        ).toLowerCase();
        const tags = (n.tags || []).map((t) => t.label.toLowerCase()).join(" ");
        if (!title.includes(q) && !content.includes(q) && !tags.includes(q))
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortBy === "title")
        return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "createdAt")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  return (
    <div
      style={
        isFullscreen
          ? { position: "fixed", inset: 0, zIndex: 9999 }
          : {
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }
      }
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative flex rounded-2xl overflow-hidden shadow-2xl animate-in"
        style={{
          width: isFullscreen ? "100vw" : "min(96vw, 1200px)",
          height: isFullscreen ? "100vh" : "min(92vh, 800px)",
          backgroundColor: "var(--card-bg)",
          border: isFullscreen ? "none" : "1px solid var(--border-strong)",
          animation: "notesFadeIn 0.25s ease",
        }}
      >
        <style>{`
          @keyframes notesFadeIn {
            from { opacity: 0; transform: scale(0.96) translateY(12px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .notes-editor-content h1 { font-size: 1.6em; font-weight: 800; margin: 0.5em 0; }
          .notes-editor-content h2 { font-size: 1.3em; font-weight: 700; margin: 0.5em 0; }
          .notes-editor-content h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0; }
          .notes-editor-content ul { list-style: disc; padding-left: 1.5em; }
          .notes-editor-content ol { list-style: decimal; padding-left: 1.5em; }
          .notes-editor-content blockquote { border-left: 3px solid var(--accent); padding-left: 0.75em; color: var(--text-muted); margin: 0.5em 0; }
          .notes-editor-content pre { background: var(--bg-subtle); border-radius: 6px; padding: 0.75em; font-family: monospace; overflow-x: auto; font-size: 0.85em; }
          .notes-editor-content table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
          .notes-editor-content th, .notes-editor-content td { border: 1px solid var(--border); padding: 0.4em 0.75em; }
          .notes-editor-content th { background: var(--bg-subtle); font-weight: 600; }
          .notes-editor-content a { color: var(--accent); text-decoration: underline; }
        `}</style>

        {/* ── Left: Subjects sidebar ────────────────── */}
        <div
          className="shrink-0 flex flex-col overflow-hidden"
          style={{
            width: view === "editor" ? "0" : "200px",
            transition: "width 0.2s ease",
            borderRight: "1px solid var(--border)",
            backgroundColor: "var(--sidebar-bg)",
            overflow: view === "editor" ? "hidden" : "auto",
          }}
        >
          {/* Sidebar Header */}
          <div
            className="px-3 py-3 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--text-faint)" }}
              >
                Subjects
              </span>
              <button
                onClick={() => setShowAddSubject((x) => !x)}
                className="text-xs"
                title="Add subject"
                style={{ color: "var(--accent)" }}
              >
                <FaPlus size={11} />
              </button>
            </div>
            {showAddSubject && (
              <div className="flex flex-col gap-1.5 mb-2">
                <input
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Subject name"
                  className="text-xs px-2 py-1.5 rounded-lg outline-none"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border)",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && addSubject()}
                  autoFocus
                />
                <div className="flex items-center gap-1 flex-wrap">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewSubjectColor(c)}
                      className="w-4 h-4 rounded-full border-2 transition-transform hover:scale-125"
                      style={{
                        backgroundColor: c,
                        borderColor:
                          newSubjectColor === c ? "#fff" : "transparent",
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={addSubject}
                  className="text-xs py-1 rounded-lg font-semibold text-white transition-all"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
          {/* All Notes */}
          <div className="flex-1 overflow-y-auto py-1">
            <button
              onClick={() => {
                setSelectedSubject("all");
                setSelectedSection("all");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all"
              style={{
                backgroundColor:
                  selectedSubject === "all"
                    ? "var(--bg-elevated)"
                    : "transparent",
                color:
                  selectedSubject === "all"
                    ? "var(--accent)"
                    : "var(--text-secondary)",
                fontWeight: selectedSubject === "all" ? 600 : 400,
                borderLeft: `3px solid ${selectedSubject === "all" ? "var(--accent)" : "transparent"}`,
              }}
            >
              <FaBookmark size={10} />
              All Notes
              <span
                className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--text-faint)",
                }}
              >
                {notes.filter((n) => !n.archived).length}
              </span>
            </button>
            {/* Subject list */}
            {subjects.map((sub) => {
              const subNotes = notes.filter(
                (n) => n.subjectId === sub.id && !n.archived,
              );
              const isCollapsed = collapsedSubjects[sub.id];
              const isActive = selectedSubject === sub.id;
              return (
                <div key={sub.id}>
                  <button
                    onClick={() => {
                      setSelectedSubject(sub.id);
                      setSelectedSection("all");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs group transition-all"
                    style={{
                      backgroundColor: isActive
                        ? "var(--bg-elevated)"
                        : "transparent",
                      color: isActive ? sub.color : "var(--text-secondary)",
                      borderLeft: `3px solid ${isActive ? sub.color : "transparent"}`,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <button
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setCollapsedSubjects((c) => ({
                          ...c,
                          [sub.id]: !isCollapsed,
                        }));
                      }}
                      className="text-xs transition-transform"
                      style={{
                        transform: isCollapsed ? "rotate(-90deg)" : "rotate(0)",
                        color: "var(--text-faint)",
                      }}
                    >
                      <FaChevronDown size={8} />
                    </button>
                    <span>{sub.icon}</span>
                    <span className="truncate flex-1 text-left">
                      {sub.name}
                    </span>
                    <span
                      className="ml-auto text-xs px-1 rounded"
                      style={{
                        backgroundColor: `${sub.color}20`,
                        color: sub.color,
                      }}
                    >
                      {subNotes.length}
                    </span>
                  </button>
                  {/* Sections */}
                  {!isCollapsed && isActive && sub.sections.length > 0 && (
                    <div
                      className="ml-5 border-l"
                      style={{ borderColor: `${sub.color}44` }}
                    >
                      <button
                        onClick={() => setSelectedSection("all")}
                        className="w-full text-left text-xs px-3 py-1.5 transition-all"
                        style={{
                          color:
                            selectedSection === "all"
                              ? "var(--accent)"
                              : "var(--text-faint)",
                          fontWeight: selectedSection === "all" ? 600 : 400,
                        }}
                      >
                        All sections
                      </button>
                      {sub.sections.map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setSelectedSection(sec)}
                          className="w-full text-left text-xs px-3 py-1.5 transition-all truncate"
                          style={{
                            color:
                              selectedSection === sec
                                ? sub.color
                                : "var(--text-faint)",
                            fontWeight: selectedSection === sec ? 600 : 400,
                          }}
                        >
                          {sec}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Middle: Notes list ──────────────────────── */}
        <div
          className="flex flex-col shrink-0 overflow-hidden"
          style={{
            width: view === "editor" ? "0" : view === "list" ? "100%" : "260px",
            transition: "width 0.2s ease",
            borderRight: "1px solid var(--border)",
            overflow: view === "editor" ? "hidden" : "visible",
          }}
        >
          {/* List Header */}
          <div
            className="px-3 py-3 shrink-0"
            style={{
              borderBottom: "1px solid var(--border)",
              backgroundColor: "var(--card-bg)",
            }}
          >
            {/* Search */}
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl mb-2"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <FaSearch size={11} style={{ color: "var(--text-faint)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="flex-1 bg-transparent outline-none text-xs"
                style={{ color: "var(--text-primary)" }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{ color: "var(--text-faint)" }}
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>
            {/* Filter row */}
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              {[
                "all",
                "pinned",
                "starred",
                "rich",
                "markdown",
                "code",
                "checklist",
              ].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className="text-xs px-2 py-0.5 rounded-full transition-all capitalize"
                  style={{
                    backgroundColor:
                      filterType === f ? "var(--accent)" : "var(--bg-subtle)",
                    color: filterType === f ? "#fff" : "var(--text-faint)",
                  }}
                >
                  {f === "all" ? "All" : f === "rich" ? "Rich" : f}
                </button>
              ))}
            </div>
            {/* Sort + count */}
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                {filteredNotes.length} note
                {filteredNotes.length !== 1 ? "s" : ""}
                {currentSubject && selectedSubject !== "all"
                  ? ` in ${currentSubject.name}`
                  : ""}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs px-1.5 py-0.5 rounded outline-none"
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--text-faint)",
                  border: "none",
                }}
              >
                <option value="updatedAt">Recent</option>
                <option value="createdAt">Created</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          {/* New note buttons */}
          <div
            className="flex items-center gap-1 px-3 py-2 shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <button
              onClick={() => setShowTemplates((x) => !x)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, var(--accent), #6366f1)",
              }}
            >
              <FaMagic size={10} /> New Note
            </button>
            <div className="flex gap-1">
              {NOTE_TYPES.slice(1).map(({ id, label, icon }) => {
                const TypeIcon = icon;
                return (
                  <button
                    key={id}
                    onClick={() => createNoteWithType(id)}
                    title={label}
                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:scale-110"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <TypeIcon size={11} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Templates dropdown */}
          {showTemplates && (
            <div
              className="px-3 py-2 shrink-0"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                className="text-xs font-semibold mb-2"
                style={{ color: "var(--text-faint)" }}
              >
                Choose template or blank:
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => createNote(null)}
                  className="text-xs py-2 px-1 rounded-lg text-center transition-all hover:scale-105"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <div className="text-lg">📄</div>
                  <div>Blank</div>
                </button>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => createNote(t)}
                    className="text-xs py-2 px-1 rounded-lg text-center transition-all hover:scale-105"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <div className="text-lg">{t.icon}</div>
                    <div className="leading-tight">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto px-2 py-1">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <span style={{ fontSize: "2.5rem" }}>📝</span>
                <p
                  className="text-sm mt-2 font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  No notes yet
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-faint)" }}
                >
                  {search ? "Try a different search" : "Create your first note"}
                </p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  active={activeNoteId === note.id}
                  onClick={() => {
                    setActiveNoteId(note.id);
                    if (view === "list") setView("editor");
                  }}
                  isDark={isDark}
                  subject={subjects.find((s) => s.id === note.subjectId)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right: Editor ───────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-2 shrink-0"
            style={{
              borderBottom: "1px solid var(--border)",
              backgroundColor: "var(--card-bg)",
            }}
          >
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div
                className="flex items-center gap-0.5 rounded-xl overflow-hidden p-0.5"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                {["split", "list", "editor"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="text-xs px-2 py-1 rounded-lg capitalize transition-all"
                    style={{
                      backgroundColor:
                        view === v ? "var(--accent)" : "transparent",
                      color: view === v ? "#fff" : "var(--text-faint)",
                    }}
                  >
                    {v === "split" ? (
                      <FaColumns size={10} />
                    ) : v === "list" ? (
                      "List"
                    ) : (
                      "Editor"
                    )}
                  </button>
                ))}
              </div>
              <span
                className="text-sm font-semibold hidden sm:block"
                style={{ color: "var(--text-primary)" }}
              >
                {activeNote ? activeNote.title || "Untitled" : "Notes"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowShortcuts((x) => !x)}
                title="Keyboard shortcuts"
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                style={{ color: "var(--text-faint)" }}
              >
                <FaKeyboard size={12} />
              </button>
              <button
                onClick={() => setIsFullscreen((x) => !x)}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                style={{ color: "var(--text-faint)" }}
              >
                {isFullscreen ? (
                  <FaCompress size={12} />
                ) : (
                  <FaExpand size={12} />
                )}
              </button>
              <button
                onClick={onClose}
                title="Close (Esc)"
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all text-red-400 hover:text-red-600"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* Shortcuts panel */}
          {showShortcuts && (
            <div
              className="px-4 py-3 text-xs shrink-0"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                className="font-semibold mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                ⌨️ Keyboard Shortcuts
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  ["Ctrl+N", "New note"],
                  ["Ctrl+B", "Bold"],
                  ["Ctrl+I", "Italic"],
                  ["Ctrl+U", "Underline"],
                  ["Ctrl+Z", "Undo"],
                  ["Ctrl+Y", "Redo"],
                  ["Esc", "Close panel"],
                  ["Tab", "Indent (code)"],
                  ["Enter", "New checklist item"],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center gap-2">
                    <kbd
                      className="px-1.5 py-0.5 rounded text-xs font-mono"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {key}
                    </kbd>
                    <span style={{ color: "var(--text-faint)" }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor area */}
          <div className="flex-1 overflow-hidden">
            {activeNote ? (
              <div
                className="h-full notes-editor-content"
                style={{ color: "var(--text-primary)" }}
              >
                <NoteEditor
                  key={activeNote.id}
                  note={activeNote}
                  subjects={subjects}
                  onSave={saveNote}
                  onDelete={deleteNote}
                  isDark={isDark}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen((x) => !x)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div style={{ fontSize: "4rem" }}>📝</div>
                <h3
                  className="text-lg font-bold mt-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Your Notes
                </h3>
                <p
                  className="text-sm mt-1 max-w-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Select a note to start reading or editing, or create a new
                  one.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {NOTE_TYPES.map(({ id, label, icon }) => {
                    const TypeIcon = icon;
                    return (
                      <button
                        key={id}
                        onClick={() => createNoteWithType(id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <TypeIcon
                          size={14}
                          style={{ color: "var(--accent)" }}
                        />{" "}
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowTemplates((x) => !x)}
                  className="mt-3 text-sm flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--accent), #6366f1)",
                  }}
                >
                  <FaMagic size={13} /> Browse Templates
                </button>
                {showTemplates && (
                  <div className="mt-4 grid grid-cols-3 gap-2 max-w-sm">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => createNote(t)}
                        className="text-xs py-3 px-2 rounded-xl text-center transition-all hover:scale-105"
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <div className="text-2xl mb-1">{t.icon}</div>
                        <div>{t.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
