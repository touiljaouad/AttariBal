"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/lib/i18n";
import type { ProductCardData } from "@/lib/types";

export default function ProductRail({
  title,
  subtitle,
  products,
  href = "/boutique",
  emptyTitle,
  emptyText,
}: {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  href?: string;
  emptyTitle?: string;
  emptyText?: string;
}) {
  const { t } = useLanguage();
  return (
    <section className="section-pad border-b border-white/[0.06]">
      <div className="container-wide">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-3">{subtitle || "Ataribal100original"}</p>
            <h2 className="display text-3xl sm:text-4xl">{title}</h2>
            <div className="gold-line mt-5 w-16" />
          </div>
          <Link href={href} className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 hover:text-[#D4AF37]">
            {t("common.viewAll")} <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </Link>
        </div>
        {products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="border border-dashed border-white/15 px-6 py-14 text-center">
            <h3 className="text-lg font-semibold">{emptyTitle || t("home.empty")}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/45">{emptyText || t("home.emptyText")}</p>
            <Link href="/magasins" className="btn btn-outline mt-6">{t("hero.cta2")}</Link>
          </div>
        )}
      </div>
    </section>
  );
}
