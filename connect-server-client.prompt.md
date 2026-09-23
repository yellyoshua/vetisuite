# Conectar el server con las pantallas del client

Prompt para un agente de IA que trabaja en el monorepo **Veti Suite** (`/Users/home/projects/vetisuite`).
Las decisiones de este documento ya fueron tomadas con el usuario: **no las re-discutas**. Si algo no
está cubierto aquí ni en las guías del repo, pregunta antes de decidir.

---

## 1. Objetivo

Recorrer todos los endpoints del `server/`, recorrer todas las pantallas y resolvers del `client/`,
compararlos y conectar cada pantalla con su endpoint real. El trabajo es extenso y va por oleadas.

Principios del usuario, en orden de prioridad:

1. **El server comanda.** La forma de los datos la decide el server (tablas de `packages/database` +
   endpoints). El client se adapta al server. **Prohibido** hacer transformaciones raras en el client
   para que la respuesta del server imite el mock actual.
2. **Consultas sencillas.** Cada endpoint hace la consulta mínima que la pantalla necesita. La única
   excepción son los **dashboards**, que sí hacen varias consultas para armar su análisis.
3. **Datos ya formateados desde el backend**, en el sentido de la sección 4.3: el server devuelve la
   forma de la pantalla (joins, derivados, conteos, totales y porcentajes ya calculados). El client solo
   aplica locale.
4. **Services 1 a 1.** Cada módulo de endpoint del server (`server/api/<endpoint>.<verbo>.js`) tiene
   exactamente un archivo `<endpoint>.service.ts` en el client, y viceversa.

---

## 2. Precondición bloqueante

Antes de cualquier otra cosa, verifica que la **Fase 8 del `client-migration-plan/`** terminó:

```sh
test ! -d client/src/components/legacy-ui && test ! -d client/src/hooks/legacy && echo "dirs OK"
grep -rl "legacy-ui\|hooks/legacy" client/src | wc -l   # debe ser 0
```

Si alguno de los dos falla, **detente**. Reporta el resultado exacto de los comandos y no toques código.
El 2026-09-21 quedaban 79 archivos con esos imports. Mezclar dos migraciones en un mismo diff viola
`AGENTS.md` §Agentes 4.

---

## 3. Lectura obligatoria (antes de escribir nada)

| Archivo | Para qué |
|---|---|
| `AGENTS.md` | Reglas del monorepo: principios, JavaScript, ESLint, nombres, seguridad, tests, agentes |
| `server/AGENTS.md` | Tres capas, rutas planas, repositorios, validación, permisos pkit, tests de permisos |
| `client/AGENTS.md` | Pantalla = `page.tsx` + `resolvers.ts`, "mocks en la frontera", `DataTable`, hooks, 3 estados |
| `packages/database/AGENTS.md` | Solo lectura: cómo están definidos los schemas |
| `server/permissions/README.md` | Tabla de auditoría de rutas privadas (se actualiza con cada ruta nueva) |
| `client-migration-plan/01-arquitectura.md` §Contrato del API | Envelope `{response, errors, fields}`, id como filtro, `getOne` |
| `client-migration-plan/13-templates.md` | Molde `items.service` = `service('items')` y checklist por módulo |
| `docs/technical/08-data-model.md` y `docs/product/modules/*` | Intención de negocio de cada pantalla |

Hermanos que copias como molde (AIS-7):

- Server: `server/api/clients*.js`, `server/modules/clients/`, `server/permissions/clients/`,
  `server/api/__tests__/clients.test.js`, `server/api/__tests__/fixtures/clients.js`,
  `server/migrations/deltas/003-attach-clients-permissions/migration.js` (permisos) y
  `002-insert-demo-accounts/migration.js` (guard de ambiente).
- Client: `client/src/core/service.ts`, `client/src/modules/employee/profile/sessions/` (service ya
  conectado: `sessions.service.ts` + `sessions-list/resolvers.ts`).

`CLAUDE.md` está desactualizado en la sección del client (describe `states/`, `lib/api.ts`, zustand con
datos semilla). Manda el código y `client/AGENTS.md`. No edites `CLAUDE.md`.

---

## 4. Decisiones cerradas

### 4.1 Alcance por oleadas

