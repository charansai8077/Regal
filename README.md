# Regal Civil Engineers — 3D construction company website

React + Vite + TypeScript site with scroll-driven animation (GSAP ScrollTrigger), interface motion (Framer Motion), Tailwind CSS and Lucide icons, built around the office's own 3D elevations and plans.

All business information comes from the office's own logo, renders, plans and the ACS Heights brochure. Nothing unverified is shown.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serve the production build
```

Copy `.env.example` to `.env` to configure:

| Variable | Purpose |
| --- | --- |
| `VITE_FORM_ENDPOINT` | URL that receives enquiries as a JSON `POST` (Formspree, Basin, Getform or your own API). Success is shown only on a 2xx response. Without it, the form validates but tells the visitor the enquiry was **not** sent and offers to copy it. |
| `VITE_ROUTER` | Set to `hash` for static hosts that cannot rewrite every path to `index.html`. Otherwise configure your host to serve `index.html` for unknown paths. |
| `VITE_BASE_PATH` | Sub-path when the site is not served from the domain root. |

## Where the content lives

| What | Where |
| --- | --- |
| Name, tagline, phone, WhatsApp, email, address, hours, socials | `src/config/site.ts` |
| Figures shown in About (only `verified: true` ones appear) | `stats` in `src/config/site.ts` |
| ACS Heights details, portfolio images and categories | `src/data/projects.ts` |
| Services | `src/data/services.ts` |
| Build-sequence stages, approvals | `src/data/content.ts` |
| Privacy policy, terms, disclaimer | `src/pages/Legal.tsx` (have a lawyer check the final text) |

## Images

All photos are the office's own 3D elevations, plans and brochure pages, in `public/work/`. To add or replace them, put the original JPGs in a folder, add an entry to `scripts/prepare-images.py` (crop boxes remove the watermark banners) and run:

```bash
pip install pillow numpy
python3 scripts/prepare-images.py /path/to/originals
```

It writes a 1600 px and an 800 px WebP of each image, plus `build-render.webp` and `build-lines.webp`, the ACS Heights render and its line drawing used by the scroll sequence on the home page. Portfolio entries are listed in `src/data/projects.ts`.

## Structure

```
src/
  config/site.ts         business facts, contact details, socials, form endpoint
  data/                  services, projects + portfolio, build stages, approvals
  sections/              home page, in scroll order:
    Hero.tsx             full-screen elevations, staggered headline
    Statement.tsx        company statement that fills in as you read, verified figures
    Finder.tsx           "Find your property": buy a flat / build on my plot / approvals
    Featured.tsx         ACS Heights, image opens out to full screen
    Hero.tsx             WebGL hero (src/lib/heroGL.ts): shader wipes, pointer depth, scroll push-in
    Construction.tsx     blueprint-to-reality 3D building on scroll (scene in src/three)
    Inside.tsx           zoom-through into ACS Heights: isometric floor, brochure specs, floor plan
    Process.tsx          7-step construction process with the growing elevation drawing
    Compare.tsx          drag to compare the line drawing and the 3D elevation
    Projects.tsx         editorial portfolio with filters and a full-screen viewer
    Services.tsx         service index with hover previews
    Approvals.tsx        TUDA, DTCP, municipal, layout, building plan
    Story.tsx            vision, expertise, quality, commitment
    Contact.tsx          enquiry form (property, site visit, brochure, team)
  pages/                 home, project detail, service detail, legal, 404
  components/            nav, footer, mobile action bar, logo, lightbox, shared UI
  lib/                   tone switching, enquiry presets and sending, navigation, SEO
public/work/             the office's images (see Images)
```

## Enquiries

Every "Enquire", "Schedule a Site Visit", "Request a Brochure" and "Talk to Our Team" button opens the form with that option (and the property) already chosen.

- Without `VITE_FORM_ENDPOINT`, the form checks the answers and opens WhatsApp to +91 97000 12392 with the enquiry written out; the visitor presses send. It never claims the enquiry was sent. An "Email instead" link opens the same text in their email app.
- With `VITE_FORM_ENDPOINT` set, it posts JSON to that service and shows "Enquiry sent" only on a 2xx response, with WhatsApp and email as fallbacks if it fails.

## Still to add

- Office hours: set `contact.hours` and `hoursVerified: true` in `src/config/site.ts` (hidden until then).
- Social media profiles: add them to `socials` (hidden while empty).
- ACS Heights status (completed, under construction or upcoming) and available flats, once confirmed.
- Genuine client testimonials, if you want a testimonials section.

## Motion

- `components/motion.tsx`: the logo intro (once per visit), custom cursor with labels and magnetic buttons, scroll progress line, page-change curtain, scroll-reactive text bands and letter-by-letter headings.
- `lib/smooth.ts`: inertial smooth scrolling (Lenis) kept in step with GSAP ScrollTrigger.
- `sections/Gallery.tsx`: the sideways-scrolling portfolio on desktop; phones get a grid.

All of it switches off when the visitor's device asks for reduced motion.

## Performance and accessibility

- Every image has a 1600 px and an 800 px WebP; phones download the smaller one.
- The scroll sequence moves images with CSS only, so it runs smoothly on phones.
- `prefers-reduced-motion` stops the hero slideshow, zoom, parallax, tilt and reveal animations; the scroll sequence then follows the scroll position directly.
- Skip link, visible focus states, labelled form controls with linked error messages, focus-trapped image viewer, live regions for filter results and sequence stages.
