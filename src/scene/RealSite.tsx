import { useTexture } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  BEV_PALLETS, COL_Z, CRATE_WALL, IN_X, IN_Z, MEZZ, OFFICE, PHOTOS, photoSrc, PICKUP, SALON, SHELF_RUN, SLAB_Y, STACKER, STAIRS, type PhotoKey,
} from '../data'
import { boxMat, columnMat, concreteBeamMat, darkSteelMat, glassMat, palletMat, plankMat, rackBeamMat, rackUprightMat, rubberMat, shutterMat, wallMat, whiteMat, yellowMat } from '../materials'
import { useStore } from '../store'
import { crateTex, offerTex } from '../textures'
import { InstancedBoxes, boxAt } from './Instanced'
import { LightPanel } from './Panel'

const photoUrl = photoSrc

function PhotoMural({ photo, position, rotationY = 0, height = 2.2 }: { photo: PhotoKey; position: [number, number, number]; rotationY?: number; height?: number }) {
  const tex = useTexture(photoUrl(photo), (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
  })
  const img = tex.image as { width: number; height: number } | undefined
  const aspect = img ? img.width / img.height : 0.45
  const w = height * aspect
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh material={darkSteelMat()} castShadow>
        <boxGeometry args={[w + 0.14, height + 0.5, 0.08]} />
      </mesh>
      <mesh position={[0, 0.2, 0.045]}>
        <planeGeometry args={[w, height]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.35} roughness={0.5} toneMapped={false} />
      </mesh>
      <LightPanel id={`cap-${photo}`} lines={['FOTO REAL', PHOTOS[photo].short]} style="zone" size={[w, 0.26]} position={[0, -height / 2 + 0.03, 0.01]} frame={false} glow={0.9} res={[640, 166]} />
    </group>
  )
}

type Crop = [number, number, number, number]
const CROPS = {
  sign: ['ext_8', [243, 229, 943, 580]],
  posters: ['ext_8', [586, 1017, 903, 1300]],
  chalk: ['ext_8', [897, 929, 1143, 1443]],
  crates: ['ext_8', [0, 536, 229, 1600]],
  atencion: ['sal_4', [729, 954, 1011, 1200]],
  filmando: ['sal_4', [1185, 835, 1290, 1040]],
  lucky: ['sal_4', [957, 193, 1357, 471]],
  personal: ['sal_4', [1021, 1030, 1207, 1200]],
  freezer: ['sal_5', [0, 971, 450, 1543]],
  fridge: ['sal_5', [455, 590, 620, 1157]],
} satisfies Record<string, [PhotoKey, Crop]>

function useCrop(name: keyof typeof CROPS) {
  const [photo, [x0, y0, x1, y1]] = CROPS[name]
  const base = useTexture(photoUrl(photo))
  return useMemo(() => {
    const img = base.image as { width: number; height: number }
    const t = base.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.repeat.set((x1 - x0) / img.width, (y1 - y0) / img.height)
    t.offset.set(x0 / img.width, 1 - y1 / img.height)
    t.needsUpdate = true
    return { tex: t, aspect: (x1 - x0) / (y1 - y0) }
  }, [base, x0, y0, x1, y1])
}

export function PhotoCrop({ name, height, width, position, rotationY = 0, glow = 0.3 }: { name: keyof typeof CROPS; height?: number; width?: number; position: [number, number, number]; rotationY?: number; glow?: number }) {
  const { tex, aspect } = useCrop(name)
  const h = height ?? (width ?? 1) / aspect
  const w = width ?? h * aspect
  return (
    <mesh position={position} rotation-y={rotationY}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={glow} roughness={0.7} toneMapped={false} />
    </mesh>
  )
}


const QUILMES = new THREE.Color('#1d5eaa')
const COCA = new THREE.Color('#c3202b')
const crateMatShared = () => {
  const g = globalThis as unknown as { __crateMat?: THREE.MeshStandardMaterial }
  g.__crateMat ??= new THREE.MeshStandardMaterial({ map: crateTex(), roughness: 0.5 })
  return g.__crateMat
}

