// src/Controllers/doctorController.js
import {
  hashPassword,
  createJwt,
  hashPlainOtp,
  OTP_TTL_MS,
  sendOtpEmail,
} from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";
import { toCleanDate, calculateAge } from "../Utils/DateUtils.js";
import { uploadFileToFirebase } from "./FileUploadControllers/uploadController.js";
import { createNotification } from "../Utils/Notify.js";
import { successResponse, errorResponse } from "../Utils/apiResponse.js";
import { bucket } from "../Config/firebase.js";

/**
 * registerDoctor(req,res)
 * Body: { fullName, phone, email, password, licenseNumber, specialization, hospital, experience, qualification }
 */
export async function registerDoctor(req, res, next) {
  try {
    const {
      fullName,
      dob,
      gender,
      phone,
      userName,
      email,
      password,
      licenseNumber,
      specialization,
      hospital,
      experience,
      qualification,
      verifyOtpId,
    } = req.body;

    const normalizedUserName = userName?.toLowerCase().trim();

    // 1️⃣ verifyOtpId is mandatory
    if (!verifyOtpId) {
      return errorResponse(res, "OTP verification required", 400);
    }

    // 2️⃣ Validate OTP session
    const authOtp = await prisma.authOtp.findUnique({
      where: { id: verifyOtpId },
    });

    if (!authOtp || !authOtp.verified) {
      return errorResponse(res, "OTP not verified or session expired", 400);
    }

    // Optional safety: ensure the email used to request OTP is the same as registration email
    if (authOtp.email && authOtp.email !== req.body.email) {
      return errorResponse(res, "OTP email mismatch", 400);
    }

    // 3️⃣ Basic required fields
    if (!email || !password || !licenseNumber || !fullName) {
      return errorResponse(res, "Missing required fields", 400);
    }

    if (
      !normalizedUserName ||
      normalizedUserName.length < 8 ||
      normalizedUserName.length > 15 ||
      !/^[a-z0-9_.]+$/.test(normalizedUserName)
    ) {
      return errorResponse(
        res,
        "Username must be 8-15 characters and contain only lowercase letters, numbers, _ or .",
        400,
        "userName",
      );
    }

    // 4️⃣ Uniqueness checks (IMPORTANT)
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { email },
          { phone },
          { userName }, // make sure naming matches schema
        ],
      },
    });

    if (existingDoctor) {
      // EMAIL conflict
      if (existingDoctor?.email === email) {
        return errorResponse(
          res,
          "Email is already associated with another account",
          409,
          "email",
        );
      }

      // PHONE conflict
      if (existingDoctor?.phone === phone) {
        return errorResponse(
          res,
          "Phone number is already associated with another account",
          409,
          "phone",
        );
      }

      // USERNAME conflict (doctor-only)
      if (existingDoctor?.userName === userName) {
        return errorResponse(res, "Username is already taken", 409, "userName");
      }
    }

    // 5️⃣ Create doctor
    const passwordHash = await hashPassword(password);

    if (!req.file) {
      return errorResponse(res, "License certificate is required", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.create({
        data: {
          fullName,
          dob: dob ? toCleanDate(dob) : null,
          gender,
          phone,
          userName,
          email,
          passwordHash,
          licenseNumber,
          specialization,
          hospital,
          experience: experience ? Number(experience) : null,
          qualification,
          status: "PENDING",
        },
      });

      if (req.file) {
        const filePath = `doctors/${doctor.id}/documents/license_${Date.now()}`;
        const savedPath = await uploadFileToFirebase(req.file, filePath);

        await tx.doctorDocument.create({
          data: {
            doctorId: doctor.id,
            type: "LICENSE",
            fileKey: savedPath,
            fileName: req.file.originalname,
            mimeType: req.file.mimetype,
          },
        });
      }

      await tx.authOtp.update({
        where: { id: verifyOtpId },
        data: { doctorId: doctor.id },
      });

      return doctor;
    });

    const token = createJwt({
      sub: result.id,
      role: "DOCTOR",
      email: result.email,
    });

    //  SET COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    await createNotification({
      userId:adminId, // or actual admin id
      role: "ADMIN",
      type: "ADMIN_DOCTOR_PENDING",
      title: "New Doctor Registration",
      message: `${doctor.fullName} submitted documents`,
    });
    // Final response (NO OTP here)
    successResponse(
      res,
      { id: result.id, statusUrl: `/api/doctors/${result.id}/status` },
      "Doctor registered successfully. Pending admin approval.",
      200,
    );
  } catch (err) {
    console.error("REGISTER DOCTOR ERROR:", err);
    next(err);
  }
}
/**
 * loginDoctorStep1(req,res)
 * Body: { identifier, password }
 */
