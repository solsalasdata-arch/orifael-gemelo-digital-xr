import { useTexture } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { EAVE, ENTRANCE, HALF_D, HALF_W, PHOTOS, photoSrc, PICKUP, STAIRS, BEV_PALLETS, WALL_T, type PhotoKey } from '../data'
import {
  bimSolidMat, concreteBeamMat, darkSteelMat, glassMat, palletMat, plankMat, plasterMat, rubberMat, shutterMat, whiteMat, columnMat,
} from '../materials'
import { useStore } from '../store'
import { bevPackTex } from '../textures'
import { InstancedBoxes, boxAt } from './Instanced'
import { LightPanel } from './Zones'

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

function PhotoCrop({ name, height, width, position, rotationY = 0, glow = 0.3 }: { name: keyof typeof CROPS; height?: number; width?: number; position: [number, number, number]; rotationY?: number; glow?: number }) {
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

function Facade() {
  const bim = useStore((s) => s.bim)
  const zf = HALF_D + WALL_T + 0.012
  const top = EAVE + 0.25
  const crateMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f3f66', roughness: 0.6 }), [])
  const yellowBoxMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f2c230', roughness: 0.8 }), [])
  const sideW = HALF_W + WALL_T - ENTRANCE.w / 2
  return (
    <group>
      {!bim && (
        <>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (ENTRANCE.w / 2 + sideW / 2), top / 2, zf]} material={plasterMat(sideW, top)} receiveShadow>
              <planeGeometry args={[sideW, top]} />
            </mesh>
          ))}
          <mesh position={[0, (top + ENTRANCE.h) / 2, zf]} material={plasterMat(ENTRANCE.w, top - ENTRANCE.h)}>
            <planeGeometry args={[ENTRANCE.w, top - ENTRANCE.h]} />
          </mesh>
        </>
      )}
      <group position={[0, 5.95, zf + 0.1]}>
        <mesh material={darkSteelMat()} castShadow>
          <boxGeometry args={[5.9, 2.4, 0.12]} />
        </mesh>
        <PhotoCrop name="sign" width={5.75} position={[0, 0, 0.065]} glow={0.55} />
        {[-2.2, 0, 2.2].map((x) => (
          <mesh key={x} position={[x, 1.3, 0.35]} rotation-x={0.5} material={darkSteelMat()}>
            <boxGeometry args={[0.5, 0.08, 0.25]} />
          </mesh>
        ))}
      </group>
      <mesh position={[-7.4, 2.2, zf + 0.04]} material={shutterMat(5.2, 4.4)} castShadow>
        <boxGeometry args={[5.2, 4.4, 0.06]} />
      </mesh>
      <mesh position={[-7.4, 4.5, zf + 0.12]} material={darkSteelMat()} castShadow>
        <boxGeometry args={[5.5, 0.3, 0.24]} />
      </mesh>
      <mesh position={[0, top + 0.12, zf + 0.8]} material={concreteBeamMat()} castShadow receiveShadow>
        <boxGeometry args={[2 * HALF_W + 0.6, 0.24, 1.6]} />
      </mesh>
      {[-12, -7.4, -3, 0, 3, 8, 12].map((x) => (
        <mesh key={x} position={[x, top - 0.03, zf + 0.9]}>
          <boxGeometry args={[1.2, 0.05, 0.08]} />
          <meshStandardMaterial color="#ffffff" emissive="#f4f7ff" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, top - 0.6, zf + 1.6]} intensity={14} distance={11} color="#eef2ff" />
      <mesh position={[0, ENTRANCE.h - 0.45, zf + 0.06]} material={shutterMat(ENTRANCE.w, 0.9)} castShadow>
        <boxGeometry args={[ENTRANCE.w + 0.2, 0.9, 0.08]} />
      </mesh>
      <mesh position={[0, ENTRANCE.h + 0.12, zf + 0.12]} material={darkSteelMat()} castShadow>
        <boxGeometry args={[ENTRANCE.w + 0.4, 0.26, 0.24]} />
      </mesh>
      <group position={[ENTRANCE.w / 2 + 0.9, 0, zf + 0.9]} rotation-y={-0.25}>
        <group rotation-x={-0.1}>
          <mesh position={[0, 0.72, -0.01]} material={plankMat(1, 1)} castShadow>
            <boxGeometry args={[0.82, 1.44, 0.04]} />
          </mesh>
          <PhotoCrop name="chalk" height={1.36} position={[0, 0.74, 0.015]} glow={0.25} />
        </group>
      </group>
      <group position={[-ENTRANCE.w / 2 - 0.6, 0, zf + 0.45]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0, 0.17 + i * 0.35, 0]} material={crateMat} castShadow>
            <boxGeometry args={[0.5, 0.33, 0.38]} />
          </mesh>
        ))}
        <mesh position={[0, 1.58, 0]} material={yellowBoxMat} castShadow>
          <boxGeometry args={[0.52, 0.34, 0.4]} />
        </mesh>
        <PhotoCrop name="crates" height={1.74} position={[0, 0.88, 0.2]} glow={0.25} />
      </group>
      <group position={[ENTRANCE.w / 2 + 1.75, 1.35, zf + 0.04]}>
        <mesh material={whiteMat()}>
          <boxGeometry args={[1.95, 1.8, 0.04]} />
        </mesh>
        <PhotoCrop name="posters" height={1.7} position={[0, 0, 0.025]} glow={0.35} />
      </group>
    </group>
  )
}