function BevPallets() {
  const { pal, cm, cc } = useMemo(() => {
    const pal: THREE.Matrix4[] = []
    const cm: THREE.Matrix4[] = []
    const cc: THREE.Color[] = []
    BEV_PALLETS.forEach(([x, z], i) => {
      const brand = i % 5 === 2 || i % 7 === 0 ? COCA : QUILMES
      for (const level of [0, 1]) {
        const y0 = level * 1.3
        pal.push(boxAt(x, y0 + 0.07, z, 1.2, 0.14, 1.0))
        const layers = level === 0 ? 3 : 2 + ((i * 3) % 3 === 0 ? 1 : 0)
        for (let ly = 0; ly < layers; ly++)
          for (let ix = 0; ix < 2; ix++)
            for (let iz = 0; iz < 3; iz++) {
              cm.push(boxAt(x - 0.29 + ix * 0.58, y0 + 0.14 + 0.155 + ly * 0.37, z - 0.32 + iz * 0.32, 0.56, 0.36, 0.31))
              cc.push(level === 1 && ly === layers - 1 && i % 4 === 1 ? COCA : brand)
            }
      }
    })
    return { pal, cm, cc }
  }, [])
  return (
    <group>
      <InstancedBoxes matrices={pal} material={palletMat()} />
      <InstancedBoxes matrices={cm} colors={cc} material={crateMatShared()} />
    </group>
  )
}

function CrateWall() {
  const { m, c } = useMemo(() => {
    const m: THREE.Matrix4[] = []
    const c: THREE.Color[] = []
    const { x0, x1, z0, z1 } = CRATE_WALL
    let k = 0
    for (let z = z0 + 0.25; z < z1 - 0.2; z += 0.5) {
      const layers = 4 + (k % 3)
      for (let ix = 0; ix < 2; ix++)
        for (let ly = 0; ly < layers; ly++) {
          m.push(boxAt(x0 + 0.22 + ix * 0.4, 0.16 + ly * 0.31, z, 0.38, 0.3, 0.48))
          c.push(Math.floor(z / 2.5) % 3 === 0 ? COCA : QUILMES)
        }
      k++
    }
    void x1
    return { m, c }
  }, [])
  return <InstancedBoxes matrices={m} colors={c} material={crateMatShared()} />
}

function RackSection({ z0, z1, seed }: { z0: number; z1: number; seed: number }) {
  const x = -IN_X + 0.48
  const { frame, beams, boxes } = useMemo(() => {
    const frame: THREE.Matrix4[] = []
    const beams: THREE.Matrix4[] = []
    const boxes: THREE.Matrix4[] = []
    const n = Math.max(1, Math.round((z1 - z0) / 2.2))
    const bay = (z1 - z0) / n
    for (let i = 0; i <= n; i++) for (const dx of [-0.42, 0.42]) frame.push(boxAt(x + dx, 1.25, z0 + i * bay, 0.07, 2.5, 0.07))
    let r = seed
    const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647)
    for (const y of [0.12, 1.0, 1.85]) {
      for (const dx of [-0.42, 0.42]) beams.push(boxAt(x + dx, y, (z0 + z1) / 2, 0.06, 0.1, z1 - z0))
      for (let zz = z0 + 0.35; zz < z1 - 0.3; zz += 0.62) if (rnd() > 0.2) {
        const h = 0.3 + rnd() * 0.38
        boxes.push(boxAt(x + (rnd() - 0.5) * 0.12, y + 0.05 + h / 2, zz, 0.7, h, 0.5))
      }
    }
    return { frame, beams, boxes }
  }, [x, z0, z1, seed])
  return (
    <group>
      <InstancedBoxes matrices={frame} material={rackUprightMat()} />
      <InstancedBoxes matrices={beams} material={rackBeamMat()} />
      <InstancedBoxes matrices={boxes} material={boxMat(seed % 2 ? 1 : 0)} />
    </group>
  )
}

