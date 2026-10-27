import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sameTopic } from "@/lib/feeds";
import { postCandidates, postText } from "@/lib/post";
import { renderPostJpeg } from "@/lib/postImage";

/**
 * Gera, no próprio computador, os posts do Instagram: uma imagem 4:5 (JPG) e a legenda (TXT) por matéria.
 * Tudo é salvo em posts-instagram/<data>/. Não publica nada em lugar nenhum: a postagem é manual.
 *
 *   npm run posts        gera 1 post (a melhor matéria que ainda não virou post)
 *   npm run posts -- 5   gera 5 de uma vez
 */

const PASTA = join(process.cwd(), "posts-instagram");
const ESTADO = join(PASTA, "estado.json");

type Feito = { id: string; title: string; at: string };

const lerEstado = (): Feito[] => {
  try {
    const todos = JSON.parse(readFileSync(ESTADO, "utf8")) as Feito[];
    return todos.filter((f) => Date.now() - +new Date(f.at) < 3 * 86_400_000); // matérias de 3 dias atrás já saíram do feed
  } catch {
    return [];
  }
};

const dois = (n: number) => String(n).padStart(2, "0");

async function main() {
  const quantos = Math.max(1, Number(process.argv[2]) || 1);
  mkdirSync(PASTA, { recursive: true });
  const feitos = lerEstado();

  const candidatos = await postCandidates(40);
  const novos = [];
  for (const a of candidatos) {
    // Pula o que já virou post e assuntos parecidos com o que já foi gerado
    const repetido = [...feitos, ...novos].some((f) => f.id === a.id || sameTopic(f.title, a.title));
    if (!repetido) novos.push({ id: a.id, title: a.title, at: new Date().toISOString(), a });
    if (novos.length >= quantos) break;
  }

  if (!novos.length) {
    console.log("Nenhuma matéria nova e relevante com foto agora.");
    return;
  }

  const agora = new Date();
  const dia = `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`;
  const hora = `${dois(agora.getHours())}${dois(agora.getMinutes())}`;
  const dir = join(PASTA, dia);
  mkdirSync(dir, { recursive: true });

  for (const n of novos) {
    const base = `${hora}-${n.a.slug ?? n.id}`;
    try {
      const jpg = await renderPostJpeg(n.a);
      writeFileSync(join(dir, `${base}.jpg`), jpg);
      writeFileSync(join(dir, `${base}.txt`), postText(n.a).caption + "\n", "utf8");
      feitos.push({ id: n.id, title: n.title, at: n.at });
      console.log(`Gerado: ${dia}/${base}.jpg  (${n.a.title})`);
    } catch (e) {
      console.error(`Falhou em "${n.title}":`, e instanceof Error ? e.message : e);
    }
  }

  writeFileSync(ESTADO, JSON.stringify(feitos, null, 2), "utf8");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
