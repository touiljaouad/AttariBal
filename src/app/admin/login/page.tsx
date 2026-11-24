import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";
import { adminsExist, getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Connexion administrateur", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getSessionAdmin()) redirect("/admin");
  // When no administrator exists yet, send the owner to the one-time setup page
  // instead of leaving them stuck on a login form that can never succeed.
  const setupNeeded = !(await adminsExist());
  return <LoginForm setupNeeded={setupNeeded} />;
}
