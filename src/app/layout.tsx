import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Ataribal100original — Mode originale à Mohammédia",
    template: "%s | Ataribal100original",
  },
  description:
    "Vêtements de marque originaux, sneakers et pièces uniques à Mohammédia. Découvrez notre collection et visitez Attari Bal 1 ou Attari Bal 2.",
  openGraph: {
    title: "Ataribal100original — Your style. Your identity. 100% original.",
    description: "Mode originale et pièces uniques à Mohammédia. Deux boutiques physiques : Attari Bal 1 et Attari Bal 2.",
    type: "website",
    locale: "fr_MA",
    images: ["/images/hero-editorial.jpg"],
  },
  icons: { icon: "/logo.svg" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
