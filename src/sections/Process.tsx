import { motion, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'
import { SectionHead } from '../components/ui'
import { processSteps } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

/* Elevation drawing that grows one layer per step. */
const GROUND = 290
const L = 120
const R = 280
const FLOORS = 8
const FH = 24
const TOP = GROUND - FLOORS * FH
const GRID = ['A', 'B', 'C', 'D', 'E'].map((label, k) => ({ label, x: L + (k * (R - L)) / 4 }))
const LEVEL = 32.4 / FLOORS

function Layer({ on, children, delay = 0 }: { on: boolean; children: React.ReactNode; delay?: number }) {
  return (
    <g className="proc-draw" data-on={on} style={{ ['--d' as string]: `${delay}s` }}>
      {children}
    </g>
  )
}

function Elevation({ step }: { step: number }) {
  const bays = GRID.slice(0, -1).map((g, k) => ({ x: g.x, w: GRID[k + 1].x - g.x }))
  return (
    <svg viewBox="40 36 330 350" className="size-full" role="img" aria-label={`Elevation drawing at stage ${step + 1}: ${processSteps[step].title}`}>
      {/* ground line is always there */}
      <line x1="48" x2="362" y1={GROUND} y2={GROUND} stroke="currentColor" strokeWidth="1.4" />
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.35">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={54 + i * 20} y1={GROUND + 2} x2={46 + i * 20} y2={GROUND + 10} />
        ))}
      </g>

      {/* 1. site: boundary and north */}
      <Layer on={step >= 0}>
        <path pathLength={1} d={`M60 ${GROUND + 62} H350`} fill="none" stroke="currentColor" strokeWidth="0.9" className="dash" />
        <path pathLength={1} d={`M60 ${GROUND + 56} V${GROUND + 68} M350 ${GROUND + 56} V${GROUND + 68}`} fill="none" stroke="currentColor" strokeWidth="0.9" />
        <text x="205" y={GROUND + 78} textAnchor="middle" className="proc-text" fontSize="8" letterSpacing="1.5" fill="currentColor">
          SITE BOUNDARY 52.00
        </text>
        <g transform="translate(70 62)">
          <circle pathLength={1} r="11" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <path pathLength={1} d="M0 -9 L5 6 L0 2 L-5 6 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <text y="-15" textAnchor="middle" fontSize="8" className="proc-text" fill="currentColor">
            N
          </text>
        </g>
      </Layer>

      {/* 2. design: envelope and overall height */}
      <Layer on={step >= 1}>
        <path pathLength={1} d={`M${L} ${GROUND} V${TOP} H${R} V${GROUND}`} fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path pathLength={1} d={`M${L - 22} ${GROUND} V${TOP} M${L - 26} ${GROUND} H${L - 18} M${L - 26} ${TOP} H${L - 18}`} fill="none" stroke="var(--color-orange)" strokeWidth="0.8" />
        <text x={L - 30} y={(GROUND + TOP) / 2} textAnchor="middle" fontSize="8" className="proc-text" fill="var(--color-orange-deep)" transform={`rotate(-90 ${L - 30} ${(GROUND + TOP) / 2})`}>
          32.40
        </text>
      </Layer>

      {/* 3. engineering: structural grid and levels */}
      <Layer on={step >= 2}>
        {GRID.map((g) => (
          <g key={g.label}>
            <path pathLength={1} d={`M${g.x} ${TOP - 20} V${GROUND + 44}`} fill="none" stroke="currentColor" strokeWidth="0.4" className="dash" opacity="0.6" />
            <circle pathLength={1} cx={g.x} cy={TOP - 28} r="7" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <text x={g.x} y={TOP - 25} textAnchor="middle" fontSize="7.5" className="proc-text" fill="currentColor">
              {g.label}
            </text>
          </g>
        ))}
        {Array.from({ length: FLOORS }, (_, f) => f + 1).map((f) => (
          <g key={f}>
            <path pathLength={1} d={`M${R + 4} ${GROUND - f * FH} H${R + 16}`} fill="none" stroke="currentColor" strokeWidth="0.6" />
            <text x={R + 19} y={GROUND - f * FH + 2.5} fontSize="6.5" className="proc-text tabular" fill="currentColor" opacity="0.75">
              +{(f * LEVEL).toFixed(2)}
            </text>
          </g>
        ))}
      </Layer>

      {/* 4. foundation: excavation and piles */}
      <Layer on={step >= 3}>
        <path pathLength={1} d={`M${L - 22} ${GROUND} L${L - 12} ${GROUND + 14} H${R + 12} L${R + 22} ${GROUND}`} fill="none" stroke="var(--color-orange)" strokeWidth="1.2" />
        {GRID.map((g, k) => (
          <path key={g.label} pathLength={1} d={`M${g.x} ${GROUND + 18} V${GROUND + 50}`} fill="none" stroke="currentColor" strokeWidth="3" style={{ ['--d' as string]: `${0.1 + k * 0.08}s` }} />
        ))}
      </Layer>

      {/* 5. structure: columns and floor plates */}
      <Layer on={step >= 4}>
        {GRID.map((g) => (
          <path key={g.label} pathLength={1} d={`M${g.x} ${GROUND} V${TOP}`} fill="none" stroke="currentColor" strokeWidth="2.2" />
        ))}
        {Array.from({ length: FLOORS }, (_, f) => f + 1).map((f) => (
          <path key={f} pathLength={1} d={`M${L - 4} ${GROUND - f * FH} H${R + 4}`} fill="none" stroke="currentColor" strokeWidth="1.6" style={{ ['--d' as string]: `${f * 0.06}s` }} />
        ))}
      </Layer>

      {/* 6. finishing: glazing */}
      <g className="proc-fill" data-on={step >= 5}>
        {Array.from({ length: FLOORS }, (_, f) => f).map((f) =>
          bays.map((b, k) => {
            if (f === 0 && k === 1) return null // entrance bay
            return (
              <rect
                key={`${f}-${k}`}
                x={b.x + 3}
                y={GROUND - (f + 1) * FH + 5}
                width={b.w - 6}
                height={FH - 9}
                fill={(f + k) % 3 === 0 ? 'var(--color-orange)' : 'var(--color-steel)'}
                style={{ transitionDelay: `${(f * 4 + k) * 0.025}s` }}
              />
            )
          }),
        )}
      </g>

      {/* 7. handover: entrance, trees and sun */}
      <Layer on={step >= 6}>
        <path pathLength={1} d={`M${bays[1].x + 6} ${GROUND} V${GROUND - 17} H${bays[1].x + bays[1].w - 6} V${GROUND} M${bays[1].x - 2} ${GROUND - 20} H${bays[1].x + bays[1].w + 2}`} fill="none" stroke="var(--color-orange)" strokeWidth="1.4" />
        {[78, 330].map((x, i) => (
          <g key={x}>
            <path pathLength={1} d={`M${x} ${GROUND} V${GROUND - 22}`} fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle pathLength={1} cx={x} cy={GROUND - 34} r={i ? 14 : 17} fill="none" stroke="currentColor" strokeWidth="1" />
          </g>
        ))}
        <g transform="translate(336 72)">
          <circle pathLength={1} r="11" fill="none" stroke="var(--color-orange)" strokeWidth="1.2" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            return <path key={i} pathLength={1} d={`M${Math.cos(a) * 15} ${Math.sin(a) * 15} L${Math.cos(a) * 20} ${Math.sin(a) * 20}`} fill="none" stroke="var(--color-orange)" strokeWidth="1" />
          })}
        </g>
      </Layer>
    </svg>
  )
}

