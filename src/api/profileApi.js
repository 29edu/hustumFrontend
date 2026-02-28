const API_URL = `${import.meta.env.VITE_API_URL}/api/profile`;

export const profileApi = {
  async getProfile(userId) {
    const response = await fetch(`${API_URL}/${encodeURIComponent(userId)}`);
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  },

  async updateProfile(userId, data) {
    const formData = new FormData();

    if (data.email) formData.append("email", data.email);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.profilePicFile) formData.append("profilePic", data.profilePicFile);

    const response = await fetch(`${API_URL}/${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },

  async sendOTP(userId, email) {
    const response = await fetch(`${API_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email }),
    });
    if (!response.ok) throw new Error("Failed to send OTP");
    return response.json();
  },

  async verifyOTP(userId, otp, newPassword) {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, otp, newPassword }),
    });
    if (!response.ok) throw new Error("Failed to verify OTP");
    return response.json();
  },
};
