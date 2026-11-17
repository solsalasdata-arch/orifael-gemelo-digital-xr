export type V3 = [number, number, number]

/** Nave real: frente 13,0 m sobre Gdor. Tello (x) × 30 m de fondo (z). Frente en z = +HALF_D. */
export const W = 13
export const D = 30
export const HALF_W = W / 2
export const HALF_D = D / 2
export const WALL_T = 0.25
export const IN_X = HALF_W - WALL_T
export const IN_Z = HALF_D - WALL_T
export const SLAB_Y = 4.6
export const SLAB_T = 0.2
export const BEAM_H = 0.5
export const FASCIA = { y0: 4.45, y1: 5.25, overhang: 1.0, side: 0.8 }
export const SIDEWALK = { z0: HALF_D, z1: HALF_D + 5, curb: 0.14 }
export const STREET = { z0: HALF_D + 5, z1: HALF_D + 13 }

/** Frente de izquierda a derecha (mirando desde la calle). */
export const FRONT = {
  door: { x: -5.75, w: 0.9, h: 2.05 },
  vent: { x: -5.75, y: 3.75, s: 0.55 },
  colWide: { x0: -3.0, x1: -2.4 },
  gate1: { x0: -2.4, x1: 1.8, h: 4.0 },
  colMid: { x0: 1.8, x1: 2.3 },
  gate2: { x0: 2.3, x1: 6.1, h: 4.0, grill: 1.25, door: { w: 0.8, h: 1.7 } },
  colRight: { x0: 6.1, x1: HALF_W },
}
export const GATE1_X = (FRONT.gate1.x0 + FRONT.gate1.x1) / 2
export const GATE2_X = (FRONT.gate2.x0 + FRONT.gate2.x1) / 2
export const REBAR_X = [-6.25, -4.55, -2.7, 2.05, 4.2, 6.3]

export const COL_ROW_X = -4.85
export const ROOF_Z0 = -8.9
export const PATIO_WALL_H = 3.0
export const COL_Z = [10, 5, 0, -4.5, ROOF_Z0]

export const OFFICE = { x0: -IN_X, x1: -3.0, z0: 7.2, z1: 11.6, h: 2.8, doorZ: [7.9, 8.9] as [number, number] }
export const KITCHEN = { x0: -IN_X, x1: -3.6, z0: 5.45, z1: 7.15, h: 2.6, doorZ: [5.95, 6.75] as [number, number] }
export const BATH = { x0: -IN_X, x1: -3.6, z0: 3.75, z1: 5.45, h: 2.6, doorZ: [4.2, 5.0] as [number, number] }
export const SALON = { x0: 2.05, x1: IN_X, z0: 8.4, z1: IN_Z, h: 3.0, openX: [2.4, 3.6] as [number, number] }
export const SHELF_RUN = { x0: -IN_X, x1: -5.35, z0: -4.9, z1: 3.55, h: 2.6 }
export const PICKUP = { x: 3.6, z: -11.2, rotY: Math.PI / 2 }
export const STACKER = { x: -0.6, z: -2.2, rotY: 0 }

export const BEV_PALLETS: [number, number][] = (() => {
  const out: [number, number][] = []
  for (let z = 4.96; z > -7.6; z -= 1.12) for (const x of [3.25, 4.55]) out.push([x, Math.round(z * 100) / 100])
  return out
})()
export const CRATE_WALL = { x0: 5.3, x1: IN_X, z0: -7.6, z1: 5.5 }

export const SUN_DIR: V3 = (() => {
  const v = [-0.55, 0.74, 0.38]
  const l = Math.hypot(v[0], v[1], v[2])
  return [v[0] / l, v[1] / l, v[2] / l] as V3
})()

export const EYE = 1.7
export const EYE_MIN = 0.9
export const EYE_MAX = 4.2

export type Waypoint = { id: number; title: string; subtitle: string; pos: V3; look: V3 }

export const WAYPOINTS: Waypoint[] = [
  { id: 1, title: 'Acceso Gdor. Tello 437', subtitle: 'Frente de 13 m · portón principal y portón con puerta de escape', pos: [0.2, EYE, 23.2], look: [0.2, 2.7, 14] },
  { id: 2, title: 'Pasillo Central de Stock', subtitle: 'Nave única · apilador WIEBEL · estanterías izq. · bebidas der.', pos: [-1.6, EYE, 9.2], look: [-0.8, 1.5, -10] },
  { id: 3, title: 'Estructura de Cubierta (Losa y Vigas)', subtitle: 'Vista elevada a 3,6 m bajo la losa de H°A°', pos: [-1.4, 3.6, 6.5], look: [0.4, 4.6, -6] },
  { id: 4, title: 'Zona de Despacho', subtitle: 'Despacho · patio trasero no techado', pos: [-0.4, EYE, -3.6], look: [1.4, 1.2, -14] },
]

