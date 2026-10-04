// =============================================================================
// CartPage.js
// Page Object do carrinho (/cart.html).
// A lista de produtos (itens, nomes, preços, remover) vem de ProductListPage.
// =============================================================================
import ProductListPage from './ProductListPage';
import { PAGE_TITLES, ROUTES } from '../utils/constants';

class CartPage extends ProductListPage {
  // ---- Seletores ------------------------------------------------------------
  get title() {
    return this.getByTestId('title');
  }

  get checkoutButton() {
    return this.getByTestId('checkout');
  }

  // ---- Ações ----------------------------------------------------------------
  proceedToCheckout() {
    this.checkoutButton.click();
    return this;
  }

  // ---- Validações -----------------------------------------------------------
  assertLoaded() {
    this.assertPath(ROUTES.CART);
    this.title.should('have.text', PAGE_TITLES.CART);
    return this;
  }
}

export default new CartPage();
