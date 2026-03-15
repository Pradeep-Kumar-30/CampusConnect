import React, { useEffect, useState } from "react";
import api from "../utils/apiClient";
import { useAuth } from "../state/AuthContext";
import { SkeletonList, Skeleton } from "../components/Skeleton";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [notesRes, annsRes] = await Promise.all([
          api.get("/notes"),
          api.get("/announcements"),
        ]);

        const notesData = notesRes.data || notesRes;
        const annsData = annsRes.data || annsRes;

        const notesArray = Array.isArray(notesData) ? notesData : notesData.data || [];
        const annsArray = Array.isArray(annsData) ? annsData : annsData.data || [];

        setStats({
          notesCount: notesArray.length,
          announcementsCount: annsArray.length,
        });
      } catch (err) {
        setError(err.message || "Failed to load stats");
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-2">
      <div>
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: 4 }}>
            Welcome, {user?.name || "User"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            Offline-first campus network running on your local LAN.
          </p>
          {error && (
            <div
              style={{
                color: "#fecaca",
                background: "#7f1d1d",
                padding: "0.5rem",
                borderRadius: 4,
                fontSize: "0.85rem",
                marginTop: 8,
              }}
            >
              ⚠️ {error}
            </div>
          )}
          {loading ? (
            <div style={{ marginTop: "0.75rem" }}>
              <SkeletonList count={2} height="1.2rem" />
            </div>
          ) : stats ? (
            <div style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
              <div>
                Notes in system:{" "}
                <span className="pill">{stats.notesCount}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                Announcements:{" "}
                <span className="pill">{stats.announcementsCount}</span>
              </div>
            </div>
          ) : null}
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>How to use</h3>
          <ul style={{ fontSize: "0.85rem", color: "#9ca3af", paddingLeft: 18 }}>
            <li>Upload notes organized by branch, semester, and subject.</li>
            <li>Use the forum for Q&A and discussions.</li>
            <li>Chat in department channel or direct messages.</li>
            <li>Watch for urgent announcements from faculty/admin.</li>
          </ul>
        </div>
      </div>
      <div>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>Latest Announcements</h3>
          <LatestAnnouncements />
        </div>
      </div>
    </div>
  );
};

const LatestAnnouncements = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/announcements");
        const data = response.data || response;
        const annsArray = Array.isArray(data) ? data : data.data || [];
        setItems(annsArray.slice(0, 5));
      } catch (err) {
        setError(err.message || "Failed to load announcements");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return <SkeletonList count={3} height="2rem" />;
  }

  if (error) {
    return (
      <div style={{ fontSize: "0.85rem", color: "#fecaca" }}>
        Failed to load announcements
      </div>
    );
  }

  if (!items.length) {
    return <div style={{ fontSize: "0.85rem" }}>No announcements yet.</div>;
  }

  return (
    <div>
      {items.map((a) => (
        <div key={a._id} style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>{a.title}</span>
            {a.isUrgent && (
              <span className="pill badge-urgent" style={{ fontSize: "0.7rem" }}>
                Urgent
              </span>
            )}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
            {new Date(a.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardPage;

