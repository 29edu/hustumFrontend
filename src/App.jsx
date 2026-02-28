import { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/common/Navbar";
import MePage from "./pages/MePage";
import StudyMaterialPage from "./pages/StudyMaterialPage";
import TrackerPage from "./pages/TrackerPage";
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
import ImprovementPage from "./pages/ImprovementPage";
import ResearchPage from "./pages/ResearchPage";
import LifeGoalsPage from "./pages/LifeGoalsPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { profileApi } from "./api/profileApi";

function AppContent() {
  const { isAuthenticated, user, login, register, logout } = useAuth();
  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem("activeSection") || "dashboard",
  );
  const [activeSubject, setActiveSubject] = useState(null);
  const [profilePic, setProfilePic] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => localStorage.getItem("isSidebarOpen") === "true",
  );

  // Persist sidebar state across refreshes
  useEffect(() => {
    localStorage.setItem("isSidebarOpen", isSidebarOpen);
  }, [isSidebarOpen]);

  // Persist active section across refreshes
  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

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
    logout();
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
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
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
          style={{ backgroundColor: "var(--bg-base)" }}
        >
          {activeSection === "me" && <MePage />}
          {activeSection === "tracker" && <TrackerPage />}
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
          {activeSection === "rating" && <RatingPage />}
          {activeSection === "profile" && (
            <ProfilePage user={user} onProfileUpdate={fetchProfilePic} />
          )}
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
