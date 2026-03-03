const API_URL = `${import.meta.env.VITE_API_URL}/api/notifications`;

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const notificationApi = {
  /** Fetch all active notifications for the logged-in user */
  async getNotifications(token) {
    const res = await fetch(API_URL, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json(); // { notifications, unreadCount }
  },

  /** Mark a single notification as read */
  async markAsRead(token, id) {
    const res = await fetch(`${API_URL}/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to mark as read");
    return res.json();
  },

  /** Mark ALL notifications as read */
  async markAllAsRead(token) {
    const res = await fetch(`${API_URL}/read-all`, {
      method: "PATCH",
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to mark all as read");
    return res.json();
  },

  /* ── Admin only ──────────────────────────── */

  /** Get all notifications (admin) */
  async getAllAdmin(token) {
    const res = await fetch(`${API_URL}/admin`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch admin notifications");
    return res.json();
  },

  /** Create a notification (admin) */
  async create(token, data) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create notification");
    return res.json();
  },

  /** Update a notification (admin) */
  async update(token, id, data) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update notification");
    return res.json();
  },

  /** Delete / deactivate a notification (admin) */
  async remove(token, id) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to delete notification");
    return res.json();
  },
};
