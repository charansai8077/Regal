import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, BadgeCheck, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Lightbox from '../components/Lightbox'
import { ArrowIcon, Reveal } from '../components/ui'
import WorkImage from '../components/WorkImage'
import { contact } from '../config/site'
import { projects } from '../data/projects'
import { useEnquire } from '../lib/enquire'
import { useSeo } from '../lib/seo'
import NotFound from './NotFound'

/** Points on the elevation, each explained with the project's own brochure details. */
function Hotspots({ spots }: { spots: NonNullable<(typeof projects)[number]['hotspots']> }) {
  const [open, setOpen] = useState<number | null>(null)
  const reduce = useReducedMotion()
  return (
    <ul className="pointer-events-none absolute inset-0" aria-label="Building details">
      {spots.map((h, i) => {
        const on = open === i
        const right = h.x > 0.55
        return (
          <motion.li
            key={h.title}
            className="pointer-events-auto absolute"
            style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
            initial={reduce ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.12, type: 'spring', stiffness: 260, damping: 18 }}
            onMouseEnter={() => setOpen(i)}
            onMouseLeave={() => setOpen(null)}
          >
            <button
              type="button"
              aria-expanded={on}
              aria-label={h.title}
              onClick={() => setOpen(on ? null : i)}
              onFocus={() => setOpen(i)}
              onBlur={() => setOpen(null)}
              className="relative -ml-4 -mt-4 grid size-8 place-items-center"
            >
              <span aria-hidden="true" className="absolute inset-0 rounded-full bg-orange/40 motion-safe:animate-ping" />
              <span aria-hidden="true" className="relative grid size-6 place-items-center rounded-full border-2 border-paper bg-orange text-[0.7rem] font-[700] text-charcoal">
                {i + 1}
              </span>
            </button>
            <AnimatePresence>
              {on && (
                <motion.div
                  role="note"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}
                  className={`absolute top-6 z-10 w-[min(17rem,70vw)] rounded-xl bg-paper p-4 text-charcoal shadow-2xl ${right ? 'right-0' : 'left-0'}`}
                >
                  <p className="font-[680]">{h.title}</p>
                  <p className="mt-1 text-[0.9rem] leading-snug text-charcoal/75">{h.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        )
      })}
    </ul>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const p = projects.find((x) => x.slug === slug)
  const enquire = useEnquire()
  const [box, setBox] = useState<{ set: 'images' | 'plans'; i: number } | null>(null)
  useSeo(p ? `${p.name}, ${p.location}` : 'Project not found', p ? `${p.name}: ${p.summary}` : 'This project could not be found.')
  useEffect(() => window.scrollTo(0, 0), [slug])
  if (!p) return <NotFound />
  const hero = p.images[0]

  return (
    <article>
      {/* header */}
      <header className="relative isolate overflow-hidden bg-charcoal pb-12 pt-28 md:pb-16">
        <div className="wrap grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:pb-8">
            <Link to="/" state={{ scrollTo: 'projects' }} className="inline-flex items-center gap-2 text-[0.92rem] text-paper/75 hover:text-paper">
              <ArrowLeft size={16} aria-hidden="true" /> <span className="link-line">All projects</span>
            </Link>
            <p className="t-kicker mt-10">{p.category}, 3BHK</p>
            <h1 className="t-hero mt-3 !text-[clamp(2.8rem,5.6vw,5.6rem)]">{p.name}</h1>
            <p className="t-lead mt-3 text-paper/80">{p.location}</p>
            <p className="mt-6 max-w-[32ch] text-[1.05rem] leading-relaxed text-paper/75">{p.summary}</p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-orange/50 bg-orange/10 px-4 py-3">
              <BadgeCheck size={22} className="shrink-0 text-orange" aria-hidden="true" />
              <div className="text-[0.9rem] leading-snug">
                <span className="block font-[640]">Approved by TUDA</span>
                <span className="text-paper/70">{p.approval.number}</span>
              </div>
            </div>
            {/* the three ways to act on a property */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => enquire({ type: 'property', project: p.name })} className="btn btn-primary">
                <span>Enquire About This Property</span>
              </button>
              <button type="button" onClick={() => enquire({ type: 'site-visit', project: p.name })} className="btn btn-outline-light">
                <span>Schedule a Site Visit</span>
              </button>
              <button type="button" onClick={() => enquire({ type: 'brochure', project: p.name })} className="link-line self-center px-2 text-[0.95rem] text-paper/85">
                Request a Brochure
              </button>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="relative">
              <button type="button" onClick={() => setBox({ set: 'images', i: 0 })} className="group block w-full overflow-hidden bg-ink" aria-label={`Open image: ${hero.alt}`} data-cursor="View">
                <WorkImage name={hero.file} alt="" sizes="(min-width: 1024px) 58vw, 100vw" fetchPriority="high" className="aspect-[1514/1432] w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]" />
              </button>
              {p.hotspots && <Hotspots spots={p.hotspots} />}
            </div>
            {p.hotspots && <p className="mt-3 text-[0.85rem] text-paper/55">Tap the points on the building to see what goes into it.</p>}
          </div>
        </div>
      </header>

      {/* overview + key facts */}
      <section aria-labelledby="overview" className="bg-paper py-[clamp(4rem,9vw,8rem)] text-charcoal">
        <div className="wrap grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="overview" className="t-kicker">
              About the project
            </h2>
            {p.overview.map((para, n) => (
              <p key={n} className={n === 0 ? 't-h3 mt-5 max-w-[34ch] !font-[560] !leading-snug' : 'mt-6 max-w-[62ch] leading-relaxed text-charcoal/75'}>
                {para}
              </p>
            ))}
            <h3 className="t-label mt-12">Amenities and features</h3>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Amenities and features">
              {p.features.map((f) => (
                <li key={f} className="rounded-full border border-charcoal/20 bg-paper-2 px-4 py-2 text-[0.92rem]">
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <aside className="lg:col-span-5" aria-labelledby="facts">
            <div className="border border-charcoal">
              <h2 id="facts" className="flex items-center justify-between border-b border-charcoal bg-charcoal px-4 py-3 text-paper">
                <span className="t-label">Key facts</span>
                <span className="t-label opacity-70 text-paper/60">{p.approval.number.replace('B.A. No. ', '')}</span>
              </h2>
              <dl>
                {p.facts.map((s, i) => (
                  <div key={s.label} className={`grid grid-cols-[38%_1fr] ${i ? 'border-t border-charcoal/20' : ''}`}>
                    <dt className="border-r border-charcoal/20 px-4 py-3 text-[0.9rem] text-charcoal/60">{s.label}</dt>
                    <dd className="px-4 py-3 font-[600]">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* plans */}
      <section aria-labelledby="plans" className="drawing-grid bg-steel py-[clamp(4rem,9vw,7rem)]">
        <div className="wrap">
          <h2 id="plans" className="t-h2">
            Plans and 3D views
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {p.plans.map((im, i) => (
              <li key={im.file}>
                <figure>
                  <button type="button" onClick={() => setBox({ set: 'plans', i })} className="group block w-full overflow-hidden bg-paper p-2" aria-label={`Open ${im.caption}`}>
                    <WorkImage name={im.file} alt={im.alt} sizes="(min-width: 768px) 45vw, 100vw" loading="lazy" className="aspect-[4/3.3] w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
                  </button>
                  <figcaption className="mt-3 text-[0.95rem] text-paper/75">{im.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* specifications */}
      <section aria-labelledby="specs" className="bg-paper py-[clamp(4rem,9vw,8rem)] text-charcoal">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="specs" className="t-h2">
              Specifications
            </h2>
            <p className="max-w-[40ch] text-charcoal/65">As listed in the project brochure. Specifications may change during construction.</p>
          </div>
          <dl className="mt-10 grid gap-px border border-charcoal/15 bg-charcoal/15 sm:grid-cols-2 lg:grid-cols-3">
            {p.specifications.map((g, i) => (
              <Reveal key={g.title} delay={(i % 3) * 0.05} className="bg-paper p-6">
                <dt className="font-[700]" style={{ fontVariationSettings: "'wdth' 110" }}>
                  {g.title}
                </dt>
                {g.items.map((it) => (
                  <dd key={it} className="mt-2 text-[0.95rem] leading-relaxed text-charcoal/75">
                    {it}
                  </dd>
                ))}
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* gallery */}
      <section aria-labelledby="gallery" className="bg-charcoal py-[clamp(4rem,9vw,7rem)]">
        <div className="wrap">
          <h2 id="gallery" className="t-h2">
            Elevations
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {p.images.map((im, i) => (
              <li key={im.file}>
                <figure>
                  <button type="button" onClick={() => setBox({ set: 'images', i })} className="group block w-full overflow-hidden bg-ink" aria-label={`Open ${im.caption}`}>
                    <WorkImage name={im.file} alt={im.alt} sizes="(min-width: 768px) 33vw, 100vw" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]" />
                  </button>
                  <figcaption className="mt-3 text-[0.95rem] text-paper/70">{im.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* location + CTA */}
      <section className="bg-paper py-[clamp(4rem,9vw,7rem)] text-charcoal">
        <div className="wrap grid gap-10 md:grid-cols-2 md:items-end">
          <div>
            <h2 className="t-label text-steel">Site address</h2>
            <p className="mt-4 flex max-w-[44ch] gap-3 text-[1.08rem] leading-relaxed">
              <MapPin size={20} className="mt-1 shrink-0 text-orange-deep" aria-hidden="true" />
              {p.address}
            </p>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Gazetted Officers Colony, Mangalam, Tirupati')}`} target="_blank" rel="noreferrer" className="link-line mt-4 inline-block pl-8 font-[600]">
              Open the area in Google Maps
            </a>
          </div>
          <div className="md:text-right">
            <p className="max-w-[34ch] text-charcoal/70 md:ml-auto">Interested in a flat at {p.name}? Talk to our team, book a visit or call {contact.phone}.</p>
            <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
              <button type="button" onClick={() => enquire({ type: 'site-visit', project: p.name })} className="btn btn-dark">
                <span>Schedule a Site Visit</span>
              </button>
              <button type="button" onClick={() => enquire({ type: 'property', project: p.name })} className="btn btn-primary">
                <span>Enquire About This Property</span> <ArrowIcon />
              </button>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>{box && <Lightbox images={p[box.set]} index={box.i} onClose={() => setBox(null)} onIndex={(i) => setBox({ ...box, i })} />}</AnimatePresence>
    </article>
  )
}
