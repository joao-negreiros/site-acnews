/** Palavras de ligação que não entram no endereço da matéria. */
const SKIP = new Set(
  "a o as os e de da do das dos em na no nas nos um uma uns umas para por com que se ao aos".split(" "),
);

/** Quantas palavras da manchete formam o endereço. */
const WORDS = 5;

/** Endereço curto da matéria: as primeiras palavras da manchete, sem acento e sem palavras de ligação. */
export function makeSlug(title: string): string {
  const words = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w && !SKIP.has(w));
  return words.slice(0, WORDS).join("-") || "materia";
}
