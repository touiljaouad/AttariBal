import { z } from "zod";
import { CONDITIONS, GENDERS } from "@/lib/constants";
import { isAllowedImageUrl } from "@/lib/storage";

const imageSchema = z.object({
  // Accepts locally stored uploads and, when configured, URLs from our own
  // Supabase Storage bucket. Arbitrary external URLs are rejected.
  url: z.string().refine(isAllowedImageUrl, "Image non valide"),
  isMain: z.boolean().default(false),
  displayOrder: z.number().int().min(0).max(100).default(0),
});

const inventorySchema = z.object({
  storeId: z.number().int().positive(),
  quantity: z.number().int().min(0).max(9999),
});

export const productInputSchema = z
  .object({
    name: z.string().trim().min(2, "Nom requis").max(160),
    brandId: z.number().int().positive("Marque requise"),
    categoryId: z.number().int().positive("Catégorie requise"),
    description: z.string().trim().max(4000).default(""),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Prix invalide").refine((v) => Number(v) > 0, "Prix requis"),
    gender: z.enum(GENDERS),
    condition: z.enum(CONDITIONS),
    conditionNotes: z.string().trim().max(1000).default(""),
    sizes: z.array(z.string().trim().min(1).max(20)).max(25).default([]),
    sku: z.string().trim().max(80).nullable().optional(),
    status: z.enum(["draft", "published", "sold"]),
    featured: z.boolean().default(false),
    images: z.array(imageSchema).max(12).default([]),
    inventory: z.array(inventorySchema).max(10).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.status === "published") {
      if (data.images.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["images"], message: "Ajoutez au moins une photo avant de publier." });
      }
      if (data.inventory.reduce((sum, row) => sum + row.quantity, 0) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["inventory"], message: "Indiquez une quantité disponible dans au moins un magasin." });
      }
    }
    const stores = new Set(data.inventory.map((row) => row.storeId));
    if (stores.size !== data.inventory.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["inventory"], message: "Un seul stock par magasin." });
    }
    if (data.images.length && !data.images.some((image) => image.isMain)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["images"], message: "Sélectionnez une photo principale." });
    }
  });

export type ProductInput = z.infer<typeof productInputSchema>;

/**
 * A sold item must never advertise stock anywhere: quantities are zeroed so the
 * public site shows "Vendu" and no store is listed as having the item.
 */
export function withSoldStockCleared(input: ProductInput): ProductInput {
  if (input.status !== "sold") return input;
  return { ...input, inventory: input.inventory.map((row) => ({ ...row, quantity: 0 })) };
}
