import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { ContactContent } from "@/components/InfoPages";
import { db } from "@/db";
import { settings, stores } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact", description: "Contactez Ataribal100original par téléphone, WhatsApp ou Instagram." };

export default async function ContactPage() {
  const [siteRows, storeRows] = await Promise.all([
    db.select().from(settings).where(eq(settings.id, 1)).limit(1),
    db.select().from(stores).orderBy(asc(stores.sortOrder)),
  ]);
  const site = siteRows[0];
  return (
    <ContactContent
      stores={storeRows.map((s) => ({ ...s, hours: s.hours || {} }))}
      whatsappUrl={site?.whatsappUrl || "https://chat.whatsapp.com/F0Q2gf1p4PpE5qBBcqALWB"}
      instagramUrl={site?.instagramUrl || "https://www.instagram.com/atari_bal/"}
      phone={site?.phone || ""}
      email={site?.email || ""}
    />
  );
}
