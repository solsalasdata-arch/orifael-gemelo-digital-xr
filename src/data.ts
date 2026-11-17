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

export const RACK_ROWS: number[] = []
export const RACK_Z0 = -5.5
export const RACK_BAYS = 4
export const RACK_BAY_LEN = 2.5
export const RACK_Z1 = RACK_Z0 + RACK_BAYS * RACK_BAY_LEN
export const RACK_HALF_DEPTH = 1.2
export const RACK_H = 4.6
export const RACK_BEAMS = [1.45, 3.0, 4.5]
export const RACK_LEVELS = [0, 1.51, 3.06]

export const ENTRANCE = { x: -6.5, w: 6, h: 4.6 }
export const GATE_R = { x: 4.5, w: 4.2, h: 3.8, door: 0.9 }
export const WALL_SHELVES: [number, number][] = [[-9.5, -5.35], [-4.65, -0.35], [0.35, 4.75]]
export const DOCKS = [-8, 0, 8]
export const DOCK_W = 3.6
export const DOCK_H = 4.2
export const OPEN_DOCK = 0

export const SUN_DIR: V3 = (() => {
  const v = [-0.62, 0.72, 0.34]
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
  { id: 1, title: 'Acceso Gdor. Tello 437', subtitle: 'Portón principal y portón con puerta de escape', pos: [-6.5, EYE, 12.4], look: [-6.5, 2.6, 0] },
  { id: 2, title: 'Pasillo Central de Stock', subtitle: 'Nave única · estanterías izq. · bebidas der.', pos: [-2, EYE, 7.4], look: [-1, 1.6, -8] },
  { id: 3, title: 'Estructura de Cubierta (Cabriadas)', subtitle: 'Vista elevada a 5,8 m sobre el pasillo central', pos: [-1.5, 5.8, 3.0], look: [2, 7.2, -6] },
  { id: 4, title: 'Zona de Despacho', subtitle: 'Muelles, utilitario y camión al fondo', pos: [-0.6, EYE, -6.4], look: [-0.6, 1.6, -16] },
]

export const ORBIT_VIEW = { pos: [-5, 96, 36] as V3, target: [-5, 0, 4] as V3 }
export const ORBIT_FOV = 30
export const WALK_FOV = 70

export type Zone = 'ext' | 'sal' | 'gal' | 'ofi'
export const ZONES: Record<Zone, string> = { ext: 'Exterior · Gdor. Tello', sal: 'Salón de ventas', gal: 'Galpón / depósito', ofi: 'Oficina' }
export const ZONE_HOTSPOT: Record<Zone, string> = { ext: 'D', sal: 'C', gal: 'B', ofi: 'B' }

export const PHOTOS = {
  ext_1: { file: 'ext_1.jpg', zone: 'ext', short: 'Calle Gdor. Tello', caption: 'Calle Gdor. Tello: vereda, cantero central y alumbrado' },
  ext_2: { file: 'ext_2.jpg', zone: 'ext', short: 'Cantero frente al local', caption: 'Cantero y luminarias frente a la distribuidora' },
  ext_3: { file: 'ext_3.jpg', zone: 'ext', short: 'Fachada en perspectiva', caption: 'Fachada con alero iluminado, cartel ORIFAEL y medianera' },
  ext_4: { file: 'ext_4.jpg', zone: 'ext', short: 'Frente del local', caption: 'Frente: portón vehicular cerrado y local con cartel ORIFAEL' },
  ext_5: { file: 'ext_5.jpg', zone: 'ext', short: 'Ingreso al salón', caption: 'Ingreso al salón con pizarras de precios y freezers' },
  ext_6: { file: 'ext_6.jpg', zone: 'ext', short: 'Portón vehicular', caption: 'Portón metálico enrollable, pizarra de ofertas y vereda' },
  ext_7: { file: 'ext_7.jpg', zone: 'ext', short: 'Vista de la cuadra', caption: 'Vista de la cuadra sobre Gdor. Tello' },
  ext_8: { file: 'ext_8.jpg', zone: 'ext', short: 'Cartel y afiches', caption: 'Cartel ORIFAEL, afiches de bebidas, pizarras y cajones Quilmes' },
  sal_1: { file: 'sal_1.jpg', zone: 'sal', short: 'Heladeras del salón', caption: 'Heladeras exhibidoras, góndolas y cielorraso de machimbre' },
  sal_2: { file: 'sal_2.jpg', zone: 'sal', short: 'Pasillo del salón', caption: 'Pasillo del salón: góndolas, freezers y línea de heladeras' },
  sal_3: { file: 'sal_3.jpg', zone: 'sal', short: 'Heladeras Coca-Cola', caption: 'Heladeras de bebidas y cielorraso de madera con paneles LED' },
  sal_4: { file: 'sal_4.jpg', zone: 'sal', short: 'Mostrador y atención', caption: 'Mostrador con mamparas y carteles "Atención: revise su mercadería" y "Lo estamos filmando"' },
  sal_5: { file: 'sal_5.jpg', zone: 'sal', short: 'Pasillo de atención', caption: 'Pasillo de atención con freezer de helados y heladeras' },
  sal_6: { file: 'sal_6.jpg', zone: 'sal', short: 'Góndolas y vitrinas', caption: 'Góndolas con bebidas y artículos de limpieza, vitrinas y luminarias LED' },
  gal_1: { file: 'gal_1.jpg', zone: 'gal', short: 'Depósito y utilitario', caption: 'Depósito: racks naranjas, cajones Quilmes y utilitario blanco' },
  gal_2: { file: 'gal_2.jpg', zone: 'gal', short: 'Losa y columnas', caption: 'Losa y vigas de H°A°, columna con zócalo negro y utilitario estacionado' },
  gal_3: { file: 'gal_3.jpg', zone: 'gal', short: 'Nave del depósito', caption: 'Nave del depósito con pasillo central de cemento alisado' },
  gal_4: { file: 'gal_4.jpg', zone: 'gal', short: 'Revestimiento de madera', caption: 'Revestimiento de madera de pallet, tableros eléctricos y estanterías' },
  gal_5: { file: 'gal_5.jpg', zone: 'gal', short: 'Racks de stock', caption: 'Racks metálicos con pallets y packs de bebidas' },
  gal_6: { file: 'gal_6.jpg', zone: 'gal', short: 'Cajones y oficina', caption: 'Estiba de cajones Quilmes y puerta de madera de la oficina' },
  gal_7: { file: 'gal_7.jpg', zone: 'gal', short: 'Ladrillo visto', caption: 'Ladrillo visto con estiba de cajones de bebidas' },
  gal_8: { file: 'gal_8.jpg', zone: 'gal', short: 'Portón trasero', caption: 'Portón trasero enrollable y cajones apilados' },
  gal_9: { file: 'gal_9.jpg', zone: 'gal', short: 'Box de madera', caption: 'Estiba de cajones frente al box de oficina revestido en madera' },
  ofi_1: { file: 'ofi_1.jpg', zone: 'ofi', short: 'Oficina', caption: 'Oficina revestida en madera de pallet con ventana' },
  ofi_2: { file: 'ofi_2.jpg', zone: 'ofi', short: 'Oficina · muro', caption: 'Muro de la oficina en tablas de pallet' },
  ofi_3: { file: 'ofi_3.jpg', zone: 'ofi', short: 'Oficina · escritorio', caption: 'Escritorio de administración en la oficina' },
  ofi_4: { file: 'ofi_4.jpg', zone: 'ofi', short: 'Oficina · administración', caption: 'Puesto de administración y facturación' },
} satisfies Record<string, { file: string; zone: Zone; short: string; caption: string }>
export type PhotoKey = keyof typeof PHOTOS
export const photoSrc = (k: PhotoKey) => `${import.meta.env.BASE_URL}textures/${PHOTOS[k].file}`
export const thumbSrc = (k: PhotoKey) => `${import.meta.env.BASE_URL}textures/thumbs/${PHOTOS[k].file}`
export const PHOTO_KEYS = Object.keys(PHOTOS) as PhotoKey[]

export const PICKUP = { x: -9.6, z: -7.9, rotY: 0 }
export const STAIRS = { x0: 13.6, x1: 14.85, zBottom: -3.4, zTop: -8.3, h: 3.4, landing: { x0: 12.0, x1: 14.85, z0: -10, z1: -8.3 } }
export const BEV_PALLETS: [number, number][] = [[10.6, -7.0], [10.6, -8.6], [-4.4, -9.15], [-3.0, -9.15], [7.2, -4.4], [7.2, -3.25], [7.2, -2.1], [7.2, -0.95], [7.2, 0.2], [7.2, 1.35], [7.2, 2.5], [7.2, 3.65], [8.55, -4.4], [8.55, -3.25], [8.55, -2.1], [8.55, -0.95], [8.55, 0.2], [8.55, 1.35], [8.55, 2.5], [8.55, 3.65], [11.2, -4.4], [11.2, -3.25], [11.2, -2.1], [11.2, -0.95], [11.2, 0.2], [11.2, 1.35], [11.2, 2.5], [11.2, 3.65], [12.55, -4.4], [12.55, -3.25], [12.55, -2.1], [12.55, -0.95], [12.55, 0.2], [12.55, 1.35], [12.55, 2.5], [12.55, 3.65]]

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
    photo: 'gal_2',
    twin: 'En el depósito real: losa y vigas de H°A° con columnas a la vista; en el gemelo, 7 cabriadas de acero de 20 m de luz.',
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
    photo: 'gal_1',
    twin: 'Estanterías de madera a la izquierda y estibas de pallets de bebidas a la derecha del pasillo central, como en el depósito relevado.',
    id: 'B',
    label: 'Stock',
    zone: 'Stock',
    title: 'Capacidad volumétrica',
    body: 'Capacidad volumétrica: 420 m³ de almacenamiento optimizado',
    pos: [-13.4, 2.5, -2.5],
    details: [['Estanterías madera', '3 tramos · 13 m · a pared'], ['Pallets de bebidas', '32 · doble estiba'], ['Nave', 'Única · 30 × 20 m']],
    view: { pos: [-9.8, EYE, 1.2], look: [-13.4, 2.0, -2.5] },
  },
  {
    photo: 'sal_2',
    twin: 'Piso de cemento alisado; heladeras, freezers, góndolas y cielorraso de machimbre del salón.',
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
    photo: 'ext_4',
    twin: 'Cartel ORIFAEL, portón vehicular, alero iluminado, afiches y pizarras de ofertas en el ingreso.',
    id: 'D',
    label: 'Entrada',
    zone: 'Acceso',
    title: 'Acceso Logístico',
    body: 'Acceso Logístico - Gdor. Tello 437, S.S. de Jujuy',
    pos: [-5, 3.2, 9.6],
    details: [['Portones', '6,0 × 4,6 + 4,2 × 3,8 m'], ['Vereda', 'Gdor. Tello'], ['Ciudad', 'S. S. de Jujuy']],
    view: { pos: [-6, EYE, 13.4], look: [-5, 3.0, 9.6] },
  },
]

