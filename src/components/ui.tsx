import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import WorkImage from './WorkImage'
import { CharReveal } from './motion'

export { Logo } from './Logo'

const EASE = [0.16, 1, 0.3, 1] as const

/** Visible marker for content that must be replaced before launch. */
export function DemoTag({ children = 'Placeholder', className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-orange/60 px-3 py-1 text-[0.8rem] font-[600] text-orange-deep ${className}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-orange" />
      {children}
    </span>
  )
}

/** Heading whose words rise out of a mask when it scrolls into view. */
export function SplitReveal({ text, as: Tag = 'h2', className = '', id, delay = 0 }: { text: string; as?: 'h1' | 'h2' | 'h3' | 'p'; className?: string; id?: string; delay?: number }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const reduce = useReducedMotion()
  const words = text.split(' ')
  return (
    <Tag ref={ref} id={id} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '110%' }}
            animate={inView || reduce ? { y: 0 } : { y: '110%' }}
            transition={{ duration: 1, delay: delay + i * 0.05, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Fades content up once when it enters the viewport. */
export function Reveal({ children, delay = 0, className = '', as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' }) {
  const reduce = useReducedMotion()
  const Comp = as === 'li' ? motion.li : motion.div
  return (
    <Comp className={className} initial={reduce ? false : { opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.9, delay, ease: EASE }}>
      {children}
    </Comp>
  )
}

/**
 * Photograph revealed by a wipe the first time it enters the viewport,
 * then drifting slightly against the scroll for depth.
 */
export function RevealImage({
  name,
  alt,
  sizes,
  className = '',
  imgClassName = '',
  from = 'bottom',
  parallax = 8,
  priority = false,
}: {
  name: string
  alt: string
  sizes: string
  className?: string
  imgClassName?: string
  from?: 'bottom' | 'left' | 'right'
  parallax?: number
  priority?: boolean
}) {
  // observe an unclipped wrapper: a fully clipped element can report no intersection
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`])
  const hidden = from === 'bottom' ? 'inset(100% 0% 0% 0%)' : from === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)'
  return (
    <div ref={ref} className={`${className.includes('absolute') ? '' : 'relative'} ${className}`}>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={reduce ? false : { clipPath: hidden }}
        animate={inView || reduce ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: hidden }}
        transition={{ duration: 1.3, ease: EASE }}
      >
        <motion.div className="absolute inset-[-10%_0]" style={reduce || !parallax ? undefined : { y }}>
          <WorkImage name={name} alt={alt} sizes={sizes} loading={priority ? 'eager' : 'lazy'} className={`size-full object-cover ${imgClassName}`} />
        </motion.div>
      </motion.div>
    </div>
  )
}

/** Counts up to a value when visible. */
export function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? value : 0)
  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setN(value)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1700)
      setN(value * (1 - Math.pow(1 - k, 4)))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, reduce])
  return <span ref={ref}>{Number(n.toFixed(decimals)).toLocaleString('en-IN')}</span>
}

export function ArrowIcon({ size = 18 }: { size?: number }) {
  return <ArrowRight size={size} strokeWidth={1.8} className="btn-icon" aria-hidden="true" />
}

/** Kicker + heading + optional intro, on the 12-column grid. */
export function SectionHead({ kicker, title, intro, id, className = '' }: { kicker?: string; title: string; intro?: ReactNode; id?: string; className?: string }) {
  return (
    <div className={`grid gap-8 md:grid-cols-12 md:items-end ${className}`}>
      <div className="md:col-span-7">
        {kicker && <p className="t-kicker mb-6 opacity-80">{kicker}</p>}
        <CharReveal id={id} text={title} className="t-h2" />
      </div>
      {intro && <div className="t-lead max-w-[34rem] opacity-75 md:col-span-5 md:pb-1">{intro}</div>}
    </div>
  )
}
