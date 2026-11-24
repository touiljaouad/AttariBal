import Link from "next/link";
import { and, asc, desc, eq, gt, gte, lte, ne, sql } from "drizzle-orm";
import { AlertTriangle, Boxes, CheckCircle2, Clock, FileEdit, PackageCheck, Store, XCircle } from "lucide-react";
import { db } from "@/db";
import { activityLog, categories, inventory, products, stores } from "@/db/schema";
import { queryProducts, stockStatus } from "@/lib/catalog";
import { formatPrice } from "@/lib/constants";

export const dynamic = "force-dynamic";

const totalQty = sql`(select coalesce(sum(${inventory.quantity}), 0) from ${inventory} where ${inventory.productId} = ${products.id})`;

export default async function AdminDashboard() {
  const [counts, published, drafts, sold, available, low, recent, storeCounts, categoryCounts, activities] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(products),
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.status, "published")),
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.status, "draft")),
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.status, "sold")),
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(and(ne(products.status, "draft"), ne(products.status, "sold"), sql`${totalQty} > 0`)),
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(and(ne(products.status, "draft"), ne(products.status, "sold"), sql`${totalQty} > 0`, sql`${totalQty} <= 2`)),
    queryProducts({ includeDrafts: true, limit: 6 }),
    db
      .select({ name: stores.shortName, count: sql<number>`count(${inventory.id})::int` })
      .from(inventory)
      .innerJoin(stores, eq(stores.id, inventory.storeId))
      .where(gt(inventory.quantity, 0))
      .groupBy(stores.id)
      .orderBy(asc(stores.sortOrder)),
    db
      .select({ name: categories.name, count: sql<number>`count(${products.id})::int` })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(desc(sql`count(${products.id})`)),
    db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(8),
  ]);

  const statCards = [
    { label: "Total articles", value: counts[0]?.count ?? 0, icon: Boxes, tone: "text-[#D4AF37]" },
    { label: "Publiés", value: published[0]?.count ?? 0, icon: CheckCircle2, tone: "text-emerald-400" },
    { label: "Brouillons", value: drafts[0]?.count ?? 0, icon: FileEdit, tone: "text-white/60" },
    { label: "Vendus", value: sold[0]?.count ?? 0, icon: XCircle, tone: "text-red-300" },
    { label: "Disponibles", value: available[0]?.count ?? 0, icon: PackageCheck, tone: "text-emerald-400" },
    { label: "Stock faible", value: low[0]?.count ?? 0, icon: AlertTriangle, tone: "text-amber-400" },
  ];
  const maxCategory = Math.max(1, ...categoryCounts.map((c) => c.count));

  return (
    <div>
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow mb-3">Tableau de bord</p><h1 className="display text-3xl sm:text-4xl">Vue d&apos;ensemble</h1><p className="mt-3 text-sm text-white/45">Gérez vos articles et vos stocks par magasin.</p></div>
        <Link href="/admin/products/new" className="btn btn-gold">+ Ajouter un article</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card p-5">
            <card.icon size={20} className={card.tone} strokeWidth={1.5} />
            <p className="mt-5 text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/40">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="admin-card p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-[0.12em]">Articles récents</h2><Link href="/admin/products" className="text-[11px] text-[#D4AF37] hover:underline">Voir tout →</Link></div>
          {recent.items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="text-[10px] uppercase tracking-[0.12em] text-white/35"><tr><th className="pb-3">Article</th><th className="pb-3">Prix</th><th className="pb-3">Statut</th><th className="pb-3">Stock</th></tr></thead>
                <tbody>
                  {recent.items.map((product) => (
                    <tr key={product.id} className="table-row border-t border-white/[0.07]">
                      <td className="py-3"><Link href={`/admin/products/${product.id}/edit`} className="font-semibold hover:text-[#D4AF37]">{product.name}</Link><p className="mt-0.5 text-white/35">{product.brand?.name}</p></td>
                      <td className="py-3 text-[#D4AF37]">{formatPrice(product.price)}</td>
                      <td className="py-3"><span className="badge bg-white/10 text-white/70">{product.status === "published" ? "Publié" : product.status === "sold" ? "Vendu" : "Brouillon"}</span></td>
                      <td className="py-3 text-white/60">{product.inventory.reduce((s, r) => s + r.quantity, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="py-8 text-center text-sm text-white/40">Aucun article pour le moment. Commencez par ajouter un article.</p>}
        </div>
        <div className="admin-card p-6">
          <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.12em]">Disponibilité par magasin</h2>
          <div className="space-y-5">
            {storeCounts.map((store) => (
              <div key={store.name} className="flex items-center gap-3">
                <Store size={17} className="text-[#D4AF37]" /><div className="flex-1"><p className="text-xs text-white/70">{store.name}</p><p className="text-[10px] text-white/35">{store.count} références en stock</p></div>
              </div>
            ))}
            {!storeCounts.length && <p className="text-xs text-white/40">Aucun stock enregistré.</p>}
          </div>
          <div className="my-6 h-px bg-white/10" />
          <h3 className="mb-4 text-[10px] uppercase tracking-[0.14em] text-white/40">Par catégorie</h3>
          <div className="space-y-3">
            {categoryCounts.slice(0, 6).map((category) => (
              <div key={category.name}>
                <div className="mb-1 flex justify-between text-[11px]"><span className="text-white/60">{category.name}</span><span className="text-white/35">{category.count}</span></div>
                <div className="h-1 bg-white/10"><div className="h-full bg-[#D4AF37]/70" style={{ width: `${(category.count / maxCategory) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card mt-6 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em]"><Clock size={16} className="text-[#D4AF37]" /> Activité récente</h2>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3 text-xs last:border-0">
              <span className="text-white/60"><span className="text-[#D4AF37]">{activity.action}</span> · {activity.details}</span>
              <span className="text-[10px] text-white/30">{new Date(activity.createdAt).toLocaleString("fr-MA")}</span>
            </div>
          ))}
          {!activities.length && <p className="text-xs text-white/40">Aucune activité enregistrée.</p>}
        </div>
      </div>
    </div>
  );
}
