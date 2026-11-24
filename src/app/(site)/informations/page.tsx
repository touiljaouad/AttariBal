import type { Metadata } from "next";
import { LegalContent } from "@/components/InfoPages";
export const metadata: Metadata = { title: "Informations boutique" };
export default function InfoPage() { return <LegalContent type="info" />; }
