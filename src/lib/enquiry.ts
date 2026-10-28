import { contact, formEndpoint } from '../config/site'
import { enquiryTypes, type EnquiryType } from './enquire'

export type Enquiry = {
  type: EnquiryType
  name: string
  phone: string
  email: string
  project: string
  visitDate: string
  visitTime: string
  location: string
  budget: string
  message: string
  website: string // honeypot: people leave it empty
}

export const emptyEnquiry: Enquiry = {
  type: 'team',
  name: '',
  phone: '',
  email: '',
  project: '',
  visitDate: '',
  visitTime: '',
  location: '',
  budget: '',
  message: '',
  website: '',
}

export type Errors = Partial<Record<keyof Enquiry, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const digits = (s: string) => s.replace(/\D/g, '')

/** Which fields each enquiry type asks for. */
export function fieldsFor(type: EnquiryType) {
  return {
    project: type !== 'team',
    visit: type === 'site-visit',
    location: type === 'team',
    budget: type === 'team' || type === 'property',
    emailRequired: type === 'brochure',
    messageRequired: type === 'team',
  }
}

export function validate(v: Enquiry): Errors {
  const e: Errors = {}
  const f = fieldsFor(v.type)
  if (v.name.trim().length < 2) e.name = 'Enter your name.'
  const d = digits(v.phone)
  if (!d) e.phone = 'Enter a phone number so we can call you back.'
  else if (d.length < 10 || d.length > 13) e.phone = 'Enter a 10-digit mobile number, for example 98765 43210.'
  if (f.emailRequired && !v.email.trim()) e.email = 'Enter your email address so we can send the brochure.'
  else if (v.email.trim() && !EMAIL.test(v.email.trim())) e.email = 'Enter an email address in the format name@example.com.'
  if (f.project && !v.project) e.project = 'Choose a property or project.'
  if (f.visit) {
    if (!v.visitDate) e.visitDate = 'Choose a date for your visit.'
    else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (new Date(v.visitDate) < today) e.visitDate = 'Choose today or a later date.'
    }
  }
  if (f.location && v.location.trim().length < 2) e.location = 'Enter the area or town where your plot is.'
  if (f.messageRequired && v.message.trim().length < 15) e.message = 'Tell us a little about your plot or project (at least 15 characters).'
  return e
}

export function enquiryAsText(v: Enquiry) {
  const f = fieldsFor(v.type)
  const label = enquiryTypes.find((t) => t.id === v.type)?.short ?? 'Enquiry'
  const opt = (k: string, val: string) => (val.trim() ? [`${k}: ${val.trim()}`] : [])
  return [
    `${label} (via website)`,
    '',
    `Name: ${v.name.trim()}`,
    `Phone: ${v.phone.trim()}`,
    ...opt('Email', v.email),
    ...(f.project ? opt('Property', v.project) : []),
    ...(f.visit ? opt('Preferred date', v.visitDate) : []),
    ...(f.visit ? opt('Preferred time', v.visitTime) : []),
    ...(f.location ? opt('Plot location', v.location) : []),
    ...(f.budget ? opt('Budget', v.budget) : []),
    ...(v.message.trim() ? ['', v.message.trim()] : []),
  ].join('\n')
}

export const whatsappLink = (v: Enquiry) => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(enquiryAsText(v))}`
export const emailLink = (v: Enquiry) => {
  const label = enquiryTypes.find((t) => t.id === v.type)?.short ?? 'Enquiry'
  return `mailto:${contact.email}?subject=${encodeURIComponent(`${label}: ${v.name.trim()}`)}&body=${encodeURIComponent(enquiryAsText(v))}`
}

export const hasEndpoint = Boolean(formEndpoint)

export type SubmitResult = { ok: true } | { ok: false; detail: string }

/** Posts to the configured form service. Resolves ok only on a 2xx response. */
export async function submitEnquiry(v: Enquiry): Promise<SubmitResult> {
  if (v.website) return { ok: true } // silently drop bots
  if (!formEndpoint) return { ok: false, detail: 'No form service is configured.' }
  try {
    const { website: _honeypot, ...payload } = v
    void _honeypot
    const res = await fetch(formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...payload, _subject: `${enquiryTypes.find((t) => t.id === v.type)?.short}: ${v.name.trim()}` }),
    })
    if (!res.ok) return { ok: false, detail: `The form service answered with error ${res.status}.` }
    return { ok: true }
  } catch {
    return { ok: false, detail: 'The connection to the form service failed. Check your internet connection.' }
  }
}
