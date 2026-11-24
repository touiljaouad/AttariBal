"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Values = {
  instagramUrl: string; whatsappUrl: string; phone: string; email: string;
  aboutTitle: string; aboutText: string; instagramNote: string;
};

export default function SettingsForm({ initial }: { initial: Values }) {
  const [values, setValues] = useState(initial);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(key: keyof Values, value: string) { setValues((prev) => ({ ...prev, [key]: value })); }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    const response = await fetch("/api/admin/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
    });
    const data = await response.json();
    if (response.ok) { setNotice("Paramètres enregistrés."); setTimeout(() => setNotice(""), 3000); }
    else setError(data.error || "Erreur lors de l'enregistrement.");
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-8"><p className="eyebrow mb-3">Boutique</p><h1 className="display text-3xl sm:text-4xl">Paramètres du site</h1><p className="mt-2 text-sm text-white/45">Ces informations apparaissent sur les pages publiques.</p></div>
      {notice && <p className="mb-5 flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-200"><Check size={14} /> {notice}</p>}
      {error && <p className="mb-5 border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
      <form onSubmit={save} className="admin-card max-w-3xl space-y-6 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="field-label">Téléphone</label><input className="input" value={values.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className="field-label">Email (facultatif)</label><input type="email" className="input" value={values.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="field-label">Lien Instagram</label><input type="url" className="input" value={values.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="field-label">Lien communauté WhatsApp</label><input type="url" className="input" value={values.whatsappUrl} onChange={(e) => set("whatsappUrl", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="field-label">Titre page À propos</label><input className="input" value={values.aboutTitle} onChange={(e) => set("aboutTitle", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="field-label">Texte À propos</label><textarea rows={6} className="input" value={values.aboutText} onChange={(e) => set("aboutText", e.target.value)} placeholder="Laissez vide pour utiliser le texte par défaut." /></div>
          <div className="sm:col-span-2"><label className="field-label">Note Instagram</label><textarea rows={2} className="input" value={values.instagramNote} onChange={(e) => set("instagramNote", e.target.value)} /></div>
        </div>
        <button disabled={saving} className="btn btn-gold">{saving ? "Enregistrement…" : "Enregistrer les modifications"}</button>
      </form>
    </div>
  );
}
