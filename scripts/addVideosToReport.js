const fs = require('node:fs');
const path = require('node:path');

const MARKER_START = '<!-- qa-videos:start -->';
const MARKER_END = '<!-- qa-videos:end -->';

/** Escapa texto para uso seguro dentro de HTML. */
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

/** Converte um caminho do sistema (Windows ou Unix) em caminho com "/". */
const toPosix = (filePath) => filePath.split(path.sep).join('/');

/** Codifica cada segmento do caminho para uso em URL (espaços, acentos etc.). */
const toUrl = (posixPath) => posixPath.split('/').map(encodeURIComponent).join('/');

/**
 * Copia os vídeos dos specs para <reportDir>/videos e devolve os dados para o painel.
 * @returns {{ label: string, url: string, failed: boolean }[]}
 */
const copyVideos = (runs, videosFolder, reportDir) =>
  runs
    .filter(({ video }) => video && fs.existsSync(video))
    .map(({ video, stats }) => {
      const relativeVideo = toPosix(path.relative(videosFolder, video));
      // Se o vídeo estiver fora da pasta de vídeos, usa apenas o nome do arquivo.
      const safeRelative = relativeVideo.startsWith('..') ? path.basename(video) : relativeVideo;
      const destination = path.join(reportDir, 'videos', safeRelative);

      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(video, destination);

      return {
        label: safeRelative.replace(/\.mp4$/, ''),
        url: toUrl(`videos/${safeRelative}`),
        failed: Boolean(stats && stats.failures > 0),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

/** Monta o painel HTML (CSS + <details>) com um player por vídeo. */
const buildPanel = (videos) => {
  const items = videos
    .map(
      ({ label, url, failed }) => `
        <section class="qa-videos__item">
          <h4>${failed ? '✖' : '✔'} ${escapeHtml(label)}</h4>
          <video controls preload="none" src="${url}"></video>
        </section>`,
    )
    .join('');

  return `${MARKER_START}
<style>
  #qa-videos { position: fixed; right: 16px; bottom: 16px; z-index: 99999; max-width: min(560px, 92vw);
    font: 14px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; }
  #qa-videos > summary { cursor: pointer; list-style: none; width: max-content; margin-left: auto;
    background: #1f2937; color: #fff; padding: 10px 14px; border-radius: 999px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, .3); }
  #qa-videos > summary::-webkit-details-marker { display: none; }
  #qa-videos[open] > summary { border-radius: 8px 8px 0 0; width: auto; }
  #qa-videos .qa-videos__body { background: #fff; color: #111; border: 1px solid #d1d5db; border-top: 0;
    border-radius: 0 0 8px 8px; max-height: 70vh; overflow: auto; padding: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, .25); }
  #qa-videos .qa-videos__hint { margin: 0 0 8px; color: #555; font-size: 12px; }
  #qa-videos .qa-videos__item h4 { margin: 12px 0 6px; font-size: 13px; }
  #qa-videos video { width: 100%; background: #000; border-radius: 4px; }
</style>
<details id="qa-videos">
  <summary>🎥 Vídeos da execução (${videos.length})</summary>
  <div class="qa-videos__body">
    <p class="qa-videos__hint">Cada vídeo cobre o spec inteiro. ✔ = sem falhas · ✖ = com falhas.</p>${items}
  </div>
</details>
${MARKER_END}`;
};

/** Insere o painel antes de </body>, substituindo uma versão anterior (idempotente). */
const injectPanel = (html, panel) => {
  const cleaned = html.replace(new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}\\n?`, 'g'), '');
  const bodyEnd = cleaned.lastIndexOf('</body>');

  return bodyEnd === -1
    ? `${cleaned}\n${panel}`
    : `${cleaned.slice(0, bodyEnd)}${panel}\n${cleaned.slice(bodyEnd)}`;
};

/**
 * Ponto de entrada. Retorna a quantidade de vídeos adicionados ao relatório.
 * @param {{ results: object, reportDir: string, videosFolder: string }} options
 */
const addVideosToReport = ({ results, reportDir, videosFolder }) => {
  try {
    if (!fs.existsSync(reportDir)) {
      console.warn(`[relatório] Pasta do relatório não encontrada: ${reportDir}`);
      return 0;
    }

    const runs = (results && results.runs) || [];
    const videos = copyVideos(runs, videosFolder, reportDir);

    if (videos.length === 0) {
      console.warn('[relatório] Nenhum vídeo encontrado para adicionar (video: true?).');
      return 0;
    }

    const htmlFiles = fs.readdirSync(reportDir).filter((file) => file.endsWith('.html'));

    if (htmlFiles.length === 0) {
      console.warn('[relatório] Nenhum HTML encontrado na pasta do relatório.');
      return 0;
    }

    const panel = buildPanel(videos);

    htmlFiles.forEach((file) => {
      const filePath = path.join(reportDir, file);
      fs.writeFileSync(filePath, injectPanel(fs.readFileSync(filePath, 'utf8'), panel), 'utf8');
    });

    console.log(`[relatório] ${videos.length} vídeo(s) adicionados em ${htmlFiles.length} HTML.`);
    return videos.length;
  } catch (error) {
    console.warn(`[relatório] Não foi possível adicionar os vídeos: ${error.message}`);
    return 0;
  }
};

module.exports = { addVideosToReport, injectPanel, buildPanel, MARKER_START, MARKER_END };
