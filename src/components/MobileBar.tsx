import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { contact } from '../config/site'
import { useEnquire } from '../lib/enquire'

/** Phone-only bar with the three quickest ways to reach the office. Appears after the first screen. */
export default function MobileBar() {
  const [show, setShow] = useState(false)
  const enquire = useEnquire()
  useEffect(() => {
    const on = () => {
      const contactEl = document.getElementById('contact')
      const inContact = contactEl ? contactEl.getBoundingClientRect().top < window.innerHeight * 0.6 && contactEl.getBoundingClientRect().bottom > 0 : false
      setShow(window.scrollY > window.innerHeight * 0.8 && !inContact)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.nav
          aria-label="Quick contact"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-paper/10 bg-charcoal/92 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] pt-2.5 text-paper backdrop-blur-xl md:hidden"
        >
          <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-paper/25 text-[0.92rem] font-[600]">
              <Phone size={17} aria-hidden="true" /> Call
            </a>
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-paper/25 text-[0.92rem] font-[600]">
              <MessageCircle size={17} aria-hidden="true" /> WhatsApp
            </a>
            <button type="button" onClick={() => enquire({ type: 'site-visit' })} className="min-h-12 rounded-full bg-orange text-[0.92rem] font-[640] text-charcoal">
              Book a site visit
            </button>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
