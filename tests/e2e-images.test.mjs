// Garde-fou visuel (Phase 6, étape 6.0, point 1) : les visuels de la grille « Cameroon, My Home »
// (accueil) et du carrousel « Cameroun » (À propos) ne doivent plus jamais apparaître vides.
// Ce ne sont pas des <img> mais des blocs en background-image (CSS) : on vérifie que chaque bloc
// visible a une image de fond résolue (pas `none`) ET que l'URL répond 200, après défilement réel.
//   npm run build && npm run test:images
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const BASE = 'http://127.0.0.1:5000';
const results = [];
const check = async (name, fn) => { try { await fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, error: e.message.split('\n')[0] }); } };

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const failedUrls = [];
page.on('requestfailed', r => failedUrls.push(r.url()));
page.on('response', r => { if (r.status() >= 400) failedUrls.push(`${r.url()} (${r.status()})`); });

async function bgImagesOf(selector) {
  return page.$$eval(selector, els => els.map(el => {
    const bg = getComputedStyle(el).backgroundImage;
    const m = bg.match(/url\(["']?(.*?)["']?\)/);
    return m ? m[1] : null;
  }));
}

async function checkUrlsLoad(urls, label) {
  for (const url of urls.filter(Boolean)) {
    const res = await page.request.get(url);
    assert.ok(res.ok(), `${label} : ${url} -> ${res.status()}`);
  }
}

/** Défile par vrais événements de molette (le placeholder `@defer (on viewport)` n'existe pas encore :
 *  on ne peut pas lui faire `scrollIntoView`, il faut le laisser passer dans la fenêtre). Un `window.scrollTo`
 *  programmatique en boucle ne déclenche pas toujours les IntersectionObserver de façon fiable ici ;
 *  de vrais événements de molette si. */
async function scrollThrough() {
  for (let i = 0; i < 20; i++) {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(150);
  }
}

await check('accueil : grille « Cameroon, My Home », les 5 photos ont un fond résolu et chargent (200)', async () => {
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await scrollThrough();
  await page.waitForFunction(
    () => [...document.querySelectorAll('.montage__photo')].every(el => getComputedStyle(el).backgroundImage !== 'none'),
    { timeout: 10000 },
  );
  const urls = await bgImagesOf('.montage__photo');
  assert.equal(urls.length, 5, `5 photos attendues, ${urls.length} trouvées`);
  assert.ok(urls.every(Boolean), `au moins un bloc sans image de fond : ${JSON.stringify(urls)}`);
  await checkUrlsLoad(urls, 'montage');
});

await check('À propos : carrousel « Cameroun », les 3 diapositives ont un fond résolu et chargent (200)', async () => {
  await page.goto(`${BASE}/about`, { waitUntil: 'load' });
  await scrollThrough();
  // Les 3 diapositives arrivent dans le DOM simultanément (seule `.active` varie en CSS) une fois le
  // `@defer (on viewport)` interne résolu : pas besoin de cliquer, juste d'attendre qu'il se déclenche.
  await page.waitForFunction(
    () => document.querySelectorAll('.travels-gallery__img').length >= 3,
    { timeout: 10000 },
  );
  const urls = await bgImagesOf('.travels-gallery__img');
  assert.equal(urls.length, 3, `3 diapositives attendues, ${urls.length} trouvées`);
  assert.ok(urls.every(Boolean), `au moins une diapositive sans image de fond : ${JSON.stringify(urls)}`);
  await checkUrlsLoad(urls, 'travels');
});

await check('aucune requête image en échec pendant le parcours', () => {
  assert.deepEqual(failedUrls, []);
});

for (const r of results) console.log(r.ok ? '✓' : '✗', r.name, r.ok ? '' : `\n    ${r.error}`);
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} réussis`);
await browser.close();
process.exit(failed.length ? 1 : 0);
