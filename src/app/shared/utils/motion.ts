/** Remonte en haut de page : instantané si le visiteur a demandé un mouvement réduit. */
export function scrollToTop(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
}
