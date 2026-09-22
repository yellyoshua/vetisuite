# AGENTS.md — `client/`

Reglas de la SPA de los paneles (`client/`). Complementa `/AGENTS.md`, que tiene las reglas de todo
el monorepo: leé ambos.

## Nombres

### Archivos

| Tipo | Patrón |
|---|---|
| Componente React | PascalCase `.tsx`, igual al componente exportado |
| Pantalla de `client/` | `page.tsx` + `resolvers.ts` dentro de su módulo |
| Hook | `use-<nombre>.ts` |

### Código

> Ver `server/AGENTS.md` § Nombres > Código.

## Wrappers

Ninguna operación se saltea su wrapper:

- **`client/src/core/service.ts`** — factory de servicios REST de la SPA. `findOne(params)` es
  `find(params)[0]`: el id es un filtro más, no hay rutas `/<recurso>/:id`.

## OAuth2

> Ver `server/AGENTS.md` § OAuth2.

## Ciclo de una request

1. `Authorization.jsx` lee el perfil del store y monta el árbol de rutas de ese rol. Sin sesión solo
   existen las rutas públicas; un 401 vacía el store y manda al login.
2. La pantalla lee por `useResolver` contra su `*.service.ts`. Ninguna lectura de la SPA toca la base.
3. Las mutaciones van por `useForm` / `useMutation`, siempre contra un `*.service.ts`.
4. El browser adjunta la cookie solo; el store guarda **el perfil, nunca la credencial**. CORS
   permite app y landing, pero `credentials` solo para el dominio de la app.

> Ver `server/AGENTS.md` § Ciclo de una request, paso 5.

## Subida de archivos

> Ver `server/AGENTS.md` § Subida de archivos.

## App Frontend (`client/`)

SPA de los paneles. React puro sobre HTTP: sin Server Actions, `action()`, `useActionState` ni
`startTransition`.

### Pantalla

- Cada pantalla es una carpeta `modules/<rol>/<módulo>/<módulo>-<list|create|edit>/` con `page.tsx` +
  `resolvers.ts`. El `<módulo>.schema.ts` y el `<módulo>.service.ts` van en la raíz del módulo. Se
  registra con su path completo en `routes/<rol>.routes.tsx`.
- Componentes de una pantalla en su `components/`; de varias pantallas del módulo, en el
  `components/` del módulo; en `src/components/` solo con 3+ pantallas.
- Separado por rol aunque apunte al mismo endpoint. **No se abstrae entre perfiles**; solo los campos
  de formulario se comparten.

### Módulos

El frontend vive en `client/` y es TypeScript: donde esta sección dice `app/` y `.js/.jsx`, aplica a
`client/` con `.ts/.tsx`.

```
client/src/modules/<rol>/<módulo>/   pantallas + schema + service del módulo
server/modules/<feature>/            repository (lecturas) · schema (Zod) · service (escrituras)
```

Las tres capas del server: la ruta valida y autoriza, el service escribe y aplica reglas, el
repository lee. Ninguna ruta abre la base por su cuenta.

**`.repository.js` solo existe en `server/`**: en `client/` todo acceso al backend es un `.service.ts`,
porque la abstracción es REST genérica, no una consulta. Los servicios de `client/` siguen separados
por rol aunque apunten al mismo path: el API resuelve la forma según la sesión.

#### Estructura de `client/src/`

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

#### Reglas

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

#### Rutas

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

#### `use-modal-query`

`useModalQuery(modalName, paramKeys)` → `{ isOpen, params, openModal(params), closeModal() }`, con
`params: Record<clave, string | null>`. Nombre y claves en `constants/modals.ts`.

- `openModal` escribe `?modal=<nombre>&<clave>=<valor>` con push: el botón atrás cierra el modal.
- `closeModal` borra `modal` y sus claves con `replace`. Recargar reabre, porque la URL es el estado.
- El modal (`modals/<ModalName>/<modal-name>.tsx`) carga sus datos con `useResolver` a partir de
  `params`, abre y cierra el `<dialog>` nativo con `showModal()`/`close()` según `isOpen` y llama a
  `closeModal` en `onCancel`. Solo importa de `components/`, `hooks/`, `lib/`, `constants/` y `core/`.
  Referencia: `modals/ConfirmDialog/`.

#### `DataTable`

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

### Datos y Servicios

- Toda llamada al API sale de un `*.service.ts` construido con `service()`. Ninguna pantalla hace
  `fetch` propio.
- Leer al montar → `useResolver`. Formulario → `useForm`. Botón o item → `useMutation`.
- Nada de `useState` para campos de formulario; nada de `useEffect` que reaccione al resultado de
  una mutación.
- `onSuccess` presente se queda con el control: el hook no navega ni resetea detrás de él.
- Salir del documento (pasarela de pago, 302 de OAuth) va en `onSuccess` con `window.location`;
  `redirectTo` es solo ruta de react-router.
- Los hooks de mutación no comparten helper entre ellos: si algo se repite, se repite.

### Hooks de `client/`

React puro: no hay `action()`, `useActionState`, `startTransition` ni Server Actions.

| Hook | Para qué | Devuelve |
|---|---|---|
| `use-resolver` | leer al montar | `{data, error, isLoading, refetch}` |
| `use-form` | formulario | control de React Hook Form + estado de envío |
| `use-mutation` | botón / item de lista | `[isLoading, submit, error]` |

Los dos hooks de mutación son `async/await` con try/catch/finally, sin `useEffect` que reaccione al
resultado y **sin helper compartido entre ellos**: si algo se repite, se repite. Un `onSuccess`
presente se queda con el control — el hook no navega ni resetea detrás de él. Salir del documento
(redirección externa, 302 de OAuth) va en `onSuccess`; `redirectTo` es solo una ruta de react-router.

### Estado

- Sesión: única puerta `useSessionStore`. Guarda el perfil, **nunca la credencial**.
- Zustand para estado de app, Jotai para estado atómico local. Derivá con `useMemo` en vez de duplicar estado.

### UI

- Tailwind como única solución de estilos; iconos `lucide-react` con import explícito.
- `<img>` nativo contra `/api/files/…`; no hay optimizador.
- Accesibilidad no es opcional: HTML semántico, `label` en cada input, ARIA donde aplique, foco
  gestionado en modales.
- Cada pantalla contempla sus tres estados: cargando, error y vacío.

## Alias

`@/` apunta a `client/src/` en la SPA (config del runtime + `tsconfig.json` para el editor).
