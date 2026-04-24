import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ProductGrid({ children }: Props) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      style={{
        gap: "clamp(0.75rem, 1.2vw, 1.25rem)",
      }}
    >
      {children}
    </div>
  );
}
