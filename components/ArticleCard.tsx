import Link from "next/link";
import { CATEGORIES, timeAgo, type Article } from "@/lib/feeds";

const catName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

export function ArticleCard({ a, featured = false }: { a: Article; featured?: boolean }) {
  return (
    <Link
      href={`/noticia/${a.id}`}
      className={`group flex gap-4 ${featured ? "flex-col" : "flex-row"}`}
    >
      {a.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={a.image}
          alt=""
          loading="lazy"
          className={`object-cover rounded bg-neutral-200 ${
            featured ? "w-full aspect-video" : "w-28 h-20 shrink-0"
          }`}
        />
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          {catName(a.category)}
        </p>
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
