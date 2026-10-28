import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { Expand } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Lightbox from '../components/Lightbox'
import { useOpenProject } from '../components/ProjectTransition'
import { SectionHead } from '../components/ui'
import WorkImage from '../components/WorkImage'
import { useMediaQuery } from '../lib/hooks'
import Gallery from './Gallery'
import { portfolio, portfolioCategories, type PortfolioCategory, type PortfolioItem } from '../data/projects'

type Filter = 'All' | PortfolioCategory

/*
 * Editorial composition: rows of unequal widths (7+5, 4+4+4, 5+7) whose
 * images share one height per row, instead of a uniform card grid.
 * Wide images take a full row of their own.
 */
const rows = [
  [
    { span: 'lg:col-span-7', ratio: 'lg:aspect-[4/3]' },
    { span: 'lg:col-span-5', ratio: 'lg:aspect-[20/21]' },
  ],
  [
    { span: 'lg:col-span-4', ratio: 'lg:aspect-square' },
    { span: 'lg:col-span-4', ratio: 'lg:aspect-square' },
    { span: 'lg:col-span-4', ratio: 'lg:aspect-square' },
  ],
  [
    { span: 'lg:col-span-5', ratio: 'lg:aspect-[20/21]' },
    { span: 'lg:col-span-7', ratio: 'lg:aspect-[4/3]' },
  ],
]
const slots = rows.flat()

function Item({ p, slot, onOpen }: { p: PortfolioItem; slot: number; onOpen: () => void }) {
  const reduce = useReducedMotion()
  const openProject = useOpenProject()
  const plan = p.category === 'Plans & 3D views'
  const s = slots[slot % slots.length]
  const look = p.wide ? { cell: 'col-span-2 lg:col-span-12', ratio: 'aspect-[2/1]' } : { cell: s.span, ratio: `aspect-square ${s.ratio}` }
  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={look.cell}
      data-project-card
    >
      <figure className="group">
        <button type="button" onClick={onOpen} className={`relative block w-full overflow-hidden ${plan ? 'bg-paper-2' : 'bg-ink'}`} aria-label={`Open ${p.title}`}>
          <WorkImage
            name={p.file}
            alt={p.alt}
            sizes={p.wide ? '100vw' : '(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw'}
            loading="lazy"
            className={`w-full transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] ${look.ratio} ${plan ? 'object-contain p-4' : 'object-cover'}`}
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <span className="absolute bottom-4 right-4 grid size-11 translate-y-2 place-items-center rounded-full bg-paper text-charcoal opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">
            <Expand size={17} />
          </span>
        </button>
        <figcaption className="mt-4 flex items-baseline justify-between gap-4">
          <span className="text-[0.98rem] font-[600] tracking-[-0.01em] sm:text-[1.15rem]">
            {p.project ? (
              <Link to={`/projects/${p.project}`} onClick={(e) => openProject(e, p.project!, p.file)} className="link-line">
                {p.title}
              </Link>
            ) : (
              p.title
            )}
          </span>
          <span className="hidden shrink-0 text-[0.88rem] opacity-55 sm:inline">{p.category}</span>
        </figcaption>
      </figure>
    </motion.li>
  )
}

export default function Projects() {
  const [filter, setFilter] = useState<Filter>('All')
  const [open, setOpen] = useState<number | null>(null)
  const reduce = useReducedMotion()
  const wide = useMediaQuery('(min-width: 1024px)')
  const sideways = wide && !reduce // desktop: pinned sideways gallery
  const [all, setAll] = useState(false)
  const full = useMemo(() => {
    const items = filter === 'All' ? portfolio : portfolio.filter((p) => p.category === filter)
    return [...items.filter((p) => p.wide), ...items.filter((p) => !p.wide)]
  }, [filter])
  const LIMIT = 8
  const list = sideways || filter !== 'All' || all ? full : full.slice(0, LIMIT)
  const counts = useMemo(() => Object.fromEntries(portfolioCategories.map((c) => [c, portfolio.filter((p) => p.category === c).length])), [])

  return (
    <section id="projects" data-tone="light" aria-labelledby="projects-title" className="pt-[clamp(5rem,12vw,10rem)] max-lg:pb-[clamp(5rem,12vw,10rem)]">
      <div className="wrap">
        <SectionHead
          kicker="Our work"
          id="projects-title"
          title="Homes and buildings we have designed"
          intro="Apartments, independent houses and villas, with the plans and 3D views we prepare for every client. Select any image to view it full screen."
        />

        <div role="group" aria-label="Filter by type" className="mt-12 flex flex-wrap gap-2">
          {(['All', ...portfolioCategories] as Filter[]).map((c) => {
            const active = filter === c
            const n = c === 'All' ? portfolio.length : counts[c]
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => (setFilter(c), setAll(false))}
                className={`relative inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-[0.93rem] transition-colors duration-300 ${active ? 'border-charcoal text-paper' : 'border-fg/20 hover:border-fg/60'}`}
              >
                {active && <motion.span layoutId="work-filter" className="absolute inset-0 rounded-full bg-charcoal" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative">{c}</span>
                <span className={`tabular relative text-[0.8rem] ${active ? 'text-paper/60' : 'opacity-50'}`}>{n}</span>
              </button>
            )
          })}
        </div>

        {!sideways && (
          <>
        <LayoutGroup>
          <motion.ul layout={!reduce} className="mt-14 grid grid-cols-2 gap-x-[clamp(0.75rem,2.4vw,2.5rem)] gap-y-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-12">
            <AnimatePresence mode="popLayout">
              {list.map((p, i) => (
                <Item key={p.file} p={p} slot={i - list.filter((x, j) => x.wide && j < i).length} onOpen={() => setOpen(i)} />
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>
        {filter === 'All' && full.length > LIMIT && (
          <div className="mt-16 flex justify-center">
            <button type="button" onClick={() => setAll((v) => !v)} className="btn btn-outline" aria-expanded={all}>
              <span>{all ? 'Show fewer' : `Show all ${full.length} images`}</span>
            </button>
          </div>
        )}
          </>
        )}
        <p className="sr-only" aria-live="polite">
          Showing {list.length} images{filter === 'All' ? '' : ` in ${filter}`}
        </p>
      </div>
      {sideways && <Gallery key={filter} items={list} onOpen={setOpen} />}
      <AnimatePresence>
        {open !== null && <Lightbox images={list.map((p) => ({ file: p.file, alt: p.alt, caption: `${p.title}. ${p.category}.` }))} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
      </AnimatePresence>
    </section>
  )
}
