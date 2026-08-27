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
  "40": "Políticas econômicas e instrumentos de mercado para a transição climática, do financiamento verde à precificação de carbono.",
  "41": "Planejamento urbano, habitação e saneamento que tornam as cidades mais resilientes e menos poluentes.",
  "44": "Direitos e populações afetados pela crise climática, da justiça climática à proteção de comunidades vulneráveis.",
  "48": "Biodiversidade, florestas e políticas de clima, do combate ao desmatamento à conservação dos biomas.",
  "51": "Propriedade e uso da terra: reforma agrária, regularização fundiária e disputas que impactam o desmatamento.",
  "54": "Energia, água e mineração: da transição energética e das renováveis à gestão hídrica.",
  "55": "Acordos, tratados e cooperação internacional, incluindo os compromissos climáticos.",
  "56": "Saúde pública e clima: epidemias, saneamento, qualidade do ar e vigilância sanitária.",
  "61": "Transporte, mobilidade e emissões: do transporte coletivo à mobilidade sustentável.",
  "62": "Pesquisa, tecnologia e inovação: das tecnologias limpas à ciência do clima.",
  "64": "Produção de alimentos e extrativismo: agropecuária, pesca e uso da terra, no centro do desmatamento.",
  "66": "Indústria, comércio e serviços: emissões industriais, produção sustentável e consumo.",
  "70": "Orçamento e finanças públicas: destinação de recursos e financiamento de políticas climáticas.",
  "76": "Direito e justiça: legislação ambiental, crimes contra o meio ambiente e responsabilização.",
  povos_indigenas:
    "Povos indígenas e comunidades tradicionais — territórios e modos de vida centrais para a conservação das florestas.",
};

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

/** Theme entries `[id, name]` sorted alphabetically by name. */
export function sortedThemeEntries(): [string, string][] {
  return Object.entries(THEME_MAP).sort((a, b) =>
    a[1].localeCompare(b[1], "pt-BR"),
  );
}
