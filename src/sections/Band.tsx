import { Marquee } from '../components/motion'

/** Moving band of what the office does. Speeds up and turns with the scroll. */
export default function Band() {
  return (
    <div className="relative z-[1] -my-px overflow-hidden bg-orange py-5 text-charcoal md:py-7">
      <Marquee
        items={['Building plans', 'Layouts', 'Constructions', 'Surveys', 'TUDA approvals', 'DTCP approvals', '2D & 3D elevations', 'Structural design']}
        className="text-[clamp(2rem,5vw,4.6rem)] font-[560] leading-none tracking-[-0.03em]"
        speed={60}
      />
    </div>
  )
}
