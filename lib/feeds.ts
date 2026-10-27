import { createHash } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import { readArchive, syncArchive } from "@/lib/archive";
import { EXCLUDE, PIN } from "@/lib/site";

export type Category = { slug: string; name: string };

/** Ordem do menu. O Acre é o foco do portal; as demais editorias são nacionais/internacionais. */
export const CATEGORIES: Category[] = [
  { slug: "acre", name: "Acre" },
  { slug: "politica", name: "Política" },
  { slug: "esporte", name: "Esporte" },
  { slug: "brasil", name: "Brasil" },
  { slug: "mundo", name: "Mundo" },
  { slug: "economia", name: "Economia" },
];

/** category "auto": a editoria sai do caminho do link (ver cnnCategory). */
type Source = { name: string; url: string; category: string; excerptOnly?: boolean };

export const SOURCES: Source[] = [
  // Acre: todas as matérias entram
  { name: "ac24horas", url: "https://ac24horas.com/feed/", category: "acre" },
  // excerptOnly: o feed traz só um trecho de ~200 caracteres, então a fonte fica de fora.
  // Quando a Contilnet liberar um feed com texto completo, é só remover a marca.
  { name: "Contilnet Notícias", url: "https://contilnetnoticias.com.br/feed/", category: "acre", excerptOnly: true },
  { name: "Integração", url: "https://integracaonet.com/feed/", category: "acre" },
  { name: "G1 Acre", url: "https://g1.globo.com/rss/g1/ac/", category: "acre" },
  // Nacional e internacional: só as mais relevantes (ver selectRelevant)
  { name: "CNN Brasil", url: "https://www.cnnbrasil.com.br/feed/", category: "auto" },
  { name: "G1", url: "https://g1.globo.com/rss/g1/politica/", category: "politica" },
  { name: "G1", url: "https://g1.globo.com/rss/g1/", category: "brasil" },
  { name: "G1", url: "https://g1.globo.com/rss/g1/mundo/", category: "mundo" },
  { name: "G1", url: "https://g1.globo.com/rss/g1/economia/", category: "economia" },
  { name: "Agência Brasil", url: "https://agenciabrasil.ebc.com.br/rss/esportes/feed.xml", category: "esporte" },
  { name: "ac24horas", url: "https://ac24horas.com/category/esporte/feed/", category: "esporte" },
  { name: "Agência Brasil", url: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml", category: "brasil" },
];

/** Quantas matérias nacionais/internacionais cada editoria mostra, e a janela de tempo considerada. */
const CAP: Record<string, number> = { politica: 4, esporte: 4, brasil: 5, mundo: 3, economia: 3 };
const WINDOW_HOURS = 36;
/** Tamanho mínimo do texto (caracteres) para a matéria ser considerada completa. */
const MIN_BODY = 300;

const CNN_SECTIONS: Record<string, string> = {
  internacional: "mundo",
  economia: "economia",
  politica: "politica",
  eleicoes: "politica",
  nacional: "brasil",
  esportes: "esporte",
};

/** Editoria da CNN pelo primeiro trecho do caminho; o que não está no mapa (pop, saúde...) fica de fora. */
const cnnCategory = (link: string): string | undefined => CNN_SECTIONS[link.split("/")[3]];

/** Itens de pouco valor do G1 (telejornal em vídeo, previsão do tempo, aulão). */
const LOW_VALUE = /^(V[ÍI]DEOS?:|Previs[ãa]o do tempo|Aul[ãa]o)/i;

export type Article = {
  id: string;
  title: string;
  link: string;
  summary: string;
  image?: string;
  video?: string;
  author?: string;
  /** Parágrafos em texto puro, extraídos do que o próprio feed entrega */
  paragraphs: string[];
  /** true quando o feed traz a matéria inteira; false quando só traz uma chamada */
  fullText: boolean;
  source: string;
  category: string;
  date: string;
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const arr = <T,>(v: T | T[] | undefined): T[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

const text = (v: unknown): string =>
  typeof v === "string" ? v : v && typeof v === "object" && "#text" in v ? String((v as Record<string, unknown>)["#text"]) : "";

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

/** Chamados de rede social e "leia também" que vêm misturados ao texto dos feeds. */
const NOISE =
  /^(O post .* apareceu primeiro|Leia (mais|também)|Veja (também|mais|os vídeos)|Participe d[oa]|Clique aqui|Siga (o|a|nosso|nossa)|Receba (as )?notícias|Assine|Acesse o canal)/i;

/** Último recurso para texto sem nenhuma quebra: agrupa 2 a 3 frases por parágrafo. */
function chunkSentences(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ"“(])/);
  const out: string[] = [];
  let cur = "";
  let n = 0;
  for (const s of sentences) {
    cur = cur ? `${cur} ${s}` : s;
    n++;
    if (cur.length >= 300 || n >= 3) {
      out.push(cur);
      cur = "";
      n = 0;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function toParagraphs(html: string): string[] {
  const text = decode(
    html
      .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, "")
      .replace(/<\/(p|div|li|h[1-6]|blockquote)>|<br\s*\/?>/gi, "\n\n")
      .replace(/<[^>]*>/g, ""),
  );
  // Feeds como o do G1 separam parágrafos por uma quebra simples, sem marcas HTML
  let parts = text.split(/\n{2,}/);
  if (parts.length <= 1) parts = text.split(/\n+/);
  parts = parts.map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p && !NOISE.test(p));
  // Parágrafo gigante (texto corrido sem quebras): quebra por frases
  return parts
    .flatMap((p) => (p.length > 800 ? chunkSentences(p) : [p]))
    // Bloco enorme sem nenhuma frase = lista ou menu que perdeu a formatação (ex.: locais de votação)
    .filter((p) => p.length <= 800 || /[.!?]\s/.test(p));
}

const stripHtml = (s: string) =>
  s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/** Só endereços https; descarta logotipos/SVG (não são foto) e pede a versão grande das miniaturas da CNN. */
function safeImage(url?: string): string | undefined {
  if (!url || !/^https:\/\//i.test(url) || /\.svg(\?|$)|logo/i.test(url)) return undefined;
  return url.replace(/(admin\.cnnbrasil\.com\.br\/[^?]*)\?w=\d+$/, "$1");
}

function findImage(item: Record<string, any>, html: string): string | undefined {
  const media = arr(item["media:content"])[0] ?? arr(item["media:thumbnail"])[0];
  if (media?.["@_url"]) return safeImage(media["@_url"]);
  if (item.enclosure?.["@_url"] && String(item.enclosure["@_type"] ?? "").startsWith("image")) {
    return safeImage(item.enclosure["@_url"]);
  }
  return safeImage(html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]);
}

/** Primeiro vídeo MP4 hospedado em arquivo (nada de iframes ou players de terceiros). */
function findVideo(html: string): string | undefined {
  const url = html.match(/<(?:video|source)[^>]+src=["']([^"']+\.mp4[^"']*)["']/i)?.[1];
  return url && /^https:\/\//i.test(url) ? url : undefined;
}

const makeId = (link: string) => createHash("sha1").update(link).digest("base64url").slice(0, 12);

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
    const articles = items.slice(0, 40).map((item) => {
      const rawDesc = text(item.description) || text(item["content:encoded"]);
      const body = text(item["content:encoded"]) || rawDesc;
      const link = text(item.link).trim();
      const title = stripHtml(decode(text(item.title)));
      // O G1 repete o título como primeira linha do texto
      const paragraphs = toParagraphs(body).filter((p) => norm(p) !== norm(title));
      return {
        id: makeId(link),
        author: text(item["dc:creator"]) || undefined,
        paragraphs,
        fullText: paragraphs.join(" ").length > 700,
        title,
        link,
        summary: decode(stripHtml(rawDesc)).slice(0, 220),
        image: findImage(item, rawDesc + body),
        video: findVideo(body),
        source: src.name,
        category: src.category === "auto" ? (cnnCategory(link) ?? "") : src.category,
        date: new Date(text(item.pubDate) || Date.now()).toISOString(),
      };
    });
    return articles.filter((a) => a.category && !LOW_VALUE.test(a.title));
  } catch (e) {
    console.error(`feed ${src.name} (${src.url}) falhou:`, e);
    return [];
  }
}

/** Regra do portal: nenhum emoji em texto exibido. Mantém ©, ® e ™. */
const noEmoji = (s: string) =>
  s
    .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}‍️⃣]/gu, (c) =>
      "©®™".includes(c) ? c : "",
    )
    .replace(/\s{2,}/g, " ")
    .trim();

