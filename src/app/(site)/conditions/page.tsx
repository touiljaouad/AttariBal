import type { Metadata } from "next";
import { LegalContent } from "@/components/InfoPages";
export const metadata: Metadata = { title: "Conditions d'utilisation" };
export default function TermsPage() { return <LegalContent type="terms" />; }