| Oleada | Qué | Checkpoint al final |
|---|---|---|
| 0 | Inventario y matriz de brechas. Sin tocar código | Sí |
| 1 | Conectar lo que ya existe: `clients`, `clients-count`, `clients-patients` | Sí |
| 2 | Crear y conectar endpoints para toda tabla que alimente una pantalla existente | Sí |
| 3 | Dashboards: 8 endpoints `dashboard-<sección>.get.js` | Sí |
| Cierre | Revisión en paralelo y puerta final | Entrega |

En cada checkpoint, **detente y espera la aprobación del usuario**. No empieces la oleada siguiente sin
ella.

**Mapeo tentativo de la oleada 2** (lo confirmas o corriges en el checkpoint de la oleada 0):

| Pantalla (`client/src/modules/employee/…`) | Tablas fuente |
|---|---|
| `appointments/appointments-list` | `appointments`; la agenda del día es el filtro `date` de `appointments.get.js`, no un endpoint aparte |
| `appointments-clinics/appointments-clinics-edit` | `appointments_availability` |
| `visits/visits-list` | `visits` + `services` (+ `visits_service`) |
| `grooming/grooming-list` | `visits_service_grooming` |
| `clinic/clinic-list` | `consultations` (+ `visits_service_lab`) |
| `inventory/inventory-list` | `products` |
| `billing/billing-list` | `invoices` (+ `invoices_item`) |
| `finance/finance-list` | `expenses` + `invoices` |
| `portals/portals-list` | `portals` |

Los nombres exactos de endpoint los propones tú en el checkpoint de la oleada 0 y siguen
`server/AGENTS.md` §Rutas: un solo segmento kebab-case, y el recurso hijo antepone al padre
(`clients-patients`). Por ejemplo: `visits-grooming` o `visits-service-grooming`.

**Fuera de alcance: se quedan con su mock y van al reporte de brechas.**

- `inventory/batches` y `inventory/movements`: no hay tabla.
- `settings`: no hay tabla.
- `users`: la tabla `employees` existe, pero `employees.get` es solo para owner.

No propongas tablas ni permisos nuevos para ellas fuera del reporte.

### 4.2 Campos en conflicto: el server comanda

- **Derivable de relaciones** (p. ej. `petNames` desde `patients`, `lastVisitAt` desde `visits`): lo
  calcula el server, en la misma consulta (agregado o subconsulta). Nunca con N+1 (ALG-1).
- **Sin columna ni relación** (p. ej. `nationalId`, `status`, `hasOpenAccount`, `age`, `allergies`,
  `isAggressive`): se elimina del schema, del formulario y de la pantalla del client. `age` se
  reemplaza por `birthDate`, y la pantalla de paciente adopta `sex` y `birthDate`.
- **Columna nueva en la DB**: solo con aprobación explícita del usuario, pedida en un checkpoint.
- **Campo del server que la pantalla no muestra** (p. ej. `debt`): la pantalla lo adopta solo si su
  intención de negocio lo pide (docs de producto). Si no, no se selecciona.

### 4.3 Formato de la respuesta

- El server devuelve la **forma de la pantalla**: joins, campos derivados, conteos, totales y
  porcentajes ya calculados.
- Los tipos quedan **primitivos**: fechas ISO y números. Nada de `"86%"` ni `"domingo, 6 de
  septiembre"` en la respuesta.
- El server **no pinta** (`server/AGENTS.md` §Constantes): no devuelve etiquetas, colores, `tone` ni
  clases. El client los deriva de valores de dominio (`status`, etc.) con sus `constants/<recurso>.ts`.
- El client solo aplica locale con los helpers existentes: `client/src/lib/format-date.ts`,
  `format-currency.ts` y `date.ts`.
- Los schemas de dashboard del client pasan de strings a números.

### 4.4 Services 1 a 1

- Un archivo por módulo de endpoint: `<endpoint>.service.ts` con una sola línea útil,
  `export default service('<endpoint>')`, como `profile.service.ts`.
- El archivo vive en la raíz del módulo del client que lo consume y se llama **exactamente como el
  endpoint**, aunque la carpeta se llame distinto. Por ejemplo:
  `modules/employee/clients/patients/clients-patients.service.ts`.
- Se eliminan los stubs actuales con métodos (`list`, `get`, `create`… que lanzan `Not implemented`).
- Las llamadas viven en `resolvers.ts` (lecturas) y en `useForm` / `useMutation` (escrituras), usando
  `get`, `getOne`, `post`, `put` y `remove` de `core/service.ts`.
- Al conectar un resolver se elimina su mock. Si un helper (`lib/paginate-rows.ts`,
  `lib/matches-search.ts`) se queda sin consumidores, también se elimina (SIM-1). Mientras lo use una
  pantalla que sigue con mock, se queda.

