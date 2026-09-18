---
trigger: always_on
---

# Tests

Aplica a `app/` y `server/`.

- Todo cambio con lógica (rama, regla de negocio, permiso, dinero) deja un test que falla si la
  lógica se rompe. Un one-liner trivial no necesita test.
- Tests en `__tests__/` junto al código. Probar comportamiento observable (respuesta, fila escrita),
  no detalles internos.
- Permisos: probar el caso permitido **y** el rechazado (otro rol, otro dueño, campo no declarado).
- `bun run lint` y `bun run test` en verde antes de dar algo por terminado.
