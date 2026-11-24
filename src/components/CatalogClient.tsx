"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { CONDITIONS, GENDERS, SHOE_SIZES, CLOTHING_SIZES } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";
import type { ProductCardData } from "@/lib/types";

type Result = { items: ProductCardData[]; total: number; page: number; pages: number };
type Props = {
  initial: Result;
  initialFilters: Record<string, string>;
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  stores: { id: number; name: string }[];
};

const emptyFilters = {
  q: "", category: "", brand: "", gender: "", size: "", condition: "", minPrice: "", maxPrice: "", store: "", availability: "", sort: "newest", page: "1",
};

export default function CatalogClient({ initial, initialFilters, categories, brands, stores }: Props) {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<Record<string, string>>({ ...emptyFilters, ...initialFilters, page: "1" });
  const [result, setResult] = useState<Result>(initial);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const first = useRef(true);

  const load = useCallback(async (next: Record<string, string>, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => { if (value && !(key === "sort" && value === "newest")) params.set(key, value); });
    setLoading(true);
    try {
      const response = await fetch(`/api/products?${params.toString()}`, { signal, cache: "no-store" });
      if (!response.ok) throw new Error("fetch failed");
      const data = (await response.json()) as { items: ProductCardData[]; total: number; page: number; pages: number };
      setResult(data);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setLoading(false);
      return;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const controller = new AbortController();
    const timer = setTimeout(() => load(filters, controller.signal), 260);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [filters, load]);

  function update(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value, page: "1" }));
  }

  function reset() { setFilters({ ...emptyFilters }); void load(emptyFilters); }

  function goToPage(page: number) {
    const next = { ...filters, page: String(page) };
    setFilters(next);
    void load(next);
    window.scrollTo({ top: 180, behavior: "smooth" });
  }

  const selectClass = "input !py-2 !text-xs";
  const sizes = [...CLOTHING_SIZES.filter((s) => s !== "Other"), ...SHOE_SIZES, "Other"];

  const filterFields = (
    <div className="space-y-5">
      <div>
        <label className="field-label">{t("catalog.search")}</label>
        <div className="relative">
          <input className="input pe-9" value={filters.q} onChange={(e) => update("q", e.target.value)} placeholder={t("catalog.search")} />
          {filters.q && <button type="button" onClick={() => update("q", "")} aria-label="Clear" className="absolute end-2 top-2 text-white/40 hover:text-white"><X size={16} /></button>}
        </div>
      </div>
      <div>
        <label className="field-label">{t("catalog.category")}</label>
        <select className={selectClass} value={filters.category} onChange={(e) => update("category", e.target.value)}>
          <option value="">{t("catalog.all")}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="field-label">{t("catalog.brand")}</label>
        <select className={selectClass} value={filters.brand} onChange={(e) => update("brand", e.target.value)}>
          <option value="">{t("catalog.all")}</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">{t("catalog.gender")}</label>
          <select className={selectClass} value={filters.gender} onChange={(e) => update("gender", e.target.value)}>
            <option value="">{t("catalog.all")}</option>
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">{t("catalog.size")}</label>
          <select className={selectClass} value={filters.size} onChange={(e) => update("size", e.target.value)}>
            <option value="">{t("catalog.all")}</option>
            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="field-label">{t("catalog.condition")}</label>
        <select className={selectClass} value={filters.condition} onChange={(e) => update("condition", e.target.value)}>
          <option value="">{t("catalog.all")}</option>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="field-label">{t("catalog.price")}</label>
        <div className="flex items-center gap-2">
          <input type="number" min="0" className="input !py-2 !text-xs" placeholder="0" value={filters.minPrice} onChange={(e) => update("minPrice", e.target.value)} />
          <span className="text-white/30">—</span>
          <input type="number" min="0" className="input !py-2 !text-xs" placeholder="∞" value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="field-label">{t("catalog.store")}</label>
        <select className={selectClass} value={filters.store} onChange={(e) => update("store", e.target.value)}>
          <option value="">{t("catalog.all")}</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="field-label">{t("catalog.availability")}</label>
        <select className={selectClass} value={filters.availability} onChange={(e) => update("availability", e.target.value)}>
          <option value="">{t("catalog.all")}</option>
          <option value="available">{t("catalog.available")}</option>
          <option value="low">{t("catalog.lowStock")}</option>
          <option value="soldout">{t("catalog.soldOut")}</option>
          <option value="sold">{t("catalog.sold")}</option>
        </select>
      </div>
      <button type="button" onClick={reset} className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D4AF37] hover:underline">{t("catalog.reset")}</button>
    </div>
  );

  return (
    <div className="container-wide py-14">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow mb-4">Ataribal100original / {t("nav.shop")}</p>
        <h1 className="display text-4xl sm:text-6xl">{t("catalog.title")}</h1>
        <p className="mt-5 text-sm leading-relaxed text-white/50">{t("catalog.subtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className={`lg:block ${showFilters ? "block" : "hidden"}`}>
          <div className="border border-white/10 bg-[#101010] p-5 lg:sticky lg:top-28">{filterFields}</div>
        </aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setShowFilters((v) => !v)} className="btn btn-outline !min-h-9 !px-3 !text-[10px] lg:hidden"><SlidersHorizontal size={14} /> {t("catalog.filters")}</button>
              <p className="text-xs text-white/45"><span className="font-bold text-white">{result.total}</span> {t("catalog.results")}</p>
              {loading && <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] pulse-soft">{t("common.loading")}</span>}
            </div>
            <label className="flex items-center gap-3 text-[11px] text-white/45">
              {t("catalog.sort")}
              <select className="input !w-auto !py-2 !text-xs" value={filters.sort} onChange={(e) => update("sort", e.target.value)}>
                <option value="newest">{t("catalog.newest")}</option>
                <option value="price_asc">{t("catalog.priceAsc")}</option>
                <option value="price_desc">{t("catalog.priceDesc")}</option>
              </select>
            </label>
          </div>

          {result.items.length ? (
            <div className={`grid grid-cols-2 gap-3 transition-opacity sm:gap-5 md:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
              {result.items.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="border border-dashed border-white/15 px-6 py-20 text-center">
              <h2 className="text-lg font-semibold">{t("catalog.empty")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/45">{t("catalog.emptyText")}</p>
              <button type="button" onClick={reset} className="btn btn-outline mt-6">{t("catalog.reset")}</button>
            </div>
          )}

          {result.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button type="button" disabled={result.page <= 1} onClick={() => goToPage(result.page - 1)} className="grid h-9 w-9 place-items-center border border-white/15 disabled:opacity-30"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(result.pages, 7) }, (_, i) => i + 1).map((page) => (
                <button key={page} type="button" onClick={() => goToPage(page)} className={`h-9 w-9 border text-xs ${page === result.page ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/15 text-white/60 hover:border-white/40"}`}>{page}</button>
              ))}
              <button type="button" disabled={result.page >= result.pages} onClick={() => goToPage(result.page + 1)} className="grid h-9 w-9 place-items-center border border-white/15 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
