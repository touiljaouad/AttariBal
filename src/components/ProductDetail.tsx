"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, MessageCircle, Navigation, Share2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { formatPrice } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";
import type { ProductCardData } from "@/lib/types";

type StoreLocation = { id: number; key: string; name: string; shortName: string; address: string; mapsUrl: string; phone: string | null };
type Props = {
  product: ProductCardData & { description: string; conditionNotes: string; sku: string | null };
  stores: StoreLocation[];
  whatsappUrl: string;
  instagramUrl: string;
  related: ProductCardData[];
};

export default function ProductDetail({ product, stores, whatsappUrl, instagramUrl, related }: Props) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const images = product.images.length ? product.images : product.image ? [product.image] : [];
  const availableStores = stores.filter((store) => (product.stores.find((row) => row.key === store.key)?.quantity ?? 0) > 0);
  const sold = product.status === "sold" || product.stockStatus === "soldout";
  const statusLabel = product.status === "sold" ? t("catalog.sold") : product.stockStatus === "soldout" ? t("catalog.soldOut") : product.stockStatus === "low" ? t("catalog.lowStock") : t("catalog.available");

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* user cancelled */ }
  }

  const message = encodeURIComponent(`Bonjour, je m'intéresse à l'article "${product.name}" (${formatPrice(product.price)}). Est-il toujours disponible ?`);

  return (
    <div className="container-wide py-12">
      <Link href="/boutique" className="mb-9 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/45 hover:text-[#D4AF37]"><ArrowLeft size={14} /> {t("product.back")}</Link>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-[#131313]">
            {images.length ? (
              <Image src={images[active]} alt={product.name} fill priority sizes="(max-width:1024px) 100vw, 55vw" className="object-cover" unoptimized />
            ) : (
              <div className="grid h-full place-items-center text-sm uppercase tracking-[0.2em] text-white/25">Photo à venir</div>
            )}
            <span className={`badge absolute start-4 top-4 ${sold ? "badge-sold" : product.stockStatus === "low" ? "badge-low" : "bg-black/80 text-[#D4AF37]"}`}>{statusLabel}</span>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
              {images.map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setActive(index)} aria-label={`Photo ${index + 1}`} className={`relative h-24 w-20 shrink-0 overflow-hidden border-2 transition ${active === index ? "border-[#D4AF37]" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <Image src={image} alt="" fill sizes="80px" className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow mb-3">{product.brand} · {product.category}</p>
          <h1 className="display text-3xl sm:text-5xl">{product.name}</h1>
          <p className="mt-6 text-3xl font-bold text-[#D4AF37]">{formatPrice(product.price)}</p>
          <div className="gold-line my-7 w-16" />

          <div className="grid grid-cols-2 gap-y-5 border-y border-white/10 py-6 text-sm">
            <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{t("home.why1")}</p><p className="mt-1.5">{product.condition}</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{t("catalog.gender")}</p><p className="mt-1.5">{product.gender}</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{t("catalog.size")}</p><p className="mt-1.5">{product.sizes.length ? product.sizes.join(" · ") : "—"}</p></div>
            <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{t("product.reference")}</p><p className="mt-1.5" dir="ltr">{product.sku || `ATB-${product.id}`}</p></div>
          </div>

          {product.description && <div className="mt-7"><h2 className="eyebrow mb-3">{t("product.description")}</h2><p className="whitespace-pre-line text-sm leading-relaxed text-white/60">{product.description}</p></div>}
          {product.conditionNotes && <div className="mt-6 border-s-2 border-[#D4AF37] bg-white/[0.03] p-4"><h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">{t("product.conditionNote")}</h3><p className="mt-2 text-sm text-white/65">{product.conditionNotes}</p></div>}

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`${whatsappUrl}?text=${message}`} target="_blank" rel="noopener noreferrer" className="btn btn-gold"><MessageCircle size={15} /> {t("product.whatsapp")}</a>
            <button type="button" onClick={share} className="btn btn-outline">{copied ? <Check size={15} /> : <Share2 size={15} />} {copied ? "Copié" : t("product.share")}</button>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">Instagram ↗</a>
          </div>
          <p className="mt-4 text-[11px] text-white/35">{t("product.inStoreOnly")}</p>
        </div>
      </div>

      <section className="mt-16 border border-white/10 bg-[#101010] p-7 sm:p-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><p className="eyebrow mb-2">{t("product.where")}</p><h2 className="display text-2xl sm:text-3xl">{t("product.availableAt")}</h2></div>
          <span className={`badge ${sold ? "badge-sold" : "border border-[#D4AF37]/40 text-[#D4AF37]"}`}>{statusLabel}</span>
        </div>
        {availableStores.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {availableStores.map((store) => {
              const quantity = product.stores.find((row) => row.key === store.key)?.quantity ?? 0;
              return (
                <div key={store.id} className="border border-white/10 bg-[#151515] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div><h3 className="font-bold uppercase tracking-[0.08em]">{store.shortName}</h3><p className="mt-1 text-xs leading-relaxed text-white/45">{store.address}</p></div>
                    <MapPin size={18} className="shrink-0 text-[#D4AF37]" />
                  </div>
                  <p className="mt-4 text-xs text-[#D4AF37]">{quantity} {quantity === 1 ? "pièce disponible" : "pièces disponibles"}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold !min-h-9 !px-3 !text-[9px]"><Navigation size={13} /> {t("product.directions")}</a>
                    {store.phone && <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="btn btn-outline !min-h-9 !px-3 !text-[9px]">{t("stores.call")}</a>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-white/15 p-8 text-center text-sm text-white/50">
            {product.status === "sold" ? t("catalog.sold") : t("catalog.soldOut")} — {t("nav.stores")}: <Link href="/magasins" className="text-[#D4AF37] underline">{t("hero.cta2")}</Link>
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="display mb-8 text-3xl">{t("product.related")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
