const API_URL = "http://localhost:5000/api/habits";

export const habitApi = {
  async getHabits(userId, month) {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(userId)}/${month}`
    );
    if (!response.ok) throw new Error("Failed to fetch habits");
    return response.json();
  },

  async createHabit(userId, name, month) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, month }),
    });
    if (!response.ok) throw new Error("Failed to create habit");
    return response.json();
  },

  async updateHabit(id, name) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error("Failed to update habit");
    return response.json();
  },

  async toggleHabitDay(id, day) {
    const response = await fetch(`${API_URL}/${id}/toggle`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day }),
    });
    if (!response.ok) throw new Error("Failed to toggle habit day");
    return response.json();
  },

  async deleteHabit(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete habit");
    return response.json();
  },
};
