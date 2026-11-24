import { LinkTabs } from "@/components/ui";
export function MoneyTabs({ active }: { active: string }) {
  return (
    <LinkTabs
      active={active}
      tabs={[
        { key: "in", href: "/min-ekonomi/insattning", label: "Insättning" },
        { key: "out", href: "/min-ekonomi/uttag", label: "Uttag" },
        { key: "transfer", href: "/min-ekonomi/overforing", label: "Överföring mellan konton" },
      ]}
    />
  );
}
