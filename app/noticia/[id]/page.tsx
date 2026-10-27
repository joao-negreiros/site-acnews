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
  const paragraphs = a.paragraphs.length ? a.paragraphs : a.summary ? [a.summary] : [];

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
        {/* Ordem padrão da matéria: manchete, foto ou vídeo, créditos, texto */}
        <div className="mx-auto mt-8 max-w-2xl px-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[1.1]">
            {a.title}
          </h1>
        </div>

        {(a.video || a.image) && (
          <div className="mx-auto mt-6 max-w-3xl px-4">
            {/* Moldura de tamanho fixo (3:2), igual para qualquer foto ou vídeo */}
            <div className="aspect-[3/2] w-full overflow-hidden rounded bg-neutral-100">
              {a.video ? (
                <video
                  src={a.video}
                  poster={a.image}
                  controls
                  preload="metadata"
                  playsInline
                  className="h-full w-full bg-black object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          </div>
        )}

        <div className="mx-auto mt-4 max-w-2xl px-4">
          <p className="border-b border-neutral-300 pb-3 text-xs leading-relaxed text-neutral-600">
            {a.author && <strong className="block text-neutral-800">{a.author}</strong>}
            Fonte: {a.source}
            <br />
            {date}
          </p>

          <div className="mt-8 space-y-5 text-xl leading-8">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Crédito discreto: vale para todas as matérias, já publicadas e futuras */}
          <aside className="mt-10 border-l-2 border-brand pl-3 text-xs leading-relaxed text-neutral-500">
            Publicado originalmente por <strong className="font-semibold">{a.source}</strong>
            {a.author ? `, por ${a.author}` : ""}, em {date}. Direitos reservados à fonte.{" "}
            <a
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand hover:underline"
            >
              Ver matéria original
            </a>
          </aside>
        </div>
      </article>
    </>
  );
}
