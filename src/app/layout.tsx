import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import AgeGate from "@/components/shared/age-gate";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const SITE_TITLE =
  "PurePep Labs — Research-grade peptides, documented to the milligram";
const SITE_DESCRIPTION =
  "Third-party tested, lot-traceable peptides for the serious investigator. Every vial shipped with a Certificate of Analysis.";

export const metadata: Metadata = {
  // NOTE: URL is a placeholder — swap to the canonical production origin before launch.
  metadataBase: new URL("https://purepeplabs.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "PurePep Labs",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: "PurePep Labs",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PurePep Labs — Research-grade peptides, documented to the milligram.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-acid selection:text-acid-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <AgeGate />
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
