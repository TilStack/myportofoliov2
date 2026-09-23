// Test de bout en bout : le VRAI site (build de prod servi par l'émulateur Hosting) parle à
// l'émulateur Firestore chargé avec firestore.rules. Vérifie la sécurité vue du navigateur d'un
// visiteur anonyme, et que Firebase Auth n'est chargé qu'à la demande.
//   npm run build && npm run test:e2e
// Navigateur : CHROME_PATH (défaut /usr/bin/google-chrome).
import { readdirSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const BASE = 'http://127.0.0.1:5000';
const SECRET_PENDING = 'SECRET-PROPOSITION-EN-ATTENTE';
const SECRET_EMAIL   = 'secret.visiteur@example.com';
const NEW_TEXT       = 'Nouvelle proposition e2e écrite par un visiteur anonyme';

initializeApp({ projectId: 'tilportofoliov2' });
const db = getFirestore();
const base = { explanation: 'Explication e2e', tags: [], date: Timestamp.now() };
await db.doc('quotes/e2e-approved').set({ ...base, text: 'E2E approuvée numéro un', author: 'Alice', status: 'approved', likes: 5 });
await db.doc('quotes/e2e-approved2').set({ ...base, text: 'E2E approuvée numéro deux', author: 'Bob', status: 'approved', likes: 0 });
await db.doc('quotes/e2e-pending').set({ ...base, text: SECRET_PENDING, author: 'Carl', status: 'pending', likes: 0 });
await db.doc('quoteSubmissions/e2e-sub').set({ quoteId: 'e2e-pending', email: SECRET_EMAIL });

// Chunks du SDK Firebase Auth lui-même (à ne jamais voir passer pour un visiteur normal)
const dist = 'dist/myportofoliov2/browser';
const authChunks = readdirSync(dist).filter(f => f.endsWith('.js') && readFileSync(`${dist}/${f}`, 'utf8').includes('auth/popup-closed-by-user'));
assert.ok(authChunks.length > 0, 'chunk Auth introuvable dans le build : lancer npm run build');

const results = [];
const check = async (name, fn) => { try { await fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, error: e.message.split('\n')[0] }); } };

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ locale: 'fr-FR', viewport: { width: 1280, height: 900 } });
// Redirige le SDK Firestore vers l'émulateur (mécanisme officiel du SDK, aucun code de test dans l'app)
await ctx.addInitScript(() => { window.__FIREBASE_DEFAULTS__ = { emulatorHosts: { firestore: '127.0.0.1:8080' } }; });

