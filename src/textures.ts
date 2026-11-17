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
    ctx.fillStyle = 'rgba(34,36,40,0.9)'
    ctx.fillRect(0, 0, w, 5)
    ctx.fillRect(0, 0, 5, h)
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(0, 5, w, 2)
    ctx.fillRect(5, 0, 2, h)
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

export const boxTex = (variant: 0 | 1) =>
  make(`box-${variant}`, 512, 512, (ctx, w, h) => {
    ctx.fillStyle = variant === 0 ? '#b08657' : '#bf9866'
    ctx.fillRect(0, 0, w, h)
    noise(ctx, w, h, 16, 31 + variant)
    const r = rng(77 + variant)
    for (let i = 0; i < 160; i++) {
      ctx.strokeStyle = `rgba(90,60,30,${0.03 + r() * 0.05})`
      ctx.lineWidth = 1
      const y = r() * h
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y + (r() - 0.5) * 6)
      ctx.stroke()
    }
    const vg = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, 'rgba(50,30,10,0.35)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(214,186,138,0.75)'
    ctx.fillRect(0, h * 0.44, w, h * 0.11)
    ctx.fillStyle = 'rgba(255,245,220,0.18)'
    ctx.fillRect(0, h * 0.455, w, h * 0.02)
    ctx.fillStyle = 'rgba(48,32,22,0.82)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.font = 'bold 46px Arial, Helvetica, sans-serif'
    ctx.fillText('ORIFAEL', 34, 92)
    ctx.font = '19px Arial, Helvetica, sans-serif'
    ctx.fillText('DISTRIBUIDORA · S. S. DE JUJUY', 36, 120)
    ctx.strokeStyle = 'rgba(48,32,22,0.8)'
    ctx.lineWidth = 4
    ;[0, 1].forEach((k) => {
      const x = 380 + k * 52
      ctx.beginPath()
      ctx.moveTo(x, 110)
      ctx.lineTo(x, 50)
      ctx.moveTo(x - 14, 66)
      ctx.lineTo(x, 50)
      ctx.lineTo(x + 14, 66)
      ctx.stroke()
    })
    ctx.strokeRect(370, 40, 104, 82)
    ctx.fillStyle = '#f4f2ec'
    ctx.fillRect(280, 330, 196, 140)
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.lineWidth = 2
    ctx.strokeRect(280, 330, 196, 140)
    ctx.fillStyle = '#1d1d1d'
    ctx.font = '15px "Courier New", monospace'
    ctx.fillText(`SKU 437-${variant ? '2318' : '0915'}`, 292, 352)
    ctx.fillText(`LOTE JUJ-26-${variant ? '11' : '07'}`, 292, 372)
    ctx.fillText(variant ? '12 x 1,5 L' : '6 x 2,25 L', 292, 392)
    for (let i = 0; i < 44; i++) {
      const bw = r() > 0.6 ? 3 : 1.5
      ctx.fillRect(292 + i * 4, 402, bw, 46)
    }
    ctx.font = '11px "Courier New", monospace'
    ctx.fillText('7 790895 00' + (variant ? '2318' : '0915'), 300, 462)
    ctx.fillStyle = 'rgba(48,32,22,0.7)'
    ctx.font = 'bold 22px Arial, Helvetica, sans-serif'
    ctx.fillText(variant ? 'FRÁGIL' : 'ESTE LADO ARRIBA', 34, 440)
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

export const brickTex = () =>
  make('brick', 1024, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#9c8f84'
    ctx.fillRect(0, 0, w, h)
    const rows = 5
    const cols = 3
    const rh = h / rows
    const cw = w / cols
    const m = 14
    const r = rng(31)
    const pal = ['#b5563a', '#c0623f', '#a94d34', '#c86d48', '#b85d3f', '#a2492f', '#cf7752']
    for (let y = 0; y < rows; y++) {
      const off = y % 2 ? cw / 2 : 0
      for (let x = -1; x <= cols; x++) {
        const bx = x * cw + off + m / 2
        const by = y * rh + m / 2
        const bw = cw - m
        const bh = rh - m
        ctx.fillStyle = pal[Math.floor(r() * pal.length)]
        ctx.fillRect(bx, by, bw, bh)
        const g = ctx.createLinearGradient(0, by, 0, by + bh)
        g.addColorStop(0, 'rgba(255,220,190,0.12)')
        g.addColorStop(1, 'rgba(60,20,10,0.18)')
        ctx.fillStyle = g
        ctx.fillRect(bx, by, bw, bh)
        ctx.strokeStyle = 'rgba(70,25,12,0.18)'
        ctx.lineWidth = 3
        for (let k = 1; k < 4; k++) {
          ctx.beginPath()
          ctx.moveTo(bx + 6, by + (bh * k) / 4)
          ctx.lineTo(bx + bw - 6, by + (bh * k) / 4)
          ctx.stroke()
        }
        for (let k = 0; k < 30; k++) {
          ctx.fillStyle = `rgba(${r() > 0.5 ? '255,230,210' : '60,20,10'},${0.05 + r() * 0.1})`
          ctx.fillRect(bx + r() * bw, by + r() * bh, 4 + r() * 18, 2 + r() * 6)
        }
        if (r() > 0.8) {
          ctx.fillStyle = 'rgba(200,195,185,0.35)'
          ctx.fillRect(bx + r() * bw * 0.6, by + bh - 10, 30 + r() * 60, 12)
        }
      }
    }
    noise(ctx, w, h, 22, 5)
  })

