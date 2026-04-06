import { z } from "zod";

// 1. Consent Request bhejte waqt (Doctor side)
export const sendConsentSchema = z.object({
    patientId: z.string().uuid("Invalid Patient ID format"),
});

// 2. Consent Accept/Reject/Revoke karte waqt (Patient side)
export const consentActionSchema = z.object({
    Id: z.string().uuid("Invalid Consent ID format"),
});