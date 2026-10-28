import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import BackToTop from './components/BackToTop'
import MobileBar from './components/MobileBar'
import { Cursor, Intro, RouteCurtain, ScrollProgress } from './components/motion'
import { startSmoothScroll } from './lib/smooth'
import Footer from './components/Footer'
import Nav from './components/Nav'
import ProjectTransition from './components/ProjectTransition'
import Home from './pages/Home'

const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'))
const Legal = lazy(() => import('./pages/Legal'))
const NotFound = lazy(() => import('./pages/NotFound'))

// VITE_ROUTER=hash for static hosts that cannot rewrite unknown paths to index.html
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter

function Shell({ children }: { children: ReactNode }) {
  const loc = useLocation()
  useEffect(() => startSmoothScroll(), [])
  // pinned/scrubbed sections need fresh measurements after a route change
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 150)
    return () => clearTimeout(t)
  }, [loc.pathname])
  return (
    <>
      <Nav />
      <main id="main">
        <Suspense fallback={<div className="min-h-screen bg-charcoal" />}>{children}</Suspense>
      </main>
      <Footer />
      <BackToTop />
      <MobileBar />
      <ScrollProgress />
      <RouteCurtain />
      <ProjectTransition />
      <Cursor />
      <Intro />
    </>
  )
}

export default function App() {
  return (
    <Router basename={import.meta.env.VITE_ROUTER === 'hash' ? undefined : import.meta.env.VITE_BASE_PATH}>
      <Routes>
        <Route
          path="*"
          element={
            <Shell>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects/:slug" element={<ProjectDetail />} />
                <Route path="/services/:slug" element={<ServiceDetail />} />
                <Route path="/legal/:page" element={<Legal />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Shell>
          }
        />
      </Routes>
    </Router>
  )
}