export type Box2 = { x0: number; x1: number; z0: number; z1: number; h: number }

const box = (x0: number, x1: number, z0: number, z1: number, h = 8): Box2 => ({ x0, x1, z0, z1, h })

export const COLLIDERS: Box2[] = [
  box(-15.3, ENTRANCE.x - ENTRANCE.w / 2, 9.85, 10.4),
  box(ENTRANCE.x + ENTRANCE.w / 2, GATE_R.x - GATE_R.door / 2, 9.85, 10.4),
  box(GATE_R.x + GATE_R.door / 2, 15.3, 9.85, 10.4),
  ...WALL_SHELVES.map(([z0, z1]) => box(-14.9, -14.0, z0, z1, 2.2)),
  box(-15.3, OPEN_DOCK - DOCK_W / 2, -10.4, -9.85),
  box(OPEN_DOCK + DOCK_W / 2, 15.3, -10.4, -9.85),
  box(-15.3, -14.85, -10.4, 10.4),
  box(14.85, 15.3, -10.4, 10.4),
  ...RACK_ROWS.map((c) => box(c - RACK_HALF_DEPTH - 0.1, c + RACK_HALF_DEPTH + 0.1, RACK_Z0 - 0.15, RACK_Z1 + 0.15, RACK_H + 0.2)),
  box(-12.7, -8.2, 6.2, 7.0, 1.2),
  box(-14.9, -14.3, 5.9, 9.7, 2.1),
  box(-13.4, -11.0, 9.25, 9.75, 2.1),
  box(PICKUP.x - 2.95, PICKUP.x + 3.4, PICKUP.z - 1.0, PICKUP.z + 1.0, 2.4),
  box(STAIRS.x0 - 0.1, 14.9, STAIRS.zTop, STAIRS.zBottom + 0.1, STAIRS.h + 0.2),
  box(12.0, 12.45, -8.75, -8.3, STAIRS.h),
  ...BEV_PALLETS.map(([x, z]) => box(x - 0.65, x + 0.65, z - 0.55, z + 0.55, 1.7)),
  box(-14.9, -8.6, 5.05, 5.45, 3.2),
  box(-1.4, 2.0, 9.1, 9.95, 2.1),
  box(2.2, 5.9, -9.85, -8.45, 2.0),
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
    if (x < -8.2) return 'Box de atención / Mostrador'
    if (x > 7) return 'Zona de Picking'
    return 'Hall de acceso'
  }
  if (z < RACK_Z0 - 0.5) {
    if (x > 11.8) return 'Escalera / Entrepiso'
    if (x < -6.5) return 'Carga vehicular · Pick-up'
    return 'Zona de Despacho / Carga'
  }
  if (x < -12.6) return 'Estanterías de madera'
  if (x > 6.5) return 'Pallets de bebidas'
  return 'Nave central'
}

export const METRICS = [
  { k: 'Superficie cubierta', v: '600 m²' },
  { k: 'Volumen edificado', v: '4.350 m³' },
  { k: 'Luz libre (cabriadas)', v: '20 m' },
  { k: 'Altura cumbrera / alero', v: '8,0 / 6,9 m' },
  { k: 'Volumen en racks', v: '420 m³' },
  { k: 'Pallets de bebidas', v: '32 · doble estiba' },
  { k: 'Nave', v: 'Única · 30 × 20 m' },
  { k: 'Portones de frente', v: '2 enrollables' },
]
