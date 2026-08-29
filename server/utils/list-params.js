import zod from 'zod';

/*
 * Parámetros comunes de los listados GET. Todo llega como string en la query string (`?page=2` es
 * '2'), de ahí el `coerce`. El `.catch()` evita que un valor basura en la URL tumbe una lectura:
 * `?page=abc` cae al default en vez de devolver 400 y pintar el error boundary.
 *
 * `limit` va acotado: sin tope, `?limit=999999` convierte cualquier listado en un scan de tabla.
 * El `-1` (catálogo completo) NO es un valor que pueda mandar el cliente: lo decide la ruta.
 *
 * `order` es solo la DIRECCIÓN; el CAMPO por el que se ordena lo fija cada ruta. Dejar elegir el
 * campo convierte el listado en un oráculo sobre columnas que el rol no debería ni conocer.
 *
 * Ojo: `zod.object()` descarta las claves desconocidas por defecto, y eso es la mitad de la
 * defensa (un `?student=<otro-uuid>` se cae acá). La otra mitad es que las rutas arman los filtros
 * campo por campo: **nunca** hacer spread de `params` dentro del objeto de filtros.
 */
const MAX_LIMIT = 100;

export const listParams = zod.object({
  /*
   * `id` es un filtro más, no una ruta aparte: `findOne` del client es `find({id})[0]`. Va SIN
   * `.catch()` a propósito — un id malformado debe ser 400, no descartarse: si se descartara, la
   * consulta devolvería la lista completa y el cliente se quedaría con una fila arbitraria.
   */
  id: zod.uuid().optional(),
  page: zod.coerce.number().int().min(1).default(1).catch(1),
  limit: zod.coerce.number().int().min(1).max(MAX_LIMIT).default(10).catch(10),
  search: zod.string().trim().max(100).optional().catch(undefined),
  order: zod.enum(['asc', 'desc']).default('desc').catch('desc')
});

/*
 * Los catálogos (materias, niveles) se piden completos para poblar selects. `all=true` es el
 * único camino al `limit: -1` de query() y solo existe en esas rutas; el cliente nunca manda un
 * limit negativo. `zod.coerce.boolean()` no sirve acá: `Boolean('false')` es `true`.
 */
export const catalogParams = listParams.extend({
  all: zod.enum(['true', 'false']).optional().transform((value) => value === 'true')
});

// Traduce `all` al limit que espera query(): -1 = sin cláusula LIMIT.
export const catalogLimit = (params) => (params.all ? -1 : params.limit);
