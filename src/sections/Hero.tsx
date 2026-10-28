import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { CharReveal, useIntroDone } from '../components/motion'
import { ArrowIcon } from '../components/ui'
import WorkImage from '../components/WorkImage'
import { company } from '../config/site'
import { heroSlides as slides, heroUrl } from '../data/hero'
import { createHeroGL, type HeroState } from '../lib/heroGL'
import { useGoToSection } from '../lib/nav'

const HOLD = 6500
const EASE = [0.16, 1, 0.3, 1] as const
const lines = ['Built for Life.', 'Designed for', 'Generations.']

/*
 * Opening scene. The office's elevations are drawn by a WebGL shader:
 * they lean and catch a warm light as the pointer moves, change with a
 * noise-edged wipe, and as you scroll the camera pushes in toward the
 * building while the headline pulls apart and the scene fades into the
 * next section. Without WebGL (or with reduced motion) the same photos
 * cross-fade as plain images.
 */
export default function Hero() {
  const reduce = !!useReducedMotion()
  const ready = useIntroDone()
  const go = useGoToSection()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [glReady, setGlReady] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const textLayer = useRef<HTMLDivElement>(null)
  const lineLayer = useRef<HTMLDivElement>(null)
  const gl = useRef<ReturnType<typeof createHeroGL>>(null)
  const state = useRef<HeroState>({
    pointer: { x: 0, y: 0 },
    zoom: 1,
    fade: 0,
    shift: 0,
  })

  // scroll choreography across the pinned hero
  const { scrollYProgress: p, scrollY } = useScroll({
    target: section,
    offset: ['start start', 'end end'],
  })
  const zoom = useTransform(p, [0, 1], [1, 1.5])
  const fade = useTransform(p, [0.62, 1], [0, 1])
  const vel = useSpring(
    useTransform(useVelocity(scrollY), (v) => Math.min(1, Math.abs(v) / 2500)),
    { stiffness: 120, damping: 20 },
  )
  const x0 = useTransform(p, [0.08, 0.8], ['0vw', '-24vw'])
  const x1 = useTransform(p, [0.08, 0.8], ['0vw', '20vw'])
  const x2 = useTransform(p, [0.08, 0.8], ['0vw', '-8vw'])
  const y2 = useTransform(p, [0.08, 0.8], ['0%', '-60%'])
  const linesOpacity = useTransform(p, [0.45, 0.78], [1, 0])
  const linesBlur = useTransform(p, [0.45, 0.78], ['blur(0px)', 'blur(8px)'])
  const restOpacity = useTransform(p, [0.02, 0.22], [1, 0])
  const shadeOpacity = useTransform(p, [0.4, 0.75], [1, 0])
  const restY = useTransform(p, [0.02, 0.22], [0, 40])
  const handY = useTransform(p, [0.66, 0.92], ['40%', '0%'])
  const handOpacity = useTransform(p, [0.66, 0.86, 1], [0, 1, 1])
  const imgScale = useTransform(zoom, (z) => z)
  const imgOpacity = useTransform(fade, (f) => 1 - f)

  useMotionValueEvent(zoom, 'change', (v) => (state.current.zoom = v))
  useMotionValueEvent(fade, 'change', (v) => (state.current.fade = v))
  useMotionValueEvent(vel, 'change', (v) => (state.current.shift = v))
  useMotionValueEvent(p, 'change', (v) => setAtTop(v < 0.15))

  // WebGL renderer, started only while the hero is on screen
  useEffect(() => {
    if (reduce || !canvas.current) return
    let r: ReturnType<typeof createHeroGL> = null
    try {
      r = createHeroGL(canvas.current, {
        urls: slides.map((s) => heroUrl(s.name)),
        focus: slides.map((s) => s.focus),
        state: state.current,
        onReady: () => setGlReady(true),
      })
    } catch {
      r = null
    }
    if (!r) return
    gl.current = r
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? r!.start() : r!.stop()))
    io.observe(canvas.current)
    const vis = () => (document.hidden ? r!.stop() : r!.start())
    document.addEventListener('visibilitychange', vis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', vis)
      r!.dispose()
      gl.current = null
    }
  }, [reduce])

  const show = (n: number) => {
    setI(n)
    gl.current?.go(n)
  }

  // the next building after a pause, only while the visitor is still at the top
  useEffect(() => {
    if (reduce || paused || !atTop || !ready) return
    const t = setTimeout(() => show((i + 1) % slides.length), HOLD)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, reduce, paused, atTop, ready])

  // pointer depth: image, guide lines and copy move by different amounts
  useEffect(() => {
    if (reduce) return
    const fine = window.matchMedia('(pointer: fine)').matches
    let raf = 0
    const apply = (x: number, y: number) => {
      state.current.pointer.x = x
      state.current.pointer.y = y
      if (textLayer.current) textLayer.current.style.transform = `translate3d(${x * -10}px, ${y * -6}px, 0)`
      if (lineLayer.current) lineLayer.current.style.transform = `translate3d(${x * 22}px, ${y * 14}px, 0)`
    }
    if (fine) {
      const onMove = (e: PointerEvent) => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => apply((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1))
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      return () => {
        window.removeEventListener('pointermove', onMove)
        cancelAnimationFrame(raf)
      }
    }
    // touch screens: a slow drift instead of the pointer
    const t0 = performance.now()
    const tick = (t: number) => {
      const s = (t - t0) / 1000
      apply(Math.sin(s * 0.35) * 0.5, Math.cos(s * 0.27) * 0.3)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce])

  const s = slides[i]

  return (
    <section ref={section} id="top" data-tone="dark" aria-labelledby="hero-title" className={`relative bg-charcoal text-paper ${reduce ? '' : 'h-[200vh] max-md:h-[165vh]'}`}>
      <div className="sticky top-0 isolate h-[100svh] min-h-[36rem] overflow-hidden">
        {/* plain images: first paint, and the fallback without WebGL */}
        <div aria-hidden={glReady} className={`absolute inset-0 -z-20 transition-opacity duration-700 ${glReady ? 'opacity-0' : ''}`}>
          <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: imgScale, opacity: imgOpacity }}>
            {slides.map((sl, n) => (
              <WorkImage
                key={sl.name}
                name={sl.name}
                alt={n === i ? sl.alt : ''}
                fetchPriority={n === 0 ? 'high' : 'low'}
                loading={n === 0 ? 'eager' : 'lazy'}
                className={`absolute inset-0 size-full object-cover transition-opacity duration-[1400ms] ${n === i ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  objectPosition: `${sl.focus[0] * 100}% ${sl.focus[1] * 100}%`,
                }}
              />
            ))}
          </motion.div>
        </div>
        {!reduce && <canvas ref={canvas} aria-hidden="true" className={`absolute inset-0 -z-20 size-full transition-opacity duration-700 ${glReady ? 'opacity-100' : 'opacity-0'}`} />}
        {glReady && (
          <p className="sr-only" aria-live="polite">
            {s.alt}
          </p>
        )}

        {/* legibility */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(21,23,25,0.86)_0%,rgba(21,23,25,0.6)_34%,rgba(21,23,25,0.15)_62%,rgba(21,23,25,0)_85%)] max-md:bg-[linear-gradient(0deg,rgba(21,23,25,0.95)_0%,rgba(21,23,25,0.65)_48%,rgba(21,23,25,0.15)_85%)]"
          style={reduce ? undefined : { opacity: shadeOpacity }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-charcoal/60 to-transparent" />

        {/* depth layer: drawing guides floating in front of the building */}
        {!reduce && (
          <div ref={lineLayer} aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 hidden transition-transform duration-700 ease-out md:block">
            <motion.div className="absolute inset-0" style={{ opacity: restOpacity }}>
              <span className="absolute bottom-[14%] left-[56%] top-[16%] w-px bg-paper/15" />
              <span className="absolute left-[54%] right-[6%] top-[22%] h-px bg-paper/15" />
              <span className="absolute left-[56%] top-[22%] size-3 -translate-x-1/2 -translate-y-1/2 border border-orange" />
              <span className="absolute right-[7%] top-[23.5%] text-[0.68rem] uppercase tracking-[0.2em] text-paper/55">Elevation · {String(i + 1).padStart(2, '0')}</span>
              <span className="absolute bottom-[13%] left-[57%] text-[0.68rem] uppercase tracking-[0.2em] text-paper/45">±0.00 Ground</span>
            </motion.div>
          </div>
        )}

        <div ref={textLayer} className="relative h-full transition-transform duration-500 ease-out">
          <div className="wrap flex h-full flex-col justify-end pb-[clamp(6.5rem,15vh,10rem)] pt-28">
            <motion.p
              className="t-kicker mb-7 text-paper/85"
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={ready ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              style={reduce ? undefined : { opacity: restOpacity }}
            >
              {company.name}, Tirupati
            </motion.p>
            <motion.h1 id="hero-title" className="t-hero max-w-[12ch]" aria-label={lines.join(' ')} style={reduce ? undefined : { opacity: linesOpacity, filter: linesBlur }}>
              {lines.map((l, n) => (
                <motion.span key={l} className="block" style={reduce ? undefined : n === 0 ? { x: x0 } : n === 1 ? { x: x1 } : { x: x2, y: y2 }}>
                  <CharReveal as="span" text={l} play={ready} delay={0.25 + n * 0.18} className={`block ${n === 1 ? 'text-orange' : ''}`} />
                </motion.span>
              ))}
            </motion.h1>
            <motion.div style={reduce ? undefined : { opacity: restOpacity, y: restY }}>
              <motion.div
                className="mt-9 flex flex-col gap-8 md:mt-12 md:flex-row md:items-end md:gap-14"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={ready ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 1, delay: 1.05, ease: EASE }}
              >
                <p className="t-lead max-w-[27rem] text-paper/80">We design, approve and build homes and apartments in Tirupati, from the first plan to the day you collect your keys.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="#projects" className="btn btn-primary" onClick={(e) => (e.preventDefault(), go('projects'))}>
                    <span>Explore Our Projects</span> <ArrowIcon />
                  </a>
                  <a href="#finder" className="btn btn-outline-light" onClick={(e) => (e.preventDefault(), go('finder'))}>
                    <span>Find Your Property</span>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* hand-over line, written over the darkened scene */}
        {!reduce && (
          <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center px-6" style={{ opacity: handOpacity }}>
            <div className="overflow-hidden">
              <motion.p className="t-h1 max-w-[18ch] text-center" style={{ y: handY }}>
                Every address starts as a <span className="text-orange">line on paper.</span>
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* which building is showing, and controls to choose another */}
        <motion.div
          className="absolute bottom-7 right-[clamp(1.25rem,5vw,4.5rem)] flex items-center gap-5"
          style={reduce ? undefined : { opacity: restOpacity }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <p className="hidden text-right text-[0.85rem] leading-tight lg:block" aria-live="polite">
            <span className="block font-[620]">{s.title}</span>
            <span className="text-paper/60">3D elevation by our office</span>
          </p>
          <div className="flex gap-1" role="group" aria-label="Choose a building">
            {slides.map((sl, n) => (
              <button key={sl.name} type="button" onClick={() => show(n)} aria-label={`Show ${sl.title}`} aria-pressed={n === i} className="group grid h-9 w-8 place-items-center">
                <span className="relative block h-[2px] w-full overflow-hidden bg-paper/30">
                  {n === i && <span key={`${i}-${paused}-${atTop}-${ready}`} className={`absolute inset-0 origin-left bg-orange ${reduce || paused || !atTop || !ready ? '' : 'animate-[slidebar_6.5s_linear_forwards]'}`} />}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* scroll cue */}
        <motion.a
          href="#about"
          onClick={(e) => (e.preventDefault(), go('about'))}
          data-magnetic
          className="absolute bottom-6 left-1/2 hidden size-28 -translate-x-1/2 place-items-center md:grid"
          aria-label="Scroll to the next section"
          style={reduce ? undefined : { opacity: restOpacity }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full motion-safe:animate-[spin_14s_linear_infinite]" aria-hidden="true">
            <defs>
              <path id="badge-circle" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
            </defs>
            <text
              fill="currentColor"
              style={{
                font: '600 9.5px Archivo Variable, sans-serif',
                letterSpacing: '0.2em',
              }}
            >
              <textPath href="#badge-circle">SCROLL TO EXPLORE · REGAL CIVIL ENGINEERS ·</textPath>
            </text>
          </svg>
          <span className="relative grid size-11 place-items-center rounded-full bg-orange text-charcoal motion-safe:animate-[bob_2s_ease-in-out_infinite]">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </span>
        </motion.a>
      </div>
      <style>{`@keyframes bob{0%,100%{transform:translateY(-3px)}50%{transform:translateY(4px)}}@keyframes slidebar{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </section>
  )
}
