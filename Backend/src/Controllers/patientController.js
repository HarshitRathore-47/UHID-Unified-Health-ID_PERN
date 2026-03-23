// src/Controllers/patientController.js
import crypto from "crypto";
import {
  hashPlainOtp,
  hashPassword,
  sendOtpEmail,
  OTP_TTL_MS,
  createJwt,
} from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";
import { generateUniqueUHID } from "../../lib/Uhid.js";
import { uploadFileToFirebase } from "./FileUploadControllers/uploadController.js";
import { toCleanDate } from "../Utils/DateUtils.js";
import { success } from "zod";
import { bucket } from "../Config/firebase.js";
import { createNotification } from "../Utils/Notify.js";

// RegisterPatient
export async function registerPatient(req, res, next) {
  try {
    const {
      fullName,
      dob,
      gender,
      phone,
      email,
      password,
      guardianName,
      aadhaarNumber,
      address,
      verifyOtpId,
    } = req.body;
    if (!verifyOtpId) {
      return res
        .status(400)
        .json({ success: false, message: "OTP Verification  required" });
    }

    const authOtp = await prisma.authOtp.findUnique({
      where: { id: verifyOtpId },
    });
    if (!authOtp || !authOtp.verified) {
      return res.status(400).json({
        success: false,
        message: "OTP not verified or session expired",
      });
    }

    // Optional safety: ensure the email used to request OTP is the same as registration email
    if (authOtp.email && authOtp.email !== req.body.email) {
      return res
        .status(400)
        .json({ success: false, message: "OTP email mismatch" });
    }
    if (new Date(authOtp.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (!email || !password || !fullName)
      return res.status(400).json({ message: "Missing fields" });

    const passwordHash = await hashPassword(password);
    const aadhaarHash = aadhaarNumber
      ? crypto.createHash("sha256").update(aadhaarNumber).digest("hex")
      : null;

    //UHID GENERATION
    const { stored, display } = await generateUniqueUHID(prisma);
    const existingPatient = await prisma.patient.findFirst({
      where: {
        OR: [
          { email },
          { phone }, // make sure naming matches schema
        ],
      },
    });

    if (existingPatient) {
      // EMAIL conflict
      if (existingPatient?.email === email) {
        return res.status(409).json({
          success: false,
          field: "email",
          message: "Email is already associated with another account",
        });
      }

      // PHONE conflict
      if (existingPatient?.phone === phone) {
        return res.status(409).json({
          success: false,
          field: "phone",
          message: "Phone number is already associated with another account",
        });
      }
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar document is required",
      });
    }
    // Start Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Patient
      const patient = await tx.patient.create({
        data: {
          uhid: stored,
          fullName,
          dob: toCleanDate(dob),
          gender,
          phone,
          email,
          passwordHash,
          guardianName,
          aadhaarHash,
          address,
        },
      });

      // 2. Upload Aadhaar to Firebase
      const filePath = `patients/${patient.id}/documents/aadhaar_${Date.now()}`;
      const savedPath = await uploadFileToFirebase(req.file, filePath);

      // 3. Create Document Record
      await tx.patientDocument.create({
        data: {
          patientId: patient.id,
          type: "AADHAAR",
          fileKey: savedPath,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
        },
      });

      // 4. Link OTP session to Patient
      await tx.authOtp.update({
        where: { id: verifyOtpId },
        data: { patientId: patient.id },
      });

      return patient;
    });

    // Generate Token using transaction result
    const token = createJwt({
      sub: result.id,
      role: "PATIENT",
      email: result.email,
    });

    // 🍪 SET COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    res.json({
      success: true,
      data: {
        id: result.id,
        uhid: display,
        statusUrl: `/api/patients/${result.id}/status`,
        verifyOtpId: authOtp.id,
      },
      message: "Patient registered successfully.",
    });
  } catch (err) {
    console.error("REGISTER PATIENT ERROR:", err);
    next(err);
  }
}
/**
 * loginPatientStep1(req,res)
 * Body: { identifier, password }
 * Returns tempLoginId
 */
