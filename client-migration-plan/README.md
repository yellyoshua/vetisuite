# Plan de migración del cliente

## Qué es el plan

Este plan documenta la **arquitectura** de un cliente web (SPA de paneles por rol, construida con
Vite, React Router, Zustand, Tailwind y shadcn, desplegada en Amplify con CI en Semaphore) para
replicarla en otro proyecto que ya tiene una estructura parecida. Migra la arquitectura, **no el
producto**: capas, hooks, stores, rutas por rol, modales por query, subida de archivos, módulos de
cuenta propia, gestión de cuentas, configuración y deploy. Las pantallas de negocio del destino se
construyen después con el molde de [13-templates.md](13-templates.md#listado).

## Cómo usarlo

1. Lee este README completo.
2. Lee [01-arquitectura.md](01-arquitectura.md#arranque) y
   [02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#árbol-de-app) antes de tocar código.
3. Ejecuta las fases en orden, de la 0 a la 9. Cada fase nombra el documento que la detalla.
4. No avances de fase sin cumplir su criterio **Hecho**.
5. Adapta lo que ya existe en el destino antes de reemplazarlo. Ante un conflicto con una convención
   del destino, **pregunta al usuario** antes de elegir.

Todo el código de los documentos es completo y está listo para copiar, salvo los bloques rotulados
como extracto. Los únicos valores a sustituir son los placeholders de la tabla siguiente.

## Placeholders

| Placeholder | Qué es | Dónde aparece |
|---|---|---|
| `proyecto` | Slug del destino, en minúsculas. | Nombre del paquete `@proyecto/app`, clave `proyecto.session`, ruta `/oauth/proyecto`, service `oauth/proyecto/token`, `@proyecto/*` del guardarraíl de ESLint, contraseña de las cuentas demo `proyectodotcom`. |
| `PROYECTO_` | El mismo slug, en mayúsculas. | `envPrefix`, `PROYECTO_API_DOMAIN`, `PROYECTO_LANDING_DOMAIN`. |
| `dominio.com` | Dominio público del destino. | Valores de las variables en la nube, `soporte@dominio.com`, correos de las cuentas demo. |
| `superadmin`, `member` | Roles del destino. | `routesByRole`, `layoutsByRole`, `superadmin.routes.jsx`, `member.routes.jsx`, `modules/<rol>/`, `components/Superadmin/`, `components/Member/`. |
| `members`, `superadmins` | Cuentas que gestiona el superadmin. | [08-modulos.md](08-modulos.md#gestión-de-cuentas). |
| `items` | Recurso de dominio de ejemplo. | [13-templates.md](13-templates.md#itemsservicejs). |
| `<ModalId>` | Id de un modal por query. | [10-modales-por-query.md](10-modales-por-query.md#montaje-global-y-montaje-por-pantalla), montaje global en `App.jsx`. |
| `<region>`, `<amplify-app-id>`, `<env>` | Datos de deploy. | [12-deploy.md](12-deploy.md#promotion-por-rama). |
| `Proyecto` | Nombre visible del producto (identidad). | `<title>` de `index.html`, etiqueta accesible del logo, textos de bienvenida. |
| `Descripción del proyecto` | Meta description (identidad). | `index.html`. |
| `<Fuente>` y `--font-principal` | Fuente principal (identidad). | URL de Google Fonts y `:root` de `index.html`, `globals.css`. |
| `es-ES` y `lang="es"` | Locale (identidad). Se conserva; el destino lo ajusta si usa otro. | `DEFAULT_LOCALE` de `lib/date.js`, `<html lang>`. |
| `favicon.svg`, `logo-base.png`, `logo-white.png`, `login-side.png` | Arte (identidad). El plan fija el nombre; el destino pone su arte. | `app/public/`. |

## Índice

| # | Documento | Contenido |
|---|---|---|
| 01 | [01-arquitectura.md](01-arquitectura.md#stack) | Stack, arranque, flujo de datos, estado, contrato del API y mapa de abstracciones. |
| 02 | [02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#vocabulario) | Árbol de `app/` marcado base / template / opcional, convención de módulo y nombres. |
| 03 | [03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#packagejson) | `package.json`, scripts, Vite, `jsconfig.json`, `index.html`, Tailwind 4, entorno, ESLint, workspace. |
| 04 | [04-core.md](04-core.md#coreservicejs) | `core/service.js` y helpers de `lib/`. |
| 05 | [05-hooks.md](05-hooks.md#useresolver) | `useResolver`, `useForm`, `useMutation`, `useQueryParams`, `useLogout` y `useNotifications` (opcional). |
| 06 | [06-stores.md](06-stores.md#sessionstorejs) | Store de sesión, store y componente del diálogo de confirmación. |
| 07 | [07-rutas-y-sesion.md](07-rutas-y-sesion.md#authorization) | Arranque, `Authorization`, árboles de rutas, OAuth, logout, layouts, cuenta deshabilitada, cuenta propia. |
| 08 | [08-modulos.md](08-modulos.md#anatomía-de-un-módulo) | Anatomía de un módulo, separación por rol y gestión de cuentas. |
| 09 | [09-componentes.md](09-componentes.md#ui) | `ui/`, formularios, `CustomPage`, `CustomTable`, `PageState`, `CustomTooltip`, tema y toasts. |
| 10 | [10-modales-por-query.md](10-modales-por-query.md#modalwrapperjsx) | `withModalFromQuery`, `useOpenModal`, `useCloseModal`, montaje y accesibilidad. |
| 11 | [11-subida-de-archivos.md](11-subida-de-archivos.md#flujo) | Firma, subida directa al bucket, `FormUpload*` y `getPictureSrc`. |
| 12 | [12-deploy.md](12-deploy.md#amplifyyml) | Amplify, script de deploy, promotion por rama, variables y rollback. |
| 13 | [13-templates.md](13-templates.md#itemsservicejs) | Módulo `items` completo como molde y checklist por módulo. |

## Fases

Los criterios **Hecho** usan los nombres de script del plan: `lint`, `build:app` y `dev:app`, que se
corren desde la raíz del repositorio (`bun run lint`, `bun run build:app`, `bun run dev:app`). La
Fase 0 los mapea a los nombres reales del destino; a partir de ahí se usan los del destino.

### Fase 0 · Inventario y placeholders

- **Documentos:** este README, [01-arquitectura.md](01-arquitectura.md#contrato-del-api) y
  [02-estructura-de-carpetas.md](02-estructura-de-carpetas.md#árbol-de-app).
- **Qué se hace:**
  1. Inventario del `app/` del destino y diff contra el árbol de 02: cada archivo **base** queda como
     "existe", "existe con otro nombre" o "falta"; cada archivo **opcional** con su decisión.
  2. Mapeo de los scripts `dev:app`, `build:app` y `lint` a los nombres reales del destino.
  3. Valores fijados para cada placeholder de la tabla.
  4. Comparación del API del destino con el [contrato del API](01-arquitectura.md#contrato-del-api).
- **Hecho:** el inventario, el mapeo de scripts, los valores de los placeholders y las diferencias del
  API están escritos y el usuario resolvió cada conflicto con una convención del destino. No se tocó
  código.

### Fase 1 · Configuración y entorno

- **Documento:** [03-configuracion-y-entorno.md](03-configuracion-y-entorno.md#packagejson).
- **Qué se crea o se transporta:** `package.json`, scripts de la raíz, `vite.config.js`,
  `jsconfig.json`, `index.html`, `globals.css`, `lib/environment.js`, `.env.local`, guardarraíl de
  ESLint y workspace.
- **Hecho:** `bun install` termina sin errores; `bun run dev:app` levanta en el puerto 3000; `bun run
  build:app` genera `app/dist`; `bun run lint` pasa; un import de `@proyecto/*` o `node:*` dentro de
  `app/src` hace fallar `lint`.

### Fase 2 · Core y hooks

- **Documentos:** [04-core.md](04-core.md#coreservicejs) y [05-hooks.md](05-hooks.md#useresolver).
- **Qué se crea o se transporta:** `core/service.js`, `lib/utils.js`, `lib/logger.js`,
  `lib/user-agent.js`, `lib/date.js` y los hooks base.
- **Hecho:** `bun run lint` y `bun run build:app` pasan. Ningún archivo fuera de `lib/environment.js`
  lee `import.meta.env`.

### Fase 3 · Stores

- **Documento:** [06-stores.md](06-stores.md#sessionstorejs).
- **Qué se crea o se transporta:** `session.store.js`, `confirmation-dialog.store.js` y
  `components/confirmation-dialog.jsx`.
- **Hecho:** `bun run lint` y `bun run build:app` pasan. En `bun run dev:app`, la clave
  `proyecto.session` aparece en `localStorage` tras iniciar sesión (se comprueba en la Fase 6) y
  nunca contiene un token.

### Fase 4 · Componentes

- **Documento:** [09-componentes.md](09-componentes.md#ui).
- **Qué se crea o se transporta:** `components/ui/`, `components/form/Form.jsx`,
  `FormPermissionsEditor.jsx`, `CustomPage`, `CustomTable`, `PageState`, `CustomTooltip` y
  `theme-provider.jsx`.
- **Hecho:** `bun run lint` y `bun run build:app` pasan.

### Fase 5 · Modales por query

- **Documento:** [10-modales-por-query.md](10-modales-por-query.md#modalwrapperjsx).
- **Qué se crea o se transporta:** `components/modalWrapper.jsx`.
- **Hecho:** `bun run lint` y `bun run build:app` pasan. El flujo manual se valida en la Fase 8.

### Fase 6 · Rutas y sesión

- **Documento:** [07-rutas-y-sesion.md](07-rutas-y-sesion.md#mainjsx).
- **Qué se crea o se transporta:** `main.jsx`, `App.jsx`, `Authorization`, los cuatro archivos de
  rutas, OAuth, logout, layouts por rol, `NotFoundScreen`, cuenta deshabilitada, módulos de cuenta
  propia y los dashboards stub de [13-templates.md](13-templates.md#dashboard-stub).
- **Hecho:** `bun run lint` y `bun run build:app` pasan, y en `bun run dev:app`:
  - sin sesión, `/` y cualquier ruta del panel llevan a `/sign-in`;
  - `/sign-up` sale a `${landingDomain}/?modal=signup`;
  - iniciar sesión navega a la `authorize_url`, vuelve por `/oauth/proyecto` y entra al panel del rol;
  - cada rol ve su sidebar y un `*` desconocido muestra `NotFoundScreen`;
  - una cuenta con `disabled` pinta `DisabledAccount` en cualquier ruta, incluida `/`;
  - cerrar sesión vacía `proyecto.session` y vuelve a `/` sin sesión, aun con el API caído;
  - un 401 del API devuelve al login;
  - perfil, edición, cambio de contraseña y sesiones abren y guardan.

### Fase 7 · Subida de archivos

- **Documento:** [11-subida-de-archivos.md](11-subida-de-archivos.md#flujo).
- **Qué se crea o se transporta:** `core/upload.js`, `FormUploadAvatar.jsx`, `FormUploadFiles.jsx` y
  `FormUploadFiles.utils.js`.
- **Hecho:** `bun run lint` y `bun run build:app` pasan, y en `bun run dev:app` subir un avatar desde
  la edición de perfil muestra la imagen servida por `/api/files/<path>`; un archivo rechazado por el
  bucket muestra el mensaje propio sin cerrar la sesión.

### Fase 8 · Módulos y gestión de cuentas

- **Documentos:** [08-modulos.md](08-modulos.md#gestión-de-cuentas) y
  [13-templates.md](13-templates.md#checklist-por-módulo).
- **Qué se crea o se transporta:** `members*` y `superadmins*` del superadmin; luego cada recurso de
  dominio del destino con el molde `items`.
- **Hecho:** `bun run lint` y `bun run build:app` pasan, y en `bun run dev:app`:
  - el listado de miembros busca con espera y pagina sin llenar el historial;
  - alta, edición y detalle guardan y muestran los errores del server en los campos;
  - el modal de deshabilitar abre por `?modal=<id>`, recibe el foco, cierra con Escape y el botón
    atrás no lo reabre;
  - abrir o cerrar el modal no recarga el listado;
  - los permisos se ven y se editan;
  - un superadmin no puede deshabilitar su propia cuenta;
  - cada recurso nuevo cumple el checklist por módulo.

### Fase 9 · Deploy

- **Documento:** [12-deploy.md](12-deploy.md#amplifyyml).
- **Qué se crea o se transporta:** `app/amplify.yml`, el script de deploy y la promotion manual por
  rama; las variables se cargan en la consola de Amplify.
- **Hecho:** el bloque de lint del CI pasa en la rama; la promotion manual de la rama de desarrollo
  termina con el job de Amplify en `SUCCEED`; la app publicada inicia sesión contra el API del
  ambiente.

## Reglas para el ejecutor

Cada regla lleva una etiqueta entre corchetes solo como referencia; el texto es la regla completa.

1. **No saltarse las capas [capas].** Toda llamada al API sale de un `*.service.js` construido con
   `service()`. Ninguna pantalla arma su propio `fetch`; la única excepción es el segundo paso de
   `core/upload.js`, que sube los bytes directo al bucket. Leer al montar se hace con `useResolver`;
   un formulario, con `useForm`; la acción de un botón o de un ítem, con `useMutation`.
2. **Contratos tipados [contratos].** Todo formulario valida con su schema Zod
   (`<recurso>.schema.js`). Nada de `useState` para campos de formulario.
3. **Sin patrones nuevos en silencio [patrones].** Si el destino necesita una abstracción, una
   dependencia o un patrón que el plan no tiene, se declara, se explica por qué hace falta y el
   usuario lo aprueba antes de escribirlo.
4. **Sin comentarios de prosa en el código [COM-1, COM-4].** El código no lleva comentarios que
   expliquen qué hace o por qué; el razonamiento va en el mensaje del commit. Solo se permiten
   directivas de herramientas (`eslint-…`) y el shebang. Los archivos que toque la migración quedan
   sin comentarios de prosa.
5. **Duplicación entre roles, regla de guardia [DUP-5].** La duplicación entre roles es deliberada:
   cada rol tiene sus módulos, sus services y su layout aunque apunten al mismo endpoint, porque el
   API resuelve la forma según la sesión. No se abstrae entre perfiles ni se crea `modules/shared/`.
   Lo único que se comparte entre roles son los componentes de formulario de `components/form/` y los
   componentes genéricos de `components/`.
6. **Fronteras de módulo [MOD].** `app/` nunca importa de `packages/`, de código de servidor ni de
   otro paquete del monorepo; si necesita algo, lo copia. El guardarraíl de ESLint lo hace cumplir y
   no se desactiva.
7. **Errores [ERR].** Los errores del API llegan como `{status, error, fields}`. Nada de `catch`
   vacíos ni de valores por defecto que tapen un error: un fallo se lanza, se pinta con `PageError` o
   llega al usuario por el toast y los campos del formulario.
8. **Nombres [NT].** Archivos y carpetas en kebab-case; componentes en PascalCase, con el archivo
   igual al componente; código en camelCase. La variable sigue al archivo (`items.service.js` →
   `itemsService`). Los exports siguen a los archivos hermanos del directorio: si los vecinos usan
   `export default`, el nuevo también.
9. **Sesión [sesión].** La única puerta a la sesión es `useSessionStore`. Guarda el perfil, nunca la
   credencial: la sesión es una cookie httpOnly que el JavaScript no ve.
10. **Entorno [entorno].** Las variables se leen solo desde `lib/environment.js`. Cualquier variable
    con el prefijo `PROYECTO_` termina inlineada en el bundle y es pública: ningún secreto va ahí.
11. **Un solo informe final [AIS-14].** Al terminar la migración se entrega un único informe con esta
    plantilla literal, escribiendo "ninguno" donde no aplique. Las validaciones de cada fase van
    dentro; el criterio **Hecho** marca el cierre de cada fase.

```txt
Requisitos cubiertos:        cada tema pedido → fase y archivo
Supuestos:                   qué / por qué / impacto si es incorrecto
Alcance:                     pedido vs hecho; "Propuesto, no aplicado"
Archivos:                    creados y modificados en el destino
Dependencias:                agregadas o quitadas, con versión y motivo
Patrones seguidos:           los de este plan; desviaciones aprobadas
Decisiones de simplicidad:   qué se dejó fuera; duplicación por rol mantenida
Fallbacks y rutas de error:  cómo se comporta cada ruta de error del cliente
Cambios de seguridad:        sesión, variables públicas, guardarraíles
Rendimiento:                 medido o "no medido"
Validaciones ejecutadas:     <comando> → <resultado real>, por fase
Validaciones no ejecutadas:  qué no se pudo correr, por qué y el comando
Resultado:                   qué puede hacer ahora el usuario
Completitud:                 "completo" o huecos explícitos
Riesgos residuales:          lo que puede fallar y dónde mirar
Decisiones por aprobar:      lo que necesita una respuesta del usuario
Mapa de fuentes:             fase → documento del plan → archivos del destino
```

## Desviaciones respecto del origen

El plan replica el cliente de origen tal cual y solo corrige defectos verificados o quita producto.
Estas son las diferencias.

| En el origen | En el plan | Por qué |
|---|---|---|
| La regla de estado menciona Jotai. | Solo Zustand. | Jotai no está instalado. |
| Las variables de entorno se leen con `import.meta.env` en varios archivos y no hay módulo de entorno. | `src/lib/environment.js` exporta `apiDomain` y `landingDomain`; lo consumen `core/service.js`, `lib/utils.js`, `SignInForm` y la pantalla de alta. | Cada app declara sus variables en su propio módulo. |
| La URL del API está duplicada en `core/service.js` y `lib/utils.js`. | Ambos importan `apiDomain`. | Duplicación de configuración. |
| `.env.local` declara el dominio de la propia app. | No se declara ni se exporta. | Nada de la app lo lee: las URLs de retorno de una pasarela las arma el server. Se vuelve a agregar si una pantalla del destino construye URLs absolutas propias. |
| `index.html` carga Font Awesome por CDN. | No se carga. | Solo lo usaba un modal de producto; el estándar de iconos es `lucide-react`. |
| `constants/support.js` exporta el correo y un enlace de chat de soporte, y `DisabledAccount` muestra ambos. | Solo `supportEmail`; `DisabledAccount` sin el paso del chat. | El chat es un canal de producto. |
| `Form.jsx` exporta `FormInputMultiSelect` y re-exporta `FormInputRadioCards` y `FormKeyValueEditor`. | Se quitan, junto con `ui/card`, `ui/command` y `ui/dialog`. | `FormInputMultiSelect` solo lo usa producto; los otros dos no los usa ningún archivo. |
| `components/form/` incluye un selector de fecha y uno de hora independientes. | No se transportan. | Solo los usan pantallas de producto. |
| `useCloseModal` escribe la URL sin `replace`, a diferencia del cierre interno del modal. | `useCloseModal` escribe con `{replace: true}`. | Con push, el botón atrás reabre el modal que se acaba de cerrar; contradice el motivo por el que el cierre interno usa `replace`. |
| `globals.css` trae clases de una landing de marketing (`landing-*`, `hero-*`, `flip-card*`, `btn-gaming` y afines) y su variable de sombra. | No se transportan. | Ningún archivo de la app las usa. |
| `package.json` declara `underscore`, `cmdk`, `@radix-ui/react-dialog` y las dependencias de videollamada. | No se declaran. | Solo las importan piezas de producto o piezas quitadas del plan. |

## Verificación final

Al cerrar la Fase 9, con los nombres de script del destino fijados en la Fase 0:

```sh
bun install
bun run lint
bun run build:app
bun run dev:app
```

- `bun run lint` y `bun run build:app` terminan sin errores.
- `bun run dev:app` levanta en el puerto 3000.
- Ningún archivo de `app/src` fuera de `lib/environment.js` lee `import.meta.env`:

```sh
grep -rn "import.meta.env" app/src
```

- Ninguna pantalla llama a `fetch`; solo `core/service.js` y `core/upload.js`:

```sh
grep -rln "fetch(" app/src
```

- Ningún módulo de un rol importa de otro rol:

```sh
grep -rn "@/modules/member/" app/src/modules/superadmin
grep -rn "@/modules/superadmin/" app/src/modules/member
```

Flujos manuales, en `bun run dev:app` contra el API del ambiente de desarrollo:

1. Sin sesión: `/`, `/members` y una URL inventada terminan en `/sign-in`; `/sign-up` sale a la
   landing.
2. Inicio de sesión por la `authorize_url`, vuelta por `/oauth/proyecto` y entrada al panel del rol.
   `localStorage` guarda `proyecto.session` con el perfil y sin token.
3. Cada rol ve su sidebar; una URL inexistente muestra `NotFoundScreen`.
4. Listado de miembros: la búsqueda escribe la URL con espera y `replace`; la paginación avanza y
   retrocede; el botón atrás no recorre cada tecla.
5. Alta, edición, detalle y permisos de un miembro guardan; un error de validación del server marca
   los campos.
6. El modal de deshabilitar abre por `?modal=<id>`, toma el foco, cierra con Escape y con el fondo,
   devuelve el foco y el botón atrás no lo reabre.
7. Deshabilitar una cuenta y entrar con ella pinta `DisabledAccount` en cualquier ruta.
8. Subir un avatar y verlo servido por `/api/files/<path>`.
9. Cerrar sesión con el API caído igual vuelve a `/` sin sesión.
10. La promotion de deploy de la rama de desarrollo termina en `SUCCEED` y la app publicada repite
    los pasos 1 y 2.
