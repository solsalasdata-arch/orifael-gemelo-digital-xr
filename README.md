# Gemelo Digital XR — Distribuidora Orifael (Jujuy)

**Spatial Digital Twin & VR Walkthrough** de Distribuidora Orifael, Gdor. Tello 437, San Salvador de Jujuy.

Autora: **Lic. Sol Brenda Salas** — Especialista en IA, Visión por Computadora & XR.

## Qué muestra

- **Edificio real** relevado con fotos, videos y Street View: nave de 13,0 × 30,0 m con losa plana de H°A° a 4,60 m, alero y 6 grupos de hierros en espera para planta alta.
- **Fachada:** puerta peatonal con ventiluz y medidores, portón enrollable principal de 4,20 × 4,00 m, columna central y segundo portón de 3,80 m con reja superior y puerta de escape. Adelante, playón de 5 m y linderos reales.
- **Planta:**
  - Salón comercial con mostrador de madera, mamparas, balanza, heladeras, góndolas y cartelería real.
  - Box de oficina separado del acceso.
  - Pasillo central con apilador WIEBEL, estanterías y racks a la izquierda, pallets Quilmes y Coca-Cola a la derecha.
  - Módulos de cocina y baño.
  - Patio trasero no techado.
- **Navegación:** primera persona (WASD + PointerLock o controles táctiles), vista orbital tipo maqueta, 4 waypoints y **Enter VR / WebXR** para Meta Quest.
- **Inspección:**
  - BIM / Rayos X y Clay Render.
  - Corte de cubierta y portones abiertos o cerrados.
  - Etiquetas CAD, que se pueden ocultar.
  - 4 hotspots técnicos, minimapa, métricas espaciales, FPS y polígonos.
- **Visor de Relevamiento Real 1:1:** fotos y video del pasillo operativo a tamaño real o lado a lado con el modelo 3D. Rostros y patentes difuminados.
- **Render:** PBR con HDRI diurno, niebla a 80 m, N8AO, ACES Filmic, sombras de contacto y piso reflectante.

## Stack

Vite · React · TypeScript · Three.js · @react-three/fiber · drei · @react-three/xr · @react-three/postprocessing · Tailwind CSS · Zustand.

## Uso

```bash
npm install
npm run dev      # desarrollo
npm run build    # genera dist/ (base relativa './', apto GitHub Pages)
npm run preview
```

## Atajos

| Tecla | Acción |
| --- | --- |
| W A S D / Flechas | Caminar (Shift corre) |
| E / Q | Subir / bajar la vista |
| 1 – 4 | Waypoints |
| O | Vista orbital |
| B · R · H | BIM · Corte de cubierta · Panel |
| L · G | Etiquetas CAD · Portones |

## Estructura

- `src/data.ts`: dimensiones, fachada, planta, waypoints, hotspots, colisiones y fotos.
- `src/scene/Shell.tsx`: losa, muros, estructura, fachada, portones, playón y linderos.
- `src/scene/RealSite.tsx`: interior (salón, oficina, cocina, baño, estanterías, pallets, WIEBEL, patio).
- `src/ui/`: HUD, minimapa y visor 1:1.

© Lic. Sol Brenda Salas. Fotos y videos: relevamiento propio de Distribuidora Orifael.
