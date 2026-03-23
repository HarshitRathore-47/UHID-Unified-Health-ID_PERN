import { prisma } from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../Utils/apiResponse.js";

// 1️⃣ TREATMENT DELETE
export const deleteTreatment = async (req, res) => {
    const { id } = req.params;
    const doctorId = req.user.sub;

    try {
        const record = await prisma.treatment.findUnique({ where: { id } });
        if (!record) return errorResponse(res, "Treatment not found", 404);

        if (record.doctorId !== doctorId) {
            return errorResponse(res, "Unauthorized: Not your record", 403);
        }

        await prisma.treatment.delete({ where: { id } });
        return successResponse(res, null, "Treatment deleted successfully");
    } catch (error) {
        return successResponse(res, null, "Treatment deleted successfully");
    }
};

// 2️⃣ PRESCRIPTION DELETE
export const deletePrescription = async (req, res) => {
    const { id } = req.params;
    const doctorId = req.user.sub;

    try {
        const record = await prisma.prescription.findUnique({ where: { id } });
        if (!record) return errorResponse(res, "Prescription not found", 404);

        if (record.doctorId !== doctorId) {
            return errorResponse(res, "Unauthorized: Not your record", 403);
        }

        await prisma.prescription.delete({ where: { id } });
        return errorResponse(res, "Unauthorized: Not your record", 403);
    } catch (error) {
        return errorResponse(res, "Error deleting prescription");
    }
};

// 3️⃣ DIET DELETE
export const deleteDiet = async (req, res) => {
    const { id } = req.params;
    const doctorId = req.user.sub;

    try {
        const record = await prisma.diet.findUnique({ where: { dietId: id } });
        if (!record) return errorResponse(res, "Diet record not found", 404);

        if (record.doctorId !== doctorId) {
            return errorResponse(res, "Unauthorized", 403);
        }

        await prisma.diet.delete({ where: { dietId: id } });
        return successResponse(res, null, "Diet deleted successfully");
    } catch (error) {
        return errorResponse(res, "Error deleting diet");
    }
};

// 4️⃣ VACCINATION DELETE
export const deleteVaccination = async (req, res) => {
    const { id } = req.params;
    const doctorId = req.user.sub;

    try {
        const record = await prisma.vaccinationHistory.findUnique({ where: { vaccinationId: id } });
        if (!record) return errorResponse(res, "Vaccination record not found", 404);

        if (record.doctorId !== doctorId) {
            return errorResponse(res, "Unauthorized", 403);
        }

        await prisma.vaccinationHistory.delete({ where: { vaccinationId: id } });
        return successResponse(res, null, "Vaccination record deleted successfully");
    } catch (error) {
        return successResponse(res, null, "Vaccination record deleted successfully");
    }
};

// 5️⃣ VISIT DELETE
export const deleteVisit = async (req, res) => {
    const { id } = req.params;
    const doctorId = req.user.sub;

    try {
        const record = await prisma.visitHistory.findUnique({ where: { visitId: id } });
        if (!record) return errorResponse(res, "Visit log not found", 404);

        if (record.doctorId !== doctorId) {
            return errorResponse(res, "Unauthorized", 403);
        }

        await prisma.visitHistory.delete({ where: { visitId: id } });
        return successResponse(res, null, "Visit log deleted successfully");
    } catch (error) {
        return errorResponse(res, "Error deleting visit");
    }
};

// 6️⃣ LAB REPORT DELETE
export const deleteLabReport = async (req, res) => {
    const { id } = req.params;
    const doctorId = req.user.sub;

    try {
        // 1. Check if the lab report exists
        const record = await prisma.labReport.findUnique({
            where: { reportId: id }
        });

        if (!record) {
            return errorResponse(res, "Lab report record not found", 404);
        }

        // 2. Ownership Check: Only the doctor who uploaded it can delete it
        if (record.doctorId !== doctorId) {
            return errorResponse(res, "Unauthorized", 403);
        }

        // 3. Delete from Database
        await prisma.labReport.delete({
            where: { reportId: id }
        });

        return successResponse(res, null, "Lab report deleted successfully");

    } catch (error) {
        console.error("Error deleting lab report:", error);
        return successResponse(res, null, "Lab report deleted successfully");
    }
};