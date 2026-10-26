import type { Metadata } from "next";
import { Geist, Merriweather } from "next/font/google";
import Link from "next/link";
import { CATEGORIES } from "@/lib/feeds";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const serif = Merriweather({
  variable: "--font-merri",
  subsets: ["latin"],
  weight: ["700", "900"],
});

export const metadata: Metadata = {
  title: { default: "AC News", template: "%s | AC News" },
  description: "As principais notícias do Brasil e do mundo, atualizadas automaticamente.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-neutral-300 dark:border-neutral-800">
          <div className="mx-auto max-w-6xl px-4 py-5">
            <Link href="/" aria-label="AC News - página inicial">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-red.png" alt="AC News" className="h-9 w-auto dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-white.png" alt="" className="hidden h-9 w-auto dark:block" />
            </Link>
          </div>
          <nav className="border-t border-neutral-300 dark:border-neutral-800">
            <ul className="mx-auto max-w-6xl px-4 flex gap-5 overflow-x-auto py-2 text-sm font-medium whitespace-nowrap">
              <li><Link href="/" className="hover:text-brand">Início</Link></li>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/c/${c.slug}`} className="hover:text-brand">{c.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-neutral-300 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500">
          AC News · Notícias agregadas de fontes públicas via RSS. Os direitos pertencem aos veículos de origem.
        </footer>
      </body>
    </html>
  );
}
