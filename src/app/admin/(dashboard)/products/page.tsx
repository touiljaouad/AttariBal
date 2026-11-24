import { asc } from "drizzle-orm";
import AdminProductsClient from "@/components/AdminProductsClient";
import { db } from "@/db";
import { brands, categories, stores } from "@/db/schema";
import { queryProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion des articles" };

export default async function AdminProductsPage() {
  const [result, categoryRows, brandRows, storeRows] = await Promise.all([
    queryProducts({ includeDrafts: true, limit: 20 }),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db.select({ id: stores.id, name: stores.name, shortName: stores.shortName }).from(stores).orderBy(asc(stores.sortOrder)),
  ]);
  return (
    <AdminProductsClient
      initial={{ items: result.items, total: result.total, page: result.page, pages: result.pages }}
      stores={storeRows}
      categories={categoryRows}
      brands={brandRows}
    />
  );
}
