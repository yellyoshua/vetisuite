import {pkit} from '../pkit.config.js';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {sessionsTable} from '@vetisuite/database/schemas/schemas.js';

const sessionColumns = ['id', 'userAgent', 'createdAt', 'expiresAt', 'isCurrent'];

async function assertOwnSession (data, context) {
  const [session] = await db.select({user: sessionsTable.user})
  .from(sessionsTable)
  .where(eq(sessionsTable.id, data.id))
  .limit(1);

  if (!session || session.user !== context.profile.user.id) {
    throw {error: 'Sesión no encontrada', status: 404};
  }
}

const profileSessions = pkit.module('profile-sessions').name('general');

profileSessions.role('superadmin').registerActions({
  find: {enabled: true, properties: sessionColumns},
  remove: {enabled: true, properties: ['id']}
})
.hook('remove', assertOwnSession);

profileSessions.role('owner').registerActions({
  find: {enabled: true, properties: sessionColumns},
  remove: {enabled: true, properties: ['id']}
})
.hook('remove', assertOwnSession);

profileSessions.role('employee').registerActions({
  find: {enabled: true, properties: sessionColumns},
  remove: {enabled: true, properties: ['id']}
})
.hook('remove', assertOwnSession);
