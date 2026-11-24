import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import ProductDetail from "@/components/ProductDetail";
import { db } from "@/db";
import { settings, stores } from "@/db/schema";
import { getProductBySlug, queryProducts } from "@/lib/catalog";
import { toCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Article introuvable" };
  const image = product.images.find((img) => img.isMain)?.url || product.images[0]?.url;
  return {
    title: `${product.name} — ${product.brand?.name || "Ataribal100original"}`,
    description: `${product.brand?.name} ${product.name} — ${product.condition}. Disponible en magasin à Mohammédia.`,
    openGraph: { title: `${product.name} | Ataribal100original`, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [[site], storeRows, relatedResult] = await Promise.all([
    db.select().from(settings).where(eq(settings.id, 1)).limit(1),
    db.select().from(stores).orderBy(asc(stores.sortOrder)),
    queryProducts({ category: String(product.categoryId || ""), limit: 8 }),
  ]);

  const card = toCardData(product);
  return (
    <ProductDetail
      product={{ ...card, description: product.description, conditionNotes: product.conditionNotes, sku: product.sku }}
      stores={storeRows.map((store) => ({ ...store }))}
      whatsappUrl={site?.whatsappUrl || "https://chat.whatsapp.com/F0Q2gf1p4PpE5qBBcqALWB"}
      instagramUrl={site?.instagramUrl || "https://www.instagram.com/atari_bal/"}
      related={relatedResult.items.filter((item) => item.id !== product.id).slice(0, 4).map(toCardData)}
    />
  );
}
