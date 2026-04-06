import apiClient from "../api/apiClient";

const extractData = (response) => {
  if (!response.data.success) {
    throw new Error(response.data.message || "Something went wrong");
  }
  return response.data.data;
};

const doctorService = {
  // AUTH
  register: async (formData) => {
    const response = await apiClient.post("/api/doctors/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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

  login: async (credentials) => {
    const response = await apiClient.post("/api/doctors/login", credentials);
    return extractData(response);
  },

  logout: async () => {
    const response = await apiClient.post("/api/doctors/logout");
    return extractData(response);
  },
  //DOCTOR-PROFILE
  getDoctorProfile: async () => {
  const response = await apiClient.get("/api/doctors/profile");
  return extractData(response);
},

updateDoctorProfile: async (payload) => {
  const response = await apiClient.patch("/api/doctors/profile/update", payload);
  return extractData(response);
},

updateProfilePhoto: async (file) => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await apiClient.patch(
    "/api/doctors/profile/photo",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return extractData(response);
},

  // STATUS
  getDoctorStatus: async () => {
    const response = await apiClient.get(`/api/doctors/status`);
    return extractData(response);
  },
//Search
  searchPatientByUHID: async (uhid) => {
  const response = await apiClient.get(
    `/api/doctors/patients/search?uhid=${uhid}`
  );
  return extractData(response);
},
  // CONSENTS
  sendConsentRequest: async (patientId) => {
  const response = await apiClient.post("/consents/request", {
    patientId,
  });
  return extractData(response);
},
  getActiveConsents: async () => {
    const response = await apiClient.get("/api/doctors/activeConsents");
    return extractData(response);
  },

  // PATIENT RECORD
  getPatientFullRecord: async (patientId) => {
    const response = await apiClient.get(
      `/api/doctors/patients/${patientId}/records`,
    );
    return extractData(response);
  },

  // TREATMENT
  createTreatment: async (patientId, payload) => {
    const response = await apiClient.post(
      `/api/doctors/patients/${patientId}/addtreatment`,
      payload,
    );
    return extractData(response);
  },

  // PRESCRIPTION
  createPrescription: async (patientId, payload) => {
    const response = await apiClient.post(
      `/api/doctors/patients/${patientId}/addprescriptions`,
      payload,
    );
    return extractData(response);
  },

  // DIET
  createDiet: async (patientId, payload) => {
    const response = await apiClient.post(
      `/api/doctors/patients/${patientId}/adddiet`,
      payload,
    );
    return extractData(response);
  },

  // LAB REPORT
  createLabReport: async (patientId, payload) => {
    const response = await apiClient.post(
      `/api/doctors/patients/${patientId}/addlab-reports`,
      payload,
    );
    return extractData(response);
  },

  // AI LAB REPORT
  createLabReportAI: async (patientId, formData) => {
    const response = await apiClient.post(
      `/api/doctors/addLabReports/ai/${patientId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return extractData(response);
  },
  // VERIFY LAB REPORT
  verifyLabReport: async (reportId) => {
    const response = await apiClient.patch(
      `/api/doctors/lab-reports/${reportId}/verify`
    );
    return extractData(response);
  },

  // REJECT LAB REPORT
  rejectLabReport: async (reportId, payload) => {
    const response = await apiClient.patch(
      `/api/doctors/lab-reports/${reportId}/reject`,
      payload
    );
    return extractData(response);
  },

  // VACCINATION
  createVaccination: async (patientId, payload) => {
    const response = await apiClient.post(
      `/api/doctors/patients/${patientId}/addvaccinations`,
      payload,
    );
    return extractData(response);
  },

  // VISIT
  createVisit: async (patientId, payload) => {
    const response = await apiClient.post(
      `/api/doctors/patients/${patientId}/addvisits`,
      payload,
    );
    return extractData(response);
  },

//  Delete RecordS
  // TREATMENT
deleteTreatment: async (id) => {
  const response = await apiClient.delete(`/api/doctors/treatments/${id}`);
  return extractData(response);
},

// PRESCRIPTION
deletePrescription: async (id) => {
  const response = await apiClient.delete(`/api/doctors/prescriptions/${id}`);
  return extractData(response);
},

// DIET
deleteDiet: async (id) => {
  const response = await apiClient.delete(`/api/doctors/diet/${id}`);
  return extractData(response);
},

// VACCINATION
deleteVaccination: async (id) => {
  const response = await apiClient.delete(`/api/doctors/vaccinations/${id}`);
  return extractData(response);
},

// VISIT
deleteVisit: async (id) => {
  const response = await apiClient.delete(`/api/doctors/visits/${id}`);
  return extractData(response);
},

// LAB REPORT
deleteLabReport: async (id) => {
  const response = await apiClient.delete(`/api/doctors/lab-reports/${id}`);
  return extractData(response);
},

  // NOTIFICATIONS
  getNotifications: async () => {
    const response = await apiClient.get("/api/doctors/notifications");
    return extractData(response);
  },

  getUnreadCount: async () => {
    const response = await apiClient.get(
      "/api/doctors/notifications/unread-count",
    );
    return extractData(response);
  },

  markNotificationRead: async (id) => {
    const response = await apiClient.patch(
      `/api/doctors/notifications/${id}/read`,
    );
    return extractData(response);
  },
  markAllRead: async () => {
    const response = await apiClient.patch(
      `/api/doctors/notifications/readAll`,
    );
    return extractData(response);
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/api/doctors/notifications/${id}`);
    return extractData(response);
  },

  clearRead: async () => {
    const response = await apiClient.delete(
      "/api/doctors/notifications/clear-read",
    );
    return extractData(response);
  },
};

export default doctorService;
