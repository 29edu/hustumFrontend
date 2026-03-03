import { useState } from "react";
import {
  FaTimes,
  FaEnvelope,
  FaUser,
  FaRocket,
  FaShieldAlt,
  FaQuestionCircle,
  FaHeart,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaCheckCircle,
  FaPaperPlane,
  FaExclamationCircle,
  FaLightbulb,
  FaBug,
  FaCommentAlt,
  FaStar,
  FaCode,
  FaLock,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const SUPPORT_EMAIL = "edisonpriyadarshi12@gmail.com";
const APP_VERSION = "2.0.0";
const RELEASE_DATE = "March 2026";

/* ─── Sub components ─────────────────────────────────────── */

const TabBtn = ({ active, onClick, icon: Icon, label, color }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
    style={{
      backgroundColor: active ? color || "var(--accent)" : "transparent",
      color: active ? "#fff" : "var(--text-muted)",
      border: active ? "none" : "1px solid transparent",
    }}
  >
    <Icon size={13} />
    {label}
  </button>
);

const Pill = ({ text, color }) => (
  <span
    className="text-xs px-2.5 py-1 rounded-full font-semibold"
    style={{ backgroundColor: `${color}20`, color }}
  >
    {text}
  </span>
);

const Accordion = ({ question, answer, isDark }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ border: "1px solid var(--border-strong)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left"
        style={{
          backgroundColor: open
            ? isDark
              ? "rgba(99,102,241,0.12)"
              : "rgba(99,102,241,0.06)"
            : "transparent",
          color: open ? "#6366f1" : "var(--text-primary)",
        }}
      >
        <span className="flex items-center gap-2">
          <FaQuestionCircle size={12} style={{ color: "#6366f1" }} />
          {question}
        </span>
        {open ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
      </button>
      {open && (
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={{
            color: "var(--text-secondary)",
            backgroundColor: isDark
              ? "rgba(255,255,255,0.02)"
              : "rgba(0,0,0,0.018)",
            borderTop: "1px solid var(--border)",
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
};

/* ─── Contact / Email Tab ─────────────────────────────────── */
const ContactTab = ({ isDark }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "general",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const issueTypes = [
    { value: "general", label: "General Question", icon: "💬" },
    { value: "bug", label: "Bug Report", icon: "🐛" },
    { value: "feature", label: "Feature Request", icon: "✨" },
    { value: "feedback", label: "Feedback", icon: "💡" },
    { value: "account", label: "Account Issue", icon: "👤" },
    { value: "other", label: "Other", icon: "📝" },
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email and message.");
      return;
    }
    setError("");
    const subject = encodeURIComponent(
      `[Hustum ${issueTypes.find((t) => t.value === form.type)?.label}] ${form.subject || "Support Request"}`,
    );
    const body = encodeURIComponent(
      `Hi Edison,\n\nName: ${form.name}\nEmail: ${form.email}\nType: ${form.type}\n\n${form.message}\n\n---\nSent via Hustum Support v${APP_VERSION}`,
    );
    window.open(
      `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`,
      "_blank",
    );
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const inputStyle = {
    backgroundColor: "var(--input-bg)",
    border: "1px solid var(--border-strong)",
    color: "var(--text-primary)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div className="grid md:grid-cols-5 gap-6">
      {/* Left: form */}
      <form onSubmit={handleSend} className="md:col-span-3 space-y-4">
        {/* Name + Email row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--text-faint)" }}
            >
              YOUR NAME
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Edison…"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-strong)")
              }
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--text-faint)" }}
            >
              YOUR EMAIL
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-strong)")
              }
            />
          </div>
        </div>

        {/* Issue type */}
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-faint)" }}
          >
            ISSUE TYPE
          </label>
          <div className="grid grid-cols-3 gap-2">
            {issueTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, type: t.value })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  border: `1px solid ${form.type === t.value ? "#6366f1" : "var(--border-strong)"}`,
                  backgroundColor:
                    form.type === t.value
                      ? isDark
                        ? "rgba(99,102,241,0.2)"
                        : "rgba(99,102,241,0.08)"
                      : "transparent",
                  color:
                    form.type === t.value ? "#6366f1" : "var(--text-muted)",
                }}
              >
                <span>{t.icon}</span>
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-faint)" }}
          >
            SUBJECT{" "}
            <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>
              (optional)
            </span>
          </label>
          <input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Brief summary…"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--border-strong)")
            }
          />
        </div>

        {/* Message */}
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: "var(--text-faint)" }}
          >
            MESSAGE
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Describe your issue, idea or feedback in detail…"
            rows={5}
            style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) =>
              (e.target.style.borderColor = "var(--border-strong)")
            }
          />
        </div>

        {error && (
          <div
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
            style={{
              backgroundColor: "#ef444415",
              color: "#ef4444",
              border: "1px solid #ef444430",
            }}
          >
            <FaExclamationCircle size={13} />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: sent
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#fff",
            boxShadow: sent
              ? "0 4px 15px rgba(16,185,129,0.35)"
              : "0 4px 15px rgba(99,102,241,0.35)",
          }}
        >
          {sent ? (
            <>
              <FaCheckCircle size={14} /> Email client opened — send the email!
            </>
          ) : (
            <>
              <FaPaperPlane size={13} /> Send Message
            </>
          )}
        </button>
      </form>

      {/* Right: contact cards */}
      <div className="md:col-span-2 space-y-3">
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: isDark
              ? "rgba(99,102,241,0.1)"
              : "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FaEnvelope size={13} style={{ color: "#6366f1" }} />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-faint)" }}
            >
              Direct Email
            </span>
          </div>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-sm font-semibold break-all"
            style={{ color: "#6366f1" }}
          >
            {SUPPORT_EMAIL}
          </a>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Expect a reply within 24–48 hours
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: isDark
              ? "rgba(16,185,129,0.1)"
              : "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FaBug size={13} style={{ color: "#10b981" }} />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-faint)" }}
            >
              Bug Reports
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Found a bug? Use the form and select "Bug Report". Include steps to
            reproduce for fastest resolution.
          </p>
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: isDark
              ? "rgba(245,158,11,0.1)"
              : "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FaLightbulb size={13} style={{ color: "#f59e0b" }} />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-faint)" }}
            >
              Feature Requests
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Ideas are always welcome! Every feature in Hustum started as
            someone's suggestion.
          </p>
        </div>

        <div
          className="rounded-xl p-4 text-center"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            Hustum v{APP_VERSION}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
            Released {RELEASE_DATE}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── About Developer Tab ─────────────────────────────────── */
