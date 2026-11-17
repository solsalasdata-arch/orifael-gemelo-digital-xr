import { useMemo } from 'react'
import * as THREE from 'three'
import { darkSteelMat } from '../materials'
import { signTex, type SignStyle } from '../textures'

type PanelProps = {
  id: string
  lines: string[]
  style: SignStyle
  size: [number, number]
  position: [number, number, number]
  rotationY?: number
  glow?: number
  twoSided?: boolean
  frame?: boolean
  res?: [number, number]
}

export function LightPanel({ id, lines, style, size, position, rotationY = 0, glow = 1.2, twoSided = false, frame = true, res }: PanelProps) {
  const tex = useMemo(() => signTex(id, lines, style, res?.[0], res?.[1]), [id, lines, style, res])
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: glow, roughness: 0.4, toneMapped: false }),
    [tex, glow],
  )
  return (
    <group position={position} rotation-y={rotationY}>
      {frame && (
        <mesh material={darkSteelMat()} castShadow>
          <boxGeometry args={[size[0] + 0.12, size[1] + 0.12, 0.1]} />
        </mesh>
      )}
      <mesh position-z={0.056} material={mat}>
        <planeGeometry args={size} />
      </mesh>
      {twoSided && (
        <mesh position-z={-0.056} rotation-y={Math.PI} material={mat}>
          <planeGeometry args={size} />
        </mesh>
      )}
    </group>
  )
}
