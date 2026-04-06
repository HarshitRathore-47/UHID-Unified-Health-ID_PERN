import { prisma } from '../../../lib/prisma.js'
import { calculateAge } from '../../Utils/DateUtils.js'
import { successResponse, errorResponse } from '../../Utils/apiResponse.js'
import { paginationSchema } from '../../schemas/paginationSchema.js'
import { z } from 'zod'

// 🔥 Search Schema (NEW)
const searchUHIDSchema = z.object({
  uhid: z.string().optional()
})

// 🔍 Search Patient by UHID
export async function searchPatientByUHID (req, res) {
  try {
    const parsed = searchUHIDSchema.safeParse(req.query)

    if (!parsed.success) {
      return errorResponse(res, parsed.error.issues[0].message)
    }

    const { uhid } = parsed.data
    const doctorId = req.user.sub

    if (!uhid || uhid.trim().length < 3) {
      return successResponse(res, [])
    }

    const patients = await prisma.patient.findMany({
      where: {
        uhid: {
          startsWith: uhid.trim(),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        fullName: true,
        uhid: true,
        consents: {
          where: { doctorId },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { consentStatus: true, consentExpiresAt: true }
        }
      },
      take: 5
    })

    const now = new Date()

    const result = patients.map(p => {
      const consent = p.consents[0]

      let consentStatus = 'NONE'

      if (consent) {
        if (
          consent.consentStatus === 'ACCEPTED' &&
          consent.consentExpiresAt &&
          now > consent.consentExpiresAt
        ) {
          consentStatus = 'EXPIRED'
        } else {
          consentStatus = consent.consentStatus
        }
      }

      return {
        id: p.id,
        fullName: p.fullName,
        uhid: p.uhid,
        consentStatus
      }
    })

    return successResponse(res, result)
  } catch (err) {
    return errorResponse(res, 'Failed to search patients')
  }
}

// 📋 Active Consents (WITH PAGINATION VALIDATION)
export async function getActiveConsents (req, res, next) {
  const parsedQuery = paginationSchema.safeParse(req.query)

  if (!parsedQuery.success) {
    return errorResponse(res, parsedQuery.error.issues[0].message)
  }

  const doctorId = req.user.sub
  const now = new Date()

  const page = Math.max(1, Number(parsedQuery.data.page) || 1)
  const rawLimit = Number(parsedQuery.data.limit) || 10
  const safetyLimit = Math.max(1, Math.min(rawLimit, 50))
  const skip = (page - 1) * safetyLimit

  try {
    const where = {
      doctorId: doctorId,
      consentStatus: 'ACCEPTED',
      consentAcceptedAt: { lte: now },
      consentExpiresAt: { gt: now }
    }

    const [consents, totalCount] = await Promise.all([
      prisma.consent.findMany({
        where,
        skip,
        take: safetyLimit,
        select: {
          id: true,
          patientId: true,
          consentStatus: true,
          consentExpiresAt: true,
          patient: {
            select: {
              uhid: true,
              fullName: true,
              dob: true
            }
          }
        },
        orderBy: { consentAcceptedAt: 'desc' }
      }),
      prisma.consent.count({ where })
    ])

    const formattedData = consents.map(item => ({
      id: item.id,
      patientId: item.patientId,
      status: item.consentStatus,
      expiry: item.consentExpiresAt,
      uhid: item.patient.uhid,
      patientName: item.patient.fullName,
      age: item.patient.dob ? calculateAge(item.patient.dob) : '--'
    }))

    const totalPages = Math.ceil(totalCount / safetyLimit)

    return successResponse(
      res,
      {
        record: formattedData,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit: safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      'Active consents fetched successfully'
    )
  } catch (error) {
    console.error('Error fetching active consents:', error)
    return errorResponse(res, 'Failed to fetch active consents')
  }
}
