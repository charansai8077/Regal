import { useId } from 'react'
import { company } from '../config/site'

/*
 * Regal Civil Engineers mark, redrawn as vectors from the supplied logo:
 * an engineer figure (head ring + shoulders) under an orange hard hat.
 * The figure takes the current text colour, so it works on dark and light
 * backgrounds; the hard hat always stays brand orange.
 */
export const BRAND_NAVY = '#293E56'
export const BRAND_ORANGE = '#D96C2D'

export function LogoMark({ className = '', figure = 'currentColor' }: { className?: string; figure?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 312 368" className={className} aria-hidden="true">
      <defs>
        <clipPath id={`${id}-head`}>
          <rect x="0" y="112" width="312" height="256" />
        </clipPath>
        <mask id={`${id}-hat`}>
          <rect width="312" height="120" fill="#fff" />
          {/* the two ventilation slots */}
          <rect x="129" y="-4" width="12" height="62" rx="6" fill="#000" />
          <rect x="169" y="-4" width="12" height="62" rx="6" fill="#000" />
        </mask>
      </defs>
      <g fill="none" stroke={figure} strokeWidth="27">
        <circle cx="155" cy="130" r="80" clipPath={`url(#${id}-head)`} />
        <path d="M11 368V365a144 144 0 0 1 288 0V368" />
      </g>
      <g fill={BRAND_ORANGE} mask={`url(#${id}-hat)`}>
        <path d="M63 99a92 84 0 0 1 184 0z" />
        <rect x="142" y="2" width="26" height="40" rx="8" />
        <rect x="52" y="94" width="205" height="16" rx="6" />
      </g>
    </svg>
  )
}

/**
 * Full lockup: mark + REGAL / CIVIL ENGINEERS, proportioned like the
 * original artwork (the text block sits low beside a taller mark).
 */
export function Logo({ className = '', size = 'md' }: { className?: string; size?: 'md' | 'lg' }) {
  // em-based so the whole lockup scales from one font size
  return (
    <span className={`inline-flex items-end gap-[0.32em] ${size === 'lg' ? 'text-[32px]' : 'text-[26px]'} ${className}`} style={{ fontFamily: "'Montserrat', var(--font-sans)" }}>
      <LogoMark className="h-[1.74em] w-auto shrink-0" />
      <span className="flex flex-col pb-[0.15em]">
        <span className="text-[1em] font-[800] uppercase leading-[0.74] tracking-[0.05em]">{company.logo.primary}</span>
        <span className="mt-[0.62em] text-[0.31em] font-[600] uppercase leading-[0.74] tracking-[0.235em]">{company.logo.secondary}</span>
      </span>
    </span>
  )
}
