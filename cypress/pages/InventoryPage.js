// =============================================================================
// InventoryPage.js
// Page Object do catálogo de produtos (/inventory.html).
// =============================================================================
import ProductListPage from './ProductListPage';
import { BUTTON_LABELS, PAGE_TITLES, PRICE_FORMAT, ROUTES } from '../utils/constants';
import {
  isSortedAscending,
  isSortedDescending,
  parsePrice,
  readTexts,
  sortAlphabetically,
  toProductSlug,
} from '../utils/helpers';

class InventoryPage extends ProductListPage {
  // ---- Seletores ------------------------------------------------------------
  get title() {
    return this.getByTestId('title');
  }

  get sortSelect() {
    return this.getByTestId('product-sort-container');
  }

  /** Botão "Add to cart" de um produto específico. */
  addButton(productName) {
    return this.getByTestId(`add-to-cart-${toProductSlug(productName)}`);
  }

  // ---- Ações ----------------------------------------------------------------
  visit() {
    // O SauceDemo é uma SPA: ao abrir /inventory.html diretamente, o servidor responde
    // HTTP 404, mas a aplicação carrega normalmente e resolve a rota no front-end.
    // Por isso desativamos a falha por status code apenas nesta navegação.
    this.open(ROUTES.INVENTORY, { failOnStatusCode: false });
    return this;
  }

  addToCart(productName) {
    this.addButton(productName).click();
    return this;
  }

  addMultipleToCart(productNames) {
    productNames.forEach((name) => this.addToCart(name));
    return this;
  }

  sortBy(optionValue) {
    this.sortSelect.select(optionValue);
    return this;
  }

  // ---- Validações -----------------------------------------------------------
  assertLoaded() {
    this.assertPath(ROUTES.INVENTORY);
    this.title.should('have.text', PAGE_TITLES.INVENTORY);
    this.items.should('have.length.greaterThan', 0);
    return this;
  }

  /**
   * Ordenação por preço crescente. A checagem exige mais de 1 item: sem isso,
   * uma lista vazia passaria "no vazio" (Array.every retorna true).
   * Retry automático via .should(callback): aguarda a re-renderização após ordenar.
   */
  assertPricesSortedAscending() {
    this.prices.should(($elements) => {
      const prices = readTexts($elements).map(parsePrice);
      expect(prices, 'quantidade de preços').to.have.length.greaterThan(1);
      expect(isSortedAscending(prices), `preços em ordem crescente: ${prices}`).to.be.true;
    });
    return this;
  }

  assertPricesSortedDescending() {
    this.prices.should(($elements) => {
      const prices = readTexts($elements).map(parsePrice);
      expect(prices, 'quantidade de preços').to.have.length.greaterThan(1);
      expect(isSortedDescending(prices), `preços em ordem decrescente: ${prices}`).to.be.true;
    });
    return this;
  }

  assertNamesSorted(direction = 'asc') {
    this.names.should(($elements) => {
      const names = readTexts($elements);
      expect(names, 'quantidade de nomes').to.have.length.greaterThan(1);
      expect(names).to.deep.equal(sortAlphabetically(names, direction));
    });
    return this;
  }

  /** Todos os preços exibidos seguem o formato monetário ($0.00). */
  assertPricesFormat() {
    this.prices.each(($price) => {
      expect($price.text()).to.match(PRICE_FORMAT);
    });
    return this;
  }

  assertButtonShowsRemove(productName) {
    this.removeButton(productName).should('be.visible').and('have.text', BUTTON_LABELS.REMOVE);
    return this;
  }

  assertButtonShowsAdd(productName) {
    this.addButton(productName).should('be.visible').and('have.text', BUTTON_LABELS.ADD);
    return this;
  }
}

export default new InventoryPage();
