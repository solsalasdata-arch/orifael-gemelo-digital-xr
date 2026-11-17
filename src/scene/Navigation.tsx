import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { XROrigin, useXR, useXRControllerLocomotion } from '@react-three/xr'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { COLLIDERS, EYE, EYE_MAX, EYE_MIN, ORBIT_VIEW, WAYPOINTS } from '../data'
import { useStore } from '../store'

const RADIUS = 0.32
const keys = new Set<string>()

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')
}

export function resolveCollisions(p: THREE.Vector3, feetY: number) {
  for (let iter = 0; iter < 3; iter++) {
    for (const b of COLLIDERS) {
      if (feetY > b.h) continue
      const cx = Math.max(b.x0, Math.min(p.x, b.x1))
      const cz = Math.max(b.z0, Math.min(p.z, b.z1))
      const dx = p.x - cx
      const dz = p.z - cz
      const d2 = dx * dx + dz * dz
      if (d2 >= RADIUS * RADIUS) continue
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2)
        p.x = cx + (dx / d) * RADIUS
        p.z = cz + (dz / d) * RADIUS
      } else {
        const opts = [
          [p.x - b.x0 + RADIUS, -1, 0],
          [b.x1 - p.x + RADIUS, 1, 0],
          [p.z - b.z0 + RADIUS, 0, -1],
          [b.z1 - p.z + RADIUS, 0, 1],
        ].sort((a, c) => a[0] - c[0])[0]
        p.x += opts[1] * opts[0]
        p.z += opts[2] * opts[0]
      }
    }
  }
  p.x = Math.max(-60, Math.min(60, p.x))
  p.z = Math.max(-60, Math.min(60, p.z))
}

export function isBlocked(x: number, z: number) {
  return COLLIDERS.some((b) => b.h > 1 && x > b.x0 - RADIUS && x < b.x1 + RADIUS && z > b.z0 - RADIUS && z < b.z1 + RADIUS)
}

function useKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTyping(e)) return
      keys.add(e.code)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault()
      const s = useStore.getState()
      if (e.repeat) return
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) s.goWaypoint(Number(e.code.slice(5)))
      if (e.code === 'KeyB') s.set({ bim: !s.bim })
      if (e.code === 'KeyO') s.goMode(s.mode === 'orbit' ? 'walk' : 'orbit')
      if (e.code === 'KeyH') s.toggleHud()
      if (e.code === 'KeyR') s.set({ cutRoof: !s.cutRoof })
    }
    const up = (e: KeyboardEvent) => keys.delete(e.code)
    const blur = () => keys.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])
}

