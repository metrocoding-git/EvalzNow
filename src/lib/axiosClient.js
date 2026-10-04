import axios from "axios";
import { logout } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Example: Add token if available
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Session expired / revoked / invalid on the server -> sign out everywhere.
    // (Public account calls such as login return 401 for a wrong password - ignored.)
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isPublicAccountCall = /\/account\/?(recover|reset-password)?$/.test(url.split("?")[0]);
    if (status === 401 && !isPublicAccountCall && typeof window !== "undefined") {
      logout();
    }

    console.error("API Error:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return Promise.reject(error.response?.data || error.message);}
);

export default api; 