import { prisma } from '../../../lib/prisma.js'

import { toCleanDate } from '../../Utils/DateUtils.js'

import { successResponse, errorResponse } from '../../Utils/apiResponse.js'

export async function getPatientDashboardData (req, res) {
  const patientId = req.user.sub
  if (req.user.role !== 'PATIENT') {
    return errorResponse(
      res,
      'Only Patients can access their dashboard data',
      403
    )
  }
  try {
    const [
      patient,
      consents,
      labReports,
      activeTreatments,
      diet,
      vaccinations,
      visitHistory
    ] = await Promise.all([
      //{Pateint Basic Details}
      prisma.patient.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          uhid: true,
          fullName: true,
          gender: true,
          dob: true
        }
      }),

      //{Last Consents Data}
      prisma.consent.findMany({
        where: {
          patientId: patientId
        },
        select: {
          id: true,
          doctorId: true,
          consentAcceptedAt: true,
          consentExpiresAt: true,
          consentStatus: true,
          doctor: {
            select: {
              fullName: true
            }
          }
        },
        take: 3,
        orderBy: {
          createdAt: 'desc'
        }
      }),

      // {last three Lab Reports}
      prisma.labReport.findMany({
        where: { patientId, status: 'VERIFIED' },
        select: {
          reportId: true,
          testName: true,
          labName: true,
          collectionDate: true,
          reportDateTime: true,
          remarksNotes: true,
          status: true
        },
        take: 3,
        orderBy: {
          uploadDate: 'desc'
        }
      }),

      // {last 3 Treatement}
      prisma.treatment.findMany({
        where: {
          patientId: patientId,
          status: 'ACTIVE'
        },
        select: {
          id: true,
          diseaseName: true,
          conditionType: true,
          currentProgress: true,
          nextVisitedDate: true,
          lastVisitedDate: true,
          hospitalOrClinicName: true
        },
        take: 3,
        orderBy: {
          lastVisitedDate: 'desc'
        }
      }),

      //{Diet}
      prisma.diet.findMany({
        where: {
          patientId: patientId,
          // OR: [
          //   { endDate: null },
          //   { endDate: { gte: toCleanDate(new Date()) } },
          // ],
          status: 'ACTIVE'
        },
        select: {
          dietId: true,
          dietName: true,
          breakfastItems: true,
          lunchItems: true,
          dinnerItems: true,
          avoidanceRestriction: true,
          startDate: true
        },
        take: 1,
        orderBy: {
          startDate: 'desc'
        }
      }),

      // {Last 3 vaccinations}
      prisma.vaccinationHistory.findMany({
        where: {
          patientId: patientId
        },
        select: {
          vaccinationId: true,
          vaccineName: true,
          vaccineType: true,
          doseNumber: true,
          vaccineDate: true,
          nextDueDate: true
        },
        take: 3,
        orderBy: {
          vaccineDate: 'desc'
        }
      }),

      //{Visit History}
      prisma.visitHistory.findMany({
        where: {
          patientId: patientId
        },
        select: {
          visitId: true,
          doctorId: true,
          purposeReason: true,
          physicianSpeciality: true,
          hospitalName: true,
          visitDate: true
        },
        take: 3,
        orderBy: {
          visitDate: 'desc'
        }
      })
    ])

    return successResponse(
      res,
      {
        profile: patient,
        consents,
        labReports,
        activeTreatments,
        diet,
        vaccinations,
        visitHistory
      },
      'Dashboard data retrieved successfully'
    )
  } catch (error) {
    console.error('Error fetching in Dashboard record:', error)
    return errorResponse(res, 'Failed to fetch your medical records', 500)
  }
}
