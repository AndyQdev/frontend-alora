import { z } from "zod";
export const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  status: z.enum(["active", "inactive"]).default("active")
});
export type ProductInput = z.infer<typeof productSchema>;
