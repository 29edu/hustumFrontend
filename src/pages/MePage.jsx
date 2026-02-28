import { useState } from "react";
import {
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaDownload,
  FaExternalLinkAlt,
  FaEye,
} from "react-icons/fa";

const MePage = () => {
  const [showResume, setShowResume] = useState(false);

  // Portfolio data - customize these with your actual information
  const portfolioData = {
    name: "Edison Priyadarshi",
    title: "Full Stack Developer",
    tagline: "Building exceptional digital experiences",
    email: "your.email@example.com",
    linkedin: "https://linkedin.com/in/yourprofile",
    github: "https://github.com/yourusername",
    resumeUrl: "/resume-sample.html", // Sample resume - replace with your actual PDF path

    skills: [
      "React",
      "Node.js",
      "JavaScript",
      "MongoDB",
      "Express",
      "Tailwind CSS",
      "Git",
      "REST APIs",
      "TypeScript",
      "Docker",
      "AWS",
      "Redux",
    ],

    projects: [
      {
        id: 1,
        title: "Task Management App",
        description:
          "A comprehensive productivity app with habit tracking, diary, and analytics",
        technologies: ["React", "Node.js", "MongoDB", "Express"],
        link: "https://github.com/yourusername/project1",
        image: "🎯",
      },
      {
        id: 2,
        title: "E-Commerce Platform",
        description:
          "Full-featured online store with payment integration and admin dashboard",
        technologies: ["React", "Redux", "Node.js", "Stripe"],
        link: "https://github.com/yourusername/project2",
        image: "🛒",
      },
      {
        id: 3,
        title: "Social Media Dashboard",
        description:
          "Analytics dashboard for social media metrics and engagement tracking",
        technologies: ["React", "Chart.js", "Firebase", "Tailwind"],
        link: "https://github.com/yourusername/project3",
        image: "📊",
      },
    ],
  };

  const handleDownloadResume = () => {
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = portfolioData.resumeUrl;
    link.download = "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewResume = () => {
    setShowResume(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                {portfolioData.name.charAt(0)}
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {portfolioData.name}
            </h1>
            <p className="text-2xl text-blue-600 font-semibold mb-3">
              {portfolioData.title}
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {portfolioData.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section
        className="py-16"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Skills
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Technologies I work with
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {portfolioData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-6 py-3 rounded-full text-base font-medium transition-all"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-strong)",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16" style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Featured Projects
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Some of my recent work
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioData.projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-7xl group-hover:scale-105 transition-transform">
                  {project.image}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group-hover:gap-3 transition-all"
                  >
                    View Project
                    <FaExternalLinkAlt size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Modal */}
      {showResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Resume</h3>
              <button
                onClick={() => setShowResume(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div
              className="p-6 overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 80px)" }}
            >
              <iframe
                src={portfolioData.resumeUrl}
                className="w-full h-[600px] border border-gray-200 rounded"
                title="Resume"
              >
                Your browser does not support PDFs.
                <a href={portfolioData.resumeUrl}>Download the PDF</a>
              </iframe>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-6">
            <h3 className="text-2xl font-bold">Let's Connect</h3>
            <div className="flex gap-6">
              <a
                href={portfolioData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <FaLinkedin size={20} />
                LinkedIn
              </a>
              <a
                href={portfolioData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                <FaGithub size={20} />
                GitHub
              </a>
              <a
                href={`mailto:${portfolioData.email}`}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
              >
                <FaEnvelope size={20} />
                Email
              </a>
            </div>
            <div className="border-t border-gray-700 pt-6 w-full text-center">
              <p className="text-gray-400">© 2024 {portfolioData.name}.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MePage;
