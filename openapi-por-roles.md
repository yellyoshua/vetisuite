# OpenAPI por rol

Generá la especificación OpenAPI 3.1 de las rutas que existen hoy en el API de Veti Suite, partida por quien las usa. No diseñes endpoints nuevos. No modifiques el API.

## Proyecto

Veti Suite es un monorepo Bun. El API vive en `server/` (Nitro / h3). Cada archivo `server/api/<recurso>.<verbo>.js` es una ruta plana bajo `/api/`. El verbo del archivo es el método HTTP. El mismo string del recurso es el módulo de permisos.

| Archivo | Método | Acción pkit | Path |
|---|---|---|---|
| `server/api/clients.get.js` | GET | `find` | `/api/clients` |
| `server/api/clients.post.js` | POST | `create` | `/api/clients` |
| `server/api/clients.put.js` | PUT | `update` | `/api/clients` |
| `server/api/clients.delete.js` | DELETE | `remove` | `/api/clients` |
| `server/api/public/auth/signin.post.js` | POST | — | `/api/public/auth/signin` |
| `server/api/oauth/vetisuite/token.post.js` | POST | — | `/api/oauth/vetisuite/token` |
| `server/api/files/[...path].get.js` | GET | `find` | `/api/files/{path}` |

`files` es la única ruta con parámetro de path. El resto no usa `/:id`: el id, cuando existe, es un campo de la operación.

Leé antes de escribir:

- `server/AGENTS.md` (rutas planas, `baseRoute`, permisos)
- `server/permissions/README.md`
- `server/constants/roles.js`
- `server/permissions/permissions.js` y cada `server/permissions/<modulo>/<modulo>.permissions.js`
- `server/core/base-route.js`
- `server/middleware/01.public-path.js`
- `server/utils/session-cookie.js`
- el Zod de `server/modules/**/*.schema.js` y el schema declarado en la propia ruta cuando no hay archivo de schema

## Entregables

Solo estos cuatro archivos. OpenAPI 3.1.0, YAML:

- `docs/openapi/superadmin.yaml`
- `docs/openapi/owner.yaml`
- `docs/openapi/employee.yaml`
- `docs/openapi/public.yaml`

No escribas otro archivo en el repo. El inventario de trabajo no se commitea. No toques `server/`, `client/`, `packages/`, `permissions/` ni este prompt.

Cada documento:

```yaml
openapi: 3.1.0
info:
  title: <rol>
  version: "1.0.0"
```

`title` es el rol del archivo: `superadmin`, `owner`, `employee` o `public`. Cada operación lleva `tags: [<ese rol>]`. No agregues `servers`. No agregues `summary` ni `description` en operaciones, parámetros ni propiedades.

## Quién entra en cada archivo

Los roles de cuenta son solo `superadmin`, `owner` y `employee` (`server/constants/roles.js`). pkit declara, por módulo y por rol, acciones con `enabled` y `properties`. Una acción entra en el YAML de un rol solo si ese rol la tiene `enabled: true`.

El mismo path puede estar en más de un archivo. Cada archivo lleva las `properties` de su rol. Ejemplo real: `clients` está en owner y en employee; `clients` `remove` está solo en owner, así que `DELETE /api/clients` no aparece en `employee.yaml`.

`public.yaml` no es un rol pkit. Cubre las rutas que existen bajo `/api/public/` y `/api/oauth/`. En ese archivo el rol del documento es `public`. No las registres en pkit.

`/api/healthcheck` existe y es público. No lo agregues. No inventes `/api/webhooks/` si no hay archivos ahí.

## Qué lleva cada operación

La definición del permiso manda sobre el Zod, los hooks y la respuesta del handler.

1. Los nombres de campos salen de `properties` de esa acción y ese rol. Nada más.
2. Tipo, `required`, enum, formato y mínimos salen del Zod que valida esa ruta. Si el nombre está en el permiso y no está en el Zod, no lo pongas y anótalo en el reporte. No le inventes un tipo.
3. Un campo que está en el Zod y no está en `properties` no entra. El permiso pesa más.
4. Las claves que pkit acepta siempre (`id`, `limit`, `page`, `sort`, `perPage`, `order`) entran solo si esa acción las lista en `properties`.
5. No documentes el cuerpo de respuesta. No documentes los `404` ni `403` de los hooks (`assertOrganizationClient`, `assertNotOwnAccount` y el resto).
6. `properties: []` es una operación sin parámetros y sin `requestBody` (`auth-logout`, `profile-email-verification`).

