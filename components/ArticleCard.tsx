import Link from "next/link";
import { Photo } from "@/components/Photo";
import { CATEGORIES, timeAgo, type Article } from "@/lib/feeds";

const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

/** `showCategory={false}` dentro de uma editoria, onde o rótulo repetiria o título da seção. */
export function ArticleCard({
  a,
  featured = false,
  showCategory = true,
}: {
  a: Article;
  featured?: boolean;
  showCategory?: boolean;
}) {
  return (
    <Link
      href={`/noticia/${a.id}`}
      className={`group flex ${featured ? "flex-col gap-4" : "flex-row items-stretch gap-3"}`}
    >
      {a.image &&
        (featured ? (
          // Destaque: foto inteira na moldura 16:9, sem cortar
          <Photo src={a.image} className="aspect-video w-full" eager />
        ) : (
          // Miniatura: estica até a altura do texto (imagem e texto ocupam o mesmo tamanho);
          // recorte ancorado no alto para preservar rostos
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.image}
            alt=""
            loading="lazy"
            className="min-h-20 w-28 shrink-0 self-stretch rounded bg-neutral-200 object-cover object-top"
          />
        ))}
      <div className={`min-w-0 ${featured ? "" : "flex flex-col justify-between"}`}>
        {showCategory && (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            {catName(a.category)}
          </p>
        )}
        <h3
          className={`font-serif font-bold group-hover:underline ${
            featured ? "mt-1 text-2xl leading-snug md:text-3xl" : "text-base leading-tight"
          }`}
        >
          {a.title}
        </h3>
        {featured && a.summary && (
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">{a.summary}</p>
        )}
        <p className={`text-xs text-neutral-500 ${featured ? "mt-1" : "mt-2"}`}>{timeAgo(a.date)}</p>
      </div>
    </Link>
  );
}
