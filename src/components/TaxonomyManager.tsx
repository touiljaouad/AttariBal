"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Item = { id: number; name: string; slug: string };

export default function TaxonomyManager({ type, label, initial }: { type: "categories" | "brands"; label: string; initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    const response = await fetch(`/api/admin/taxonomy/${type}`);
    if (response.ok) setItems(await response.json());
  }

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch(`/api/admin/taxonomy/${type}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Ajout impossible"); return; }
    setName("");
    await refresh();
  }

  async function rename(event: React.FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("rename") as HTMLInputElement;
    const response = await fetch(`/api/admin/taxonomy/${type}/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: input.value }),
    });
    if (response.ok) { setEditing(null); await refresh(); }
    else { const data = await response.json(); setError(data.error || "Modification impossible"); }
  }

  async function remove(id: number) {
    if (!confirm("Supprimer cette entrée ? Les articles existants conservent leur nom mais perdent ce classement.")) return;
    const response = await fetch(`/api/admin/taxonomy/${type}/${id}`, { method: "DELETE" });
    if (response.ok) await refresh();
  }

  return (
    <div>
      <div className="mb-8"><p className="eyebrow mb-3">Catalogue</p><h1 className="display text-3xl sm:text-4xl">{label}</h1><p className="mt-2 text-sm text-white/45">Ajoutez, renommez ou supprimez les entrées disponibles dans le formulaire d&apos;article.</p></div>
      <form onSubmit={add} className="admin-card mb-6 flex flex-wrap items-end gap-3 p-5">
        <div className="min-w-[220px] flex-1"><label className="field-label">Nouvelle entrée</label><input required minLength={2} className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={`Nom de ${label.toLowerCase().replace(/s$/, "")}`} /></div>
        <button className="btn btn-gold"><Plus size={15} /> Ajouter</button>
      </form>
      {error && <p className="mb-4 border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
      <div className="admin-card divide-y divide-white/[0.07]">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            {editing === item.id ? (
              <form onSubmit={(e) => void rename(e, item.id)} className="flex flex-1 gap-2"><input name="rename" defaultValue={item.name} className="input max-w-sm" /><button className="btn btn-gold !min-h-9 !px-4 !text-[10px]">Enregistrer</button><button type="button" onClick={() => setEditing(null)} className="text-xs text-white/40">Annuler</button></form>
            ) : (
              <>
                <div><p className="text-sm font-semibold">{item.name}</p><p className="text-[10px] text-white/30" dir="ltr">{item.slug}</p></div>
                <div className="flex gap-3"><button onClick={() => setEditing(item.id)} className="text-white/45 hover:text-[#D4AF37]" title="Modifier"><Pencil size={15} /></button><button onClick={() => void remove(item.id)} className="text-red-300/60 hover:text-red-300" title="Supprimer"><Trash2 size={15} /></button></div>
              </>
            )}
          </div>
        ))}
        {!items.length && <p className="p-8 text-center text-sm text-white/40">Aucune entrée.</p>}
      </div>
    </div>
  );
}