const newPage = async () => {
  const page = await ctx.newPage(); page.errors = []; page.requests = [];
  page.on('console', m => { if (m.type() === 'error' || /permission|insufficient/i.test(m.text())) page.errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => page.errors.push('pageerror: ' + e.message.slice(0, 200)));
  page.on('request', r => page.requests.push(r.url()));
  return page;
};

// ── /quotes en visiteur anonyme ──
const page = await newPage();
await page.goto(BASE + '/quotes', { waitUntil: 'load' });
await page.waitForSelector('text=E2E approuvée numéro un', { timeout: 15000 });

await check('quotes: la liste publique ne montre que les citations approuvées (2)', async () => {
  assert.equal(await page.locator('.qcard').count(), 2);
});
await check('quotes: la citation pending et l\'email n\'apparaissent nulle part dans la page', async () => {
  const html = await page.content(); assert.ok(!html.includes(SECRET_PENDING) && !html.includes(SECRET_EMAIL));
});
await check('quotes: aucun bouton admin (ajouter, modérer, éditer, supprimer) pour un visiteur', async () => {
  for (const sel of ['.qadd-btn', '.qmod-btn', '.qcard__edit-btn', '.qcard__del-btn']) assert.equal(await page.locator(sel).count(), 0, sel);
});
await check('quotes: aucune erreur de permission Firestore pour un visiteur', async () => {
  assert.deepEqual(page.errors.filter(e => /permission|insufficient|pageerror/i.test(e)), []);
});
await check('quotes: Firebase Auth n\'est pas chargé pour un visiteur', () => {
  const loaded = page.requests.filter(u => authChunks.some(c => u.endsWith(c))); assert.deepEqual(loaded, []);
});

await check('quotes: like d\'un visiteur (+1) accepté par les règles et persisté', async () => {
  await page.locator('.qcard', { hasText: 'E2E approuvée numéro un' }).locator('.qcard__like-btn').click();
  await page.waitForTimeout(1200);
  assert.equal((await db.doc('quotes/e2e-approved').get()).data().likes, 6);
});

await check('quotes: proposition d\'un visiteur → citation pending SANS coordonnées + coordonnées à part', async () => {
  await page.locator('.qsuggest-btn').click();
  await page.fill('#qs-text', NEW_TEXT);
  await page.fill('#qs-expl', 'Une explication assez longue pour valider le formulaire.');
  await page.fill('#qs-author', 'Awa Visiteuse');
  await page.fill('#qs-role', 'Enseignante');
  await page.fill('#qs-email', 'awa.visiteuse@example.com');
  await page.locator('form:has(#qs-text) button[type=submit]').click();
  await page.waitForSelector('.qadd-success', { timeout: 10000 });

  const q = (await db.collection('quotes').where('text', '==', NEW_TEXT).get());
  assert.equal(q.size, 1); const d = q.docs[0].data();
  assert.equal(d.status, 'pending'); assert.equal(d.likes, 0);
  for (const k of ['submitterEmail', 'submitterRole', 'submitterLinkedin']) assert.ok(!(k in d), `${k} présent dans quotes`);
  const s = (await db.collection('quoteSubmissions').where('quoteId', '==', q.docs[0].id).get());
  assert.equal(s.size, 1);
  assert.deepEqual(s.docs[0].data(), { quoteId: q.docs[0].id, email: 'awa.visiteuse@example.com', role: 'Enseignante' });
});
await check('quotes: la nouvelle proposition n\'est pas visible publiquement (pending)', async () => {
  await page.reload({ waitUntil: 'load' }); await page.waitForSelector('text=E2E approuvée numéro un', { timeout: 15000 });
  assert.ok(!(await page.content()).includes(NEW_TEXT));
});
await check('quotes: aucune erreur de permission pendant tout le parcours visiteur', async () => {
  assert.deepEqual(page.errors.filter(e => /permission|insufficient|pageerror/i.test(e)), []);
});

// ── /blog ──
await check('blog: pas de bouton « écrire » ni de champ mot de passe pour un visiteur', async () => {
  const p = await newPage(); await p.goto(BASE + '/blog', { waitUntil: 'load' }); await p.waitForTimeout(600);
  assert.equal(await p.locator('.write-btn').count(), 0); assert.equal(await p.locator('input[type=password]').count(), 0);
  await p.close();
});

// ── /admin ──
await check('admin: page de connexion, noindex, Firebase Auth chargé à la demande seulement ici', async () => {
  const p = await newPage(); await p.goto(BASE + '/admin', { waitUntil: 'load' });
  await p.waitForSelector('app-admin app-button button', { timeout: 10000 }); await p.waitForTimeout(800);
  assert.match(await p.locator('meta[name=robots]').getAttribute('content'), /noindex/);
  assert.ok(p.requests.some(u => authChunks.some(c => u.endsWith(c))), 'le chunk Auth devrait être chargé sur /admin');
  assert.equal(await p.locator('.admin-card__setup').count(), 0); // pas connecté : rien d'admin affiché
  await p.close();
});
await check('admin: /admin n\'est pas pré-rendu (aucun HTML statique)', () => {
  assert.ok(!readdirSync(dist).includes('admin'));
});

await browser.close();
for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : ' — ' + r.error}`);
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} réussis`);
process.exit(failed.length ? 1 : 0);
