"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between px-7 py-9 sm:px-14">
        <BrandLogo href="/" />
        <div className="mx-auto w-full max-w-md py-16">
          <p className="eyebrow mb-4">Espace privé</p>
          <h1 className="display text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-5 text-sm leading-relaxed text-white/45">{subtitle}</p>
          <div className="mt-9">{children}</div>
        </div>
        <Link href="/" className="text-xs text-white/40 hover:text-[#D4AF37]">← Retour au site</Link>
      </div>
      <div className="relative hidden overflow-hidden border-s border-white/10 lg:block">
        <img src="/images/hero-editorial.jpg" alt="" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-14 start-14 max-w-sm">
          <p className="eyebrow">Ataribal100original</p>
          <p className="display mt-4 text-4xl uppercase">Your style.<br />Your identity.<br /><span className="text-[#D4AF37]">100% original.</span></p>
        </div>
      </div>
    </div>
  );
}

export function LoginForm({ setupNeeded = false }: { setupNeeded?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Connexion impossible"); setLoading(false); return; }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Connexion administrateur" subtitle="Accédez à la gestion des articles, des stocks et des magasins.">
      {setupNeeded && (
        <div className="mb-6 border border-[#D4AF37]/45 bg-[#D4AF37]/10 p-4">
          <p className="text-sm font-semibold text-[#e8cd76]">Aucun compte administrateur n&apos;existe encore.</p>
          <p className="mt-2 text-xs leading-relaxed text-white/60">
            Créez-le en une seule fois sur la page de configuration initiale, puis revenez ici pour vous connecter.
          </p>
          <Link href="/setup" className="btn btn-gold mt-4 w-full">Créer le compte administrateur <ArrowRight size={15} /></Link>
        </div>
      )}
      <form onSubmit={submit} className="space-y-5">
        <div><label className="field-label">Adresse email</label><div className="relative"><Mail size={15} className="absolute start-3 top-3 text-white/30" /><input type="email" required className="input !ps-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" autoComplete="username" /></div></div>
        <div><label className="field-label">Mot de passe</label><div className="relative"><LockKeyhole size={15} className="absolute start-3 top-3 text-white/30" /><input type={show ? "text" : "password"} required className="input !ps-10 !pe-10" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /><button type="button" onClick={() => setShow((v) => !v)} className="absolute end-3 top-3 text-white/35" aria-label="Afficher le mot de passe">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></div>
        {error && <p className="border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
        <button disabled={loading} className="btn btn-gold w-full">{loading ? "Connexion…" : "Se connecter"} <ArrowRight size={15} /></button>
        <p className="text-center text-[11px] text-white/30">Aucune inscription publique n&apos;est autorisée.</p>
      </form>
    </AuthLayout>
  );
}

export function SetupForm() {
  const router = useRouter();
  const [state, setState] = useState<{ available: boolean; tokenConfigured: boolean } | null>(null);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/setup").then((r) => r.json()).then(setState).catch(() => setState({ available: false, tokenConfigured: false }));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/setup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, email, password }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Configuration impossible"); setLoading(false); return; }
      router.push("/admin");
      router.refresh();
    } catch { setError("Erreur réseau."); setLoading(false); }
  }

  if (state === null) return <div className="min-h-screen grid place-items-center text-sm text-white/50">Vérification…</div>;

  return (
    <AuthLayout title="Configuration initiale" subtitle="Créez le compte administrateur de la boutique. Cette page n'est accessible qu'une seule fois.">
      {state.available ? (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="field-label">Jeton de configuration (ADMIN_SETUP_TOKEN)</label>
            <input required className="input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Jeton défini sur le serveur" />
            <p className="mt-2 text-[11px] leading-relaxed text-white/35">
              Ce jeton se trouve sur le serveur, soit dans <span className="text-white/60" dir="ltr">.env</span> à la ligne <span className="text-white/60" dir="ltr">ADMIN_SETUP_TOKEN</span>, soit dans le fichier <span className="text-white/60" dir="ltr">data/setup-token</span>. Il n&apos;est jamais affiché publiquement.
            </p>
          </div>
          <div><label className="field-label">Email administrateur</label><input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@ataribal100original.ma" /></div>
          <div><label className="field-label">Mot de passe (10 caractères minimum)</label><input type="password" required minLength={10} className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {!state.tokenConfigured && <p className="border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">ADMIN_SETUP_TOKEN n&apos;est pas défini sur le serveur. Ajoutez-le au fichier .env puis redémarrez l&apos;application.</p>}
          {error && <p className="border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
          <button disabled={loading || !state.tokenConfigured} className="btn btn-gold w-full">{loading ? "Création…" : "Créer le compte administrateur"} <ArrowRight size={15} /></button>
        </form>
      ) : (
        <div className="border border-white/10 bg-[#111] p-6 text-sm leading-relaxed text-white/55">
          L&apos;administrateur est déjà configuré. <Link href="/admin/login" className="text-[#D4AF37] underline">Se connecter</Link>
        </div>
      )}
    </AuthLayout>
  );
}