function ShelfRun() {
  const { z0, z1 } = SHELF_RUN
  const parts: [number, number, 'wood' | 'rack'][] = [
    [z0, -4.1, 'wood'],
    [-3.9, 0.6, 'rack'],
    [0.8, 5.1, 'wood'],
    [5.3, z1, 'rack'],
  ]
  return (
    <group>
      {parts.map(([a, b, t], i) =>
        t === 'wood' ? (
          <group key={i}>
            <Shelving position={[-IN_X + 0.24, 0, (a + b) / 2]} rotationY={Math.PI / 2} width={b - a} white={false} seed={50 + i} bottles={i === 2} />
            <Shelving position={[-IN_X + 0.24, 2.05, (a + b) / 2]} rotationY={Math.PI / 2} width={b - a} white={false} seed={70 + i} bottles={false} />
          </group>
        ) : (
          <RackSection key={i} z0={a} z1={b} seed={90 + i} />
        ),
      )}
    </group>
  )
}

function Wainscot() {
  const bim = useStore((s) => s.bim)
  const boards = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5f6366', metalness: 0.3, roughness: 0.6 }), [])
  if (bim) return null
  const h = 2.9
  const z0 = SHELF_RUN.z0 - 0.4
  const z1 = OFFICE.z0
  return (
    <group>
      <mesh position={[-IN_X + 0.01, h / 2, (z0 + z1) / 2]} rotation-y={Math.PI / 2} material={plankMat(8, 1.4)} receiveShadow>
        <planeGeometry args={[z1 - z0, h]} />
      </mesh>
      {[-1.5, 3.6].map((z) => (
        <mesh key={z} position={[-IN_X + 0.08, 3.4, z]} material={boards} castShadow>
          <boxGeometry args={[0.12, 0.6, 0.45]} />
        </mesh>
      ))}
    </group>
  )
}

function Office() {
  const bim = useStore((s) => s.bim)
  const { x0, x1, z0, z1, h, doorZ } = OFFICE
  const t = 0.1
  const wood = plankMat(3, 1.2)
  const winZ: [number, number] = [12.5, 13.8]
  const east: [number, number, number, number][] = [
    [z0, doorZ[0], 0, h],
    [doorZ[1], winZ[0], 0, h],
    [winZ[1], z1, 0, h],
    [winZ[0], winZ[1], 0, 1.0],
    [winZ[0], winZ[1], 1.95, h],
    [doorZ[0], doorZ[1], 2.15, h],
  ]
  if (bim) return null
  return (
    <group>
      <mesh position={[(x0 + x1) / 2, h / 2, z0]} material={wood} castShadow receiveShadow>
        <boxGeometry args={[x1 - x0, h, t]} />
      </mesh>
      {east.map(([a, b, y0, y1], i) => (
        <mesh key={i} position={[x1, (y0 + y1) / 2, (a + b) / 2]} material={wood} castShadow receiveShadow>
          <boxGeometry args={[t, y1 - y0, b - a]} />
        </mesh>
      ))}
      <mesh position={[x1, 1.475, (winZ[0] + winZ[1]) / 2]} material={glassMat()}>
        <boxGeometry args={[0.02, 0.95, winZ[1] - winZ[0]]} />
      </mesh>
      <mesh position={[(x0 + x1) / 2, h + 0.03, (z0 + z1) / 2]} material={wood} castShadow>
        <boxGeometry args={[x1 - x0, 0.06, z1 - z0]} />
      </mesh>
      <mesh position={[x1 + 0.42, 1.05, doorZ[0] + 0.05]} rotation-y={-1.2} material={plankMat(1, 1)} castShadow>
        <boxGeometry args={[0.95, 2.1, 0.05]} />
      </mesh>
      <mesh position={[-5.8, 0.38, 13.4]} material={plankMat(2, 1)} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.76, 1.6]} />
      </mesh>
      <mesh position={[-6.0, 0.98, 13.2]} material={darkSteelMat()}>
        <boxGeometry args={[0.05, 0.36, 0.55]} />
      </mesh>
      <mesh position={[-5.75, 0.82, 13.9]} material={whiteMat()}>
        <boxGeometry args={[0.4, 0.12, 0.35]} />
      </mesh>
      <pointLight position={[-4.6, 2.55, 12.3]} intensity={5} distance={6} decay={1.6} color="#fff1dc" />
    </group>
  )
}

