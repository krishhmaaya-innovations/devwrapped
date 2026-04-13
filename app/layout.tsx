import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeSyncer } from "@/components/theme-syncer";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f0f23" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://devwrapped.com"),
  title: {
    default: "DevWrapped — Your GitHub Year, Beautifully Visualized",
    template: "%s — DevWrapped",
  },
  description:
    "Turn your GitHub contributions into a beautiful, shareable visual. Download as PNG/SVG, compare with friends, track your coding year. Free, no sign-up.",
  keywords: [
    "github wrapped",
    "github heatmap",
    "github contributions",
    "github stats",
    "github year in review",
    "developer stats",
    "coding stats",
    "github visualizer",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devwrapped.com",
    siteName: "DevWrapped",
    title: "DevWrapped — Your GitHub Year, Beautifully Visualized",
    description:
      "Turn your GitHub contributions into a beautiful, shareable visual. Free, no sign-up.",
    images: [{
      url: "/api/og",
      width: 1200,
      height: 630,
      alt: "DevWrapped — Your GitHub Year, Beautifully Visualized",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevWrapped — Your GitHub Year, Beautifully Visualized",
    description:
      "Turn your GitHub contributions into a beautiful, shareable visual.",
    images: ["/api/og"],
  },
  alternates: {
    canonical: "https://devwrapped.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent flash of wrong theme (FOWT) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('devwrapped-theme');
                  if (theme === 'light' || theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "DevWrapped",
              description:
                "Turn your GitHub contributions into a beautiful, shareable visual.",
              url: "https://devwrapped.com",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: "KrishMaaya",
                url: "https://krishhmaaya.com",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <ThemeSyncer />
        <Toaster position="top-center" richColors />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
