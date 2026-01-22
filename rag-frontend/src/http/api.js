import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL
    ? `${import.meta.env.VITE_BASE_URL}/api`
    : "http://localhost:5050/api",
  withCredentials: true, // VERY important for cookie auth
});
let isRefreshing = false;
let queue = [];

const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
];
function resolveQueue(error, response = null) {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(response);
  });

  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;                                 
    // const status = error.response?.status;
    const backendError = error.response?.data;
    const url = originalRequest?.url || "";

    // If not unauthorized → throw error
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
 // 🚫 Skip refresh for auth routes
    if (AUTH_ROUTES.some((route) => url.includes(route))) {
      return Promise.reject(error);
    }

    // 🚫 Skip refresh for invalid login attempts
    if (backendError?.message === "Invalid credentials") {
      return Promise.reject(error);
    }
    // Ignore 401 from the refresh endpoint itself to prevent infinite loop
    if (originalRequest.url === "/auth/refresh") {
      return Promise.reject(error);
    }

    // Prevent infinite loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If a refresh request is already happening → wait
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    isRefreshing = true;

    try {
      // Call backend refresh endpoint
      await api.post("/auth/refresh");

      isRefreshing = false;
      resolveQueue(null, true);

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      resolveQueue(refreshError, null);

      console.error("Refresh token expired → logging out");
      // No token clearing needed, backend controls cookies
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  }
);

export default api;
