import { FileCheck2 } from 'lucide-react'
import { ArrowIcon, Reveal, SectionHead } from '../components/ui'
import { approvals } from '../data/content'
import { useGoToSection } from '../lib/nav'
import { Link } from 'react-router-dom'
import WorkImage from '../components/WorkImage'

export default function Approvals() {
  const go = useGoToSection()
  return (
    <section id="approvals" data-tone="dark" aria-labelledby="approvals-title" className="relative overflow-hidden bg-steel py-[clamp(5rem,12vw,10rem)] text-paper">
      {/* faint drawing grid, like a sanctioned plan sheet */}
      <div aria-hidden="true" className="drawing-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="wrap relative">
        <SectionHead
          kicker="Approvals"
          id="approvals-title"
          title="TUDA, DTCP and municipal approvals, handled"
          intro="We assist with TUDA approvals, DTCP approvals and the other government approvals your building project needs, so it is completed smoothly and legally."
        />

        <div className="mt-[clamp(3rem,6vw,5rem)] grid gap-12 lg:grid-cols-12">
          <ul className="border-t border-paper/20 lg:col-span-8">
            {approvals.map((a, i) => (
              <Reveal as="li" key={a.title} delay={i * 0.04} className="grid gap-x-8 gap-y-2 border-b border-paper/20 py-6 sm:grid-cols-[2.5rem_1fr_1.3fr]">
                <FileCheck2 size={24} strokeWidth={1.5} className="mt-0.5 text-orange" aria-hidden="true" />
                <div>
                  <h3 className="text-[1.25rem] font-[700] leading-tight" style={{ fontVariationSettings: "'wdth' 110" }}>
                    {a.title}
                  </h3>
                  <p className="mt-1.5 text-[0.9rem] text-paper/60">{a.authority}</p>
                </div>
                <p className="leading-relaxed text-paper/80">{a.body}</p>
              </Reveal>
            ))}
          </ul>

          <aside className="flex flex-col gap-4 lg:col-span-4">
            <Link to="/projects/acs-heights" className="group flex gap-4 rounded-2xl border border-orange/50 bg-orange/10 p-4 transition-colors hover:bg-orange/20">
              <WorkImage name="brochure-acs-heights" alt="" sizes="96px" loading="lazy" className="h-24 w-20 shrink-0 object-cover" />
              <span className="text-[0.92rem] leading-snug">
                <span className="t-label block text-orange">Approved project</span>
                <span className="mt-1.5 block font-[640]">ACS Heights, Mangalam</span>
                <span className="mt-1 block text-paper/70">TUDA, B.A. No. PER/1166/0041/2026</span>
              </span>
            </Link>
            <div className="rounded-2xl border border-paper/25 bg-charcoal/25 p-6 lg:sticky lg:top-28">
              <h3 className="t-h3">Not sure which approval you need?</h3>
              <p className="mt-3 leading-relaxed text-paper/75">It depends on where your plot is and what you plan to build. Send us the location and plot details and we will tell you which approvals apply and what documents to prepare.</p>
              <a href="#contact" onClick={(e) => (e.preventDefault(), go('contact'))} className="btn btn-primary mt-6">
                Ask about your site <ArrowIcon />
              </a>
              <p className="mt-5 text-[0.85rem] leading-relaxed text-paper/55">Approval decisions and timelines are set by the issuing authority.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
