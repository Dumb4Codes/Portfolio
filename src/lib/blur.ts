import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

/** Blur placeholders for several images at once: { '/images/x.webp': 'data:...' } (missing files are skipped). */
export async function blurMap(paths: (string | undefined)[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  await Promise.all(
    paths.map(async (p) => {
      if (!p) return
      const b = await blurFor(p)
      if (b) out[p] = b
    }),
  )
  return out
}

const cache = new Map<string, string | undefined>()

/** Tiny blurred data-URL for next/image placeholders, generated from /public at build time. */
export async function blurFor(publicPath: string): Promise<string | undefined> {
  if (cache.has(publicPath)) return cache.get(publicPath)
  let out: string | undefined
  try {
    const file = path.join(process.cwd(), 'public', publicPath)
    if (fs.existsSync(file)) {
      const buf = await sharp(file).resize(16).blur(1).webp({ quality: 40 }).toBuffer()
      out = `data:image/webp;base64,${buf.toString('base64')}`
    }
  } catch {
    out = undefined
  }
  cache.set(publicPath, out)
  return out
}
