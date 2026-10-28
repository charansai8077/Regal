import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { MessageCircle, Phone } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { company, contact, socials } from '../config/site'
import { projects } from '../data/projects'
import { services } from '../data/services'
import { useEnquire } from '../lib/enquire'
import { sections, useGoToSection } from '../lib/nav'
import { Logo } from './ui'
import WorkImage from './WorkImage'
import { CharReveal, Marquee } from './motion'

/**
 * Closing call to action over a photograph that rises into view, then the
 * site footer. The big wordmark settles into place as the page ends.
 */
export default function Footer() {
  const go = useGoToSection()
  const enquire = useEnquire()
  const reduce = useReducedMotion()
  const cta = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: cta, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-14%', '14%'])
  const mark = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress: markP } = useScroll({ target: mark, offset: ['start end', 'end end'] })
  const markY = useTransform(markP, [0, 1], ['60%', '0%'])
  const year = new Date().getFullYear()

  return (
    <footer className="bg-charcoal text-paper">
      <div className="border-y border-paper/10 py-6">
        <Marquee items={['Built for life', 'Designed for generations', 'Approved before we build', 'Tirupati']} className="text-[clamp(2.4rem,6vw,5.6rem)] font-[560] leading-none tracking-[-0.03em] text-paper/90" speed={45} />
      </div>
      {/* final call to action */}
      <div ref={cta} className="relative isolate overflow-hidden">
        <motion.div className="absolute inset-[-14%_0] -z-10" style={reduce ? undefined : { y: imgY }}>
          <WorkImage name="twin-residences" alt="" sizes="100vw" loading="lazy" className="size-full object-cover" />
        </motion.div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-charcoal/70" />
        <div className="wrap py-[clamp(6rem,14vw,11rem)]">
          <CharReveal as="h2" text="Ready to build the home your family deserves?" className="t-h1 max-w-[14ch]" />
          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={() => enquire({ type: 'site-visit', project: projects[0].name })} className="btn btn-primary">
              <span>Schedule a Site Visit</span>
            </button>
            <button type="button" onClick={() => enquire({ type: 'brochure', project: projects[0].name })} className="btn btn-outline-light">
              <span>Request a Brochure</span>
            </button>
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-outline-light">
              <MessageCircle size={17} aria-hidden="true" /> <span>WhatsApp us</span>
            </a>
          </div>
        </div>
      </div>

      <div className="wrap pt-[clamp(4rem,8vw,6rem)]">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-[32ch] leading-relaxed text-paper/65">{company.tagline} in Tirupati, with help for TUDA, DTCP and municipal approvals.</p>
            <div className="mt-7 space-y-2">
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-[1.15rem] font-[560]">
                <Phone size={18} className="text-orange" aria-hidden="true" />
                <span className="link-line">{contact.phone}</span>
              </a>
              <a href={`mailto:${contact.email}`} className="link-line block break-all text-paper/75">
                {contact.email}
              </a>
              <p className="text-paper/65">{contact.address.slice(0, 2).join(', ')}</p>
            </div>
          </div>

          <nav aria-label="Footer: site" className="lg:col-span-2">
            <h2 className="text-[0.88rem] text-paper/50">Explore</h2>
            <ul className="mt-5 space-y-3">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={(e) => (e.preventDefault(), go(s.id))} className="link-line text-paper/80 hover:text-paper">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer: projects and services" className="md:col-span-2 lg:col-span-4">
            <h2 className="text-[0.88rem] text-paper/50">Projects</h2>
            <ul className="mt-5 space-y-3">
              {projects.map((p) => (
                <li key={p.slug}>
                  <Link to={`/projects/${p.slug}`} className="link-line text-paper/80 hover:text-paper">
                    {p.name}, {p.location}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mt-9 text-[0.88rem] text-paper/50">Services</h2>
            <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services/${s.slug}`} className="link-line text-paper/80 hover:text-paper">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h2 className="text-[0.88rem] text-paper/50">Talk to us</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="link-line text-paper/80 hover:text-paper">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={contact.mapUrl} target="_blank" rel="noreferrer" className="link-line text-paper/80 hover:text-paper">
                  Find our office
                </a>
              </li>
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="link-line text-paper/80 hover:text-paper">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="overflow-hidden pt-[clamp(3rem,7vw,5rem)]">
          <motion.p ref={mark} aria-hidden="true" className="select-none whitespace-nowrap text-[clamp(2.2rem,8.4vw,8.6rem)] font-[600] leading-[0.82] tracking-[-0.05em] text-paper/[0.08]" style={reduce ? { fontVariationSettings: "'wdth' 112" } : { y: markY, fontVariationSettings: "'wdth' 112" }}>
            {company.name}
          </motion.p>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-paper/10 py-7 pb-[calc(1.75rem+5rem)] text-[0.88rem] text-paper/50 md:flex-row md:items-center md:justify-between md:pb-7 md:pr-20">
          <p>
            © {year} {company.legalName}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              ['disclaimer', 'Disclaimer'],
              ['privacy', 'Privacy policy'],
              ['terms', 'Terms of use'],
            ].map(([slug, label]) => (
              <li key={slug}>
                <Link to={`/legal/${slug}`} className="link-line hover:text-paper">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
