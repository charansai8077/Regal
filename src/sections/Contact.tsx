import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, Loader2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowIcon, SplitReveal } from '../components/ui'
import { budgetRanges, contact } from '../config/site'
import { projects } from '../data/projects'
import { ENQUIRE_EVENT, enquiryTypes, type EnquiryPreset, type EnquiryType } from '../lib/enquire'
import { emailLink, emptyEnquiry, fieldsFor, hasEndpoint, submitEnquiry, validate, whatsappLink, type Enquiry, type Errors } from '../lib/enquiry'

type Status = 'idle' | 'sending' | 'sent' | 'handed-off' | 'failed'

const projectOptions = [...projects.map((p) => `${p.name}, ${p.location}`), 'A new house on my plot', 'Not decided yet']

function Field({ id, label, optional, error, hint, children, className = '' }: { id: string; label: string; optional?: boolean; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[0.92rem] font-[600]">
        <span>{label}</span>
        {optional && <span className="text-[0.82rem] font-[400] opacity-50">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-[0.88rem] text-[#ff9d90]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-[0.85rem] opacity-50">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default function Contact() {
  const uid = useId()
  const f = (k: string) => `${uid}-${k}`
  const [v, setV] = useState<Enquiry>(emptyEnquiry)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Enquiry, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [detail, setDetail] = useState('')
  const statusRef = useRef<HTMLDivElement>(null)
  const loc = useLocation()
  const show = fieldsFor(v.type)

  const applyPreset = (p: EnquiryPreset) => {
    const match = p.project ? projectOptions.find((o) => o.startsWith(p.project!)) : undefined
    setV((prev) => ({ ...prev, type: p.type, project: match ?? prev.project }))
    setStatus('idle')
  }

  // preset from buttons elsewhere on the page, or from another page
  useEffect(() => {
    const on = (e: Event) => applyPreset((e as CustomEvent<EnquiryPreset>).detail)
    window.addEventListener(ENQUIRE_EVENT, on)
    return () => window.removeEventListener(ENQUIRE_EVENT, on)
  }, [])
  useEffect(() => {
    const p = (loc.state as { enquiry?: EnquiryPreset } | null)?.enquiry
    if (p) applyPreset(p)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.state])

  const set = (k: keyof Enquiry) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...v, [k]: e.target.value }
    setV(next)
    if (touched[k]) setErrors(validate(next))
  }
  const blur = (k: keyof Enquiry) => () => {
    setTouched((t) => ({ ...t, [k]: true }))
    setErrors(validate(v))
  }
  const err = (k: keyof Enquiry) => (touched[k] ? errors[k] : undefined)
  const aria = (k: keyof Enquiry, hint = false) => ({
    'aria-invalid': err(k) ? true : undefined,
    'aria-describedby': err(k) ? `${f(k)}-error` : hint ? `${f(k)}-hint` : undefined,
  })

  /** Validates; returns true when the form can go. */
  const check = () => {
    const found = validate(v)
    setErrors(found)
    setTouched(Object.fromEntries(Object.keys(v).map((k) => [k, true])))
    const first = Object.keys(found)[0]
    if (first) document.getElementById(f(first))?.focus()
    return !first
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!check()) return
    if (!hasEndpoint) {
      // no form service: hand the enquiry to WhatsApp, which the office uses
      window.open(whatsappLink(v), '_blank', 'noopener')
      setStatus('handed-off')
      requestAnimationFrame(() => statusRef.current?.focus())
      return
    }
    setStatus('sending')
    const res = await submitEnquiry(v)
    if (res.ok) setStatus('sent')
    else {
      setStatus('failed')
      setDetail(res.detail)
    }
    requestAnimationFrame(() => statusRef.current?.focus())
  }

  const reset = () => {
    setV({ ...emptyEnquiry, type: v.type })
    setErrors({})
    setTouched({})
    setStatus('idle')
  }

  const submitLabel = hasEndpoint ? enquiryTypes.find((t) => t.id === v.type)!.label : 'Send on WhatsApp'

  return (
    <section id="contact" data-tone="dark" aria-labelledby="contact-title" className="relative py-[clamp(5rem,12vw,10rem)]">
      <div className="wrap grid gap-16 lg:grid-cols-12">
        {/* intro + direct contact */}
        <div className="lg:col-span-5">
          <p className="t-kicker opacity-80">Enquiries</p>
          <SplitReveal id="contact-title" text="Let's talk about your home" className="t-h1 mt-6" />
          <p className="t-lead mt-7 max-w-[30rem] opacity-75">Ask about ACS Heights, book a site visit, request the brochure or tell us about your plot. We reply by phone or WhatsApp.</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="btn btn-primary">
              <Phone size={18} aria-hidden="true" /> <span>Call {contact.phone}</span>
            </a>
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-outline">
              <MessageCircle size={18} aria-hidden="true" /> <span>WhatsApp</span>
            </a>
          </div>

          <dl className="mt-12 grid gap-7 border-t border-fg/15 pt-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div>
              <dt className="flex items-center gap-2 text-[0.88rem] opacity-60">
                <Mail size={15} aria-hidden="true" /> Email
              </dt>
              <dd className="mt-2 break-all text-[1.02rem]">
                <a href={`mailto:${contact.email}`} className="link-line select-all">
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-[0.88rem] opacity-60">
                <MapPin size={15} aria-hidden="true" /> Office
              </dt>
              <dd className="mt-2 leading-relaxed">
                <address className="not-italic">{contact.address.slice(0, 2).join(', ')}</address>
                <a href={contact.mapUrl} target="_blank" rel="noreferrer" className="link-line mt-1 inline-block text-[0.92rem] opacity-70">
                  Open in Google Maps
                </a>
              </dd>
            </div>
            {contact.hoursVerified && (
              <div>
                <dt className="text-[0.88rem] opacity-60">Office hours</dt>
                <dd className="mt-2">
                  {contact.hours.map((h) => (
                    <span key={h.days} className="block">
                      {h.days}: {h.time}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-fg/12 bg-fg/[0.04] p-[clamp(1.25rem,3.5vw,3rem)]">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'sent' || status === 'handed-off' ? (
                <motion.div key="done" ref={statusRef} tabIndex={-1} role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-8 outline-none">
                  <span className="grid size-14 place-items-center rounded-full bg-orange text-charcoal">
                    {status === 'sent' ? <Check size={28} aria-hidden="true" /> : <MessageCircle size={26} aria-hidden="true" />}
                  </span>
                  {status === 'sent' ? (
                    <>
                      <h3 className="t-h3 mt-6">Enquiry sent</h3>
                      <p className="mt-3 max-w-[42ch] leading-relaxed opacity-75">Thank you, {v.name.split(' ')[0]}. We will call you on {v.phone} soon.</p>
                    </>
                  ) : (
                    <>
                      <h3 className="t-h3 mt-6">Finish in WhatsApp</h3>
                      <p className="mt-3 max-w-[44ch] leading-relaxed opacity-75">WhatsApp has opened with your message filled in. Press send there and it reaches our team. If WhatsApp did not open, use one of these:</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <a href={whatsappLink(v)} target="_blank" rel="noreferrer" className="btn btn-primary">
                          <MessageCircle size={17} aria-hidden="true" /> <span>Open WhatsApp again</span>
                        </a>
                        <a href={emailLink(v)} className="btn btn-outline">
                          <Mail size={17} aria-hidden="true" /> <span>Send by email</span>
                        </a>
                      </div>
                    </>
                  )}
                  <button type="button" onClick={reset} className="link-line mt-8 text-[0.95rem] opacity-80">
                    Start a new enquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" noValidate onSubmit={onSubmit} initial={false} exit={{ opacity: 0 }}>
                  <fieldset>
                    <legend className="text-[0.92rem] font-[600]">How can we help?</legend>
                    <div role="radiogroup" aria-label="Type of enquiry" className="mt-3 flex flex-wrap gap-2">
                      {enquiryTypes.map((t) => {
                        const active = v.type === t.id
                        return (
                          <button
                            key={t.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setV((p) => ({ ...p, type: t.id as EnquiryType }))}
                            className={`min-h-11 rounded-full border px-4 text-[0.92rem] transition-colors duration-300 ${active ? 'border-orange bg-orange text-charcoal' : 'border-fg/20 hover:border-fg/60'}`}
                          >
                            {t.short}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>

                  <div className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                    <Field id={f('name')} label="Your name" error={err('name')}>
                      <input id={f('name')} className="field" autoComplete="name" value={v.name} onChange={set('name')} onBlur={blur('name')} {...aria('name')} />
                    </Field>
                    <Field id={f('phone')} label="Mobile number" error={err('phone')}>
                      <input id={f('phone')} type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder="98765 43210" value={v.phone} onChange={set('phone')} onBlur={blur('phone')} {...aria('phone')} />
                    </Field>
                    <Field id={f('email')} label="Email" optional={!show.emailRequired} error={err('email')}>
                      <input id={f('email')} type="email" inputMode="email" className="field" autoComplete="email" value={v.email} onChange={set('email')} onBlur={blur('email')} {...aria('email')} />
                    </Field>
                    {show.project && (
                      <Field id={f('project')} label="Property" error={err('project')}>
                        <select id={f('project')} className="field" value={v.project} onChange={set('project')} onBlur={blur('project')} {...aria('project')}>
                          <option value="" disabled>
                            Choose a property
                          </option>
                          {projectOptions.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      </Field>
                    )}
                    {show.location && (
                      <Field id={f('location')} label="Plot location" error={err('location')}>
                        <input id={f('location')} className="field" placeholder="Area and town, e.g. Tiruchanur, Tirupati" value={v.location} onChange={set('location')} onBlur={blur('location')} {...aria('location')} />
                      </Field>
                    )}
                    {show.visit && (
                      <>
                        <Field id={f('visitDate')} label="Preferred date" error={err('visitDate')}>
                          <input id={f('visitDate')} type="date" className="field" value={v.visitDate} onChange={set('visitDate')} onBlur={blur('visitDate')} {...aria('visitDate')} />
                        </Field>
                        <Field id={f('visitTime')} label="Preferred time" optional>
                          <select id={f('visitTime')} className="field" value={v.visitTime} onChange={set('visitTime')}>
                            <option value="">Any time</option>
                            <option>Morning</option>
                            <option>Afternoon</option>
                            <option>Evening</option>
                          </select>
                        </Field>
                      </>
                    )}
                    {show.budget && (
                      <Field id={f('budget')} label="Budget" optional>
                        <select id={f('budget')} className="field" value={v.budget} onChange={set('budget')}>
                          <option value="">Choose a range</option>
                          {budgetRanges.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </select>
                      </Field>
                    )}
                    <Field id={f('message')} label="Message" optional={!show.messageRequired} error={err('message')} hint={show.messageRequired ? 'Plot size, what you want to build and anything unusual about the site.' : undefined} className="sm:col-span-2">
                      <textarea id={f('message')} rows={4} className="field resize-y" value={v.message} onChange={set('message')} onBlur={blur('message')} {...aria('message', show.messageRequired)} />
                    </Field>
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label htmlFor={f('website')}>Website</label>
                      <input id={f('website')} tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} />
                    </div>
                  </div>

                  <div ref={statusRef} tabIndex={-1} className="outline-none" role={status === 'failed' ? 'alert' : undefined}>
                    {status === 'failed' && (
                      <div className="mt-8 rounded-xl border-l-2 border-[#ff9d90] bg-[#ff9d90]/10 p-5">
                        <p className="font-[640]">Your enquiry has not been sent.</p>
                        <p className="mt-2 leading-relaxed opacity-80">{detail} Your answers are still filled in. You can try again, or send it on WhatsApp or by email instead.</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <a href={whatsappLink(v)} target="_blank" rel="noreferrer" className="btn btn-primary !min-h-11">
                            <span>Send on WhatsApp</span>
                          </a>
                          <a href={emailLink(v)} className="btn btn-outline !min-h-11">
                            <span>Send by email</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-10 flex flex-wrap items-center justify-between gap-5">
                    <p className="max-w-[36ch] text-[0.85rem] leading-relaxed opacity-55">
                      {hasEndpoint ? 'We use your details only to reply to this enquiry.' : 'Your enquiry opens in WhatsApp, ready to send to our team.'} Read our{' '}
                      <Link to="/legal/privacy" className="underline underline-offset-2">
                        privacy policy
                      </Link>
                      .
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {!hasEndpoint && (
                        <button
                          type="button"
                          onClick={() => {
                            if (check()) window.location.href = emailLink(v)
                          }}
                          className="link-line text-[0.95rem] opacity-80"
                        >
                          Email instead
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                        {status === 'sending' ? (
                          <>
                            <Loader2 size={18} className="animate-spin" aria-hidden="true" /> <span>Sending</span>
                          </>
                        ) : (
                          <>
                            {!hasEndpoint && <MessageCircle size={18} aria-hidden="true" />}
                            <span>{status === 'failed' ? 'Try again' : submitLabel}</span> <ArrowIcon />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
