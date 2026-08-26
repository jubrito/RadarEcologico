"""
Climate keyword taxonomy for Brazilian legislative bills.

Signal tiers:
  Tier 1 — Fighting keywords: genuine action that reduces emissions or protects
           ecosystems (renewables, restoration, protection, just transition).
  Tier 2 — Market keywords: green-economy/market mechanisms prone to greenwashing
           (carbon credits, green hydrogen, "low-carbon" labels) — weak positive,
           i.e. "not making it worse, but not solving the problem".
  Tier 3 — Negative keywords: terms that intensify the climate crisis.
  Tier 4 — Patterns: regex patterns that capture legislative intent.
  Tier 5 — Valence verbs: negating/prohibiting verbs that flip a signal's stance.

All keywords in Portuguese (target language for Brazilian bills).
"""

# Tier 1 — genuine climate action (strong positive).
FIGHTING_KEYWORDS: list[str] = [
    "energia renovável",
    "energia limpa",
    "energia solar",
    "energia eólica",
    "energia fotovoltaica",
    "transição energética",
    "transição climática",
    "transição justa",
    "descarbonização",
    "eficiência energética",
    "redução de emissões",
    "mudanças climáticas",
    "emergência climática",
    "aquecimento global",
    "acordo de paris",
    "metas climáticas",
    "justiça climática",
    "mitigação climática",
    "adaptação climática",
    "resiliência climática",
    "política nacional de mudanças do clima",
    "desmatamento zero",
    "desmatamento ilegal",
    "combate ao desmatamento",
    "reflorestamento",
    "recuperação florestal",
    "restauração ecológica",
    "preservação ambiental",
    "conservação da biodiversidade",
    "unidades de conservação",
    "reservas extrativistas",
    "proteção dos biomas",
    "proteção de nascentes",
    "educação ambiental",
    "fiscalização ambiental",
    "povos indígenas",
    "comunidades tradicionais",
    "territórios indígenas",
    "terras indígenas",
    "comunidades indígenas",
    "povos tradicionais",
    "quilombola",
    "ribeirinho",
    "demarcação de terras indígenas",
    "saneamento sustentável",
    "reciclagem",
    "economia circular",
    "mobilidade sustentável",
    "transporte público limpo",
    "transporte coletivo",
    "agricultura sustentável",
    "agroecologia",
    "agricultura regenerativa",
    "recursos hídricos",
    "gestão de bacias",
    "pagamento por serviços ambientais",
    "cidades resilientes",
    "infraestrutura verde",
]

# Tier 2 — market mechanisms / greenwashing-prone labels (weak positive).
MARKET_KEYWORDS: list[str] = [
    "mercado de carbono",
    "crédito de carbono",
    "neutralidade de carbono",
    "carbono zero",
    "compensação de emissões",
    "inventário de emissões",
    "sequestro de carbono",
    "hidrogênio verde",
    "hidrogênio de baixo carbono",
    "economia de baixo carbono",
    "economia verde",
    "empregos verdes",
    "agricultura de baixo carbono",
    "financiamento climático",
    "finanças sustentáveis",
    "biocombustíveis",
    "certificação ambiental",
    "manejo sustentável",
    "uso sustentável",
    "desenvolvimento sustentável",
]

# Combined positive list, used only for recall (the pre-filter).
POSITIVE_KEYWORDS: list[str] = FIGHTING_KEYWORDS + MARKET_KEYWORDS

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


# Broad terms that mark a bill as about indigenous/traditional peoples. Used by
# ``is_comunidade_tradicional`` to tag bills with the "povos_indigenas" theme and to let
# such bills through the climate pre-filter, regardless of the other keywords.
COMUNIDADES_TRADICIONAIS_KEYWORDS: tuple[str, ...] = (
    "indígena",
    "índio",
    "índios",
    "quilombola",
    "quilombo",
    "ribeirinho",
    "ribeirinha",
    "ribeirinhos",
    "ribeirinhas",
    "seringueiro",
    "povos tradicionais",
    "comunidades tradicionais",
    "povos originários",
    "populações tradicionais",
    "terras indígenas",
    "povos indígenas"
)


def is_comunidade_tradicional(ementa: str) -> bool:
    """True when the ementa mentions indigenous/traditional communities."""
    text = ementa.lower()
    return any(kw in text for kw in COMUNIDADES_TRADICIONAIS_KEYWORDS)


# Neutral climate topics: high-precision terms that make a bill climate-relevant
# regardless of whether it fights or intensifies the crisis. Used only by
# ``ementa_matches_climate`` to widen the pre-filter's recall (not for scoring).
CLIMATE_SIGNAL_KEYWORDS: tuple[str, ...] = (
    "combustíveis fósseis",
    "combustível fóssil",
    "petróleo",
    "gás natural",
    "carvão",
    "fraturamento hidráulico",
    "fracking",
    "gasoduto",
    "termelétrica",
    "efeito estufa",
    "gases de efeito estufa",
    "grandes fortunas",
    # Climate impacts (neutral: adaptation or emergency bills)
    "desastres naturais",
    "eventos climáticos extremos",
    "eventos extremos",
    "seca",
    "estiagem",
    "escassez hídrica",
    "enchentes",
    "inundações",
    "alagamentos",
    "ondas de calor",
    "elevação do nível do mar",
    "nível do mar",
    "acidificação dos oceanos",
    "ecossistemas",
    "mudança do clima",
)


def ementa_matches_climate(ementa: str) -> bool:
    text = ementa.lower()
    for kw in POSITIVE_KEYWORDS + NEGATIVE_KEYWORDS + list(CLIMATE_SIGNAL_KEYWORDS):
        if kw in text:
            return True
    return is_comunidade_tradicional(text)
