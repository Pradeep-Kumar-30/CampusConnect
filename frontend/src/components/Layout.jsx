import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import IiitbhLogo from "../assets/IiitbhLogo";
import TickerBar from "./TickerBar";
import api from "../utils/apiClient";

const AzadiLogo = () => (
  <div className="azadi-logo" aria-label="Azadi ka Amrit Mahotsav">
    <div className="azadi-icon">75</div>
    <div className="azadi-text">
      <div>Azadi ka</div>
      <div>Amrit Mahotsav</div>
    </div>
  </div>
);

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
      const res = await api.get("/notifications/unread/count");
      setUnreadCount(res.data?.unreadCount || res.unreadCount || 0);
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
      <header className="top-banner" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", textAlign: "center", padding: "1rem", gap: "1rem" }}>
        <div className="banner-left" style={{ display: "flex", justifyContent: "center" }}>
          <IiitbhLogo size={40} />
        </div>
        <div className="banner-center" style={{ flex: "1 1 300px" }}>
          <div className="banner-title-hindi">
            भारतीय सूचना प्रौद्योगिकी संस्थान भागलपुर
          </div>
          <div className="banner-title-eng">
            INDIAN INSTITUTE OF INFORMATION TECHNOLOGY BHAGALPUR
          </div>
          <div className="banner-subtitle">(An Institute of National Importance under Act of Parliament)</div>
        </div>
        <div className="banner-right" style={{ display: "flex", justifyContent: "center" }}>
          <AzadiLogo />
        </div>
      </header>

      <nav className="main-nav" style={{ display: "flex", overflowX: "auto", whiteSpace: "nowrap", padding: "0 1rem", WebkitOverflowScrolling: "touch", gap: "0.5rem" }}>
        <NavLink to="/" end className={navClass}>
          Home
        </NavLink>
        <NavLink to="/institute" className={navClass}>
          Institute
        </NavLink>
        <NavLink to="/announcements" className={navClass}>
          Announcements
        </NavLink>
        <NavLink to="/notes" className={navClass}>
          Notes
        </NavLink>
        <NavLink to="/forum" className={navClass}>
          Forum
        </NavLink>
        <NavLink to="/messages" className={navClass}>
          Messages
        </NavLink>
        <NavLink to="/notifications" className={navClass}>
          Notifications
          {unreadCount > 0 && (
            <span className="nav-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </NavLink>
      </nav>

      <div className="ticker-wrapper">
        <TickerBar />
      </div>

      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
