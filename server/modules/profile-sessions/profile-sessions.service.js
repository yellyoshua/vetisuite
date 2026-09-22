import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {sessionsTable} from '@vetisuite/database/schemas/schemas.js';

export async function revokeProfileSession (id) {
  const [session] = await db.delete(sessionsTable)
  .where(eq(sessionsTable.id, id))
  .returning({id: sessionsTable.id});

  if (!session) {
    throw {error: 'Sesión no encontrada', status: 404};
  }

  return session;
}
