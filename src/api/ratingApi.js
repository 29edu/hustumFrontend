const API_URL = "https://hustumbackend.onrender.com/api/ratings";

export const ratingApi = {
  // Upsert a rating entry
  async upsertRating(data) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to save rating");
    return response.json();
  },

  // Get all ratings for a specific date
  async getRatingsByDate(userId, date) {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(userId)}/${date}`,
    );
    if (!response.ok) throw new Error("Failed to fetch ratings");
    return response.json();
  },

  // Get history (last N days, optionally filtered by category)
  async getHistory(userId, days = 30, category = "") {
    const params = new URLSearchParams({ days });
    if (category) params.append("category", category);
    const response = await fetch(
      `${API_URL}/history/${encodeURIComponent(userId)}?${params}`,
    );
    if (!response.ok) throw new Error("Failed to fetch history");
    return response.json();
  },

  // Get averages per category
  async getAverages(userId, days = 30) {
    const response = await fetch(
      `${API_URL}/averages/${encodeURIComponent(userId)}?days=${days}`,
    );
    if (!response.ok) throw new Error("Failed to fetch averages");
    return response.json();
  },

  // Delete a rating
  async deleteRating(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete rating");
    return response.json();
  },
};
