# AGENTS.md

Guía de arquitectura y reglas para trabajar en este repositorio. Integra las reglas de código de
`.agent/rules/`; los comandos, en el `package.json` de la raíz.

## Principios

Aplica a todo el monorepo.

1. **El código más barato es el que no se escribe.** Antes de agregar algo, preguntá si hace falta.
   Nada "para después": ni scaffolding, ni config para un valor que no cambia, ni interfaces con una
   sola implementación.
2. **Reusar antes que escribir.** Wrapper, hook, schema, constante o patrón que ya existe en el repo
   se usa. Reimplementar lo que está dos carpetas más allá es el error más común.
3. **Aburrido antes que ingenioso.** El código se lee a las 3 a.m. durante un incidente. Explícito,
   secuencial, de arriba abajo.
4. **Repetir está permitido; abstraer cuesta.** Se extrae cuando el patrón aparece 3+ veces **y** la
   extracción simplifica. Un helper con condicionales adentro es peor que la repetición.
5. **Cada capa hace una cosa.** Validar, autorizar, escribir, leer y pintar viven en lugares
   distintos y conocidos. Si no sabés dónde va algo, falta leer, no inventar una capa.
6. **Fallar fuerte.** Nada de `null` silencioso ni optional chaining defensivo sobre lo que una capa
   anterior garantiza. Si es `null` es un bug y tiene que explotar.
7. **Duplicar entre apps es la regla.** `app/`, `landing/`, `server/` y `cloudtasks/` no comparten
   código salvo `@brunerkids/db` (`@proyecto/db`). Si dos apps necesitan lo mismo, se copia.

## Monorepo

Bun workspaces:

```
app/         SPA de los paneles (Vite + React Router) — app.dominio.com
server/      API Nitro (h3) — api.dominio.com
landing/     marketing estático (Astro) — dominio.com
packages/    paquetes Node/Bun: db (Drizzle: schemas, migraciones y conexión)
cloudtasks/  handlers SQS → Lambda (uno por carpeta, con su build y su .env)
infrastructure/  un deploy por componente
.semaphore/  CI y promotions
seeds/       fixtures de la base
```

**`packages/` es código Node/Bun.** `packages/db` (`@proyecto/db`) es el único paquete que declara
`drizzle-orm`, `postgres`, `@neondatabase/serverless` y `drizzle-kit`: los consumidores no las declaran
(con linker `isolated` no las resolverían) y las importan re-exportadas desde ahí — `db.js`,
`schemas/schemas.js`, `orm.js` (`drizzle-orm`), `pg-core.js`, `pglite.js` y `kit-api.js` (tests),
`postgres.js` — siempre con extensión (Node ESM los carga sin bundler). Así hay una sola instancia
del ORM y una sola versión que subir. Su `.env.local` (`IS_LOCAL`, `DATABASE_URL`) permite generar y
aplicar migraciones sin levantar `server/`. Lo usan `server/` y, del lado de
las tasks, aquellas que escriben tokens o mueven estados críticos (ej. `cloudtasks/email-account-manager`),
que no pueden permitirse una copia del esquema que se desincronice.
`server/permissions` es el registro de autorización del backend: los
hooks de cada módulo consultan la base con Drizzle mediante `@proyecto/db`. Todo lo demás (constantes,
mail, auth, logger, servicios de dominio) vive en `server/`; `app/` y `landing/` tienen su propia
copia de lo que muestran y **nunca importan de `packages/`**: si dos apps necesitan lo mismo, se
duplica.

## JavaScript

Aplica a `app/`, `server/`, `landing/` y `cloudtasks/`.

### Lenguaje

- JavaScript en runtime (`.js` / `.jsx`). TypeScript solo en `cloudtasks/`, configs y `.d.ts`.
- `const` siempre. Necesitar `let` es señal de que falta un `.map()` / `.filter()` / `.reduce()` o
  una función aparte.
- **Early return.** Guardas arriba, camino feliz abajo. Nada de `if/else` anidado ni `else` después
  de `return` o `throw`.
- Una función, una responsabilidad. Si hay que leerla dos veces para entender qué hace, se parte.
- No mutes parámetros ni objetos recibidos: devolvé uno nuevo.
- Funciones anónimas siempre asignadas a un nombre (aparecen en el stack trace).
- Mensajes de error de cara al usuario, en español. Identificadores y logs técnicos, en inglés.
- Errores de dominio: `throw {error: 'Mensaje en español', status: 4xx}`. Nunca devolver `null` o
  `false` para señalar un fallo.

