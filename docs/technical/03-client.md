# 03 · App SPA (`client/`)

La SPA (React 19 + Vite + react-router) vive en `client/`. Se sirve en
`app.vetisuite.com/*`. Aquí: config Vercel para SPA y la conexión al backend.

## 1. Fallback SPA (crítico)

react-router usa rutas cliente (`/clients/show/:id`, etc.). Al recargar una URL
profunda, Vercel debe devolver `index.html` en vez de 404. Se configura con un
rewrite catch-all.

### `client/vercel.json`

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Regla: **cualquier** ruta que no sea un asset devuelve `index.html`; react-router
resuelve el resto en cliente. Vercel sirve los archivos estáticos reales (JS/CSS
en `/assets/*`) antes de aplicar el rewrite, así que los assets no se rompen.

## 2. URL del backend por variable de entorno

La app hace `fetch` a `https://api.vetisuite.com`. Esa URL no se hardcodea:
va en una env var de Vite (`VITE_` se inyecta en build).

### `client/.env.production`

```
VITE_API_URL=https://api.vetisuite.com
```

### `client/.env.development`

```
VITE_API_URL=http://localhost:3000
```

### Uso en código

Hoy el estado vive en memoria (`src/lib/api.ts` simula latencia). Cuando se
conecte el backend real, centraliza la base URL:

```ts
// src/lib/api.ts
const BASE = import.meta.env.VITE_API_URL

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}
```

Ponytail: mientras siga siendo demo en memoria, **no toques nada**. Esta env var
solo importa el día que exista backend real. Déjala documentada y sigue.

> Nota: en Vercel, las `VITE_*` deben existir también como env vars del proyecto
> (Production) para que el build en CI las tenga. Ver `05-vercel-projects-domains.md`.

## 3. Verificación local

```sh
cd client
bun run build       # tsc -b + vite build → dist/
bun run preview     # sirve dist/, prueba recargar /clients/show/1
```

Recargar una ruta profunda en el preview debe cargar la app (no 404). Si da 404
en `preview`, añade a `vite.config.ts` nada — `vite preview` ya hace fallback SPA;
el `vercel.json` cubre producción.

## Estructura de carpetas

TypeScript (`.ts/.tsx`) bajo `client/src/`. El mismo contenido está en `AGENTS.md` (App Frontend → Módulos): si cambia, se actualizan los dos.

```text
client/src/
├── components/                      # compartido: UI reutilizable (3+ pantallas)
│   ├── ui/                          # primitivos del DS (Button, Badge, Card, Field, Input, Select, Pager, Tooltip…)
│   └── [Component-Group]/           # p. ej. DataTable/, layouts/
├── constants/[resource].ts          # catálogos de dominio (no mocks)
├── core/                            # service.ts, upload.ts
├── hooks/use-[name].ts              # use-resolver, use-list-query, use-mutation, use-modal-query
├── lib/[utility].ts
├── modals/[ModalName]/              # un modal por query
│   ├── [modal-name].tsx
│   └── resolvers.ts                 # resolver propio con su mock
├── routes/[role].routes.tsx         # rutas planas con el path completo
├── routes/[role].pages.ts           # páginas del rol cargadas con React.lazy (un chunk por pantalla)
├── stores/[name].store.ts
└── modules/[role]/[module]/         # módulo principal, p. ej. employee/clients
    ├── [module].schema.ts           # zod + tipos del módulo (y de sus submódulos)
    ├── [module].service.ts          # llamadas al API (stubs hasta conectar)
    ├── components/                  # usados por varias pantallas del módulo
    ├── [module]-list/{page.tsx, resolvers.ts, components/?}
    ├── [module]-create/{page.tsx, resolvers.ts}
    ├── [module]-edit/{page.tsx, resolvers.ts}
    └── [submodule]/                 # p. ej. patients
        ├── [submodule].schema.ts    # solo si tiene contrato propio
        ├── [submodule].service.ts
        └── [submodule]-list|create|edit/{page.tsx, resolvers.ts}
```

Ejemplo real:

```text
modules/employee/clients/
├── clients.schema.ts
├── clients.service.ts
├── components/ClientForm.tsx
├── clients-list/{page.tsx, resolvers.ts}
├── clients-create/{page.tsx, resolvers.ts}
├── clients-edit/{page.tsx, resolvers.ts}
└── patients/
    ├── patients.schema.ts
    ├── patients.service.ts
    ├── components/PatientForm.tsx
    ├── patients-list/{page.tsx, resolvers.ts}
    ├── patients-create/{page.tsx, resolvers.ts}
    └── patients-edit/{page.tsx, resolvers.ts}
```

