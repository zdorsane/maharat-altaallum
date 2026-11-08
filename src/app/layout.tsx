import type { Metadata, Viewport } from "next";
import { Alexandria, Plus_Jakarta_Sans, Tajawal } from "next/font/google";
import { Toaster } from "@/components/toaster";
import { RevealObserver } from "@/components/motion";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-jakarta", display: "swap" });
const alexandria = Alexandria({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-alexandria", display: "swap" });
const tajawal = Tajawal({ subsets: ["arabic"], weight: ["400", "500", "700", "800"], variable: "--font-tajawal", display: "swap" });

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
      </head>
      <body className={`${jakarta.variable} ${alexandria.variable} ${tajawal.variable} min-h-dvh`}>
        {children}
        <Toaster />
        <RevealObserver locale={locale} />
      </body>
    </html>
  );
}
