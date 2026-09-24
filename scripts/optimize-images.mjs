#!/usr/bin/env node
/**
 * Convertit les images sources (assets-src/images/**, hors du build) en WebP responsives dans public/,
 * et écrit src/app/data/image-manifest.ts (largeur/hauteur + largeurs disponibles) : les templates en
 * tirent width/height et srcset (NgOptimizedImage).
 *
 *   npm run images
 *
 * Nommage : <nom>-<largeur>.webp pour chaque variante, <nom>.webp = la plus grande (celle du manifeste).
 * Pour ajouter une image : la déposer dans assets-src/images/, ajouter une ligne à JOBS, relancer.
 * Objectif du site : aucune image > 200 Ko.
 */
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'assets-src');
const PUBLIC = join(ROOT, 'public');

/**
 * src : chemin sous assets-src/ ; widths : largeurs générées (plafonnées à la largeur native) ;
 * q : qualité WebP ; crop : recadrage avant redimensionnement ; og : slug → copie JPEG 1200×630 pour og:image.
 */
const JOBS = [
  // Accueil — hero (LCP) : carte 156–220 px de large, ratio 3/4 recadré par le haut comme le fait le CSS
  { src: 'images/profile/me_simple.jpg', widths: [220, 330, 440], q: 74, crop: { ratio: 3 / 4 } },
  { src: 'images/profile/me2.jpg', widths: [400, 720], q: 74 },
  // À propos — pile de photos (ratio 3/4) et galerie formation (4/3, lightbox = plus grande)
  { src: 'images/profile/me_pro.jpg', widths: [320, 640], q: 74 },
  { src: 'images/profile/me.jpg', widths: [320, 640], q: 74 },
  { src: 'images/profile/me_charisme.jpg', widths: [320, 576], q: 74 },
  { src: 'images/formateur.png', widths: [480, 960, 1280], q: 70 },
  { src: 'images/mentor.jpg', widths: [480, 960, 1280], q: 70 },
  { src: 'images/tech_lead.jpg', widths: [480, 960, 1280], q: 70 },
  // Avatar : 64 px dans la mascotte, quelques dizaines de px ailleurs
  { src: 'images/profile/tiktok_avatar.png', widths: [128, 256], q: 80 },
  // Logos des contributeurs
  { src: 'images/projects/devpea_logo.jpeg', widths: [100], q: 82 },
  { src: 'images/projects/levegi_logo.jpg', widths: [96, 192], q: 82 },
  // Captures de projets
  { src: 'images/projects/dofa_capture1.jpg', widths: [320, 576], q: 72, og: 'dofa' },
  { src: 'images/projects/dofa_capture2.jpg', widths: [320, 576], q: 72 },
  { src: 'images/projects/dofa_capture3.jpg', widths: [320, 576], q: 72 },
  { src: 'images/projects/dofa_capture4.jpg', widths: [320, 576], q: 72 },
  { src: 'images/projects/devpea-1.jpg', widths: [640, 1200], q: 74, og: 'devpea-website' },
  { src: 'images/projects/levefly-1.png', widths: [400], q: 80, og: 'levefly' },
  { src: 'images/projects/cagnotte-1.png', widths: [640, 1200], q: 74, og: 'mycagnotte' },
  { src: 'images/projects/pokemon-1.png', widths: [640, 1200], q: 74, og: 'mypokemon' },
];

const NAVY = '#14213D';
const manifest = {};
const report = [];

for (const job of JOBS) {
  const input = join(SRC, job.src);
  const meta = await sharp(input).metadata();
  const base = job.src.replace(/\.[^.]+$/, '');
  let pipeline = () => sharp(input);
  let nativeW = meta.width, nativeH = meta.height;
  if (job.crop) { // recadrage par le haut au ratio voulu
    nativeH = Math.round(meta.width / job.crop.ratio);
    const region = { left: 0, top: 0, width: meta.width, height: Math.min(nativeH, meta.height) };
    pipeline = () => sharp(input).extract(region);
  }
  const widths = [...new Set(job.widths.map(w => Math.min(w, nativeW)))].sort((a, b) => a - b);
  const max = widths.at(-1);
  for (const w of widths) {
    const out = w === max ? `${base}.webp` : `${base}-${w}.webp`;
    mkdirSync(dirname(join(PUBLIC, out)), { recursive: true });
    await pipeline().resize({ width: w }).webp({ quality: job.q, effort: 6, alphaQuality: 90 }).toFile(join(PUBLIC, out));
    report.push({ file: out, kB: Math.round(statSync(join(PUBLIC, out)).size / 1024) });
  }
  manifest[`${base}.webp`] = { w: max, h: Math.round(nativeH * max / nativeW), widths };

  if (job.og) { // og:image : JPEG 1200×630, capture centrée sur fond navy (les réseaux sociaux n'affichent pas toujours le WebP)
    const out = `assets/og/projects/${job.og}.jpg`;
    mkdirSync(dirname(join(PUBLIC, out)), { recursive: true });
    const shot = await sharp(input).resize({ height: 570, width: 1100, fit: 'inside' }).flatten({ background: NAVY }).toBuffer();
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: NAVY } })
      .composite([{ input: shot, gravity: 'center' }]).jpeg({ quality: 82, mozjpeg: true }).toFile(join(PUBLIC, out));
    report.push({ file: out, kB: Math.round(statSync(join(PUBLIC, out)).size / 1024) });
  }
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(ROOT, 'src/app/data/image-manifest.ts'), `// Généré par scripts/optimize-images.mjs (npm run images) — ne pas modifier à la main.
export interface ImageInfo {
  /** Largeur / hauteur de la plus grande variante (celle du chemin sans suffixe). */
  w: number;
  h: number;
  /** Largeurs disponibles, dont la plus grande. Variante : <chemin sans .webp>-<largeur>.webp. */
  widths: number[];
}

export const IMAGE_MANIFEST: Record<string, ImageInfo> = ${JSON.stringify(sorted, null, 2)};
`);
for (const r of report) console.log(String(r.kB).padStart(5) + ' kB', r.file);
console.log(`\n${report.length} fichiers, ${report.reduce((s, r) => s + r.kB, 0)} kB au total`);