export async function loginPatientStep1(req, res, next) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const patient = await prisma.patient.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!patient)
      return res.status(400).json({ message: "Invalid credentials" });

    if (patient.lockedUntil && new Date(patient.lockedUntil) > new Date())
      return res.status(403).json({ message: "Account locked. Try later." });

    const ok = await import("../../lib/auth.js").then((m) =>
      m.comparePassword(password, patient.passwordHash || ""),
    );
    if (!ok) {
      await prisma.patient.update({
        where: { id: patient.id },
        data: { failedLoginAttempts: patient.failedLoginAttempts + 1 },
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (patient.failedLoginAttempts > 0)
      await prisma.patient.update({
        where: { id: patient.id },
        data: { failedLoginAttempts: 0 },
      });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = hashPlainOtp(otp);
    const authOtp = await prisma.authOtp.create({
      data: {
        patientId: patient.id,
        userType: "PATIENT",
        purpose: "LOGIN",
        otpHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    if (patient.email) await sendOtpEmail(patient.email, otp, "LOGIN");

    res.status(200).json({
      success: true,
      data: { tempLoginId: authOtp.id },
      message: "OTP sent to email",
    });
  } catch (err) {
    next(err);
  }
}
//PateintDashboardData
export async function getPatientDashboardData(req, res) {
  const patientId = req.user.sub;
  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Only Patient individual Access their dashboard data",
    });
  }
  try {
    const [
      patient,
      consents,
      labReports,
      activeTreatments,
      diet,
      vaccinations,
      visitHistory,
    ] = await Promise.all([
      //{Pateint Basic Details}
      prisma.patient.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          uhid: true,
          fullName: true,
          gender: true,
          dob: true,
        },
      }),

      //{Last Consents Data}
      prisma.consent.findMany({
        where: {
          patientId: patientId,
        },
        select: {
          doctorId: true,
          consentAcceptedAt: true,
          consentExpiresAt: true,
          consentStatus: true,
          doctor: {
            select: {
              fullName: true,
            },
          },
        },
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
      }),

      // {last three Lab Reports}
      prisma.labReport.findMany({
        where: { patientId, status: "VERIFIED" },
        select: {
          reportId: true,
          testName: true,
          labName: true,
          collectionDate: true,
          reportDateTime: true,
          remarksNotes: true,
          status: true,
        },
        take: 3,
        orderBy: {
          uploadDate: "desc",
        },
      }),

      // {last 3 Treatement}
      prisma.treatment.findMany({
        where: {
          patientId: patientId,
          status: "ACTIVE",
        },
        select: {
          diseaseName: true,
          conditionType: true,
          currentProgress: true,
          nextVisitedDate: true,
          lastVisitedDate: true,
          hospitalOrClinicName: true,
        },
        take: 3,
        orderBy: {
          lastVisitedDate: "desc",
        },
      }),

      //{Diet}
      prisma.diet.findMany({
        where: {
          patientId: patientId,
          OR: [
            { endDate: null },
            { endDate: { gte: toCleanDate(new Date()) } },
          ],
          status: "ACTIVE",
        },
        select: {
          dietName: true,
          breakfastItems: true,
          lunchItems: true,
          dinnerItems: true,
          avoidanceRestriction: true,
          startDate: true,
        },
        take: 1,
        orderBy: {
          startDate: "desc",
        },
      }),

      // {Last 3 vaccinations}
      prisma.vaccinationHistory.findMany({
        where: {
          patientId: patientId,
        },
        select: {
          vaccineName: true,
          vaccineType: true,
          doseNumber: true,
          vaccineDate: true,
          nextDueDate: true,
        },
        take: 3,
        orderBy: {
          vaccineDate: "desc",
        },
      }),

      //{Visit History}
      prisma.visitHistory.findMany({
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
        },
        take: 3,
        orderBy: {
          visitDate: "desc",
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        profile: patient,
        consents: consents,
        labReports: labReports,
        activeTreatments: activeTreatments,
        diet: diet,
        vaccinations: vaccinations,
        visitHistory: visitHistory,
      },
      message: "Data Retrive Successfully",
    });
  } catch (error) {
    console.error("Error fetching in Dashboard record:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch  Your medical record",
    });
  }
}

