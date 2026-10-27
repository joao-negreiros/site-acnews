import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { CATEGORIES, getArticles } from "@/lib/feeds";

export const revalidate = 600;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const articles = await getArticles(slug);

  return (
    <>
      <h1 className="mb-6 border-b-2 border-brand pb-2 font-serif text-4xl font-black md:text-5xl">{cat.name}</h1>
      {articles.length ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((a) => (
            <ArticleCard key={a.id} a={a} showCategory={false} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500">Sem notícias nesta categoria no momento.</p>
      )}
    </>
  );
}
