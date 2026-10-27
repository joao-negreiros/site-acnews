import { get, put } from "@vercel/blob";
import type { Article } from "@/lib/feeds";
import { makeSlug } from "@/lib/slug";

/** Quanto tempo cada matéria fica guardada, contado a partir da data de publicação. */
export const RETENTION_DAYS = 7;

const PATH = "archive.json";
const enabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const fresh = (a: Article) => Date.now() - +new Date(a.date) < RETENTION_DAYS * 86_400_000;

/** Matérias guardadas ainda dentro do prazo. Sem armazenamento configurado ou com erro, devolve vazio. */
export async function readArchive(): Promise<Article[]> {
  if (!enabled()) return [];
  try {
    const res = await get(PATH, { access: "private" });
    if (!res || res.statusCode !== 200) return [];
    const list = JSON.parse(await new Response(res.stream).text()) as Article[];
    // matérias guardadas antes do endereço curto não têm slug: ganham um na leitura
    return list.filter(fresh).map((a) => ({ ...a, slug: a.slug ?? makeSlug(a.title) }));
  } catch (e) {
    console.error("archive: leitura falhou", e);
    return [];
  }
}

/**
 * Guarda as matérias novas e apaga as que passaram de 7 dias. Só regrava o arquivo quando
 * algo mudou (matéria nova ou vencida), para não gravar a cada atualização do site.
 */
export async function syncArchive(live: Article[]): Promise<void> {
  if (!enabled()) return;
  try {
    const res = await get(PATH, { access: "private" });
    const stored: Article[] =
      res && res.statusCode === 200 ? JSON.parse(await new Response(res.stream).text()) : [];
    const keep = stored.filter(fresh);
    const have = new Set(keep.map((a) => a.id));
    const added = live.filter((a) => fresh(a) && !have.has(a.id));
    if (!added.length && keep.length === stored.length) return;

    const merged = [...added, ...keep].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    await put(PATH, JSON.stringify(merged), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (e) {
    console.error("archive: gravação falhou", e);
  }
}
