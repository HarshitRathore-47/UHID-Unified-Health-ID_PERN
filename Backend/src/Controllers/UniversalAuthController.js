// src/Controllers/authController.js
import {
  hashPlainOtp,
  createJwt,
  OTP_TTL_MS,
  sendOtpEmail
} from '../../lib/auth.js'
import { prisma } from '../../lib/prisma.js'
import { successResponse, errorResponse } from '../Utils/apiResponse.js'

//otp send function while registration

export async function sendOtp (req, res) {
  try {
    const { email, purpose = 'REGISTER' } = req.body
    if (!email) return errorResponse(res, 'Missing email', 400)

    // return res.status(400).json({ success: false, message: "Missing email" });

    // basic throttle check: count recent OTPs (simple rate-limit)
    const recentCount = await prisma.authOtp.count({
      where: {
        email,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 10) } // last 10 minutes
      }
    })
    if (recentCount >= 3) {
      return errorResponse(res, 'Too many OTP requests. Try later.', 429)
      // return res
      //   .status(429)
      //   .json({ success: false, message: "Too many OTP requests. Try later." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpHash = hashPlainOtp(otp)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    // create authOtp row with email
    const authOtp = await prisma.authOtp.create({
      data: {
        email,
        otpHash,
        purpose,
        expiresAt
      }
    })

    // send email (use your pre-existing sendOtpEmail)
    const mailResult = sendOtpEmail(
      email,
      otp,
      purpose === 'REGISTER' ? 'EMAIL_VERIFY' : 'LOGIN'
    )
    const mailSent = !(mailResult && mailResult.ok === false)

    return successResponse(
      res,
      { tempLoginId: authOtp.id, mailSent },
      'OTP sent'
    )

    // return res.status(200).json({
    //   success: true,
    //   data: {
    //     tempLoginId: authOtp.id,
    //     mailSent,
    //   },
    //   message: "OTP sent",
    // });
  } catch (err) {
    console.error('sendOtp error:', err)
    return errorResponse(res, 'Failed to send OTP', 500)
    // return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
}

/**
 * verifyLoginOtp(req, res)
 * Body: { tempLoginId, otp }
 * Verifies hashed otp, issues JWT cookie, deletes otp row.
 *
 */

export async function verifyLoginOtp (req, res, next) {
  try {
    const { tempLoginId, otp } = req.body
    if (!tempLoginId || !otp)
      return errorResponse(res, 'Missing tempLoginId or otp', 400)
    // return res
    //   .status(400)
    //   .json({ success: false, message: "Missing tempLoginId or otp" });

    const row = await prisma.authOtp.findUnique({ where: { id: tempLoginId } })

    if (!row) return errorResponse(res, 'Invalid or expired OTP session', 400)
    // return res
    //   .status(400)
    //   .json({ success: false, message: "Invalid or expired OTP session" });

    if (new Date(row.expiresAt) < new Date())
      return errorResponse(res, 'OTP expired', 400)
    // return res.status(400).json({ success: false, message: });

    if ((row.attempts || 0) >= 5)
      return errorResponse(res, 'Too many attempts', 429)
    // return res.status(429).json({ success: false, message: "Too many attempts" });

    const hash = hashPlainOtp(otp)
    if (hash !== row.otpHash) {
      await prisma.authOtp.update({
        where: { id: tempLoginId },
        data: { attempts: (row.attempts || 0) + 1 }
      })
      return errorResponse(res, 'Invalid OTP', 400)
      // return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // If OTP matched:
    // CASE A: OTP linked to an existing user (login flow) -> issue JWT and delete OTP
    if (row.doctorId || row.patientId) {
      // mark/update as verified if you want (optional)

      // build JWT payload
      let jwtPayload = null

      if (row.doctorId) {
        const doctor = await prisma.doctor.findUnique({
          where: { id: row.doctorId }
        })

        if (!doctor) return errorResponse(res, 'User not found', 400)
        // return res.status(400).json({ success: false, message: "User not found" });

        jwtPayload = {
          sub: doctor.id,
          role: 'DOCTOR',
          email: doctor.email || null
        }
      } else {
        const patient = await prisma.patient.findUnique({
          where: { id: row.patientId }
        })
        if (!patient) return errorResponse(res, 'User not found', 400)
        jwtPayload = {
          sub: patient.id,
          role: 'PATIENT',
          email: patient.email || null
        }
      }

      const token = createJwt(jwtPayload)

      // remove OTP so it can't be reused
      await prisma.authOtp.delete({ where: { id: tempLoginId } })

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7
      })
      return successResponse(
        res,
        { role: jwtPayload.role },
        'OTP verified, logged in'
      )
      // return res.status(200).json({
      //   success: true,
      //   data: { role: jwtPayload.role },
      //   message: "OTP verified, logged in",
      // });
    }
    // CASE B: OTP not linked to user (registration flow) -> mark verified and return success
    await prisma.authOtp.update({
      where: { id: tempLoginId },
      data: { verified: true }
    })

    return successResponse(
      res,
      { verified: true },
      'OTP verified (registration). Proceed to complete registration.'
    )
    // return res.json({
    //   success: true,
    //   data: { verified: true },
    //   message: "OTP verified (registration). Proceed to complete registration.",
    // });
  } catch (err) {
    console.error('verifyLoginOtp error:', err)

    return errorResponse(res, 'Failed to verify OTP')
    // return res.status(500).json({
    //   success: false,
    //   message: "Failed to verify OTP",
    // });
  }
}

