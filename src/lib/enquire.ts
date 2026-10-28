import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToId } from './nav'

export type EnquiryType = 'property' | 'site-visit' | 'brochure' | 'team'

export const enquiryTypes: { id: EnquiryType; label: string; short: string }[] = [
  { id: 'property', label: 'Enquire About This Property', short: 'Enquire about a property' },
  { id: 'site-visit', label: 'Schedule a Site Visit', short: 'Schedule a site visit' },
  { id: 'brochure', label: 'Request a Brochure', short: 'Request a brochure' },
  { id: 'team', label: 'Talk to Our Team', short: 'Talk to our team' },
]

export type EnquiryPreset = { type: EnquiryType; project?: string }
export const ENQUIRE_EVENT = 'regal:enquire'

/** Open the enquiry form, preset to a type (and project), from anywhere on the site. */
export function useEnquire() {
  const nav = useNavigate()
  const loc = useLocation()
  return useCallback(
    (preset: EnquiryPreset) => {
      if (loc.pathname === '/') {
        window.dispatchEvent(new CustomEvent<EnquiryPreset>(ENQUIRE_EVENT, { detail: preset }))
        scrollToId('contact')
      } else {
        nav('/', { state: { scrollTo: 'contact', enquiry: preset } })
      }
    },
    [loc.pathname, nav],
  )
}
