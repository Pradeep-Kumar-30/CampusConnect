import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick login buttons for demo
  const quickLogin = async (user) => {
    setIdentifier(user.identifier);
    setPassword(user.password);
    setError("");
    setLoading(true);
    try {
      await login(user.identifier, user.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "2rem", gap: "2rem", animation: "fadeIn 0.6s ease-out" }}>
      <div className="login-hero">
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", background: "linear-gradient(to right, #0ea5e9, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IIIT Bhagalpur Campus Intranet</h1>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#cbd5e1" }}>
          Share notes, collaborate in forums, and chat in real time — all inside
          the campus network, even when internet is down.
        </p>
        <ul style={{ listStyle: "none", padding: 0, color: "#94a3b8" }}>
          <li>Offline‑first access over Wi‑Fi / LAN</li>
          <li>Department wise channels and discussion threads</li>
          <li>Secure role‑based login for students and faculty</li>
        </ul>
      </div>
      <div className="card login-card">
        <h2 style={{ marginTop: 0, marginBottom: "0.5rem", color: "#f8fafc" }}>Welcome Back</h2>
        <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
          Use your college email or roll number.
        </p>
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          <label style={{ fontSize: "0.85rem", color: "#e2e8f0", fontWeight: "500" }}>
            Email or Roll Number
            <input
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g., admin@iiitbh.intranet or ADMIN001"
              required
            />
          </label>
          <label style={{ display: "block", fontSize: "0.85rem", color: "#e2e8f0", fontWeight: "500", marginTop: 12 }}>
            Password
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>
          {error && (
            <div
              style={{
                color: "#fecaca",
                background: "#7f1d1d",
                padding: "0.6rem",
                borderRadius: 8,
                fontSize: "0.8rem",
                marginTop: 8,
              }}
            >
              ⚠️ {error}
            </div>
          )}
          <button type="submit" className="btn full-width" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #334155" }}>
          <p style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Demo credentials (for testing):
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                quickLogin({
                  identifier: "admin@iiitbh.intranet",
                  password: "admin123",
                })
              }
              disabled={loading}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                quickLogin({
                  identifier: "faculty@iiitbh.intranet",
                  password: "faculty123",
                })
              }
              disabled={loading}
            >
              Faculty
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                quickLogin({
                  identifier: "student@iiitbh.intranet",
                  password: "student123",
                })
              }
              disabled={loading}
            >
              Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
