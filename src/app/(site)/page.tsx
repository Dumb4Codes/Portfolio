import { getSiteData } from '@/content/reader'

export default async function Home() {
  const d = await getSiteData()
  return (
    <div className="wrap" style={{ paddingBlock: 80 }}>
      <h1 className="display" style={{ fontSize: 'clamp(48px,12vw,200px)' }}>{d.profile.name}</h1>
      <p>{d.profile.headline}</p>
      <ul>
        {d.projects.map((p) => (
          <li key={p.slug}>{p.title} · {p.kind} · {p.year}</li>
        ))}
      </ul>
      <p>{d.testsTotal} checks · {d.currentJob?.company}</p>
    </div>
  )
}
