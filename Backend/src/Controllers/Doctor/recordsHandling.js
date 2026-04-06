import { prisma } from '../../../lib/prisma.js'
import { toCleanDate, calculateAge } from '../../Utils/DateUtils.js'

import { createNotification } from '../../Utils/Notify.js'
import { successResponse, errorResponse } from '../../Utils/apiResponse.js'
import {
  prescriptionSchema,
  treatmentSchema,
  manualLabReportSchema
} from '../../schemas/doctor/manualRecordSchema.js'

export async function getPatientFullRecord (req, res) {
  const { patientId } = req.params
  const doctorId = req.user.sub // useful for filtering doctor's records

  try {
    // 1️⃣ Patient basic profile (TOP CARD)
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        uhid: true,
        fullName: true,
        gender: true,
        dob: true
      }
    })

    if (!patient) {
      return errorResponse(res, 'Patient not found', 404)
    }

    // 2️⃣ Prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId: patientId,
        doctorId: doctorId
      },
      include: {
        medicines: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 3️⃣ Lab Reports
    const labReports = await prisma.labReport.findMany({
      where: { patientId },
      select: {
        reportId: true,
        doctorId: true,
        testName: true,
        labName: true,
        collectionDate: true,
        reportDateTime: true,
        remarksNotes: true,
        status: true,
        results: {
          select: {
            parameterName: true,
            value: true,
            unit: true,
            referenceRange: true,
            statusFlag: true
          }
        }
      },
      orderBy: {
        collectionDate: 'desc'
      }
    })

    const Treatments = await prisma.treatment.findMany({
      where: {
        patientId: patientId
      },
      select: {
        id: true,
        diseaseName: true,
        conditionType: true,
        currentProgress: true,
        nextVisitedDate: true,
        lastVisitedDate: true,
        hospitalOrClinicName: true,
        status: true,
        doctorId: true
      },
      orderBy: {
        lastVisitedDate: 'desc'
      }
    })
    const Diet = await prisma.diet.findMany({
      where: {
        patientId: patientId
      },
      select: {
        dietId: true,
        dietName: true,
        breakfastItems: true,
        lunchItems: true,
        dinnerItems: true,
        avoidanceRestriction: true,
        startDate: true,
        endDate: true,
        status: true,
        doctorId: true
      },
      orderBy: {
        startDate: 'desc'
      }
    })
    const vaccinations = await prisma.vaccinationHistory.findMany({
      where: {
        patientId: patientId
      },
      select: {
        vaccinationId: true,
        doctorId: true,
        vaccineName: true,
        vaccineType: true,
        doseNumber: true,
        vaccineDate: true,
        nextDueDate: true
      },
      orderBy: {
        vaccineDate: 'desc'
      }
    })
    const visitHistory = await prisma.visitHistory.findMany({
      where: {
        patientId: patientId
      },
      select: {
        visitId: true,
        doctorId: true,
        purposeReason: true,
        physicianSpeciality: true,
        hospitalName: true,
        visitDate: true,
        hospitalAddress: true,
        physicianName: true
      },
      orderBy: {
        visitDate: 'desc'
      }
    })

    return successResponse(
      res,
      {
        profile: patient,
        prescriptions,
        labReports,
        Treatments,
        Diet,
        vaccinations,
        visitHistory
      },
      'Patient medical record fetched successfully'
    )
  } catch (error) {
    console.error('Error fetching patient full record:', error)
    return errorResponse(res, 'Failed to fetch patient medical record')
  }
}
export async function createPrescription (req, res) {
  const parsed = prescriptionSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, parsed.error.issues[0].message, 400)
  }

  const { diagnosis, medicineSystem, medicines } = parsed.body

  const { patientId } = req.params
  const doctorId = req.user.sub

  // if (!diagnosis || !Array.isArray(medicines) || medicines.length === 0) {
  //     return errorResponse(
  //         res,
  //         "Diagnosis and at least one medicine are required",
  //         400,
  //     );
  // }

  // // Validate each medicine
  // for (const med of medicines) {
  //     if (!med.prescribedMedicineName || !med.dosage || !med.frequency) {
  //         return errorResponse(
  //             res,
  //             "Each medicine must include name, dosage, and frequency",
  //             400,
  //         );
  //     }
  // }

  try {
    const newPrescription = await prisma.prescription.create({
      data: {
        diagnosis,
        medicineSystem,
        doctorId,
        patientId,
        medicines: {
          create: medicines
        }
      },
      include: {
        medicines: true
      }
    })
    await createNotification({
      userId: patientId,
      role: 'PATIENT',
      type: 'PRESCRIPTION_ADDED',
      title: 'New Prescription Added',
      message: 'Your doctor has added a new prescription.',
      entityId: newPrescription.id
    })
    return successResponse(
      res,
      newPrescription,
      'Prescription created successfully',
      201
    )
  } catch (error) {
    console.error('Create prescription error:', error)
    return errorResponse(res, 'Failed to create prescription')
  }
}

