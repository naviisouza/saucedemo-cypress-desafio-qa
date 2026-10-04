// =============================================================================
// cart.cy.js
// Cenários do carrinho: adicionar, múltiplos produtos, remover e contador.
// =============================================================================
import InventoryPage from '../../pages/InventoryPage';
import CartPage from '../../pages/CartPage';
import HeaderComponent from '../../pages/HeaderComponent';
import { namesOf, pickProducts } from '../../utils/catalog';

describe('Carrinho de compras', () => {
  // Pré-condição de todos os testes: usuário logado no catálogo com carrinho vazio.
  beforeEach(() => {
    cy.openInventoryAs();
  });

  it('CT-CARR-01 - Deve adicionar um produto ao carrinho', () => {
    const [product] = namesOf(pickProducts(1));

    InventoryPage.addToCart(product);

    InventoryPage.assertButtonShowsRemove(product);
    HeaderComponent.assertCartCount(1).openCart();
    CartPage.assertLoaded().assertProducts([product]);
  });

  it('CT-CARR-02 - Deve adicionar múltiplos produtos ao carrinho', () => {
    const selected = namesOf(pickProducts(3));

    InventoryPage.addMultipleToCart(selected);

    HeaderComponent.assertCartCount(selected.length).openCart();
    CartPage.assertLoaded().assertProducts(selected);
  });

  it('CT-CARR-03 - Deve remover um produto pela página de catálogo', () => {
    const [product] = namesOf(pickProducts(1));
    InventoryPage.addToCart(product);
    HeaderComponent.assertCartCount(1);

    InventoryPage.removeProduct(product);

    InventoryPage.assertButtonShowsAdd(product);
    HeaderComponent.assertCartCount(0);
  });

  it('CT-CARR-04 - Deve remover um produto pela página do carrinho', () => {
    const [first, second] = namesOf(pickProducts(2));
    InventoryPage.addMultipleToCart([first, second]);
    HeaderComponent.openCart();
    CartPage.assertProducts([first, second]);

    CartPage.removeProduct(first);

    CartPage.assertProducts([second]);
    HeaderComponent.assertCartCount(1);
  });

  it('CT-CARR-05 - Deve atualizar o contador do carrinho a cada adição e remoção', () => {
    const [first, second, third] = namesOf(pickProducts(3));

    HeaderComponent.assertCartCount(0);

    InventoryPage.addToCart(first);
    HeaderComponent.assertCartCount(1);

    InventoryPage.addToCart(second);
    HeaderComponent.assertCartCount(2);

    InventoryPage.addToCart(third);
    HeaderComponent.assertCartCount(3);

    InventoryPage.removeProduct(second);
    HeaderComponent.assertCartCount(2);
  });

  it('CT-CARR-06 - Deve manter os produtos no carrinho após refresh da página', () => {
    const selected = namesOf(pickProducts(2));
    InventoryPage.addMultipleToCart(selected);

    cy.reload();

    HeaderComponent.assertCartCount(selected.length).openCart();
    CartPage.assertProducts(selected);
  });
});
