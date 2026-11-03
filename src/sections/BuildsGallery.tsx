/**
 * Desktop: a pinned section where vertical scroll moves the cards sideways (scrubbed, reversible),
 * with drag + inertia, arrow keys and a small velocity skew (all in the motion engine).
 * Mobile / no JS / reduced motion: a native scroll-snap track.
 */
export default function BuildsGallery({ children }: { children: React.ReactNode }) {
  return (
    <div className="builds__stage">
      <ul className="builds__track" tabIndex={0} aria-label="Personal projects. Use the left and right arrow keys to move through them.">
        {children}
      </ul>
    </div>
  )
}
