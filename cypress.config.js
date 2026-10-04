// =============================================================================
// cypress.config.js
// Configuração central do Cypress: ambiente, pastas, vídeos, retries e relatório.
// =============================================================================
const path = require('node:path');
const { defineConfig } = require('cypress');
const { addVideosToReport } = require('./scripts/addVideosToReport');

// Pasta do relatório: fonte única, usada pelo reporter e pelo painel de vídeos.
const REPORT_DIR = 'cypress/reports';

module.exports = defineConfig({
  // ---- Pastas (alinhadas à estrutura exigida no desafio) --------------------
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',

  // ---- Evidências de execução ----------------------------------------------
  video: true,
  screenshotOnRunFailure: true,
  trashAssetsBeforeRuns: true, // limpa screenshots/vídeos antigos a cada execução

  // ---- Viewport padrão (Desktop HD) ----------------------------------------
  viewportWidth: 1280,
  viewportHeight: 720,

  // ---- Retries: só em modo headless/CI. Testes que passam na 2ª tentativa
  // aparecem como "flaky" nos logs e devem ser investigados, não ignorados. ----
  retries: {
    runMode: 1,
    openMode: 0,
  },

  // ---- Reporter: Mochawesome (via cypress-mochawesome-reporter) ------------
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: REPORT_DIR,
    reportFilename: 'relatorio-saucedemo',
    reportPageTitle: 'SauceDemo - Relatório de Testes E2E',
    charts: true,
    embeddedScreenshots: true, // screenshots de falha embutidos no HTML (base64)
    inlineAssets: true, // visual (JS/CSS) dentro do próprio HTML
    ignoreVideos: true, // vídeos tratados por scripts/addVideosToReport.js (evita cópia duplicada)
    overwrite: true, // cada execução substitui o relatório anterior
    html: true,
    json: true,
  },

  e2e: {
    // Para apontar para outro ambiente: CYPRESS_BASE_URL=https://... npm test
    // (o Cypress já lê qualquer variável CYPRESS_* e sobrescreve a config).
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,

    // ---- Variáveis de ambiente (valores padrão; sobrescreva via CYPRESS_*) --
    // Ex.: CYPRESS_PASSWORD=outra_senha npm test  |  ou arquivo cypress.env.json
    env: {
      STANDARD_USER: 'standard_user',
      LOCKED_USER: 'locked_out_user',
      PASSWORD: 'secret_sauce',
    },

    setupNodeEvents(on, config) {
      const reportDir = path.resolve(config.projectRoot, REPORT_DIR);
      const videosFolder = path.resolve(config.projectRoot, config.videosFolder);

      // O reporter é registrado normalmente (mesmo padrão da v1.1.1, que mantém a ordem dos
      // specs no relatório). Este wrapper só encadeia o painel de vídeos DEPOIS do after:run
      // do reporter, sem substituir nenhum hook dele.
      const onWithVideoPanel = (event, handler, ...rest) => {
        if (event !== 'after:run') return on(event, handler, ...rest);

        return on(
          event,
          async (...args) => {
            await handler(...args); // o reporter gera o HTML do Mochawesome
            addVideosToReport({ results: args[0], reportDir, videosFolder });
          },
          ...rest,
        );
      };

      require('cypress-mochawesome-reporter/plugin')(onWithVideoPanel);
      return config;
    },
  },
});
