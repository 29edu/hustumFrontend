const API_URL = "http://localhost:5000/api/diary";

export const diaryApi = {
  async getAllDiaries() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch diary entries");
    return response.json();
  },

  async getDiaryById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch diary entry");
    return response.json();
  },

  async createDiary(title, content) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (!response.ok) throw new Error("Failed to create diary entry");
    return response.json();
  },

  async updateDiary(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update diary entry");
    return response.json();
  },

  async deleteDiary(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete diary entry");
    return response.json();
  },
};
