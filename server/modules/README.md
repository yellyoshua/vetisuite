# `modules/` — lógica de negocio por dominio

Un módulo = un dominio. Las rutas (`routes/`) no contienen lógica: leen la
petición, llaman al servicio del módulo y devuelven el resultado.

```
routes/clients/index.get.ts   →  modules/clients/service.ts
                                   └→ modules/clients/repository.ts
                                        └→ drizzle/db.ts + drizzle/clients/clients.table.js
```

`db` solo se importa desde un `repository.ts`. Un `service.ts` que lo importe se
está saltando su propio repositorio.

## Nomenclatura

Carpetas en **kebab-case** e **inglés**, como el resto del código (el español es
solo para el texto que ve el usuario).

**Módulos simples** — un sustantivo en plural, el nombre del recurso:

```
modules/users/
modules/clients/
modules/patients/
modules/appointments/
modules/inventory/
```

**Módulos compuestos** — un proceso o una vista que cruza recursos, no un
recurso nuevo. El nombre describe la operación completa:

```
modules/cancelled-appointments/    # citas canceladas: política de cancelación, reintegros, avisos
modules/upload-massive-clients/    # carga masiva: parseo, validación por fila, informe de errores
```

Un módulo compuesto **importa** los módulos simples que necesita
(`upload-massive-clients` usa el servicio de `clients` para insertar). Lo que
nunca hace es saltarse el servicio y hablar directo con el repositorio ajeno: si
`clients` valida un teléfono, la carga masiva valida igual, gratis.

Entre módulos simples no debería haber imports cruzados; si dos se necesitan
mutuamente, la lógica que comparten es un módulo compuesto o pertenece a `core/`.

## Archivos dentro de un módulo

| Archivo | Responsabilidad |
|---|---|
| `repository.ts` | Consultas drizzle. Sin reglas de negocio: recibe y devuelve filas. |
| `service.ts` | Reglas de negocio, validación, orquestación. Lanza `ApiError` cuando el dominio dice que no. |

Solo eso mientras no haga falta más. Cuando un módulo crezca, añade lo que
realmente necesite (`schema.ts` de validación, `mapper.ts` para el DTO que ve el
client) — no lo crees vacío por simetría.

## Módulo de referencia: `clients/`

Es el único cableado de punta a punta. Copia su forma para el siguiente:

- `repository.ts` — `findMany` (con búsqueda por nombre y `count` en la misma
  ida), `findById`, `insert`. Los tipos salen de `$inferSelect` / `$inferInsert`,
  no se redeclaran a mano.
- `service.ts` — valida nombre y teléfono **antes** de tocar la base y lanza
  `badRequest` / `notFound` de `core/http.ts`.
- Rutas: `routes/clients/index.get.ts`, `index.post.ts`, `[id].get.ts`.

Comprobación rápida sin base de datos (la validación corre antes de la query):

```sh
bun run build && node .output/server/index.mjs &
curl -X POST localhost:3000/clients -H 'content-type: application/json' -d '{"name":"A","phone":"099"}'
# → 400 {"statusMessage":"El nombre del cliente es obligatorio."}
```

Los demás módulos (`users`, `appointments`, `cancelled-appointments`,
`upload-massive-clients`…) se crean **cuando se implementan**. Carpetas vacías
esperando código no documentan nada: la convención está aquí.
