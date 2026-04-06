import { z } from "zod";

// REGISTER
export const registerPatientSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),

  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15)
    .optional(),

  dob: z
    .string()
    .optional(),
    
  gender: z
    .string()
    .optional(),

  guardianName: z
    .string()
    .optional(),

  address: z
    .string()
    .min(5, "Address is too short"),

  aadhaarNumber: z
    .string()
    .length(12, "Must be 12 digits"),

  verifyOtpId: z
    .string()
    .min(1, "Required"),
});

// LOGIN
export const loginPatientSchema = z.object({
  uhid: z
    .string()
    .min(12, "UHID  must of 12 digit")
    .max(12,"UHID  must of 12 digit"),


  password: z
    .string()
    .min(6, "Password is required"),
});