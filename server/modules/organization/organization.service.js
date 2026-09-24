import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {organizationsTable} from '@vetisuite/database/schemas/schemas.js';

export async function updateOrganization (organization, {timezone}) {
  const [updated] = await db.update(organizationsTable)
  .set({timezone, updatedAt: new Date()})
  .where(eq(organizationsTable.id, organization))
  .returning({id: organizationsTable.id, name: organizationsTable.name, timezone: organizationsTable.timezone});

  return updated;
}
