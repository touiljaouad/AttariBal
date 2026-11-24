import type { Metadata } from "next";
import { LegalContent } from "@/components/InfoPages";
export const metadata: Metadata = { title: "Politique de confidentialité" };
export default function PrivacyPage() { return <LegalContent type="privacy" />; }
