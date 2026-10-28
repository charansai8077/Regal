import { useEffect } from 'react'
import { company } from '../config/site'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Sets the page title and description for the current route. */
export function useSeo(title: string, description: string) {
  useEffect(() => {
    const full = title ? `${title} | ${company.name}` : `${company.name} | Construction & Engineering`
    document.title = full
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', full)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
  }, [title, description])
}