### Lo que aplica ESLint

No se discute: falla el lint.

| Regla | Límite |
|---|---|
| `no-var`, `prefer-const` | prohibido `var` y `let` reasignado |
| `max-depth` | 2 niveles |
| `max-lines` / `max-lines-per-function` | 400 / 300 |
| `max-statements` / `max-params` | 25 / 4 |
| `no-else-return`, `no-return-await`, `yoda` | prohibidos |
| `no-param-reassign` | prohibido mutar parámetros |
| `no-nested-ternary` | prohibido |
| `no-console` | prohibido fuera de scripts (usar el logger) |
| `no-warning-comments` | sin `TODO` / `FIXME` |
| `id-length` | mínimo 2 caracteres (excepciones: `_`, `t`, `d`, `q`) |
| `prefer-template`, `newline-before-return`, `quotes`, `jsx-quotes` | interpolación, línea en blanco antes del `return`, simples en JS y dobles en JSX |

**Superar un límite se resuelve partiendo el archivo o la función, nunca subiendo el límite ni con
`eslint-disable`.** Más de 4 parámetros → un objeto. Más de 2 niveles de anidación → early return o
función aparte.

### Criterio (no lo aplica el linter)

- **Nombres balanceados**: ni `el` ni `educationLevelSelectOptionsForForm`. El scope ya da contexto.
- **Booleanos que se leen como pregunta**: `isOwner`, `hasPermission`, `canCancel`.
- **Sin números ni strings mágicos**: un valor de dominio vive en `constants/<recurso>.js`.
- **Comentarios explican el porqué, nunca el qué.** Si el código necesita un comentario para decir qué
  hace, se reescribe. Las decisiones con historia (por qué no X) van en el commit.
- **Sin código muerto.** Nada comentado "por si acaso", nada de exports sin consumidor: git lo guarda.
- **Dependencias**: no se agregan hasta que hagan falta. Unas líneas propias antes que un paquete;
  la plataforma (HTML, CSS, stdlib, Postgres) antes que las dos.
- **Imports con extensión** (`.js`), y por alias: `@/` en `app/` y `server/`. `packages/` solo por
  paquete (`@brunerkids/db/...` o `@proyecto/db/...`).

## Nombres

Aplica a todo el monorepo.

### Archivos

| Tipo | Patrón |
|---|---|
| General | kebab-case |
| Componente React | PascalCase `.jsx`, igual al componente exportado |
| Pantalla de `app/` | `page.jsx` + `resolvers.js` dentro de su módulo |
| Hook | `use-<nombre>.js` |
| Ruta del API | `server/api/<recurso>.<verbo>.js` — un segmento kebab-case, el verbo define el método |
| Schema Zod | `<feature>.schema.js` |
| Repositorio (solo `server/`) | `<feature>.repository.js` — uno por tabla |
| Servicio | `<feature>.service.js` |
| Permisos | `server/permissions/<modulo>/<modulo>.permissions.js` |
| Tabla Drizzle | `<nombre>.table.js` |
| Mail (cloudtasks) | `<nombre>.mail.js` + `templates/<nombre>.template.jsx` |
| Constantes | `constants/<recurso>.js` — un archivo por recurso, no por campo |
| Test | `__tests__/<archivo>.test.js(x)` junto al código |

### Código

- camelCase para variables, funciones y métodos; PascalCase para componentes.
- Funciones anónimas siempre asignadas a un nombre.
- La variable sigue al archivo: `meetingsRepository` en `server/`, `meetingsService` en `app/`.
- Mapas de dominio: `<entidad>Options` (array) y `<entidad>Map` / `<entidad>Values` **derivados** del
  array. Nunca escritos dos veces.
- Tablas Drizzle: plural + sufijo `Table` (`usersTable`). FK en singular camelCase, sin sufijo `Id`
  (`user`, no `userId`).
- **Un nombre se escribe una sola vez y vale en tres lados**: el path del API
  (`/api/meetings-count`), el módulo de permisos (`meetings-count`) y el `path` del `service()` de la
  SPA. Un recurso hijo antepone el padre con guion; nunca `/:id` ni subdirectorios.

## Wrappers

Ninguna operación se saltea su wrapper:

- **`server/core/repository.js`** — lecturas de una tabla: filtros, búsqueda, orden, paginación y
  joins, redactando `password` también dentro de los joins. Devuelve los datos y lanza
  `{error, status}`; el envelope es cosa del borde HTTP, no de la base. Sin resultados no es error.
  No admite métodos custom: lo que no es una lectura de tabla es una función con Drizzle en su módulo.
