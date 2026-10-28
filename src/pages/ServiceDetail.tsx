import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useEnquire } from '../lib/enquire'
import WorkImage from '../components/WorkImage'
import { ArrowIcon } from '../components/ui'
import { portfolio } from '../data/projects'
import { services } from '../data/services'
import { useSeo } from '../lib/seo'
import NotFound from './NotFound'

/** Portfolio images that show each service. */
const examples: Record<string, string[]> = {
  'residential-building-construction': ['acs-heights', 'g1-residence-ganesha'],
  'commercial-building-construction': ['g5-apartments-night', 'apartment-complex'],
  'architectural-design-and-planning': ['plan-4-flats-iso', 'acs-heights-isometric'],
  '2d-and-3d-building-elevations': ['geerish-villas', 'contemporary-residence'],
  'structural-design': ['acs-heights', 'g3-apartments-ganesha'],
  'building-plan-preparation': ['acs-heights-floor-plan', 'plan-4-flats'],
  'government-approval-assistance': ['acs-heights', 'acs-heights-floor-plan'],
  'surveys-and-layouts': ['twin-residences', 'white-villa-pergola'],
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const enquire = useEnquire()
  const idx = services.findIndex((x) => x.slug === slug)
  const s = services[idx]
  useSeo(s ? s.title : 'Service not found', s ? s.summary : 'This service could not be found.')
  useEffect(() => window.scrollTo(0, 0), [slug])
  if (!s) return <NotFound />
  const rel = (examples[s.slug] ?? []).map((f) => portfolio.find((x) => x.file === f)!).filter(Boolean)
  const others = services.filter((x) => x.slug !== s.slug)

  return (
    <article className="bg-paper text-charcoal">
      <header className="drawing-grid bg-paper-2 pb-16 pt-32 md:pb-24">
        <div className="wrap grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Link to="/" state={{ scrollTo: 'services' }} className="inline-flex items-center gap-2 text-[0.92rem] text-charcoal/70 hover:text-charcoal">
              <ArrowLeft size={16} aria-hidden="true" /> <span className="link-line">All services</span>
            </Link>
            <p className="t-label opacity-70 mt-10 text-steel">Service {String(idx + 1).padStart(2, '0')} of {services.length}</p>
            <h1 className="t-h2 mt-4 !text-[clamp(2.4rem,6vw,5.4rem)]">{s.title}</h1>
            <p className="t-lead mt-6 max-w-[40rem] text-charcoal/75">{s.intro}</p>
          </div>
          <div className="md:col-span-5">
            <div className="aspect-[4/3] overflow-hidden border border-charcoal/15 bg-paper shadow-[0_30px_60px_-30px_rgba(21,23,25,0.4)]">
              <WorkImage name={s.image} alt={s.imageAlt} sizes="(min-width: 768px) 40vw, 100vw" className="size-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <section className="py-[clamp(4rem,9vw,7rem)]" aria-label="Scope and deliverables">
        <div className="wrap grid gap-14 md:grid-cols-2">
          <div>
            <h2 className="t-h3">What we cover</h2>
            <ul className="mt-6 border-t border-charcoal/20">
              {s.scope.map((x) => (
                <li key={x} className="border-b border-charcoal/20 py-4 text-[1.05rem]">
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="t-h3">What you receive</h2>
            <ul className="mt-6 border-t border-charcoal/20">
              {s.deliverables.map((x) => (
                <li key={x} className="flex items-center gap-3 border-b border-charcoal/20 py-4 text-[1.05rem]">
                  <span aria-hidden="true" className="size-2 bg-orange" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {rel.length > 0 && (
        <section className="bg-charcoal py-[clamp(4rem,9vw,7rem)] text-paper" aria-labelledby="related">
          <div className="wrap">
            <h2 id="related" className="t-h3">
              From our work
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {rel.map((p) => (
                <li key={p.file} className="group relative">
                  <div className="aspect-[16/11] overflow-hidden bg-ink">
                    <WorkImage name={p.file} alt={p.alt} sizes="(min-width: 768px) 50vw, 100vw" loading="lazy" className="size-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]" />
                  </div>
                  <h3 className="mt-4 text-[1.25rem] font-[700]" style={{ fontVariationSettings: "'wdth' 110" }}>
                    {p.project ? (
                      <Link to={`/projects/${p.project}`} className="after:absolute after:inset-0 hover:text-orange">
                        {p.title}
                      </Link>
                    ) : (
                      p.title
                    )}
                  </h3>
                  <p className="text-paper/60">{p.category}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="py-[clamp(4rem,9vw,7rem)]">
        <div className="wrap grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <h2 className="t-h3 max-w-[22ch]">Start a {s.title.toLowerCase()} enquiry</h2>
            <p className="mt-4 max-w-[40ch] text-charcoal/70">We will preselect this service in the enquiry form.</p>
            <button type="button" onClick={() => enquire({ type: 'team' })} className="btn btn-dark mt-6">
              <span>Talk to Our Team</span> <ArrowIcon />
            </button>
          </div>
          <nav aria-label="Other services" className="md:col-span-6">
            <h2 className="t-label text-steel">Other services</h2>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {others.map((o) => (
                <li key={o.slug} className="border-b border-charcoal/15">
                  <Link to={`/services/${o.slug}`} className="flex items-center justify-between py-3 hover:text-orange-deep">
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </article>
  )
}
