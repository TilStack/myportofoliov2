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
  { id: 'mobile',  icon: 'mobile',   label: { fr: 'Mobile',  en: 'Mobile' },   main: ['Flutter', 'Dart'] },
  { id: 'web',     icon: 'web',      label: { fr: 'Web',     en: 'Web' },      main: ['Angular', 'TypeScript'] },
  { id: 'backend', icon: 'backend',  label: { fr: 'Backend', en: 'Backend' },  main: ['FastAPI', 'Python', 'REST'], secondary: ['NestJS', 'Node.js'] },
  { id: 'data',    icon: 'database', label: { fr: 'Données', en: 'Data' },     main: ['MongoDB', 'Firebase'] },
  { id: 'devops',  icon: 'devops',   label: { fr: 'DevOps',  en: 'DevOps' },   main: ['Docker', 'Firebase Hosting'] },
  { id: 'ai',      icon: 'ai',       label: { fr: 'IA',      en: 'AI' },       main: ['Claude Code', 'NotebookLM', 'Gemini'] },
];

export const MULTIMEDIA_SKILLS = ['Photoshop', 'Canva', 'CapCut'];