export const ORBIT_VIEW = { pos: [-26, 58, 58] as V3, target: [0, 0, 5] as V3 }
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
  gal_10: { file: 'gal_10.jpg', zone: 'gal', short: 'Nave vacía', caption: 'Nave del depósito: ladrillo hueco, columnas de H°A° y pallets al fondo' },
  gal_11: { file: 'gal_11.jpg', zone: 'gal', short: 'Fondo del depósito', caption: 'Fondo del depósito con pallets y cajones' },
  gal_12: { file: 'gal_12.jpg', zone: 'gal', short: 'Patio trasero', caption: 'Fin de la losa y patio trasero no techado con utilitario y pallets' },
  gal_13: { file: 'gal_13.jpg', zone: 'gal', short: 'Apilador WIEBEL', caption: 'Apilador eléctrico WIEBEL junto a los racks naranjas' },
  gal_14: { file: 'gal_14.jpg', zone: 'gal', short: 'Estantería de madera', caption: 'Estantería de madera inclinada contra revestimiento de pallet' },
  gal_15: { file: 'gal_15.jpg', zone: 'gal', short: 'Utilitario en depósito', caption: 'Utilitario rotulado y estibas junto al muro de ladrillo' },
  sal_7: { file: 'sal_7.jpg', zone: 'sal', short: 'Salón · panorámica', caption: 'Salón de ventas: mostrador vitrina, estanterías de madera y heladeras' },
  sal_8: { file: 'sal_8.jpg', zone: 'sal', short: 'Salón · góndolas', caption: 'Góndolas de madera con snacks, almacén y bebidas sobre el mostrador' },
  rel_3: { file: 'rel_3.jpg', zone: 'ext', short: 'Acceso con cartel ORIFAEL', caption: 'Carpeta "si" · Acceso al salón bajo el cartel ORIFAEL Mayorista y Minorista' },
  rel_1: { file: 'rel_1.jpg', zone: 'sal', short: 'Mostrador (relevamiento previo)', caption: 'Carpeta "si" · Mostrador con balanza, carteles de ofertas y cielorraso de madera' },
  rel_2: { file: 'rel_2.jpg', zone: 'sal', short: 'Atención y estanterías', caption: 'Carpeta "si" · Puesto de atención con mampara y estanterías de limpieza' },
  rel_4: { file: 'rel_4.jpg', zone: 'gal', short: 'Depósito · losa y escalera', caption: 'Carpeta "si" · Depósito con losa y vigas de H°A°, ladrillo hueco y escalera al entrepiso' },
} satisfies Record<string, { file: string; zone: Zone; short: string; caption: string }>
export type PhotoKey = keyof typeof PHOTOS
export const photoSrc = (k: PhotoKey) => `${import.meta.env.BASE_URL}textures/${PHOTOS[k].file}`
export const thumbSrc = (k: PhotoKey) => `${import.meta.env.BASE_URL}textures/thumbs/${PHOTOS[k].file}`
export const PHOTO_KEYS = Object.keys(PHOTOS) as PhotoKey[]

export const VIDEO = {
  src: `${import.meta.env.BASE_URL}media/pasillo_operativo.mp4`,
  poster: `${import.meta.env.BASE_URL}media/pasillo_operativo.jpg`,
  title: 'Video real · Pasillo operativo con apilador WIEBEL',
  caption: 'Recorrido real del pasillo central: apilador eléctrico WIEBEL con cajones de bebidas hacia el despacho. Rostro de menor difuminado · sin audio.',
}

