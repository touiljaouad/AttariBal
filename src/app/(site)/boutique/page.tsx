import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import CatalogClient from "@/components/CatalogClient";
import { db } from "@/db";
import { brands, categories, stores } from "@/db/schema";
import { queryProducts } from "@/lib/catalog";
import { toCardData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Boutique — Toute la collection", description: "Découvrez les articles originaux disponibles dans nos boutiques à Mohammédia." };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const initialFilters: Record<string, string> = {};
  const allowed = ["q", "category", "brand", "gender", "size", "condition", "minPrice", "maxPrice", "store", "availability", "sort", "page"];
  for (const key of allowed) {
    const value = params[key];
    if (typeof value === "string") initialFilters[key] = value;
  }

  const [categoryRows, brandRows, storeRows] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db.select({ id: stores.id, name: stores.shortName }).from(stores).orderBy(asc(stores.sortOrder)),
  ]);

  const result = await queryProducts({ ...initialFilters, limit: 12 });

  return (
    <CatalogClient
      initial={{ items: result.items.map(toCardData), total: result.total, page: result.page, pages: result.pages }}
      initialFilters={initialFilters}
      categories={categoryRows}
      brands={brandRows}
      stores={storeRows}
    />
  );
}
