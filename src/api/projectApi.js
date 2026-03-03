const API_URL = `${import.meta.env.VITE_API_URL}/api/projects`;

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const projectApi = {
  // ── Projects ──────────────────────────────────────────
  getProjects: async (userId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, v);
    });
    const url = params.toString()
      ? `${API_URL}/${userId}?${params}`
      : `${API_URL}/${userId}`;
    const res = await fetch(url, { headers: authHeader() });
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  },

  getStats: async (userId) => {
    const res = await fetch(`${API_URL}/${userId}/stats`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to fetch project stats");
    return res.json();
  },

  createProject: async (data) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create project");
    return res.json();
  },

  updateProject: async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update project");
    return res.json();
  },

  deleteProject: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to delete project");
    return res.json();
  },

  // ── Features ──────────────────────────────────────────
  addFeature: async (projectId, data) => {
    const res = await fetch(`${API_URL}/${projectId}/features`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add feature");
    return res.json();
  },

  updateFeature: async (projectId, featureId, data) => {
    const res = await fetch(`${API_URL}/${projectId}/features/${featureId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update feature");
    return res.json();
  },

  deleteFeature: async (projectId, featureId) => {
    const res = await fetch(`${API_URL}/${projectId}/features/${featureId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to delete feature");
    return res.json();
  },

  // ── Future Goals ──────────────────────────────────────
  addFutureGoal: async (projectId, data) => {
    const res = await fetch(`${API_URL}/${projectId}/future-goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add future goal");
    return res.json();
  },

  deleteFutureGoal: async (projectId, goalId) => {
    const res = await fetch(`${API_URL}/${projectId}/future-goals/${goalId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to delete future goal");
    return res.json();
  },

  // ── Update Logs ───────────────────────────────────────
  addLog: async (projectId, data) => {
    const res = await fetch(`${API_URL}/${projectId}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add log");
    return res.json();
  },

  deleteLog: async (projectId, logId) => {
    const res = await fetch(`${API_URL}/${projectId}/logs/${logId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to delete log");
    return res.json();
  },

  // ── Tech Stack ────────────────────────────────────────
  addTech: async (projectId, data) => {
    const res = await fetch(`${API_URL}/${projectId}/tech-stack`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add tech");
    return res.json();
  },

  deleteTech: async (projectId, techId) => {
    const res = await fetch(`${API_URL}/${projectId}/tech-stack/${techId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Failed to delete tech");
    return res.json();
  },
};
