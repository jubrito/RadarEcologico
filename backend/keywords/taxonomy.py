"""
Climate keyword taxonomy for Brazilian legislative bills.

Three tiers of signals:
  Tier 1 — Keywords: high-confidence terms indicating climate stance
  Tier 2 — Patterns: regex patterns that capture legislative intent
  Tier 3 — Valence verbs: verbs that flip a keyword's stance (negating/prohibiting)

All keywords in Portuguese (target language for Brazilian bills).
"""

POSITIVE_KEYWORDS: list[str] = [
    "energia renovável",
    "energia limpa",
    "energia solar",
    "energia eólica",
    "transição energética",
    "descarbonização",
    "neutralidade de carbono",
    "carbono zero",
    "redução de emissões",
    "mercado de carbono",
    "crédito de carbono",
    "mudanças climáticas",
    "emergência climática",
    "aquecimento global",
    "acordo de paris",
    "metas climáticas",
    "justiça climática",
    "desmatamento zero",
    "desmatamento ilegal",
    "reflorestamento",
    "recuperação florestal",
    "restauração ecológica",
    "preservação ambiental",
    "conservação da biodiversidade",
    "unidades de conservação",
    "reservas extrativistas",
    "proteção dos biomas",
    "educação ambiental",
    "fiscalização ambiental",
    "combate ao desmatamento",
    "povos indígenas",
    "comunidades tradicionais",
    "territórios indígenas",
    "saneamento sustentável",
    "reciclagem",
    "economia circular",
    "mobilidade sustentável",
    "transporte público limpo",
    "agricultura sustentável",
    "agroecologia",
    "agricultura regenerativa",
    "recursos hídricos",
    "gestão de bacias",
    "proteção de nascentes",
    "adaptação climática",
    "resiliência climática",
    "política nacional de mudanças do clima",
    "pagamento por serviços ambientais",
    "inventário de emissões",
    "sequestro de carbono",
    "mitigação climática",
    "transporte coletivo",
    "energia fotovoltaica",
    "biocombustíveis",
    "eficiência energética",
    "certificação ambiental",
    "manejo sustentável",
    "uso sustentável",
    "desenvolvimento sustentável",
]

NEGATIVE_KEYWORDS: list[str] = [
    "flexibiliza licenciamento",
    "dispensa licenciamento",
    "licenciamento autodeclaratório",
    "licença ambiental automática",
    "reduz área de preservação",
    "anistia desmatamento",
    "regularização fundiária em terra indígena",
    "regularização de ocupação em app",
    "exploração mineral em terra indígena",
    "mineração em terra indígena",
    "garimpo",
    "agrotóxicos",
    "pulverização aérea",
    "amplia exploração de petróleo",
    "subsídio a combustíveis fósseis",
    "carvão mineral",
    "termelétricas a carvão",
    "reduz competência de fiscalização",
    "enfraquece ibama",
    "enfraquece icmbio",
    "anistia multa ambiental",
    "extingue multa ambiental",
    "caça esportiva",
    "pesca predatória",
    "exploração madeireira",
    "supressão de vegetação nativa",
    "grilagem",
    "usurpação de terras públicas",
    "revoga código florestal",
    "altera código florestal",
    "exploração de petróleo na foz do amazonas",
    "mineração em áreas protegidas",
    "dispensa estudo de impacto",
    "dispensa eia rima",
    "liberação de agrotóxicos",
    "anistia a crimes ambientais",
    "regularização de terras griladas",
]


def positive_patterns() -> list[str]:
    return [
        r"(institui|cria|estabelece).*(política|programa|fundo|sistema).*clim[áa]tic",
        r"(institui|cria|estabelece).*(mercado|carbono|emissões).*(regulad|control|compens)",
        r"(proteção|preservação|conservação).*(bioma|amazônia|cerrado|caatinga|mata atlântica|pantanal|pampa)",
        r"(redução|diminuição|compensação).*(emissão|gases|efeito estufa|gee)",
        r"(proíbe|veda|restringe).*(desmatamento|queimada|garimpo).*(ilegal|irregular)",
        r"(destinação|alocação|vinculação).*(recurso|fundo|receita).*(ambiental|climático|preservação)",
        r"(amplia|aumenta|reforça).*(proteção|fiscalização|monitoramento).*ambiental",
        r"(cria|institui|estabelece).*(unidade|área|reserva|parque).*conservação",
        r"(destina|aloca|vincula).*(percentual|parcela|recursos).*(ambiental|clima|sustentável)",
        r"(reconhece|declara).*(emergência|estado).*clim[áa]tic",
    ]


def negative_patterns() -> list[str]:
    return [
        r"(altera|modifica).*(código florestal|lei.*licenciamento|política.*ambiental|constituição).*(flexibil|dispensa|reduz)",
        r"(dispensa|flexibiliza|simplifica|elimina).*(licenciamento|eia|rima|estudo.*impacto)",
        r"(reduz|diminui|extingue|enfraquece).*(fiscalização|multa|órgão.*ambiental|ibama|icmbio)",
        r"(anistia|perdão|extingue|cancela).*(multa|débito|dívida|sanção).*ambiental",
        r"regularização.*(fundiária|ocupacional|territorial).*(amazônia|indígena|quilombola|unidade.*conservação)",
        r"mineração.*(terra indígena|unidade.*conservação|área.*protegida|reserva)",
        r"(amplia|prorroga|estende|permite).*(exploração|garimpo|mineração|madeireira).*protegid",
        r"(revoga|extingue|derruba).*(código florestal|licenciamento|zoneamento|política.*ambiental)",
        r"(autoriza|permite).*(cultivo|criação).*(transgênico|organismo.*geneticamente).*indígena",
        r"(reduz|extingue|elimina).*(reserva legal|área.*preservação|app).*percentual",
    ]


# Verbs that flip a POSITIVE keyword into a negative signal
# (e.g. "revoga a política de combate ao desmatamento" is harmful).
NEGATING_VERBS: list[str] = [
    "revoga",
    "revogar",
    "revogação",
    "extingue",
    "extinguir",
    "extinção",
    "derruba",
    "derrubar",
    "elimina",
    "eliminar",
    "suspende",
    "suspender",
    "suspensão",
    "cancela",
    "cancelar",
    "anula",
    "anular",
    "isenta",
    "isentar",
    "dispensa",
    "dispensar",
    "flexibiliza",
    "flexibilizar",
    "enfraquece",
    "enfraquecer",
    "acaba com",
]

# Verbs that flip a NEGATIVE keyword into a positive signal
# (e.g. "proíbe a mineração em terra indígena" is beneficial).
PROHIBITING_VERBS: list[str] = [
    "proíbe",
    "proibir",
    "proibição",
    "veda",
    "vedar",
    "restringe",
    "restringir",
    "impede",
    "impedir",
    "combate",
    "combater",
    "pune",
    "punir",
    "criminaliza",
    "criminalizar",
    "coíbe",
    "coibir",
]


def ementa_matches_climate(ementa: str) -> bool:
    text = ementa.lower()
    for kw in POSITIVE_KEYWORDS + NEGATIVE_KEYWORDS:
        if kw in text:
            return True
    return False
