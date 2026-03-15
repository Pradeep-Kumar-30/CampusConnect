import React, { useEffect, useState } from "react";
import api from "../utils/apiClient";
import { SkeletonList } from "../components/Skeleton";

const ForumPage = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newThread, setNewThread] = useState({
    title: "",
    body: "",
    tags: "",
  });
  const [selected, setSelected] = useState(null);
  const [creatingThread, setCreatingThread] = useState(false);

  const fetchThreads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/forum/threads");
      const data = response.data || response;
      setThreads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load threads");
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const createThread = async (e) => {
    e.preventDefault();
    setCreatingThread(true);
    try {
      const payload = {
        title: newThread.title,
        body: newThread.body,
        tags: newThread.tags
          ? newThread.tags.split(",").map((t) => t.trim())
          : [],
      };
      const response = await api.post("/forum/threads", payload);
      setNewThread({ title: "", body: "", tags: "" });
      await fetchThreads();
    } catch (err) {
      alert(err.message || "Failed to create thread");
    } finally {
      setCreatingThread(false);
    }
  };

  return (
    <div className="grid grid-2">
      <div>
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Discussion Forum</h2>
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
            ) : threads.length === 0 ? (
              <div style={{ fontSize: "0.85rem" }}>No threads yet.</div>
            ) : (
              threads.map((t) => (
                <div
                  key={t._id}
                  style={{
                    padding: "0.5rem 0",
                    borderBottom: "1px solid #111827",
                    cursor: "pointer",
                    opacity: selected?._id === t._id ? 1 : 0.8,
                  }}
                  onClick={() => setSelected(t)}
                >
                  <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                    {t.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      marginTop: 2,
                    }}
                  >
                    {t.tags?.map((tag) => (
                      <span key={tag} className="pill" style={{ marginRight: 4 }}>
                        #{tag}
                      </span>
                    ))}
                    <span style={{ marginLeft: 8, opacity: 0.7 }}>
                      {t.comments?.length || 0} comments
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>New thread</h3>
          <form onSubmit={createThread}>
            <label style={{ fontSize: "0.8rem" }}>
              Title
              <input
                className="input"
                value={newThread.title}
                onChange={(e) =>
                  setNewThread((x) => ({ ...x, title: e.target.value }))
                }
                required
              />
            </label>
            <label
              style={{
                fontSize: "0.8rem",
                marginTop: 6,
                display: "block",
              }}
            >
              Body
              <textarea
                className="textarea"
                rows={3}
                value={newThread.body}
                onChange={(e) =>
                  setNewThread((x) => ({ ...x, body: e.target.value }))
                }
                required
              />
            </label>
            <label
              style={{
                fontSize: "0.8rem",
                marginTop: 6,
                display: "block",
              }}
            >
              Tags (comma separated)
              <input
                className="input"
                value={newThread.tags}
                onChange={(e) =>
                  setNewThread((x) => ({ ...x, tags: e.target.value }))
                }
              />
            </label>
            <button
              type="submit"
              className="btn"
              disabled={creatingThread}
              style={{ marginTop: 10 }}
            >
              {creatingThread ? "Creating..." : "Post"}
            </button>
          </form>
        </div>
        <div className="card" style={{ marginTop: 10 }}>
          <ThreadDetail thread={selected} onUpdate={fetchThreads} />
        </div>
      </div>
    </div>
  );
};

const ThreadDetail = ({ thread, onUpdate }) => {
  const [full, setFull] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!thread?._id) {
      setFull(null);
      return;
    }
    setLoading(true);
    const load = async () => {
      try {
        const response = await api.get(`/forum/threads/${thread._id}`);
        setFull(response.data || response);
      } catch (err) {
        console.error("Failed to load thread:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [thread]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!full || !comment.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post(`/forum/threads/${full._id}/comments`, {
        body: comment,
      });
      setFull(response.data || response);
      setComment("");
    } catch (err) {
      alert(err.message || "Failed to comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!thread) {
    return (
      <div style={{ fontSize: "0.85rem" }}>Select a thread to view details.</div>
    );
  }

  const t = full || thread;

  return (
    <div>
      <h3 style={{ marginTop: 0, marginBottom: 4 }}>{t.title}</h3>
      <p style={{ fontSize: "0.85rem" }}>{t.body}</p>
      <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
        {t.tags?.map((tag) => (
          <span key={tag} className="pill" style={{ marginRight: 4 }}>
            #{tag}
          </span>
        ))}
      </div>
      <h4 style={{ marginTop: 10, marginBottom: 4, fontSize: "0.9rem" }}>
        Comments ({t.comments?.length || 0})
      </h4>
      <div
        style={{
          maxHeight: 150,
          overflowY: "auto",
          marginBottom: 6,
          fontSize: "0.8rem",
        }}
      >
        {loading ? (
          <div style={{ fontSize: "0.85rem" }}>Loading...</div>
        ) : t.comments?.length ? (
          t.comments.map((c) => (
            <div
              key={c._id}
              style={{ borderBottom: "1px solid #111827", padding: "0.3rem 0" }}
            >
              <div>{c.body}</div>
              <div style={{ color: "#6b7280" }}>
                {c.author?.name} ·{" "}
                {new Date(c.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        ) : (
          <div>No comments yet.</div>
        )}
      </div>
      <form onSubmit={addComment}>
        <input
          className="input"
          placeholder="Add a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          className="btn"
          disabled={submitting || !comment.trim()}
          style={{ marginTop: 6 }}
        >
          {submitting ? "Posting..." : "Comment"}
        </button>
      </form>
    </div>
  );
};

export default ForumPage;

