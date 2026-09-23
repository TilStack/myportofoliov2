// Tests des règles Firestore (firestore.rules) contre l'émulateur.
//   npm run test:rules
//
// Couvre : visiteur anonyme, utilisateur connecté non admin, admin non vérifié, admin,
// et tentatives malveillantes (lecture d'une citation pending, lecture de quoteSubmissions,
// suppression, like négatif, injection de champs, dépassements de taille).

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, doc, collection,
         query, where, writeBatch, Timestamp } from 'firebase/firestore';

const ADMIN_UID = 'admin-uid-test';
const source = readFileSync('firestore.rules', 'utf8');
// Remplace l'UID admin (marqueur avant configuration, vrai UID après) par un UID de test.
const ADMIN_LINE = /request\.auth\.uid == '[^']*'/g;
assert.equal(source.match(ADMIN_LINE)?.length, 1, 'isAdmin() doit comparer request.auth.uid à exactement une valeur');

const testEnv = await initializeTestEnvironment({
  projectId: 'tilportofoliov2',
  firestore: { rules: source.replace(ADMIN_LINE, `request.auth.uid == '${ADMIN_UID}'`), host: '127.0.0.1', port: 8080 },
});

const results = [];
const check = async (name, fn) => {
  try { await fn(); results.push({ name, ok: true }); }
  catch (e) { results.push({ name, ok: false, error: e.message.split('\n')[0] }); }
};

// ── Données de départ (règles désactivées) ──
await testEnv.withSecurityRulesDisabled(async ctx => {
  const db = ctx.firestore();
  const base = { explanation: 'x', date: Timestamp.now(), tags: [], likes: 3 };
  await setDoc(doc(db, 'quotes/approved1'), { ...base, text: 'Approuvée', author: 'A', status: 'approved' });
  await setDoc(doc(db, 'quotes/zero'),      { ...base, text: 'Zéro like', author: 'A', status: 'approved', likes: 0 });
  await setDoc(doc(db, 'quotes/pending1'),  { ...base, text: 'En attente', author: 'B', status: 'pending', likes: 0 });
  await setDoc(doc(db, 'quoteSubmissions/s1'), { quoteId: 'pending1', email: 'visiteur@example.com' });
  await setDoc(doc(db, 'projects/p1'), { title: 'x' });
});

const anon    = testEnv.unauthenticatedContext().firestore();
const other   = testEnv.authenticatedContext('someone-else', { email: 'x@y.z', email_verified: true }).firestore();
const unverif = testEnv.authenticatedContext(ADMIN_UID, { email: 'a@b.c', email_verified: false }).firestore();
const admin   = testEnv.authenticatedContext(ADMIN_UID, { email: 'a@b.c', email_verified: true }).firestore();

const validQuote = (over = {}) => ({
  text: 'Une belle citation', author: 'Awa', explanation: 'Parce que.', date: Timestamp.now(),
  tags: [], likes: 0, status: 'pending', ...over,
});
const validSub = (over = {}) => ({ quoteId: 'q123', email: 'awa@example.com', ...over });
const approvedList = db => query(collection(db, 'quotes'), where('status', '==', 'approved'));
const pendingList  = db => query(collection(db, 'quotes'), where('status', '==', 'pending'));

// ═════════════ Visiteur anonyme : lectures ═════════════
await check('anon: lit une citation approuvée', () => assertSucceeds(getDoc(doc(anon, 'quotes/approved1'))));
await check('anon: liste filtrée status==approved OK et ne renvoie que les approuvées', async () => {
  const snap = await assertSucceeds(getDocs(approvedList(anon)));
  assert.deepEqual(snap.docs.map(d => d.id).sort(), ['approved1', 'zero']);
});
await check('anon: liste NON filtrée refusée', () => assertFails(getDocs(collection(anon, 'quotes'))));
await check('anon: liste status==pending refusée', () => assertFails(getDocs(pendingList(anon))));
await check('anon: lecture d\'une citation pending par id refusée', () => assertFails(getDoc(doc(anon, 'quotes/pending1'))));
await check('anon: lecture de quoteSubmissions (get) refusée', () => assertFails(getDoc(doc(anon, 'quoteSubmissions/s1'))));
await check('anon: lecture de quoteSubmissions (liste) refusée', () => assertFails(getDocs(collection(anon, 'quoteSubmissions'))));
await check('anon: autre collection (projects) refusée en lecture', () => assertFails(getDoc(doc(anon, 'projects/p1'))));
await check('anon: autre collection refusée en écriture', () => assertFails(setDoc(doc(anon, 'projects/p2'), { title: 'x' })));

