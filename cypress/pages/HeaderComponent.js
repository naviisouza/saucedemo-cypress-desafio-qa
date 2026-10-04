// =============================================================================
// HeaderComponent.js
// Componente compartilhado entre as telas logadas: carrinho e menu lateral.
// =============================================================================
import BasePage from './BasePage';

class HeaderComponent extends BasePage {
  // ---- Seletores ------------------------------------------------------------
  get cartLink() {
    return this.getByTestId('shopping-cart-link');
  }

  get cartBadge() {
    return this.getByTestId('shopping-cart-badge');
  }

  get menuButton() {
    return cy.get('#react-burger-menu-btn'); // único elemento sem data-test
  }

  get logoutLink() {
    return this.getByTestId('logout-sidebar-link');
  }

  // ---- Ações ----------------------------------------------------------------
  openCart() {
    this.cartLink.click();
    return this;
  }

  logout() {
    this.menuButton.click();
    this.logoutLink.should('be.visible').click();
    return this;
  }

  // ---- Validações -----------------------------------------------------------
  /** Valida o contador do carrinho. Com 0 itens o badge não existe no DOM. */
  assertCartCount(expected) {
    if (expected === 0) {
      this.cartBadge.should('not.exist');
    } else {
      this.cartBadge.should('be.visible').and('have.text', String(expected));
    }
    return this;
  }
}

export default new HeaderComponent();
