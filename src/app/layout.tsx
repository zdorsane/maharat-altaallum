import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/toaster";
import { RevealObserver } from "@/components/motion";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: { default: t.meta.title, template: `%s · ${t.meta.title}` }, description: t.meta.description };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#080d19" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dir } = await getI18n();
  return (
    // data-theme and the .js class are set by THEME_SCRIPT before hydration.
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Readex+Pro:wght@400..700&display=swap"
        />
      </head>
      <body className="min-h-dvh">
        {children}
        <Toaster />
        <RevealObserver locale={locale} />
      </body>
    </html>
  );
}
