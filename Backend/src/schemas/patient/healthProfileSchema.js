import { z } from "zod";

export const updateHealthProfileSchema = z.object({

    height: z.coerce.number().nonnegative().optional().nullable(),

    weight: z.coerce.number().nonnegative().optional().nullable(),

    bp: z.coerce.string().optional().nullable(),

    heartRate: z.coerce.number().nonnegative().optional().nullable(),

    bloodGroup: z
        .string()
        .regex(/^(A|B|AB|O)[+-]$/, "Invalid blood group")
        .optional().nullable(),
        
    guardianName: z
        .string()
        .min(2, "Guardian name is too short")
        .max(50, "Guardian name is too long")
        .optional()
        .nullable(),

    bloodSugarLevels: z.string().optional(),

    chronicConditions: z.array(z.string()).optional(),

    allergies: z.array(z.string()).optional(),

    longTermDiseases: z.array(z.string()).optional(),

    smokingStatus: z
        .enum(["YES", "NO", "OCCASIONAL"])
        .optional(),

    alcoholConsumption: z
        .enum(["YES", "NO", "OCCASIONAL"])
        .optional(),
});