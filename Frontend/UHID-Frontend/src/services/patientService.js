import apiClient from "../api/apiClient";

const extractData = (response) => {
  if (!response.data.success) {
    throw new Error(response.data.message || "Something went wrong");
  }

  return response.data.data;
};

const patientService = {
  // First Registeration and Login

  registerPatient: async (formData) => {
    const response = await apiClient.post("/api/patients/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return extractData(response);
  },
  login: async (credentials) => {
    const response = await apiClient.post("/api/patients/login", credentials);
    return extractData(response);
  },
  sendOtp: async (payload) => {
    const response = await apiClient.post("/api/auth/send-otp", payload);
    return extractData(response);
  },
  verifyLoginOtp: async (payload) => {
    const response = await apiClient.post(
      "/api/auth/verify-login-otp",
      payload,
    );
    return extractData(response);
  },
  resendOtp: async (payload) => {
    const response = await apiClient.post("/api/auth/resend-otp", payload);
    return extractData(response);
  },
  logout: async () => {
    const response = await apiClient.post("/api/patients/logout");
    return extractData(response);
  },

  // Then Data
  getDashboardData: async () => {
    const response = await apiClient.get("/api/patients/dashboard");
    return extractData(response);
  },

  getHealthProfile: async () => {
    const response = await apiClient.get("/api/patients/health-profile");
    return extractData(response);
  },

  updateHealthProfile: async (profileData) => {
    const response = await apiClient.put(
      "/api/patients/health-profile",
      profileData,
    );
    return extractData(response);
  },
  uploadProfilePhoto: async (formData) => {
    const response = await apiClient.post(
      "/api/patients/upload-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return extractData(response);
  },

  getLabReports: async (options = {}) => {
    const response = await apiClient.get("/api/patients/lab-reports", {
      params: options,
    });
    return extractData(response);
  },

  getLabReportDetails: async (reportId) => {
    const response = await apiClient.get(
      `/api/patients/lab-reports/${reportId}`,
    );
    return extractData(response);
  },

  getTreatments: async (options = {}) => {
    const response = await apiClient.get("/api/patients/treatments", {
      params: options,
    });
    return extractData(response);
  },

  getDiets: async (options = {}) => {
    const response = await apiClient.get("/api/patients/diets", {
      params: options,
    });
    return extractData(response);
  },

  getPrescriptions: async (options = {}) => {
    const response = await apiClient.get("/api/patients/prescriptions", {
      params: options,
    });
    return extractData(response);
  },

  getVaccinationHistory: async () => {
    const response = await apiClient.get("/api/patients/vaccinations");
    return extractData(response);
  },

  getVisitHistory: async (options = {}) => {
    const response = await apiClient.get("/api/patients/visit-history", {
      params: options,
    });
    return extractData(response);
  },

  getConsents: async (options = {}) => {
    const response = await apiClient.get("/api/patients/consents", {
      params: options,
    });
    return extractData(response);
  },
  acceptConsent: async (id) => {
    const response = await apiClient.post("/consents/accept", {
      Id: id,
    });
    return extractData(response);
  },

  rejectConsent: async (id) => {
    const response = await apiClient.post("/consents/reject", {
      Id: id,
    });
    return extractData(response);
  },

  revokeConsent: async (id) => {
    const response = await apiClient.post("/consents/revoke", {
      Id: id,
    });
    return extractData(response);
  },
  //Notification
  getNotifications: async () => {
    const response = await apiClient.get("/api/patients/notifications");
    return extractData(response);
  },
  getUnreadCount: async () => {
    const response = await apiClient.get(
      "/api/patients/notifications/unread-count",
    );
    return extractData(response);
  },
  markNotificationRead: async (id) => {
    const response = await apiClient.patch(
      `/api/patients/notifications/${id}/read`,
    );
    return extractData(response);
  },
  deleteNotification: async (id) => {
    const response = await apiClient.delete(
      `/api/patients/notifications/${id}`,
    );
    return extractData(response);
  },
  clearRead: async () => {
    const response = await apiClient.delete(
      "/api/patients/notifications/clear-read",
    );
    return extractData(response);
  },
  markAllRead: async () => {
    const response = await apiClient.patch(
      "/api/patients/notifications/readAll",
    );
    return extractData(response);
  },
  
};

export default patientService;
