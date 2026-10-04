// =============================================================================
// constants.js
// Valores fixos da aplicação: rotas, mensagens, textos de UI e regras de negócio.
// Centralizar evita "strings mágicas" espalhadas pelos testes.
// =============================================================================

/** Rotas da aplicação (relativas ao baseUrl). */
export const ROUTES = {
  LOGIN: '/',
  INVENTORY: '/inventory.html',
  CART: '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
};

/** Mensagens exibidas pela aplicação (usadas nas asserções). */
export const MESSAGES = {
  LOCKED_OUT: 'Epic sadface: Sorry, this user has been locked out.',
  USERNAME_REQUIRED: 'Epic sadface: Username is required',
  PASSWORD_REQUIRED: 'Epic sadface: Password is required',
  INVALID_CREDENTIALS:
    'Epic sadface: Username and password do not match any user in this service',
  NOT_LOGGED_IN:
    "Epic sadface: You can only access '/inventory.html' when you are logged in.",
  FIRST_NAME_REQUIRED: 'Error: First Name is required',
  LAST_NAME_REQUIRED: 'Error: Last Name is required',
  POSTAL_CODE_REQUIRED: 'Error: Postal Code is required',
  ORDER_SUCCESS: 'Thank you for your order!',
};

/** Títulos exibidos no cabeçalho de cada tela. */
export const PAGE_TITLES = {
  INVENTORY: 'Products',
  CART: 'Your Cart',
};

/** Rótulos dos botões de adicionar/remover produto. */
export const BUTTON_LABELS = {
  ADD: 'Add to cart',
  REMOVE: 'Remove',
};

/** Valores do <select> de ordenação (atributo "value" de cada <option>). */
export const SORT_OPTIONS = {
  NAME_AZ: 'az',
  NAME_ZA: 'za',
  PRICE_LOW_HIGH: 'lohi',
  PRICE_HIGH_LOW: 'hilo',
};

/** Tipos de usuário aceitos por getCredentials() / cy.loginAs(). */
export const USER_TYPES = {
  STANDARD: 'standard',
  LOCKED: 'locked',
};

/** Nome do cookie que a aplicação usa para representar a sessão. */
export const SESSION_COOKIE = 'session-username';

/** Alíquota de imposto aplicada pelo SauceDemo no resumo do pedido. */
export const TAX_RATE = 0.08;

/** Tolerância (em R$/US$) para comparar valores monetários calculados. */
export const CURRENCY_TOLERANCE = 0.01;

/** Formato monetário esperado dos preços exibidos. Ex.: $29.99 */
export const PRICE_FORMAT = /^\$\d+\.\d{2}$/;
