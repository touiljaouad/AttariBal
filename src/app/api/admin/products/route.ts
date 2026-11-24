import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, brands, categories, inventory, productImages, products } from "@/db/schema";
import { jsonError, readJson, requireOriginOrFail } from "@/lib/api";
import { getSessionAdmin } from "@/lib/auth";
import { queryProducts } from "@/lib/catalog";
import { slugify } from "@/lib/constants";
import { productInputSchema, withSoldStockCleared } from "@/lib/product-input";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const params = new URL(request.url).searchParams;
  return Response.json(await queryProducts({ ...Object.fromEntries(params.entries()), includeDrafts: true }));
}

export async function POST(request: Request) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);

  const parsed = productInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
  const input = withSoldStockCleared(parsed.data);

  const [brand] = await db.select({ id: brands.id }).from(brands).where(eq(brands.id, input.brandId)).limit(1);
  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, input.categoryId)).limit(1);
  if (!brand || !category) return jsonError("Marque ou catégorie introuvable", 400);

  const id = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(products)
      .values({
        name: input.name,
        slug: slugify(input.name),
        brandId: input.brandId,
        categoryId: input.categoryId,
        description: input.description,
        price: input.price,
        gender: input.gender,
        condition: input.condition,
        conditionNotes: input.conditionNotes,
        sizes: input.sizes,
        sku: input.sku || null,
        status: input.status,
        featured: input.featured,
      })
      .returning({ id: products.id });
    if (input.images.length) await tx.insert(productImages).values(input.images.map((image) => ({ ...image, productId: created.id })));
    if (input.inventory.length) await tx.insert(inventory).values(input.inventory.map((row) => ({ ...row, productId: created.id })));
    await tx.insert(activityLog).values({
      adminId: admin.id,
      action: input.status === "published" ? "publish" : "create",
      entity: "product",
      details: `${input.name} (#${created.id})`,
    });
    return created.id;
  });

  return Response.json({ ok: true, id });
}
