import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, inventory, products } from "@/db/schema";
import { jsonError, readJson, requireOriginOrFail } from "@/lib/api";
import { getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  quantities: z.array(z.object({ storeId: z.number().int().positive(), quantity: z.number().int().min(0).max(9999) })).max(10),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const id = Number((await context.params).id);
  if (!Number.isInteger(id)) return jsonError("ID invalide", 400);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Quantités invalides", 400);

  const [product] = await db.select({ id: products.id, name: products.name }).from(products).where(eq(products.id, id)).limit(1);
  if (!product) return jsonError("Article introuvable", 404);

  await db.transaction(async (tx) => {
    for (const row of parsed.data.quantities) {
      await tx
        .insert(inventory)
        .values({ productId: id, storeId: row.storeId, quantity: row.quantity, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: [inventory.productId, inventory.storeId],
          set: { quantity: row.quantity, updatedAt: new Date() },
        });
    }
    await tx.update(products).set({ updatedAt: new Date() }).where(eq(products.id, id));
    await tx.insert(activityLog).values({ adminId: admin.id, action: "stock", entity: "product", details: `${product.name} (#${id})` });
  });
  return Response.json({ ok: true });
}
