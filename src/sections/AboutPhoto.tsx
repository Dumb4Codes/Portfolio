/** Duotone photo; the motion engine reveals full colour on hover or tap and adds a slow parallax. */
export default function AboutPhoto({ children }: { children: React.ReactNode }) {
  return (
    <figure className="about__photo" data-color="false">
      {children}
      <span className="about__tone" aria-hidden="true" />
      <figcaption className="mono muted about__cap" aria-hidden="true">
        Tap or hover for colour
      </figcaption>
    </figure>
  )
}
