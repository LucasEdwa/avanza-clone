import { LinkTabs } from "@/components/ui";
export function MarketTabs({ active }: { active: string }) {
  return (
    <LinkTabs
      active={active}
      tabs={[
        { key: "oversikt", href: "/marknad", label: "Översikt" },
        { key: "aktier", href: "/marknad/aktier", label: "Aktier" },
        { key: "fonder", href: "/marknad/fonder", label: "Fonder" },
        { key: "etf", href: "/marknad/borshandlade-fonder", label: "Börshandlade fonder" },
      ]}
    />
  );
}
