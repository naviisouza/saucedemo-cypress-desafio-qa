// =============================================================================
// helpers.js
// Funções puras e reutilizáveis (sem dependência do Cypress), fáceis de testar.
// =============================================================================
import { TAX_RATE } from './constants';

/** Monta o seletor estável [data-test="id"]. Fonte única para commands e Page Objects. */
export const testIdSelector = (id) => `[data-test="${id}"]`;

/**
 * Extrai o valor numérico de um texto monetário.
 * Ex.: "$29.99" -> 29.99 | "Item total: $39.98" -> 39.98
 */
export const parsePrice = (text) => {
  const match = String(text).match(/\d+(?:\.\d+)?/);

  if (!match) {
    throw new Error(`Não foi possível extrair um valor numérico de: "${text}"`);
  }

  return Number(match[0]);
};

/** Formata um número como preço exibido pela aplicação. Ex.: 9.9 -> "$9.90" */
export const formatPrice = (value) => `$${value.toFixed(2)}`;

/** Lê o texto (sem espaços nas pontas) de cada elemento de uma coleção jQuery. */
export const readTexts = ($elements) => $elements.toArray().map((el) => el.textContent.trim());

/** Arredonda para 2 casas decimais (centavos), evitando erros de ponto flutuante. */
export const roundToCents = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Soma uma lista de preços e arredonda o resultado. */
export const sumPrices = (prices) =>
  roundToCents(prices.reduce((total, price) => total + price, 0));

/** Calcula o imposto sobre o subtotal. */
export const calculateTax = (subtotal, rate = TAX_RATE) => roundToCents(subtotal * rate);

/** Calcula o total (subtotal + imposto). */
export const calculateTotal = (subtotal, rate = TAX_RATE) =>
  roundToCents(subtotal + calculateTax(subtotal, rate));

/** Verifica se os números estão em ordem crescente. */
export const isSortedAscending = (values) =>
  values.every((value, index) => index === 0 || values[index - 1] <= value);

/** Verifica se os números estão em ordem decrescente. */
export const isSortedDescending = (values) =>
  values.every((value, index) => index === 0 || values[index - 1] >= value);

/** Retorna uma cópia ordenada alfabeticamente (A-Z) ou inversa (Z-A). */
export const sortAlphabetically = (values, direction = 'asc') => {
  const sorted = [...values].sort();
  return direction === 'asc' ? sorted : sorted.reverse();
};

/**
 * Converte o nome do produto no sufixo usado pelo atributo data-test.
 * Ex.: "Sauce Labs Backpack" -> "sauce-labs-backpack"
 */
export const toProductSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');
