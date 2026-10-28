import { Link } from 'react-router-dom'
import { useSeo } from '../lib/seo'

export default function NotFound() {
  useSeo('Page not found', 'The page you were looking for does not exist.')
  return (
    <section className="drawing-grid flex min-h-[80svh] items-center pb-20 pt-32">
      <div className="wrap">
        <p className="t-label opacity-70 text-paper/55">Error 404</p>
        <h1 className="t-hero mt-4 !text-[clamp(2.6rem,8vw,7rem)]">Nothing built here</h1>
        <p className="t-lead mt-6 max-w-[34rem] text-paper/70">The page you are looking for has moved or never existed. Go back to the home page to see our services and projects.</p>
        <Link to="/" className="btn btn-primary mt-8">
          Go to the home page
        </Link>
      </div>
    </section>
  )
}