export const plankTex = () =>
  make('plank', 512, 1024, (ctx, w, h) => {
    const n = 6
    const pw = w / n
    const r = rng(77)
    const pal = ['#8a5a36', '#7b4e2e', '#94623b', '#6f4428', '#9a6a43']
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = pal[Math.floor(r() * pal.length)]
      ctx.fillRect(i * pw, 0, pw, h)
      for (let k = 0; k < 40; k++) {
        ctx.strokeStyle = `rgba(${r() > 0.5 ? '50,25,10' : '200,150,100'},${0.08 + r() * 0.12})`
        ctx.lineWidth = 1 + r() * 2.5
        const x = i * pw + r() * pw
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.bezierCurveTo(x + (r() - 0.5) * 18, h * 0.3, x + (r() - 0.5) * 18, h * 0.7, x + (r() - 0.5) * 10, h)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(30,15,5,0.55)'
      ctx.fillRect(i * pw, 0, 3, h)
    }
    noise(ctx, w, h, 16, 9)
  })

export const orifaelSignTex = () =>
  make('orifael-sign', 2048, 640, (ctx, w, h) => {
    const r = rng(12)
    const n = 14
    for (let i = 0; i < n; i++) {
      const pw = w / n
      ctx.fillStyle = ['#4a3020', '#3f2819', '#553724', '#47301f'][i % 4]
      ctx.fillRect(i * pw, 0, pw, h)
      for (let k = 0; k < 60; k++) {
        ctx.strokeStyle = `rgba(${r() > 0.5 ? '25,12,5' : '140,95,60'},${0.12 + r() * 0.15})`
        ctx.lineWidth = 1 + r() * 3
        const x = i * pw + r() * pw
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + (r() - 0.5) * 14, h)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(i * pw, 0, 4, h)
    }
    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.6)
    vg.addColorStop(0, 'rgba(255,220,180,0.12)')
    vg.addColorStop(1, 'rgba(0,0,0,0.35)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, w, h)
    ctx.textBaseline = 'alphabetic'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 14
    ctx.shadowOffsetY = 6
    ctx.font = '900 300px Inter, Arial Black, sans-serif'
    const word = 'ORIFAEL'
    const total = ctx.measureText(word).width + 60
    let x = (w - total) / 2
    const y = 300
    for (const [i, ch] of [...word].entries()) {
      ctx.fillStyle = i === 0 ? '#9b1b1f' : '#f1f1ee'
      ctx.fillText(ch, x, y)
      if (i === 0) {
        ctx.lineWidth = 10
        ctx.strokeStyle = '#f1f1ee'
        ctx.strokeText(ch, x, y)
      }
      x += ctx.measureText(ch).width + 10
    }
    ctx.textAlign = 'center'
    ctx.fillStyle = '#f4f1ea'
    ctx.font = '800 82px Inter, Arial, sans-serif'
    ctx.fillText('MAYORISTA Y MINORISTA', w / 2, 410)
    ctx.font = '700 56px Inter, Arial, sans-serif'
    ctx.fillText('VENTA DE MERCADERÍA, BEBIDAS Y ARTÍCULOS DE LIMPIEZA', w / 2, 500)
    ctx.shadowBlur = 0
    ctx.font = '600 46px Inter, Arial, sans-serif'
    ctx.textAlign = 'left'
    const items: [string, string][] = [
      ['#25d366', 'Tel: 388 4332421'],
      ['#d62976', '@distribuidoraorifael'],
      ['#1877f2', 'Distribuidora Orifael'],
    ]
    items.forEach(([c, t], i) => {
      const ix = 120 + i * 640
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.roundRect(ix, 548, 48, 48, 10)
      ctx.fill()
      ctx.fillStyle = '#f4f1ea'
      ctx.fillText(t, ix + 66, 588)
    })
  })

