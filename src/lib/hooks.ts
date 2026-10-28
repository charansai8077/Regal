import { useEffect, useRef, useState } from 'react'

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
export const useCompact = () => useMediaQuery('(max-width: 820px), (pointer: coarse)')

/** Tracks whether an element is within `margin` of the viewport. */
export function useNearViewport<T extends Element>(margin = '200px') {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        setNear(e.isIntersecting)
        if (e.isIntersecting) setSeen(true)
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return { ref, near, seen }
}

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
