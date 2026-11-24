import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, inventory, productImages, products } from "@/db/schema";
import { jsonError, readJson, requireOriginOrFail } from "@/lib/api";
import { getSessionAdmin } from "@/lib/auth";
import { getProductById, queryProducts } from "@/lib/catalog";
import { slugify } from "@/lib/constants";
import { productInputSchema, withSoldStockCleared } from "@/lib/product-input";
import { deleteImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const id = Number((await context.params).id);
  if (!Number.isInteger(id)) return jsonError("ID invalide", 400);
  const product = await getProductById(id);
  if (!product) return jsonError("Article introuvable", 404);
  return Response.json(product);
}

export async function PATCH(request: Request, context: Context) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const id = Number((await context.params).id);
  if (!Number.isInteger(id)) return jsonError("ID invalide", 400);

  const parsed = productInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
  const input = withSoldStockCleared(parsed.data);
  const existing = await getProductById(id);
  if (!existing) return jsonError("Article introuvable", 404);

  await db.transaction(async (tx) => {
    await tx
      .update(products)
      .set({
        name: input.name,
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
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
    await tx.delete(productImages).where(eq(productImages.productId, id));
    await tx.delete(inventory).where(eq(inventory.productId, id));
    if (input.images.length) await tx.insert(productImages).values(input.images.map((image) => ({ ...image, productId: id })));
    if (input.inventory.length) await tx.insert(inventory).values(input.inventory.map((row) => ({ ...row, productId: id })));
    await tx.insert(activityLog).values({ adminId: admin.id, action: "update", entity: "product", details: `${input.name} (#${id})` });
  });
  return Response.json({ ok: true, id });
}

export async function DELETE(_request: Request, context: Context) {
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const id = Number((await context.params).id);
  if (!Number.isInteger(id)) return jsonError("ID invalide", 400);
  const product = await getProductById(id);
  if (!product) return jsonError("Article introuvable", 404);

  await db.delete(products).where(eq(products.id, id));
  // Images shared with duplicates are kept; only orphaned files are removed.
  for (const image of product.images) {
    const remaining = await db.select({ id: productImages.id }).from(productImages).where(eq(productImages.url, image.url)).limit(1);
    if (remaining.length === 0) await deleteImage(image.url);
  }
  await db.insert(activityLog).values({ adminId: admin.id, action: "delete", entity: "product", details: `${product.name} (#${id})` });
  return Response.json({ ok: true });
}

export async function POST(request: Request, context: Context) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const id = Number((await context.params).id);
  const source = await getProductById(id);
  if (!source) return jsonError("Article introuvable", 404);

  const [copy] = await db
    .insert(products)
    .values({
      name: `${source.name} (copie)`,
      slug: slugify(`${source.name}-copie`),
      brandId: source.brandId,
      categoryId: source.categoryId,
      description: source.description,
      price: source.price,
      gender: source.gender,
      condition: source.condition,
      conditionNotes: source.conditionNotes,
      sizes: source.sizes,
      sku: source.sku,
      status: "draft",
      featured: false,
    })
    .returning({ id: products.id });
  if (source.images.length) {
    await db.insert(productImages).values(
      source.images.map((image, i) => ({ productId: copy.id, url: image.url, isMain: i === 0, displayOrder: i })),
    );
  }
  if (source.inventory.length) {
    await db.insert(inventory).values(source.inventory.map((row) => ({ productId: copy.id, storeId: row.storeId, quantity: row.quantity })));
  }
  await db.insert(activityLog).values({ adminId: admin.id, action: "duplicate", entity: "product", details: `${source.name} → #${copy.id}` });
  return Response.json({ ok: true, id: copy.id });
}

export async function HEAD(_request: Request, context: Context) {
  const admin = await getSessionAdmin();
  if (!admin) return new Response(null, { status: 401 });
  const id = Number((await context.params).id);
  const exists = await queryProducts({ includeDrafts: true, q: String(id) });
  return new Response(null, { status: exists.items.some((p) => p.id === id) ? 200 : 404 });
}