function WalkControls() {
  const { camera, gl, scene, raycaster } = useThree()
  const setEvents = useThree((s) => s.setEvents)
  const active = useStore((s) => s.mode === 'walk' && !s.flight && !s.inXR)
  const vel = useRef(new THREE.Vector3())
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), [])
  const bob = useRef(0)
  const plc = useMemo(() => new PointerLockControls(camera, gl.domElement), [camera, gl])
  const aimT = useRef(0)

  useEffect(() => {
    const onLock = () => useStore.getState().set({ locked: true })
    const onUnlock = () => useStore.getState().set({ locked: false, aimHotspot: null })
    plc.addEventListener('lock', onLock)
    plc.addEventListener('unlock', onUnlock)
    const btn = () => plc.lock()
    const handler = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.('[data-lock]')) btn()
    }
    document.addEventListener('click', handler)
    return () => {
      plc.removeEventListener('lock', onLock)
      plc.removeEventListener('unlock', onUnlock)
      document.removeEventListener('click', handler)
      plc.disconnect()
    }
  }, [plc])

  useEffect(() => {
    plc.enabled = active
    if (!active && plc.isLocked) plc.unlock()
  }, [active, plc])

  useEffect(() => {
    setEvents({
      compute(event, state) {
        if (document.pointerLockElement) state.pointer.set(0, 0)
        else state.pointer.set((event.offsetX / state.size.width) * 2 - 1, -(event.offsetY / state.size.height) * 2 + 1)
        state.raycaster.setFromCamera(state.pointer, state.camera)
      },
    })
  }, [setEvents])

  useEffect(() => {
    if (!active) return
    const el = gl.domElement
    let id: number | null = null
    let lx = 0
    let ly = 0
    const down = (e: PointerEvent) => {
      if (document.pointerLockElement || id !== null) return
      id = e.pointerId
      lx = e.clientX
      ly = e.clientY
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      const k = e.pointerType === 'touch' ? 0.005 : 0.0032
      euler.setFromQuaternion(camera.quaternion)
      euler.y -= (e.clientX - lx) * k
      euler.x -= (e.clientY - ly) * k
      euler.x = Math.max(-1.45, Math.min(1.45, euler.x))
      euler.z = 0
      camera.quaternion.setFromEuler(euler)
      lx = e.clientX
      ly = e.clientY
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId === id) id = null
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [active, camera, gl, euler])

  const hotspotMeshes = useRef<THREE.Object3D[]>([])
  useFrame((_, rawDt) => {
    if (!active) return
    const dt = Math.min(rawDt, 0.05)
    const s = useStore.getState()
    const fwd = new THREE.Vector3()
    camera.getWorldDirection(fwd)
    fwd.y = 0
    fwd.normalize()
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x)
    let mx = s.touch.x
    let mz = s.touch.z
    let my = s.touch.y
    if (keys.has('KeyW') || keys.has('ArrowUp')) mz += 1
    if (keys.has('KeyS') || keys.has('ArrowDown')) mz -= 1
    if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1
    if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1
    if (keys.has('KeyE') || keys.has('PageUp')) my += 1
    if (keys.has('KeyQ') || keys.has('PageDown')) my -= 1
    const sprint = keys.has('ShiftLeft') || keys.has('ShiftRight')
    const speed = sprint ? 6.5 : 3.2
    const wish = fwd.multiplyScalar(mz).add(right.multiplyScalar(mx))
    if (wish.lengthSq() > 1) wish.normalize()
    wish.multiplyScalar(speed)
    vel.current.lerp(wish, 1 - Math.exp(-dt * 9))
    const p = camera.position
    const next = new THREE.Vector3(p.x + vel.current.x * dt, 0, p.z + vel.current.z * dt)
    let eye = s.eye
    if (my !== 0) {
      eye = Math.max(EYE_MIN, Math.min(EYE_MAX, eye + my * dt * 1.8))
      useStore.setState({ eye })
    }
    resolveCollisions(next, eye - EYE + 0.05)
    const moving = vel.current.length()
    bob.current += dt * moving * 2.2
    const bobY = eye <= EYE + 0.01 ? Math.sin(bob.current) * 0.025 * Math.min(1, moving / 3) : 0
    p.x = next.x
    p.z = next.z
    p.y = THREE.MathUtils.damp(p.y, eye + bobY, 10, dt)

    aimT.current += dt
    if (s.locked && aimT.current > 0.12) {
      aimT.current = 0
      if (hotspotMeshes.current.length === 0) scene.traverse((o) => o.userData.hotspot && hotspotMeshes.current.push(o))
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
      const hit = raycaster.intersectObjects(hotspotMeshes.current, false)[0]
      const id = hit && hit.distance < 25 ? (hit.object.userData.hotspot as string) : null
      if (id !== s.aimHotspot) useStore.setState({ aimHotspot: id })
    }
  })
  return null
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function CameraRig() {
  const { camera } = useThree()
  const st = useRef<{ id: number; from: THREE.Vector3; to: THREE.Vector3; qa: THREE.Quaternion; qb: THREE.Quaternion; t: number; dur: number; arc: number } | null>(null)
  useFrame((_, dt) => {
    const f = useStore.getState().flight
    if (!f) {
      st.current = null
      return
    }
    if (!st.current || st.current.id !== f.id) {
      const from = camera.position.clone()
      const to = new THREE.Vector3(...f.pos)
      const m = new THREE.Matrix4().lookAt(to, new THREE.Vector3(...f.look), new THREE.Vector3(0, 1, 0))
      const dist = from.distanceTo(to)
      const inside = Math.abs(from.x) < 15 && Math.abs(from.z) < 10 && Math.abs(to.x) < 15 && Math.abs(to.z) < 10
      st.current = {
        id: f.id,
        from,
        to,
        qa: camera.quaternion.clone(),
        qb: new THREE.Quaternion().setFromRotationMatrix(m),
        t: 0,
        dur: THREE.MathUtils.clamp(dist / 9, 1.3, 2.8),
        arc: inside ? Math.min(1.2, dist * 0.06) : Math.min(6, dist * 0.18),
      }
    }
    const r = st.current
    r.t = Math.min(1, r.t + Math.min(dt, 0.12) / r.dur)
    const e = ease(r.t)
    camera.position.lerpVectors(r.from, r.to, e)
    camera.position.y += Math.sin(Math.PI * e) * r.arc
    camera.quaternion.slerpQuaternions(r.qa, r.qb, e)
    if (r.t >= 1) {
      useStore.setState({ flight: null, mode: f.toMode, eye: f.toMode === 'walk' ? f.eye : useStore.getState().eye })
    }
  })
  return null
}

