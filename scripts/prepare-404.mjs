#!/usr/bin/env node
/**
 * Firebase Hosting sert `404.html` (statut 404) pour toute URL sans fichier correspondant.
 * Angular pré-rend la page introuvable sous /404 (404/index.html) ; on la déplace en 404.html
 * et on supprime le dossier, sinon /404 répondrait 200 (cleanUrls). Lancé par le hook `postbuild`.
 */
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BROWSER = join(dirname(fileURLToPath(import.meta.url)), '../dist/myportofoliov2/browser');
const src = join(BROWSER, '404/index.html');

if (!existsSync(src)) {
  console.error('404: 404/index.html introuvable — la route /404 n\'a pas été pré-rendue.');
  process.exit(1);
}
renameSync(src, join(BROWSER, '404.html'));
rmSync(join(BROWSER, '404'), { recursive: true, force: true });
console.log('404: 404/index.html -> 404.html');
