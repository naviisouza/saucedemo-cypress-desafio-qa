# Revisão técnica (Tech Lead de QA)

Revisão da versão 1.0 da suíte, correções aplicadas na versão 1.1 e ajustes pós-execução na 1.1.1.
Severidade: 🔴 pode gerar falso positivo/negativo ou quebrar a execução · 🟡 risco de manutenção/flakiness · 🟢 melhoria.

## 1. Bugs na automação

| # | Sev. | Achado | Correção |
|---|------|--------|----------|
| B1 | 🔴 | `cy.visit('/inventory.html')` falhava: o servidor do SauceDemo responde HTTP 404 na rota direta (a SPA carrega mesmo assim). Quebrava todos os testes pós-login. | `InventoryPage.visit()` usa `failOnStatusCode: false` (corrigido na v1.0.1). |
| B2 | 🔴 | Asserções de ordenação passavam "no vazio": `Array.every` retorna `true` para lista vazia. | Exige `length > 1` antes de validar a ordem. |
| B3 | 🔴 | Credenciais (`standard_user`/`secret_sauce`) duplicadas em `loginScenarios.json`: mudar a variável de ambiente quebraria os cenários negativos. | Fixture usa tokens `{{STANDARD_USER}}`/`{{PASSWORD}}`, resolvidos por `resolveEnvTokens()`. |
| B4 | 🟡 | Teste de ordenação A–Z partia da ordem padrão (já A–Z): passaria mesmo sem a ordenação funcionar. | O teste primeiro ordena Z–A e depois A–Z. |
| B5 | 🟡 | Validação de URL com `include` era frouxa (`'/'` casa com qualquer URL). | `assertPath()` compara `pathname` exato. |
| B6 | 🟡 | IDs de teste duplicados (`CT-LOGIN-NEG` ×5), prejudicando rastreabilidade no relatório. | IDs únicos `CT-LOGIN-03` a `CT-LOGIN-07`, definidos na fixture. |
| B7 | 🟡 | Validação do carrinho/resumo checava contagem e `contains` separadamente (aceitava substring e não garantia o conjunto exato). | `assertProducts()` compara o conjunto exato de nomes, ignorando a ordem. |
| B8 | 🟢 | Handler `uncaught:exception` retornava booleano de forma ambígua. | `if (ruído conhecido) return false;`. |

## 2. Flakiness

| # | Achado | Correção |
|---|--------|----------|
| F1 | Leituras com `.then()` (preços, nomes, resumo) **não têm retry**: podiam ler o DOM antes da re-renderização pós-ordenação. | Todas as asserções de lista/valor usam `.should(callback)`, que o Cypress repete até passar. |
| F2 | Resumo do pedido comparava valores derivados da própria tela (circular). | `assertOrderSummary()` compara com valores calculados da fixture, com tolerância centralizada (`CURRENCY_TOLERANCE`). |
| F3 | `afterEach` global enfileirava `cy.url()` após falha, adicionando comandos no teardown. | Removido; screenshot e vídeo já cobrem o diagnóstico. |
| F4 | Dados aleatórios do checkout sem registro, dificultando reproduzir falhas. | `fillInformation()` registra os dados usados no log do Cypress. |
| F5 | Retries podem mascarar instabilidade. | Mantidos apenas em `runMode` e documentados como sinal a investigar. |

## 3. Código duplicado

| # | Achado | Correção |
|---|--------|----------|
| D1 | Seletor `[data-test=...]` montado em dois lugares (command e `BasePage`). | `testIdSelector()` em `helpers.js` é a fonte única; `BasePage` usa `cy.getByTestId`. |
| D2 | `cy.loginAs()` + `visit()` + `assertLoaded()` repetidos em ~20 `beforeEach`. | Novo command `cy.openInventoryAs()`. |
| D3 | `cy.fixture()` + `before()` repetido em 4 specs. | `utils/catalog.js` importa `products.json` uma vez (`catalog`, `pickProducts`, `namesOf`, `pricesOf`). |
| D4 | Lista de produtos (itens, nomes, preços, remover) reimplementada em Inventory, Cart e Checkout. | Nova base `ProductListPage`, herdada pelas três páginas. |
| D5 | Verificação de preço por produto copiada em dois specs. | `assertPriceOf()` na base. |
| D6 | Mensagens de erro repetidas na fixture e em `MESSAGES`. | Fixture referencia a chave (`expectedMessage`). |

## 4. Más práticas

