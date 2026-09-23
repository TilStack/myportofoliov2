// Test de scripts/migrate-quotes.mjs contre l'émulateur (dry-run, refus sans drapeau, apply, idempotence).
//   npm run test:migration
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ projectId: 'tilportofoliov2' });
const db = getFirestore();
const results = [];
const check = async (name, fn) => { try { await fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, error: e.message.split('\n')[0] }); } };

const EMAIL = 'visiteur.secret@example.com';
const run = (...a) => spawnSync('node', ['scripts/migrate-quotes.mjs', ...a], { encoding: 'utf8', env: process.env });
const summaryOf = r => JSON.parse(r.stdout.split('\n').find(l => l.startsWith('SUMMARY ')).slice(8));
const all = async col => Object.fromEntries((await db.collection(col).get()).docs.map(d => [d.id, d.data()]));

const base = { explanation: 'x', tags: [], likes: 0, date: new Date() };
await db.doc('quotes/q1').set({ ...base, text: 'legacy sans status', author: 'A' });
await db.doc('quotes/q2').set({ ...base, text: 'legacy avec coordonnées', author: 'B', submitterEmail: EMAIL, submitterRole: 'Dev', submitterLinkedin: 'https://linkedin.com/in/x' });
await db.doc('quotes/q3').set({ ...base, text: 'pending avec email', author: 'C', status: 'pending', submitterEmail: EMAIL, submitterRole: '', submitterLinkedin: '' });
await db.doc('quotes/q4').set({ ...base, text: 'approuvée propre', author: 'D', status: 'approved' });
await db.doc('quotes/q5').set({ ...base, text: 'pending propre', author: 'E', status: 'pending' });
const before = await all('quotes');

await check('sans drapeau : refuse de s\'exécuter', () => { const r = run(); assert.equal(r.status, 2); assert.match(r.stderr, /--dry-run \| --apply/); });
await check('deux drapeaux : refusé', () => assert.equal(run('--dry-run', '--apply').status, 2));

let dry;
await check('dry-run : réussit et annonce les bons comptes', () => {
  dry = run('--dry-run'); assert.equal(dry.status, 0, dry.stderr);
  const s = summaryOf(dry);
  assert.equal(s.total, 5); assert.equal(s.missingStatus, 2); assert.equal(s.withSubmitterFields, 2);
  assert.equal(s.submissionsToCreate, 2); assert.equal(s.toModify, 3); assert.equal(s.mode, 'dry-run');
});
await check('dry-run : n\'affiche jamais l\'email ni le texte des citations', () => {
  assert.ok(!dry.stdout.includes(EMAIL) && !dry.stdout.includes('legacy avec coordonnées'));
});
await check('dry-run : n\'écrit strictement rien', async () => {
  assert.deepEqual(await all('quotes'), before); assert.equal((await db.collection('quoteSubmissions').get()).size, 0);
});

await check('apply : réussit', () => { const r = run('--apply'); assert.equal(r.status, 0, r.stdout + r.stderr); assert.match(r.stdout, /Vérification : OK/); });
await check('apply : citations sans status → approved, submitter* supprimés de quotes', async () => {
  const q = await all('quotes');
  assert.equal(q.q1.status, 'approved'); assert.equal(q.q2.status, 'approved'); assert.equal(q.q3.status, 'pending');
  for (const d of Object.values(q)) for (const k of ['submitterEmail', 'submitterRole', 'submitterLinkedin']) assert.ok(!(k in d), `${k} encore présent`);
  assert.equal(Object.keys(q).length, 5);
});
await check('apply : coordonnées déplacées vers quoteSubmissions avec quoteId', async () => {
  const s = Object.values(await all('quoteSubmissions'));
  assert.equal(s.length, 2);
  const s2 = s.find(x => x.quoteId === 'q2'), s3 = s.find(x => x.quoteId === 'q3');
  assert.deepEqual(s2, { quoteId: 'q2', email: EMAIL, role: 'Dev', linkedin: 'https://linkedin.com/in/x' });
  assert.deepEqual(s3, { quoteId: 'q3', email: EMAIL });   // champs vides non copiés
});
await check('apply : citations déjà propres inchangées', async () => {
  const q = await all('quotes');
  assert.equal(q.q4.text, before.q4.text); assert.equal(q.q4.status, 'approved'); assert.equal(q.q5.status, 'pending');
});
await check('apply : le contenu des citations est préservé', async () => {
  const q = await all('quotes'); for (const id of ['q1', 'q2', 'q3', 'q4', 'q5']) assert.equal(q[id].text, before[id].text);
});
await check('apply une 2e fois : idempotent (rien à faire, aucun doublon)', async () => {
  const r = run('--apply'); assert.equal(r.status, 0, r.stderr); const s = summaryOf(r);
  assert.equal(s.toModify, 0); assert.equal(s.missingStatus, 0); assert.equal(s.withSubmitterFields, 0);
  assert.equal((await db.collection('quoteSubmissions').get()).size, 2);
});
await check('dry-run après migration : rien à modifier', () => assert.equal(summaryOf(run('--dry-run')).toModify, 0));

for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : ' — ' + r.error}`);
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} réussis`);
process.exit(failed.length ? 1 : 0);
