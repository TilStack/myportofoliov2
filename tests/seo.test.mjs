// Test SEO du build pré-rendu (dist/) et du comportement de Firebase Hosting (émulateur) :
// balises meta, canonical, Open Graph, JSON-LD parsable, sitemap, robots.txt, admin, projets
// masqués, 404 réel. Nécessite `npm run build`.
//   npm run test:seo
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';

const DIST = 'dist/myportofoliov2/browser';
const BASE = 'http://127.0.0.1:5000';
const read = f => readFileSync(f, 'utf8');
const site = read('src/app/data/site.data.ts');
const SITE_URL = site.match(/export const SITE_URL\s*=\s*'([^']+)'/)[1];
const projectsSrc = read('src/app/data/projects.data.ts');
const hiddenSlugs = [...projectsSrc.matchAll(/slug:\s*'([^']+)',\s*hidden:\s*true/g)].map(m => m[1]);

const results = [];
const check = async (name, fn) => { try { await fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, error: e.message.split('\n')[0] }); } };

// --- Lecture du HTML pré-rendu -------------------------------------------------------------
const routes = Object.keys(JSON.parse(read('dist/myportofoliov2/prerendered-routes.json')).routes);
const fileOf = r => r === '/404' ? `${DIST}/404.html` : `${DIST}${r === '/' ? '' : r}/index.html`;
const unescape = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const tag = (html, re) => { const m = html.match(re); return m ? unescape(m[1]) : null; };
const metaName = (h, n) => tag(h, new RegExp(`<meta name="${n}" content="([^"]*)"`));
const metaProp = (h, p) => tag(h, new RegExp(`<meta property="${p}" content="([^"]*)"`));
const pages = routes.filter(r => r !== '/404' && r !== '/admin').map(route => {
  const html = read(fileOf(route));
  return {
    route, html,
    title: tag(html, /<title>([^<]*)<\/title>/),
    description: metaName(html, 'description'),
    canonical: tag(html, /<link rel="canonical" href="([^"]*)"/),
    ld: [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]),
  };
});
const expectedUrl = r => `${SITE_URL}${r}`;

await check('12 pages indexables pré-rendues, 404.html présent, aucun dossier /404', () => {
  assert.ok(pages.length >= 8, `pages : ${pages.length}`);
  assert.ok(existsSync(`${DIST}/404.html`));
  assert.ok(!existsSync(`${DIST}/404`), '404/ ne doit pas exister (cleanUrls répondrait 200)');
});

