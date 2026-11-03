import type { Metadata, Viewport } from 'next'
import { Archivo, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { SITE_URL } from '@/lib/site'
import './globals.css'

// Display + mono are preloaded; the serif accent is only used for a few words so it is not.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
  adjustFontFallback: true,
})
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  display: 'swap',
  variable: '--font-instrument',
  preload: false,
})
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Youvraj Singh, Full-Stack Developer in Bengaluru', template: '%s' },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0B' },
    { media: '(prefers-color-scheme: light)', color: '#EFEAE1' },
  ],
}

// Runs before first paint: theme without flash, and the `js` flag that arms reveal animations.
const BOOT = `try{var d=document.documentElement,t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';d.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}document.documentElement.classList.add('js');try{if(location.pathname==='/'&&!sessionStorage.getItem('pre')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('preload')}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivo.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
