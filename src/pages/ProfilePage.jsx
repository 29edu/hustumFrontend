import { useState, useEffect } from "react";
import { profileApi } from "../api/profileApi";

const ProfilePage = ({ user, onProfileUpdate }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile(user.email);
      setProfile(data);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber || "");
      setProfilePic(data.profilePic || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updated = await profileApi.updateProfile(user.email, {
        email,
        phoneNumber,
        profilePicFile,
      });
      setProfile(updated);
      setProfilePicFile(null);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleSendOTP = async () => {
    try {
      const result = await profileApi.sendOTP(user.email, email);
      setOtpSent(true);
      setOtpMessage(result.message + (result.otp ? ` OTP: ${result.otp}` : ""));
      alert("OTP sent to your email!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      await profileApi.verifyOTP(user.email, otp, newPassword);
      alert("Password changed successfully!");
      setShowPasswordChange(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpSent(false);
      setOtpMessage("");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP. Please check the code and try again.");
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div
        className="h-[calc(100vh-4rem)] flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4" style={{ color: "var(--text-muted)" }}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[calc(100vh-4rem)] overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

          {/* Profile Card */}
          <div
            className="rounded-2xl shadow-xl p-8 mb-6"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Profile Picture Section */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.name}
                </h2>
                <p className="text-gray-600">Manage your profile information</p>
              </div>
            </div>

            {/* Profile Information Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
              >
                Update Profile
              </button>
            </div>
          </div>

          {/* Password Change Section */}
          <div
            className="rounded-2xl shadow-xl p-8"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Change Password
            </h2>

            {!showPasswordChange ? (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-6">
                {!otpSent ? (
                  <>
                    <p className="text-gray-600">
                      We'll send a verification code to your email address to
                      confirm your identity.
                    </p>
                    <button
                      onClick={handleSendOTP}
                      className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Send OTP to Email
                    </button>
                  </>
                ) : (
                  <>
                    {otpMessage && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                        {otpMessage}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleVerifyOTP}
                        className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordChange(false);
                          setOtpSent(false);
                          setOtp("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setOtpMessage("");
                        }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
