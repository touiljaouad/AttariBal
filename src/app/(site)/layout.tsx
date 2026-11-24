import type { ReactNode } from "react";
import { asc, eq } from "drizzle-orm";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { db } from "@/db";
import { settings, stores } from "@/db/schema";

// Settings and store data live in the database, so render on each request
// rather than at build time (migrations are applied after the build).
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [siteSettings] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
  const storeRows = await db.select().from(stores).orderBy(asc(stores.sortOrder));
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader whatsappUrl={siteSettings?.whatsappUrl} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        whatsappUrl={siteSettings?.whatsappUrl || "https://chat.whatsapp.com/F0Q2gf1p4PpE5qBBcqALWB"}
        phone={siteSettings?.phone || ""}
        email={siteSettings?.email || ""}
        storeAddresses={storeRows.map((store) => store.address)}
      />
    </div>
  );
}
