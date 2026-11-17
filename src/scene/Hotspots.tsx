import { Billboard, Html } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { HOTSPOTS, PHOTOS, PHOTO_KEYS, photoSrc, thumbSrc, type Hotspot, type PhotoKey } from '../data'
import { useStore } from '../store'

function Marker({ h }: { h: Hotspot }) {
  const active = useStore((s) => s.hotspot === h.id)
  const aimed = useStore((s) => s.aimHotspot === h.id)
  const ring = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (ring.current) {
      const k = (t * 0.7 + h.id.charCodeAt(0) * 0.13) % 1
      ring.current.scale.setScalar(1 + k * 1.6)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - k)
    }
    if (core.current) core.current.position.y = Math.sin(t * 2 + h.id.charCodeAt(0)) * 0.06
  })
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 6) return
    const s = useStore.getState()
    s.set({ hotspot: s.hotspot === h.id ? null : h.id })
  }
  const big = active || aimed
  return (
    <group position={h.pos}>
      <group ref={core}>
        <mesh
          userData={{ hotspot: h.id }}
          onClick={onClick}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => (document.body.style.cursor = '')}
          scale={big ? 1.25 : 1}
        >
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshBasicMaterial color={active ? '#ffffff' : '#A8E6CF'} toneMapped={false} />
        </mesh>
        <mesh scale={0.34}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color="#A8E6CF" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
        </mesh>
        <Billboard>
          <mesh ref={ring}>
            <ringGeometry args={[0.3, 0.36, 40]} />
            <meshBasicMaterial color="#A8E6CF" transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </Billboard>
        <Html center position={[0, 0.48, 0]} zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-full border border-mint/40 bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-mint backdrop-blur">
            {h.id} · {h.label}
          </div>
        </Html>
      </group>
      {active && (
        <Html position={[0, 0.3, 0]} zIndexRange={[40, 30]} style={{ pointerEvents: 'auto' }}>
          <div className="glass relative ml-6 w-80 -translate-y-1/2 rounded-2xl p-4 text-sm text-slate-100">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-md bg-bordo px-2 py-0.5 text-[11px] font-bold tracking-wide text-mint">HOTSPOT {h.id} · {h.zone.toUpperCase()}</span>
              <button
                className="rounded-md px-2 text-lg leading-none text-slate-300 hover:bg-white/10 hover:text-white"
                onClick={() => useStore.getState().set({ hotspot: null })}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="text-base font-bold text-white">{h.title}</div>
            <p className="mt-1 leading-snug text-mint">{h.body}</p>
            <div className="mt-3 grid grid-cols-1 gap-1 border-t border-white/10 pt-2">
              {h.details.map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-mono text-slate-100">{v}</span>
                </div>
              ))}
            </div>
            <PhotoCompare h={h} />
          </div>
        </Html>
      )}
    </group>
  )
}

function PhotoCompare({ h }: { h: Hotspot }) {
  const [sel, setSel] = useState<PhotoKey>(h.photo)
  const p = PHOTOS[sel]
  const keys = PHOTO_KEYS.filter((k) => PHOTOS[k].zone === PHOTOS[h.photo].zone)
  return (
    <div className="mt-3 border-t border-white/10 pt-2">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-mint/80">Relevamiento Fotográfico Real vs. Gemelo Digital XR</div>
      <div className="relative overflow-hidden rounded-xl ring-1 ring-white/10">
        <img src={photoSrc(sel)} alt={p.caption} className="h-44 w-full object-cover" draggable={false} />
        <span className="absolute top-1.5 left-1.5 rounded bg-bordo/90 px-1.5 py-0.5 text-[10px] font-bold text-mint">FOTO REAL</span>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 pt-5 pb-1.5 text-[11px] leading-snug text-white">{p.caption}</div>
      </div>
      <div className="mt-1.5 grid grid-cols-5 gap-1">
        {keys.map((k) => (
          <button key={k} onClick={() => setSel(k)} className={`overflow-hidden rounded-md ring-2 transition ${k === sel ? 'ring-mint' : 'ring-transparent opacity-60 hover:opacity-100'}`}>
            <img src={thumbSrc(k)} alt={PHOTOS[k].short} className="h-10 w-full object-cover" draggable={false} />
          </button>
        ))}
      </div>
      <p className="mt-2 rounded-lg bg-mint/10 px-2 py-1.5 text-[11px] leading-snug text-slate-200">
        <span className="font-bold text-mint">Gemelo XR: </span>
        {h.twin}
      </p>
    </div>
  )
}

export function Hotspots() {
  return (
    <group>
      {HOTSPOTS.map((h) => (
        <Marker key={h.id} h={h} />
      ))}
    </group>
  )
}