- **`server/core/base-route.js`** — envuelve el handler h3: extrae los datos (query en GET, body o
  FormData en el resto), valida y arma el envelope `{response, errors}`. `errors` es `null` en éxito
  (nunca `[]`, que sería truthy) y un array de mensajes en español al fallar.
- **`app/src/core/service.js`** — factory de servicios REST de la SPA. `findOne(params)` es
  `find(params)[0]`: el id es un filtro más, no hay rutas `/<recurso>/:id`.
- **`server/core/auth-core.js`** — auth propia, sin librería externa. Sesiones de 2 días validadas
  también por user-agent. El token viaja en una cookie httpOnly del dominio del API: no hay
  `Authorization: Bearer` ni token en `localStorage`.

## OAuth2

El server es el Authorization Server del único cliente, grant `authorization_code`. Signin y signup
validan credenciales, emiten un code de 60s y devuelven una `authorize_url`; el browser **navega**
(top-level, no fetch: `fetch` se traga el `Location`) y el 302 lo lleva a la app, donde el canje del
code responde con **la cookie ya puesta**. El token nunca pasa por JavaScript, y la sesión nace en
el canje, no en el signin.

El code queda **atado al navegador que se autenticó** (IP + user-agent grabados al emitirlo y
exigidos en el canje): sin eso servía a quien lo presentara y permitía forzar una sesión ajena
(login CSRF). Si la IP cambia dentro de esos 60s el canje falla y hay que reintentar.

Sin tabla de clientes, PKCE, scopes ni refresh tokens — desviación consciente de RFC 6749 §5.1: hay
un solo cliente first-party y es un navegador. El `redirect_uri` se valida contra el dominio de la
app y `state` se reenvía sin verificar: el binding IP+UA cubre lo que cubriría `state`.

## Ciclo de una request

1. `Authorization.jsx` lee el perfil del store y monta el árbol de rutas de ese rol. Sin sesión solo
   existen las rutas públicas; un 401 vacía el store y manda al login.
2. La pantalla lee por `useResolver` contra su `*.service.js`. Ninguna lectura de la SPA toca la base.
3. Las mutaciones van por `useForm` / `useMutation`, siempre contra un `*.service.js`.
4. El browser adjunta la cookie solo; el store guarda **el perfil, nunca la credencial**. CORS
   permite app y landing, pero `credentials` solo para el dominio de la app.
5. Lo que no puede mandar headers (`<img src>` de `files/`, `EventSource` de `sse/`) funciona igual:
   la cookie es host-only y `SameSite=Lax`, y app y API son same-site. **Nunca** volver a poner el
   token en la query: quedaba en el caché de disco, en logs y en proxies. `files/` sirve solo las
   carpetas que escribe el proyecto — el bucket es compartido, y sin esa allowlist cualquier sesión
   bajaba lo que hubiera ahí. No hay chequeo por dueño: cada nombre lleva un UUID, así que la ruta
   es una capability no enumerable.

## Subida de archivos

**Los bytes no pasan por el API.** El navegador pide una firma a `POST /api/uploads` (exige sesión) y
hace el POST del archivo **directo a S3**. El camino viejo —multipart contra la Lambda— no podía
transportar 10 MiB (API Gateway topa en 10 MB, Lambda síncrona en 6 MB, y base64 expande 4/3) y encima
el preset `aws-lambda` de Nitro decodifica el cuerpo binario a **string UTF-8**, corrompiéndolo.

Tres reglas del firmante (`server/modules/uploads/`), ninguna negociable:

1. **La key la arma el servidor entera**: `temporal/<userId>/<uuid>.<slug>.<ext>`. Del nombre del
   cliente solo sobrevive un slug cosmético, y la extensión sale de un catálogo cerrado.
2. **El prefijo es el id del usuario de la sesión.** Es lo que permite comprobar después que la key es
   suya — antes cualquier ruta del bucket enviada en el body se guardaba tal cual.
3. **La política POST impone el tamaño**: `content-length-range` lo evalúa S3 antes de aceptar el
   cuerpo. Es la razón de usar presigned POST y no PUT: una URL prefirmada de PUT no tiene forma de
   expresar un rango de tamaño. Y `eq` sobre la key ata la firma a un solo objeto. Firma de 5 minutos:
   pedir más no sirve, la Lambda firma con credenciales de rol y la URL muere con la sesión del rol.

