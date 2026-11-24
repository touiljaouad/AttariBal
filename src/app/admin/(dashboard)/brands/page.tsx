import { asc } from "drizzle-orm";
import TaxonomyManager from "@/components/TaxonomyManager";
import { db } from "@/db";
import { brands } from "@/db/schema";
export const dynamic = "force-dynamic";
export const metadata = { title: "Marques" };
export default async function BrandsPage() {
  const items = await db.select().from(brands).orderBy(asc(brands.name));
  return <TaxonomyManager type="brands" label="Marques" initial={items} />;
}
