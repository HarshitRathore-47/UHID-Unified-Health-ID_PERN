// src/Routes/patients.js
import express from "express";
import {
  registerPatient,
  loginPatientStep1,
  getPatientDashboardData,
  getLabreports,
  getLabReportById,
  getHealthProfile,
  getPatientTreatments,
  getPatientDiets,
  getPatientPrescriptions,
  getPatientConsents,
  getVisitHistory,
  getVaccinationHistory,
  updateHealthProfile,
  uploadProfilePhoto,
  logoutUser,
} from "../Controllers/patientController.js";
import {
  getNotifications,
  clearReadNotifications,
  deleteNotification,
  MarkAllRead
} from "../Controllers/Notification/NotificationAPI.js";
import { getUnreadCount } from "../Controllers/Notification/UnReadCount.js";
import { markAsRead } from "../Controllers/Notification/markAsRead.js";
import { upload } from "../Middlewares/upload.js";
import { requireAuth, requireRole } from "../../lib/auth.js";

const router = express.Router();

//Public Routes
router.post("/register", upload.single("aadhaar"), registerPatient);
router.post("/login", loginPatientStep1);

// Protected Routes
router.use(requireAuth);
router.use(requireRole("PATIENT"));

//DashboardData
router.get("/dashboard", getPatientDashboardData);

//UploadProfilePhoto
router.post(
  "/upload-photo",
  requireAuth,
  upload.single("photo"),
  uploadProfilePhoto,
);

//logout
router.post("/logout", logoutUser);

// Lab Reports
router.get("/lab-reports", getLabreports);
router.get("/lab-reports/:reportId", getLabReportById);

// Health Profile
router.get("/health-profile", getHealthProfile);
router.put("/health-profile", updateHealthProfile);

// Treatments
router.get("/treatments", getPatientTreatments);

// Diets
router.get("/diets", getPatientDiets);

// Prescriptions
router.get("/prescriptions", getPatientPrescriptions);

// Consents
router.get("/consents", getPatientConsents);

// Visit History
router.get("/visit-history", getVisitHistory);

// Vaccination History
router.get("/vaccinations", getVaccinationHistory);

// Notifications
router.get("/notifications", getNotifications);

router.get("/notifications/unread-count", getUnreadCount);

router.patch("/notifications/:id/read", markAsRead);
router.patch("/notifications/readAll", MarkAllRead);

router.delete("/notifications/clear-read", clearReadNotifications);
router.delete("/notifications/:id", deleteNotification);

export default router;