// LabReports
export async function getLabreports(req, res) {
  const patientId = req.user.sub;
  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Only Authorized Patient Can access the data",
    });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Number(req.query.limit) || 10;

  const safetyLimit = limit > 50 ? 50 : limit;
  const skip = (page - 1) * safetyLimit;

  try {
    const [records, totalCount] = await Promise.all([
      prisma.labReport.findMany({
        where: { patientId, status: "VERIFIED" },
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
          status: true,
        },
        orderBy: {
          uploadDate: "desc",
        },
      }),
      prisma.labReport.count({
        where: { patientId },
      }),
    ]);
    // {total pages}
    const totalPages = Math.ceil(totalCount / safetyLimit);

    //{Response}
    return res.status(200).json({
      success: true,
      data: {
        record: records,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit: safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Pagination Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching data" });
  }
}
// Labreport By ID (Details)
export async function getLabReportById(req, res) {
  const { reportId } = req.params;
  const patientId = req.user.sub;

  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Patient role required",
    });
  }

  try {
    const reportDetail = await prisma.labReport.findFirst({
      where: {
        reportId: reportId,
        patientId: patientId,
        status: "VERIFIED",
      },
      include: {
        results: {
          select: {
            id: true,
            parameterName: true,
            value: true,
            unit: true,
            referenceRange: true,
            statusFlag: true,
          },
          orderBy: { createdAt: "asc" },
        },
        doctor: {
          select: { fullName: true },
        },
      },
    });

    if (!reportDetail) {
      return res.status(404).json({
        success: false,
        message: "Lab report not found or unauthorized",
      });
    }

    const { results, ...reportInfo } = reportDetail;

    return res.status(200).json({
      success: true,
      data: {
        reportInfo, // {Metadata for the Header}
        results, // {Array for the Results Table}
      },
      message: "LabReport Fetched Successfully",
    });
  } catch (error) {
    console.error("Lab Detail API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching report details",
    });
  }
}

//HealthProfile

export async function getHealthProfile(req, res) {
  const patientId = req.user.sub;

  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Only patients can access this",
    });
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
        uhid: true,
      },
    });

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { patientId },
    });
    let signedUrl = null;

    if (healthProfile?.profilePic) {
      const file = bucket.file(healthProfile.profilePic);

      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 15 * 60 * 1000,
      });

      signedUrl = url;
    }
    return res.status(200).json({
      success: true,
      data: {
        identity: patient,
        healthData: healthProfile
          ? {
              ...healthProfile,
              profilePic: signedUrl,
            }
          : null,
      },
      message: "Health profile Data Successfully",
    });
  } catch (error) {
    console.error("Getting Health data Failed :", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
}
//Update Health profile
export async function updateHealthProfile(req, res) {
  const patientId = req.user.sub;

  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Only patients can update profile",
    });
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
  } = req.body;

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
        alcoholConsumption,
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
        alcoholConsumption,
      },
    });

    return res.status(200).json({
      success: true,
      data: profile,
      message: "Health profile saved",
    });
  } catch (error) {
    console.error("UPDATE HEALTH PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
}
export async function uploadProfilePhoto(req, res) {
  const patientId = req.user.sub;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // 1️⃣ Get existing profile
    const existingProfile = await prisma.healthProfile.findUnique({
      where: { patientId },
    });

    // 2️⃣ Delete old photo if exists
    if (existingProfile?.profilePic) {
      const oldFile = bucket.file(existingProfile.profilePic);

      try {
        await oldFile.delete();
      } catch (err) {
        console.log("Old file not found or already deleted");
      }
    }
    // 1️⃣ Firebase upload
    const filePath = `patients/${patientId}/profile/profilePhoto_${Date.now()}`;
    // 2️⃣ Get public URL
    const savedPath = await uploadFileToFirebase(req.file, filePath);
    // 3️⃣ Prisma update profilePic field
    const updatedProfile = await prisma.healthProfile.upsert({
      where: { patientId },
      update: {
        profilePic: savedPath,
      },
      create: {
        patientId,
        profilePic: savedPath,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedProfile.profilePic,
      message: "Photo uploaded successfully",
    });
  } catch (error) {
    console.error("PHOTO UPLOAD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
}
//Treatments
export async function getPatientTreatments(req, res) {
  const patientId = req.user.sub;
  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Only Authorized Patients can access this data",
    });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Number(req.query.limit) || 10;

  // 3️⃣ {Safety cap and skip calculation}
  const safetyLimit = limit > 50 ? 50 : limit;
  const skip = (page - 1) * safetyLimit;

  try {
    const [treatments, totalCount] = await Promise.all([
      prisma.treatment.findMany({
        where: { patientId },
        skip: skip,
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
            select: { fullName: true },
          },
        },
        orderBy: {
          lastVisitedDate: "desc",
        },
      }),
      prisma.treatment.count({
        where: { patientId },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / safetyLimit);

    return res.status(200).json({
      success: true,
      data: {
        record: treatments,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit: safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      message: "Treatments Fetched Successfully",
    });
  } catch (error) {
    console.error("Treatment Pagination Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching treatment records",
    });
  }
}
//Diets
export async function getPatientDiets(req, res) {
  const patientId = req.user.sub; //
  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Only Authorized Patients can access this data",
    });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const rawLimit = Number(req.query.limit) || 4;
  const limit = Math.max(1, Math.min(rawLimit, 10));
  const skip = (page - 1) * limit;

  try {
    const [diets, totalCount] = await Promise.all([
      prisma.diet.findMany({
        where: { patientId },
        skip,
        take: limit,
        orderBy: [
          { status: "asc" }, // Shows 'ACTIVE' status first
          { startDate: "desc" }, // Then newest dates
        ],
        select: {
          dietId: true,
          breakfastItems: true,
          lunchItems: true,
          dinnerItems: true,
          avoidanceRestriction: true,
          startDate: true,
          endDate: true,
          status: true,
          doctorHospitalName: true,
        },
      }),
      prisma.diet.count({ where: { patientId } }), //
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        record: diets,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      message: "Diets Fetched Successfully",
    });
  } catch (error) {
    console.error("Diet API Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching diets" });
  }
}

