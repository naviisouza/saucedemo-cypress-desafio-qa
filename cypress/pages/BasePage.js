// =============================================================================
// BasePage.js
// Classe base dos Page Objects: ações e utilidades compartilhadas.
// =============================================================================
import { testIdSelector } from '../utils/helpers';

export default class BasePage {
  /** Seletor estável (data-test): não muda com estilo/layout. */
  byTestId(id) {
    return testIdSelector(id);
  }

  /** Obtém um elemento pelo data-test (usa o custom command cy.getByTestId). */
  getByTestId(id) {
    return cy.getByTestId(id);
  }

  /** Visita uma rota relativa ao baseUrl (aceita as opções do cy.visit). */
  open(path, options = {}) {
    cy.visit(path, options);
  }

  /** Valida o caminho exato da URL atual (mais preciso que "includes"). */
  assertPath(path) {
    cy.location('pathname').should('eq', path);
  }
}
