export type V3 = [number, number, number]

export const W = 30
export const D = 20
export const HALF_W = W / 2
export const HALF_D = D / 2
export const BOTTOM_CHORD = 6.5
export const EAVE = 6.9
export const RIDGE = 8
export const WALL_T = 0.25

export const topY = (z: number) => EAVE + (RIDGE - EAVE) * (1 - Math.abs(z) / HALF_D)
export const ROOF_ANGLE = Math.atan((RIDGE - EAVE) / HALF_D)

export const TRUSS_X = [-15, -10, -5, 0, 5, 10, 15]
export const BAY_CENTERS = [-12.5, -7.5, -2.5, 2.5, 7.5, 12.5]
export const SKYLIGHT_BAYS = [1, 2, 3, 4]

export const RACK_ROWS = [-9, -3, 3, 9]
export const RACK_Z0 = -5.5
export const RACK_BAYS = 4
export const RACK_BAY_LEN = 2.5
export const RACK_Z1 = RACK_Z0 + RACK_BAYS * RACK_BAY_LEN
export const RACK_HALF_DEPTH = 1.2
export const RACK_H = 4.6
export const RACK_BEAMS = [1.45, 3.0, 4.5]
export const RACK_LEVELS = [0, 1.51, 3.06]

export const ENTRANCE = { x: 0, w: 5, h: 4.6 }
export const DOCKS = [-8, 0, 8]
export const DOCK_W = 3.6
export const DOCK_H = 4.2
export const OPEN_DOCK = 0

export const SUN_DIR: V3 = (() => {
  const v = [0.42, 1, 0.28]
  const l = Math.hypot(v[0], v[1], v[2])
  return [v[0] / l, v[1] / l, v[2] / l] as V3
})()

export const EYE = 1.7
export const EYE_MIN = 0.9
export const EYE_MAX = 6.2

export type Waypoint = {
  id: number
  title: string
  subtitle: string
  pos: V3
  look: V3
}

export const WAYPOINTS: Waypoint[] = [
  { id: 1, title: 'Acceso Gdor. Tello 437', subtitle: 'Frente comercial y portón principal', pos: [0, EYE, 17], look: [0, 2.8, 4] },
  { id: 2, title: 'Pasillo Central de Stock', subtitle: 'Racks selectivos de 3 niveles', pos: [0, EYE, 5.8], look: [0, 1.9, -6] },
  { id: 3, title: 'Estructura de Cubierta (Cabriadas)', subtitle: 'Plataforma elevadora a 5,8 m', pos: [-9.5, 5.8, 7.5], look: [2, 7.2, -2.5] },
  { id: 4, title: 'Zona de Despacho', subtitle: 'Muelles, pick-up y pallets de bebidas', pos: [-0.6, EYE, -6.4], look: [-9.5, 1.3, -8.4] },
]

export const ORBIT_VIEW = { pos: [30, 24, 31] as V3, target: [0, 2.5, 0] as V3 }

export type PhotoKey = 'actual_1' | 'actual_2' | 'actual_3' | 'actual_4' | 'actual_5'

export const PHOTOS: Record<PhotoKey, { file: string; short: string; caption: string; hotspot: string }> = {
  actual_1: { file: 'actual_1.jpg', short: 'Fachada · Gdor. Tello 437', caption: 'Fachada con cartel ORIFAEL, portón metálico, afiches de bebidas y pizarras de ofertas', hotspot: 'D' },
  actual_2: { file: 'actual_2.jpg', short: 'Mostrador y atención', caption: 'Mostrador con mamparas, exhibidores y carteles "Atención: revise su mercadería" y "Lo estamos filmando"', hotspot: 'D' },
  actual_3: { file: 'actual_3.jpg', short: 'Pasillo de atención', caption: 'Pasillo de cemento alisado con freezer de helados, heladeras exhibidoras y cielorraso de machimbre', hotspot: 'C' },
  actual_4: { file: 'actual_4.jpg', short: 'Góndolas y vitrinas', caption: 'Góndolas con bebidas y artículos de limpieza, vitrinas y luminarias LED', hotspot: 'A' },
  actual_5: { file: 'actual_5.jpg', short: 'Depósito de stock', caption: 'Racks metálicos naranjas con pallets de bebidas y packs en el depósito', hotspot: 'B' },
}
export const PHOTO_KEYS = Object.keys(PHOTOS) as PhotoKey[]

