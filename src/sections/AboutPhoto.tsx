/** The photo, in colour. The motion engine adds a slow parallax on scroll. */
export default function AboutPhoto({ children }: { children: React.ReactNode }) {
  return <figure className="about__photo">{children}</figure>
}
