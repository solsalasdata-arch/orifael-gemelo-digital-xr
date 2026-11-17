import { Html, Line } from '@react-three/drei'
import { BOTTOM_CHORD, EAVE, HALF_D, HALF_W, RIDGE, TRUSS_X } from '../data'
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
      <Html center position={mid} zIndexRange={[15, 5]} style={{ pointerEvents: 'none' }}>
        <div className="whitespace-nowrap rounded-md border border-bim/60 bg-black/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-bim">{label}</div>
      </Html>
    </group>
  )
}

export function Dimensions() {
  const bim = useStore((s) => s.bim)
  const mode = useStore((s) => s.mode)
  if (!bim && mode !== 'orbit') return null
  return (
    <group>
      <Dim a={[-HALF_W, 0, HALF_D]} b={[HALF_W, 0, HALF_D]} offset={[0, 0, 3]} label="30,00 m · Frente Gdor. Tello" />
      <Dim a={[HALF_W, 0, HALF_D]} b={[HALF_W, 0, -HALF_D]} offset={[2.5, 0, 0]} label="20,00 m · Luz libre" />
      <Dim a={[HALF_W, 0, 0]} b={[HALF_W, RIDGE, 0]} offset={[2.5, 0, 0]} label="8,00 m · Cumbrera" />
      {bim && (
        <>
          <Dim a={[-HALF_W, 0, -HALF_D]} b={[-HALF_W, EAVE, -HALF_D]} offset={[-2, 0, 0]} label="6,90 m · Alero" />
          <Dim a={[0, BOTTOM_CHORD, -HALF_D]} b={[0, BOTTOM_CHORD, HALF_D]} offset={[0, -0.6, 0]} label="Cabriada reticulada · L = 20 m" />
          {TRUSS_X.map((x, i) => (
            <Html key={x} center position={[Math.max(-HALF_W + 0.2, Math.min(HALF_W - 0.2, x)), 0.05, HALF_D + 1.2]} style={{ pointerEvents: 'none' }}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-bim bg-black/70 font-mono text-[11px] font-bold text-bim">{i + 1}</div>
            </Html>
          ))}
        </>
      )}
    </group>
  )
}
