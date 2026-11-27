"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone, ShieldCheck, Store } from "lucide-react";
import StoreCard, { type StoreCardData } from "@/components/StoreCard";
import { InstagramIcon } from "@/components/SocialIcons";
import { DAYS, PHONE, PHONE_HREF } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";

function PageHero({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <div className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-20">
      <div className="container-wide">
        <p className="eyebrow mb-4">{kicker}</p>
        <h1 className="display max-w-4xl text-4xl uppercase sm:text-6xl">{title}</h1>
        {text && <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/50">{text}</p>}
        <div className="gold-line mt-8 w-20" />
      </div>
    </div>
  );
}

export function AboutContent({ title, text, whatsappUrl }: { title: string; text: string; whatsappUrl: string }) {
  const { t, lang } = useLanguage();
  return (
    <>
      <PageHero kicker={t("about.kicker")} title={t("about.title")} />
      <section className="section-pad">
        <div className="container-wide grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
            <div role="img" aria-label="Intérieur élégant de la boutique AttariBal" className="absolute inset-0 bg-cover" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85)", backgroundSize: "cover", backgroundPosition: "center" }} />
          </div>
          <div>
            <h2 className="display text-3xl">{text ? title : t("about.title")}</h2>
            <div className="gold-line my-7 w-16" />
            <div className="space-y-5 text-sm leading-[1.9] text-white/60">
              {text ? <p className="whitespace-pre-line">{text}</p> : <><p>{t("about.text1")}</p><p>{t("about.text2")}</p><p>{t("about.text3")}</p></>}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/magasins" className="btn btn-gold">{t("hero.cta2")}</Link>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><MessageCircle size={15} /> WhatsApp</a>
            </div>
            <p className="mt-6 text-[11px] leading-relaxed text-white/30">{t("about.editable")}</p>
          </div>
        </div>
      </section>
      <section className="border-y border-white/10 bg-[#0c0c0c] py-14">
        <div className="container-wide grid gap-8 text-center sm:grid-cols-3">
          {[
            { icon: ShieldCheck, label: lang === "ar" ? "قطع أصلية" : "100% original", sub: lang === "ar" ? "علامات تجارية مختارة" : "Brands sélectionnées" },
            { icon: Store, label: lang === "ar" ? "متجران" : "2 boutiques", sub: "Mohammédia" },
            { icon: MessageCircle, label: lang === "ar" ? "تواصل مباشر" : "Contact direct", sub: "WhatsApp & téléphone" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <item.icon size={28} strokeWidth={1.3} className="text-[#D4AF37]" />
              <p className="text-lg font-bold uppercase tracking-[0.1em]">{item.label}</p>
              <p className="text-xs text-white/40">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function StoresContent({ stores, whatsappUrl, phone }: { stores: StoreCardData[]; whatsappUrl: string; phone: string }) {
  const { t } = useLanguage();
  return (
    <>
      <PageHero kicker={t("stores.kicker")} title={t("stores.title")} text={t("stores.subtitle")} />
      <section className="section-pad">
        <div className="container-wide grid gap-5 lg:grid-cols-2">
          {stores.map((store) => <StoreCard key={store.id} store={store} whatsappUrl={whatsappUrl} detailed />)}
        </div>
        <p className="container-wide mt-8 text-xs text-white/35">{t("stores.coordinates")}</p>
        <div className="container-wide mt-10 flex flex-wrap items-center justify-between gap-5 border border-[#D4AF37]/25 bg-[#111] p-7">
          <div><p className="eyebrow mb-2">{t("home.visit")}</p><h2 className="display text-2xl uppercase sm:text-3xl">{t("home.storesText")}</h2></div>
          <div className="flex flex-wrap gap-3">
            <a href={PHONE_HREF} className="btn btn-gold"><Phone size={15} /> {phone || PHONE}</a>
            <Link href="/contact" className="btn btn-outline">{t("nav.contact")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function ContactContent({ stores, whatsappUrl, instagramUrl, phone, email }: { stores: StoreCardData[]; whatsappUrl: string; instagramUrl: string; phone: string; email: string }) {
  const { t, lang } = useLanguage();
  return (
    <>
      <PageHero kicker={t("contact.kicker")} title={t("contact.title")} text={t("contact.subtitle")} />
      <section className="section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <a href={PHONE_HREF} className="admin-card flex items-center gap-4 p-6 transition hover:border-[#D4AF37]/50">
              <Phone size={22} className="text-[#D4AF37]" /><div><p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{t("contact.phone")}</p><p className="mt-1 font-semibold" dir="ltr">{phone || PHONE}</p></div>
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="admin-card flex items-center gap-4 p-6 transition hover:border-[#D4AF37]/50">
              <MessageCircle size={22} className="text-[#D4AF37]" /><div><p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{t("contact.whatsapp")}</p><p className="mt-1 text-sm">Ataribal100original</p></div>
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="admin-card flex items-center gap-4 p-6 transition hover:border-[#D4AF37]/50">
              <InstagramIcon size={22} className="text-[#D4AF37]" /><div><p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{t("contact.instagram")}</p><p className="mt-1 text-sm">@atari_bal</p></div>
            </a>
            {email && <a href={`mailto:${email}`} className="admin-card flex items-center gap-4 p-6 transition hover:border-[#D4AF37]/50"><Mail size={22} className="text-[#D4AF37]" /><div><p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Email</p><p className="mt-1 text-sm">{email}</p></div></a>}
          </div>
          <div className="space-y-5">
            <h2 className="eyebrow mb-5">{t("contact.addresses")}</h2>
            {stores.map((store) => (
              <div key={store.id} className="border border-white/10 bg-[#101010] p-7">
                <h3 className="display text-xl uppercase">{store.shortName}</h3>
                <p className="mt-3 flex gap-3 text-sm leading-relaxed text-white/55"><MapPin size={16} className="mt-0.5 shrink-0 text-[#D4AF37]" />{store.address}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="border-t border-white/10 pt-4">
                    <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/40"><Clock size={13} /> {t("stores.hours")}</p>
                    {DAYS.map((day) => <div key={day.key} className="flex justify-between gap-3 py-0.5 text-[11px]"><span className="text-white/40">{lang === "ar" ? day.ar : day.fr}</span><span dir="ltr" className="text-white/70">{store.hours?.[day.key] || "—"}</span></div>)}
                  </div>
                  <div className="flex flex-col justify-end gap-3">
                    <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold !min-h-10 !text-[10px]"><Navigation size={14} /> {t("stores.directions")}</a>
                    {store.phone && <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="btn btn-outline !min-h-10 !text-[10px]"><Phone size={14} /> {t("stores.call")}</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function FaqContent() {
  const { t } = useLanguage();
  const items = [1, 2, 3, 4, 5].map((i) => ({ q: t(`faq.q${i}`), a: t(`faq.a${i}`) }));
  return (
    <>
      <PageHero kicker={t("faq.kicker")} title={t("faq.title")} />
      <section className="section-pad">
        <div className="container-wide mx-auto max-w-3xl space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group border border-white/10 bg-[#111] p-6 open:border-[#D4AF37]/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold marker:hidden">
                {item.q}<span className="text-[#D4AF37] transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-white/55">{item.a}</p>
            </details>
          ))}
          <p className="pt-6 text-center text-xs text-white/40">{t("product.inStoreOnly")} — <Link href="/contact" className="text-[#D4AF37] underline">{t("nav.contact")}</Link></p>
        </div>
      </section>
    </>
  );
}

export function LegalContent({ type }: { type: "privacy" | "terms" | "info" }) {
  const { t, lang } = useLanguage();
  const title = type === "privacy" ? t("legal.privacy") : type === "terms" ? t("legal.terms") : t("legal.info");
  const sections =
    type === "privacy"
      ? [
          ["Données collectées", "Ataribal100original ne collecte que les informations strictement nécessaires à l'affichage du catalogue : aucun compte client, aucun paiement et aucun suivi publicitaire n'est requis pour consulter le site."],
          ["Cookies et session", "Un cookie de session sécurisé est utilisé uniquement pour l'administration du site. Il est supprimé lors de la déconnexion et n'est pas utilisé à des fins publicitaires."],
          ["Contact", "Pour toute question relative à vos données, contactez la boutique via le numéro ou le lien WhatsApp indiqué sur la page Contact."],
        ]
      : type === "terms"
        ? [
            ["Utilisation du site", "Les informations présentées sur ce site sont fournies à titre informatif. Les prix et la disponibilité des articles sont indiqués à titre indicatif et peuvent varier en boutique."],
            ["Vente en magasin", "Ataribal100original est un commerce physique. Le site ne propose ni paiement en ligne, ni commande, ni livraison. L'achat se réalise exclusivement dans l'un des deux magasins."],
            ["Contenu", "Les photographies et marques présentées restent la propriété de leurs titulaires respectifs. Toute reproduction nécessite une autorisation."],
          ]
        : [
            ["Raison sociale", "Ataribal100original — boutique de vêtements de marque originaux, vintage et accessoires, sise à Mohammédia, Maroc."],
            ["Magasins", "Attari Bal 1 — MJQF+68Q, Mohammédia, Morocco. Attari Bal 2 (Derb Chabab) — Next to Collège Abderrahman Chennaf, Boulevard Al Houria, Derb Chabab, Mohammédia, Morocco."],
            ["Contact", "Téléphone : +212 6 48 62 76 91. Instagram : @atari_bal. Communauté WhatsApp disponible sur la page Contact."],
            ["État des articles", "Chaque article est décrit avec son état réel et sa disponibilité par magasin. Aucun achat en ligne n'est proposé."],
          ];
  return (
    <>
      <PageHero kicker="Ataribal100original" title={title} />
      <section className="section-pad">
        <div className="container-wide mx-auto max-w-3xl space-y-8">
          {sections.map(([heading, body], i) => (
            <div key={i} className="border-b border-white/10 pb-7">
              <h2 className="text-lg font-bold">{heading}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{body}</p>
            </div>
          ))}
          {lang === "ar" && <p className="text-xs text-white/35">المحتوى القانوني متوفر باللغة الفرنسية. يمكن تحديثه من لوحة التحكم.</p>}
          <Link href="/contact" className="btn btn-outline mt-2">{t("nav.contact")}</Link>
        </div>
      </section>
    </>
  );
}
