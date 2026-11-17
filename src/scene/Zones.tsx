import { useMemo } from 'react'
import * as THREE from 'three'
import { BAY_CENTERS, BOTTOM_CHORD, HALF_D, HALF_W, RACK_ROWS, RACK_Z0, RACK_Z1 } from '../data'
import { bordoMat, darkSteelMat, lampMat, mintGlowMat, rubberMat, whiteMat, yellowMat } from '../materials'
import { asphaltTex, concreteTex, repeated, sidewalkTex, signTex, type SignStyle } from '../textures'
import { InstancedBoxes, boxAt } from './Instanced'

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

function Hanging({ y, top = BOTTOM_CHORD, children, x, z, half }: { y: number; top?: number; x: number; z: number; half: number; children: React.ReactNode }) {
  return (
    <group>
      {[-half, half].map((dx) => (
        <mesh key={dx} position={[x + dx, (y + top) / 2, z]} material={darkSteelMat()}>
          <cylinderGeometry args={[0.012, 0.012, top - y, 4]} />
        </mesh>
      ))}
      {children}
    </group>
  )
}

function Signage() {
  return (
    <group>
      <LightPanel
        id="brand-back"
        lines={['DISTRIBUIDORA ORIFAEL', 'Centro Logístico Jujuy']}
        style="brand"
        size={[10, 2.5]}
        position={[0, 5.3, -HALF_D + 0.08]}
        glow={1.6}
        res={[2048, 512]}
      />
      <Hanging x={0} z={-1.5} y={5.6} half={2.6}>
        <LightPanel
          id="brand-hang"
          lines={['DISTRIBUIDORA ORIFAEL', 'Centro Logístico Jujuy']}
          style="brand"
          size={[5.6, 1.1]}
          position={[0, 5.6, -1.5]}
          twoSided
          glow={1.5}
          res={[1536, 300]}
        />
      </Hanging>
      {[-7.8, 0, 7.25].map((x, i) => {
        const labels = [
          ['1', 'PASILLO 1', 'Estanterías de madera · Secos'],
          ['2', 'PASILLO CENTRAL', 'Circulación principal'],
          ['3', 'PASILLO 3', 'Pallets de bebidas'],
        ][i]
        return (
          <Hanging key={i} x={x} z={RACK_Z1 + 0.6} y={4.9} half={0.9}>
            <LightPanel id={`aisle-${i}`} lines={labels} style="aisle" size={[2.4, 0.6]} position={[x, 4.9, RACK_Z1 + 0.6]} twoSided glow={1.1} />
          </Hanging>
        )
      })}
      <Hanging x={-10.6} z={6.2} y={4.4} half={1.3}>
        <LightPanel id="recep" lines={['RECEPCIÓN', 'Mostrador comercial · Atención al cliente']} style="zone" size={[3, 0.75]} position={[-10.6, 4.4, 6.2]} twoSided glow={1} />
      </Hanging>
      <Hanging x={0} z={-7.2} y={5.0} half={1.7}>
        <LightPanel id="despacho" lines={['ZONA DE DESPACHO', 'Carga y descarga · Muelles 1 – 3']} style="zone" size={[4, 1]} position={[0, 5.0, -7.2]} twoSided glow={1} />
      </Hanging>
      <Hanging x={11.6} z={6.0} y={4.4} half={1.2}>
        <LightPanel id="picking" lines={['PICKING', 'Preparación de pedidos']} style="zone" size={[2.8, 0.7]} position={[11.6, 4.4, 6.0]} twoSided glow={1} />
      </Hanging>
      {[-8, 0, 8].map((x, i) => (
        <LightPanel key={x} id={`dock-${i}`} lines={[`MUELLE ${i + 1}`, i === 1 ? 'EN OPERACIÓN' : 'DISPONIBLE']} style="zone" size={[1.6, 0.45]} position={[x, 4.75, -HALF_D + 0.1]} glow={1} />
      ))}
    </group>
  )
}

