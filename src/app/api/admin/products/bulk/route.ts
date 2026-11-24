import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, inventory, productImages, products } from "@/db/schema";
import { jsonError, readJson, requireOriginOrFail } from "@/lib/api";
import { getSessionAdmin } from "@/lib/auth";
import { getProductById } from "@/lib/catalog";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
  action: z.enum(["publish", "unpublish", "sold", "delete"]),
});

export async function POST(request: Request) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Action invalide", 400);
  const { ids, action } = parsed.data;
  let changed = 0;
  let skipped = 0;

  for (const id of ids) {
    const product = await getProductById(id);
    if (!product) continue;
    if (action === "publish") {
      if (!product.images.length || product.inventory.reduce((s, r) => s + r.quantity, 0) <= 0) {
        skipped += 1;
        continue;
      }
      await db.update(products).set({ status: "published", updatedAt: new Date() }).where(eq(products.id, id));
    } else if (action === "delete") {
      await db.delete(products).where(eq(products.id, id));
    } else {
      const status = action === "sold" ? "sold" : "draft";
      await db.update(products).set({ status, updatedAt: new Date() }).where(eq(products.id, id));
      if (action === "sold") {
        await db.update(inventory).set({ quantity: 0, updatedAt: new Date() }).where(eq(inventory.productId, id));
      }
    }
    await db.insert(activityLog).values({ adminId: admin.id, action: `bulk_${action}`, entity: "product", details: `${product.name} (#${id})` });
    changed += 1;
  }
  return Response.json({ ok: true, changed, skipped });
}
