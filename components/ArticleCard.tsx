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
      className={`group flex gap-4 ${featured ? "flex-col" : "flex-row"}`}
    >
      {a.image &&
        (featured ? (
          // Destaque: foto inteira na moldura 16:9, sem cortar
          <Photo src={a.image} className="aspect-video w-full" eager />
        ) : (
          // Miniatura: recorte pequeno, ancorado no alto para preservar rostos
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={a.image}
            alt=""
            loading="lazy"
            className="h-20 w-28 shrink-0 rounded bg-neutral-200 object-cover object-top"
          />
        ))}
      <div className="min-w-0">
        {showCategory && (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            {catName(a.category)}
          </p>
        )}
        <h3
          className={`font-serif font-bold leading-snug group-hover:underline ${
            featured ? "text-2xl md:text-3xl mt-1" : "text-base"
          }`}
        >
          {a.title}
        </h3>
        {featured && a.summary && (
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">{a.summary}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          {timeAgo(a.date)}
        </p>
      </div>
    </Link>
  );
}
