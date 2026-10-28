import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { CharReveal } from '../components/motion'
import { useOpenProject } from '../components/ProjectTransition'
import { ArrowIcon } from '../components/ui'
import WorkImage from '../components/WorkImage'
import { projects } from '../data/projects'
import { useEnquire } from '../lib/enquire'
import { useMediaQuery } from '../lib/hooks'

/**
 * Featured project. The photograph starts as a framed print and opens out
 * to full screen as you scroll, then the project details settle over it.
 */
export default function Featured() {
  const p = projects[0]
  const track = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const phone = useMediaQuery('(max-width: 767px)')
  const still = reduce || phone // phones get a simple stacked layout
  const enquire = useEnquire()
  const openProject = useOpenProject()
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const inset = useTransform(scrollYProgress, [0, 0.45], [12, 0])
  const radius = useTransform(scrollYProgress, [0, 0.45], [18, 0])
  const clip = useMotionTemplate`inset(${inset}% ${inset}% ${inset}% ${inset}% round ${radius}px)`
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1])
  const panelY = useTransform(scrollYProgress, [0.35, 0.6], [60, 0])
  const panelOpacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1])
  const shade = useTransform(scrollYProgress, [0.3, 0.6], [0, 1])

  return (
    <section ref={track} data-tone="dark" aria-labelledby="featured-title" className="relative h-[220vh] text-paper max-md:h-auto">
      {/* tall, sticky stage on larger screens; a simple stacked layout on phones */}
      <div className="sticky top-0 h-[100svh] overflow-hidden max-md:static max-md:h-auto">
        <motion.div className="absolute inset-0 max-md:relative max-md:aspect-[4/4.4]" style={still ? undefined : { clipPath: clip }}>
          <motion.div className="absolute inset-0" style={still ? undefined : { scale }}>
            <WorkImage data-featured-img name="acs-heights" alt={p.images[0].alt} sizes="100vw" loading="lazy" className="size-full object-cover object-[50%_30%]" />
          </motion.div>
          <motion.div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,23,25,0)_35%,rgba(21,23,25,0.88)_75%)] max-md:hidden" style={still ? undefined : { opacity: shade }} />
        </motion.div>

        <div className="wrap relative flex h-full items-center justify-end max-md:block max-md:py-12">
          <motion.div className="w-full max-w-[30rem]" style={still ? undefined : { y: panelY, opacity: panelOpacity }}>
            <p className="t-kicker">Featured project</p>
            <CharReveal id="featured-title" text={p.name} className="t-h1 mt-6" />
            <p className="t-lead mt-3 text-paper/75">{p.location}</p>
            <p className="mt-6 max-w-[36ch] leading-relaxed text-paper/80">{p.summary}</p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-paper/20 pt-6">
              <div>
                <dt className="text-[0.82rem] text-paper/55">Property type</dt>
                <dd className="mt-0.5 font-[600]">Apartments, 3BHK</dd>
              </div>
              {p.facts.slice(0, 3).map((f) => (
                <div key={f.label}>
                  <dt className="text-[0.82rem] text-paper/55">{f.label}</dt>
                  <dd className="mt-0.5 font-[600]">{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 inline-flex items-center gap-2 text-[0.92rem] text-paper/85">
              <BadgeCheck size={18} className="text-orange" aria-hidden="true" /> {p.approval.number}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/projects/${p.slug}`} onClick={(e) => openProject(e, p.slug, 'acs-heights', document.querySelector('[data-featured-img]'))} className="btn btn-primary">
                <span>View Project</span> <ArrowIcon />
              </Link>
              <button type="button" onClick={() => enquire({ type: 'property', project: p.name })} className="btn btn-outline-light">
                <span>Enquire About This Property</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