### 4.5 Verbos: solo los que consume una pantalla

- Casi todo es `.get.js`.
- Escrituras en alcance:
  - `appointments-availability.put.js`.
  - El avance de visita como `visits-status.put.js`, según el precedente `<recurso>-disable.put.js`.
- Las pantallas de clients/patients ya usan `post`/`put` sobre endpoints existentes.
- Sin POST ni DELETE sin pantalla que los consuma (YAGNI, AIS-4).

### 4.6 Paginación

- Cada listado paginado tiene su `<endpoint>-count.get.js`, como `clients-count.get.js`.
- El resolver hace las dos llamadas en paralelo (`Promise.all`) y arma `{rows, total, page}`
  (`ListPage` de `hooks/use-list-query.ts`). No es una transformación rara: no cambia la forma de los
  datos.
- No se toca `repository.find` ni `baseRoute`.

### 4.7 Permisos

- Espejo de `server/permissions/clients/`: roles `owner` y `employee`, con `find`/`update` según los
  verbos de 4.5.
- Sin `remove`, porque no hay DELETE.
- Hook de organización en cada `update` (como `assertOrganizationClient`).
- Un delta de permisos por oleada, `server/migrations/deltas/00N-attach-<oleada>-permissions/`, con la
  forma de la 003.
- Una fila por ruta nueva en `server/permissions/README.md`.
- Los dashboards siguen el mismo espejo.

### 4.8 Datos demo

- Un delta por oleada con datos demo para la organización de las cuentas demo de la delta 002.
- Usa el mismo guard de ambiente que la 002: no corre en `production`.
- Puedes reutilizar los valores de los mocks (nombres, montos), nunca su forma.

### 4.9 Comentarios

- Cero comentarios nuevos.
- No se limpian comentarios fuera de las líneas que tocas.
- El porqué de cada decisión va en el reporte de entrega, no en el código.
- No haces commits (`AGENTS.md` §Agentes 8).

---

## 5. Flujo de trabajo y sub-agentes

Usa la herramienta de sub-agentes (`Agent`) para lo que es paralelizable. **Tú (el agente principal)
eres el único que edita archivos compartidos** y el único que habla con el usuario en los checkpoints.

### 5.1 Propiedad de archivos

| Dueño | Archivos |
|---|---|
| **Solo el principal** | `server/permissions/permissions.js`, `server/permissions/README.md`, `server/migrations/deltas/**`, `server/core/**`, `server/utils/**`, `server/middleware/**`, `server/tests/**`, fixtures y helpers existentes en `server/api/__tests__/{fixtures,helpers}/`, `client/src/{core,hooks,lib,components,stores,routes,modals}/**`, `client/src/modules/employee/dashboard/**` y cualquier `package.json` o lockfile |
| **Sub-agente del módulo X** | `server/api/<X>*.js`, `server/modules/<X>/`, `server/permissions/<X>/`, `server/api/__tests__/<X>.test.js`, fixture nuevo `server/api/__tests__/fixtures/<tabla>.js` si no existe, `client/src/modules/employee/<módulo-de-X>/**` y `client/src/constants/<módulo-de-X>.ts` |
| **Nadie sin aprobación del usuario** | `packages/database/**`, migraciones drizzle existentes, deltas 001–003, `CLAUDE.md`, todos los `AGENTS.md`, límites de ESLint, `.env*` versionados, infraestructura |

Si un sub-agente necesita cambiar un archivo que no es suyo, no lo toca. Lo reporta al principal con el
diff propuesto, y el principal lo aplica al integrar. Todos trabajan en el mismo árbol, sin worktrees.

### 5.2 Oleada 0: inventario (3 sub-agentes `Explore` en paralelo, solo lectura)

Lanza los tres en un mismo mensaje:

1. **Inventario server.** Para cada archivo de `server/api/**`, excepto `public/`, `oauth/`, `files/` y
   `healthcheck`, recoge:
   - endpoint y verbo;
   - schema Zod;
   - `select`, `join` y filtros;
   - módulo pkit con roles y propiedades;
   - archivo de test.

   Además, para cada tabla de `packages/database/src/schemas/**`: columnas, enums y relaciones.
   Devuelve dos tablas.