function Salon() {
  const bim = useStore((s) => s.bim)
  const { x0, x1, z0, z1, h, openX } = SALON
  const fridgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c41820', metalness: 0.3, roughness: 0.4 }), [])
  const candy = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f5b83d', roughness: 0.5 }), [])
  const wood = plankMat(4, 1.2)
  return (
    <group>
      {!bim && (
        <>
          <mesh position={[x0, h / 2, (z0 + z1) / 2]} material={wood} castShadow receiveShadow>
            <boxGeometry args={[0.1, h, z1 - z0]} />
          </mesh>
          <mesh position={[x0, (h + SLAB_Y) / 2, (z0 + z1) / 2]} material={wallMat(z1 - z0, SLAB_Y - h)}>
            <boxGeometry args={[0.1, SLAB_Y - h, z1 - z0]} />
          </mesh>
          {[
            [x0, openX[0], 0, h],
            [openX[1], x1, 0, h],
            [openX[0], openX[1], 2.2, h],
          ].map(([a, b, y0, y1], i) => (
            <mesh key={i} position={[(a + b) / 2, (y0 + y1) / 2, z0]} material={wood} castShadow receiveShadow>
              <boxGeometry args={[b - a, y1 - y0, 0.1]} />
            </mesh>
          ))}
          <mesh position={[(x0 + x1) / 2, (h + SLAB_Y) / 2, z0]} material={wallMat(x1 - x0, SLAB_Y - h)}>
            <boxGeometry args={[x1 - x0, SLAB_Y - h, 0.1]} />
          </mesh>
          <mesh position={[(x0 + x1) / 2, h, (z0 + z1) / 2]} rotation-x={Math.PI / 2} material={plankMat(3, 4)}>
            <planeGeometry args={[x1 - x0, z1 - z0]} />
          </mesh>
          {[10.6, 13.0].map((z) => (
            <mesh key={z} position={[4.2, h - 0.02, z]}>
              <boxGeometry args={[0.6, 0.03, 0.6]} />
              <meshStandardMaterial color="#ffffff" emissive="#f6f8ff" emissiveIntensity={2} toneMapped={false} />
            </mesh>
          ))}
        </>
      )}
      <pointLight position={[4.2, 2.7, 11.8]} intensity={9} distance={8} decay={1.6} color="#f4f6ff" />
      {[13.4, 12.62, 11.84].map((z) => (
        <group key={z} position={[IN_X - 0.4, 0, z]} rotation-y={-Math.PI / 2}>
          <mesh position-y={1.0} material={fridgeMat} castShadow>
            <boxGeometry args={[0.74, 2.0, 0.7]} />
          </mesh>
          <PhotoCrop name="fridge" height={1.75} position={[0, 1.0, 0.356]} glow={0.55} />
        </group>
      ))}
      <group position={[IN_X - 0.4, 0, 10.4]} rotation-y={-Math.PI / 2}>
        <mesh position-y={0.42} material={whiteMat()} castShadow>
          <boxGeometry args={[1.3, 0.84, 0.7]} />
        </mesh>
        <PhotoCrop name="freezer" height={0.84} position={[0, 0.42, 0.356]} glow={0.3} />
        <mesh position-y={0.87} material={glassMat()}>
          <boxGeometry args={[1.26, 0.08, 0.66]} />
        </mesh>
      </group>
      <Shelving position={[x0 + 0.3, 0, 11.7]} rotationY={Math.PI / 2} width={5.0} white seed={23} bottles />
      <group position={[4.9, 0, 9.0]}>
        <mesh position-y={0.55} material={plankMat(2, 1)} castShadow receiveShadow>
          <boxGeometry args={[2.5, 1.1, 0.72]} />
        </mesh>
        <mesh position={[0, 1.13, 0]} material={whiteMat()}>
          <boxGeometry args={[2.55, 0.05, 0.78]} />
        </mesh>
        <PhotoCrop name="atencion" height={0.72} position={[-0.6, 0.52, 0.37]} glow={0.3} />
        <PhotoCrop name="personal" height={0.48} position={[0.35, 0.6, 0.37]} glow={0.3} />
        <group position={[0.95, 0.62, 0.37]}>
          <PhotoCrop name="filmando" height={0.42} position={[0, 0, 0]} glow={0.35} />
        </group>
        {[-0.62, 0.62].map((dx) => (
          <mesh key={dx} position={[dx, 1.65, 0.1]} material={glassMat()}>
            <boxGeometry args={[1.15, 0.95, 0.015]} />
          </mesh>
        ))}
        <mesh position={[0.2, 1.22, -0.05]} material={whiteMat()}>
          <boxGeometry args={[0.4, 0.12, 0.36]} />
        </mesh>
        <group position={[0, 2.55, -0.15]}>
          <mesh material={darkSteelMat()}>
            <boxGeometry args={[1.12, 0.82, 0.1]} />
          </mesh>
          <PhotoCrop name="lucky" width={1.02} position={[0, 0, 0.055]} glow={0.85} />
        </group>
      </group>
      <group position={[3.15, 0, 9.75]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 0.25 + i * 0.22, 0]} material={i % 2 ? glassMat() : candy}>
            <boxGeometry args={[0.5, 0.18, 0.32]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Stairs() {
  const { x0, x1, zBottom, zTop, h } = STAIRS
  const steps = 13
  const rise = h / steps
  const run = (zBottom - zTop) / steps
  const m = useMemo(() => {
    const out: THREE.Matrix4[] = []
    for (let i = 0; i < steps; i++) {
      const y = rise * (i + 1)
      out.push(boxAt((x0 + x1) / 2, y / 2, zBottom - run * (i + 0.5), x1 - x0, y, run))
    }
    return out
  }, [x0, x1, zBottom, rise, run])
  const rail = useMemo(() => {
    const out: THREE.Matrix4[] = []
    const xr = x1 - 0.04
    for (let i = 0; i <= steps; i += 3) out.push(boxAt(xr, rise * i + 0.5, zBottom - run * i, 0.04, 1, 0.04))
    const len = Math.hypot(zBottom - zTop, h)
    out.push(
      new THREE.Matrix4().compose(
        new THREE.Vector3(xr, h / 2 + 1, (zBottom + zTop) / 2),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.atan2(h, zBottom - zTop), 0, 0)),
        new THREE.Vector3(0.05, 0.05, len),
      ),
    )
    out.push(boxAt((MEZZ.x0 + MEZZ.x1) / 2 + (x1 - MEZZ.x0) / 2, MEZZ.y + 1.0, MEZZ.z1 - 0.04, MEZZ.x1 - x1, 0.05, 0.05))
    out.push(boxAt(MEZZ.x1 - 0.04, MEZZ.y + 1.0, (MEZZ.z0 + MEZZ.z1) / 2, 0.05, 0.05, MEZZ.z1 - MEZZ.z0))
    for (let x = x1 + 0.3; x < MEZZ.x1; x += 0.6) out.push(boxAt(x, MEZZ.y + 0.5, MEZZ.z1 - 0.04, 0.04, 1, 0.04))
    for (let z = MEZZ.z0 + 0.3; z < MEZZ.z1; z += 0.6) out.push(boxAt(MEZZ.x1 - 0.04, MEZZ.y + 0.5, z, 0.04, 1, 0.04))
    return out
  }, [x1, zBottom, zTop, h, rise, run])
  const storage = useMemo(() => {
    const out: THREE.Matrix4[] = []
    for (let i = 0; i < 5; i++) out.push(boxAt(MEZZ.x0 + 0.9 + i * 0.85, MEZZ.y + 0.32, MEZZ.z0 + 0.6, 0.7, 0.6, 0.55))
    for (let i = 0; i < 3; i++) out.push(boxAt(MEZZ.x0 + 1.2 + i * 0.85, MEZZ.y + 0.32, MEZZ.z0 + 1.5, 0.7, 0.6, 0.55))
    return out
  }, [])
  return (
    <group>
      <InstancedBoxes matrices={m} material={concreteBeamMat()} />
      <InstancedBoxes matrices={rail} material={darkSteelMat()} />
      <mesh position={[(MEZZ.x0 + MEZZ.x1) / 2, MEZZ.y - 0.1, (MEZZ.z0 + MEZZ.z1) / 2]} material={concreteBeamMat()} castShadow receiveShadow>
        <boxGeometry args={[MEZZ.x1 - MEZZ.x0, 0.2, MEZZ.z1 - MEZZ.z0]} />
      </mesh>
      <mesh position={[MEZZ.x1 - 0.15, (MEZZ.y - 0.2) / 2, MEZZ.z1 - 0.15]} material={columnMat()} castShadow>
        <boxGeometry args={[0.3, MEZZ.y - 0.2, 0.3]} />
      </mesh>
      <InstancedBoxes matrices={storage} material={boxMat(1)} />
    </group>
  )
}

