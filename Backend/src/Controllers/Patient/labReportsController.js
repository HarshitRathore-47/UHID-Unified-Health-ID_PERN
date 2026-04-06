import { prisma } from '../../../lib/prisma.js'
import { reportIdSchema } from '../../schemas/patient/labSchema.js'
import { paginationSchema } from '../../schemas/paginationSchema.js'
import { errorResponse, successResponse } from '../../Utils/apiResponse.js'

// LabReports
export async function getLabreports (req, res) {
  const parsedQuery = paginationSchema.safeParse(req.query)

  if (!parsedQuery.success) {
    return res.status(400).json({
      success: false,
      message: parsedQuery.error.issues?.[0].message
    })
  }

  const patientId = req.user.sub
  if (req.user.role !== 'PATIENT') {
    return errorResponse(
      res,
      'Only Authorized Patient Can access the data',
      403
    )
  }

  const page = Math.max(1, Number(parsedQuery.data.page) || 1)
  const limit = Number(parsedQuery.data.limit) || 10
  const searchTerm = req.query.searchTerm?.trim()

  const safetyLimit = limit > 50 ? 50 : limit
  const skip = (page - 1) * safetyLimit

  try {
    const where = {
      patientId,
      status: 'VERIFIED',
      ...(searchTerm && {
        OR: [
          { testName: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } }
        ]
      })
    }

    const [records, totalCount] = await Promise.all([
      prisma.labReport.findMany({
        where,
        skip: skip,
        take: safetyLimit,
        select: {
          reportId: true,
          testName: true,
          category: true,
          labName: true,
          collectionDate: true,
          reportDateTime: true,
          uploadDate: true,
          status: true
        },
        orderBy: {
          uploadDate: 'desc'
        }
      }),
      prisma.labReport.count({
        where
      })
    ])
    // {total pages}
    const totalPages = Math.ceil(totalCount / safetyLimit)

    //{Response}
    return successResponse(
      res,
      {
        record: records,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit: safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      'Lab reports fetched successfully'
    )
  } catch (error) {
    console.error('Pagination Error:', error)
    return errorResponse(res, 'Failed to fetch lab reports')
  }
}
// Labreport By ID (Details)
export async function getLabReportById (req, res) {
  const parsed = reportIdSchema.safeParse(req.params)

  if (!parsed.success) {
    return errorResponse(res, parsed.error.issues?.[0].message)
  }

  const { reportId } = parsed.data

  const patientId = req.user.sub

  if (req.user.role !== 'PATIENT') {
    return errorResponse(res, 'Access denied: Patient role required', 403)
  }

  try {
    const reportDetail = await prisma.labReport.findFirst({
      where: {
        reportId: reportId,
        patientId: patientId,
        status: 'VERIFIED'
      },
      include: {
        results: {
          select: {
            id: true,
            parameterName: true,
            value: true,
            unit: true,
            referenceRange: true,
            statusFlag: true
          },
          orderBy: { createdAt: 'asc' }
        },
        doctor: {
          select: { fullName: true }
        }
      }
    })

    if (!reportDetail) {
      return errorResponse(res, 'Lab report not found or unauthorized', 404)
    }

    const { results, ...reportInfo } = reportDetail

    return successResponse(
      res,
      {
        reportInfo,
        results
      },
      'Lab report details fetched successfully'
    )
  } catch (error) {
    console.error('Lab Detail API Error:', error)
    return errorResponse(res, 'Internal server error fetching report details')
  }
}
