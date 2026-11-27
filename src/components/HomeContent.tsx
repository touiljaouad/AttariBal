"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, ShieldCheck, ShoppingBag, Sparkles, Store } from "lucide-react";
import ProductRail from "@/components/ProductRail";
import StoreCard, { type StoreCardData } from "@/components/StoreCard";
import { InstagramIcon } from "@/components/SocialIcons";
import { useLanguage } from "@/lib/i18n";
import type { ProductCardData } from "@/lib/types";

type Props = {
  latest: ProductCardData[];
  featured: ProductCardData[];
  categories: { id: number; name: string; count: number }[];
  brands: { id: number; name: string; count: number }[];
  stores: StoreCardData[];
  whatsappUrl: string;
  instagramUrl: string;
};

function categoryImageFor(name: string) {
  const value = name.toLocaleLowerCase();
  const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;

  if (/sneaker|shoe|shoes|basket|chauss|footwear|حذاء|أحذية|سنيكرز/.test(value)) {
    return image("photo-1542291026-7eec264c27ff");
  }
  if (/bag|sac|sacs|backpack|حقيبة|حقائب/.test(value)) {
    return image("photo-1584917865442-de89df76afd3");
  }
  if (/accessor|montre|watch|cap|casquette|lunette|belt|ceinture|إكسسوار|اكسسوارات/.test(value)) {
    return image("photo-150963ука");
  }
  return image("photo-1490481651871-ab68de25d43d");
}

