import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'
import { useEffect, type RefObject } from 'react'

gsap.registerPlugin(ScrollTrigger)

/**
 * Sets data-tone on the wrapper to the tone of whichever section is in the
 * middle of the screen, so the page background eases between light and dark.
 */
export function useTone(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const triggers = Array.from(root.querySelectorAll<HTMLElement>(':scope > [data-tone]')).map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) root.dataset.tone = el.dataset.tone
        },
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [ref])
}
