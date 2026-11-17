import { useEffect, useState, type ReactNode } from 'react'
import {
  BEV_PALLETS, CRATE_WALL, FRONT, GATE1_X, HALF_D, BATH, HOTSPOTS, KITCHEN, MEDIA, METRICS, ROOF_Z0, OFFICE, PHOTOS, PHOTO_KEYS, PICKUP, SALON, SHELF_RUN, SIDEWALK, STACKER, STREET, VIDEO, WAYPOINTS, ZONES, ZONE_HOTSPOT,
  mediaIndex, thumbSrc, zoneAt, type Zone,
} from '../data'
import { isBlocked } from '../scene/Navigation'
import { useStore } from '../store'
import { xrStore } from '../xr'
import { Viewer } from './Viewer'

function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="border-t border-white/8 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-mint/75">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  )
}

function Toggle({ on, onClick, label, hint, accent = 'mint' }: { on: boolean; onClick: () => void; label: string; hint?: string; accent?: 'mint' | 'bim' }) {
  const color = accent === 'bim' ? 'bg-bim' : 'bg-mint'
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[4px] border px-3 py-2 text-left transition ${on ? (accent === 'bim' ? 'border-bim/60 bg-bim/10' : 'border-mint/50 bg-mint/10') : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}
    >
      <span>
        <span className="block text-[13px] font-semibold text-white">{label}</span>
        {hint && <span className="block text-[11px] text-slate-400">{hint}</span>}
      </span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? color : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

function fmt(n: number) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' k'
  return String(n)
}

function Stats() {
  const s = useStore((st) => st.stats)
  const fpsColor = s.fps >= 50 ? 'text-mint' : s.fps >= 30 ? 'text-amber-300' : 'text-rose-400'
  return (
    <div className="grid grid-cols-3 gap-2 font-mono">
      <div className="rounded-[3px] bg-black/30 px-2 py-1.5">
        <div className="text-[10px] text-slate-400">FPS</div>
        <div className={`text-lg font-bold ${fpsColor}`}>{s.fps}</div>
      </div>
      <div className="rounded-[3px] bg-black/30 px-2 py-1.5">
        <div className="text-[10px] text-slate-400">Polígonos</div>
        <div className="text-lg font-bold text-white">{fmt(s.tris)}</div>
      </div>
      <div className="rounded-[3px] bg-black/30 px-2 py-1.5">
        <div className="text-[10px] text-slate-400">Draw calls</div>
        <div className="text-lg font-bold text-white">{s.calls}</div>
      </div>
    </div>
  )
}

function MediaGallery() {
  const zones = Object.keys(ZONES) as Zone[]
  const open = (i: number) => useStore.getState().openViewer(i, false)
  return (
    <Section title={`Visor de Relevamiento Real 1:1 · ${PHOTO_KEYS.length} fotos + video`}>
      <button onClick={() => open(0)} className="group relative mb-2 block w-full overflow-hidden rounded-[3px] ring-1 ring-white/10 hover:ring-mint">
        <img src={VIDEO.poster} alt={VIDEO.title} className="h-24 w-full object-cover opacity-80 transition group-hover:opacity-100" draggable={false} />
        <span className="absolute inset-0 flex items-center gap-2 bg-gradient-to-r from-black/75 to-transparent px-3 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mint text-[#0d1a14]">▶</span>
          <span>
            <span className="block text-[12px] font-bold text-white">Video real · pasillo operativo</span>
            <span className="block text-[10.5px] text-slate-300">Apilador WIEBEL · 27 s · sin audio</span>
          </span>
        </span>
      </button>
      {zones.map((z) => (
        <div key={z} className="mb-1.5">
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <span>{ZONES[z]}</span>
            <button onClick={() => useStore.getState().openHotspot(ZONE_HOTSPOT[z], true)} className="rounded bg-mint/15 px-1.5 text-[9px] font-bold text-mint hover:bg-mint/30">
              Hotspot {ZONE_HOTSPOT[z]}
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {PHOTO_KEYS.map((pk) =>
              PHOTOS[pk].zone !== z ? null : (
                <button key={pk} title={PHOTOS[pk].caption} onClick={() => open(mediaIndex(pk))} className="group overflow-hidden rounded-[2px] ring-1 ring-white/10 hover:ring-mint">
                  <img src={thumbSrc(pk)} alt={PHOTOS[pk].short} loading="lazy" className="h-10 w-full object-cover transition group-hover:scale-105" draggable={false} />
                </button>
              ),
            )}
          </div>
        </div>
      ))}
      <p className="text-[10.5px] text-slate-400">
        {MEDIA.length} medios de las carpetas «perspectivas» y «si». Clic para abrir en grande, ver a tamaño real 1:1 o lado a lado con el 3D. Rostros y patentes difuminados.
      </p>
    </Section>
  )
}

