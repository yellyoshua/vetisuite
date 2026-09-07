# AGENTS.md — Manual del proyecto para agentes de IA

Manual centralizado de Veti Suite. Complementos: `../CLAUDE.md` (raíz del monorepo — contexto de sesión) y `DESIGN.md` (sistema de diseño — leer antes de tocar UI).

## 1. Project overview

**Veti Suite** es una SPA demo (MVP) de gestión integral para clínicas veterinarias. UI en español (Ecuador, `es-EC`, moneda $).

| Módulo | Ruta base | Qué hace |
|---|---|---|
| Dashboard | `/` | KPIs del día, agenda y alertas operativas (stock bajo, caducidad, deudas) |
| Clientes y Pacientes | `/clients` | CRUD de dueños; mascotas como sub-recurso (modal) |
| Citas | `/appointments` | Matriz médico × hora: un médico no puede tener dos citas en el mismo horario; confirmar/cancelar como estado |
| Disponibilidad de la clínica | `/appointments-clinics` | Horario semanal, duración y márgenes, zona horaria, reglas de reserva y excepciones por fecha. **Módulo con ruta base propia; sin fila en el sidebar** (es configuración, no área de trabajo) |
| Visitas | `/visits` | Contenedor de la atención: agrupa los servicios de un cliente hasta que se factura |
| Peluquería y Estética | `/grooming` | Kanban check-in → proceso → terminado → entregado, con cronómetro y cargo automático |
| Clínica y Laboratorio | `/clinic` | Expediente médico inmutable; consultas, insumos, órdenes de laboratorio, recetas |
| Inventario | `/inventory` | CRUD de productos, stock mínimo, caducidad, ingreso de lotes |
| Facturación | `/billing` | Cuentas abiertas por cliente (consolidan cargos de todos los módulos) y facturas emitidas |
| Finanzas | `/finance` | Solo lectura: ingresos por área y por método, utilidad, IVA y por cobrar |
| Portales | `/portals` | Administración local de páginas de la clínica. La dirección queda **reservada**: nada se publica todavía |

**Stack**: React 19 · Vite 8 (con react-compiler vía babel) · TypeScript strict · zustand 5 · react-router-dom 7 · Tailwind CSS 4 (`@tailwindcss/vite`) · lucide-react · **bun** como package manager.

**Limitación clave**: no hay backend ni persistencia. Todo el estado vive en memoria en un único store zustand con datos semilla (`src/states/app.state.tsx`); recargar la página lo reinicia. `src/lib/api.ts` simula latencia de red y contratos `{ results/rows, total }` para búsqueda y paginación de clientes.

## 2. Comandos

| Comando | Qué hace |
|---|---|
| `bun install` | Instala dependencias |
| `bun run dev` | Dev server con HMR (Vite, puerto 5173+). Desde la raíz: `bun run --filter client dev` |
| `bun run build` | **Puerta de calidad**: `tsc -b` (typecheck) + `vite build` → `dist/` |
| `bun run lint` | ESLint — se corre en la **raíz del monorepo** (config compartida) |
| `bun run preview` | Sirve el build de producción localmente |

No hay suite de tests (ver §4).

## 3. Code style guidelines

### Idiomas y nombres
- **Código en inglés**: identificadores, funciones, tipos, acciones del store, nombres de módulos y rutas.
- **Español solo en texto visible al usuario**: labels, placeholders, toasts, títulos. Los valores de estado (`"pendiente"`, `"confirmada"`, `"solicitado"`…) están en español **a propósito**: se renderizan tal cual en badges.
- Archivos y carpetas en **kebab-case** (`new-client-modal.tsx`, `apply-product-page.tsx`).

### Estructura de módulo y rutas
```
src/modules/[module]/
  page.tsx         → índice (listado / tabla / kanban / matriz)
  new-page.tsx     → creación
  show-page.tsx    → detalle por id
  edit-page.tsx    → edición por id
  components/      → piezas propias del módulo
```
Convención de rutas (registradas anidadas en `src/App.tsx`): `/[module]`, `/[module]/new`, `/[module]/show/:id`, `/[module]/edit/:id`. Los ids se leen con `useParams`; los presets con `useSearchParams` (ej. `/appointments/new?vetId=v1&time=09:00&patientId=p1`). Excepciones deliberadas:
- **clinic**: sin `new`/`edit` genéricos (historial inmutable). Acciones propias: `/clinic/consultation/:patientId`, `/clinic/apply-product/:patientId`, `/clinic/lab-order/:patientId`, `/clinic/prescription/:patientId`.
- **grooming** y **billing**: sin `edit` (job transicional / facturas inmutables).
- Ruta desconocida → `<Navigate to="/" replace />`.
- Toda pantalla con `:id` maneja el caso inexistente con `ResourceNotFound` (`src/components/resource-not-found.tsx`).

### Estado (zustand)
- Un único store: `useVetStore` en `src/states/app.state.tsx`, tipado con la interfaz `VetState`.
- Las acciones mutan con `set()` inmutable (map/filter/spread) y notifican con `get().notify(type, msg)` — tipos de toast: `ok`, `warn`, `error`.
- En componentes: `useVetStore()` (store completo) o selector `useVetStore((s) => s.x)`. Fuera de React (ej. `src/lib/api.ts`): `useVetStore.getState()`.
- Acciones que validan devuelven `boolean` (`createAppointment`, `updateAppointment` — choque de horario).

