/** Where each stage begins along the scroll (0–1). Shared by the scene and the stage list. */
const BUILD_STARTS = [0, 0.14, 0.3, 0.45, 0.64, 0.86]
/** The blueprint takes the first tenth of the scroll; the build stages share the rest. */
export const STAGE_STARTS = [0, ...BUILD_STARTS.map((v) => 0.1 + v * 0.9)]

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export function stageAt(p: number) {
  let s = 0
  for (let i = 0; i < STAGE_STARTS.length; i++) if (p >= STAGE_STARTS[i] - 0.001) s = i
  return s
}