export const offerTex = (key: string, lines: string[], bg = '#d9f33c', fg = '#151515') =>
  make(`offer-${key}`, 512, 256, (ctx, w, h) => {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(0,0,0,0.06)'
    for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 30, 2)
    ctx.fillStyle = fg
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const big = lines.length === 1 ? 92 : lines.length === 2 ? 74 : 56
    lines.forEach((l, i) => {
      ctx.font = `800 ${i === 0 ? big : big * 0.72}px "Comic Sans MS", "Marker Felt", Inter, sans-serif`
      const y = h / 2 + (i - (lines.length - 1) / 2) * big * 0.95
      ctx.save()
      ctx.translate(w / 2, y)
      ctx.rotate(-0.02 + i * 0.015)
      ctx.fillText(l, 0, 0, w - 40)
      ctx.restore()
    })
  })

export const bevPackTex = (v: number) =>
  make(`bev-${v}`, 512, 512, (ctx, w, h) => {
    const r = rng(100 + v)
    const sets = [
      ['#3b1a10', '#c8102e'],
      ['#f08a1c', '#1b5e20'],
      ['#9be15d', '#0d47a1'],
      ['#7fc8f8', '#e3f2fd'],
    ]
    ctx.fillStyle = '#2b2b2b'
    ctx.fillRect(0, 0, w, h)
    const rows = 4
    const ph = h / rows
    for (let y = 0; y < rows; y++) {
      const [liq, label] = sets[(v + y + Math.floor(r() * 2)) % sets.length]
      const bottles = 8
      const bw = w / bottles
      for (let b = 0; b < bottles; b++) {
        const bx = b * bw
        const by = y * ph
        ctx.fillStyle = liq
        ctx.beginPath()
        ctx.roundRect(bx + 6, by + ph * 0.22, bw - 12, ph * 0.74, 14)
        ctx.fill()
        ctx.fillRect(bx + bw * 0.38, by + 6, bw * 0.24, ph * 0.2)
        ctx.fillStyle = label
        ctx.fillRect(bx + 6, by + ph * 0.48, bw - 12, ph * 0.22)
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.fillRect(bx + 12, by + ph * 0.26, 5, ph * 0.6)
      }
      ctx.fillStyle = 'rgba(20,20,20,0.85)'
      ctx.fillRect(0, y * ph + ph - 5, w, 5)
    }
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, 'rgba(255,255,255,0.18)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.02)')
    g.addColorStop(1, 'rgba(255,255,255,0.14)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })

function heightToNormal(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const src = ctx.getImageData(0, 0, w, h).data
  const out = ctx.createImageData(w, h)
  const H = (x: number, y: number) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength
      const l = Math.hypot(dx, dy, 1)
      const i = (y * w + x) * 4
      out.data[i] = (-dx / l) * 127.5 + 127.5
      out.data[i + 1] = (dy / l) * 127.5 + 127.5
      out.data[i + 2] = (1 / l) * 127.5 + 127.5
      out.data[i + 3] = 255
    }
  ctx.putImageData(out, 0, 0)
}

export const brickNormalTex = () =>
  make(
    'brick-n',
    1024,
    1024,
    (ctx, w, h) => {
      ctx.fillStyle = '#3a3a3a'
      ctx.fillRect(0, 0, w, h)
      const rows = 5
      const cols = 3
      const rh = h / rows
      const cw = w / cols
      const m = 14
      const r = rng(91)
      for (let y = 0; y < rows; y++) {
        const off = y % 2 ? cw / 2 : 0
        for (let x = -1; x <= cols; x++) {
          const bx = x * cw + off + m / 2
          const by = y * rh + m / 2
          ctx.fillStyle = '#9a9a9a'
          ctx.fillRect(bx - 3, by - 3, cw - m + 6, rh - m + 6)
          ctx.fillStyle = '#d4d4d4'
          ctx.fillRect(bx + 3, by + 3, cw - m - 6, rh - m - 6)
          for (let k = 0; k < 60; k++) {
            const v = 150 + Math.floor(r() * 90)
            ctx.fillStyle = `rgb(${v},${v},${v})`
            ctx.fillRect(bx + r() * (cw - m), by + r() * (rh - m), 3 + r() * 14, 2 + r() * 6)
          }
        }
      }
      noise(ctx, w, h, 18, 13)
      heightToNormal(ctx, w, h, 4)
    },
    false,
  )

export const concreteNormalTex = () =>
  make(
    'concrete-n',
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = '#808080'
      ctx.fillRect(0, 0, w, h)
      noise(ctx, w, h, 10, 17)
      ctx.fillStyle = '#202020'
      ctx.fillRect(0, 0, w, 3)
      ctx.fillRect(0, 0, 3, h)
      heightToNormal(ctx, w, h, 3)
    },
    false,
  )
