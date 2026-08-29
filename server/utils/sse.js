import {defineEventHandler, getRouterParam, getHeader, setResponseHeaders, setResponseStatus} from 'nitro/h3';
import {isAccountBlocked} from '@brunerkids/shared/core/auth-core.js';

const HEARTBEAT_MS = 25000;
const MAX_STREAM_MS = 290000; // Cierre limpio antes del maxDuration de Vercel (300s) -> EventSource reconecta
const MAX_CONNECTIONS_PER_USER = 5; // Contador por-instancia (serverless); cada conexión abre un poller a DB
const encoder = new TextEncoder();

// UserId -> nº de streams activos en esta instancia
const activeConnections = new Map();

/*
 * Port h3 del sseRoute de Next. Se conserva el ReadableStream manual (en lugar de
 * createEventStream de h3) porque el heartbeat va como comentario SSE (': ping'),
 * invisible para EventSource — un frame data rompería el JSON.parse del cliente.
 */
export default function sseRoute (modules) {
  return defineEventHandler((event) => {
    const current = event.context.auth || null;

    if (!current) {
      setResponseStatus(event, 401);

      return {error: 'No autenticado'};
    }

    if (isAccountBlocked(current.profile.user)) {
      setResponseStatus(event, 403);

      return {error: 'Cuenta desactivada'};
    }

    const module = getRouterParam(event, 'module');
    const subscribe = modules[module];

    if (!subscribe) {
      setResponseStatus(event, 404);

      return {error: 'Módulo no encontrado'};
    }

    const userId = current.profile.user.id;

    if ((activeConnections.get(userId) || 0) >= MAX_CONNECTIONS_PER_USER) {
      setResponseStatus(event, 429);

      return {error: 'Demasiadas conexiones'};
    }

    const stream = createSseStream({
      event,
      profile: current.profile,
      subscribe,
      lastEventId: getHeader(event, 'last-event-id'),
      userId
    });

    setResponseHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    });

    return stream;
  });
}

function trackConnection (userId, delta) {
  const next = (activeConnections.get(userId) || 0) + delta;

  if (next <= 0) {
    activeConnections.delete(userId);

    return;
  }

  activeConnections.set(userId, next);
}

function createSseStream ({event, profile, subscribe, lastEventId, userId}) {
  const state = {closed: false, deadline: null, close: null};

  return new ReadableStream({
    start (controller) {
      trackConnection(userId, 1);

      const send = (chunk) => {
        if (state.closed) {
          return;
        }

        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // Stream liberado por desconexión del cliente sin abort: cerrar heartbeat y suscripción
          state.close?.();
        }
      };

      const emit = (data, id) => {
        const idField = id === undefined ? '' : `id: ${id}\n`;

        send(`${idField}data: ${JSON.stringify(data)}\n\n`);
      };

      const heartbeat = setInterval(() => send(': ping\n\n'), HEARTBEAT_MS);
      const cleanup = subscribe({profile, emit, lastEventId});

      const close = () => {
        if (state.closed) {
          return;
        }

        state.closed = true;
        trackConnection(userId, -1);
        clearInterval(heartbeat);
        clearTimeout(state.deadline);
        cleanup?.();
        closeController(controller);
      };

      state.close = close;
      state.deadline = setTimeout(close, MAX_STREAM_MS);

      // h3 no expone request.signal: la desconexión del cliente llega por el socket Node
      event.node.req.once('close', close);

      send(': connected\n\n');
    },
    cancel () {
      state.close?.();
    }
  });
}

function closeController (controller) {
  try {
    controller.close();
  } catch {
    // Stream ya cerrado/cancelado por desconexión del cliente
  }
}