export const PICKUP = { x: -9.6, z: -7.9, rotY: 0 }
export const STAIRS = { x0: 13.6, x1: 14.85, zBottom: -3.4, zTop: -8.3, h: 3.4, landing: { x0: 12.0, x1: 14.85, z0: -10, z1: -8.3 } }
export const BEV_PALLETS: [number, number][] = [[10.6, -7.0], [10.6, -8.6], [12.2, -6.8], [-4.4, -9.15], [-3.0, -9.15]]

export type Hotspot = {
  photo: PhotoKey
  twin: string
  id: string
  label: string
  zone: string
  title: string
  body: string
  pos: V3
  details: [string, string][]
  view: { pos: V3; look: V3 }
}

export const HOTSPOTS: Hotspot[] = [
  {
    photo: 'actual_4',
    twin: 'Cielorraso de machimbre con luminarias LED relevado en el salón; en el galpón, 7 cabriadas de acero de 20 m de luz.',
    id: 'A',
    label: 'Techo',
    zone: 'Cubierta',
    title: 'Estructura Metálica',
    body: 'Cabriadas reticuladas de acero - Luz libre 20m',
    pos: [0, 7.15, -2.2],
    details: [['Cabriadas', '7 u. · cada 5 m'], ['Altura cumbrera', '8,0 m'], ['Pendiente', '11 %']],
    view: { pos: [-6.5, 5.6, 4.5], look: [0, 7.15, -2.2] },
  },
  {
    photo: 'actual_5',
    twin: 'Racks de 3 niveles con pallets de bebidas, como en el depósito real.',
    id: 'B',
    label: 'Pasillo 1',
    zone: 'Stock',
    title: 'Capacidad volumétrica',
    body: 'Capacidad volumétrica: 420 m³ de almacenamiento optimizado',
    pos: [-6, 2.5, -0.5],
    details: [['Racks', '4 filas · 3 niveles'], ['Posiciones pallet', '192'], ['Ancho de pasillo', '3,6 m']],
    view: { pos: [-6, EYE, 4.6], look: [-6, 2.2, -0.5] },
  },
  {
    photo: 'actual_3',
    twin: 'Piso de cemento alisado, ladrillo visto y H°A° a la vista; freezer y heladeras del pasillo de atención.',
    id: 'C',
    label: 'Piso',
    zone: 'Solado',
    title: 'Losa industrial',
    body: 'Losa de Hormigón Armado H25 de alta resistencia industrial',
    pos: [3.2, 0.45, 7.2],
    details: [['Superficie', '600 m²'], ['Terminación', 'Pulido + endurecedor'], ['Juntas', 'Aserradas c/ 5 m']],
    view: { pos: [6.5, EYE, 9.2], look: [3.2, 0.3, 7.2] },
  },
  {
    photo: 'actual_1',
    twin: 'Cartel real ORIFAEL, portón metálico, afiches de bebidas, pizarra de ofertas y cajones Quilmes en el acceso.',
    id: 'D',
    label: 'Entrada',
    zone: 'Acceso',
    title: 'Acceso Logístico',
    body: 'Acceso Logístico - Gdor. Tello 437, S.S. de Jujuy',
    pos: [3.6, 2.6, 10.9],
    details: [['Portón', '5,0 × 4,6 m'], ['Vereda', 'Gdor. Tello'], ['Ciudad', 'S. S. de Jujuy']],
    view: { pos: [6.5, EYE, 15.5], look: [3.6, 2.4, 10.9] },
  },
]

