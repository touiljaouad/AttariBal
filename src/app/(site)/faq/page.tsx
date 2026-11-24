import type { Metadata } from "next";
import { FaqContent } from "@/components/InfoPages";
export const metadata: Metadata = { title: "FAQ", description: "Questions fréquentes sur Ataribal100original." };
export default function FaqPage() { return <FaqContent />; }
