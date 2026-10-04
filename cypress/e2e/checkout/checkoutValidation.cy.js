// =============================================================================
// checkoutValidation.cy.js
// Validações negativas do formulário de checkout (campos obrigatórios).
// =============================================================================
import CheckoutPage from '../../pages/CheckoutPage';
import { buildCustomerWithout } from '../../utils/dataFactory';
import { namesOf, pickProducts } from '../../utils/catalog';
import { MESSAGES } from '../../utils/constants';

// Tabela de cenários: campo vazio -> mensagem esperada.
const requiredFieldScenarios = [
  {
    id: 'CT-CHK-01',
    field: 'firstName',
    label: 'First Name',
    message: MESSAGES.FIRST_NAME_REQUIRED,
  },
  {
    id: 'CT-CHK-02',
    field: 'lastName',
    label: 'Last Name',
    message: MESSAGES.LAST_NAME_REQUIRED,
  },
  {
    id: 'CT-CHK-03',
    field: 'postalCode',
    label: 'Postal Code',
    message: MESSAGES.POSTAL_CODE_REQUIRED,
  },
];

describe('Checkout - Validação de campos obrigatórios', () => {
  // Pré-condição: usuário logado, com 1 produto no carrinho, na etapa 1 do checkout.
  beforeEach(() => {
    cy.openInventoryAs();
    cy.startCheckoutWith(namesOf(pickProducts(1)));
    CheckoutPage.assertInformationStep();
  });

  requiredFieldScenarios.forEach(({ id, field, label, message }) => {
    it(`${id} - Deve exibir erro ao continuar o checkout sem ${label}`, () => {
      CheckoutPage.fillInformation(buildCustomerWithout(field)).continueToOverview();

      CheckoutPage.assertErrorMessage(message);
    });
  });
});
