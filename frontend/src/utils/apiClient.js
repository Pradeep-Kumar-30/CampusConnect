import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to attach the JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    // Handle both { success: true, data } and direct data responses
    return response.data;
  },
  (error) => {
    // Handle errors consistently
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred";

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });
  }
);

export default api;
