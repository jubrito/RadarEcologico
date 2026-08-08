export type TramitacaoPhase =
  | "apresentacao"
  | "comissao"
  | "plenario"
  | "sancao";

interface StatusInfo {
  phase: TramitacaoPhase;
  explanation: string;
}

export const STATUS_EXPLANATIONS: Record<string, StatusInfo> = {
  "Aguardando Despacho do Presidente da Câmara dos Deputados (Chancela)": {
    phase: "apresentacao",
    explanation:
      "O projeto foi protocolado e aguarda o despacho do Presidente da Câmara, " +
      "que irá encaminhá-lo para as comissões responsáveis pela análise.",
  },
  "Aguardando Designação de Relator(a)": {
    phase: "comissao",
    explanation:
      "O projeto está em uma comissão da Câmara. Um relator será designado para " +
      "analisar o texto e emitir um parecer recomendando aprovação ou rejeição.",
  },
  "Aguardando Parecer": {
    phase: "comissao",
    explanation:
      "O relator designado está analisando o projeto e preparando seu parecer. " +
      "O projeto só avança para votação após a conclusão dessa análise.",
  },
  "Pronta para Pauta": {
    phase: "plenario",
    explanation:
      "O projeto já passou pelas comissões e está pronto para ser incluído na " +
      "ordem do dia para votação em plenário.",
  },
  "Aguardando Deliberação": {
    phase: "plenario",
    explanation:
      "O projeto aguarda deliberação (votação) no plenário da Câmara dos Deputados.",
  },
  "Tramitando em Conjunto": {
    phase: "comissao",
    explanation:
      "Este projeto está tramitando junto com outro projeto de lei relacionado. " +
      "Eles serão analisados e votados em conjunto.",
  },
  "Em tramitação": {
    phase: "comissao",
    explanation:
      "O projeto está em tramitação no Senado Federal, passando pelas comissões " +
      "responsáveis pela análise do texto.",
  },
  "Tramitação encerrada — Retirada pelo autor": {
    phase: "apresentacao",
    explanation:
      "O autor do projeto solicitou a retirada da proposta. A tramitação foi " +
      "encerrada e o projeto não seguirá adiante.",
  },
};

/**
 * Gets interpretation of the bill status
 * @param status – bill status returned by the gov endpoints
 * @returns explanation of this status
 */
export function getStatusInfo(
  status: string | null | undefined,
): StatusInfo | null {
  if (!status) return null;
  // Try exact match first, then fall back to partial match
  if (STATUS_EXPLANATIONS[status]) return STATUS_EXPLANATIONS[status];
  for (const [key, info] of Object.entries(STATUS_EXPLANATIONS)) {
    if (status.includes(key) || key.includes(status)) return info;
  }
  return null;
}