2. **Inventario client.** Para cada `client/src/modules/employee/**/page.tsx`, recoge:
   - ruta (de `client/src/routes/employee.routes.tsx`);
   - funciones de `resolvers.ts`, marcando si son mock o si llaman a un service;
   - service del módulo, con sus métodos y si es stub;
   - tipos del `*.schema.ts` con sus campos;
   - escrituras (`useForm` / `useMutation`) y a qué llaman.

   Devuelve una tabla.
3. **Brechas de campos.** Clasifica cada campo de cada tipo de los `*.schema.ts` de employee como
   **directo** (columna X), **derivable** (relación y agregado) o **sin fuente**. Haz lo mismo con cada
   métrica de `client/src/modules/employee/dashboard/dashboard.schema.ts`: fuente (tablas y consulta) o
   sin fuente. Devuelve una tabla por tipo.

Con los tres resultados, arma y entrega en el chat:

- **Matriz**: pantalla (ruta) | resolver | service actual → propuesto (`<endpoint>.service.ts`) |
  endpoint (existe / crear, verbos) | oleada.
- **Brechas de campos**: campo | pantalla | directo / derivable / sin fuente | acción (4.2).
- **Métricas de dashboard**: métrica | fuente o "sin fuente → se elimina".
- **Nombres de endpoint propuestos** para las oleadas 2 y 3.
- **Pantallas fuera de alcance** (4.1) y cualquier columna nueva que recomiendes, marcada como
  "requiere aprobación".

**Checkpoint.** Espera la aprobación.

### 5.3 Oleada 1: clients y patients (principal, solo)

La haces tú, secuencialmente, porque fija el molde que copian las oleadas siguientes:

- `clients.service.ts`, `clients-count.service.ts` y `clients-patients.service.ts`, según 4.4.
- Resolvers de `clients-list`, `clients-edit`, `patients-list` y `patients-edit`, más los formularios
  de create y edit, contra el API real.
- Schemas del client ajustados según 4.2 y 4.3.
- Si la pantalla necesita derivados (`petNames`, `lastVisitAt`): cambio en `clients.get.js` y su
  service, con test.
- Delta demo de la oleada 1.

**Checkpoint.** Incluye el reporte de entrega parcial (sección 9).

### 5.4 Oleada 2: módulos con tabla (un sub-agente `general-purpose` por módulo, en paralelo)

- Lanza un sub-agente por fila aprobada del mapeo, en tandas si la herramienta limita la concurrencia.
- Al terminar todos, **tú** integras:
  - importas cada `<X>.permissions.js` en `permissions.js`;
  - agregas las filas al README de permisos;
  - escribes el delta de permisos y el delta demo de la oleada;
  - aplicas los diffs propuestos para archivos compartidos;
  - corres las puertas completas (sección 8).

**Checkpoint.**

Brief para cada sub-agente (complétalo con el módulo, sus tablas, verbos y nombres aprobados):

> Trabajas en el monorepo Veti Suite. Lee `AGENTS.md`, `server/AGENTS.md`, `client/AGENTS.md` y las
> secciones 4, 6 y 7 de `connect-server-client.prompt.md`.
>
> Tu módulo es `<X>`: tablas `<…>`, pantalla `<ruta>`, endpoints `<X>.get.js` y `<X>-count.get.js`
> (y `<…>.put.js` si aplica). Copia la forma exacta de los archivos de `clients` creados en la
> oleada 1.
>
> Solo puedes crear o editar los archivos de tu módulo según la tabla 5.1. Cualquier otro cambio lo
> devuelves como diff propuesto.
>
> Escribe el test primero (skill `tdd`): permitido y rechazado por otro rol, por otra organización y
> por un campo no declarado. Corre:
> - `bun run test:server -- api/__tests__/<X>.test.js`
> - `bunx eslint <tus archivos>`
> - `bun run --filter client typecheck`
>
> Devuelve:
> - la lista de archivos creados, modificados y eliminados;
> - los diffs propuestos para archivos compartidos;
> - las fixtures o datos demo necesarios para el delta;
> - el output real de cada comando;
> - supuestos y brechas.
>
> No hagas commits. No agregues dependencias. No escribas comentarios.

### 5.5 Oleada 3: dashboards