### Reglas react-hooks v7 (lint las hace obligatorias)
**Prohibido `setState` síncrono dentro de un effect.** Patrones ya usados en el repo — replicarlos:
- **Loading derivado** en fetches: `const loading = res.forKey !== fetchKey` (ver `src/modules/clients/page.tsx`).
- **Resets en handlers**, no en effects: `onChange={(e) => { setQ(e.target.value); setPage(0); }}`.
- **Clamp derivado** en vez de effect corrector: `Math.min(page, pages - 1)` (ver `src/modules/billing/page.tsx`).
- **URL como fuente de verdad** para selección navegable (params de ruta) en vez de sincronizar estado local.

### TypeScript
- Strict activo. `import type` obligatorio para tipos (`verbatimModuleSyntax`).
- Non-null assertion (`!`) permitida solo en lookups garantizados por integridad de los datos (ej. `clients.find((c) => c.id === patient.clientId)!` — toda mascota tiene dueño).
- Tipos de dominio en `src/lib/types.ts` (el historial se llama `MedicalRecord` para no chocar con el utility type `Record`).
- **`@/` → `src/`.** Todo import que suba de carpeta usa el alias (`@/lib/constants`, `@/components/ui`); los hermanos siguen relativos (`./client-form`). El alias está declarado dos veces y las dos tienen que coincidir: `paths` en `tsconfig.app.json` (tsc y editor) y `resolve.alias` en `vite.config.ts` (bundler).

### UI
- Reusar los componentes canónicos (tabla completa en `DESIGN.md` §5). Nunca recrear botones/badges/cards ad-hoc.
- Los hex viven **solo** en el bloque `@theme` de `src/index.css`; de ahí salen las utilidades Tailwind (`bg-green-soft`, `text-sub`) y los tokens `T`/`F`, que ya no contienen hex sino `var(--color-*)`. Color nuevo = primero `@theme`, nunca un hex en `T` ni en un componente (`DESIGN.md` §2).
- Formularios compartidos entre new/edit: `client-form.tsx`, `product-form.tsx` (prop `initial` + `submitLabel` + `onCancel`).

## 4. Testing instructions

No hay framework de tests. Puertas obligatorias antes de dar por terminado cualquier cambio:

1. `bun run build` sin errores (incluye typecheck).
2. `bun run lint` sin errores.
3. **Verificación manual en navegador** (`bun run dev`) de los flujos afectados. Checklist de humo completo:
   - Navegar las 10 entradas del sidebar (estado activo correcto). En `/appointments-clinics` **ningún** ítem queda activo y la barra móvil rotula "Disponibilidad de la clínica".
   - `/appointments/settings` redirige a `/appointments-clinics` con `replace` (el botón "atrás" no rebota).
   - Deep-links: `/clinic/show/p1`, `/clients/show/c1`, `/clients/edit/c2`, `/inventory/edit/i2`, `/visits/show/vis1`, `/portals/show/po1`.
   - Id inexistente (`/clients/show/zzz`) → pantalla `ResourceNotFound`.
   - Crear cliente → aterriza en su show; editar cliente → toast + datos actualizados. "Visita" está deshabilitado para clientes sin mascotas.
   - Agendar/reprogramar cita en horario ocupado → toast de error "Ese médico ya tiene una cita en ese horario" y no guarda. `/appointments/edit/<id cancelado>` no ofrece formulario.
   - Kanban peluquería: 4 columnas; terminar servicio → cargo en Facturación (badge del sidebar sube); "entregado" **no** hace desaparecer la tarjeta. Las alergias se ven en el tablero.
   - Clínica: la consulta se guarda en el expediente (no cobra). Sin consulta abierta hoy, "Aplicar insumo" y "Emitir receta" muestran la precondición, no `ResourceNotFound`. Aplicar insumo → stock baja (+alerta si queda bajo mínimo).
   - Inventario: `i4` figura como **Caducado** con días positivos y no es seleccionable como insumo; no hay campo de stock en editar.
   - Visitas: los medicamentos y las vacunas **no** se agregan desde el borrador (solo desde Clínica) — es la única vía que descuenta stock.
   - Facturación: cobrar cuenta → factura emitida, visita cerrada y consultable en solo lectura; los badges de área no salen grises; no hay envío externo.
   - Teclado: `Tab` deja foco visible en toda pantalla; los modales atrapan el foco, cierran con `Escape` y lo devuelven al disparador.
   - Sin errores en la consola del navegador.

Recordatorio: el estado es en memoria — navegar con recarga completa (barra de URL) reinicia los datos; los flujos multi-paso deben probarse dentro de la misma sesión SPA.

## 5. Deployment steps

No hay hosting ni CI configurados. El deploy es un build estático:

1. `bun run build` → genera `dist/` (HTML/CSS/JS estáticos).
2. Validar localmente con `bun run preview`.
3. Servir `dist/` desde cualquier hosting estático. **Requisito SPA**: el servidor debe reescribir toda ruta desconocida a `index.html` (fallback 404 → `index.html`), porque react-router maneja rutas como `/clients/show/c1` en el cliente.

Si en el futuro se configura hosting/CI, documentarlo aquí.
