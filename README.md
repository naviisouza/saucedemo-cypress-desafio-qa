# SauceDemo – Automação E2E com Cypress

Projeto de automação de testes E2E para o [SauceDemo (Swag Labs)](https://www.saucedemo.com/), desenvolvido com **Cypress + JavaScript**, **Page Object Model** e relatório **Mochawesome**.

> Desafio técnico: *Analista de QA*. O histórico de uso de IA está em [`PROMPTS.md`](./PROMPTS.md).

---

## 1. Pré-requisitos

| Ferramenta | Versão recomendada |
|------------|--------------------|
| Node.js    | 18 ou superior (LTS) |
| npm        | 9 ou superior (já vem com o Node) |
| Navegador  | Chrome, Edge ou Firefox (o Electron já vem com o Cypress) |

Verifique no terminal:

```bash
node -v
npm -v
```

## 2. Instalação

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd saucedemo-cypress-qa
npm install
```

## 3. Como executar

### Modo headless (terminal / CI)

```bash
npm test                 # roda todos os specs (Electron, headless)
npm run test:chrome      # headless no Chrome
npm run test:firefox     # headless no Firefox
npm run test:edge        # headless no Edge
npm run test:smoke       # apenas login + fluxo de compra
```

### Modo interativo (interface gráfica)

```bash
npm run cy:open          # abre o Test Runner do Cypress
npm run test:headed      # roda todos os testes com o navegador visível
```

### Qualidade de código

```bash
npm run lint             # ESLint (eslint:recommended + plugin:cypress/recommended)
npm run lint:fix         # corrige o que for possível automaticamente
npm run format           # Prettier
```

### Relatório Mochawesome

Ao final de qualquer execução via `cypress run`, o relatório é gerado em:

```
cypress/reports/relatorio-saucedemo.html
```

Abra o arquivo no navegador. Ele contém gráficos, duração de cada teste e **screenshots embutidos** dos testes que falharem. Vídeos ficam em `cypress/videos/` e screenshots em `cypress/screenshots/`. Cada execução substitui as evidências da anterior.

### Integração contínua

O workflow `.github/workflows/ci.yml` roda lint e a suíte no Chrome a cada push/PR e publica relatório, screenshots e vídeos como artefatos.

## 4. Variáveis de ambiente

Os valores padrão estão em `cypress.config.js` (chave `env`). Para sobrescrever:

```bash
# Linux/macOS
CYPRESS_PASSWORD=outra_senha npm test

# Windows (PowerShell)
$env:CYPRESS_PASSWORD="outra_senha"; npm test
```

Ou crie um `cypress.env.json` (ignorado pelo Git) a partir de `cypress.env.example.json`.

| Variável | Padrão | Uso |
|----------|--------|-----|
| `STANDARD_USER` | `standard_user` | Usuário válido |
| `LOCKED_USER` | `locked_out_user` | Usuário bloqueado |
| `PASSWORD` | `secret_sauce` | Senha dos usuários |
| `CYPRESS_BASE_URL` | `https://www.saucedemo.com` | URL da aplicação |

> As credenciais são as públicas da própria tela de login do SauceDemo (ambiente de demonstração), por isso não há segredo real versionado.

## 5. Arquitetura

```
cypress/
├── e2e/                    # Specs (*.cy.js), organizados por domínio
│   ├── auth/               #   login.cy.js, session.cy.js
│   ├── inventory/          #   sorting.cy.js, catalog.cy.js
│   ├── cart/               #   cart.cy.js
│   ├── checkout/           #   checkoutValidation.cy.js
│   └── purchase/           #   purchaseFlow.cy.js
├── fixtures/               # Dados estáticos (products.json, loginScenarios.json)
├── pages/                  # Page Objects
│   ├── BasePage.js         #   navegação e seletor data-test
│   ├── ProductListPage.js  #   base das telas com lista de produtos (itens, nomes, preços, remover)
│   ├── LoginPage.js, InventoryPage.js, CartPage.js, CheckoutPage.js
│   └── HeaderComponent.js  #   carrinho (badge) e menu/logout
├── support/
│   ├── commands.js         # Custom Commands: cy.getByTestId, cy.loginAs, cy.openInventoryAs, cy.startCheckoutWith
│   ├── hooks.js            # Hooks globais (beforeEach, tratamento de exceções)
│   └── e2e.js              # Ponto de entrada do suporte (reporter + commands + hooks)
├── utils/
│   ├── constants.js        # Rotas, mensagens, textos de UI, regras (imposto, tolerância)
│   ├── catalog.js          # Catálogo esperado (fonte única, vem de products.json)
│   ├── credentials.js      # Usuário/senha das variáveis de ambiente + tokens {{VAR}}
│   ├── dataFactory.js      # Test Data Factory (clientes para o checkout)
│   └── helpers.js          # Funções puras (preço, cálculo de total, ordenação, seletor)
├── reports/                # Relatório Mochawesome (gerado)
├── screenshots/            # Evidências de falha (geradas)
└── videos/                 # Vídeos das execuções (gerados)
```

### Decisões técnicas

- **Page Object Model com herança por afinidade**: Catálogo, Carrinho e Resumo do checkout compartilham o mesmo markup de lista, então herdam de `ProductListPage`. Métodos retornam `this` para encadeamento.
- **Seletores estáveis**: `data-test` (única exceção: `#react-burger-menu-btn`, que não possui `data-test`). Sem classes CSS nem XPath.
- **Testes independentes e rápidos**: `testIsolation` limpa o estado a cada teste; `cy.loginAs()` usa `cy.session` com `cacheAcrossSpecs`, então o login via UI acontece uma vez por execução. A tela de login é validada pela UI em `login.cy.js` e no E2E principal.
- **Asserções com retry**: leituras de lista e valores usam `.should(callback)`, nunca `.then()`, para evitar flakiness. Não há `cy.wait()` fixo.
- **Sem asserções "vazias"**: validações de ordenação exigem mais de um item.
- **Fixtures**: `products.json` é a fonte única do catálogo (importada por `utils/catalog.js`); `loginScenarios.json` é data-driven e referencia credenciais por token, sem duplicá-las.
- **Valores esperados independentes**: subtotal, imposto (8%) e total são calculados a partir da fixture, não lidos da tela.
- **Retries**: 1 tentativa extra apenas em `run`. Teste que passa só na segunda tentativa deve ser investigado.
- **Reporter**: `cypress-mochawesome-reporter` (baseado no Mochawesome) gera HTML único com screenshots embutidos.

Detalhes da revisão técnica: [`CODE_REVIEW.md`](./CODE_REVIEW.md).

## 6. Cenários cobertos

### Obrigatórios do desafio

| Requisito | Teste |
|-----------|-------|
| Login com sucesso | `CT-LOGIN-01` |
| Login inválido (`locked_out_user`) | `CT-LOGIN-02` |
| Fluxo de compra completo (E2E) | `CT-E2E-01` |
| Ordenação por preço (Low to High) | `CT-ORD-01` |

### Extras

| Tema | Testes |
|------|--------|
| Login: campos vazios, usuário vazio, senha vazia, senha inválida, usuário inexistente | `CT-LOGIN-03` a `CT-LOGIN-07` (data-driven) |
| Carrinho: adicionar, múltiplos, remover (catálogo e carrinho), contador, persistência | `CT-CARR-01` a `CT-CARR-06` |
| Checkout sem First Name / Last Name / Postal Code | `CT-CHK-01` a `CT-CHK-03` |
| Logout, persistência de sessão após refresh, acesso sem login | `CT-SESSAO-01` a `CT-SESSAO-03` |
| Validação de preços (catálogo, formato e resumo) | `CT-CAT-01` a `CT-CAT-03`, `CT-E2E-03` |
| Cálculo de subtotal, imposto (8%) e total | `CT-E2E-02` |
| Ordenação: High to Low, A–Z, Z–A, integridade da lista | `CT-ORD-02` a `CT-ORD-05` |

## 7. Observações e riscos conhecidos

- A aplicação é um demo público e pode ser alterada pelos mantenedores (textos, `data-test`). Mensagens e seletores estão centralizados em `constants.js` e nos Page Objects, o que limita o impacto de mudanças a um único ponto.
- Usuários como `problem_user`, `performance_glitch_user` e `error_user` têm bugs intencionais e **não** foram incluídos na suíte de regressão estável. Seriam candidatos a uma suíte de exploração separada.
- **Rotas diretas retornam 404**: o SauceDemo é uma SPA e responde HTTP 404 para `/inventory.html` aberto diretamente (a página carrega mesmo assim). Por isso `InventoryPage.visit()` usa `failOnStatusCode: false`. Navegações feitas pelos cliques da aplicação não são afetadas.
- O tempo de resposta do site pode variar; há timeouts ajustados em `cypress.config.js`.
- Cenários não automatizados: responsividade/mobile, acessibilidade e performance. Podem ser adicionados depois (por exemplo `cy.viewport`, `cypress-axe`).

## 8. Publicando no GitHub

> Após o primeiro `npm install`, versione também o `package-lock.json` (builds reproduzíveis).

```bash
git init
git add .
git commit -m "feat: automação E2E do SauceDemo com Cypress"
git branch -M main
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push -u origin main
```
