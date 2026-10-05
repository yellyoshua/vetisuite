import {eq, sql} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {whatsappAccountsTable, whatsappTemplatesTable} from '@vetisuite/database/schemas/schemas.js';
import {describeError, syncUtilityTemplates} from '@vetisuite/whatsapp/whatsapp.js';
import {whatsappTemplateOptions} from '@/constants/whatsapp-templates.js';
import logger from '@/utils/logger.js';

const templateColumns = {
  name: whatsappTemplatesTable.name,
  language: whatsappTemplatesTable.language,
  category: whatsappTemplatesTable.category,
  status: whatsappTemplatesTable.status,
  rejectedReason: whatsappTemplatesTable.rejectedReason,
  updatedAt: whatsappTemplatesTable.updatedAt
};

export async function syncWhatsappTemplates (organization) {
  const [account] = await db.select({wabaId: whatsappAccountsTable.wabaId, accessToken: whatsappAccountsTable.accessToken})
  .from(whatsappAccountsTable)
  .where(eq(whatsappAccountsTable.organization, organization))
  .limit(1);

  if (!account) {
    throw {error: 'Conecta un número de WhatsApp antes de sincronizar las plantillas', status: 409};
  }

  const synced = await syncUtilityTemplates({
    wabaId: account.wabaId,
    encryptedAccessToken: account.accessToken,
    templates: whatsappTemplateOptions.map(({name, language, body, parameters}) => ({
      name,
      language,
      body,
      parameters: parameters.map(({name: parameter, example}) => ({name: parameter, example}))
    }))
  }).catch((error) => {
    logger.error('[whatsapp] templates.sync.failed', {error, organization, detail: describeError(error)});

    throw {error: 'No se pudieron sincronizar las plantillas con WhatsApp. Inténtalo de nuevo.', status: 502};
  });

  return db.insert(whatsappTemplatesTable)
  .values(synced.map((template) => ({organization, ...template})))
  .onConflictDoUpdate({
    target: [whatsappTemplatesTable.organization, whatsappTemplatesTable.name, whatsappTemplatesTable.language],
    set: {
      metaId: sql`excluded.meta_id`,
      category: sql`excluded.category`,
      status: sql`excluded.status`,
      rejectedReason: sql`excluded.rejected_reason`,
      updatedAt: new Date()
    }
  })
  .returning(templateColumns);
}
