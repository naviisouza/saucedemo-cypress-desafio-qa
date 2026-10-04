// =============================================================================
// ProductListPage.js
// Base para as telas que listam produtos (catálogo, carrinho e resumo do checkout).
// Elas compartilham o mesmo markup (data-test="inventory-item"), então os
// seletores e validações de lista ficam aqui, em um único lugar.
// =============================================================================
import BasePage from './BasePage';
import { formatPrice, readTexts, toProductSlug } from '../utils/helpers';

export default class ProductListPage extends BasePage {
  // ---- Seletores ------------------------------------------------------------
  get items() {
    return this.getByTestId('inventory-item');
  }

  get names() {
    return this.getByTestId('inventory-item-name');
  }

  get prices() {
    return this.getByTestId('inventory-item-price');
  }

  /** Card de um produto específico, localizado pelo nome. */
  itemByName(productName) {
    return cy.contains(this.byTestId('inventory-item'), productName);
  }

  /** Botão "Remove" de um produto (existe no catálogo e no carrinho). */
  removeButton(productName) {
    return this.getByTestId(`remove-${toProductSlug(productName)}`);
  }

  // ---- Ações ----------------------------------------------------------------
  removeProduct(productName) {
    this.removeButton(productName).click();
    return this;
  }

  // ---- Validações -----------------------------------------------------------
  /**
   * Valida que a lista contém exatamente os produtos esperados (ignora a ordem).
   * Usa callback em .should(): o Cypress repete a checagem até passar ou estourar
   * o timeout, evitando flakiness por leitura antecipada do DOM.
   */
  assertProducts(expectedNames) {
    if (expectedNames.length === 0) {
      this.items.should('not.exist');
      return this;
    }

    this.names.should(($elements) => {
      expect(readTexts($elements).sort()).to.deep.equal([...expectedNames].sort());
    });
    return this;
  }

  /** Valida o preço exibido de um produto específico. */
  assertPriceOf(productName, expectedPrice) {
    this.itemByName(productName)
      .find(this.byTestId('inventory-item-price'))
      .should('have.text', formatPrice(expectedPrice));
    return this;
  }
}
