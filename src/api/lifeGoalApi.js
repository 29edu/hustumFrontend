const API_URL = "https://hustumbackend.onrender.com/api/life-goals";

export const lifeGoalApi = {
  // ── Goals ──────────────────────────────────────────
  getGoals: async (userId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, v);
    });
    const url = params.toString()
      ? `${API_URL}/${userId}?${params}`
      : `${API_URL}/${userId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch life goals");
    return res.json();
  },

  getStats: async (userId) => {
    const res = await fetch(`${API_URL}/${userId}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  createGoal: async (data) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create goal");
    return res.json();
  },

  updateGoal: async (id, data) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update goal");
    return res.json();
  },

  deleteGoal: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete goal");
    return res.json();
  },

  // ── Steps ──────────────────────────────────────────
  addStep: async (goalId, title, notes = "") => {
    const res = await fetch(`${API_URL}/${goalId}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, notes }),
    });
    if (!res.ok) throw new Error("Failed to add step");
    return res.json();
  },

  toggleStep: async (goalId, stepId) => {
    const res = await fetch(`${API_URL}/${goalId}/steps/${stepId}/toggle`, {
      method: "PUT",
    });
    if (!res.ok) throw new Error("Failed to toggle step");
    return res.json();
  },

  deleteStep: async (goalId, stepId) => {
    const res = await fetch(`${API_URL}/${goalId}/steps/${stepId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete step");
    return res.json();
  },

  // ── Milestones ─────────────────────────────────────
  addMilestone: async (goalId, title, targetDate = null) => {
    const res = await fetch(`${API_URL}/${goalId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, targetDate }),
    });
    if (!res.ok) throw new Error("Failed to add milestone");
    return res.json();
  },

  toggleMilestone: async (goalId, milestoneId) => {
    const res = await fetch(
      `${API_URL}/${goalId}/milestones/${milestoneId}/toggle`,
      { method: "PUT" },
    );
    if (!res.ok) throw new Error("Failed to toggle milestone");
    return res.json();
  },

  deleteMilestone: async (goalId, milestoneId) => {
    const res = await fetch(`${API_URL}/${goalId}/milestones/${milestoneId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete milestone");
    return res.json();
  },

  // ── Reflections ────────────────────────────────────
  addReflection: async (goalId, text, mood = "neutral") => {
    const res = await fetch(`${API_URL}/${goalId}/reflections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mood }),
    });
    if (!res.ok) throw new Error("Failed to add reflection");
    return res.json();
  },

  deleteReflection: async (goalId, reflectionId) => {
    const res = await fetch(
      `${API_URL}/${goalId}/reflections/${reflectionId}`,
      { method: "DELETE" },
    );
    if (!res.ok) throw new Error("Failed to delete reflection");
    return res.json();
  },
};
