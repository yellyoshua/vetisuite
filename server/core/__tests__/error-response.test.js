import {createError, getResponseHeader} from 'h3';
import {describe, expect, it} from 'vitest';
import {errorResponse} from '@/core/error-response.js';
import nitroErrorHandler from '@/core/nitro-error-handler.js';
import responseBody from '@/tests/response-body.js';
import buildRequestEvent from '@/tests/request-event.js';

async function respond (error) {
  const event = buildRequestEvent({url: '/api/x'});

  await errorResponse(error, {event});

  return {event, status: event.node.res.statusCode, body: responseBody(event)};
}

describe('core/error-response', () => {
  it('un Error nativo es 500 genérico y no filtra el mensaje', async () => {
    const {status, body} = await respond(new Error('detalle interno'));

    expect(status).toBe(500);
    expect(body).toEqual({response: null, errors: ['Error interno del servidor']});
  });

  it('traduce los códigos errors.*', async () => {
    const {status, body} = await respond({error: 'errors.not_found', status: 404});

    expect(status).toBe(404);
    expect(body.errors).toEqual(['Recurso no encontrado']);
  });

  it('deja pasar los mensajes en español', async () => {
    const {status, body} = await respond({error: 'El correo electrónico ya está registrado', status: 409});

    expect(status).toBe(409);
    expect(body.errors).toEqual(['El correo electrónico ya está registrado']);
  });

  it('agrega fields y Retry-After', async () => {
    const invalid = await respond({error: 'errors.invalid_form', status: 400, fields: ['email']});
    const limited = await respond({error: 'errors.too_many_requests', status: 429, retryAfter: 42});

    expect(invalid.body.fields).toEqual(['email']);
    expect(getResponseHeader(limited.event, 'Retry-After')).toBe('42');
  });

  it('lee el objeto original dentro de un H3Error', async () => {
    const wrapped = createError({statusCode: 400, cause: {error: 'Ruta de archivo inválida', status: 400}});
    const notFound = createError({statusCode: 404});

    const fromCause = await respond(wrapped);
    const fromStatus = await respond(notFound);

    expect(fromCause.body.errors).toEqual(['Ruta de archivo inválida']);
    expect(fromStatus.status).toBe(404);
    expect(fromStatus.body.errors).toEqual(['Recurso no encontrado']);
  });
});

describe('core/nitro-error-handler', () => {
  it('responde con el envelope si la respuesta no empezó', async () => {
    const event = buildRequestEvent({url: '/api/nada'});

    await nitroErrorHandler(createError({statusCode: 404}), event);

    expect(event.node.res.statusCode).toBe(404);
    expect(responseBody(event).errors).toEqual(['Recurso no encontrado']);
  });

  it('no toca una respuesta ya enviada', () => {
    const event = buildRequestEvent({url: '/api/files/x'});

    event._handled = true;

    expect(nitroErrorHandler(new Error('tarde'), event)).toBeUndefined();
    expect(event.node.res.statusCode).toBe(200);
  });
});
