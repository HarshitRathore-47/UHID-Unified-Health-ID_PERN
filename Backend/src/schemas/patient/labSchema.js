import { z } from "zod";

export const reportIdSchema = z.object({
  reportId: z
    .string()
    .min(5, "Invalid report ID")
    .max(50, "Invalid report ID")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid report ID format"),
});