function Stacker() {
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e0441d', roughness: 0.45, metalness: 0.2 }), [])
  const label = useMemo(() => new THREE.MeshStandardMaterial({ map: offerTex('wiebel', ['WIEBEL'], '#e0441d', '#ffffff'), roughness: 0.5 }), [])
  const crates = useMemo(() => {
    const out: THREE.Matrix4[] = []
    for (let ly = 0; ly < 5; ly++) for (const dx of [-0.2, 0.2]) for (const dz of [-0.45, -0.95]) out.push(boxAt(dx, 0.3 + ly * 0.31, dz, 0.38, 0.3, 0.48))
    return out
  }, [])
  const blue = useMemo(() => [...Array(20)].map(() => QUILMES), [])
  return (
    <group position={[STACKER.x, 0, STACKER.z]} rotation-y={STACKER.rotY}>
      <mesh position={[0, 0.55, 0.35]} material={body} castShadow receiveShadow>
        <boxGeometry args={[0.8, 1.0, 0.75]} />
      </mesh>
      <mesh position={[0, 0.65, 0.735]} material={label}>
        <planeGeometry args={[0.7, 0.32]} />
      </mesh>
      <mesh position={[0, 1.08, 0.35]} material={rubberMat()}>
        <boxGeometry args={[0.82, 0.06, 0.77]} />
      </mesh>
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 1.35, 0.0]} material={darkSteelMat()} castShadow>
          <boxGeometry args={[0.1, 2.5, 0.12]} />
        </mesh>
      ))}
      <mesh position={[0, 2.55, 0.0]} material={darkSteelMat()}>
        <boxGeometry args={[0.72, 0.08, 0.12]} />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.08, -0.65]} material={darkSteelMat()} castShadow>
          <boxGeometry args={[0.12, 0.06, 1.15]} />
        </mesh>
      ))}
      <mesh position={[0, 1.15, 0.85]} rotation-x={0.6} material={darkSteelMat()}>
        <boxGeometry args={[0.05, 0.9, 0.05]} />
      </mesh>
      <InstancedBoxes matrices={crates} colors={blue} material={crateMatShared()} />
    </group>
  )
}

