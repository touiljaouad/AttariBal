import { db } from "@/db";
import { stores } from "@/db/schema";

/**
 * Ensure the two real Attari Bal locations exist before rendering forms
 * that need per-store inventory. Safe to call on every admin form request:
 * existing rows are preserved and never duplicated.
 */
export async function ensureDefaultStores() {
  await db
    .insert(stores)
    .values([
      {
        key: "attari-bal-1",
        name: "Attari Bal 1",
        shortName: "ATTARI BAL 1",
        address: "MJQF+68Q, Mohammédia, Morocco",
        plusCode: "MJQF+68Q",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=MJQF%2B68Q%2C%20Mohamm%C3%A9dia%2C%20Morocco",
        hours: {
          lundi: "12:00–22:00",
          mardi: "12:00–22:00",
          mercredi: "12:00–22:00",
          jeudi: "12:00–22:00",
          vendredi: "15:00–22:00",
          samedi: "12:00–22:00",
          dimanche: "12:00–22:00",
        },
        sortOrder: 1,
      },
      {
        key: "attari-bal-2",
        name: "Attari Bal 2 (Derb Chabab)",
        shortName: "ATTARI BAL 2",
        address:
          "Next to Collège Abderrahman Chennaf, Boulevard Al Houria, Derb Chabab, Mohammédia, Morocco",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Coll%C3%A8ge%20Abderrahman%20Chennaf%2C%20Boulevard%20Al%20Houria%2C%20Derb%20Chabab%2C%20Mohamm%C3%A9dia%2C%20Morocco",
        hours: {
          lundi: "00:00–23:00",
          mardi: "00:00–23:00",
          mercredi: "00:00–23:00",
          jeudi: "00:00–23:00",
          vendredi: "03:30–23:00",
          samedi: "00:00–23:00",
          dimanche: "00:00–23:30",
        },
        sortOrder: 2,
      },
    ])
    .onConflictDoNothing({ target: stores.key });
}
