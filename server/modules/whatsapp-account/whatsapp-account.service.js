import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {whatsappAccountsTable, whatsappTemplatesTable} from '@vetisuite/database/schemas/schemas.js';
import {connectAccount, describeError, disconnectAccount} from '@vetisuite/whatsapp/whatsapp.js';
import logger from '@/utils/logger.js';
import {syncWhatsappTemplates} from '@/modules/whatsapp-templates/whatsapp-templates.service.js';

const accountColumns = {
  id: whatsappAccountsTable.id,
  displayPhoneNumber: whatsappAccountsTable.displayPhoneNumber,
  verifiedName: whatsappAccountsTable.verifiedName,
  status: whatsappAccountsTable.status,
  createdAt: whatsappAccountsTable.createdAt
};

async function assertNumberIsFree (phoneNumberId) {
  const [taken] = await db.select({organization: whatsappAccountsTable.organization})
  .from(whatsappAccountsTable)
  .where(eq(whatsappAccountsTable.phoneNumberId, phoneNumberId))
  .limit(1);

  if (taken) {
    throw {error: 'Ese número de WhatsApp ya está conectado en otra clínica', status: 409};
  }
}

async function assertOrganizationIsDisconnected (organization) {
  const [current] = await db.select({id: whatsappAccountsTable.id})
  .from(whatsappAccountsTable)
  .where(eq(whatsappAccountsTable.organization, organization))
  .limit(1);

  if (current) {
    throw {error: 'La clínica ya tiene un número conectado. Desconéctalo antes de conectar otro.', status: 409};
  }
}

async function connectWithMeta (data) {
  try {
    return await connectAccount(data);
  } catch (error) {
    logger.error('[whatsapp] connect.failed', {error, wabaId: data.wabaId, detail: describeError(error)});

    throw {error: 'No se pudo conectar con WhatsApp. Reinicia el proceso e inténtalo de nuevo.', status: 502};
  }
}

export async function connectWhatsappAccount (organization, {code, wabaId, phoneNumberId}) {
  await assertOrganizationIsDisconnected(organization);

  const connected = await connectWithMeta({code, wabaId, phoneNumberId});

  await assertNumberIsFree(connected.phoneNumberId);

  const [account] = await db.insert(whatsappAccountsTable)
  .values({
    organization,
    wabaId,
    phoneNumberId: connected.phoneNumberId,
    displayPhoneNumber: connected.displayPhoneNumber,
    verifiedName: connected.verifiedName,
    accessToken: connected.encryptedAccessToken,
    consentAcceptedAt: new Date()
  })
  .returning(accountColumns);

  const templates = await syncWhatsappTemplates(organization).catch((error) => {
    logger.error('[whatsapp] templates.sync_failed', {error, organization});

    return [];
  });

  return {account, templates};
}

export async function disconnectWhatsappAccount (organization) {
  const [account] = await db.select({wabaId: whatsappAccountsTable.wabaId, accessToken: whatsappAccountsTable.accessToken})
  .from(whatsappAccountsTable)
  .where(eq(whatsappAccountsTable.organization, organization))
  .limit(1);

  if (!account) {
    throw {error: 'La clínica no tiene un número de WhatsApp conectado', status: 404};
  }

  await disconnectAccount({wabaId: account.wabaId, encryptedAccessToken: account.accessToken}).catch((error) => {
    logger.warning('[whatsapp] disconnect.unsubscribe_failed', {error, organization});
  });

  await db.transaction(async (tx) => {
    await tx.delete(whatsappTemplatesTable).where(eq(whatsappTemplatesTable.organization, organization));
    await tx.delete(whatsappAccountsTable).where(eq(whatsappAccountsTable.organization, organization));
  });

  return {disconnected: true};
}
