# 🚀 Guia Prático: Como Publicar o EcoTanque na Google Play Store

Este guia contém o passo a passo exato para quando você criar sua conta de desenvolvedor no **Google Play Console**. Todos os arquivos técnicos já foram preparados e gerados pelo sistema.

---

## 📦 1. Os Arquivos Prontos para a Publicação

No seu repositório do GitHub (na aba [Releases](https://github.com/lucasaosf/EcoTanque/releases)), você tem sempre os 2 arquivos gerados automaticamente:

1. **`EcoTanque-Combustivel-Brasil.apk`**:
   * O aplicativo instalável direto no celular (para você e amigos testarem sem precisar da Play Store).
2. **`EcoTanque-GooglePlay-Production.aab`**:
   * O pacote oficial exigido pela Google Play (**Android App Bundle**), já assinado com chave criptográfica e otimizado para a loja.

---

## 🔑 2. Criando sua Conta de Desenvolvedor

1. Acesse o site oficial: [play.google.com/console](https://play.google.com/console).
2. Faça login com sua conta Google.
3. Pague a taxa única de registro de **US$ 25** (taxa vitalícia, cobrada uma única vez via cartão de crédito internacional).
4. Preencha seus dados de desenvolvedor (Nome público que aparecerá na loja, e-mail de contato e telefone).

---

## 📲 3. Criando o Aplicativo no Painel

1. No painel do Google Play Console, clique no botão azul **Criar app**.
2. Preencha os campos iniciais:
   * **Nome do App:** `EcoTanque - Combustível Ao Vivo`
   * **Idioma padrão:** Português (Brasil) - pt-BR
   * **Tipo de app:** Aplicativo
   * **Gratuito ou pago:** Gratuito
3. Aceite as declarações e clique em **Criar app**.

---

## 📋 4. Configuração das Políticas Obrigatórias da Google

No menu lateral esquerdo, vá em **Conteúdo do app**:

1. **Política de Privacidade:**
   * Cole o link: `https://raw.githubusercontent.com/lucasaosf/EcoTanque/main/docs/index.html` (ou o link do arquivo `PRIVACY_POLICY.md` no seu GitHub).
2. **Acesso a apps:**
   * Selecione *"Todas as funcionalidades estão disponíveis sem restrições"*.
3. **Anúncios:**
   * Selecione *"Sim, meu app contém anúncios"* (pois temos o banner AdMob na versão Free).
4. **Classificação de conteúdo:**
   * Responda ao questionário rápido (é um utilitário/mapa; receberá classificação **Livre**).
5. **Público-alvo:**
   * Selecione idades a partir de **18 anos** (motoristas).
6. **Permissão de Localização:**
   * Marque que o aplicativo usa localização **em primeiro plano** (enquanto o usuário está usando o app para encontrar postos).

---

## 🚀 5. Fazendo o Upload do Pacote AAB

1. No menu lateral, clique em **Produção** (em *Versões do app*).
2. Clique em **Criar nova versão**.
3. No campo de upload, envie o arquivo:
   * **`EcoTanque-GooglePlay-Production.aab`**
4. O Google Play validará a assinatura e o tamanho do pacote automaticamente.
5. Em **Notas da versão**, escreva:
   * `Lançamento inicial do EcoTanque: encontre os combustíveis mais baratos em tempo real, traçado de rotas veiculares e modo satélite.`
6. Clique em **Salvar** e depois em **Revisar versão**.
7. Clique em **Iniciar lançamento para produção**!

---

## ⏳ 6. Tempo de Aprovação

* O Google leva geralmente de **2 a 5 dias úteis** para revisar o primeiro app de uma conta nova.
* Assim que aprovado, o **EcoTanque** estará disponível na busca da Google Play Store para qualquer pessoa no Brasil baixar!
