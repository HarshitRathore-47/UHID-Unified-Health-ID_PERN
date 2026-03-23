// src/Routes/auth.js
import express from "express";
import { sendOtp,verifyLoginOtp, resendOtp } from "../Controllers/authController.js";
const router = express.Router();

router.post("/send-otp",sendOtp);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/resend-otp", resendOtp);

export default router;