export type Media = { kind: 'video' } | { kind: 'photo'; k: PhotoKey }
export const MEDIA: Media[] = [{ kind: 'video' }, ...PHOTO_KEYS.map((k) => ({ kind: 'photo' as const, k }))]
export const mediaIndex = (k: PhotoKey) => 1 + PHOTO_KEYS.indexOf(k)

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
    twin: 'Cubierta real: losa plana de hormigón armado con vigas y columnas a la vista; el gemelo la reproduce a 4,60 m con vigas transversales cada 5 m.',
    id: 'A',
    label: 'Techo',
    zone: 'Cubierta',
    title: 'Estructura de cubierta',
    body: 'Losa plana de H°A° con vigas a la vista · luz libre 12,5 m',
    pos: [0.4, 4.05, 0],
    details: [['Cubierta', 'Losa plana H°A° · 24 m de fondo'], ['Altura libre', '4,60 m'], ['Patio trasero', '6 m sin cubierta'], ['Columnas', 'H°A° con zócalo negro']],
    view: { pos: [-1.4, 2.4, 5.2], look: [0.4, 4.2, 0] },
  },
  {
    photo: 'gal_1',
    twin: 'Estanterías de madera y racks contra la pared izquierda; pilas de pallets con cajones Quilmes y Coca-Cola a la derecha del pasillo central.',
    id: 'B',
    label: 'Stock',
    zone: 'Stock',
    title: 'Capacidad volumétrica',
    body: 'Capacidad volumétrica: 420 m³ de almacenamiento optimizado',
    pos: [-5.6, 2.9, 1.5],
    details: [['Estanterías', '18 m lineales · a pared izq.'], ['Pallets de bebidas', '28 · doble estiba'], ['Nave', 'Única · 13 × 30 m']],
    view: { pos: [0.9, 2.1, 6.8], look: [-5.6, 1.6, 0.0] },
  },
  {
    photo: 'gal_3',
    twin: 'Piso de cemento alisado continuo en toda la nave, con juntas aserradas y tránsito del apilador eléctrico.',
    id: 'C',
    label: 'Piso',
    zone: 'Solado',
    title: 'Losa industrial',
    body: 'Losa de Hormigón Armado H25 de alta resistencia industrial',
    pos: [0.6, 0.35, 3.0],
    details: [['Superficie', '390 m²'], ['Terminación', 'Cemento alisado'], ['Juntas', 'Aserradas c/ 5 m']],
    view: { pos: [-1.6, EYE, 6.6], look: [0.6, 0.3, 3.0] },
  },
  {
    photo: 'ext_4',
    twin: 'Frente de 13 m: puerta peatonal, portón principal 4,20 × 4,00 m y segundo portón 3,80 m con reja superior y puerta de escape, bajo losa con alero.',
    id: 'D',
    label: 'Entrada',
    zone: 'Acceso',
    title: 'Acceso Logístico',
    body: 'Acceso Logístico - Gdor. Tello 437, S.S. de Jujuy',
    pos: [-0.3, 4.75, 16.2],
    details: [['Portón principal', '4,20 × 4,00 m'], ['Portón 2', '3,80 m · reja + escape'], ['Playón / vereda', '5,0 m'], ['Ciudad', 'S. S. de Jujuy']],
    view: { pos: [-0.3, EYE, 22.4], look: [-0.3, 3.4, 15] },
  },
]

export type Box2 = { x0: number; x1: number; z0: number; z1: number; h: number }

const box = (x0: number, x1: number, z0: number, z1: number, h = 8): Box2 => ({ x0, x1, z0, z1, h })
const FZ0 = IN_Z
const FZ1 = HALF_D + 0.05

export const GATE_BLOCKS: Box2[] = [box(FRONT.gate1.x0, FRONT.gate1.x1, FZ0, FZ1), box(FRONT.gate2.x0, FRONT.gate2.x1, FZ0, FZ1)]

