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
      <header className="top-banner">
        <div className="banner-left">
          <IiitbhLogo size={40} />
        </div>
        <div className="banner-center">
          <div className="banner-title-hindi">
            भारतीय सूचना प्रौद्योगिकी संस्थान भागलपुर
          </div>
          <div className="banner-title-eng">
            INDIAN INSTITUTE OF INFORMATION TECHNOLOGY BHAGALPUR
          </div>
          <div className="banner-subtitle">(An Institute of National Importance under Act of Parliament)</div>
        </div>
        <div className="banner-right">
          <AzadiLogo />
        </div>
      </header>

      <nav className="main-nav">
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

      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-headline">Computer Centre Cum Library Building</div>
          <div className="hero-subtext">
            A central hub for digital learning, resources and college collaboration.
          </div>
        </div>
      </section>

      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

