---
trigger: always_on
---

# Seguridad

Aplica a todo el monorepo. No negociable.

- Nunca token en query, `localStorage` ni header `Authorization`: cookie httpOnly y nada más.
- Nunca confiar en ids de dueño, roles, rutas de archivo ni montos que vengan del cliente.
- Nunca devolver `password`, tokens ni secretos, tampoco dentro de un join.
- Nunca loguear credenciales, cookies ni payloads completos de pago.
- Todo endpoint privado nuevo nace con su módulo de permisos; uno público va en `api/public/**` con
  justificación.
- Todo input cruza un schema Zod antes de tocar la base.
