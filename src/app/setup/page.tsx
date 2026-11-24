import { SetupForm } from "@/components/AuthForms";
export const dynamic = "force-dynamic";
export const metadata = { title: "Configuration initiale", robots: { index: false, follow: false } };
export default function SetupPage() { return <SetupForm />; }
