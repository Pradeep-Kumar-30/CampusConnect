import React, { useEffect, useRef, useState } from "react";
import { socket } from "../utils/socket";

const ChatPanel = ({
  mode, // "department" | "direct"
  currentUser,
  targetUser,
  department,
  history,
}) => {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    if (mode === "department" && department) {
      socket.emit("joinDepartment", department);
    }

    if (mode === "direct" && currentUser._id) {
      socket.emit("joinDirect", currentUser._id);
    }
  }, [mode, department, currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const handleSend = () => {
    if (!text.trim()) return;

    const payload =
      mode === "department"
        ? {
            from: currentUser._id,
            department,
            text,
          }
        : {
            from: currentUser._id,
            to: targetUser?._id,
            text,
          };

    if (mode === "department") {
      socket.emit("sendDepartmentMessage", payload);
    } else {
      socket.emit("sendDirectMessage", payload);
    }

    setText("");
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {(history || []).map((m) => {
          const senderId =
            typeof m.from === "object" ? m.from._id : m.from;

          const senderName =
            typeof m.from === "object"
              ? m.from.name
              : senderId === currentUser._id
              ? currentUser.name
              : "User";

          const isMe = senderId === currentUser._id;

          return (
            <div
              key={m._id}
              className={`chat-bubble ${isMe ? "me" : "other"}`}
            >
              {/* Show sender name only in department mode & not for self */}
              {mode === "department" && !isMe && (
                <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                  {senderName}
                </div>
              )}

              <div>{m.text}</div>

              {/* WhatsApp Style Tick System */}
              {isMe && (
                <div
                  style={{
                    fontSize: "0.7rem",
                    opacity: 0.6,
                    textAlign: "right",
                    marginTop: 2,
                  }}
                >
                  {m.status === "seen"
                    ? "✔✔"
                    : m.status === "delivered"
                    ? "✔✔"
                    : "✔"}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          className="input"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button className="btn" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;

