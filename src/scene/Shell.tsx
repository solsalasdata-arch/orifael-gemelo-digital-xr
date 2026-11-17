import { MeshReflectorMaterial } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import {
  BEAM_H, COL_ROW_X, COL_Z, D, FASCIA, FRONT, GATE1_X, GATE2_X, HALF_D, HALF_W, IN_X, IN_Z, PATIO_WALL_H, REBAR_X, ROOF_Z0, SIDEWALK, SLAB_T, SLAB_Y, STREET, W, WALL_T,
  type V3,
} from '../data'
import { bimRoofMat, bimSolidMat, bimWallMat, columnMat, concreteBeamMat, darkSteelMat, plasterMat, roofMat, rubberMat, shutterMat, wallMat } from '../materials'
import { useStore } from '../store'
import { asphaltTex, concreteNormalTex, concreteTex, glassBlockTex, repeated, rng, rustTex, sidewalkTex, stoneTex } from '../textures'
import { InstancedBoxes, boxAt } from './Instanced'
import { PhotoCrop } from './RealSite'

type M = THREE.Material | THREE.Material[]

function B({ p, s, m, cast = true, recv = true }: { p: V3; s: V3; m: M; cast?: boolean; recv?: boolean }) {
  return (
    <mesh position={p} material={m} castShadow={cast} receiveShadow={recv}>
      <boxGeometry args={s} />
    </mesh>
  )
}

const std = (key: string, f: () => THREE.Material) => {
  const g = globalThis as unknown as { __shellMats?: Map<string, THREE.Material> }
  g.__shellMats ??= new Map()
  let m = g.__shellMats.get(key)
  if (!m) {
    m = f()
    g.__shellMats.set(key, m)
  }
  return m
}
const slabMat = () => std('slab', () => new THREE.MeshStandardMaterial({ color: '#bfbcb6', map: repeated(concreteTex(), W / 4, D / 4), roughness: 0.93 }))
const facadeMat = (w: number, h: number) => std(`fac-${w.toFixed(2)}-${h.toFixed(2)}`, () => new THREE.MeshStandardMaterial({ color: '#a9a49c', map: repeated(concreteTex(), w / 3, h / 3), roughness: 0.95 }))
const blackMat = () => std('black', () => new THREE.MeshStandardMaterial({ color: '#17191c', metalness: 0.5, roughness: 0.5 }))
const rebarMat = () => std('rebar', () => new THREE.MeshStandardMaterial({ color: '#4d3a2d', metalness: 0.6, roughness: 0.65 }))
const plinthBlack = () => std('plinthB', () => new THREE.MeshStandardMaterial({ color: '#121314', roughness: 0.6 }))

function Floor() {
  const reflections = useStore((s) => s.reflections)
  const inXR = useStore((s) => s.inXR)
  const L = IN_Z - ROOF_Z0
  const map = useMemo(() => repeated(concreteTex(), (2 * IN_X) / 5, L / 5), [L])
  const nrm = useMemo(() => repeated(concreteNormalTex(), (2 * IN_X) / 5, L / 5), [L])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, (IN_Z + ROOF_Z0) / 2]} receiveShadow>
      <planeGeometry args={[2 * IN_X, L]} />
      {reflections && !inXR ? (
        <MeshReflectorMaterial
          map={map}
          normalMap={nrm}
          normalScale={[0.6, 0.6]}
          color="#c3c0ba"
          blur={[400, 120]}
          resolution={1024}
          mixBlur={1}
          mixStrength={2.4}
          mixContrast={1}
          roughness={0.32}
          metalness={0.05}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          mirror={0.6}
        />
      ) : (
        <meshStandardMaterial map={map} normalMap={nrm} color="#c3c0ba" roughness={0.35} metalness={0.05} />
      )}
    </mesh>
  )
}

