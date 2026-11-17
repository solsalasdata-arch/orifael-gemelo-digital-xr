import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

const UP = new THREE.Vector3(0, 1, 0)
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _s = new THREE.Vector3()

export function beam(a: [number, number, number], b: [number, number, number], t: number, d = t) {
  _a.set(...a)
  _b.set(...b)
  const dir = _b.clone().sub(_a)
  const len = dir.length()
  _q.setFromUnitVectors(UP, dir.normalize())
  _s.set(t, len, d)
  return new THREE.Matrix4().compose(_a.clone().add(_b).multiplyScalar(0.5), _q, _s)
}

export function boxAt(x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0) {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(UP, ry), new THREE.Vector3(sx, sy, sz))
}

type Props = {
  matrices: THREE.Matrix4[]
  material: THREE.Material
  colors?: THREE.Color[]
  castShadow?: boolean
  receiveShadow?: boolean
  geometry?: THREE.BufferGeometry
}

export function InstancedBoxes({ matrices, material, colors, castShadow = true, receiveShadow = true, geometry }: Props) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    matrices.forEach((mat, i) => m.setMatrixAt(i, mat))
    if (colors) colors.forEach((c, i) => m.setColorAt(i, c))
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.computeBoundingSphere()
    m.computeBoundingBox()
  }, [matrices, colors])
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, matrices.length]} material={material} castShadow={castShadow} receiveShadow={receiveShadow}>
      {!geometry && <boxGeometry />}
    </instancedMesh>
  )
}
