import { Edges, MeshReflectorMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  BAY_CENTERS, BOTTOM_CHORD, D, DOCKS, DOCK_H, DOCK_W, EAVE, ENTRANCE, GATE_R, HALF_D, HALF_W, OPEN_DOCK, RIDGE, ROOF_ANGLE,
  SKYLIGHT_BAYS, SUN_DIR, TRUSS_X, W, WALL_T, topY,
} from '../data'
import {
  BIM_COLOR, bimRoofMat, bimSolidMat, bimWallMat, bimWireMat, columnMat, darkSteelMat, gableMat, hazardMat, plinthMat,
  roofMat, rubberMat, shutterMat, skylightMat, steelMat, wallMat,
} from '../materials'
import { useStore } from '../store'
import { concreteTex, repeated, concreteNormalTex } from '../textures'
import { InstancedBoxes, beam } from './Instanced'

const WALL_TOP = EAVE + 0.25

type BoxProps = {
  pos: [number, number, number]
  size: [number, number, number]
  material: THREE.Material
  bimMaterial?: THREE.Material
  edges?: boolean
  rotation?: [number, number, number]
  cast?: boolean
}

function SBox({ pos, size, material, bimMaterial, edges = true, rotation, cast = true }: BoxProps) {
  const bim = useStore((s) => s.bim)
  const useBim = bim && bimMaterial
  return (
    <mesh position={pos} rotation={rotation} material={useBim ? bimMaterial : material} castShadow={cast && !useBim} receiveShadow>
      <boxGeometry args={size} />
      {useBim && edges && <Edges color={BIM_COLOR} threshold={20} />}
    </mesh>
  )
}

function Floor() {
  const reflections = useStore((s) => s.reflections)
  const inXR = useStore((s) => s.inXR)
  const map = useMemo(() => repeated(concreteTex(), W / 5, D / 5), [])
  const nrm = useMemo(() => repeated(concreteNormalTex(), W / 5, D / 5), [])
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[W, D]} />
      {reflections && !inXR ? (
        <MeshReflectorMaterial
          map={map}
          normalMap={nrm}
          normalScale={[0.8, 0.8]}
          color="#c8c6c1"
          blur={[500, 160]}
          resolution={1024}
          mixBlur={1}
          mixStrength={2.2}
          mixContrast={1}
          roughness={0.55}
          metalness={0.05}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          mirror={0.55}
        />
      ) : (
        <meshStandardMaterial map={map} normalMap={nrm} color="#c8c6c1" roughness={0.45} metalness={0.05} />
      )}
    </mesh>
  )
}

function wallSegmentsX(z: number, openings: { c: number; w: number; h: number }[]) {
  const segs: { x0: number; x1: number; y0: number; y1: number }[] = []
  const xs = [-HALF_W - WALL_T, ...openings.flatMap((o) => [o.c - o.w / 2, o.c + o.w / 2]), HALF_W + WALL_T]
  for (let i = 0; i < xs.length; i += 2) segs.push({ x0: xs[i], x1: xs[i + 1], y0: 0, y1: WALL_TOP })
  openings.forEach((o) => segs.push({ x0: o.c - o.w / 2, x1: o.c + o.w / 2, y0: o.h, y1: WALL_TOP }))
  return segs.map((s) => ({ ...s, z }))
}

function Walls() {
  const front = wallSegmentsX(HALF_D + WALL_T / 2, [{ c: ENTRANCE.x, w: ENTRANCE.w, h: ENTRANCE.h }, { c: GATE_R.x, w: GATE_R.w, h: GATE_R.h }])
  const back = wallSegmentsX(-HALF_D - WALL_T / 2, DOCKS.map((c) => ({ c, w: DOCK_W, h: DOCK_H })))
  const gable = useMemo(() => {
    const e = HALF_D + WALL_T
    const s = new THREE.Shape()
    s.moveTo(-e, 0)
    s.lineTo(e, 0)
    s.lineTo(e, topY(e) + 0.25)
    s.lineTo(0, RIDGE + 0.25)
    s.lineTo(-e, topY(e) + 0.25)
    s.closePath()
    return new THREE.ExtrudeGeometry(s, { depth: WALL_T, bevelEnabled: false })
  }, [])
  const bim = useStore((s) => s.bim)
  return (
    <group>
      {[...front, ...back].map((s, i) => {
        const len = s.x1 - s.x0
        const h = s.y1 - s.y0
        return (
          <SBox
            key={`w${i}`}
            pos={[(s.x0 + s.x1) / 2, (s.y0 + s.y1) / 2, s.z]}
            size={[len, h, WALL_T]}
            material={wallMat(len, h)}
            bimMaterial={bimWallMat()}
          />
        )
      })}
      {[HALF_W + WALL_T, -HALF_W].map((x) => (
        <mesh key={x} geometry={gable} position={[x, 0, 0]} rotation-y={-Math.PI / 2} material={bim ? bimWallMat() : gableMat()} castShadow={!bim} receiveShadow>
          {bim && <Edges color={BIM_COLOR} threshold={20} />}
        </mesh>
      ))}
      {/* plinths */}
      {[...front, ...back]
        .filter((s) => s.y0 === 0)
        .map((s, i) => (
          <SBox
            key={`p${i}`}
            pos={[(s.x0 + s.x1) / 2, 0.6, s.z]}
            size={[s.x1 - s.x0, 1.2, WALL_T + 0.08]}
            material={plinthMat()}
            bimMaterial={bimWallMat()}
            edges={false}
          />
        ))}
      {[HALF_W + WALL_T / 2, -HALF_W - WALL_T / 2].map((x) => (
        <SBox key={`gp${x}`} pos={[x, 0.6, 0]} size={[WALL_T + 0.08, 1.2, D + WALL_T * 2]} material={plinthMat()} bimMaterial={bimWallMat()} edges={false} />
      ))}
      <Openings />
    </group>
  )
}