// ═════════════ Visiteur anonyme : propositions ═════════════
await check('anon: proposition valide (pending) acceptée', () => assertSucceeds(addDoc(collection(anon, 'quotes'), validQuote())));
await check('anon: proposition avec date ISO (string) acceptée', () => assertSucceeds(addDoc(collection(anon, 'quotes'), validQuote({ date: new Date().toISOString() }))));
await check('anon: proposition avec catégorie ≤ 50 acceptée', () => assertSucceeds(addDoc(collection(anon, 'quotes'), validQuote({ category: 'c'.repeat(50) }))));
await check('anon: lot atomique citation + coordonnées accepté', async () => {
  const b = writeBatch(anon); const q = doc(collection(anon, 'quotes'));
  b.set(q, validQuote()); b.set(doc(collection(anon, 'quoteSubmissions')), validSub({ quoteId: q.id, role: 'Dev', linkedin: 'https://linkedin.com/in/x' }));
  await assertSucceeds(b.commit());
});
await check('anon: injection submitterEmail dans quotes refusée', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ submitterEmail: 'a@b.c' }))));
await check('anon: injection submitterRole dans quotes refusée', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ submitterRole: 'x' }))));
await check('anon: injection submitterLinkedin dans quotes refusée', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ submitterLinkedin: 'x' }))));
await check('anon: champ inconnu (isAdmin) refusé', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ isAdmin: true }))));
await check('anon: création directe en status approved refusée', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ status: 'approved' }))));
await check('anon: likes initiaux ≠ 0 refusés', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ likes: 99 }))));
await check('anon: tags non vides refusés', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ tags: ['x'] }))));
await check('anon: champ obligatoire manquant (explanation) refusé', () => { const q = validQuote(); delete q.explanation; return assertFails(addDoc(collection(anon, 'quotes'), q)); });
await check('anon: text vide refusé', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ text: '' }))));
await check('anon: text > 2000 refusé', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ text: 'x'.repeat(2001) }))));
await check('anon: author > 200 refusé', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ author: 'x'.repeat(201) }))));
await check('anon: explanation = 4000 accepté', () => assertSucceeds(addDoc(collection(anon, 'quotes'), validQuote({ explanation: 'x'.repeat(4000) }))));
await check('anon: explanation > 4000 refusé', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ explanation: 'x'.repeat(4001) }))));
await check('anon: category > 50 refusée', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ category: 'c'.repeat(51) }))));
await check('anon: category non-string refusée', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ category: 42 }))));
await check('anon: date de mauvais type (nombre) refusée', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ date: 12345 }))));
await check('anon: text de mauvais type refusé', () => assertFails(addDoc(collection(anon, 'quotes'), validQuote({ text: 123 }))));

// ═════════════ Visiteur anonyme : quoteSubmissions ═════════════
await check('anon: coordonnées valides (email seul) acceptées', () => assertSucceeds(addDoc(collection(anon, 'quoteSubmissions'), validSub())));
await check('anon: coordonnées complètes acceptées', () => assertSucceeds(addDoc(collection(anon, 'quoteSubmissions'), validSub({ role: 'r'.repeat(100), linkedin: 'l'.repeat(300) }))));
await check('anon: role > 100 refusé', () => assertFails(addDoc(collection(anon, 'quoteSubmissions'), validSub({ role: 'r'.repeat(101) }))));
await check('anon: linkedin > 300 refusé', () => assertFails(addDoc(collection(anon, 'quoteSubmissions'), validSub({ linkedin: 'l'.repeat(301) }))));
await check('anon: quoteId > 128 refusé', () => assertFails(addDoc(collection(anon, 'quoteSubmissions'), validSub({ quoteId: 'q'.repeat(129) }))));
await check('anon: quoteId vide refusé', () => assertFails(addDoc(collection(anon, 'quoteSubmissions'), validSub({ quoteId: '' }))));
await check('anon: quoteId de mauvais type refusé', () => assertFails(addDoc(collection(anon, 'quoteSubmissions'), validSub({ quoteId: 5 }))));
await check('anon: email invalide refusé', () => assertFails(addDoc(collection(anon, 'quoteSubmissions'), validSub({ email: 'pas-un-email' }))));
await check('anon: email > 254 refusé', () => assertFails(addDoc(collection(anon, 'quoteSubmissions'), validSub({ email: 'a'.repeat(250) + '@b.co' }))));
await check('anon: champ inconnu dans quoteSubmissions refusé', () => assertFails(addDoc(collection(anon, 'quoteSubmissions'), validSub({ isAdmin: true }))));
await check('anon: quoteSubmissions sans quoteId refusé', () => assertFails(addDoc(collection(anon, 'quoteSubmissions'), { email: 'a@b.co' })));
await check('anon: modification d\'une coordonnée refusée', () => assertFails(updateDoc(doc(anon, 'quoteSubmissions/s1'), { email: 'autre@example.com' })));
await check('anon: suppression d\'une coordonnée refusée', () => assertFails(deleteDoc(doc(anon, 'quoteSubmissions/s1'))));

