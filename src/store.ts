import { create } from 'zustand'
import { HOTSPOTS, ORBIT_VIEW, WAYPOINTS, EYE, type V3 } from './data'

export type Mode = 'walk' | 'orbit'

export type Flight = {
  id: number
  label: string
  pos: V3
  look: V3
  toMode: Mode
  eye: number
}

type Stats = { fps: number; tris: number; calls: number; geometries: number; textures: number }
type Player = { x: number; y: number; z: number; dx: number; dz: number }

type State = {
  started: boolean
  hudOpen: boolean
  mode: Mode
  bim: boolean
  cutRoof: boolean
  reflections: boolean
  clay: boolean
  ao: boolean
  hotspot: string | null
  aimHotspot: string | null
  flight: Flight | null
  eye: number
  locked: boolean
  inXR: boolean
  stats: Stats
  player: Player
  touch: { x: number; z: number; y: number }
  start: () => void
  toggleHud: () => void
  set: (p: Partial<State>) => void
  flyTo: (f: Omit<Flight, 'id'>) => void
  goWaypoint: (id: number) => void
  goMode: (m: Mode) => void
  openHotspot: (id: string, travel?: boolean) => void
}

let flightId = 0

export const useStore = create<State>((set, get) => ({
  started: false,
  hudOpen: typeof window !== 'undefined' ? window.innerWidth > 900 : true,
  mode: 'walk',
  bim: false,
  cutRoof: false,
  reflections: true,
  clay: false,
  ao: true,
  hotspot: null,
  aimHotspot: null,
  flight: null,
  eye: EYE,
  locked: false,
  inXR: false,
  stats: { fps: 0, tris: 0, calls: 0, geometries: 0, textures: 0 },
  player: { x: 0, y: EYE, z: 17, dx: 0, dz: -1 },
  touch: { x: 0, z: 0, y: 0 },
  start: () => set({ started: true }),
  toggleHud: () => set((s) => ({ hudOpen: !s.hudOpen })),
  set: (p) => set(p),
  flyTo: (f) => {
    flightId += 1
    if (document.pointerLockElement) document.exitPointerLock()
    set({ flight: { ...f, id: flightId } })
  },
  goWaypoint: (id) => {
    const w = WAYPOINTS.find((p) => p.id === id)
    if (!w) return
    get().flyTo({ label: `${w.id}. ${w.title}`, pos: w.pos, look: w.look, toMode: 'walk', eye: w.pos[1] })
  },
  goMode: (m) => {
    if (m === 'orbit') {
      get().flyTo({ label: 'Vista Orbital · Maqueta', pos: ORBIT_VIEW.pos, look: ORBIT_VIEW.target, toMode: 'orbit', eye: EYE })
    } else {
      get().goWaypoint(1)
    }
  },
  openHotspot: (id, travel = false) => {
    set({ hotspot: id })
    if (!travel) return
    const h = HOTSPOTS.find((p) => p.id === id)
    if (!h) return
    get().flyTo({ label: `Hotspot ${h.id} · ${h.label}`, pos: h.view.pos, look: h.view.look, toMode: 'walk', eye: h.view.pos[1] })
  },
}))

if (typeof window !== 'undefined') (window as unknown as { orifaelStore: typeof useStore }).orifaelStore = useStore
