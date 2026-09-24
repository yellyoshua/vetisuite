# Zona horaria de la clínica: fechas en UTC y fechas futuras en hora de pared

Este prompt es para un agente de IA que trabaja en el monorepo **Veti Suite** (`/Users/home/projects/vetisuite`).
Las decisiones de este documento ya se tomaron con el usuario (sesión del 2026-09-23). **No las vuelvas a discutir.**
Si algo no está cubierto aquí ni en las guías del repo, pregunta antes de decidir.

---

## 1. Objetivo

Pedido original del usuario:

> Asegurar que todas las fechas se guarden en UTC y se muestren en la zona horaria del cliente. Las fechas
> futuras, como el agendamiento, se guardan en un formato sin zona horaria (sin UTC y sin offset). Como dato
> extra se guarda la región, por ejemplo `"America/Guayaquil"`, en el perfil de la clínica bajo la key
> `timezone`. El valor por defecto es `UTC`. Ese valor se usa para guardar las fechas y horas futuras, y esos
> registros llevan también la property `timezone` con el valor del perfil de la clínica. La clínica manda en
> la zona horaria de todos los registros: agendas, alertas, fechas de correos, etc.

Principio rector: **la clínica manda.** Hay una sola fuente de zona horaria por organización. Los instantes
del pasado se guardan en UTC. Las citas se guardan en hora de pared, junto con la zona en que se agendaron.

---

## 2. Estado actual (verificado el 2026-09-23; vuelve a comprobarlo antes de editar)

- Todas las columnas de fecha y hora en `packages/database/src/schemas/**` son
  `timestamp({mode: 'date', withTimezone: true})`, es decir `timestamptz`. **La parte "guardar en UTC" ya se
  cumple en la DB.**
- Las fechas sin hora ya son `date({mode: 'string'})`: `patients.birthDate`, `patients_vaccination.nextDueAt`,
  `products.expiry`, `portals_field.minDate` y `portals_field.maxDate`.
- `organizations` (`organizations/organizations.table.ts`) solo tiene `id`, `name`, `slug` y fechas.
  **No tiene `timezone`.**
- `appointments_availability.timezone` (`text not null`) existe. Lo editan owner y employee vía
  `appointments-availability.put`. El client lo lee y escribe en
  `client/src/modules/employee/appointments-clinics/appointments-clinics-edit/resolvers.ts`. También aparece
  en `client/src/modules/employee/settings/settings-edit/resolvers.ts` y en
  `client/src/constants/appointments-clinics.ts`.
- `appointments.startsAt` es `timestamptz`. Tiene un índice único parcial `appointments_vet_starts_at_unique`
  sobre `(vet, startsAt)`. `appointments.repository.js` expone `date` como `DATE(startsAt)`.
- **No existe escritura de citas.** Solo hay `appointments.get.js` y `appointments-count.get.js`.
- `organizations.get.js` es solo para `superadmin` y lista todas las organizaciones.
- El módulo `clinic` son **historias clínicas** (consultas, recetas, laboratorio), no el perfil.
- Cuatro sitios calculan "hoy" o "ahora" en UTC:
  - `server/modules/dashboard-billing/dashboard-billing.service.js:8`
  - `server/modules/dashboard-administration/dashboard-administration.service.js:26`
  - `server/modules/clinic/clinic.service.js:295` (`isToday`)
  - `server/modules/dashboard-care/dashboard-care.service.js:6`
- `cloudtasks/vaccine-due-reminder/find-due-patients.ts` es un stub: recibe `_clinicId` y `_dueBefore: Date`.
- `client/src/lib/date.ts` formatea con `Intl.DateTimeFormat('es-EC')` sin `timeZone`. Hoy muestra todo en la
  zona del navegador.
- `CLAUDE.md` está desactualizado respecto del client: todavía lo describe como una demo con zustand. Manda el
  código y `client/AGENTS.md`.

---

## 3. Decisiones cerradas

1. **La fuente vive en `organizations.timezone text not null default 'UTC'`.** Se elimina
   `appointments_availability.timezone`. Tener dos fuentes termina en desincronización.
