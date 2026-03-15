import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import IiitbhLogo from "../assets/IiitbhLogo";
import TickerBar from "./TickerBar";
import api from "../utils/apiClient";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?._id) {
      fetchUnreadCount();
      // Refresh unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/notifications/unread/count");
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error("Fetch unread count error:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    "nav-link" + (isActive ? " active" : "");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="branding-block">
          <IiitbhLogo size={38} />
        </div>
        <div className="user-block">
          <button 
            onClick={() => navigate("/profile")}
            className="hover:opacity-75 transition text-left w-full"
          >
            <div className="user-name text-base font-semibold hover:underline">
              {user?.name}
            </div>
            <div className="pill user-meta text-xs">
              {user?.role} · {user?.department}
            </div>
          </button>
        </div>
        <nav>
          <NavLink to="/" end className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/institute" className={navClass}>
            IIIT Bhagalpur
          </NavLink>
          <NavLink to="/notes" className={navClass}>
            Notes & Files
          </NavLink>
          <NavLink to="/forum" className={navClass}>
            Discussion Forum
          </NavLink>
          <NavLink to="/messages" className={navClass}>
            Messaging
          </NavLink>
          <NavLink to="/announcements" className={navClass}>
            Announcements
          </NavLink>
          <NavLink to="/notifications" className={navClass}>
            <span className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
          </NavLink>
        </nav>
        <button
          className="btn btn-secondary"
          style={{ marginTop: "1.5rem", width: "100%" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>
      <main className="content">
        <TickerBar />
        {children}
      </main>
    </div>
  );
};

export default Layout;

