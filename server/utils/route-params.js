import zod from 'zod';
import {getRouterParam} from 'nitro/h3';

/*
 * El id de un recurso viaja en el path (`/api/subjects/:id`), no en el body, así que no pasa por el
 * schema de base-route. Se valida acá para no llevar un string arbitrario al `where` de Drizzle
 * (un uuid inválido hace que Postgres reviente con un 500 en vez de una respuesta con contrato).
 *
 * Un id malformado es una URL que no existe → 404; el "no encontrado" legítimo lo decide cada ruta
 * después de consultar la base (ver unwrap-query.js).
 */
const uuidSchema = zod.uuid();

export function routeId (event, name = 'id') {
  const result = uuidSchema.safeParse(getRouterParam(event, name));

  if (!result.success) {
    throw {error: 'Recurso no encontrado', status: 404};
  }

  return result.data;
}
