import { createHmac, timingSafeEqual } from "node:crypto";
import { del, get, list, put } from "@vercel/blob";
import { sameTopic, type Article } from "@/lib/feeds";
import { postCandidates, postText } from "@/lib/post";

/**
 * Postagem automática no Instagram do portal, pela API oficial da Meta.
 * Variáveis na Vercel: CRON_SECRET (senha do agendador e assinatura das imagens), IG_USER_ID e IG_ACCESS_TOKEN.
 */

const GRAPH = "https://graph.facebook.com/v23.0";
const SITE = process.env.SITE_URL ?? "https://www.acnewsnet.com.br";
const TZ = "America/Rio_Branco";

/** Horários (de Rio Branco) a partir dos quais cada um dos 5 posts do dia pode sair. */
export const SLOTS = [7, 10, 13, 16, 19];
const POSTED = "instagram/posted/";

export const configurado = () => !!(process.env.CRON_SECRET && process.env.IG_USER_ID && process.env.IG_ACCESS_TOKEN);

/* ---- Assinatura: só quem tem a senha gera um endereço de imagem válido ---- */

export const assinar = (id: string) =>
  createHmac("sha256", process.env.CRON_SECRET ?? "").update(`imagem:${id}`).digest("hex").slice(0, 24);

export function assinaturaOk(id: string, sig: string): boolean {
  if (!process.env.CRON_SECRET) return false;
  const a = Buffer.from(assinar(id));
  const b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const imageUrl = (a: Article) => `${SITE}/api/instagram/imagem/${a.slug ?? a.id}?s=${assinar(a.slug ?? a.id)}`;

/* ---- Registro do que já foi postado (um arquivo por post, no Blob privado) ---- */

type Posted = { id: string; title: string; mediaId: string; at: string };

const dayKey = (d: Date) => new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(d);
const hourOf = (d: Date) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(d)) % 24;

async function readPosted(): Promise<Posted[]> {
  const out: Posted[] = [];
  const old: string[] = [];
  let cursor: string | undefined;
  do {
    const r = await list({ prefix: POSTED, cursor, limit: 1000 });
    for (const b of r.blobs) {
      if (Date.now() - +new Date(b.uploadedAt) > 3 * 86_400_000) {
        old.push(b.pathname); // registros com mais de 3 dias já não servem: a matéria saiu do feed
        continue;
      }
      const res = await get(b.pathname, { access: "private" });
      if (res && res.statusCode === 200) out.push(JSON.parse(await new Response(res.stream).text()) as Posted);
    }
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  if (old.length) await del(old).catch(() => {});
  return out;
}

/* ---- Escolha da matéria ---- */

export type Plano =
  | { ok: false; motivo: string }
  | { ok: true; article: Article; caption: string; image: string; feitosHoje: number };

/** Decide se é hora de postar e qual matéria vai. Nada é publicado aqui. */
export async function planejar(now = new Date(), horaForcada?: number): Promise<Plano> {
  const posted = await readPosted();
  const hoje = posted.filter((p) => dayKey(new Date(p.at)) === dayKey(now));
  const liberados = SLOTS.filter((h) => h <= (horaForcada ?? hourOf(now))).length;
  if (hoje.length >= liberados) {
    return { ok: false, motivo: `nada a postar agora: ${hoje.length} post(s) hoje, ${liberados} liberado(s) até esta hora` };
  }

  const candidatos = await postCandidates(30);
  const article = candidatos.find(
    (a) => !posted.some((p) => p.id === a.id || sameTopic(p.title, a.title)),
  );
  if (!article) return { ok: false, motivo: "nenhuma matéria nova e relevante com foto" };

  return { ok: true, article, caption: postText(article).caption, image: imageUrl(article), feitosHoje: hoje.length };
}

/* ---- Publicação ---- */

async function graph(path: string, params: Record<string, string>, method: "POST" | "GET" = "POST") {
  const token = process.env.IG_ACCESS_TOKEN!;
  const url = `${GRAPH}${path}`;
  const res =
    method === "GET"
      ? await fetch(`${url}?${new URLSearchParams({ ...params, access_token: token })}`)
      : await fetch(url, { method, body: new URLSearchParams({ ...params, access_token: token }) });
  const json = (await res.json()) as Record<string, any>;
  if (!res.ok || json.error) throw new Error(`Meta ${res.status}: ${json.error?.message ?? JSON.stringify(json)}`);
  return json;
}

/** Publica a foto com a legenda e registra a matéria como postada. Devolve o id da publicação. */
export async function publicar(plano: Extract<Plano, { ok: true }>): Promise<string> {
  const uid = process.env.IG_USER_ID!;
  const container = await graph(`/${uid}/media`, { image_url: plano.image, caption: plano.caption });

  // A Meta baixa a imagem e prepara a publicação; espera ficar pronta
  for (let i = 0; i < 15; i++) {
    const st = await graph(`/${container.id}`, { fields: "status_code" }, "GET");
    if (st.status_code === "FINISHED") break;
    if (st.status_code === "ERROR" || st.status_code === "EXPIRED") throw new Error(`Meta: contêiner ${st.status_code}`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  const pub = await graph(`/${uid}/media_publish`, { creation_id: container.id });
  const rec: Posted = { id: plano.article.id, title: plano.article.title, mediaId: pub.id, at: new Date().toISOString() };
  await put(`${POSTED}${plano.article.id}.json`, JSON.stringify(rec), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return pub.id as string;
}
