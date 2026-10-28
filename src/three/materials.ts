import * as THREE from 'three'

/** Small seeded random generator so the building looks the same on every visit. */
export function rng(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function finish(c: HTMLCanvasElement, repeat = 1) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat, repeat)
  t.anisotropy = 4
  return t
}

/** Cast concrete: mottled grey with fine speckle and shutter lines. */
export function concreteTexture() {
  const [c, g] = canvas(256, 256)
  const r = rng(7)
  g.fillStyle = '#8d8a85'
  g.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 900; i++) {
    const v = 120 + r() * 50
    g.fillStyle = `rgba(${v},${v - 3},${v - 7},${0.08 + r() * 0.12})`
    const s = 1 + r() * 9
    g.fillRect(r() * 256, r() * 256, s, s)
  }
  g.strokeStyle = 'rgba(40,38,36,0.12)'
  for (let y = 0; y < 256; y += 64) {
    g.beginPath()
    g.moveTo(0, y + 0.5)
    g.lineTo(256, y + 0.5)
    g.stroke()
  }
  return finish(c, 1)
}

/** Solid parts of the envelope: warm render with panel joints. */
export function facadeTexture() {
  const [c, g] = canvas(256, 256)
  const r = rng(11)
  g.fillStyle = '#d9d3c8'
  g.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 500; i++) {
    const v = 200 + r() * 30
    g.fillStyle = `rgba(${v},${v - 6},${v - 14},0.15)`
    g.fillRect(r() * 256, r() * 256, 2 + r() * 6, 2 + r() * 6)
  }
  g.strokeStyle = 'rgba(80,72,64,0.25)'
  g.lineWidth = 2
  for (let x = 0; x <= 256; x += 128) {
    g.beginPath()
    g.moveTo(x, 0)
    g.lineTo(x, 256)
    g.stroke()
  }
  for (let y = 0; y <= 256; y += 85) {
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(256, y)
    g.stroke()
  }
  return finish(c, 1)
}

/** Excavated site ground: compacted earth and gravel. */
export function groundTexture() {
  const [c, g] = canvas(512, 512)
  const r = rng(23)
  g.fillStyle = '#3a332d'
  g.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 4000; i++) {
    const v = 40 + r() * 50
    g.fillStyle = `rgba(${v + 14},${v + 6},${v},${0.2 + r() * 0.4})`
    const s = 1 + r() * 3
    g.fillRect(r() * 512, r() * 512, s, s)
  }
  return finish(c, 6)
}

/** Radial falloff sprite for glows and contact shadows. */
export function softSprite(color = '255,190,120') {
  const [c, g] = canvas(128, 128)
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, `rgba(${color},1)`)
  grad.addColorStop(0.4, `rgba(${color},0.35)`)
  grad.addColorStop(1, `rgba(${color},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
