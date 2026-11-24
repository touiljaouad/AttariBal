"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, CircleHelp, LayoutDashboard, LogOut, Menu, Settings, Tags, X, ExternalLink, House } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const nav = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/products", label: "Articles", icon: Boxes },
  { href: "/admin/categories", label: "Catégories", icon: Tags },
  { href: "/admin/brands", label: "Marques", icon: Tags },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
  { href: "/admin/guide", label: "Guide d'utilisation", icon: CircleHelp },
];

export default function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <aside className={`fixed inset-y-0 start-0 z-50 flex w-[250px] flex-col border-e border-white/10 bg-[#0e0e0e] transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[74px] items-center justify-between border-b border-white/10 px-6"><BrandLogo href="/admin" /><button onClick={() => setOpen(false)} className="lg:hidden" aria-label="Fermer"><X size={18} /></button></div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition ${active ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>
                <item.icon size={16} /> {item.label}
              </Link>
            );
          })}
          <div className="my-5 h-px bg-white/10" />
          <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-xs text-white/50 hover:text-[#D4AF37]"><ExternalLink size={16} /> Voir le site</Link>
          <Link href="/magasins" target="_blank" className="flex items-center gap-3 px-4 py-3 text-xs text-white/50 hover:text-[#D4AF37]"><House size={16} /> Nos magasins</Link>
        </nav>
        <div className="border-t border-white/10 p-5">
          <p className="truncate text-xs text-white/60">{email}</p>
          <button onClick={logout} className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-red-300/80 hover:text-red-300"><LogOut size={14} /> Déconnexion</button>
        </div>
      </aside>
      {open && <button className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Fermer le menu" />}
      <div className="lg:ps-[250px]">
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-white/10 bg-[#080808]/95 px-5 backdrop-blur sm:px-9">
          <button onClick={() => setOpen(true)} className="lg:hidden" aria-label="Ouvrir le menu"><Menu size={20} /></button>
          <div><p className="eyebrow">Administration</p><p className="mt-1 text-sm font-semibold">Ataribal100original</p></div>
          <Link href="/admin/products/new" className="btn btn-gold !min-h-9 !px-4 !text-[10px]">+ Ajouter un article</Link>
        </header>
        <div className="p-5 sm:p-9">{children}</div>
      </div>
    </div>
  );
}
