import { useState } from "react";
import {
  FaBook,
  FaFilePdf,
  FaVideo,
  FaLink,
  FaDownload,
  FaExternalLinkAlt,
} from "react-icons/fa";

const StudyMaterialPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Sample study materials - customize with your actual content
  const materials = [
    {
      id: 1,
      title: "JavaScript.info",
      description:
        "The Modern JavaScript Tutorial - Complete guide from basics to advanced concepts",
      category: "Web Development",
      type: "link",
      link: "https://javascript.info/",
      tags: ["JavaScript", "Tutorial", "Frontend"],
    },
    {
      id: 2,
      title: "React Fundamentals",
      description:
        "Complete guide to React basics, hooks, and component lifecycle",
      category: "Web Development",
      type: "pdf",
      link: "#",
      tags: ["React", "JavaScript", "Frontend"],
    },
    {
      id: 3,
      title: "Node.js Backend Development",
      description: "Building scalable REST APIs with Node.js and Express",
      category: "Web Development",
      type: "video",
      link: "#",
      tags: ["Node.js", "Express", "Backend"],
    },
    {
      id: 4,
      title: "LeetCode Practice",
      description:
        "Practice coding problems and prepare for technical interviews",
      category: "DSA",
      type: "link",
      link: "https://leetcode.com/u/edisonpriyadarshi12/",
      tags: ["DSA", "Algorithms", "Interview", "Practice"],
    },
    {
      id: 5,
      title: "Data Structures & Algorithms",
      description: "Essential DSA concepts with JavaScript implementations",
      category: "DSA",
      type: "pdf",
      link: "#",
      tags: ["DSA", "Algorithms", "JavaScript"],
    },
    {
      id: 6,
      title: "System Design Roadmap",
      description:
        "Complete roadmap for learning system design and architecture",
      category: "System Design",
      type: "link",
      link: "https://roadmap.sh/system-design",
      tags: ["System Design", "Architecture", "Backend"],
    },
    {
      id: 7,
      title: "System Design Interview",
      description: "Complete guide to cracking system design interviews",
      category: "System Design",
      type: "pdf",
      link: "#",
      tags: ["System Design", "Interview", "Architecture"],
    },
    {
      id: 8,
      title: "MongoDB Database Design",
      description: "NoSQL database design patterns and best practices",
      category: "Database",
      type: "pdf",
      link: "#",
      tags: ["MongoDB", "NoSQL", "Database"],
    },
    {
      id: 9,
      title: "AWS Cloud Essentials",
      description: "Introduction to AWS services and cloud deployment",
      category: "Cloud Computing",
      type: "video",
      link: "#",
      tags: ["AWS", "Cloud", "DevOps"],
    },
  ];

  const categories = ["all", ...new Set(materials.map((m) => m.category))];

  const filteredMaterials =
    selectedCategory === "all"
      ? materials
      : materials.filter((m) => m.category === selectedCategory);

  const getTypeIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FaFilePdf className="text-red-500" size={24} />;
      case "video":
        return <FaVideo className="text-purple-500" size={24} />;
      case "link":
        return <FaLink className="text-blue-500" size={24} />;
      default:
        return <FaBook className="text-gray-500" size={24} />;
    }
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Study Materials
          </h1>
          <p className="text-gray-600">
            Your personal learning resources library
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow"
              }`}
            >
              {category === "all" ? "All Materials" : category}
            </button>
          ))}
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="rounded-xl p-6 hover:shadow-xl transition-all duration-300 group flex flex-col"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                {getTypeIcon(material.type)}
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {material.category}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {material.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {material.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {material.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 mt-auto">
                <a
                  href={material.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  <FaExternalLinkAlt size={14} />
                  Open
                </a>
                <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
                  <FaDownload size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMaterials.length === 0 && (
          <div className="text-center py-20">
            <FaBook size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No materials found
            </h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMaterialPage;
