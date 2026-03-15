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
    <div className="login-shell">
      <div className="login-hero">
        <h1>IIIT Bhagalpur Campus Intranet</h1>
        <p>
          Share notes, collaborate in forums, and chat in real time — all inside
          the campus network, even when internet is down.
        </p>
        <ul>
          <li>Offline‑first access over Wi‑Fi / LAN</li>
          <li>Department wise channels and discussion threads</li>
          <li>Secure role‑based login for students and faculty</li>
        </ul>
      </div>
      <div className="card login-card">
        <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Sign in</h2>
        <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
          Use your college email or roll number.
        </p>
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          <label style={{ fontSize: "0.8rem" }}>
            Email or Roll Number
            <input
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g., admin@iiitbh.intranet or ADMIN001"
              required
            />
          </label>
          <label style={{ display: "block", fontSize: "0.8rem", marginTop: 8 }}>
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
                padding: "0.4rem 0.6rem",
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

        <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #374151" }}>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 0, marginBottom: 10 }}>
            Demo credentials (for testing):
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 6 }}>
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