export default function HomeContent({ latest, featured, categories, brands, stores, whatsappUrl, instagramUrl }: Props) {
  const { t } = useLanguage();

  return (
    <>
      <section className="relative flex min-h-[86vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/hero-editorial.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[65%_center] opacity-55" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/85 to-[#080808]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/70" />
        </div>
        <div className="container-wide relative z-10 py-28">
          <div className="max-w-3xl">
            <p className="eyebrow reveal mb-7 flex items-center gap-3"><span className="h-px w-9 bg-[#D4AF37]" /> {t("hero.kicker")}</p>
            <h1 className="display reveal text-[clamp(3rem,8vw,7.2rem)] uppercase text-white" style={{ animationDelay: "80ms" }}>
              {t("hero.line1")}<br />{t("hero.line2")}<br /><span className="text-[#D4AF37]">{t("hero.line3")}</span>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-white/65 reveal" style={{ animationDelay: "160ms" }}>{t("hero.text")}</p>
            <div className="mt-9 flex flex-wrap gap-4 reveal" style={{ animationDelay: "240ms" }}>
              <Link href="/boutique" className="btn btn-gold">{t("hero.cta")} <ArrowRight size={15} /></Link>
              <Link href="/magasins" className="btn btn-outline">{t("hero.cta2")}</Link>
            </div>
            <div className="mt-14 flex flex-wrap gap-8 text-[11px] uppercase tracking-[0.18em] text-white/40">
              <span>01 — {categories.length} {t("catalog.category").toLowerCase()}</span>
              <span>02 — {brands.length} {t("catalog.brand").toLowerCase()}</span>
              <span>03 — {stores.length} {t("nav.stores").toLowerCase()}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-white/10 bg-[#0d0d0d]">
        <div className="container-wide flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
          <span>Original brands</span><span className="text-[#D4AF37]">◆</span><span>Vintage selection</span><span className="text-[#D4AF37]">◆</span><span>Mohammédia, Morocco</span><span className="text-[#D4AF37]">◆</span><span>In-store only</span>
        </div>
      </div>

      <ProductRail title={t("home.new")} subtitle={t("home.newSub")} products={latest} />
      <ProductRail title={t("home.featured")} subtitle={t("home.featuredSub")} products={featured} />

      <section className="section-pad border-b border-white/[0.06]">
        <div className="container-wide">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div><p className="eyebrow mb-3">01 / {t("catalog.category")}</p><h2 className="display text-3xl sm:text-4xl">{t("home.categories")}</h2><div className="gold-line mt-5 w-16" /></div>
            <Link href="/boutique" className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60 hover:text-[#D4AF37]">{t("common.viewAll")} →</Link>
          </div>
          <p className="mb-8 max-w-lg text-sm text-white/45">{t("home.categoriesSub")}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {categories.slice(0, 10).map((category) => (
              <Link key={category.id} href={`/boutique?category=${category.id}`} className="group relative aspect-[4/5] overflow-hidden border border-white/10">
                <div aria-hidden="true" className="absolute inset-0 bg-cover opacity-65 transition duration-700 group-hover:scale-110 group-hover:opacity-85" style={{ backgroundImage: `url("${categoryImageFor(category.name)}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">{String(category.count).padStart(2, "0")} {t("catalog.results")}</p>
                  <h3 className="mt-1.5 text-sm font-bold leading-tight text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-b border-white/[0.06]">
        <div className="container-wide">
          <p className="eyebrow mb-3">02 / {t("catalog.brand")}</p>
          <h2 className="display text-3xl sm:text-4xl">{t("home.brands")}</h2>
          <div className="gold-line mt-5 w-16" />
          <p className="mb-9 mt-5 max-w-lg text-sm text-white/45">{t("home.brandsSub")}</p>
          <div className="flex flex-wrap gap-3">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/boutique?brand=${brand.id}`} className="group flex items-center gap-3 border border-white/12 bg-white/[0.02] px-6 py-4 transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/[0.06]">
                <span className="text-sm font-bold uppercase tracking-[0.12em] text-white/85 group-hover:text-[#D4AF37]">{brand.name}</span>
                <span className="text-[10px] text-white/30">{brand.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProductRail title={t("home.latest")} subtitle={t("home.newSub")} products={[...latest].reverse()} />

      <section className="section-pad border-b border-white/[0.06] bg-[#0c0c0c]">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-4">{t("home.why")}</p>
              <h2 className="display text-3xl sm:text-5xl">{t("home.whyTitle")}</h2>
              <div className="gold-line mt-6 w-20" />
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/50">{t("home.storesText")}</p>
              <Link href="/a-propos" className="btn btn-outline mt-8">{t("nav.about")} <ArrowRight size={15} /></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, title: t("home.why1"), text: t("home.why1Text") },
                { icon: Store, title: t("home.why2"), text: t("home.why2Text") },
                { icon: Sparkles, title: t("home.why3"), text: t("home.why3Text") },
              ].map((item, i) => (
                <div key={i} className="border border-white/10 bg-[#121212] p-6 transition hover:border-[#D4AF37]/40">
                  <item.icon size={26} strokeWidth={1.3} className="text-[#D4AF37]" />
                  <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.1em]">{item.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-white/45">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad border-b border-white/[0.06]">
        <div className="container-wide">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-4">{t("home.storesKicker")}</p>
            <h2 className="display mx-auto max-w-4xl text-3xl sm:text-5xl">{t("home.storesTitle")}</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {stores.map((store) => <StoreCard key={store.id} store={store} whatsappUrl={whatsappUrl} />)}
          </div>
        </div>
      </section>

      <section className="section-pad border-b border-white/[0.06]">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-2">
          <div className="relative h-[420px] overflow-hidden border border-white/10">
            <div role="img" aria-label="Collection éditoriale AttariBal" className="absolute inset-0 bg-cover opacity-90" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85)", backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-6 start-6"><p className="eyebrow">@atari_bal</p><p className="mt-2 text-lg font-bold">Instagram</p></div>
          </div>
          <div>
            <p className="eyebrow mb-4">{t("home.instaKicker")}</p>
            <h2 className="display text-3xl sm:text-5xl">{t("home.instaTitle")}</h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/50">{t("home.instaText")}</p>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold mt-8"><InstagramIcon size={15} /> {t("home.instaButton")}</a>
            <p className="mt-5 max-w-md text-[11px] leading-relaxed text-white/30">{t("home.instaNote")}</p>
          </div>
        </div>
      </section>

      <section className="section-pad border-b border-white/[0.06] bg-[#0b0b0b]">
        <div className="container-wide flex flex-col items-start justify-between gap-8 border border-[#D4AF37]/25 bg-[#111] p-8 sm:p-12 lg:flex-row lg:items-center">
          <div className="flex items-start gap-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center border border-[#D4AF37]/40 text-[#D4AF37]"><MessageCircle size={24} /></div>
            <div><p className="eyebrow mb-3">{t("home.whatsappKicker")}</p><h2 className="display text-2xl sm:text-4xl">{t("home.whatsappTitle")}</h2><p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50">{t("home.whatsappText")}</p></div>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold shrink-0">{t("home.whatsappButton")} <ArrowRight size={15} /></a>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0"><Image src="/images/sneakers-editorial.jpg" alt="" fill sizes="100vw" className="object-cover opacity-25" unoptimized /><div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-[#080808]/70" /></div>
        <div className="container-wide relative text-center">
          <MapPin size={26} className="mx-auto text-[#D4AF37]" />
          <p className="eyebrow mt-6">{t("home.visit")}</p>
          <h2 className="display mx-auto mt-6 max-w-4xl text-3xl uppercase sm:text-5xl">{t("home.storesText")}</h2>
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/magasins" className="btn btn-gold">{t("hero.cta2")} <ArrowRight size={15} /></Link>
            <Link href="/contact" className="btn btn-outline"><ShoppingBag size={15} /> {t("nav.contact")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
