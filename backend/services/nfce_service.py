import re
from typing import Dict, Any, Optional

UFS_CODIGO = {
    '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
    '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL',
    '28': 'SE', '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP', '41': 'PR',
    '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
}

def decodificar_chave_nfce(chave_ou_url: str) -> Optional[Dict[str, Any]]:
    """
    Decodifica a chave de acesso de 44 dígitos da NFC-e (Nota Fiscal de Consumidor Eletrônica)
    padrão ENCAT / Receita Federal do Brasil.
    
    Formato da chave:
    cUF (2) + AAMM (4) + CNPJ (14) + Mod (2) + Serie (3) + nNF (9) + tpEmis (1) + cNF (8) + cDV (1) = 44 dígitos
    """
    match = re.search(r'\d{44}', chave_ou_url)
    if not match:
        return None
    
    chave = match.group(0)
    c_uf = chave[0:2]
    aamm = chave[2:6]
    cnpj = chave[6:20]
    modelo = chave[20:22]
    serie = chave[22:25]
    nnf = chave[25:34]
    
    uf = UFS_CODIGO.get(c_uf, 'BR')
    ano = f"20{aamm[0:2]}"
    mes = aamm[2:4]
    
    cnpj_formatado = f"{cnpj[0:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:14]}"
    
    return {
        "chave_acesso": chave,
        "uf": uf,
        "codigo_uf": c_uf,
        "mes_ano_emissao": f"{mes}/{ano}",
        "cnpj_emitente": cnpj_formatado,
        "modelo": modelo,
        "is_nfce": modelo == "65",
        "serie": int(serie),
        "numero_nota": int(nnf)
    }
