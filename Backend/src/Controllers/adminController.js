// TODO: Add rate limiting for admin login before production

// src/Controllers/adminController.js
import { comparePassword, createJwt, hashPassword } from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";
import { bucket } from "../Config/firebase.js";
import { successResponse, errorResponse } from "../Utils/apiResponse.js";
import { createNotification } from "../Utils/Notify.js";
/**
 * adminLogin(req,res)
 * Body: { email, password }
 */
export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = createJwt({
      sub: admin.id,
      role: "ADMIN",
      email: admin.email,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Admin Logined Successfully" });
  } catch (err) {
    next(err);
  }
}
export async function getAdminDashboard(req, res, next) {
  try {
    const [totalPatients, totalDoctors, pendingDoctors] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.doctor.count({ where: { status: "PENDING" } }),
    ]);

    res.json({
      totalPatients,
      totalDoctors,
      pendingDoctors,
    });
  } catch (err) {
    next(err);
  }
}
/**
 * getPendingDoctors(req,res)
 */
export async function getPendingDoctors(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const rawLimit = Number(req.query.limit) || 20;
    const safetyLimit = Math.max(1, Math.min(rawLimit, 100));
    const skip = (page - 1) * safetyLimit;

    const search = req.query.search?.trim();

    const where = {
      status: "PENDING",
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { licenseNumber: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [items, totalCount] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: safetyLimit,
        select: {
          id: true,
          fullName: true,
          dob: true,
          email: true,
          phone: true,
          licenseNumber: true,
          specialization: true,
          hospital: true,
          experience: true,
          qualification: true,
          status: true,
          submittedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.doctor.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / safetyLimit);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        limit: safetyLimit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * approveDoctor(req,res)
 */
export async function approveDoctor(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.user.sub;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (doctor.status !== "PENDING")
      return res
        .status(400)
        .json({ message: "Doctor is already APPROVED or REJECTED" });

    await prisma.$transaction(async (tx) => {
      await tx.doctor.update({
        where: { id },
        data: {
          status: "APPROVED",
          verifiedAt: new Date(),
          reviewedAt: new Date(),
          reviewedById: adminId,
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "APPROVE_DOCTOR",
          targetId: id,
          meta: {},
        },
      });
    });
    await createNotification({
      userId: adminId,
      role: "ADMIN",
      type: "ADMIN_DOCTOR_APPROVED",
      title: "Doctor Approved",
      message: `You approved Dr. ${doctor.fullName}`,
    });

    res.json({ message: "Doctor approved" });
  } catch (err) {
    next(err);
  }
}

/**
 * rejectDoctor(req,res)
 * Body: { reason }
 */
export async function rejectDoctor(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.sub;
    if (!reason || reason.length < 5) {
      return res
        .status(400)
        .json({ message: "Provide rejection reason (min 5 chars)" });
    }
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (doctor.status !== "PENDING")
      return res
        .status(400)
        .json({ message: "Doctor is already REJECTED or APPROVED" });

    await prisma.$transaction(async (tx) => {
      await tx.doctor.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
          reviewedAt: new Date(),
          reviewedById: adminId,
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: adminId,
          action: "REJECT_DOCTOR",
          targetId: id,
          meta: { reason },
        },
      });
    });

    // TODO: send email to doctor
    res.json({ message: "Doctor rejected" });
  } catch (err) {
    next(err);
  }
}
/**
 * getDoctorDetails(req,res)
 */
export async function getDoctorDetails(req, res, next) {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        dob: true,
        gender: true,
        phone: true,
        email: true,
        licenseNumber: true,
        specialization: true,
        hospital: true,
        experience: true,
        qualification: true,
        status: true,
        rejectionReason: true,
        submittedAt: true,
        reviewedAt: true,
        verifiedAt: true,
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ data: doctor });
  } catch (err) {
    next(err);
  }
}

