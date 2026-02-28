const API_URL = `${import.meta.env.VITE_API_URL}/api/studies`;

export const studyApi = {
  // Get all study entries with optional filters
  getAllStudies: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.date) params.append("date", filters.date);
    if (filters.category && filters.category !== "all") {
      params.append("category", filters.category);
    }
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const url = params.toString() ? `${API_URL}?${params}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch study entries");
    return response.json();
  },

  // Get a single study entry by ID
  getStudyById: async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch study entry");
    return response.json();
  },

  // Create a new study entry
  createStudy: async (studyData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studyData),
    });
    if (!response.ok) throw new Error("Failed to create study entry");
    return response.json();
  },

  // Update a study entry
  updateStudy: async (id, updates) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update study entry");
    return response.json();
  },

  // Delete a study entry
  deleteStudy: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete study entry");
    return response.json();
  },

  // Get study statistics
  getStudyStats: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const url = params.toString()
      ? `${API_URL}/stats/summary?${params}`
      : `${API_URL}/stats/summary`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch study statistics");
    return response.json();
  },
};
