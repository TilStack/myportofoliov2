import { IconName } from '../shared/components/icon/icon.component';

/** Compétences par couches (page À propos), en texte. Multimédia à part, en discret. */

export interface SkillLayer {
  id: string;
  icon: IconName;
  label: { fr: string; en: string };
  /** Utilisées au quotidien. */
  main: string[];
  /** Utilisées, mais pas en premier choix. */
  secondary?: string[];
}

export const SKILL_LAYERS: SkillLayer[] = [
  // `main` = ce que j'utilise le plus en ce moment (mis en avant) ; `secondary` = le reste, en plus discret.
  { id: 'mobile',  icon: 'mobile',   label: { fr: 'Mobile',  en: 'Mobile' },   main: ['Flutter', 'Dart'] },
  { id: 'web',     icon: 'web',      label: { fr: 'Web',     en: 'Web' },      main: ['Angular', 'TypeScript'] },
  { id: 'backend', icon: 'backend',  label: { fr: 'Backend', en: 'Backend' },  main: ['Node.js'], secondary: ['NestJS', 'FastAPI', 'Python', 'REST'] },
  { id: 'data',    icon: 'database', label: { fr: 'Données', en: 'Data' },     main: ['Firebase'], secondary: ['MongoDB'] },
  { id: 'devops',  icon: 'devops',   label: { fr: 'DevOps',  en: 'DevOps' },   main: ['Firebase Hosting'], secondary: ['Docker'] },
  { id: 'ai',      icon: 'ai',       label: { fr: 'IA',      en: 'AI' },       main: ['Claude Code', 'Claude', 'ChatGPT', 'NotebookLM', 'Gemini'] },
];

export const MULTIMEDIA_SKILLS = ['Photoshop', 'Canva', 'CapCut'];

/**
 * Logos des technologies (Simple Icons, CC0) : fichiers dans public/images/tech/, colorés via un masque CSS pour
 * rester lisibles en thème clair comme en sombre. Pas de logo (REST…) : une pastille de texte est affichée.
 * `color` absent : couleur du texte du thème.
 */
export const TECH_LOGOS: Record<string, { file: string; color?: string }> = {
  Flutter:            { file: 'flutter',      color: '#02569B' },
  Dart:               { file: 'dart',         color: '#0175C2' },
  Angular:            { file: 'angular',      color: '#DD0031' },
  TypeScript:         { file: 'typescript',   color: '#3178C6' },
  FastAPI:            { file: 'fastapi',      color: '#009688' },
  Python:             { file: 'python',       color: '#3776AB' },
  NestJS:             { file: 'nestjs',       color: '#E0234E' },
  'Node.js':          { file: 'nodedotjs',    color: '#5FA04E' },
  MongoDB:            { file: 'mongodb',      color: '#47A248' },
  Firebase:           { file: 'firebase',     color: '#F57C00' },
  'Firebase Hosting': { file: 'firebase',     color: '#F57C00' },
  Docker:             { file: 'docker',       color: '#2496ED' },
  'Claude Code':      { file: 'claude',       color: '#D97757' },
  Claude:             { file: 'claude',       color: '#D97757' },
  Gemini:             { file: 'googlegemini', color: '#8E75B2' },
  NotebookLM:         { file: 'notebooklm' },
};