export async function getDoctorDocument(req, res, next) {
  try {
    const { docId } = req.params;

    const document = await prisma.doctorDocument.findUnique({
      where: { id: docId },
      select: {
        id: true,
        fileKey: true,
        fileName: true,
        mimeType: true,
        doctorId: true,
      },
    });

    if (!document)
      return res.status(404).json({ message: "Document not found" });

    // Get file reference from Firebase bucket
    const file = bucket.file(document.fileKey);
    res.setHeader("Content-Type", document.mimeType);

    // Generate signed URL (5 minutes)
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
    });

    return res.json({
      fileName: document.fileName,
      mimeType: document.mimeType,
      url: signedUrl,
    });
  } catch (err) {
    next(err);
  }
}
export async function getAuditLogs(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.action) {
      where.action = req.query.action;
    }

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          actorId: true,
          action: true,
          targetId: true,
          meta: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: logs,
      pagination: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
}
export async function getDashboardAnalytics(req, res, next) {
  try {
    /* =====================
       Filters
    ===================== */

    const year =
      req.query.year && req.query.year !== "all"
        ? Number(req.query.year)
        : null;

    const month =
      req.query.month && req.query.month !== "all"
        ? Number(req.query.month)
        : null;

    const gender =
      req.query.gender && req.query.gender !== "all" ? req.query.gender : null;

    const ageFilter =
      req.query.age && req.query.age !== "all" ? req.query.age : null;

    /* =====================
       Date Range
    ===================== */

    let startDate = null;
    let endDate = null;

    if (year && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
    } else if (year) {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    }

    /* =====================
       Prisma Where Objects
    ===================== */

    const patientWhere = {};
    const doctorWhere = {};

    if (startDate && endDate) {
      patientWhere.createdAt = {
        gte: startDate,
        lt: endDate,
      };

      doctorWhere.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (gender) {
      patientWhere.gender = gender;
    }

    /* =====================
       Fetch Data
    ===================== */

    const patients = await prisma.patient.findMany({
      where: patientWhere,
      select: {
        createdAt: true,
        dob: true,
        gender: true,
      },
    });

    const doctors = await prisma.doctor.findMany({
      where: doctorWhere,
      select: {
        createdAt: true,
      },
    });

    /* =====================
       Age Filter (after fetch)
    ===================== */

    let filteredPatients = patients;

    if (ageFilter) {
      const now = new Date();

      filteredPatients = patients.filter((p) => {
        if (!p.dob) return false;

        const age = now.getFullYear() - new Date(p.dob).getFullYear();

        if (ageFilter === "0-18") return age <= 18;
        if (ageFilter === "18-35") return age > 18 && age <= 35;
        if (ageFilter === "35-60") return age > 35 && age <= 60;
        if (ageFilter === "60+") return age > 60;

        return true;
      });
    }

    /* =====================
       Patient Monthly Trend
    ===================== */

    const patientMonthly = {};

    filteredPatients.forEach((p) => {
      const monthName = new Date(p.createdAt).toLocaleString("default", {
        month: "short",
      });

      patientMonthly[monthName] = (patientMonthly[monthName] || 0) + 1;
    });

    const patientTrend = Object.entries(patientMonthly).map(
      ([month, count]) => ({ month, count }),
    );

    /* =====================
       Doctor Monthly Trend
    ===================== */

    const doctorMonthly = {};

    doctors.forEach((d) => {
      const monthName = new Date(d.createdAt).toLocaleString("default", {
        month: "short",
      });

      doctorMonthly[monthName] = (doctorMonthly[monthName] || 0) + 1;
    });

    const doctorTrend = Object.entries(doctorMonthly).map(([month, count]) => ({
      month,
      count,
    }));

    /* =====================
       Age Distribution
    ===================== */

    const ageGroups = {
      "0-18": 0,
      "18-35": 0,
      "35-60": 0,
      "60+": 0,
    };

    const now = new Date();

    filteredPatients.forEach((p) => {
      if (!p.dob) return;

      const age = now.getFullYear() - new Date(p.dob).getFullYear();

      if (age <= 18) ageGroups["0-18"]++;
      else if (age <= 35) ageGroups["18-35"]++;
      else if (age <= 60) ageGroups["35-60"]++;
      else ageGroups["60+"]++;
    });

    const ageDistribution = Object.entries(ageGroups).map(([group, count]) => ({
      group,
      count,
    }));

    /* =====================
       Gender Distribution
    ===================== */

    const genderMap = new Map([
      ["MALE", 0],
      ["FEMALE", 0]
    ]);

    filteredPatients.forEach((p) => {
      if (p.gender) {
        // 2. Data ko uppercase mein convert karke match karo
        const normalizedGender = p.gender.toUpperCase();

        const currentCount = genderMap.get(normalizedGender) || 0;
        genderMap.set(normalizedGender, currentCount + 1);
      }
    });

    const genderDistribution = Array.from(genderMap, ([gender, count]) => ({
      gender,
      count
    }));

    /* =====================
       Final Response
    ===================== */

    res.json({
      totalPatients: filteredPatients.length,
      totalDoctors: doctors.length,
      patientTrend,
      doctorTrend,
      ageDistribution,
      genderDistribution,
    });
  } catch (err) {
    next(err);
  }
}
export function adminlogout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return successResponse(res, {}, "Logged out successfully");
}