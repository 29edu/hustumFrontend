import { useState } from "react";

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await onRegister(formData);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
            Edison
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Create your account to get started.
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
            Register
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                id: "name",
                label: "Full Name",
                type: "text",
                placeholder: "",
              },
              {
                id: "email",
                label: "Email Address",
                type: "email",
                placeholder: "",
              },
              {
                id: "password",
                label: "Password",
                type: "password",
                placeholder: "Create a strong password",
              },
              {
                id: "confirmPassword",
                label: "Confirm Password",
                type: "password",
                placeholder: "Confirm your password",
              },
            ].map(({ id, label, type, placeholder }) => (
              <div key={id}>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  id={id}
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: "1.5px solid var(--border-strong)",
                    color: "var(--text-primary)",
                  }}
                  placeholder={placeholder}
                />
              </div>
            ))}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full"
                style={{ borderTop: "1px solid var(--border-strong)" }}
              />
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-4"
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
              Already have an account?{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-500 hover:text-blue-600 font-semibold"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
