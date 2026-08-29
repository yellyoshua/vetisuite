/*
 * Permisos por perfil. La guardia de auth (middleware 03.auth-guard) ya garantiza sesión en las
 * rutas no públicas; `requireRole` afina a un rol concreto. Úsalo dentro del handler:
 *   requireRole(context, {superadmin: true})   |   requireRole(context, {profile: 'tutor'})
 * ponytail: si aparecen muchas rutas por rol, conviene una convención de path (api/superadmin/**)
 * resuelta en un middleware, igual que api/public/**. Con guard por ruta basta por ahora.
 */
export function requireRole (context, {superadmin = false, profile = null} = {}) {
  const role = context.profile.user.role;

  if (superadmin && role !== 'superadmin') {
    throw {error: 'errors.forbidden', status: 403};
  }

  if (profile && role !== profile) {
    throw {error: 'errors.forbidden', status: 403};
  }
}

/*
 * Variante para recursos que sirven a varios roles pero no a todos (billetera: estudiante y tutor
 * sí, superadmin no). Evita encadenar `requireRole` con un `if` por rol en cada ruta.
 */
export function requireAnyRole (context, roles) {
  if (roles.includes(context.profile.user.role)) {
    return;
  }

  throw {error: 'errors.forbidden', status: 403};
}
