import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setError(null);
        const response = await api.get("/auth/me");
        const userData = response.data || response;
        setUser(userData);
      } catch (err) {
        // Expected when user is not logged in
        if (err.status !== 401) {
          setError(err.message);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (identifier, password) => {
    try {
      setError(null);
      const response = await api.post("/auth/login", { identifier, password });
      const data = response.data || response;
      setUser(data.user || data);
      return data.user || data;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore logout errors
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

