import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { CATEGORIES, getArticles } from "@/lib/feeds";

export const revalidate = 600;

export default async function Home() {
  const all = await getArticles();
  const withImage = all.filter((a) => a.image);
  const hero = withImage[0] ?? all[0];
  const rest = all.filter((a) => a !== hero);
  // Destaques laterais: a mais recente de cada categoria, para não ficar tudo do mesmo assunto
  const sideTop = CATEGORIES.map((c) => rest.find((a) => a.category === c.slug))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);

  if (!hero) {
    return <p className="py-20 text-center text-neutral-500">Sem notícias no momento. Tente novamente em instantes.</p>;
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <ArticleCard a={hero} featured />
        </div>
        <div className="space-y-4 md:border-l md:pl-6 border-neutral-300 dark:border-neutral-800">
          {sideTop.map((a) => (
            <ArticleCard key={a.id} a={a} />
          ))}
        </div>
      </section>

      {CATEGORIES.map((c) => {
        const items = rest.filter((a) => a.category === c.slug && !sideTop.includes(a)).slice(0, 4);
        if (!items.length) return null;
        return (
          <section key={c.slug}>
            <div className="mb-4 flex items-baseline justify-between border-b-2 border-brand pb-1">
              <h2 className="font-serif text-xl font-black">{c.name}</h2>
              <Link href={`/c/${c.slug}`} className="text-sm text-brand hover:underline">
                Ver tudo
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {items.map((a) => (
                <ArticleCard key={a.id} a={a} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