function Despacho() {
  const bim = useStore((s) => s.bim)
  return (
    <group>
      <mesh position={[-0.7, 0.45, -12.1]} material={plankMat(2, 1)} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 1.0]} />
      </mesh>
      <mesh position={[-1.3, 0.98, -12.2]} material={boxMat(0)} castShadow>
        <boxGeometry args={[0.5, 0.18, 0.4]} />
      </mesh>
      <group position={[0.8, 0, -9.6]} rotation-y={0.4}>
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 0.06, -0.55]} material={yellowMat()} castShadow>
            <boxGeometry args={[0.16, 0.08, 1.15]} />
          </mesh>
        ))}
        <mesh position={[0, 0.65, 0.1]} rotation-x={0.25} material={darkSteelMat()}>
          <boxGeometry args={[0.05, 1.1, 0.05]} />
        </mesh>
      </group>
      {!bim && (
        <mesh position={[1.2, 1.8, -IN_Z + 0.04]} material={shutterMat(3.6, 3.6)} castShadow>
          <boxGeometry args={[3.6, 3.6, 0.05]} />
        </mesh>
      )}
      <LightPanel id="desp" lines={['DESPACHO', 'Carga y descarga · Vehículos']} style="zone" size={[2.4, 0.6]} position={[1.2, 3.95, -IN_Z + 0.1]} glow={0.8} res={[900, 225]} />
    </group>
  )
}

