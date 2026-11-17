import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import { Suspense } from 'react'
import * as THREE from 'three'
import { Experience } from './scene/Experience'
import { HUD } from './ui/HUD'
import { xrStore } from './xr'


export default function App() {
  return (
    <div className="relative h-full w-full">
      <Canvas
        className="no-select"
        shadows="percentage"
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 70, near: 0.05, far: 900, position: [0, 1.7, 30] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.0
        }}
      >
        <XR store={xrStore}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </XR>
      </Canvas>
      <HUD />
    </div>
  )
}
