---
trigger: always_on
---

# Nombres

Aplica a todo el monorepo.

## Archivos

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

## Código

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
