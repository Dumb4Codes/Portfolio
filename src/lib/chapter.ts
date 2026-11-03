/**
 * Shared progress curve for a chapter. The particle director (shader `uLocal`) and the DOM overlays
 * both use it, so ledger rows, the clock sweep and the rider pulse stay in step.
 * `top`/`height` are the chapter wrapper's document box; `center` is scrollY + viewportHeight / 2.
 */
export const chapterLocal = (center: number, top: number, height: number) => {
  const raw = (center - top) / Math.max(1, height)
  return Math.min(1, Math.max(0, (raw - 0.1) / 0.75))
}
