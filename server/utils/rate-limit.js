/*
 * Rate limiting in-memory (fixed window sobre Map a nivel de módulo). Lo consume el middleware
 * `02.rate-limit.js` (capa de rate limit desacoplada de base-route).
 * ponytail: estado por-instancia — mitiga bursts locales, no un atacante distribuido entre
 * instancias. Upgrade path: Redis (@upstash/ratelimit) si se necesita límite global.
 */

import {getRequestHeader} from 'nitro/h3';

const buckets = new Map();

function pruneExpired (now) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

/**
 * @param {string} key identificador (ej. `${ip}:${pathname}` o session id)
 * @param {{limit: number, windowMs: number}} options
 * @returns {{ok: boolean, retryAfter: number, remaining: number}}
 */
export function checkRateLimit (key, {limit, windowMs}) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    // Barrido perezoso: solo al crear ventana nueva, evita recorrer el Map en cada request
    pruneExpired(now);
    buckets.set(key, {count: 1, resetAt: now + windowMs});

    return {ok: true, retryAfter: 0, remaining: limit - 1};
  }

  if (entry.count >= limit) {
    return {ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000), remaining: 0};
  }

  entry.count += 1;

  return {ok: true, retryAfter: 0, remaining: limit - entry.count};
}

/** Extrae la IP del cliente detrás del proxy (x-forwarded-for / x-real-ip) desde un h3 event. */
export function clientIp (event) {
  const forwarded = getRequestHeader(event, 'x-forwarded-for');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return getRequestHeader(event, 'x-real-ip') || 'unknown';
}

// Solo para tests: reinicia el estado global entre casos.
export function resetRateLimits () {
  buckets.clear();
}
