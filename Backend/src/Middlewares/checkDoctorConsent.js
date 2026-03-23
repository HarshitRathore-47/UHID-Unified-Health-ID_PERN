import { prisma } from "../../lib/prisma.js";

export async function checkDoctorConsent(req, res, next) {
  try {
    // STEP 1: auth middleware must have run
    // so req.user already exists
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // STEP 2: only DOCTOR needs consent check
    if (user.role !== "DOCTOR") {
      return res.status(403).json({ message: "Only doctors can access patient data" });
    }

    // STEP 3: extract doctorId & patientId
    const doctorId = user.sub; // from JWT payload
    const patientId = req.params.patientId;

    if (!patientId) {
      return res.status(400).json({ message: "Missing patientId" });
    }

    // STEP 4: find latest consent
    const consent = await prisma.consent.findFirst({
      where: {
        doctorId,
        patientId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        consentStatus: true,
        consentExpiresAt: true,
      },
    });

    // STEP 5: consent must exist
    if (!consent) {
      return res.status(403).json({ message: "No consent found for this patient" });
    }

    // STEP 6: status must be ACCEPTED
    if (consent.consentStatus !== "ACCEPTED") {
      return res.status(403).json({ message: "Consent is not active" });
    }

    // STEP 7: check expiry (lazy expiry)
    const now = new Date();
    if (!consent.consentExpiresAt || now >= consent.consentExpiresAt) {
      // mark expired
      await prisma.consent.updateMany({
        where: {
          doctorId,
          patientId,
          consentStatus: "ACCEPTED",
        },
        data: {
          consentStatus: "EXPIRED",
        },
      });

      return res.status(403).json({ message: "Consent expired" });
    }

    // STEP 8: everything OK → allow controller
    next();
  } catch (error) {
    console.error("Consent middleware error:", error);
    return res.status(500).json({ message: "Consent validation failed" });
  }
}
