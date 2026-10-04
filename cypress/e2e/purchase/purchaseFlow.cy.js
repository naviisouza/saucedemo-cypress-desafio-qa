// =============================================================================
// purchaseFlow.cy.js
// Fluxo de compra completo (E2E) e validação de preços/total do pedido.
// =============================================================================
import LoginPage from '../../pages/LoginPage';
import InventoryPage from '../../pages/InventoryPage';
import CartPage from '../../pages/CartPage';
import CheckoutPage from '../../pages/CheckoutPage';
import HeaderComponent from '../../pages/HeaderComponent';
import { getCredentials } from '../../utils/credentials';
import { buildCustomer } from '../../utils/dataFactory';
import { namesOf, pickProducts, pricesOf } from '../../utils/catalog';
import { calculateTax, calculateTotal, sumPrices } from '../../utils/helpers';

describe('Fluxo de compra', () => {
  it('CT-E2E-01 - Deve concluir uma compra completa com sucesso', () => {
    const selected = namesOf(pickProducts(2));
    const { username, password } = getCredentials();

    // 1. Login (via UI: faz parte do fluxo validado)
    LoginPage.visit().login(username, password);
    InventoryPage.assertLoaded();

    // 2. Adiciona dois produtos diferentes
    InventoryPage.addMultipleToCart(selected);
    HeaderComponent.assertCartCount(selected.length);

    // 3. Valida os produtos no carrinho
    HeaderComponent.openCart();
    CartPage.assertLoaded().assertProducts(selected).proceedToCheckout();

    // 4. Preenche os dados e segue para o resumo
    CheckoutPage.assertInformationStep().fillInformation(buildCustomer()).continueToOverview();
    CheckoutPage.assertOverviewStep().assertProducts(selected);

    // 5. Finaliza e valida a mensagem de sucesso
    CheckoutPage.finish();
    CheckoutPage.assertOrderComplete();

    // 6. Pós-condição: retorno ao catálogo com o carrinho esvaziado
    CheckoutPage.backHome();
    InventoryPage.assertLoaded();
    HeaderComponent.assertCartCount(0);
  });

  it('CT-E2E-02 - Deve calcular corretamente subtotal, imposto e total do pedido', () => {
    const products = pickProducts(3);
    const subtotal = sumPrices(pricesOf(products));

    cy.openInventoryAs();
    cy.startCheckoutWith(namesOf(products));
    CheckoutPage.fillInformation(buildCustomer()).continueToOverview();

    CheckoutPage.assertOverviewStep().assertOrderSummary({
      subtotal,
      tax: calculateTax(subtotal),
      total: calculateTotal(subtotal),
    });
  });

  it('CT-E2E-03 - Deve exibir no resumo os mesmos preços do catálogo', () => {
    const [product] = pickProducts(1);

    cy.openInventoryAs();
    cy.startCheckoutWith([product.name]);
    CheckoutPage.fillInformation(buildCustomer()).continueToOverview();

    CheckoutPage.assertOverviewStep().assertPriceOf(product.name, product.price);
  });
});
