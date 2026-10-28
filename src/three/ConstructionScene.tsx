import { Environment, Grid, Lightformer } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { BRAND_ORANGE } from '../components/Logo'
import { concreteTexture, facadeTexture, groundTexture, rng, softSprite } from './materials'
import { SIGN_ASPECT, signTexture } from './sign'
import { clamp, ease, easeOut, lerp, seg } from './stages'

/*
 * A procedural tower that builds itself as the page scrolls:
 * piles → raft → core and columns → steel beams → floor slabs and walls →
 * glass → crown, lights and the company sign on the roof.
 * Everything is driven by one progress value (0–1).
 */

const FLOORS = 12
const FH = 0.46
const NX = 6
const NZ = 4
const SX = 1.35
const SZ = 1.35
const W = (NX - 1) * SX
const D = (NZ - 1) * SZ
const BASE = 0.32
const TOP = BASE + FLOORS * FH
const PIT = 0.45
const SIGN_W = W * 0.9
const SIGN_H = SIGN_W / SIGN_ASPECT
const BLOCK_W = 15
const BLOCK_D = 11
const DEPTH = 3.1
/** Share of the scroll spent on the blueprint before the build starts. */
export const BLUEPRINT = 0.1
const toBuild = (p: number) => clamp((p - BLUEPRINT) / (1 - BLUEPRINT))

type Mode = 'rise' | 'drop' | 'sweepX' | 'grow'
type Part = { p: [number, number, number]; s: [number, number, number]; start: number; dur: number; mode: Mode }

const gx = (i: number) => i * SX - W / 2
const gz = (j: number) => j * SZ - D / 2
const isCore = (i: number, j: number) => i >= 2 && i <= 3 && j >= 1 && j <= 2

function buildParts() {
  const piles: Part[] = []
  const columns: Part[] = []
  const beams: Part[] = []
  const slabs: Part[] = []
  const walls: Part[] = []
  const glass: Part[] = []
  const interiors: Part[] = []
  const colH = FH - 0.06

  for (let i = 0; i < NX; i++)
    for (let j = 0; j < NZ; j++) {
      const k = (i + j) % 3
      piles.push({ p: [gx(i), -PIT + 0.2, gz(j)], s: [0.26, 0.4, 0.26], start: 0.01 + k * 0.03, dur: 0.035, mode: 'rise' })
    }

  for (let f = 0; f < FLOORS; f++) {
    const ff = f / (FLOORS - 1)
    const y0 = BASE + f * FH
    for (let i = 0; i < NX; i++)
      for (let j = 0; j < NZ; j++) {
        if (isCore(i, j)) continue
        columns.push({ p: [gx(i), y0 + colH / 2, gz(j)], s: [0.17, colH, 0.17], start: 0.14 + ff * 0.17, dur: 0.03, mode: 'rise' })
      }
    const by = y0 + FH - 0.06 - 0.045
    for (let j = 0; j < NZ; j++)
      for (let i = 0; i < NX - 1; i++) beams.push({ p: [gx(i) + SX / 2, by, gz(j)], s: [SX, 0.09, 0.1], start: 0.3 + ff * 0.15, dur: 0.03, mode: 'drop' })
    for (let i = 0; i < NX; i++)
      for (let j = 0; j < NZ - 1; j++) beams.push({ p: [gx(i), by, gz(j) + SZ / 2], s: [0.1, 0.09, SZ], start: 0.31 + ff * 0.15, dur: 0.03, mode: 'drop' })

    slabs.push({ p: [0, y0 + FH - 0.03, 0], s: [W + 0.5, 0.07, D + 0.5], start: 0.45 + ff * 0.15, dur: 0.04, mode: 'sweepX' })

    // solid end walls and spandrel bands on the long faces
    for (const sx of [-1, 1]) walls.push({ p: [sx * (W / 2 + 0.12), y0 + colH / 2, 0], s: [0.1, colH, D + 0.3], start: 0.5 + ff * 0.13, dur: 0.035, mode: 'rise' })
    for (const sz of [-1, 1]) walls.push({ p: [0, y0 + 0.06, sz * (D / 2 + 0.14)], s: [W + 0.34, 0.12, 0.06], start: 0.52 + ff * 0.13, dur: 0.035, mode: 'sweepX' })

    // unitised glass panels, bay by bay
    for (const sz of [-1, 1])
      for (let i = 0; i < NX - 1; i++)
        glass.push({ p: [gx(i) + SX / 2, y0 + 0.12 + (FH - 0.18) / 2, sz * (D / 2 + 0.16)], s: [SX - 0.05, FH - 0.18, 0.03], start: 0.64 + ff * 0.17 + i * 0.002, dur: 0.03, mode: 'drop' })

    interiors.push({ p: [0, y0 + colH / 2 + 0.02, 0], s: [W - 0.2, colH - 0.08, D - 0.1], start: 0.86 + ff * 0.08, dur: 0.04, mode: 'grow' })
  }
  return { piles, columns, beams, slabs, walls, glass, interiors }
}

