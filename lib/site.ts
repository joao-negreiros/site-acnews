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

/**
 * Curadoria manual das matérias nacionais e internacionais.
 * PIN: trechos de título que forçam a matéria a entrar (ex.: "Lula").
 * EXCLUDE: trechos de título ou link que barram a matéria (ex.: "horóscopo").
 */
export const PIN: string[] = [];
export const EXCLUDE: string[] = [
  "mega-sena",
  "loteria",
  "quina",
  "lotofácil",
  "horóscopo",
  "previsão do tempo",
  "bbb",
  "novela",
  "vinícola",
];
