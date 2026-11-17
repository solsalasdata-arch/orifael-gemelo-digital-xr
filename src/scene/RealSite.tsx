import { useTexture } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { EAVE, ENTRANCE, HALF_D, HALF_W, PHOTOS, PICKUP, STAIRS, BEV_PALLETS, WALL_T, type PhotoKey } from '../data'
import {
  bimSolidMat, concreteBeamMat, darkSteelMat, glassMat, palletMat, plankMat, plasterMat, rubberMat, shutterMat, whiteMat, columnMat,
} from '../materials'
import { useStore } from '../store'
import { bevPackTex } from '../textures'
import { InstancedBoxes, boxAt } from './Instanced'
import { LightPanel } from './Zones'

const photoUrl = (k: PhotoKey) => `${import.meta.env.BASE_URL}textures/${PHOTOS[k].file}`

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
  sign: ['actual_1', [243, 229, 943, 580]],
  posters: ['actual_1', [586, 1017, 903, 1300]],
  chalk: ['actual_1', [897, 929, 1143, 1443]],
  crates: ['actual_1', [0, 536, 229, 1600]],
  atencion: ['actual_2', [729, 954, 1011, 1200]],
  filmando: ['actual_2', [1185, 835, 1290, 1040]],
  lucky: ['actual_2', [957, 193, 1357, 471]],
  personal: ['actual_2', [1021, 1030, 1207, 1200]],
  freezer: ['actual_3', [0, 971, 450, 1543]],
  fridge: ['actual_3', [455, 590, 620, 1157]],
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

function Pickup() {
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#b5122b', metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }), [])
  const tint = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0e1216', metalness: 0.9, roughness: 0.08 }), [])
  const rim = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b8bcc0', metalness: 0.95, roughness: 0.25 }), [])
  const tail = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff2a2a', emissive: '#ff1a1a', emissiveIntensity: 0.6 }), [])
  const { x, z, rotY } = PICKUP
  return (
    <group position={[x, 0, z]} rotation-y={rotY}>
      <mesh position={[0, 0.92, 0]} material={paint} castShadow receiveShadow>
        <boxGeometry args={[5.3, 0.62, 1.86]} />
      </mesh>
      <mesh position={[1.05, 1.62, 0]} material={paint} castShadow>
        <boxGeometry args={[2.5, 0.8, 1.78]} />
      </mesh>
      <mesh position={[1.05, 1.65, 0]} material={tint}>
        <boxGeometry args={[2.3, 0.6, 1.8]} />
      </mesh>
      <mesh position={[2.35, 1.6, 0]} rotation-z={-0.55} material={tint}>
        <boxGeometry args={[0.04, 0.8, 1.66]} />
      </mesh>
      <mesh position={[2.45, 1.29, 0]} material={paint} castShadow>
        <boxGeometry args={[0.6, 0.12, 1.86]} />
      </mesh>
      {[-0.9, 0.9].map((s) => (
        <mesh key={s} position={[-1.3, 1.4, s]} material={paint} castShadow>
          <boxGeometry args={[2.6, 0.36, 0.07]} />
        </mesh>
      ))}
      <mesh position={[-2.6, 1.4, 0]} material={paint} castShadow>
        <boxGeometry args={[0.08, 0.36, 1.86]} />
      </mesh>
      {[-0.85, 0.85].map((s) => (
        <mesh key={s} position={[-0.25, 1.95, s]} material={darkSteelMat()} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 10]} />
        </mesh>
      ))}
      <mesh position={[-0.25, 2.4, 0]} rotation-x={Math.PI / 2} material={darkSteelMat()} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.75, 10]} />
      </mesh>
      <mesh position={[2.66, 0.62, 0]} material={darkSteelMat()} castShadow>
        <boxGeometry args={[0.2, 0.28, 1.9]} />
      </mesh>
      <mesh position={[-2.68, 0.62, 0]} material={darkSteelMat()} castShadow>
        <boxGeometry args={[0.2, 0.28, 1.9]} />
      </mesh>
      {[-0.72, 0.72].map((s) => (
        <mesh key={s} position={[-2.66, 1.3, s]} material={tail}>
          <boxGeometry args={[0.04, 0.35, 0.18]} />
        </mesh>
      ))}
      {[-0.95, 0.95].map((s) => (
        <mesh key={s} position={[0.3, 0.48, s]} material={darkSteelMat()}>
          <boxGeometry args={[2.2, 0.05, 0.14]} />
        </mesh>
      ))}
      {[-1.75, 1.75].map((wx) =>
        [-0.84, 0.84].map((wz) => (
          <group key={`${wx}${wz}`} position={[wx, 0.4, wz]} rotation-x={Math.PI / 2}>
            <mesh material={rubberMat()} castShadow>
              <cylinderGeometry args={[0.4, 0.4, 0.3, 24]} />
            </mesh>
            <mesh position-y={wz > 0 ? 0.152 : -0.152} material={rim}>
              <cylinderGeometry args={[0.24, 0.24, 0.02, 12]} />
            </mesh>
          </group>
        )),
      )}
      <LightPanel id="plate" lines={['ORIFAEL', 'Jujuy']} style="street" size={[0.4, 0.13]} position={[-2.79, 0.65, 0]} rotationY={-Math.PI / 2} frame={false} glow={0.2} res={[256, 84]} />
    </group>
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
      <Pickup />
      <BevPallets />
      <Commercial />
      <PhotoMural photo="actual_1" position={[-5.6, 2.25, HALF_D + WALL_T + 0.08]} />
      <PhotoMural photo="actual_2" position={[-HALF_W + 0.06, 2.4, -2.7]} rotationY={Math.PI / 2} height={1.9} />
      <PhotoMural photo="actual_3" position={[HALF_W - 0.06, 2.4, 2.4]} rotationY={-Math.PI / 2} />
      <PhotoMural photo="actual_4" position={[-HALF_W + 0.06, 2.4, 1.3]} rotationY={Math.PI / 2} height={1.9} />
      <PhotoMural photo="actual_5" position={[-12.6, 2.6, -HALF_D + 0.06]} height={1.9} />
    </group>
  )
}
