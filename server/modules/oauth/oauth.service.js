import {randomUUID} from 'node:crypto';
import {addSeconds} from 'date-fns';
import {and, eq, gt} from '@vetisuite/database/orm.js';
import authCore, {SESSION_MAX_AGE_SECONDS, isAccountBlocked} from '@/core/auth-core.js';
import {db} from '@vetisuite/database/db.js';
import {oauthCodesTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import {apiDomain, appDomain} from '@/utils/environment.js';

const CODE_TTL_SECONDS = 60;
const DEFAULT_REDIRECT_URI = `${appDomain}/oauth/vetisuite`;

export function resolveRedirectUri (redirectUri) {
  if (!redirectUri) {
    return DEFAULT_REDIRECT_URI;
  }

  if (redirectUri !== DEFAULT_REDIRECT_URI) {
    throw {error: 'errors.invalid_form', status: 400, fields: ['redirect_uri']};
  }

  return redirectUri;
}

function clientIdentity (context) {
  return {ip: context.context.ip, userAgent: context.context.userAgent};
}

export async function issueCode (userId, {redirectUri, context} = {}) {
  const {ip, userAgent} = clientIdentity(context);
  const code = randomUUID();

  await db.insert(oauthCodesTable).values({
    code,
    user: userId,
    ip,
    userAgent,
    redirectUri: resolveRedirectUri(redirectUri),
    expiresAt: addSeconds(new Date(), CODE_TTL_SECONDS)
  });

  return code;
}

export function authorizeUrl (code, {state} = {}) {
  const params = new URLSearchParams({code});

  if (state) {
    params.set('state', state);
  }

  return `${apiDomain}/api/oauth/vetisuite/authorize?${params.toString()}`;
}

export async function peekCode (code, {context} = {}) {
  const {ip, userAgent} = clientIdentity(context);

  const [row] = await db.select().from(oauthCodesTable)
  .where(and(
    eq(oauthCodesTable.code, code),
    gt(oauthCodesTable.expiresAt, new Date()),
    eq(oauthCodesTable.ip, ip),
    eq(oauthCodesTable.userAgent, userAgent)
  ))
  .limit(1);

  if (!row) {
    throw {error: 'errors.invalid_grant', status: 400};
  }

  return row;
}

export async function claimCode (code, {redirectUri = null, context} = {}) {
  const {ip, userAgent} = clientIdentity(context);

  const [claimed] = await db.delete(oauthCodesTable)
  .where(and(
    eq(oauthCodesTable.code, code),
    gt(oauthCodesTable.expiresAt, new Date()),
    eq(oauthCodesTable.ip, ip),
    eq(oauthCodesTable.userAgent, userAgent)
  ))
  .returning();

  if (!claimed || (redirectUri && redirectUri !== claimed.redirectUri)) {
    throw {error: 'errors.invalid_grant', status: 400};
  }

  const profile = await authCore.user.getProfile(claimed.user);

  if (isAccountBlocked(profile.user)) {
    throw {error: 'errors.account_disabled', status: 403};
  }

  const {token} = await authCore.session.create(claimed.user, {
    ip: claimed.ip,
    userAgent: claimed.userAgent
  });

  await db.update(usersTable).set({lastSignInAt: new Date()}).where(eq(usersTable.id, claimed.user)).returning({id: usersTable.id});

  return {token, expires_in: SESSION_MAX_AGE_SECONDS, profile};
}
