import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NotesPage from "./pages/NotesPage";
import ForumPage from "./pages/ForumPage";
import MessagesPage from "./pages/MessagesPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import InstitutePage from "./pages/InstitutePage";
import UserProfilePage from "./pages/UserProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import Layout from "./components/Layout";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/institute" element={<InstitutePage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/forum" element={<ForumPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

