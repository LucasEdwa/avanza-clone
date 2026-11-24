import { LinkTabs } from "@/components/ui";

const TABS = [
  { key: "oversikt", href: "/min-ekonomi/oversikt", label: "Översikt" },
  { key: "innehav", href: "/min-ekonomi/innehav", label: "Innehav" },
  { key: "transaktioner", href: "/min-ekonomi/transaktioner", label: "Transaktioner" },
  { key: "ordrar", href: "/min-ekonomi/ordrar", label: "Ordrar" },
  { key: "insattning", href: "/min-ekonomi/insattning", label: "Insättning & uttag" },
  { key: "manadsspara", href: "/min-ekonomi/manadsspara", label: "Månadsspara" },
  { key: "skatt", href: "/min-ekonomi/skatt", label: "Skatt" },
];

export function MinEkonomiTabs({ active }: { active: string }) {
  return <LinkTabs tabs={TABS} active={active} />;
}
