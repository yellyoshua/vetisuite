---
trigger: always_on
---

# Server (`server/`)

## Tres capas, y nada más

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

## Repositorios

- Un archivo, un repositorio, `export default` y **nada más**: ni columnas, ni joins, ni filtros de
  dueño, ni funciones de consulta junto a él.
- Dos tablas son dos archivos aunque sean el mismo recurso (`wallets.repository.js`,
  `wallet-movements.repository.js`).
- Sin métodos custom. Lo que no es una lectura de una tabla es una función con Drizzle en el service.
- La proyección se escribe **en la ruta**, aunque se repita: `select: {name: true, picture: true}`.
  **Nunca** columnas de Drizzle en `select`. El repositorio jamás devuelve `password`.
- Relaciones: `join: {user: true}` (todas, sin `password`) o `join: {user: 'id email disabled'}`.

## Validación

- Un `<feature>.schema.js` por operación; el mismo schema valida en cliente y servidor.
- `import zod from 'zod'`, nunca `* as zod`.
- Zod descarta claves desconocidas: **no lo anules** (`passthrough`, `strict` a la ligera). Es media
  defensa contra inyección de filtros.
- **Filtros campo por campo. Nunca spread de los params en el `where`.**
- El `id` de un listado va sin `.catch()`: un id malformado es 400, no se descarta (si no, `findOne`
  devuelve una fila arbitraria).
- Listados parten de `listParams` (`@/utils/request-params.js`) y lo extienden.

## Autorización

- Rol y dueño se comprueban en `server/permissions/`, **no** en la ruta ni en el service. La ruta
  declara `{module: '<modulo>'}` y cada hook valida lo suyo.
- Permiso = `rol::módulo::nombre`. Agregar uno: archivo de permisos → import en `permissions.js` →
  `{module}` en la ruta → delta en `server/migrations/deltas/` para usuarios existentes.
- En `find`, pkit rechaza toda clave no declarada: `search`, `view`, `all` o `join` se declaran junto
  a las columnas.
- **Los pines de propiedad (`{student: profile.id}`, `{user: …}`) salen siempre de la sesión, nunca de
  params**, y se quedan en la ruta: son el origen del dato, no una validación.
- Archivos: toda ruta de archivo recibida del cliente se verifica contra `temporal/<userId>/`.
  La key la arma el servidor.

## Base de datos desde el service

- `.limit(1)` cuando esperás un registro, y desestructurá: `const [meeting] = await ...`.
- `.returning()` en todo `insert` / `update`.
- Operaciones que mueven dinero o estado compartido: transacción, y predicados de concurrencia en el
  `WHERE` del `UPDATE` (`status = 'pending'`), no leer-y-después-escribir.
- SQL raw solo si Drizzle no lo expresa; el porqué va en el commit, no en un comentario.

## Efectos laterales

- El server **no manda correos**: publica el evento con `server/utils/events.js` y la cloudtask hace
  el resto. Agregar un evento es agregar una key.
- Quien mueve dinero revisa el booleano que devuelve el publish.
- Logs con el logger, nunca `console`. El contexto lo ponen solo `base-route` y el hook de errores.
- Variables de entorno: `APP_ENV` para ramificar ambientes, **nunca `NODE_ENV`**. Cada app declara
  las suyas y no lee las de otra.
