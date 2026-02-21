import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  sku: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  storeId: z.string().min(1, "El store es requerido"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  initialStock: z.number().min(0, "El stock no puede ser negativo").optional(),
  metadata: z.object({
    isFeatured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    specifications: z.record(z.string()).optional()
  }).optional()
});

export type ProductInput = z.infer<typeof productSchema>;
