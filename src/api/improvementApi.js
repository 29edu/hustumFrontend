const BASE_URL = "http://localhost:5000/api/improvement";

export const improvementApi = {
  getAllEntries: async () => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch improvement entries");
    return res.json();
  },

  createEntry: async (data) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create entry");
    return res.json();
  },

  updateEntry: async (id, data) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update entry");
    return res.json();
  },

  deleteEntry: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete entry");
    return res.json();
  },
};
