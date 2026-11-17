import * as THREE from 'three'

const cache = new Map<string, THREE.CanvasTexture>()

export function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

function make(key: string, w: number, h: number, draw: Draw, srgb = true) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(canvas)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  cache.set(key, tex)
  return tex
}

export function repeated(tex: THREE.Texture, rx: number, ry: number) {
  const t = tex.clone()
  t.repeat.set(rx, ry)
  t.needsUpdate = true
  return t
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, amp: number, seed: number) {
  const img = ctx.getImageData(0, 0, w, h)
  const r = rng(seed)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amp
    img.data[i] += n
    img.data[i + 1] += n
    img.data[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

export const concreteTex = () =>
  make('concrete', 1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#a3a5a7'
    ctx.fillRect(0, 0, w, h)
    const r = rng(7)
    for (let i = 0; i < 90; i++) {
      const x = r() * w
      const y = r() * h
      const rad = 40 + r() * 220
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
      const dark = r() > 0.5
      g.addColorStop(0, dark ? 'rgba(70,72,76,0.10)' : 'rgba(220,222,224,0.10)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`
      ctx.lineWidth = 30 + r() * 60
      ctx.beginPath()
      const cx = r() * w
      const cy = r() * h
      ctx.arc(cx, cy, 80 + r() * 200, r() * 6, r() * 6 + 1.5)
      ctx.stroke()
    }
    noise(ctx, w, h, 22, 11)
    ctx.fillStyle = 'rgba(40,42,46,0.85)'
    ctx.fillRect(0, 0, w, 3)
    ctx.fillRect(0, 0, 3, h)
  })

export const asphaltTex = () =>
  make('asphalt', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#3d4044'
    ctx.fillRect(0, 0, w, h)
    noise(ctx, w, h, 40, 3)
  })

export const sidewalkTex = () =>
  make('sidewalk', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#b9b4aa'
    ctx.fillRect(0, 0, w, h)
    noise(ctx, w, h, 18, 5)
    ctx.strokeStyle = 'rgba(80,76,70,0.6)'
    ctx.lineWidth = 3
    for (let i = 0; i <= 4; i++) {
      ctx.beginPath()
      ctx.moveTo((i * w) / 4, 0)
      ctx.lineTo((i * w) / 4, h)
      ctx.moveTo(0, (i * h) / 4)
      ctx.lineTo(w, (i * h) / 4)
      ctx.stroke()
    }
  })

