import Link from "next/link";
import { CATEGORIES } from "@/lib/feeds";
import { SocialIcons } from "@/components/SocialIcons";
import { CONTACT_EMAIL } from "@/lib/site";

const heading = "mb-3 border-b border-brand pb-1 text-sm font-bold uppercase tracking-wide text-white";

export function Footer() {
  return (
    <footer className="mt-12 bg-black text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-3">
        <div>
          <Link href="/" aria-label="AC News - página inicial" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-white.png" alt="AC News" className="h-8 w-auto" />
          </Link>
          <p className="mt-4 text-sm leading-relaxed">
            O portal de notícias do Acre. Reunimos as principais notícias do estado e, de forma selecionada, o que
            é mais relevante no Brasil e no mundo.
          </p>
          <SocialIcons size={18} className="mt-5 text-white" />
        </div>

        <nav aria-label="Editorias">
          <h2 className={heading}>Editorias</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white hover:underline">Capa</Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="hover:text-white hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={heading}>Fontes</h2>
          <p className="text-sm leading-relaxed">
            Matérias creditadas ao veículo de origem e referenciadas à publicação.
          </p>
          <h2 className={`${heading} mt-6`}>Contato</h2>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm hover:text-white hover:underline">
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} AC News · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
