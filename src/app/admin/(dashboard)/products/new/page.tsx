import { asc } from "drizzle-orm";
import ProductFormClient from "@/components/ProductFormClient";
import { db } from "@/db";
import { brands, categories, stores } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ajouter un article" };

export default async function NewProductPage() {
  const [categoryRows, brandRows, storeRows] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db.select({ id: stores.id, shortName: stores.shortName, name: stores.name }).from(stores).orderBy(asc(stores.sortOrder)),
  ]);
  return <ProductFormClient mode="create" categories={categoryRows} brands={brandRows} stores={storeRows} />;
}
