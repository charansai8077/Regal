import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { company, contact } from '../config/site'
import { sections, useGoToSection } from '../lib/nav'
import { lockScroll } from '../lib/smooth'
import { Logo } from './ui'
import WorkImage from './WorkImage'

const MENU_IMAGES: Record<string, string> = {
  top: 'acs-heights-option',
  about: 'g2-residence-sunset',
  projects: 'g5-apartments-night',
  services: 'plan-4-flats-iso',
  approvals: 'brochure-acs-heights',
  process: 'twin-residences',
  contact: 'contemporary-residence',
}

/**
 * Transparent over the hero; once you scroll it tightens into a compact
 * dark bar. The menu opens as a full-screen sheet with a preview of each section.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const loc = useLocation()
  const go = useGoToSection()
  const compact = scrolled || loc.pathname !== '/' || open

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 60)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => setOpen(false), [loc.pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    lockScroll(true)
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const click = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    go(id)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 text-paper">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:rounded-full focus:bg-orange focus:px-4 focus:py-2 focus:text-charcoal">
        Skip to content
      </a>
      <div
        className={`transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          compact ? 'bg-charcoal/88 shadow-[0_1px_0_rgba(245,244,240,0.08)] backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <nav aria-label="Main" className={`wrap flex items-center justify-between gap-6 transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${compact ? 'h-[3.75rem]' : 'h-20 md:h-24'}`}>
          <Link to="/" onClick={click('top')} aria-label={`${company.name}, back to the top of the home page`} className={`origin-left transition-transform duration-500 ${compact ? 'scale-[0.86]' : ''}`}>
            <Logo />
          </Link>
          <ul className="hidden items-center gap-7 xl:flex">
            {sections.slice(1).map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={click(s.id)} className="link-line py-1 text-[0.93rem] text-paper/80 transition-colors hover:text-paper">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hidden size-11 place-items-center rounded-full border border-paper/25 transition-colors hover:border-paper sm:grid" aria-label={`Call ${contact.phone}`}>
              <Phone size={17} aria-hidden="true" />
            </a>
            <a href="#contact" onClick={click('contact')} className={`btn btn-primary hidden sm:inline-flex ${compact ? '!min-h-10' : '!min-h-11'}`}>
              <span>Talk to Our Team</span>
            </a>
            <button type="button" data-magnetic className="flex h-11 items-center gap-2 rounded-full border border-paper/25 px-3 transition-colors hover:border-paper sm:px-4" aria-expanded={open} aria-controls="site-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
              <span className="hidden text-[0.9rem] sm:inline">{open ? 'Close' : 'Menu'}</span>
              {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ clipPath: 'circle(0% at 96% 2%)' }}
            animate={{ clipPath: 'circle(150% at 96% 2%)' }}
            exit={{ clipPath: 'circle(0% at 96% 2%)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-x-0 bottom-0 top-[3.75rem] overflow-y-auto bg-charcoal"
          >
            <div className="wrap grid min-h-full gap-10 py-8 lg:grid-cols-12 lg:items-center lg:py-12">
              <ul className="lg:col-span-7" onMouseLeave={() => setHover(null)}>
                {sections.map((s, i) => (
                  <li key={s.id} className="border-b border-paper/10">
                    <a
                      href={`#${s.id}`}
                      onClick={click(s.id)}
                      onMouseEnter={() => setHover(i)}
                      onFocus={() => setHover(i)}
                      className="group flex items-baseline gap-5 overflow-hidden py-3 lg:py-4"
                    >
                      <span className="tabular w-8 shrink-0 text-[0.85rem] text-paper/45">{String(i + 1).padStart(2, '0')}</span>
                      <motion.span
                        className="block text-[clamp(1.8rem,min(5vw,7svh),4.4rem)] font-[560] leading-[1.02] tracking-[-0.035em] transition-[color,transform] duration-500 group-hover:translate-x-3 group-hover:text-orange"
                        style={{ fontVariationSettings: "'wdth' 110" }}
                        initial={{ y: '110%' }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.25 + i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {s.label}
                      </motion.span>
                    </a>
                  </li>
                ))}
              </ul>
              {/* preview of the section under the pointer (large screens) */}
              <div className="relative hidden aspect-[4/5] overflow-hidden lg:col-span-5 lg:block" aria-hidden="true">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={hover ?? -1}
                    className="absolute inset-0"
                    initial={{ clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15 }}
                    animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.3 } }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                  >
                    <WorkImage name={MENU_IMAGES[sections[hover ?? 0].id]} alt="" sizes="40vw" className="size-full object-cover" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent p-6">
                  <p className="text-[0.85rem] text-paper/70">{company.tagline}</p>
                </div>
              </div>
              <motion.div className="grid gap-3 sm:grid-cols-2 lg:col-span-7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
                <a href="#contact" onClick={click('contact')} className="btn btn-primary w-full">
                  Talk to Our Team
                </a>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="btn btn-outline-light w-full">
                  <Phone size={17} aria-hidden="true" /> Call {contact.phone}
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
