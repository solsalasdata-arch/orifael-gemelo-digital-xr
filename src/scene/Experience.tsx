import { LOW_POWER } from '../device'
import { ContactShadows, Environment } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { IN_X, IN_Z, ORBIT_FOV, ORBIT_VIEW, SIDEWALK, SUN_DIR, WALK_FOV } from '../data'
import { useStore } from '../store'
import { Shell } from './Shell'
import { Dimensions } from './Dimensions'
import { Hotspots } from './Hotspots'
import { INITIAL_CAMERA, Navigation } from './Navigation'
import { RealSite } from './RealSite'
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
const HDRI = `${import.meta.env.BASE_URL}hdri/overcast_1k.hdr`
const FOG = '#c5c9cd'

function Lights() {
  const bim = useStore((s) => s.bim)
  return (
    <>
      <hemisphereLight args={['#e4ebf2', '#5f6164', bim ? 0.95 : 0.45]} />
      <directionalLight
        position={SUN_POS}
        intensity={2.6}
        color="#f3f6fa"
        castShadow
        shadow-mapSize={LOW_POWER ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={10}
        shadow-camera-far={120}
        shadow-radius={6}
        shadow-blurSamples={16}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
    </>
  )
}

function FogControl() {
  const fog = useThree((s) => s.scene.fog) as THREE.Fog | null
  const target = useMemo(() => new THREE.Vector3(...ORBIT_VIEW.target), [])
  useFrame(({ camera }) => {
    if (!fog) return
    const { mode, flight } = useStore.getState()
    const orbit = (flight ? flight.toMode : mode) === 'orbit' || camera.position.y > 12
    const d = orbit ? camera.position.distanceTo(target) : 0
    fog.near = orbit ? d * 0.85 : 22
    fog.far = orbit ? d + 80 : 80
  })
  return null
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
      <FogControl />
      <color attach="background" args={[FOG]} />
      <fog attach="fog" args={[FOG, 22, 80]} />
      <Environment files={HDRI} background backgroundIntensity={0.95} environmentIntensity={clay ? 0.45 : 0.7} />
      <Lights />
      <Shell />
      <RealSite />
      {!LOW_POWER && <ContactShadows position={[0, 0.012, 0]} scale={[2 * IN_X, 2 * IN_Z]} resolution={1024} far={1.6} blur={2.4} opacity={0.55} frames={2} color="#1b1814" />}
      {!LOW_POWER && <ContactShadows position={[0, SIDEWALK.curb + 0.004, (SIDEWALK.z0 + SIDEWALK.z1) / 2]} scale={[16, 5]} resolution={512} far={1.6} blur={2} opacity={0.5} frames={2} color="#1b1814" />}
      <Hotspots />
      <Dimensions />
      <Navigation />
      <ClayMode />
      <PostFX />
    </>
  )
}