function Reception() {
  return (
    <group>
      <mesh position={[-11.75, 1.6, 5.25]} material={darkSteelMat()} castShadow receiveShadow>
        <boxGeometry args={[6.3, 3.2, 0.2]} />
      </mesh>
      <group position={[-3.8, 0, 8.4]} rotation-y={0.5}>
        <mesh position-y={0.9} material={darkSteelMat()} castShadow>
          <boxGeometry args={[0.7, 1.8, 0.12]} />
        </mesh>
        <LightPanel id="totem" lines={['GEMELO DIGITAL', 'Orifael · XR', 'Escaneá y recorré']} style="screen" size={[0.6, 1.0]} position={[0, 1.15, 0.03]} frame={false} glow={1.1} res={[512, 860]} />
      </group>
      {/* picking tables */}
      {[10.9, 13.1].map((x) => (
        <group key={x} position={[x, 0, 8.7]}>
          <mesh position-y={0.9} material={whiteMat()} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.05, 0.9]} />
          </mesh>
          {[-0.85, 0.85].map((dx) =>
            [-0.38, 0.38].map((dz) => (
              <mesh key={`${dx}${dz}`} position={[dx, 0.45, dz]} material={darkSteelMat()}>
                <boxGeometry args={[0.05, 0.9, 0.05]} />
              </mesh>
            )),
          )}
        </group>
      ))}
    </group>
  )
}

function Forklift({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0.65, 0]} material={yellowMat()} castShadow>
        <boxGeometry args={[1.1, 0.9, 1.9]} />
      </mesh>
      <mesh position={[0, 0.65, -0.9]} material={darkSteelMat()} castShadow>
        <boxGeometry args={[1.0, 0.8, 0.5]} />
      </mesh>
      {[-0.45, 0.45].map((x) =>
        [-0.4, 0.75].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 1.55, z]} material={darkSteelMat()} castShadow>
            <boxGeometry args={[0.06, 1.0, 0.06]} />
          </mesh>
        )),
      )}
      <mesh position={[0, 2.07, 0.17]} material={darkSteelMat()} castShadow>
        <boxGeometry args={[1.0, 0.05, 1.3]} />
      </mesh>
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 1.4, 1.05]} material={darkSteelMat()} castShadow>
          <boxGeometry args={[0.1, 2.6, 0.12]} />
        </mesh>
      ))}
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.08, 1.7]} material={darkSteelMat()} castShadow>
          <boxGeometry args={[0.12, 0.05, 1.2]} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x) =>
        [-0.6, 0.6].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.28, z]} rotation-z={Math.PI / 2} material={rubberMat()} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.22, 16]} />
          </mesh>
        )),
      )}
    </group>
  )
}

function Truck() {
  const side = useMemo(() => signTex('truck', ['ORIFAEL', 'Distribuidora · Jujuy'], 'brand', 1024, 256), [])
  return (
    <group position={[0, 0, -HALF_D - 0.5]}>
      <mesh position={[0, 2.5, -4.2]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.7, 8]} />
        <meshStandardMaterial color="#f2f3f4" metalness={0.3} roughness={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.26, 2.7, -4.2]} rotation-y={(s * Math.PI) / 2}>
          <planeGeometry args={[6, 1.5]} />
          <meshStandardMaterial map={side} emissiveMap={side} emissive="#ffffff" emissiveIntensity={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 1.05, -4.2]} material={darkSteelMat()} castShadow>
        <boxGeometry args={[2.2, 0.3, 8]} />
      </mesh>
      <group position={[0, 0, -9.6]}>
        <mesh position={[0, 1.75, 0]} material={bordoMat()} castShadow>
          <boxGeometry args={[2.45, 2.3, 2.3]} />
        </mesh>
        <mesh position={[0, 2.25, -1.16]}>
          <planeGeometry args={[2.1, 0.9]} />
          <meshStandardMaterial color="#1b2733" metalness={0.8} roughness={0.1} />
        </mesh>
      </group>
      {[-1.05, 1.05].map((x) =>
        [-1.5, -2.6, -7.3, -9.9].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.48, z]} rotation-z={Math.PI / 2} material={rubberMat()} castShadow>
            <cylinderGeometry args={[0.48, 0.48, 0.35, 20]} />
          </mesh>
        )),
      )}
    </group>
  )
}