const clean = (a: Article): Article => ({
  ...a,
  title: noEmoji(a.title),
  summary: noEmoji(a.summary),
  author: a.author && noEmoji(a.author),
  paragraphs: a.paragraphs.map(noEmoji).filter(Boolean),
});

const STOP = new Set(
  "para como mais pela pelo pelos pelas sobre entre apos ante desde contra dizem diz sera foi sao tem teve esta este essa esse mesmo ainda depois antes quando onde cada todo toda todos todas".split(
    " ",
  ),
);

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** O termo aparece a partir do começo de uma palavra ("debocha" pega "debocham", mas "quina" não pega "máquina"). */
const hasTerm = (text: string, term: string) =>
  new RegExp(`(^|[^a-z0-9])${norm(term).replace(/\W/g, (c) => "\\" + c)}`).test(text);

const tokens = (title: string) =>
  new Set(
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 4 && !STOP.has(w)),
  );

/** Duas manchetes tratam do mesmo assunto quando dividem boa parte das palavras-chave. */
function similar(a: Set<string>, b: Set<string>, min: number) {
  if (!a.size || !b.size) return false;
  let common = 0;
  for (const w of a) if (b.has(w)) common++;
  return common / Math.min(a.size, b.size) >= min;
}

/** Mantém uma só matéria por assunto: a primeira de `ordered`. */
function dedupe(ordered: Article[], min = 0.6): Article[] {
  const kept: { a: Article; t: Set<string> }[] = [];
  for (const a of ordered) {
    const t = tokens(a.title);
    if (!kept.some((k) => similar(k.t, t, min))) kept.push({ a, t });
  }
  return kept.map((k) => k.a);
}

