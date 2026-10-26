import { XMLParser } from "fast-xml-parser";

export type Category = { slug: string; name: string };

export const CATEGORIES: Category[] = [
  { slug: "brasil", name: "Brasil" },
  { slug: "mundo", name: "Mundo" },
  { slug: "economia", name: "Economia" },
  { slug: "tecnologia", name: "Tecnologia" },
  { slug: "esportes", name: "Esportes" },
  { slug: "cultura", name: "Cultura" },
];

type Source = { name: string; url: string; category: string };

export const SOURCES: Source[] = [
  { name: "G1", url: "https://g1.globo.com/rss/g1/", category: "brasil" },
  { name: "G1", url: "https://g1.globo.com/rss/g1/mundo/", category: "mundo" },
  { name: "G1", url: "https://g1.globo.com/rss/g1/economia/", category: "economia" },
  { name: "G1", url: "https://g1.globo.com/rss/g1/tecnologia/", category: "tecnologia" },
  { name: "ge", url: "https://ge.globo.com/rss/ge/", category: "esportes" },
  { name: "G1", url: "https://g1.globo.com/rss/g1/pop-arte/", category: "cultura" },
  { name: "Agência Brasil", url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", category: "brasil" },
  { name: "Tecnoblog", url: "https://tecnoblog.net/feed/", category: "tecnologia" },
];

export type Article = {
  id: string;
  title: string;
  link: string;
  summary: string;
  image?: string;
  source: string;
  category: string;
  date: string;
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const arr = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

const text = (v: unknown): string =>
  typeof v === "string" ? v : v && typeof v === "object" && "#text" in v ? String((v as Record<string, unknown>)["#text"]) : "";

const stripHtml = (s: string) =>
  s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

function findImage(item: Record<string, any>, html: string): string | undefined {
  const media = arr(item["media:content"])[0] ?? arr(item["media:thumbnail"])[0];
  if (media?.["@_url"]) return media["@_url"];
  if (item.enclosure?.["@_url"] && String(item.enclosure["@_type"] ?? "").startsWith("image")) {
    return item.enclosure["@_url"];
  }
  return html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
}

async function fetchSource(src: Source): Promise<Article[]> {
  try {
    const res = await fetch(src.url, {
      next: { revalidate: 600 },
      headers: { "User-Agent": "PortalNoticias/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = parser.parse(await res.text());
    const items = arr<Record<string, any>>(xml?.rss?.channel?.item);
    return items.slice(0, 15).map((item) => {
      const rawDesc = text(item.description) || text(item["content:encoded"]);
      const link = text(item.link);
      return {
        id: `${src.category}:${link}`,
        title: stripHtml(text(item.title)),
        link,
        summary: stripHtml(rawDesc).slice(0, 220),
        image: findImage(item, rawDesc),
        source: src.name,
        category: src.category,
        date: new Date(text(item.pubDate) || Date.now()).toISOString(),
      };
    });
  } catch {
    return [];
  }
}

export async function getArticles(category?: string): Promise<Article[]> {
  const sources = category ? SOURCES.filter((s) => s.category === category) : SOURCES;
  const all = (await Promise.all(sources.map(fetchSource))).flat();
  const seen = new Set<string>();
  return all
    .filter((a) => a.title && a.link && !seen.has(a.link) && seen.add(a.link))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function timeAgo(iso: string): string {
  const min = Math.max(1, Math.round((Date.now() - +new Date(iso)) / 60000));
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} d`;
}
