import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:3000",
  withCredentials: true, // important for cookies
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRoute = err.config?.url?.includes("/admin/login");
    if (err.response?.status === 401 && !isLoginRoute ) {
      localStorage.removeItem("role");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;