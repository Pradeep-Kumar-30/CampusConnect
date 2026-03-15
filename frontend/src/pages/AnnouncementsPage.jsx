import React, { useEffect, useState } from "react";
import api from "../utils/apiClient";
import { useAuth } from "../state/AuthContext";
import { socket } from "../utils/socket";
import { SkeletonList } from "../components/Skeleton";

const AnnouncementsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
    isUrgent: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const canPost = user && (user.role === "faculty" || user.role === "admin");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/announcements");
        const data = response.data || response;
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load announcements");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onNew = (ann) => {
      setItems((prev) => [ann, ...prev]);
    };
    socket.on("newAnnouncement", onNew);
    return () => {
      socket.off("newAnnouncement", onNew);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/announcements", form);
      const newAnn = response.data || response;
      setItems((prev) => [newAnn, ...prev]);
      setForm({ title: "", body: "", isUrgent: false });
      socket.emit("sendAnnouncement", {
        ...newAnn,
        createdBy: user._id,
      });
    } catch (err) {
      alert(err.message || "Failed to post announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-2">
      <div>
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Announcements</h2>
          {error && (
            <div
              style={{
                color: "#fecaca",
                background: "#7f1d1d",
                padding: "0.5rem",
                borderRadius: 4,
                fontSize: "0.85rem",
                marginBottom: 8,
              }}
            >
              {error}
            </div>
          )}
          <div style={{ maxHeight: 430, overflowY: "auto" }}>
            {loading ? (
              <SkeletonList count={3} height="2rem" />
            ) : items.length === 0 ? (
              <div style={{ fontSize: "0.85rem" }}>No announcements yet.</div>
            ) : (
              items.map((a) => (
                <div
                  key={a._id}
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid #111827",
                    fontSize: "0.85rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{a.title}</span>
                    {a.isUrgent && (
                      <span className="pill badge-urgent">Urgent</span>
                    )}
                  </div>
                  <div>{a.body}</div>
                  <div style={{ color: "#9ca3af", marginTop: 2 }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>Post announcement</h3>
          {canPost ? (
            <form onSubmit={handleSubmit}>
              <label style={{ fontSize: "0.8rem" }}>
                Title
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </label>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "block",
                  marginTop: 6,
                }}
              >
                Body
                <textarea
                  className="textarea"
                  rows={3}
                  value={form.body}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, body: e.target.value }))
                  }
                  required
                />
              </label>
              <label
                style={{
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 6,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.isUrgent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isUrgent: e.target.checked }))
                  }
                />
                Mark as urgent
              </label>
              <button
                type="submit"
                className="btn"
                disabled={submitting}
                style={{ marginTop: 10 }}
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </form>
          ) : (
            <div style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              Only faculty and admins can post announcements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;

