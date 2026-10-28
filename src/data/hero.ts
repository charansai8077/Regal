/** The office's own 3D elevations shown in the home-page hero, in order. */
export const heroSlides = [
  { name: 'acs-heights-option', title: 'ACS Heights, Mangalam', focus: [0.62, 0.42], alt: 'ACS Heights apartment building at dusk, with orange and grey panels and red vertical fins' },
  { name: 'g1-residence-ganesha', title: 'Independent house', focus: [0.66, 0.5], alt: 'Independent house with stone cladding, wood panels and a Ganesha emblem at night' },
  { name: 'twin-residences', title: 'Twin residences', focus: [0.7, 0.58], alt: 'Twin residences with stilt parking at dusk' },
  { name: 'contemporary-residence', title: 'Contemporary residence', focus: [0.6, 0.42], alt: 'Contemporary residence with stone cladding and a terrace pergola at dusk' },
] as const

/** The file the browser would pick from WorkImage's srcset at full width. */
export function heroUrl(name: string) {
  const w = window.innerWidth * (window.devicePixelRatio || 1)
  return `${import.meta.env.BASE_URL}work/${name}${w <= 800 ? '-sm' : ''}.webp`
}
