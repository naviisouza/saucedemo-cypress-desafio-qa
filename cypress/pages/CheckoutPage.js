// =============================================================================
// CheckoutPage.js
// Page Object das 3 etapas do checkout:
//   1) Informações  2) Resumo do pedido  3) Conclusão
// A lista de produtos do resumo vem de ProductListPage.
// =============================================================================
import ProductListPage from './ProductListPage';
import { CURRENCY_TOLERANCE, MESSAGES, ROUTES } from '../utils/constants';
import { parsePrice } from '../utils/helpers';

class CheckoutPage extends ProductListPage {
  // ---- Seletores: etapa 1 (informações) ------------------------------------
  get firstNameInput() {
    return this.getByTestId('firstName');
  }

  get lastNameInput() {
    return this.getByTestId('lastName');
  }

  get postalCodeInput() {
    return this.getByTestId('postalCode');
  }

  get continueButton() {
    return this.getByTestId('continue');
  }

  get errorMessage() {
    return this.getByTestId('error');
  }

  // ---- Seletores: etapa 2 (resumo) / etapa 3 (conclusão) --------------------
  get finishButton() {
    return this.getByTestId('finish');
  }

  get completeHeader() {
    return this.getByTestId('complete-header');
  }

  get completeText() {
    return this.getByTestId('complete-text');
  }

  get backHomeButton() {
    return this.getByTestId('back-to-products');
  }

  // ---- Ações ----------------------------------------------------------------
  /** Preenche apenas os campos não vazios (cy.type não aceita string vazia). */
  fillInformation({ firstName, lastName, postalCode }) {
    // Registra os dados usados (a factory gera valores aleatórios; ajuda a reproduzir falhas).
    cy.log(`Cliente: "${firstName}" "${lastName}" "${postalCode}"`);
    if (firstName) this.firstNameInput.type(firstName);
    if (lastName) this.lastNameInput.type(lastName);
    if (postalCode) this.postalCodeInput.type(postalCode);
    return this;
  }

  continueToOverview() {
    this.continueButton.click();
    return this;
  }

  finish() {
    this.finishButton.click();
    return this;
  }

  backHome() {
    this.backHomeButton.click();
    return this;
  }

  // ---- Validações -----------------------------------------------------------
  assertInformationStep() {
    this.assertPath(ROUTES.CHECKOUT_STEP_ONE);
    this.firstNameInput.should('be.visible');
    return this;
  }

  assertErrorMessage(message) {
    this.errorMessage.should('be.visible').and('contain.text', message);
    this.assertPath(ROUTES.CHECKOUT_STEP_ONE); // permanece na etapa 1
    return this;
  }

  assertOverviewStep() {
    this.assertPath(ROUTES.CHECKOUT_STEP_TWO);
    this.finishButton.should('be.visible');
    return this;
  }

  /**
   * Valida subtotal, imposto e total exibidos contra valores esperados calculados
   * de forma independente (a partir da fixture), e não a partir da própria tela.
   */
  assertOrderSummary({ subtotal, tax, total }) {
    this.assertAmount('subtotal-label', subtotal);
    this.assertAmount('tax-label', tax);
    this.assertAmount('total-label', total);
    return this;
  }

  /** Compara o valor numérico de um rótulo (ex.: "Tax: $3.20") com o esperado. */
  assertAmount(testId, expected) {
    this.getByTestId(testId).should(($label) => {
      expect(parsePrice($label.text()), testId).to.be.closeTo(expected, CURRENCY_TOLERANCE);
    });
    return this;
  }

  assertOrderComplete() {
    this.assertPath(ROUTES.CHECKOUT_COMPLETE);
    this.completeHeader.should('have.text', MESSAGES.ORDER_SUCCESS);
    this.completeText.should('be.visible');
    return this;
  }
}

export default new CheckoutPage();