const m4 = new THREE.Matrix4()
const q = new THREE.Quaternion()
const v = new THREE.Vector3()
const sc = new THREE.Vector3()

function placePart(part: Part, p: number) {
  const t = ease(seg(p, part.start, part.start + part.dur))
  const [x, y, z] = part.p
  const [w, h, d] = part.s
  if (t <= 0) {
    v.set(x, y, z)
    sc.set(0, 0, 0)
  } else if (part.mode === 'rise') {
    v.set(x, y - h / 2 + (h * t) / 2, z)
    sc.set(w, h * t, d)
  } else if (part.mode === 'drop') {
    v.set(x, y + (1 - easeOut(t)) * 1.4, z)
    sc.set(w, h, d)
  } else if (part.mode === 'sweepX') {
    v.set(x - w / 2 + (w * t) / 2, y, z)
    sc.set(w * t, h, d)
  } else {
    v.set(x, y, z)
    sc.set(w * (0.6 + 0.4 * t), h * t, d * (0.6 + 0.4 * t))
  }
  m4.compose(v, q, sc)
}

function Instances({ parts, material, geometry, progress, shadows }: { parts: Part[]; material: THREE.Material; geometry: THREE.BufferGeometry; progress: MutableRefObject<number>; shadows: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const last = useRef(-1)
  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const p = progress.current
    if (Math.abs(p - last.current) < 1e-5) return
    last.current = p
    for (let i = 0; i < parts.length; i++) {
      placePart(parts[i], p)
      mesh.setMatrixAt(i, m4)
    }
    mesh.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[geometry, material, parts.length]} castShadow={shadows} receiveShadow={shadows} frustumCulled={false} />
}

/** Cut-away block of ground with soil strata on its sides and a pit for the foundations. */
function Ground({ shadows, progress }: { shadows: boolean; progress: MutableRefObject<number> }) {
  const { layers, top } = useMemo(() => {
    const r = rng(5)
    const colors = ['#4b4038', '#5a4e44', '#6b6157', '#544a42', '#786d60', '#463d36']
    const hs = colors.map(() => 6 + r() * 30)
    const total = hs.reduce((a, b) => a + b, 0)
    const avail = DEPTH - PIT
    let y = -DEPTH
    const layers = colors.map((c, i) => {
      const h = (hs[i] / total) * avail
      const l = { y: y + h / 2, h, mat: new THREE.MeshStandardMaterial({ color: c, roughness: 1, transparent: true }) }
      y += h
      return l
    })
    const tex = groundTexture()
    const top = new THREE.MeshStandardMaterial({ color: '#8a7a68', map: tex, roughness: 1, transparent: true })
    return { layers, top }
  }, [])
  const group = useRef<THREE.Group>(null)
  // the solid ground fills in under the drawing as the blueprint finishes
  useFrame(() => {
    const o = ease(seg(progress.current, BLUEPRINT * 0.6, BLUEPRINT + 0.04))
    for (const l of layers) l.mat.opacity = o
    top.opacity = o
    if (group.current) group.current.visible = o > 0.001
  })
  const pw = W + 1.6
  const pd = D + 1.6
  const ring: [number, number, number, number][] = [
    // x, z, width, depth of the four top-soil pieces around the pit
    [0, -(pd / 2 + (BLOCK_D - pd) / 4), BLOCK_W, (BLOCK_D - pd) / 2],
    [0, pd / 2 + (BLOCK_D - pd) / 4, BLOCK_W, (BLOCK_D - pd) / 2],
    [-(pw / 2 + (BLOCK_W - pw) / 4), 0, (BLOCK_W - pw) / 2, pd],
    [pw / 2 + (BLOCK_W - pw) / 4, 0, (BLOCK_W - pw) / 2, pd],
  ]
  return (
    <group ref={group}>
      {layers.map((l, i) => (
        <mesh key={i} position={[0, l.y, 0]} material={l.mat} receiveShadow={shadows}>
          <boxGeometry args={[BLOCK_W, l.h, BLOCK_D]} />
        </mesh>
      ))}
      {ring.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, -PIT / 2, z]} material={top} receiveShadow={shadows}>
          <boxGeometry args={[w, PIT, d]} />
        </mesh>
      ))}
    </group>
  )
}

