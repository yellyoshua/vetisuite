import {and, eq, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {clientsTable} from '@vetisuite/database/schemas/schemas.js';

export async function createClient (organization, {name, phone, email}) {
  const [client] = await db.insert(clientsTable)
  .values({organization, name, phone, email})
  .returning();

  return {client};
}

export async function updateClient (id, {name, phone, email}) {
  const [client] = await db.update(clientsTable)
  .set({name, phone, email, updatedAt: new Date()})
  .where(and(eq(clientsTable.id, id), isNull(clientsTable.archivedAt)))
  .returning();

  if (!client) {
    throw {error: 'Cliente no encontrado', status: 404};
  }

  return {client};
}

export async function archiveClient (id) {
  const [client] = await db.update(clientsTable)
  .set({archivedAt: new Date(), updatedAt: new Date()})
  .where(and(eq(clientsTable.id, id), isNull(clientsTable.archivedAt)))
  .returning({id: clientsTable.id});

  if (!client) {
    throw {error: 'Cliente no encontrado', status: 404};
  }

  return {client};
}
