import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { Header } from "@/components/Header";
import { Photo } from "@/components/Photo";
import { ShareLinks } from "@/components/ShareLinks";
import { getArticle } from "@/lib/feeds";

export const revalidate = 600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticle((await params).id);
  return a ? { title: a.title, description: a.summary } : {};
}

export default async function ArticlePage({ params }: Props) {
  const a = await getArticle((await params).id);
  if (!a) notFound();

  const date = new Date(a.date).toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
  const paragraphs = a.paragraphs.length ? a.paragraphs : a.summary ? [a.summary] : [];

  return (
    <>
      <Header active={a.category} />

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
                <Photo src={a.image!} className="h-full w-full" eager />
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

          <ShareLinks title={a.title} />

          <div className="mt-8 space-y-5 text-xl leading-8">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-10">
            <AdSlot slot="materia" />
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
