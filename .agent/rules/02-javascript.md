---
trigger: always_on
---

# JavaScript

Aplica a `app/`, `server/`, `landing/` y `cloudtasks/`.

## Lenguaje

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

## Lo que aplica ESLint

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

## Criterio (no lo aplica el linter)

- **Nombres balanceados**: ni `el` ni `educationLevelSelectOptionsForForm`. El scope ya da contexto.
- **Booleanos que se leen como pregunta**: `isOwner`, `hasPermission`, `canCancel`.
- **Sin números ni strings mágicos**: un valor de dominio vive en `constants/<recurso>.js`.
- **Comentarios explican el porqué, nunca el qué.** Si el código necesita un comentario para decir qué
  hace, se reescribe. Las decisiones con historia (por qué no X) van en el commit.
- **Sin código muerto.** Nada comentado "por si acaso", nada de exports sin consumidor: git lo guarda.
- **Dependencias**: no se agregan hasta que hagan falta. Unas líneas propias antes que un paquete;
  la plataforma (HTML, CSS, stdlib, Postgres) antes que las dos.
- **Imports con extensión** (`.js`), y por alias: `@/` en `app/` y `server/`. `packages/` solo por
  paquete (`@brunerkids/db/...`).
