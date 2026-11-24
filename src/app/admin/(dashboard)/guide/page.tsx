import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, CheckCircle2, Eye, ImagePlus, MapPin, Settings, Tags } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Guide d'utilisation" };

const steps = [
  {
    icon: ImagePlus,
    title: "1. Ajoutez les photos",
    body: "Ouvrez « Articles » puis « + Ajouter un article ». Glissez vos photos dans la zone prévue (ou cliquez pour parcourir). Formats acceptés : JPG, PNG, WebP, 8 Mo maximum, 12 photos par article.",
    extra: "L'étoile définit la photo principale (celle affichée dans le catalogue). Les flèches changent l'ordre, l'icône d'image remplace, la corbeille supprime.",
  },
  {
    icon: CheckCircle2,
    title: "2. Renseignez l'article",
    body: "Nom, marque, catégorie et prix en dirhams sont obligatoires. La description et la référence sont facultatives. Ces informations apparaissent telles quelles sur le site public.",
    extra: "Choisissez le type (Homme, Femme, Enfant, Unisexe), l'état de l'article et ajoutez une note en cas de défauts, taches ou imperfections.",
  },
  {
    icon: MapPin,
    title: "3. Indiquez le stock par magasin",
    body: "Cochez Attari Bal 1 et/ou Attari Bal 2, puis saisissez la quantité réelle dans chacun. Les deux magasins sont indépendants : une vente dans l'un ne modifie pas l'autre.",
    extra: "Une quantité à 0 rend l'article indisponible dans ce magasin uniquement. Si les deux sont à 0, l'article est affiché « Épuisé » sur le site.",
  },
  {
    icon: Eye,
    title: "4. Publiez",
    body: "Cliquez sur « Publier l'article ». Un article ne peut être publié que s'il possède au moins une photo et une quantité positive dans un magasin.",
    extra: "« Enregistrer en brouillon » garde l'article privé. « Aperçu » montre le rendu avant publication. « Marquer comme vendu » met le statut à Vendu et remet les stocks à zéro.",
  },
  {
    icon: Boxes,
    title: "5. Gérez au quotidien",
    body: "Dans « Articles », modifiez les quantités directement dans la colonne « Stock par magasin » puis cliquez sur « Sauver ». Utilisez la recherche et les filtres pour retrouver un article.",
    extra: "Icônes de ligne : crayon = modifier, copie = dupliquer en brouillon, œil = publier, œil barré = retirer du site, corbeille = supprimer (confirmation demandée).",
  },
  {
    icon: Tags,
    title: "6. Catégories, marques et paramètres",
    body: "Ajoutez ou renommez des catégories et des marques depuis le menu latéral. Dans « Paramètres », mettez à jour le téléphone, l'Instagram, le lien WhatsApp communauté et le texte de la page À propos.",
    extra: "Supprimer une catégorie ne supprime pas les articles : il faudra les reclasser.",
  },
];

export default function AdminGuidePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10">
        <p className="eyebrow mb-3">Aide</p>
        <h1 className="display text-3xl sm:text-4xl">Guide d&apos;utilisation</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
          Tout ce qu&apos;il faut savoir pour gérer la boutique. Le site est une vitrine : les clients découvrent les articles en ligne et achètent en magasin. Aucun paiement en ligne n&apos;est proposé.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="btn btn-gold">+ Ajouter un article <ArrowRight size={15} /></Link>
          <Link href="/admin/products" className="btn btn-outline">Voir mes articles</Link>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <section key={step.title} className="admin-card p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-[#D4AF37]/40 text-[#D4AF37]">
                <step.icon size={19} strokeWidth={1.6} />
              </span>
              <div>
                <h2 className="text-base font-bold uppercase tracking-[0.08em]">{step.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{step.body}</p>
                <p className="mt-3 border-s-2 border-[#D4AF37]/60 ps-4 text-xs leading-relaxed text-white/45">{step.extra}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="admin-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em]"><Settings size={16} className="text-[#D4AF37]" /> Statuts expliqués</h2>
          <ul className="space-y-3 text-xs leading-relaxed text-white/60">
            <li><span className="badge bg-white/10 text-white/80">Publié</span> — visible par tous sur le site.</li>
            <li><span className="badge bg-white/10 text-white/80">Brouillon</span> — visible uniquement dans l&apos;administration.</li>
            <li><span className="badge badge-low">Stock faible</span> — 1 ou 2 pièces restantes au total.</li>
            <li><span className="badge badge-sold">Épuisé</span> — plus de stock dans aucun magasin.</li>
            <li><span className="badge badge-sold">Vendu</span> — article vendu, stocks remis à zéro.</li>
          </ul>
        </div>
        <div className="admin-card p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.12em]">Bonnes pratiques</h2>
          <ul className="space-y-3 text-xs leading-relaxed text-white/60">
            <li>Prenez les photos en lumière naturelle, sur fond neutre, l&apos;article à plat ou porté.</li>
            <li>Décrivez honnêtement l&apos;état : la confiance des clients repose sur la transparence.</li>
            <li>Mettez à jour le stock dès qu&apos;une vente a lieu en boutique.</li>
            <li>Ajoutez les nouveaux arrivages en premier : ils apparaissent en tête du catalogue.</li>
            <li>Mot de passe oublié ? Utilisez le script de réinitialisation documenté dans le guide.</li>
          </ul>
        </div>
      </section>

      <p className="mt-8 text-xs leading-relaxed text-white/35">
        Besoin d&apos;aide technique ? Consultez <span className="text-white/60">docs/ADMIN_GUIDE.md</span> et <span className="text-white/60">README.md</span> à la racine du projet.
      </p>
    </div>
  );
}
