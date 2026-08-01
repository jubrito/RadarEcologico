import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import {
  SITE_TITLE,
  SITE_SUBTITLE,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
} from "@/lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const boringTime = localFont({
  src: "../../public/fonts/Boring Time.otf",
  variable: "--font-boring-time",
  display: "swap",
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
      className={`${geistSans.variable} ${geistMono.variable} ${boringTime.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link
                href="/"
                className="font-semibold text-lg hover:text-primary transition-colors"
              >
                {SITE_TITLE}
              </Link>
              <Link
                href="/bills"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Projetos de Lei
              </Link>
            </div>
          </nav>
        </header>

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <footer
          role="contentinfo"
          className="border-t border-border py-6 text-center text-sm text-muted-foreground"
        >
          <p>
            <span className="font-boring-time">{SITE_TITLE}</span> —{" "}
            {SITE_TAGLINE}
          </p>
        </footer>
      </body>
    </html>
  );
}
