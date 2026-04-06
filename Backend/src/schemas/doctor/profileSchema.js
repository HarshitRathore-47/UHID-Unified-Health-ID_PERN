import { z } from "zod";

export const registerDoctorSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email").toLowerCase(),
  password: z.string().min(6, "Password must be 6+ characters"),
  userName: z.string()
    .min(8)
    .max(15)
    .regex(/^[a-z0-9_.]+$/, "Invalid username format"),
  licenseNumber: z.string().min(5, "License number required"),
  specialization: z.string().min(2, "Specialization required"),
  hospital: z.string().min(2, "Hospital name required"),
  phone: z.string().min(10).max(15),
  verifyOtpId: z.string().uuid("Invalid OTP Session ID"),
  dob: z.string().optional(),
  experience: z.coerce.number().min(0).optional(),
  qualification: z.string().min(2)
});


export const updateDoctorProfileSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15)
    .optional(),

  specialization: z
    .string()
    .min(2, "Specialization must be at least 2 characters")
    .optional(),

  hospital: z
    .string()
    .min(2, "Hospital name too short")
    .optional(),

  experience: z
    .union([
      z.number().min(0, "Experience cannot be negative"),
      z.string()
    ])
    .optional(),

  qualification: z
    .string()
    .min(2, "Qualification too short")
    .optional(),
});