import Link from "next/link";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { CATEGORIES } from "@/lib/feeds";
import { getQuotes } from "@/lib/market";
import { SOCIAL } from "@/lib/site";

const ICONS = {
  Instagram: FaInstagram,
  Facebook: FaFacebookF,
  X: FaXTwitter,
  YouTube: FaYoutube,
  WhatsApp: FaWhatsapp,
} as const;

export async function Header() {
  const quotes = await getQuotes();

  return (
    <header>
      {/* Faixa cinza: redes sociais à esquerda, cotações à direita */}
      <div className="bg-neutral-100 text-xs text-neutral-600">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <ul className="flex items-center gap-3">
            {SOCIAL.map((s) => {
              const Icon = ICONS[s.name];
              return (
                <li key={s.name}>
                  {s.href ? (
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className="block hover:text-brand"
                    >
                      <Icon size={15} />
                    </a>
                  ) : (
                    <span aria-hidden className="block opacity-60">
                      <Icon size={15} />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <ul className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
            {quotes.map((q) => (
              <li key={q.label} className="flex items-baseline gap-1.5">
                <span className="font-semibold uppercase tracking-wide text-neutral-500">{q.label}</span>
                <span className="font-bold text-neutral-800">{q.value}</span>
                <span className={`font-semibold ${q.pct < 0 ? "text-brand" : "text-green-700"}`}>
                  {q.pct < 0 ? "▼" : "▲"} {Math.abs(q.pct).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Logo centralizada */}
      <div className="flex justify-center bg-white py-6">
        <Link href="/" aria-label="AC News - página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-red.png" alt="AC News" className="h-12 w-auto md:h-14" />
        </Link>
      </div>

      {/* Barra vermelha com o menu em letras brancas */}
      <nav className="bg-brand text-white">
        <ul className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 text-sm font-semibold uppercase whitespace-nowrap md:justify-center md:text-base">
          <li>
            <Link href="/" className="block px-3 py-3 hover:bg-black/15">Capa</Link>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/c/${c.slug}`} className="block px-3 py-3 hover:bg-black/15">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
