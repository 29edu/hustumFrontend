import { useState, useRef, useEffect } from "react";

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isInitialMount = useRef(true);

  // Set initial content only once
  useEffect(() => {
    if (isInitialMount.current && editorRef.current && value) {
      editorRef.current.innerHTML = value;
      isInitialMount.current = false;
    }
  }, []);

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
        {/* Headings */}
        <select
          onChange={(e) => applyFormat("formatBlock", e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Bold */}
        <button
          type="button"
          onClick={() => applyFormat("bold")}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 font-bold text-sm"
          title="Bold"
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => applyFormat("italic")}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 italic text-sm"
          title="Italic"
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => applyFormat("underline")}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 underline text-sm"
          title="Underline"
        >
          U
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 text-sm flex items-center gap-1"
            title="Text Color"
          >
            <span>A</span>
            <div className="w-4 h-1 bg-current"></div>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10 grid grid-cols-5 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    applyFormat("foreColor", color);
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("insertUnorderedList");
          }}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 text-sm"
          title="Bullet List"
        >
          • List
        </button>

        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("insertOrderedList");
          }}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 text-sm"
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder="Start writing your diary entry here..."
        className="min-h-[300px] p-4 focus:outline-none text-gray-800 prose prose-sm max-w-none"
        style={{
          maxHeight: "500px",
          overflowY: "auto",
        }}
        suppressContentEditableWarning
      />
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          pointer-events: none;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        [contenteditable] h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1em 0;
        }
        [contenteditable] h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.17em 0;
        }
        [contenteditable] h6 {
          font-size: 0.67em;
          font-weight: bold;
          margin: 1.33em 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
