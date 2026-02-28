const API_URL = `${import.meta.env.VITE_API_URL}/api/weekly-goals`;

export const weeklyGoalApi = {
  getGoals: async (userId, weekStart, weekEnd) => {
    const params = new URLSearchParams();
    if (weekStart) params.append("weekStart", weekStart);
    if (weekEnd) params.append("weekEnd", weekEnd);
    const url = params.toString()
      ? `${API_URL}/${userId}?${params}`
      : `${API_URL}/${userId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch weekly goals");
    return response.json();
  },

  createGoal: async (goalData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalData),
    });
    if (!response.ok) throw new Error("Failed to create weekly goal");
    return response.json();
  },

  updateGoal: async (id, updates) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update weekly goal");
    return response.json();
  },

  deleteGoal: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete weekly goal");
    return response.json();
  },

  addTopic: async (goalId, title) => {
    const response = await fetch(`${API_URL}/${goalId}/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error("Failed to add topic");
    return response.json();
  },

  toggleTopic: async (goalId, topicId) => {
    const response = await fetch(
      `${API_URL}/${goalId}/topics/${topicId}/toggle`,
      {
        method: "PUT",
      },
    );
    if (!response.ok) throw new Error("Failed to toggle topic");
    return response.json();
  },

  deleteTopic: async (goalId, topicId) => {
    const response = await fetch(`${API_URL}/${goalId}/topics/${topicId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete topic");
    return response.json();
  },
};