2. **Formato de las fechas futuras:** `timestamp without time zone` (hora de pared) más una columna `timezone`
   en el registro. Esa columna es una **copia inmutable** de `organizations.timezone` tomada al crear. Al
   reprogramar se vuelve a copiar la zona vigente de la organización. Si la clínica cambia de zona, las citas
   ya agendadas conservan la suya.
3. **Solo `appointments.startsAt` se convierte.**
   - Las columnas `date` se quedan como están, sin columna `timezone`. Su "hoy" se calcula con la zona de la
     organización.
   - Los vencimientos técnicos (`sessions.expiresAt`, `account_tokens.expiresAt`, `oauth_codes.expiresAt`,
     `users.bannedUntil`) y el resto de `timestamptz` siguen en UTC.
   - Verifica que ningún código arme instantes a partir de strings locales.
4. **Visualización:**
   - Los instantes pasados se muestran en la zona del **navegador**.
   - Las citas y fechas futuras se muestran en la zona **del registro** (la de la clínica). Si difiere de la
     del navegador, se agrega la etiqueta de la zona.
5. **Datos existentes:** convierte con `"startsAt" AT TIME ZONE <tz>`, donde `<tz>` es
   `appointments_availability.timezone` de la organización si existe y `'UTC'` si no. Rellena
   `appointments.timezone` y `organizations.timezone` con el mismo valor. Recrea
   `appointments_vet_starts_at_unique`. Elimina `appointments_availability.timezone` **después** del backfill.
6. **Alertas y correos:** incluye `cloudtasks/vaccine-due-reminder`. **No crees** un módulo de alertas. Documenta
   la regla en `AGENTS.md` y en `docs/technical/` para los módulos futuros.
7. **Validación:** `timezone` debe ser una zona IANA válida, contrastada con `Intl.supportedValuesOf('timeZone')`
   (más `'UTC'`), en el zod del server.
8. **Rutas nuevas `organization.get` y `organization.put`**, en singular: solo la organización propia
   (`context.profile.organization`), y solo `timezone` es escribible.
   - No toques `organizations.get` (superadmin) ni `clinic`.
   - `appointments-availability.put` **no** escribe en dos tablas.
9. **Roles:** owner y employee leen y editan el timezone, igual que availability hoy. No se crea ninguna
   pantalla en el panel owner.
10. **Citas: solo lectura.** No crees `appointments.post` ni `appointments.put`. La regla de escritura queda
    documentada (sección 4).
11. **"Hoy" y "ahora" en la zona de la clínica:**
    - Una sola utilidad en `server/utils/` (junto a `environment.js`) con `Intl.DateTimeFormat` y `timeZone`.
      **Sin dependencias nuevas.**
    - Reemplaza los cuatro cálculos de la sección 2.
    - La zona se lee de `organizations` a partir del `organization` que el service ya recibe.
12. **`vaccine-due-reminder`:** cambia solo la firma y el cálculo de fecha.
    - `dueBefore` pasa de `Date` a un string `YYYY-MM-DD` calculado en la zona de la clínica.
    - Recibe el `timezone` de la organización.
    - **No implementes** la consulta real.
13. **Salida:** este mismo archivo guía la ejecución. No crees otros prompts.

---

## 4. Contrato fijo (lo comparten todos los sub-agentes)

```txt
organizations.timezone          text not null default 'UTC'      IANA, validado con Intl.supportedValuesOf
appointments.startsAt           timestamp (sin zona), drizzle: timestamp({mode: 'string'})
appointments.timezone           text not null                    copia de organizations.timezone al crear/reprogramar
appointments_availability       sin columna timezone

GET  /api/organization          → {response: {id, name, timezone}}                   owner, employee
PUT  /api/organization          body {timezone}  → {response: {id, name, timezone}}  owner, employee

GET  /api/appointments          startsAt: "YYYY-MM-DDTHH:mm:ss"  (sin 'Z' ni offset) + timezone: "America/Guayaquil"
GET  /api/appointments-availability   ya no devuelve timezone

Escritura futura de citas (solo se documenta, no se implementa):
  zod acepta startsAt /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/ y rechaza 'Z' y offsets;
  el server copia timezone desde organizations y nunca lo acepta del client.
```

