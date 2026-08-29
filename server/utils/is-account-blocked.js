/*
 * Copia server-local del check de shared: cuenta sin acceso (deshabilitada o baneo temporal vigente).
 * base-route lo comprueba en cada request autenticado — un baneo no debe esperar a que expire la sesión.
 */
export default function isAccountBlocked (user) {
  if (user.disabled) {
    return true;
  }

  return Boolean(user.bannedUntil && new Date(user.bannedUntil) > new Date());
}
