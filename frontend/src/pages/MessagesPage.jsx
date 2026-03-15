import React, { useEffect, useState } from "react";
import api from "../utils/apiClient";
import { useAuth } from "../state/AuthContext";
import ChatPanel from "../components/ChatPanel";
import { socket } from "../utils/socket";

const MessagesPage = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState("department");
  const [departmentHistory, setDepartmentHistory] = useState([]);
  const [directHistory, setDirectHistory] = useState([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [targetUser, setTargetUser] = useState(null);

  const [deptLoading, setDeptLoading] = useState(false);
  const [deptError, setDeptError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      if (user.department) {
        setDeptLoading(true);
        setDeptError(null);
        try {
          const res = await api.get(`/messages/department/${user.department}`);
          // api client may unwrap data automatically
          const arr = Array.isArray(res) ? res : res.data || [];
          setDepartmentHistory(arr);
        } catch (err) {
          setDeptError(err.message || "Failed to load department messages");
          setDepartmentHistory([]);
        } finally {
          setDeptLoading(false);
        }
      }
    };
    load();
  }, [user]);

  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState(null);

  useEffect(() => {
    if (!user || !targetUserId) return;
    const load = async () => {
      setDirectLoading(true);
      setDirectError(null);
      try {
        const res = await api.get(`/messages/direct/${targetUserId}`);
        const arr = Array.isArray(res) ? res : res.data || [];
        setDirectHistory(arr);
      } catch (err) {
        setDirectError(err.message || "Failed to load direct messages");
        setDirectHistory([]);
      } finally {
        setDirectLoading(false);
      }
    };
    load();
  }, [user, targetUserId]);

  useEffect(() => {
    const onDept = (msg) => {
      setDepartmentHistory((prev) => [...prev, msg]);
    };
    const onDirect = (msg) => {
      setDirectHistory((prev) => [...prev, msg]);
    };
    socket.on("newDepartmentMessage", onDept);
    socket.on("newDirectMessage", onDirect);
    return () => {
      socket.off("newDepartmentMessage", onDept);
      socket.off("newDirectMessage", onDirect);
    };
  }, []);

  const handleLoadDirect = async () => {
    if (!targetUserId) return;
    try {
      const res = await api.get(`/messages/direct/${targetUserId}`);
      const arr = Array.isArray(res) ? res : res.data || [];
      setDirectHistory(arr);
      const any = arr[0];
      if (any) {
        const other = any.from._id === user._id ? any.to : any.from;
        setTargetUser(other);
      } else {
        setTargetUser({ _id: targetUserId, name: "User " + targetUserId });
      }
    } catch (err) {
      alert(err.message || "Failed to load conversation");
    }
  };

  return (
    <div className="grid grid-2">
      <div>
        <div className="card">
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Messaging</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => setMode("department")}
            >
              Department channel
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setMode("direct")}
            >
              Direct messages
            </button>
          </div>
          {(mode === "department" && deptError) || (mode === "direct" && directError) ? (
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
              {mode === "department" ? deptError : directError}
            </div>
          ) : null}
          {mode === "department" ? (
            <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
              This is a shared channel for your department (
              <strong>{user.department}</strong>) over LAN.
            </p>
          ) : (
            <div style={{ fontSize: "0.85rem" }}>
              <div style={{ marginBottom: 6 }}>
                Enter the user ID you want to chat with (for demo).
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="input"
                  placeholder="Target user ID"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                />
                <button className="btn btn-secondary" onClick={handleLoadDirect}>
                  Load
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="card" style={{ height: 400, position: "relative" }}>
          {mode === "department" ? (
            deptLoading ? (
              <div style={{ padding: "1rem", fontSize: "0.85rem" }}>
                Loading department messages...
              </div>
            ) : (
              <ChatPanel
                mode="department"
                currentUser={user}
                department={user.department}
                history={departmentHistory}
              />
            )
          ) : directLoading ? (
            <div style={{ padding: "1rem", fontSize: "0.85rem" }}>
              Loading conversation...
            </div>
          ) : (
            <ChatPanel
              mode="direct"
              currentUser={user}
              targetUser={targetUser}
              history={directHistory}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

