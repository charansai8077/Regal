import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { CountUp, RevealImage } from '../components/ui'
import { stats } from '../config/site'

const text =
  'Regal Civil Engineers provides complete construction and architectural services. We plan your building, take it through TUDA, DTCP and municipal approvals, design the structure and build it, so your project is completed smoothly and legally.'

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}{' '}
    </motion.span>
  )
}

/** Company statement that fills in word by word as you read down the page. */
export default function Statement() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = text.split(' ')
  const shown = stats.filter((s) => s.verified)

  return (
    <section id="about" data-tone="light" aria-labelledby="about-title" className="relative py-[clamp(6rem,14vw,12rem)]">
      <div className="wrap">
        <h2 id="about-title" className="t-kicker opacity-80">
          About us
        </h2>
        <p ref={ref} className="mt-10 max-w-[30ch] text-[clamp(1.9rem,4vw,4rem)] font-[480] leading-[1.12] tracking-[-0.03em]" style={{ fontVariationSettings: "'wdth' 104" }}>
          {reduce ? text : words.map((w, i) => <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>)}
        </p>

        <div className="mt-[clamp(4rem,9vw,8rem)] grid gap-10 lg:grid-cols-12 lg:items-end">
          {/* two elevations, offset like prints pinned to a board */}
          <div className="relative lg:col-span-7">
            <RevealImage name="acs-heights-option" alt="ACS Heights apartment building elevation at dusk" sizes="(min-width: 1024px) 50vw, 90vw" className="aspect-[4/3.4] w-[82%]" />
            <RevealImage name="g2-residence-sunset" alt="Three-floor residence with stone and wood cladding at sunset" sizes="(min-width: 1024px) 24vw, 45vw" from="left" className="absolute -bottom-[12%] right-0 aspect-[4/3.4] w-[42%] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.45)] ring-8 ring-[var(--tone-bg)]" parallax={14} />
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 pt-[12%] lg:col-span-5 lg:pt-0">
            {shown.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-2 border-t border-fg/15 pt-5">
                <dt className="max-w-[18ch] text-[0.95rem] opacity-70">{s.label}</dt>
                <dd className="tabular text-[clamp(2.4rem,4.4vw,3.8rem)] font-[560] leading-none tracking-[-0.04em]" style={{ fontVariationSettings: "'wdth' 112" }}>
                  <CountUp value={s.value} />
                  {s.suffix}
                  {s.unit && <span className="ml-1.5 text-[0.36em] font-[560] tracking-normal opacity-60">{s.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
