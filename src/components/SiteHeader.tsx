"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { InstagramIcon } from "@/components/SocialIcons";
import { LanguageSwitcher, useLanguage } from "@/lib/i18n";
import { INSTAGRAM_URL, PHONE, PHONE_HREF, WHATSAPP_URL } from "@/lib/constants";

export default function SiteHeader({ whatsappUrl = WHATSAPP_URL }: { whatsappUrl?: string }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/boutique", label: t("nav.shop") },
    { href: "/a-propos", label: t("nav.about") },
    { href: "/magasins", label: t("nav.stores") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/95 backdrop-blur-xl">
      <div className="hidden border-b border-white/[0.07] md:block">
        <div className="container-wide flex h-9 items-center justify-between text-[10px] tracking-[0.12em] text-white/45">
          <span className="uppercase">Mohammédia · Maroc · 100% original</span>
          <div className="flex items-center gap-5">
            <a href={PHONE_HREF} className="flex items-center gap-1.5 hover:text-[#D4AF37]"><Phone size={12} /> {PHONE}</a>
            <Link href="/faq" className="hover:text-[#D4AF37]">{t("nav.faq")}</Link>
            <Link href="/admin" className="hover:text-[#D4AF37]">{t("nav.admin")}</Link>
          </div>
        </div>
      </div>
      <div className="container-wide flex h-[72px] items-center justify-between gap-6">
        <BrandLogo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${active ? "text-[#D4AF37]" : "text-white/70 hover:text-white"}`}
              >
                {link.label}
                {active && <span className="absolute -bottom-0.5 start-0 h-px w-full bg-[#D4AF37]" />}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block"><LanguageSwitcher /></div>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hidden h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-[#D4AF37] hover:text-[#D4AF37] sm:grid">
            <InstagramIcon size={15} />
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold !min-h-9 !px-3 !text-[10px]">
            <MessageCircle size={14} /> <span className="hidden xl:inline">WhatsApp</span>
          </a>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-label={t("nav.menu")} aria-expanded={open} className="grid h-9 w-9 place-items-center border border-white/15 lg:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-[#0d0d0d] lg:hidden">
          <nav className="container-wide flex flex-col py-4">
            {[...links, { href: "/faq", label: t("nav.faq") }, { href: "/admin", label: t("nav.admin") }].map((link) => (
              <Link key={link.href} href={link.href} className="border-b border-white/[0.06] py-3 text-sm uppercase tracking-[0.14em] text-white/75">
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex items-center justify-between">
              <LanguageSwitcher />
              <span className="flex items-center gap-1.5 text-[11px] text-white/50"><MapPin size={13} /> Mohammédia</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
