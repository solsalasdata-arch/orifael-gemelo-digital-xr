import { Html, Line } from '@react-three/drei'
import { FASCIA, HALF_D, HALF_W, SIDEWALK, SLAB_Y } from '../data'
import { BIM_COLOR } from '../materials'
import { useStore } from '../store'

type V = [number, number, number]

function Dim({ a, b, label, offset = [0, 0, 0] }: { a: V; b: V; label: string; offset?: V }) {
  const pa: V = [a[0] + offset[0], a[1] + offset[1], a[2] + offset[2]]
  const pb: V = [b[0] + offset[0], b[1] + offset[1], b[2] + offset[2]]
  const mid: V = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, (pa[2] + pb[2]) / 2]
  return (
    <group>
      <Line points={[pa, pb]} color={BIM_COLOR} lineWidth={2} transparent opacity={0.95} />
      <Line points={[a, pa]} color={BIM_COLOR} lineWidth={1} dashed dashSize={0.2} gapSize={0.15} />
      <Line points={[b, pb]} color={BIM_COLOR} lineWidth={1} dashed dashSize={0.2} gapSize={0.15} />
      <Html center position={mid} zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap rounded-[2px] border border-bim/60 bg-black/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-bim">{label}</div>
      </Html>
    </group>
  )
}

export function Dimensions() {
  const bim = useStore((s) => s.bim)
  const cad = useStore((s) => s.cadLabels)
  if (!bim && !cad) return null
  return (
    <group>
      <Dim a={[-HALF_W, 0.2, SIDEWALK.z1]} b={[HALF_W, 0.2, SIDEWALK.z1]} offset={[0, 0, 1.2]} label="13,00 m · Frente Gdor. Tello" />
      <Dim a={[HALF_W, FASCIA.y1, HALF_D]} b={[HALF_W, FASCIA.y1, -HALF_D]} offset={[1.5, 0, 0]} label="30,00 m · Fondo" />
      <Dim a={[-HALF_W, 0, -HALF_D]} b={[-HALF_W, SLAB_Y, -HALF_D]} offset={[-1.2, 0, 0]} label="4,60 m · Losa" />
      <Dim a={[HALF_W + 0.8, 0.2, HALF_D]} b={[HALF_W + 0.8, 0.2, SIDEWALK.z1]} offset={[0.8, 0, 0]} label="5,00 m · Playón" />
      {bim && <Dim a={[-HALF_W - 0.8, FASCIA.y1, HALF_D]} b={[-HALF_W - 0.8, FASCIA.y1, HALF_D + FASCIA.overhang]} offset={[0, 0.6, 0]} label="Alero 1,00 m" />}
    </group>
  )
}
