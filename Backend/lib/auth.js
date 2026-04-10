// lib/auth.js
import 'dotenv/config'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

// --- constants / env ---
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
export const JWT_EXPIRES_SECONDS = 60 * 60 * 24 * 7 // 7 days
export const OTP_TTL_MS = 1000 * 60 * 10
const BCRYPT_ROUNDS = 12

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER

// --- Create Gmail transporter ---
const transporter = nodemailer.createTransport({
  // Ab ye settings seedhe aapke Env variables se aayengi
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // 587 port dono (Gmail/Brevo) ke liye false pe chalta hai
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true,
  logger: true,
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
  pool: true,
  maxConnections: 1,
  family: 4,
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  }
})

// Verify connection (debug only)

transporter
  .verify()
  .then(() => {
    console.log(`✅ SMTP transporter ready (${process.env.SMTP_HOST})`)
  })
  .catch(err => {
    console.warn('⚠️ SMTP verify failed:', err.message)
  })

// --- Utility Helpers ---

// Hash OTP value
export function hashPlainOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex')
}

// JWT generation
export function createJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_SECONDS })
}

// JWT verification
export function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// Password hashing
export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

// Compare password
export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash)
}

// --- Send OTP Email via Gmail SMTP ---
export async function sendOtpEmail(toEmail, otp, purpose = 'LOGIN') {
  if (!toEmail) return { ok: false, error: 'Missing recipient email' }

  const subject =
    purpose === 'EMAIL_VERIFY'
      ? 'Verify your UHID Email'
      : 'Your UHID Login Code'

  const text = `Your one-time code is ${otp}.
This code expires in 10 minutes.
Do not share it with anyone.`
  // const text = `Gauri! Otp functionality works well. Your otp is 3276`;

  const mailOptions = {
    from: FROM_EMAIL,
    to: toEmail,
    subject,
    text
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✉️ Gmail OTP email sent:', info.messageId || info.response)
    return { ok: true, info }
  } catch (err) {
    console.error('❌ Gmail failed to send OTP:', err.message || err)
    return { ok: false, error: err.message }
  }
}
// Welcome Email after Registration
export async function sendWelcomeEmail(toEmail, patientName, uhid, details = {}) {
  if (!toEmail) return { ok: false, error: 'Missing recipient email' };

  const subject = 'Welcome to UHID - Your Healthcare Identity';

  // HTML Template for a professional look
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono:wght@700&display=swap');
    
    @media only screen and (max-width: 600px) {
      .inner-body { width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 30px 20px !important; }
      .uhid-text { font-size: 28px !important; letter-spacing: 2px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f2f7; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f2f7; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="inner-body" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 20px 40px rgba(74, 20, 140, 0.08); overflow: hidden;">
          
          <tr>
            <td style="background: linear-gradient(90deg, #4a148c 0%, #7b1fa2 100%); padding: 40px 40px 30px 40px; text-align: center;">
               <div style="background: rgba(255,255,255,0.1); display: inline-block; padding: 12px 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);">
                 <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">UHID <span style="color: #e1bee7;">SECURE</span></h2>
               </div>
            </td>
          </tr>

          <tr>
            <td class="content-padding" style="padding: 40px 50px;">
              <h3 style="color: #1a1a1a; font-size: 22px; margin-top: 0;">Hi ${patientName},</h3>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Your digital health journey starts here. Your secure Healthcare Identity (UHID) is now active and linked to your medical profile.</p>

              <div style="background-color: #fbf9ff; border: 2px solid #f0eaff; border-radius: 20px; padding: 35px 20px; margin: 35px 0; text-align: center; position: relative;">
                <span style="background-color: #4a148c; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; position: absolute; top: -12px; left: 50%; transform: translateX(-50%);">Your Unique Health ID</span>
                
                <h1 class="uhid-text" style="margin: 15px 0; color: #4a148c; font-size: 38px; letter-spacing: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${uhid}</h1>
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                   <p style="margin: 0; font-size: 13px; color: #6a1b9a; font-weight: 600; line-height: 1.5;">
                    ⚠️ Important: Please <strong>type this ID manually</strong> when logging in.<br>
                    Avoid copy-pasting to ensure no accidental spaces are included and to help you memorize your unique ID.
                   </p>
                </div>
              </div>

              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border-radius: 12px;">
                    <table width="100%">
                      <tr>
                        <td style="font-size: 14px; color: #777; padding-bottom: 8px;">Patient Name</td>
                        <td align="right" style="font-size: 14px; color: #1a1a1a; font-weight: 700; padding-bottom: 8px;">${patientName}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #777;">Gender</td>
                        <td align="right" style="font-size: 14px; color: #1a1a1a; font-weight: 700;">${details.gender || 'N/A'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="text-align: center;">
                <p style="font-size: 14px; color: #888; line-height: 1.5;">
                  Keep this ID safe. It is required for all future consultations, lab reports, and portal access.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 50px 40px 50px;">
              <div style="border-top: 1px solid #eee; padding-top: 30px; text-align: center;">
                <p style="font-size: 12px; color: #aaa; margin: 0;">
                  This is an automated security notification from <br>
                  <strong style="color: #888;">UHID Secure Healthcare Systems &copy; 2026</strong>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const mailOptions = {
    from: FROM_EMAIL,
    to: toEmail,
    subject,
    html // HTML bhejenge taaki look professional ho
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ Welcome email sent to:', toEmail);
    return { ok: true, info };
  } catch (err) {
    console.error('❌ Failed to send Welcome Email:', err.message);
    return { ok: false, error: err.message };
  }
}
// --- Middleware Helpers ---

// ADMIN check
export function isAdmin(req, res, next) {
  const token =
    req.cookies?.token || req.headers.authorization?.split(' ')[1] || null

  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  const payload = verifyJwt(token)
  if (!payload || payload.role !== 'ADMIN')
    return res.status(403).json({ message: 'Forbidden' })

  req.user = payload
  next()
}

// Authentication check
export function requireAuth(req, res, next) {
  const token =
    req.cookies?.token || req.headers.authorization?.split(' ')[1] || null

  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  const payload = verifyJwt(token)
  if (!payload) return res.status(401).json({ message: 'Invalid token' })

  req.user = payload
  console.log(req.user.sub)
  next()
}
export function requireRole(expectedRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    next()
  }
}
