import axios from "axios";

// Vite exposes env vars via import.meta.env. Accept either VITE_API_URL or VITE_API_BASE_URL.
// Normalize values so the final base URL always includes the '/api' segment.
const _rawApiBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";
const API_BASE_URL = (() => {
  try {
    let u = String(_rawApiBase).trim().replace(/\/+$/, ""); // remove trailing slashes
    if (!u.endsWith("/api")) u = `${u}/api`;
    return u;
  } catch (err) {
    // If parsing env fails, fallback to default API URL
    console.error("Error parsing API base URL:", err);
    return "http://localhost:8080/api";
  }
})();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach Authorization header from either admin token or user token
api.interceptors.request.use((config) => {
  try {
    // Check for admin token first, then user token
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("token");
    const token = adminToken || userToken;
    
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Error attaching auth token:", err);
  }
  return config;
});

// Handle 401 responses - only redirect for auth-related endpoints
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized - Token invalid or expired");
      
      // Only redirect to login for GET requests or auth endpoints
      // Don't redirect for order/payment operations — let the calling code handle those
      const url = error.config?.url || "";
      const method = (error.config?.method || "").toUpperCase();
      const isAuthEndpoint = url.includes("/login") || url.includes("/register") || url.includes("/auth");
      const isDataFetch = method === "GET";
      
      if (isDataFetch || isAuthEndpoint) {
        const isAdminPage = window.location.pathname.includes('/admin') || 
                           window.location.pathname.includes('/superadmin');
        
        if (isAdminPage) {
          localStorage.removeItem("admin");
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