// ═════════════ Visiteur anonyme : likes et modifications ═════════════
await check('anon: like +1 accepté', () => assertSucceeds(updateDoc(doc(anon, 'quotes/approved1'), { likes: 4 })));
await check('anon: unlike -1 accepté', () => assertSucceeds(updateDoc(doc(anon, 'quotes/approved1'), { likes: 3 })));
await check('anon: like +2 refusé', () => assertFails(updateDoc(doc(anon, 'quotes/approved1'), { likes: 5 })));
await check('anon: like négatif (0 → -1) refusé', () => assertFails(updateDoc(doc(anon, 'quotes/zero'), { likes: -1 })));
await check('anon: like non numérique refusé', () => assertFails(updateDoc(doc(anon, 'quotes/approved1'), { likes: '4' })));
await check('anon: like sur une citation pending refusé', () => assertFails(updateDoc(doc(anon, 'quotes/pending1'), { likes: 1 })));
await check('anon: modification du texte refusée', () => assertFails(updateDoc(doc(anon, 'quotes/approved1'), { text: 'piraté' })));
await check('anon: like + texte dans la même écriture refusé', () => assertFails(updateDoc(doc(anon, 'quotes/approved1'), { likes: 4, text: 'piraté' })));
await check('anon: auto-approbation (status) refusée', () => assertFails(updateDoc(doc(anon, 'quotes/pending1'), { status: 'approved' })));
await check('anon: injection submitterEmail par update refusée', () => assertFails(updateDoc(doc(anon, 'quotes/approved1'), { submitterEmail: 'x@y.z' })));
await check('anon: suppression d\'une citation refusée', () => assertFails(deleteDoc(doc(anon, 'quotes/approved1'))));
await check('anon: suppression d\'une citation pending refusée', () => assertFails(deleteDoc(doc(anon, 'quotes/pending1'))));

// ═════════════ Utilisateur connecté mais non admin / admin non vérifié ═════════════
await check('non-admin connecté: lecture pending refusée', () => assertFails(getDocs(pendingList(other))));
await check('non-admin connecté: lecture quoteSubmissions refusée', () => assertFails(getDocs(collection(other, 'quoteSubmissions'))));
await check('non-admin connecté: suppression refusée', () => assertFails(deleteDoc(doc(other, 'quotes/approved1'))));
await check('non-admin connecté: création approved refusée', () => assertFails(addDoc(collection(other, 'quotes'), validQuote({ status: 'approved' }))));
await check('bon UID mais email non vérifié: lecture quoteSubmissions refusée', () => assertFails(getDocs(collection(unverif, 'quoteSubmissions'))));
await check('bon UID mais email non vérifié: suppression refusée', () => assertFails(deleteDoc(doc(unverif, 'quotes/approved1'))));

// ═════════════ Admin ═════════════
await check('admin: liste des pending', async () => { const s = await assertSucceeds(getDocs(pendingList(admin))); assert.ok(s.size >= 1); });
await check('admin: liste non filtrée de quotes', () => assertSucceeds(getDocs(collection(admin, 'quotes'))));
await check('admin: lit quoteSubmissions', () => assertSucceeds(getDocs(collection(admin, 'quoteSubmissions'))));
await check('admin: crée une citation approuvée', () => assertSucceeds(addDoc(collection(admin, 'quotes'), validQuote({ status: 'approved', category: 'Growth', tags: ['a', 'b'], likes: 0 }))));
await check('admin: modifie le texte', () => assertSucceeds(updateDoc(doc(admin, 'quotes/approved1'), { text: 'Corrigée' })));
await check('admin: approuve une proposition', () => assertSucceeds(updateDoc(doc(admin, 'quotes/pending1'), { status: 'approved' })));
await check('admin: supprime une citation', () => assertSucceeds(deleteDoc(doc(admin, 'quotes/zero'))));
await check('admin: supprime une coordonnée', () => assertSucceeds(deleteDoc(doc(admin, 'quoteSubmissions/s1'))));
await check('admin: ne peut pas écrire submitterEmail dans quotes', () => assertFails(addDoc(collection(admin, 'quotes'), validQuote({ status: 'approved', submitterEmail: 'a@b.c' }))));
await check('admin: ne peut pas ajouter submitterEmail par update', () => assertFails(updateDoc(doc(admin, 'quotes/approved1'), { submitterEmail: 'a@b.c' })));
await check('admin: autre collection toujours refusée', () => assertFails(setDoc(doc(admin, 'projects/p9'), { title: 'x' })));

await testEnv.cleanup();

const failed = results.filter(r => !r.ok);
for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : ' — ' + r.error}`);
console.log(`\n${results.length - failed.length}/${results.length} réussis`);
process.exit(failed.length ? 1 : 0);
