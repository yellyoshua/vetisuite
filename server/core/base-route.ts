import {defineHandler, HTTPResponse} from 'nitro';
import filesManager from '../utils/files-manager.js';
import {translate} from '../utils/error-messages.js';

/*
 * Estandariza la entrada/salida de una ruta. Las demás capas viven en middlewares de Nitro
 * (server/middleware/): CORS (00), sesión → context (01), rate limit (02), guardia de auth (03).
 * Aquí solo: extraer datos (query en GET, body en el resto) → validar (schema o schemaBuilder que
 * recibe la sesión) → files-manager → `route(content, context)` → envelope `{response, errors}`.
 *
 * El envelope es el mismo contrato que devuelve `server/core/query.js`: `errors` es `null` en éxito
 * (nunca `[]`, que sería truthy y rompería los `if (errors)` de quien consume) y un array de
 * mensajes en español cuando falla.
 *
 * context = {event, session, profile} (la sesión ya la resolvió el middleware 01; null en públicas).
 * options: {schemaBuilder, files}
 *
 * Nitro 3 / h3 v2: todo se importa de `nitro` y el resto son APIs web estándar sobre el evento
 * (`event.req` es un Request, `event.url` una URL, `event.res` la respuesta preparada). Las
 * utilidades `getQuery`/`readBody`/`setHeader`… y los accesos `event.method`/`event.headers`/
 * `event.path` están deprecados: no volver a introducirlos.
 */
export default function baseRoute (route, schema, options = {files: {}}) {
  const files = filesManager(options.files || {});

  return defineHandler(async (event) => {
    const auth = event.context.auth as Record<string, Record<string, string>>;
    const context = {event, session: auth?.session, profile: auth?.profile};

    try {
      const data = await extractRequestData(event);
      const validated = await validate(data, schema, options, context);

      const {snapshot, fileMoves} = files.process(validated);
      const response = await route(snapshot, context);

      await files.load(fileMoves);

      // El handler resolvió la respuesta él mismo (ej. redirect): no envolver.
      // h3 v2 eliminó `event.handled`; ahora eso se detecta por el valor devuelto.
      // `redirect()`, `noContent()` y `proxy()` devuelven HTTPResponse, que NO extiende
      // Response (es una clase aparte), así que hay que comprobar las dos.
      return isRawResponse(response) ? response : {response, errors: null};
    } catch (error) {
      return toErrorResponse(event, error);
    }
  });
}

// --- Extracción + validación de datos (query en GET, body en el resto) ---

async function extractRequestData (event) {
  if (event.req.method === 'GET') {
    return readQuery(event);
  }

  const contentType = event.req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    // Body vacío o JSON roto → `{}`, para que lo rechace el schema con un 400 y no
    // se escape como 500 genérico por el SyntaxError de `.json()`.
    return event.req.json().catch(() => ({}));
  }

  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await event.req.formData();

    return Object.fromEntries(formData.entries());
  }

  return {};
}

// Equivalente al viejo `getQuery`: las claves repetidas (`?tag=a&tag=b`) se agrupan en array.
// `Object.fromEntries(searchParams)` se quedaría solo con la última y rompería los filtros de lista.
function readQuery (event) {
  const query = {};

  for (const [key, value] of event.url.searchParams) {
    if (key in query) {
      query[key] = [].concat(query[key], value);
    } else {
      query[key] = value;
    }
  }

  return query;
}

async function validate (data, schema, options, context) {
  // schemaBuilder recibe la sesión: valida contra un schema que depende del usuario autenticado.
  const validator = options.schemaBuilder ? await options.schemaBuilder(data, context) : schema;
  const result = await validator.safeParseAsync(data);

  if (result.error) {
    // No serializar el objeto Zod completo (fuga de estructura interna); solo nombres de campo.
    throw {error: 'errors.invalid_form', status: 400, fields: Object.keys(result.error.flatten().fieldErrors)};
  }

  return result.data;
}

// Una respuesta ya construida por el handler pasa tal cual, sin envelope.
function isRawResponse (value) {
  return value instanceof Response || value instanceof HTTPResponse;
}

// --- Formato de respuesta de error (envelope + traducción ES). Reutilizable por los middlewares. ---

type ErrorPayload = {response: null; errors: string[]; fields?: string[]};

export function toErrorResponse (event, error) {
  if (error?.retryAfter) {
    event.res.headers.set('Retry-After', String(error.retryAfter));
  }

  event.res.status = Number(error?.status) || 500;

  // Solo exponer errores con contrato explícito (`error`); un Error crudo se vuelve genérico para no filtrar.
  const payload: ErrorPayload = {response: null, errors: [translate(error?.error || 'errors.internal')]};

  if (error?.fields) {
    payload.fields = error.fields;
  }

  return payload;
}
