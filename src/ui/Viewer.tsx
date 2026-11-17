import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MEDIA, PHOTOS, VIDEO, ZONES, ZONE_HOTSPOT, photoSrc, thumbSrc } from '../data'
import { useStore } from '../store'

export function Viewer() {
  const v = useStore((s) => s.viewer)
  const [actual, setActual] = useState(false)
  const n = MEDIA.length
  useEffect(() => {
    if (!v) return
    const onKey = (e: KeyboardEvent) => {
      const s = useStore.getState()
      if (!s.viewer) return
      if (e.key === 'ArrowRight') s.set({ viewer: { ...s.viewer, i: (s.viewer.i + 1) % n } })
      if (e.key === 'ArrowLeft') s.set({ viewer: { ...s.viewer, i: (s.viewer.i + n - 1) % n } })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [v, n])
  if (!v) return null
  const st = useStore.getState
  const m = MEDIA[v.i]
  const go = (d: number) => st().set({ viewer: { ...v, i: (v.i + d + n) % n } })
  const zone = m.kind === 'photo' ? PHOTOS[m.k].zone : 'gal'
  const hs = m.kind === 'photo' ? ZONE_HOTSPOT[zone] : 'B'
  const caption = m.kind === 'photo' ? PHOTOS[m.k].caption : VIDEO.caption
  const btn = 'rounded-[3px] border px-2.5 py-1 text-[11.5px] font-semibold transition'
  return createPortal(
    <div
      className={`${v.split ? 'fixed top-0 right-0 bottom-0 w-[48vw] min-w-[340px] border-l' : 'fixed inset-0'} z-[100] flex flex-col border-mint/30 bg-[#07090c]/95 text-slate-100 backdrop-blur`}
      role="dialog"
      aria-label="Visor de Relevamiento Real 1:1"
    >
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="rounded-[2px] bg-bordo px-2 py-0.5 font-mono text-[10.5px] font-bold tracking-wider text-mint">VISOR 1:1</span>
        <span className="text-[13px] font-bold">Relevamiento real vs. Gemelo Digital XR</span>
        <span className="font-mono text-[11px] text-slate-400">
          {v.i + 1} / {n}
        </span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {m.kind === 'photo' && (
            <button onClick={() => setActual(!actual)} className={`${btn} ${actual ? 'border-mint bg-mint text-[#0d1a14]' : 'border-white/15 hover:bg-white/10'}`}>
              {actual ? 'Ajustar a pantalla' : 'Tamaño real 1:1'}
            </button>
          )}
          <button onClick={() => st().set({ viewer: { ...v, split: !v.split } })} className={`${btn} border-white/15 hover:bg-white/10`}>
            {v.split ? 'Pantalla completa' : 'Lado a lado con el 3D'}
          </button>
          <button
            onClick={() => {
              st().set({ viewer: { ...v, split: true } })
              st().openHotspot(hs, true)
            }}
            className={`${btn} border-mint/50 text-mint hover:bg-mint/15`}
          >
            Ir al Hotspot {hs} en 3D
          </button>
          <button onClick={() => st().set({ viewer: null })} className={`${btn} border-white/15 hover:bg-white/10`} aria-label="Cerrar">
            ✕
          </button>
        </div>
      </header>
      <div className={`relative min-h-0 flex-1 ${actual && m.kind === 'photo' ? 'overflow-auto' : 'flex items-center justify-center overflow-hidden'} p-2`}>
        {m.kind === 'video' ? (
          <video key="vid" src={VIDEO.src} poster={VIDEO.poster} controls autoPlay muted loop playsInline className="max-h-full max-w-full rounded-[3px] ring-1 ring-white/15" />
        ) : actual ? (
          <img src={photoSrc(m.k)} alt={caption} className="max-w-none" draggable={false} />
        ) : (
          <img src={photoSrc(m.k)} alt={caption} className="max-h-full max-w-full rounded-[3px] object-contain ring-1 ring-white/15" draggable={false} />
        )}
        <button onClick={() => go(-1)} className="absolute top-1/2 left-2 -translate-y-1/2 rounded-[3px] bg-black/60 px-3 py-2 text-xl text-white hover:bg-black/85" aria-label="Anterior">
          ‹
        </button>
        <button onClick={() => go(1)} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-[3px] bg-black/60 px-3 py-2 text-xl text-white hover:bg-black/85" aria-label="Siguiente">
          ›
        </button>
      </div>
      <div className="border-t border-white/10 px-3 py-2 text-[12.5px]">
        <span className="mr-2 rounded bg-bordo px-1.5 py-0.5 text-[10.5px] font-bold text-mint">{m.kind === 'video' ? 'VIDEO REAL' : ZONES[zone]}</span>
        {m.kind === 'video' ? <b className="mr-1">{VIDEO.title}.</b> : null}
        {caption}
        <span className="ml-2 text-[11px] text-slate-500">Rostros y patentes difuminados.</span>
      </div>
      <div className="scroll-thin flex gap-1 overflow-x-auto px-3 pb-3">
        {MEDIA.map((it, i) => (
          <button
            key={i}
            onClick={() => st().set({ viewer: { ...v, i } })}
            className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-[2px] ring-2 ${i === v.i ? 'ring-mint' : 'ring-transparent opacity-60 hover:opacity-100'}`}
          >
            <img src={it.kind === 'video' ? VIDEO.poster : thumbSrc(it.k)} alt="" className="h-full w-full object-cover" draggable={false} />
            {it.kind === 'video' && <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-lg text-white">▶</span>}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}
