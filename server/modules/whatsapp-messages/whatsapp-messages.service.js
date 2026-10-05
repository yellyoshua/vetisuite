import {and, eq, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {
  clientsTable,
  organizationsTable,
  whatsappAccountsTable,
  whatsappMessagesTable,
  whatsappTemplatesTable
} from '@vetisuite/database/schemas/schemas.js';
import {whatsappTemplateMap} from '@/constants/whatsapp-templates.js';
import events from '@/utils/events.js';

const INTERNATIONAL_PHONE = /^\+[1-9]\d{7,14}$/;

const QUEUE_UNAVAILABLE = 'queue_unavailable';

export function toInternationalPhone (phone) {
  const digits = phone.trim().replace(/^00/, '+').replace(/[^\d+]/g, '');

  if (!INTERNATIONAL_PHONE.test(digits)) {
    throw {error: 'El teléfono del cliente debe incluir el código de país (por ejemplo +593…) para enviarle un WhatsApp', status: 400};
  }

  return digits;
}

async function findActiveAccount (organization) {
  const [account] = await db.select({status: whatsappAccountsTable.status})
  .from(whatsappAccountsTable)
  .where(eq(whatsappAccountsTable.organization, organization))
  .limit(1);

  if (!account) {
    throw {error: 'Conecta un número de WhatsApp antes de enviar mensajes', status: 409};
  }

  if (account.status !== 'active') {
    throw {error: 'La conexión con WhatsApp venció. Vuelve a conectar el número.', status: 409};
  }
}

// Solo sale lo que Meta tiene aprobado como utility: si recategoriza una plantilla a marketing,
// el envío se bloquea aquí en vez de facturarse y arriesgar la calidad del número.
async function findSendableTemplate (organization, option) {
  const [template] = await db.select({status: whatsappTemplatesTable.status, category: whatsappTemplatesTable.category})
  .from(whatsappTemplatesTable)
  .where(and(
    eq(whatsappTemplatesTable.organization, organization),
    eq(whatsappTemplatesTable.name, option.name),
    eq(whatsappTemplatesTable.language, option.language)
  ))
  .limit(1);

  if (!template || template.status !== 'approved' || template.category !== 'utility') {
    throw {error: `La plantilla "${option.label}" aún no está aprobada por WhatsApp como mensaje utility`, status: 409};
  }
}

async function findClient (organization, id) {
  const [client] = await db.select({id: clientsTable.id, name: clientsTable.name, phone: clientsTable.phone})
  .from(clientsTable)
  .where(and(eq(clientsTable.id, id), eq(clientsTable.organization, organization), isNull(clientsTable.archivedAt)))
  .limit(1);

  if (!client) {
    throw {error: 'Cliente no encontrado', status: 404};
  }

  return client;
}

async function findOrganizationName (organization) {
  const [row] = await db.select({name: organizationsTable.name}).from(organizationsTable).where(eq(organizationsTable.id, organization)).limit(1);

  return row.name;
}

function buildParameters (option, {variables, client, clinicName}) {
  const sources = {input: variables, client: {client_name: client.name}, organization: {clinic_name: clinicName}};

  return Object.fromEntries(option.parameters.map((parameter) => [parameter.name, sources[parameter.source][parameter.name]]));
}

export async function sendWhatsappMessage (organization, {client: clientId, template, variables}, {requestId}) {
  const option = whatsappTemplateMap[template];

  await findActiveAccount(organization);
  await findSendableTemplate(organization, option);

  const client = await findClient(organization, clientId);
  const to = toInternationalPhone(client.phone);
  const clinicName = await findOrganizationName(organization);

  const [message] = await db.insert(whatsappMessagesTable)
  .values({organization, client: client.id, direction: 'outbound', status: 'queued', phone: to, template})
  .returning({id: whatsappMessagesTable.id, status: whatsappMessagesTable.status});

  const isPublished = await events.whatsappUtilityMessage.publish({
    organization,
    message: message.id,
    to,
    template,
    language: option.language,
    parameters: buildParameters(option, {variables, client, clinicName})
  }, {requestId});

  if (!isPublished) {
    await db.update(whatsappMessagesTable)
    .set({status: 'failed', errorMessage: QUEUE_UNAVAILABLE, updatedAt: new Date()})
    .where(eq(whatsappMessagesTable.id, message.id))
    .returning({id: whatsappMessagesTable.id});

    throw {error: 'No se pudo encolar el mensaje de WhatsApp. Inténtalo de nuevo en unos minutos.', status: 503};
  }

  return {message};
}