function ConcreteFrame() {
  const bim = useStore((s) => s.bim)
  const m = useMemo(() => {
    const out: THREE.Matrix4[] = []
    const d = 0.38
    ;[3.4, EAVE - 0.2].forEach((y) => {
      out.push(boxAt(0, y, HALF_D - d / 2, 2 * HALF_W, 0.32, d))
      out.push(boxAt(0, y, -HALF_D + d / 2, 2 * HALF_W, 0.32, d))
      out.push(boxAt(-HALF_W + d / 2, y, 0, d, 0.32, 2 * HALF_D))
      out.push(boxAt(HALF_W - d / 2, y, 0, d, 0.32, 2 * HALF_D))
    })
    return out
  }, [])
  return <InstancedBoxes matrices={m} material={bim ? bimSolidMat() : concreteBeamMat()} castShadow={!bim} />
}

function Stairs() {
  const { x0, x1, zBottom, zTop, h, landing } = STAIRS
  const steps = 18
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
    for (let i = 0; i <= steps; i += 3) out.push(boxAt(x0 + 0.05, rise * i + 0.5, zBottom - run * i, 0.04, 1, 0.04))
    const len = Math.hypot(zBottom - zTop, h)
    const mtx = new THREE.Matrix4().compose(
      new THREE.Vector3(x0 + 0.05, h / 2 + 1, (zBottom + zTop) / 2),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.atan2(h, zBottom - zTop), 0, 0)),
      new THREE.Vector3(0.05, 0.05, len),
    )
    out.push(mtx)
    out.push(boxAt(landing.x0 + 0.05, h + 1.05, (landing.z0 + landing.z1) / 2, 0.05, 0.05, landing.z1 - landing.z0))
    out.push(boxAt((landing.x0 + x0) / 2, h + 1.05, landing.z1 - 0.05, x0 - landing.x0, 0.05, 0.05))
    for (let z = landing.z0 + 0.2; z < landing.z1; z += 0.6) out.push(boxAt(landing.x0 + 0.05, h + 0.55, z, 0.04, 1, 0.04))
    return out
  }, [x0, zBottom, zTop, h, rise, run, landing])
  const lw = landing.x1 - landing.x0
  const ld = landing.z1 - landing.z0
  return (
    <group>
      <InstancedBoxes matrices={m} material={concreteBeamMat()} />
      <InstancedBoxes matrices={rail} material={darkSteelMat()} />
      <mesh position={[(landing.x0 + landing.x1) / 2, h - 0.1, (landing.z0 + landing.z1) / 2]} material={concreteBeamMat()} castShadow receiveShadow>
        <boxGeometry args={[lw, 0.2, ld]} />
      </mesh>
      <mesh position={[landing.x0 + 0.2, (h - 0.2) / 2, landing.z1 - 0.2]} material={columnMat()} castShadow>
        <boxGeometry args={[0.35, h - 0.2, 0.35]} />
      </mesh>
      <InstancedBoxes
        matrices={useMemo(
          () => [0, 1, 2].map((i) => boxAt(landing.x0 + 0.7 + i * 0.75, h + 0.4, landing.z0 + 0.6, 0.6, 0.6, 0.5)),
          [landing, h],
        )}
        material={palletMat()}
      />
    </group>
  )
}

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

