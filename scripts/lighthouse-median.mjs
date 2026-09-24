#!/usr/bin/env node
/**
 * Lighthouse mobile, N runs par route, MÉDIANE de chaque métrique (le bruit d'un run unique
 * rend les scores inexploitables). À lancer sur le build servi avec compression :
 *
 *   npm run build
 *   firebase emulators:exec --only hosting --project tilportofoliov2 \
 *     "node scripts/lighthouse-median.mjs <étiquette> [runs=5] [route ...]"
 *
 * Écrit <OUT>/<étiquette>.json (médianes + élément LCP par route) et affiche un tableau.
 * OUT = $LH_OUT (défaut : ./.lighthouse, ignoré par git). Chrome : $CHROME_PATH (défaut /usr/bin/google-chrome).
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [label = 'run', runsArg = '5', ...routeArgs] = process.argv.slice(2);
const RUNS = Number(runsArg);
const ROUTES = routeArgs.length ? routeArgs : ['/', '/about', '/projects', '/projects/dofa', '/quotes'];
const BASE = process.env.LH_BASE ?? 'http://127.0.0.1:5000';
const OUT = process.env.LH_OUT ?? '.lighthouse';
mkdirSync(OUT, { recursive: true });

const median = xs => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const rows = [];

for (const route of ROUTES) {
  const runs = [];
  for (let i = 1; i <= RUNS; i++) {
    const file = join(OUT, `${label}-${route.replace(/\W+/g, '_')}-${i}.json`);
    const r = spawnSync('npx', ['--no-install', 'lighthouse', BASE + route,
      '--chrome-flags=--headless=new --no-sandbox', '--output=json', `--output-path=${file}`, '--quiet'],
      { env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH ?? '/usr/bin/google-chrome' }, stdio: 'ignore' });
    if (r.status !== 0) { console.error(`échec lighthouse ${route} run ${i}`); continue; }
    const j = JSON.parse(readFileSync(file, 'utf8'));
    const a = j.audits, cat = j.categories;
    const lcpEl = a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node;
    runs.push({
      perf: Math.round(cat.performance.score * 100), a11y: Math.round(cat.accessibility.score * 100),
      bp: Math.round(cat['best-practices'].score * 100), seo: Math.round(cat.seo.score * 100),
      lcp: a['largest-contentful-paint'].numericValue, tbt: a['total-blocking-time'].numericValue,
      cls: a['cumulative-layout-shift'].numericValue, fcp: a['first-contentful-paint'].numericValue,
      bytes: a['total-byte-weight'].numericValue,
      lcpElement: lcpEl ? `${lcpEl.selector}${lcpEl.snippet ? ' ' + lcpEl.snippet.slice(0, 110) : ''}` : null,
    });
  }
  if (!runs.length) continue;
  const m = k => median(runs.map(r => r[k]));
  const row = { route, runs: runs.length, perf: m('perf'), a11y: m('a11y'), bp: m('bp'), seo: m('seo'),
    lcpS: +(m('lcp') / 1000).toFixed(2), tbtMs: Math.round(m('tbt')), cls: +m('cls').toFixed(3),
    fcpS: +(m('fcp') / 1000).toFixed(2), kB: Math.round(m('bytes') / 1024),
    perfRuns: runs.map(r => r.perf), lcpElement: runs.find(r => r.lcpElement)?.lcpElement ?? null };
  rows.push(row);
  console.log(`${label} ${route.padEnd(16)} perf ${String(row.perf).padStart(3)} (${row.perfRuns.join(',')})  LCP ${row.lcpS}s  TBT ${row.tbtMs}ms  CLS ${row.cls}  a11y ${row.a11y} bp ${row.bp} seo ${row.seo}  ${row.kB} kB`);
  console.log(`      élément LCP : ${row.lcpElement}`);
}
writeFileSync(join(OUT, `${label}.json`), JSON.stringify(rows, null, 2));
