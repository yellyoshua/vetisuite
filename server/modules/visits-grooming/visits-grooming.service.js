import {and, asc, count, desc, eq, ilike, isNull, ne, or} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {
  clientsTable,
  employeesTable,
  patientsTable,
  visitsServiceGroomingTable,
  visitsServiceTable
} from '@vetisuite/database/schemas/schemas.js';

export async function listVisitsGrooming (organization, params = {}) {
  const conditions = buildConditions(organization, params);
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const offset = (page - 1) * limit;
  const orderDirection = params.order === 'asc' ? asc(visitsServiceGroomingTable.createdAt) : desc(visitsServiceGroomingTable.createdAt);

  const rows = await db.select({
    id: visitsServiceGroomingTable.id,
    createdAt: visitsServiceGroomingTable.createdAt,
    patientName: patientsTable.name,
    ownerName: clientsTable.name,
    serviceName: visitsServiceTable.label,
    serviceStatus: visitsServiceTable.status,
    groomerFirstName: employeesTable.firstName,
    groomerLastName: employeesTable.lastName
  })
  .from(visitsServiceGroomingTable)
  .innerJoin(visitsServiceTable, and(
    eq(visitsServiceGroomingTable.visitService, visitsServiceTable.id),
    isNull(visitsServiceTable.archivedAt)
  ))
  .leftJoin(patientsTable, and(
    eq(visitsServiceTable.patient, patientsTable.id),
    isNull(patientsTable.archivedAt)
  ))
  .leftJoin(clientsTable, and(
    eq(patientsTable.client, clientsTable.id),
    isNull(clientsTable.archivedAt)
  ))
  .leftJoin(employeesTable, and(
    eq(visitsServiceGroomingTable.groomer, employeesTable.id),
    isNull(employeesTable.archivedAt)
  ))
  .where(and(...conditions))
  .orderBy(orderDirection)
  .limit(limit)
  .offset(offset);

  return rows.map((row) => ({
    id: row.id,
    patientName: row.patientName || '',
    ownerName: row.ownerName || '',
    serviceName: row.serviceName || '',
    stylistName: resolveStylistName(row.groomerFirstName, row.groomerLastName),
    checkInTime: row.createdAt.toISOString(),
    status: toGroomingStatus(row.serviceStatus)
  }));
}

export async function countVisitsGrooming (organization, params = {}) {
  const conditions = buildConditions(organization, params);

  const [row] = await db.select({value: count(visitsServiceGroomingTable.id)})
  .from(visitsServiceGroomingTable)
  .innerJoin(visitsServiceTable, and(
    eq(visitsServiceGroomingTable.visitService, visitsServiceTable.id),
    isNull(visitsServiceTable.archivedAt)
  ))
  .leftJoin(patientsTable, and(
    eq(visitsServiceTable.patient, patientsTable.id),
    isNull(patientsTable.archivedAt)
  ))
  .leftJoin(clientsTable, and(
    eq(patientsTable.client, clientsTable.id),
    isNull(clientsTable.archivedAt)
  ))
  .leftJoin(employeesTable, and(
    eq(visitsServiceGroomingTable.groomer, employeesTable.id),
    isNull(employeesTable.archivedAt)
  ))
  .where(and(...conditions));

  return Number(row?.value || 0);
}

function buildConditions (organization, params) {
  const conditions = [
    eq(visitsServiceGroomingTable.organization, organization),
    isNull(visitsServiceGroomingTable.archivedAt)
  ];

  if (params.id) {
    conditions.push(eq(visitsServiceGroomingTable.id, params.id));
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
    ilike(patientsTable.name, pattern),
    ilike(clientsTable.name, pattern),
    ilike(visitsServiceTable.label, pattern)
  );
}

function statusFilter (status) {
  if (status === 'pending') {
    return eq(visitsServiceTable.status, 'pending');
  }

  if (status === 'in-progress') {
    return eq(visitsServiceTable.status, 'in_progress');
  }

  if (status === 'finished') {
    return eq(visitsServiceTable.status, 'done');
  }

  return eq(visitsServiceTable.status, 'delivered');
}

function presetFilter (preset) {
  if (preset === 'undelivered') {
    return ne(visitsServiceTable.status, 'delivered');
  }

  return eq(visitsServiceTable.status, 'delivered');
}

function toGroomingStatus (status) {
  if (status === 'delivered') {
    return 'delivered';
  }

  if (status === 'done') {
    return 'finished';
  }

  if (status === 'in_progress') {
    return 'in-progress';
  }

  return 'pending';
}

function resolveStylistName (firstName, lastName) {
  if (!firstName) {
    return '';
  }

  return `${firstName} ${lastName || ''}`.trim();
}
