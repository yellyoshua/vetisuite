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
7. **Duplicar entre apps es la regla.** `client/`, `landing/`, `server/` y `cloudtasks/` no
   comparten código salvo `@vetisuite/database`. Si dos apps necesitan lo mismo, se copia.

## Monorepo

Bun workspaces:

```
client/      SPA de los paneles (Vite + React Router) — app.dominio.com
server/      API Nitro (h3) — api.dominio.com
landing/     marketing estático (Astro) — dominio.com
packages/    paquetes Node/Bun: database (Drizzle: schemas, migraciones y conexión)
cloudtasks/  handlers SQS → Lambda (uno por carpeta, con su build y su .env)
infrastructure/  un deploy por componente
.semaphore/  CI y promotions
seeds/       fixtures de la base
```

**`packages/` es código Node/Bun.** Todo lo demás (constantes, mail, auth, logger, servicios de
dominio) vive en `server/`; `client/` y `landing/` tienen su propia copia de lo que muestran y
**nunca importan de `packages/`**: si dos apps necesitan lo mismo, se duplica.

## Guías por proyecto

Este archivo tiene solo las reglas que aplican a todo el monorepo. Antes de revisar o modificar un
proyecto, leé también su guía:

| Si vas a revisar o modificar… | Leé |
|---|---|
| `server/` (API Nitro) | `server/AGENTS.md` |
| `client/` (SPA de los paneles) | `client/AGENTS.md` |
| `landing/` (marketing) | `landing/AGENTS.md` |
| `cloudtasks/` (handlers SQS → Lambda) | `cloudtasks/AGENTS.md` |
| `packages/database/` (schemas, migraciones, conexión) | `packages/database/AGENTS.md` |

Un cambio que cruza proyectos (por ejemplo, un endpoint nuevo que consume la SPA) carga la guía de
cada proyecto que toca. No cargues la guía de un proyecto que no vas a tocar.

## JavaScript

Aplica a `client/`, `server/`, `landing/` y `cloudtasks/`.

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
- **Imports con extensión** (`.js`), y por alias: `@/` en `client/` y `server/`. `packages/` solo por
  paquete (`@vetisuite/database/...`).

## Nombres

Aplica a todo el monorepo.

### Archivos

| Tipo | Patrón |
|---|---|
| General | kebab-case |
| Schema Zod | `<feature>.schema.js` |
| Servicio | `<feature>.service.js` |
| Constantes | `constants/<recurso>.js` — un archivo por recurso, no por campo |
| Test | `__tests__/<archivo>.test.js(x)` junto al código |

### Código

- camelCase para variables, funciones y métodos; PascalCase para componentes.
- Funciones anónimas siempre asignadas a un nombre.
- La variable sigue al archivo: `meetingsRepository` en `server/`, `meetingsService` en `client/`.
- Mapas de dominio: `<entidad>Options` (array) y `<entidad>Map` / `<entidad>Values` **derivados** del
  array. Nunca escritos dos veces.

## Constantes

Un archivo por recurso (no por campo), con los mapas derivados de su array de options — nunca
escritos dos veces. Una constante que usa un solo módulo vive en ese módulo.

## Fechas y zona horaria

Aplica a todo el monorepo. La clínica manda: su zona es `organizations.timezone` (IANA, default `'UTC'`).

- **Instantes** (lo que ya pasó, vencimientos técnicos): `timestamptz`, en UTC.
- **Citas y fechas futuras**: hora de pared en `timestamp` sin zona
  (`timestamp({mode: 'string'})`) más una columna `timezone` copiada de la organización al crear y al
  reprogramar. Nunca se acepta del client. El zod de escritura acepta
  `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/` y rechaza `Z` y offsets. Nunca pasa por `new Date()`.
- **Días**: `date({mode: 'string'})`, sin zona.
- **"Hoy" y "ahora"** se calculan siempre en la zona de la organización (`Intl.DateTimeFormat` con
  `timeZone`), nunca con `toISOString().slice(0, 10)`. Zona faltante o inválida es un error, no `'UTC'`.
- **Server**: la zona viaja en el claim de sesión (`authCore.session.claim` → `organization.timezone`) y
  `baseRoute` la expone plana en `context.timezone`. Las rutas la pasan a los services; nadie consulta
  `organizations` para obtenerla.
- **Mostrar**: instantes en la zona del navegador; registros de hora de pared en la zona del registro,
  con la etiqueta de la zona si difiere de la del navegador.

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

Lo único que se importa por paquete es `packages/` (`@vetisuite/database`), siempre con extensión.

## Seguridad

Aplica a todo el monorepo. No negociable.

- Nunca token en query, `localStorage` ni header `Authorization`: cookie httpOnly y nada más.
- Nunca confiar en ids de dueño, roles, rutas de archivo ni montos que vengan del cliente.
- Nunca devolver `password`, tokens ni secretos, tampoco dentro de un join.
- Nunca loguear credenciales, cookies ni payloads completos de pago.

## Tests

Aplica a `client/` y `server/`.

- Todo cambio con lógica (rama, regla de negocio, permiso, dinero) deja un test que falla si la
  lógica se rompe. Un one-liner trivial no necesita test.
- Tests en `__tests__/` junto al código. Probar comportamiento observable (respuesta, fila escrita),
  no detalles internos.
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
- [ ] ¿Sin `let`, sin `else` tras `return`, sin anidación > 2, sin código muerto?
- [ ] ¿Errores como `{error, status}` en español?
- [ ] ¿Lint y tests en verde?
- [ ] ¿El diff contiene solo lo pedido?
