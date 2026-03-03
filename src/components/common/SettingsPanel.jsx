import {
  useTheme,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  ACCENT_OPTIONS,
} from "../../context/ThemeContext";
import {
  FaTimes,
  FaFont,
  FaPalette,
  FaSlidersH,
  FaMoon,
  FaSun,
  FaBolt,
  FaFeatherAlt,
  FaCheck,
} from "react-icons/fa";

/* ──────────────────────────────────────────────────────────── */
/* Tiny helper components                                       */
/* ──────────────────────────────────────────────────────────── */

const SectionTitle = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon size={14} style={{ color: "var(--accent)" }} />
    <span
      className="text-xs font-bold uppercase tracking-widest"
      style={{ color: "var(--text-faint)" }}
    >
      {label}
    </span>
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center justify-between cursor-pointer select-none group">
    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
      {label}
    </span>
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative w-10 h-5 rounded-full transition-all duration-200 shrink-0"
      style={{
        background: checked ? "var(--accent)" : "var(--bg-subtle)",
        border: "1px solid var(--border-strong)",
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  </label>
);

/* ──────────────────────────────────────────────────────────── */
/* Main SettingsPanel                                           */
/* ──────────────────────────────────────────────────────────── */

const SettingsPanel = ({ onClose }) => {
  const {
    isDark,
    toggleTheme,
    font,
    setFont,
    fontSize,
    setFontSize,
    accentColor,
    setAccentColor,
    compact,
    toggleCompact,
    glassEffect,
    toggleGlass,
    animationSpeed,
    setAnimationSpeed,
  } = useTheme();

  const panelBg = isDark ? "rgba(15,23,42,0.97)" : "rgba(255,255,255,0.97)";
  const sectionBg = isDark ? "rgba(30,41,59,0.7)" : "rgba(248,250,252,0.9)";

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* ── Panel ── */}
      <div
        className="fixed left-0 right-0 z-50 settings-panel-enter"
        style={{
          top: "64px",
          background: panelBg,
          borderBottom: "1px solid var(--border-strong)",
          boxShadow: isDark
            ? "0 20px 60px rgba(0,0,0,0.6)"
            : "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Inner scroll container */}
        <div className="max-w-5xl mx-auto px-6 py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 4px 12px var(--accent-light)",
                }}
              >
                <FaSlidersH size={14} className="text-white" />
              </div>
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Preferences
                </h2>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  Personalise your Hustum experience
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                color: "var(--text-muted)",
                background: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.05)")
              }
            >
              <FaTimes size={13} />
            </button>
          </div>

          {/* ── Grid Layout ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ── Section 1: Typography ── */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: sectionBg,
                border: "1px solid var(--border)",
              }}
            >
              <SectionTitle icon={FaFont} label="Typography" />

              {/* Font Family */}
              <p
                className="text-xs mb-2"
                style={{ color: "var(--text-faint)" }}
              >
                Font Family
              </p>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {Object.entries(FONT_OPTIONS).map(([key, opt]) => {
                  const active = font === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFont(key)}
                      className="px-2 py-1.5 rounded-lg text-xs transition-all relative"
                      style={{
                        fontFamily: opt.value,
                        background: active
                          ? "var(--accent)"
                          : isDark
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(0,0,0,0.04)",
                        color: active ? "#fff" : "var(--text-secondary)",
                        border: active
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Font Size */}
              <p
                className="text-xs mb-2"
                style={{ color: "var(--text-faint)" }}
              >
                Font Size
              </p>
              <div className="flex gap-1.5">
                {Object.entries(FONT_SIZE_OPTIONS).map(([key, opt]) => {
                  const active = fontSize === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFontSize(key)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: active
                          ? "var(--accent)"
                          : isDark
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(0,0,0,0.04)",
                        color: active ? "#fff" : "var(--text-secondary)",
                        border: active
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Section 2: Accent Color ── */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: sectionBg,
                border: "1px solid var(--border)",
              }}
            >
              <SectionTitle icon={FaPalette} label="Accent Color" />
              <p
                className="text-xs mb-3"
                style={{ color: "var(--text-faint)" }}
              >
                Changes buttons, links & highlights
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ACCENT_OPTIONS).map(([key, opt]) => {
                  const active = accentColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAccentColor(key)}
                      title={opt.label}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                      style={{
                        border: active
                          ? `2px solid ${opt.main}`
                          : "2px solid transparent",
                        background: active
                          ? isDark
                            ? opt.darkLight
                            : opt.light
                          : "transparent",
                      }}
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center shadow-md"
                        style={{ background: opt.main }}
                      >
                        {active && <FaCheck size={10} className="text-white" />}
                      </span>
                      <span
                        className="text-xs"
                        style={{
                          color: active ? opt.main : "var(--text-muted)",
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Section 3: Appearance ── */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: sectionBg,
                border: "1px solid var(--border)",
              }}
            >
              <SectionTitle icon={isDark ? FaMoon : FaSun} label="Appearance" />

              {/* Theme */}
              <div
                className="flex rounded-xl overflow-hidden mb-4"
                style={{ border: "1px solid var(--border)" }}
              >
                {[
                  { key: false, Icon: FaSun, label: "Light" },
                  { key: true, Icon: FaMoon, label: "Dark" },
                ].map(({ key, Icon, label }) => {
                  const active = isDark === key;
                  return (
                    <button
                      key={label}
                      onClick={() => {
                        if (isDark !== key) toggleTheme();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-sm transition-all"
                      style={{
                        background: active ? "var(--accent)" : "transparent",
                        color: active ? "#fff" : "var(--text-muted)",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3">
                <Toggle
                  checked={compact}
                  onChange={toggleCompact}
                  label="Compact Mode"
                />
                <Toggle
                  checked={glassEffect}
                  onChange={toggleGlass}
                  label="Glass Effects"
                />
              </div>
            </div>

            {/* ── Section 4: Performance & Motion ── */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: sectionBg,
                border: "1px solid var(--border)",
              }}
            >
              <SectionTitle icon={FaBolt} label="Motion" />
              <p
                className="text-xs mb-3"
                style={{ color: "var(--text-faint)" }}
              >
                Transition & animation speed
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  { key: "off", label: "Off", desc: "No animations" },
                  { key: "fast", label: "Fast", desc: "Quick & snappy" },
                  {
                    key: "normal",
                    label: "Normal",
                    desc: "Balanced (default)",
                  },
                  { key: "slow", label: "Slow", desc: "Smooth & gentle" },
                ].map(({ key, label, desc }) => {
                  const active = animationSpeed === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAnimationSpeed(key)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left"
                      style={{
                        background: active
                          ? isDark
                            ? "var(--accent-light-dark)"
                            : "var(--accent-light)"
                          : "transparent",
                        border: active
                          ? "1px solid var(--accent)"
                          : "1px solid transparent",
                        color: active
                          ? "var(--accent)"
                          : "var(--text-secondary)",
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: active
                            ? "var(--accent)"
                            : "var(--border-strong)",
                        }}
                      />
                      <span>
                        <span
                          className="font-medium"
                          style={{ fontWeight: active ? 600 : 400 }}
                        >
                          {label}
                        </span>
                        <span
                          className="block text-xs"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {desc}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tip */}
              <div
                className="mt-3 rounded-xl px-3 py-2 flex items-start gap-2"
                style={{
                  background: isDark
                    ? "rgba(59,130,246,0.08)"
                    : "rgba(59,130,246,0.06)",
                  border: "1px solid var(--ring)",
                }}
              >
                <FaFeatherAlt
                  size={11}
                  style={{
                    color: "var(--accent)",
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  All preferences are saved automatically and persist across
                  sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
