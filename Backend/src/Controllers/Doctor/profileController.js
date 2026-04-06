import { prisma } from '../../../lib/prisma.js'

import { uploadFileToFirebase } from '../FileUploadControllers/uploadController.js'

import { successResponse, errorResponse } from '../../Utils/apiResponse.js'
import { bucket } from '../../Config/firebase.js'
import { updateDoctorProfileSchema } from '../../schemas/doctor/profileSchema.js'

export async function getDoctorProfile (req, res, next) {
  try {
    const doctorId = req.user.sub // from JWT

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        phone: true,
        dob: true,
        gender: true,
        specialization: true,
        hospital: true,
        experience: true,
        qualification: true,
        profilePhotoKey: true,
        status: true
      }
    })

    if (!doctor) {
      return errorResponse(res, 'Doctor not found', 404)
    }
    // 🔥 ADD THIS: Firebase Signed URL logic
    let signedUrl = null
    if (doctor.profilePhotoKey) {
      const file = bucket.file(doctor.profilePhotoKey)
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000 // 15 mins validity
      })
      signedUrl = url
    }

    // Replace relative path with signed URL before sending response
    const doctorData = {
      ...doctor,
      profilePhotoKey: signedUrl
    }
    return successResponse(
      res,
      doctorData,
      'Doctor profile fetched successfully'
    )
  } catch (err) {
    next(err)
  }
}
export async function updateDoctorProfilePhoto (req, res, next) {
  try {
    const doctorId = req.user.sub

    if (!req.file) {
      return errorResponse(res, 'Profile photo file required', 400)
    }
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { profilePhotoKey: true }
    })

    if (existingDoctor?.profilePhotoKey) {
      const oldFileKey = existingDoctor.profilePhotoKey
      const bucketPath = oldFileKey.includes('storage.googleapis.com')
        ? oldFileKey.split(`${bucket.name}/`)[1]
        : oldFileKey

      const oldFile = bucket.file(bucketPath)
      try {
        await oldFile.delete()
      } catch (err) {
        console.error('Old file not found:', err.message)
      }
    }

    const filePath = `doctors/${doctorId}/profile/photo_${Date.now()}`

    const savedPath = await uploadFileToFirebase(req.file, filePath)

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        profilePhotoKey: savedPath
      },
      select: {
        id: true,
        profilePhotoKey: true
      }
    })

    return successResponse(res, doctor, 'Profile photo updated successfully')
  } catch (err) {
    next(err)
  }
}
export async function updateDoctorProfile (req, res, next) {
  try {
    const doctorId = req.user.sub

    const parsed = updateDoctorProfileSchema.safeParse(req.body)

    if (!parsed.success) {
      return errorResponse(res, parsed.error.issues[0].message, 400)
    }

    const { phone, specialization, hospital, experience, qualification } =
      parsed.data

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        phone,
        specialization,
        hospital,
        experience: experience !== undefined ? Number(experience) : undefined,
        qualification
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        specialization: true,
        hospital: true,
        experience: true,
        qualification: true,
        profilePhotoKey: true
      }
    })

    return successResponse(
      res,
      updatedDoctor,
      'Doctor profile updated successfully'
    )
  } catch (err) {
    next(err)
  }
}
