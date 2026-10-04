// =============================================================================
// hooks.js
// Hooks globais (valem para TODOS os specs). Hooks específicos de cada suíte
// ficam no próprio spec, via before/beforeEach.
// =============================================================================

// Ignora apenas um ruído conhecido de navegadores; demais erros continuam falhando o teste.
Cypress.on('uncaught:exception', (error) => {
  if (error.message.includes('ResizeObserver loop')) {
    return false; // false = não falhar o teste por este erro específico
  }
});

// Registra no log do Cypress qual teste está em execução (facilita a leitura do Test Runner).
beforeEach(() => {
  Cypress.log({ name: 'TESTE', message: Cypress.currentTest.title });
});
