import { useState, useEffect } from "react";
import { improvementApi } from "../api/improvementApi";

// ─── mood config ───────────────────────────────────────────────────────────
const MOODS = [
  { value: 1, emoji: "😓", label: "Rough" },
  { value: 2, emoji: "😕", label: "Below avg" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

// ─── section config ────────────────────────────────────────────────────────
const SECTIONS = [
  {
    key: "goodParts",
    label: "What I Did Well",
    icon: "✅",
    color: "from-emerald-50 to-green-50",
    border: "border-emerald-300",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
    placeholder: "Celebrate your wins — big or small…",
  },
  {
    key: "lackedAreas",
    label: "Where I Lacked",
    icon: "⚡",
    color: "from-red-50 to-rose-50",
    border: "border-red-300",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-400",
    placeholder: "Be honest with yourself…",
  },
  {
    key: "improvementAreas",
    label: "Room to Improve",
    icon: "🚀",
    color: "from-orange-50 to-amber-50",
    border: "border-orange-300",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-400",
    placeholder: "What can I do better next time…",
  },
  {
    key: "mistakesMade",
    label: "Mistakes Made",
    icon: "🔍",
    color: "from-pink-50 to-fuchsia-50",
    border: "border-pink-300",
    badge: "bg-pink-100 text-pink-700",
    dot: "bg-pink-400",
    placeholder: "Mistakes are data, not failures…",
  },
  {
    key: "normalAreas",
    label: "Normal / Neutral",
    icon: "〰️",
    color: "from-slate-50 to-gray-50",
    border: "border-slate-300",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    placeholder: "Nothing special — just as expected…",
  },
  {
    key: "lessonsLearned",
    label: "Lesson of the Day",
    icon: "💡",
    color: "from-blue-50 to-sky-50",
    border: "border-blue-300",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
    placeholder: "One insight to carry forward…",
  },
];

// ─── blank form state ───────────────────────────────────────────────────────
const blankForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  mood: 3,
  goodParts: "",
  lackedAreas: "",
  improvementAreas: "",
  mistakesMade: "",
  normalAreas: "",
  lessonsLearned: "",
  triedSomethingNew: false,
  newThingDescription: "",
});

