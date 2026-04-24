import type { ReactNode } from "react";
import { StatusBar } from "@/components/marketing/status-bar";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background text-foreground">
      <StatusBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
