import { eq } from "drizzle-orm";
import SettingsForm from "@/components/SettingsForm";
import { db } from "@/db";
import { settings } from "@/db/schema";
export const dynamic = "force-dynamic";
export const metadata = { title: "Paramètres" };
export default async function SettingsPage() {
  const [site] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  return (
    <SettingsForm
      initial={{
        instagramUrl: site?.instagramUrl || "",
        whatsappUrl: site?.whatsappUrl || "",
        phone: site?.phone || "",
        email: site?.email || "",
        aboutTitle: site?.aboutTitle || "",
        aboutText: site?.aboutText || "",
        instagramNote: site?.instagramNote || "",
      }}
    />
  );
}
