/**
 * SITE CONFIGURATION
 * ------------------------------------------------------------------
 * Every business fact on the website comes from this file.
 * Values marked `verified: false` are placeholders and are shown on
 * the site with a "Placeholder" tag until you replace them with real,
 * checked information and set `verified: true`.
 */

export const company = {
  name: 'Regal Civil Engineers',
  /** the logo sets the first part large and the second part as a sub-line */
  logo: { primary: 'Regal', secondary: 'Civil Engineers' },
  legalName: 'Regal Civil Engineers',
  tagline: 'Building plans, layouts, constructions & surveys',
  founded: null as number | null, // e.g. 1998 — leave null until verified
}

export const contact = {
  phone: '+91 97000 12392',
  whatsapp: '919700012392',
  email: 'regalcivilengineers@gmail.com',
  emailVerified: true,
  address: ['Padmavathipuram', 'Tirupati, Andhra Pradesh 517501', 'India'],
  hours: [
    { days: 'Mon – Sat', time: '09:30 – 18:30' },
    { days: 'Sun', time: 'By appointment' },
  ],
  hoursVerified: false,
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Padmavathipuram%2C+Tirupati+517501',
}

/** Add the office's real profiles here, e.g. { label: 'Instagram', href: 'https://instagram.com/…' }. Hidden while empty. */
export const socials: { label: string; href: string }[] = []

export type Stat = {
  value: number
  suffix?: string
  label: string
  unit?: string
  verified: boolean
}

/** Company statistics. Replace values and set verified: true. */
export const stats: Stat[] = [
  // Figures taken from the services list and the ACS Heights brochure.
  { value: 8, label: 'Services under one roof', verified: true },
  { value: 5, label: 'Types of approvals we handle', verified: true },
  { value: 1925, unit: 'sq. ft', label: 'Each 3BHK flat at ACS Heights', verified: true },
  { value: 10, label: 'Flats at ACS Heights, stilt + 5 floors', verified: true },
]

/**
 * Enquiry form endpoint.
 * Set VITE_FORM_ENDPOINT in a .env file to any service that accepts a
 * JSON POST and answers with a 2xx status (Formspree, Basin, Getform,
 * your own API route…). Without it, the form validates but will not
 * claim to have sent anything.
 */
export const formEndpoint: string | undefined = import.meta.env.VITE_FORM_ENDPOINT || undefined

export const budgetRanges = [
  'Under ₹25 lakh',
  '₹25 – 50 lakh',
  '₹50 lakh – ₹1 crore',
  '₹1 – 5 crore',
  'Over ₹5 crore',
  'Not sure yet',
]
