import { getSiteData } from '@/content/reader'
import { OG_SIZE, ogImage } from '@/lib/og'

export const alt = 'Youvraj Singh, full-stack developer'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  const { profile } = await getSiteData()
  return ogImage({ title: profile.name, kicker: `${profile.role} · ${profile.location.split(',')[0]}`, sub: profile.headline })
}
