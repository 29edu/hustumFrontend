import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/common/Navbar";
import PomodoroPage from "./pages/PomodoroPage";
import StudyMaterialPage from "./pages/StudyMaterialPage";
import DashboardPage from "./pages/DashboardPage";
import AnalysisPage from "./pages/AnalysisPage";
import DiaryPage from "./pages/DiaryPage";
import HabitPage from "./pages/HabitPage";
import WeeklyGoalsPage from "./pages/WeeklyGoalsPage";
import TopicsPage from "./pages/TopicsPage";
import SubjectDetailPage from "./pages/SubjectDetailPage";
import ProfilePage from "./pages/ProfilePage";
import RatingPage from "./pages/RatingPage";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import ImprovementPage from "./pages/ImprovementPage";
import ResearchPage from "./pages/ResearchPage";
import LifeGoalsPage from "./pages/LifeGoalsPage";
import AdminDashboard from "./pages/AdminDashboard";
import LibraryPage from "./pages/LibraryPage";
import ProjectsPage from "./pages/ProjectsPage";
import ChallengePage from "./pages/ChallengePage";
import ChatPage from "./pages/ChatPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { profileApi } from "./api/profileApi";

function AppContent() {
  const { isAuthenticated, user, login, register, logout } = useAuth();
  // null = show landing, "login"/"register" = show auth form
  const [authView, setAuthView] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [activeSubject, setActiveSubject] = useState(null);
  const [profilePic, setProfilePic] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => localStorage.getItem("isSidebarOpen") === "true",
  );

  // Persist sidebar state across refreshes
  useEffect(() => {
    localStorage.setItem("isSidebarOpen", isSidebarOpen);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfilePic();
    }
  }, [isAuthenticated, user]);

  const fetchProfilePic = async () => {
    try {
      const profile = await profileApi.getProfile(user.email);
      if (profile.profilePic) {
        setProfilePic(profile.profilePic);
      }
    } catch (error) {
      console.error("Error fetching profile pic:", error);
    }
  };

  const handleLogin = async (credentials) => {
    const data = await login(credentials);
    setActiveSection("dashboard");
    return data;
  };

  const handleRegister = async (credentials) => {
    const data = await register(credentials);
    setActiveSection("dashboard");
    return data;
  };

  const handleLogout = () => {
    localStorage.removeItem("activeSection");
    setAuthView(null);
    logout();
  };

  if (!isAuthenticated) {
    if (!authView) {
      return <LandingPage onShowAuth={(view) => setAuthView(view)} />;
    }
    return (
      <AuthPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        initialView={authView}
        onBackToLanding={() => setAuthView(null)}
      />
    );
  }

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        backgroundColor: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        profilePic={profilePic}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isSidebarOpen ? "md:ml-64" : "ml-0"
          }`}
          style={{ backgroundColor: "var(--bg-base)" }}
        >
          {activeSection === "pomodoro" && <PomodoroPage />}
          {activeSection === "study" && <StudyMaterialPage />}
          {activeSection === "dashboard" && <DashboardPage user={user} />}
          {activeSection === "analysis" && <AnalysisPage />}
          {activeSection === "habit" && <HabitPage user={user} />}
          {activeSection === "weekly-goals" && <WeeklyGoalsPage />}
          {activeSection === "topics" && (
            <TopicsPage
              onOpenSubject={(id) => {
                setActiveSubject(id);
                setActiveSection("subject-detail");
              }}
            />
          )}
          {activeSection === "subject-detail" && activeSubject && (
            <SubjectDetailPage
              subjectId={activeSubject}
              onBack={() => {
                setActiveSection("topics");
                setActiveSubject(null);
              }}
            />
          )}
          {activeSection === "improvement" && <ImprovementPage />}
          {activeSection === "research" && <ResearchPage />}
          {activeSection === "life-goals" && <LifeGoalsPage />}
          {activeSection === "thoughts" && (
            <div
              className="min-h-full flex items-center justify-center"
              style={{ backgroundColor: "var(--bg-base)" }}
            >
              <div className="text-2xl" style={{ color: "var(--text-muted)" }}>
                Thoughts Section — Coming Soon
              </div>
            </div>
          )}
          {activeSection === "diary" && <DiaryPage />}
          {activeSection === "library" && <LibraryPage />}
          {activeSection === "projects" && <ProjectsPage />}
          {activeSection === "challenges" && <ChallengePage />}
          {activeSection === "chat" && <ChatPage user={user} />}
          {activeSection === "rating" && <RatingPage />}
          {activeSection === "profile" && (
            <ProfilePage user={user} onProfileUpdate={fetchProfilePic} />
          )}
          {activeSection === "admin" && user?.isAdmin && <AdminDashboard />}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
