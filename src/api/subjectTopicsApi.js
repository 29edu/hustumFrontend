const API_BASE = "http://localhost:5000/api/subject-topics";

export const subjectTopicsApi = {
  getSubjects: async (userId) => {
    const res = await fetch(`${API_BASE}/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch subjects");
    return res.json();
  },

  createSubject: async (data) => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create subject");
    return res.json();
  },

  deleteSubject: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete subject");
    return res.json();
  },

  updateSubjectColor: async (id, color) => {
    const res = await fetch(`${API_BASE}/${id}/color`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color }),
    });
    if (!res.ok) throw new Error("Failed to update color");
    return res.json();
  },

  addSection: async (subjectId, name) => {
    const res = await fetch(`${API_BASE}/${subjectId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to add section");
    return res.json();
  },

  deleteSection: async (subjectId, sectionId) => {
    const res = await fetch(`${API_BASE}/${subjectId}/sections/${sectionId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete section");
    return res.json();
  },

  addTopic: async (subjectId, sectionId, topicData) => {
    const res = await fetch(
      `${API_BASE}/${subjectId}/sections/${sectionId}/topics`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topicData),
      }
    );
    if (!res.ok) throw new Error("Failed to add topic");
    return res.json();
  },

  deleteTopic: async (subjectId, sectionId, topicId) => {
    const res = await fetch(
      `${API_BASE}/${subjectId}/sections/${sectionId}/topics/${topicId}`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error("Failed to delete topic");
    return res.json();
  },
};