function Walls() {
  const bim = useStore((s) => s.bim)
  const brickD = wallMat(D, SLAB_Y)
  const brickW = wallMat(W, SLAB_Y)
  const pl = plasterMat(D, SLAB_Y)
  const left: M = bim ? bimWallMat() : [brickD, pl, pl, pl, pl, pl]
  const right: M = bim ? bimWallMat() : [pl, brickD, pl, pl, pl, pl]
  const back: M = bim ? bimWallMat() : [pl, pl, pl, pl, brickW, pl]
  const zf = HALF_D - WALL_T / 2
  const fm = (w: number, h: number): M => (bim ? bimWallMat() : [facadeMat(w, h), facadeMat(w, h), facadeMat(w, h), facadeMat(w, h), facadeMat(w, h), wallMat(w, h)])
  const { door, vent } = FRONT
  const d0 = door.x - door.w / 2
  const d1 = door.x + door.w / 2
  const v0 = vent.x - vent.s / 2
  const v1 = vent.x + vent.s / 2
  const vy0 = vent.y - vent.s / 2
  const vy1 = vent.y + vent.s / 2
  const top = FASCIA.y0
  const pieces: [number, number, number, number][] = [
    [-HALF_W, d0, 0, top],
    [d1, FRONT.colWide.x0, 0, top],
    [d0, d1, door.h, vy0],
    [d0, v0, vy0, vy1],
    [v1, d1, vy0, vy1],
    [d0, d1, vy1, top],
  ]
  return (
    <group>
      <B p={[-HALF_W + WALL_T / 2, SLAB_Y / 2, (HALF_D + ROOF_Z0) / 2]} s={[WALL_T, SLAB_Y, HALF_D - ROOF_Z0]} m={left} cast={!bim} />
      <B p={[HALF_W - WALL_T / 2, SLAB_Y / 2, (HALF_D + ROOF_Z0) / 2]} s={[WALL_T, SLAB_Y, HALF_D - ROOF_Z0]} m={right} cast={!bim} />
      {[-1, 1].map((sd) => (
        <B key={sd} p={[sd * (HALF_W - WALL_T / 2), PATIO_WALL_H / 2, (ROOF_Z0 - HALF_D) / 2]} s={[WALL_T, PATIO_WALL_H, ROOF_Z0 + HALF_D]} m={bim ? bimWallMat() : wallMat(HALF_D + ROOF_Z0, PATIO_WALL_H)} cast={!bim} />
      ))}
      <B p={[0, PATIO_WALL_H / 2, -HALF_D + WALL_T / 2]} s={[W, PATIO_WALL_H, WALL_T]} m={back} cast={!bim} />
      {pieces.map(([x0, x1, y0, y1], i) => (
        <B key={i} p={[(x0 + x1) / 2, (y0 + y1) / 2, zf]} s={[x1 - x0, y1 - y0, WALL_T]} m={fm(x1 - x0, y1 - y0)} cast={!bim} />
      ))}
    </group>
  )
}

