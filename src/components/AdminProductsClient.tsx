"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Copy, Eye, EyeOff, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/constants";

type Row = {
  id: number;
  name: string;
  slug: string;
  price: string;
  condition: string;
  gender: string;
  sizes: string[];
  status: string;
  featured: boolean;
  brand: { name: string } | null;
  category: { name: string } | null;
  images: { url: string; isMain: boolean }[];
  inventory: { storeId: number; storeName: string; quantity: number }[];
};
type Result = { items: Row[]; total: number; page: number; pages: number };
type Option = { id: number; name: string };
type StoreOption = Option & { shortName: string };

const initialFilters = { q: "", brand: "", category: "", condition: "", gender: "", size: "", store: "", availability: "", status: "", sort: "newest", page: "1" };

function StockEditor({ product, stores, onSaved }: { product: Row; stores: StoreOption[]; onSaved: () => void }) {
  const [values, setValues] = useState<Record<number, number>>(() => Object.fromEntries(product.inventory.map((row) => [row.storeId, row.quantity])));
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  async function save() {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantities: stores.map((store) => ({ storeId: store.id, quantity: Number(values[store.id] ?? 0) })) }),
      });
      if (response.ok) { setDone(true); setTimeout(() => setDone(false), 1800); onSaved(); }
    } finally { setSaving(false); }
  }
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {stores.map((store) => (
        <label key={store.id} className="flex items-center gap-1 text-[10px] text-white/40" title={store.shortName}>
          <span className="hidden xl:inline">{store.shortName.replace("Attari Bal ", "B")}:</span>
          <input type="number" min="0" value={values[store.id] ?? 0} onChange={(e) => setValues((prev) => ({ ...prev, [store.id]: Math.max(0, Number(e.target.value) || 0) }))} className="w-12 border border-white/15 bg-[#151515] px-1 py-1 text-center text-[11px] text-white outline-none focus:border-[#D4AF37]" />
        </label>
      ))}
      <button onClick={save} disabled={saving} className="text-[10px] font-bold text-[#D4AF37] hover:underline" title="Enregistrer les quantités">{saving ? <Loader2 size={13} className="animate-spin" /> : done ? "✓" : "Sauver"}</button>
    </div>
  );
}

