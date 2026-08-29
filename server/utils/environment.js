/*
 * Dominios del proyecto y flag de entorno local, leídos por el server.
 *
 * Copia propia a propósito: shared tiene su `config/environment.js` para su uso interno
 * (storage, db, mail, payphone) y el server no lo consume. Cada app declara sus variables.
 *
 * Los tres dominios usan el mismo nombre de variable en client, server y landing
 * (BRUNERKIDS_API_DOMAIN / _APP_DOMAIN / _LANDING_DOMAIN) y llevan esquema y puerto:
 * local -> http://localhost:4000 / :3000 / :4321; cloud -> https://api-dev.brunerkids.com, etc.
 *
 * IS_LOCAL distingue la máquina del desarrollador del ambiente cloud `development`:
 * APP_ENV=development existe en los dos, IS_LOCAL solo en la máquina.
 */
export const isLocal = process.env.IS_LOCAL === 'true';

export const apiDomain = process.env.BRUNERKIDS_API_DOMAIN;
export const appDomain = process.env.BRUNERKIDS_APP_DOMAIN;
export const landingDomain = process.env.BRUNERKIDS_LANDING_DOMAIN;

/*
 * La cookie de sesión la emiten el client (app.*) y el API (api.*): necesita el dominio
 * padre para viajar entre los dos. En local son el mismo host con distinto puerto, así que
 * va host-only (sin atributo Domain).
 * ponytail: `slice(-2)` asume dominio de dos niveles — brunerkids.com es el único que hay.
 */
export const cookieDomain = isLocal
  ? undefined
  : `.${new URL(appDomain).hostname.split('.').slice(-2).join('.')}`;