1. **Server, 8 sub-agentes `general-purpose` en paralelo**, uno por sección: `reception`, `marketing`,
   `care`, `grooming`, `laboratory`, `inventory`, `billing` y `administration`.
   - Cada uno es dueño de `server/api/dashboard-<sección>.get.js`, `server/modules/dashboard-<sección>/`,
     `server/permissions/dashboard-<sección>/` y `server/api/__tests__/dashboard-<sección>.test.js`.
   - Reutilizan los repositories de la oleada 2. Los agregados (conteos por estado, sumas, series por
     día u hora) son funciones con Drizzle en el service del dashboard, sin repositories propios.
   - Aquí sí se permiten varias consultas. Deben ser independientes entre sí (`Promise.all`), acotadas
     por fecha u organización, y ninguna dentro de un bucle (ALG-1, ALG-4).
   - Las métricas sin fuente se eliminan, no se inventan.
   - Cada sub-agente devuelve el tipo TypeScript exacto de su respuesta.
2. **Client, el principal, secuencialmente**, porque `dashboard.schema.ts`,
   `dashboard/components/SummaryKpis.tsx` y `SummaryListPanels.tsx` son compartidos por las 8
   secciones:
   - 8 archivos `dashboard-<sección>.service.ts`;
   - se elimina `dashboard.service.ts`;
   - resolvers conectados;
   - schemas a números;
   - formato con `lib/format-*`;
   - `tone` y etiquetas derivados en `client/src/constants/`.
3. Delta de permisos de dashboards y puertas completas.

**Checkpoint.**

### 5.6 Cierre: 3 revisores en paralelo, solo lectura

Lanza tres sub-agentes sobre el diff completo (`git diff` + archivos nuevos):

1. **Reglas de arquitectura.** Audita contra la sección 6 y las guías del repo. Usa el formato de
   hallazgo de 6.6.
2. **Seguridad.** Aislamiento por organización en cada lectura y escritura, pines desde la sesión y
   nunca desde params, Zod en cada input, propiedades pkit mínimas, nada sensible en la respuesta. Usa
   la skill `security-review`.
3. **Correctness.** Contratos server ↔ client (cada campo que lee una pantalla existe en la respuesta),
   paginación, tipos, 3 estados por pantalla. Usa la skill `code-review`.

Corrige los hallazgos con veredicto INCUMPLIMIENTO. Lista las OBSERVACIONES en el reporte. Después
corre `caveman:verify-and-stop` y las puertas de la sección 8.

---

## 6. Reglas de código (pro-architecture, embebidas)

**No invoques la skill `pro-architecture`: solo el usuario puede hacerlo.** Sus reglas están aquí.

**Precedencia**: decisiones de la sección 4 > guías `AGENTS.md` del repo > estas reglas. Conflictos ya
resueltos:

- **COM-1, COM-4 y COM-5** se reemplazan por 4.9.
- **ERR-2** (códigos de error máquina) se cumple con el contrato del proyecto: `throw {error: 'Mensaje en
  español', status}` y `fields` en el envelope.
- **NT-4 y NT-6** ceden ante las convenciones del repo: kebab-case, `export default service(…)`,
  constantes con export nombrado en `constants/<recurso>.ts`.

### 6.1 Prohibiciones duras

1. **No saltarse capas.** Ruta = valida + declara permiso + delega. Service = reglas y lecturas a
   medida. Repository = una tabla. Ninguna ruta importa la base. Ningún componente visual tiene reglas
   de dominio.
2. **No contratos sin tipo.** Todo input con schema Zod. Toda respuesta tipada en el `*.schema.ts` del
   client.
3. **No introducir patrones nuevos en silencio.** Si algo no tiene hermano en el repo, justifícalo en
   el reporte o pregunta.
4. **No comentarios en prosa** (ver 4.9).

### 6.2 Prohibiciones absolutas de agente

Ninguna tiene excepción:

- Inventar archivos, APIs, resultados de tests, métricas o requisitos (AIS-3).
- Declarar una verificación como ejecutada o exitosa cuando no lo fue (AIS-12).
- Entregar stubs, `TODO`, `Not implemented` o pseudocódigo donde se pidió implementación (AIS-13).
- Ocultar fallos con fallbacks silenciosos, `catch` vacíos o defaults que enmascaran errores (AIS-9,
  ERR-1).
- Agregar dependencias, abstracciones o patrones sin necesidad actual demostrada (AIS-6, AIS-8).
- Ampliar el alcance sin autorización (AIS-4). Lo que veas fuera de alcance va a "Propuesto, no
  aplicado".
- Reemplazos mecánicos presentados como migración (AIS-13).

### 6.3 Reglas de agente (AIS)