export async function loginDoctorStep1(req, res, next) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return errorResponse(res, "Missing credentials", 400);

    const doctor = await prisma.doctor.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!doctor) return errorResponse(res, "Invalid credentials", 400);

    const ok = await import("../../lib/auth.js").then((m) =>
      m.comparePassword(password, doctor.passwordHash || ""),
    );
    if (!ok) {
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { failedLoginAttempts: doctor.failedLoginAttempts + 1 },
      });
      return errorResponse(res, "Invalid credentials");
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = hashPlainOtp(otp);
    const authOtp = await prisma.authOtp.create({
      data: {
        doctorId: doctor.id,
        userType: "DOCTOR",
        purpose: "LOGIN",
        otpHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    if (doctor.email) await sendOtpEmail(doctor.email, otp, "LOGIN");

    successResponse(res, { tempLoginId: authOtp.id }, "OTP sent to email");
  } catch (err) {
    next(err);
  }
}
export async function getDoctorProfile(req, res, next) {
  try {
    const doctorId = req.user.sub; // from JWT

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
        status: true,
      },
    });

    if (!doctor) {
      return errorResponse(res, "Doctor not found", 404);
    }
    // 🔥 ADD THIS: Firebase Signed URL logic
    let signedUrl = null;
    if (doctor.profilePhotoKey) {
      const file = bucket.file(doctor.profilePhotoKey);
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 mins validity
      });
      signedUrl = url;
    }

    // Replace relative path with signed URL before sending response
    const doctorData = {
      ...doctor,
      profilePhotoKey: signedUrl,
    };
    return successResponse(
      res,
      doctorData,
      "Doctor profile fetched successfully",
    );
  } catch (err) {
    next(err);
  }
}
export async function updateDoctorProfilePhoto(req, res, next) {
  try {
    const doctorId = req.user.sub;

    if (!req.file) {
      return errorResponse(res, "Profile photo file required", 400);
    }
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { profilePhotoKey: true },
    });

    if (existingDoctor?.profilePhotoKey) {
      const oldFileKey = existingDoctor.profilePhotoKey;
      const bucketPath = oldFileKey.includes("storage.googleapis.com")
        ? oldFileKey.split(`${bucket.name}/`)[1]
        : oldFileKey;

      const oldFile = bucket.file(bucketPath);
      try {
        await oldFile.delete();
      } catch (err) {
        console.error("Old file not found:", err.message);
      }
    }

    const filePath = `doctors/${doctorId}/profile/photo_${Date.now()}`;

    const savedPath = await uploadFileToFirebase(req.file, filePath);

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        profilePhotoKey: savedPath,
      },
      select: {
        id: true,
        profilePhotoKey: true,
      },
    });

    return successResponse(res, doctor, "Profile photo updated successfully");
  } catch (err) {
    next(err);
  }
}
/**
 * getDoctorStatus(req,res)
 * GET /api/doctors/:id/status
 */
export async function getDoctorStatus(req, res, next) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.user.sub },
    });
    if (!doctor) return errorResponse(res, "Doctor not found", 404);

    return successResponse(
      res,
      {
        status: doctor.status,
        rejectionReason: doctor.rejectionReason,
        submittedAt: doctor.submittedAt,
      },
      "Doctor status fetched successfully",
    );
  } catch (err) {
    next(err);
  }
}
export async function updateDoctorProfile(req, res, next) {
  try {
    const doctorId = req.user.sub;

    const { phone, specialization, hospital, experience, qualification } =
      req.body;

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        phone,
        specialization,
        hospital,
        experience: experience ? Number(experience) : null,
        qualification,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        specialization: true,
        hospital: true,
        experience: true,
        qualification: true,
        profilePhotoKey: true,
      },
    });

    return successResponse(
      res,
      updatedDoctor,
      "Doctor profile updated successfully",
    );
  } catch (err) {
    next(err);
  }
}

