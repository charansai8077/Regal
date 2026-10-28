import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projects } from '../data/projects'
import { asset } from '../lib/hooks'
import { lockScroll } from '../lib/smooth'

/*
 * Opening a project: the picture the visitor clicked lifts out of the page
 * and grows to fill the screen, the project name rises over it, the detail
 * page loads underneath and the picture slides away to reveal it.
 */

const EVENT = 'regal:open-project'
const EASE = [0.76, 0, 0.24, 1] as const
type Open = { to: string; image: string; name: string; rect: { top: number; left: number; width: number; height: number } }

/** Read by the route curtain so the two transitions never play together. */
export let projectTransitionActive = false

export function useOpenProject() {
  const nav = useNavigate()
  const reduce = useReducedMotion()
  return useCallback(
    (e: React.MouseEvent, slug: string, image: string, source?: Element | null) => {
      if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      e.preventDefault()
      const el = source ?? (e.currentTarget as Element).closest('[data-project-card]')?.querySelector('img') ?? null
      const r = el?.getBoundingClientRect()
      const rect = r && r.width > 0 ? { top: r.top, left: r.left, width: r.width, height: r.height } : { top: innerHeight * 0.25, left: innerWidth * 0.25, width: innerWidth * 0.5, height: innerHeight * 0.5 }
      const name = projects.find((p) => p.slug === slug)?.name ?? ''
      if (!window.dispatchEvent(new CustomEvent<Open>(EVENT, { detail: { to: `/projects/${slug}`, image, name, rect }, cancelable: true }))) return
      nav(`/projects/${slug}`)
    },
    [nav, reduce],
  )
}

export default function ProjectTransition() {
  const nav = useNavigate()
  const [open, setOpen] = useState<Open | null>(null)
  const [phase, setPhase] = useState<'grow' | 'reveal'>('grow')

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<Open>).detail
      e.preventDefault() // tells the caller this component will navigate
      projectTransitionActive = true
      lockScroll(true)
      setPhase('grow')
      setOpen(d)
    }
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [])

  return (
    <AnimatePresence
      onExitComplete={() => {
        projectTransitionActive = false
      }}
    >
      {open && (
        <motion.div key={open.to} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[96]" exit={{ clipPath: 'inset(0% 0% 100% 0%)' }} initial={{ clipPath: 'inset(0% 0% 0% 0%)' }} transition={{ duration: 0.8, ease: EASE }}>
          <motion.div className="absolute inset-0 bg-charcoal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
          <motion.div
            className="absolute overflow-hidden"
            initial={{ top: open.rect.top, left: open.rect.left, width: open.rect.width, height: open.rect.height, borderRadius: 12 }}
            animate={{ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            onAnimationComplete={() => {
              if (phase !== 'grow') return
              setPhase('reveal')
              window.scrollTo(0, 0)
              nav(open.to)
              lockScroll(false)
              // let the page paint underneath, then slide the picture away
              setTimeout(() => setOpen(null), 450)
            }}
          >
            <motion.img src={asset(`work/${open.image}.webp`)} alt="" className="size-full object-cover" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
          </motion.div>
          <div className="wrap absolute inset-x-0 bottom-[12vh] overflow-hidden text-paper">
            <motion.p className="t-hero" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}>
              {open.name}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
