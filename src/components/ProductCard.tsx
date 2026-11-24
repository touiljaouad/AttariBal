"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";
import type { ProductCardData } from "@/lib/types";

export default function ProductCard({ product }: { product: ProductCardData }) {
  const { t } = useLanguage();
  const availableStores = product.stores.filter((store) => store.quantity > 0);
  const statusLabel =
    product.status === "sold"
      ? t("catalog.sold")
      : product.stockStatus === "soldout"
        ? t("catalog.soldOut")
        : product.stockStatus === "low"
          ? t("catalog.lowStock")
          : null;

  return (
    <article className="product-card group">
      <Link href={`/produit/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#171717]">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" className="object-cover" unoptimized />
          ) : (
            <div className="grid h-full place-items-center text-center text-[10px] uppercase tracking-[0.2em] text-white/25">Photo à venir</div>
          )}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span className="badge bg-black/75 text-[#D4AF37] backdrop-blur">{product.brand}</span>
            {statusLabel && <span className={`badge ${product.status === "sold" || product.stockStatus === "soldout" ? "badge-sold" : "badge-low"}`}>{statusLabel}</span>}
          </div>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">{product.category}</p>
          <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-white transition group-hover:text-[#D4AF37]">{product.name}</h3>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-base font-bold text-[#D4AF37]">{formatPrice(product.price)}</p>
              <p className="mt-1 text-[11px] text-white/45">{product.condition}</p>
            </div>
            <ArrowUpRight size={17} className="mb-1 text-white/25 transition group-hover:text-[#D4AF37]" />
          </div>
          <p className="mt-3 truncate border-t border-white/[0.07] pt-3 text-[10px] text-white/45">
            {availableStores.length
              ? `${t("product.availableAt")} ${availableStores.map((store) => store.name).join(" · ")}`
              : product.status === "sold"
                ? t("catalog.sold")
                : t("catalog.soldOut")}
          </p>
        </div>
      </Link>
    </article>
  );
}
