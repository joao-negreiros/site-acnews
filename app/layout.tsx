import type { Metadata } from "next";
import { Outfit, Source_Serif_4 } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Preloader } from "@/components/Preloader";
import "./globals.css";

// Fonte única do portal (exceto a logomarca, que é imagem)
const serif = Source_Serif_4({ variable: "--font-source", subsets: ["latin"] });
// Mais parecida com a fonte da logomarca (geométrica, "a" de um andar); usada no menu
const logoFont = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "AC News", template: "%s | AC News" },
  description: "As principais notícias do Brasil e do mundo, atualizadas automaticamente.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${logoFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Preloader />
        {children}
        <Footer />
      </body>
    </html>
  );
}
