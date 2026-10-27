/**
 * Redes sociais do portal. Preencha o `href` de cada uma com o perfil oficial;
 * enquanto estiver vazio, o ícone aparece sem link.
 */
export const SOCIAL = [
  { name: "Instagram", href: "" },
  { name: "Facebook", href: "" },
  { name: "X", href: "" },
  { name: "YouTube", href: "" },
  { name: "WhatsApp", href: "" },
] as const;

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
];

/**
 * Cultura: só entra matéria que mencione algum destes termos no título ou no resumo.
 * É o que deixa a fofoca de fora; acrescente termos para abrir o filtro.
 */
export const CULTURA_TERMOS: string[] = [
  "cinema", "filme", "documentario", "serie", "festival", "teatro", "espetaculo", "danca", "ballet",
  "musica", "album", "show", "turne", "orquestra", "concerto",
  "livro", "literat", "escritor", "poesia", "jabuti", "oscar", "grammy", "premio",
  "exposicao", "museu", "galeria", "artes", "patrimonio", "cultura",
];

/**
 * Espaços de publicidade da home. Para ativar um anúncio, preencha `image` (endereço https
 * da arte), `href` (destino) e `alt`. Sem anúncio (null), aparece a moldura vazia.
 *   meio:    faixa 970x250, entre as seções Acre e Política
 *   lateral: retângulo 300x250, na lateral do destaque, no lugar da última matéria
 */
export type Ad = { image: string; href: string; alt: string } | null;
export const ADS: Record<"meio" | "lateral", Ad> = {
  meio: null,
  lateral: null,
};