function Orbit() {
  const active = useStore((s) => s.mode === 'orbit' && !s.flight && !s.inXR)
  if (!active) return null
  return (
    <OrbitControls
      makeDefault
      target={ORBIT_VIEW.target}
      enableDamping
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={220}
      maxPolarAngle={Math.PI / 2 - 0.04}
    />
  )
}

function XRRig() {
  const origin = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const start = useMemo(() => {
    const p = useStore.getState().player
    const yaw = Math.atan2(-p.dx, -p.dz)
    const inside = Math.abs(p.x) < 30 && Math.abs(p.z) < 30
    return { pos: (inside ? [p.x, 0, p.z] : [0, 0, WAYPOINTS[1].pos[2]]) as [number, number, number], yaw: inside ? yaw : 0 }
  }, [])
  useXRControllerLocomotion(origin, { speed: 2.2 }, { type: 'snap', degrees: 45 })
  useEffect(() => {
    camera.near = 0.05
  }, [camera])
  return <XROrigin ref={origin} position={start.pos} rotation-y={start.yaw} />
}

function XRStateSync() {
  const session = useXR((s) => s.session)
  useEffect(() => {
    useStore.getState().set({ inXR: !!session })
  }, [session])
  return session ? <XRRig /> : null
}

function PerfTracker() {
  const { gl, camera } = useThree()
  const acc = useRef({ frames: 0, t: 0, pt: 0, tris: 0, calls: 0 })
  useEffect(() => {
    gl.info.autoReset = false
  }, [gl])
  useFrame((_, dt) => {
    const a = acc.current
    a.frames++
    a.t += dt
    a.pt += dt
    a.tris = gl.info.render.triangles
    a.calls = gl.info.render.calls
    gl.info.reset()
    if (a.pt > 0.1) {
      a.pt = 0
      const d = new THREE.Vector3()
      camera.getWorldDirection(d)
      useStore.setState({ player: { x: camera.position.x, y: camera.position.y, z: camera.position.z, dx: d.x, dz: d.z } })
    }
    if (a.t > 0.5) {
      useStore.setState({
        stats: { fps: Math.round(a.frames / a.t), tris: a.tris, calls: a.calls, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures },
      })
      a.frames = 0
      a.t = 0
    }
  })
  return null
}

export function Navigation() {
  useKeyboard()
  return (
    <>
      <WalkControls />
      <CameraRig />
      <Orbit />
      <XRStateSync />
      <PerfTracker />
    </>
  )
}

export const INITIAL_CAMERA = { pos: [0, EYE, 30] as [number, number, number], look: WAYPOINTS[0].look }
