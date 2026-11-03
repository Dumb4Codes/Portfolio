import SmoothScroll from '@/components/SmoothScroll'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <main id="main" className="site-main">
        {children}
      </main>
    </>
  )
}
