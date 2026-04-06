import { prisma } from '../../../lib/prisma.js'
import { paginationSchema } from '../../schemas/paginationSchema.js'
import { errorResponse, successResponse } from '../../Utils/apiResponse.js'

// Treatments
export async function getPatientTreatments(req, res) {
  const parsedQuery = paginationSchema.safeParse(req.query)

  if (!parsedQuery.success) {
    return errorResponse(res, parsedQuery.error.issues[0].message, 400)
  }

  const patientId = req.user.sub

  if (req.user.role !== 'PATIENT') {
    return errorResponse(
      res,
      'Only Authorized Patients can access this data',
      403
    )
  }

  const page = Math.max(1, Number(parsedQuery.data.page) || 1)
  const rawLimit = Number(parsedQuery.data.limit) || 10
  const safetyLimit = rawLimit > 50 ? 50 : rawLimit
  const skip = (page - 1) * safetyLimit

  try {
    const [treatments, totalCount] = await Promise.all([
      prisma.treatment.findMany({
        where: { patientId },
        skip,
        take: safetyLimit,
        select: {
          id: true,
          diseaseName: true,
          conditionType: true,
          hospitalOrClinicName: true,
          currentProgress: true,
          progressPercentage: true,
          status: true,
          lastVisitedDate: true,
          nextVisitedDate: true,
          doctor: {
            select: { fullName: true }
          }
        },
        orderBy: { lastVisitedDate: 'desc' }
      }),
      prisma.treatment.count({ where: { patientId } })
    ])

    const totalPages = Math.ceil(totalCount / safetyLimit)

    return successResponse(
      res,
      {
        record: treatments,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit:safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      'Treatments Fetched Successfully'
    )
  } catch (error) {
    console.error('Treatment Pagination Error:', error)
    return errorResponse(res, 'Error fetching treatment records', 500)
  }
}

// Diets
export async function getPatientDiets(req, res) {
  const parsedQuery = paginationSchema.safeParse(req.query)

  if (!parsedQuery.success) {
    return errorResponse(res, parsedQuery.error.issues?.[0].message, 400)
  }

  const patientId = req.user.sub

  if (req.user.role !== 'PATIENT') {
    return errorResponse(
      res,
      'Only Authorized Patients can access this data',
      403
    )
  }

  const page = Math.max(1, Number(parsedQuery.data.page) || 1)
  const rawLimit = Number(parsedQuery.data.limit) || 4
  const limit = Math.max(1, Math.min(rawLimit, 10))
  const skip = (page - 1) * limit

  try {
    const [diets, totalCount] = await Promise.all([
      prisma.diet.findMany({
        where: { patientId },
        skip,
        take: limit,
        orderBy: [{ status: 'asc' }, { startDate: 'desc' }],
        select: {
          dietId: true,
          breakfastItems: true,
          lunchItems: true,
          dinnerItems: true,
          avoidanceRestriction: true,
          startDate: true,
          endDate: true,
          status: true,
          doctorHospitalName: true
        }
      }),
      prisma.diet.count({ where: { patientId } })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return successResponse(
      res,
      {
        record: diets,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      'Diets Fetched Successfully'
    )
  } catch (error) {
    console.error('Diet API Error:', error)
    return errorResponse(res, 'Error fetching diets', 500)
  }
}

// Prescriptions
export async function getPatientPrescriptions(req, res) {
  const parsedQuery = paginationSchema.safeParse(req.query)

  if (!parsedQuery.success) {
    return errorResponse(res, parsedQuery.error.issues?.[0].message, 400)
  }

  const patientId = req.user.sub

  if (req.user.role !== 'PATIENT') {
    return errorResponse(
      res,
      'Only Authorized Patients can access this data',
      403
    )
  }

  const page = Math.max(1, Number(parsedQuery.data.page) || 1)
  const rawLimit = Number(parsedQuery.data.limit) || 10
  const safetyLimit = Math.max(1, Math.min(rawLimit, 50))
  const skip = (page - 1) * safetyLimit

  try {
    // 1. Backend Search Params Pakdo
    const { searchTerm, medicineSystem } = req.query

    // 2. Dynamic 'where' logic
    const where = {
      patientId,
      ...(medicineSystem && { medicineSystem }), // Medicine System Filter
      ...(searchTerm && {
        OR: [
          {
            medicines: {
              some: {
                prescribedMedicineName: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            }
          },
          { diagnosis: { contains: searchTerm, mode: 'insensitive' } },
          { hospitalName: { contains: searchTerm, mode: 'insensitive' } }
        ]
      })
    }

    const [prescriptions, totalCount] = await Promise.all([
      prisma.prescription.findMany({
        where,
        skip,
        take: safetyLimit,
        include: {
          medicines: {
            select: {
              id: true,
              prescribedMedicineName: true,
              brand: true,
              dosage: true,
              frequency: true,
              instructedTime: true
            }
          },
          doctor: {
            select: { fullName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.prescription.count({ where }) // Count mein bhi 'where' hona zaroori hai
    ])

    const totalPages = Math.ceil(totalCount / safetyLimit)

    return successResponse(
      res,
      {
        record: prescriptions,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit: safetyLimit, 
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      'Prescriptions Fetched Successfully'
    )
  } catch (error) {
    console.error('Prescription Pagination Error:', error)
    return errorResponse(
      res,
      'An error occurred while fetching your prescriptions',
      500
    )
  }
}

// Consents
export async function getPatientConsents(req, res) {
  const parsedQuery = paginationSchema.safeParse(req.query)

  if (!parsedQuery.success) {
    return errorResponse(res, parsedQuery.error.issues?.[0].message, 400)
  }

  const patientId = req.user.sub

  if (req.user.role !== 'PATIENT') {
    return errorResponse(
      res,
      'Only Authorized Patients can access this data',
      403
    )
  }

  const page = Math.max(1, Number(parsedQuery.data.page) || 1)
  const rawLimit = Number(parsedQuery.data.limit) || 10
  const safetyLimit = Math.max(1, Math.min(rawLimit, 50))
  const skip = (page - 1) * safetyLimit

  try {
    const where = { patientId }

    const allowedStatuses = [
      'PENDING',
      'ACCEPTED',
      'REVOKED',
      'EXPIRED',
      'REJECTED'
    ]

    if (req.query.status && allowedStatuses.includes(req.query.status)) {
      where.consentStatus = req.query.status
    }

    const [consents, totalCount] = await Promise.all([
      prisma.consent.findMany({
        where,
        skip,
        take: safetyLimit,
        select: {
          id: true,
          requestSentAt: true,
          consentAcceptedAt: true,
          consentExpiresAt: true,
          consentStatus: true,
          updatedAt: true,
          doctor: {
            select: {
              fullName: true,
              specialization: true
            }
          }
        },
        orderBy: [
          { consentStatus: 'asc' },
          { requestSentAt: 'desc' }
        ],
      }),
      prisma.consent.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / safetyLimit)

    return successResponse(
      res,
      {
        record: consents,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit:safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      'Consents Fetched Successfully'
    )
  } catch (error) {
    console.error('Consent Pagination Error:', error)
    return errorResponse(
      res,
      'An error occurred while fetching consent requests',
      500
    )
  }
}

// Vaccinations (UNCHANGED)
export async function getVaccinationHistory(req, res) {
  const patientId = req.user.sub

  if (req.user.role !== 'PATIENT') {
    return errorResponse(
      res,
      'Only Authorized Patients can access this data',
      403
    )
  }

  try {
    const history = await prisma.vaccinationHistory.findMany({
      where: { patientId },
      select: {
        vaccinationId: true,
        vaccineName: true,
        vaccineType: true,
        doseNumber: true,
        vaccineDate: true,
        nextDueDate: true,
        providerName: true,
        hospitalName: true,
        doctor: {
          select: { fullName: true }
        }
      },
      orderBy: { vaccineDate: 'desc' }
    })

    return successResponse(res, history, 'Vaccinations Fetched Successfully')
  } catch (error) {
    console.error('Vaccination Fetch Error:', error)
    return errorResponse(res, 'Server error', 500)
  }
}

// Visits (FIXED WITH ZOD)
export async function getVisitHistory(req, res) {
  const parsedQuery = paginationSchema.safeParse(req.query)

  if (!parsedQuery.success) {
    return errorResponse(res, parsedQuery.error.issues?.[0].message, 400)
  }

  const patientId = req.user.sub

  if (req.user.role !== 'PATIENT') {
    return errorResponse(
      res,
      'Only Authorized Patients can access this data',
      403
    )
  }

  const page = Math.max(1, Number(parsedQuery.data.page) || 1)
  const rawLimit = Number(parsedQuery.data.limit) || 10
  const safetyLimit = Math.max(1, Math.min(rawLimit, 50))
  const skip = (page - 1) * safetyLimit

  try {
    const [visits, totalCount] = await Promise.all([
      prisma.visitHistory.findMany({
        where: { patientId },
        skip,
        take: safetyLimit,
        select: {
          visitId: true,
          hospitalName: true,
          hospitalAddress: true,
          visitDate: true,
          purposeReason: true,
          physicianName: true,
          physicianSpeciality: true,
          doctor: {
            select: { fullName: true }
          }
        },
        orderBy: { visitDate: 'desc' }
      }),
      prisma.visitHistory.count({ where: { patientId } })
    ])

    const totalPages = Math.ceil(totalCount / safetyLimit)

    return successResponse(
      res,
      {
        record: visits,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit:safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      'Visit History Fetched Successfully'
    )
  } catch (error) {
    console.error('Visit History Pagination Error:', error)
    return errorResponse(res, 'Server error', 500)
  }
}
