import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Invalid admin email").toLowerCase(),
  password: z.string().min(6, "Password required")
});
export const rejectDoctorSchema = z.object({
  reason: z.string().min(5, "Provide rejection reason (min 5 chars)"),
});