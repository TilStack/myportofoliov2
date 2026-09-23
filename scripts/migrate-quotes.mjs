#!/usr/bin/env node
/**
 * Migration des citations vers le nouveau modèle de sécurité (Firebase Admin SDK).
 *
 *  1. Donne `status: 'approved'` aux citations qui n'ont pas de status.
 *  2. Déplace submitterEmail / submitterRole / submitterLinkedin de `quotes` vers
 *     `quoteSubmissions` (avec `quoteId`), puis les supprime de `quotes`.
 *
 * Usage :
 *   node scripts/migrate-quotes.mjs --dry-run   # affiche les comptes, n'écrit rien
 *   node scripts/migrate-quotes.mjs --apply     # applique la migration
 *
 * Identifiants (production) : compte de service, HORS du dépôt (jamais commité) :
 *   export GOOGLE_APPLICATION_CREDENTIALS=/chemin/vers/service-account.json
 * Émulateur : FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 (aucun identifiant requis).
 *
 * Le script est idempotent (relançable) et n'affiche que des comptes : jamais le
 * contenu des citations ni les coordonnées des visiteurs.
 */
import { existsSync, readFileSync } from 'node:fs';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const SUBMITTER_FIELDS = { submitterEmail: 'email', submitterRole: 'role', submitterLinkedin: 'linkedin' };
const BATCH_LIMIT = 400; // Firestore : 500 écritures max par lot

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const apply  = args.includes('--apply');
if (dryRun === apply) {
  console.error('Usage : node scripts/migrate-quotes.mjs --dry-run | --apply');
  console.error('  (un seul des deux drapeaux est requis)');
  process.exit(2);
}

const argValue = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const projectId = argValue('--project') ?? process.env.GCLOUD_PROJECT
  ?? JSON.parse(readFileSync(new URL('../.firebaserc', import.meta.url), 'utf8')).projects.default;

const emulator = process.env.FIRESTORE_EMULATOR_HOST;
if (emulator) {
  initializeApp({ projectId });
} else {
  const key = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!key || !existsSync(key)) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS doit pointer vers un fichier de compte de service existant (hors dépôt).');
    process.exit(2);
  }
  initializeApp({ credential: applicationDefault(), projectId });
}
const db = getFirestore();

console.log(`Projet      : ${projectId}${emulator ? ` (ÉMULATEUR ${emulator})` : ' (PRODUCTION)'}`);
console.log(`Mode        : ${dryRun ? 'DRY-RUN (aucune écriture)' : 'APPLY'}`);

const isSet = v => typeof v === 'string' && v.trim() !== '';

async function scan() {
  const quotes = await db.collection('quotes').get();
  const summary = {
    total: quotes.size, approved: 0, pending: 0, unknownStatus: 0,
    missingStatus: 0, withSubmitterFields: 0, submissionsToCreate: 0, submissionsAlreadyMigrated: 0,
    fieldCounts: { submitterEmail: 0, submitterRole: 0, submitterLinkedin: 0 },
  };
  const ops = [];
  for (const d of quotes.docs) {
    const data = d.data();
    if (data.status === 'approved') summary.approved++;
    else if (data.status === 'pending') summary.pending++;
    else if (data.status === undefined) summary.missingStatus++;
    else summary.unknownStatus++;

    const present = Object.keys(SUBMITTER_FIELDS).filter(k => k in data);
    present.forEach(k => summary.fieldCounts[k]++);

    const update = {};
    if (data.status === undefined) update.status = 'approved';
    present.forEach(k => { update[k] = FieldValue.delete(); });

    let submission = null;
    if (present.length) {
      summary.withSubmitterFields++;
      const contact = Object.fromEntries(
        present.filter(k => isSet(data[k])).map(k => [SUBMITTER_FIELDS[k], data[k].trim()]),
      );
      if (Object.keys(contact).length) {
        const ref = db.collection('quoteSubmissions').doc(`migrated-${d.id}`);
        if ((await ref.get()).exists) summary.submissionsAlreadyMigrated++;
        else { summary.submissionsToCreate++; submission = { ref, data: { quoteId: d.id, ...contact } }; }
      }
    }
    if (Object.keys(update).length) ops.push({ quote: d.ref, update, submission });
  }
  return { summary, ops };
}

const { summary, ops } = await scan();
console.log('\n── État actuel ──');
console.log(`Citations                      : ${summary.total}`);
console.log(`  approved / pending           : ${summary.approved} / ${summary.pending}`);
console.log(`  sans status (→ approved)     : ${summary.missingStatus}`);
console.log(`  status inconnu (non modifié) : ${summary.unknownStatus}`);
console.log(`  avec champs submitter*       : ${summary.withSubmitterFields}`
  + `  (email ${summary.fieldCounts.submitterEmail}, role ${summary.fieldCounts.submitterRole}, linkedin ${summary.fieldCounts.submitterLinkedin})`);
console.log('\n── À faire ──');
console.log(`Citations à modifier           : ${ops.length}`);
console.log(`quoteSubmissions à créer       : ${summary.submissionsToCreate}`);
console.log(`quoteSubmissions déjà migrées  : ${summary.submissionsAlreadyMigrated}`);

if (apply && ops.length) {
  let written = 0;
  for (let i = 0; i < ops.length; i += Math.floor(BATCH_LIMIT / 2)) {
    const batch = db.batch();
    for (const op of ops.slice(i, i + Math.floor(BATCH_LIMIT / 2))) {
      if (op.submission) batch.set(op.submission.ref, op.submission.data);
      batch.update(op.quote, op.update);
    }
    await batch.commit();
    written += Math.min(Math.floor(BATCH_LIMIT / 2), ops.length - i);
    console.log(`  … ${written}/${ops.length} citations traitées`);
  }
  const after = (await scan()).summary;
  const ok = after.missingStatus === 0 && after.withSubmitterFields === 0;
  console.log(`\nVérification : ${ok ? 'OK' : 'ÉCHEC'} (sans status ${after.missingStatus}, avec submitter* ${after.withSubmitterFields})`);
  if (!ok) process.exit(1);
} else if (apply) {
  console.log('\nRien à migrer.');
}

console.log(`SUMMARY ${JSON.stringify({ mode: dryRun ? 'dry-run' : 'apply', ...summary, toModify: ops.length })}`);
