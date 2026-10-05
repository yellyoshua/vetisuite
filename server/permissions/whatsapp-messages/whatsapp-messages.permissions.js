import {and, eq, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {clientsTable} from '@vetisuite/database/schemas/schemas.js';
import {pkit} from '../pkit.config.js';

const messageColumns = ['id', 'direction', 'status', 'phone', 'template', 'errorCode', 'errorMessage', 'createdAt'];
const queryProperties = ['search', 'order', 'page', 'limit'];
const sendFields = ['client', 'template', 'variables', 'variables.*'];

async function assertOrganizationClient (data, context) {
  const [client] = await db.select({id: clientsTable.id})
  .from(clientsTable)
  .where(and(eq(clientsTable.id, data.client), eq(clientsTable.organization, context.profile.organization), isNull(clientsTable.archivedAt)))
  .limit(1);

  if (!client) {
    throw {error: 'Cliente no encontrado', status: 404};
  }
}

const whatsappMessages = pkit.module('whatsapp-messages').name('general');

whatsappMessages.role('owner').registerActions({
  find: {enabled: true, properties: [...messageColumns, ...queryProperties]},
  create: {enabled: true, properties: sendFields}
})
.hook('create', assertOrganizationClient);

whatsappMessages.role('employee').registerActions({
  find: {enabled: true, properties: [...messageColumns, ...queryProperties]},
  create: {enabled: true, properties: sendFields}
})
.hook('create', assertOrganizationClient);
