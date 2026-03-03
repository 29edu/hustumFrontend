const API_URL = `${import.meta.env.VITE_API_URL}/api/chat`;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const chatApi = {
  // Get my chatId
  getMyChatId: async () => {
    const res = await fetch(`${API_URL}/my-chat-id`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to get chat ID");
    return res.json();
  },

  // Find a user by their chatId
  findUserByChatId: async (chatId) => {
    const res = await fetch(`${API_URL}/user/${chatId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "User not found");
    }
    return res.json();
  },

  // Get or create a conversation with another user
  getOrCreateConversation: async (otherUserId) => {
    const res = await fetch(`${API_URL}/conversation`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ otherUserId }),
    });
    if (!res.ok) throw new Error("Failed to get/create conversation");
    return res.json();
  },

  // Get all conversations for current user
  getConversations: async () => {
    const res = await fetch(`${API_URL}/conversations`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },

  // Get messages for a conversation
  getMessages: async (conversationId) => {
    const res = await fetch(`${API_URL}/messages/${conversationId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  },
};
