import { asc } from "drizzle-orm";
import TaxonomyManager from "@/components/TaxonomyManager";
import { db } from "@/db";
import { categories } from "@/db/schema";
export const dynamic = "force-dynamic";
export const metadata = { title: "Catégories" };
export default async function CategoriesPage() {
  const items = await db.select().from(categories).orderBy(asc(categories.name));
  return <TaxonomyManager type="categories" label="Catégories" initial={items} />;
}
