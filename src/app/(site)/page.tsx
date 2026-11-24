import { asc, and, eq, ne, sql } from "drizzle-orm";
import HomeContent from "@/components/HomeContent";
import { db } from "@/db";
import { brands, categories, products, settings, stores } from "@/db/schema";
import { queryProducts } from "@/lib/catalog";
import { toCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latest, featured, storeRows, [site], categoryRows, brandRows] = await Promise.all([
    queryProducts({ limit: 8 }),
    queryProducts({ featured: true, limit: 8 }),
    db.select().from(stores).orderBy(asc(stores.sortOrder)),
    db.select().from(settings).where(eq(settings.id, 1)).limit(1),
    db
      .select({ id: categories.id, name: categories.name, count: sql<number>`count(${products.id})::int` })
      .from(categories)
      .leftJoin(products, and(eq(products.categoryId, categories.id), ne(products.status, "draft")))
      .groupBy(categories.id)
      .orderBy(asc(categories.name)),
    db
      .select({ id: brands.id, name: brands.name, count: sql<number>`count(${products.id})::int` })
      .from(brands)
      .leftJoin(products, and(eq(products.brandId, brands.id), ne(products.status, "draft")))
      .groupBy(brands.id)
      .orderBy(asc(brands.name)),
  ]);

  return (
    <HomeContent
      latest={latest.items.map(toCardData)}
      featured={featured.items.map(toCardData)}
      categories={categoryRows}
      brands={brandRows}
      stores={storeRows.map((store) => ({ ...store, hours: store.hours || {} }))}
      whatsappUrl={site?.whatsappUrl || "https://chat.whatsapp.com/F0Q2gf1p4PpE5qBBcqALWB"}
      instagramUrl={site?.instagramUrl || "https://www.instagram.com/atari_bal/"}
    />
  );
}
