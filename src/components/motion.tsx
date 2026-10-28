import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, useAnimationFrame, useInView } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { lockScroll } from '../lib/smooth'
import { heroSlides, heroUrl } from '../data/hero'
import { projectTransitionActive } from './ProjectTransition'

const EASE = [0.76, 0, 0.24, 1] as const
const OUT = [0.16, 1, 0.3, 1] as const

/* ------------------------------------------------------------------ */
/* Intro: a blueprint elevation draws itself as the site really loads, */
/* then the name appears and the sheet lifts. Once per visit.          */
/* ------------------------------------------------------------------ */

const INTRO_EVENT = 'regal:intro-done'
let introDone = false

/** True once the intro has finished (or was skipped). */
export function useIntroDone() {
  const [done, setDone] = useState(introDone)
  useEffect(() => {
    if (introDone) return setDone(true)
    const on = () => setDone(true)
    window.addEventListener(INTRO_EVENT, on)
    return () => window.removeEventListener(INTRO_EVENT, on)
  }, [])
  return done
}

function finishIntro() {
  introDone = true
  window.dispatchEvent(new Event(INTRO_EVENT))
}

const REGAL = 'REGAL'.split('')

/** The closing title of the intro, timed like a film's opening card. */
function TitleCard() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* letterbox bars */}
      <motion.div className="absolute inset-x-0 top-0 bg-black" initial={{ height: 0 }} animate={{ height: '11vh' }} transition={{ duration: 0.9, ease: EASE }} />
      <motion.div className="absolute inset-x-0 bottom-0 bg-black" initial={{ height: 0 }} animate={{ height: '11vh' }} transition={{ duration: 0.9, ease: EASE }} />
      {/* a slow light behind the name */}
      <motion.div
        className="absolute left-1/2 top-1/2 size-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(217,108,45,0.28), rgba(217,108,45,0.08) 55%, transparent)' }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1.1 }}
        transition={{ duration: 2.6, ease: OUT }}
      />

      <motion.div className="absolute inset-0 grid place-items-center px-6" initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 3.2, ease: OUT }}>
        <div className="flex flex-col items-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <div className="flex items-end gap-[clamp(0.6rem,2vw,1.4rem)]">
            {/* the mark: shoulders and head draw, then the hard hat drops on */}
            <svg viewBox="0 0 312 368" className="h-[clamp(4.2rem,13vw,9.5rem)] w-auto shrink-0 overflow-visible">
              <defs>
                <clipPath id="tc-head">
                  <rect x="0" y="112" width="312" height="256" />
                </clipPath>
                <mask id="tc-hat">
                  <rect y="-300" width="312" height="420" fill="#fff" />
                  <rect x="129" y="-4" width="12" height="62" rx="6" fill="#000" />
                  <rect x="169" y="-4" width="12" height="62" rx="6" fill="#000" />
                </mask>
              </defs>
              <g fill="none" stroke="#F5F4F0" strokeWidth="27">
                <motion.path d="M11 368V365a144 144 0 0 1 288 0V368" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: OUT, delay: 0.25 }} />
                <motion.circle cx="155" cy="130" r="80" clipPath="url(#tc-head)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: OUT, delay: 0.45 }} />
              </g>
              <g mask="url(#tc-hat)">
                <motion.g fill="#D96C2D" initial={{ y: -240, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.85 }}>
                  <path d="M63 99a92 84 0 0 1 184 0z" />
                  <rect x="142" y="2" width="26" height="40" rx="8" />
                  <rect x="52" y="94" width="205" height="16" rx="6" />
                </motion.g>
              </g>
            </svg>

            <div className="flex flex-col">
              {/* REGAL: letters rise out of the dark, tracking tightens, then a beam of light passes across */}
              <motion.p
                className="relative flex text-[clamp(3.4rem,13vw,9.5rem)] font-[800] uppercase leading-[0.78]"
                initial={{ letterSpacing: '0.35em' }}
                animate={{ letterSpacing: '0.05em' }}
                transition={{ duration: 1.8, ease: OUT, delay: 0.35 }}
              >
                {REGAL.map((ch, i) => (
                  <span key={i} className="inline-block overflow-hidden pb-[0.04em]">
                    <motion.span
                      className="inline-block"
                      initial={{ y: '105%', opacity: 0, filter: 'blur(12px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 1.1, ease: OUT, delay: 0.4 + i * 0.09 }}
                    >
                      {ch}
                    </motion.span>
                  </span>
                ))}
                <motion.span
                  className="absolute inset-0 bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(100deg, transparent 35%, rgba(255,226,190,0.95) 50%, transparent 65%)', backgroundSize: '250% 100%', WebkitBackgroundClip: 'text' }}
                  initial={{ backgroundPositionX: '120%' }}
                  animate={{ backgroundPositionX: '-30%' }}
                  transition={{ duration: 1.3, ease: 'easeInOut', delay: 1.45 }}
                >
                  REGAL
                </motion.span>
              </motion.p>
              <motion.p
                className="mt-[clamp(0.5rem,1.6vw,1.2rem)] text-[clamp(0.7rem,2.05vw,1.48rem)] font-[600] uppercase leading-none text-paper/80"
                initial={{ opacity: 0, letterSpacing: '0.05em' }}
                animate={{ opacity: 1, letterSpacing: '0.235em' }}
                transition={{ duration: 1.6, ease: OUT, delay: 1.1 }}
              >
                Civil Engineers
              </motion.p>
            </div>
          </div>

          <motion.span className="mt-8 block h-px w-[min(60vw,30rem)] origin-center bg-orange" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease: EASE, delay: 1.4 }} />
          <motion.p className="mt-5 text-center text-[clamp(0.72rem,1.4vw,0.9rem)] uppercase tracking-[0.3em] text-paper/60" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: OUT, delay: 1.8 }}>
            Tirupati · Plans · Approvals · Construction
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

