// Garde-fous de performance sur le build (dist/) : images, polices, préchargements, hydratation, bundle.
//   npm run build && npm run test:perf
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/myportofoliov2/browser';
const MAX_IMAGE_KB = 200;
// Non référencé par le site (le WebP de 51 kB est celui servi) : à supprimer sur décision de l'auteur.
const IMAGE_EXCEPTIONS = new Set([]);

const results = [];
const check = async (name, fn) => { try { await fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, error: e.message.split('\n')[0] }); } };
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const files = walk(DIST);
const rel = f => f.slice(DIST.length + 1);
// Pages pré-rendues (la page 404, déplacée en 404.html par le hook postbuild, n'a pas de dossier)
const routes = Object.keys(JSON.parse(readFileSync('dist/myportofoliov2/prerendered-routes.json', 'utf8')).routes);
const htmlOf = r => readFileSync(r === '/' ? `${DIST}/index.html` : r === '/404' ? `${DIST}/404.html` : `${DIST}${r}/index.html`, 'utf8');

await check(`aucune image > ${MAX_IMAGE_KB} kB (hors exceptions listées)`, () => {
  const heavy = files.filter(f => /\.(png|jpe?g|webp|avif|gif)$/i.test(f) && !IMAGE_EXCEPTIONS.has(rel(f)) && statSync(f).size > MAX_IMAGE_KB * 1024);
  assert.deepEqual(heavy.map(f => `${rel(f)} ${Math.round(statSync(f).size / 1024)} kB`), []);
});
await check('polices auto-hébergées : aucune requête vers Google Fonts, fichiers woff2 présents', () => {
  const css = files.filter(f => f.endsWith('.css')).map(f => readFileSync(f, 'utf8')).join('\n');
  const html = routes.map(htmlOf).join('\n');
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(css + html), 'requête Google Fonts');
  const urls = [...css.matchAll(/url\(\/?(fonts\/[^)]+\.woff2)\)/g)].map(m => m[1]);
  assert.ok(urls.length >= 6, `@font-face : ${urls.length}`);
  for (const u of urls) assert.ok(existsSync(`${DIST}/${u}`), u);
  assert.ok(/font-display:\s*swap/.test(css));
});
await check('une seule police préchargée (Inter variable) par page', () => {
  for (const r of routes) assert.equal((htmlOf(r).match(/<link rel="preload"[^>]*as="font"/g) ?? []).length, 1, r);
});
await check('modulepreload limité aux dépendances de la route (preloadInitial: false : 16 liens avant)', () => {
  for (const r of routes) assert.ok((htmlOf(r).match(/rel="modulepreload"/g) ?? []).length <= 10, r);
});
await check('images du HTML pré-rendu : dimensions explicites (ou fill), pas de PNG/JPEG hors OG', () => {
  for (const r of routes) {
    // Images locales seulement : les couvertures d'articles du blog viennent d'un hébergeur externe (Zerofiltre).
    for (const img of (htmlOf(r).match(/<img\b[^>]*>/g) ?? []).filter(i => !/\ssrc="https?:/.test(i))) {
      assert.ok(/\swidth="\d+"/.test(img) && /\sheight="\d+"/.test(img) || /\sfill[\s=>]/.test(img), `${r} : ${img.slice(0, 90)}`);
      const src = img.match(/\ssrc="([^"]+)"/)?.[1] ?? '';
      assert.ok(!/\.(png|jpe?g)$/i.test(src), `${r} : ${src}`);
    }
  }
});
await check('image LCP de l\'accueil : priority (fetchpriority high, loading eager, préchargée)', () => {
  const h = htmlOf('/');
  const hero = h.match(/<img\b[^>]*hero__deco-photo[^>]*>/)[0];
  assert.match(hero, /fetchpriority="high"/);
  assert.match(hero, /loading="eager"/);
  assert.ok((h.match(/<link\b[^>]*>/g) ?? []).some(l => /rel="preload"/.test(l) && /as="image"/.test(l) && /fetchpriority="high"/.test(l)), 'lien de préchargement');
});
await check('aucune image externe (Unsplash) demandée par le HTML de l\'accueil ni de À propos', () => {
  for (const r of ['/', '/about']) {
    const h = htmlOf(r);
    assert.ok(!/<img[^>]*unsplash\.com/.test(h), `${r} : <img>`);
    assert.ok(!/style="[^"]*unsplash\.com/.test(h), `${r} : style en ligne`);
  }
});
await check('pas de splash dans le build, js-anim posé par l\'application (jamais dans le HTML)', () => {
  assert.ok(!files.filter(f => f.endsWith('.js')).some(f => readFileSync(f, 'utf8').includes('intro-shown')));
  for (const r of routes) assert.ok(!/<html[^>]*js-anim/.test(htmlOf(r)) && !/classList\.add\('js-anim'\)/.test(htmlOf(r)), r);
});
await check('contenu du bas de page présent dans le HTML pré-rendu (@defer hydrate)', () => {
  assert.match(htmlOf('/about'), /Ancré dans la foi/);
  assert.match(htmlOf('/'), /Le Cameroun, ma patrie/);
});
await check('bundle initial < 500 kB (page la plus lourde)', () => {
  let max = 0;
  for (const r of routes) {
    const html = htmlOf(r);
    const scripts = new Set([...html.matchAll(/(?:src|href)="\/?([^"]+\.js)"/g)].map(m => m[1]));
    const kb = [...scripts].reduce((s, f) => s + (existsSync(`${DIST}/${f}`) ? statSync(`${DIST}/${f}`).size : 0), 0) / 1024;
    max = Math.max(max, kb);
  }
  assert.ok(max < 500, `${Math.round(max)} kB`);
});

const failed = results.filter(r => !r.ok);
for (const r of results) console.log(r.ok ? '✓' : '✗', r.name, r.ok ? '' : `\n    ${r.error}`);
console.log(`\n${results.length - failed.length}/${results.length} réussis`);
process.exit(failed.length ? 1 : 0);
