import type { ImgHTMLAttributes } from 'react'
import { asset } from '../lib/hooks'

/** One of the office's images from public/work, with a small version for phones. */
export default function WorkImage({ name, alt, sizes = '100vw', ...rest }: { name: string; alt: string; sizes?: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'alt'>) {
  return <img src={asset(`work/${name}.webp`)} srcSet={`${asset(`work/${name}-sm.webp`)} 800w, ${asset(`work/${name}.webp`)} 1600w`} sizes={sizes} alt={alt} decoding="async" {...rest} />
}
