"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, Save, Star, Trash2, UploadCloud, X } from "lucide-react";
import { CONDITIONS, CLOTHING_SIZES, GENDERS, SHOE_SIZES, formatPrice } from "@/lib/constants";

type StoreOption = { id: number; shortName: string; name: string };
type TaxonomyOption = { id: number; name: string };
type ImageItem = { url: string; isMain: boolean; name: string };
type InitialProduct = {
  id?: number;
  name: string;
  brandId: number | null;
  categoryId: number | null;
  description: string;
  price: string;
  gender: string;
  condition: string;
  conditionNotes: string;
  sizes: string[];
  sku: string;
  status: string;
  featured: boolean;
  images: ImageItem[];
  inventory: { storeId: number; quantity: number }[];
};

const emptyProduct: InitialProduct = {
  name: "", brandId: null, categoryId: null, description: "", price: "", gender: "Unisexe",
  condition: "Très bon état", conditionNotes: "", sizes: [], sku: "", status: "draft", featured: false,
  images: [], inventory: [],
};

export default function ProductFormClient({
  mode,
  initial = emptyProduct,
  categories,
  brands,
  stores,
}: {
  mode: "create" | "edit";
  initial?: InitialProduct;
  categories: TaxonomyOption[];
  brands: TaxonomyOption[];
  stores: StoreOption[];
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);

  const [form, setForm] = useState<InitialProduct>({ ...initial, images: initial.images.map((img, i) => ({ ...img, isMain: img.isMain || i === 0 })) });
  const [enabledStores, setEnabledStores] = useState<number[]>(initial.inventory.map((row) => row.storeId));
  const [quantities, setQuantities] = useState<Record<number, number>>(Object.fromEntries(initial.inventory.map((row) => [row.storeId, row.quantity])));
  const [customSize, setCustomSize] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  function set<K extends keyof InitialProduct>(key: K, value: InitialProduct[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSize(size: string) {
    set("sizes", form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size]);
  }

  function addCustomSize() {
    const value = customSize.trim().slice(0, 20);
    if (value && !form.sizes.includes(value)) set("sizes", [...form.sizes, value]);
    setCustomSize("");
  }

  async function uploadFiles(files: FileList | File[], replaceAt: number | null = null) {
    setError("");
    const list = Array.from(files);
    if (!list.length) return;
    if (!replaceAt && form.images.length + list.length > 12) { setError("Maximum 12 photographies par article."); return; }
    setUploading(true);
    try {
      const uploaded: ImageItem[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError(`${file.name} : format non autorisé (JPG, PNG, WebP).`); continue; }
        if (file.size > 8 * 1024 * 1024) { setError(`${file.name} : taille supérieure à 8 Mo.`); continue; }
        setProgress(`Upload ${i + 1}/${list.length}`);
        const data = new FormData();
        data.append("file", file);
        const response = await fetch("/api/admin/uploads", { method: "POST", body: data });
        const result = await response.json();
        if (!response.ok) { setError(result.error || "Échec de l'envoi de l'image."); continue; }
        uploaded.push({ url: result.url, isMain: false, name: file.name });
      }
      if (uploaded.length) {
        setForm((prev) => {
          let images = [...prev.images];
          if (replaceAt !== null && uploaded[0]) {
            images[replaceAt] = { ...uploaded[0], isMain: prev.images[replaceAt]?.isMain ?? false };
          } else {
            images = [...images, ...uploaded];
          }
          if (!images.some((img) => img.isMain)) images[0] = { ...images[0], isMain: true };
          return { ...prev, images };
        });
        setNotice(`${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} envoyée${uploaded.length > 1 ? "s" : ""}.`);
      }
    } catch {
      setError("Erreur réseau pendant l'envoi des images.");
    } finally {
      setUploading(false);
      setProgress("");
      if (fileInput.current) fileInput.current.value = "";
      if (replaceInput.current) replaceInput.current.value = "";
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.images.length) return;
    const images = [...form.images];
    [images[index], images[target]] = [images[target], images[index]];
    set("images", images);
  }

  function validate() {
    if (form.name.trim().length < 2) return "Le nom de l'article est obligatoire.";
    if (!form.brandId) return "Sélectionnez une marque.";
    if (!form.categoryId) return "Sélectionnez une catégorie.";
    if (!/^\d+(\.\d{1,2})?$/.test(form.price) || Number(form.price) <= 0) return "Indiquez un prix valide en MAD.";
    return "";
  }

  function payload(status: string) {
    const images = form.images.map((image, i) => ({ url: image.url, isMain: image.isMain, displayOrder: i }));
    return {
      name: form.name.trim(),
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
      description: form.description,
      price: form.price,
      gender: form.gender,
      condition: form.condition,
      conditionNotes: form.conditionNotes,
      sizes: form.sizes,
      sku: form.sku || null,
      status,
      featured: form.featured,
      images,
      inventory: enabledStores.map((storeId) => ({ storeId, quantity: Number(quantities[storeId] ?? 0) })),
    };
  }

  async function save(status: string) {
    const problem = validate();
    if (problem) { setError(problem); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (status === "published") {
      if (!form.images.length) { setError("Ajoutez au moins une photographie avant de publier."); return; }
      if (!enabledStores.some((id) => Number(quantities[id] ?? 0) > 0)) { setError("Indiquez une quantité disponible dans au moins un magasin."); return; }
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${initial.id}`;
      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload(status) }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Enregistrement impossible."); setSaving(false); return; }
      setNotice(status === "published" ? "Article publié avec succès." : "Brouillon enregistré avec succès.");
      setTimeout(() => { router.push("/admin/products"); router.refresh(); }, 700);
    } catch {
      setError("Erreur réseau pendant l'enregistrement.");
      setSaving(false);
    }
  }

  const input = "input";
  const section = "admin-card p-6 sm:p-8";
  const sectionTitle = "mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em]";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button onClick={() => router.push("/admin/products")} className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/40 hover:text-[#D4AF37]"><ArrowLeft size={14} /> Retour aux articles</button>
          <h1 className="display text-3xl sm:text-4xl">{mode === "create" ? "Ajouter un article" : "Modifier l'article"}</h1>
          <p className="mt-2 text-sm text-white/45">Renseignez les informations puis choisissez la quantité disponible dans chaque magasin.</p>
        </div>
        <button type="button" onClick={() => setPreview(true)} className="btn btn-outline">Aperçu</button>
      </div>

      {error && <div className="mb-5 flex items-start justify-between gap-3 border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"><span>{error}</span><button onClick={() => setError("")}><X size={16} /></button></div>}
      {notice && <div className="mb-5 flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200"><Check size={16} /> {notice}</div>}

      <div className="space-y-6">
        <section className={section}>
          <h2 className={sectionTitle}><span className="text-[#D4AF37]">01</span> Photographies de l&apos;article</h2>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); void uploadFiles(e.dataTransfer.files); }}
            onClick={() => fileInput.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center transition hover:border-[#D4AF37]/60"
          >
            {uploading ? <Loader2 size={28} className="animate-spin text-[#D4AF37]" /> : <UploadCloud size={30} className="text-[#D4AF37]" />}
            <p className="mt-4 text-sm font-semibold">{uploading ? progress || "Envoi en cours…" : "Glissez vos photos ici ou cliquez pour parcourir"}</p>
            <p className="mt-2 text-xs text-white/35">JPG, PNG ou WebP · 8 Mo max par image · 12 images maximum</p>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => e.target.files && void uploadFiles(e.target.files)} />
          </div>
          {form.images.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.images.map((image, index) => (
                <div key={`${image.url}-${index}`} className={`group relative aspect-[3/4] overflow-hidden border-2 ${image.isMain ? "border-[#D4AF37]" : "border-transparent"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                  {image.isMain && <span className="absolute start-2 top-2 bg-[#D4AF37] px-2 py-1 text-[9px] font-bold uppercase text-black">Principale</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-black/85 p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <button type="button" title="Définir comme principale" onClick={() => set("images", form.images.map((img, i) => ({ ...img, isMain: i === index })))} className="p-1 text-[#D4AF37]"><Star size={14} fill={image.isMain ? "currentColor" : "none"} /></button>
                    <button type="button" title="Déplacer à gauche" onClick={() => moveImage(index, -1)} className="p-1 text-white/70"><ArrowLeft size={14} /></button>
                    <button type="button" title="Déplacer à droite" onClick={() => moveImage(index, 1)} className="p-1 text-white/70"><ArrowRight size={14} /></button>
                    <button type="button" title="Remplacer" onClick={() => { replaceIndex.current = index; replaceInput.current?.click(); }} className="p-1 text-white/70"><ImagePlus size={14} /></button>
                    <button type="button" title="Supprimer" onClick={() => {
                      const images = form.images.filter((_, i) => i !== index);
                      if (images.length && !images.some((img) => img.isMain)) images[0] = { ...images[0], isMain: true };
                      set("images", images);
                    }} className="p-1 text-red-300"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <input ref={replaceInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { if (e.target.files) void uploadFiles(e.target.files, replaceIndex.current); }} />
        </section>

        <section className={section}>
          <h2 className={sectionTitle}><span className="text-[#D4AF37]">02</span> Informations de base</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="field-label">Nom de l&apos;article *</label><input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex. Nike Vintage Hoodie" /></div>
            <div><label className="field-label">Marque *</label><select className={input} value={form.brandId ?? ""} onChange={(e) => set("brandId", Number(e.target.value) || null)}><option value="">Choisir une marque</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div><label className="field-label">Catégorie *</label><select className={input} value={form.categoryId ?? ""} onChange={(e) => set("categoryId", Number(e.target.value) || null)}><option value="">Choisir une catégorie</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="field-label">Prix en MAD *</label><input type="number" min="0" step="1" className={input} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="350" /></div>
            <div><label className="field-label">Référence / SKU (facultatif)</label><input className={input} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="ATB-001" /></div>
            <div className="sm:col-span-2"><label className="field-label">Description</label><textarea rows={4} className={input} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Décrivez l'article, sa coupe, sa couleur…" /></div>
          </div>
          <p className="mt-3 text-[11px] text-white/30">Les informations saisies sont affichées telles quelles sur le site public.</p>
        </section>

        <section className={section}>
          <h2 className={sectionTitle}><span className="text-[#D4AF37]">03</span> Type, état et tailles</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="field-label">Type / genre</label>
              <div className="flex flex-wrap gap-2">{GENDERS.map((gender) => <button key={gender} type="button" onClick={() => set("gender", gender)} className={`border px-4 py-2 text-xs font-semibold transition ${form.gender === gender ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/15 text-white/60 hover:border-white/40"}`}>{gender}</button>)}</div>
              <label className="field-label mt-6">État de l&apos;article *</label>
              <select className={input} value={form.condition} onChange={(e) => set("condition", e.target.value)}>{CONDITIONS.map((condition) => <option key={condition} value={condition}>{condition}</option>)}</select>
              <label className="field-label mt-5">Note sur les défauts ou imperfections</label>
              <textarea rows={2} className={input} value={form.conditionNotes} onChange={(e) => set("conditionNotes", e.target.value)} placeholder="Ex. légère tache au dos, non visible porté" />
            </div>
            <div>
              <label className="field-label">Tailles disponibles</label>
              <div className="flex flex-wrap gap-2">
                {[...CLOTHING_SIZES, ...SHOE_SIZES, ...form.sizes.filter((s) => ![...CLOTHING_SIZES, ...SHOE_SIZES].includes(s))].map((size) => (
                  <button key={size} type="button" onClick={() => toggleSize(size)} className={`min-w-11 border px-3 py-1.5 text-[11px] font-semibold transition ${form.sizes.includes(size) ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/15 text-white/60 hover:border-white/40"}`}>{size}</button>
                ))}
              </div>
              <div className="mt-4 flex gap-2"><input className={input} value={customSize} onChange={(e) => setCustomSize(e.target.value)} placeholder="Taille personnalisée" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSize(); } }} /><button type="button" onClick={addCustomSize} className="btn btn-outline !min-h-[42px] !px-4 !text-[10px]">Ajouter</button></div>
            </div>
          </div>
        </section>

        <section className={section}>
          <h2 className={sectionTitle}><span className="text-[#D4AF37]">04</span> Disponibilité et stock par magasin</h2>
          <p className="mb-5 text-xs leading-relaxed text-white/45">Sélectionnez un ou deux magasins, puis indiquez la quantité disponible dans chacun. Un stock à 0 rend l&apos;article indisponible dans ce magasin uniquement.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {stores.map((store) => {
              const enabled = enabledStores.includes(store.id);
              const quantity = Number(quantities[store.id] ?? 0);
              const label = quantity === 0 ? "Épuisé" : quantity <= 2 ? "Stock faible" : "Disponible";
              return (
                <div key={store.id} className={`border p-5 transition ${enabled ? "border-[#D4AF37]/50 bg-[#D4AF37]/[0.04]" : "border-white/10"}`}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" checked={enabled} onChange={(e) => setEnabledStores(e.target.checked ? [...enabledStores, store.id] : enabledStores.filter((id) => id !== store.id))} className="mt-1 accent-[#D4AF37]" />
                    <span><strong className="text-sm">{store.shortName}</strong><span className="mt-1 block text-xs text-white/40">{store.name} · Mohammédia</span></span>
                  </label>
                  {enabled && (
                    <div className="mt-5">
                      <label className="field-label">Quantité dans ce magasin</label>
                      <div className="flex items-center gap-3"><input type="number" min="0" max="9999" className={input} value={quantity} onChange={(e) => setQuantities((prev) => ({ ...prev, [store.id]: Math.max(0, Number(e.target.value) || 0) }))} /><span className={`badge shrink-0 ${quantity === 0 ? "badge-sold" : quantity <= 2 ? "badge-low" : "bg-emerald-500/20 text-emerald-300"}`}>{label}</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-[#D4AF37]">Total disponible : {enabledStores.reduce((sum, id) => sum + Number(quantities[id] ?? 0), 0)} pièce(s)</p>
        </section>

        <section className={section}>
          <h2 className={sectionTitle}><span className="text-[#D4AF37]">05</span> Publication</h2>
          <label className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-[#D4AF37]" /> Mettre en avant sur la page d&apos;accueil</label>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" disabled={saving} onClick={() => void save("draft")} className="btn btn-outline"><Save size={15} /> Enregistrer en brouillon</button>
            {mode === "edit" && form.status !== "sold" && <button type="button" disabled={saving} onClick={() => void save("sold")} className="btn btn-outline">Marquer comme vendu</button>}
            <button type="button" disabled={saving} onClick={() => void save("published")} className="btn btn-gold">{saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} {form.status === "published" ? "Enregistrer et publier" : "Publier l'article"}</button>
          </div>
        </section>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 p-5 backdrop-blur">
          <div className="mx-auto max-w-2xl border border-[#D4AF37]/30 bg-[#0e0e0e] p-6">
            <div className="mb-6 flex items-center justify-between"><p className="eyebrow">Aperçu de l&apos;article</p><button onClick={() => setPreview(false)} className="text-white/50 hover:text-white"><X size={20} /></button></div>
            <div className="relative aspect-[4/3] overflow-hidden bg-[#171717]">
              {form.images[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={form.images.find((i) => i.isMain)?.url || form.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs uppercase tracking-widest text-white/30">Aucune photo</div>}
            </div>
            <h2 className="display mt-6 text-3xl">{form.name || "Nom de l'article"}</h2>
            <p className="mt-3 text-xl font-bold text-[#D4AF37]">{formatPrice(form.price || "0")}</p>
            <p className="mt-3 text-sm text-white/50">{brands.find((b) => b.id === form.brandId)?.name} · {categories.find((c) => c.id === form.categoryId)?.name} · {form.condition}</p>
            <p className="mt-4 whitespace-pre-line text-sm text-white/60">{form.description}</p>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/50">
              {stores.map((store) => <p key={store.id}>{store.shortName} : {enabledStores.includes(store.id) ? `${quantities[store.id] ?? 0} pièce(s)` : "non disponible"}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
