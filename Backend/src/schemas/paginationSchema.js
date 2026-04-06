import { z } from "zod";

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Page must be a positive number",
    }),

  limit: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = Number(val);
      return !isNaN(num) && num > 0 && num <= 50;
    }, {
      message: "Limit must be between 1 and 50",
    }),
});