function Crane({ progress, materials }: { progress: MutableRefObject<number>; materials: { crane: THREE.Material; steel: THREE.Material } }) {
  const root = useRef<THREE.Group>(null)
  const mast = useRef<THREE.Mesh>(null)
  const head = useRef<THREE.Group>(null)
  const hook = useRef<THREE.Mesh>(null)
  const pos: [number, number, number] = [W / 2 + 1.7, 0, -D / 2 - 0.9]
  useFrame(() => {
    const p = progress.current
    // climbs with the frame, then is taken down before handover
    const h = lerp(2.4, TOP + 2.2, ease(seg(p, 0.12, 0.8)))
    const leave = ease(seg(p, 0.84, 0.93))
    if (mast.current) {
      mast.current.scale.y = h
      mast.current.position.y = h / 2
    }
    if (head.current) {
      head.current.position.y = h
      head.current.rotation.y = 2.4 + p * 5
    }
    if (hook.current) {
      const len = 1.2 + Math.sin(p * 40) * 0.5
      hook.current.scale.y = len
      hook.current.position.y = -len / 2
    }
    // rises out of the ground once the drawing is done, leaves before handover
    const arrive = ease(seg(p, 0, 0.07))
    if (root.current) {
      root.current.position.y = -(leave + (1 - arrive)) * (TOP + 4)
      root.current.visible = leave < 1 && arrive > 0
    }
  })
  return (
    <group ref={root}>
      <group position={pos}>
        <mesh ref={mast} material={materials.crane} castShadow>
          <boxGeometry args={[0.32, 1, 0.32]} />
        </mesh>
        <group ref={head}>
          <mesh position={[2.6, 0.12, 0]} material={materials.crane} castShadow>
            <boxGeometry args={[6.2, 0.2, 0.22]} />
          </mesh>
          <mesh position={[-1.4, 0.12, 0]} material={materials.crane} castShadow>
            <boxGeometry args={[2.2, 0.2, 0.26]} />
          </mesh>
          <mesh position={[-2.2, -0.1, 0]} material={materials.steel} castShadow>
            <boxGeometry args={[0.6, 0.4, 0.5]} />
          </mesh>
          <mesh position={[0, 0.55, 0]} material={materials.crane}>
            <boxGeometry args={[0.18, 0.9, 0.18]} />
          </mesh>
          <mesh position={[0.35, -0.12, 0.22]} material={materials.steel}>
            <boxGeometry args={[0.4, 0.34, 0.3]} />
          </mesh>
          <group position={[3.6, 0, 0]}>
            <mesh ref={hook} material={materials.steel}>
              <boxGeometry args={[0.02, 1, 0.02]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

function Sign({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Sprite>(null)
  const light = useRef<THREE.PointLight>(null)
  const { face, back, post, glowMat } = useMemo(() => {
    const tex = signTexture()
    return {
      face: new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.15, roughness: 0.5, metalness: 0.1 }),
      back: new THREE.MeshStandardMaterial({ color: '#16191c', roughness: 0.6, metalness: 0.4 }),
      post: new THREE.MeshStandardMaterial({ color: '#2b3036', roughness: 0.5, metalness: 0.6 }),
      glowMat: new THREE.SpriteMaterial({ map: softSprite('255,214,170'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }),
    }
  }, [])
  const rest = TOP + 0.62 + SIGN_H / 2
  useFrame(() => {
    const p = progress.current
    const d = easeOut(seg(p, 0.86, 0.95))
    const l = ease(seg(p, 0.93, 1))
    if (group.current) {
      group.current.visible = p > 0.86
      group.current.position.y = rest + (1 - d) * 3
    }
    face.emissiveIntensity = 0.15 + l * 1.6
    glowMat.opacity = l * 0.55
    if (light.current) light.current.intensity = l * 6
  })
  return (
    <group ref={group} position={[0, rest, D / 2 - 0.35]} visible={false}>
      <mesh material={face} position={[0, 0, 0.04]}>
        <planeGeometry args={[SIGN_W, SIGN_H]} />
      </mesh>
      <mesh material={back}>
        <boxGeometry args={[SIGN_W + 0.06, SIGN_H + 0.06, 0.07]} />
      </mesh>
      {[-SIGN_W * 0.32, SIGN_W * 0.32].map((x) => (
        <mesh key={x} material={post} position={[x, -SIGN_H / 2 - 0.31, -0.05]}>
          <boxGeometry args={[0.07, 0.62, 0.07]} />
        </mesh>
      ))}
      <sprite ref={glow} material={glowMat} position={[0, 0, 0.3]} scale={[SIGN_W * 1.6, SIGN_H * 2.6, 1]} />
      <pointLight ref={light} position={[0, 0, 1.2]} color="#ffd9b0" intensity={0} distance={6} decay={1.5} />
    </group>
  )
}

function Building({ progress, shadows }: { progress: MutableRefObject<number>; shadows: boolean }) {
  const parts = useMemo(buildParts, [])
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const cyl = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 1, 14), [])
  const mats = useMemo(() => {
    const conc = concreteTexture()
    return {
      concrete: new THREE.MeshStandardMaterial({ color: '#bdb8b0', map: conc, roughness: 0.92 }),
      slab: new THREE.MeshStandardMaterial({ color: '#cfcac2', map: conc, roughness: 0.9 }),
      steel: new THREE.MeshStandardMaterial({ color: '#56606a', roughness: 0.45, metalness: 0.7 }),
      facade: new THREE.MeshStandardMaterial({ color: '#e6e0d6', map: facadeTexture(), roughness: 0.75 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#3d5a70', metalness: 0.35, roughness: 0.06, envMapIntensity: 1.4, transparent: true, opacity: 0.62, clearcoat: 1 }),
      interior: new THREE.MeshStandardMaterial({ color: '#1a1410', emissive: new THREE.Color('#ffae5c'), emissiveIntensity: 0.1, roughness: 0.9 }),
      crane: new THREE.MeshStandardMaterial({ color: BRAND_ORANGE, roughness: 0.55, metalness: 0.3 }),
      pile: new THREE.MeshStandardMaterial({ color: '#9b958c', map: conc, roughness: 0.95 }),
    }
  }, [])

  const raft = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)
  const crown = useRef<THREE.Group>(null)
  const coreH = TOP - BASE + 0.5

  useFrame(() => {
    const p = progress.current
    const r = ease(seg(p, 0.05, 0.13))
    if (raft.current) {
      const h = PIT + BASE
      raft.current.visible = r > 0
      raft.current.scale.set(1, Math.max(r, 1e-4), 1)
      raft.current.position.y = -PIT + (h * r) / 2
    }
    const c = ease(seg(p, 0.13, 0.33))
    if (core.current) {
      core.current.visible = c > 0
      core.current.scale.set(1, Math.max(c, 1e-4), 1)
      core.current.position.y = BASE + (coreH * c) / 2
    }
    const cr = ease(seg(p, 0.8, 0.88))
    if (crown.current) {
      crown.current.visible = cr > 0
      crown.current.scale.set(1, Math.max(cr, 1e-4), 1)
    }
    const g = ease(seg(p, 0.86, 1))
    mats.interior.emissiveIntensity = 0.1 + g * 1.3
  })

  return (
    <group>
      <Instances parts={parts.piles} material={mats.pile} geometry={cyl} progress={progress} shadows={shadows} />
      <mesh ref={raft} material={mats.concrete} castShadow={shadows} receiveShadow={shadows} visible={false}>
        <boxGeometry args={[W + 1.2, PIT + BASE, D + 1.2]} />
      </mesh>
      <mesh ref={core} material={mats.concrete} castShadow={shadows} receiveShadow={shadows} position={[0, BASE, 0]} visible={false}>
        <boxGeometry args={[SX + 0.3, coreH, SZ + 0.3]} />
      </mesh>
      <Instances parts={parts.columns} material={mats.concrete} geometry={box} progress={progress} shadows={shadows} />
      <Instances parts={parts.beams} material={mats.steel} geometry={box} progress={progress} shadows={shadows} />
      <Instances parts={parts.slabs} material={mats.slab} geometry={box} progress={progress} shadows={shadows} />
      <Instances parts={parts.walls} material={mats.facade} geometry={box} progress={progress} shadows={shadows} />
      <Instances parts={parts.interiors} material={mats.interior} geometry={box} progress={progress} shadows={false} />
      <Instances parts={parts.glass} material={mats.glass} geometry={box} progress={progress} shadows={false} />

      {/* roof parapet and plant room */}
      <group ref={crown} position={[0, TOP, 0]} visible={false}>
        {[
          [0, D / 2 + 0.17, W + 0.4, 0.08],
          [0, -D / 2 - 0.17, W + 0.4, 0.08],
          [W / 2 + 0.17, 0, 0.08, D + 0.4],
          [-W / 2 - 0.17, 0, 0.08, D + 0.4],
        ].map(([x, z, w, d], i) => (
          <mesh key={i} position={[x, 0.15, z]} material={mats.facade} castShadow={shadows}>
            <boxGeometry args={[w, 0.3, d]} />
          </mesh>
        ))}
        <mesh position={[-1.6, 0.25, -(D + 0.6) / 2 + 1.0]} material={mats.facade} castShadow={shadows}>
          <boxGeometry args={[2.0, 0.5, 1.4]} />
        </mesh>
        <mesh position={[1.9, 0.18, -0.6]} material={mats.steel} castShadow={shadows}>
          <boxGeometry args={[1.1, 0.36, 0.8]} />
        </mesh>
      </group>

      <Crane progress={progress} materials={{ crane: mats.crane, steel: mats.steel }} />
      <Sign progress={progress} />
    </group>
  )
}


/** The building as a blueprint: its outline draws itself, then fades back as the real structure goes up. */
function Blueprint({ progress }: { progress: MutableRefObject<number> }) {
  const { geo, mat, count } = useMemo(() => {
    const v: number[] = []
    const seg3 = (a: number[], b: number[]) => v.push(...a, ...b)
    const rect = (y: number, w: number, d: number) => {
      const x = w / 2
      const z = d / 2
      seg3([-x, y, -z], [x, y, -z])
      seg3([x, y, -z], [x, y, z])
      seg3([x, y, z], [-x, y, z])
      seg3([-x, y, z], [-x, y, -z])
    }
    // site block and pit
    rect(0, BLOCK_W, BLOCK_D)
    rect(-DEPTH, BLOCK_W, BLOCK_D)
    for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) seg3([(x * BLOCK_W) / 2, 0, (z * BLOCK_D) / 2], [(x * BLOCK_W) / 2, -DEPTH, (z * BLOCK_D) / 2])
    rect(-PIT, W + 1.6, D + 1.6)
    // grid lines on the ground
    for (let i = 0; i < NX; i++) seg3([gx(i), 0.01, -D / 2 - 1.4], [gx(i), 0.01, D / 2 + 1.4])
    for (let j = 0; j < NZ; j++) seg3([-W / 2 - 1.4, 0.01, gz(j)], [W / 2 + 1.4, 0.01, gz(j)])
    // columns, floor by floor, then the roof
    for (let i = 0; i < NX; i++) for (const j of [0, NZ - 1]) seg3([gx(i), BASE, gz(j)], [gx(i), TOP, gz(j)])
    for (const i of [0, NX - 1]) for (let j = 1; j < NZ - 1; j++) seg3([gx(i), BASE, gz(j)], [gx(i), TOP, gz(j)])
    for (let f = 0; f <= FLOORS; f++) rect(BASE + f * FH, W + 0.5, D + 0.5)
    rect(TOP + 0.3, W + 0.4, D + 0.4)
    // sign frame
    const sy = TOP + 0.62
    const sz = D / 2 - 0.35
    seg3([-SIGN_W / 2, sy, sz], [SIGN_W / 2, sy, sz])
    seg3([SIGN_W / 2, sy, sz], [SIGN_W / 2, sy + SIGN_H, sz])
    seg3([SIGN_W / 2, sy + SIGN_H, sz], [-SIGN_W / 2, sy + SIGN_H, sz])
    seg3([-SIGN_W / 2, sy + SIGN_H, sz], [-SIGN_W / 2, sy, sz])
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
    const mat = new THREE.LineBasicMaterial({ color: '#9fc3e6', transparent: true, opacity: 0.9, depthWrite: false })
    return { geo, mat, count: v.length / 3 }
  }, [])
  useFrame(() => {
    const p = progress.current
    const draw = ease(seg(p, 0.005, BLUEPRINT * 0.85))
    // segments come in pairs of vertices
    geo.setDrawRange(0, Math.floor((count / 2) * draw) * 2)
    const q = toBuild(p)
    mat.opacity = 0.9 * (1 - 0.75 * ease(seg(p, BLUEPRINT * 0.7, BLUEPRINT + 0.06))) * (1 - ease(seg(q, 0.62, 0.86)))
  })
  return <lineSegments geometry={geo} material={mat} renderOrder={5} />
}

const DAY = new THREE.Color('#fff4e6')
const GOLD = new THREE.Color('#ffb46b')
const BG_A = new THREE.Color('#151719')
const BLUE = new THREE.Color('#0f1b29')
const BG_B = new THREE.Color('#1f1a17')

function Rig({ progress, build, target, compact, centered }: { progress: MutableRefObject<number>; build: MutableRefObject<number>; target: MutableRefObject<number>; compact: boolean; centered: boolean }) {
  const { camera, scene, invalidate } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null)
  const rim = useRef<THREE.DirectionalLight>(null)
  const look = useMemo(() => new THREE.Vector3(), [])
  const bg = useMemo(() => new THREE.Color(), [])

  useLayoutEffect(() => {
    scene.background = bg
  }, [scene, bg])

  // render on demand: only when the page scrolls or the building is still catching up
  useEffect(() => {
    const on = () => invalidate()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    invalidate()
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [invalidate])

  useFrame((_, dt) => {
    // ease toward the scroll position so fast scrolling still reads as building
    const k = 1 - Math.exp(-dt * 6)
    progress.current += (target.current - progress.current) * k
    if (Math.abs(target.current - progress.current) < 1e-4) progress.current = target.current
    else invalidate()
    const raw = clamp(progress.current)
    build.current = toBuild(raw)
    const p = build.current

    const a = lerp(-0.95, 0.55, p)
    const r = compact ? lerp(38, 36, p) : lerp(36, 34, p)
    const h = lerp(11, 7, p)
    let ly = lerp(0.6, TOP * 0.45, ease(clamp(p * 1.2))) + ease(seg(p, 0.84, 1)) * 1.4
    const right = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a))
    const off = compact || centered ? 0 : -5.2
    if (compact) ly -= 3.2
    camera.position.set(Math.sin(a) * r + right.x * off, h + ly, Math.cos(a) * r + right.z * off)
    look.set(right.x * off, ly, right.z * off)
    camera.lookAt(look)

    const g = ease(seg(p, 0.84, 1))
    if (sun.current) {
      sun.current.color.copy(DAY).lerp(GOLD, g)
      sun.current.intensity = lerp(2.4, 1.6, g)
      sun.current.position.set(lerp(8, -6, g), lerp(14, 6, g), 9)
    }
    if (rim.current) rim.current.intensity = lerp(0.6, 1.4, g)
    // blueprint navy at the start, site charcoal once building begins
    bg.copy(BLUE).lerp(BG_A, ease(seg(raw, BLUEPRINT * 0.5, BLUEPRINT + 0.08))).lerp(BG_B, g)
  })

  return (
    <>
      <hemisphereLight args={['#dfe6ee', '#3a322b', 0.8]} />
      <directionalLight
        ref={sun}
        position={[8, 14, 9]}
        intensity={2.4}
        castShadow={!compact}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0004}
      />
      <directionalLight ref={rim} position={[-9, 6, -10]} color="#ff9a5a" intensity={0.6} />
    </>
  )
}