export const corrugatedTex = (horizontal = false) =>
  make(`corr-${horizontal}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    const ribs = 5
    const size = horizontal ? h : w
    for (let i = 0; i < ribs; i++) {
      const s0 = (i * size) / ribs
      const g = horizontal ? ctx.createLinearGradient(0, s0, 0, s0 + size / ribs) : ctx.createLinearGradient(s0, 0, s0 + size / ribs, 0)
      g.addColorStop(0, '#d9d9d9')
      g.addColorStop(0.25, '#ffffff')
      g.addColorStop(0.5, '#e8e8e8')
      g.addColorStop(0.75, '#a9a9a9')
      g.addColorStop(1, '#d0d0d0')
      ctx.fillStyle = g
      if (horizontal) ctx.fillRect(0, s0, w, size / ribs)
      else ctx.fillRect(s0, 0, size / ribs, h)
    }
    noise(ctx, w, h, 8, 9)
  })

export const woodTex = () =>
  make('wood', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#3a2a1a'
    ctx.fillRect(0, 0, w, h)
    const r = rng(21)
    const planks = 5
    for (let i = 0; i < planks; i++) {
      const y = (i * h) / planks
      const c = 150 + r() * 40
      ctx.fillStyle = `rgb(${c},${c * 0.74},${c * 0.48})`
      ctx.fillRect(0, y + 4, w, h / planks - 8)
      for (let k = 0; k < 14; k++) {
        ctx.strokeStyle = `rgba(90,60,30,${0.15 + r() * 0.2})`
        ctx.lineWidth = 1
        ctx.beginPath()
        const yy = y + 6 + r() * (h / planks - 12)
        ctx.moveTo(0, yy)
        ctx.bezierCurveTo(w * 0.3, yy + r() * 4 - 2, w * 0.6, yy + r() * 4 - 2, w, yy)
        ctx.stroke()
      }
    }
    noise(ctx, w, h, 14, 2)
  })

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export const boxTex = (variant: 0 | 1) =>
  make(`box-${variant}`, 512, 512, (ctx, w, h) => {
    ctx.fillStyle = variant === 0 ? '#c79d6c' : '#e9e6df'
    ctx.fillRect(0, 0, w, h)
    noise(ctx, w, h, variant === 0 ? 26 : 10, 31 + variant)
    ctx.fillStyle = variant === 0 ? 'rgba(235,215,170,0.55)' : 'rgba(168,230,207,0.55)'
    ctx.fillRect(w * 0.44, 0, w * 0.12, h)
    ctx.strokeStyle = variant === 0 ? '#5C1A33' : '#2f6f5a'
    ctx.lineWidth = 10
    roundRect(ctx, 70, 150, 372, 190, 18)
    ctx.stroke()
    ctx.fillStyle = variant === 0 ? '#5C1A33' : '#2b5f4e'
    ctx.font = 'bold 82px Arial, Helvetica, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ORIFAEL', w / 2, 222)
    ctx.font = 'bold 28px Arial, Helvetica, sans-serif'
    ctx.fillText('DISTRIBUIDORA · JUJUY', w / 2, 296)
    ctx.font = 'bold 44px Arial, Helvetica, sans-serif'
    ctx.fillText(variant === 0 ? '↑ ↑' : 'FRÁGIL', w / 2, 70)
    ctx.font = '26px "Courier New", monospace'
    ctx.fillStyle = '#222'
    ctx.fillText(variant === 0 ? 'SKU 437-0' + Math.floor(rng(variant + 3)() * 900 + 100) : 'LOTE JUJ-2026', w / 2, 420)
    for (let i = 0; i < 26; i++) {
      ctx.fillRect(150 + i * 8, 445, i % 3 === 0 ? 4 : 2, 40)
    }
  })

export const hazardTex = () =>
  make('hazard', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f2c230'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#16181b'
    for (let i = -4; i < 8; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 64, 0)
      ctx.lineTo(i * 64 + 32, 0)
      ctx.lineTo(i * 64 + 32 + h, h)
      ctx.lineTo(i * 64 + h, h)
      ctx.closePath()
      ctx.fill()
    }
  })

export type SignStyle = 'brand' | 'aisle' | 'zone' | 'street' | 'screen'

export function signTex(key: string, lines: string[], style: SignStyle, w = 1024, h = 256) {
  return make(`sign-${key}`, w, h, (ctx) => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (style === 'brand') {
      const g = ctx.createLinearGradient(0, 0, w, h)
      g.addColorStop(0, '#3d0f21')
      g.addColorStop(0.55, '#5C1A33')
      g.addColorStop(1, '#2a0a17')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#A8E6CF'
      ctx.lineWidth = h * 0.025
      ctx.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1)
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = '#A8E6CF'
      ctx.shadowBlur = h * 0.06
      ctx.font = `800 ${h * 0.3}px Arial, Helvetica, sans-serif`
      ctx.fillText(lines[0], w / 2, h * 0.4)
      ctx.fillStyle = '#A8E6CF'
      ctx.font = `600 ${h * 0.16}px Arial, Helvetica, sans-serif`
      ctx.fillText(lines[1] ?? '', w / 2, h * 0.72)
    } else if (style === 'aisle') {
      ctx.fillStyle = '#0f1419'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#A8E6CF'
      ctx.fillRect(0, 0, h * 0.9, h)
      ctx.fillStyle = '#0f1419'
      ctx.font = `800 ${h * 0.62}px Arial, Helvetica, sans-serif`
      ctx.fillText(lines[0], h * 0.45, h * 0.54)
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'left'
      ctx.font = `700 ${h * 0.3}px Arial, Helvetica, sans-serif`
      ctx.fillText(lines[1], h * 1.1, h * 0.38)
      ctx.fillStyle = '#9fb3bf'
      ctx.font = `500 ${h * 0.18}px Arial, Helvetica, sans-serif`
      ctx.fillText(lines[2] ?? '', h * 1.1, h * 0.7)
    } else if (style === 'zone') {
      ctx.fillStyle = '#f2c230'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#16181b'
      ctx.fillRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12)
      ctx.fillStyle = '#f2c230'
      ctx.font = `800 ${h * 0.34}px Arial, Helvetica, sans-serif`
      ctx.fillText(lines[0], w / 2, h * 0.42)
      ctx.fillStyle = '#ffffff'
      ctx.font = `600 ${h * 0.17}px Arial, Helvetica, sans-serif`
      ctx.fillText(lines[1] ?? '', w / 2, h * 0.74)
    } else if (style === 'street') {
      ctx.fillStyle = '#1d5c3a'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = h * 0.05
      ctx.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16)
      ctx.fillStyle = '#fff'
      ctx.font = `700 ${h * 0.4}px Arial, Helvetica, sans-serif`
      ctx.fillText(lines[0], w / 2, h * 0.42)
      ctx.font = `500 ${h * 0.2}px Arial, Helvetica, sans-serif`
      ctx.fillText(lines[1] ?? '', w / 2, h * 0.75)
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#0d2a2a')
      g.addColorStop(1, '#06121a')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(168,230,207,0.25)'
      ctx.lineWidth = 2
      for (let i = 0; i < 12; i++) {
        ctx.beginPath()
        ctx.moveTo(0, (i * h) / 12)
        ctx.lineTo(w, (i * h) / 12)
        ctx.stroke()
      }
      ctx.fillStyle = '#A8E6CF'
      ctx.font = `700 ${h * 0.16}px Arial, Helvetica, sans-serif`
      lines.forEach((l, i) => ctx.fillText(l, w / 2, h * (0.25 + i * 0.22)))
    }
  })
}