El movimiento de `temporal/` a la carpeta final lo sigue haciendo **`files-manager`** desde
`base-route`, sin cambios: `files.process` reescribe la ruta en el snapshot antes del handler y
`files.load` mueve el objeto después. Por eso el handler ya recibe la ruta destino en `data.picture` (o
el campo de archivo correspondiente) y puede devolverla sin recalcular nada.

El bucket sigue privado: Block Public Access completo, `BucketOwnerEnforced`, y una regla de CORS con
un solo método (`POST`) y el origen exacto del panel. CORS no da acceso — las policies siguen
aplicando; solo permite que el JavaScript del panel haga la petición.

**Hoy no hay optimización de imágenes ni validación de contenido.** Los archivos se guardan tal cual
se suben: sin WebP, sin conversión de formato, y sin la validación por decodificación que Sharp hacía
de rebote cuando el upload pasaba por el API. Lo único que se valida del archivo es lo que el cliente
**declara** (extensión contra un catálogo cerrado) y que la key le pertenezca.

## API y Backend (`server/`)

### Tres capas, y nada más

```
api/<recurso>.<verbo>.js            valida (Zod) · declara permisos · delega
modules/<feature>/*.service.js      escribe · aplica reglas · lecturas a medida
modules/<feature>/*.repository.js   lee una tabla vía repository()
```

- **Toda ruta pasa por `baseRoute(handler, schema, {module})`**: único lugar donde se extraen datos,
  se valida y se arma el envelope `{response, errors}`. `errors` es `null` en éxito, nunca `[]`.
- **Ninguna ruta importa la conexión a la base.** Si la ruta necesita Drizzle, a su service le falta
  una función.
- El service lanza `{error, status}`: ese texto es lo que lee el usuario.
- El repository devuelve datos y lanza `{error, status}`; sin resultados **no** es error. El envelope
  es cosa del borde HTTP.
- La rama por rol es un `if` plano sobre `context.profile.user.role` dentro de la ruta, con `select`,
  `join` y filtro escritos en cada rama. Sin hash de handlers, sin módulos por perfil, sin `else` de
  rol desconocido (la capa de permisos ya lo rechazó).
- La ruta nunca revalida sesión ni condiciona sobre la forma de `context`: el perfil siempre está.

### Rutas y Endpoints

Las rutas de `server/api/` mapean a `/api/*` y son **planas, sin `/:id`** en las lecturas: el id es
un filtro.

Planas también en el path: **un solo segmento kebab-case** bajo `/api/`, sin directorios. Un recurso
que cuelga de otro antepone el nombre del padre y un guion —`/api/items-count`,
`/api/profile-password`, `/api/resource-details`— y su archivo es
`server/api/<modulo>.<verbo>.js`, sin `index`. Ese mismo string es el nombre del módulo en
`server/permissions` y el `path` del `service()` de la SPA: el nombre se escribe una sola vez y
vale en los tres lados. La única excepción es `server/api/files/[...path].get.js`: Nitro no tiene una
forma plana de escribir una ruta comodín, y `/api/files/<carpeta>/<archivo>` es lo que consume el
`<img src>` del panel. Lo público (`api/public/**`, `api/oauth/**`, `api/webhooks/**`) conserva sus
prefijos: sus URLs están cargadas en consolas de terceros y en `PUBLIC_PREFIXES`.

La **rama por rol vive dentro de la ruta**, en `if` planos sobre `context.profile.user.role`, no en
módulos separados por perfil ni en un hash de handlers. Sin `else` de rol desconocido: si el rol no
es ninguno de los declarados, la petición no llega — la rechaza la capa de permisos.

`modules/` es un directorio **reservado de Nitro**: por eso está en el `ignore` del build. Sin eso
el build importa cada repositorio y revienta al abrir la conexión a la base.

### Repositorios

- Un archivo, un repositorio, `export default` y **nada más**: ni columnas, ni joins, ni filtros de
  dueño, ni funciones de consulta junto a él.
- Dos tablas son dos archivos aunque sean el mismo recurso (`wallets.repository.js`,
  `wallet-movements.repository.js`).
- Sin métodos custom. Lo que no es una lectura de una tabla es una función con Drizzle en el service.
- La proyección se escribe **en la ruta**, aunque se repita: `select: {name: true, picture: true}`.
  **Nunca** columnas de Drizzle en `select`. El repositorio jamás devuelve `password`.
