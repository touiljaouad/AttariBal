export const CONDITIONS = [
  "Neuf avec étiquette",
  "Neuf sans étiquette",
  "Comme neuf",
  "Très bon état",
  "Bon état",
  "État satisfaisant",
] as const;

export const GENDERS = ["Homme", "Femme", "Enfant", "Unisexe"] as const;
export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Other"] as const;
export const SHOE_SIZES = Array.from({ length: 11 }, (_, i) => `EU ${i + 36}`);

export const DAYS = [
  { key: "lundi", fr: "Lundi", ar: "الاثنين" },
  { key: "mardi", fr: "Mardi", ar: "الثلاثاء" },
  { key: "mercredi", fr: "Mercredi", ar: "الأربعاء" },
  { key: "jeudi", fr: "Jeudi", ar: "الخميس" },
  { key: "vendredi", fr: "Vendredi", ar: "الجمعة" },
  { key: "samedi", fr: "Samedi", ar: "السبت" },
  { key: "dimanche", fr: "Dimanche", ar: "الأحد" },
];

export const INSTAGRAM_URL = "https://www.instagram.com/atari_bal/";
export const WHATSAPP_URL = "https://chat.whatsapp.com/F0Q2gf1p4PpE5qBBcqALWB";
export const PHONE = "+212 6 48 62 76 91";
export const PHONE_HREF = "tel:+212648627691";

export function slugify(value: string) {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${base || "article"}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatPrice(value: string | number) {
  const n = typeof value === "number" ? value : Number(value);
  return `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0)} DH`;
}