La respuesta sigue el envelope existente `{response, errors, fields}`. La forma exacta de los campos de
`organization` se copia de un endpoint `get` hermano (AIS-7).

---

## 5. Lectura obligatoria (antes de escribir)

| Archivo | Para qué |
|---|---|
| `AGENTS.md` | Reglas del monorepo y de los agentes |
| `server/AGENTS.md` | Tres capas, rutas planas, repository, validación, pkit, tests de permisos |
| `client/AGENTS.md` | Pantalla = `page.tsx` + `resolvers.ts`, services 1 a 1, prohibido `setState` en effects |
| `packages/database/AGENTS.md` | Schemas, migraciones de drizzle-kit, imports relativos |
| `cloudtasks/AGENTS.md` | Convenciones de las tareas SQS |
| `server/permissions/README.md` | Tabla de auditoría de rutas privadas (agrega filas para `organization.*`) |
| `docs/technical/08-data-model.md` | Modelo de datos que hay que actualizar |

Hermanos que se copian como molde (AIS-7):

- **Server:** `server/api/appointments-availability.{get,put}.js`,
  `server/modules/appointments-availability/`, `server/permissions/appointments-availability/`,
  `server/api/__tests__/appointments-availability.test.js`, `server/api/__tests__/fixtures/`, `server/utils/__tests__/`.
- **Client:** `client/src/modules/employee/appointments-clinics/` y el service 1 a 1 de
  `appointments-availability`.
- **DB:** cualquier `*.table.ts` con `check` y `index`, y `packages/database/src/migrations/0000_*.sql` para ver
  el formato.

---

## 6. Plan de ejecución con sub-agentes

### Fase 1: esquema (secuencial, bloqueante)

La hace el agente principal o un único sub-agente. Todo lo demás depende de esta fase.
Skill: **`caveman:migration`**.

1. En `organizations.table.ts`, agrega `timezone: text().notNull().default('UTC')`.
2. En `appointments.table.ts`:
   - Cambia `startsAt` a `timestamp({mode: 'string'}).notNull()` (sin `withTimezone`).
   - Agrega `timezone: text().notNull()`.
   - Mantén el `uniqueIndex`.
3. En `appointments-availability.table.ts`, elimina `timezone`.
4. Ejecuta `bun run drizzle:migrate:generate` y **edita el SQL generado** para que el orden sea este:
   1. `ALTER TABLE organizations ADD COLUMN timezone ... DEFAULT 'UTC'`.
   2. `UPDATE organizations o SET timezone = a.timezone FROM appointments_availability a WHERE a.organization = o.id`.
   3. `ALTER TABLE appointments ADD COLUMN timezone text`, luego el backfill desde `organizations`, y después
      `SET NOT NULL`.
   4. `ALTER TABLE appointments ALTER COLUMN "startsAt" TYPE timestamp USING "startsAt" AT TIME ZONE <tz de la organización>`
      (con subconsulta o `UPDATE` previo; el índice se recrea si drizzle lo exige).
   5. `ALTER TABLE appointments_availability DROP COLUMN timezone`.
5. Declara la reversión en el reporte: el SQL inverso, aunque no se aplique. drizzle-kit no genera `down`.
6. Revisa `server/migrations/deltas/` (002, 006 y 007 insertan datos demo) y los seeds (`seeds/`) que escriban
   `startsAt` o `appointments_availability.timezone`. Ajústalos al nuevo esquema.
7. Aplica con `bun run drizzle:migrate:apply` contra el Postgres local (`bun run dev:setup`) y corre
   `bun run test:server`. Los tests usan PGlite, así que la migración también debe pasar ahí.

### Fase 2: tres sub-agentes en paralelo

Lanza los tres a la vez cuando la fase 1 esté en verde. Todos trabajan contra el contrato de la sección 4 y en
el mismo árbol, sin `worktree`, porque cada uno es **dueño exclusivo** de sus carpetas. Ninguno toca archivos de
otro.

**Sub-agente A: server.** Es dueño de `server/**`, incluido `server/permissions/README.md`.
Skills: `tdd`, `caveman:lean-build`.
- Crea `server/api/organization.get.js` y `server/api/organization.put.js`, `server/modules/organization/`
  (repository, schema, service) y `server/permissions/organization/`. Registra el módulo en
  `server/permissions/permissions.js`.