| ID | Regla |
|---|---|
| AIS-1 | Cada cambio mapea a un requisito de este prompt, o a un supuesto declarado |
| AIS-2 | Todo supuesto que decide comportamiento, forma de datos, seguridad o alcance se declara: qué, por qué e impacto si es falso |
| AIS-3 | Toda afirmación tiene fuente: ruta existente, comando ejecutado o línea citada |
| AIS-4 / AIS-5 | Solo lo pedido. Se preserva el trabajo existente y los cambios sin commitear del usuario. Nada de reformatear archivos enteros |
| AIS-6 | Ninguna dependencia nueva. Orden de preferencia: ya instalado > stdlib > código local |
| AIS-7 | Copia la forma del hermano (sección 3). Una desviación es "decisión que requiere aprobación" |
| AIS-8 | Solución directa primero. Toda abstracción o duplicación deliberada se justifica en el reporte |
| AIS-9 | Ningún fallo convertido en éxito aparente. Ningún test debilitado |
| AIS-10 | Ningún control de seguridad debilitado. Todo input nuevo validado en su frontera |
| AIS-11 | Ninguna optimización sin tamaño o frecuencia esperados. Nada de benchmarks no corridos |
| AIS-12 | Una validación cuenta solo si se ejecutó en la sesión, con su output real |
| AIS-13 | Nada incompleto entregado como terminado |
| AIS-14 | Toda entrega termina con el reporte de la sección 9 |

### 6.4 Reglas de calidad de código

| ID | Regla (INC = incumplimiento, OBS = observación) |
|---|---|
| DUP-1 (INC) | Una regla de negocio o validación en un solo lugar. El schema Zod del server es la fuente; el client no la reimplementa distinta |
| DUP-2 | A la tercera copia se extrae. A la segunda, extraer es opcional (revisa DUP-5) |
| DUP-3 (INC) | No reinventar lo que ya existe: `baseRoute`, `repository()`, `listParams`, `service()`, `useResolver`, `useForm`, `useMutation`, `DataTable`, `lib/format-*` |
| DUP-4 (OBS) | Sin valores mágicos repetidos: van a `constants/<recurso>` |
| DUP-5 (guardia) | No fusionar código que solo se parece. Módulos distintos evolucionan distinto |
| SIM-1 (INC) | Sin código muerto: mocks, stubs, imports y helpers que quedan sin uso se eliminan |
| SIM-2 (INC) | Sin lógica redundante ni `else` tras `return` |
| SIM-3 (OBS) | Sin indirección inútil: un wrapper que no agrega nada se elimina |
| SIM-4 (OBS) | Sin código especulativo: ni parámetros sin uso ni verbos sin pantalla |
| SIM-5 (OBS) | Sin código ingenioso: nada de ternarios anidados ni cadenas densas |
| FN-1 (INC) | Una responsabilidad por función. Si describirla necesita "y", se parte |
| FN-2 (OBS) | ~30 líneas por función. El ESLint del repo corta en 300 |
| FN-3 (OBS) | Más de 3 o 4 parámetros → objeto. Nada de flags booleanos que cambian el comportamiento |
| FN-4 (INC) | Anidación máxima 2 (ESLint del repo). Early return |
| FN-5 (INC) | Sin efectos ocultos: un `get*` no escribe |
| ERR-1 (INC) | Nada de `catch` vacío ni "loguear y seguir" |
| ERR-3 (OBS) | Lo esperado (lista vacía, no encontrado en lectura) es un valor de retorno, no una excepción |
| ERR-4 (OBS) | No re-envolver errores sin agregar información |
| MOD-1 (INC) | Sin dependencias circulares |
| MOD-2 (INC) | Lógica en su capa: nada de reglas en la ruta, ni Drizzle fuera del service, ni reglas de dominio en componentes |
| MOD-3 (OBS) | Nada de `utils` basurero. El archivo se llama como lo que contiene |
| MOD-4 (OBS) | Nada sube a compartido sin un segundo consumidor real (en el client, 3+ pantallas) |
| NT-1 (INC) | Booleanos con `is`, `has` o `can` |
| NT-2 (OBS) | Una variable no cambia de tipo |
| NT-3 (INC) | El nombre dice exactamente lo que hace. Prohibido `process`, `handle`, `do` |
| NT-5 (OBS) | Sin sobreingeniería |
| ALG-1 (INC) | Ninguna consulta dentro de un bucle: una consulta para N ítems |
| ALG-2 (OBS) | Nada de O(n²) sobre colecciones que crecen. Usa `Map` o `Set` |
| ALG-3 (OBS) | No recalcular lo caro en cada iteración o render |
| ALG-4 (INC) | Ninguna lectura sin límite: paginación, `limit` y `select` de campos en la frontera |
| ALG-5 (OBS) | Ninguna optimización prematura |