Solo hay pantallas **list, create y edit**: sin `show` (el detalle va en `edit` o en un modal por
query), borrar es un modal de confirmación y no hay carpetas vacías "para después". Excepciones
vigentes: los resúmenes de cada workspace viven en `dashboard/<workspace>-summary/` y las pantallas de
configuración sin id (`appointments-clinics-edit`, `settings-edit`) se sirven en su path base
(`/appointments-clinics`, `/settings`), sin sufijo `/edit`.

### Reglas

- **Mocks en la frontera**: todo mock vive en un `resolvers.ts` que devuelve `Promise<T>` tipada con el
  `*.schema.ts`; la pantalla lee solo con `useResolver` y conectar el API es cambiar el cuerpo del
  resolver por la llamada al `*.service.ts`.
- **Modales por query**: `hooks/use-modal-query.ts` es el único mecanismo de apertura (nada de
  `useState(isOpen)`); cada modal se monta una sola vez en el layout (`StaffLayout`).
- **Tooltips**: siempre con `components/ui/Tooltip.tsx` (o `IconButton`, que lo incluye).
- **Tablas**: todo listado en tabla usa `components/DataTable/`, agnóstica del dominio, con la
  primera columna fija, scroll horizontal interno y paginación en la URL.
- **Compartir**: un componente sube a `components/` solo si lo usan 3+ pantallas y extraerlo
  simplifica.
- **Rutas**: planas, un objeto por pantalla con el path completo; `create`/`edit` son el sufijo final
  y la única anidación es el layout (padre sin path con `<Outlet />`).
- **Independencia**: un módulo no importa nada de otro módulo principal (un submódulo sí de su
  padre); lo común sale de `components/`, `constants/`, `core/`, `hooks/`, `lib/`, `modals/` y
  `stores/`, y entre módulos solo hay navegación con `<Link>`.

### Rutas

| Pantalla | Path |
|---|---|
| Listado de clientes | `/clients` |
| Crear cliente | `/clients/create` |
| Editar cliente | `/clients/:clientId/edit` |
| Listado de pacientes de un cliente | `/clients/:clientId/patients` |
| Crear paciente | `/clients/:clientId/patients/create` |
| Editar paciente | `/clients/:clientId/patients/:patientId/edit` |

Solo un submódulo cuelga del path de su módulo. No hay rutas `new` ni `show`. Un `:id` inexistente
hace que el resolver lance `NotFoundError` y `ErrorState` muestra "No encontrado".

### `use-modal-query`

`useModalQuery(modalName, paramKeys)` → `{ isOpen, params, openModal(params), closeModal() }`, con
`params: Record<clave, string | null>`. Nombre y claves en `constants/modals.ts`.

- `openModal` escribe `?modal=<nombre>&<clave>=<valor>` con push: el botón atrás cierra el modal.
- `closeModal` borra `modal` y sus claves con `replace`. Recargar reabre, porque la URL es el estado.
- El modal (`modals/<ModalName>/<modal-name>.tsx`) carga sus datos con `useResolver` a partir de
  `params`, abre y cierra el `<dialog>` nativo con `showModal()`/`close()` según `isOpen` y llama a
  `closeModal` en `onCancel`. Solo importa de `components/`, `hooks/`, `lib/`, `constants/` y `core/`.
  Referencia: `modals/ConfirmDialog/`.

### `DataTable`

`DataTable<TRow>` recibe `{ label, columns, data: ListPage<TRow> | null, error, isLoading, pageSize,
minWidth, rowKey, onPageChange, emptyTitle?, emptyHint? }`; cada columna es `{ key, header, align?,
isHeaderHidden?, render(row) }`. La primera columna es `<th scope="row">` fija (`sticky left-0`); la
tabla mide `minWidth` y se desplaza dentro de su contenedor `overflow-x-auto`. Pinta cargando, error,
vacío y el `Pager`; no filtra ni pagina.

```tsx
const { query, setPage } = useListQuery(FILTER_KEYS)             // page, pageSize, search y filtros en la URL
const { data, error, isLoading } = useResolver(resolveClientsList, query)
// resolver: return Promise.resolve().then(() => paginateRows(filterClients(query), query))  → { rows, total, page }
<DataTable label="Clientes" columns={COLUMNS} data={data} error={error} isLoading={isLoading}
  pageSize={query.pageSize} minWidth={TABLE_MIN_WIDTH} rowKey={(client) => client.id} onPageChange={setPage} />
```

Piezas de apoyo en la misma carpeta: `DataTableToolbar` (búsqueda y selects), `FilterPresets`
(chips), `IdentityCell` (avatar y título de la primera columna) y `RowActions` (Ver/Editar).