| # | Achado | Correção |
|---|--------|----------|
| M1 | Strings mágicas: nome do cookie, títulos de tela, rótulos de botão, tolerância, regex de preço. | `SESSION_COOKIE`, `PAGE_TITLES`, `BUTTON_LABELS`, `CURRENCY_TOLERANCE`, `PRICE_FORMAT` em `constants.js`. |
| M2 | Wrappers sem valor: `cy.addProductsToCart` e `takeFirst`. | Removidos (uso direto de `addMultipleToCart` e `slice` via `pickProducts`). |
| M3 | Método `continue()` (palavra reservada) e `removeFromCart` vs `removeProduct` com nomes divergentes. | `continueToOverview()` e `removeProduct()` único. |
| M4 | Código sem uso (`getProductNames`, `getSummaryValues`, `CATALOG_SIZE`, `assertProductCount`...). | Removido; verificação automática de exports e métodos sem uso. |
| M5 | Scripts redundantes: `cy:run`, `test:regression` (= `test`) e `report:clean` com `node -e` frágil no Windows. | Removidos: `trashAssetsBeforeRuns` e `overwrite: true` já limpam as evidências. |
| M6 | `CYPRESS_BASE_URL` lido manualmente via `process.env`. | O Cypress já lê `CYPRESS_*` nativamente. |
| M7 | 🟡 | O teste do usuário bloqueado dependia de um detalhe interno não confirmado (cookie de sessão ausente). **Premissa incorreta**: o app grava o cookie mesmo no login recusado. | Asserção removida (v1.1.1). A garantia passa a ser mensagem de erro + permanência na tela de login. Ver seção 9. |

## 5. Falhas de arquitetura

- Faltava uma abstração para telas com lista de produtos (resolvido: `ProductListPage`).
- Fonte de verdade do catálogo espalhada entre specs (resolvido: `utils/catalog.js`).
- Leitura de dados misturada com asserção nos Page Objects (resolvido: o Page Object expõe só ações e asserções com retry).

## 6. Performance

- `cy.session` com `cacheAcrossSpecs: true`: o login via UI ocorre **uma vez por execução**, não por spec.
- Eliminados 4 hooks `before()` assíncronos de fixture e comandos redundantes por teste.
- Vídeo continua habilitado (exigido pelo desafio). Para acelerar execuções locais, defina `video: false` em `cypress.config.js`.

## 7. Manutenção

- ESLint (`eslint:recommended` + `plugin:cypress/recommended`) e Prettier: `npm run lint`, `npm run format`.
- Pipeline GitHub Actions (`.github/workflows/ci.yml`): lint, execução headless no Chrome e upload do relatório Mochawesome, screenshots e vídeos.
- `.nvmrc` (Node 20), `.editorconfig`, `.prettierrc.json`.
- Recomendado: após `npm install`, versionar o `package-lock.json` para builds reproduzíveis.

## 8. Riscos que permanecem

- A suíte depende de um site público de terceiros (texto, `data-test` ou comportamento podem mudar). Os pontos de ajuste estão centralizados em `constants.js` e nos Page Objects.
- `problem_user`, `performance_glitch_user` e `error_user` não estão na regressão estável (têm bugs intencionais).
- Fora do escopo desta versão: responsividade, acessibilidade (`cypress-axe`) e performance.

## 9. Correções pós-execução (validação local)

Defeitos que só apareceram ao executar a suíte contra o site real. Registrados aqui porque mostram os limites de uma revisão estática.

| # | Sev. | Sintoma | Causa raiz | Correção |
|---|------|---------|-----------|----------|
| P1 | 🔴 | Todos os testes pós-login falhavam em `cy.visit('/inventory.html')`. | O servidor responde HTTP 404 na rota direta; a SPA carrega mesmo assim. | `failOnStatusCode: false` em `InventoryPage.visit()` (v1.0.1). |
| P2 | 🔴 | `CT-LOGIN-02` falhava em `getCookie('session-username') → not.exist`. | A aplicação cria o cookie ao submeter o login, **antes** de validar o usuário; o cookie existe até em login recusado. A asserção foi introduzida por mim na revisão da v1.1 sem confirmar o comportamento no navegador. | Removida a asserção de cookie do teste de usuário bloqueado (v1.1.1). Mantidos: mensagem `LOCKED_OUT` visível e `assertOnLoginPage()`. |

**Lições aplicadas ao padrão da suíte**

- Asserções sobre detalhes internos da aplicação (cookies, localStorage, estrutura de rotas) só entram depois de confirmadas no navegador (DevTools → Application) ou na execução.
- A existência do cookie `session-username` só é usada como indicador de sessão **depois de um login bem-sucedido** (`CT-LOGIN-01`, `cy.loginAs` e `CT-SESSAO-01/02`). Em fluxos negativos, a evidência de "não autenticou" é de interface: erro visível e URL ainda em `/`.
- Cada correção de execução é registrada neste documento e no `PROMPTS.md`.
