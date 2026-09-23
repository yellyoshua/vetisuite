import {and, asc, count, desc, eq, gt, ilike, or, sql} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {clientsTable, invoicesTable} from '@vetisuite/database/schemas/schemas.js';

export async function listBilling (organization, params = {}) {
  const conditions = buildConditions(organization, params);
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const offset = (page - 1) * limit;
  const orderDirection = params.order === 'asc' ? asc(invoicesTable.createdAt) : desc(invoicesTable.createdAt);

  const chargeCountSql = sql`(SELECT count(*)::int FROM invoices_item WHERE invoices_item.invoice = ${invoicesTable.id})`.mapWith(Number);

  const rows = await db.select({
    id: invoicesTable.id,
    number: invoicesTable.number,
    subtotal: invoicesTable.subtotal,
    previousDebt: invoicesTable.previousDebt,
    total: invoicesTable.total,
    createdAt: invoicesTable.createdAt,
    clientName: clientsTable.name,
    chargeCount: chargeCountSql
  })
  .from(invoicesTable)
  .innerJoin(clientsTable, eq(invoicesTable.client, clientsTable.id))
  .where(and(...conditions))
  .orderBy(orderDirection)
  .limit(limit)
  .offset(offset);

  return rows.map((row) => formatBillingRow(row));
}

export async function countBilling (organization, params = {}) {
  const conditions = buildConditions(organization, params);

  const [row] = await db.select({value: count(invoicesTable.id)})
  .from(invoicesTable)
  .innerJoin(clientsTable, eq(invoicesTable.client, clientsTable.id))
  .where(and(...conditions));

  return Number(row?.value || 0);
}

function buildConditions (organization, params) {
  const conditions = [
    eq(invoicesTable.organization, organization)
  ];

  if (params.id) {
    conditions.push(eq(invoicesTable.id, params.id));
  }

  if (params.search) {
    conditions.push(searchFilter(params.search));
  }

  if (params.status) {
    conditions.push(statusFilter(params.status));
  }

  if (params.preset) {
    conditions.push(presetFilter(params.preset));
  }

  return conditions;
}

function searchFilter (term) {
  const pattern = `%${term.replace(/[%_\\]/g, '\\$&')}%`;

  return or(
    ilike(clientsTable.name, pattern),
    sql`CAST(${invoicesTable.number} AS TEXT) ILIKE ${pattern}`
  );
}

function statusFilter (status) {
  if (status === 'open') {
    return eq(invoicesTable.total, 0);
  }

  if (status === 'receivable') {
    return gt(invoicesTable.previousDebt, 0);
  }

  return and(
    gt(invoicesTable.total, 0),
    eq(invoicesTable.previousDebt, 0)
  );
}

function presetFilter (preset) {
  if (preset === 'open-account') {
    return eq(invoicesTable.total, 0);
  }

  if (preset === 'overdue') {
    return gt(invoicesTable.previousDebt, 0);
  }

  return and(
    gt(invoicesTable.total, 0),
    eq(invoicesTable.previousDebt, 0)
  );
}

function formatBillingRow (row) {
  const status = resolveStatus(row);
  const paidAt = status === 'paid' ? row.createdAt.toISOString().slice(0, 10) : null;
  const dueDate = status === 'receivable' ? new Date(row.createdAt.getTime() + 15 * 86400000).toISOString().slice(0, 10) : null;
  const kind = status === 'open' ? 'account' : 'invoice';

  return {
    id: row.id,
    clientName: row.clientName,
    kind,
    number: row.number,
    chargeCount: Number(row.chargeCount || 0),
    total: Number(row.total || 0),
    createdAt: row.createdAt.toISOString(),
    dueDate,
    paidAt,
    status
  };
}

function resolveStatus (row) {
  if (Number(row.total || 0) === 0) {
    return 'open';
  }

  if (Number(row.previousDebt || 0) > 0) {
    return 'receivable';
  }

  return 'paid';
}
