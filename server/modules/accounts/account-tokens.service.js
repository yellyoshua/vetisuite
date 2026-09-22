import {and, eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {accountTokensTable} from '@vetisuite/database/schemas/schemas.js';
import auth from '@/core/auth-core.js';

const tokensService = {
  async validate (token, type) {
    const [accountToken] = await db.select()
    .from(accountTokensTable)
    .where(and(
      eq(accountTokensTable.token, token),
      eq(accountTokensTable.type, type)
    ))
    .limit(1);

    if (!accountToken) {
      throw {error: 'Verificación fallida. Vuelve a intentarlo.', status: 400};
    }

    if (isExpired(accountToken)) {
      await db.delete(accountTokensTable).where(eq(accountTokensTable.id, accountToken.id)).returning({id: accountTokensTable.id});

      throw {error: 'Token caducado', status: 400};
    }

    const profile = await auth.user.getProfile(accountToken.user);

    return {...profile, accountToken: accountToken};
  },
  async revoke (token, type) {
    return db.delete(accountTokensTable).where(and(
      eq(accountTokensTable.token, token),
      eq(accountTokensTable.type, type)
    )).returning({id: accountTokensTable.id});
  }
};

const accountTokensService = {
  emailConfirmation: {
    async verify (token) {
      return tokensService.validate(token, 'email_confirmation');
    },
    async revoke (token) {
      return tokensService.revoke(token, 'email_confirmation');
    }
  },
  passwordReset: {
    async verify (token) {
      return tokensService.validate(token, 'password_reset');
    },
    async revoke (token) {
      return tokensService.revoke(token, 'password_reset');
    }
  }
};

export default accountTokensService;

function isExpired (accountToken) {
  return accountToken.expiresAt.getTime() < Date.now();
}
