import type { MetadataRoute } from "next";
import { ne } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = ["", "/boutique", "/a-propos", "/magasins", "/contact", "/faq", "/informations", "/confidentialite", "/conditions"].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.6,
  }));
  const rows = await db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(ne(products.status, "draft"));
  return [...staticRoutes, ...rows.map((row) => ({ url: `${base}/produit/${row.slug}`, lastModified: row.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }))];
}
