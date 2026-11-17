import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import { Suspense } from 'react'
import * as THREE from 'three'
import { Experience } from './scene/Experience'
import { HUD } from './ui/HUD'
import { LOW_POWER } from './device'
import { xrStore } from './xr'


export default function App() {
  return (
    <div className="relative h-full w-full">
      <Canvas
        className="no-select"
        shadows="percentage"
        dpr={LOW_POWER ? [1, 1.25] : [1, 1.75]}
        gl={{ antialias: !LOW_POWER, powerPreference: LOW_POWER ? 'default' : 'high-performance' }}
        camera={{ fov: 70, near: 0.05, far: 900, position: [0, 1.7, 30] }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.0
          gl.domElement.addEventListener('webglcontextlost', () => window.setTimeout(() => window.location.reload(), 600))
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