### 6.5 Checklists de arquitectura

**Backend**

- ¿La lógica está fuera de las rutas y de los repositories?
- ¿Los contratos de entrada y salida son explícitos, validados en la frontera y con `select` mínimo?
- ¿Hay autorización en el server (pkit + hook), con el alcance por organización desde
  `context.profile` en **cada** lectura y escritura?
- ¿El acceso a datos está acotado y sin N+1?
- ¿Las escrituras con estado compartido (`visits-status`) usan un predicado de concurrencia en el
  `WHERE`?
- ¿Los errores respetan `{error, status}`?
- ¿Hay tests del caso permitido y del rechazado (otro rol, otra organización, campo no declarado)?

**Frontend**

- ¿Cada componente tiene una responsabilidad clara?
- ¿El estado vive en la URL o en el resolver, no en `useState` duplicado?
- ¿Hay estados de cargando, error y vacío?
- ¿Las reglas de dominio están fuera de los componentes visuales?
- ¿La accesibilidad se mantiene (labels, foco en modales)?
- ¿Se respeta la estructura `modules/<rol>/<módulo>/<módulo>-<list|create|edit>/`?

### 6.6 Formato de hallazgo (revisores)

```txt
Regla: <ID> — <nombre>
Veredicto: INCUMPLIMIENTO | OBSERVACIÓN
Ubicación: <archivo:línea>
Encontrado: <qué hace el código>
Esperado: <qué exige la regla>
Corrección: <cambio concreto>
```

Si falta evidencia para evaluar, escribe "no evaluable con la evidencia disponible" y nombra lo que
falta. Nunca infieras un veredicto.

---

## 7. Molde por endpoint (cadena completa, `AGENTS.md` §Agentes 2)

Para cada endpoint nuevo o modificado, recorre la cadena entera:

1. `server/modules/<X>/<X>.schema.js`: un schema Zod por operación. Los listados extienden `listParams`.
   Filtros campo por campo, nunca spread de params en el `where`.
2. `server/modules/<X>/<X>.repository.js`: `export default repository(<tabla>)` y nada más.
3. `server/modules/<X>/<X>.service.js`: solo si hay derivados, agregados o escrituras con reglas.
4. `server/api/<X>.<verbo>.js`: `baseRoute(handler, schema, {module: '<X>'})`. El `select` va escrito
   en la ruta. El pin `{organization: context.profile.organization, archivedAt: null}` sale de la
   sesión.
5. `server/permissions/<X>/<X>.permissions.js`: roles, métodos, propiedades mínimas y hook de
   organización en `update`. La importación en `permissions.js` la hace el principal.
6. `server/api/__tests__/<X>.test.js`: caso permitido y caso rechazado, con la forma de la respuesta
   verificada.
7. `client/.../<X>.service.ts`: `export default service('<X>')`.
8. `client/.../*.schema.ts`: tipos iguales a la respuesta real, sin campos inventados.
9. `client/.../resolvers.ts`: mock reemplazado por la llamada al service. Los listados usan
   `Promise.all` con `<X>-count`.
10. `client/.../page.tsx` y `components/`: consumen los campos nuevos. Formato solo con `lib/format-*`.
11. El principal agrega la fila en `server/permissions/README.md` y el identificador en el delta de
    permisos de la oleada.

---

## 8. Puertas de verificación

Se corren en cada checkpoint y al cierre. El output real va en el reporte.

```sh
bun run test:server     # Vitest + PGlite, sin Docker
bun run lint
bun run build:server
bun run --filter client typecheck
bun run --filter client build
```

**Verificación manual en navegador**, obligatoria para el client según `CLAUDE.md`. Usa la skill
`agent-browser`.

1. `bun run dev:setup`
2. `bun run drizzle:migrate:apply`
3. `bun run deltas:launch`
4. `bun run dev:server` (`:4000`) y `bun run dev` (`:3000`)
5. Inicia sesión con la cuenta `demo+employee@vetisuite.com`. La contraseña está en la delta 002.
6. Recorre cada pantalla conectada en la oleada: datos reales, paginación, búsqueda y filtros, estado
   vacío, estado de error (server apagado) y, donde aplique, create/edit.

