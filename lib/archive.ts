import { del, get, list, put } from "@vercel/blob";
import type { Article } from "@/lib/feeds";

/**
 * Arquivo próprio: uma matéria por arquivo em articles/<endereço>~<id>.json. Um arquivo por
 * matéria evita que atualizações simultâneas do site se atropelem, como ocorria com um arquivo só.
 */

/** Quanto tempo cada matéria fica guardada, contado a partir de quando entrou no arquivo. */
export const RETENTION_DAYS = 7;

const PREFIX = "articles/";
const enabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const expired = (uploadedAt: Date) => Date.now() - +uploadedAt >= RETENTION_DAYS * 86_400_000;

export type Stored = { slug: string; id: string; pathname: string; uploadedAt: Date };

/** Lista o que está guardado e ainda dentro do prazo. Sem armazenamento configurado ou com erro, devolve vazio. */
export async function listArchive(): Promise<Stored[]> {
  if (!enabled()) return [];
  try {
    const out: Stored[] = [];
    let cursor: string | undefined;
    do {
      const r = await list({ prefix: PREFIX, cursor, limit: 1000 });
      for (const b of r.blobs) {
        const m = /^articles\/(.+)~(.+)\.json$/.exec(b.pathname);
        if (m) out.push({ slug: m[1], id: m[2], pathname: b.pathname, uploadedAt: new Date(b.uploadedAt) });
      }
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    return out;
  } catch (e) {
    console.error("archive: listagem falhou", e);
    return [];
  }
}

/** Lê uma matéria guardada, pelo endereço curto ou pelo id (links antigos). */
export async function readArchived(key: string, stored: Stored[]): Promise<Article | undefined> {
  const hit = stored.find((s) => (s.slug === key || s.id === key) && !expired(s.uploadedAt));
  if (!hit) return undefined;
  try {
    const res = await get(hit.pathname, { access: "private" });
    if (!res || res.statusCode !== 200) return undefined;
    return JSON.parse(await new Response(res.stream).text()) as Article;
  } catch (e) {
    console.error("archive: leitura falhou", e);
    return undefined;
  }
}

/** Guarda as matérias novas (já com slug) e apaga as que passaram de 7 dias. */
export async function syncArchive(live: Article[], stored: Stored[]): Promise<void> {
  if (!enabled()) return;
  try {
    const have = new Set(stored.map((s) => s.id));
    const added = live.filter((a) => a.slug && !have.has(a.id));
    const old = stored.filter((s) => expired(s.uploadedAt));
    await Promise.all([
      ...added.map((a) =>
        put(`${PREFIX}${a.slug}~${a.id}.json`, JSON.stringify(a), {
          access: "private",
          contentType: "application/json",
          addRandomSuffix: false,
          allowOverwrite: true,
        }),
      ),
      old.length ? del(old.map((s) => s.pathname)) : Promise.resolve(),
    ]);
  } catch (e) {
    console.error("archive: gravação falhou", e);
  }
}
