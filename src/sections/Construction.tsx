import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { CharReveal } from '../components/motion'
import { constructionStages } from '../data/content'
import { asset, useCompact, useNearViewport } from '../lib/hooks'
import { stageAt } from '../three/stages'

gsap.registerPlugin(ScrollTrigger)

const ConstructionScene = lazy(() => import('../three/ConstructionScene'))

const FLOORS = 12

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/*
 * The building builds itself as you scroll: piles and raft, core and
 * columns, steel frame, slabs and walls, glass, then lights on and the
 * company sign on the roof.
 */
export default function Construction() {
  const { ref: track, near, seen } = useNearViewport<HTMLElement>('25% 0px')
  const target = useRef(0)
  const bar = useRef<HTMLSpanElement>(null)
  const storeys = useRef<HTMLSpanElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const [stage, setStage] = useState(0)
  const compact = useCompact()
  const webgl = useMemo(() => hasWebGL(), [])

  useEffect(() => {
    if (!track.current) return
    const apply = (p: number) => {
      target.current = p
      const s = stageAt(p)
      setStage((prev) => (prev === s ? prev : s))
      if (bar.current) bar.current.style.transform = `scaleY(${p})`
      // storeys count while the columns and floors go up
      const q = Math.min(1, Math.max(0, (p - 0.1) / 0.9))
      const built = Math.round(Math.min(1, Math.max(0, (q - 0.14) / (0.62 - 0.14))) * FLOORS)
      if (storeys.current) storeys.current.textContent = String(built).padStart(2, '0')
      if (pct.current) pct.current.textContent = String(Math.round(p * 100)).padStart(2, '0')
    }
    apply(0)
    const trig = ScrollTrigger.create({
      trigger: track.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
    })
    return () => trig.kill()
  }, [track])

  return (
    <section ref={track} id="build" data-tone="dark" aria-labelledby="build-title" className="relative h-[600vh] bg-charcoal text-paper">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* the scene */}
        <div className="absolute inset-0" aria-hidden="true">
          {webgl && seen ? (
            <Suspense fallback={null}>
              <ConstructionScene target={target} active={near} compact={compact} />
            </Suspense>
          ) : !webgl ? (
            <img src={asset('work/structural-lines.webp')} alt="" className="size-full object-contain object-right opacity-70" />
          ) : null}
        </div>
        {/* keeps the text readable over the scene */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent md:bg-gradient-to-r md:from-charcoal md:via-charcoal/55 md:to-transparent md:to-[60%]" />

        <div className="wrap pointer-events-none relative flex h-full flex-col justify-end pb-24 md:justify-center md:pb-0">
          <div className="max-w-[25rem]">
            <p className="t-kicker mb-4 text-paper/80 md:mb-6">From blueprint to reality</p>
            <CharReveal text="From first pile to first light" id="build-title" className="t-h2 !text-[clamp(1.8rem,4vw,3.8rem)]" />
            <div className="relative mt-5 pl-6 md:mt-8">
              <span className="absolute bottom-1 left-0 top-1 w-px bg-paper/15" aria-hidden="true" />
              <span ref={bar} className="absolute bottom-1 left-0 top-1 w-px origin-top scale-y-0 bg-orange" aria-hidden="true" />
              <ol className="space-y-1" aria-label="Construction stages">
                {constructionStages.map((s, i) => {
                  const active = i === stage
                  return (
                    <li key={s.title} aria-current={active ? 'step' : undefined} className={active ? '' : 'max-md:hidden'}>
                      <div className={`flex items-baseline gap-3 transition-colors duration-500 ${active ? 'text-paper' : i < stage ? 'text-paper/45' : 'text-paper/30'}`}>
                        <span className="tabular w-6 shrink-0 text-[0.85rem] opacity-70">{String(i + 1).padStart(2, '0')}</span>
                        <span className="text-[1.05rem] font-[640]" style={{ fontVariationSettings: "'wdth' 108" }}>
                          {s.title}
                        </span>
                      </div>
                      <div className={`grid transition-[grid-template-rows,opacity] duration-500 ${active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <p className="overflow-hidden pl-9 text-[0.95rem] leading-relaxed text-paper/70">
                          <span className="block pb-3 pt-1.5">{s.body}</span>
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
            <p className="mt-4 hidden text-[0.82rem] text-paper/45 md:block">A conceptual animation of how a building is put together. Our real projects follow.</p>
            <div className="tabular mt-5 flex gap-6 text-[0.88rem] text-paper/55" aria-hidden="true">
              <span>
                Storeys complete <span ref={storeys} className="text-paper">00</span>/{FLOORS}
              </span>
              <span>
                Programme <span ref={pct} className="text-paper">00</span>%
              </span>
            </div>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          Stage {stage + 1} of {constructionStages.length}: {constructionStages[stage].title}
        </p>
      </div>
    </section>
  )
}
