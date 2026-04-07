// lib/auth.js
import "dotenv/config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// --- constants / env ---
export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
export const JWT_EXPIRES_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const OTP_TTL_MS = 1000 * 60 * 10;
const BCRYPT_ROUNDS = 12;

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

// --- Create Gmail transporter ---
const transporter = nodemailer.createTransport({
  // Ab ye settings seedhe aapke Env variables se aayengi
  host: process.env.SMTP_HOST, 
  port: Number(process.env.SMTP_PORT),
  secure: false, // 587 port dono (Gmail/Brevo) ke liye false pe chalta hai
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Dono jagah connection stable rakhega
  }
});

// Verify connection (debug only)
transporter
  .verify()
  .then(() => {
    console.log(`✅ SMTP transporter ready (${process.env.SMTP_HOST})`);
  })
  .catch((err) => {
    console.warn("⚠️ SMTP verify failed:", err.message);
  });

// --- Utility Helpers ---

// Hash OTP value
export function hashPlainOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

// JWT generation
export function createJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_SECONDS });
}

// JWT verification
export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Password hashing
export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

// Compare password
export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// --- Send OTP Email via Gmail SMTP ---
export async function sendOtpEmail(toEmail, otp, purpose = "LOGIN") {
  if (!toEmail) return { ok: false, error: "Missing recipient email" };

  const subject =
    purpose === "EMAIL_VERIFY"
      ? "Verify your UHID Email"
      : "Your UHID Login Code";

  const text = `Your one-time code is ${otp}.
This code expires in 10 minutes.
Do not share it with anyone.`;
  // const text = `Gauri! Otp functionality works well. Your otp is 3276`;

  const mailOptions = {
    from: FROM_EMAIL,
    to: toEmail,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✉️ Gmail OTP email sent:", info.messageId || info.response);
    return { ok: true, info };
  } catch (err) {
    console.error("❌ Gmail failed to send OTP:", err.message || err);
    return { ok: false, error: err.message };
  }
}

// --- Middleware Helpers ---

// ADMIN check
export function isAdmin(req, res, next) {
  const token =
    req.cookies?.token || req.headers.authorization?.split(" ")[1] || null;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

  const payload = verifyJwt(token);
  if (!payload || payload.role !== "ADMIN")
   return res.status(403).json({ message: "Forbidden" });

  req.user = payload;
  next();
}

// Authentication check
export function requireAuth(req, res, next) {
  const token =
    req.cookies?.token || req.headers.authorization?.split(" ")[1] || null;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ message: "Invalid token" });

  req.user = payload;
  console.log(req.user.sub);
  next();
}
export function requireRole(expectedRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    next();
  };
}
