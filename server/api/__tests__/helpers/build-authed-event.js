import {IncomingMessage, ServerResponse} from 'node:http';
import {Socket} from 'node:net';
import {createEvent} from 'h3';
import permissionsRegistry from '@/permissions/permissions.js';

export default function buildAuthedEvent ({url = '/', profile, session, permissions = rolePermissions(profile), method = 'GET', body, headers = {}}) {
  const request = new IncomingMessage(new Socket());

  request.url = url;
  request.method = method;
  request.headers = {...headers};

  if (body !== undefined) {
    const payload = JSON.stringify(body);

    request.headers['content-type'] = 'application/json';
    request.headers['content-length'] = String(Buffer.byteLength(payload));
    request.push(payload);
    request.push(null);
  }

  const event = createEvent(request, new ServerResponse(request));

  event.context.auth = profile ? {session: session || {id: 'session-1'}, profile, permissions} : null;

  return event;
}

function rolePermissions (profile) {
  const role = profile?.user?.role;

  return Object.keys(permissionsRegistry.permissions.named).filter((permission) => permission.startsWith(`${role}::`));
}
