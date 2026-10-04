// =============================================================================
// commands.js
// Custom Commands: ações reutilizáveis expostas como cy.<comando>().
// =============================================================================
import LoginPage from '../pages/LoginPage';
import InventoryPage from '../pages/InventoryPage';
import CartPage from '../pages/CartPage';
import HeaderComponent from '../pages/HeaderComponent';
import { getCredentials } from '../utils/credentials';
import { ROUTES, SESSION_COOKIE, USER_TYPES } from '../utils/constants';
import { testIdSelector } from '../utils/helpers';

/**
 * cy.getByTestId('id')
 * Atalho para o seletor estável [data-test="id"].
 */
Cypress.Commands.add('getByTestId', (id, options) => cy.get(testIdSelector(id), options));

/**
 * cy.loginAs('standard' | 'locked')
 * Faz login via UI UMA vez e reaproveita a sessão (cookie) com cy.session.
 * - Testes independentes e rápidos, sem repetir a tela de login.
 * - cacheAcrossSpecs: o login é feito uma única vez por execução, não por spec.
 */
Cypress.Commands.add('loginAs', (userType = USER_TYPES.STANDARD) => {
  const { username, password } = getCredentials(userType);

  cy.session(
    [userType, username],
    () => {
      LoginPage.visit().login(username, password);
      cy.location('pathname').should('eq', ROUTES.INVENTORY);
    },
    {
      cacheAcrossSpecs: true,
      // Garante que a sessão em cache ainda é válida antes de reutilizá-la
      validate() {
        cy.getCookie(SESSION_COOKIE).should('exist');
      },
    },
  );
});

/**
 * cy.openInventoryAs('standard')
 * Pré-condição comum a quase todos os testes: usuário logado, no catálogo, carrinho vazio.
 */
Cypress.Commands.add('openInventoryAs', (userType = USER_TYPES.STANDARD) => {
  cy.loginAs(userType);
  InventoryPage.visit().assertLoaded();
});

/**
 * cy.startCheckoutWith(['Produto A'])
 * Atalho de pré-condição: adiciona produtos, abre o carrinho e inicia o checkout.
 * Requer estar no catálogo (use após cy.openInventoryAs()).
 */
Cypress.Commands.add('startCheckoutWith', (productNames) => {
  InventoryPage.addMultipleToCart(productNames);
  HeaderComponent.openCart();
  CartPage.assertLoaded().proceedToCheckout();
});