export const COLLIDERS: Box2[] = [
  box(-HALF_W - 0.1, FRONT.colWide.x1, FZ0, FZ1),
  box(FRONT.colMid.x0, FRONT.colMid.x1, FZ0, FZ1),
  box(FRONT.colRight.x0, HALF_W + 0.1, FZ0, FZ1),
  box(-HALF_W - 0.1, -IN_X, -HALF_D, HALF_D),
  box(IN_X, HALF_W + 0.1, -HALF_D, HALF_D),
  box(-HALF_W, HALF_W, -HALF_D - 0.1, -IN_Z),
  box(-17.5, -HALF_W - 0.1, 2, HALF_D),
  box(HALF_W + 0.1, 17.5, 2, HALF_D),
  box(OFFICE.x0, OFFICE.x1 + 0.1, OFFICE.z0 - 0.1, OFFICE.z0 + 0.1, OFFICE.h),
  box(OFFICE.x1 - 0.1, OFFICE.x1 + 0.1, OFFICE.z0, OFFICE.doorZ[0], OFFICE.h),
  box(OFFICE.x1 - 0.1, OFFICE.x1 + 0.1, OFFICE.doorZ[1], OFFICE.z1, OFFICE.h),
  box(-IN_X, -5.3, 9.6, 11.2, 1.0),
  box(OFFICE.x0, OFFICE.x1 + 0.1, OFFICE.z1 - 0.1, OFFICE.z1 + 0.1, OFFICE.h),
  ...[KITCHEN, BATH].flatMap((k) => [box(k.x1 - 0.08, k.x1 + 0.08, k.z0, k.doorZ[0], k.h), box(k.x1 - 0.08, k.x1 + 0.08, k.doorZ[1], k.z1, k.h), box(k.x0, k.x1, k.z0 - 0.08, k.z0 + 0.08, k.h), box(k.x0, k.x1, k.z1 - 0.08, k.z1 + 0.08, k.h)]),
  box(SALON.x0 - 0.1, SALON.x0 + 0.1, SALON.z0, SALON.z1, SALON.h),
  box(SALON.x0, SALON.openX[0], SALON.z0 - 0.1, SALON.z0 + 0.1, SALON.h),
  box(SALON.openX[1], SALON.x1, SALON.z0 - 0.1, SALON.z0 + 0.1, SALON.h),
  box(5.45, IN_X, 9.0, 14.0, 2.0),
  box(SALON.x0, 2.85, 9.0, 14.2, 2.0),
  box(3.6, SALON.x1, 8.5, 9.5, 1.2),
  box(SHELF_RUN.x0, SHELF_RUN.x1, SHELF_RUN.z0, SHELF_RUN.z1, SHELF_RUN.h),
  ...COL_Z.map((z) => box(COL_ROW_X - 0.2, COL_ROW_X + 0.2, z - 0.2, z + 0.2)),
  ...BEV_PALLETS.map(([x, z]) => box(x - 0.62, x + 0.62, z - 0.52, z + 0.52, 2.6)),
  box(CRATE_WALL.x0, CRATE_WALL.x1, CRATE_WALL.z0, CRATE_WALL.z1, 2.2),
  box(PICKUP.x - 1.0, PICKUP.x + 1.0, PICKUP.z - 3.35, PICKUP.z + 2.95, 2.4),
  box(STACKER.x - 0.45, STACKER.x + 0.45, STACKER.z - 1.3, STACKER.z + 0.75, 2.4),
  box(FRONT.gate2.x1 + 0.2, FRONT.gate2.x1 + 0.9, 15.3, 16.2, 1.4),
]

export function zoneAt(x: number, z: number): string {
  if (z > HALF_D) return z < SIDEWALK.z1 ? 'Playón / vereda · Gdor. Tello 437' : 'Calle Gdor. Tello'
  if (Math.abs(x) > HALF_W || z < -HALF_D) return 'Exterior · linderos'
  if (x < OFFICE.x1 && z > OFFICE.z0) return 'Box de madera · Oficina'
  if (x < KITCHEN.x1 && z > KITCHEN.z0 && z < KITCHEN.z1) return 'Cocina (office)'
  if (x < BATH.x1 && z > BATH.z0 && z < BATH.z1) return 'Baño'
  if (x > SALON.x0 && z > SALON.z0) return 'Salón de ventas · Mostrador'
  if (z < ROOF_Z0) return 'Patio trasero no techado · Vehículos'
  if (z < -6.8) return 'Despacho'
  if (x < -4.4) return 'Estanterías de madera'
  if (x > 2.5) return 'Pallets de bebidas'
  return 'Nave central'
}

export const METRICS = [
  { k: 'Superficie cubierta', v: '312 m²' },
  { k: 'Patio no techado', v: '78 m²' },
  { k: 'Volumen edificado', v: '1.435 m³' },
  { k: 'Frente / fondo', v: '13,0 × 30,0 m' },
  { k: 'Altura libre bajo losa', v: '4,60 m' },
  { k: 'Cocina + baño', v: '2 módulos cerrados' },
  { k: 'Volumen de stock', v: '420 m³' },
  { k: 'Pallets de bebidas', v: '28 · doble estiba' },
  { k: 'Portones de frente', v: '4,20 + 3,80 m' },
  { k: 'Playón / vereda', v: '5,0 m' },
]