function Wainscot() {
  const bim = useStore((s) => s.bim)
  if (bim) return null
  const h = 2.9
  return (
    <group>
      <mesh position={[-HALF_W + 0.03, h / 2, -2.5]} rotation-y={Math.PI / 2} material={plankMat(7, 1.4)} receiveShadow>
        <planeGeometry args={[15, h]} />
      </mesh>
      <mesh position={[HALF_W - 0.03, h / 2, 0]} rotation-y={-Math.PI / 2} material={plankMat(9, 1.4)} receiveShadow>
        <planeGeometry args={[20, h]} />
      </mesh>
    </group>
  )
}

function Crates() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55 }), [])
  const { m, c } = useMemo(() => {
    const m: THREE.Matrix4[] = []
    const c: THREE.Color[] = []
    const blue = new THREE.Color('#1d5eaa')
    const red = new THREE.Color('#c3202b')
    for (let ix = 0; ix < 7; ix++)
      for (let iz = 0; iz < 3; iz++)
        for (let iy = 0; iy < 6; iy++) {
          m.push(boxAt(2.55 + ix * 0.5, 0.16 + iy * 0.31, -9.55 + iz * 0.4, 0.48, 0.3, 0.38))
          c.push(ix < 5 ? blue : red)
        }
    return { m, c }
  }, [])
  return <InstancedBoxes matrices={m} material={mat} colors={c} />
}

function SalonCeiling() {
  const bim = useStore((s) => s.bim)
  if (bim) return null
  return (
    <mesh position={[-11.8, 3.18, 7.7]} rotation-x={Math.PI / 2} material={plankMat(4, 2)}>
      <planeGeometry args={[6.4, 4.6]} />
    </mesh>
  )
}

function BevPallets() {
  const mats = useMemo(() => [0, 1, 2, 3].map((v) => new THREE.MeshStandardMaterial({ map: bevPackTex(v), roughness: 0.35, metalness: 0.05 })), [])
  return (
    <group>
      {BEV_PALLETS.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position-y={0.075} material={palletMat()} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.15, 1.0]} />
          </mesh>
          <mesh position-y={0.15 + 0.6} material={mats[i % 4]} castShadow receiveShadow>
            <boxGeometry args={[1.16, 1.2, 0.96]} />
          </mesh>
          {i % 2 === 0 && (
            <mesh position-y={1.35 + 0.15} material={mats[(i + 1) % 4]} castShadow>
              <boxGeometry args={[1.16, 0.3, 0.96]} />
            </mesh>
          )}
        </group>
      ))}
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