- Validación zod: zona IANA (decisión 7), strip de campos desconocidos y solo `timezone`.
- Agrega filas a `server/permissions/README.md` y crea `server/api/__tests__/organization.test.js`, que cubra
  roles, scope entre organizaciones y zona inválida.
- Quita `timezone` de `appointments-availability` (schema, permisos, test y README).
- `appointments`: `startsAt` sale como string de hora de pared y se agrega `timezone`. Actualiza fixtures y
  tests.
- Crea la utilidad de "hoy" y "ahora" por zona en `server/utils/` con su test en `server/utils/__tests__/`.
  Caso borde obligatorio: 23:30 en `America/Guayaquil` = día siguiente en UTC. Reemplaza los cuatro cálculos
  de la sección 2 y cubre al menos un dashboard con un test.
- Busca más `toISOString().slice(0, 10)`, `new Date(<string local>)` y `DATE(` en `server/` y corrígelos solo si
  calculan "hoy" de negocio.

**Sub-agente B: client.** Es dueño de `client/**`.
Skills: **`modern-web-guidance:modern-web-guidance`** (obligatoria para JS del client: `Intl`, `timeZone`),
`caveman:lean-build`.
- En `client/src/lib/date.ts`, `formatDate` y `formatDateTime` siguen usando el navegador para instantes.
  Agrega un formateador de hora de pared que reciba `(value, timezone)`. Ese formateador:
  - **No convierte**: `"2026-10-01T09:30:00"` se muestra como 09:30.
  - Agrega la etiqueta de la zona si difiere de `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- Crea un service nuevo, 1 a 1 con `organization` (`get` y `put`).
- `appointments-clinics-edit/resolvers.ts`, `settings-edit/resolvers.ts` y `constants/appointments-clinics.ts`:
  - Leen y escriben el timezone vía `organization`.
  - Availability ya no envía `timezone`.
- `appointments.schema.ts` y `appointments-list`: `startsAt` es un string de hora de pared más `timezone`. Nunca
  lo pases por `new Date(...)`.
- Usa `Intl.supportedValuesOf('timeZone')` para el selector, con los componentes compartidos existentes.

**Sub-agente C: cloudtasks y docs.** Es dueño de `cloudtasks/**`, `AGENTS.md` (raíz) y `docs/**`.
Skill: `caveman:lean-build`.
- `vaccine-due-reminder`: aplica la decisión 12 (firma y cálculo de `dueBefore` en la zona de la clínica). Las
  fechas del template del correo se formatean en esa zona. Sin consulta real.
- Agrega la regla de fechas a `AGENTS.md` (raíz) en una sección breve:
  - Instantes en `timestamptz`/UTC.
  - Citas y fechas futuras en hora de pared más `timezone` copiado de la organización.
  - `date` para días.
  - "Hoy" siempre en la zona de la organización.
- Actualiza `docs/technical/08-data-model.md` (columnas nuevas y eliminadas).
- **No toques `CLAUDE.md`.** Su desactualización es otra tarea: anótala en "Proposed, not applied".

### Fase 3: cierre (secuencial)

Skills: **`caveman:verify-and-stop`**, luego **`code-review`** y **`simplify`**.

```sh
bun run test:server
bun run lint
bun run build:server
bun run build
```

- Verificación manual en el navegador: cambia la zona en `appointments-clinics` a `America/Guayaquil`, recarga
  y confirma que persiste, que las citas muestran la hora de pared con su etiqueta y que el dashboard cambia de
  día a medianoche de Guayaquil, no a medianoche UTC.
- Ejecuta `grep -rn "toISOString().slice(0, 10)" server cloudtasks`. No debe quedar ningún "hoy" de negocio.
- Termina con el reporte de entrega de la sección 9.

### Skills de consulta (no forman parte de ninguna fase)

- `aws-database`: solo si surge una duda de Postgres o RDS.
- Se descartan las skills de diseño, video, infraestructura AWS y Expo porque no aplican.
- `pro-architecture`: **no la invoques**, solo el usuario puede hacerlo. Sus reglas están en la sección 7.

---

## 7. Reglas de arquitectura y calidad (pro-architecture)

Aplican a todo el código de este trabajo. Cada hallazgo de revisión se reporta con el veredicto
**INCUMPLIMIENTO** (bloquea) u **OBSERVACIÓN** (no bloquea) y este formato:

```txt
Rule: <ID> — <nombre>
Verdict: INCUMPLIMIENTO | OBSERVACIÓN
Location: <file:line>
Found: <qué hace el código>
Expected: <qué exige la regla>
Fix: <cambio concreto>
```

Los disparadores se evalúan de forma literal, sin extrapolar. Si falta evidencia, se reporta
"not assessable with the available evidence".

### Prohibiciones duras

1. **No saltarse capas.**
   - `api/<modulo>.<verbo>.js` solo decodifica y delega.
   - Las reglas de negocio van en el service.
   - El acceso a datos va en el repository.
   - En el client, las reglas de dominio no van en componentes visuales.
2. **No usar contratos sin tipo.**
   - Toda entrada tiene su zod (server) o su tipo TS (client).
   - La hora de pared es un `string` validado, no un `Date`.
3. **No introducir patrones nuevos en silencio.** Usa el patrón de los hermanos (repository, `baseRoute`, pkit,
   `resolvers.ts`).
4. **No escribir comentarios en prosa.**
   - Solo se permiten directivas de herramientas (`eslint-disable`, `@ts-expect-error`), headers, licencias,
     JSDoc/TSDoc leído por herramientas y banners de archivos generados.
   - El "por qué" va en el mensaje de commit.
   - Quita los comentarios no permitidos de los archivos que toques (COM-4).

### Prohibiciones absolutas del agente

- No inventar archivos, rutas, APIs, firmas ni resultados de tests (AIS-3).
- No declarar una verificación que no se ejecutó (AIS-12).
- No entregar stubs, `TODO` ni pseudocódigo donde se pidió comportamiento (AIS-13). **Excepción acordada:** la
  consulta de `find-due-patients.ts` sigue como stub (decisión 12) y se declara.
- No ocultar fallos con catches vacíos, defaults que enmascaran errores o tests debilitados (AIS-9, ERR-1). Si
  el timezone de la organización falta o es inválido, eso es un error, no un `'UTC'` silencioso. `'UTC'` es
  solo el default de la columna.
- No agregar dependencias, abstracciones ni patrones sin una necesidad actual demostrada (AIS-6, AIS-8, NT-5).
  **No uses** date-fns-tz, luxon, dayjs ni Temporal polyfill: `Intl` alcanza.
- No ampliar el alcance sin autorización (AIS-4). Nada de refactors "ya que estaba".
- No hacer reemplazos mecánicos que cambian palabras pero no significado (AIS-13).

### Reglas de agente (AIS)

- **AIS-1, trazabilidad:** cada archivo tocado responde a una decisión de la sección 3.
- **AIS-2, supuestos:** toda interpretación que decida comportamiento se declara (qué, por qué e impacto si es
  incorrecta).
- **AIS-4 y AIS-5, alcance y preservación:**
  - No reescribas ni reformatees archivos enteros.
  - No toques los cambios pendientes del usuario (por ejemplo `AWS_INFRASTRUCTURE.md`, que no está versionado).
  - No alteres git sin instrucción.
- **AIS-7, patrones locales:** copia nombres, ubicación, exports y layout de tests del hermano.
- **AIS-10, seguridad:**
  - `organization.put` deriva el scope de `context.profile.organization`, nunca del body.
  - Valida el input.
  - Los tests prueban que se rechaza el acceso a otra organización.
- **AIS-12, verificación honesta:** reporta solo comandos que se ejecutaron, con su resultado real.

### Calidad de código

- **DUP:** una sola utilidad de "hoy por zona" (DUP-1 y DUP-3). Nada de copias por service. Valores como
  `'UTC'` o el regex de hora de pared viven en un solo lugar (DUP-4). No fusiones cosas que solo se parecen
  (DUP-5).
- **SIM:** sin código muerto, sin indirecciones sin valor, sin código especulativo "para después" y sin trucos
  ingeniosos.
- **FN:**
  - Una responsabilidad por función.
  - Unas 30 líneas como guía.
  - Como máximo 3 parámetros posicionales (si hay más, usa un objeto).
  - Nada de flags booleanos que cambien el comportamiento.
  - Como máximo 3 niveles de anidación.
  - Sin efectos ocultos: un `getX` o `findX` no escribe.
- **ERR:** usa el contrato de errores del boundary (`{error, status}` y el envelope). No tragues errores ni
  pierdas contexto.
- **MOD:** sin dependencias circulares. La utilidad de fecha va en `server/utils/` porque la usan varios
  módulos. Si tiene un solo consumidor, se queda local (MOD-4).
- **NT:**
  - Booleanos con prefijo `is`, `has` o `should`.
  - Los nombres dicen lo que hace la función.
  - Convenciones del repo: código en inglés, UI en español, kebab-case en archivos, `@/` al subir carpetas.
  - Tipos sin ambigüedad: no mezcles `Date` e ISO string en la misma variable.
- **ALG:** sin N+1. Si un listado necesita el timezone de la organización, se consulta una vez por request, no
  una vez por fila.

### Backend

- Las capas apuntan hacia adentro. El caso de uso se puede llamar desde endpoint, job o test sin duplicar
  lógica.
- Valida en el boundary una sola vez.
- Autorización y scope siempre en el server, antes de cualquier efecto.
- Tests por capa: la utilidad pura con tests unitarios; los endpoints con tests de contrato (validación,
  errores, rechazo por rol y por scope) usando fixtures con scope real.

### Frontend

- Componentes pequeños. El estado va al nivel más bajo razonable. Estados de carga, error y vacío cubiertos.
  Accesibilidad con `:focus-visible` global y sin `outline: none`.
- Reusa `client/src/components/`. Sin hex fuera de `@theme`.

---

## 8. Fuera de alcance

- `appointments.post` y `appointments.put`, el módulo de alertas y la consulta real de `find-due-patients.ts`.
- Una pantalla de perfil en el panel owner.
- Actualizar `CLAUDE.md`.
- Cualquier cambio a `timestamptz` que no esté listado en la decisión 3.

## 9. Criterios de terminado y reporte de entrega

La tarea está terminada cuando se cumplen todos estos puntos:

- La migración se aplicó y los datos existentes conservan la hora que veía el usuario.
- `organization.{get,put}` tiene permisos, fila en el README y tests.
- `appointments.get` devuelve la hora de pared y `timezone`.
- Los cuatro "hoy" usan la zona de la organización.
- El client muestra las citas en la zona de la clínica y los instantes en la del navegador.
- `vaccine-due-reminder` calcula en la zona de la clínica.
- La regla está documentada.
- `test:server`, `lint`, `build:server` y `build` están en verde.
- La verificación manual está hecha.

Cierra con este reporte. Todas las secciones son obligatorias; escribe "none" si una sección está vacía:

```txt
Requirements covered:       <requisito → archivos>; cambios incidentales con motivo
Assumptions:                <qué / por qué / impacto si es incorrecto>, o "none"
Scope:                      pedido vs cambiado; lista "Proposed, not applied"
Files changed:              modificados / creados / eliminados, uno por línea
Dependencies:               agregadas o cambiadas (se espera "none")
Patterns followed:          hermano usado como molde; desviaciones
Simplicity decisions:       abstracciones agregadas; generalizaciones no hechas; duplicaciones mantenidas
Fallbacks and error paths:  cada fallback nuevo y qué observa quien llama
Security-relevant changes:  controles tocados; inputs nuevos y su validación
Performance:                estimaciones como estimaciones, o "not measured"
Validations executed:       <comando> → <resultado real>, uno por línea
Validations not executed:   <qué> → <por qué> → <comando para el usuario>
Result:                     qué funciona ahora y qué cambia para los consumidores
Completeness:               "complete" o huecos explícitos (incluye el stub de find-due-patients)
Residual risks:             qué podría seguir mal y cómo se notaría
Decisions needing approval: excepciones usadas; desviaciones; lo que el usuario debe confirmar
```
