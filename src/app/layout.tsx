import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/toaster";
import { RevealObserver, ScrollState, SpotlightTracker } from "@/components/motion";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { getI18n } from "@/lib/i18n/server";
import "./fonts.css";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
    title: { default: t.meta.title, template: `%s · ${t.meta.title}` },
    description: t.meta.description,
    openGraph: { title: t.meta.title, description: t.meta.description, images: [{ url: "/brand/afaq-brand-board.jpg", width: 1536, height: 1024, alt: "AFAQ | آفاق" }] },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9ff" },
    { media: "(prefers-color-scheme: dark)", color: "#120e26" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dir } = await getI18n();
  return (
    // data-theme and the .js class are set by THEME_SCRIPT before hydration.
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preload" href={locale === "ar" ? "/fonts/tajawal-arabic-400.woff2" : "/fonts/plus-jakarta-sans-latin-400-800.woff2"} as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="min-h-dvh">
        {children}
        <Toaster />
        <RevealObserver locale={locale} />
        <ScrollState />
        <SpotlightTracker />
      </body>
    </html>
  );
}
