import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse, type Font } from "opentype.js";
import { getArticles, type Article } from "@/lib/feeds";

/** Texto do post do Instagram: manchete e linha de apoio da imagem, e legenda com prelúdio, resumo e chamada. */

const SENTENCE = /(?<=[.!?])\s+(?=[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ“"])/;
const endsClosed = (s: string) => /[.!?”"]$/.test(s.trim());
const sentences = (text: string) => text.split(SENTENCE).map((s) => s.trim()).filter(Boolean);

/** Fecha a frase: acrescenta ponto se faltar pontuação. */
const close = (s: string) => (endsClosed(s) ? s.trim() : `${s.trim()}.`);

/** Primeira frase do texto, só se couber em `max` caracteres: um pedaço de frase cortado confunde mais do que ajuda. */
function clip(text: string, max: number): string {
  const first = sentences(text)[0];
  return first && first.length <= max ? first : "";
}

/** Parágrafos úteis para o resumo: sem legenda de foto. */
const body = (a: Article) => a.paragraphs.filter((p) => !/^Foto:/i.test(p));

/**
 * Alguns feeds (G1) colam o subtítulo ao começo do parágrafo, sem ponto: "...no 2º turno O Tribunal...".
 * Quando o trecho inicial não termina em pontuação e logo vem um artigo em maiúscula, ele é o subtítulo e sai.
 */
const GLUED = /^([\s\S]{20,200}?[a-zà-ú0-9º)”"])\s+((?:O|A|Os|As|Um|Uma)\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\s\S]*)$/;
const unglue = (p: string) => {
  const m = GLUED.exec(p);
  return m && !/[.!?]/.test(m[1]) ? m[2] : p;
};

export type PostText = { head: string; sub: string; caption: string };

export function postText(a: Article): PostText {
  const t = a.title.trim();
  let head = t;
  let sub = "";

  // “Frase entre aspas”: resto da manchete  ->  aspas na manchete, resto na linha de apoio
  const q = /^(“[^”]+”)\s*[:,]\s*(.+)$/.exec(t);
  if (q) {
    head = q[1];
    sub = close(q[2].charAt(0).toUpperCase() + q[2].slice(1));
  } else if (t.includes(";")) {
    const [h, ...rest] = t.split(";");
    head = h.trim();
    const r = rest.join(";").trim();
    sub = close(r.charAt(0).toUpperCase() + r.slice(1));
  }
  if (!sub) sub = clip(unglue(body(a)[0] ?? a.summary), 100);
  // Evita repetir na linha de apoio o que a manchete já disse
  if (sub && sub.toLowerCase().startsWith(head.toLowerCase().slice(0, 25))) sub = "";

  const paras = body(a).map(unglue);
  let resumo = "";
  for (const s of paras.flatMap(sentences)) {
    if (resumo && (resumo + " " + s).length > 460) break;
    resumo = resumo ? `${resumo} ${s}` : s;
    if (resumo.length >= 300) break;
  }
  if (!resumo) resumo = a.summary;

  const caption = [
    close(t),
    close(resumo),
    "Leia a matéria completa no link da bio. Toque no link do perfil e acesse o AC News.",
    `Fonte: ${a.source}`,
  ].join("\n\n");

  return { head, sub, caption };
}

/** Peso para escolher o post: portais que cobriram o mesmo assunto, e o Acre sempre à frente do resto. */
const peso = (a: Article) => (a.rel ?? 0) * 2 + (a.category === "acre" ? 3 : 0);

/** Matérias que merecem post: recentes (24 h), com foto, as que mais portais cobriram primeiro. */
export async function postCandidates(limit = 8): Promise<Article[]> {
  const since = Date.now() - 24 * 3600_000;
  return (await getArticles())
    .filter((a) => a.image && +new Date(a.date) >= since)
    .sort((a, b) => peso(b) - peso(a) || +new Date(b.date) - +new Date(a.date))
    .slice(0, limit);
}

/* ---- Medida de texto (para quebrar a manchete em linhas que cabem) ---- */

const font = (() => {
  const b = readFileSync(join(process.cwd(), "assets/fonts/inter-900.woff"));
  return parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
})();

const advance = (s: string, size: number, tracking: number) =>
  [...s].reduce((w, ch) => w + (font.charToGlyph(ch).advanceWidth ?? 0) * (size / font.unitsPerEm) + tracking, 0);

export type Fit = { size: number; lines: string[]; gap: number };

/** Maior tamanho de fonte em que a manchete cabe em até `maxLines` linhas de `maxW` pixels. */
export function fitHeadline(text: string, maxW: number, maxLines: number, from = 104, to = 66): Fit {
  const words = text.split(/\s+/);
  const layout = (size: number, width = maxW): Fit => {
    const track = -size * 0.022;
    const gap = size * 0.3 + track;
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      const w2 = advance(next.replaceAll(" ", ""), size, track) + (next.split(" ").length - 1) * gap;
      if (w2 * 1.03 > width && line) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    lines.push(line);
    return { size, lines, gap };
  };
  // Evita a última linha com uma palavra só: estreita a coluna até as linhas ficarem equilibradas
  const balance = (f: Fit): Fit => {
    if (f.lines.length < 2 || f.lines[f.lines.length - 1].includes(" ")) return f;
    for (let w = maxW - 20; w > maxW * 0.55; w -= 20) {
      const t = layout(f.size, w);
      if (t.lines.length > f.lines.length) break;
      if (t.lines.length === f.lines.length && t.lines[t.lines.length - 1].includes(" ")) return t;
    }
    return f;
  };
  for (let size = from; size > to; size -= 2) {
    const f = layout(size);
    if (f.lines.length <= maxLines) return balance(f);
  }
  return balance(layout(to));
}

export function wrapSub(text: string, maxW: number, size = 40): string[] {
  const tracking = -size * 0.01;
  const lines: string[] = [];
  let line = "";
  const medium = subFont();
  const w = (s: string) => [...s].reduce((n, ch) => n + (medium.charToGlyph(ch).advanceWidth ?? 0) * (size / medium.unitsPerEm) + tracking, 0);
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (w(next) * 1.03 > maxW && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

let _sub: Font | undefined;
function subFont() {
  if (!_sub) {
    const b = readFileSync(join(process.cwd(), "assets/fonts/inter-500.woff"));
    _sub = parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
  }
  return _sub;
}
