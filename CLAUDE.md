# CLAUDE.md

## Qué es este proyecto

**Veti Suite**: SPA demo (MVP) de gestión para clínicas veterinarias — dashboard, clientes/pacientes, citas, peluquería, clínica/laboratorio, inventario y facturación. UI en español. **Sin backend ni persistencia**: todo el estado vive en memoria en un store zustand con datos semilla; `src/lib/api.ts` simula la latencia y los contratos de una API real. Recargar la página reinicia los datos.

Stack: React 19 · Vite 8 · TypeScript strict · zustand 5 · react-router-dom 7 · Tailwind CSS 4 · lucide-react · bun.

## Comandos

```sh
bun install        # dependencias
bun run dev        # dev server con HMR
bun run build      # puerta de calidad: tsc -b + vite build
bun run lint       # eslint (reglas react-hooks v7)
bun run preview    # sirve el build de producción
```

No hay tests: la puerta de calidad es `build` + `lint` limpios + verificación manual en navegador (checklist en `AGENTS.md` §4).

## Arquitectura

```
src/
  App.tsx                  → layout + rutas anidadas
  states/app.state.tsx     → único store zustand (useVetStore, tipado con VetState)
  lib/                     → constants.ts (tokens T/F, catálogos), types.ts, api.ts (API simulada)
  components/              → compartidos: ui.tsx (Btn, Badge, Card, Modal, Field…),
                             page-header, resource-list-item, info-grid, resource-not-found,
                             client-search, patient-picker, layout, toasts
  modules/[module]/        → page.tsx (índice) + new-page / show-page / edit-page + components/
```

Rutas por acción: `/[module]`, `/[module]/new`, `/[module]/show/:id`, `/[module]/edit/:id`. Excepciones: **clinic** no tiene edit (historial inmutable) y usa acciones propias (`/clinic/consultation/:patientId`, `apply-product`, `lab-order`, `prescription`); **grooming** y **billing** no tienen edit. Ids con `useParams`, presets con `useSearchParams`. Toda pantalla con `:id` renderiza `ResourceNotFound` si el recurso no existe.

## Convenciones críticas

- **Código en inglés, UI en español**: identificadores/archivos/rutas en inglés (kebab-case); solo el texto visible al usuario va en español. Los valores de estado (`"pendiente"`, `"confirmada"`…) están en español a propósito: se renderizan tal cual.
- **Reusar los componentes compartidos** — nunca crear botones/badges/cards/headers ad-hoc.
- **Estilos**: clases utilitarias de Tailwind + estilos inline con los tokens `T`/`F` de `src/lib/constants.ts`. Prohibido escribir hex fuera de `T`. Detalle completo en `DESIGN.md`.
- **Effects**: prohibido `setState` síncrono en effects (lint lo bloquea) — usar estado derivado, resets en handlers o URL como fuente de verdad (patrones en `AGENTS.md` §3).
- Acciones del store notifican con `notify()`; las que validan devuelven `boolean`.

## Referencias

- Manual completo (estilo, testing, deploy): **`AGENTS.md`**
- Sistema de diseño (tokens, componentes, patrones): **`DESIGN.md`**
