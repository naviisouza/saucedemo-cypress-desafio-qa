// =============================================================================
// catalog.js
// Catálogo esperado de produtos, vindo da fixture products.json (fonte única).
// Importar o JSON diretamente evita repetir cy.fixture() + before() em cada spec.
// =============================================================================
import products from '../fixtures/products.json';

/** Catálogo completo: [{ name, price }]. */
export const catalog = products;

/** Retorna os N primeiros produtos (seleção determinística, sem aleatoriedade). */
export const pickProducts = (count) => catalog.slice(0, count);

/** Extrai os nomes de uma lista de produtos. */
export const namesOf = (productList) => productList.map(({ name }) => name);

/** Extrai os preços de uma lista de produtos. */
export const pricesOf = (productList) => productList.map(({ price }) => price);
