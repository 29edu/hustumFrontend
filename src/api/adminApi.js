const BASE_URL = `${import.meta.env.VITE_API_URL}/api/admin`;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const handleRes = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Admin API error");
  return data;
};

export const adminApi = {
  getOverview: () =>
    fetch(`${BASE_URL}/overview`, { headers: authHeaders() }).then(handleRes),

  getUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/users${qs ? `?${qs}` : ""}`, {
      headers: authHeaders(),
    }).then(handleRes);
  },

  getUserDetail: (id) =>
    fetch(`${BASE_URL}/users/${id}`, { headers: authHeaders() }).then(
      handleRes,
    ),

  toggleAdmin: (id) =>
    fetch(`${BASE_URL}/users/${id}/toggle-admin`, {
      method: "PATCH",
      headers: authHeaders(),
    }).then(handleRes),

  deleteUser: (id) =>
    fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handleRes),

  getRecentActivity: () =>
    fetch(`${BASE_URL}/activity`, { headers: authHeaders() }).then(handleRes),

  getTopUsers: () =>
    fetch(`${BASE_URL}/top-users`, { headers: authHeaders() }).then(handleRes),
};
