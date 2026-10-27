/**
 * Redes sociais do portal. Preencha o `href` de cada uma com o perfil oficial;
 * enquanto estiver vazio, o ícone aparece sem link.
 */
export const SOCIAL = [
  { name: "Instagram", href: "https://www.instagram.com/_acnews" },
  { name: "TikTok", href: "https://www.tiktok.com/@ac.newsbr" },
  { name: "YouTube", href: "https://youtube.com/@acnewsbr" },
] as const;

/** E-mail de contato do portal (rodapé). */
export const CONTACT_EMAIL = "acnewsjornalismo@gmail.com";

/*
 * Curadoria das matérias nacionais e internacionais. Os termos são comparados sem acento
 * e sem diferenciar maiúsculas, a partir do começo da palavra ("debocha" pega "debocham").
 */

/** PIN: termos no título que forçam a matéria a entrar (ex.: "Lula"). */
export const PIN: string[] = [];

/** EXCLUDE: termos no título ou no link que barram a matéria. */
export const EXCLUDE: string[] = [
  "mega-sena",
  "loteria",
  "quina",
  "lotofacil",
  "horoscopo",
  "previsao do tempo",
  "bbb",
  "novela",
  "vinicola",
  // fofoca de celebridade
  "fofoca",
  "noitada",
  "debocha",
  "polemica",
  "affair",
  "climao",
  "barraco",
  "traicao",
  "separacao",
  "namoro",
  "romance com",
  // esporte: dicas de jogo e fantasy, que não são notícia
  "palpite",
  "gato-mestre",
  "cartola",
];

/**
 * Espaços de publicidade da home. Para ativar um anúncio, preencha `image` (endereço https
 * da arte), `href` (destino) e `alt`. Sem anúncio (null), aparece a moldura vazia.
 *   meio:    faixa 970x250, entre as seções Acre e Política
 *   lateral: retângulo 300x250, na lateral do destaque, no lugar da última matéria
 *   materia: faixa 728x90, ao fim de cada matéria, depois do texto e antes da nota de referência
 */
export type Ad = { image: string; href: string; alt: string } | null;
export const ADS: Record<"meio" | "lateral" | "materia", Ad> = {
  meio: null,
  lateral: null,
  materia: null,
};
