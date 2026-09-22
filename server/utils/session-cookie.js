import {deleteCookie, getCookie, setCookie} from 'h3';
import {SESSION_MAX_AGE_SECONDS} from '@/core/auth-core.js';
import {isLocal} from './environment.js';

const SESSION_COOKIE_NAME = 'vetisuite_session';

const cookieOptions = {httpOnly: true, secure: !isLocal, sameSite: 'lax', path: '/'};

export function setSessionCookie (event, token) {
  setCookie(event, SESSION_COOKIE_NAME, token, {...cookieOptions, maxAge: SESSION_MAX_AGE_SECONDS});
}

export function readSessionCookie (event) {
  return getCookie(event, SESSION_COOKIE_NAME) || null;
}

export function clearSessionCookie (event) {
  deleteCookie(event, SESSION_COOKIE_NAME, cookieOptions);
}
