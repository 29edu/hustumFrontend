import { useState, useEffect } from "react";

const features = [
  {
    icon: "📊",
    title: "Dashboard",
    description:
      "A unified overview of your day — todos, habits, goals, and upcoming tasks at a glance.",
  },
  {
    icon: "⏱️",
    title: "Pomodoro Timer",
    description:
      "Stay laser-focused with customisable work/break intervals and session tracking.",
  },
  {
    icon: "📚",
    title: "Study Materials",
    description:
      "Organise notes, links, and resources by subject. Never lose important material again.",
  },
  {
    icon: "🔬",
    title: "Research Tracker",
    description:
      "Log research topics, sources, and findings in a structured, searchable format.",
  },
  {
    icon: "✅",
    title: "Habit Tracker",
    description:
      "Build streaks, break bad habits, and visualise your consistency over time.",
  },
  {
    icon: "🎯",
    title: "Weekly Goals",
    description:
      "Set and review weekly targets to keep your short-term momentum aligned with long-term vision.",
  },
  {
    icon: "🌟",
    title: "Life Goals",
    description:
      "Define what matters most. Track milestones for your career, health, relationships, and beyond.",
  },
  {
    icon: "📖",
    title: "Diary",
    description:
      "Write private daily reflections, thoughts, and memories in a clean, distraction-free editor.",
  },
  {
    icon: "📈",
    title: "Analysis & Insights",
    description:
      "Visualise your productivity trends with charts across habits, study time, and ratings.",
  },
  {
    icon: "🚀",
    title: "Projects",
    description:
      "Manage projects with tasks, deadlines, and progress tracking — from idea to completion.",
  },
  {
    icon: "📦",
    title: "Library",
    description:
      "A personal knowledge library for books, articles, and resources you want to revisit.",
  },
  {
    icon: "⬆️",
    title: "Improvement Log",
    description:
      "Record lessons learned, mistakes made, and action items so you grow from every experience.",
  },
  {
    icon: "⭐",
    title: "Rating System",
    description:
      "Rate your daily performance across multiple dimensions to stay honest with yourself.",
  },
  {
    icon: "👤",
    title: "Profile",
    description:
      "Personalise your account, upload a photo, and manage your preferences in one place.",
  },
];

export default function LandingPage({ onShowAuth }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = prev || "hidden";
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-lg backdrop-blur-md" : ""
        }`}
        style={{
          backgroundColor: scrolled ? "var(--bg-surface)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--border-color)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span
              className="text-xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              Hustom
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onShowAuth("login")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
              style={{
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-card)",
              }}
            >
              Log In
            </button>
            <button
              onClick={() => onShowAuth("register")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              style={{
                backgroundColor: "var(--accent)",
                color: "#fff",
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <div
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-widest"
          style={{
            backgroundColor: "var(--bg-card)",
            color: "var(--accent)",
            border: "1px solid var(--border-color)",
          }}
        >
          Your personal growth OS
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 max-w-4xl">
          Everything you need to{" "}
          <span style={{ color: "var(--accent)" }}>level up</span> your life
        </h1>

        <p
          className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Hustom brings your habits, goals, study sessions, projects, diary, and
          personal analytics into one beautifully minimal workspace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onShowAuth("register")}
            className="px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            Start for free →
          </button>
          <button
            onClick={() => onShowAuth("login")}
            className="px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
            }}
          >
            I already have an account
          </button>
        </div>

        {/* scroll indicator */}
        <div
          className="mt-16 animate-bounce"
          style={{ color: "var(--text-muted)" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Everything in one place</h2>
            <p className="text-lg" style={{ color: "var(--text-muted)" }}>
              14 powerful modules, all seamlessly connected.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-base font-semibold mb-1">{f.title}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-6">
        <div
          className="max-w-3xl mx-auto rounded-2xl p-12 text-center"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to take control?
          </h2>
          <p className="mb-8 text-lg" style={{ color: "var(--text-muted)" }}>
            Join Hustom and transform the way you track, plan, and grow.
          </p>
          <button
            onClick={() => onShowAuth("register")}
            className="px-10 py-4 rounded-xl text-base font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            Create your account →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-8 text-center text-sm border-t"
        style={{
          borderColor: "var(--border-color)",
          color: "var(--text-muted)",
        }}
      >
        © {new Date().getFullYear()} Hustom. Built for builders.
      </footer>
    </div>
  );
}