/**
 * resendOtp(req, res)
 * Body: { tempLoginId }
 */
export async function resendOtp (req, res, next) {
  try {
    const { tempLoginId } = req.body
    if (!tempLoginId) return errorResponse(res, 'Missing tempLoginId', 400)
    // return res
    //   .status(400)
    //   .json({ success: false, message: "Missing tempLoginId" });

    const existing = await prisma.authOtp.findUnique({
      where: { id: tempLoginId }
    })
    if (!existing) return errorResponse(res, 'OTP session not found', 404)
    // return res
    //   .status(404)
    //   .json({ success: false, message: "OTP session not found" });

    // rate-limit: blocked if too many attempts
    const MAX_RESENDS = 10
    if ((existing.attempts || 0) >= MAX_RESENDS) {
      return errorResponse(res, 'Too many resends', 429)
    }

    // generate new otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpHash = hashPlainOtp(otp)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    // determine recipient email: prefer authOtp.email (new schema), then user relations
    let toEmail = existing.email || null
    if (!toEmail) {
      if (existing.doctorId) {
        const d = await prisma.doctor.findUnique({
          where: { id: existing.doctorId }
        })
        toEmail = d?.email || null
      } else if (existing.patientId) {
        const p = await prisma.patient.findUnique({
          where: { id: existing.patientId }
        })
        toEmail = p?.email || null
      }
    }

    // update otpHash, expiry and increment attempts
    const updated = await prisma.authOtp.update({
      where: { id: tempLoginId },
      data: {
        otpHash,
        expiresAt,
        attempts: (existing.attempts || 0) + 1
      }
    })

    if (!toEmail) {
      // nothing to send to — return an error so frontend can surface it
      return errorResponse(res, 'No email available to resend OTP', 400)
      // return res
      //   .status(400)
      //   .json({ success: false, message: "No email available to resend OTP" });
    }

    // choose purpose for email text
    const mailPurpose =
      updated.purpose === 'REGISTER' ? 'EMAIL_VERIFY' : 'LOGIN'
    const mailResult = sendOtpEmail(toEmail, otp, mailPurpose)
    const mailSent = !(mailResult && mailResult.ok === false)

    return successResponse(
      res,
      { mailSent },
      mailSent ? 'OTP resent' : 'OTP created but failed to send'
    )
    // return res.status(200).json({
    //   success: true,
    //   data: { mailSent },
    //   message: mailSent ? "OTP resent" : "OTP created but failed to send",
    // });
  } catch (err) {
    console.error('resendOtp error:', err)

    return errorResponse(res, 'Failed to resend the Otp')
    // return res.status(500).json({
    //   success: false,
    //   message: "Internal server error",
    // });
  }
}
