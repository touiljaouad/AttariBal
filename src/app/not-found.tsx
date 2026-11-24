import Link from "next/link";
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Erreur 404</p>
        <h1 className="display mt-5 text-5xl">Page introuvable</h1>
        <p className="mt-5 text-sm text-white/50">Cette page n&apos;existe pas ou l&apos;article n&apos;est plus disponible.</p>
        <Link href="/" className="btn btn-gold mt-8">Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}
