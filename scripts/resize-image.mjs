/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  resize-image.mjs  —  Redimensionne une image aux bonnes dimensions du site
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  INSTALLATION (une seule fois) :
 *    bun add -d sharp          (recommandé)
 *    # ou :  npm install -D sharp
 *
 *  UTILISATION :
 *    node scripts/resize-image.mjs <input> [output] [--preset=<nom>]
 *
 *  EXEMPLES :
 *    node scripts/resize-image.mjs photo.jpg
 *      → public/images/blog/photo.jpg  (preset blog par défaut)
 *
 *    node scripts/resize-image.mjs ma-photo.jpg --preset=montage
 *      → public/images/montage/ma-photo.jpg
 *
 *    node scripts/resize-image.mjs ma-photo.jpg public/images/montage/photo-1.jpg
 *      → chemin de sortie explicite
 *
 *  PRESETS :
 *    blog     → 1200 × 630 px  (couvertures d'articles, ratio 16:9)
 *    montage  →  900 × 600 px  (grille Cameroun, page Home)
 *    travel   →  900 × 500 px  (carrousel, page About)
 *    profile  →  400 × 400 px  (carte profil, page About)
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname, basename, extname, join } from 'path';

const PRESETS = {
  blog:    { width: 1200, height: 630,  folder: 'public/images/blog'    },
  montage: { width:  900, height: 600,  folder: 'public/images/montage' },
  travel:  { width:  900, height: 500,  folder: 'public/images/travel'  },
  profile: { width:  400, height: 400,  folder: 'public/images/profile' },
};

// ── Parse arguments ────────────────────────────────────────────────────────
const rawArgs  = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flagArgs = process.argv.slice(2).filter(a => a.startsWith('--'));

const inputPath = rawArgs[0];
if (!inputPath) {
  console.error('Usage: node scripts/resize-image.mjs <input> [output] [--preset=<nom>]');
  console.error('Presets: blog | montage | travel | profile');
  process.exit(1);
}

const presetFlag = flagArgs.find(f => f.startsWith('--preset='));
const presetName = presetFlag ? presetFlag.split('=')[1] : 'blog';
const preset     = PRESETS[presetName];

if (!preset) {
  console.error(`Preset inconnu : "${presetName}". Choix : ${Object.keys(PRESETS).join(' | ')}`);
  process.exit(1);
}

const inputResolved = resolve(inputPath);
if (!existsSync(inputResolved)) {
  console.error(`Fichier introuvable : ${inputResolved}`);
  process.exit(1);
}

const outputFolder = rawArgs[1] ? dirname(resolve(rawArgs[1])) : resolve(preset.folder);
const outputFile   = rawArgs[1]
  ? resolve(rawArgs[1])
  : join(outputFolder, basename(inputPath, extname(inputPath)) + '.jpg');

mkdirSync(outputFolder, { recursive: true });

// ── Resize with sharp ──────────────────────────────────────────────────────
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error(
    '\n  sharp n\'est pas installé. Lance d\'abord :\n' +
    '    bun add -d sharp\n' +
    '  puis relance ce script.\n'
  );
  process.exit(1);
}

console.log(`\n  Redimensionnement en cours…`);
console.log(`  Entrée  : ${inputResolved}`);
console.log(`  Sortie  : ${outputFile}`);
console.log(`  Taille  : ${preset.width} × ${preset.height} px (${presetName})\n`);

await sharp(inputResolved)
  .resize(preset.width, preset.height, {
    fit:      'cover',          // recadrage centré
    position: 'centre',
  })
  .jpeg({ quality: 85, progressive: true })
  .toFile(outputFile);

console.log(`  ✓ Image enregistrée → ${outputFile}`);
console.log(`  Pense à mettre à jour src/app/core/config/images.config.ts si besoin.\n`);
