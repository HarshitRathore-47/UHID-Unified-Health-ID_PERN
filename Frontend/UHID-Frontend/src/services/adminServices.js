import apiClient from "../api/apiClient";

const extractData = (response) => {
  if (!response.data.success) {
    throw new Error(response.data.message || "Something went wrong");
  }
  return response.data.data;
};

const adminService = {
  login(email, password) {
    return apiClient.post("/admin/login", { email, password });
  },
  logout(email, password) {
    return apiClient.post("/admin/logout");
  },
  getDashboard: () => {
    return apiClient.get("/admin/dashboard");
  },
  getAnalytics(filters) {
    const params = new URLSearchParams();

    if (filters.year !== "all") params.append("year", filters.year);

    if (filters.month !== "all") params.append("month", filters.month);

    if (filters.gender !== "all") params.append("gender", filters.gender);

    if (filters.age !== "all") params.append("age", filters.age);

    return apiClient.get(`/admin/analytics?${params.toString()}`);
  },

  getPendingDoctors: (params) => {
    return apiClient.get("/admin/doctors", { params });
  },

  getDoctorDetails: (id) => {
    return apiClient.get(`/admin/doctors/${id}`);
  },

  approveDoctor: (id) => {
    return apiClient.put(`/admin/doctors/${id}/approve`);
  },

  rejectDoctor: (id, reason) => {
    return apiClient.put(`/admin/doctors/${id}/reject`, { reason });
  },

  getAuditLogs: (params) => {
    return apiClient.get("/admin/audit-logs", { params });
  },
  getDoctorDocument(docId) {
    return apiClient.get(`/admin/documents/${docId}`);
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
