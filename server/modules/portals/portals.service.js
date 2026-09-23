import {and, asc, count, desc, eq, ilike, isNull, or, sql} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {portalsSubmissionTable, portalsTable} from '@vetisuite/database/schemas/schemas.js';

export async function listPortals (organization, params = {}) {
  const conditions = buildConditions(organization, params);
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const offset = (page - 1) * limit;
  const orderDirection = params.order === 'asc' ? asc(portalsTable.createdAt) : desc(portalsTable.createdAt);

  const bookedAppointmentsSubquery = db
  .select({count: sql`cast(count(*) as integer)`.mapWith(Number)})
  .from(portalsSubmissionTable)
  .where(
    and(
      eq(portalsSubmissionTable.portal, portalsTable.id),
      eq(portalsSubmissionTable.status, 'appointment_created'),
      isNull(portalsSubmissionTable.archivedAt)
    )
  );

  const rows = await db.select({
    id: portalsTable.id,
    name: portalsTable.name,
    slug: portalsTable.slug,
    purpose: portalsTable.purpose,
    campaignName: portalsTable.campaignName,
    status: portalsTable.status,
    createdAt: portalsTable.createdAt,
    updatedAt: portalsTable.updatedAt,
    bookedAppointments: sql`coalesce(${bookedAppointmentsSubquery}, 0)`.mapWith(Number)
  })
  .from(portalsTable)
  .where(and(...conditions))
  .orderBy(orderDirection)
  .limit(limit)
  .offset(offset);

  return rows;
}

export async function countPortals (organization, params = {}) {
  const conditions = buildConditions(organization, params);

  const [row] = await db.select({value: count(portalsTable.id)})
  .from(portalsTable)
  .where(and(...conditions));

  return Number(row?.value || 0);
}

function buildConditions (organization, params) {
  const conditions = [
    eq(portalsTable.organization, organization),
    isNull(portalsTable.archivedAt)
  ];

  if (params.id) {
    conditions.push(eq(portalsTable.id, params.id));
  }

  if (params.search) {
    conditions.push(searchFilter(params.search));
  }

  if (params.purpose) {
    conditions.push(eq(portalsTable.purpose, params.purpose));
  }

  if (params.status) {
    conditions.push(eq(portalsTable.status, params.status));
  }

  if (params.preset === 'published') {
    conditions.push(eq(portalsTable.status, 'published'));
  }

  if (params.preset === 'drafts') {
    conditions.push(eq(portalsTable.status, 'draft'));
  }

  return conditions;
}

function searchFilter (term) {
  const pattern = `%${term.replace(/[%_\\]/g, '\\$&')}%`;

  return or(
    ilike(portalsTable.name, pattern),
    ilike(portalsTable.slug, pattern)
  );
}
