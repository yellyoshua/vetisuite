import {pkit} from '../pkit.config.js';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {superadminsTable} from '@vetisuite/database/schemas/schemas.js';
import validators from '@/utils/validators.js';

function assertAvatar (data, context, currentAvatar) {
  if (data.avatar === undefined || data.avatar === null) {
    return;
  }

  if (!validators.isOwnFile(data.avatar, context.profile.user.id, currentAvatar)) {
    throw {error: 'La foto no pertenece a esta cuenta', status: 403};
  }
}

function assertNewAvatar (data, context) {
  assertAvatar(data, context);
}

async function assertKeptOrUploadedAvatar (data, context) {
  const [superadmin] = await db.select({avatar: superadminsTable.avatar})
  .from(superadminsTable)
  .where(eq(superadminsTable.id, data.id))
  .limit(1);

  if (!superadmin) {
    throw {error: 'Superadministrador no encontrado', status: 404};
  }

  assertAvatar(data, context, superadmin.avatar);
}

pkit.module('superadmins').name('general').role('superadmin').registerActions({
  find: {enabled: true, properties: ['id', 'avatar', 'firstName', 'lastName', 'organization', 'createdAt', 'updatedAt', 'user', 'search']},
  create: {enabled: true, properties: ['firstName', 'lastName', 'email', 'password', 'avatar']},
  update: {enabled: true, properties: ['id', 'firstName', 'lastName', 'avatar']}
})
.hook('create', assertNewAvatar)
.hook('update', assertKeptOrUploadedAvatar);
