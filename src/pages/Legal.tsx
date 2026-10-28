import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DemoTag } from '../components/ui'
import { company, contact } from '../config/site'
import { useSeo } from '../lib/seo'
import NotFound from './NotFound'

/*
 * Legal page templates. These are structural placeholders only and are
 * not legal advice: have the final texts written or checked by a
 * qualified lawyer for the jurisdictions you operate in.
 */
const pages: Record<string, { title: string; intro: string; sections: { h: string; body: string[] }[] }> = {
  privacy: {
    title: 'Privacy policy',
    intro: 'How we handle personal information sent to us through this website.',
    sections: [
      { h: 'Who we are', body: [`${company.legalName}, ${contact.address.join(', ')}. Email: ${contact.email}. Phone: ${contact.phone}.`] },
      { h: 'Information we collect', body: ['When you send an enquiry, we receive the details you enter: your name, contact details and information about your project. Add the name of the form service you use to receive enquiries.'] },
      { h: 'How we use it', body: ['We use your details only to reply to your enquiry and to discuss your project. State how long enquiries are kept and who in the office can see them.'] },
      { h: 'Your rights', body: ["Explain how people can ask to see, correct or delete their information, in line with India's Digital Personal Data Protection Act, 2023, and give a contact for these requests."] },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro: 'Conditions for using this website.',
    sections: [
      { h: 'Website content', body: ['Information, drawings and images on this website are for general information. They do not form part of any agreement for design, approval or construction work.'] },
      { h: 'Images and drawings', body: ['State who owns the images and drawings shown on this website and whether they may be reused.'] },
      { h: 'Links to other websites', body: ['Explain that you are not responsible for the content of websites linked from this site, including government portals.'] },
    ],
  },
  disclaimer: {
    title: 'Disclaimer',
    intro: 'Important information about approvals and project details on this website.',
    sections: [
      { h: 'Approvals', body: ['We assist clients in preparing and submitting applications for TUDA, DTCP, municipal, layout and building plan approvals. Decisions and timelines are set by the issuing authority.'] },
      { h: 'Images and brochures', body: ['3D elevations and plans on this website are design illustrations. The finished building, specifications and materials may differ from the images and brochure.'] },
      { h: 'Costs', body: ['Cost ranges given before a site visit and design are estimates and may change with the final design, materials and site conditions.'] },
    ],
  },
}

export default function Legal() {
  const { page = '' } = useParams()
  const p = pages[page]
  useSeo(p?.title ?? 'Page not found', p?.intro ?? '')
  useEffect(() => window.scrollTo(0, 0), [page])
  if (!p) return <NotFound />
  return (
    <article className="bg-paper pb-24 pt-32 text-charcoal">
      <div className="wrap max-w-[52rem]">
        <DemoTag>Template, have this text checked by a lawyer before launch</DemoTag>
        <h1 className="t-h2 mt-6">{p.title}</h1>
        <p className="t-lead mt-5 text-charcoal/70">{p.intro}</p>
        {p.sections.map((s) => (
          <section key={s.h} className="mt-10 border-t border-charcoal/15 pt-6">
            <h2 className="t-h3">{s.h}</h2>
            {s.body.map((b) => (
              <p key={b} className="mt-3 leading-relaxed text-charcoal/80">
                {b}
              </p>
            ))}
          </section>
        ))}
        <p className="mt-14">
          <Link to="/" className="link-line font-[600]">
            Back to the home page
          </Link>
        </p>
      </div>
    </article>
  )
}
