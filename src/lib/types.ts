import { stockStatus, totalStock, type ProductRecord } from "@/lib/catalog";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  price: string;
  brand: string;
  category: string;
  condition: string;
  gender: string;
  sizes: string[];
  status: string;
  featured: boolean;
  createdAt: string;
  image: string | null;
  images: string[];
  stock: number;
  stockStatus: string;
  stores: { name: string; key: string; quantity: number }[];
};

export function toCardData(product: ProductRecord): ProductCardData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    brand: product.brand?.name || "—",
    category: product.category?.name || "—",
    condition: product.condition,
    gender: product.gender,
    sizes: product.sizes,
    status: product.status,
    featured: product.featured,
    createdAt: product.createdAt.toISOString(),
    image: product.images.find((image) => image.isMain)?.url || product.images[0]?.url || null,
    images: product.images.map((image) => image.url),
    stock: totalStock(product),
    stockStatus: stockStatus(product),
    stores: product.inventory.map((row) => ({ name: row.storeName, key: row.storeKey, quantity: row.quantity })),
  };
}
