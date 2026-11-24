# ⛽ EcoTanque - Preço de Combustíveis Mais Baratos ao Vivo no Brasil

<div align="center">

[![Baixar APK Android](https://img.shields.io/badge/📲_BAIXAR_APK_ANDROID-Clique_Aqui_para_Download-10b981?style=for-the-badge&logo=android&logoColor=white)](https://github.com/lucasaosf/EcoTanque/releases/latest/download/EcoTanque-Combustivel-Brasil.apk)
[![Versão](https://img.shields.io/badge/Versão-1.0.0-blue?style=for-the-badge)](https://github.com/lucasaosf/EcoTanque/releases)
[![Status Build](https://img.shields.io/badge/Build-Automatizada-emerald?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/lucasaosf/EcoTanque/actions)

<br/>

**Aplicativo nativo para encontrar combustíveis mais baratos em tempo real por localização, com traçado de rotas por ruas, cálculo de tempo estimado (ETA) e validação fiscal de NFC-e (SEFAZ).**

</div>

---

## 📲 Download e Instalação no Celular

Você pode baixar e instalar o aplicativo diretamente em qualquer smartphone Android:

### 👉 [**CLIQUE AQUI PARA BAIXAR O APK (EcoTanque-Combustivel-Brasil.apk)**](https://github.com/lucasaosf/EcoTanque/releases/latest/download/EcoTanque-Combustivel-Brasil.apk)

> *(Ou acesse a aba [**Releases**](https://github.com/lucasaosf/EcoTanque/releases) para escolher outras versões).*

#### 🛠️ Como Instalar no Android em 3 Passos:
1. Clique no botão de download acima direto pelo navegador do celular.
2. Ao concluir o download, toque na notificação para abrir o arquivo `.apk`.
3. Se o Android pedir autorização, ative a opção **"Permitir desta fonte"** e toque em **Instalar**.
4. Abra o app: ele funciona diretamente em redes móveis (4G/5G) ou em qualquer Wi-Fi!

---

## ✨ Recursos do Aplicativo

* **🗺️ Navegação com Traçado de Rotas:** Traça a rota veicular real por ruas e avenidas até o posto escolhido.
* **⏱️ Tempo Estimado (ETA):** Calcula a distância real em km e a previsão de chegada em minutos (ex: `11 min • 4.8 km`).
* **📡 Acompanhamento Contínuo (GPS em Tempo Real):** Atualiza a posição do usuário enquanto ele dirige e recalcula o trajeto dinamicamente.
* **🏷️ Ranking de Menores Preços:** Marcadores coloridos por faixa de preço (Verde = mais barato, Amarelo = médio, Vermelho = alto).
* **🌿 Calculadora Flex Inteligente:** Informa se compensa abastecer com Etanol ou Gasolina com base na paridade e no rendimento do carro.
* **🧾 Validação de NFC-e (SEFAZ):** Integração com notas fiscais eletrônicas de 44 dígitos para confirmação verídica de preços na bomba.
* **🛡️ Blindagem de Segurança:** Sem tráfego em texto claro (`usesCleartextTraffic="false"`), ofuscação Proguard/R8 contra engenharia reversa e Content Security Policy (CSP).

---

## 🏗️ Arquitetura do Projeto

```
EcoTanque/
├── .github/workflows/
│   └── build-apk.yml     # Compilação e publicação automática do APK no GitHub
├── frontend/
│   ├── android/          # Projeto nativo Android (Capacitor + Proguard + Manifest)
│   ├── src/
│   │   ├── components/   # Mapa (Leaflet), Lista, Painel de Navegação, Calculadora Flex
│   │   ├── services/     # Roteamento viário OSRM, GPS contínuo e Overpass API
│   │   └── types.ts      # Tipagens TypeScript
│   └── capacitor.config.ts
├── backend/              # API REST em Python (FastAPI + Decodificador Fiscal NFC-e)
├── database/             # Schema geoespacial PostgreSQL com extensão PostGIS
└── docker-compose.yml    # Orquestração com banco de dados PostGIS
```

---

## 🚀 Como Subir Atualizações para o Repositório

Para atualizar o código e gerar uma nova versão do APK automaticamente:

```bash
git add .
git commit -m "feat: melhorias no app"
git push origin main
```

A automação do GitHub compilará o novo instalador e atualizará o link de download automaticamente!

---

## 📄 Licença
Distribuído sob a licença MIT. Desenvolvido para motoristas de todo o Brasil.
