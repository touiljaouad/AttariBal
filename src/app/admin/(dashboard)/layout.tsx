import type { ReactNode } from "react";
import AdminShell from "@/components/AdminShell";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage();
  return <AdminShell email={admin.email}>{children}</AdminShell>;
}
