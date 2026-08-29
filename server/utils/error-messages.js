/*
 * Traducción básica (ES) de los códigos de error de las capas de base-route. `translate` mapea
 * el código a su mensaje; si no es un código conocido lo devuelve tal cual, así los mensajes ya en
 * español que lanzan las rutas (`throw {error: 'Correo incorrecto', status}`) pasan sin tocarse.
 */
export const messages = {
  'errors.internal': 'Error interno del servidor',
  'errors.too_many_requests': 'Demasiadas solicitudes',
  'errors.unauthenticated': 'No autenticado',
  'errors.account_disabled': 'Cuenta desactivada',
  'errors.forbidden': 'No autorizado',
  'errors.invalid_form': 'Formulario inválido'
};

export function translate (message) {
  return messages[message] ?? message;
}
