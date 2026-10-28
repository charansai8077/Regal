export type Service = {
  slug: string
  title: string
  summary: string
  intro: string
  scope: string[]
  deliverables: string[]
  /** image in public/work, without extension */
  image: string
  imageAlt: string
}

export const services: Service[] = [
  {
    slug: 'residential-building-construction',
    title: 'Residential Building Construction',
    summary: 'Independent houses, villas and apartment buildings, built from foundation to handover.',
    intro:
      'We build homes of every size, from an independent house on a single plot to multi-storey apartment blocks. One team takes care of the foundation, structure, brickwork, services and finishes, so you have one point of contact from start to finish.',
    scope: ['Independent houses and villas', 'Duplex and row houses', 'Apartment buildings', 'Extensions and additional floors'],
    deliverables: ['Construction schedule', 'Regular site progress updates', 'Quality checks at each stage', 'Handover with as-built drawings'],
    image: 'g1-residence-ganesha',
    imageAlt: 'Independent house elevation with stone cladding and a Ganesha emblem',
  },
  {
    slug: 'commercial-building-construction',
    title: 'Commercial Building Construction',
    summary: 'Shops, offices, complexes and warehouses, delivered on schedule and ready for tenants.',
    intro:
      'Commercial buildings need to open on time and work well for the people using them. We build shopping and office complexes, showrooms, hospitals, schools and warehouses, coordinating structure, services and finishes under one schedule.',
    scope: ['Shopping and office complexes', 'Showrooms and retail buildings', 'Warehouses and godowns', 'Hospitals, schools and institutional buildings'],
    deliverables: ['Construction schedule', 'Coordination of electrical, plumbing and fire work', 'Quality checks at each stage', 'Handover with as-built drawings'],
    image: 'g5-apartments-night',
    imageAlt: 'Multi-storey building elevation at night',
  },
  {
    slug: 'architectural-design-and-planning',
    title: 'Architectural Design & Planning',
    summary: 'Room layouts, space planning and building design that fit your plot, budget and rules.',
    intro:
      'Good design starts with your plot, your budget and the building rules that apply to it. We plan rooms, circulation, light and ventilation, and check setbacks and permitted floor area early, so the design you like is one that can be approved and built.',
    scope: ['Site study and setback checks', 'Floor plans and space planning', 'Interior layout planning', 'Design revisions with you'],
    deliverables: ['Concept options', 'Final floor plans', 'Area statement', 'Drawings ready for approval'],
    image: 'plan-4-flats-iso',
    imageAlt: 'Isometric 3D view of an apartment floor with four flats',
  },
  {
    slug: '2d-and-3d-building-elevations',
    title: '2D & 3D Building Elevations',
    summary: 'See your building before it is built, with front elevations and realistic 3D views.',
    intro:
      'Elevations show how the outside of your building will look. We prepare 2D elevation drawings for approval and construction, and 3D views with materials and colours so you can compare options and decide with confidence.',
    scope: ['Front and side elevations', '3D exterior views', 'Colour and material options', 'Elevation revisions'],
    deliverables: ['2D elevation drawings', '3D views in daylight and evening', 'Material and colour schedule', 'Print-ready images'],
    image: 'twin-residences',
    imageAlt: '3D elevation of twin residences at dusk',
  },
  {
    slug: 'structural-design',
    title: 'Structural Design',
    summary: 'Safe, economical foundations, columns, beams and slabs designed by civil engineers.',
    intro:
      'The structure is what keeps a building standing for decades. Our engineers design foundations, columns, beams and slabs based on your soil conditions and building loads, following the relevant Indian Standard codes, and keep steel and concrete quantities economical.',
    scope: ['Foundation design', 'RCC column, beam and slab design', 'Steel and pre-engineered structures', 'Checks for additional floors on existing buildings'],
    deliverables: ['Structural drawings', 'Reinforcement details', 'Bar bending schedule', 'Site visits during critical stages'],
    image: 'structural-lines',
    imageAlt: 'Line drawing of an apartment building elevation on a drawing grid',
  },
  {
    slug: 'building-plan-preparation',
    title: 'Building Plan Preparation',
    summary: 'Complete building plan drawings prepared to the standard required for approval.',
    intro:
      'Authorities need a full set of drawings before they can approve a building. We prepare the site plan, floor plans, sections and elevations with the area statements and details they ask for, so your application is complete the first time it is submitted.',
    scope: ['Site plan with setbacks', 'Floor plans, sections and elevations', 'Area and floor area ratio statements', 'Parking and open space details'],
    deliverables: ['Building plan drawing set', 'Area statement', 'Soft copies for online submission', 'Printed copies for signatures'],
    image: 'acs-heights-floor-plan',
    imageAlt: 'Typical floor plan with two 3BHK flats',
  },
  {
    slug: 'government-approval-assistance',
    title: 'Government Approval Assistance',
    summary: 'Help with TUDA, DTCP, municipal, layout and building plan approvals.',
    intro:
      'Getting approvals is often the slowest part of a project. We tell you which authority your site falls under, prepare the drawings and documents, file the application and follow up on queries until the approval is issued, so your project can start legally.',
    scope: ['TUDA approvals', 'DTCP approvals', 'Municipal building approvals', 'Layout and building plan approvals'],
    deliverables: ['Document checklist for your site', 'Application drawings and forms', 'Follow-up on queries and site inspections', 'Copy of the issued approval'],
    image: 'brochure-acs-heights',
    imageAlt: 'ACS Heights brochure showing its TUDA approval number',
  },
  {
    slug: 'surveys-and-layouts',
    title: 'Surveys & Layouts',
    summary: 'Land surveys, plot measurement and layout plans for plots and ventures.',
    intro:
      'Every good building starts with accurate measurements. We survey your land, mark boundaries and levels, and prepare layout plans that divide land into plots with roads, open spaces and drainage, ready for layout approval.',
    scope: ['Land and plot surveys', 'Boundary and corner marking', 'Level surveys for drainage and foundations', 'Layout planning for plotted ventures'],
    deliverables: ['Survey drawing with dimensions and levels', 'Key plan and location sketch', 'Layout plan for approval', 'Plot marking on site'],
    image: 'brochure-key-plan',
    imageAlt: 'Key plan sketch showing a site location with roads and landmarks',
  },
]
