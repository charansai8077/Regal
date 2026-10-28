import * as THREE from 'three'
import { BRAND_ORANGE } from '../components/Logo'
import { company } from '../config/site'

/** Width : height of the roof sign. */
export const SIGN_ASPECT = 3.1

const W = 2048
const H = Math.round(W / SIGN_ASPECT)

/** Regal mark drawn in the logo's own 312 x 368 units. */
function drawMark(g: CanvasRenderingContext2D, x: number, y: number, h: number, figure: string) {
  const s = h / 368
  g.save()
  g.translate(x, y)
  g.scale(s, s)
  g.lineWidth = 27
  g.strokeStyle = figure
  // head ring, clipped below the hat brim
  g.save()
  g.beginPath()
  g.rect(0, 112, 312, 256)
  g.clip()
  g.beginPath()
  g.arc(155, 130, 80, 0, Math.PI * 2)
  g.stroke()
  g.restore()
  // shoulders
  g.beginPath()
  g.moveTo(11, 368)
  g.lineTo(11, 365)
  g.arc(155, 365, 144, Math.PI, 0)
  g.lineTo(299, 368)
  g.stroke()
  // hard hat, with the two ventilation slots cut out
  const hat = new Path2D()
  hat.ellipse(155, 99, 92, 84, 0, Math.PI, 0)
  hat.closePath()
  hat.roundRect(142, 2, 26, 40, 8)
  hat.roundRect(52, 94, 205, 16, 6)
  g.save()
  g.beginPath()
  g.rect(0, -10, 312, 130)
  g.roundRect(129, -4, 12, 62, 6)
  g.roundRect(169, -4, 12, 62, 6)
  g.clip('evenodd')
  g.fillStyle = BRAND_ORANGE
  g.fill(hat)
  g.restore()
  g.restore()
}

function draw(g: CanvasRenderingContext2D) {
  g.clearRect(0, 0, W, H)
  // backing panel
  g.fillStyle = '#16191c'
  g.beginPath()
  g.roundRect(8, 8, W - 16, H - 16, 26)
  g.fill()
  g.strokeStyle = 'rgba(255,255,255,0.08)'
  g.lineWidth = 6
  g.stroke()

  // lockup: mark + REGAL / CIVIL ENGINEERS, centred on the panel
  const big = H * 0.4
  const markH = big * 1.74
  const font = "'Montserrat', 'Archivo Variable', sans-serif"
  g.font = `800 ${big}px ${font}`
  if ('letterSpacing' in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${big * 0.05}px`
  const primary = company.logo.primary.toUpperCase()
  const pw = g.measureText(primary).width
  const small = big * 0.31
  g.font = `600 ${small}px ${font}`
  if ('letterSpacing' in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${small * 0.235}px`
  const secondary = company.logo.secondary.toUpperCase()
  const sw = g.measureText(secondary).width
  const textW = Math.max(pw, sw)
  const markW = markH * (312 / 368)
  const gap = big * 0.32
  const total = markW + gap + textW
  const x0 = (W - total) / 2
  const base = (H + markH) / 2

  drawMark(g, x0, base - markH, markH, '#f5f4f0')

  const tx = x0 + markW + gap
  g.fillStyle = '#f5f4f0'
  g.textBaseline = 'alphabetic'
  g.font = `800 ${big}px ${font}`
  if ('letterSpacing' in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${big * 0.05}px`
  const capBottom = base - small * 1.7 - big * 0.62
  g.fillText(primary, tx, capBottom)
  g.font = `600 ${small}px ${font}`
  if ('letterSpacing' in g) (g as unknown as { letterSpacing: string }).letterSpacing = `${small * 0.235}px`
  g.fillText(secondary, tx, base - small * 0.42)
}

/** Canvas texture of the company sign; redrawn once the brand font has loaded. */
export function signTexture() {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  draw(g)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  document.fonts
    ?.load(`800 100px Montserrat`)
    .then(() => document.fonts.load(`600 40px Montserrat`))
    .then(() => {
      draw(g)
      tex.needsUpdate = true
    })
    .catch(() => {})
  return tex
}