Dónde va cada campo, según `extractRequestData` en `server/core/base-route.js`:

- GET y DELETE: query (`parameters`, `in: query`).
- POST y PUT: `requestBody` `application/json`, schema con esas propiedades.
- Si la ruta lee `multipart/form-data`, el body es multipart y los campos siguen siendo los de `properties`, con el tipo que diga el Zod. No declares un upload binario si el API recibe un string.

En `public.yaml` no hay `properties` de pkit. El schema es el objeto Zod de esa ruta, completo, con la misma regla de query vs body. Sin security scheme.

En los tres YAML de cuenta, la seguridad es la cookie de sesión y nada más. Nombre y flags salen de `server/utils/session-cookie.js`: cookie `vetisuite_session`, `httpOnly`, `sameSite: lax`. No hay header `Authorization`. Declarala una vez en `components.securitySchemes` y aplicala a todas las operaciones de ese archivo.

`/api/files/{path}`: `path` es el segmento de la URL, obligatorio. Las `properties` del permiso, si las hay, siguen yendo a query. Hoy esa acción tiene `properties: []`.

Schemas en línea en cada operación. El único `components` compartido es el security scheme de la cookie. No armes una librería de schemas reutilizables.

`operationId`: `<modulo>.<accion>` con la acción pkit (`clients.find`, `clients.remove`). En `public`, `<path-con-guiones>.<verbo-http>` (`public-auth-signin.post`).

## Reglas de ejecución

Este encargo escribe specs. No cambia arquitectura ni agrega funcionalidad del producto. No invoques la skill `pro-architecture`. Aplicá solo este recorte:

- No inventes rutas, métodos, roles ni campos.
- Descripción de operación y de propiedad: no las escribas.
- Sin placeholders, sin `TODO`, sin esquemas a medias, sin “el resto igual”.
- Sin comentarios en los YAML.
- No modifiques código del API ni permisos.
- Si un dato no se puede verificar contra el archivo de permiso o contra el Zod, no lo completes: va al reporte final.
- El archivo tiene que coincidir con el código de esta rama, no con el README si los dos se contradicen. El README orienta; la fuente es el `.permissions.js` y el Zod.

## Skills

Hay un catálogo global de skills (diseño, AWS, GSAP, video, Expo, seguridad ofensiva, documentos). Ninguna de esas aplica acá. No las invoques.

Al empezar, leé e invocá solo estas dos:

- `full-output-enforcement` — los cuatro YAML salen enteros, sin cortes ni huecos.
- `ponytail` — cada campo existe porque el permiso (o, en `public`, el Zod) ya lo justifica. Sin secciones de más.

## Subagentes

No escribas los YAML en una sola pasada.

1. Inventario secuencial, un solo agente. Recorre `server/api/`, `server/permissions/` y los Zod de `server/modules/` más los schemas inline de las rutas. Produce una lista interna, no un archivo del repo, con una fila por ruta: archivo, método, path, módulo, y por cada rol `enabled` más `properties`, el schema Zod que la valida, y si es pública. Excluye healthcheck. No fusiones roles en una sola fila de campos.
2. Con esa lista cerrada, cuatro escritores en paralelo. Cada uno escribe un solo YAML y vuelve a leer el permiso y el Zod de las filas de su rol. No hereda campos de otro rol.
   - `docs/openapi/superadmin.yaml`
   - `docs/openapi/owner.yaml`
   - `docs/openapi/employee.yaml`
   - `docs/openapi/public.yaml`
3. No lances un quinto agente para fusionar. Cada escritor es dueño de su archivo.

El agente padre, al recibir los cuatro, comprueba: toda acción `enabled: true` está en su archivo, ninguna acción ausente o `enabled: false` se coló, y ningún campo sobra respecto de `properties`. Corrige el YAML en el escritor de ese archivo si algo no cierra.

## Reporte al terminar

Después de los cuatro archivos, lista solo lo que no pudiste verificar:

- ruta sin módulo de permisos y que no sea pública
- nombre en `properties` que no está en el Zod
- ruta cuyo schema no encontraste
- contradicción entre el archivo de la ruta y el permiso

Si esa lista está vacía, dilo. No declares el trabajo terminado mientras un escritor no haya escrito su archivo.
