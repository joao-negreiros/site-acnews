import type { Metadata } from "next";
import { Geist, Merriweather } from "next/font/google";
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
        {children}
        <footer className="border-t border-neutral-300 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500">
          AC News · Notícias agregadas de fontes públicas via RSS. Os direitos pertencem aos veículos de origem.
        </footer>
      </body>
    </html>
  );
}
