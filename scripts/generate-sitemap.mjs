#!/usr/bin/env node
/**
 * Génère dist/myportofoliov2/browser/sitemap.xml à partir des routes réellement pré-rendues
 * (prerendered-routes.json, écrit par `ng build`). Lancé automatiquement par `npm run build`
 * (hook npm « postbuild »).
 *
 * - /admin (rendu client uniquement) et la page 404 n'y figurent jamais ;
 * - les projets masqués (`hidden`) ne sont pas pré-rendus, donc absents ;
 * - lastmod = date du dernier commit git touchant les sources de la page, à défaut la date du build.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist/myportofoliov2');
const EXCLUDED = new Set(['/admin', '/404']);

const manifestPath = join(DIST, 'prerendered-routes.json');
if (!existsSync(manifestPath)) {
  console.error('sitemap: prerendered-routes.json introuvable — lance d\'abord `ng build`.');
  process.exit(1);
}

const site = readFileSync(join(ROOT, 'src/app/data/site.data.ts'), 'utf8');
const SITE_URL = site.match(/export const SITE_URL\s*=\s*'([^']+)'/)?.[1];
if (!SITE_URL) { console.error('sitemap: SITE_URL introuvable dans site.data.ts'); process.exit(1); }

/** Sources dont dépend le contenu de chaque route (pour lastmod). */
const APP = 'src/app';
const SOURCES = {
  '/':        [`${APP}/features/home`, `${APP}/data/site.data.ts`, `${APP}/data/products.data.ts`, `${APP}/shared/components/shop-section`],
  '/about':   [`${APP}/features/about`],
  '/projects': [`${APP}/features/projects`, `${APP}/data/projects.data.ts`],
  '/boutique': [`${APP}/features/boutique`, `${APP}/shared/components/shop-section`, `${APP}/data/products.data.ts`],
  '/blog':    [`${APP}/features/blog`],
  '/quotes':  [`${APP}/features/quotes`],
  '/contact': [`${APP}/features/contact`],
};
const PROJECT_SOURCES = [`${APP}/features/projects/project-detail`, `${APP}/data/projects.data.ts`];

const today = new Date().toISOString().slice(0, 10);
function lastmod(route) {
  const paths = route.startsWith('/projects/') ? PROJECT_SOURCES : SOURCES[route] ?? [APP];
  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return date || today;
  } catch { return today; }
}

const routes = Object.keys(JSON.parse(readFileSync(manifestPath, 'utf8')).routes)
  .filter(r => !EXCLUDED.has(r))
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${SITE_URL}${r === '/' ? '/' : r}</loc>
    <lastmod>${lastmod(r)}</lastmod>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync(join(DIST, 'browser/sitemap.xml'), xml);
console.log(`sitemap: ${routes.length} URL écrites dans dist/myportofoliov2/browser/sitemap.xml`);
