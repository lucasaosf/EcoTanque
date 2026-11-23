import httpx
from typing import Dict, Any, List

ANP_DADOS_ABERTOS_URL = "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/serie-historica-de-precos-de-combustiveis"

MEDIAS_ESTADUAIS_BENCHMARK = {
    'SP': {'gasolina_comum': 5.59, 'etanol': 3.55, 'diesel_s10': 5.92, 'gnv': 4.69},
    'RJ': {'gasolina_comum': 5.79, 'etanol': 4.12, 'diesel_s10': 6.05, 'gnv': 4.59},
    'MG': {'gasolina_comum': 5.65, 'etanol': 3.72, 'diesel_s10': 5.95, 'gnv': 4.75},
    'PR': {'gasolina_comum': 5.72, 'etanol': 3.82, 'diesel_s10': 5.98, 'gnv': 4.89},
    'RS': {'gasolina_comum': 5.82, 'etanol': 4.35, 'diesel_s10': 6.09, 'gnv': 4.95},
    'DF': {'gasolina_comum': 5.62, 'etanol': 3.75, 'diesel_s10': 5.99, 'gnv': 4.89},
    'BA': {'gasolina_comum': 5.75, 'etanol': 4.15, 'diesel_s10': 6.02, 'gnv': 4.65},
    'GO': {'gasolina_comum': 5.48, 'etanol': 3.42, 'diesel_s10': 5.82, 'gnv': 4.69},
    'SC': {'gasolina_comum': 5.79, 'etanol': 4.19, 'diesel_s10': 5.99, 'gnv': 4.85},
    'PE': {'gasolina_comum': 5.69, 'etanol': 4.10, 'diesel_s10': 5.95, 'gnv': 4.59},
    'CE': {'gasolina_comum': 5.78, 'etanol': 4.25, 'diesel_s10': 6.05, 'gnv': 4.70},
}

def obter_benchmark_estado(uf: str) -> Dict[str, float]:
    """Retorna a média oficial de preços de combustíveis para o estado (UF)."""
    return MEDIAS_ESTADUAIS_BENCHMARK.get(uf.upper(), {
        'gasolina_comum': 5.69,
        'etanol': 3.79,
        'diesel_s10': 5.99,
        'gnv': 4.79
    })
