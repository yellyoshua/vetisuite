import {deleteCookie, setCookie} from 'nitro/h3';
import {COOKIE_NAME, SESSION_MAX_AGE_SECONDS} from '@brunerkids/shared/core/auth-core.js';
import {cookieDomain, isLocal} from './environment.js';

/*
 * Atributos de la cookie de sesión en un solo lugar: el borrado es un set-cookie vencido y el
 * browser solo lo aplica si `Domain` y `Path` coinciden con los de la cookie emitida. Con el
 * dominio fuera de sincronía el logout respondería 200 dejando la cookie viva en `.brunerkids.com`.
 */
const sessionCookieOptions = {
  httpOnly: true,
  secure: !isLocal,
  sameSite: 'lax',
  path: '/',
  ...(cookieDomain ? {domain: cookieDomain} : {})
};

/*
 * Equivalente h3 del set-cookie que hace client/src/core/auth.js. La landing (otro origen)
 * hace login vía fetch al API; el API emite la cookie de sesión con Domain=.brunerkids.com
 * para compartirla con el client (app.*). Lax por las mismas redirecciones cross-site del wrapper Next.
 */
export function setSessionCookie (event, token) {
  setCookie(event, COOKIE_NAME, token, {...sessionCookieOptions, maxAge: SESSION_MAX_AGE_SECONDS});
}

export function clearSessionCookie (event) {
  deleteCookie(event, COOKIE_NAME, sessionCookieOptions);
}