function Commercial() {
  const zw = 5.36
  const candyA = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e94b7a', roughness: 0.5 }), [])
  const candyB = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f5b83d', roughness: 0.5 }), [])
  const fridgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c41820', metalness: 0.3, roughness: 0.4 }), [])
  return (
    <group>
      <mesh position={[-11.75, 1.6, 5.37]} material={plankMat(4, 2)}>
        <planeGeometry args={[6.3, 3.2]} />
      </mesh>
      <Shelving position={[-12.6, 0, 5.62]} rotationY={0} width={2.4} white={false} seed={11} bottles={false} />
      <group position={[-10.6, 2.75, zw + 0.06]}>
        <mesh material={darkSteelMat()}>
          <boxGeometry args={[1.12, 0.82, 0.1]} />
        </mesh>
        <PhotoCrop name="lucky" width={1.02} position={[0, 0, 0.055]} glow={0.9} />
      </group>
      <PhotoCrop name="atencion" height={0.78} position={[-11.85, 0.55, 6.97]} glow={0.35} />
      <PhotoCrop name="personal" height={0.5} position={[-10.85, 0.62, 6.97]} glow={0.35} />
      <group position={[-10.2, 1.16, 6.86]}>
        <mesh position-y={0.24} material={whiteMat()}>
          <boxGeometry args={[0.26, 0.5, 0.02]} />
        </mesh>
        <PhotoCrop name="filmando" height={0.46} position={[0, 0.24, 0.012]} glow={0.4} />
      </group>
      <group position={[-13.0, 0, 6.75]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} position={[0, 0.25 + i * 0.22, -i * 0.04]}>
            <mesh rotation-x={-0.35} material={glassMat()}>
              <boxGeometry args={[0.55, 0.2, 0.32]} />
            </mesh>
            <mesh position-y={-0.04} material={i % 2 ? candyA : candyB}>
              <boxGeometry args={[0.5, 0.07, 0.26]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.7, -0.22]} material={darkSteelMat()}>
          <boxGeometry args={[0.58, 1.4, 0.03]} />
        </mesh>
      </group>
      <group position={[0, 0, 9.55]} rotation-y={Math.PI}>
        {[7.55, 6.8].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position-y={1.0} material={fridgeMat} castShadow>
              <boxGeometry args={[0.72, 2.0, 0.7]} />
            </mesh>
            <PhotoCrop name="fridge" height={1.75} position={[0, 1.0, 0.356]} glow={0.6} />
          </group>
        ))}
        <group position={[5.45, 0, 0]}>
          <mesh position-y={0.42} material={whiteMat()} castShadow>
            <boxGeometry args={[1.3, 0.84, 0.7]} />
          </mesh>
          <PhotoCrop name="freezer" height={0.84} position={[0, 0.42, 0.356]} glow={0.35} />
          <mesh position-y={0.87} material={glassMat()}>
            <boxGeometry args={[1.26, 0.08, 0.66]} />
          </mesh>
        </group>
      </group>
      <mesh position={[-11.4, 0.55, 6.6]} material={plankMat(2, 1)} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.1, 0.72]} />
      </mesh>
      <group position={[-9.25, 0, 6.6]}>
        <mesh position-y={0.4} material={whiteMat()} castShadow receiveShadow>
          <boxGeometry args={[1.9, 0.8, 0.72]} />
        </mesh>
        <mesh position-y={0.95} material={glassMat()}>
          <boxGeometry args={[1.86, 0.3, 0.68]} />
        </mesh>
        <InstancedBoxes
          matrices={useMemo(() => Array.from({ length: 10 }, (_, i) => boxAt(-0.8 + i * 0.18, 0.88, 0, 0.12, 0.14, 0.12)), [])}
          material={useMemo(() => new THREE.MeshStandardMaterial({ color: '#f5c542', roughness: 0.5 }), [])}
        />
      </group>
      {[-12.0, -10.3].map((x) => (
        <group key={x} position={[x, 1.16, 6.78]}>
          <mesh position-y={0.48} material={glassMat()}>
            <boxGeometry args={[1.3, 0.95, 0.015]} />
          </mesh>
          {[-0.65, 0.65].map((dx) => (
            <mesh key={dx} position={[dx, 0.48, 0]} material={darkSteelMat()}>
              <boxGeometry args={[0.025, 0.97, 0.03]} />
            </mesh>
          ))}
          <mesh position={[0, 0.03, 0.05]} material={darkSteelMat()}>
            <boxGeometry args={[0.4, 0.06, 0.12]} />
          </mesh>
        </group>
      ))}
      <group position={[-11.0, 1.16, 6.5]}>
        <mesh position-y={0.06} material={whiteMat()}>
          <boxGeometry args={[0.4, 0.12, 0.36]} />
        </mesh>
        <mesh position-y={0.4} material={darkSteelMat()}>
          <boxGeometry args={[0.04, 0.5, 0.04]} />
        </mesh>
        <mesh position={[0, 0.68, 0]}>
          <boxGeometry args={[0.34, 0.14, 0.05]} />
          <meshStandardMaterial color="#0a3b2b" emissive="#39ff9c" emissiveIntensity={0.8} />
        </mesh>
      </group>
      <Shelving position={[-14.6, 0, 7.8]} rotationY={Math.PI / 2} width={3.6} white seed={23} bottles />
      <Shelving position={[-12.2, 0, 9.5]} rotationY={Math.PI} width={2.2} white seed={41} bottles />
    </group>
  )
}

export function RealSite() {
  return (
    <group>
      <Facade />
      <ConcreteFrame />
      <Stairs />
      <Van />
      <BevPallets />
      <Commercial />
      <Wainscot />
      <Crates />
      <SalonCeiling />
      <PhotoMural photo="ext_4" position={[8.6, 2.2, HALF_D + WALL_T + 0.08]} height={1.9} />
      <PhotoMural photo="gal_4" position={[-HALF_W + 0.06, 2.4, -2.7]} rotationY={Math.PI / 2} height={1.9} />
      <PhotoMural photo="sal_2" position={[HALF_W - 0.06, 2.4, 2.4]} rotationY={-Math.PI / 2} height={1.9} />
      <PhotoMural photo="gal_1" position={[-HALF_W + 0.06, 2.4, 1.3]} rotationY={Math.PI / 2} height={1.9} />
      <PhotoMural photo="gal_3" position={[-12.6, 2.6, -HALF_D + 0.06]} height={1.9} />
    </group>
  )
}
