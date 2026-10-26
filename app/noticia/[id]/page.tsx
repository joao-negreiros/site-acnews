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
  // Só repete o resumo quando o feed não trouxe o corpo da matéria
  const paragraphs = a.paragraphs.length ? a.paragraphs : [a.summary];

  return (
    <article className="mx-auto max-w-3xl">
      <Link href={`/c/${a.category}`} className="text-xs font-semibold uppercase tracking-wide text-brand">
        {cat?.name}
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-black leading-tight md:text-4xl">{a.title}</h1>
      <p className="mt-3 text-sm text-neutral-500">
        {a.author ? `Por ${a.author} · ` : ""}Fonte: <strong>{a.source}</strong> · {date}
      </p>

      {a.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.image} alt="" className="mt-6 w-full rounded bg-neutral-200" />
      )}

      <div className="mt-6 space-y-4 text-lg leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <aside className="mt-10 border-l-4 border-brand bg-neutral-100 p-4 text-sm dark:bg-neutral-900">
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
    </article>
  );
}
