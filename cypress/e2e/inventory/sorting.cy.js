// =============================================================================
// sorting.cy.js
// Validação dos filtros de ordenação do catálogo.
// =============================================================================
import InventoryPage from '../../pages/InventoryPage';
import { SORT_OPTIONS } from '../../utils/constants';
import { catalog, namesOf } from '../../utils/catalog';

describe('Catálogo - Ordenação', () => {
  beforeEach(() => {
    cy.openInventoryAs();
  });

  it('CT-ORD-01 - Deve ordenar produtos por preço (Low to High)', () => {
    InventoryPage.sortBy(SORT_OPTIONS.PRICE_LOW_HIGH);

    InventoryPage.assertPricesSortedAscending();
  });

  it('CT-ORD-02 - Deve ordenar produtos por preço (High to Low)', () => {
    InventoryPage.sortBy(SORT_OPTIONS.PRICE_HIGH_LOW);

    InventoryPage.assertPricesSortedDescending();
  });

  it('CT-ORD-03 - Deve ordenar produtos por nome (A to Z)', () => {
    // Parte da ordem inversa para garantir que a ordenação realmente foi aplicada.
    InventoryPage.sortBy(SORT_OPTIONS.NAME_ZA).sortBy(SORT_OPTIONS.NAME_AZ);

    InventoryPage.assertNamesSorted('asc');
  });

  it('CT-ORD-04 - Deve ordenar produtos por nome (Z to A)', () => {
    InventoryPage.sortBy(SORT_OPTIONS.NAME_ZA);

    InventoryPage.assertNamesSorted('desc');
  });

  it('CT-ORD-05 - Deve manter os mesmos produtos após ordenar', () => {
    InventoryPage.sortBy(SORT_OPTIONS.PRICE_HIGH_LOW);

    InventoryPage.assertProducts(namesOf(catalog));
  });
});
