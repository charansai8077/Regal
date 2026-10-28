import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionHead } from '../components/ui'
import WorkImage from '../components/WorkImage'
import { services } from '../data/services'

/**
 * Services as an editorial index. On desktop, hovering a row floats that
 * service's image beside the pointer; on touch screens each row shows a thumbnail.
 */
export default function Services() {
  const [hover, setHover] = useState<number | null>(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 30 })
  const sy = useSpring(y, { stiffness: 260, damping: 30 })

  return (
    <section id="services" data-tone="sand" aria-labelledby="services-title" className="py-[clamp(5rem,12vw,10rem)]">
      <div className="wrap">
        <SectionHead kicker="Services" id="services-title" title="Building plans, layouts, constructions & surveys" intro="Take one service, such as an elevation or a building plan, or let us handle your whole project from design to handover." />

        <ul
          className="relative mt-14 border-t border-fg/20"
          onPointerMove={(e) => {
            if (e.pointerType !== 'mouse') return
            const r = e.currentTarget.getBoundingClientRect()
            x.set(e.clientX - r.left)
            y.set(e.clientY - r.top)
          }}
          onPointerLeave={() => setHover(null)}
        >
          {services.map((s, i) => (
            <motion.li
              key={s.slug}
              className="relative"
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* the rule under each row draws itself */}
              <motion.span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px origin-left bg-fg/20" initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.1 + (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }} />
              <Link to={`/services/${s.slug}`} data-cursor="Open" className="group grid items-center gap-x-8 gap-y-3 py-7 transition-[padding] duration-500 sm:grid-cols-[6.5rem_1fr] lg:grid-cols-[1fr_1.1fr_3rem] lg:py-9 lg:hover:pl-4">
                <WorkImage name={s.image} alt="" sizes="112px" loading="lazy" className="hidden aspect-[4/3] w-[6.5rem] object-cover sm:block lg:hidden" />
                <span className="text-[clamp(1.5rem,2.6vw,2.4rem)] font-[560] leading-[1.05] tracking-[-0.03em] transition-colors duration-300 group-hover:text-orange-deep" style={{ fontVariationSettings: "'wdth' 108" }}>
                  {s.title}
                </span>
                <span className="max-w-[44ch] text-[1rem] leading-relaxed opacity-70 sm:col-start-2 lg:col-start-auto">{s.summary}</span>
                <span className="hidden size-11 place-items-center justify-self-end rounded-full border border-fg/25 transition-colors duration-300 group-hover:border-orange group-hover:bg-orange group-hover:text-charcoal lg:grid" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </Link>
            </motion.li>
          ))}

          {/* floating preview (desktop pointer only) */}
          {!reduce && (
            <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block" style={{ x: sx, y: sy }}>
              <AnimatePresence>
                {hover !== null && (
                  <motion.div
                    key={services[hover].image}
                    initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
                    style={{ left: '-9rem', top: 0 }}
                  >
                    <WorkImage name={services[hover].image} alt="" sizes="320px" className="aspect-[4/3] w-[19rem] object-cover" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </ul>
      </div>
    </section>
  )
}
