import { animate, useInView, useReducedMotion } from 'framer-motion'
import { MoveHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SectionHead } from '../components/ui'
import { asset } from '../lib/hooks'

/**
 * Drawing-to-render comparison for ACS Heights: drag the handle (or use the
 * arrow keys) to wipe between the line drawing and the finished 3D elevation.
 */
export default function Compare() {
  const [pos, setPos] = useState(50)
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const reduce = useReducedMotion()
  const inView = useInView(box, { once: true, amount: 0.5 })

  // a short sweep the first time it appears, so people see it can move
  useEffect(() => {
    if (!inView || reduce) return
    const c = animate(78, 50, { duration: 1.6, ease: [0.65, 0, 0.35, 1], onUpdate: setPos })
    return () => c.stop()
  }, [inView, reduce])

  const fromPointer = (clientX: number) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <section data-tone="light" aria-labelledby="compare-title" className="py-[clamp(5rem,12vw,10rem)]">
      <div className="wrap">
        <SectionHead
          kicker="Drawing to reality"
          id="compare-title"
          title="Every line has a purpose"
          intro="Drag across ACS Heights to compare our elevation drawing with the finished 3D design. What we draw is what we build."
        />
        <div
          ref={box}
          data-cursor="Drag"
          className="relative mx-auto mt-12 aspect-[1200/1123] max-h-[85svh] max-w-full cursor-ew-resize touch-pan-y select-none overflow-hidden bg-steel"
          style={{ width: 'min(100%, calc(85svh * 1200 / 1123))' }}
          onPointerDown={(e) => {
            dragging.current = true
            ;(e.target as Element).setPointerCapture?.(e.pointerId)
            fromPointer(e.clientX)
          }}
          onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <img src={asset('work/build-render.webp')} alt="ACS Heights finished 3D elevation" className="absolute inset-0 size-full object-cover" draggable={false} />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img src={asset('work/structural-lines.webp')} alt="ACS Heights elevation line drawing" className="absolute inset-0 size-full object-cover" draggable={false} />
          </div>
          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-charcoal/70 px-3 py-1 text-[0.82rem] text-paper backdrop-blur">Drawing</span>
          <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-charcoal/70 px-3 py-1 text-[0.82rem] text-paper backdrop-blur">3D elevation</span>
          {/* handle */}
          <div className="pointer-events-none absolute inset-y-0 w-px bg-paper shadow-[0_0_0_1px_rgba(0,0,0,0.15)]" style={{ left: `${pos}%` }}>
            <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-charcoal shadow-xl">
              <MoveHorizontal size={20} aria-hidden="true" />
            </span>
          </div>
          <label className="sr-only" htmlFor="compare-range">
            Compare drawing and 3D elevation
          </label>
          <input
            id="compare-range"
            type="range"
            min={0}
            max={100}
            value={Math.round(pos)}
            onChange={(e) => setPos(Number(e.target.value))}
            className="absolute inset-0 size-full cursor-ew-resize opacity-0 focus-visible:opacity-0"
            onFocus={(e) => e.currentTarget.parentElement?.classList.add('ring-2', 'ring-orange', 'ring-offset-4')}
            onBlur={(e) => e.currentTarget.parentElement?.classList.remove('ring-2', 'ring-orange', 'ring-offset-4')}
          />
        </div>
      </div>
    </section>
  )
}
