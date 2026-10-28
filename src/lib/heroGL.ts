/*
 * Hero renderer: one full-screen WebGL quad that draws the office's
 * elevations with
 *  - a noise-edged displacement wipe between images (with a glowing seam),
 *  - perspective shift and a warm light that follow the pointer,
 *  - a camera push-in toward each building's focus point as you scroll.
 * Plain WebGL so the hero does not need the 3D library to load first.
 */

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main() {
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uSizeA;
uniform vec2 uSizeB;
uniform vec2 uFocusA;
uniform vec2 uFocusB;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uMix;
uniform float uZoom;
uniform float uTime;
uniform float uFade;
uniform float uShift;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// cover-fit, then push in toward the focus point, then lean with the pointer
vec2 frame(vec2 uv, vec2 size, vec2 focus) {
  float rs = uRes.x / uRes.y, ri = size.x / size.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  vec2 c = (uv - 0.5) * s;
  vec2 f = focus - 0.5;
  // keep the focus in the frame while zooming
  vec2 o = f * (1.0 - 1.0 / uZoom);
  c = c / uZoom + o + 0.5;
  // perspective: the top of the building moves more than its base
  c.x += uPointer.x * 0.014 * (0.6 + (1.0 - uv.y) * 0.8);
  c.y += uPointer.y * 0.010;
  return c;
}

void main() {
  vec2 uv = vUv;
  uv.y = 1.0 - uv.y;
  float n = fbm(uv * 3.2 + uTime * 0.05);
  // wipe moves left to right with a ragged, drifting edge
  float edge = uMix * 1.5 - 0.25;
  float m = smoothstep(edge - 0.12, edge + 0.12, (1.0 - uv.x) * 0.6 + n * 0.55);
  m = 1.0 - m;
  vec2 dir = vec2(0.22, 0.04) * (n - 0.5);
  vec2 ua = frame(uv + dir * uMix * 0.8, uSizeA, uFocusA);
  vec2 ub = frame(uv - dir * (1.0 - uMix) * 0.8, uSizeB, uFocusB);
  // a little chromatic split while the camera moves fast
  float k = uShift * 0.004;
  vec3 a = vec3(texture2D(uA, ua + vec2(k, 0.0)).r, texture2D(uA, ua).g, texture2D(uA, ua - vec2(k, 0.0)).b);
  vec3 b = vec3(texture2D(uB, ub + vec2(k, 0.0)).r, texture2D(uB, ub).g, texture2D(uB, ub - vec2(k, 0.0)).b);
  vec3 col = mix(a, b, m);
  // glowing seam in the brand orange
  float seam = (1.0 - abs(m - 0.5) * 2.0) * step(0.001, uMix) * step(uMix, 0.999);
  col += vec3(0.85, 0.42, 0.18) * pow(seam, 4.0) * 0.55;
  // warm light that follows the pointer, stronger on bright surfaces
  vec2 lp = vec2(0.5 + uPointer.x * 0.35, 0.45 - uPointer.y * 0.3);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float glow = exp(-dot(uv - lp, uv - lp) * 6.0);
  col += vec3(1.0, 0.72, 0.45) * glow * (0.05 + lum * 0.22);
  // vignette, then fade toward charcoal as the hero hands over
  float v = smoothstep(1.2, 0.35, length((uv - 0.5) * vec2(1.1, 1.0)));
  col *= mix(0.72, 1.0, v);
  col = mix(col, vec3(0.082, 0.09, 0.098), uFade);
  gl_FragColor = vec4(col, 1.0);
}`

export type HeroState = {
  pointer: { x: number; y: number }
  zoom: number
  fade: number
  shift: number
}

type Tex = { tex: WebGLTexture; w: number; h: number }

export function createHeroGL(canvas: HTMLCanvasElement, opts: { urls: string[]; focus: readonly (readonly [number, number])[]; state: HeroState; onReady: () => void }) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
  if (!gl) return null

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader')
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'p')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const U = (n: string) => gl.getUniformLocation(prog, n)
  const u = {
    a: U('uA'),
    b: U('uB'),
    sa: U('uSizeA'),
    sb: U('uSizeB'),
    fa: U('uFocusA'),
    fb: U('uFocusB'),
    res: U('uRes'),
    ptr: U('uPointer'),
    mix: U('uMix'),
    zoom: U('uZoom'),
    time: U('uTime'),
    fade: U('uFade'),
    shift: U('uShift'),
  }
  gl.uniform1i(u.a, 0)
  gl.uniform1i(u.b, 1)

  const textures: (Tex | Promise<Tex> | undefined)[] = []
  const load = (i: number): Promise<Tex> => {
    const have = textures[i]
    if (have) return Promise.resolve(have)
    const p = new Promise<Tex>((res, rej) => {
      const im = new Image()
      im.decoding = 'async'
      im.onload = () => {
        const tex = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        const t = { tex, w: im.naturalWidth, h: im.naturalHeight }
        textures[i] = t
        res(t)
      }
      im.onerror = rej
      im.src = opts.urls[i]
    })
    textures[i] = p
    return p
  }

  let from = 0
  let to = 0
  let mix = 1
  let mixStart = 0
  const DURATION = 1700
  let raf = 0
  let running = false
  let ready = false
  const t0 = performance.now()
  const ptr = { x: 0, y: 0 }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 800 ? 1.5 : 1.75)
    const w = Math.round(canvas.clientWidth * dpr)
    const h = Math.round(canvas.clientHeight * dpr)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, w, h)
  }

  const frame = (now: number) => {
    raf = running ? requestAnimationFrame(frame) : 0
    const A = textures[from]
    const B = textures[to]
    if (!A || A instanceof Promise || !B || B instanceof Promise) return
    resize()
    if (mix < 1) mix = Math.min(1, (now - mixStart) / DURATION)
    if (mix >= 1 && from !== to) {
      from = to
      mix = 1
    }
    const e = mix < 0.5 ? 4 * mix * mix * mix : 1 - Math.pow(-2 * mix + 2, 3) / 2
    const s = opts.state
    // ease the pointer so the camera drifts rather than snaps
    ptr.x += (s.pointer.x - ptr.x) * 0.06
    ptr.y += (s.pointer.y - ptr.y) * 0.06
    const showB = from !== to
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, A.tex)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, B.tex)
    gl.uniform2f(u.sa, A.w, A.h)
    gl.uniform2f(u.sb, B.w, B.h)
    gl.uniform2f(u.fa, opts.focus[from][0], opts.focus[from][1])
    gl.uniform2f(u.fb, opts.focus[to][0], opts.focus[to][1])
    gl.uniform2f(u.res, canvas.width, canvas.height)
    gl.uniform2f(u.ptr, ptr.x, ptr.y)
    gl.uniform1f(u.mix, showB ? e : 0)
    gl.uniform1f(u.zoom, s.zoom)
    gl.uniform1f(u.time, (now - t0) / 1000)
    gl.uniform1f(u.fade, s.fade)
    gl.uniform1f(u.shift, s.shift)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    if (!ready) {
      ready = true
      opts.onReady()
    }
  }

  load(0).then(() => {
    if (!raf && running) raf = requestAnimationFrame(frame)
  })
  // fetch the next image quietly once the first is on screen
  load(0).then(() => load(1)).catch(() => {})

  return {
    /** Wipe to image i; resolves false if it could not load. */
    async go(i: number) {
      try {
        await load(i)
      } catch {
        return false
      }
      if (from !== to) from = to
      to = i
      mix = 0
      mixStart = performance.now()
      load((i + 1) % opts.urls.length).catch(() => {})
      return true
    },
    start() {
      if (running) return
      running = true
      raf = requestAnimationFrame(frame)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
      raf = 0
    },
    dispose() {
      this.stop()
      // the context is left alive: React may mount the hero again on the same canvas
    },
  }
}
