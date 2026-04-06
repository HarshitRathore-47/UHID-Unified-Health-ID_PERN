import apiClient from "../api/apiClient";

const extractData = (response) => {
  if (!response.data.success) {
    throw new Error(response.data.message || "Something went wrong");
  }
  return response.data.data;
};

const adminService = {
  login: async (email, password) => {
    const res = await apiClient.post("/admin/login", { email, password });
    return extractData(res);
  },
  logout: async () => {
    const res = await apiClient.post("/admin/logout");
    return extractData(res);
  },
  getDashboard: async () => {
    const res = await apiClient.get("/admin/dashboard");
    return extractData(res);
  },
  getAnalytics: async (filters) => {
    const params = new URLSearchParams();
    if (filters.year !== "all") params.append("year", filters.year);
    if (filters.month !== "all") params.append("month", filters.month);
    if (filters.gender !== "all") params.append("gender", filters.gender);
    if (filters.age !== "all") params.append("age", filters.age);
    const res = await apiClient.get(`/admin/analytics?${params.toString()}`);
    return extractData(res);
  },
  getPendingDoctors: async (params) => {
    const res = await apiClient.get("/admin/doctors", { params });
    return extractData(res);
  },
  getDoctorDetails: async (id) => {
    const res = await apiClient.get(`/admin/doctors/${id}`);
    return extractData(res);
  },
  approveDoctor: async (id) => {
    const res = await apiClient.put(`/admin/doctors/${id}/approve`);
    return extractData(res);
  },
  rejectDoctor: async (id, reason) => {
    const res = await apiClient.put(`/admin/doctors/${id}/reject`, { reason });
    return extractData(res);
  },
  getAuditLogs: async (params) => {
    const res = await apiClient.get("/admin/audit-logs", { params });
    return extractData(res);
  },
  getDoctorDocument: async (docId) => {
    const res = await apiClient.get(`/admin/documents/${docId}`);
    return extractData(res);
  },

  // adminService.js

  getNotifications: async () => {
    const res = await apiClient.get("/admin/notifications");
    return extractData(res);
  },

  getUnreadCount: async () => {
    const res = await apiClient.get("/admin/notifications/unread-count");
    return extractData(res);
  },

  markNotificationRead: async (id) => {
    const res = await apiClient.patch(`/admin/notifications/${id}/read`);
    return extractData(res);
  },

  markAllRead: async () => {
    const res = await apiClient.patch(`/admin/notifications/readAll`);
    return extractData(res);
  },

  deleteNotification: async (id) => {
    const res = await apiClient.delete(`/admin/notifications/${id}`);
    return extractData(res);
  },

  clearRead: async () => {
    const res = await apiClient.delete("/admin/notifications/clear-read");
    return extractData(res);
  },

};

export default adminService;
