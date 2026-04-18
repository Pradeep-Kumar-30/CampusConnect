import React, { useEffect, useState } from "react";
import api from "../utils/apiClient";
import { CardSkeleton, SkeletonList } from "../components/Skeleton";

const rawUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
const BACKEND_BASE = rawUrl.replace(/\/api\/?$/, "");

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0,
    hasMore: false,
  });
  const [filters, setFilters] = useState({
    branch: "",
    semester: "",
    subject: "",
    q: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchNotes = async (newOffset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: pagination.limit, offset: newOffset };
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const response = await api.get("/notes", { params });
      const data = response.data || response;

      // Handle both paginated and non-paginated responses
      if (data.pagination) {
        setNotes(data.data || data);
        setPagination(data.pagination);
      } else if (Array.isArray(data)) {
        setNotes(data);
      }
    } catch (err) {
      setError(err.message || "Failed to load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(0);
    // eslint-disable-next-line
  }, []);

  const handleChangeFilter = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleApplyFilters = () => {
    setPagination((p) => ({ ...p, offset: 0 }));
    fetchNotes(0);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    setUploading(true);
    setUploadError(null);

    try {
      await api.post("/notes", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      form.reset();
      await fetchNotes(0);
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 450px), 1fr))", 
        gap: "1.5rem" 
      }}
    >
      {/* LEFT SIDE */}
      <div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Notes & Files</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <input
              className="input"
              placeholder="Branch"
              name="branch"
              value={filters.branch}
              onChange={handleChangeFilter}
            />
            <input
              className="input"
              placeholder="Semester"
              name="semester"
              value={filters.semester}
              onChange={handleChangeFilter}
            />
            <input
              className="input"
              placeholder="Subject"
              name="subject"
              value={filters.subject}
              onChange={handleChangeFilter}
            />
            <input
              className="input"
              placeholder="Search text"
              name="q"
              value={filters.q}
              onChange={handleChangeFilter}
            />
          </div>

          <button className="btn btn-secondary" onClick={handleApplyFilters}>
            Apply Filters
          </button>

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
              {error}
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid #334155", background: "rgba(255,255,255,0.02)" }}>
             <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Recent Uploads</h3>
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto", padding: "0 1rem" }}>
          {loading ? (
            <SkeletonList count={3} height="2rem" />
          ) : notes.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No notes found for current filters.</div>
          ) : (
            notes.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: "1rem 0",
                  borderBottom: "1px solid #1e293b",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "0.95rem" }}>{n.title}</div>
                  <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 2 }}>
                    {n.branch} · Sem {n.semester} · {n.subject}
                  </div>
                </div>
                <div>
                  <a
                    href={`${BACKEND_BASE}${n.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pill"
                    style={{ background: "#0ea5e920", color: "#0ea5e9", border: "1px solid #0ea5e940", textDecoration: "none" }}
                  >
                    Download
                  </a>
                </div>
              </div>
            ))
          )}
          </div>
        </div>

        {/* Pagination Controls */}
        {pagination.total > 0 && (
          <div className="card" style={{ marginTop: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.85rem",
              }}
            >
              <span>
                Showing {pagination.offset + 1} to{" "}
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total
                )}{" "}
                of {pagination.total}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn btn-secondary"
                  disabled={pagination.offset === 0}
                  onClick={() => fetchNotes(Math.max(0, pagination.offset - pagination.limit))}
                >
                  ← Prev
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={!pagination.hasMore}
                  onClick={() => fetchNotes(pagination.offset + pagination.limit)}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div>
        <div className="card">
          <h3>Upload New Notes</h3>

          {uploadError && (
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
              {uploadError}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <input
              name="title"
              className="input"
              placeholder="Title"
              required
            />

            <textarea
              name="description"
              className="textarea"
              rows={2}
              placeholder="Description"
              style={{ marginTop: 6 }}
            />

            <input
              name="branch"
              className="input"
              placeholder="Branch"
              required
              style={{ marginTop: 6 }}
            />

            <input
              name="semester"
              type="number"
              min="1"
              max="10"
              className="input"
              placeholder="Semester"
              required
              style={{ marginTop: 6 }}
            />

            <input
              name="subject"
              className="input"
              placeholder="Subject"
              required
              style={{ marginTop: 6 }}
            />

            <input
              name="tags"
              className="input"
              placeholder="Tags (comma separated)"
              style={{ marginTop: 6 }}
            />

            <input
              type="file"
              name="file"
              required
              style={{ marginTop: 6 }}
            />

            <button
              type="submit"
              className="btn"
              disabled={uploading}
              style={{ marginTop: 10 }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