function Structure() {
  const bim = useStore((s) => s.bim)
  const cutRoof = useStore((s) => s.cutRoof)
  const colM = bim ? bimSolidMat() : columnMat()
  const beamM = bim ? bimSolidMat() : concreteBeamMat()
  const cols = useMemo(() => {
    const out: THREE.Matrix4[] = []
    const h = SLAB_Y - BEAM_H
    COL_Z.forEach((z) => {
      out.push(boxAt(COL_ROW_X, h / 2, z, 0.35, h, 0.35))
      out.push(boxAt(-IN_X + 0.12, SLAB_Y / 2, z, 0.25, SLAB_Y, 0.38))
      out.push(boxAt(IN_X - 0.12, SLAB_Y / 2, z, 0.25, SLAB_Y, 0.38))
    })
    return out
  }, [])
  const plinths = useMemo(() => COL_Z.map((z) => boxAt(COL_ROW_X, 0.6, z, 0.37, 1.2, 0.37)), [])
  const beams = useMemo(() => {
    const out: THREE.Matrix4[] = COL_Z.map((z) => boxAt(0, SLAB_Y - BEAM_H / 2, z, 2 * IN_X, BEAM_H, 0.25))
    out.push(boxAt(COL_ROW_X, SLAB_Y - BEAM_H / 2, (IN_Z + ROOF_Z0) / 2, 0.25, BEAM_H, IN_Z - ROOF_Z0))
    return out
  }, [])
  const fc = [FRONT.colWide, FRONT.colMid, FRONT.colRight]
  return (
    <group>
      <InstancedBoxes matrices={cols} material={colM} castShadow={!bim} />
      {!bim && <InstancedBoxes matrices={plinths} material={plinthBlack()} />}
      <InstancedBoxes matrices={beams} material={beamM} castShadow={!bim} />
      {fc.map((c, i) => (
        <B key={i} p={[(c.x0 + c.x1) / 2, FASCIA.y0 / 2, HALF_D - 0.17]} s={[c.x1 - c.x0, FASCIA.y0, 0.44]} m={colM} cast={!bim} />
      ))}
      <B p={[(FRONT.colWide.x0 + HALF_W) / 2, (FRONT.gate1.h + FASCIA.y0) / 2, HALF_D - 0.17]} s={[HALF_W - FRONT.colWide.x0, FASCIA.y0 - FRONT.gate1.h, 0.44]} m={beamM} cast={!bim} />
      <B
        p={[0, (FASCIA.y0 + FASCIA.y1) / 2, HALF_D + (FASCIA.overhang - WALL_T) / 2]}
        s={[W + 2 * FASCIA.side, FASCIA.y1 - FASCIA.y0, FASCIA.overhang + WALL_T]}
        m={bim ? bimSolidMat() : facadeMat(W + 2 * FASCIA.side, 0.8)}
        cast={!bim}
      />
      {!cutRoof && (
        <>
          <B p={[0, SLAB_Y + SLAB_T / 2, (HALF_D + ROOF_Z0) / 2]} s={[W, SLAB_T, HALF_D - ROOF_Z0]} m={bim ? bimRoofMat() : slabMat()} cast={!bim} />
          {!bim &&
            [
              [-HALF_W + 0.08, 0.16, HALF_D - ROOF_Z0],
              [HALF_W - 0.08, 0.16, HALF_D - ROOF_Z0],
            ].map(([x, w, d], i) => <B key={i} p={[x, SLAB_Y + SLAB_T + 0.2, (HALF_D + ROOF_Z0) / 2]} s={[w, 0.4, d]} m={slabMat()} />)}
          {!bim && <B p={[0, SLAB_Y + SLAB_T + 0.2, ROOF_Z0 + 0.08]} s={[W, 0.4, 0.16]} m={slabMat()} />}
        </>
      )}
      <Rebars />
    </group>
  )
}

function Rebars() {
  const bars = useMemo(() => {
    const r = rng(437)
    const out: THREE.Matrix4[] = []
    const y0 = FASCIA.y1
    REBAR_X.forEach((x) => {
      const z = HALF_D - 0.12
      const h = 1.1 + r() * 1.4
      for (const dx of [-0.09, 0.09])
        for (const dz of [-0.09, 0.09]) {
          const hh = h * (0.85 + r() * 0.15)
          out.push(boxAt(x + dx, y0 + hh / 2, z + dz, 0.02, hh, 0.02))
        }
      for (const sy of [0.25, 0.7]) {
        out.push(boxAt(x, y0 + sy, z - 0.09, 0.2, 0.012, 0.012))
        out.push(boxAt(x, y0 + sy, z + 0.09, 0.2, 0.012, 0.012))
        out.push(boxAt(x - 0.09, y0 + sy, z, 0.012, 0.012, 0.2))
        out.push(boxAt(x + 0.09, y0 + sy, z, 0.012, 0.012, 0.2))
      }
      out.push(boxAt(x + 0.24, y0 + 0.06, z + 0.3, 0.5, 0.02, 0.02, 0.7))
    })
    return out
  }, [])
  return <InstancedBoxes matrices={bars} material={rebarMat()} />
}

function Shutter({ x0, x1, y0, y1, z }: { x0: number; x1: number; y0: number; y1: number; z: number }) {
  return <B p={[(x0 + x1) / 2, (y0 + y1) / 2, z]} s={[x1 - x0, y1 - y0, 0.05]} m={shutterMat(+(x1 - x0).toFixed(2), +(y1 - y0).toFixed(2))} />
}

