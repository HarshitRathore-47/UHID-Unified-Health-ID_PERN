import { prisma } from '../../../lib/prisma.js'

import { uploadFileToFirebase } from '../FileUploadControllers/uploadController.js'

import { bucket } from '../../Config/firebase.js'

import { updateHealthProfileSchema } from '../../schemas/patient/healthProfileSchema.js'

import { errorResponse, successResponse } from '../../Utils/apiResponse.js'

export async function getHealthProfile (req, res) {
  const patientId = req.user.sub

  if (req.user.role !== 'PATIENT') {
    return errorResponse(res, 'Only patients can access this', 403)
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        fullName: true,
        dob: true,
        gender: true,
        phone: true,
        email: true,
        guardianName: true,
        address: true,
        uhid: true
      }
    })

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { patientId }
    })
    let signedUrl = null

    if (healthProfile?.profilePic) {
      const file = bucket.file(healthProfile.profilePic)

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000
      })

      signedUrl = url
    }
    return successResponse(
      res,
      {
        identity: patient,
        healthData: healthProfile
          ? { ...healthProfile, profilePic: signedUrl }
          : null
      },
      'Health profile data retrieved successfully'
    )
  } catch (error) {
    console.error('Getting Health data Failed :', error)
    return errorResponse(res, 'Error fetching profile')
  }
}

export async function updateHealthProfile (req, res) {
  const parsed = updateHealthProfileSchema.safeParse(req.body)

  if (!parsed.success) {
    console.log(
      'ZOD VALIDATION ERROR:',
      JSON.stringify(parsed.error.format(), null, 2)
    )
    return errorResponse(res, parsed.error.issues?.[0].message, 400)
  }
  const patientId = req.user.sub

  if (req.user.role !== 'PATIENT') {
    return errorResponse(res, 'Only patients can update profile', 403)
  }

  const {
    height,
    weight,
    bp,
    heartRate,
    spO2,
    bloodGroup,
    bloodSugarLevels,
    chronicConditions,
    allergies,
    longTermDiseases,
    smokingStatus,
    alcoholConsumption,
    guardianName
  } = parsed.data

  try {
    const profile = await prisma.healthProfile.upsert({
      where: { patientId },
      update: {
        height,
        weight,
        bp,
        heartRate,
        spO2,
        bloodGroup,
        bloodSugarLevels,
        chronicConditions,
        allergies,
        longTermDiseases,
        smokingStatus,
        alcoholConsumption
      },
      create: {
        patientId,
        height,
        weight,
        bp,
        heartRate,
        spO2,
        bloodGroup,
        bloodSugarLevels,
        chronicConditions,
        allergies,
        longTermDiseases,
        smokingStatus,
        alcoholConsumption
      }
    })
    if (guardianName !== undefined) {
      await prisma.patient.update({
        where: { id: patientId },
        data: { guardianName }
      })
    }

    return successResponse(
      res,
      { ...profile, guardianName },
      'Health profile saved'
    )
  } catch (error) {
    console.error('UPDATE HEALTH PROFILE ERROR:', error)
    return errorResponse(res, 'Error updating profile')
  }
}

export async function uploadProfilePhoto (req, res) {
  const patientId = req.user.sub

  if (!req.file) {
    return errorResponse(res, 'No file uploaded', 400)
  }

  try {
    const existingProfile = await prisma.healthProfile.findUnique({
      where: { patientId }
    })

    if (existingProfile?.profilePic) {
      const oldFile = bucket.file(existingProfile.profilePic)

      try {
        await oldFile.delete()
      } catch (err) {
        console.log('Old file not found or already deleted')
      }
    }
    // 1️⃣ Firebase upload
    const filePath = `patients/${patientId}/profile/profilePhoto_${Date.now()}`
    // 2️⃣ Get public URL
    const savedPath = await uploadFileToFirebase(req.file, filePath)
    // 3️⃣ Prisma update profilePic field
    const updatedProfile = await prisma.healthProfile.upsert({
      where: { patientId },
      update: {
        profilePic: savedPath
      },
      create: {
        patientId,
        profilePic: savedPath
      }
    })

    return successResponse(
      res,
      updatedProfile.profilePic,
      'Photo uploaded successfully'
    )
  } catch (error) {
    console.error('PHOTO UPLOAD ERROR:', error)
    return errorResponse(res, 'Upload failed')
  }
}
