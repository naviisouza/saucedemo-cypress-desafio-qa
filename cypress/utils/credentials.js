// =============================================================================
// credentials.js
// Resolve usuário e senha a partir das variáveis de ambiente do Cypress
// (definidas em cypress.config.js, cypress.env.json ou CYPRESS_*).
// =============================================================================
import { USER_TYPES } from './constants';

/**
 * Retorna as credenciais do tipo de usuário solicitado.
 * @param {'standard'|'locked'} type
 * @returns {{ username: string, password: string }}
 */
export const getCredentials = (type = USER_TYPES.STANDARD) => {
  const usernameByType = {
    [USER_TYPES.STANDARD]: Cypress.env('STANDARD_USER'),
    [USER_TYPES.LOCKED]: Cypress.env('LOCKED_USER'),
  };

  const username = usernameByType[type];

  if (!username) {
    throw new Error(`Tipo de usuário desconhecido: "${type}"`);
  }

  return { username, password: Cypress.env('PASSWORD') };
};

/**
 * Substitui tokens {{NOME}} pelo valor da variável de ambiente correspondente.
 * Permite que fixtures referenciem credenciais sem duplicá-las.
 * Ex.: "{{PASSWORD}}" -> Cypress.env('PASSWORD')
 */
export const resolveEnvTokens = (value) =>
  value.replace(/\{\{(\w+)\}\}/g, (_match, name) => {
    const resolved = Cypress.env(name);

    if (resolved === undefined) {
      throw new Error(`Variável de ambiente não definida para o token {{${name}}}`);
    }

    return resolved;
  });
