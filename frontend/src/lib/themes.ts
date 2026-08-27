export const THEME_MAP: Record<string, string> = {
  "40": "Economia",
  "41": "Cidades e Desenvolvimento Urbano",
  "44": "Direitos Humanos",
  "48": "Meio Ambiente e Desenvolvimento Sustentável",
  "51": "Estrutura Fundiária",
  "54": "Energia, Recursos Hídricos e Minerais",
  "55": "Relações Internacionais e Comércio Exterior",
  "56": "Saúde",
  "61": "Viação, Transporte e Mobilidade",
  "62": "Ciência, Tecnologia e Inovação",
  "64": "Agricultura, Pecuária, Pesca e Extrativismo",
  "66": "Indústria, Comércio e Serviços",
  "70": "Finanças Públicas e Orçamento",
  "76": "Direito e Justiça",
  povos_indigenas: "Povos Indígenas e Comunidades Tradicionais",
};

/** Short climate-relevant description for each theme (displayed on the /temas page). */
export const THEME_DESCRIPTIONS: Record<string, string> = {
  "40": "Instrumentos econômicos para a descarbonização: precificação de carbono, subsídios verdes e incentivos à transição produtiva.",
  "41": "Planejamento urbano, saneamento e resiliência das cidades frente aos eventos climáticos extremos.",
  "44": "Direitos afetados pela crise climática e proteção de populações vulneráveis.",
  "48": "Proteção da biodiversidade, combate ao desmatamento e políticas de clima.",
  "51": "Regularização fundiária, reforma agrária e disputas pelo uso da terra.",
  "54": "Transição energética, gestão da água e exploração mineral.",
  "55": "Tratados, acordos climáticos e cooperação internacional.",
  "56": "Impactos da crise climática na saúde pública e vigilância sanitária.",
  "61": "Transporte e mobilidade — entre as maiores fontes de emissões.",
  "62": "Pesquisa e tecnologias limpas para a mitigação e a adaptação.",
  "64": "Agropecuária, pesca e extrativismo — desmatamento e uso da terra.",
  "66": "Emissões industriais e padrões de produção sustentáveis.",
  "70": "Orçamento público e financiamento de ações climáticas.",
  "76": "Legislação ambiental, crimes contra o meio ambiente e justiça.",
  povos_indigenas:
    "Territórios indígenas e tradicionais — centrais para a conservação das florestas.",
};

/** References to the source taxonomies (Câmara codTema / Senado class tree). */
export const CAMARA_TEMA_REFERENCE_URL =
  "https://dadosabertos.camara.leg.br/api/v2/referencias/proposicoes/codTema";
export const SENADO_CLASSES_URL =
  "https://legis.senado.leg.br/dadosabertos/processo/classes";

/**
 * Map a comma-separated list of theme codes (e.g. "48,54") to display names.
 * Unknown/empty codes are dropped.
 */
export function themeNamesFromIds(
  themeIds: string | null | undefined,
): string[] {
  if (!themeIds) return [];
  return themeIds
    .split(",")
    .map((id) => id.trim())
    .map((id) => THEME_MAP[id])
    .filter((name): name is string => Boolean(name));
}
