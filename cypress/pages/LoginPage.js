// =============================================================================
// LoginPage.js
// Page Object da tela de login.
// =============================================================================
import BasePage from './BasePage';
import { ROUTES } from '../utils/constants';

class LoginPage extends BasePage {
  // ---- Seletores ------------------------------------------------------------
  get usernameInput() {
    return this.getByTestId('username');
  }

  get passwordInput() {
    return this.getByTestId('password');
  }

  get loginButton() {
    return this.getByTestId('login-button');
  }

  get errorMessage() {
    return this.getByTestId('error');
  }

  // ---- Ações ----------------------------------------------------------------
  visit() {
    this.open(ROUTES.LOGIN);
    this.loginButton.should('be.visible');
    return this;
  }

  /** Preenche apenas os campos informados (cy.type não aceita string vazia). */
  fillCredentials(username, password) {
    if (username) this.usernameInput.type(username);
    if (password) this.passwordInput.type(password, { log: false }); // oculta a senha no log
    return this;
  }

  submit() {
    this.loginButton.click();
    return this;
  }

  login(username, password) {
    return this.fillCredentials(username, password).submit();
  }

  // ---- Validações -----------------------------------------------------------
  assertErrorMessage(message) {
    this.errorMessage.should('be.visible').and('contain.text', message);
    return this;
  }

  assertOnLoginPage() {
    this.assertPath(ROUTES.LOGIN);
    this.loginButton.should('be.visible');
    return this;
  }
}

export default new LoginPage();
