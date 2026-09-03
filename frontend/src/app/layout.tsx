import type { Metadata } from "next";
import { Lexend, Geist_Mono, DM_Serif_Display } from "next/font/google";
import { MainNav } from "@/components/main-nav";
import { NotificationToaster } from "@/components/notification-toaster";
import {
  SITE_TITLE,
  SITE_SUBTITLE,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
} from "@/lib/content";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: `${SITE_SUBTITLE} ${SITE_DESCRIPTION}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${lexend.variable} ${dmSerifDisplay.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NotificationToaster>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:rounded focus:border"
          >
            Pular para o conteúdo principal
          </a>

          <header role="banner">
            <nav
              aria-label="Navegação principal"
              className="border-b border-border bg-card/80 backdrop-blur"
            >
              <MainNav />
            </nav>
          </header>

          <main id="main-content" className="flex-1">
            {children}
          </main>

          <footer
            role="contentinfo"
            className="border-t border-border py-6 text-center text-sm text-muted-foreground"
          >
            <p>{SITE_TAGLINE}</p>
          </footer>
        </NotificationToaster>
      </body>
    </html>
  );
}