export default function AdminProductsClient({
  initial, stores, categories, brands,
}: {
  initial: Result;
  stores: StoreOption[];
  categories: Option[];
  brands: Option[];
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);
  const [result, setResult] = useState<Result>(initial);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const first = useRef(true);

  const load = useCallback(async (next: Record<string, string>, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => { if (value && !(key === "sort" && value === "newest")) params.set(key, value); });
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products?${params}`, { signal, cache: "no-store" });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setNotice("Erreur de chargement.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const controller = new AbortController();
    const timer = setTimeout(() => load(filters, controller.signal), 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [filters, load]);

  function update(key: string, value: string) { setFilters((prev) => ({ ...prev, [key]: value, page: "1" })); }

  async function bulk(action: "publish" | "unpublish" | "sold" | "delete") {
    if (!selected.length) return;
    if ((action === "delete" || action === "sold") && !confirm(`${selected.length} article(s) vont être ${action === "delete" ? "supprimés définitivement" : "marqués comme vendus"}. Confirmer ?`)) return;
    const response = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected, action }),
    });
    const data = await response.json();
    if (response.ok) {
      setNotice(`${data.changed} article(s) mis à jour${data.skipped ? `, ${data.skipped} ignoré(s) (photos ou stock manquants)` : ""}.`);
      setSelected([]);
      await load(filters);
      router.refresh();
    } else setNotice(data.error || "Action impossible.");
  }

  async function quickAction(id: number, action: "publish" | "unpublish" | "sold" | "delete" | "duplicate") {
    if (action === "delete" && !confirm("Supprimer définitivement cet article et ses photos ?")) return;
    if (action === "duplicate") {
      const response = await fetch(`/api/admin/products/${id}`, { method: "POST" });
      const data = await response.json();
      setNotice(response.ok ? "Article dupliqué en brouillon." : data.error);
      await load(filters);
      return;
    }
    if (action === "publish") {
      const response = await fetch("/api/admin/products/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id], action: "publish" }) });
      const data = await response.json();
      setNotice(response.ok && data.changed ? "Article publié." : "Publication impossible : ajoutez une photo et du stock.");
    } else if (action === "unpublish") {
      const response = await fetch("/api/admin/products/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id], action: "unpublish" }) });
      setNotice(response.ok ? "Article dépublié." : "Action impossible.");
    } else if (action === "delete") {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      setNotice(response.ok ? "Article supprimé." : "Suppression impossible.");
    }
    await load(filters);
    router.refresh();
  }

  const select = "input !py-1.5 !text-xs";

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow mb-3">Catalogue</p><h1 className="display text-3xl sm:text-4xl">Gestion des articles</h1><p className="mt-2 text-sm text-white/45">{result.total} article(s) au total.</p></div>
        <Link href="/admin/products/new" className="btn btn-gold">+ Ajouter un article</Link>
      </div>

      {notice && <div className="mb-5 border border-[#D4AF37]/40 bg-[#D4AF37]/10 p-3 text-xs text-[#e8cd76]">{notice}</div>}

      <div className="admin-card mb-5 grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="relative sm:col-span-3 lg:col-span-2"><Search size={14} className="absolute start-3 top-3 text-white/30" /><input className="input !ps-9 !py-1.5 !text-xs" placeholder="Rechercher nom, marque, référence…" value={filters.q} onChange={(e) => update("q", e.target.value)} /></div>
        <select className={select} value={filters.brand} onChange={(e) => update("brand", e.target.value)}><option value="">Toutes marques</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select className={select} value={filters.category} onChange={(e) => update("category", e.target.value)}><option value="">Toutes catégories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select className={select} value={filters.condition} onChange={(e) => update("condition", e.target.value)}><option value="">Tous états</option>{["Neuf avec étiquette", "Neuf sans étiquette", "Comme neuf", "Très bon état", "Bon état", "État satisfaisant"].map((c) => <option key={c}>{c}</option>)}</select>
        <select className={select} value={filters.gender} onChange={(e) => update("gender", e.target.value)}><option value="">Tous types</option>{["Homme", "Femme", "Enfant", "Unisexe"].map((g) => <option key={g}>{g}</option>)}</select>
        <select className={select} value={filters.size} onChange={(e) => update("size", e.target.value)}><option value="">Toutes tailles</option>{["XS", "S", "M", "L", "XL", "XXL", "Other", ...Array.from({ length: 11 }, (_, i) => `EU ${i + 36}`)].map((s) => <option key={s}>{s}</option>)}</select>
        <select className={select} value={filters.store} onChange={(e) => update("store", e.target.value)}><option value="">Tous magasins</option>{stores.map((s) => <option key={s.id} value={s.id}>{s.shortName}</option>)}</select>
        <select className={select} value={filters.availability} onChange={(e) => update("availability", e.target.value)}><option value="">Tous stocks</option><option value="available">Disponible</option><option value="low">Stock faible</option><option value="soldout">Épuisé</option><option value="sold">Vendu</option></select>
        <select className={select} value={filters.status} onChange={(e) => update("status", e.target.value)}><option value="">Tous statuts</option><option value="published">Publié</option><option value="draft">Brouillon</option><option value="sold">Vendu</option></select>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06] p-3">
          <span className="me-2 text-xs text-[#D4AF37]">{selected.length} sélectionné(s)</span>
          <button onClick={() => void bulk("publish")} className="btn btn-outline !min-h-8 !px-3 !text-[9px]">Publier</button>
          <button onClick={() => void bulk("unpublish")} className="btn btn-outline !min-h-8 !px-3 !text-[9px]">Dépublier</button>
          <button onClick={() => void bulk("sold")} className="btn btn-outline !min-h-8 !px-3 !text-[9px]">Marquer vendu</button>
          <button onClick={() => void bulk("delete")} className="btn btn-outline !min-h-8 !px-3 !text-[9px] text-red-300">Supprimer</button>
          <button onClick={() => setSelected([])} className="ms-auto text-[10px] text-white/40 hover:text-white">Annuler</button>
        </div>
      )}

      <div className={`admin-card overflow-x-auto transition ${loading ? "opacity-60" : ""}`}>
        <table className="w-full min-w-[1050px] text-left text-xs">
          <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.12em] text-white/35">
            <tr>
              <th className="p-4"><input type="checkbox" checked={result.items.length > 0 && selected.length === result.items.length} onChange={(e) => setSelected(e.target.checked ? result.items.map((r) => r.id) : [])} className="accent-[#D4AF37]" /></th>
              <th className="p-4">Article</th><th className="p-4">Prix</th><th className="p-4">État</th><th className="p-4">Statut</th><th className="p-4">Stock par magasin</th><th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((product) => {
              const total = product.inventory.reduce((s, row) => s + row.quantity, 0);
              const stockLabel = product.status === "sold" ? "Vendu" : total === 0 ? "Épuisé" : total <= 2 ? "Stock faible" : "Disponible";
              return (
                <tr key={product.id} className="table-row border-b border-white/[0.06]">
                  <td className="p-4"><input type="checkbox" checked={selected.includes(product.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, product.id] : selected.filter((id) => id !== product.id))} className="accent-[#D4AF37]" /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-[#1b1b1b]">{product.images[0] ? <Image src={product.images.find((i) => i.isMain)?.url || product.images[0].url} alt="" fill sizes="44px" className="object-cover" unoptimized /> : null}</div>
                      <div><Link href={`/admin/products/${product.id}/edit`} className="font-semibold hover:text-[#D4AF37]">{product.name}</Link><p className="mt-1 text-[10px] text-white/35">{product.brand?.name || "—"} · {product.category?.name || "—"} · {product.gender}</p></div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-[#D4AF37]">{formatPrice(product.price)}</td>
                  <td className="p-4 text-white/60">{product.condition}{product.sizes.length ? <span className="mt-1 block text-[10px] text-white/30">{product.sizes.join(", ")}</span> : null}</td>
                  <td className="p-4"><div className="flex flex-col gap-1"><span className={`badge w-fit ${product.status === "published" ? "bg-emerald-500/15 text-emerald-300" : product.status === "draft" ? "bg-white/10 text-white/60" : "badge-sold"}`}>{product.status === "published" ? "Publié" : product.status === "draft" ? "Brouillon" : "Vendu"}</span><span className={`badge w-fit ${stockLabel === "Stock faible" ? "badge-low" : "bg-white/[0.06] text-white/45"}`}>{stockLabel}</span></div></td>
                  <td className="p-4"><StockEditor product={product} stores={stores} onSaved={() => void load(filters)} /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${product.id}/edit`} title="Modifier" className="text-white/55 hover:text-[#D4AF37]"><Pencil size={15} /></Link>
                      <button onClick={() => void quickAction(product.id, "duplicate")} title="Dupliquer" className="text-white/55 hover:text-[#D4AF37]"><Copy size={15} /></button>
                      {product.status !== "published" && <button onClick={() => void quickAction(product.id, "publish")} title="Publier sur le site" aria-label="Publier" className="text-emerald-400 hover:text-emerald-300"><Eye size={15} /></button>}
                      {product.status === "published" && <button onClick={() => void quickAction(product.id, "unpublish")} title="Retirer du site (brouillon)" aria-label="Dépublier" className="text-white/50 hover:text-white"><EyeOff size={15} /></button>}
                      <button onClick={() => void quickAction(product.id, "delete")} title="Supprimer" className="text-red-300/70 hover:text-red-300"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!result.items.length && <p className="py-14 text-center text-sm text-white/40">Aucun article ne correspond à ces filtres.</p>}
      </div>

      {result.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button disabled={result.page <= 1} onClick={() => { const next = { ...filters, page: String(result.page - 1) }; setFilters(next); void load(next); }} className="grid h-9 w-9 place-items-center border border-white/15 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <span className="text-xs text-white/50">Page {result.page} / {result.pages}</span>
          <button disabled={result.page >= result.pages} onClick={() => { const next = { ...filters, page: String(result.page + 1) }; setFilters(next); void load(next); }} className="grid h-9 w-9 place-items-center border border-white/15 disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