const byDate = (a: Article, b: Article) => +new Date(b.date) - +new Date(a.date);

/**
 * Nacional/internacional: só o que é muito relevante e recente. A relevância vem de quantos
 * portais diferentes noticiaram o mesmo assunto, somada a um pequeno bônus de recência.
 * Cada editoria tem um limite fixo (CAP). PIN força a entrada de um assunto; EXCLUDE o barra.
 */
function selectRelevant(pool: Article[]): Article[] {
  const since = Date.now() - WINDOW_HOURS * 3600_000;
  const recent = pool
    .filter((a) => +new Date(a.date) >= since)
    .filter((a) => !EXCLUDE.some((k) => hasTerm(norm(`${a.title} ${a.link}`), k)));
  const tk = new Map(recent.map((a) => [a, tokens(a.title)]));

  const score = (a: Article) => {
    const others = new Set(
      recent.filter((o) => o.source !== a.source && similar(tk.get(a)!, tk.get(o)!, 0.5)).map((o) => o.source),
    );
    const age = (Date.now() - +new Date(a.date)) / (WINDOW_HOURS * 3600_000);
    const pinned = PIN.some((k) => hasTerm(norm(a.title), k)) ? 100 : 0;
    return pinned + others.size * 2 + (1 - age);
  };

  const scored = new Map(recent.map((a) => [a, score(a)]));
  // Um assunto entra uma vez só no portal, na editoria da versão mais bem pontuada
  const unique = dedupe(
    [...recent].sort((a, b) => scored.get(b)! - scored.get(a)! || byDate(a, b)),
    0.5,
  );
  return Object.keys(CAP).flatMap((cat) => unique.filter((a) => a.category === cat).slice(0, CAP[cat]));
}

/** Só entra matéria com texto completo: corpo de tamanho razoável e que não termine cortado (reticências). */
function isComplete(a: Article): boolean {
  const body = a.paragraphs.join(" ").trim();
  return body.length >= MIN_BODY && !/(\.\.\.|…|\[…\]|\[\.\.\.\])\s*$/.test(body);
}

export async function fetchLive(): Promise<Article[]> {
  const all = (await Promise.all(SOURCES.filter((s) => !s.excerptOnly).map(fetchSource))).flat();
  const seen = new Set<string>();
  const unique = all.filter((a) => a.title && a.link && !seen.has(a.link) && seen.add(a.link) && isComplete(a));

  // Acre: tudo entra; quando vários portais dão o mesmo assunto, fica a versão com mais texto
  const acre = dedupe(
    unique
      .filter((a) => a.category === "acre")
      .sort((a, b) => b.paragraphs.join("").length - a.paragraphs.join("").length),
  );
  const national = selectRelevant(unique.filter((a) => a.category !== "acre"));
  return [...acre, ...national].sort(byDate);
}

export async function getArticles(category?: string): Promise<Article[]> {
  const all = (await fetchLive()).map(clean);
  await syncArchive(all);
  return category ? all.filter((a) => a.category === category) : all;
}

export function timeAgo(iso: string): string {
  const min = Math.max(1, Math.round((Date.now() - +new Date(iso)) / 60000));
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} d`;
}

export async function getArticle(id: string): Promise<Article | undefined> {
  // Vale por 7 dias: se já saiu do feed da fonte, vem do arquivo próprio
  return (await getArticles()).find((a) => a.id === id) ?? (await readArchive()).find((a) => a.id === id && CATEGORIES.some((c) => c.slug === a.category));
}