function Openings() {
  const zf = HALF_D
  const zb = -HALF_D
  return (
    <group>
      {/* main entrance frame + rolled shutter */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[ENTRANCE.x + s * (ENTRANCE.w / 2 + 0.06), ENTRANCE.h / 2, zf + 0.15]} material={hazardMat()} castShadow>
            <boxGeometry args={[0.14, ENTRANCE.h, 0.32]} />
          </mesh>
          <mesh position={[ENTRANCE.x + s * 3.6, 0.5, zf + 1.4]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1, 12]} />
            <meshStandardMaterial color="#f2c230" roughness={0.5} />
          </mesh>
        </group>
      ))}
      <mesh position={[ENTRANCE.x, ENTRANCE.h + 0.35, zf - 0.35]} rotation-z={Math.PI / 2} material={darkSteelMat()} castShadow>
        <cylinderGeometry args={[0.35, 0.35, ENTRANCE.w + 0.3, 20]} />
      </mesh>
      {/* dock doors */}
      {DOCKS.map((c) => {
        const open = c === OPEN_DOCK
        const shutterH = open ? 0.7 : DOCK_H
        return (
          <group key={c}>
            <mesh position={[c, DOCK_H - shutterH / 2, zb + 0.02]} material={shutterMat(DOCK_W, shutterH)} castShadow receiveShadow>
              <boxGeometry args={[DOCK_W, shutterH, 0.06]} />
            </mesh>
            <mesh position={[c, DOCK_H + 0.32, zb + 0.35]} rotation-z={Math.PI / 2} material={darkSteelMat()} castShadow>
              <cylinderGeometry args={[0.3, 0.3, DOCK_W + 0.2, 16]} />
            </mesh>
            {[-1, 1].map((s) => (
              <group key={s}>
                <mesh position={[c + s * (DOCK_W / 2 + 0.07), DOCK_H / 2, zb + 0.15]} material={hazardMat()} castShadow>
                  <boxGeometry args={[0.14, DOCK_H, 0.3]} />
                </mesh>
                <mesh position={[c + s * (DOCK_W / 2 - 0.2), 0.7, zb - 0.32]} material={rubberMat()} castShadow>
                  <boxGeometry args={[0.28, 0.5, 0.25]} />
                </mesh>
              </group>
            ))}
            <mesh position={[c, 0.012, zb + 1.2]} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[DOCK_W - 0.4, 2.2]} />
              <meshStandardMaterial color="#5f656b" metalness={0.7} roughness={0.5} polygonOffset polygonOffsetFactor={-2} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Columns() {
  const pts = useMemo(() => {
    const p: [number, number][] = []
    TRUSS_X.forEach((x) => {
      const cx = Math.max(-HALF_W + 0.2, Math.min(HALF_W - 0.2, x))
      if (Math.abs(cx - ENTRANCE.x) > ENTRANCE.w / 2 + 0.3 && Math.abs(cx - GATE_R.x) > GATE_R.w / 2 + 0.3) p.push([cx, HALF_D - 0.18])
      if (DOCKS.every((d) => Math.abs(cx - d) > DOCK_W / 2 + 0.3)) p.push([cx, -HALF_D + 0.18])
    })
    ;[-5, 0, 5].forEach((z) => p.push([-HALF_W + 0.2, z], [HALF_W - 0.2, z]))
    return p
  }, [])
  return (
    <group>
      {pts.map(([x, z], i) => {
        const h = Math.abs(z) > 9 ? EAVE : topY(z) - 0.1
        return (
          <group key={i}>
            <SBox pos={[x, h / 2, z]} size={[0.4, h, 0.4]} material={columnMat()} bimMaterial={bimSolidMat()} />
            <SBox pos={[x, 0.8, z]} size={[0.42, 1.6, 0.42]} material={darkSteelMat()} bimMaterial={bimSolidMat()} edges={false} />
            <SBox pos={[x, 0.03, z]} size={[0.6, 0.06, 0.6]} material={darkSteelMat()} bimMaterial={bimSolidMat()} edges={false} />
          </group>
        )
      })}
    </group>
  )
}

function Trusses() {
  const bim = useStore((s) => s.bim)
  const matrices = useMemo(() => {
    const m: THREE.Matrix4[] = []
    const step = 2
    TRUSS_X.forEach((x0) => {
      const x = Math.max(-HALF_W + 0.2, Math.min(HALF_W - 0.2, x0))
      const e = HALF_D - 0.2
      m.push(beam([x, BOTTOM_CHORD, -e], [x, BOTTOM_CHORD, e], 0.16, 0.2))
      m.push(beam([x, topY(e), -e], [x, RIDGE, 0], 0.18, 0.22))
      m.push(beam([x, RIDGE, 0], [x, topY(e), e], 0.18, 0.22))
      for (let z = -HALF_D + step; z < HALF_D; z += step) {
        m.push(beam([x, BOTTOM_CHORD, z], [x, topY(z), z], 0.08))
      }
      for (let z = -HALF_D; z < HALF_D; z += step) {
        const z1 = z + step
        const za = Math.max(-e, z)
        const zb2 = Math.min(e, z1)
        if (z < 0) m.push(beam([x, topY(za), za], [x, BOTTOM_CHORD, zb2], 0.07))
        else m.push(beam([x, BOTTOM_CHORD, za], [x, topY(zb2), zb2], 0.07))
      }
      m.push(beam([x, BOTTOM_CHORD, -e], [x, topY(e), -e], 0.12))
      m.push(beam([x, BOTTOM_CHORD, e], [x, topY(e), e], 0.12))
    })
    for (let z = -HALF_D; z <= HALF_D + 0.01; z += 2) {
      const y = topY(z) + 0.12
      m.push(beam([-HALF_W, y, z], [HALF_W, y, z], 0.14, 0.1))
    }
    m.push(beam([-HALF_W, BOTTOM_CHORD, 0], [HALF_W, BOTTOM_CHORD, 0], 0.1))
    m.push(beam([-HALF_W, BOTTOM_CHORD, -HALF_D + 0.2], [HALF_W, BOTTOM_CHORD, -HALF_D + 0.2], 0.14))
    m.push(beam([-HALF_W, BOTTOM_CHORD, HALF_D - 0.2], [HALF_W, BOTTOM_CHORD, HALF_D - 0.2], 0.14))
    ;[[-HALF_W + 0.2, -10], [10, HALF_W - 0.2]].forEach(([xa, xb]) => {
      ;[-1, 1].forEach((s) => {
        const za = s * 1
        const zb = s * 9
        m.push(beam([xa, topY(za) + 0.12, za], [xb, topY(zb) + 0.12, zb], 0.05))
        m.push(beam([xb, topY(za) + 0.12, za], [xa, topY(zb) + 0.12, zb], 0.05))
      })
    })
    return m
  }, [])
  return <InstancedBoxes matrices={matrices} material={bim ? bimWireMat() : steelMat()} castShadow={!bim} />
}

type RoofPiece = { x: number; z: number; sx: number; len: number; side: number; sky: boolean }

function roofPieces() {
  const p: RoofPiece[] = []
  const cosA = Math.cos(ROOF_ANGLE)
  const strips: [number, number, boolean][] = [
    [0, 3, false],
    [3, 6.2, true],
    [6.2, HALF_D + 0.45, false],
  ]
  ;[-1, 1].forEach((side) => {
    strips.forEach(([a, b, band]) => {
      const z = (side * (a + b)) / 2
      const len = (b - a) / cosA
      if (!band) {
        p.push({ x: 0, z, sx: W + 0.7, len, side, sky: false })
        return
      }
      BAY_CENTERS.forEach((c, i) => {
        if (SKYLIGHT_BAYS.includes(i)) {
          p.push({ x: c, z, sx: 3, len, side, sky: true })
          const edge = i === 0 ? 0.35 : 0
          const edge2 = i === BAY_CENTERS.length - 1 ? 0.35 : 0
          p.push({ x: c - 2 - edge / 2, z, sx: 1 + edge, len, side, sky: false })
          p.push({ x: c + 2 + edge2 / 2, z, sx: 1 + edge2, len, side, sky: false })
        } else {
          const extra = i === 0 || i === BAY_CENTERS.length - 1 ? 0.35 : 0
          p.push({ x: c + (i === 0 ? -extra / 2 : extra / 2), z, sx: 5 + extra, len, side, sky: false })
        }
      })
    })
  })
  return p
}

function Roof() {
  const bim = useStore((s) => s.bim)
  const cut = useStore((s) => s.cutRoof)
  const pieces = useMemo(roofPieces, [])
  if (cut) return null
  return (
    <group>
      {pieces.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, topY(p.z) + (p.sky ? 0.24 : 0.23), p.z]}
          rotation-x={p.side * ROOF_ANGLE}
          material={bim ? bimRoofMat() : p.sky ? skylightMat() : roofMat()}
          castShadow={!p.sky && !bim}
          receiveShadow
        >
          <boxGeometry args={[p.sx, p.sky ? 0.03 : 0.06, p.len]} />
          {bim && !p.sky && <Edges color={BIM_COLOR} threshold={20} />}
        </mesh>
      ))}
      <mesh position={[0, RIDGE + 0.32, 0]} rotation-x={Math.PI / 4} material={bim ? bimRoofMat() : steelMat()} castShadow={!bim}>
        <boxGeometry args={[W + 0.7, 0.3, 0.3]} />
      </mesh>
    </group>
  )
}