function Gates() {
  const closed = useStore((s) => s.gatesClosed)
  const bim = useStore((s) => s.bim)
  const z = HALF_D - 0.42
  const g1 = FRONT.gate1
  const g2 = FRONT.gate2
  const gy = g2.h - g2.grill
  const dl = GATE2_X - g2.door.w / 2
  const dr = GATE2_X + g2.door.w / 2
  const grill = useMemo(() => {
    const out: THREE.Matrix4[] = []
    for (let x = g2.x0 + 0.2; x < g2.x1 - 0.05; x += 0.21) out.push(boxAt(x, gy + g2.grill / 2, HALF_D - 0.3, 0.028, g2.grill, 0.028))
    for (let y = gy + 0.2; y < g2.h - 0.05; y += 0.21) out.push(boxAt(GATE2_X, y, HALF_D - 0.3, g2.x1 - g2.x0, 0.028, 0.028))
    out.push(boxAt(GATE2_X, gy + 0.04, HALF_D - 0.3, g2.x1 - g2.x0, 0.08, 0.06))
    out.push(boxAt(GATE2_X, g2.h - 0.03, HALF_D - 0.3, g2.x1 - g2.x0, 0.06, 0.06))
    return out
  }, [g2, gy])
  const guides = useMemo(
    () => [g1.x0, g1.x1, g2.x0, g2.x1].map((x, i) => boxAt(x + (i % 2 ? -0.04 : 0.04), (i < 2 ? g1.h : gy) / 2, z, 0.08, i < 2 ? g1.h : gy, 0.1)),
    [g1, g2, gy, z],
  )
  if (bim) return null
  return (
    <group>
      <InstancedBoxes matrices={grill} material={blackMat()} />
      <InstancedBoxes matrices={guides} material={darkSteelMat()} />
      {closed ? (
        <>
          <Shutter x0={g1.x0} x1={g1.x1} y0={0} y1={g1.h} z={z} />
          <Shutter x0={g2.x0} x1={dl} y0={0} y1={gy} z={z} />
          <Shutter x0={dr} x1={g2.x1} y0={0} y1={gy} z={z} />
          <Shutter x0={dl} x1={dr} y0={g2.door.h + 0.15} y1={gy} z={z} />
          <B p={[GATE2_X, (g2.door.h + 0.15) / 2, z - 0.005]} s={[g2.door.w, g2.door.h + 0.15, 0.04]} m={shutterMat(0.8, 1.85)} />
          {[
            [dl, (g2.door.h + 0.15) / 2, 0.04, g2.door.h + 0.15],
            [dr, (g2.door.h + 0.15) / 2, 0.04, g2.door.h + 0.15],
            [GATE2_X, g2.door.h + 0.15, g2.door.w + 0.04, 0.04],
          ].map(([x, y, w, h], i) => (
            <B key={i} p={[x, y, z + 0.04]} s={[w, h, 0.03]} m={darkSteelMat()} />
          ))}
          <B p={[dr - 0.12, 1.0, z + 0.06]} s={[0.04, 0.18, 0.04]} m={blackMat()} />
          <B p={[GATE1_X, 0.04, z + 0.03]} s={[g1.x1 - g1.x0, 0.08, 0.07]} m={darkSteelMat()} />
        </>
      ) : (
        <>
          <Shutter x0={g1.x0} x1={g1.x1} y0={g1.h - 0.32} y1={g1.h} z={z} />
          <Shutter x0={g2.x0} x1={g2.x1} y0={gy - 0.3} y1={gy} z={z} />
        </>
      )}
      {[
        [GATE1_X, g1.x1 - g1.x0, g1.h + 0.12],
        [GATE2_X, g2.x1 - g2.x0, gy - 0.1],
      ].map(([x, w, y], i) => (
        <mesh key={i} position={[x, y, IN_Z - 0.35]} rotation-z={Math.PI / 2} material={darkSteelMat()} castShadow>
          <cylinderGeometry args={[0.26, 0.26, w + 0.1, 20]} />
        </mesh>
      ))}
      <group position={[GATE2_X, gy + g2.grill / 2 - 0.02, HALF_D - 0.48]}>
        <B p={[0, 0, -0.03]} s={[2.75, 1.22, 0.06]} m={blackMat()} />
        <PhotoCrop name="sign" width={2.36} position={[0, 0, 0.005]} glow={0.6} />
      </group>
      <pointLight position={[GATE2_X, gy - 0.25, HALF_D - 0.9]} intensity={3} distance={4} color="#fff3dc" />
    </group>
  )
}

