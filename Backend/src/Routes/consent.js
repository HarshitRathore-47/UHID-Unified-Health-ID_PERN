// src/Routes/doctors.js
import express from "express";
import {
 SendConsentRequest,
 PatientAcceptsRequest,
 PatientRejectRequest,
 PatientRevokeConsent
} from "../Controllers/consentController.js";
import { requireAuth } from "../../lib/auth.js";

const router = express.Router();


router.post("/request", requireAuth, SendConsentRequest);
router.post("/accept", requireAuth, PatientAcceptsRequest);
router.post("/reject", requireAuth, PatientRejectRequest);
router.post("/revoke", requireAuth, PatientRevokeConsent);




export default router;
