# Gemelo Digital XR — Distribuidora Orifael (Jujuy)

Spatial Digital Twin & VR Walkthrough del Centro Logístico de Distribuidora Orifael (Gdor. Tello 437, San Salvador de Jujuy).

Desarrollado por **Lic. Sol Salas** — Especialista en IA, Visión por Computadora & XR.

## Funcionalidades

- Galpón procedural de 30 × 20 × 8 m: piso de hormigón pulido reflectante, paredes de chapa, cubierta a dos aguas, 7 cabriadas reticuladas y tragaluces con haces de luz volumétrica.
- 3 pasillos con racks selectivos de 3 niveles, pallets y cajas etiquetadas, recepción con mostrador, zona de despacho con 3 muelles y camión.
- Navegación: recorrido peatonal en primera persona (WASD / flechas + PointerLock, controles táctiles), vista orbital tipo maqueta y 4 waypoints con transición suave.
- **Enter VR / WebXR** (`@react-three/xr`) compatible con Meta Quest: locomoción con joystick y giro por pasos.
- Vista Estructural / Rayos X (BIM Wireframe): paredes, columnas y cabriadas en cian semitransparente, con cotas.
- 4 hotspots técnicos (cubierta, pasillo 1, losa, acceso), minimapa en planta, métricas espaciales y medidor FPS / polígonos / draw calls.

## Atajos

| Tecla | Acción |
| --- | --- |
| W A S D / Flechas | Caminar |
| Shift | Correr |
| E / Q | Subir / bajar plataforma |
| 1 – 4 | Waypoints |
| O | Vista orbital / recorrido |
| B | Vista BIM |
| R | Corte de cubierta |
| H | Mostrar / ocultar panel |

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # build de producción en dist/
```

Stack: Vite + React + TypeScript, Three.js, @react-three/fiber, @react-three/drei, @react-three/xr, Tailwind CSS v4, Zustand. Todo el modelo y las texturas se generan proceduralmente (sin assets externos).

El deploy a GitHub Pages se hace automáticamente en cada push a `main` (`.github/workflows/deploy.yml`).
