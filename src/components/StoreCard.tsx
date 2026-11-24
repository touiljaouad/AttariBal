"use client";

import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { DAYS, WHATSAPP_URL } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";

export type StoreCardData = {
  id: number;
  name: string;
  shortName: string;
  address: string;
  plusCode: string | null;
  phone: string | null;
  mapsUrl: string;
  hours: Record<string, string>;
};

export default function StoreCard({ store, whatsappUrl = WHATSAPP_URL, detailed = false }: { store: StoreCardData; whatsappUrl?: string; detailed?: boolean }) {
  const { t, lang } = useLanguage();
  return (
    <article className="group relative overflow-hidden border border-white/10 bg-[#111] p-7 transition hover:border-[#D4AF37]/50 sm:p-9">
      <div className="absolute -end-10 -top-10 text-[110px] font-black leading-none text-white/[0.025]">0{store.id}</div>
      <p className="eyebrow mb-4">{lang === "ar" ? "محمدية" : "Mohammédia · Maroc"}</p>
      <h3 className="display text-2xl uppercase sm:text-3xl">{store.shortName}</h3>
      <p className="mt-2 text-sm font-medium text-[#D4AF37]">{store.name}</p>
      <div className="gold-line my-6 w-12" />
      <div className="space-y-4 text-sm text-white/60">
        <p className="flex gap-3 leading-relaxed"><MapPin size={16} className="mt-0.5 shrink-0 text-[#D4AF37]" /><span>{store.address}</span></p>
        {store.plusCode && <p className="ps-7 text-xs text-white/35">Plus Code : {store.plusCode}</p>}
        {store.phone && <p className="flex items-center gap-3"><Phone size={16} className="text-[#D4AF37]" /><a href={`tel:${store.phone.replace(/\s/g, "")}`} className="hover:text-white" dir="ltr">{store.phone}</a></p>}
      </div>
      <div className="mt-7 border-t border-white/10 pt-6">
        <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/70"><Clock size={14} className="text-[#D4AF37]" /> {t("stores.hours")}</p>
        <div className={`grid gap-x-6 gap-y-2 text-xs ${detailed ? "sm:grid-cols-2" : ""}`}>
          {DAYS.map((day) => (
            <div key={day.key} className="flex justify-between gap-4 border-b border-white/[0.05] pb-1.5">
              <span className="text-white/45">{lang === "ar" ? day.ar : day.fr}</span>
              <span className="text-white/80" dir="ltr">{store.hours?.[day.key] || "—"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href={store.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-gold !min-h-10 !px-4 !text-[10px]"><Navigation size={14} /> {t("stores.directions")}</a>
        <a href={`tel:${(store.phone || "").replace(/\s/g, "")}`} className="btn btn-outline !min-h-10 !px-4 !text-[10px]"><Phone size={14} /> {t("stores.call")}</a>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline !min-h-10 !px-4 !text-[10px]"><MessageCircle size={14} /> WhatsApp</a>
      </div>
    </article>
  );
}
