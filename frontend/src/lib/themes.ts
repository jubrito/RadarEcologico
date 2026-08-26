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
