// src/Controllers/patientController.js
import crypto from 'crypto'
import {
  hashPlainOtp,
  hashPassword,
  sendOtpEmail,
  OTP_TTL_MS,
  createJwt
} from '../../../lib/auth.js'
import { prisma } from '../../../lib/prisma.js'
import { generateUniqueUHID } from '../../../lib/Uhid.js'
import { uploadFileToFirebase } from '../FileUploadControllers/uploadController.js'
import { toCleanDate } from '../../Utils/DateUtils.js'
import {
  registerPatientSchema,
  loginPatientSchema
} from '../../schemas/patient/authSchema.js'
import { successResponse, errorResponse } from '../../Utils/apiResponse.js'

// RegisterPatient
export async function registerPatient (req, res, next) {
  try {
    //Zod Validation
    const parsed = registerPatientSchema.safeParse(req.body)

    if (!parsed.success) {
      console.log(
        'ZOD ERROR DETAILS:',
        JSON.stringify(parsed.error.format(), null, 2)
      )
      const errorMessage =
        parsed.error?.errors?.[0]?.message || 'Validation failed'
      return errorResponse(res, errorMessage, 400)
    }
    const {
      fullName,
      dob,
      gender,
      phone,
      email,
      password,
      guardianName,
      aadhaarNumber,
      address,
      verifyOtpId
    } = parsed.data

    console.log(verifyOtpId, aadhaarNumber)

    if (!verifyOtpId) {
      return errorResponse(res, 'OTP Verification required', 400)
    }

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
    if (new Date(authOtp.expiresAt) < new Date()) {
      return errorResponse(res, 'OTP expired', 400)
    }

    const passwordHash = await hashPassword(password)
    const aadhaarHash = aadhaarNumber
      ? crypto.createHash('sha256').update(aadhaarNumber).digest('hex')
      : null

    //UHID GENERATION
    const { stored, display } = await generateUniqueUHID(prisma)
    const existingPatient = await prisma.patient.findFirst({
      where: {
        OR: [
          { email },
          { phone } // make sure naming matches schema
        ]
      }
    })

    if (existingPatient) {
      // EMAIL conflict
      if (existingPatient?.email === email) {
        return errorResponse(
          res,
          'Email is already associated with another account',
          409,
          'email'
        )
      }

      // // PHONE conflict
      // if (existingPatient?.phone === phone) {
      //   return errorResponse(res, "Phone number is already associated with another account", 409, "phone");
      // }
    }
    if (!req.file) {
      return errorResponse(res, 'Aadhaar document is required', 400)
    }

    // Start Transaction
    const result = await prisma.$transaction(async tx => {
      // 1. Create Patient
      const patient = await tx.patient.create({
        data: {
          uhid: stored,
          fullName,
          dob: toCleanDate(dob),
          gender,
          phone,
          email,
          passwordHash,
          guardianName,
          aadhaarHash,
          address
        }
      })

      // 2. Upload Aadhaar to Firebase
      const filePath = `patients/${patient.id}/documents/aadhaar_${Date.now()}`
      const savedPath = await uploadFileToFirebase(req.file, filePath)

      // 3. Create Document Record
      await tx.patientDocument.create({
        data: {
          patientId: patient.id,
          type: 'AADHAAR',
          fileKey: savedPath,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype
        }
      })

      // 4. Link OTP session to Patient
      await tx.authOtp.update({
        where: { id: verifyOtpId },
        data: { patientId: patient.id }
      })

      return patient
    })

    // Generate Token using transaction result
    const token = createJwt({
      sub: result.id,
      role: 'PATIENT',
      email: result.email
    })

    // 🍪 SET COOKIE
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    })

    return successResponse(
      res,
      {
        id: result.id,
        uhid: display,
        statusUrl: `/api/patients/${result.id}/status`,
        verifyOtpId: authOtp.id
      },
      'Patient registered successfully.'
    )
  } catch (err) {
    console.error('REGISTER PATIENT ERROR:', err)
    next(err)
  }
}
/**
 * loginPatientStep1(req,res)
 * Body: { identifier, password }
 * Returns tempLoginId
 */
export async function loginPatient (req, res, next) {
  try {
    // zod Validation
    const parsed = loginPatientSchema.safeParse(req.body)

    if (!parsed.success) {
      return errorResponse(res, parsed.error.errors[0].message, 400)
    }

    const { uhid, password } = parsed.data

    const patient = await prisma.patient.findFirst({
      where: { uhid: uhid }
    })
    if (!patient) return errorResponse(res, 'Invalid UHID and password', 400)

    if (patient.lockedUntil && new Date(patient.lockedUntil) > new Date())
      return errorResponse(res, 'Account locked. Try later.', 403)

    const ok = await import('../../../lib/auth.js').then(m =>
      m.comparePassword(password, patient.passwordHash || '')
    )
    if (!ok) {
      await prisma.patient.update({
        where: { id: patient.id },
        data: { failedLoginAttempts: patient.failedLoginAttempts + 1 }
      })
      return errorResponse(res, 'Invalid credentials', 400)
    }

    if (patient.failedLoginAttempts > 0)
      await prisma.patient.update({
        where: { id: patient.id },
        data: { failedLoginAttempts: 0 }
      })

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const otpHash = hashPlainOtp(otp)
    const authOtp = await prisma.authOtp.create({
      data: {
        patientId: patient.id,
        userType: 'PATIENT',
        purpose: 'LOGIN',
        otpHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS)
      }
    })

    if (patient.email) await sendOtpEmail(patient.email, otp, 'LOGIN')

    return successResponse(
      res,
      { tempLoginId: authOtp.id },
      'OTP sent to email'
    )
  } catch (err) {
    next(err)
  }
}

//Treatments

export function logoutUser (req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return successResponse(res, {}, 'Logged out successfully')
}
