import {
  hashPassword,
  createJwt,
  hashPlainOtp,
  OTP_TTL_MS,
  sendOtpEmail
} from '../../../lib/auth.js'
import { prisma } from '../../../lib/prisma.js'
import { toCleanDate } from '../../Utils/DateUtils.js'
import { uploadFileToFirebase } from '../FileUploadControllers/uploadController.js'
import { createNotification } from '../../Utils/Notify.js'
import { successResponse, errorResponse } from '../../Utils/apiResponse.js'
import { registerDoctorSchema } from '../../schemas/doctor/profileSchema.js'

export async function registerDoctor (req, res, next) {
  try {
    // 1. Zod Validation (Professional Flow)
    const parsed = registerDoctorSchema.safeParse(req.body)
    if (!parsed.success) {
      return errorResponse(res, parsed.error.issues[0].message, 400)
    }

    const {
      fullName,
      dob,
      gender,
      phone,
      userName,
      email,
      password,
      licenseNumber,
      specialization,
      hospital,
      experience,
      qualification,
      verifyOtpId
    } = parsed.data

    const normalizedUserName = userName?.toLowerCase().trim()

    // 1️⃣ verifyOtpId is mandatory
    if (!verifyOtpId) {
      return errorResponse(res, 'OTP verification required', 400)
    }

    // 2️⃣ Validate OTP session
    const authOtp = await prisma.authOtp.findUnique({
      where: { id: verifyOtpId }
    })

    if (!authOtp || !authOtp.verified) {
      return errorResponse(res, 'OTP not verified or session expired', 400)
    }

    // Optional safety: ensure the email used to request OTP is the same as registration email
    if (authOtp.email && authOtp.email !== req.body.email) {
      return errorResponse(res, 'OTP email mismatch', 400)
    }

    // 3️⃣ Basic required fields
    if (!email || !password || !licenseNumber || !fullName) {
      return errorResponse(res, 'Missing required fields', 400)
    }

    if (
      !normalizedUserName ||
      normalizedUserName.length < 8 ||
      normalizedUserName.length > 15 ||
      !/^[a-z0-9_.]+$/.test(normalizedUserName)
    ) {
      return errorResponse(
        res,
        'Username must be 8-15 characters and contain only lowercase letters, numbers, _ or .',
        400,
        'userName'
      )
    }

    // 4️⃣ Uniqueness checks (IMPORTANT)
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { email },
          { phone },
          { userName } // make sure naming matches schema
        ]
      }
    })

    if (existingDoctor) {
      // EMAIL conflict
      if (existingDoctor?.email === email) {
        return errorResponse(
          res,
          'Email is already associated with another account',
          409,
          'email'
        )
      }

      // PHONE conflict
      if (existingDoctor?.phone === phone) {
        return errorResponse(
          res,
          'Phone number is already associated with another account',
          409,
          'phone'
        )
      }

      // USERNAME conflict (doctor-only)
      if (existingDoctor?.userName === userName) {
        return errorResponse(res, 'Username is already taken', 409, 'userName')
      }
    }

    // 5️⃣ Create doctor
    const passwordHash = await hashPassword(password)

    if (!req.file) {
      return errorResponse(res, 'License certificate is required', 400)
    }

    const result = await prisma.$transaction(async tx => {
      const doctor = await tx.doctor.create({
        data: {
          fullName,
          dob: dob ? toCleanDate(dob) : null,
          gender,
          phone,
          userName,
          email,
          passwordHash,
          licenseNumber,
          specialization,
          hospital,
          experience: experience ? Number(experience) : null,
          qualification,
          status: 'PENDING'
        }
      })

      if (req.file) {
        const filePath = `doctors/${doctor.id}/documents/license_${Date.now()}`
        const savedPath = await uploadFileToFirebase(req.file, filePath)

        await tx.doctorDocument.create({
          data: {
            doctorId: doctor.id,
            type: 'LICENSE',
            fileKey: savedPath,
            fileName: req.file.originalname,
            mimeType: req.file.mimetype
          }
        })
      }

      await tx.authOtp.update({
        where: { id: verifyOtpId },
        data: { doctorId: doctor.id }
      })

      return doctor
    })

    const token = createJwt({
      sub: result.id,
      role: 'DOCTOR',
      email: result.email
    })

    //  SET COOKIE
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    })
    // await createNotification({
    //   userId:adminId, // or actual admin id
    //   role: "ADMIN",
    //   type: "ADMIN_DOCTOR_PENDING",
    //   title: "New Doctor Registration",
    //   message: `${doctor.fullName} submitted documents`,
    // });
    // Final response (NO OTP here)
    successResponse(
      res,
      { id: result.id, statusUrl: `/api/doctors/${result.id}/status` },
      'Doctor registered successfully. Pending admin approval.'
    )
  } catch (err) {
    console.error('REGISTER DOCTOR ERROR:', err)
    next(err)
  }
}

export async function loginDoctor (req, res, next) {
  try {
    const { identifier, password } = req.body
    if (!identifier || !password)
      return errorResponse(res, 'Missing credentials', 400)

    const doctor = await prisma.doctor.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] }
    })
    if (!doctor) return errorResponse(res, 'Invalid credentials', 400)

    const ok = await import('../../../lib/auth.js').then(m =>
      m.comparePassword(password, doctor.passwordHash || '')
    )
    if (!ok) {
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { failedLoginAttempts: doctor.failedLoginAttempts + 1 }
      })
      return errorResponse(res, 'Invalid credentials', 400)
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const otpHash = hashPlainOtp(otp)
    const authOtp = await prisma.authOtp.create({
      data: {
        doctorId: doctor.id,
        userType: 'DOCTOR',
        purpose: 'LOGIN',
        otpHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS)
      }
    })

    if (doctor.email) await sendOtpEmail(doctor.email, otp, 'LOGIN')

    successResponse(res, { tempLoginId: authOtp.id }, 'OTP sent to email')
  } catch (err) {
    next(err)
  }
}
export function logoutUser (req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return successResponse(res, {}, 'Logged out successfully')
}
