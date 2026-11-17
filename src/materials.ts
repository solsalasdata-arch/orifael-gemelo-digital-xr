import * as THREE from 'three'
import { brickNormalTex, brickTex, corrugatedTex, concreteTex, hazardTex, plankTex, repeated, woodTex, boxTex } from './textures'

const memo = new Map<string, THREE.Material>()
function once<T extends THREE.Material>(key: string, f: () => T): T {
  let m = memo.get(key) as T | undefined
  if (!m) {
    m = f()
    memo.set(key, m)
  }
  return m
}

export const BIM_COLOR = '#38f3ff'

export const wallMat = (len: number, h: number) =>
  once(`wall-${len.toFixed(2)}-${h.toFixed(2)}`, () => {
    const t = repeated(brickTex(), len, h)
    const n = repeated(brickNormalTex(), len, h)
    return new THREE.MeshStandardMaterial({ map: t, normalMap: n, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.9 })
  })

export const gableMat = () =>
  once('gable', () => {
    const t = repeated(brickTex(), 1, 1)
    const n = repeated(brickNormalTex(), 1, 1)
    return new THREE.MeshStandardMaterial({ map: t, normalMap: n, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.9 })
  })

export const shutterMat = (w: number, h: number) =>
  once(`shutter-${w}-${h}`, () => {
    const t = repeated(corrugatedTex(true), w, h * 2)
    return new THREE.MeshStandardMaterial({ color: '#8d969e', map: t, bumpMap: t, bumpScale: 3, metalness: 0.55, roughness: 0.45 })
  })

export const plinthMat = () =>
  once('plinth', () => new THREE.MeshStandardMaterial({ color: '#8a8c8f', map: repeated(concreteTex(), 3, 0.4), roughness: 0.9 }))

export const roofMat = () =>
  once('roof', () => {
    const t = repeated(corrugatedTex(), 30, 1)
    t.rotation = 0
    return new THREE.MeshStandardMaterial({ color: '#b9bfc6', map: t, bumpMap: t, bumpScale: 2, metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide })
  })

export const skylightMat = () =>
  once('sky', () =>
    new THREE.MeshStandardMaterial({ color: '#e8f6ff', emissive: '#cfeeff', emissiveIntensity: 1.1, transparent: true, opacity: 0.5, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false }),
  )

export const steelMat = () => once('steel', () => new THREE.MeshStandardMaterial({ color: '#8e979f', metalness: 0.9, roughness: 0.3 }))
export const columnMat = () => once('column', () => new THREE.MeshStandardMaterial({ color: '#c9c6c0', map: repeated(concreteTex(), 0.4, 2), roughness: 0.88 }))
export const concreteBeamMat = () => once('cbeam', () => new THREE.MeshStandardMaterial({ color: '#c4c1bb', map: repeated(concreteTex(), 6, 0.3), roughness: 0.9 }))
export const plankMat = (rx = 1, ry = 1) =>
  once(`plank-${rx}-${ry}`, () => new THREE.MeshStandardMaterial({ map: repeated(plankTex(), rx, ry), roughness: 0.75 }))
export const plasterMat = (rx: number, ry: number) =>
  once(`plaster-${rx.toFixed(1)}-${ry.toFixed(1)}`, () => new THREE.MeshStandardMaterial({ color: '#d2d0cb', map: repeated(concreteTex(), rx / 6, ry / 6), roughness: 0.93 }))
export const darkSteelMat = () => once('dsteel', () => new THREE.MeshStandardMaterial({ color: '#2b3035', metalness: 0.7, roughness: 0.45 }))
export const hazardMat = () => once('hazard', () => new THREE.MeshStandardMaterial({ map: repeated(hazardTex(), 1, 4), roughness: 0.6 }))
export const rubberMat = () => once('rubber', () => new THREE.MeshStandardMaterial({ color: '#121314', roughness: 0.9 }))
export const mintGlowMat = () => once('mintglow', () => new THREE.MeshStandardMaterial({ color: '#A8E6CF', emissive: '#A8E6CF', emissiveIntensity: 2.2, toneMapped: false }))
export const lampMat = () => once('lamp', () => new THREE.MeshStandardMaterial({ color: '#fff7e6', emissive: '#fff1d6', emissiveIntensity: 3, toneMapped: false }))
export const bordoMat = () => once('bordo', () => new THREE.MeshStandardMaterial({ color: '#5C1A33', metalness: 0.2, roughness: 0.5 }))
export const whiteMat = () => once('white', () => new THREE.MeshStandardMaterial({ color: '#eef0f2', roughness: 0.35 }))
export const glassMat = () =>
  once('glass', () => new THREE.MeshPhysicalMaterial({ color: '#cfe9f5', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1, depthWrite: false }))

export const rackUprightMat = () => once('rackU', () => new THREE.MeshStandardMaterial({ color: '#5b6c7b', metalness: 0.8, roughness: 0.32 }))
export const rackBeamMat = () => once('rackB', () => new THREE.MeshStandardMaterial({ color: '#d9531e', metalness: 0.55, roughness: 0.34 }))
export const yellowMat = () => once('yellow', () => new THREE.MeshStandardMaterial({ color: '#f2c230', roughness: 0.5 }))
export const palletMat = () => once('pallet', () => new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.85 }))
export const boxMat = (v: 0 | 1) => once(`box-${v}`, () => new THREE.MeshStandardMaterial({ map: boxTex(v), roughness: 0.85 }))

export const bimWallMat = () =>
  once('bimWall', () => new THREE.MeshBasicMaterial({ color: BIM_COLOR, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }))
export const bimSolidMat = () =>
  once('bimSolid', () => new THREE.MeshBasicMaterial({ color: BIM_COLOR, transparent: true, opacity: 0.28, depthWrite: false, toneMapped: false }))
export const bimWireMat = () => once('bimWire', () => new THREE.MeshBasicMaterial({ color: BIM_COLOR, wireframe: true, toneMapped: false }))
export const bimRoofMat = () =>
  once('bimRoof', () => new THREE.MeshBasicMaterial({ color: BIM_COLOR, transparent: true, opacity: 0.03, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }))