// ─── helper: format date nicely ─────────────────────────────────────────────
const formatDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Entry card ─────────────────────────────────────────────────────────────
const EntryCard = ({ entry, onEdit, onDelete, isFirst }) => {
  const [expanded, setExpanded] = useState(isFirst);
  const mood = MOODS.find((m) => m.value === entry.mood) || MOODS[2];

  // Collect filled sections
  const filledSections = SECTIONS.filter((s) => entry[s.key]?.trim());

  return (
    <div className="group relative flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div
          className={`w-4 h-4 rounded-full border-4 border-white shadow-md mt-1 flex-shrink-0 ${mood.value >= 4 ? "bg-emerald-400" : mood.value <= 2 ? "bg-red-400" : "bg-amber-400"}`}
        />
        <div className="w-0.5 flex-1 bg-gradient-to-b from-gray-300 to-transparent mt-1" />
      </div>

      {/* Card */}
      <div className="flex-1 mb-6">
        {/* Card header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-white/60 overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
            onClick={() => setExpanded((p) => !p)}
          >
            {/* Date + mood */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">{mood.emoji}</div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {formatDate(entry.date)}
                </p>
                <p className="text-xs text-gray-500">{mood.label} day</p>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {entry.triedSomethingNew && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  🆕 Tried Something New
                </span>
              )}
              <span className="text-xs text-gray-400">
                {filledSections.length}/{SECTIONS.length} sections
              </span>

              {/* Edit / Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(entry);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"
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
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(entry._id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                title="Delete"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              {/* Expand chevron */}
              <div
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              >
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-3">
            <div className="flex gap-1">
              {SECTIONS.map((s) => (
                <div
                  key={s.key}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${entry[s.key]?.trim() ? s.dot : "bg-gray-200"}`}
                  title={s.label}
                />
              ))}
            </div>
          </div>

          {/* Expandable body */}
          {expanded && (
            <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {SECTIONS.map((s) =>
                entry[s.key]?.trim() ? (
                  <div
                    key={s.key}
                    className={`rounded-xl bg-gradient-to-br ${s.color} border ${s.border} p-3`}
                  >
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${s.badge}`}
                    >
                      {s.icon} {s.label}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {entry[s.key]}
                    </p>
                  </div>
                ) : null,
              )}

              {/* Tried something new */}
              {entry.triedSomethingNew && (
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-300 p-3 md:col-span-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-2 bg-blue-100 text-blue-700">
                    🆕 Tried Something New
                  </span>
                  {entry.newThingDescription?.trim() ? (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {entry.newThingDescription}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No description added
                    </p>
                  )}
                </div>
              )}

              {/* If nothing filled */}
              {filledSections.length === 0 && !entry.triedSomethingNew && (
                <p className="text-sm text-gray-400 italic col-span-2">
                  No details added for this reflection.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Form Modal ──────────────────────────────────────────────────────────────
const FormModal = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || blankForm());
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "Overview", icon: "📋" },
    { label: "Performance", icon: "📊" },
    { label: "Learning", icon: "🎓" },
    { label: "New Thing", icon: "✨" },
  ];

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <h2 className="text-xl font-bold text-white">
            {initial?._id ? "Edit Reflection" : "Today's Reflection"}
          </h2>
          <p className="text-blue-200 text-sm mt-0.5">
            Track your growth, mistakes, and lessons
          </p>
        </div>

        {/* Date + Mood row */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-6 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              How was today?
            </label>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => set("mood", m.value)}
                  title={m.label}
                  className={`w-9 h-9 rounded-full text-xl transition-all duration-150 ${form.mood === m.value ? "bg-blue-100 scale-125 ring-2 ring-blue-400" : "hover:bg-gray-100"}`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${activeTab === i ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Tab 0: Overview — good + normal */}
          {activeTab === 0 && (
            <>
              <TextArea
                icon="✅"
                label="What I Did Well"
                color="emerald"
                value={form.goodParts}
                onChange={(v) => set("goodParts", v)}
                placeholder="Your wins today — big or small…"
              />
              <TextArea
                icon="〰️"
                label="Normal / Neutral Areas"
                color="slate"
                value={form.normalAreas}
                onChange={(v) => set("normalAreas", v)}
                placeholder="Things that were just okay, nothing special…"
              />
            </>
          )}

          {/* Tab 1: Performance — lacked + mistakes + improvement */}
          {activeTab === 1 && (
            <>
              <TextArea
                icon="⚡"
                label="Where I Lacked"
                color="red"
                value={form.lackedAreas}
                onChange={(v) => set("lackedAreas", v)}
                placeholder="Be honest with yourself…"
              />
              <TextArea
                icon="🔍"
                label="Mistakes Made"
                color="pink"
                value={form.mistakesMade}
                onChange={(v) => set("mistakesMade", v)}
                placeholder="Mistakes are data, not failures…"
              />
              <TextArea
                icon="🚀"
                label="Room to Improve"
                color="orange"
                value={form.improvementAreas}
                onChange={(v) => set("improvementAreas", v)}
                placeholder="Concrete steps for tomorrow…"
              />
            </>
          )}

          {/* Tab 2: Learning */}
          {activeTab === 2 && (
            <TextArea
              icon="💡"
              label="Lesson of the Day"
              color="violet"
              value={form.lessonsLearned}
              onChange={(v) => set("lessonsLearned", v)}
              placeholder="One insight to carry forward…"
              rows={6}
            />
          )}

          {/* Tab 3: New thing */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-2xl">🆕</span>
                <div className="flex-1">
                  <p className="font-semibold text-blue-800">
                    Did you try something new today?
                  </p>
                  <p className="text-xs text-blue-500">
                    A new skill, approach, food, activity, conversation…
                  </p>
                </div>
                <button
                  onClick={() =>
                    set("triedSomethingNew", !form.triedSomethingNew)
                  }
                  className={`w-12 h-6 rounded-full transition-all duration-200 relative ${form.triedSomethingNew ? "bg-blue-500" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${form.triedSomethingNew ? "left-6" : "left-0.5"}`}
                  />
                </button>
              </div>
              {form.triedSomethingNew && (
                <TextArea
                  icon="✨"
                  label="What did you try?"
                  color="blue"
                  value={form.newThingDescription}
                  onChange={(v) => set("newThingDescription", v)}
                  placeholder="Describe the new thing you tried…"
                  rows={5}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          {/* Tab nav */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab((p) => Math.max(0, p - 1))}
              disabled={activeTab === 0}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              onClick={() =>
                setActiveTab((p) => Math.min(tabs.length - 1, p + 1))
              }
              disabled={activeTab === tabs.length - 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-60 shadow-md"
            >
              {saving ? "Saving…" : "Save Reflection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Reusable TextArea ────────────────────────────────────────────────────────
const colorMap = {
  emerald: "border-emerald-200 focus:ring-emerald-300 bg-emerald-50/50",
  red: "border-red-200 focus:ring-red-300 bg-red-50/50",
  orange: "border-orange-200 focus:ring-orange-300 bg-orange-50/50",
  pink: "border-pink-200 focus:ring-pink-300 bg-pink-50/50",
  slate: "border-slate-200 focus:ring-slate-300 bg-slate-50/50",
  violet: "border-blue-200 focus:ring-blue-300 bg-blue-50/50",
  blue: "border-blue-200 focus:ring-blue-300 bg-blue-50/50",
};

const labelColorMap = {
  emerald: "text-emerald-700",
  red: "text-red-700",
  orange: "text-orange-700",
  pink: "text-pink-700",
  slate: "text-slate-700",
  violet: "text-blue-700",
  blue: "text-blue-700",
};

const TextArea = ({
  icon,
  label,
  color,
  value,
  onChange,
  placeholder,
  rows = 4,
}) => (
  <div>
    <label
      className={`flex items-center gap-1.5 text-sm font-semibold mb-1.5 ${labelColorMap[color]}`}
    >
      <span>{icon}</span> {label}
    </label>
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-none border rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 transition-all leading-relaxed ${colorMap[color]}`}
    />
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
const ImprovementPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await improvementApi.getAllEntries();
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    try {
      if (form._id) {
        const updated = await improvementApi.updateEntry(form._id, form);
        setEntries((prev) =>
          prev.map((e) => (e._id === updated._id ? updated : e)),
        );
      } else {
        const created = await improvementApi.createEntry(form);
        setEntries((prev) => [created, ...prev]);
      }
      setShowForm(false);
      setEditEntry(null);
    } catch (e) {
      alert("Failed to save entry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reflection?")) return;
    try {
      await improvementApi.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const handleEdit = (entry) => {
    setEditEntry(entry);
    setShowForm(true);
  };

  const openNew = () => {
    setEditEntry(null);
    setShowForm(true);
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)]"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Daily Reflection
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Track your growth, mistakes, and lessons — every day
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm"
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
            Add Reflection
          </button>
        </div>

        {/* ── Legend chips ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SECTIONS.map((s) => (
            <span
              key={s.key}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${s.badge} border ${s.border}`}
            >
              {s.icon} {s.label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            🆕 New Thing
          </span>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && entries.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl shadow-inner">
              📔
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No reflections yet
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Start tracking your daily growth — one day at a time.
            </p>
            <button
              onClick={openNew}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Write First Reflection
            </button>
          </div>
        )}

        {/* ── Timeline feed ── */}
        {!loading && entries.length > 0 && (
          <div>
            {entries.map((entry, idx) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isFirst={idx === 0}
              />
            ))}
            {/* End of timeline */}
            <div className="flex justify-center mt-2">
              <span className="text-xs text-gray-400 bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/50">
                ✦ You've reached the beginning ✦
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <FormModal
          initial={editEntry}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditEntry(null);
          }}
        />
      )}
    </div>
  );
};

export default ImprovementPage;
