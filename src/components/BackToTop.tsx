import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { scrollToId } from '../lib/nav'

/** Appears after the first screen; its ring shows how far down the page you are. */
export default function BackToTop() {
  const [show, setShow] = useState(false)
  const ring = useRef<SVGRectElement>(null)
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      setShow(window.scrollY > window.innerHeight * 1.2)
      if (ring.current) ring.current.style.strokeDashoffset = String(1 - p)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          onClick={() => scrollToId('top')}
          aria-label="Back to top"
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 z-40 hidden size-12 md:grid place-items-center bg-charcoal/90 text-paper shadow-lg ring-1 ring-paper/15 backdrop-blur transition-colors hover:bg-orange hover:text-charcoal md:right-6"
        >
          <svg viewBox="0 0 48 48" className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
            <rect ref={ring} x="0.75" y="0.75" width="46.5" height="46.5" fill="none" stroke="#D96C2D" strokeWidth="1.5" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
          </svg>
          <ArrowUp size={18} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
