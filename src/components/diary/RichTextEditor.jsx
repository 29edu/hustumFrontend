import { useRef, useEffect, useCallback } from "react";

const COLORS = [
  "#111827", "#374151", "#dc2626", "#ea580c", "#d97706",
  "#16a34a", "#0284c7", "#4f46e5", "#7c3aed", "#db2777",
];

// Inject styles once into <head>
if (typeof document !== "undefined" && !document.getElementById("rte-styles")) {
  const tag = document.createElement("style");
  tag.id = "rte-styles";
  tag.textContent = `
    .rte-editor:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
    .rte-editor:focus { outline: none; }
    .rte-editor h1 { font-size: 2em; font-weight: 700; margin: 0.4em 0; }
    .rte-editor h2 { font-size: 1.5em; font-weight: 700; margin: 0.4em 0; }
    .rte-editor h3 { font-size: 1.17em; font-weight: 700; margin: 0.4em 0; }
    .rte-editor h4 { font-size: 1em; font-weight: 700; margin: 0.4em 0; }
    .rte-editor ul { list-style: disc; padding-left: 1.5em; margin: 0.4em 0; }
    .rte-editor ol { list-style: decimal; padding-left: 1.5em; margin: 0.4em 0; }
    .rte-editor blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; color: #6b7280; margin: 0.4em 0; font-style: italic; }
    .rte-editor p { margin: 0.2em 0; }
    .rte-toolbar-btn { padding: 3px 9px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 13px; cursor: pointer; background: #fff; transition: background 0.15s; }
    .rte-toolbar-btn:hover { background: #f3f4f6; }
  `;
  document.head.appendChild(tag);
}

const Divider = () => (
  <div style={{ width: 1, height: 22, background: "#e5e7eb", margin: "0 2px", alignSelf: "center" }} />
);

// Save & restore selection so toolbar actions don't lose it
const saveSelection = () => {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) return sel.getRangeAt(0).cloneRange();
  return null;
};
const restoreSelection = (range) => {
  if (!range) return;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
};

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const lastValue = useRef(value ?? "");
  const colorPickerRef = useRef(null);
  const savedRange = useRef(null);

  // Set initial content on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
      lastValue.current = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync DOM when value changes externally (switching between diary entries)
  useEffect(() => {
    if (value !== lastValue.current && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      lastValue.current = value || "";
    }
  }, [value]);

  // exec: restore saved selection then run command (don't call focus() — it resets caret)
  const exec = useCallback((cmd, val = null) => {
    restoreSelection(savedRange.current);
    document.execCommand(cmd, false, val);
    savedRange.current = saveSelection();
  }, []);

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    lastValue.current = html;
    onChange(html);
  }, [onChange]);

  // Save selection whenever user interacts with the editor
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const handleFormatBlock = (e) => {
    const val = e.target.value;
    e.target.value = "";
    if (val) exec("formatBlock", val);
  };

  const toggleColorPicker = () => {
    savedRange.current = saveSelection(); // save before picker opens
    const el = colorPickerRef.current;
    if (el) el.style.display = el.style.display === "none" ? "grid" : "none";
  };

  const applyColor = (color) => {
    exec("foreColor", color);
    if (colorPickerRef.current) colorPickerRef.current.style.display = "none";
  };

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "6px 8px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap" }}>

        <select
          onMouseDown={() => { savedRange.current = saveSelection(); }}
          onChange={handleFormatBlock}
          value=""
          style={{ padding: "2px 6px", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 13, background: "#fff", cursor: "pointer" }}
        >
          <option value="" disabled>Paragraph</option>
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
        </select>

        <Divider />

        <button type="button" className="rte-toolbar-btn" style={{ fontWeight: 700 }}
          onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} title="Bold">B</button>
        <button type="button" className="rte-toolbar-btn" style={{ fontStyle: "italic" }}
          onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} title="Italic">I</button>
        <button type="button" className="rte-toolbar-btn" style={{ textDecoration: "underline" }}
          onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} title="Underline">U</button>
        <button type="button" className="rte-toolbar-btn" style={{ textDecoration: "line-through" }}
          onMouseDown={(e) => { e.preventDefault(); exec("strikeThrough"); }} title="Strikethrough">S</button>

        <Divider />

        <button type="button" className="rte-toolbar-btn"
          onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }} title="Bullet list">• List</button>
        <button type="button" className="rte-toolbar-btn"
          onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }} title="Numbered list">1. List</button>

        <Divider />

        {/* Text color */}
        <div style={{ position: "relative" }}>
          <button type="button" className="rte-toolbar-btn"
            onMouseDown={(e) => { e.preventDefault(); toggleColorPicker(); }} title="Text color">
            A <span style={{ display: "inline-block", width: 10, height: 3, background: "#374151", verticalAlign: "middle", marginLeft: 2 }} />
          </button>
          <div ref={colorPickerRef}
            style={{ display: "none", position: "absolute", top: "110%", left: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", zIndex: 50, gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
            {COLORS.map((c) => (
              <button key={c} type="button"
                onMouseDown={(e) => { e.preventDefault(); applyColor(c); }}
                title={c}
                style={{ width: 22, height: 22, borderRadius: 4, background: c, border: "1px solid #d1d5db", cursor: "pointer" }}
              />
            ))}
          </div>
        </div>

        <Divider />

        <button type="button" className="rte-toolbar-btn"
          onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }} title="Clear formatting"
          style={{ fontSize: 12 }}>✕ fmt</button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={handleSelectionChange}
        onMouseUp={handleSelectionChange}
        onSelect={handleSelectionChange}
        data-placeholder="Start writing your diary entry here..."
        className="rte-editor"
        suppressContentEditableWarning
        style={{ flex: 1, padding: 16, overflowY: "auto", color: "#111827", fontSize: "1rem", lineHeight: 1.75, minHeight: 300, background: "#fff" }}
      />
    </div>
  );
};

export default RichTextEditor;

