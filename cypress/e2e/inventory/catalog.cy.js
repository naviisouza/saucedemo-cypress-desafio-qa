// =============================================================================
// catalog.cy.js
// Validação dos produtos e preços exibidos no catálogo (contra a fixture).
// =============================================================================
import InventoryPage from '../../pages/InventoryPage';
import { catalog, namesOf } from '../../utils/catalog';

describe('Catálogo - Produtos e preços', () => {
  beforeEach(() => {
    cy.openInventoryAs();
  });

  it('CT-CAT-01 - Deve exibir todos os produtos esperados', () => {
    InventoryPage.assertProducts(namesOf(catalog));
  });

  it('CT-CAT-02 - Deve exibir o preço correto de cada produto', () => {
    catalog.forEach(({ name, price }) => {
      InventoryPage.assertPriceOf(name, price);
    });
  });

  it('CT-CAT-03 - Deve exibir todos os preços no formato monetário válido', () => {
    InventoryPage.assertPricesFormat();
  });
});
