import type { Metadata } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Changelog OS Pro",
    template: "%s · Changelog OS Pro",
  },
  description:
    "Ship beautiful changelogs. Transform updates into developer, customer, and internal views automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans`}>
        <Providers>
          <div className="relative min-h-screen">
            <div className="pointer-events-none absolute inset-0 grain" aria-hidden />
            <header className="sticky top-0 z-40 border-b border-ink-200/60 bg-sand-100/75 backdrop-blur-xl">
              <div className="page-shell flex h-16 items-center justify-between">
                <Link href="/" className="group flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-sm font-semibold text-sand-100 transition group-hover:bg-accent">
                    C
                  </span>
                  <span className="display text-lg leading-none">
                    Changelog OS <span className="text-accent">Pro</span>
                  </span>
                </Link>
                <nav className="flex items-center gap-1 text-sm">
                  <Link
                    href="/"
                    className="rounded-xl px-3 py-2 text-ink-600 transition hover:bg-white/70 hover:text-ink-900"
                  >
                    Projects
                  </Link>
                </nav>
              </div>
            </header>
            <main className="relative">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
