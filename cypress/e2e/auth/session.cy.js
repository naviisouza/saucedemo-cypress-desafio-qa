// =============================================================================
// session.cy.js
// Cenários de sessão: logout, persistência após refresh e acesso sem login.
// =============================================================================
import LoginPage from '../../pages/LoginPage';
import InventoryPage from '../../pages/InventoryPage';
import HeaderComponent from '../../pages/HeaderComponent';
import { MESSAGES, SESSION_COOKIE } from '../../utils/constants';

describe('Autenticação - Sessão', () => {
  it('CT-SESSAO-01 - Deve realizar logout e retornar à tela de login', () => {
    cy.openInventoryAs();

    HeaderComponent.logout();

    LoginPage.assertOnLoginPage();
    cy.getCookie(SESSION_COOKIE).should('not.exist');
  });

  it('CT-SESSAO-02 - Deve manter a sessão ativa após refresh da página', () => {
    cy.openInventoryAs();

    cy.reload();

    InventoryPage.assertLoaded();
    cy.getCookie(SESSION_COOKIE).should('exist');
  });

  it('CT-SESSAO-03 - Deve bloquear o acesso direto ao catálogo sem estar logado', () => {
    InventoryPage.visit(); // sem cy.loginAs(): não há sessão

    LoginPage.assertErrorMessage(MESSAGES.NOT_LOGGED_IN).assertOnLoginPage();
  });
});
