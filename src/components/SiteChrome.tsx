'use client'
import dynamic from 'next/dynamic'
import type { PaletteData } from './Palette'

/** Client-only extras that are loaded after the first paint, so they never touch the initial JS budget. */
const Palette = dynamic(() => import('./Palette'), { ssr: false })

export default function LazyPalette({ data }: { data: PaletteData }) {
  return <Palette data={data} />
}
