import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToId } from '../lib/nav'
import { useSeo } from '../lib/seo'
import { useTone } from '../lib/tone'
import Approvals from '../sections/Approvals'
import Band from '../sections/Band'
import Compare from '../sections/Compare'
import Construction from '../sections/Construction'
import Contact from '../sections/Contact'
import Featured from '../sections/Featured'
import Finder from '../sections/Finder'
import Hero from '../sections/Hero'
import Inside from '../sections/Inside'
import Process from '../sections/Process'
import Projects from '../sections/Projects'
import Services from '../sections/Services'
import Statement from '../sections/Statement'
import Story from '../sections/Story'

/*
 * Page journey: first impression → who we are → what are you looking for →
 * the featured project → how a building comes together → drawing vs. design →
 * our work → services → approvals → why trust us → enquiry.
 */
export default function Home() {
  useSeo('', 'Regal Civil Engineers, Tirupati: 3BHK flats at TUDA-approved ACS Heights, house construction, building plans, 2D and 3D elevations, structural design and approvals.')
  const loc = useLocation()
  const nav = useNavigate()
  const page = useRef<HTMLDivElement>(null)
  useTone(page)

  // arriving from another page with a section to show
  useEffect(() => {
    const state = loc.state as { scrollTo?: string; enquiry?: unknown } | null
    if (!state?.scrollTo) return
    const t = setTimeout(() => {
      ScrollTrigger.refresh()
      scrollToId(state.scrollTo!)
      nav('.', { replace: true, state: state.enquiry ? { enquiry: state.enquiry } : null })
    }, 80)
    return () => clearTimeout(t)
  }, [loc.state, nav])

  return (
    <div ref={page} className="tone" data-tone="dark">
      <Hero />
      <Band />
      <Statement />
      <Finder />
      <Construction />
      <Featured />
      <Inside />
      <Process />
      <Compare />
      <Projects />
      <Services />
      <Approvals />
      <Story />
      <Contact />
    </div>
  )
}
