import { useState } from "react";
import { authApi } from "../../api/authApi";

// ─── Step indicators ───────────────────────────────────────────────────────────
const Steps = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {["Email", "OTP", "Done"].map((label, i) => {
      const step = i + 1;
      const active = current === step;
      const done = current > step;
      return (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={{
                background:
                  done || active
                    ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                    : "var(--input-bg)",
                color: done || active ? "#fff" : "var(--text-muted)",
                border: "2px solid",
                borderColor:
                  done || active ? "transparent" : "var(--border-strong)",
              }}
            >
              {done ? "✓" : step}
            </div>
            <span
              className="text-xs font-medium"
              style={{
                color: active ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {label}
            </span>
          </div>
          {i < 2 && (
            <div
              className="w-8 h-0.5 mb-4"
              style={{
                backgroundColor: done ? "#3b82f6" : "var(--border-strong)",
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Main Login component ──────────────────────────────────────────────────────
const Login = ({ onLogin, onSwitchToRegister, onBackToLanding }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot-password state
  const [forgotMode, setForgotMode] = useState(false);
  const [fpStep, setFpStep] = useState(1); // 1=email, 2=otp+newpw, 3=success
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpConfirmPw, setFpConfirmPw] = useState("");
  const [fpError, setFpError] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSuccess, setFpSuccess] = useState("");

  // ── Login submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(formData);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // ── Forgot password: Step 1 — send OTP ────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFpError("");
    if (!fpEmail.trim()) return setFpError("Please enter your email.");
    setFpLoading(true);
    try {
      await authApi.forgotPassword({ email: fpEmail.trim() });
      setFpStep(2);
    } catch (err) {
      setFpError(err.message || "Failed to send OTP. Try again.");
    } finally {
      setFpLoading(false);
    }
  };

  // ── Forgot password: Step 2 — verify OTP & reset ──────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFpError("");
    if (!fpOtp.trim()) return setFpError("Please enter the OTP.");
    if (fpOtp.trim().length !== 6) return setFpError("OTP must be 6 digits.");
    if (!fpNewPw) return setFpError("Please enter a new password.");
    if (fpNewPw.length < 6)
      return setFpError("Password must be at least 6 characters.");
    if (fpNewPw !== fpConfirmPw) return setFpError("Passwords do not match.");
    setFpLoading(true);
    try {
      await authApi.resetPassword({
        email: fpEmail.trim(),
        otp: fpOtp.trim(),
        newPassword: fpNewPw,
      });
      setFpStep(3);
      setFpSuccess("Password reset successfully! You can now log in.");
    } catch (err) {
      setFpError(err.message || "Password reset failed.");
    } finally {
      setFpLoading(false);
    }
  };

  const resetForgotFlow = () => {
    setForgotMode(false);
    setFpStep(1);
    setFpEmail("");
    setFpOtp("");
    setFpNewPw("");
    setFpConfirmPw("");
    setFpError("");
    setFpSuccess("");
  };

  const inputStyle = {
    backgroundColor: "var(--input-bg)",
    border: "1.5px solid var(--border-strong)",
    color: "var(--text-primary)",
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD VIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (forgotMode) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="w-full max-w-md">
          <button
            onClick={resetForgotFlow}
            className="flex items-center gap-1 text-sm mb-6 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back to login
          </button>
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
              Hustum
            </h1>
            <p style={{ color: "var(--text-muted)" }}>Reset your password</p>
          </div>
          <div
            className="rounded-2xl shadow-xl p-8"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <Steps current={fpStep} />

            {/* Step 1 – Enter email */}
            {fpStep === 1 && (
              <>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Enter your email
                </h2>
                <p
                  className="text-sm mb-5"
                  style={{ color: "var(--text-muted)" }}
                >
                  We'll send a 6-digit OTP to your registered email.
                </p>
                {fpError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                    {fpError}
                  </div>
                )}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={fpEmail}
                      onChange={(e) => {
                        setFpEmail(e.target.value);
                        setFpError("");
                      }}
                      required
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={inputStyle}
                      placeholder="Enter your registered email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={fpLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {fpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending OTP...
                      </span>
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 2 – Enter OTP + new password */}
            {fpStep === 2 && (
              <>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Enter OTP & new password
                </h2>
                <p
                  className="text-sm mb-5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Check <strong>{fpEmail}</strong> for the 6-digit OTP (expires
                  in 10 min).
                </p>
                {fpError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                    {fpError}
                  </div>
                )}
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      OTP Code
                    </label>
                    <input
                      type="text"
                      value={fpOtp}
                      onChange={(e) => {
                        setFpOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setFpError("");
                      }}
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all text-center text-2xl font-bold tracking-widest"
                      style={inputStyle}
                      placeholder="000000"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      value={fpNewPw}
                      onChange={(e) => {
                        setFpNewPw(e.target.value);
                        setFpError("");
                      }}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={inputStyle}
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={fpConfirmPw}
                      onChange={(e) => {
                        setFpConfirmPw(e.target.value);
                        setFpError("");
                      }}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                      style={inputStyle}
                      placeholder="Repeat new password"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={fpLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {fpLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setFpStep(1);
                      setFpOtp("");
                      setFpNewPw("");
                      setFpConfirmPw("");
                      setFpError("");
                    }}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Didn't receive OTP? Resend
                  </button>
                </div>
              </>
            )}

            {/* Step 3 – Success */}
            {fpStep === 3 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Password Reset!
                </h2>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--text-muted)" }}
                >
                  {fpSuccess}
                </p>
                <button
                  onClick={resetForgotFlow}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NORMAL LOGIN VIEW
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="w-full max-w-md">
        {/* Back to landing */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1 text-sm mb-6 hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back to home
          </button>
        )}
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
            Hustum
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Welcome back! Please login to continue.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl shadow-xl p-8"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Login
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={inputStyle}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={inputStyle}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full"
                style={{ borderTop: "1px solid var(--border-strong)" }}
              />
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-4 text-sm"
                style={{
                  backgroundColor: "var(--card-bg)",
                  color: "var(--text-faint)",
                }}
              >
                Or
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Don't have an account?{" "}
              <button
                onClick={onSwitchToRegister}
                className="text-blue-500 hover:text-blue-600 font-semibold"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
