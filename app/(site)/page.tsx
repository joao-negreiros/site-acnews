import { Fragment } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { ArticleCard } from "@/components/ArticleCard";
import { CATEGORIES, getArticles } from "@/lib/feeds";

export const revalidate = 600;

export default async function Home() {
  const all = await getArticles();
  const acre = all.filter((a) => a.category === "acre");

  // O Acre manda na home: destaque e lateral saem dele; sem Acre, cai para o que houver
  const lead = acre.length ? acre : all;
  const hero = lead.find((a) => a.image) ?? lead[0];
  // 4 matérias na lateral; o 5º lugar é o espaço de publicidade
  const side = lead.filter((a) => a !== hero).slice(0, 4);
  const shown = new Set([hero, ...side]);

  if (!hero) {
    return <p className="py-20 text-center text-neutral-500">Sem notícias no momento. Tente novamente em instantes.</p>;
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <ArticleCard a={hero} featured />
        </div>
        <div className="space-y-4 md:border-l md:pl-6 border-neutral-300">
          {side.map((a) => (
            <ArticleCard key={a.id} a={a} />
          ))}
          <AdSlot slot="lateral" />
        </div>
      </section>

      {CATEGORIES.map((c) => {
        const items = all
          .filter((a) => a.category === c.slug && !shown.has(a))
          .slice(0, c.slug === "acre" ? 8 : 4);
        if (!items.length) return null;
        return (
          <Fragment key={c.slug}>
            <section>
              <div className="mb-5 flex items-baseline justify-between border-b-2 border-brand pb-2">
                <h2 className="font-serif text-3xl font-black md:text-4xl">{c.name}</h2>
                <Link href={`/c/${c.slug}`} className="text-sm text-brand hover:underline">
                  Ver tudo
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {items.map((a) => (
                  <ArticleCard key={a.id} a={a} showCategory={false} />
                ))}
              </div>
            </section>
            {c.slug === "acre" && <AdSlot slot="meio" />}
          </Fragment>
        );
      })}
    </div>
  );
}
