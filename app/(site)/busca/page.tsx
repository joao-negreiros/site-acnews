import type { Metadata } from "next";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticles } from "@/lib/feeds";

export const metadata: Metadata = { title: "Pesquisar", robots: { index: false } };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const terms = norm(q).split(/\s+/).filter(Boolean);

  // Procura entre as matérias que estão no portal agora; cada palavra digitada precisa aparecer
  const results = terms.length
    ? (await getArticles()).filter((a) => {
        const text = norm(`${a.title} ${a.summary} ${a.paragraphs.join(" ")}`);
        return terms.every((t) => text.includes(t));
      })
    : [];

  return (
    <>
      <h1 className="mb-6 border-b-2 border-brand pb-2 font-serif text-4xl font-black md:text-5xl">Pesquisar</h1>

      <form action="/busca" className="mb-8 flex max-w-xl gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Digite o que procura"
          aria-label="Pesquisar no portal"
          autoFocus
          maxLength={80}
          className="min-w-0 flex-1 rounded border border-neutral-300 px-3 py-2 text-lg outline-none focus:border-brand"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="flex items-center gap-2 rounded bg-brand px-4 py-2 font-semibold text-white hover:bg-black"
        >
          <FaMagnifyingGlass size={16} />
          Buscar
        </button>
      </form>

      {terms.length > 0 &&
        (results.length ? (
          <>
            <p className="mb-4 text-sm text-neutral-500">
              {results.length} {results.length === 1 ? "resultado" : "resultados"} para “{q}”
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {results.map((a) => (
                <ArticleCard key={a.id} a={a} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-neutral-500">Nenhuma matéria encontrada para “{q}”.</p>
        ))}
    </>
  );
}