for (const p of pages) {
  await check(`${p.route} : title, description, canonical, Open Graph, Twitter`, () => {
    assert.ok(p.title && p.title.length >= 10, 'title');
    assert.ok(p.description && p.description.length >= 50 && p.description.length <= 320, `description (${p.description?.length})`);
    assert.equal(p.canonical, expectedUrl(p.route));
    assert.equal(metaProp(p.html, 'og:title'), p.title);
    assert.equal(metaProp(p.html, 'og:description'), p.description);
    assert.equal(metaProp(p.html, 'og:url'), expectedUrl(p.route));
    assert.match(metaProp(p.html, 'og:image'), new RegExp(`^${SITE_URL}/.+\\.(jpe?g|png|webp)$`));
    assert.ok(metaProp(p.html, 'og:image:alt'));
    assert.equal(metaProp(p.html, 'og:locale'), 'fr_FR');
    assert.equal(metaProp(p.html, 'og:locale:alternate'), 'en_US');
    assert.equal(metaProp(p.html, 'og:type'), 'website');
    assert.equal(metaName(p.html, 'twitter:card'), 'summary_large_image');
    assert.equal(metaName(p.html, 'twitter:title'), p.title);
    assert.equal(metaName(p.html, 'twitter:image'), metaProp(p.html, 'og:image'));
    assert.equal(metaName(p.html, 'robots'), null, 'page indexable sans noindex');
    assert.equal(metaName(p.html, 'theme-color'), '#14213D');
    assert.match(p.html, /<html lang="fr"/);
  });
  await check(`${p.route} : un seul <h1>, images avec alt`, () => {
    assert.equal((p.html.match(/<h1[\s>]/g) ?? []).length, 1, 'nombre de <h1>');
    for (const img of p.html.match(/<img\b[^>]*>/g) ?? []) assert.match(img, /\salt="/, `sans alt : ${img.slice(0, 80)}`);
  });
  await check(`${p.route} : og:image existe sur le disque`, () => {
    const local = metaProp(p.html, 'og:image').replace(SITE_URL + '/', '');
    assert.ok(existsSync(`${DIST}/${local}`), local);
  });
}
await check('title et description uniques sur tout le site', () => {
  for (const k of ['title', 'description']) {
    const values = pages.map(p => p[k]);
    assert.equal(new Set(values).size, values.length, `${k} en double : ${values.filter((v, i) => values.indexOf(v) !== i)[0]}`);
  }
});

// --- JSON-LD -------------------------------------------------------------------------------
const ldOf = p => p.ld.map(j => JSON.parse(j));
await check('JSON-LD : chaque bloc est du JSON parsable avec @context schema.org et @type', () => {
  let n = 0;
  for (const p of pages) for (const raw of p.ld) {
    const o = JSON.parse(raw); n++;
    assert.equal(o['@context'], 'https://schema.org', p.route);
    assert.ok(o['@type'], p.route);
    assert.ok(!raw.includes('</script'), 'balise fermante injectée');
  }
  assert.ok(n >= 4, `blocs : ${n}`);
});
const home = pages.find(p => p.route === '/');
await check('accueil : Person + WebSite, sans Product (pas de section boutique visible avant la Phase 4)', () => {
  const types = ldOf(home).map(o => o['@type']).sort();
  assert.deepEqual(types, ['Person', 'WebSite']);
  const person = ldOf(home).find(o => o['@type'] === 'Person');
  assert.equal(person.name, 'TIENTCHEU Israel');
  assert.equal(person.alternateName, 'TilStack');
  assert.equal(person.url, SITE_URL);
  assert.equal(person.address.addressLocality, 'Douala');
  assert.equal(person.address.addressCountry, 'CM');
  assert.ok(person.jobTitle && person.sameAs.length >= 4);
});
await check('aucun Product ni prix dans le JSON-LD du site', () => {
  for (const p of pages) assert.ok(!p.ld.join('').match(/"(Product|offers|price|priceCurrency|lowPrice)"/), p.route);
});
await check('/about : Person', () => assert.deepEqual(ldOf(pages.find(p => p.route === '/about')).map(o => o['@type']), ['Person']));
await check('pages projet : CreativeWork cohérent avec le canonical', () => {
  const projectPages = pages.filter(p => p.route.startsWith('/projects/'));
  assert.ok(projectPages.length >= 5);
  for (const p of projectPages) {
    const works = ldOf(p);
    assert.equal(works.length, 1, p.route);
    assert.equal(works[0]['@type'], 'CreativeWork');
    assert.equal(works[0].url, p.canonical);
    assert.ok(works[0].name && works[0].description && works[0].image && works[0].creator?.name);
  }
});
await check('les autres pages n\'ont aucun JSON-LD superflu', () => {
  for (const p of pages.filter(p => !['/', '/about'].includes(p.route) && !p.route.startsWith('/projects/'))) assert.equal(p.ld.length, 0, p.route);
});

// --- Projets masqués, admin, sitemap, robots -----------------------------------------------
const sitemap = read(`${DIST}/sitemap.xml`);
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
await check('projets masqués : absents du sitemap, du HTML, du JSON-LD, sans page', () => {
  assert.ok(hiddenSlugs.length >= 1, 'aucun projet masqué détecté dans projects.data.ts');
  for (const slug of hiddenSlugs) {
    assert.ok(!existsSync(`${DIST}/projects/${slug}`), `page /projects/${slug} pré-rendue`);
    assert.ok(!locs.some(l => l.includes(slug)), 'dans le sitemap');
    for (const p of pages) assert.ok(!p.html.toLowerCase().includes(`projects/${slug}`) && !p.ld.join('').toLowerCase().includes(slug), `${slug} référencé dans ${p.route}`);
  }
});
await check('sitemap : XML valide, une URL par route pré-rendue, lastmod ISO, sans admin ni 404', () => {
  assert.match(sitemap, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  assert.deepEqual([...locs].sort(), pages.map(p => expectedUrl(p.route)).sort());
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]);
  assert.equal(lastmods.length, locs.length);
  for (const d of lastmods) assert.match(d, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!locs.some(l => /admin|404/.test(l)));
});
await check('admin : jamais pré-rendu, noindex dans firebase.json, Disallow dans robots.txt', () => {
  assert.ok(!existsSync(`${DIST}/admin`) && !existsSync(`${DIST}/admin.html`));
  assert.ok(!routes.includes('/admin'));
  const robots = read(`${DIST}/robots.txt`);
  assert.match(robots, /^Disallow: \/admin$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${SITE_URL}/sitemap.xml$`, 'm'));
  const fb = JSON.parse(read('firebase.json')).hosting;
  const rule = fb.headers.find(h => h.source === '/admin');
  assert.ok(rule.headers.some(h => h.key === 'X-Robots-Tag' && /noindex/.test(h.value)));
  assert.ok(fb.rewrites.every(r => r.source === '/admin'), 'seul /admin garde un repli vers index.csr.html');
});
await check('404.html : noindex, lien vers l\'accueil, un <h1>', () => {
  const h = read(`${DIST}/404.html`);
  assert.match(h, /<meta name="robots" content="noindex, nofollow"/);
  assert.match(h, /href="\/"[^>]*>[^<]*Retour à l'accueil/);
  assert.equal((h.match(/<h1[\s>]/g) ?? []).length, 1);
});
await check('og-home.jpg : JPEG 1200×630', () => {
  const b = readFileSync(`${DIST}/assets/og/og-home.jpg`);
  let i = 2, w, h;
  while (i < b.length) {
    const marker = b[i + 1], len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xc3) { h = b.readUInt16BE(i + 5); w = b.readUInt16BE(i + 7); break; }
    i += 2 + len;
  }
  assert.deepEqual([w, h], [1200, 630]);
});
await check('manifest.webmanifest : JSON valide, icônes présentes, theme_color #14213D', () => {
  const m = JSON.parse(read(`${DIST}/manifest.webmanifest`));
  assert.equal(m.theme_color, '#14213D');
  for (const ic of m.icons) assert.ok(existsSync(`${DIST}${ic.src}`), ic.src);
  assert.ok(existsSync(`${DIST}/apple-touch-icon.png`));
});

// --- Firebase Hosting (émulateur) : statuts et en-têtes ------------------------------------
const get = path => fetch(BASE + path, { redirect: 'manual' });
await check('URL inconnue : 404.html servi avec un statut 404', async () => {
  const r = await get('/cette-page-nexiste-pas');
  assert.equal(r.status, 404);
  assert.match(await r.text(), /Page introuvable/);
});
await check('/404 et /projects/<masqué> : statut 404', async () => {
  assert.equal((await get('/404')).status, 404);
  for (const slug of hiddenSlugs) assert.equal((await get(`/projects/${slug}`)).status, 404);
});
await check('routes publiques : statut 200 et HTML pré-rendu', async () => {
  for (const p of pages) {
    const r = await get(p.route);
    assert.equal(r.status, 200, p.route);
    assert.match(await r.text(), /<h1[\s>]/, p.route);
  }
});
await check('/admin : 200 (coquille client) avec X-Robots-Tag noindex', async () => {
  const r = await get('/admin');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('x-robots-tag') ?? '', /noindex/);
  assert.ok(!(await r.text()).includes('<h1'), 'aucun contenu admin pré-rendu');
});
await check('sitemap.xml et robots.txt servis', async () => {
  const s = await get('/sitemap.xml'); assert.equal(s.status, 200); assert.match(s.headers.get('content-type'), /xml/);
  const r = await get('/robots.txt'); assert.equal(r.status, 200); assert.match(await r.text(), /Sitemap:/);
});

const failed = results.filter(r => !r.ok);
for (const r of results) console.log(r.ok ? '✓' : '✗', r.name, r.ok ? '' : `\n    ${r.error}`);
console.log(`\n${results.length - failed.length}/${results.length} réussis`);
process.exit(failed.length ? 1 : 0);
