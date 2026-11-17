import { Environment, Lightformer } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
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

const SUN_POS: [number, number, number] = [SUN_DIR[0] * 60, SUN_DIR[1] * 60, SUN_DIR[2] * 60]

function Lights() {
  const bim = useStore((s) => s.bim)
  return (
    <>
      <hemisphereLight args={['#dfe4ea', '#5d564e', bim ? 0.9 : 0.5]} />
      <directionalLight
        position={SUN_POS}
        intensity={3.8}
        color="#ffd3a1"
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
      <pointLight position={[-10.5, 3.2, 7.6]} intensity={10} distance={9} decay={1.6} color="#ffe2c2" />
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
    g.addColorStop(0, '#7f8b97')
    g.addColorStop(0.32, '#a9b1b9')
    g.addColorStop(0.47, '#d3cdc4')
    g.addColorStop(0.5, '#ddcdb8')
    g.addColorStop(0.53, '#b9b6b1')
    g.addColorStop(1, '#8e8b86')
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
  return (
    <>
      <CameraInit />
      <LensControl />
      <color attach="background" args={['#bfc2c5']} />
      <fog attach="fog" args={['#c3c4c4', 150, 520]} />
      <SkyDome />
      <Environment resolution={256} frames={1} environmentIntensity={0.7}>
        <Lightformer form="rect" intensity={3} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[30, 6, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[0, 3, 12]} scale={[20, 3, 1]} />
        <Lightformer form="rect" intensity={1.0} color="#e6ebf0" position={[-14, 4, 0]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffd2a0" position={[14, 4, 0]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>
      <Lights />
      <Building />
      <Racks />
      <Zones />
      <RealSite />
      <Hotspots />
      <Dimensions />
      <Navigation />
    </>
  )
}