const AboutTab = ({ isDark }) => {
  const skills = [
    "React",
    "Node.js",
    "MongoDB",
    "Express",
    "Tailwind CSS",
    "JavaScript",
    "REST APIs",
    "UI/UX Design",
  ];
  const modules = [
    { name: "Dashboard", desc: "Real-time overview of your day", icon: "🏠" },
    {
      name: "Habit Tracker",
      desc: "Build consistent daily habits",
      icon: "🔥",
    },
    {
      name: "Weekly Goals",
      desc: "Plan and track your weekly targets",
      icon: "🎯",
    },
    {
      name: "Topics & Study",
      desc: "Organise study materials by subject",
      icon: "📚",
    },
    {
      name: "Daily Improvement",
      desc: "Reflect on wins and growth areas",
      icon: "📈",
    },
    {
      name: "Research Notes",
      desc: "Save and categorise research",
      icon: "🔬",
    },
    { name: "Life Goals", desc: "Long-term goals with milestones", icon: "🌟" },
    { name: "Diary", desc: "Private daily journal entries", icon: "📔" },
    { name: "Ratings", desc: "Rate your daily performance", icon: "⭐" },
    { name: "Analysis", desc: "Visualise your progress over time", icon: "📊" },
    { name: "Tracker", desc: "Task tracker with time logging", icon: "⏱️" },
    { name: "Me", desc: "Personal profile & About page", icon: "👤" },
  ];

  return (
    <div className="space-y-6">
      {/* Developer card */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))"
            : "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.05))",
          border: "1px solid rgba(99,102,241,0.25)",
        }}
      >
        {/* Decorative circle */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #6366f1, transparent)",
          }}
        />
        <div className="flex items-start gap-5 relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
            }}
          >
            E
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Edison Priyadarshi
              </h3>
              <Pill text="Developer" color="#6366f1" />
              <Pill text="Designer" color="#8b5cf6" />
            </div>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Full-Stack Developer · Builder of Hustum
            </p>
            <p
              className="text-sm mt-3 leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Hey! I'm Edison — a passionate developer who built Hustum from
              scratch as a personal productivity OS. The goal was simple: one
              place to track everything that matters — habits, goals, study,
              diary, research, and life progress. No fluff, just tools that
              work.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(99,102,241,0.15)",
                  color: "#6366f1",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                <FaEnvelope size={11} /> Email Me
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-strong)",
                }}
              >
                <FaGithub size={11} /> GitHub
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: "rgba(14,118,168,0.12)",
                  color: "#0e76a8",
                  border: "1px solid rgba(14,118,168,0.25)",
                }}
              >
                <FaLinkedin size={11} /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tech stack */}
      <div>
        <h4
          className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: "var(--text-faint)" }}
        >
          <FaCode size={11} /> Tech Stack
        </h4>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{
                backgroundColor: "var(--bg-subtle)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-strong)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* App modules */}
      <div>
        <h4
          className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
          style={{ color: "var(--text-faint)" }}
        >
          <FaRocket size={11} /> What Hustum Includes
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {modules.map((m) => (
            <div
              key={m.name}
              className="rounded-xl p-3"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-base">{m.icon}</span>
              <div
                className="text-xs font-semibold mt-1"
                style={{ color: "var(--text-primary)" }}
              >
                {m.name}
              </div>
              <div
                className="text-xs mt-0.5 leading-relaxed"
                style={{ color: "var(--text-faint)" }}
              >
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Version */}
      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div>
          <div
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Hustum v{APP_VERSION}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: "var(--text-faint)" }}
          >
            Released {RELEASE_DATE} · Built with ❤️ by Edison
          </div>
        </div>
        <Pill text="Stable" color="#10b981" />
      </div>
    </div>
  );
};

