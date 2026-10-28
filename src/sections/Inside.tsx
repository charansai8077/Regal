import { useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useOpenProject } from '../components/ProjectTransition'
import { ArrowIcon } from '../components/ui'
import WorkImage from '../components/WorkImage'
import { projects } from '../data/projects'
import { useEnquire } from '../lib/enquire'

gsap.registerPlugin(ScrollTrigger)

/** Point on the ACS Heights render the camera flies into: a front balcony. */
const FOCUS = '65.4% 53.8%'

const p = projects[0]
const spec = (title: string) => p.specifications.find((s) => s.title === title)?.items ?? []
const details = [
  { title: 'Structure', body: spec('Structure')[0] },
  { title: 'Flooring', body: spec('Flooring')[0] },
  { title: 'Kitchen', body: spec('Kitchen')[1] },
  { title: 'Doors and windows', body: `${spec('Doors')[0]}. ${spec('Windows')[0]}.` },
  { title: 'Lift and security', body: `${spec('Lift and intercom')[0]}. ${spec('Lift and intercom')[2]}.` },
]
const planFacts = [
  ['Flats per floor', '2'],
  ['Each flat', '1,925 sq. ft'],
  ['Facing', 'East'],
  ['Floors', 'Stilt + 5'],
]

/*
 * Inside ACS Heights. The camera flies into a balcony of the render,
 * lands on the isometric 3D view of a typical floor while the brochure
 * specifications are called out, then the floor plan is scanned in.
 * All content is from the project's own drawings and brochure.
 */
