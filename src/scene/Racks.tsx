import { useMemo } from 'react'
import * as THREE from 'three'
import { RACK_BAYS, RACK_BAY_LEN, RACK_BEAMS, RACK_H, RACK_LEVELS, RACK_ROWS, RACK_Z0, RACK_Z1 } from '../data'
import { boxMat, palletMat, woodShelfMat, yellowMat } from '../materials'
import { rng } from '../textures'
import { InstancedBoxes, beam, boxAt } from './Instanced'

const TINTS = ['#ffffff', '#f3e7d6', '#e6d3b8', '#fff3e3', '#dcc7a8']

type Stock = { pallets: THREE.Matrix4[]; boxes: [THREE.Matrix4[], THREE.Matrix4[]]; tints: [THREE.Color[], THREE.Color[]] }

function fillPallet(s: Stock, r: () => number, x: number, y: number, z: number, maxLayers: number, ry = 0) {
  s.pallets.push(boxAt(x, y + 0.07, z, 1.0, 0.14, 1.15, ry))
  const layers = 1 + Math.floor(r() * maxLayers)
  const variant = r() > 0.72 ? 1 : 0
  for (let l = 0; l < layers; l++) {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (l === layers - 1 && r() < 0.18) continue
        const jx = (r() - 0.5) * 0.03
        const jz = (r() - 0.5) * 0.03
        const bx = x + (i - 0.5) * 0.5 + jx
        const bz = z + (j - 0.5) * 0.56 + jz
        s.boxes[variant].push(boxAt(bx, y + 0.14 + 0.185 + l * 0.37, bz, 0.47, 0.36, 0.54, ry + (r() - 0.5) * 0.06))
        s.tints[variant].push(new THREE.Color(TINTS[Math.floor(r() * TINTS.length)]))
      }
    }
  }
}

export function Racks() {
  const data = useMemo(() => {
    const r = rng(437)
    const uprights: THREE.Matrix4[] = []
    const beams: THREE.Matrix4[] = []
    const guards: THREE.Matrix4[] = []
    const decks: THREE.Matrix4[] = []
    const stock: Stock = { pallets: [], boxes: [[], []], tints: [[], []] }
    RACK_ROWS.forEach((c) => {
      ;[-1, 1].forEach((side) => {
        const rx = c + side * 0.65
        const faces = [rx - 0.5, rx + 0.5]
        for (let k = 0; k <= RACK_BAYS; k++) {
          const z = RACK_Z0 + k * RACK_BAY_LEN
          faces.forEach((fx) => uprights.push(boxAt(fx, RACK_H / 2, z, 0.1, RACK_H, 0.1)))
          const steps = 6
          for (let s = 0; s < steps; s++) {
            const y0 = 0.15 + (s * (RACK_H - 0.3)) / steps
            const y1 = 0.15 + ((s + 1) * (RACK_H - 0.3)) / steps
            const a = s % 2 === 0 ? faces[0] : faces[1]
            const b = s % 2 === 0 ? faces[1] : faces[0]
            uprights.push(beam([a, y0, z], [b, y1, z], 0.035))
          }
        }
        for (let b = 0; b < RACK_BAYS; b++) {
          const z0 = RACK_Z0 + b * RACK_BAY_LEN
          RACK_BEAMS.forEach((y) => {
            faces.forEach((fx) => beams.push(boxAt(fx, y, z0 + RACK_BAY_LEN / 2, 0.06, 0.13, RACK_BAY_LEN - 0.09)))
            decks.push(boxAt(rx, y + 0.085, z0 + RACK_BAY_LEN / 2, 1.04, 0.035, RACK_BAY_LEN - 0.1))
          })
          RACK_LEVELS.forEach((ly, li) => {
            for (let p = 0; p < 2; p++) {
              if (r() < 0.07) continue
              fillPallet(stock, r, rx, ly + (li === 0 ? 0 : 0.02), z0 + 0.65 + p * 1.2, 3)
            }
          })
        }
      })
      ;[RACK_Z0 - 0.12, RACK_Z1 + 0.12].forEach((z) => {
        guards.push(boxAt(c, 0.25, z, 2.5, 0.12, 0.1))
        guards.push(boxAt(c, 0.55, z, 2.5, 0.12, 0.1))
        ;[-1.2, 1.2].forEach((dx) => guards.push(boxAt(c + dx, 0.4, z, 0.1, 0.8, 0.1)))
      })
    })
    const staged: [number, number, number][] = [
      [6.2, -8.7, 0.1], [12.5, 7.3, 0.03],
    ]
    staged.forEach(([x, z, ry]) => fillPallet(stock, r, x, 0, z, 4, ry))
    return { uprights, beams, guards, decks, stock }
  }, [])

  return (
    <group>
      <InstancedBoxes matrices={data.uprights} material={woodShelfMat(0)} />
      <InstancedBoxes matrices={data.beams} material={woodShelfMat(1)} />
      <InstancedBoxes matrices={data.decks} material={woodShelfMat(2)} />
      <InstancedBoxes matrices={data.guards} material={yellowMat()} />
      <InstancedBoxes matrices={data.stock.pallets} material={palletMat()} />
      <InstancedBoxes matrices={data.stock.boxes[0]} colors={data.stock.tints[0]} material={boxMat(0)} />
      <InstancedBoxes matrices={data.stock.boxes[1]} colors={data.stock.tints[1]} material={boxMat(1)} />
    </group>
  )
}
