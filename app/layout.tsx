import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Fonte única do portal (exceto a logomarca, que é imagem)
const serif = Source_Serif_4({ variable: "--font-source", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "AC News", template: "%s | AC News" },
  description: "As principais notícias do Brasil e do mundo, atualizadas automaticamente.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="border-t border-neutral-300 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500">
          AC News · Notícias agregadas de fontes públicas via RSS. Os direitos pertencem aos veículos de origem.
        </footer>
      </body>
    </html>
  );
}