export default function Inside() {
  const root = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const enquire = useEnquire()
  const openProject = useOpenProject()

  useEffect(() => {
    if (reduce || !root.current) return
    const q = gsap.utils.selector(root.current)
    const mm = gsap.matchMedia()
    mm.add({ desktop: '(min-width: 768px)', phone: '(max-width: 767px)' }, (ctx) => {
      const desktop = !!ctx.conditions?.desktop
      const tl = gsap.timeline({ defaults: { ease: 'none' } })
      // 1. fly into the building
      tl.fromTo(q('[data-photo]'), { scale: 1 }, { scale: 4.2, duration: 0.3, ease: 'power2.in' }, 0)
        .to(q('[data-intro]'), { opacity: 0, y: -40, duration: 0.12 }, 0.04)
        .to(q('[data-photo-wrap]'), { opacity: 0, duration: 0.07 }, 0.25)
        .to(q('[data-stage]'), { backgroundColor: '#e9e6df', duration: 0.07 }, 0.25)
        // 2. land on the isometric floor
        .fromTo(q('[data-iso]'), { opacity: 0, scale: 1.9, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.14, ease: 'power3.out' }, 0.26)
        .fromTo(q('[data-iso-label]'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0.36)
      // 3. the specifications, one after another
      tl.fromTo(q('[data-details-kicker]'), { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.38)
      const items = q('[data-detail]')
      items.forEach((el, n) => {
        const at = 0.4 + n * 0.055
        tl.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.04, ease: 'power2.out' }, at)
        tl.fromTo(el.querySelector('[data-rule]'), { scaleX: 0 }, { scaleX: 1, duration: 0.05 }, at)
        // on phones each one replaces the last
        if (!desktop && n < items.length - 1) tl.to(el, { opacity: 0, y: -20, duration: 0.03 }, at + 0.05)
      })
      // 4. scan in the floor plan
      tl.to(q('[data-details]'), { opacity: 0, x: desktop ? 40 : 0, duration: 0.05 }, 0.7)
        .to(q('[data-iso]'), { opacity: 0, x: desktop ? '-8%' : 0, duration: 0.06 }, 0.7)
        .to(q('[data-iso-label]'), { opacity: 0, duration: 0.03 }, 0.7)
        .fromTo(q('[data-plan]'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.12, ease: 'power1.inOut' }, 0.73)
        .set(q('[data-scan]'), { opacity: 1 }, 0.73)
        .fromTo(q('[data-scan]'), { left: '0%' }, { left: '100%', duration: 0.12, ease: 'power1.inOut', immediateRender: false }, 0.73)
        .to(q('[data-scan]'), { opacity: 0, duration: 0.02 }, 0.85)
        .fromTo(q('[data-fact]'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.04, stagger: 0.02 }, 0.8)
        .fromTo(q('[data-cta]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.05 }, 0.9)
        .to({}, { duration: 0.05 }, 0.95)
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8, animation: tl })
    })
    return () => mm.revert()
  }, [reduce])

  if (reduce) {
    return (
      <section data-tone="sand" aria-labelledby="inside-title" className="py-[clamp(5rem,12vw,10rem)]">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          <div>
            <p className="t-kicker">Inside {p.name}</p>
            <h2 id="inside-title" className="t-h2 mt-5">
              A typical floor, from the brochure
            </h2>
            <WorkImage name="acs-heights-isometric" alt={p.plans[1].alt} sizes="(min-width: 1024px) 45vw, 100vw" loading="lazy" className="mt-8 w-full" />
          </div>
          <dl className="space-y-6 self-center">
            {details.map((d) => (
              <div key={d.title}>
                <dt className="font-[650]">{d.title}</dt>
                <dd className="mt-1 opacity-75">{d.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    )
  }

  return (
    <section ref={root} id="inside" data-tone="light" aria-labelledby="inside-title" className="relative h-[480vh]">
      <div data-stage className="sticky top-0 h-[100svh] overflow-hidden bg-charcoal text-charcoal">
        {/* 1. the render */}
        <div data-photo-wrap className="absolute inset-0">
          <div data-photo className="absolute inset-0 will-change-transform" style={{ transformOrigin: FOCUS }}>
            <WorkImage name="acs-heights" alt={p.images[0].alt} sizes="100vw" loading="lazy" className="size-full object-cover" style={{ objectPosition: FOCUS }} />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,23,25,0.75),rgba(21,23,25,0.1)_60%)]" />
          <div data-intro className="wrap relative flex h-full flex-col justify-center text-paper">
            <p className="t-kicker">Inside {p.name}</p>
            <h2 id="inside-title" className="t-hero mt-5 max-w-[10ch]">
              Step inside.
            </h2>
            <p className="t-lead mt-5 max-w-[30ch] text-paper/80">Keep scrolling to go through the balcony and into a typical floor.</p>
          </div>
        </div>

        {/* 2. the isometric floor */}
        <div className="absolute inset-x-4 top-[4.75rem] h-[46svh] md:inset-x-auto md:left-[4vw] md:top-[12svh] md:h-[76svh] md:w-[56vw]">
          <div data-iso className="relative size-full opacity-0 will-change-transform">
            <WorkImage name="acs-heights-isometric" alt={p.plans[1].alt} sizes="(min-width: 768px) 56vw, 100vw" loading="lazy" className="size-full rounded-lg object-contain" />
          </div>
          <p data-iso-label className="absolute -bottom-7 left-0 text-[0.85rem] opacity-0 md:-bottom-8">
            Isometric 3D view of a typical floor: two east-facing 3BHK flats around the lift and stair
          </p>
          {/* 4. the floor plan, scanned in over the same frame */}
          <div className="pointer-events-none absolute inset-0">
            <div data-plan className="absolute inset-0 grid place-items-center" style={{ clipPath: 'inset(0 100% 0 0)' }}>
              <WorkImage name="acs-heights-floor-plan" alt={p.plans[0].alt} sizes="(min-width: 768px) 56vw, 100vw" loading="lazy" className="size-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)]" />
            </div>
            <span data-scan aria-hidden="true" className="absolute inset-y-0 w-[2px] bg-orange opacity-0 shadow-[0_0_14px_3px_rgba(217,108,45,0.7)]" />
          </div>
        </div>

        {/* 3. the specifications */}
        <div data-details className="absolute inset-x-4 bottom-24 h-[10rem] md:inset-x-auto md:bottom-auto md:right-[4vw] md:top-1/2 md:h-auto md:w-[32vw] md:max-w-[28rem] md:-translate-y-1/2">
          <p data-details-kicker className="t-kicker mb-6 hidden opacity-0 md:flex">From the brochure</p>
          <ol className="relative h-full md:space-y-6">
            {details.map((d, n) => (
              <li key={d.title} data-detail className="absolute inset-x-0 top-0 opacity-0 md:static">
                <div className="flex items-baseline gap-3">
                  <span className="tabular text-[0.82rem] text-orange-deep">{String(n + 1).padStart(2, '0')}</span>
                  <h3 className="text-[1.25rem] font-[650] tracking-[-0.01em]" style={{ fontVariationSettings: "'wdth' 108" }}>
                    {d.title}
                  </h3>
                </div>
                <span data-rule aria-hidden="true" className="mt-2 block h-px origin-left bg-charcoal/25" />
                <p className="mt-2 max-w-[40ch] text-[0.98rem] leading-relaxed text-charcoal/75">{d.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* plan facts and next steps */}
        <div className="absolute inset-x-4 bottom-24 md:inset-x-auto md:bottom-auto md:right-[4vw] md:top-1/2 md:w-[32vw] md:max-w-[28rem] md:-translate-y-1/2">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 md:gap-y-6">
            {planFacts.map(([k, v]) => (
              <div key={k} data-fact className="border-t border-charcoal/25 pt-2 opacity-0 md:pt-3">
                <dt className="text-[0.8rem] text-charcoal/60">{k}</dt>
                <dd className="t-h3 !text-[clamp(1.15rem,2vw,1.8rem)]">{v}</dd>
              </div>
            ))}
          </dl>
          <div data-cta className="invisible mt-5 flex flex-wrap gap-3 opacity-0 md:mt-10">
            <button type="button" onClick={() => enquire({ type: 'brochure', project: p.name })} className="btn btn-dark">
              <span>Request a Brochure</span>
            </button>
            <Link to={`/projects/${p.slug}`} onClick={(e) => openProject(e, p.slug, 'acs-heights-isometric', document.querySelector('[data-plan] img'))} className="btn btn-outline max-md:hidden">
              <span>Full details</span> <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
