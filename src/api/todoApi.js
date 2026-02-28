const API_URL = "https://hustumbackend.onrender.com/api/todos";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const todoApi = {
  // Get all todos
  getAllTodos: async () => {
    const response = await fetch(API_URL, { headers: authHeaders() });
    if (!response.ok) throw new Error("Failed to fetch todos");
    return response.json();
  },

  // Create a new todo
  createTodo: async (todoData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(todoData),
    });
    if (!response.ok) throw new Error("Failed to create todo");
    return response.json();
  },

  // Update a todo
  updateTodo: async (id, updates) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update todo");
    return response.json();
  },

  // Delete a todo
  deleteTodo: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete todo");
    return response.json();
  },
};