export default function ConstructionScene({ target, active, compact, centered = false }: { target: MutableRefObject<number>; active: boolean; compact: boolean; centered?: boolean }) {
  const progress = useRef(target.current)
  const build = useRef(toBuild(target.current))
  return (
    <Canvas
      shadows={!compact}
      dpr={compact ? [1, 1.5] : [1, 2]}
      frameloop={active ? 'demand' : 'never'}
      camera={{ fov: compact ? 44 : 30, near: 0.5, far: 200, position: [0, 10, 35] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
    >
      <Rig progress={progress} build={build} target={target} compact={compact} centered={centered} />
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 6, 10]} scale={[14, 6, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-10, 4, -4]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} color="#ffd2a8" />
        <Lightformer intensity={0.8} position={[10, 3, 0]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} color="#cfe0ff" />
      </Environment>
      <Ground shadows={!compact} progress={progress} />
      <Blueprint progress={progress} />
      <Building progress={build} shadows={!compact} />
      <Grid position={[0, -DEPTH - 0.01, 0]} args={[80, 80]} cellSize={1} cellThickness={0.5} cellColor="#2a2d31" sectionSize={5} sectionThickness={1} sectionColor="#3a3d42" fadeDistance={60} fadeStrength={1.5} infiniteGrid />
    </Canvas>
  )
}
