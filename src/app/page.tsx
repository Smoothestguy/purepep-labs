import { StatusBar } from "@/components/marketing/status-bar";
import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { Science } from "@/components/marketing/science";
import { Manifesto } from "@/components/marketing/manifesto";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background text-foreground">
      <StatusBar />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Science />
        <Manifesto />
      </main>
      <SiteFooter />
    </div>
  );
}