function FacadeDetails() {
  const bim = useStore((s) => s.bim)
  const gb = useMemo(() => new THREE.MeshStandardMaterial({ map: glassBlockTex(), roughness: 0.2, metalness: 0.1 }), [])
  const red = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b3261e', roughness: 0.5 }), [])
  const meter = useMemo(() => new THREE.MeshStandardMaterial({ color: '#bfc2c3', roughness: 0.5, metalness: 0.2 }), [])
  if (bim) return null
  const zf = HALF_D
  const { door, vent } = FRONT
  return (
    <group>
      <B p={[door.x, door.h / 2, zf - 0.12]} s={[door.w, door.h, 0.05]} m={blackMat()} />
      <B p={[door.x + 0.32, 1.05, zf - 0.08]} s={[0.03, 0.55, 0.04]} m={darkSteelMat()} />
      <B p={[vent.x, vent.y, zf - 0.16]} s={[vent.s, vent.s, 0.04]} m={blackMat()} />
      <B p={[-3.55, 3.1, zf + 0.06]} s={[0.48, 0.56, 0.12]} m={meter} />
      <B p={[-3.55, 1.45, zf + 0.005]} s={[0.9, 0.45, 0.02]} m={gb} />
      <B p={[-3.45, 0.72, zf + 0.07]} s={[0.4, 0.3, 0.14]} m={red} />
      <group position={[(FRONT.colMid.x0 + FRONT.colMid.x1) / 2, 1.7, zf + 0.06]}>
        <PhotoCrop name="posters" width={0.46} position={[0, 0, 0]} glow={0.3} />
      </group>
      <group position={[FRONT.gate2.x1 + 0.55, SIDEWALK.curb, zf + 0.75]} rotation-y={-0.3}>
        <group rotation-x={-0.12}>
          <B p={[0, 0.72, -0.01]} s={[0.82, 1.44, 0.04]} m={blackMat()} />
          <PhotoCrop name="chalk" height={1.36} position={[0, 0.74, 0.015]} glow={0.2} />
        </group>
      </group>
      {[-4.2, 0.0, 4.2].map((x) => (
        <mesh key={x} position={[x, FASCIA.y0 - 0.03, zf + 0.55]}>
          <boxGeometry args={[1.2, 0.04, 0.07]} />
          <meshStandardMaterial color="#ffffff" emissive="#f4f7ff" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function Exterior() {
  const playon = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cfccc6', map: repeated(concreteTex(), 3, 1.2), roughness: 0.9 }), [])
  const walk = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a39d91', map: repeated(sidewalkTex(), 4, 1.2), roughness: 0.95 }), [])
  const street = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8a8b89', map: repeated(asphaltTex(), 24, 2), roughness: 0.92 }), [])
  const pw = W + 2 * FASCIA.side
  const sd = SIDEWALK.z1 - SIDEWALK.z0
  const joints = useMemo(() => {
    const out: THREE.Matrix4[] = []
    for (let x = -pw / 2 + 2.5; x < pw / 2; x += 2.5) out.push(boxAt(x, SIDEWALK.curb + 0.002, SIDEWALK.z0 + sd / 2, 0.015, 0.004, sd))
    out.push(boxAt(0, SIDEWALK.curb + 0.002, SIDEWALK.z0 + sd / 2, pw, 0.004, 0.015))
    return out
  }, [pw, sd])
  const jm = useMemo(() => new THREE.MeshStandardMaterial({ color: '#77736c', roughness: 1 }), [])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#8f8c86" roughness={1} />
      </mesh>
      <B p={[0, SIDEWALK.curb / 2, SIDEWALK.z0 + sd / 2]} s={[pw, SIDEWALK.curb, sd]} m={playon} cast={false} />
      <InstancedBoxes matrices={joints} material={jm} castShadow={false} />
      {[-1, 1].map((s) => (
        <B key={s} p={[s * (pw / 2 + 6), 0.05, SIDEWALK.z0 + sd / 2]} s={[12, 0.1, sd]} m={walk} cast={false} />
      ))}
      <B p={[0, SIDEWALK.curb / 2, SIDEWALK.z1 - 0.08]} s={[pw + 24, SIDEWALK.curb + 0.02, 0.16]} m={playon} cast={false} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, (STREET.z0 + STREET.z1) / 2]} receiveShadow material={street}>
        <planeGeometry args={[160, STREET.z1 - STREET.z0]} />
      </mesh>
      <group position={[-HALF_W - 1.4, 0, SIDEWALK.z1 - 0.45]}>
        <mesh position-y={4.5} castShadow material={columnMat()}>
          <cylinderGeometry args={[0.12, 0.19, 9, 12]} />
        </mesh>
        <B p={[0, 8.4, 0]} s={[1.6, 0.1, 0.1]} m={columnMat()} />
      </group>
      {[7.4, 7.9, 8.3].map((y, i) => (
        <mesh key={i} position={[0, y, SIDEWALK.z1 - 0.45 + i * 0.12]} rotation-z={Math.PI / 2} material={rubberMat()}>
          <cylinderGeometry args={[0.012, 0.012, 160, 4]} />
        </mesh>
      ))}
    </group>
  )
}

function Neighbors() {
  const white = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e2dfd8', map: repeated(concreteTex(), 2, 1), roughness: 0.95 }), [])
  const grey = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c9c4ba', map: repeated(concreteTex(), 2, 1), roughness: 0.95 }), [])
  const rust = useMemo(() => new THREE.MeshStandardMaterial({ map: repeated(rustTex(), 2.2, 1), roughness: 0.8, metalness: 0.35 }), [])
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ map: repeated(stoneTex(), 4, 1), roughness: 0.95 }), [])
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6b4027', roughness: 0.8 }), [])
  const shutterRed = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a8402a', roughness: 0.7 }), [])
  const glassD = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1d2326', roughness: 0.15, metalness: 0.6 }), [])
  const zf = HALF_D
  const brick = (w: number, h: number) => wallMat(w, h)
  return (
    <group>
      <B p={[-9.1, 1.5, 9.5]} s={[5.0, 3.0, 11]} m={white} />
      <B p={[-9.1, 3.06, 10]} s={[5.2, 0.12, 12]} m={roofMat()} />
      <B p={[-9.9, 1.6, zf + 0.02]} s={[1.1, 1.2, 0.06]} m={blackMat()} />
      <B p={[-9.9, 1.6, zf + 0.06]} s={[0.95, 1.05, 0.02]} m={glassD} />
      <B p={[-7.6, 1.05, zf + 0.03]} s={[0.9, 2.1, 0.06]} m={blackMat()} />
      <B p={[-9.1, 0.18, zf + 0.04]} s={[5.0, 0.36, 0.04]} m={grey} />
      <B p={[-14.55, 1.45, 8.5]} s={[5.9, 2.9, 13]} m={grey} />
      <B p={[-14.55, 4.0, 8.5]} s={[5.9, 2.2, 13]} m={brick(5.9, 2.2)} />
      <B p={[-14.55, 5.16, 8.5]} s={[6.0, 0.12, 13.1]} m={grey} />
      <B p={[-13.4, 1.05, zf + 0.03]} s={[0.9, 2.1, 0.06]} m={wood} />
      <mesh position={[-15.6, 5.55, 11]} material={white} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.9, 16]} />
      </mesh>
      <B p={[8.0, 1.1, zf - 0.02]} s={[2.8, 2.2, 0.05]} m={rust} />
      <B p={[8.0, 2.22, zf - 0.02]} s={[2.9, 0.06, 0.08]} m={darkSteelMat()} />
      <B p={[8.0, 1.1, 9.5]} s={[2.8, 2.2, 10.9]} m={grey} />
      <B p={[13.45, 0.45, zf - 0.02]} s={[8.1, 0.9, 0.08]} m={stone} />
      <B p={[13.45, 2.0, 9]} s={[8.1, 4.0, 12]} m={brick(8.1, 4)} />
      <B p={[13.45, 2.45, zf + 0.03]} s={[8.1, 0.2, 0.1]} m={grey} />
      <B p={[13.45, 4.06, 9]} s={[8.2, 0.12, 12.1]} m={grey} />
      <B p={[8.0, 2.26, 9.5]} s={[2.9, 0.1, 11]} m={grey} />
      <B p={[11.9, 1.75, zf + 0.04]} s={[1.1, 1.2, 0.05]} m={shutterRed} />
      {[
        [-12.05, -6.5, 9.85],
        [12.05, -6.5, 9.85],
      ].map(([x, z, w], i) => (
        <group key={i}>
          <B p={[x, 1.4, z]} s={[w, 2.8, 16]} m={brick(w, 2.8)} />
          <B p={[x, 2.86, z]} s={[w + 0.2, 0.1, 16.2]} m={roofMat()} />
        </group>
      ))}
    </group>
  )
}

export function Shell() {
  return (
    <group>
      <Floor />
      <Walls />
      <Structure />
      <Gates />
      <FacadeDetails />
      <Exterior />
      <Neighbors />
    </group>
  )
}
