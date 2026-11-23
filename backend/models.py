from pydantic import BaseModel, Field
from typing import Optional, Dict, Literal
from datetime import datetime

CombustivelTipo = Literal[
    'gasolina_comum', 
    'gasolina_aditivada', 
    'etanol', 
    'diesel_s10', 
    'gnv'
]

BandeiraTipo = Literal['Petrobras', 'Shell', 'Ipiranga', 'Ale', 'Branca', 'Outras']
FontePreco = Literal['NFC-e (SEFAZ)', 'Colaborativo', 'ANP Oficial']

class PrecosPostoModel(BaseModel):
    gasolina_comum: Optional[float] = None
    gasolina_aditivada: Optional[float] = None
    etanol: Optional[float] = None
    diesel_s10: Optional[float] = None
    gnv: Optional[float] = None

class PostoResponse(BaseModel):
    id: str
    nome: str
    bandeira: BandeiraTipo
    endereco: str
    bairro: str
    cidade: str
    uf: str
    lat: float
    lng: float
    distancia_km: Optional[float] = None
    precos: PrecosPostoModel
    ultima_atualizacao: str
    fonte: FontePreco
    confiabilidade: int = Field(default=95, ge=0, le=100)
    confirmacoes: int = 1

class AtualizarPrecoRequest(BaseModel):
    combustivel: CombustivelTipo
    valor_litro: float = Field(..., gt=0)
    fonte: FontePreco = 'Colaborativo'
    usuario_id: Optional[str] = None

class ValidarNFCeRequest(BaseModel):
    url_ou_chave: str