- Relaciones: `join: {user: true}` (todas, sin `password`) o `join: {user: 'id email disabled'}`.

### Validación

- Un `<feature>.schema.js` por operación; el mismo schema valida en cliente y servidor.
- `import zod from 'zod'`, nunca `* as zod`.
- Zod descarta claves desconocidas: **no lo anules** (`passthrough`, `strict` a la ligera). Es media
  defensa contra inyección de filtros.
- **Filtros campo por campo. Nunca spread de los params en el `where`.**
- El `id` de un listado va sin `.catch()`: un id malformado es 400, no se descarta (si no, `findOne`
  devuelve una fila arbitraria).
- Listados parten de `listParams` (`@/utils/request-params.js`) y lo extienden.

### Autorización y Permisos

- Rol y dueño se comprueban en `server/permissions/`, **no** en la ruta ni en el service: cada hook
  lo declara para su método y su rol.
- Las rutas tampoco revalidan la sesión (`04.auth-guard.js` ya devolvió 401) ni condicionan sobre la
  forma de `context`: el perfil siempre está.
- **Los pines de propiedad (`{student: profile.id}`, `{user: …}`) salen siempre de la sesión, nunca de
  params**, y se quedan en la ruta: son el origen del dato, no una validación; y en los services, los
  predicados de concurrencia dentro de un `UPDATE`.
- Archivos: toda ruta de archivo recibida del cliente se verifica contra `temporal/<userId>/`.
  La key la arma el servidor.

