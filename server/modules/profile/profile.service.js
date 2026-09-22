import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {usersTable} from '@vetisuite/database/schemas/schemas.js';
import {hashPassword, isPasswordValid} from '@/utils/hashing.js';
import accountTokensService from '@/modules/accounts/account-tokens.service.js';

export async function changePassword ({userId, currentPassword, password}) {
  const [user] = await db.select({id: usersTable.id, password: usersTable.password})
  .from(usersTable)
  .where(eq(usersTable.id, userId))
  .limit(1);

  if (!user) {
    throw {error: 'Usuario no encontrado', status: 404};
  }

  await assertPasswordIsChangeable({currentPassword, password}, user.password);

  const newPassword = await hashPassword(password);

  await db.update(usersTable)
  .set({password: newPassword, updatedAt: new Date()})
  .where(eq(usersTable.id, user.id))
  .returning({id: usersTable.id});

  return 'Contraseña actualizada exitosamente';
}

export async function resetPassword ({token, password}) {
  const profile = await accountTokensService.passwordReset.verify(token);

  await db.update(usersTable)
  .set({password: await hashPassword(password), updatedAt: new Date()})
  .where(eq(usersTable.id, profile.user.id))
  .returning({id: usersTable.id});

  await accountTokensService.passwordReset.revoke(token);

  return 'Contraseña actualizada exitosamente';
}

export async function confirmEmail ({token}) {
  const profile = await accountTokensService.emailConfirmation.verify(token);

  await db.update(usersTable)
  .set({emailConfirmed: true, emailConfirmedAt: new Date(), updatedAt: new Date()})
  .where(eq(usersTable.id, profile.user.id))
  .returning({id: usersTable.id});

  await accountTokensService.emailConfirmation.revoke(token);

  return 'Correo electrónico verificado exitosamente';
}

async function assertPasswordIsChangeable ({currentPassword, password}, currentHash) {
  const isCurrentPasswordValid = await isPasswordValid(currentPassword, currentHash);

  if (!isCurrentPasswordValid) {
    throw {error: 'La contraseña actual es incorrecta', status: 400};
  }

  const isSamePassword = await isPasswordValid(password, currentHash);

  if (isSamePassword) {
    throw {error: 'La nueva contraseña debe ser distinta de la actual', status: 400};
  }
}
