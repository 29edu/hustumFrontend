const API_URL = `${import.meta.env.VITE_API_URL}/api/challenges`;

export const challengeApi = {
  async getChallenges(userId, archived = false) {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(userId)}?archived=${archived}`,
    );
    if (!response.ok) throw new Error("Failed to fetch challenges");
    return response.json();
  },

  async getChallengeById(id) {
    const response = await fetch(`${API_URL}/detail/${id}`);
    if (!response.ok) throw new Error("Failed to fetch challenge");
    return response.json();
  },

  async getStats(userId) {
    const response = await fetch(
      `${API_URL}/stats/${encodeURIComponent(userId)}`,
    );
    if (!response.ok) throw new Error("Failed to fetch stats");
    return response.json();
  },

  async createChallenge(data) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create challenge");
    return response.json();
  },

  async updateChallenge(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update challenge");
    return response.json();
  },

  async deleteChallenge(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete challenge");
    return response.json();
  },

  async toggleArchive(id) {
    const response = await fetch(`${API_URL}/${id}/archive`, {
      method: "PUT",
    });
    if (!response.ok) throw new Error("Failed to archive challenge");
    return response.json();
  },

  async logDay(id, { date, completed, note, mood }) {
    const response = await fetch(`${API_URL}/${id}/log`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, completed, note, mood }),
    });
    if (!response.ok) throw new Error("Failed to log day");
    return response.json();
  },
};