export async function createTreatment (req, res) {
  const parsed = treatmentSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, parsed.error.issues[0].message, 400)
  }

  const {
    conditionType,
    diseaseName,
    hospitalOrClinicName,
    nextVisitedDate,
    currentProgress,
    progressPercentage
  } = parsed.body

  const { patientId } = req.params
  const doctorId = req.user.sub

  // if (!conditionType || !diseaseName || !hospitalOrClinicName) {
  //     return errorResponse(res, "Missing required treatment fields", 400);
  // }
  // if (progressPercentage < 0 || progressPercentage > 100) {
  //     return errorResponse(res, "Invalid progress value", 400);
  // }

  try {
    const newTreatment = await prisma.treatment.create({
      data: {
        conditionType,
        diseaseName,
        hospitalOrClinicName,
        lastVisitedDate: toCleanDate(new Date()),
        nextVisitedDate: nextVisitedDate ? toCleanDate(nextVisitedDate) : null,
        currentProgress,
        progressPercentage,
        status: 'ACTIVE',
        patient: {
          connect: { id: patientId }
        },
        doctor: {
          connect: { id: doctorId }
        }
      }
    })
    await createNotification({
      userId: patientId,
      role: 'PATIENT',
      type: 'TREATMENT_ADDED',
      title: 'New Treatment Added',
      message: 'Your doctor added a new treatment plan.',
      entityId: newTreatment.id
    })

    return successResponse(
      res,
      newTreatment,
      'Active treatment added successfully',
      201
    )
  } catch (error) {
    console.error('Error creating active treatment:', error)
    return errorResponse(res, 'Failed to add active treatment')
  }
}
export async function createDiet (req, res) {
  const {
    dietName,
    breakfastItems,
    lunchItems,
    dinnerItems,
    avoidanceRestriction,
    startDate,
    endDate,
    doctorHospitalName
  } = req.body
  const { patientId } = req.params
  const doctorId = req.user.sub

  if (!dietName || !startDate) {
    return errorResponse(res, 'Missing required diet fields', 400)
  }

  try {
    const newDiet = await prisma.diet.create({
      data: {
        dietName,
        breakfastItems: breakfastItems || [],
        lunchItems: lunchItems || [],
        dinnerItems: dinnerItems || [],
        avoidanceRestriction: avoidanceRestriction || [],
        startDate: toCleanDate(startDate),
        endDate: endDate ? toCleanDate(endDate) : null,
        doctorHospitalName,
        patientId,
        doctorId
      }
    })
    await createNotification({
      userId: patientId,
      role: 'PATIENT',
      type: 'DIET_UPDATED',
      title: 'Diet Plan Updated',
      message: 'Your diet plan has been updated.',
      entityId: newDiet.dietId
    })

    return successResponse(res, newDiet, 'Diet plan added successfully', 201)
  } catch (error) {
    console.error('Error creating diet:', error)
    return errorResponse(res, 'Failed to add diet plan')
  }
}
export async function createLabReport (req, res) {
  const parsed = manualLabReportSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, parsed.error.issues[0].message, 400)
  }

  const doctorId = req.user.sub
  const { patientId } = req.params
  const {
    testName,
    category,
    labName,
    labLocation,
    technicianName,
    doctorInCharge,
    collectionDate,
    uploadFormat,
    fileKey,
    remarksNotes,
    results // Yeh array hona chahiye: [{parameterName, value, unit...}]
  } = parsed.data

  // Validation: Kam se kam ek result hona chahiye
  if (
    !testName ||
    !labName ||
    !Array.isArray(results) ||
    results.length === 0
  ) {
    return errorResponse(res, 'Missing report details or results array.', 400)
  }

  try {
    const newReport = await prisma.labReport.create({
      data: {
        patientId,
        doctorId,
        testName,
        category,
        labName,
        labLocation,
        technicianName,
        doctorInCharge,
        uploadFormat,
        fileKey,
        remarksNotes,
        collectionDate: collectionDate ? toCleanDate(collectionDate) : null,
        reportDateTime: new Date(),
        isDigitized: true,
        status: 'VERIFIED',
        // Nested creation of multiple results
        results: {
          create: parsed.data.results
        }
      },
      include: {
        results: true // Response mein results bhi dikhenge
      }
    })
    await createNotification({
      userId: patientId,
      role: 'PATIENT',
      type: 'LAB_UPLOADED',
      title: 'Lab Report Uploaded',
      message: 'A new lab report has been uploaded.',
      entityId: newReport.reportId
    })

    return successResponse(
      res,
      newReport,
      'Lab report and results added successfully',
      201
    )
  } catch (error) {
    console.error('Error:', error)
    return errorResponse(res, 'Failed to create LabReport', 500)
  }
}
export async function createVaccinationRecord (req, res) {
  const doctorId = req.user.sub
  const {
    vaccineName,
    vaccineType,
    doseNumber,
    vaccineDate,
    nextDueDate,
    providerName,
    batchNumber,
    hospitalName
  } = req.body
  const { patientId } = req.params

  if (!vaccineName || !vaccineDate) {
    return errorResponse(res, 'Missing required vaccination fields', 400)
  }

  try {
    const newVaccination = await prisma.vaccinationHistory.create({
      data: {
        vaccineName,
        vaccineType,
        doseNumber: parseInt(doseNumber),
        vaccineDate: toCleanDate(vaccineDate),
        nextDueDate: nextDueDate ? toCleanDate(nextDueDate) : null,
        providerName,
        batchNumber,
        hospitalName,
        patientId,
        doctorId
      }
    })
    await createNotification({
      userId: patientId,
      role: 'PATIENT',
      type: 'VACCINATION_ADDED',
      title: 'Vaccination Record Updated',
      message: 'A new vaccination record has been added.',
      entityId: newVaccination.vaccinationId
    })
    return successResponse(
      res,
      newVaccination,
      'Vaccination record added successfully',
      201
    )
  } catch (error) {
    console.error('Error creating vaccination record:', error)
    return errorResponse(res, 'Failed to add vaccination record')
  }
}
export async function createVisitRecord (req, res) {
  const doctorId = req.user.sub
  const {
    hospitalName,
    hospitalAddress,
    visitDate,
    purposeReason,
    physicianName,
    physicianSpeciality
  } = req.body
  const { patientId } = req.params

  if (!hospitalName || !visitDate || !purposeReason) {
    return errorResponse(res, 'Missing required visit fields', 400)
  }

  try {
    const newVisit = await prisma.visitHistory.create({
      data: {
        hospitalName,
        hospitalAddress,
        visitDate: toCleanDate(visitDate),
        purposeReason,
        physicianName,
        physicianSpeciality,
        patientId,
        doctorId
      }
    })
    await createNotification({
      userId: patientId,
      role: 'PATIENT',
      type: 'VISIT_RECORDED',
      title: 'New Visit Recorded',
      message: 'A new hospital visit has been recorded.',
      entityId: newVisit.visitId
    })
    return successResponse(
      res,
      newVisit,
      'Visit record added successfully',
      201
    )
  } catch (error) {
    console.error('Error creating visit record:', error)
    return errorResponse(res, 'Failed to add visit record')
  }
}
export async function verifyLabReport (req, res) {
  const doctorId = req.user.sub
  const { reportId } = req.params

  try {
    const report = await prisma.labReport.findUnique({
      where: { reportId }
    })

    if (!report) {
      return errorResponse(res, 'Lab report not found', 404)
    }

    if (report.status !== 'PENDING') {
      return errorResponse(res, 'Only pending reports can be verified', 400)
    }

    const updatedReport = await prisma.labReport.update({
      where: { reportId },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: doctorId,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null
      }
    })
    await createNotification({
      userId: report.patientId,
      role: 'PATIENT',
      type: 'LAB_VERIFIED',
      title: 'Lab Report Verified',
      message: 'Your lab report has been verified.',
      entityId: reportId
    })

    return successResponse(
      res,
      updatedReport,
      'Lab report verified successfully',
      200
    )
  } catch (error) {
    console.error('Verify lab report error:', error)
    return errorResponse(res, 'Failed to verify lab report')
  }
}
export async function rejectLabReport (req, res) {
  const { reportId } = req.params
  const { rejectionReason } = req.body // Logic ke liye reason zaroori hai

  if (!rejectionReason) {
    return errorResponse(res, 'Rejection reason is required', 400)
  }

  try {
    const report = await prisma.labReport.findUnique({
      where: { reportId }
    })

    if (!report) {
      return errorResponse(res, 'Lab report not found', 404)
    }

    // Status check taaki verified records galti se delete na hon
    if (report.status !== 'PENDING') {
      return errorResponse(res, 'Only pending reports can be rejected', 400)
    }

    // DB se poori tarah delete karne ke liye
    await prisma.labReport.delete({
      where: { reportId }
    })

    return successResponse(
      res,
      {}, // Empty data kyunki record ab exist nahi karta
      'Lab report rejected and removed from database successfully',
      200
    )
  } catch (error) {
    console.error('Reject lab report error:', error)
    return errorResponse(res, 'Failed to reject and delete lab report')
  }
}
