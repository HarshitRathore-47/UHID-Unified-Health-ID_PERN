import { z } from "zod";

// 1. Prescription Schema
export const prescriptionSchema = z.object({
  diagnosis: z.string().min(2, "Diagnosis is required"),
  medicineSystem: z.string().optional(),
  medicines: z.array(
    z.object({
      prescribedMedicineName: z.string().min(1, "Medicine name is required"),
      brand: z.string().optional(),
      dosage: z.string().min(1, "Dosage is required"),
      frequency: z.string().min(1, "Frequency is required"),
      instructedTime: z.string().optional(),
    })
  ).min(1, "At least one medicine is required"),
});

// 2. Treatment Schema
export const treatmentSchema = z.object({
  diseaseName: z.string().min(2, "Disease name is required"),
  conditionType: z.string().min(2, "Condition type is required"),
  hospitalOrClinicName: z.string().min(2, "Hospital name is required"),
  currentProgress: z.string().optional(),
  progressPercentage: z.coerce.number().min(0).max(100).optional().default(0),
  nextVisitedDate: z.string().nullable().optional(),
});

// 3. Manual Lab Report Schema
export const manualLabReportSchema = z.object({
  testName: z.string().min(2, "Test name is required"),
  category: z.string().nullable().optional(),
  labName: z.string().min(2, "Lab name is required"),
  labLocation: z.string().optional(),
  technicianName: z.string().optional(),
  doctorInCharge: z.string().optional(),
  collectionDate: z.string().optional(),
  remarksNotes: z.string().optional(),
  results: z.array(
    z.object({
      parameterName: z.string().min(1),
      value: z.string().min(1),
      unit: z.string().nullable().optional(),
      referenceRange: z.string().nullable().optional(),
      statusFlag: z.string().nullable().optional(),
    })
  ).min(1, "At least one result is required"),
});