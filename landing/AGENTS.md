# AGENTS.md — `landing/`

Reglas del sitio de marketing (`landing/`). Complementa `/AGENTS.md`, que tiene las reglas de todo el
monorepo: leé ambos.

## Landing

Contenido estático de marketing. **El reparto con `client/` no se solapa: la landing capta, la app
maneja la sesión.** Acá vive solo el alta (un modal); login y recuperación de contraseña viven en la
app, con un formulario unificado para los roles.

Los modales son una isla React montada una vez en el layout; el estado vive solo en la query
string, sin context. `landing/` no tiene tests: ESLint la cubre, pero un import colgado solo lo
atrapa el build.

## Alias

`landing/` no tiene alias.