export type Box2 = { x0: number; x1: number; z0: number; z1: number; h: number }

const box = (x0: number, x1: number, z0: number, z1: number, h = 8): Box2 => ({ x0, x1, z0, z1, h })

export const COLLIDERS: Box2[] = [
  box(-15.3, -ENTRANCE.w / 2, 9.85, 10.4),
  box(ENTRANCE.w / 2, 15.3, 9.85, 10.4),
  box(-15.3, OPEN_DOCK - DOCK_W / 2, -10.4, -9.85),
  box(OPEN_DOCK + DOCK_W / 2, 15.3, -10.4, -9.85),
  box(-15.3, -14.85, -10.4, 10.4),
  box(14.85, 15.3, -10.4, 10.4),
  ...RACK_ROWS.map((c) => box(c - RACK_HALF_DEPTH - 0.1, c + RACK_HALF_DEPTH + 0.1, RACK_Z0 - 0.15, RACK_Z1 + 0.15, RACK_H + 0.2)),
  box(-12.7, -8.2, 6.2, 7.0, 1.2),
  box(-14.9, -14.3, 5.9, 9.7, 2.1),
  box(-13.4, -11.0, 9.25, 9.75, 2.1),
  box(PICKUP.x - 2.75, PICKUP.x + 2.75, PICKUP.z - 1.0, PICKUP.z + 1.0, 2.4),
  box(STAIRS.x0 - 0.1, 14.9, STAIRS.zTop, STAIRS.zBottom + 0.1, STAIRS.h + 0.2),
  box(12.0, 12.45, -8.75, -8.3, STAIRS.h),
  ...BEV_PALLETS.map(([x, z]) => box(x - 0.65, x + 0.65, z - 0.55, z + 0.55, 1.7)),
  box(-14.9, -8.6, 5.05, 5.45, 3.2),
  box(-8.0, -4.6, 9.1, 9.95, 2.1),
  box(-13.35, -12.65, 6.4, 7.1, 1.6),
  box(-1.4, 1.4, -23.5, -10.45, 4.2),
  box(2.9, 5.1, -8.4, -6.4, 2.4),
  box(10.2, 13.8, 6.4, 8.2, 1.0),
]

export function zoneAt(x: number, z: number): string {
  if (Math.abs(x) > HALF_W || Math.abs(z) > HALF_D) {
    if (z > HALF_D && z < 13.2) return 'Vereda · Gdor. Tello 437'
    if (z >= 13.2) return 'Calle Gdor. Tello'
    if (z < -HALF_D) return 'Playa de maniobras'
    return 'Exterior'
  }
  if (z > RACK_Z1 + 0.5) {
    if (x < -6.5) return 'Recepción / Mostrador'
    if (x > 7) return 'Zona de Picking'
    return 'Hall de acceso'
  }
  if (z < RACK_Z0 - 0.5) {
    if (x > 11.8) return 'Escalera / Entrepiso'
    if (x < -6.5) return 'Carga vehicular · Pick-up'
    return 'Zona de Despacho / Carga'
  }
  if (x > -7.8 && x < -4.2) return 'Pasillo 1'
  if (x > -1.8 && x < 1.8) return 'Pasillo 2 · Central'
  if (x > 4.2 && x < 7.8) return 'Pasillo 3'
  return 'Área de estanterías'
}

export const METRICS = [
  { k: 'Superficie cubierta', v: '600 m²' },
  { k: 'Volumen edificado', v: '4.350 m³' },
  { k: 'Luz libre (cabriadas)', v: '20 m' },
  { k: 'Altura cumbrera / alero', v: '8,0 / 6,9 m' },
  { k: 'Volumen en racks', v: '420 m³' },
  { k: 'Posiciones pallet', v: '192' },
  { k: 'Pasillos principales', v: '3 × 3,6 m' },
  { k: 'Muelles de carga', v: '3' },
]
