import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getLenis } from './smooth'

export const sections = [
  { id: 'top', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'services', label: 'Services' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'process', label: 'Our Process' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof sections)[number]['id'] | 'finder' | 'story' | 'build'

export function scrollToId(id: string) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lenis = getLenis()
  const el = id === 'top' ? null : document.getElementById(id)
  if (id !== 'top' && !el) return
  if (lenis) lenis.scrollTo(el ?? 0, { offset: -56, duration: 1.6 })
  else if (!el) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 56, behavior: reduce ? 'auto' : 'smooth' })
  // move focus for keyboard and screen-reader users
  const heading = el?.querySelector<HTMLElement>('h2, h1')
  if (heading) {
    heading.setAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
  }
}

/** Go to a home-page section from anywhere in the site. */
export function useGoToSection() {
  const nav = useNavigate()
  const loc = useLocation()
  return useCallback(
    (id: string) => {
      if (loc.pathname === '/') scrollToId(id)
      else nav('/', { state: { scrollTo: id } })
    },
    [loc.pathname, nav],
  )
}