function Lamps() {
  const data = useMemo(() => {
    const housings: THREE.Matrix4[] = []
    const bulbs: THREE.Matrix4[] = []
    BAY_CENTERS.forEach((x) =>
      [-6.5, 0, 6.5].forEach((z) => {
        housings.push(boxAt(x, BOTTOM_CHORD - 0.35, z, 0.55, 0.22, 0.55))
        housings.push(boxAt(x, BOTTOM_CHORD - 0.12, z, 0.02, 0.24, 0.02))
        bulbs.push(boxAt(x, BOTTOM_CHORD - 0.47, z, 0.48, 0.02, 0.48))
      }),
    )
    return { housings, bulbs }
  }, [])
  return (
    <group>
      <InstancedBoxes matrices={data.housings} material={darkSteelMat()} castShadow={false} />
      <InstancedBoxes matrices={data.bulbs} material={lampMat()} castShadow={false} receiveShadow={false} />
    </group>
  )
}

function FloorMarkings() {
  const data = useMemo(() => {
    const yellow: THREE.Matrix4[] = []
    const green: THREE.Matrix4[] = []
    const lw = 0.1
    RACK_ROWS.forEach((c) => {
      ;[-1.35, 1.35].forEach((dx) => yellow.push(boxAt(c + dx, 0.004, (RACK_Z0 + RACK_Z1) / 2, lw, 0.004, RACK_Z1 - RACK_Z0 + 0.6)))
    })
    yellow.push(boxAt(0, 0.004, -8.0, 26, 0.004, lw))
    yellow.push(boxAt(0, 0.004, RACK_Z1 + 1.1, 28, 0.004, lw))
    ;[-1, 1].forEach((s) => {
      green.push(boxAt(s * 1.0, 0.004, 7.5, lw, 0.004, 5))
    })
    return { yellow, green }
  }, [])
  return (
    <group>
      <InstancedBoxes matrices={data.yellow} material={yellowMat()} castShadow={false} />
      <InstancedBoxes matrices={data.green} material={mintGlowMat()} castShadow={false} />
    </group>
  )
}

const PLASTER = ['#c2c1be', '#b2b1ae', '#cbc8c2', '#a8a9a8', '#bdb8b0']

function UrbanContext() {
  const groups = useMemo(() => {
    const g: THREE.Matrix4[][] = PLASTER.map(() => [])
    let seed = 11
    const r = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    const put = (x: number, z: number, w: number, d: number, hgt: number) => g[Math.floor(r() * PLASTER.length)].push(boxAt(x, hgt / 2, z, w, hgt, d))
    for (let x = -62; x < 62; ) {
      const w = 6 + r() * 7
      put(x + w / 2, 30.5 + r() * 1.5, w - 0.15, 12, 3.2 + r() * 3.2)
      x += w
    }
    ;[-1, 1].forEach((sd) => {
      for (let z = -22; z < 9; ) {
        const d = 7 + r() * 6
        const w = 10 + r() * 8
        put(sd * (HALF_W + 1.2 + w / 2), z + d / 2, w, d - 0.2, 3.2 + r() * 2.6)
        z += d
      }
    })
    for (let x = -46; x < 46; ) {
      const w = 7 + r() * 8
      put(x + w / 2, -HALF_D - 21 - r() * 3, w - 0.2, 12, 3.5 + r() * 4)
      x += w
    }
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2
      const d = 85 + r() * 70
      const x = Math.cos(a) * d
      const z = Math.sin(a) * d
      if (Math.abs(z - 17.3) < 8) continue
      put(x, z, 10 + r() * 16, 10 + r() * 14, 4 + r() * 8)
    }
    return g
  }, [])
  const mats = useMemo(() => PLASTER.map((c) => new THREE.MeshStandardMaterial({ color: c, map: repeated(concreteTex(), 2, 1), roughness: 0.95 })), [])
  return (
    <group>
      {groups.map((m, i) => (
        <InstancedBoxes key={i} matrices={m} material={mats[i]} castShadow={false} />
      ))}
    </group>
  )
}