function Panel() {
  const mode = useStore((s) => s.mode)
  const bim = useStore((s) => s.bim)
  const cutRoof = useStore((s) => s.cutRoof)
  const reflections = useStore((s) => s.reflections)
  const clay = useStore((s) => s.clay)
  const ao = useStore((s) => s.ao)
  const cad = useStore((s) => s.cadLabels)
  const gatesClosed = useStore((s) => s.gatesClosed)
  const hotspot = useStore((s) => s.hotspot)
  const flight = useStore((s) => s.flight)
  const st = useStore.getState
  const target = flight ? flight.toMode : mode
  return (
    <div className="glass scroll-thin pointer-events-auto block max-h-full w-[340px] max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-[4px]">
      <header className="relative overflow-hidden px-4 pt-4 pb-3">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-bordo via-mint to-bordo" />
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-bordo shadow-lg shadow-bordo/40 ring-1 ring-mint/30">
            <svg viewBox="0 0 64 64" className="h-7 w-7">
              <path d="M10 40 32 18l22 22" fill="none" stroke="#A8E6CF" strokeWidth="5" strokeLinejoin="round" />
              <rect x="18" y="38" width="28" height="12" fill="none" stroke="#A8E6CF" strokeWidth="4" />
            </svg>
          </div>
          <div>
            <h1 className="text-[15px] leading-tight font-extrabold text-white">Gemelo Digital XR — Proyecto: Distribuidora Orifael (Jujuy)</h1>
            <p className="mt-1 text-[11px] leading-snug text-slate-300">
              Desarrollado por: <span className="font-semibold text-mint">Lic. Sol Salas</span> — Especialista en IA, Visión por Computadora &amp; XR
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint" /> Gdor. Tello 437 · San Salvador de Jujuy · Nave 13 × 30 m · losa a 4,60 m
        </div>
      </header>

      <Section title="Modo de navegación">
        <div className="grid grid-cols-2 gap-1 rounded-[4px] bg-black/30 p-1">
          {([
            ['walk', 'Recorrido Peatonal', 'Primera persona'],
            ['orbit', 'Vista Orbital', 'Maqueta aérea'],
          ] as const).map(([m, l, sub]) => (
            <button
              key={m}
              onClick={() => st().goMode(m)}
              className={`rounded-[3px] px-2 py-2 text-left transition ${target === m ? 'bg-mint text-[#0d1a14] shadow' : 'text-slate-200 hover:bg-white/10'}`}
            >
              <div className="text-[12.5px] font-bold">{l}</div>
              <div className={`text-[10.5px] ${target === m ? 'text-[#25463a]' : 'text-slate-400'}`}>{sub}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Teletransporte rápido">
        <div className="grid gap-1.5">
          {WAYPOINTS.map((w) => (
            <button
              key={w.id}
              onClick={() => st().goWaypoint(w.id)}
              className={`group flex items-center gap-3 rounded-[4px] border px-3 py-2 text-left transition ${flight?.label.startsWith(`${w.id}.`) ? 'border-mint/60 bg-mint/10' : 'border-white/8 bg-white/[0.03] hover:border-mint/40 hover:bg-white/[0.07]'}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border border-mint/50 bg-[#0b0f14] font-mono text-[12px] font-medium text-mint">{`0${w.id}`}</span>
              <span>
                <span className="block text-[12.5px] font-semibold text-white">
                  {w.id}. {w.title}
                </span>
                <span className="block text-[11px] text-slate-400">{w.subtitle}</span>
                <span className="block font-mono text-[9.5px] text-slate-500">
                  X {w.pos[0].toFixed(1)} · Y {w.pos[1].toFixed(1)} · Z {w.pos[2].toFixed(1)} m
                </span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Inspección estructural">
        <div className="grid gap-1.5">
          <Toggle on={cad} onClick={() => st().set({ cadLabels: !cad })} label={cad ? 'Ocultar Etiquetas CAD' : 'Mostrar Etiquetas CAD'} hint="Rótulos A·B·C·D y cotas · ocultas por defecto" accent="bim" />
          <Toggle on={bim} onClick={() => st().set({ bim: !bim })} label="Vista Estructural / Rayos X (BIM Wireframe)" hint="Muros, columnas, vigas y losa en cian" accent="bim" />
          <Toggle on={cutRoof} onClick={() => st().set({ cutRoof: !cutRoof })} label="Corte de cubierta" hint="Oculta la losa para ver el interior desde arriba" />
          <Toggle on={gatesClosed} onClick={() => st().set({ gatesClosed: !gatesClosed })} label="Portones cerrados (como Street View)" hint="Apagado: abiertos en horario de atención" />
          <Toggle on={clay} onClick={() => st().set({ clay: !clay })} label="Clay Render (maqueta arquitectónica)" hint="Materiales neutros mate para leer volumen y estructura" />
          <Toggle on={ao} onClick={() => st().set({ ao: !ao })} label="Oclusión ambiental (AO)" hint="Sombras de contacto suaves · se apaga sola por debajo de 24 FPS" />
          <Toggle on={reflections} onClick={() => st().set({ reflections: !reflections })} label="Reflejos del piso pulido" hint="Desactivar en equipos lentos" />
        </div>
      </Section>

      <Section title="Hotspots técnicos">
        <div className="grid grid-cols-2 gap-1.5">
          {HOTSPOTS.map((h) => (
            <button
              key={h.id}
              onClick={() => st().openHotspot(h.id, true)}
              className={`rounded-[4px] border px-2.5 py-2 text-left transition ${hotspot === h.id ? 'border-mint/60 bg-mint/10' : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.07]'}`}
            >
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-[3px] bg-mint text-[11px] font-extrabold text-[#0d1a14]">{h.id}</span>
                <span className="text-[12px] font-semibold text-white">{h.label}</span>
              </div>
              <div className="mt-0.5 line-clamp-1 text-[10.5px] text-slate-400">{h.title}</div>
            </button>
          ))}
        </div>
      </Section>

      <MediaGallery />

      <Section title="Métricas espaciales">
        <div className="grid grid-cols-2 gap-1.5">
          {METRICS.map((m) => (
            <div key={m.k} className="rounded-[3px] bg-black/25 px-2.5 py-1.5">
              <div className="text-[10px] leading-tight text-slate-400">{m.k}</div>
              <div className="font-mono text-[13px] font-semibold text-white">{m.v}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Controles">
        <ul className="grid gap-1 text-[11.5px] text-slate-300">
          {(target === 'orbit'
            ? [
                ['Arrastrar', 'Rotar maqueta'],
                ['Rueda / pellizco', 'Zoom'],
                ['Clic derecho', 'Desplazar'],
                ['O', 'Volver a recorrido'],
              ]
            : [
                ['W A S D / Flechas', 'Caminar'],
                ['Mouse (arrastrar)', 'Mirar alrededor'],
                ['Botón "Mirar con mouse"', 'PointerLock · ESC sale'],
                ['Shift', 'Correr'],
                ['E / Q', 'Subir / bajar plataforma'],
              ]
          )
            .concat([
              ['1 – 4', 'Waypoints'],
              ['B · R · H', 'BIM · Corte · Panel'],
              ['L · G', 'Etiquetas CAD · Portones'],
            ])
            .map(([k, v]) => (
              <li key={k} className="flex justify-between gap-2">
                <kbd className="rounded-[2px] border border-white/15 bg-white/5 px-1.5 font-mono text-[10.5px] text-mint">{k}</kbd>
                <span className="text-right">{v}</span>
              </li>
            ))}
        </ul>
      </Section>

      <Section title="Rendimiento en tiempo real">
        <Stats />
      </Section>
    </div>
  )
}

function MiniMap() {
  const p = useStore((s) => s.player)
  const cad = useStore((s) => s.cadLabels)
  const zone = zoneAt(p.x, p.z)
  const ang = (Math.atan2(p.dx, -p.dz) * 180) / Math.PI
  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const g = e.currentTarget.querySelector('g[data-plan]') as SVGGElement | null
    const m = g?.getScreenCTM()
    if (!m) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    if (isBlocked(pt.x, pt.y)) return
    const s = useStore.getState()
    const len = Math.hypot(p.dx, p.dz) || 1
    s.flyTo({ label: `Ir a ${zoneAt(pt.x, pt.y)}`, pos: [pt.x, s.eye, pt.y], look: [pt.x + (p.dx / len) * 5, s.eye, pt.y + (p.dz / len) * 5], toMode: 'walk', eye: s.eye })
  }
  const r = (x0: number, x1: number, z0: number, z1: number, fill: string, op = 1) => <rect x={x0} y={z0} width={x1 - x0} height={z1 - z0} fill={fill} opacity={op} />
  return (
    <div className="glass pointer-events-auto w-[270px] rounded-[4px] p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-mint/80">Planta · Navegación</span>
        <span className="text-[10px] text-slate-400">clic = ir</span>
      </div>
      <svg viewBox="-16.5 -8.2 47 16.4" className="w-full cursor-crosshair rounded-[3px] bg-black/35" onClick={onClick}>
        <g data-plan transform="rotate(-90)">
          {r(-9, 9, STREET.z0, STREET.z1, '#3d4044', 0.8)}
          {r(-7.3, 7.3, SIDEWALK.z0, SIDEWALK.z1, '#9a9792', 0.55)}
          <rect x={-6.5} y={-15} width={13} height={30} fill="rgba(168,230,207,0.06)" stroke="#A8E6CF" strokeOpacity={0.75} strokeWidth={0.22} />
          {r(FRONT.gate1.x0, FRONT.gate1.x1, 14.7, 15.3, '#8e979f')}
          {r(FRONT.gate2.x0, FRONT.gate2.x1, 14.7, 15.3, '#c9ced2')}
          {r(FRONT.door.x - 0.45, FRONT.door.x + 0.45, 14.7, 15.3, '#0b0f14')}
          {r(OFFICE.x0, OFFICE.x1, OFFICE.z0, OFFICE.z1, '#8a5a36', 0.85)}
          {r(SALON.x0, SALON.x1, SALON.z0, SALON.z1, '#5C1A33', 0.75)}
          {r(SHELF_RUN.x0, SHELF_RUN.x1, SHELF_RUN.z0, SHELF_RUN.z1, '#b58c60', 0.9)}
          {BEV_PALLETS.map(([x, z]) => (
            <rect key={`${x}${z}`} x={x - 0.6} y={z - 0.5} width={1.2} height={1} fill="#1d5eaa" opacity={0.9} />
          ))}
          {r(CRATE_WALL.x0, CRATE_WALL.x1, CRATE_WALL.z0, CRATE_WALL.z1, '#c3202b', 0.8)}
          {r(-6.25, 6.25, -14.75, ROOF_Z0, '#6f8f6a', 0.28)}
          <line x1={-6.5} x2={6.5} y1={ROOF_Z0} y2={ROOF_Z0} stroke="#A8E6CF" strokeWidth={0.12} strokeDasharray="0.5 0.35" />
          {r(KITCHEN.x0, KITCHEN.x1, KITCHEN.z0, KITCHEN.z1, '#d9cfb8', 0.85)}
          {r(BATH.x0, BATH.x1, BATH.z0, BATH.z1, '#cfe3ea', 0.85)}
          <rect x={PICKUP.x - 0.95} y={PICKUP.z - 3.3} width={1.9} height={6.2} fill="#e8e8e8" rx={0.3} />
          {r(STACKER.x - 0.4, STACKER.x + 0.4, STACKER.z - 1.2, STACKER.z + 0.7, '#e0441d')}
          {HOTSPOTS.map((h) => (
            <circle key={h.id} cx={h.pos[0]} cy={h.pos[2]} r={0.55} fill="#A8E6CF" stroke="#0b0f14" strokeWidth={0.15} opacity={cad ? 1 : 0.6} />
          ))}
          <g transform={`translate(${p.x} ${p.z}) rotate(${ang})`}>
            <path d="M0 0 L-2.2 -5 A5.4 5.4 0 0 1 2.2 -5 Z" fill="#A8E6CF" opacity={0.28} />
            <circle r={0.8} fill="#ffffff" stroke="#5C1A33" strokeWidth={0.35} />
          </g>
        </g>
        {(
          [
            ['EST', 0, 5.8],
            ['NAVE', -3, 1],
            ['BEB', 0, -4],
            ['SALÓN', 11.6, -4.2],
            ['OF.', 9.4, 4.7],
            ['COCINA', 6.3, 4.9],
            ['BAÑO', 4.6, 4.9],
            ['PATIO', -12.2, -1.2],
          ] as [string, number, number][]
        ).map(([t, u, v]) => (
          <text key={t} x={u} y={v + 0.4} textAnchor="middle" fontSize={t.length > 4 ? 0.75 : 1.0} fill={t === 'COCINA' || t === 'BAÑO' ? '#0b0f14' : '#A8E6CF'} fontWeight={800}>
            {t}
          </text>
        ))}
        <text x={(STREET.z0 + STREET.z1) / 2} y={0} textAnchor="middle" fontSize={1.1} fill="#cbd5dc" fontWeight={700} transform={`rotate(90 ${(STREET.z0 + STREET.z1) / 2} 0)`}>
          Gdor. Tello 437
        </text>
      </svg>
      <div className="mt-2 text-[12px] font-semibold text-white">{zone}</div>
      <div className="mt-0.5 grid grid-cols-3 gap-1 font-mono text-[10.5px] text-slate-300">
        <span>X {p.x.toFixed(1)}</span>
        <span>Z {p.z.toFixed(1)}</span>
        <span>H {p.y.toFixed(1)} m</span>
      </div>
      <div className="mt-0.5 font-mono text-[10.5px] text-slate-400">Dist. a portón principal: {Math.hypot(p.x - GATE1_X, p.z - HALF_D).toFixed(1)} m</div>
      <button
        onClick={() => useStore.getState().set({ cadLabels: !cad })}
        className={`mt-2 w-full rounded-[3px] border px-2 py-1.5 text-[11.5px] font-semibold transition ${cad ? 'border-bim/60 bg-bim/10 text-bim' : 'border-white/15 text-slate-200 hover:bg-white/10'}`}
      >
        {cad ? 'Ocultar Etiquetas CAD' : 'Mostrar Etiquetas CAD'}
      </button>
    </div>
  )
}

function VRButton() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const inXR = useStore((s) => s.inXR)
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    const xr = (navigator as Navigator & { xr?: { isSessionSupported: (m: string) => Promise<boolean> } }).xr
    if (!xr) {
      setSupported(import.meta.env.DEV)
      return
    }
    xr.isSessionSupported('immersive-vr').then(setSupported).catch(() => setSupported(false))
  }, [])
  const click = async () => {
    if (inXR) {
      xrStore.getState().session?.end()
      return
    }
    if (!supported) {
      setMsg('WebXR no disponible en este navegador. Abrí este link en Meta Quest Browser.')
      setTimeout(() => setMsg(null), 4500)
      return
    }
    try {
      await xrStore.enterVR()
    } catch (e) {
      setMsg('No se pudo iniciar la sesión VR: ' + (e as Error).message)
      setTimeout(() => setMsg(null), 4500)
    }
  }
  return (
    <div className="pointer-events-auto flex flex-col items-end gap-2">
      {msg && <div className="glass max-w-[260px] rounded-[4px] px-3 py-2 text-[12px] text-slate-200">{msg}</div>}
      <button
        onClick={click}
        className="group flex items-center gap-2.5 rounded-[4px] border border-mint/50 bg-gradient-to-br from-bordo to-[#3a0f20] px-4 py-3 font-bold text-white shadow-xl shadow-black/40 transition hover:scale-[1.03] hover:border-mint"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-mint" fill="currentColor">
          <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4.2l-1.6-2.4a1.4 1.4 0 0 0-2.4 0L9.2 17H5a2 2 0 0 1-2-2V7Zm5 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
        <span className="text-left leading-tight">
          <span className="block text-[14px]">{inXR ? 'Salir de VR' : 'Enter VR / WebXR'}</span>
          <span className="block text-[10.5px] font-medium text-mint/80">
            {supported === null ? 'Detectando visor…' : supported ? 'Meta Quest compatible' : 'Usar en Meta Quest Browser'}
          </span>
        </span>
      </button>
    </div>
  )
}

function Hold({ label, onChange, className = '' }: { label: ReactNode; onChange: (on: boolean) => void; className?: string }) {
  return (
    <button
      className={`no-select flex h-12 w-12 items-center justify-center rounded-[4px] border border-white/15 bg-black/45 text-lg font-bold text-white backdrop-blur active:bg-mint active:text-[#0d1a14] ${className}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        onChange(true)
      }}
      onPointerUp={() => onChange(false)}
      onPointerCancel={() => onChange(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  )
}

function TouchPad() {
  const set = (k: 'x' | 'z' | 'y', v: number) => (on: boolean) => {
    const t = useStore.getState().touch
    useStore.setState({ touch: { ...t, [k]: on ? v : 0 } })
  }
  return (
    <div className="pointer-events-auto flex items-end gap-3">
      <div className="grid grid-cols-3 gap-1.5">
        <span />
        <Hold label="▲" onChange={set('z', 1)} />
        <span />
        <Hold label="◀" onChange={set('x', -1)} />
        <Hold label="▼" onChange={set('z', -1)} />
        <Hold label="▶" onChange={set('x', 1)} />
      </div>
      <div className="grid gap-1.5">
        <Hold label={<span className="text-[11px]">SUBIR</span>} onChange={set('y', 1)} className="w-14" />
        <Hold label={<span className="text-[11px]">BAJAR</span>} onChange={set('y', -1)} className="w-14" />
      </div>
    </div>
  )
}

function Welcome() {
  const started = useStore((s) => s.started)
  if (started) return null
  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black/40 via-black/55 to-black/75 p-4">
      <div className="glass w-full max-w-lg rounded-[4px] p-7 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] bg-bordo ring-1 ring-mint/40">
          <svg viewBox="0 0 64 64" className="h-9 w-9">
            <path d="M10 40 32 18l22 22" fill="none" stroke="#A8E6CF" strokeWidth="5" strokeLinejoin="round" />
            <rect x="18" y="38" width="28" height="12" fill="none" stroke="#A8E6CF" strokeWidth="4" />
          </svg>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mint">Spatial Digital Twin &amp; VR Walkthrough</p>
        <h2 className="mt-2 text-2xl font-extrabold text-white">Distribuidora Orifael</h2>
        <p className="text-sm text-slate-300">Centro Logístico Jujuy · Gdor. Tello 437, San Salvador de Jujuy</p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-left text-[11.5px]">
          {[
            ['Recorrido', 'WASD + mouse en primera persona'],
            ['Maqueta', 'Vista orbital del edificio'],
            ['BIM + VR', 'Rayos X estructural y Meta Quest'],
          ].map(([a, b]) => (
            <div key={a} className="rounded-[4px] border border-white/10 bg-white/[0.04] p-2.5">
              <div className="font-bold text-white">{a}</div>
              <div className="text-slate-400">{b}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const s = useStore.getState()
            s.start()
            s.goWaypoint(1)
          }}
          className="mt-6 w-full rounded-[4px] bg-mint py-3.5 text-[15px] font-extrabold text-[#0d1a14] shadow-lg shadow-mint/20 transition hover:brightness-105"
        >
          Iniciar recorrido
        </button>
        <p className="mt-4 text-[11px] text-slate-400">Lic. Sol Salas — Especialista en IA, Visión por Computadora &amp; XR</p>
      </div>
    </div>
  )
}

export function HUD() {
  const hudOpen = useStore((s) => s.hudOpen)
  const mode = useStore((s) => s.mode)
  const flight = useStore((s) => s.flight)
  const locked = useStore((s) => s.locked)
  const aim = useStore((s) => s.aimHotspot)
  const inXR = useStore((s) => s.inXR)
  const walking = mode === 'walk' && !flight
  const [coarse, setCoarse] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    setCoarse(mq.matches)
    const f = (e: MediaQueryListEvent) => setCoarse(e.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [])
  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-slate-100">
      {!inXR && (
        <>
          <div className="absolute top-3 bottom-3 left-3 flex min-h-0 flex-col items-start gap-2">
            <button
              onClick={() => useStore.getState().toggleHud()}
              className="glass pointer-events-auto rounded-[4px] px-3 py-1.5 text-[12px] font-semibold text-mint hover:text-white"
            >
              {hudOpen ? '◂ Ocultar panel' : '▸ Panel de control'}
            </button>
            {hudOpen && <Panel />}
          </div>
          <div className="absolute top-3 right-3 hidden sm:block">
            <MiniMap />
          </div>
        </>
      )}

      {flight && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="glass flex items-center gap-2 rounded-[3px] px-4 py-2 text-[13px] font-semibold text-white">
            <span className="h-2 w-2 animate-ping rounded-[3px] bg-mint" /> {flight.label}
          </div>
        </div>
      )}

      {walking && locked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className={`h-5 w-5 rounded-[3px] border-2 transition ${aim ? 'scale-125 border-mint bg-mint/30' : 'border-white/80'}`} />
          {aim && <div className="mt-2 -translate-x-1/3 rounded-[2px] bg-black/60 px-2 py-0.5 text-[11px] whitespace-nowrap text-mint">Clic: Hotspot {aim}</div>}
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <button
          data-lock
          className={`glass pointer-events-auto rounded-[3px] px-4 py-2 max-sm:!hidden text-[12.5px] font-semibold text-white transition hover:border-mint/50 ${walking && !locked && !coarse && !inXR ? '' : 'hidden'}`}
        >
          <span className="text-mint">◉</span> Mirar con mouse (PointerLock) · <span className="text-slate-400">WASD para caminar</span>
        </button>
        {walking && locked && <div className="rounded-[3px] bg-black/50 px-3 py-1 text-[11.5px] text-slate-300">ESC para liberar el mouse</div>}
      </div>

      {walking && !inXR && (
        <div className={`absolute bottom-4 left-3 ${hudOpen && !coarse ? 'hidden lg:block lg:left-[360px]' : ''}`}>
          <TouchPad />
        </div>
      )}

      <div className="absolute top-3 right-3 sm:top-auto sm:bottom-4">
        <VRButton />
      </div>

      <Welcome />
      <Viewer />
    </div>
  )
}
