import { Environment, Lightformer, Sky } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { BAY_CENTERS, BOTTOM_CHORD, SUN_DIR } from '../data'
import { useStore } from '../store'
import { Building } from './Building'
import { Dimensions } from './Dimensions'
import { Hotspots } from './Hotspots'
import { INITIAL_CAMERA, Navigation } from './Navigation'
import { Racks } from './Racks'
import { Zones } from './Zones'

const SUN_POS: [number, number, number] = [SUN_DIR[0] * 60, SUN_DIR[1] * 60, SUN_DIR[2] * 60]

function Lights() {
  const bim = useStore((s) => s.bim)
  return (
    <>
      <hemisphereLight args={['#e4eefa', '#6f6355', bim ? 0.9 : 0.75]} />
      <directionalLight
        position={SUN_POS}
        intensity={3.2}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={10}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
      {[BAY_CENTERS[1], BAY_CENTERS[4]].flatMap((x) =>
        [-6.5, 0, 6.5].map((z) => (
          <pointLight key={`${x}${z}`} position={[x, BOTTOM_CHORD - 0.7, z]} intensity={38} distance={20} decay={1.6} color="#fff1dc" />
        )),
      )}
      <pointLight position={[-10.5, 3.2, 7.6]} intensity={10} distance={9} decay={1.6} color="#ffe2c2" />
    </>
  )
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
      <color attach="background" args={['#a9c4dc']} />
      <fog attach="fog" args={['#c9d6e2', 90, 260]} />
      <Sky distance={4500} sunPosition={SUN_POS} turbidity={5} rayleigh={1.1} mieCoefficient={0.004} mieDirectionalG={0.85} />
      <Environment resolution={256} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={3} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[30, 6, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[0, 3, 12]} scale={[20, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#A8E6CF" position={[-14, 4, 0]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd9b0" position={[14, 4, 0]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} />
      </Environment>
      <Lights />
      <Building />
      <Racks />
      <Zones />
      <Hotspots />
      <Dimensions />
      <Navigation />
    </>
  )
}
