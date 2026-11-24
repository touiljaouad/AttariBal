import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, inventory, productImages, products, stores } from "@/db/schema";

export type CatalogFilters = {
  q?: string;
  category?: string;
  brand?: string;
  gender?: string;
  size?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  store?: string;
  availability?: string;
  sort?: string;
  page?: string | number;
  limit?: string | number;
  featured?: boolean;
  latest?: boolean;
  includeDrafts?: boolean;
  status?: string;
};

export type ProductRecord = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  gender: string;
  condition: string;
  conditionNotes: string;
  sizes: string[];
  sku: string | null;
  status: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  brandId: number | null;
  categoryId: number | null;
  brand: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  images: { id: number; url: string; isMain: boolean; displayOrder: number }[];
  inventory: { storeId: number; storeKey: string; storeName: string; quantity: number }[];
};

const totalQtySql = sql`(select coalesce(sum(${inventory.quantity}), 0) from ${inventory} where ${inventory.productId} = ${products.id})`;

export function stockStatus(p: Pick<ProductRecord, "status" | "inventory">) {
  if (p.status === "sold") return "sold";
  const total = p.inventory.reduce((sum, row) => sum + row.quantity, 0);
  if (total <= 0) return "soldout";
  if (total <= 2) return "low";
  return "available";
}

export function totalStock(p: Pick<ProductRecord, "inventory">) {
  return p.inventory.reduce((sum, row) => sum + row.quantity, 0);
}

async function attachRelations(rows: Omit<ProductRecord, "images" | "inventory">[]): Promise<ProductRecord[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [imageRows, inventoryRows] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.displayOrder)),
    db
      .select({
        productId: inventory.productId,
        storeId: stores.id,
        storeKey: stores.key,
        storeName: stores.shortName,
        quantity: inventory.quantity,
      })
      .from(inventory)
      .innerJoin(stores, eq(stores.id, inventory.storeId))
      .where(inArray(inventory.productId, ids)),
  ]);

  const imagesByProduct = new Map<number, ProductRecord["images"]>();
  for (const image of imageRows) {
    const list = imagesByProduct.get(image.productId) ?? [];
    list.push({ id: image.id, url: image.url, isMain: image.isMain, displayOrder: image.displayOrder });
    imagesByProduct.set(image.productId, list);
  }
  const inventoryByProduct = new Map<number, ProductRecord["inventory"]>();
  for (const row of inventoryRows) {
    const list = inventoryByProduct.get(row.productId) ?? [];
    list.push({ storeId: row.storeId, storeKey: row.storeKey, storeName: row.storeName, quantity: row.quantity });
    inventoryByProduct.set(row.productId, list);
  }
  return rows.map((row) => ({
    ...row,
    images: imagesByProduct.get(row.id) ?? [],
    inventory: inventoryByProduct.get(row.id) ?? [],
  }));
}

export async function queryProducts(filters: CatalogFilters = {}) {
  const conditions = [];
  if (!filters.includeDrafts) conditions.push(ne(products.status, "draft"));
  if (filters.status) conditions.push(eq(products.status, filters.status));
  if (filters.q) {
    const like = `%${filters.q.replace(/[%_]/g, "").slice(0, 80)}%`;
    conditions.push(or(ilike(products.name, like), ilike(brands.name, like), ilike(products.sku, like))!);
  }
  if (filters.category && /^\d+$/.test(filters.category)) conditions.push(eq(products.categoryId, Number(filters.category)));
  else if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.brand && /^\d+$/.test(filters.brand)) conditions.push(eq(products.brandId, Number(filters.brand)));
  else if (filters.brand) conditions.push(eq(brands.slug, filters.brand));
  if (filters.gender) conditions.push(eq(products.gender, filters.gender));
  if (filters.condition) conditions.push(eq(products.condition, filters.condition));
  if (filters.size) conditions.push(sql`${products.sizes}::jsonb @> ${JSON.stringify([filters.size])}::jsonb`);
  if (filters.minPrice) conditions.push(gte(products.price, filters.minPrice));
  if (filters.maxPrice) conditions.push(lte(products.price, filters.maxPrice));
  if (filters.featured) conditions.push(eq(products.featured, true));
  if (filters.store && /^\d+$/.test(filters.store)) {
    conditions.push(
      inArray(
        products.id,
        db.select({ id: inventory.productId }).from(inventory).where(and(eq(inventory.storeId, Number(filters.store)), sql`${inventory.quantity} > 0`)),
      ),
    );
  }
  if (filters.availability === "available") {
    conditions.push(ne(products.status, "sold"), sql`${totalQtySql} > 0`);
  } else if (filters.availability === "soldout") {
    conditions.push(sql`${totalQtySql} = 0`);
  } else if (filters.availability === "low") {
    conditions.push(ne(products.status, "sold"), sql`${totalQtySql} > 0`, sql`${totalQtySql} <= 2`);
  } else if (filters.availability === "sold") {
    conditions.push(eq(products.status, "sold"));
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(filters.limit) || 12));
  const offset = (page - 1) * limit;

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(where);

  const order = filters.sort === "price_asc" ? asc(products.price) : filters.sort === "price_desc" ? desc(products.price) : desc(products.createdAt);

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      gender: products.gender,
      condition: products.condition,
      conditionNotes: products.conditionNotes,
      sizes: products.sizes,
      sku: products.sku,
      status: products.status,
      featured: products.featured,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      brandId: products.brandId,
      categoryId: products.categoryId,
      brand: { id: brands.id, name: brands.name },
      category: { id: categories.id, name: categories.name },
    })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(where)
    .orderBy(order, desc(products.id))
    .limit(limit)
    .offset(offset);

  const items = await attachRelations(rows);
  const total = countRow?.count ?? 0;
  return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getProductBySlug(slug: string, includeDrafts = false) {
  const conditions = [eq(products.slug, slug)];
  if (!includeDrafts) conditions.push(ne(products.status, "draft"));
  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      gender: products.gender,
      condition: products.condition,
      conditionNotes: products.conditionNotes,
      sizes: products.sizes,
      sku: products.sku,
      status: products.status,
      featured: products.featured,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      brandId: products.brandId,
      categoryId: products.categoryId,
      brand: { id: brands.id, name: brands.name },
      category: { id: categories.id, name: categories.name },
    })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(and(...conditions))
    .limit(1);
  if (!row) return null;
  return (await attachRelations([row]))[0];
}

export async function getProductById(id: number) {
  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      gender: products.gender,
      condition: products.condition,
      conditionNotes: products.conditionNotes,
      sizes: products.sizes,
      sku: products.sku,
      status: products.status,
      featured: products.featured,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      brandId: products.brandId,
      categoryId: products.categoryId,
      brand: { id: brands.id, name: brands.name },
      category: { id: categories.id, name: categories.name },
    })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.id, id))
    .limit(1);
  if (!row) return null;
  return (await attachRelations([row]))[0];
}
