import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import AgeGate from "@/components/shared/age-gate";
import { AuthProvider } from "@/components/shared/auth-provider";
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
  "The Pure Pep — Research-grade peptides, documented to the milligram";
const SITE_DESCRIPTION =
  "Third-party tested, lot-traceable peptides for the serious investigator. Every vial shipped with a Certificate of Analysis.";

export const metadata: Metadata = {
  metadataBase: new URL("https://thepurepep.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "The Pure Pep",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: "The Pure Pep",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "The Pure Pep — Research-grade peptides, documented to the milligram.",
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
          <AuthProvider>{children}</AuthProvider>
          <AgeGate />
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