export async function searchPatientByUHID(req, res) {
  try {
    const { uhid } = req.query;
    const doctorId = req.user.sub;

    if (!uhid || uhid.trim().length < 3) {
      return successResponse(res, []);
    }

    const patients = await prisma.patient.findMany({
      where: {
        uhid: {
          startsWith: uhid.trim(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        fullName: true,
        uhid: true,
        consents: {
          where: { doctorId },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { consentStatus: true, consentExpiresAt: true },
        },
      },
      take: 5,
    });

    const now = new Date(); // ⭐ ADD THIS

    const result = patients.map((p) => {
      const consent = p.consents[0];

      let consentStatus = "NONE";

      if (consent) {
        if (
          consent.consentStatus === "ACCEPTED" &&
          consent.consentExpiresAt &&
          now > consent.consentExpiresAt
        ) {
          consentStatus = "EXPIRED"; // ⭐ expiry detected
        } else {
          consentStatus = consent.consentStatus;
        }
      }

      return {
        id: p.id,
        fullName: p.fullName,
        uhid: p.uhid,
        consentStatus,
      };
    });

    return successResponse(res, result);
  } catch (err) {
    return errorResponse(res, "Failed to search patients");
  }
}

export async function getActiveConsents(req, res, next) {
  const doctorId = req.user.sub;
  const now = new Date();

  const page = Math.max(1, Number(req.query.page) || 1);
  const rawLimit = Number(req.query.limit) || 10;
  const safetyLimit = Math.max(1, Math.min(rawLimit, 50));
  const skip = (page - 1) * safetyLimit;

  try {
    const where = {
      doctorId: doctorId,
      consentStatus: "ACCEPTED",
      consentAcceptedAt: { lte: now },
      consentExpiresAt: { gt: now },
    };

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
              dob: true,
            },
          },
        },
        orderBy: { consentAcceptedAt: "desc" },
      }),
      prisma.consent.count({ where }),
    ]);

    const formattedData = consents.map((item) => ({
      id: item.id,
      patientId: item.patientId,
      status: item.consentStatus,
      expiry: item.consentExpiresAt,
      uhid: item.patient.uhid,
      patientName: item.patient.fullName,
      age: item.patient.dob ? calculateAge(item.patient.dob) : "--",
    }));

    const totalPages = Math.ceil(totalCount / safetyLimit);

    // ✅ Using your successResponse helper with correct shape
    return successResponse(
      res,
      {
        record: formattedData, // usePaginatedResource expects 'record'
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit: safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      "Active consents fetched successfully",
    );
  } catch (error) {
    console.error("Error fetching active consents:", error);
    // ✅ Using your errorResponse helper
    return errorResponse(res, "Failed to fetch active consents");
  }
}
export async function getPatientFullRecord(req, res) {
  const { patientId } = req.params;
  const doctorId = req.user.sub; // useful for filtering doctor's records

  try {
    // 1️⃣ Patient basic profile (TOP CARD)
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        uhid: true,
        fullName: true,
        gender: true,
        dob: true,
      },
    });

    if (!patient) {
      return errorResponse(res, "Patient not found", 404);
    }

    // 2️⃣ Prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patientId: patientId,
        doctorId: doctorId, // optional but recommended
      },
      include: {
        medicines: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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
            statusFlag: true,
          },
        },
      },
      orderBy: {
        collectionDate: "desc",
      },
    });

    const Treatments = await prisma.treatment.findMany({
      where: {
        patientId: patientId,
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
        doctorId: true,
      },
      orderBy: {
        lastVisitedDate: "desc",
      },
    });
    const Diet = await prisma.diet.findMany({
      where: {
        patientId: patientId,
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
        doctorId: true,
      },
      orderBy: {
        startDate: "desc",
      },
    });
    const vaccinations = await prisma.vaccinationHistory.findMany({
      where: {
        patientId: patientId,
      },
      select: {
        vaccinationId: true,
        doctorId: true,
        vaccineName: true,
        vaccineType: true,
        doseNumber: true,
        vaccineDate: true,
        nextDueDate: true,
      },
      orderBy: {
        vaccineDate: "desc",
      },
    });
    const visitHistory = await prisma.visitHistory.findMany({
      where: {
        patientId: patientId,
      },
      select: {
        visitId: true,
        doctorId: true,
        purposeReason: true,
        physicianSpeciality: true,
        hospitalName: true,
        visitDate: true,
        hospitalAddress: true,
        physicianName: true,
      },
      orderBy: {
        visitDate: "desc",
      },
    });

    return successResponse(
      res,
      {
        profile: patient,
        prescriptions,
        labReports,
        Treatments,
        Diet,
        vaccinations,
        visitHistory,
      },
      "Patient medical record fetched successfully",
    );
  } catch (error) {
    console.error("Error fetching patient full record:", error);
    return errorResponse(res, "Failed to fetch patient medical record");
  }
}
export async function createPrescription(req, res) {
  const { diagnosis, medicineSystem, medicines } = req.body;

  const { patientId } = req.params;
  const doctorId = req.user.sub;

  if (!diagnosis || !Array.isArray(medicines) || medicines.length === 0) {
    return errorResponse(
      res,
      "Diagnosis and at least one medicine are required",
      400,
    );
  }

  // Validate each medicine
  for (const med of medicines) {
    if (!med.prescribedMedicineName || !med.dosage || !med.frequency) {
      return errorResponse(
        res,
        "Each medicine must include name, dosage, and frequency",
        400,
      );
    }
  }

  try {
    const newPrescription = await prisma.prescription.create({
      data: {
        diagnosis,
        medicineSystem,
        doctorId,
        patientId,
        medicines: {
          create: medicines.map((med) => ({
            prescribedMedicineName: med.prescribedMedicineName,
            brand: med.brand,
            dosage: med.dosage,
            frequency: med.frequency,
            instructedTime: med.instructedTime,
          })),
        },
      },
      include: {
        medicines: true,
      },
    });
    await createNotification({
      userId: patientId,
      role: "PATIENT",
      type: "PRESCRIPTION_ADDED",
      title: "New Prescription Added",
      message: "Your doctor has added a new prescription.",
      entityId: newPrescription.id,
    });
    return successResponse(
      res,
      newPrescription,
      "Prescription created successfully",
      201,
    );
  } catch (error) {
    console.error("Create prescription error:", error);
    return errorResponse(res, "Failed to create prescription");
  }
}

