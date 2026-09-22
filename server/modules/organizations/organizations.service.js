import slugify from 'slugify';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {organizationsTable} from '@vetisuite/database/schemas/schemas.js';
import {createOwnerAccount} from '@/modules/accounts/accounts.service.js';

const FALLBACK_SLUG = 'clinica';

export async function createOrganization ({name}) {
  const slug = slugify(name, {lower: true, strict: true, trim: true}) || FALLBACK_SLUG;

  await assertSlugAvailable(slug);

  const [organization] = await db.insert(organizationsTable).values({name, slug}).returning();

  return organization;
}

export async function registerOrganization ({name, owner}, {requestId}) {
  const organization = await createOrganization({name});

  try {
    const account = await createOwnerAccount({...owner, organization: organization.id}, {requestId});

    return {organization, account};
  } catch (error) {
    await db.delete(organizationsTable).where(eq(organizationsTable.id, organization.id)).returning({id: organizationsTable.id});

    throw error;
  }
}

export async function assertOrganizationExists (organizationId) {
  const [organization] = await db.select({id: organizationsTable.id})
  .from(organizationsTable)
  .where(eq(organizationsTable.id, organizationId))
  .limit(1);

  if (!organization) {
    throw {error: 'Organización no encontrada', status: 404};
  }
}

async function assertSlugAvailable (slug) {
  const [existing] = await db.select({id: organizationsTable.id})
  .from(organizationsTable)
  .where(eq(organizationsTable.slug, slug))
  .limit(1);

  if (existing) {
    throw {error: 'Ya existe una clínica registrada con ese nombre', status: 409};
  }
}
