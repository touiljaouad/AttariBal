import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { AboutContent } from "@/components/InfoPages";
import { db } from "@/db";
import { settings } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "À propos", description: "Ataribal100original, boutique de mode originale à Mohammédia." };

export default async function AboutPage() {
  const [site] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  return <AboutContent title={site?.aboutTitle || ""} text={site?.aboutText || ""} whatsappUrl={site?.whatsappUrl || "https://chat.whatsapp.com/F0Q2gf1p4PpE5qBBcqALWB"} />;
}