export async function createTreatment(req, res) {
  const {
    conditionType,
    diseaseName,
    hospitalOrClinicName,
    nextVisitedDate,
    currentProgress,
    progressPercentage,
  } = req.body;

  const { patientId } = req.params;
  const doctorId = req.user.sub;

  if (!conditionType || !diseaseName || !hospitalOrClinicName) {
    return errorResponse(res, "Missing required treatment fields", 400);
  }
  if (progressPercentage < 0 || progressPercentage > 100) {
    return errorResponse(res, "Invalid progress value", 400);
  }

  try {
    const newTreatment = await prisma.treatment.create({
      data: {
        conditionType,
        diseaseName,
        hospitalOrClinicName,
        lastVisitedDate: toCleanDate(new Date()),
        nextVisitedDate: nextVisitedDate ? toCleanDate(nextVisitedDate) : null,
        currentProgress,
        status: "ACTIVE",
        patient: {
          connect: { id: patientId },
        },
        doctor: {
          connect: { id: doctorId },
        },
      },
    });
    await createNotification({
      userId: patientId,
      role: "PATIENT",
      type: "TREATMENT_ADDED",
      title: "New Treatment Added",
      message: "Your doctor added a new treatment plan.",
      entityId: newTreatment.id,
    });

    return successResponse(
      res,
      newTreatment,
      "Active treatment added successfully",
      201,
    );
  } catch (error) {
    console.error("Error creating active treatment:", error);
    return errorResponse(res, "Failed to add active treatment");
  }
}
export async function createDiet(req, res) {
  const {
    dietName,
    breakfastItems,
    lunchItems,
    dinnerItems,
    avoidanceRestriction,
    startDate,
    endDate,
    doctorHospitalName,
  } = req.body;
  const { patientId } = req.params;
  const doctorId = req.user.sub;

  if (!dietName || !startDate) {
    return errorResponse(res, "Missing required diet fields", 400);
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
        doctorId,
      },
    });
    await createNotification({
      userId: patientId,
      role: "PATIENT",
      type: "DIET_UPDATED",
      title: "Diet Plan Updated",
      message: "Your diet plan has been updated.",
      entityId: newDiet.dietId,
    });

    return successResponse(res, newDiet, "Diet plan added successfully", 201);
  } catch (error) {
    console.error("Error creating diet:", error);
    return errorResponse(res, "Failed to add diet plan");
  }
}
export async function createLabReport(req, res) {
  const doctorId = req.user.sub;
  const { patientId } = req.params;
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
    results, // Yeh array hona chahiye: [{parameterName, value, unit...}]
  } = req.body;

  // Validation: Kam se kam ek result hona chahiye
  if (
    !testName ||
    !labName ||
    !Array.isArray(results) ||
    results.length === 0
  ) {
    return errorResponse(res, "Missing report details or results array.", 400);
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
        status: "VERIFIED",
        // Nested creation of multiple results
        results: {
          create: results.map((item) => ({
            parameterName: item.parameterName,
            value: item.value,
            unit: item.unit,
            referenceRange: item.referenceRange,
            statusFlag: item.statusFlag,
          })),
        },
      },
      include: {
        results: true, // Response mein results bhi dikhenge
      },
    });
    await createNotification({
      userId: patientId,
      role: "PATIENT",
      type: "LAB_UPLOADED",
      title: "Lab Report Uploaded",
      message: "A new lab report has been uploaded.",
      entityId: newReport.reportId,
    });

    return successResponse(
      res,
      newReport,
      "Lab report and results added successfully",
      201,
    );
  } catch (error) {
    console.error("Error:", error);
    return errorResponse(res, "Failed to create LabReport", 500);
  }
}
export async function createVaccinationRecord(req, res) {
  const doctorId = req.user.sub;
  const {
    vaccineName,
    vaccineType,
    doseNumber,
    vaccineDate,
    nextDueDate,
    providerName,
    batchNumber,
    hospitalName,
  } = req.body;
  const { patientId } = req.params;

  if (!vaccineName || !vaccineDate) {
    return errorResponse(res, "Missing required vaccination fields", 400);
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
        doctorId,
      },
    });
    await createNotification({
      userId: patientId,
      role: "PATIENT",
      type: "VACCINATION_ADDED",
      title: "Vaccination Record Updated",
      message: "A new vaccination record has been added.",
      entityId: newVaccination.vaccinationId,
    });
    return successResponse(
      res,
      newVaccination,
      "Vaccination record added successfully",
      201,
    );
  } catch (error) {
    console.error("Error creating vaccination record:", error);
    return errorResponse(res, "Failed to add vaccination record");
  }
}
export async function createVisitRecord(req, res) {
  const doctorId = req.user.sub;
  const {
    hospitalName,
    hospitalAddress,
    visitDate,
    purposeReason,
    physicianName,
    physicianSpeciality,
  } = req.body;
  const { patientId } = req.params;

  if (!hospitalName || !visitDate || !purposeReason) {
    return errorResponse(res, "Missing required visit fields", 400);
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
        doctorId,
      },
    });
    await createNotification({
      userId: patientId,
      role: "PATIENT",
      type: "VISIT_RECORDED",
      title: "New Visit Recorded",
      message: "A new hospital visit has been recorded.",
      entityId: newVisit.visitId,
    });
    return successResponse(
      res,
      newVisit,
      "Visit record added successfully",
      201,
    );
  } catch (error) {
    console.error("Error creating visit record:", error);
    return errorResponse(res, "Failed to add visit record");
  }
}
export async function verifyLabReport(req, res) {
  const doctorId = req.user.sub;
  const { reportId } = req.params;

  try {
    const report = await prisma.labReport.findUnique({
      where: { reportId },
    });

    if (!report) {
      return errorResponse(res, "Lab report not found", 404);
    }

    if (report.status !== "PENDING") {
      return errorResponse(res, "Only pending reports can be verified", 400);
    }

    const updatedReport = await prisma.labReport.update({
      where: { reportId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: doctorId,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null,
      },
    });
    await createNotification({
      userId: report.patientId,
      role: "PATIENT",
      type: "LAB_VERIFIED",
      title: "Lab Report Verified",
      message: "Your lab report has been verified.",
      entityId: reportId,
    });

    return successResponse(
      res,
      updatedReport,
      "Lab report verified successfully",
      200,
    );
  } catch (error) {
    console.error("Verify lab report error:", error);
    return errorResponse(res, "Failed to verify lab report");
  }
}
export async function rejectLabReport(req, res) {
  const { reportId } = req.params;
  const { rejectionReason } = req.body; // Logic ke liye reason zaroori hai

  if (!rejectionReason) {
    return errorResponse(res, "Rejection reason is required", 400);
  }

  try {
    const report = await prisma.labReport.findUnique({
      where: { reportId },
    });

    if (!report) {
      return errorResponse(res, "Lab report not found", 404);
    }

    // Status check taaki verified records galti se delete na hon
    if (report.status !== "PENDING") {
      return errorResponse(res, "Only pending reports can be rejected", 400);
    }

    // DB se poori tarah delete karne ke liye
    await prisma.labReport.delete({
      where: { reportId },
    });

    return successResponse(
      res,
      {}, // Empty data kyunki record ab exist nahi karta
      "Lab report rejected and removed from database successfully",
      200,
    );
  } catch (error) {
    console.error("Reject lab report error:", error);
    return errorResponse(res, "Failed to reject and delete lab report");
  }
}
export function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return successResponse(res, {}, "Logged out successfully");
}