function Lamps() {
  return (
    <group>
      {[11, 5.5, 0, -5.5, -11].map((z) => (
        <group key={z}>
          <mesh position={[-1.0, SLAB_Y - BEAM_TOP, z + 2.5]}>
            <boxGeometry args={[1.2, 0.05, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive="#f4f7ff" emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
          <pointLight position={[-1.0, SLAB_Y - 0.4, z + 2.5]} intensity={14} distance={13} decay={1.5} color="#f3f5f8" />
        </group>
      ))}
    </group>
  )
}
const BEAM_TOP = 0.06

export function RealSite() {
  return (
    <group>
      <Wainscot />
      <ShelfRun />
      <BevPallets />
      <CrateWall />
      <Office />
      <Salon />
      <Stairs />
      <Van />
      <Stacker />
      <Despacho />
      <Lamps />
      <PhotoMural photo="gal_1" position={[IN_X - 0.06, 3.35, -1.8]} rotationY={-Math.PI / 2} height={1.25} />
      <PhotoMural photo="rel_4" position={[-3.4, 3.2, -IN_Z + 0.06]} height={1.25} />
    </group>
  )
}
void COL_Z

function Van() {
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f2f3f1', metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 }), [])
  const tint = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0e1216', metalness: 0.9, roughness: 0.08 }), [])
  const trim = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3b4046', roughness: 0.6 }), [])
  const lamp = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff6dd', emissiveIntensity: 1.2 }), [])
  const tail = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff2a2a', emissive: '#ff1a1a', emissiveIntensity: 0.6 }), [])
  const { x, z, rotY } = PICKUP
  return (
    <group position={[x, 0, z]} rotation-y={rotY}>
      <mesh position={[-0.35, 1.5, 0]} material={paint} castShadow receiveShadow>
        <boxGeometry args={[5.0, 2.1, 1.98]} />
      </mesh>
      <mesh position={[2.65, 0.98, 0]} material={paint} castShadow>
        <boxGeometry args={[1.3, 1.05, 1.94]} />
      </mesh>
      <mesh position={[2.42, 1.95, 0]} rotation-z={-0.62} material={tint}>
        <boxGeometry args={[0.05, 1.25, 1.84]} />
      </mesh>
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <mesh position={[1.7, 1.95, sd * 0.995]} material={tint}>
            <boxGeometry args={[0.9, 0.6, 0.02]} />
          </mesh>
          <mesh position={[-0.6, 1.95, sd * 0.995]} material={tint}>
            <boxGeometry args={[2.6, 0.5, 0.02]} />
          </mesh>
        </group>
      ))}
      <mesh position={[3.31, 0.88, 0]} material={trim}>
        <boxGeometry args={[0.04, 0.5, 1.2]} />
      </mesh>
      <mesh position={[3.3, 0.45, 0]} material={trim} castShadow>
        <boxGeometry args={[0.16, 0.3, 2.0]} />
      </mesh>
      {[-0.78, 0.78].map((s2) => (
        <mesh key={s2} position={[3.31, 1.18, s2]} material={lamp}>
          <boxGeometry args={[0.03, 0.14, 0.3]} />
        </mesh>
      ))}
      {[-0.85, 0.85].map((s2) => (
        <mesh key={s2} position={[-2.86, 1.3, s2]} material={tail}>
          <boxGeometry args={[0.03, 0.5, 0.14]} />
        </mesh>
      ))}
      <mesh position={[-2.86, 0.45, 0]} material={trim} castShadow>
        <boxGeometry args={[0.14, 0.3, 2.0]} />
      </mesh>
      {[-1.95, 2.25].map((wx) =>
        [-0.86, 0.86].map((wz) => (
          <group key={`${wx}${wz}`} position={[wx, 0.38, wz]} rotation-x={Math.PI / 2}>
            <mesh material={rubberMat()} castShadow>
              <cylinderGeometry args={[0.38, 0.38, 0.28, 24]} />
            </mesh>
            <mesh position-y={wz > 0 ? 0.142 : -0.142} material={darkSteelMat()}>
              <cylinderGeometry args={[0.22, 0.22, 0.02, 12]} />
            </mesh>
          </group>
        )),
      )}
    </group>
  )
}

