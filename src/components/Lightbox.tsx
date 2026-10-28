import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { asset } from '../lib/hooks'
import { lockScroll } from '../lib/smooth'

/** Full-screen image viewer with keyboard support. `file` is a name in public/work. */
export default function Lightbox({ images, index, onClose, onIndex }: { images: { file: string; alt: string; caption?: string }[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const n = images.length
  const step = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex])
  // focus the dialog on open, restore focus on close
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    lockScroll(true)
    return () => {
      lockScroll(false)
      prev?.focus()
    }
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
      if (e.key === 'Tab' && dialog.current) {
        // keep keyboard focus inside the dialog
        const els = dialog.current.querySelectorAll<HTMLElement>('button')
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, step])
  return (
    <motion.div ref={dialog} role="dialog" aria-modal="true" aria-label="Project gallery" className="fixed inset-0 z-[60] flex flex-col bg-charcoal/97" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="wrap flex h-16 items-center justify-between">
        <span className="t-label opacity-70 text-paper/60">
          {index + 1} / {n}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} className="grid size-11 place-items-center border border-paper/25 hover:bg-paper hover:text-charcoal" aria-label="Close gallery">
          <X size={20} />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img key={index} src={asset(`work/${images[index].file}.webp`)} alt={images[index].alt} className="max-h-full max-w-full object-contain" initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} />
        </AnimatePresence>
        <button type="button" onClick={() => step(-1)} className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-charcoal/70 ring-1 ring-paper/20 hover:bg-paper hover:text-charcoal md:left-6" aria-label="Previous image">
          <ChevronLeft size={22} />
        </button>
        <button type="button" onClick={() => step(1)} className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center bg-charcoal/70 ring-1 ring-paper/20 hover:bg-paper hover:text-charcoal md:right-6" aria-label="Next image">
          <ChevronRight size={22} />
        </button>
      </div>
      <p className="wrap pb-6 text-sm text-paper/70">{images[index].caption ?? images[index].alt}</p>
    </motion.div>
  )
}

