import Link from "next/link";

export default function BrandLogo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 shrink-0" aria-label="Ataribal100original — accueil">
      <span className="brand-mark" aria-hidden="true">
        A<span className="text-[8px] self-end mb-[6px]">100</span>
      </span>
      {!compact && (
        <span className="flex flex-col">
          <span className="brand-name text-white">ATARIBAL</span>
          <span className="brand-sub mt-1">100 ORIGINAL</span>
        </span>
      )}
    </Link>
  );
}
