// =============================================================================
// login.cy.js
// Cenários de autenticação: sucesso, usuário bloqueado e validações negativas.
// =============================================================================
import LoginPage from '../../pages/LoginPage';
import InventoryPage from '../../pages/InventoryPage';
import { getCredentials, resolveEnvTokens } from '../../utils/credentials';
import { MESSAGES, ROUTES, SESSION_COOKIE, USER_TYPES } from '../../utils/constants';
// Import estático: necessário para gerar os "it" dinamicamente (data-driven) em tempo de carga.
import loginScenarios from '../../fixtures/loginScenarios.json';

describe('Autenticação - Login', () => {
  // Cada teste começa na tela de login, sem sessão (testIsolation limpa cookies/storage).
  beforeEach(() => {
    LoginPage.visit();
  });

  it('CT-LOGIN-01 - Deve realizar login com credenciais válidas', () => {
    const { username, password } = getCredentials(USER_TYPES.STANDARD);

    LoginPage.login(username, password);

    InventoryPage.assertLoaded();
    cy.getCookie(SESSION_COOKIE).should('have.property', 'value', username);
  });

  it('CT-LOGIN-02 - Deve exibir erro ao logar com usuário bloqueado (locked_out_user)', () => {
    const { username, password } = getCredentials(USER_TYPES.LOCKED);

    LoginPage.login(username, password);

    // Obs.: o SauceDemo grava o cookie de sessão mesmo quando o login é recusado, então o
    // cookie NÃO é um indicador confiável de autenticação. A garantia aqui é: mensagem de
    // erro exibida + permanência na tela de login (sem avançar para o catálogo).
    LoginPage.assertErrorMessage(MESSAGES.LOCKED_OUT).assertOnLoginPage();
  });

  // ---- Cenários extras (data-driven a partir da fixture) -------------------
  loginScenarios.forEach(({ id, title, username, password, expectedMessage }) => {
    it(`${id} - Deve exibir erro com ${title}`, () => {
      LoginPage.login(resolveEnvTokens(username), resolveEnvTokens(password));

      LoginPage.assertErrorMessage(MESSAGES[expectedMessage]).assertOnLoginPage();
      cy.location('pathname').should('not.eq', ROUTES.INVENTORY);
    });
  });
});