function Exterior() {
  const street = useMemo(() => repeated(asphaltTex(), 20, 2), [])
  const walk = useMemo(() => repeated(sidewalkTex(), 30, 1.5), [])
  const dashes = useMemo(() => {
    const m: THREE.Matrix4[] = []
    for (let x = -58; x <= 58; x += 4) m.push(boxAt(x, 0.012, 17.3, 2, 0.004, 0.14))
    return m
  }, [])
  const trees = [-24, -19, 19, 24, 30, -30]
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.03} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#8f8c86" roughness={0.97} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 17.3]} receiveShadow>
        <planeGeometry args={[120, 8.2]} />
        <meshStandardMaterial map={street} color="#6a6d70" roughness={0.9} />
      </mesh>
      <InstancedBoxes matrices={dashes} material={whiteMat()} castShadow={false} />
      <mesh position={[0, 0.08, HALF_D + 1.6]} receiveShadow>
        <boxGeometry args={[120, 0.16, 2.8]} />
        <meshStandardMaterial map={walk} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.03, -HALF_D - 7]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[HALF_W * 2 + 6, 14]} />
        <meshStandardMaterial color="#8f8e8a" roughness={0.9} />
      </mesh>
      <group position={[-HALF_W - 2.2, 0, HALF_D + 2.4]}>
        <mesh position-y={1.6} material={darkSteelMat()} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3.2, 8]} />
        </mesh>
        <LightPanel id="street" lines={['Gdor. Tello', '437 · S. S. de Jujuy']} style="street" size={[1.5, 0.42]} position={[0, 3.0, 0]} glow={0.4} twoSided res={[768, 215]} />
      </group>
      <group position={[3.6, 3.0, HALF_D + 0.35]}>
        <LightPanel id="numero" lines={['437', 'Gdor. Tello']} style="street" size={[0.7, 0.35]} position={[0, 0, 0]} glow={0.5} res={[512, 256]} />
      </group>
      {trees.map((x, i) => (
        <group key={i} position={[x, 0, HALF_D + 2.2]}>
          <mesh position-y={1.2} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 2.4, 8]} />
            <meshStandardMaterial color="#5a4330" roughness={1} />
          </mesh>
          {[[0, 3.2, 0, 1.25], [0.7, 2.8, 0.3, 0.9], [-0.6, 2.9, -0.4, 0.95], [0.1, 3.8, -0.2, 0.8]].map(([x, y, z, r], j) => (
            <mesh key={j} position={[x, y, z]} castShadow>
              <icosahedronGeometry args={[r, 3]} />
              <meshStandardMaterial color={(i + j) % 2 ? '#56634b' : '#4a5741'} roughness={1} />
            </mesh>
          ))}
        </group>
      ))}
      <UrbanContext />
    </group>
  )
}

export function Zones() {
  return (
    <group>
      <Signage />
      <Reception />
      <Forklift position={[4.0, 0, -7.4]} rotationY={-Math.PI / 2 + 0.3} />
      <Truck />
      <Lamps />
      <FloorMarkings />
      <Exterior />
      <mesh position={[-HALF_W + 0.4, 1.2, 2]} material={new THREE.MeshStandardMaterial({ color: '#c62828' })}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 12]} />
      </mesh>
    </group>
  )
}
