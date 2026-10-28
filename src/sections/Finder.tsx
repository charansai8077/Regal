import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BadgeCheck, Building2, FileCheck2, Home } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowIcon, SectionHead } from '../components/ui'
import WorkImage from '../components/WorkImage'
import { approvals } from '../data/content'
import { projects } from '../data/projects'
import { useOpenProject } from '../components/ProjectTransition'
import { useEnquire } from '../lib/enquire'
import { useGoToSection } from '../lib/nav'

type Need = 'buy' | 'build' | 'approve'

const needs: { id: Need; label: string; note: string; icon: typeof Home }[] = [
  { id: 'buy', label: 'Buy a flat', note: 'Ready plans, approved buildings', icon: Building2 },
  { id: 'build', label: 'Build on my plot', note: 'Design and construction', icon: Home },
  { id: 'approve', label: 'Get plans approved', note: 'TUDA, DTCP, municipal', icon: FileCheck2 },
]

/**
 * "Find your property": the visitor says what they need and gets the
 * matching project or service with a direct next step.
 */
export default function Finder() {
  const [need, setNeed] = useState<Need>('buy')
  const reduce = useReducedMotion()
  const enquire = useEnquire()
  const openProject = useOpenProject()
  const go = useGoToSection()
  const acs = projects[0]

  return (
    <section id="finder" data-tone="sand" aria-labelledby="finder-title" className="py-[clamp(5rem,12vw,10rem)]">
      <div className="wrap">
        <SectionHead kicker="Find your property" id="finder-title" title="What are you looking for?" intro="Tell us what you need and we will show you where to start." />

        <div role="radiogroup" aria-label="What do you need?" className="mt-12 grid gap-3 sm:grid-cols-3">
          {needs.map((n, idx) => {
            const active = need === n.id
            const Icon = n.icon
            return (
              <motion.button
                key={n.id}
                initial={reduce ? false : { opacity: 0, y: 30, rotateX: -25 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={reduce ? undefined : { y: -4 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setNeed(n.id)}
                className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-colors duration-500 ${
                  active ? 'border-charcoal bg-charcoal text-paper' : 'border-fg/15 hover:border-fg/50'
                }`}
              >
                <span className={`grid size-12 shrink-0 place-items-center rounded-full transition-colors ${active ? 'bg-orange text-charcoal' : 'bg-fg/8'}`}>
                  <Icon size={21} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[1.12rem] font-[640]">{n.label}</span>
                  <span className="block text-[0.9rem] opacity-65">{n.note}</span>
                </span>
              </motion.button>
            )
          })}
        </div>

        <div className="relative mt-6 min-h-[26rem]" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={need} initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -12 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              {need === 'buy' && (
                <article data-project-card className="group grid overflow-hidden rounded-2xl bg-charcoal text-paper md:grid-cols-2">
                  <div className="relative overflow-hidden">
                    <WorkImage name="acs-heights" alt={acs.images[0].alt} sizes="(min-width: 768px) 45vw, 100vw" loading="lazy" className="aspect-[4/3.2] size-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]" />
                  </div>
                  <div className="flex flex-col justify-between gap-8 p-[clamp(1.5rem,3.5vw,3rem)]">
                    <div>
                      <p className="inline-flex items-center gap-2 text-[0.9rem] text-orange">
                        <BadgeCheck size={17} aria-hidden="true" /> TUDA approved
                      </p>
                      <h3 className="t-h2 mt-3">{acs.name}</h3>
                      <p className="mt-2 opacity-70">{acs.location}</p>
                      <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-paper/15 pt-6">
                        {acs.facts.slice(0, 4).map((f) => (
                          <div key={f.label}>
                            <dt className="text-[0.82rem] opacity-55">{f.label}</dt>
                            <dd className="mt-0.5 font-[600]">{f.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link to={`/projects/${acs.slug}`} onClick={(e) => openProject(e, acs.slug, 'acs-heights')} className="btn btn-primary">
                        <span>Explore Property</span> <ArrowIcon />
                      </Link>
                      <button type="button" onClick={() => enquire({ type: 'site-visit', project: acs.name })} className="btn btn-outline-light">
                        <span>Schedule a Site Visit</span>
                      </button>
                    </div>
                  </div>
                </article>
              )}

              {need === 'build' && (
                <div className="grid gap-6 md:grid-cols-12">
                  <div className="grid grid-cols-2 gap-3 md:col-span-7">
                    {['g1-residence-ganesha', 'white-villa-pergola', 'contemporary-residence', 'geerish-villas'].map((n) => (
                      <WorkImage key={n} name={n} alt="" sizes="(min-width: 768px) 28vw, 50vw" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
                    ))}
                  </div>
                  <div className="flex flex-col justify-between gap-8 md:col-span-5">
                    <div>
                      <h3 className="t-h2">Your plot, your home</h3>
                      <p className="t-lead mt-5 opacity-75">We plan the rooms, show you 2D and 3D elevations, design the structure, handle the building plan approval and build your house through to handover.</p>
                      <ul className="mt-6 space-y-2 text-[1rem]">
                        {['Independent houses and villas', 'Duplex and twin houses', 'Additional floors on existing buildings'].map((t) => (
                          <li key={t} className="flex items-center gap-3">
                            <span aria-hidden="true" className="size-1.5 rounded-full bg-orange" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => enquire({ type: 'team' })} className="btn btn-dark">
                        <span>Talk to Our Team</span> <ArrowIcon />
                      </button>
                      <a href="#projects" onClick={(e) => (e.preventDefault(), go('projects'))} className="btn btn-outline">
                        <span>See our elevations</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {need === 'approve' && (
                <div className="grid gap-8 md:grid-cols-12">
                  <ul className="divide-y divide-fg/15 border-y border-fg/15 md:col-span-7">
                    {approvals.map((a) => (
                      <li key={a.title} className="flex items-baseline justify-between gap-6 py-4">
                        <span className="text-[1.1rem] font-[620]">{a.title}</span>
                        <span className="text-right text-[0.9rem] opacity-60">{a.authority}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col justify-between gap-8 md:col-span-5">
                    <div>
                      <h3 className="t-h2">Plans that get approved</h3>
                      <p className="t-lead mt-5 opacity-75">Send us your plot location and we will tell you which authority applies, prepare the drawings and file the application.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => enquire({ type: 'team' })} className="btn btn-dark">
                        <span>Ask about your site</span> <ArrowIcon />
                      </button>
                      <a href="#approvals" onClick={(e) => (e.preventDefault(), go('approvals'))} className="btn btn-outline">
                        <span>How approvals work</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
