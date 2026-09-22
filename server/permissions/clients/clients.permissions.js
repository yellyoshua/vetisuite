import {pkit} from '../pkit.config.js';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {clientsTable} from '@vetisuite/database/schemas/schemas.js';

const clientColumns = ['id', 'name', 'phone', 'email', 'debt', 'createdAt', 'updatedAt'];
const writableFields = ['name', 'phone', 'email'];

async function assertOrganizationClient (data, context) {
  const [client] = await db.select({organization: clientsTable.organization, archivedAt: clientsTable.archivedAt})
  .from(clientsTable)
  .where(eq(clientsTable.id, data.id))
  .limit(1);

  if (!client || client.archivedAt || client.organization !== context.profile.organization) {
    throw {error: 'Cliente no encontrado', status: 404};
  }
}

const clients = pkit.module('clients').name('general');

clients.role('owner').registerActions({
  find: {enabled: true, properties: [...clientColumns, 'search']},
  create: {enabled: true, properties: writableFields},
  update: {enabled: true, properties: ['id', ...writableFields]},
  remove: {enabled: true, properties: ['id']}
})
.hook('update', assertOrganizationClient)
.hook('remove', assertOrganizationClient);

clients.role('employee').registerActions({
  find: {enabled: true, properties: [...clientColumns, 'search']},
  create: {enabled: true, properties: writableFields},
  update: {enabled: true, properties: ['id', ...writableFields]}
})
.hook('update', assertOrganizationClient);