export default function Process() {
  const [step, setStep] = useState(0)
  const list = useRef<HTMLOListElement>(null)
  const rail = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  // the step in the middle of the screen is the active one
  useEffect(() => {
    const items = list.current ? Array.from(list.current.querySelectorAll<HTMLElement>('[data-step]')) : []
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step))
      },
      { rootMargin: '-48% 0px -48% 0px' },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!list.current || !rail.current) return
    const tween = gsap.fromTo(
      rail.current,
      { scaleY: 0 },
      { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list.current, start: 'top 50%', end: 'bottom 50%', scrub: true } },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section id="process" data-tone="light" aria-labelledby="process-title" className="py-[clamp(5rem,12vw,10rem)]">
      <div className="wrap">
        <SectionHead kicker="Our process" id="process-title" title="Our construction process" intro="Seven stages from the first site visit to handing over the keys, with approvals handled before work starts." />

        <div className="mt-12 grid gap-x-12 lg:mt-16 lg:grid-cols-12">
          {/* drawing: sticky beside the steps on desktop, pinned above them on phones */}
          <div className="sticky top-16 z-10 -mx-4 bg-paper px-4 pb-3 pt-2 lg:top-28 lg:col-span-6 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0">
            <figure className="relative h-[34svh] border border-charcoal/15 lg:aspect-square lg:h-auto">
              <div aria-hidden="true" className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,color-mix(in_oklab,currentColor_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,currentColor_7%,transparent)_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="absolute inset-0 p-3 lg:p-6">
                <Elevation step={step} />
              </div>
              <figcaption className="absolute bottom-0 right-0 hidden border-l border-t border-charcoal/15 bg-paper px-3 py-2 text-[0.72rem] uppercase tracking-[0.14em] sm:block">
                <span className="opacity-55">Sheet</span> A-300 <span className="mx-2 opacity-30">|</span>
                <span className="tabular">
                  {String(step + 1).padStart(2, '0')}/{String(processSteps.length).padStart(2, '0')}
                </span>
              </figcaption>
            </figure>
          </div>

          <div className="relative mt-6 lg:col-span-6 lg:mt-0">
            <span aria-hidden="true" className="absolute bottom-0 left-[1.35rem] top-0 w-px bg-charcoal/15" />
            <span ref={rail} aria-hidden="true" className="absolute bottom-0 left-[1.35rem] top-0 w-px origin-top scale-y-0 bg-orange" />
            <ol ref={list} className="relative">
              {processSteps.map((s, i) => {
                const active = i === step
                const done = i < step
                return (
                  <motion.li
                    key={s.title}
                    data-step={i}
                    aria-current={active ? 'step' : undefined}
                    className="grid grid-cols-[2.7rem_1fr] gap-5 py-[clamp(2rem,6vh,3.5rem)]"
                    initial={reduce ? false : { opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span
                      className={`tabular relative z-[1] grid size-[2.7rem] place-items-center rounded-full border text-[0.9rem] font-[600] transition-colors duration-500 ${
                        active ? 'border-orange bg-orange text-charcoal' : done ? 'border-charcoal bg-charcoal text-paper' : 'border-charcoal/25 bg-paper'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className={`transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-55'}`}>
                      <h3 className="t-h3">{s.title}</h3>
                      <p className="mt-3 max-w-[48ch] text-[1.02rem] leading-relaxed opacity-80">{s.body}</p>
                      <p className="mt-4 text-[0.92rem]">
                        <span className="font-[620] text-orange-deep">You receive:</span> <span className="opacity-75">{s.output}</span>
                      </p>
                    </div>
                  </motion.li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
