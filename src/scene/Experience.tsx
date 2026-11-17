import { Environment, Lightformer } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BAY_CENTERS, BOTTOM_CHORD, ORBIT_FOV, SUN_DIR, WALK_FOV } from '../data'
import { useStore } from '../store'
import { Building } from './Building'
import { Dimensions } from './Dimensions'
import { Hotspots } from './Hotspots'
import { INITIAL_CAMERA, Navigation } from './Navigation'
import { Racks } from './Racks'
import { RealSite } from './RealSite'
import { Zones } from './Zones'
import { EffectComposer, HueSaturation, N8AO, SMAA, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

const CLAY = new THREE.MeshStandardMaterial({ color: '#9f9c96', roughness: 0.9, metalness: 0 })
const CLAY_DARK = new THREE.MeshStandardMaterial({ color: '#6f7271', roughness: 0.7, metalness: 0.1 })
const CLAY_GLASS = new THREE.MeshStandardMaterial({ color: '#cfd8de', roughness: 0.2, transparent: true, opacity: 0.35 })

function ClayMode() {
  const clay = useStore((s) => s.clay)
  const bim = useStore((s) => s.bim)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const swap = () =>
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        const ud = m.userData as { clayOrig?: THREE.Material | THREE.Material[]; clayIC?: THREE.InstancedBufferAttribute }
        const im = m as THREE.InstancedMesh
        if (!clay) {
          if (ud.clayOrig) {
            m.material = ud.clayOrig
            delete ud.clayOrig
          }
          if (ud.clayIC) {
            im.instanceColor = ud.clayIC
            delete ud.clayIC
          }
          return
        }
        if (ud.clayOrig) return
        const mat = m.material as THREE.Material
        if (Array.isArray(m.material) || !(mat instanceof THREE.MeshStandardMaterial)) return
        if (mat.wireframe || (mat.transparent && mat.opacity < 0.6 && !mat.map)) return
        ud.clayOrig = mat
        if (im.isInstancedMesh && im.instanceColor) {
          ud.clayIC = im.instanceColor
          im.instanceColor = null
        }
        const lum = mat.color.r * 0.3 + mat.color.g * 0.59 + mat.color.b * 0.11
        m.material = mat.transparent ? CLAY_GLASS : mat.metalness > 0.5 && lum < 0.35 ? CLAY_DARK : CLAY
      })
    swap()
    if (!clay) return
    const id = window.setInterval(swap, 1500)
    return () => window.clearInterval(id)
  }, [clay, bim, scene])
  return null
}

const FORCE_AO = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('ao')

function PostFX() {
  const ao = useStore((s) => s.ao)
  const inXR = useStore((s) => s.inXR)
  const clay = useStore((s) => s.clay)
  const low = useRef(0)
  useFrame((_, dt) => {
    const st = useStore.getState()
    if (!st.ao || FORCE_AO) return
    const fps = st.stats.fps
    low.current = fps > 0 && fps < 24 ? low.current + dt : 0
    if (low.current > 4) st.set({ ao: false })
  })
  if (inXR || !ao) return null
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO aoRadius={1.6} intensity={clay ? 3.2 : 2.2} distanceFalloff={0.6} quality="medium" halfRes />
      <HueSaturation saturation={clay ? 0 : -0.18} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  )
}

const SUN_POS: [number, number, number] = [SUN_DIR[0] * 60, SUN_DIR[1] * 60, SUN_DIR[2] * 60]

function Lights() {
  const bim = useStore((s) => s.bim)
  return (
    <>
      <hemisphereLight args={['#e4ebf2', '#5f6164', bim ? 0.95 : 0.6]} />
      <directionalLight
        position={SUN_POS}
        intensity={3.2}
        color="#f3f6fa"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={10}
        shadow-camera-far={120}
        shadow-radius={6}
        shadow-blurSamples={16}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      {[BAY_CENTERS[1], BAY_CENTERS[4]].flatMap((x) =>
        [-6.5, 0, 6.5].map((z) => (
          <pointLight key={`${x}${z}`} position={[x, BOTTOM_CHORD - 0.7, z]} intensity={30} distance={20} decay={1.6} color="#f4f1ea" />
        )),
      )}
      <pointLight position={[-10.5, 3.2, 7.6]} intensity={10} distance={9} decay={1.6} color="#f1f4f8" />
    </>
  )
}

function SkyDome() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 512
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 512)
    g.addColorStop(0, '#8d949b')
    g.addColorStop(0.35, '#b4b9be')
    g.addColorStop(0.5, '#cdd0d3')
    g.addColorStop(0.56, '#b8bbbe')
    g.addColorStop(1, '#8f9295')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 512)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <mesh scale={600} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function LensControl() {
  useFrame(({ camera }, dt) => {
    if (!(camera instanceof THREE.PerspectiveCamera) || useStore.getState().inXR) return
    const { mode, flight } = useStore.getState()
    const goal = (flight ? flight.toMode : mode) === 'orbit' ? ORBIT_FOV : WALK_FOV
    if (Math.abs(camera.fov - goal) < 0.05) return
    camera.fov = THREE.MathUtils.damp(camera.fov, goal, 3, dt)
    camera.updateProjectionMatrix()
  })
  return null
}

function CameraInit() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(...INITIAL_CAMERA.pos)
    camera.lookAt(new THREE.Vector3(...INITIAL_CAMERA.look))
  }, [camera])
  return null
}

export function Experience() {
  const clay = useStore((s) => s.clay)
  return (
    <>
      <CameraInit />
      <LensControl />
      <color attach="background" args={['#c0c3c6']} />
      <fog attach="fog" args={['#c3c4c4', 150, 520]} />
      <SkyDome />
      <Environment resolution={256} frames={1} environmentIntensity={clay ? 0.45 : 0.7}>
        <Lightformer form="rect" intensity={3} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[30, 6, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[0, 3, 12]} scale={[20, 3, 1]} />
        <Lightformer form="rect" intensity={1.0} color="#e6ebf0" position={[-14, 4, 0]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#eef2f6" position={[14, 4, 0]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>
      <Lights />
      <Building />
      <Racks />
      <Zones />
      <RealSite />
      <Hotspots />
      <Dimensions />
      <Navigation />
      <ClayMode />
      <PostFX />
    </>
  )
}
