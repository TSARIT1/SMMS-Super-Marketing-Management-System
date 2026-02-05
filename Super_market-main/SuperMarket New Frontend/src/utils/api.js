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

// Handle 401 responses by redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized - Token invalid or expired");
      
      // Check if we're on an admin or user page
      const isAdminPage = window.location.pathname.includes('/admin') || 
                         window.location.pathname.includes('/superadmin');
      
      if (isAdminPage) {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminToken");
        console.log("Redirecting to admin login...");
        window.location.href = "/admin/login";
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        console.log("Redirecting to user login...");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// --- Fallback mocks when backend is unreachable ---
const MOCK_FALLBACKS = {
  '/subscription-plans/active': () => ([{ id: 1, planName: 'Demo Plan', price: 0, durationDays: 30, status: 'ACTIVE', maxProducts: -1, maxUsers: 5, description: 'Mock active plan' }]),
  '/subscription': () => ({ planName: 'Demo Plan', expires: null }),
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // network error (no response) -> return a mock if appropriate
    if (error && error.config && !error.response) {
      const url = String(error.config.url || '');
      // normalize path (strip base if present)
      const path = url.startsWith(API_BASE_URL) ? url.slice(API_BASE_URL.length) : url;
      for (const key of Object.keys(MOCK_FALLBACKS)) {
        if (path.endsWith(key) || path === key) {
          return Promise.resolve({ data: MOCK_FALLBACKS[key](), status: 200, config: error.config });
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
