import {IncomingMessage, ServerResponse} from 'node:http';
import {Socket} from 'node:net';
import zod from 'zod';
import {createEvent, sendRedirect} from 'h3';
import {describe, expect, it, vi} from 'vitest';
import baseRoute from '@/core/base-route.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from '@/api/__tests__/helpers/build-authed-event.js';
import {OWNER} from '@/api/__tests__/helpers/profiles.js';

const echoSchema = zod.object({id: zod.uuid().optional(), name: zod.string().optional()});

function publicEvent ({url = '/', method = 'GET', body, contentType = 'application/json'}) {
  const request = new IncomingMessage(new Socket());

  request.url = url;
  request.method = method;
  request.headers = {};

  if (body !== undefined) {
    request.headers['content-type'] = contentType;
    request.headers['content-length'] = String(Buffer.byteLength(body));
    request.push(body);
    request.push(null);
  }

  const event = createEvent(request, new ServerResponse(request));

  event.context.isPublic = true;

  return event;
}

describe('core/base-route', () => {
  it('GET lee la query y envuelve la respuesta', async () => {
    const handler = baseRoute(async (data) => data, echoSchema);

    const result = await handler(publicEvent({url: '/?name=ana'}));

    expect(result).toEqual({response: {name: 'ana'}, errors: null});
  });

  it('PUT lee el body e ignora la query', async () => {
    const handler = baseRoute(async (data) => data, echoSchema);
    const event = publicEvent({url: '/?name=query', method: 'PUT', body: JSON.stringify({name: 'body'})});

    const {response} = await handler(event);

    expect(response).toEqual({name: 'body'});
  });

  it('acepta cuerpos urlencoded', async () => {
    const handler = baseRoute(async (data) => data, echoSchema);
    const event = publicEvent({method: 'POST', body: 'name=formulario', contentType: 'application/x-www-form-urlencoded'});

    const {response} = await handler(event);

    expect(response).toEqual({name: 'formulario'});
  });

  it('un id malformado es 400 con los campos', async () => {
    const handler = baseRoute(async (data) => data, echoSchema);
    const event = publicEvent({url: '/?id=no-uuid'});

    await handler(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event)).toEqual({response: null, errors: ['Formulario inválido'], fields: ['id']});
  });

  it('las claves que Zod no declara no llegan al handler en rutas públicas', async () => {
    const route = vi.fn(async (data) => data);
    const handler = baseRoute(route, echoSchema);

    await handler(publicEvent({url: '/?name=ana&admin=true'}));

    expect(route).toHaveBeenCalledWith({name: 'ana'}, expect.any(Object));
  });

  it('en rutas privadas pkit rechaza una clave no declarada antes del handler', async () => {
    const route = vi.fn(async () => 'nunca');
    const handler = baseRoute(route, zod.object({}), {module: 'profile-sessions'});
    const event = buildAuthedEvent({url: '/?user=otro', profile: OWNER});

    await handler(event);

    expect(route).not.toHaveBeenCalled();
    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).errors).toEqual(['No tiene permiso para realizar esta acción']);
  });

  it('pasa al handler el contexto de la sesión', async () => {
    const handler = baseRoute(async (_data, context) => ({profile: context.profile.id, session: context.session.id}), zod.object({}), {module: 'profile-sessions'});

    const {response} = await handler(buildAuthedEvent({profile: OWNER, session: {id: 'session-9'}}));

    expect(response).toEqual({profile: OWNER.id, session: 'session-9'});
  });

  it('usa el schemaBuilder cuando existe', async () => {
    const schemaBuilder = vi.fn(() => zod.object({name: zod.literal('solo-esto')}));
    const handler = baseRoute(async (data) => data, null, {schemaBuilder});
    const event = publicEvent({url: '/?name=otro'});

    await handler(event);

    expect(schemaBuilder).toHaveBeenCalled();
    expect(event.node.res.statusCode).toBe(400);
  });

  it('un error de dominio del handler sale con su status y mensaje', async () => {
    const handler = baseRoute(async () => {
      throw {error: 'Mensaje de dominio', status: 409};
    }, echoSchema);
    const event = publicEvent({});

    await handler(event);

    expect(event.node.res.statusCode).toBe(409);
    expect(responseBody(event).errors).toEqual(['Mensaje de dominio']);
  });

  it('si el handler ya respondió no envuelve', async () => {
    const handler = baseRoute(async (_data, {event}) => sendRedirect(event, 'https://destino.test', 302), echoSchema);
    const event = publicEvent({});

    await handler(event);

    expect(event.node.res.statusCode).toBe(302);
    expect(event.node.res.getHeader('location')).toBe('https://destino.test');
  });
});