Permisos gestionados con [`endpoint-permissions-kit`](https://www.npmjs.com/package/endpoint-permissions-kit) (pkit).
Un permiso es `rol::módulo::nombre` (`user::items::general`): el módulo es el path de la ruta y el
nombre, hoy, siempre `general`. Declararlo no se lo da a nadie: cada usuario guarda sus identificadores
en la tabla `permissions` y la sesión los trae.

Para agregar uno:

1. `server/permissions/<modulo>/<modulo>.permissions.js`: por rol, los métodos (`find`, `create`,
   `update`, `remove`) con sus campos permitidos y, si hace falta, un `hook` que valide dueño o regla.
2. Importarlo en `server/permissions/permissions.js`.
3. En la ruta, `{module: '<modulo>'}` en las opciones de `baseRoute`: el método sale del verbo HTTP.
4. Asignarlo a los usuarios existentes con un delta en `server/migrations/deltas/`.

Un campo que llega y no está declarado rechaza la request (`id`, `page`, `sort`… van siempre
permitidos). En `find`, pkit rechaza toda clave no declarada: `search`, `view`, `all` o `join` se declaran
junto a las columnas. Los `*.permissions.js` se registran por efecto del `import`: por eso `permissions/` está
en `moduleSideEffects` de Nitro, y sin eso Rollup los elimina del bundle en silencio.

### Middlewares

En orden: CORS → request-id → contexto de sesión → rate limit → guardia de auth.

- **request-id** concentra todo lo que identifica a la request (id, ip, user-agent y el payload del
  token ya verificado). Es la única lectura de `x-forwarded-for` / `x-real-ip` del server.
- **auth-core** separa las dos mitades: verificar la firma es síncrono y sin base (por eso corre en
  el middleware), y recién después se busca la fila de sesión y se arma el perfil.
- **auth-guard** exige sesión en todo `api/**` salvo público, oauth, webhooks y healthcheck.
- **Rate limit**: sin política por prefijo — hay sesión (llave = sesión) o no la hay (llave = hash
  de ip + user-agent). Cada una cuenta en **su propia tabla** DynamoDB (`rate-limits` y
  `public-rate-limits`): comparten estado entre instancias Lambda y **fallan abierto**, pero una
  avalancha anónima no puede desalojar ni contaminar el contador de las sesiones. El acceso va por
  `server/utils/dynamodb.js`, que expone una key por tabla (`rateLimits`, `publicRateLimits`) con
  un único método `enforce` que ya lleva adentro el nombre de la tabla, el cliente y el límite:
  quien llama solo pasa la llave. **Un registro por llave, un `UpdateItem` por request, sin
  condición ni lectura**: la ventana de 10 s es un atributo por bucket de tiempo (`w<epoch/10>`),
  la misma escritura borra el bucket anterior y fija el TTL de 24 h con `if_not_exists` (solo al
  crear). 100 requests por ventana (300 el público); la request que las supera hace la única
  segunda escritura: `banSeconds` acumula 5 min por reincidencia y `banUntil = now + banSeconds`,
  porque `UpdateExpression` no multiplica y la suma acumulada es la multiplicación. Los errores de
  DynamoDB suben sin tocar: el middleware falla abierto. El TTL es perezoso (DynamoDB borra hasta
  48 h después) y los buckets viejos quedan si el cliente pausa más de 10 s: decisiones
  conscientes. Se saltea en local, en
  `files/` (una pantalla se auto-banearía) y en los webhooks: lo que autentica un webhook es su verificación de extremo a
  extremo, no quién lo mandó ni con qué frecuencia. Lo único que conservan es el tope de body,
  porque el cuerpo se carga en memoria antes de que nadie pueda validarlo.
- **Logs**: una línea JSON por evento en la nube, plano en local. El contexto lo ponen solo las
  capas principales (el manejo de errores de `base-route` y el hook de errores de Nitro). Las
  alarmas de CloudWatch cuentan las líneas con `level: "error"`.

### Base de datos desde el service

- `.limit(1)` cuando esperás un registro, y desestructurá: `const [meeting] = await ...`.
- `.returning()` en todo `insert` / `update`.
- Operaciones que mueven dinero o estado compartido: transacción, y predicados de concurrencia en el
  `WHERE` del `UPDATE` (`status = 'pending'`), no leer-y-después-escribir.
- SQL raw solo si Drizzle no lo expresa; el porqué va en el commit, no en un comentario.

### Efectos laterales

- El server **no manda correos**: publica el evento con `server/utils/events.js` y la cloudtask hace
  el resto. Agregar un evento es agregar una key.
- Quien mueve dinero revisa el booleano que devuelve el publish.
- Logs con el logger, nunca `console`. El contexto lo ponen solo `base-route` y el hook de errores.
- Variables de entorno: `APP_ENV` para ramificar ambientes, **nunca `NODE_ENV`**. Cada app declara
  las suyas y no lee las de otra.

## App Frontend (`app/`)

SPA de los paneles. React puro sobre HTTP: sin Server Actions, `action()`, `useActionState` ni
`startTransition`.

### Pantalla

- `modules/<rol>/<feature>/page.jsx` + `resolvers.js` (siempre, aunque vacío) + su
  `<feature>.service.js`, registrada en el árbol de rutas de su rol.
- Componentes propios de la pantalla en su `components/`; reutilizables en `src/components/`.
- Separado por rol aunque apunte al mismo endpoint. **No se abstrae entre perfiles**; solo los campos
  de formulario se comparten.

### Módulos

```
app/src/modules/<rol>/<feature>/     pantalla + su service
server/modules/<feature>/            repository (lecturas) · schema (Zod) · service (escrituras)
```

Las tres capas del server: la ruta valida y autoriza, el service escribe y aplica reglas, el
repository lee. Ninguna ruta abre la base por su cuenta.

**`.repository.js` solo existe en `server/`**: en `app/` todo acceso al backend es un `.service.js`,
porque la abstracción es REST genérica, no una consulta. Los servicios de `app/` siguen separados
por rol aunque apunten al mismo path: el API resuelve la forma según la sesión.

### Datos y Servicios

- Toda llamada al API sale de un `*.service.js` construido con `service()`. Ninguna pantalla hace
  `fetch` propio.
- Leer al montar → `useResolver`. Formulario → `useForm`. Botón o item → `useMutation`.
- Nada de `useState` para campos de formulario; nada de `useEffect` que reaccione al resultado de
  una mutación.
- `onSuccess` presente se queda con el control: el hook no navega ni resetea detrás de él.
- Salir del documento (pasarela de pago, 302 de OAuth) va en `onSuccess` con `window.location`;
  `redirectTo` es solo ruta de react-router.
- Los hooks de mutación no comparten helper entre ellos: si algo se repite, se repite.

### Hooks de `app/`

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

## Base de datos (`packages/db`)

PostgreSQL (Neon) con Drizzle. UUID como PK y timestamps con zona horaria en todas las tablas. La
config de drizzle-kit vive en `packages/db/`, junto a los schemas y las migraciones generadas.

Aplica a `packages/db/src/schemas/**/*.table.js` y a las migraciones.

### Paquete

- Único lugar que declara `drizzle-orm`, `postgres`, `@neondatabase/serverless` y `drizzle-kit`. Los
  consumidores importan las re-exportaciones, siempre con extensión.

### Tablas

- Export en plural con sufijo `Table`, igual al archivo (`usersTable`).
- Toda tabla lleva `id` (uuid PK, `defaultRandom()`) y `createdAt`; `updatedAt` si se actualiza.
- Enums en `enums.js`; todo se reexporta desde `schemas.js`.
- Integridad en la base antes que en código: `notNull`, `unique`, FK y `check` donde apliquen.

### Columnas

- Fechas: `timestamp({mode: 'date', withTimezone: true})`, sin excepciones. Nunca `mode: 'string'`
  ni `timestamp()` pelado.
- FK en singular camelCase, **nunca** con sufijo `Id` (`user`, no `userId`).
- FK siempre con `onDelete` y `onUpdate` explícitos:

| Relación | `onDelete` | `onUpdate` |
|---|---|---|
| Obligatoria (`.notNull()`) | `cascade` | `cascade` |
| Opcional (nullable) | `set null` | `cascade` |
| Integridad crítica | `restrict` | `cascade` |

### Migraciones

- Esquema: `bun run drizzle:migrate:generate` y `bun run drizzle:migrate:apply`.
- **Nunca edites una migración existente**; si quedó mal, cambiá el schema y generá otra.
- Datos: deltas en `server/migrations/deltas/`.

## Cloud tasks (pub/sub)

Eventos de dominio por SQS → Lambda. En local la cola vive en floci y los handlers los corre un
único consumidor **declarativo**: cada handler se ata a su cola en una línea, sin barrido de
carpetas. Si el handler lanza, el mensaje no se borra y SQS lo reentrega.

El server publica con `server/utils/events.js`, que expone **un evento por key** para que el nombre
de la tarea se escriba una sola vez. Nunca lanza, pero devuelve si el mensaje salió. Por ejemplo:
`email-account-manager` (todos los correos de cuenta, una cola discriminada por `detail.action`) y
tareas en background para procesamiento asíncrono desacoplado.

**El server no manda correos.** No hay cliente de mail ni templates en `server/`: publica el evento
y la task emite el token, lo escribe en `account_tokens` y manda el correo. `accountTokensService`
quedó solo con `verify` y `revoke`.

Los payloads son planos, cada task carga su propio `.env` y bundlea su propio `dist`, y las de
correo llevan su copia del cliente de mail y de sus templates: **no comparten código con el
server**. Tareas críticas como `email-account-manager` sí importan `@proyecto/db` (conexión + schemas):
escriben `account_tokens`, y un nombre de columna copiado a mano se desincroniza sin avisar. Sus `.env`
se cargan en un `env.ts` que se importa primero, porque `@proyecto/db/db.js` elige driver al importarse.
El nombre de la cola y la forma del mensaje tienen que coincidir con lo desplegado, y **el
desajuste no avisa**: un nombre mal armado se pierde en el catch del publish y un payload incompleto
revienta dentro de la Lambda. Agregar un evento es agregar una key. Detalle en `cloudtasks/README.md`.

## Constantes

Un archivo por recurso (no por campo), con los mapas derivados de su array de options — nunca
escritos dos veces. El server guarda **solo valores**: nada de etiquetas, colores ni clases, porque
el server no pinta. Una constante que usa un solo módulo vive en ese módulo.

## Landing

Contenido estático de marketing. **El reparto con `app/` no se solapa: la landing capta, la app
maneja la sesión.** Acá vive solo el alta (un modal); login y recuperación de contraseña viven en la
app, con un formulario unificado para los roles.

Los modales son una isla React montada una vez en el layout; el estado vive solo en la query
string, sin context. `landing/` no tiene tests: ESLint la cubre, pero un import colgado solo lo
atrapa el build.

## Entorno

Cada app declara sus variables en su propio módulo y **no lee el de otra**; los dominios se
llaman igual en las aplicaciones. La duplicación es la regla, no un descuido. Los valores locales están en
los `.env.local` versionados; en la nube, en la consola de cada Lambda y de Amplify.

Variables comunes que se mantienen en los entornos:
- `DATABASE_URL`: Conexión principal a la base de datos PostgreSQL.
- `IS_LOCAL`: Bandera booleana para alternar comportamiento local vs. cloud.
- `APP_ENV`: Variable de ambiente del proyecto (`local`, `staging`, `production`). **No uses `NODE_ENV`**
  para ramificar, que las herramientas de build lo fijan en `production` y no distingue ambientes.

Derivados, no variables: el `redirect_uri` de OAuth sale del dominio de la app (y es su propia
allowlist), y la URL de cada cola se resuelve por nombre.

## Alias

`@/` apunta a `app/src/` en la SPA y a la raíz de `server/` en el API (config del runtime +
`jsconfig.json` para el editor). `cloudtasks/` y `landing/` no tienen alias. Lo único que se importa
por paquete es `packages/` (`@proyecto/db` / `@brunerkids/db`), siempre con extensión.

## Seguridad

Aplica a todo el monorepo. No negociable.

- Nunca token en query, `localStorage` ni header `Authorization`: cookie httpOnly y nada más.
- Nunca confiar en ids de dueño, roles, rutas de archivo ni montos que vengan del cliente.
- Nunca devolver `password`, tokens ni secretos, tampoco dentro de un join.
- Nunca loguear credenciales, cookies ni payloads completos de pago.
- Todo endpoint privado nuevo nace con su módulo de permisos; uno público va en `api/public/**` con
  justificación.
- Todo input cruza un schema Zod antes de tocar la base.

## Tests

Aplica a `app/` y `server/`.

- Todo cambio con lógica (rama, regla de negocio, permiso, dinero) deja un test que falla si la
  lógica se rompe. Un one-liner trivial no necesita test.
- Tests en `__tests__/` junto al código. Probar comportamiento observable (respuesta, fila escrita),
  no detalles internos.
- Permisos: probar el caso permitido **y** el rechazado (otro rol, otro dueño, campo no declarado).
- `bun run lint` y `bun run test` en verde antes de dar algo por terminado.

## Deploy

CI en todas las ramas (lint · test · build · e2e) y promotions **manuales** de deploy: server y
cloudtasks van a Lambda de imagen, app y landing a Amplify, y las migraciones (esquema y datos)
tienen su propia promotion. La rama decide el ambiente.

Los scripts publican **solo código**: la infraestructura y su configuración se crean una vez a mano
y después se administran en la consola. Rollback: la Lambda queda versionada por commit; en Amplify,
*Redeploy this version*. Detalle en `infrastructure/README.md` y `.semaphore/README.md`.

## Agentes

Aplica a todo agente que modifique el repositorio.

1. **Leer antes de escribir.** Leé la guía de arquitectura del repo y el código que vas a tocar.
   Buscá un módulo hermano (`meetings`, `education-levels`) y copiá su forma exacta antes de inventar
   una.
2. **Seguir el flujo completo.** Un cambio de API toca ruta, schema, permisos, service/repository,
   `service()` de la SPA y posiblemente un delta. Recorré la cadena de punta a punta.
3. **Bug = causa raíz.** Antes de editar una función compartida, buscá todos sus consumidores. Un
   arreglo en el lugar compartido es mejor que un parche en cada llamador.
4. **Diff mínimo y en alcance.** Hacé lo pedido. Sin refactors, renombres ni "mejoras" no pedidas;
   si ves algo, mencionalo.
5. **Sin archivos nuevos que no hagan falta.** Ni README, ni docs, ni helpers, ni Dockerfiles, ni
   configs. Ninguna dependencia nueva sin que se pida.
6. **No toques lo reservado**: migraciones existentes, `CLAUDE.md`, `AGENTS.md`, límites de ESLint,
   `.env*` versionados, infraestructura en la nube.
7. **No silencies al verificador.** Nada de `eslint-disable`, `.skip`, ni bajar una aserción para que
   pase.
8. **Git solo si se pide.** Sin `add`, `commit`, `push` ni cambios de rama por iniciativa propia.
9. **Verificá y reportá honesto.** Corré lint y tests del workspace tocado. Si algo falla o quedó sin
   hacer, decilo con el output; no lo presentes como terminado.
10. **Preguntá solo lo que es decisión del usuario.** Lo que resuelve el código, el repo o una
    convención existente, lo resolvés vos.

### Checklist antes de entregar

- [ ] ¿Reusé wrappers (`baseRoute`, `repository()`, `service()`, hooks) en vez de reimplementar?
- [ ] ¿Cada capa hace solo lo suyo? ¿La ruta no importa la base?
- [ ] ¿Filtros campo por campo, dueño desde la sesión, permisos declarados?
- [ ] ¿Nombres alineados en API, permisos y SPA?
- [ ] ¿Sin `let`, sin `else` tras `return`, sin anidación > 2, sin código muerto?
- [ ] ¿Errores como `{error, status}` en español?
- [ ] ¿Lint y tests en verde?
- [ ] ¿El diff contiene solo lo pedido?
