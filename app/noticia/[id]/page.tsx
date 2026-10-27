import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getArticle } from "@/lib/feeds";

export const revalidate = 600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).id);
  return a ? { title: a.title, description: a.summary } : {};
}

export default async function ArticlePage({ params }: Props) {
  const a = await getArticle((await params).id);
  if (!a) notFound();

  const cat = CATEGORIES.find((c) => c.slug === a.category);
  const date = new Date(a.date).toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
  const paragraphs = a.paragraphs.length ? a.paragraphs : [a.summary];
  // A linha fina é o resumo; só aparece quando o texto não começa com ele
  const lead = a.summary && !paragraphs[0]?.startsWith(a.summary.slice(0, 60)) ? a.summary : "";

  return (
    <>
      {/* Faixa enxuta: só o logo (volta para a home) e o nome da editoria */}
      <header className="bg-brand text-white">
        <div className="mx-auto grid h-14 max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-4">
          <Link href="/" aria-label="AC News - página inicial">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-white.png" alt="AC News" className="h-6 w-auto" />
          </Link>
          <span className="text-lg font-semibold uppercase tracking-wide">{cat?.name}</span>
          <span />
        </div>
      </header>

      <article className="flex-1 pb-12">
        {a.image && (
          <div className="mx-auto mt-6 max-w-5xl px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.image} alt="" className="mx-auto max-h-[32rem] w-auto max-w-full rounded bg-neutral-200" />
          </div>
        )}

        <div className="mx-auto mt-8 max-w-2xl px-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[1.1]">
            {a.title}
          </h1>
          {lead && <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">{lead}</p>}

          <p className="mt-5 border-t border-neutral-300 pt-3 text-xs leading-relaxed text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
            {a.author && <strong className="block text-neutral-800 dark:text-neutral-200">{a.author}</strong>}
            Fonte: {a.source}
            <br />
            {date}
          </p>

          <div className="mt-8 space-y-5 text-xl leading-8">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <aside className="mt-12 border-l-4 border-brand bg-neutral-100 p-4 text-sm dark:bg-neutral-900">
            <p>
              Matéria originalmente publicada por <strong>{a.source}</strong>
              {a.author ? `, de autoria de ${a.author}` : ""}, em {date}. Todos os direitos pertencem à fonte.
            </p>
            {!a.fullText && (
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                A fonte disponibiliza apenas o resumo desta matéria.
              </p>
            )}
            <a
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-brand hover:underline"
            >
              Referência: matéria original em {a.source}
            </a>
          </aside>
        </div>
      </article>
    </>
  );
}
