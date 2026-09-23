# 01 · Arquitectura

## Propósito

Describe la forma completa del cliente antes de entrar en archivos: qué stack usa, cómo arranca, por
dónde viajan los datos, dónde vive cada tipo de estado, qué contrato espera del API y qué abstracción
resuelve cada problema. Se lee completo, junto con
[02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#vocabulario), antes de tocar código. Es la
referencia de la **Fase 0** (inventario del destino contra el plan) y el mapa al que vuelve el ejecutor
en cualquier fase cuando duda dónde va una pieza.

## Stack

| Pieza | Paquete | Qué resuelve |
|---|---|---|
| Runtime y gestor de paquetes | Bun (workspaces) | Instala, corre los scripts y construye en local y en Amplify. |
| Bundler y servidor de desarrollo | `vite` + `@vitejs/plugin-react` | SPA estática: `vite build` produce `app/dist`, sin render de servidor. |
| UI | `react`, `react-dom` | React puro sobre HTTP. No hay Server Actions, `useActionState` ni `startTransition`. |
| Ruteo | `react-router` | `BrowserRouter` + `useRoutes`; el árbol lo elige el rol de la sesión. |
| Estilos | `tailwindcss` + `@tailwindcss/vite` + `tw-animate-css` | Tailwind 4 por plugin de Vite, sin PostCSS. Única solución de estilos. |
| Componentes base | primitivas `@radix-ui/*` + `class-variance-authority` + `clsx` + `tailwind-merge` | Componentes de shadcn copiados a mano en `components/ui/`. |
| Formularios | `react-hook-form` + `@hookform/resolvers` + `zod` | Estado de formulario y validación por schema. |
| Estado global | `zustand` | Sesión persistida y diálogo de confirmación. Solo Zustand. |
| Utilidades de hooks | `react-use` | `useDebounce` e `useInterval`. |
| Notificaciones en pantalla | `sonner` | Toasts de éxito y de error. |
| Tema | `next-themes` | Claro/oscuro por clase en `<html>`. |
| Iconos | `lucide-react` | Import nombrado por icono. |
| Fechas en formularios | `react-day-picker` | Calendario del selector de fecha. |
| Hosting | Amplify | Construye `app/` y sirve `app/dist`. |
| CI y deploy | Semaphore | Lint en cada rama; deploy por promotion manual. |

Las versiones exactas y qué pieza usa cada dependencia están en
[03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#packagejson).

## Arranque

```txt
index.html
  main.jsx          createRoot → StrictMode → BrowserRouter → App
    App.jsx         ThemeProvider → Authorization + Toaster + ConfirmationDialog
      Authorization useSessionStore().profile.user.role
                    useRoutes([...publicRoutes, ...árbol del rol])
        sin rol / rol sin árbol  → noSessionRoutes (login)
        cuenta bloqueada         → Layout del rol + DisabledAccount en toda ruta
        rol con árbol            → superadmin.routes.jsx | member.routes.jsx
          <Rol>Layout           Sidebar + Header + <Outlet />
            page.jsx            useResolver(resolvers) → componente de la pantalla
```

`index.html` monta `#root` y carga `main.jsx`. `main.jsx` envuelve la app en `StrictMode` y
`BrowserRouter`. `App.jsx` es el cromo global: tema, `Authorization`, toasts y el diálogo de
confirmación; los modales por query de alcance global también se montan ahí.

`Authorization` no protege datos: pinta el árbol de rutas que corresponde al perfil guardado. Las
rutas públicas (callback OAuth y enlaces del correo) van delante para que ganen sobre el `*` de cada
panel. Las URLs no llevan prefijo de rol: todos los árboles cuelgan de `/` y comparten el mismo
espacio de URLs. El API vuelve a decidir permisos en cada request; que el panel se pinte de una forma
u otra es solo cromo.

El código de cada eslabón está en
[07-rutas-y-sesion.md](07-rutas-y-sesion.md#mainjsx) (`main.jsx`),
[07-rutas-y-sesion.md](07-rutas-y-sesion.md#appjsx) (`App.jsx`),
[07-rutas-y-sesion.md](07-rutas-y-sesion.md#authorization) (`Authorization`) y
[07-rutas-y-sesion.md](07-rutas-y-sesion.md#archivos-de-rutas) (árboles de rutas).

## Flujo de datos

```txt
pantalla (page.jsx)
  lectura al montar   useResolver({clave: (params, search) => itemsService.get(search)})
  formulario          useForm(content, {schema, onSubmit: (body) => itemsService.post(body)})
  botón o ítem        useMutation((id) => itemsDisableService.post({id}))
        │
        ▼
<feature>.service.js  export default service('<path>')
        │
        ▼
core/service.js       fetch(`${apiDomain}/api/<path>`, {credentials: 'include'})
        │             desempaqueta envelope.response o lanza {status, error, fields}
        ▼
API                   /api/<path>
```

Una pantalla nunca llama a `fetch`. Lee con `useResolver`, envía formularios con `useForm` y dispara
acciones sueltas con `useMutation`; los tres reciben funciones que llaman a un `*.service.js`, y cada
service es una línea: `service('<path>')`. El `<path>` es el mismo string que el segmento de la ruta
bajo `/api/` del server, así que el nombre se escribe una sola vez.

Los hooks no comparten helpers entre sí. Una respuesta exitosa llega ya desempaquetada; un error
llega como `{status, error, fields}` y el hook lo convierte en el estado que pinta la pantalla (texto
de error, toast, campos marcados).

La única salida a la red que no pasa por `service()` es el segundo paso de la subida de archivos, que
va directo al bucket: [11-subida-de-archivos.md](11-subida-de-archivos.md#flujo).

## Estado

| Tipo | Dónde vive | Pieza | Qué nunca va ahí |
|---|---|---|---|
| URL | Query string y params de ruta | `useQueryParams`, `useParams`, `?modal=<id>` | Datos del servidor. |
| Servidor | Estado local de `useResolver` en cada pantalla | `useResolver` | Una copia en un store global. |
| Formulario | React Hook Form | `useForm` | `useState` por campo. |
| Global | Zustand | `useConfirmationDialogStore` | Datos que se pueden releer del API. |
| Persistido | Zustand + `persist` en `localStorage` | `useSessionStore` (`profile`) | La credencial: la sesión es una cookie httpOnly. |

Filtros, página y modal abierto viven en la URL: sobreviven a recargar, se comparten con un enlace y
el botón atrás hace lo esperado. Cambiar el query string es lo que vuelve a pedir datos, porque
`useResolver` tiene el query string (salvo `modal`) como dependencia. Lo derivable se deriva con
`useMemo` en lugar de duplicarse en estado.

Detalle en [06-stores.md](06-stores.md#qué-va-a-zustand) y
[05-hooks.md](05-hooks.md#acoplamiento-con-los-modales-por-query).

## Contrato del API

El cliente asume este contrato. Si el API del destino difiere, la Fase 0 lo registra y se pregunta al
usuario antes de adaptar `core/service.js`.

| Aspecto | Contrato |
|---|---|
| Base | `${apiDomain}/api/<path>`; `apiDomain` sale de `lib/environment.js`. |
| Métodos | `GET` (query string), `POST` y `PUT` (JSON o `FormData`), `DELETE` (query string). No hay rutas `/<recurso>/:id`: el id viaja como filtro y `getOne` toma el primer elemento. |
| Envelope | Toda respuesta es JSON `{response, errors, fields}`. Éxito: el cliente devuelve `response`. |
| Error | `!response.ok` o `errors` presente: el cliente lanza `{status, error: errors[0], fields}`. `error` es un texto ya listo para el usuario; `fields` es un array con los **nombres** de los campos rechazados, nunca los mensajes. |
| Red caída | El cliente lanza `{status: 0, error}` con un mensaje propio. |
| Sesión | Cookie httpOnly, host-only, `SameSite=Lax`, que el navegador adjunta solo con `credentials: 'include'`. App y API son same-site. El JavaScript del cliente nunca ve el token. |
| 401 | El cliente vacía `useSessionStore`; `Authorization` pasa a montar el árbol sin sesión (login). |
| Inicio de sesión | `POST public/auth/signin` devuelve `{authorize_url}`. El navegador **navega** a esa URL (top-level, no `fetch`, que se traga el `Location`); el server responde con un 302 a `/oauth/proyecto?code=…`. |
| Callback OAuth | `POST oauth/proyecto/token` con `{grant_type: 'authorization_code', code}`, público: responde con la cookie puesta y `{profile}` en `response`, que va directo a `setSession`. La sesión nace en el canje. |
| Perfil | `profile.user.role` elige el árbol; `profile.user.disabled` y `profile.user.bannedUntil` bloquean el panel. |
| Subida | `POST uploads` con `{name, size, type}` (exige sesión) devuelve `{url, fields, path}`; el navegador sube los bytes directo a `url`. |
| Archivos | `GET /api/files/<path>`, usado en `<img src>`; la cookie viaja sola. |
| Cierre de sesión | `POST auth-logout`: el server revoca la sesión y vence la cookie. |

Código que implementa cada fila: [04-core.md](04-core.md#coreservicejs),
[07-rutas-y-sesion.md](07-rutas-y-sesion.md#oauth),
[11-subida-de-archivos.md](11-subida-de-archivos.md#contrato-de-la-firma).

## Mapa de abstracciones

| Abstracción | Qué resuelve | Cuándo se usa | Detalle |
|---|---|---|---|
| `service(path)` | Única puerta al API: base, cookie, envelope, errores y 401. | Todo `*.service.js`. | [04-core.md](04-core.md#coreservicejs) |
| `useResolver(resolvers)` | Lectura al montar, con recarga al cambiar params o query, `isLoading`/`error` únicos y `refetch`. | Todo `page.jsx`. | [05-hooks.md](05-hooks.md#useresolver) |
| `useForm(content, options)` | Formulario con Zod, doble envío bloqueado, toasts y errores del server en los campos. | Toda pantalla con formulario. | [05-hooks.md](05-hooks.md#useform) |
| `useMutation(request, options)` | Acción suelta con confirmación, doble click bloqueado y toasts. | Botones e ítems de lista. | [05-hooks.md](05-hooks.md#usemutation) |
| `useQueryParams()` | Filtros y paginación en la URL con escritura diferida y `replace`. | Listados con búsqueda o páginas. | [05-hooks.md](05-hooks.md#usequeryparams) |
| `withModalFromQuery(Modal, id)` | Modal abierto por `?modal=<id>`, con foco, Escape y cierre con `replace`. | Modales de una acción o globales. | [10-modales-por-query.md](10-modales-por-query.md#modalwrapperjsx) |
| `uploadFile(file)` | Subida en dos pasos: firma del API y bytes directo al bucket. | Campos de archivo. | [11-subida-de-archivos.md](11-subida-de-archivos.md#coreuploadjs) |
| `Form` y `Form*` | Campos conectados a React Hook Form con etiqueta, ayuda y error. | Todo formulario. | [09-componentes.md](09-componentes.md#formularios) |
| `CustomPage` / `CustomTable` | Cabecera de pantalla con volver y acciones; tabla con paginación. | Toda pantalla; todo listado. | [09-componentes.md](09-componentes.md#custompage), [09-componentes.md](09-componentes.md#customtable) |
| `useSessionStore` | Perfil de la sesión persistido; única puerta a la sesión. | `Authorization`, layouts, OAuth, logout. | [06-stores.md](06-stores.md#sessionstorejs) |
| `useConfirmationDialogStore` | Diálogo de confirmación global que devuelve una promesa booleana. | Lo usa `useMutation`. | [06-stores.md](06-stores.md#confirmation-dialogstorejs) |
| `lib/environment.js` | Única lectura de variables de entorno. | `core/service.js`, `lib/utils.js`, login y alta. | [03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#libenvironmentjs) |

## Reglas de uso

- **Una pantalla no arma su propio `fetch`.** Toda llamada sale de un `*.service.js` construido con
  `service()`. Saltarse la capa pierde el desempaquetado del envelope, el formato de error y el
  cierre de sesión ante un 401.
- **Leer al montar es `useResolver`; formulario es `useForm`; botón o ítem es `useMutation`.** Un
  `useEffect` con `fetch` o un `useState` por campo reintroduce los bugs que esos hooks ya cierran:
  respuestas viejas que pisan a las nuevas, doble envío y errores del server que no llegan al campo.
- **El estado va donde dice la tabla de [Estado](#estado).** Copiar datos del servidor a Zustand los
  deja desactualizados; guardar filtros en `useState` rompe el botón atrás y los enlaces.
- **La sesión es la cookie.** El cliente guarda el perfil para pintar, nunca un token. Cualquier
  decisión de seguridad la toma el API.
- **Nada de abstracciones nuevas en silencio.** Si el destino necesita una pieza que este mapa no
  tiene, se declara y se aprueba antes de escribirla.

## Checklist del ejecutor

- [ ] Leí este documento y [02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#árbol-de-app)
      completos antes de tocar código.
- [ ] El API del destino cumple cada fila de [Contrato del API](#contrato-del-api), o cada diferencia
      está anotada en el inventario de la Fase 0 y consultada con el usuario.
- [ ] Cada abstracción del [Mapa de abstracciones](#mapa-de-abstracciones) tiene su equivalente
      identificado en el destino ("existe", "existe con otro nombre" o "falta").
- [ ] Ninguna pantalla del destino llama a `fetch` fuera de `core/`.
- [ ] Ningún store del destino guarda un token o una credencial.
