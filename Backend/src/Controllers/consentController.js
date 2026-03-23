import { prisma } from "../../lib/prisma.js";
import { createNotification } from "../Utils/Notify.js";
import { toCleanDate } from "../Utils/DateUtils.js";

export async function SendConsentRequest(req, res) {
  const doctorId = req.user.sub;
  const { patientId } = req.body;
  console.log(doctorId, patientId);
  try {
    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.doctor.findUnique({ where: { id: doctorId } }),
    ]);
    if (!doctor || !patient) {
      return res.status(404).json({
        success: false,
        message: "Profiles not found",
      });
    }

    const existingConsent = await prisma.consent.findFirst({
      where: {
        doctorId: doctorId,
        patientId: patientId,
      },
      select: {
        consentStatus: true,
        consentExpiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    let now = new Date();
    let isAccepted = false;
    let isNotExpired = false;

    if (existingConsent) {
      isAccepted = existingConsent.consentStatus === "ACCEPTED";
      if (isAccepted) {
        isNotExpired = now < existingConsent.consentExpiresAt;
      }
    }
    if (isAccepted && isNotExpired) {
      return res.status(403).json({
        success: false,
        message: "Access already active",
      });
    }
    const consent = await prisma.consent.create({
      data: {
        patientId,
        doctorId,
        consentStatus: "PENDING",
        requestSentAt: new Date(),
      },
    });
    await createNotification({
      userId: patientId,
      role: "PATIENT",
      type: "CONSENT_REQUEST",
      title: "New Access Request",
      message: `Dr. ${doctor.fullName} requested access to your records`,
      entityId: consent.id,
    });
    return res.status(201).json({
      success: true,
      data: {
        consentId: consent.id,
        status: consent.consentStatus,
      },
      message: "Consent request sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
export async function PatientAcceptsRequest(req, res) {
  const patientId = req.user.sub; // logged-in patient

  const { Id } = req.body;
  console.log(patientId);
  try {
    console.log(Id);
    const validateRequest = await prisma.consent.findFirst({
      where: {
        id: Id,
        patientId: patientId,
      },
      select: {
        consentStatus: true,
      },
    });
    console.log(validateRequest);
    if (!validateRequest) {
      return res.status(404).json({
        success: false,
        message: "No Valid Consent",
      });
    }
    let now = new Date();
    if (validateRequest.consentStatus !== "PENDING") {
      return res.status(406).json({
        success: false,
        message: "Already Accepted Consent",
      });
    }
    const consent = await prisma.consent.update({
      where: {
        id: Id,
        patientId: patientId,
      },
      data: {
        consentAcceptedAt: now,
        consentExpiresAt: new Date(now.getTime() + 3 * 60 * 60 * 1000),
        consentStatus: "ACCEPTED",
      },
    });
    await createNotification({
      userId: consent.doctorId,
      role: "DOCTOR",
      type: "CONSENT_APPROVED",
      title: "Consent Approved",
      message: "Patient approved your access request.",
      entityId: Id,
    });

    return res.status(200).json({
      success: true,
      data: {
        consentId: consent.id,
        status: consent.consentStatus,
      },
      message: "Consent Request Accepted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
export async function PatientRejectRequest(req, res) {
  const patientId = req.user.sub; // logged-in patient
  const { Id } = req.body;
  try {
    const validateRequest = await prisma.consent.findFirst({
      where: {
        id: Id,
        patientId: patientId,
      },
      select: {
        consentStatus: true,
      },
    });
    if (!validateRequest) {
      return res.status(404).json({
        success: false,
        message: "No Valid Consent",
      });
    }
    if (validateRequest.consentStatus !== "PENDING") {
      return res.status(406).json({
        success: false,
        message: "The Consent is Already Accepted",
      });
    }
    let now = new Date();
    const consent = await prisma.consent.update({
      where: {
        id: Id,
        patientId: patientId,
      },
      data: {
        consentStatus: "REJECTED",
        updatedAt: now,
      },
    });
    const consentNotiData = await prisma.consent.findUnique({
      where: { id: Id },
    });
    await createNotification({
      userId: consentNotiData.doctorId,
      role: "DOCTOR",
      type: "PATIENT_REVOKED_ACCESS",
      title: "Access Revoked",
      message: "Patient revoked your access.",
      entityId: Id,
    });
    res.status(200).json({
      success: true,
      data: { consentId: consent.id, status: consent.consentStatus },
      message: "Consent request Rejected Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
export async function PatientRevokeConsent(req, res) {
  const patientId = req.user.sub; // logged-in patient
  const { Id } = req.body;
  try {
    const validateRequest = await prisma.consent.findFirst({
      where: {
        id: Id,
        patientId: patientId,
      },
      select: {
        consentStatus: true,
        doctorId:true,
      },
    });
    if (!validateRequest) {
      return res.status(404).json({
        success: false,
        message: "No Valid Consent",
      });
    }
    if (validateRequest.consentStatus === "PENDING") {
      return res.status(410).json({
        success: false,
        message:
          "A Pending request can only be Accepted or Rejected. Once a request has been Accepted, it can then be Revoked at any time to terminate access.",
      });
    }
    if (
      validateRequest.consentStatus === "REVOKED" ||
      validateRequest.consentStatus === "EXPIRED"
    ) {
      return res.status(411).json({
        success: false,
        message: "A Consent Already InActive",
      });
    }
    const consent = await prisma.consent.update({
      where: {
        id: Id,
        patientId: patientId,
      },
      data: {
        consentStatus: "REVOKED",
      },
    });
    await createNotification({
      userId: validateRequest.doctorId,
      role: "DOCTOR",
      type: "PATIENT_REVOKED_ACCESS",
      title: "Access Terminated",
      message: "A patient has revoked your access to their records.",
      entityId: Id,
    });
    res.status(200).json({
      success: true,
      data: { consentId: consent.id, status: consent.consentStatus },
      message: "Consent Revoked Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
