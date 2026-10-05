import {and, eq, inArray} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {whatsappAccountsTable, whatsappMessagesTable, whatsappTemplatesTable} from '@vetisuite/database/schemas/schemas.js';

// Meta reintenta durante días y no garantiza el orden: un estado solo avanza, nunca retrocede.
const PREVIOUS_STATUSES = {
  sent: ['queued'],
  delivered: ['queued', 'sent'],
  read: ['queued', 'sent', 'delivered'],
  failed: ['queued', 'sent']
};

const TIMESTAMP_COLUMNS = {sent: 'sentAt', delivered: 'deliveredAt', read: 'readAt', failed: null};

export async function processWhatsappEvents (events) {
  for (const event of events) {
    await handlers[event.type](event);
  }
}

const handlers = {
  status: applyStatus,
  inbound: recordInbound,
  echo: recordEcho,
  'template-status': applyTemplateStatus,
  'template-category': applyTemplateCategory,
  disconnected: markReauthRequired
};

async function findOrganizationByPhone (phoneNumberId) {
  const [account] = await db.select({organization: whatsappAccountsTable.organization})
  .from(whatsappAccountsTable)
  .where(eq(whatsappAccountsTable.phoneNumberId, phoneNumberId))
  .limit(1);

  return account?.organization || null;
}

async function findOrganizationsByWaba (wabaId) {
  const accounts = await db.select({organization: whatsappAccountsTable.organization})
  .from(whatsappAccountsTable)
  .where(eq(whatsappAccountsTable.wabaId, wabaId));

  return accounts.map((account) => account.organization);
}

async function applyStatus (event) {
  const organization = await findOrganizationByPhone(event.phoneNumberId);

  if (!organization) {
    return;
  }

  const timestampColumn = TIMESTAMP_COLUMNS[event.status];

  await db.update(whatsappMessagesTable)
  .set({
    status: event.status,
    ...(timestampColumn ? {[timestampColumn]: event.at} : {}),
    ...(event.isBillable === null ? {} : {billable: event.isBillable}),
    ...(event.status === 'failed' ? {errorCode: event.errorCode, errorMessage: event.errorMessage} : {}),
    updatedAt: new Date()
  })
  .where(and(
    eq(whatsappMessagesTable.wamid, event.messageId),
    eq(whatsappMessagesTable.organization, organization),
    inArray(whatsappMessagesTable.status, PREVIOUS_STATUSES[event.status])
  ))
  .returning({id: whatsappMessagesTable.id});
}

async function recordInbound (event) {
  const organization = await findOrganizationByPhone(event.phoneNumberId);

  if (!organization) {
    return;
  }

  await db.insert(whatsappMessagesTable)
  .values({organization, direction: 'inbound', status: 'delivered', wamid: event.messageId, phone: event.from, createdAt: event.at})
  .onConflictDoNothing({target: whatsappMessagesTable.wamid})
  .returning({id: whatsappMessagesTable.id});
}

async function recordEcho (event) {
  const organization = await findOrganizationByPhone(event.phoneNumberId);

  if (!organization) {
    return;
  }

  await db.insert(whatsappMessagesTable)
  .values({organization, direction: 'outbound', status: 'sent', wamid: event.messageId, phone: event.to, sentAt: event.at, createdAt: event.at})
  .onConflictDoNothing({target: whatsappMessagesTable.wamid})
  .returning({id: whatsappMessagesTable.id});
}

async function applyTemplateStatus (event) {
  const organizations = await findOrganizationsByWaba(event.wabaId);

  if (organizations.length === 0) {
    return;
  }

  await db.update(whatsappTemplatesTable)
  .set({status: event.status, rejectedReason: event.reason, updatedAt: new Date()})
  .where(and(
    inArray(whatsappTemplatesTable.organization, organizations),
    eq(whatsappTemplatesTable.name, event.name),
    eq(whatsappTemplatesTable.language, event.language)
  ))
  .returning({id: whatsappTemplatesTable.id});
}

async function applyTemplateCategory (event) {
  const organizations = await findOrganizationsByWaba(event.wabaId);

  if (organizations.length === 0) {
    return;
  }

  await db.update(whatsappTemplatesTable)
  .set({category: event.category, updatedAt: new Date()})
  .where(and(
    inArray(whatsappTemplatesTable.organization, organizations),
    eq(whatsappTemplatesTable.name, event.name),
    eq(whatsappTemplatesTable.language, event.language)
  ))
  .returning({id: whatsappTemplatesTable.id});
}

async function markReauthRequired (event) {
  await db.update(whatsappAccountsTable)
  .set({status: 'reauth_required', updatedAt: new Date()})
  .where(eq(whatsappAccountsTable.wabaId, event.wabaId))
  .returning({id: whatsappAccountsTable.id});
}
