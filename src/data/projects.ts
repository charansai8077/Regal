/**
 * PORTFOLIO
 * Real work from Regal Civil Engineers: 3D elevations, plans and the
 * ACS Heights apartment project. Images live in public/work/ and are
 * prepared by scripts/prepare-images.py.
 */

export type Img = { file: string; alt: string; caption?: string }

/** `work/name.webp` plus its 800px version for small screens. */
export const workImg = (name: string) => ({ src: `work/${name}.webp`, srcSm: `work/${name}-sm.webp` })

export type ProjectSpecGroup = { title: string; items: string[] }

export type Project = {
  slug: string
  name: string
  location: string
  category: 'Apartments'
  summary: string
  overview: string[]
  facts: { label: string; value: string }[]
  features: string[]
  specifications: ProjectSpecGroup[]
  address: string
  approval: { authority: string; number: string }
  images: Img[]
  plans: Img[]
  /** Points on the first image (0–1 across and down), explained from the brochure. */
  hotspots?: { x: number; y: number; title: string; body: string }[]
}

/** Projects with their own detail page. */
export const projects: Project[] = [
  {
    slug: 'acs-heights',
    name: 'ACS Heights',
    location: 'Mangalam, Tirupati',
    category: 'Apartments',
    summary: '3BHK premium flats with stilt parking, a lift and 24x7 CCTV. TUDA approved.',
    overview: [
      'ACS Heights is an apartment building of stilt + 5 floors near Gazetted Officers Colony in Mangalam, Tirupati. Each floor has two east-facing 3BHK flats of 1,925 sq. ft, planned to Vaastu, with a living room, dining, kitchen with utility, puja room, three bedrooms and a sit-out.',
      'Regal Civil Engineers are the builders. The building plan is approved by the Tirupati Urban Development Authority.',
    ],
    facts: [
      { label: 'Flats', value: '3BHK, 1,925 sq. ft each' },
      { label: 'Floors', value: 'Stilt + 5' },
      { label: 'Flats per floor', value: '2, east facing' },
      { label: 'Structure', value: 'Earthquake-resistant RCC frame' },
      { label: 'Lift', value: '6-passenger (Surya or equivalent)' },
      { label: 'Approval', value: 'TUDA, B.A. No. PER/1166/0041/2026' },
    ],
    features: ['100% Vaastu', 'East facing only', 'Dedicated parking', 'Green landscaping', 'Supermarkets nearby', '24x7 CCTV', 'Quality workmanship', 'Budget-friendly pricing'],
    specifications: [
      { title: 'Structure', items: ['Earthquake-resistant RCC framed structure in accordance with code'] },
      { title: 'Walls', items: ['9" external and 4" internal walls in first-class moulded bricks with cement mortar'] },
      { title: 'Doors', items: ['Main door: designed teak wood door with frame', 'Internal doors: well-seasoned wooden frames with waterproof flush doors'] },
      { title: 'Windows', items: ['UPVC windows with iron safety grill'] },
      { title: 'Flooring', items: ["4' x 2' vitrified tiles with 4\" skirting in all rooms, dining, hall and kitchen", "1' x 1' ceramic tiles in balcony and utility"] },
      { title: 'Kitchen', items: ["Glazed ceramic tile dado up to 3' above the platform", 'Granite platform with stainless steel sink'] },
      { title: 'Toilets', items: ['Tile dado up to door height', 'Hindware or equivalent wash basins and WCs (white)', 'Hot and cold mixer with shower in the master bedroom', 'Hindware or equivalent CP fittings'] },
      { title: 'Electrical', items: ['Concealed copper wiring with points for modern appliances and modular switches'] },
      { title: 'Painting', items: ['Acrylic emulsion on external walls', 'Putty finish with emulsion paint on internal walls'] },
      { title: 'Utility', items: ['Provision for a washing machine'] },
      { title: 'Lift and intercom', items: ['One 6-passenger lift (Surya or equivalent)', 'Intercom connecting all flats to security', 'CCTV provision in common areas'] },
      { title: 'Security', items: ['Surveillance cameras in the stilt floor, lift, lobby, staircase and main gate'] },
    ],
    address: 'S. No. 10/2A, D.S. Naidu Colony Layout, Plot No. 12 & 13, near Gazetted Officers Colony, Mangalam, Settipalli Grama Panchayat, Tirupati Urban Mandal, Tirupati',
    approval: { authority: 'Tirupati Urban Development Authority (TUDA)', number: 'B.A. No. PER/1166/0041/2026' },
    images: [
      { file: 'acs-heights', alt: 'ACS Heights 3D elevation: a stilt + 5 floor apartment building with balconies, lit at dusk', caption: 'Front elevation at dusk' },
      { file: 'acs-heights-option', alt: 'Alternative ACS Heights elevation with orange and grey panels and vertical red fins', caption: 'Alternative elevation option' },
      { file: 'brochure-acs-heights', alt: 'ACS Heights brochure page with the TUDA approval number and the 3BHK premium flats label', caption: 'Sales brochure' },
    ],
    hotspots: [
      { x: 0.198, y: 0.363, title: 'Stilt + 5 floors', body: 'Two east-facing 3BHK flats on each of the five floors, ten flats in all.' },
      { x: 0.41, y: 0.276, title: 'Windows', body: 'UPVC windows with an iron safety grill.' },
      { x: 0.654, y: 0.538, title: 'Sit-out', body: 'Every 1,925 sq. ft flat has its own sit-out, planned to Vaastu.' },
      { x: 0.832, y: 0.489, title: 'Walls and finish', body: '9" external walls in first-class moulded bricks, finished in acrylic emulsion paint.' },
      { x: 0.7, y: 0.883, title: 'Stilt parking', body: 'Dedicated parking on the stilt floor, with surveillance cameras in the stilt floor, lift, lobby, staircase and main gate.' },
    ],
    plans: [
      { file: 'acs-heights-floor-plan', alt: 'ACS Heights typical floor plan with two east-facing 3BHK flats of 1,925 sq. ft around a lift and stair', caption: 'Typical floor plan, 2 flats of 1,925 sq. ft' },
      { file: 'acs-heights-isometric', alt: 'Isometric 3D view of a furnished ACS Heights floor showing both flats', caption: 'Isometric 3D view of a typical floor' },
    ],
  },
]

