"use client";

import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { InstagramIcon } from "@/components/SocialIcons";
import { LanguageSwitcher, useLanguage } from "@/lib/i18n";
import { INSTAGRAM_URL, PHONE, PHONE_HREF } from "@/lib/constants";

type Props = { whatsappUrl: string; phone: string; email: string; storeAddresses: string[] };

export default function SiteFooter({ whatsappUrl, phone, email, storeAddresses }: Props) {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-white/10 bg-[#0b0b0b]">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <BrandLogo />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/50">{t("footer.tagline")}</p>
          <div className="mt-6 flex gap-2">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/60 hover:border-[#D4AF37] hover:text-[#D4AF37]"><InstagramIcon size={15} /></a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/60 hover:border-[#D4AF37] hover:text-[#D4AF37]"><MessageCircle size={15} /></a>
          </div>
        </div>
        <div>
          <h3 className="eyebrow mb-5">{t("footer.shop")}</h3>
          <ul className="space-y-3 text-sm text-white/55">
            <li><Link className="hover:text-[#D4AF37]" href="/boutique">{t("nav.shop")}</Link></li>
            <li><Link className="hover:text-[#D4AF37]" href="/a-propos">{t("nav.about")}</Link></li>
            <li><Link className="hover:text-[#D4AF37]" href="/magasins">{t("nav.stores")}</Link></li>
            <li><Link className="hover:text-[#D4AF37]" href="/contact">{t("nav.contact")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-5">{t("footer.help")}</h3>
          <ul className="space-y-3 text-sm text-white/55">
            <li><Link className="hover:text-[#D4AF37]" href="/faq">FAQ</Link></li>
            <li><Link className="hover:text-[#D4AF37]" href="/informations">{t("legal.info")}</Link></li>
            <li><Link className="hover:text-[#D4AF37]" href="/confidentialite">{t("legal.privacy")}</Link></li>
            <li><Link className="hover:text-[#D4AF37]" href="/conditions">{t("legal.terms")}</Link></li>
            <li><Link className="hover:text-[#D4AF37]" href="/admin">{t("nav.admin")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-5">{t("nav.stores")}</h3>
          <div className="space-y-4 text-sm text-white/55">
            {storeAddresses.map((address, i) => (
              <p key={i} className="flex gap-2 leading-relaxed"><MapPin size={14} className="mt-0.5 shrink-0 text-[#D4AF37]" /> {address}</p>
            ))}
            <a href={PHONE_HREF} className="flex items-center gap-2 hover:text-[#D4AF37]"><Phone size={14} className="text-[#D4AF37]" /> {phone || PHONE}</a>
            {email && <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-[#D4AF37]"><Mail size={14} className="text-[#D4AF37]" /> {email}</a>}
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.07]">
        <div className="container-wide flex flex-col gap-4 py-6 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ataribal100original. {t("footer.rights")}</p>
          <div className="flex items-center gap-4"><span>{t("footer.physical")}</span><LanguageSwitcher compact /></div>
        </div>
      </div>
    </footer>
  );
}
