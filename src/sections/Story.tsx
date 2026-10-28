import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { SplitReveal } from '../components/ui'
import WorkImage from '../components/WorkImage'

const chapters = [
  {
    title: 'Our vision',
    head: 'Homes built for life',
    body: 'A home should be safe, legal and made to last for the family that lives in it, and for the next generation after them. That is what we plan for from the first drawing.',
    image: 'g3-apartments-ganesha',
    alt: 'Apartment building elevation with glass balconies and a Ganesha feature wall',
  },
  {
    title: 'Our expertise',
    head: 'Plans, approvals and construction in one office',
    body: 'You do not need to coordinate a separate architect, engineer, approval agent and builder. One team draws your plans, takes them through approval, designs the structure and builds.',
    image: 'plan-4-flats-iso',
    alt: 'Isometric 3D view of an apartment floor with four furnished flats',
  },
  {
    title: 'Our quality',
    head: 'Checked at every stage',
    body: 'Marking, reinforcement, concrete, brickwork and finishes are checked before work moves on. At ACS Heights that means an earthquake-resistant RCC frame, first-class brickwork and UPVC windows.',
    image: 'structural-lines',
    alt: 'Line drawing of the ACS Heights elevation on a drawing grid',
  },
  {
    title: 'Our commitment',
    head: 'Clear answers, safe sites',
    body: 'You always know what stage your building is at, what comes next and what it costs. On site, excavations are shored, scaffolding is safe and workers wear protective equipment.',
    image: 'geerish-villas',
    alt: 'Geerish Villas at night with red tile roofs and a lit name board',
  },
]

/** Company story: chapters scroll past while the image beside them changes. */
export default function Story() {
  const [active, setActive] = useState(0)
  const list = useRef<HTMLOListElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const items = list.current?.querySelectorAll<HTMLElement>('[data-chapter]')
    if (!items) return
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.chapter))), { rootMargin: '-45% 0px -45% 0px' })
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const c = chapters[active]

  return (
    <section id="story" data-tone="dark" aria-labelledby="story-title" className="py-[clamp(5rem,12vw,10rem)]">
      <div className="wrap">
        <p className="t-kicker opacity-80">Why Regal</p>
        <SplitReveal id="story-title" text="Built on trust, one home at a time" className="t-h2 mt-6 max-w-[16ch]" />

        <div className="mt-[clamp(3rem,7vw,6rem)] grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/4.4] overflow-hidden bg-ink lg:sticky lg:top-24">
              <AnimatePresence initial={false}>
                <motion.div key={c.image} className="absolute inset-0" initial={reduce ? false : { clipPath: 'inset(100% 0 0 0)' }} animate={{ clipPath: 'inset(0% 0 0 0)' }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
                  <WorkImage name={c.image} alt={c.alt} sizes="(min-width: 1024px) 45vw, 100vw" loading="lazy" className="size-full object-cover" />
                </motion.div>
              </AnimatePresence>
              <p className="absolute bottom-4 left-4 rounded-full bg-charcoal/75 px-3 py-1.5 text-[0.85rem] backdrop-blur">{c.title}</p>
            </div>
          </div>

          <ol ref={list} className="lg:col-span-6">
            {chapters.map((ch, i) => (
              <li key={ch.title} data-chapter={i} aria-current={i === active ? 'true' : undefined} className={`border-t border-fg/15 py-10 transition-opacity duration-700 lg:min-h-[52svh] lg:py-14 ${i === active ? 'opacity-100' : 'lg:opacity-35'}`}>
                <p className="text-[0.95rem] text-orange">{ch.title}</p>
                <h3 className="t-h3 mt-4 max-w-[22ch] !text-[clamp(1.6rem,2.6vw,2.4rem)] !font-[540]">{ch.head}</h3>
                <p className="mt-5 max-w-[46ch] text-[1.05rem] leading-relaxed opacity-75">{ch.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