//Prescriptions
export async function getPatientPrescriptions(req, res) {
  const patientId = req.user.sub;

  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Only Authorized Patients can access this data",
    });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const rawLimit = Number(req.query.limit) || 10;
  const safetyLimit = Math.max(1, Math.min(rawLimit, 50));
  const skip = (page - 1) * safetyLimit;

  try {
    const where = { patientId };

    if (req.query.medicineSystem) {
      where.medicineSystem = req.query.medicineSystem;
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
              instructedTime: true,
            },
          },
          doctor: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.prescription.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / safetyLimit);

    return res.status(200).json({
      success: true,
      data: {
        record: prescriptions,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit: safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      message: "Prescriptions Fetched Successfully",
    });
  } catch (error) {
    console.error("Prescription Pagination Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching your prescriptions",
    });
  }
}

//Consents
export async function getPatientConsents(req, res) {
  const patientId = req.user.sub;

  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Only Authorized Patients can access this data",
    });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const rawLimit = Number(req.query.limit) || 10;
  const safetyLimit = Math.max(1, Math.min(rawLimit, 50));
  const skip = (page - 1) * safetyLimit;

  try {
    const where = { patientId };

    const allowedStatuses = [
      "PENDING",
      "ACCEPTED",
      "REVOKED",
      "EXPIRED",
      "REJECTED",
    ];

    if (req.query.status && allowedStatuses.includes(req.query.status)) {
      where.consentStatus = req.query.status;
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
          updatedAt:true,
          doctor: {
            select: {
              fullName: true,
              specialization: true,
            },
          },
        },
        orderBy: {
          requestSentAt: "desc",
        },
      }),
      prisma.consent.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / safetyLimit);

    return res.status(200).json({
      success: true,
      data: {
        record: consents,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit: safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      message: "Consents Fetched Successfully",
    });
  } catch (error) {
    console.error("Consent Pagination Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching consent requests",
    });
  }
}

//Vaccinations
export async function getVaccinationHistory(req, res) {
  const patientId = req.user.sub;

  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
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
          select: { fullName: true },
        },
      },
      orderBy: { vaccineDate: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: history,
      count: history.length,
      message: "Vaccinations Fetched Successfully",
    });
  } catch (error) {
    console.error("Vaccination Fetch Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
// Visits
export async function getVisitHistory(req, res) {
  const patientId = req.user.sub;

  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const rawLimit = Number(req.query.limit) || 10;
  const safetyLimit = Math.max(1, Math.min(rawLimit, 50));
  const skip = (page - 1) * safetyLimit;

  try {
    const [visits, totalCount] = await Promise.all([
      prisma.visitHistory.findMany({
        where: { patientId },
        skip,
        take: safetyLimit,
        select: {
          hospitalName: true,
          hospitalAddress: true,
          visitDate: true,
          purposeReason: true,
          physicianName: true,
          physicianSpeciality: true,
          doctor: {
            select: { fullName: true },
          },
        },
        orderBy: { visitDate: "desc" },
      }),
      prisma.visitHistory.count({ where: { patientId } }),
    ]);

    const totalPages = Math.ceil(totalCount / safetyLimit);

    return res.status(200).json({
      success: true,
      data: {
        record: visits,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          limit: safetyLimit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      message: "Visit History Fetched Successfully",
    });
  } catch (error) {
    console.error("Visit History Pagination Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
export function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}
