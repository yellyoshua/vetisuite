/*
 * `query()` nunca lanza: devuelve `{errors, response}`. Una ruta sí debe lanzar para que
 * base-route arme el envelope de error con el status correcto.
 *
 * `findOne` sin resultado devuelve `response: null` con 200 (no 404): es el mismo contrato que
 * `query().findOne()`, así el `if (errors || !recurso) { notFound(); }` de las páginas sigue
 * funcionando sin tocarlo. El 404 queda reservado para un id malformado (ver route-params.js).
 */
export default function unwrapQuery ({errors, response}, message = 'No se pudo cargar la información') {
  if (errors) {
    throw {error: message, status: 500};
  }

  return response;
}
