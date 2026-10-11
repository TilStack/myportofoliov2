/**
 * Les citations d'Israel Tientcheu (nom écrit dans les deux sens, ou alias TilStack) montrent son logo
 * à la place des initiales ; les autres auteurs gardent leurs initiales.
 */
const OWNER = /^\s*(israel\s+tientcheu|tientcheu\s+israel|tilstack)\s*$/i;

export function isOwnerAuthor(author: string): boolean {
  return OWNER.test(author ?? '');
}

/** Logo affiché pour l'auteur propriétaire (carré marine + logo jaune). */
export const OWNER_AVATAR = 'favicon.svg';