/* ─── Policies Tab ────────────────────────────────────────── */
const PoliciesTab = () => {
  const policies = [
    {
      icon: FaLock,
      color: "#6366f1",
      title: "Privacy Policy",
      content: [
        {
          heading: "What we collect",
          text: "Hustum collects only the data you explicitly provide: your name, email address, and the content you create within the app (todos, diary entries, habits, goals, notes, ratings). We do not collect browser telemetry, location data, or third-party tracking.",
        },
        {
          heading: "How we use your data",
          text: "Your data is used solely to power your personal Hustum experience. We do not sell, rent, or share your information with any third parties for marketing purposes.",
        },
        {
          heading: "Data storage",
          text: "All data is stored securely in a MongoDB Atlas database with encrypted connections. Passwords are hashed using bcrypt before storage — your raw password is never stored anywhere.",
        },
        {
          heading: "Data deletion",
          text: "You can request full deletion of your account and all associated data at any time by emailing us. Admin users can also delete accounts directly from the Admin Dashboard.",
        },
        {
          heading: "Cookies & Local Storage",
          text: "Hustum uses browser localStorage to persist your authentication token, theme preferences, and sidebar state. No third-party cookies are used.",
        },
      ],
    },
    {
      icon: FaCommentAlt,
      color: "#f59e0b",
      title: "Terms of Use",
      content: [
        {
          heading: "Acceptable use",
          text: "Hustum is a personal productivity tool. You agree to use it only for lawful personal productivity purposes. Do not attempt to reverse-engineer, exploit, or disrupt the service.",
        },
        {
          heading: "Your content",
          text: "You retain full ownership of all content you create in Hustum. By using the app, you grant Hustum a limited license to store and display your content to you.",
        },
        {
          heading: "No warranties",
          text: "Hustum is provided as-is. While we strive for 100% uptime and data integrity, we cannot guarantee uninterrupted service. Always maintain your own backups of critical information.",
        },
        {
          heading: "Account sharing",
          text: "Accounts are for individual use only. Sharing your account credentials with others is not permitted.",
        },
        {
          heading: "Changes to terms",
          text: "We may update these terms periodically. Continued use of Hustum after changes constitutes your acceptance of the new terms.",
        },
      ],
    },
    {
      icon: FaShieldAlt,
      color: "#10b981",
      title: "Security Policy",
      content: [
        {
          heading: "Authentication",
          text: "Hustum uses JSON Web Tokens (JWT) for secure, stateless authentication. Tokens expire after 30 days and are stored only in your browser's localStorage.",
        },
        {
          heading: "Password security",
          text: "All passwords are hashed using bcrypt with a salt factor of 10 before being stored. The original password is never accessible, even to admins.",
        },
        {
          heading: "API security",
          text: "All API routes requiring authentication are protected by server-side middleware. Admin routes additionally require the isAdmin flag to be verified.",
        },
        {
          heading: "Reporting vulnerabilities",
          text: `If you discover a security vulnerability, please report it responsibly to ${SUPPORT_EMAIL}. Do not disclose it publicly until it has been addressed.`,
        },
      ],
    },
  ];

  const [openPolicy, setOpenPolicy] = useState(0);

  return (
    <div className="space-y-4">
      {/* Policy selector */}
      <div className="flex gap-2">
        {policies.map((p, i) => (
          <button
            key={p.title}
            onClick={() => setOpenPolicy(i)}
            className="flex items-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor:
                openPolicy === i ? `${p.color}18` : "transparent",
              color: openPolicy === i ? p.color : "var(--text-muted)",
              border: `1px solid ${openPolicy === i ? p.color + "40" : "var(--border-strong)"}`,
            }}
          >
            <p.icon size={13} className="mx-auto" />
            <span className="hidden md:inline">{p.title}</span>
          </button>
        ))}
      </div>

      {/* Policy content */}
      {policies[openPolicy] && (
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-strong)",
          }}
        >
          <div
            className="flex items-center gap-3 mb-4 pb-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${policies[openPolicy].color}18` }}
            >
              {(() => {
                const Icon = policies[openPolicy].icon;
                return (
                  <Icon
                    size={15}
                    style={{ color: policies[openPolicy].color }}
                  />
                );
              })()}
            </div>
            <div>
              <h3
                className="font-bold text-base"
                style={{ color: "var(--text-primary)" }}
              >
                {policies[openPolicy].title}
              </h3>
              <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                Last updated: {RELEASE_DATE}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {policies[openPolicy].content.map((section) => (
              <div key={section.heading}>
                <h4
                  className="text-sm font-bold mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.heading}
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── FAQ Tab ─────────────────────────────────────────────── */
const FAQTab = ({ isDark }) => {
  const faqs = [
    {
      question: "Is my data private? Can others see it?",
      answer:
        "Absolutely private. Each user's data is isolated by their account. Other regular users cannot access your data. Only admin accounts can view aggregate statistics — never your private diary entries or personal notes.",
    },
    {
      question: "How do I change my password or email?",
      answer:
        "Currently you can update your profile details from the Profile page (accessible via the top-right menu). For password resets, contact support via the Contact tab.",
    },
    {
      question: "Can I export my data?",
      answer:
        "Data export is on the roadmap! For now, you can contact support to request a JSON export of your data.",
    },
    {
      question: "Why isn't the Admin Panel showing for me?",
      answer:
        "The Admin Panel is only visible to users with admin privileges. If you should have admin access, contact the developer.",
    },
    {
      question: "Can I use Hustum on mobile?",
      answer:
        "Hustum is fully responsive and works on mobile browsers. A dedicated mobile app is planned for a future release.",
    },
    {
      question: "My data disappeared after logging out. Why?",
      answer:
        "Your data is stored in the cloud and tied to your account. Make sure you're logging in with the same email address. If the issue persists, contact support.",
    },
    {
      question: "How are activity scores calculated in the Admin leaderboard?",
      answer:
        "Activity scores are weighted sums: Todos (×2), Diary (×2), Improvement (×3), Life Goals (×3), Research (×2), with Habits, Weekly Goals, and Ratings at ×1 each.",
    },
    {
      question: "What does the 'Improvement' module do?",
      answer:
        "The Improvement module is a daily reflection tool — it lets you log areas where you lacked today, where you can improve, and what went well. It's one of the most powerful tools for self-growth in Hustum.",
    },
    {
      question: "How do I report a bug or request a feature?",
      answer:
        "Use the Contact tab above! Select 'Bug Report' or 'Feature Request', fill in the details and hit Send. The developer reads every message personally.",
    },
    {
      question: "Is Hustum free?",
      answer:
        "Yes, Hustum is completely free to use. It was built as a personal project and is shared as a gift to anyone building a better version of themselves.",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2">
        <FaQuestionCircle size={14} style={{ color: "#6366f1" }} />
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Frequently Asked Questions
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-bold"
          style={{ backgroundColor: "#6366f115", color: "#6366f1" }}
        >
          {faqs.length}
        </span>
      </div>
      {faqs.map((faq, i) => (
        <Accordion
          key={i}
          question={faq.question}
          answer={faq.answer}
          isDark={isDark}
        />
      ))}
    </div>
  );
};

/* ─── Main SupportPanel ───────────────────────────────────── */
const TABS = [
  { id: "contact", label: "Contact", icon: FaEnvelope, color: "#6366f1" },
  { id: "about", label: "About", icon: FaUser, color: "#8b5cf6" },
  { id: "policies", label: "Policies", icon: FaShieldAlt, color: "#10b981" },
  { id: "faq", label: "FAQ", icon: FaQuestionCircle, color: "#f59e0b" },
];

const SupportPanel = ({ onClose }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("contact");

  const panelBg = isDark ? "rgba(11,17,32,0.98)" : "rgba(255,255,255,0.98)";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed left-0 right-0 z-50"
        style={{
          top: 64,
          background: panelBg,
          borderBottom: "1px solid var(--border-strong)",
          boxShadow: isDark
            ? "0 24px 60px rgba(0,0,0,0.7)"
            : "0 24px 60px rgba(0,0,0,0.18)",
          maxHeight: "calc(100vh - 64px)",
          overflowY: "auto",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                }}
              >
                <FaHeart size={14} className="text-white" />
              </div>
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Help & Support
                </h2>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  Contact support · About Hustum · Policies · FAQ
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                color: "var(--text-muted)",
                background: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.09)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.05)")
              }
            >
              <FaTimes size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="inline-flex gap-1 p-1 rounded-xl mb-5"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
            }}
          >
            {TABS.map((t) => (
              <TabBtn
                key={t.id}
                active={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                icon={t.icon}
                label={t.label}
                color={t.color}
              />
            ))}
          </div>

          {/* Tab content */}
          <div className="pb-6">
            {activeTab === "contact" && <ContactTab isDark={isDark} />}
            {activeTab === "about" && <AboutTab isDark={isDark} />}
            {activeTab === "policies" && <PoliciesTab />}
            {activeTab === "faq" && <FAQTab isDark={isDark} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportPanel;
