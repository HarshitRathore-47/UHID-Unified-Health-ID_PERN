// src/Routes/admin.js
import express from "express";
import {
  adminLogin,
  getAdminDashboard,
  getPendingDoctors,
  getDoctorDetails,
  approveDoctor,
  rejectDoctor,
  getDoctorDocument,
  getAuditLogs,
  getDashboardAnalytics,
  adminlogout
} from "../Controllers/adminController.js";
// Notification Routes (ADMIN)
import {
  getNotifications,
  deleteNotification,
  clearReadNotifications,
  MarkAllRead,
} from "../Controllers/Notification/NotificationAPI.js";

import { getUnreadCount } from "../Controllers/Notification/UnReadCount.js";
import { markAsRead } from "../Controllers/Notification/markAsRead.js";


import { isAdmin } from "../../lib/auth.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/logout",isAdmin, adminlogout);
router.get("/doctors", isAdmin, getPendingDoctors);
router.get("/doctors/:id", isAdmin, getDoctorDetails);
router.put("/doctors/:id/approve", isAdmin, approveDoctor);
router.put("/doctors/:id/reject", isAdmin, rejectDoctor);
router.get("/dashboard", isAdmin, getAdminDashboard);
router.get("/audit-logs", isAdmin, getAuditLogs);
router.get("/documents/:docId", isAdmin, getDoctorDocument);
router.get("/analytics", isAdmin, getDashboardAnalytics);

// 🔔 Notifications (Admin)
router.get("/notifications", isAdmin, getNotifications);

router.get(
  "/notifications/unread-count",
  isAdmin,
  getUnreadCount
);

router.patch(
  "/notifications/:id/read",
  isAdmin,
  markAsRead
);

router.patch(
  "/notifications/readAll",
  isAdmin,
  MarkAllRead
);

router.delete(
  "/notifications/clear-read",
  isAdmin,
  clearReadNotifications
);

router.delete(
  "/notifications/:id",
  isAdmin,
  deleteNotification
);

export default router;
