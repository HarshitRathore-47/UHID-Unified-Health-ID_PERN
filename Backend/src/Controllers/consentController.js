import { prisma } from '../../lib/prisma.js'
import { createNotification } from '../Utils/Notify.js'
import {
  sendConsentSchema,
  consentActionSchema
} from '../schemas/consentSchema.js'
import { successResponse, errorResponse } from '../Utils/apiResponse.js'

export async function SendConsentRequest (req, res) {
  const parsed = sendConsentSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, parsed.error.issues[0].message, 400)
  }

  const doctorId = req.user.sub
  const { patientId } = parsed.data
  console.log(doctorId, patientId)
  try {
    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.doctor.findUnique({ where: { id: doctorId } })
    ])
    if (!doctor || !patient) {
      return errorResponse(res, 'Profiles not found', 404)
    }

    const existingConsent = await prisma.consent.findFirst({
      where: {
        doctorId: doctorId,
        patientId: patientId
      },
      select: {
        consentStatus: true,
        consentExpiresAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    let now = new Date()
    let isAccepted = false
    let isNotExpired = false

    if (existingConsent) {
      isAccepted = existingConsent.consentStatus === 'ACCEPTED'
      if (isAccepted) {
        isNotExpired = now < existingConsent.consentExpiresAt
      }
    }
    if (isAccepted && isNotExpired) {
      return errorResponse(res, 'Access already active', 403)
    }
    const consent = await prisma.consent.create({
      data: {
        patientId,
        doctorId,
        consentStatus: 'PENDING',
        requestSentAt: new Date()
      }
    })
    await createNotification({
      userId: patientId,
      role: 'PATIENT',
      type: 'CONSENT_REQUEST',
      title: 'New Access Request',
      message: `Dr. ${doctor.fullName} requested access to your records`,
      entityId: consent.id
    })
    return successResponse(
      res,
      {
        consentId: consent.id,
        status: consent.consentStatus
      },
      'Consent request sent',
      201
    )
  } catch (error) {
    return errorResponse(res, 'Internal server error', 500)
  }
}
export async function PatientAcceptsRequest (req, res) {
  const parsed = consentActionSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, parsed.error.issues[0].message, 400)
  }

  const patientId = req.user.sub // logged-in patient

  const { Id } = parsed.data

  try {
    console.log(Id)
    const validateRequest = await prisma.consent.findFirst({
      where: {
        id: Id,
        patientId: patientId
      },
      select: {
        consentStatus: true
      }
    })
    console.log(validateRequest)
    if (!validateRequest) {
      return errorResponse(res, 'No Valid Consent Found', 404)
    }
    let now = new Date()
    if (validateRequest.consentStatus !== 'PENDING') {
      return errorResponse(res, 'Consent is already Accepted or Processed', 406)
    }
    const consent = await prisma.consent.update({
      where: {
        id: Id,
        patientId: patientId
      },
      data: {
        consentAcceptedAt: now,
        consentExpiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        consentStatus: 'ACCEPTED'
      }
    })
    await createNotification({
      userId: consent.doctorId,
      role: 'DOCTOR',
      type: 'CONSENT_APPROVED',
      title: 'Consent Approved',
      message: 'Patient approved your access request.',
      entityId: Id
    })

    return successResponse(
      res,
      {
        consentId: consent.id,
        status: consent.consentStatus
      },
      'Consent Request Accepted'
    )
  } catch (error) {
    return errorResponse(res, 'Internal server error', 500)
  }
}
export async function PatientRejectRequest (req, res) {
  const patientId = req.user.sub // logged-in patient
  const { Id } = req.body
  try {
    const validateRequest = await prisma.consent.findFirst({
      where: {
        id: Id,
        patientId: patientId
      },
      select: {
        consentStatus: true
      }
    })
    if (!validateRequest) {
      return errorResponse(res, 'No Valid Consent Found', 404)
    }
    if (validateRequest.consentStatus !== 'PENDING') {
      return errorResponse(
        res,
        'The Consent is already Accepted or Processed',
        406
      )
    }
    let now = new Date()
    const consent = await prisma.consent.update({
      where: {
        id: Id,
        patientId: patientId
      },
      data: {
        consentStatus: 'REJECTED',
        updatedAt: now
      }
    })
    const consentNotiData = await prisma.consent.findUnique({
      where: { id: Id }
    })
    await createNotification({
      userId: consentNotiData.doctorId,
      role: 'DOCTOR',
      type: 'PATIENT_REVOKED_ACCESS',
      title: 'Access Revoked',
      message: 'Patient revoked your access.',
      entityId: Id
    })
    return successResponse(
      res,
      {
        consentId: consent.id,
        status: consent.consentStatus
      },
      'Consent request Rejected Successfully'
    )
  } catch (error) {
    return errorResponse(res, 'Internal server error', 500)
  }
}
export async function PatientRevokeConsent (req, res) {
  const patientId = req.user.sub // logged-in patient
  const { Id } = req.body
  try {
    const validateRequest = await prisma.consent.findFirst({
      where: {
        id: Id,
        patientId: patientId
      },
      select: {
        consentStatus: true,
        doctorId: true
      }
    })
    if (!validateRequest) {
      return errorResponse(res, 'No Valid Consent Found', 404)
    }
    if (validateRequest.consentStatus === 'PENDING') {
      return errorResponse(
        res,
        'Pending requests must be Rejected, not Revoked.',
        410
      )
    }
    if (
      validateRequest.consentStatus === 'REVOKED' ||
      validateRequest.consentStatus === 'EXPIRED'
    ) {
      return errorResponse(res, 'Consent is already Inactive', 411)
    }
    const consent = await prisma.consent.update({
      where: {
        id: Id,
        patientId: patientId
      },
      data: {
        consentStatus: 'REVOKED'
      }
    })
    await createNotification({
      userId: validateRequest.doctorId,
      role: 'DOCTOR',
      type: 'PATIENT_REVOKED_ACCESS',
      title: 'Access Terminated',
      message: 'A patient has revoked your access to their records.',
      entityId: Id
    })
    return successResponse(
      res,
      {
        consentId: consent.id,
        status: consent.consentStatus
      },
      'Consent Revoked Successfully'
    )
  } catch (error) {
    return errorResponse(res, 'Internal server error', 500)
  }
}
