"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const fr: Record<string, string> = {
  "nav.home": "Accueil",
  "nav.shop": "Boutique",
  "nav.about": "À propos",
  "nav.stores": "Nos magasins",
  "nav.contact": "Contact",
  "nav.faq": "FAQ",
  "nav.admin": "Administration",
  "nav.menu": "Menu",
  "common.viewAll": "Tout voir",
  "common.discover": "Découvrir",
  "common.close": "Fermer",
  "common.loading": "Chargement…",
  "common.error": "Une erreur est survenue.",
  "common.retry": "Réessayer",
  "hero.kicker": "Mode vintage · Mohammédia · 100% original",
  "hero.line1": "YOUR STYLE.",
  "hero.line2": "YOUR IDENTITY.",
  "hero.line3": "100% ORIGINAL.",
  "hero.text": "Découvrez des vêtements de marque originaux, des sneakers et des pièces uniques pour tous les styles.",
  "hero.cta": "Explorer la collection",
  "hero.cta2": "Trouver nos magasins",
  "home.new": "Nouveautés",
  "home.newSub": "Les dernières pièces arrivées en boutique.",
  "home.featured": "Pièces sélectionnées",
  "home.featuredSub": "Notre sélection du moment, disponible en magasin.",
  "home.categories": "Acheter par catégorie",
  "home.categoriesSub": "Trouvez la pièce qui correspond à votre style.",
  "home.brands": "Acheter par marque",
  "home.brandsSub": "Les marques que vous aimez, réunies au même endroit.",
  "home.latest": "Dernières arrivées",
  "home.why": "Pourquoi Ataribal100original ?",
  "home.whyTitle": "L'authenticité, la qualité et le style.",
  "home.why1": "Pièces originales",
  "home.why1Text": "Des vêtements et accessoires de marque sélectionnés avec soin.",
  "home.why2": "Deux boutiques physiques",
  "home.why2Text": "Essayez, découvrez et trouvez votre pièce en personne à Mohammédia.",
  "home.why3": "Un style unique",
  "home.why3Text": "Des pièces vintage et contemporaines pour hommes, femmes et enfants.",
  "home.storesKicker": "Deux magasins. Une même passion.",
  "home.storesTitle": "TWO STORES. ONE PASSION FOR ORIGINAL BRANDS.",
  "home.storesText": "DISCOUVREZ VOTRE PROCHAIN COUP DE CŒUR. VISITEZ ATARIBAL100ORIGINAL.",
  "home.instaKicker": "Suivez-nous",
  "home.instaTitle": "L'inspiration continue sur Instagram",
  "home.instaText": "Découvrez nos nouvelles arrivages, nos mises en scène et la vie de la boutique sur notre compte officiel.",
  "home.instaButton": "Voir le compte Instagram",
  "home.instaNote": "Le flux Instagram nécessite une autorisation API Meta ; nous affichons donc un lien direct vers le compte officiel.",
  "home.whatsappKicker": "Communauté",
  "home.whatsappTitle": "Rejoignez la communauté WhatsApp",
  "home.whatsappText": "Recevez les nouveautés et échangez directement avec la communauté Ataribal100original.",
  "home.whatsappButton": "Rejoindre le groupe WhatsApp",
  "home.visit": "Visitez-nous en boutique",
  "home.empty": "La collection arrive bientôt",
  "home.emptyText": "Nos nouvelles pièces seront publiées ici par la boutique. En attendant, découvrez nos magasins à Mohammédia.",
  "catalog.title": "Toute la collection",
  "catalog.subtitle": "Explorez nos pièces originales et trouvez celle qui vous ressemble. Disponible en boutique uniquement.",
  "catalog.search": "Rechercher un article ou une marque…",
  "catalog.category": "Catégorie",
  "catalog.brand": "Marque",
  "catalog.gender": "Type",
  "catalog.size": "Taille",
  "catalog.condition": "État",
  "catalog.price": "Prix (MAD)",
  "catalog.store": "Magasin",
  "catalog.availability": "Disponibilité",
  "catalog.sort": "Trier par",
  "catalog.newest": "Plus récents",
  "catalog.priceAsc": "Prix croissant",
  "catalog.priceDesc": "Prix décroissant",
  "catalog.all": "Tout",
  "catalog.available": "Disponible",
  "catalog.lowStock": "Stock limité",
  "catalog.soldOut": "Épuisé",
  "catalog.sold": "Vendu",
  "catalog.filters": "Filtres",
  "catalog.reset": "Réinitialiser",
  "catalog.results": "articles",
  "catalog.empty": "Aucun article ne correspond à vos critères",
  "catalog.emptyText": "Essayez de modifier vos filtres ou revenez bientôt : de nouvelles pièces arrivent régulièrement.",
  "catalog.inStore": "En magasin uniquement",
  "product.details": "Détails de l'article",
  "product.description": "Description",
  "product.reference": "Référence",
  "product.conditionNote": "Note sur l'état",
  "product.where": "OÙ TROUVER CET ARTICLE ?",
  "product.availableAt": "Disponible à",
  "product.directions": "Itinéraire",
  "product.whatsapp": "Contacter sur WhatsApp",
  "product.share": "Partager",
  "product.soldOut": "Épuisé",
  "product.sold": "Vendu",
  "product.draft": "Brouillon",
  "product.related": "Vous aimerez aussi",
  "product.back": "Retour à la boutique",
  "product.inStoreOnly": "Vente en magasin uniquement — aucun paiement en ligne.",
  "stores.kicker": "Nos adresses",
  "stores.title": "TROUVEZ NOS MAGASINS",
  "stores.subtitle": "Deux adresses à Mohammédia pour découvrir nos pièces originales en personne.",
  "stores.hours": "Horaires d'ouverture",
  "stores.directions": "Voir l'itinéraire",
  "stores.call": "Appeler",
  "stores.coordinates": "Adresse et itinéraire vérifiés via Google Maps.",
  "about.kicker": "Notre histoire",
  "about.title": "Une mode originale, ancrée à Mohammédia.",
  "about.text1": "Ataribal100original est une boutique de mode physique basée à Mohammédia, au Maroc. Nous proposons des vêtements de marque originaux, des sneakers et des accessoires sélectionnés pour hommes, femmes et enfants.",
  "about.text2": "Notre univers mélange pièces vintage et styles contemporains, dans une recherche constante d'authenticité. Chaque article est présenté avec son état réel et sa disponibilité dans l'un de nos deux magasins.",
  "about.text3": "Nous croyons au style personnel : des pièces qui durent, qui racontent quelque chose et qui vous ressemblent. Notre équipe est à votre disposition dans nos deux boutiques pour vous aider à trouver la bonne pièce.",
  "about.editable": "Les informations relatives à l'histoire de la boutique pourront être complétées et modifiées depuis l'administration.",
  "contact.kicker": "Parlons-nous",
  "contact.title": "Contactez Ataribal100original",
  "contact.subtitle": "Une question sur un article, une taille ou notre disponibilité ? Contactez-nous ou passez nous voir en boutique.",
  "contact.phone": "Téléphone",
  "contact.instagram": "Instagram",
  "contact.whatsapp": "Communauté WhatsApp",
  "contact.addresses": "Nos adresses",
  "faq.kicker": "Questions fréquentes",
  "faq.title": "Foire aux questions",
  "faq.q1": "Les achats sont-ils possibles en ligne ?",
  "faq.a1": "Non. Ataribal100original est une boutique physique. Les articles sont présentés sur le site mais l'achat se fait exclusivement en magasin.",
  "faq.q2": "Comment savoir dans quel magasin se trouve un article ?",
  "faq.a2": "Chaque fiche produit indique précisément les magasins où l'article est disponible et la quantité restante. Vous pouvez aussi nous contacter sur WhatsApp.",
  "faq.q3": "Les articles sont-ils neufs ?",
  "faq.a3": "Les états sont indiqués clairement sur chaque fiche : neuf avec étiquette, neuf sans étiquette, comme neuf, très bon état, bon état ou état satisfaisant. Les éventuels défauts sont signalés.",
  "faq.q4": "Puis-je réserver un article ?",
  "faq.a4": "Contactez-nous via WhatsApp ou par téléphone pour connaître la disponibilité actuelle d'une pièce.",
  "faq.q5": "Où sont situés les magasins ?",
  "faq.a5": "Nous avons deux boutiques à Mohammédia : Attari Bal 1 et Attari Bal 2 (Derb Chabab). Retrouvez les adresses et itinéraires sur la page Nos magasins.",
  "legal.privacy": "Politique de confidentialité",
  "legal.terms": "Conditions d'utilisation",
  "legal.info": "Informations boutique",
  "footer.tagline": "Vêtements de marque originaux, vintage et pièces uniques à Mohammédia.",
  "footer.shop": "Boutique",
  "footer.help": "Aide",
  "footer.legal": "Informations",
  "footer.rights": "Tous droits réservés.",
  "footer.physical": "Boutique physique — aucun achat en ligne",
};