const shaftShader = {
  uniforms: { uColor: { value: new THREE.Color('#fff4dc') }, uOpacity: { value: 0.05 }, uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    attribute float aT; attribute float aH;
    varying float vT; varying float vH; varying vec3 vW;
    void main() { vT = aT; vH = aH; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor; uniform float uOpacity; uniform float uTime;
    varying float vT; varying float vH; varying vec3 vW;
    void main() {
      float edge = 1.0 - smoothstep(0.15, 0.5, abs(vH));
      float grad = mix(0.12, 1.0, pow(vT, 1.4));
      float dust = 0.85 + 0.15 * sin(vW.y * 3.0 + vW.x * 1.7 + uTime * 0.6);
      gl_FragColor = vec4(uColor, uOpacity * edge * grad * dust);
    }
  `,
}

function shaftGeometry(cx: number, cz: number, yTop: number, sx: number, sz: number) {
  const off = new THREE.Vector3(-SUN_DIR[0], 0, -SUN_DIR[2]).multiplyScalar(yTop / SUN_DIR[1])
  const corners = [
    [-sx / 2, -sz / 2],
    [sx / 2, -sz / 2],
    [sx / 2, sz / 2],
    [-sx / 2, sz / 2],
  ]
  const pos: number[] = []
  const t: number[] = []
  const h: number[] = []
  const idx: number[] = []
  for (let f = 0; f < 4; f++) {
    const a = corners[f]
    const b = corners[(f + 1) % 4]
    const base = pos.length / 3
    pos.push(cx + a[0], yTop, cz + a[1], cx + b[0], yTop, cz + b[1])
    pos.push(cx + b[0] + off.x, 0.02, cz + b[1] + off.z, cx + a[0] + off.x, 0.02, cz + a[1] + off.z)
    t.push(1, 1, 0, 0)
    h.push(-0.5, 0.5, 0.5, -0.5)
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1))
  g.setAttribute('aH', new THREE.Float32BufferAttribute(h, 1))
  g.setIndex(idx)
  g.computeBoundingSphere()
  return g
}

function LightShafts() {
  const cut = useStore((s) => s.cutRoof)
  const bim = useStore((s) => s.bim)
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        ...shaftShader,
        uniforms: THREE.UniformsUtils.clone(shaftShader.uniforms),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  )
  const geos = useMemo(() => {
    const g: THREE.BufferGeometry[] = []
    ;[-1, 1].forEach((side) => {
      const zc = side * 4.6
      SKYLIGHT_BAYS.forEach((b) => g.push(shaftGeometry(BAY_CENTERS[b], zc, topY(zc) + 0.1, 2.9, 3.1)))
    })
    return g
  }, [])
  const ref = useRef(mat)
  useFrame((_, dt) => {
    ref.current.uniforms.uTime.value += dt
  })
  if (cut || bim) return null
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mat} renderOrder={10} frustumCulled={false} />
      ))}
    </group>
  )
}

export function Building() {
  return (
    <group>
      <Floor />
      <Walls />
      <Columns />
      <Trusses />
      <Roof />
      <LightShafts />
    </group>
  )
}
