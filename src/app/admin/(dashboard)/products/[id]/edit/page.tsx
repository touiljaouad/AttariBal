import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import ProductFormClient from "@/components/ProductFormClient";
import { db } from "@/db";
import { brands, categories, stores } from "@/db/schema";
import { getProductById } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modifier un article" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();
  const [product, categoryRows, brandRows, storeRows] = await Promise.all([
    getProductById(id),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db.select({ id: stores.id, shortName: stores.shortName, name: stores.name }).from(stores).orderBy(asc(stores.sortOrder)),
  ]);
  if (!product) notFound();

  return (
    <ProductFormClient
      mode="edit"
      categories={categoryRows}
      brands={brandRows}
      stores={storeRows}
      initial={{
        id: product.id,
        name: product.name,
        brandId: product.brandId,
        categoryId: product.categoryId,
        description: product.description,
        price: product.price,
        gender: product.gender,
        condition: product.condition,
        conditionNotes: product.conditionNotes,
        sizes: product.sizes,
        sku: product.sku || "",
        status: product.status,
        featured: product.featured,
        images: product.images.map((image) => ({ url: image.url, isMain: image.isMain, name: `Photo ${image.displayOrder + 1}` })),
        inventory: product.inventory.map((row) => ({ storeId: row.storeId, quantity: row.quantity })),
      }}
    />
  );
}