const ar: Record<string, string> = {
  "nav.home": "الرئيسية",
  "nav.shop": "المتجر",
  "nav.about": "من نحن",
  "nav.stores": "متاجرنا",
  "nav.contact": "اتصل بنا",
  "nav.faq": "الأسئلة الشائعة",
  "nav.admin": "الإدارة",
  "nav.menu": "القائمة",
  "common.viewAll": "عرض الكل",
  "common.discover": "اكتشف",
  "common.close": "إغلاق",
  "common.loading": "جارٍ التحميل…",
  "common.error": "حدث خطأ.",
  "common.retry": "إعادة المحاولة",
  "hero.kicker": "أزياء فيintage · المحمدية · أصلي 100%",
  "hero.line1": "أسلوبك.",
  "hero.line2": "هويتك.",
  "hero.line3": "أصلي 100%.",
  "hero.text": "اكتشف ملابس أصلية من العلامات التجارية وأحذية وقطع فريدة لكل أسلوب.",
  "hero.cta": "استكشف المجموعة",
  "hero.cta2": "اعثر على متاجرنا",
  "home.new": "وصل حديثاً",
  "home.newSub": "آخر القطع الواصلة إلى المتجر.",
  "home.featured": "قطع مختارة",
  "home.featuredSub": "اختيارنا الحالي، المتوفر في المتجر.",
  "home.categories": "تسوق حسب الفئة",
  "home.categoriesSub": "اعثر على القطعة التي تناسب أسلوبك.",
  "home.brands": "تسوق حسب العلامة",
  "home.brandsSub": "علاماتك المفضلة في مكان واحد.",
  "home.latest": "آخر الوصولات",
  "home.why": "لماذا أطارibal100original؟",
  "home.whyTitle": "الأصالة والجودة والأناقة.",
  "home.why1": "قطع أصلية",
  "home.why1Text": "ملابس وإكسسوارات من العلامات التجارية تم اختيارها بعناية.",
  "home.why2": "متجران فعليان",
  "home.why2Text": "جرّب واكتشف قطعتك شخصياً في المحمدية.",
  "home.why3": "أسلوب فريد",
  "home.why3Text": "قطع فينتاج وعصرية للرجال والنساء والأطفال.",
  "home.storesKicker": "متجران. شغف واحد.",
  "home.storesTitle": "متجران. شغف واحد للعلامات الأصلية.",
  "home.storesText": "اكتشف قطعتك المفضلة القادمة. زر أطارibal100original.",
  "home.instaKicker": "تابعنا",
  "home.instaTitle": "الإلهام يستمر على إنستغرام",
  "home.instaText": "اكتشف وصولاتنا الجديدة والحياة داخل المتجر على حسابنا الرسمي.",
  "home.instaButton": "زيارة حساب إنستغرام",
  "home.instaNote": "يتطلب عرض موجز إنستغرام إذن API من Meta؛ لذلك نعرض رابطاً مباشراً للحساب الرسمي.",
  "home.whatsappKicker": "المجتمع",
  "home.whatsappTitle": "انضم إلى مجتمع واتساب",
  "home.whatsappText": "تابع الجديد وتواصل مع مجتمع أطارibal100original.",
  "home.whatsappButton": "الانضمام إلى مجموعة واتساب",
  "home.visit": "زر متجرنا",
  "home.empty": "المجموعة قريباً",
  "home.emptyText": "ستنشر المتجر القطع الجديدة هنا قريباً.",
  "catalog.title": "كل المجموعة",
  "catalog.subtitle": "استكشف قطعنا الأصلية واعثر على ما يناسبك. متوفرة في المتجر فقط.",
  "catalog.search": "ابحث عن قطعة أو علامة…",
  "catalog.category": "الفئة",
  "catalog.brand": "العلامة",
  "catalog.gender": "النوع",
  "catalog.size": "المقاس",
  "catalog.condition": "الحالة",
  "catalog.price": "السعر (درهم)",
  "catalog.store": "المتجر",
  "catalog.availability": "التوفر",
  "catalog.sort": "ترتيب حسب",
  "catalog.newest": "الأحدث",
  "catalog.priceAsc": "السعر تصاعدياً",
  "catalog.priceDesc": "السعر تنازلياً",
  "catalog.all": "الكل",
  "catalog.available": "متوفر",
  "catalog.lowStock": "كمية محدودة",
  "catalog.soldOut": "نفدت الكمية",
  "catalog.sold": "تم البيع",
  "catalog.filters": "الفلاتر",
  "catalog.reset": "إعادة ضبط",
  "catalog.results": "قطع",
  "catalog.empty": "لا توجد قطع مطابقة",
  "catalog.emptyText": "جرّب تغيير الفلاتر أو عد قريباً.",
  "catalog.inStore": "في المتجر فقط",
  "product.details": "تفاصيل القطعة",
  "product.description": "الوصف",
  "product.reference": "المرجع",
  "product.conditionNote": "ملاحظة حول الحالة",
  "product.where": "أين تجد هذه القطعة؟",
  "product.availableAt": "متوفرة في",
  "product.directions": "الاتجاهات",
  "product.whatsapp": "تواصل عبر واتساب",
  "product.share": "مشاركة",
  "product.soldOut": "نفدت الكمية",
  "product.sold": "تم البيع",
  "product.draft": "مسودة",
  "product.related": "قد تعجبك أيضاً",
  "product.back": "العودة إلى المتجر",
  "product.inStoreOnly": "البيع في المتجر فقط — لا يوجد دفع عبر الإنترنت.",
  "stores.kicker": "عناويننا",
  "stores.title": "اعثر على متاجرنا",
  "stores.subtitle": "عنوانان في المحمدية لاكتشاف قطعنا الأصلية شخصياً.",
  "stores.hours": "ساعات العمل",
  "stores.directions": "عرض الاتجاهات",
  "stores.call": "اتصل",
  "stores.coordinates": "العناوين ومسارات الخريطة موثقة عبر خرائط غوغل.",
  "about.kicker": "قصتنا",
  "about.title": "أزياء أصلية متجذّرة في المحمدية.",
  "about.text1": "أطارibal100original متجر أزياء فعلي في المحمدية بالمغرب. نقدم ملابس أصلية من علامات تجارية وأحذية وإكسسوارات للرجال والنساء والأطفال.",
  "about.text2": "يمزج عالمنا بين القطع الفينتاج والأسلوب المعاصر، مع حرص دائم على الأصالة. تظهر حالة كل قطعة وتوفرها في أحد متجرينا بوضوح.",
  "about.text3": "نؤمن بالأسلوب الشخصي: قطع تدوم وتعكس هويتك. فريقنا جاهز لمساعدتك في متجرينا.",
  "about.editable": "يمكن استكمال وتعديل معلومات تاريخ المتجر من لوحة التحكم.",
  "contact.kicker": "لنتحدث",
  "contact.title": "تواصل مع أطارibal100original",
  "contact.subtitle": "لديك سؤال عن قطعة أو مقاس؟ تواصل معنا أو زر متجرنا.",
  "contact.phone": "الهاتف",
  "contact.instagram": "إنستغرام",
  "contact.whatsapp": "مجتمع واتساب",
  "contact.addresses": "عناويننا",
  "faq.kicker": "الأسئلة الشائعة",
  "faq.title": "الأسئلة الشائعة",
  "faq.q1": "هل يمكن الشراء عبر الإنترنت؟",
  "faq.a1": "لا. أطارibal100original متجر فعلي. القطع معروضة على الموقع لكن الشراء يتم داخل المتجر فقط.",
  "faq.q2": "كيف أعرف في أي متجر توجد القطعة؟",
  "faq.a2": "توضح صفحة كل قطعة المتاجر المتوفرة فيها والكمية المتبقية.",
  "faq.q3": "هل القطع جديدة؟",
  "faq.a3": "الحالة موضحة بوضوح في كل صفحة، وأي عيوب يتم الإبلاغ عنها.",
  "faq.q4": "هل يمكنني حجز قطعة؟",
  "faq.a4": "تواصل معنا عبر واتساب أو الهاتف للاستفسار عن التوفر.",
  "faq.q5": "أين تقع المتاجر؟",
  "faq.a5": "لدينا متجران في المحمدية: أتاري بال 1 وأتاري بال 2 (درب شباب).",
  "legal.privacy": "سياسة الخصوصية",
  "legal.terms": "شروط الاستخدام",
  "legal.info": "معلومات المتجر",
  "footer.tagline": "ملابس أصلية وفينتاج وقطع فريدة في المحمدية.",
  "footer.shop": "المتجر",
  "footer.help": "المساعدة",
  "footer.legal": "معلومات",
  "footer.rights": "جميع الحقوق محفوظة.",
  "footer.physical": "متجر فعلي — لا يوجد شراء عبر الإنترنت",
};

type Lang = "fr" | "ar";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "fr",
  setLang: () => undefined,
  t: (key) => fr[key] ?? key,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const stored = window.localStorage.getItem("ataribal-lang");
    if (stored === "ar" || stored === "fr") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the saved locale after hydration
      setLangState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("ataribal-lang", lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const t = useCallback((key: string) => (lang === "ar" ? ar[key] : fr[key]) ?? fr[key] ?? key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] p-0.5" aria-label="Language">
      <button
        type="button"
        onClick={() => setLang("fr")}
        aria-pressed={lang === "fr"}
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest transition ${lang === "fr" ? "bg-[#D4AF37] text-black" : "text-white/60 hover:text-white"}`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        aria-pressed={lang === "ar"}
        className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest transition ${lang === "ar" ? "bg-[#D4AF37] text-black" : "text-white/60 hover:text-white"}`}
      >
        {compact ? "ع" : "AR"}
      </button>
    </div>
  );
}
