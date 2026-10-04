// =============================================================================
// dataFactory.js
// Test Data Factory: gera dados de teste e permite sobrescrever campos.
// Usa o lodash embutido no Cypress (Cypress._), sem dependências extras.
// =============================================================================

const FIRST_NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe'];
const LAST_NAMES = ['Silva', 'Souza', 'Oliveira', 'Santos', 'Lima', 'Costa'];

/**
 * Cria um cliente válido para o checkout.
 * @param {Partial<{firstName: string, lastName: string, postalCode: string}>} overrides
 */
export const buildCustomer = (overrides = {}) => ({
  firstName: Cypress._.sample(FIRST_NAMES),
  lastName: Cypress._.sample(LAST_NAMES),
  postalCode: String(Cypress._.random(10000000, 99999999)), // CEP fictício de 8 dígitos
  ...overrides,
});

/**
 * Cria um cliente com um campo específico vazio (cenários negativos).
 * @param {'firstName'|'lastName'|'postalCode'} field
 */
export const buildCustomerWithout = (field) => buildCustomer({ [field]: '' });
