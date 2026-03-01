import { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaCalendarCheck,
  FaChartLine,
  FaLightbulb,
  FaComment,
  FaBook,
  FaBullseye,
  FaSun,
  FaMoon,
  FaLayerGroup,
  FaStar,
  FaFlask,
  FaCompass,
  FaSlidersH,
  FaBookmark,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import SettingsPanel from "./SettingsPanel";
import LinksPanel from "./LinksPanel";

const Navbar = ({
  user,
  onLogout,
  activeSection,
  onSectionChange,
  profilePic,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);

  const handleNavClick = (section) => {
    if (onSectionChange) onSectionChange(section);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaHome },
    { id: "habit", label: "Habit", icon: FaCalendarCheck },
    { id: "weekly-goals", label: "Weekly Goals", icon: FaBullseye },
    { id: "topics", label: "Topics", icon: FaLayerGroup },
    { id: "improvement", label: "Improvement", icon: FaChartLine },
    { id: "research", label: "Research", icon: FaFlask },
    { id: "life-goals", label: "Life Goals", icon: FaCompass },
    { id: "analysis", label: "Analysis", icon: FaLightbulb },
    { id: "thoughts", label: "Thoughts", icon: FaComment },
    { id: "diary", label: "Diary", icon: FaBook },
    { id: "rating", label: "Ratings", icon: FaStar },
  ];

  const navLinks = [
    { id: "me", label: "Me" },
    { id: "tracker", label: "Tracker" },
    { id: "study", label: "Study Material" },
  ];

  return (
    <>
      {/* ── Top Nav ─────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50"
        style={{
          backgroundColor: "var(--nav-bg)",
          borderBottom: "1px solid var(--border)",
          boxShadow: isDark
            ? "0 1px 6px rgba(0,0,0,0.4)"
            : "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                title="Toggle menu"
              >
                <FaBars size={22} />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tight select-none">
                Hustum
              </h1>
            </div>

            {/* Centre Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map(({ id, label }) => {
                const active = activeSection === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleNavClick(id)}
                    className="relative py-1 text-sm font-medium transition-colors duration-200"
                    style={{
                      color: active ? "#3b82f6" : "var(--text-secondary)",
                    }}
                  >
                    {label}
                    <span
                      className="absolute bottom-0 left-0 h-0.5 rounded-full bg-blue-500 transition-all duration-200"
                      style={{ width: active ? "100%" : "0" }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Quick Links Button */}
              <button
                onClick={() => {
                  setLinksOpen((o) => !o);
                  setSettingsOpen(false);
                }}
                title="Quick Links"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative"
                style={{
                  backgroundColor: linksOpen
                    ? "var(--accent)"
                    : isDark
                      ? "#1e293b"
                      : "#f1f5f9",
                  border: linksOpen
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border-strong)",
                  boxShadow: linksOpen
                    ? "0 0 0 3px var(--accent-light)"
                    : "none",
                }}
              >
                <FaBookmark
                  size={14}
                  style={{ color: linksOpen ? "#fff" : "var(--text-muted)" }}
                />
              </button>

              {/* Settings Button */}
              <button
                onClick={() => {
                  setSettingsOpen((o) => !o);
                  setLinksOpen(false);
                }}
                title="Preferences"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all relative"
                style={{
                  backgroundColor: settingsOpen
                    ? "var(--accent)"
                    : isDark
                      ? "#1e293b"
                      : "#f1f5f9",
                  border: settingsOpen
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border-strong)",
                  boxShadow: settingsOpen
                    ? "0 0 0 3px var(--accent-light)"
                    : "none",
                }}
              >
                <FaSlidersH
                  size={14}
                  style={{ color: settingsOpen ? "#fff" : "var(--text-muted)" }}
                />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? "Light mode" : "Dark mode"}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                  border: "1px solid var(--border-strong)",
                }}
              >
                {isDark ? (
                  <FaSun size={14} className="text-yellow-400" />
                ) : (
                  <FaMoon size={14} className="text-indigo-500" />
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen((o) => !o)}
                  title={user?.name || "Profile"}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--bg-elevated)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </button>

                {profileDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    {/* Dropdown */}
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-50 p-4 flex flex-col gap-1"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-300"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-base">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span
                            className="text-sm font-semibold truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {user?.name || "User"}
                          </span>
                          <span
                            className="text-xs truncate"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {user?.email || ""}
                          </span>
                        </div>
                      </div>
                      <hr style={{ borderColor: "var(--border)" }} />
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleNavClick("profile");
                        }}
                        className="mt-1 text-left text-sm px-2 py-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--bg-elevated)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        Edit Profile
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Settings Panel ────────────────────────── */}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}

      {/* ── Links Panel ──────────────────────────── */}
      {linksOpen && <LinksPanel onClose={() => setLinksOpen(false)} />}

      {/* ── Sidebar ─────────────────────────────────── */}
      <div
        className="fixed left-0 top-16 h-[calc(100%-4rem)] w-64 z-40 transition-transform duration-300"
        style={{
          backgroundColor: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
          boxShadow: isSidebarOpen
            ? isDark
              ? "4px 0 24px rgba(0,0,0,0.5)"
              : "4px 0 24px rgba(0,0,0,0.1)"
            : "none",
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--text-faint)" }}
          >
            Navigation
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="py-2 overflow-y-auto h-[calc(100%-57px)]">
          {menuItems.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm transition-all duration-150"
                style={{
                  backgroundColor: active
                    ? isDark
                      ? "rgba(59,130,246,0.15)"
                      : "#eff6ff"
                    : "transparent",
                  color: active ? "#3b82f6" : "var(--text-secondary)",
                  borderLeft: `3px solid ${active ? "#3b82f6" : "transparent"}`,
                  fontWeight: active ? "600" : "400",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.backgroundColor =
                      "var(--bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Icon size={17} className="flex-shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