export type PortfolioCategory = 'Apartments' | 'Independent houses' | 'Villas' | 'Plans & 3D views'
export const portfolioCategories: PortfolioCategory[] = ['Apartments', 'Independent houses', 'Villas', 'Plans & 3D views']

export type PortfolioItem = Img & { title: string; category: PortfolioCategory; project?: string; wide?: boolean }

/** Elevations and drawings shown in the portfolio grid. */
export const portfolio: PortfolioItem[] = [
  { file: 'acs-heights', title: 'ACS Heights, Mangalam', category: 'Apartments', project: 'acs-heights', alt: 'ACS Heights apartment building elevation at dusk' },
  { file: 'twin-residences', title: 'Twin residences with stilt parking', category: 'Independent houses', wide: true, alt: 'Two-storey twin residences with stilt parking, wood cladding and a jali screen with a Ganesha motif' },
  { file: 'g5-apartments-night', title: 'Apartment building, night view', category: 'Apartments', alt: 'Multi-storey apartment building with wood-finish frames and lit balconies at night' },
  { file: 'contemporary-residence', title: 'Contemporary residence', category: 'Independent houses', alt: 'Contemporary residence with grey stone cladding, wood pergola and a terrace garden' },
  { file: 'geerish-villas', title: 'Geerish Villas', category: 'Villas', alt: 'Geerish Villas at night with red tile roofs, a pergola and a lit name board' },
  { file: 'g3-apartments-ganesha', title: 'Apartment building with Ganesha wall', category: 'Apartments', alt: 'Apartment building with glass balconies and a wood-finish wall with a Ganesha motif' },
  { file: 'g1-residence-ganesha', title: 'Independent house with stone cladding', category: 'Independent houses', alt: 'Independent house with stone cladding, wood panels, a Ganesha emblem and a covered car porch' },
  { file: 'white-villa-pergola', title: 'Villa with arched entrance', category: 'Villas', alt: 'White villa with an arched double-height entrance and a wooden roof pergola' },
  { file: 'g2-residence-sunset', title: 'Residence at sunset', category: 'Independent houses', alt: 'Three-floor residence with stone and wood cladding and a Ganesha panel at sunset' },
  { file: 'apartment-complex', title: 'Apartment complex', category: 'Apartments', alt: 'White apartment complex with landscaped entrance and orange accent panels' },
  { file: 'acs-heights-option', title: 'ACS Heights, elevation option', category: 'Apartments', project: 'acs-heights', alt: 'Alternative ACS Heights elevation with orange and grey panels' },
  { file: 'plan-4-flats-iso', title: 'Isometric floor, four flats', category: 'Plans & 3D views', alt: 'Isometric 3D view of an apartment floor with four furnished flats' },
  { file: 'plan-4-flats', title: 'Stilt and typical floor plans', category: 'Plans & 3D views', alt: 'Stilt floor parking plan and a typical floor plan with four flats around a central passage' },
  { file: 'acs-heights-floor-plan', title: 'ACS Heights floor plan', category: 'Plans & 3D views', project: 'acs-heights', alt: 'ACS Heights typical floor plan with two 1,925 sq. ft flats' },
  { file: 'acs-heights-isometric', title: 'ACS Heights isometric view', category: 'Plans & 3D views', project: 'acs-heights', alt: 'Isometric 3D view of an ACS Heights floor' },
]
