import { prisma } from '../../../lib/prisma.js'
import { successResponse, errorResponse } from '../../Utils/apiResponse.js'

export async function getDoctorStatus (req, res, next) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.user.sub }
    })
    if (!doctor) return errorResponse(res, 'Doctor not found', 404)

    return successResponse(
      res,
      {
        status: doctor.status,
        rejectionReason: doctor.rejectionReason,
        submittedAt: doctor.submittedAt
      },
      'Doctor status fetched successfully'
    )
  } catch (err) {
    next(err)
  }
}
