import Link from "next/link";
import { categories } from "@/lib/compounds";

type Props = {
  active?: string;
};

export function CategoryTabs({ active }: Props) {
  const tabs: { key: string | undefined; label: string; href: string }[] = [
    { key: undefined, label: "All", href: "/shop" },
    ...categories.map((c) => ({
      key: c.key,
      label: c.label,
      href: `/shop?category=${c.key}`,
    })),
  ];

  return (
    <div
      className="flex flex-wrap items-center"
      style={{ gap: "clamp(0.5rem, 1vw, 0.75rem)" }}
    >
      {tabs.map((tab) => {
        const isActive =
          (active === undefined && tab.key === undefined) ||
          (active !== undefined && active === tab.key);
        const baseClasses =
          "inline-flex items-center font-mono tracking-[0.25em] uppercase transition-colors whitespace-nowrap";
        const activeClasses = "bg-brand text-brand-foreground";
        const inactiveClasses =
          "border border-hairline text-foreground hover:border-foreground";
        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            style={{
              paddingInline: "clamp(0.85rem, 1.4vw, 1.2rem)",
              paddingBlock: "clamp(0.55rem, 0.8vw, 0.75rem)",
              fontSize: "clamp(9.5px, 0.25vw + 8.5px, 10.5px)",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