function ShelfProducts({ position, rotationY, width, levels, seed, bottles }: { position: [number, number, number]; rotationY: number; width: number; levels: number[]; seed: number; bottles: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const items = useMemo(() => {
    const out: { m: THREE.Matrix4; c: THREE.Color }[] = []
    const pal = bottles ? ['#ec6fa8', '#7ab8f5', '#f59b2a', '#8fd9a8', '#b38df0', '#f3f3f3', '#47c1d6'] : ['#e05a2b', '#f2c230', '#c62828', '#2e7d32', '#f5f0e6', '#8d4f2b']
    let s = seed
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    levels.forEach((y) => {
      let x = -width / 2 + 0.08
      while (x < width / 2 - 0.1) {
        const w = bottles ? 0.1 + rnd() * 0.05 : 0.16 + rnd() * 0.1
        const h = bottles ? 0.24 + rnd() * 0.12 : 0.18 + rnd() * 0.16
        const c = new THREE.Color(pal[Math.floor(rnd() * pal.length)])
        for (const dz of [-0.1, 0.06]) out.push({ m: boxAt(x + w / 2, y + h / 2, dz, w * 0.9, h, bottles ? w * 0.9 : 0.14), c })
        x += w + 0.02
      }
    })
    return out
  }, [width, levels, seed, bottles])
  useLayoutEffect(() => {
    const im = ref.current
    if (!im) return
    items.forEach((it, i) => {
      im.setMatrixAt(i, it.m)
      im.setColorAt(i, it.c)
    })
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
  }, [items])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: bottles ? 0.3 : 0.7 }), [bottles])
  return (
    <group position={position} rotation-y={rotationY}>
      <instancedMesh ref={ref} args={[undefined, undefined, items.length]} material={mat} castShadow>
        <boxGeometry />
      </instancedMesh>
    </group>
  )
}

function Shelving({ position, rotationY, width, white, seed, bottles }: { position: [number, number, number]; rotationY: number; width: number; white: boolean; seed: number; bottles: boolean }) {
  const levels = [0.12, 0.62, 1.12, 1.62]
  const mat = white ? whiteMat() : plankMat(2, 1)
  const m = useMemo(() => {
    const out: THREE.Matrix4[] = []
    levels.forEach((y) => out.push(boxAt(0, y, 0, width, 0.03, 0.42)))
    ;[-width / 2, width / 2].forEach((x) => out.push(boxAt(x, 1.0, 0, 0.04, 2.0, 0.42)))
    out.push(boxAt(0, 1.0, -0.2, width, 2.0, 0.02))
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width])
  return (
    <group>
      <group position={position} rotation-y={rotationY}>
        <InstancedBoxes matrices={m} material={mat} />
      </group>
      <ShelfProducts position={position} rotationY={rotationY} width={width} levels={levels.map((y) => y + 0.015)} seed={seed} bottles={bottles} />
    </group>
  )
}

