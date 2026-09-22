# AGENTS.md — `server/`

Reglas del API (`server/`). Complementa `/AGENTS.md`, que tiene las reglas de todo el monorepo:
leé ambos.

## Monorepo

`server/permissions` es el registro de autorización del backend: los
hooks de cada módulo consultan la base con Drizzle mediante `@vetisuite/database`.

## Nombres

### Archivos

| Tipo | Patrón |
|---|---|
| Ruta del API | `server/api/<recurso>.<verbo>.js` — un segmento kebab-case, el verbo define el método |
| Repositorio (solo `server/`) | `<feature>.repository.js` — uno por tabla |
| Permisos | `server/permissions/<modulo>/<modulo>.permissions.js` |

### Código

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

> Ver `client/AGENTS.md` § Ciclo de una request, pasos 1–4.

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

> Ver `cloudtasks/AGENTS.md` § Cloud tasks (pub/sub).

- Quien mueve dinero revisa el booleano que devuelve el publish.
- Logs con el logger, nunca `console`. El contexto lo ponen solo `base-route` y el hook de errores.
- Variables de entorno: `APP_ENV` para ramificar ambientes, **nunca `NODE_ENV`**. Cada app declara
  las suyas y no lee las de otra.

## Cloud tasks (pub/sub)

El server publica con `server/utils/events.js`, que expone **un evento por key** para que el nombre
de la tarea se escriba una sola vez. Nunca lanza, pero devuelve si el mensaje salió. Por ejemplo:
`email-account-manager` (todos los correos de cuenta, una cola discriminada por `detail.action`) y
tareas en background para procesamiento asíncrono desacoplado.

**El server no manda correos.** No hay cliente de mail ni templates en `server/`: publica el evento
y la task emite el token, lo escribe en `account_tokens` y manda el correo. `accountTokensService`
quedó solo con `verify` y `revoke`.

> Ver `cloudtasks/AGENTS.md` § Cloud tasks (pub/sub).

## Constantes

El server guarda **solo valores**: nada de etiquetas, colores ni clases, porque
el server no pinta.

## Alias

`@/` apunta a la raíz de `server/` en el API (config del runtime + `jsconfig.json` para el editor).

## Seguridad

- Todo endpoint privado nuevo nace con su módulo de permisos; uno público va en `api/public/**` con
  justificación.
- Todo input cruza un schema Zod antes de tocar la base.

## Tests

- Permisos: probar el caso permitido **y** el rechazado (otro rol, otro dueño, campo no declarado).

## Agentes

### Checklist antes de entregar

- [ ] ¿Cada capa hace solo lo suyo? ¿La ruta no importa la base?
- [ ] ¿Filtros campo por campo, dueño desde la sesión, permisos declarados?
- [ ] ¿Nombres alineados en API, permisos y SPA?
