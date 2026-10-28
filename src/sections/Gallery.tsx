import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import WorkImage from '../components/WorkImage'
import type { PortfolioItem } from '../data/projects'
import { useOpenProject } from '../components/ProjectTransition'

/**
 * Desktop gallery: the page scrolls down, the images travel sideways.
 * Images lean with scroll speed and drift inside their frames for depth.
 */
export default function Gallery({ items, onOpen }: { items: PortfolioItem[]; onOpen: (i: number) => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const [distance, setDistance] = useState(0)
  const [index, setIndex] = useState(0)
  const openProject = useOpenProject()

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [items])

  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  const { scrollY: pageY } = useScroll()
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])
  const smoothX = useSpring(x, { stiffness: 120, damping: 26, mass: 0.4 })
  const velocity = useVelocity(pageY)
  const skew = useSpring(useTransform(velocity, [-3000, 0, 3000], [5, 0, -5]), { stiffness: 200, damping: 30 })
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1])
  useMotionValueEvent(scrollYProgress, 'change', (v) => setIndex(Math.min(items.length - 1, Math.round(v * (items.length - 1)))))

  return (
    <div ref={wrap} className="relative" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <motion.ul ref={track} className="flex w-max items-center gap-[4vw] pl-[clamp(1.25rem,5vw,4.5rem)] pr-[12vw]" style={{ x: smoothX, skewX: skew }}>
          {items.map((p, i) => {
            const plan = p.category === 'Plans & 3D views'
            const tall = i % 3 === 1
            const h = p.wide ? 'h-[58svh]' : tall ? 'h-[66svh]' : 'h-[50svh]'
            const ratio = p.wide ? 'aspect-[2/1]' : plan ? 'aspect-[5/4]' : tall ? 'aspect-[4/5]' : 'aspect-[4/3.2]'
            return (
              <li key={p.file} className={`shrink-0 ${i % 2 ? 'self-end mb-[4svh]' : 'self-start mt-[8svh]'}`}>
                <figure className="group" data-project-card>
                  <button type="button" onClick={() => onOpen(i)} data-cursor="View" className={`relative block overflow-hidden ${h} ${ratio} ${plan ? 'bg-paper-2' : 'bg-ink'}`} aria-label={`Open ${p.title}`}>
                    <ParallaxImg p={p} plan={plan} progress={scrollYProgress} i={i} n={items.length} />
                  </button>
                  <figcaption className="mt-4 flex items-baseline gap-4">
                    <span className="tabular text-[0.85rem] opacity-50">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[1.15rem] font-[600] tracking-[-0.01em]">
                      {p.project ? (
                        <Link to={`/projects/${p.project}`} onClick={(e) => openProject(e, p.project!, p.file)} className="link-line">
                          {p.title}
                        </Link>
                      ) : (
                        p.title
                      )}
                    </span>
                    <span className="text-[0.88rem] opacity-55">{p.category}</span>
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </motion.ul>

        {/* position */}
        <div className="wrap absolute inset-x-0 bottom-8 flex items-center gap-6">
          <span className="tabular text-[0.9rem]">
            {String(index + 1).padStart(2, '0')} <span className="opacity-40">/ {String(items.length).padStart(2, '0')}</span>
          </span>
          <span className="relative h-px flex-1 bg-fg/15">
            <motion.span className="absolute inset-0 origin-left bg-orange" style={{ scaleX: bar }} />
          </span>
          <span className="text-[0.85rem] opacity-55">Keep scrolling</span>
        </div>
      </div>
    </div>
  )
}

function ParallaxImg({ p, plan, progress, i, n }: { p: PortfolioItem; plan: boolean; progress: ReturnType<typeof useScroll>['scrollYProgress']; i: number; n: number }) {
  // each image slides inside its frame as it crosses the screen
  const centre = n > 1 ? i / (n - 1) : 0.5
  const x = useTransform(progress, [centre - 0.4, centre + 0.4], ['8%', '-8%'])
  return (
    <motion.span className="absolute inset-y-0 -left-[10%] -right-[10%] block" style={plan ? undefined : { x }}>
      <WorkImage
        name={p.file}
        alt={p.alt}
        sizes="60vw"
        loading="lazy"
        className={`size-full transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] ${plan ? 'object-contain p-6' : 'object-cover'}`}
      />
    </motion.span>
  )
}
