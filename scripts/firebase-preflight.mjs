#!/usr/bin/env node
/**
 * Contrôle avant déploiement Firebase : ne se connecte à rien, n'écrit rien, n'affiche aucun secret.
 *   npm run firebase:preflight
 * Liste ce qui est prêt et ce qu'il reste à faire (connexion, UID admin, build, branche).
 */
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ok = (m) => console.log(`  ✓ ${m}`);
const todo = (m) => { console.log(`  ✗ ${m}`); failed++; };
let failed = 0;
const read = (p) => readFileSync(p, 'utf8');
const sh = (c) => { try { return execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };

console.log('\nConfiguration Firebase');
const rc = existsSync('.firebaserc') ? read('.firebaserc') : '';
rc.includes('tilportofoliov2') ? ok('projet par défaut : tilportofoliov2 (.firebaserc)') : todo('.firebaserc : projet par défaut introuvable');
existsSync('firebase.json') && existsSync('firestore.rules') ? ok('firebase.json et firestore.rules présents') : todo('firebase.json ou firestore.rules manquant');

console.log('\nAdministration (modération des citations, blog)');
const adminUid = (read('src/app/data/site.data.ts').match(/ADMIN_UID\s*=\s*'([^']*)'/) ?? [])[1] ?? '';
const rulesMarker = read('firestore.rules').includes('__ADMIN_UID__');
if (adminUid && !rulesMarker) ok('ADMIN_UID renseigné dans le site ET dans firestore.rules');
else {
  todo(`ADMIN_UID : ${adminUid ? 'renseigné dans le site' : 'vide dans src/app/data/site.data.ts'}${rulesMarker ? ', marqueur __ADMIN_UID__ encore présent dans firestore.rules' : ''}`);
  console.log('      → npm start, ouvrir /admin, se connecter avec Google : l\'UID s\'affiche ; le copier aux deux endroits (docs/DEPLOY-SECURITY.md, étape 1).');
}

console.log('\nBuild');
const dist = 'dist/myportofoliov2/browser';
for (const f of ['index.html', '404.html', 'sitemap.xml', 'robots.txt']) existsSync(`${dist}/${f}`) ? ok(`${dist}/${f}`) : todo(`${dist}/${f} manquant : lancer « npm run build » (et pas « ng build »)`);

console.log('\nGit');
const branch = sh('git branch --show-current');
branch === 'master' ? ok('branche master') : todo(`branche « ${branch} » : docs/DEPLOY.md demande de déployer depuis master (arbre propre, à jour avec origin)`);
sh('git status --short') === '' ? ok('arbre propre') : todo('modifications non commitées');

console.log('\nConnexion');
console.log('  ? Connexion Firebase : « npx firebase-tools login:list » doit afficher ton compte (sinon « npx firebase-tools login »).');
console.log('  ? Données : après connexion, dans l\'ordre : migrate-quotes (--dry-run puis --apply), règles, hosting (docs/DEPLOY-SECURITY.md).');

console.log(failed ? `\n${failed} point(s) à traiter avant le déploiement.\n` : '\nTout est prêt côté projet.\n');
process.exit(failed ? 1 : 0);