Si no puedes levantar el entorno (Docker, credenciales), dilo en "Validaciones no ejecutadas" con los
comandos que el usuario debe correr. Nunca lo marques como hecho.

Nada de `eslint-disable`, `.skip`, límites de ESLint subidos ni aserciones relajadas para pasar.

---

## 9. Reporte de entrega (AIS-14)

Al final de cada oleada y al cierre. Todas las secciones son obligatorias; escribe "ninguno" si una
está vacía.

```txt
Requisitos cubiertos:        <requisito → archivos>; cambios incidentales con motivo (AIS-1)
Supuestos:                   <qué / por qué / impacto si es falso>, o "ninguno" (AIS-2)
Alcance:                     pedido vs cambiado; lista "Propuesto, no aplicado" (AIS-4, AIS-5)
Archivos:                    modificados / creados / eliminados, uno por línea (AIS-5)
Dependencias:                ninguna esperada; si hubo alguna, justificación completa (AIS-6)
Patrones seguidos:           hermano usado como molde; desviaciones (AIS-7)
Decisiones de simplicidad:   abstracciones agregadas; generalizaciones no hechas; duplicaciones mantenidas (AIS-8)
Fallbacks y errores:         cada fallback nuevo y qué observa quien llama (AIS-9)
Cambios de seguridad:        permisos, pines, inputs nuevos y su validación, o "ninguno" (AIS-10)
Rendimiento:                 estimaciones como estimaciones; mediciones con comando, o "no medido" (AIS-11)
Validaciones ejecutadas:     <comando> → <resultado real>, una por línea (AIS-12)
Validaciones no ejecutadas:  <qué> → <por qué> → <comando para el usuario> (AIS-12)
Resultado:                   qué funciona ahora y qué cambió para las pantallas
Completitud:                 "completo" o lista explícita de lo que falta (AIS-13)
Riesgos residuales:          qué podría fallar y cómo se notaría
Decisiones a aprobar:        brechas, columnas propuestas, desviaciones y todo lo que el usuario debe confirmar
Porqués:                     razones de diseño que habrían ido en comentarios o en el commit (4.9)
```

---

## 10. Skills

Estás en Claude Code con skills globales en `~/.claude/skills/` y skills de plugins. Las de plugins
(`caveman:*`, `ponytail:*`, `data:*`) se usan **si están disponibles** en la sesión; si no, sigue sin
ellas y dilo en el reporte.

| Skill | Cuándo | Fase |
|---|---|---|
| `tdd` | Test primero para cada endpoint y cada regla (permiso, organización, derivado, agregado) | Oleadas 1–3 |
| `caveman:lean-build` | Endpoints y conexiones nuevas con riesgo de sobreconstrucción: reusar el repo y fijar dónde parar | Oleadas 1–3 |
| `caveman:migration` | Solo si el usuario aprueba una columna nueva (drizzle-kit + delta) | Condicional |
| `data:sql-queries` | Agregados de los dashboards (conteos por estado, series, porcentajes) sobre Postgres | Oleada 3 |
| `security-review` | Revisor de seguridad del cierre | Cierre |
| `code-review` | Revisor de correctness del cierre | Cierre |
| `simplify` y `ponytail:ponytail-review` | Pasada de simplificación sobre el diff antes de la puerta final | Cierre |
| `caveman:verify-and-stop` | Puerta final: probar los criterios sin ampliar el alcance | Cierre |
| `agent-browser` | Verificación manual en navegador de cada pantalla conectada | Oleadas 1–3 |

`pro-architecture` **no se invoca**: sus reglas están en la sección 6.

No aplican a esta tarea las skills de diseño e interfaz (`frontend-design`, `design-taste-*`,
`redesign-existing-projects`, etc.), AWS, video, GSAP y HyperFrames. El trabajo no cambia el diseño
visual ni la infraestructura.

---

## 11. Prohibido

- Hacer `git add`, `commit`, `push` o cambiar de rama.
- Tocar los archivos reservados de 5.1 sin aprobación.
- Crear endpoints, verbos, tablas, columnas o permisos fuera de lo aprobado en los checkpoints.
- Dejar un service stub, un resolver con mock de algo ya conectado o un `Not implemented` en lo
  conectado.
- Hacer `fetch` fuera de `client/src/core/`.
- Leer params para decidir la organización o el dueño.
- Devolver `password`, tokens o secretos.
- Usar `console` fuera de scripts: usa el logger.
- Escribir comentarios en el código.
