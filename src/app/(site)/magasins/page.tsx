import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { StoresContent } from "@/components/InfoPages";
import { db } from "@/db";
import { settings, stores } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trouver nos magasins", description: "Attari Bal 1 et Attari Bal 2 à Mohammédia : adresses, horaires et itinéraires." };

export default async function StoresPage() {
  const [siteRows, storeRows] = await Promise.all([
    db.select().from(settings).where(eq(settings.id, 1)).limit(1),
    db.select().from(stores).orderBy(asc(stores.sortOrder)),
  ]);
  return <StoresContent stores={storeRows.map((s) => ({ ...s, hours: s.hours || {} }))} whatsappUrl={siteRows[0]?.whatsappUrl || "https://chat.whatsapp.com/F0Q2gf1p4PpE5qBBcqALWB"} phone={siteRows[0]?.phone || ""} />;
}
