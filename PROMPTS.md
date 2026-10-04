# PROMPTS.md – Uso de Inteligência Artificial

Este documento registra como a IA (Claude, da Anthropic) foi usada na construção deste projeto e como o resultado foi auditado, conforme solicitado no desafio.

## 1. Estratégia

1. Eu defini o papel (QA Automation Engineer Sênior), a stack (apenas Cypress + JavaScript) e a **estrutura de pastas** esperada.
2. Pedi a lista de cenários obrigatórios do desafio **mais** cenários extras, para demonstrar profundidade.
3. Listei as boas práticas obrigatórias (Page Objects, fixtures, custom commands, factory, helpers, constants, hooks, variáveis de ambiente, testes independentes, seletores estáveis, comentários).
4. Exigi entregáveis explícitos: todos os arquivos, README, PROMPTS e Mochawesome.
5. Forneci o enunciado do desafio (arquivo .docx) para que a IA o validasse contra o que seria entregue.

## 2. Prompt principal

> Atue como um QA Automation Engineer Sênior.
>
> Desenvolva uma solução completa de automação para o SauceDemo (https://www.saucedemo.com/) utilizando apenas Cypress e JavaScript e valide o documento do desafio.
>
> Crie uma arquitetura profissional contendo: Page Objects, Fixtures, Custom Commands, Test Data Factory, Helpers, Constants, Hooks, Environment Variables.
>
> Estrutura do projeto: `cypress/{e2e, fixtures, pages, support, utils, reports, screenshots, videos}`.
>
> Implemente os cenários obrigatórios: login com sucesso; login inválido com `locked_out_user`; fluxo de compra completo (login, ao menos dois produtos, validação do carrinho, checkout, mensagem "Thank you for your order!"); filtro de ordenação por preço (Low to High).
>
> Adicione cenários extras de nível sênior: login com campos vazios e senha inválida; adicionar produto, múltiplos produtos e remover do carrinho; contador do carrinho; checkout sem First Name, Last Name e Postal Code; logout; persistência de sessão após refresh; validação de preços e do total da compra; validação dos filtros de ordenação.
>
> Boas práticas obrigatórias: Clean Code, reutilização, testes independentes, seletores estáveis, `beforeEach` quando necessário, código totalmente comentado.
>
> Entregue: estrutura completa, todos os arquivos com código completo, README.md com instruções de execução, PROMPTS.md documentando o uso de IA e configuração do Mochawesome. Implementação pronta para copiar e executar no VS Code.

**Por que funciona:** papel + stack fechada + estrutura de pastas + critérios de aceite explícitos + lista de entregáveis reduzem ambiguidade e retrabalho.

## 3. Decisões que a IA tomou e que foram revisadas

| Tema | Decisão | Motivo |
|------|---------|--------|
| Reporter | `cypress-mochawesome-reporter` | Gera o HTML automaticamente ao final do run, com screenshots embutidos, sem script de merge manual |
| Login nos testes | `cy.session` via `cy.loginAs()` | Testes independentes e rápidos; login pela UI mantido nos testes de login e no E2E principal |
| Seletores | `data-test` | Atributo pensado para testes; não muda com estilo |
| Credenciais | Variáveis de ambiente com padrão no `cypress.config.js` | Atende o requisito de *Environment Variables* e permite trocar sem alterar código |
| Specs data-driven | JSON importado estaticamente | `cy.fixture` é assíncrono e não permite gerar `it` dinamicamente; foi mantido `cy.fixture` onde cabe (produtos) |

## 4. Ciclo de revisão técnica (v1)

Depois da primeira versão gerada pela IA, revisei e rodei a automação para verificar se estava correto conforme solicitado. Após execução da v.1 foi encontrado um "bug":

### 4.1 Primeiro "bug" após a primeira execução e sua correção

- **Falha em todos os testes que abrem `/inventory.html`** (`cy.visit()` failed trying to load). Causa: o servidor do SauceDemo devolve HTTP 404 para a rota acessada diretamente, embora a SPA renderize. Correção: `failOnStatusCode: false` em `InventoryPage.visit()` (e `BasePage.open` passou a aceitar opções). Prompt usado: *"Todas as páginas que contêm inventory.html estão dando erro, corrija por favor."* + prints do Test Runner.

### 4.2 Ciclo de revisão técnica feita pela própria IA (v1.1)

Depois da correção ser realizada e segunda versão funcionando corretamente, usei a IA como revisora, com um papel diferente do de autora:

> Agora revise toda a solução como um Tech Lead de QA. Identifique: bugs na automação, más práticas, código duplicado, falhas de arquitetura, flakiness, melhorias de performance e de manutenção. Aplique as correções e gere a versão final pronta para produção.

**Resultado:** mais de 25 achados classificados e corrigidos (detalhes em [`CODE_REVIEW.md`](./CODE_REVIEW.md)). Os mais relevantes:

- leituras com `.then()` sem retry → `.should(callback)`;
- asserção de ordenação que passava com lista vazia;
- credenciais duplicadas na fixture → tokens `{{VAR}}`;
- Page Objects com lista de produtos repetida → base `ProductListPage`;
- `cy.session` com `cacheAcrossSpecs`, ESLint/Prettier e pipeline de CI.

### 4.3 Segundo "bug" após a segunda execução e sua correção

**Segunda correção pós-execução (v1.1.1):** a revisão da v1.1 introduziu uma asserção incorreta (cookie ausente após login recusado), detectada apenas na execução real. Isso reforça que **o código gerado por IA, inclusive o de uma etapa de revisão, precisa ser validado contra o sistema real**. Detalhes em [`CODE_REVIEW.md`](./CODE_REVIEW.md), seção 9.

- **`CT-LOGIN-02` falhando em `cy.getCookie('session-username').should('not.exist')`** (v1.1). Causa: o SauceDemo grava o cookie de sessão mesmo quando o login é recusado; a asserção foi adicionada por mim, na etapa de revisão, **sem confirmar o comportamento real**. Correção (v1.1.1): asserção removida; o teste valida a mensagem de usuário bloqueado e a permanência na tela de login. Prompt usado: *"Com algumas correções o cenário 2 do login deu erro, corrija mantendo o padrão solicitado nas últimas instruções."* + print do Test Runner.
- Lição: a asserção `CT-SESSAO-03` já havia sido escrita com `failOnStatusCode: false`, pois esse comportamento era esperado ali; faltou generalizar para o `visit()` dos demais testes.