export function Intro() {
  const reduce = useReducedMotion()
  const [show, setShow] = useState(() => {
    if (window.location.pathname !== '/' && !window.location.hash.startsWith('#/')) return false
    try {
      return !sessionStorage.getItem('regal-intro')
    } catch {
      return true
    }
  })
  // real loading: fonts and the first hero images
  const [loaded, setLoaded] = useState(0)
  const [shown, setShown] = useState(0)
  const [brand, setBrand] = useState(false)

  const close = () => {
    setShow(false)
    try {
      sessionStorage.setItem('regal-intro', '1')
    } catch {
      /* private mode: the intro simply plays again next time */
    }
  }

  useEffect(() => {
    if (!show || reduce) {
      setShow(false)
      finishIntro()
      return
    }
    lockScroll(true)
    const jobs: Promise<unknown>[] = [
      document.fonts?.ready ?? Promise.resolve(),
      ...heroSlides.slice(0, 2).map(
        (sl) =>
          new Promise<void>((res) => {
            const im = new Image()
            im.onload = im.onerror = () => res()
            im.src = heroUrl(sl.name)
          }),
      ),
    ]
    let done = 0
    jobs.forEach((j) => j.then(() => setLoaded(++done / jobs.length)))
    // never hold the visitor longer than this, even on a slow connection
    const cap = setTimeout(() => setLoaded(1), 5000)
    return () => clearTimeout(cap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the drawing follows the real progress, but never faster than it can be read
  useEffect(() => {
    if (!show || reduce) return
    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      const dt = Math.max(0, Math.min(0.05, (t - last) / 1000))
      last = t
      setShown((v) => {
        const next = Math.min(loaded, v + dt * 0.75)
        return next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [loaded, show, reduce])

  useEffect(() => {
    if (shown < 1 || brand) return
    setBrand(true)
    const t = setTimeout(close, 3300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])

  // the elevation is drawn in order: ground, columns, floors, roof, windows
  const k = (a: number, b: number) => Math.min(1, Math.max(0, (shown - a) / (b - a)))
  const draw = (a: number, b: number) => ({ strokeDasharray: 1, strokeDashoffset: 1 - k(a, b) })
  const G = 250
  const cols = [130, 165, 200, 235, 270]
  const floors = [1, 2, 3, 4, 5, 6].map((f) => G - f * 28)

  return (
    <AnimatePresence
      onExitComplete={() => {
        lockScroll(false)
        finishIntro()
      }}
    >
      {show && !reduce && (
        <motion.div key="intro" className="fixed inset-0 z-[100] text-paper" exit={{ transition: { duration: 1.1 } }}>
          <motion.div aria-hidden="true" className="absolute inset-0 bg-orange" exit={{ y: '-100%' }} transition={{ duration: 1, ease: EASE, delay: 0.12 }} />
          <motion.div className="absolute inset-0 overflow-hidden bg-[#0f1b29]" exit={{ y: '-100%' }} transition={{ duration: 0.95, ease: EASE }}>
            {/* blueprint sheet */}
            <div aria-hidden="true" className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(142,166,192,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(142,166,192,0.09)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div aria-hidden="true" className="absolute inset-0 [background:radial-gradient(70%_60%_at_50%_45%,transparent,rgba(9,15,23,0.85))]" />

            <div className="relative grid h-full place-items-center px-6">
              <div className="flex w-full max-w-[34rem] flex-col items-center">
                <motion.svg aria-hidden="true" viewBox="80 40 240 240" className="w-[min(70vw,22rem)]" animate={brand ? { scale: 0.7, opacity: 0, filter: 'blur(6px)' } : { scale: 1 }} transition={{ duration: 0.8, ease: OUT }}>
                  <g fill="none" stroke="#8ea6c0" strokeWidth="1.2" strokeLinecap="round">
                    <path pathLength={1} d={`M92 ${G} H308`} style={draw(0, 0.16)} />
                    {cols.map((x, i) => (
                      <path key={x} pathLength={1} d={`M${x} ${G} V${G - 168}`} style={draw(0.1 + i * 0.05, 0.42 + i * 0.05)} />
                    ))}
                    {floors.map((y, i) => (
                      <path key={y} pathLength={1} d={`M124 ${y} H276`} style={draw(0.34 + i * 0.06, 0.5 + i * 0.06)} />
                    ))}
                    <path pathLength={1} d={`M150 ${G - 168} V${G - 186} H250 V${G - 168}`} style={draw(0.78, 0.9)} stroke="#d96c2d" />
                    {/* dimension lines */}
                    <path pathLength={1} d={`M110 ${G} V${G - 168} M106 ${G} H114 M106 ${G - 168} H114`} style={draw(0.5, 0.8)} strokeWidth="0.7" opacity="0.6" />
                    <path pathLength={1} d={`M130 ${G + 16} H270 M130 ${G + 12} V${G + 20} M270 ${G + 12} V${G + 20}`} style={draw(0.2, 0.5)} strokeWidth="0.7" opacity="0.6" />
                  </g>
                  {/* windows light up as the last of the loading finishes */}
                  <g>
                    {floors.slice(0, 5).map((y, f) =>
                      cols.slice(0, -1).map((x, i) => (
                        <rect key={`${f}-${i}`} x={x + 5} y={y + 6} width={25} height={16} fill={(f + i) % 3 === 0 ? '#d96c2d' : '#f5d7b0'} opacity={k(0.82 + ((f * 4 + i) % 9) * 0.015, 0.95 + ((f * 4 + i) % 9) * 0.005) * 0.85} />
                      )),
                    )}
                  </g>
                </motion.svg>
              </div>
            </div>

            {/* title card: cinema bars close in, the mark draws, the name is revealed by a beam of light */}
            {brand && <TitleCard />}

            <div className={`absolute bottom-7 left-[clamp(1.25rem,5vw,4.5rem)] hidden text-[0.78rem] uppercase tracking-[0.18em] text-[#8ea6c0] transition-opacity duration-500 sm:block ${brand ? 'opacity-0' : ''}`}>
              <span className="opacity-70">Sheet</span> 00 <span className="mx-2 opacity-40">|</span> Loading the site
            </div>
            <p className={`tabular absolute bottom-6 right-[clamp(1.25rem,5vw,4.5rem)] transition-opacity duration-500 ${brand ? 'opacity-0' : ''} text-[clamp(2.6rem,7vw,5.5rem)] font-[560] leading-none tracking-[-0.05em] text-paper/90`} style={{ fontVariationSettings: "'wdth' 112" }} aria-live="polite">
              {Math.round(shown * 100)}
              <span className="text-orange">%</span>
            </p>
            <div aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] bg-orange" style={{ width: `${shown * 100}%` }} />
            <button type="button" onClick={close} className="absolute right-[clamp(1.25rem,5vw,4.5rem)] top-6 rounded-full border border-paper/25 px-4 py-2 text-[0.85rem] text-paper/80 transition-colors hover:border-paper hover:text-paper">
              Skip intro
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/* Cursor: a dot and a trailing ring. The ring grows over links and   */
/* shows a label over images ("View", "Drag"). Buttons pull toward it.*/
/* ------------------------------------------------------------------ */

export function Cursor() {
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [label, setLabel] = useState('')
  const [hot, setHot] = useState(false)
  const [down, setDown] = useState(false)
  const [seen, setSeen] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 })

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine || reduce) return
    setEnabled(true)
    document.documentElement.classList.add('has-cursor')
    let magnet: HTMLElement | null = null
    const move = (e: PointerEvent) => {
      setSeen(true)
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target as HTMLElement
      const labelled = t.closest<HTMLElement>('[data-cursor]')
      setLabel(labelled?.dataset.cursor ?? '')
      setHot(!!t.closest('a, button, [role="radio"], select, input, textarea, label'))
      // magnetic buttons
      const m = t.closest<HTMLElement>('.btn, [data-magnetic]')
      if (magnet && magnet !== m) magnet.style.transform = ''
      magnet = m
      if (m) {
        const r = m.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.25
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.35
        m.style.transform = `translate(${dx}px, ${dy}px)`
      }
    }
    const leave = () => setSeen(false)
    const press = () => setDown(true)
    const release = () => setDown(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', release)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
      document.documentElement.classList.remove('has-cursor')
      if (magnet) magnet.style.transform = ''
    }
  }, [reduce, x, y])

  if (!enabled || !seen) return null
  const big = !!label
  return (
    <>
      <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[90] size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange" style={{ x, y }} />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[89] grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-solid border-orange text-[0.8rem] font-[640] text-charcoal"
        style={{ x: rx, y: ry }}
        animate={{
          width: big ? 92 : hot ? 56 : 34,
          height: big ? 92 : hot ? 56 : 34,
          backgroundColor: big ? 'rgba(217,108,45,0.95)' : 'rgba(217,108,45,0)',
          borderWidth: big ? 0 : 1.5,
          scale: down ? 0.82 : 1,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <AnimatePresence>
          {big && (
            <motion.span key={label} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Thin progress line along the top of the window.                    */
/* ------------------------------------------------------------------ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  return <motion.div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-orange" style={{ scaleX }} />
}

/* ------------------------------------------------------------------ */
/* Route change curtain.                                              */
/* ------------------------------------------------------------------ */

export function RouteCurtain() {
  const loc = useLocation()
  const reduce = useReducedMotion()
  const first = useRef(true)
  const [key, setKey] = useState(0)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (projectTransitionActive) return // the picture transition covers this change
    setKey((k) => k + 1)
  }, [loc.pathname])
  if (reduce || key === 0) return null
  return (
    <motion.div key={key} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] bg-orange" initial={{ clipPath: 'inset(0% 0% 0% 0%)' }} animate={{ clipPath: 'inset(0% 0% 100% 0%)' }} transition={{ duration: 0.9, ease: EASE, delay: 0.05 }}>
      <motion.div className="absolute inset-0 bg-charcoal" initial={{ clipPath: 'inset(0% 0% 0% 0%)' }} animate={{ clipPath: 'inset(0% 0% 100% 0%)' }} transition={{ duration: 0.8, ease: EASE }} />
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Endless text band. Scrolling speeds it up and flips its direction. */
/* ------------------------------------------------------------------ */

export function Marquee({ items, className = '', speed = 40 }: { items: string[]; className?: string; speed?: number }) {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [-2500, 0, 2500], [-5, 0, 5], { clamp: false })
  const x = useMotionValue(0)
  const dir = useRef(1)
  const track = useRef<HTMLDivElement>(null)

  useAnimationFrame((_, delta) => {
    if (reduce || !track.current) return
    const half = track.current.scrollWidth / 2
    if (factor.get() < 0) dir.current = -1
    else if (factor.get() > 0) dir.current = 1
    let move = dir.current * (speed / 1000) * delta
    move += dir.current * move * Math.abs(factor.get())
    let next = x.get() - move
    if (next <= -half) next += half
    if (next > 0) next -= half
    x.set(next)
  })

  const row = (
    <>
      {items.map((t, i) => (
        <span key={i} className="flex shrink-0 items-center gap-[0.5em] pr-[0.5em]">
          {t}
          <svg viewBox="0 0 10 10" className="size-[0.32em] text-orange" aria-hidden="true">
            <rect width="10" height="10" fill="currentColor" transform="rotate(45 5 5)" />
          </svg>
        </span>
      ))}
    </>
  )
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-label={items.join(', ')} role="text">
      <motion.div ref={track} className="flex w-max" style={{ x }} aria-hidden="true">
        {row}
        {row}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Headline whose letters tumble up into place.                       */
/* ------------------------------------------------------------------ */

export function CharReveal({ text, as: Tag = 'h2', className = '', id, delay = 0, play }: { text: string; as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'; className?: string; id?: string; delay?: number; play?: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const reduce = useReducedMotion()
  const go = play ?? inView
  let n = 0
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} id={id} className={className} aria-label={text}>
      {text.split(' ').map((word, wi, arr) => (
        <span key={wi} aria-hidden="true" className="inline-block whitespace-nowrap">
          {word.split('').map((ch) => {
            const i = n++
            return (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block origin-bottom"
                  initial={reduce ? false : { y: '115%', rotate: 8 }}
                  animate={go || reduce ? { y: 0, rotate: 0 } : { y: '115%', rotate: 8 }}
                  transition={{ duration: 0.9, delay: delay + i * 0.022, ease: OUT }}
                >
                  {ch}
                </motion.span>
              </span>
            )
          })}
          {wi < arr.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}

/** Wraps content that should drift against the scroll for depth. */
export function Parallax({ children, speed = 0.15, className = '' }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`])
  return (
    <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>
      {children}
    </motion.div>
  )
}
