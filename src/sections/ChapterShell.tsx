/**
 * One SKOPE chapter. The wrapper carries `data-scene` (the particle director reads it); the motion engine
 * pins it on desktop (~150vh) and broadcasts its progress so overlays and shader accents move together.
 */
export default function ChapterShell({ scene, children }: { scene: 'ledger' | 'clock' | 'route'; children: React.ReactNode }) {
  return (
    <div className="chapter-wrap" data-scene={scene} data-chapter>
      <article className="chapter">{children}</article>
    </div>
  )
}
