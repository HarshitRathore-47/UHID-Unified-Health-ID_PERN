// src/Routes/doctors.js
import express from "express";
import {
  registerDoctor,
  loginDoctorStep1,
  getDoctorStatus,
  getActiveConsents,
  getPatientFullRecord,
  createDiet,
  createTreatment,
  createLabReport,
  createPrescription,
  createVaccinationRecord,
  createVisitRecord,
  verifyLabReport,
  rejectLabReport,
  logoutUser,
  getDoctorProfile,
  updateDoctorProfile,
  updateDoctorProfilePhoto,
  searchPatientByUHID
} from "../Controllers/doctorController.js";
import {
  deleteTreatment,
  deletePrescription,
  deleteDiet,
  deleteVaccination,
  deleteVisit,
  deleteLabReport,
} from "../Controllers/medicalRecordController.js";
import {
  getNotifications,
  deleteNotification,
  clearReadNotifications,
  MarkAllRead,
} from "../Controllers/Notification/NotificationAPI.js";
import { getUnreadCount } from "../Controllers/Notification/UnReadCount.js";
import { markAsRead } from "../Controllers/Notification/markAsRead.js";
import { upload } from "../Middlewares/upload.js";
import { requireAuth, requireRole } from "../../lib/auth.js";
import { checkDoctorConsent } from "../Middlewares/checkDoctorConsent.js";
import { createLabReportAI } from "../Controllers/aiControllerForExtraction.js";

const router = express.Router();
//Public Routes
router.post("/register", upload.single("certificate"), registerDoctor);
router.post("/login", loginDoctorStep1);
router.post("/logout", logoutUser);

// Protected Routes
router.get("/profile", requireAuth, getDoctorProfile);
router.patch("/profile/update", requireAuth, updateDoctorProfile);

router.patch(
  "/profile/photo",
  requireAuth,
  upload.single("photo"),
  updateDoctorProfilePhoto,
);
router.get("/patients/search", requireAuth, searchPatientByUHID);
router.use(requireAuth);
router.use(requireRole("DOCTOR"));

router.get("/activeConsents", getActiveConsents);
router.get("/status", getDoctorStatus);
router.get(
  "/patients/:patientId/records",
  checkDoctorConsent,
  getPatientFullRecord,
);
router.post(
  "/patients/:patientId/addprescriptions",
  checkDoctorConsent,
  createPrescription,
);
router.post(
  "/patients/:patientId/addtreatment",
  checkDoctorConsent,
  createTreatment,
);
router.post("/patients/:patientId/adddiet", checkDoctorConsent, createDiet);

router.post(
  "/patients/:patientId/addlab-reports",
  checkDoctorConsent,
  createLabReport,
);
router.post(
  "/patients/:patientId/addvaccinations",
  checkDoctorConsent,
  createVaccinationRecord,
);
router.post(
  "/patients/:patientId/addvisits",
  checkDoctorConsent,
  createVisitRecord,
);

// DeleteRecordRoutes

// Treatment
router.delete("/treatments/:id", deleteTreatment);

// Prescription
router.delete("/prescriptions/:id", deletePrescription);

// Diet
router.delete("/diet/:id", deleteDiet);

// Vaccination
router.delete("/vaccinations/:id", deleteVaccination);

// Visit
router.delete("/visits/:id", deleteVisit);

// Lab Report
router.delete("/lab-reports/:id", deleteLabReport);

// AI controller route For Lab report extraction
router.post(
  "/addLabReports/ai/:patientId",

  upload.single("file"),
  checkDoctorConsent,
  createLabReportAI,
);
// 1. Verify a lab report
router.patch("/lab-reports/:reportId/verify", verifyLabReport);

// 2. Reject a lab report
router.patch("/lab-reports/:reportId/reject", rejectLabReport);

//Notifications
router.get("/notifications", getNotifications);
router.get("/notifications/unread-count", getUnreadCount);
router.patch("/notifications/:id/read", markAsRead);
router.patch("/notifications/readAll", MarkAllRead);
router.delete("/notifications/clear-read", clearReadNotifications);
router.delete("/notifications/:id", deleteNotification);

export default router;
