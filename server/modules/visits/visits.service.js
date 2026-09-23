import {and, asc, count, desc, eq, ilike, isNull, or} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {
  clientsTable,
  employeesTable,
  patientsTable,
  visitsServiceTable,
  visitsTable
} from '@vetisuite/database/schemas/schemas.js';

export async function listVisits (organization, params = {}) {
  const conditions = buildConditions(organization, params);
  const employees = await findOrganizationEmployees(organization);
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const offset = (page - 1) * limit;
  const orderDirection = params.order === 'asc' ? asc(visitsTable.createdAt) : desc(visitsTable.createdAt);

  const rows = await db.select({
    id: visitsTable.id,
    started: visitsTable.started,
    invoice: visitsTable.invoice,
    createdAt: visitsTable.createdAt,
    clientName: clientsTable.name,
    patientName: patientsTable.name,
    serviceType: visitsServiceTable.type,
    serviceLabel: visitsServiceTable.label,
    serviceStatus: visitsServiceTable.status
  })
  .from(visitsTable)
  .leftJoin(clientsTable, eq(visitsTable.client, clientsTable.id))
  .leftJoin(visitsServiceTable, and(eq(visitsServiceTable.visit, visitsTable.id), isNull(visitsServiceTable.archivedAt)))
  .leftJoin(patientsTable, eq(visitsServiceTable.patient, patientsTable.id))
  .where(and(...conditions))
  .orderBy(orderDirection)
  .limit(limit)
  .offset(offset);

  const visitsById = new Map();

  for (const row of rows) {
    if (!visitsById.has(row.id)) {
      visitsById.set(row.id, {
        id: row.id,
        type: toVisitType(row.serviceType),
        patientName: row.patientName || 'Paciente',
        ownerName: row.clientName || 'Cliente',
        service: row.serviceLabel || 'Atención general',
        staffName: resolveStaffName(employees, row.serviceType),
        createdAt: row.createdAt.toISOString(),
        status: toVisitStatus(row.started, row.serviceStatus, row.invoice)
      });
    }
  }

  return Array.from(visitsById.values());
}

export async function countVisits (organization, params = {}) {
  const conditions = buildConditions(organization, params);

  const [row] = await db.select({value: count(visitsTable.id)})
  .from(visitsTable)
  .leftJoin(clientsTable, eq(visitsTable.client, clientsTable.id))
  .leftJoin(visitsServiceTable, and(eq(visitsServiceTable.visit, visitsTable.id), isNull(visitsServiceTable.archivedAt)))
  .leftJoin(patientsTable, eq(visitsServiceTable.patient, patientsTable.id))
  .where(and(...conditions));

  return Number(row?.value || 0);
}

export async function advanceVisitStatus (id, organization, targetStatus) {
  const [currentVisit] = await db.select({
    id: visitsTable.id,
    organization: visitsTable.organization,
    started: visitsTable.started,
    invoice: visitsTable.invoice
  })
  .from(visitsTable)
  .where(and(
    eq(visitsTable.id, id),
    eq(visitsTable.organization, organization),
    isNull(visitsTable.archivedAt)
  ))
  .limit(1);

  if (!currentVisit) {
    throw {error: 'Visita no encontrada', status: 404};
  }

  const services = await db.select({
    id: visitsServiceTable.id,
    status: visitsServiceTable.status,
    started: visitsServiceTable.started
  })
  .from(visitsServiceTable)
  .where(and(
    eq(visitsServiceTable.visit, id),
    eq(visitsServiceTable.organization, organization),
    isNull(visitsServiceTable.archivedAt)
  ));

  const currentStatus = toVisitStatus(currentVisit.started, services[0]?.status, currentVisit.invoice);

  if (currentStatus === 'done') {
    throw {error: 'La visita ya está finalizada: se cobra desde Facturación.', status: 400};
  }

  const nextStatus = targetStatus || (currentStatus === 'pending' ? 'in-progress' : 'done');

  if (nextStatus === 'in-progress') {
    await advanceToInProgress(id, organization);

    return {id, status: 'in-progress'};
  }

  await advanceToDone(id, organization, services.length > 0);

  return {id, status: 'done'};
}

async function advanceToInProgress (id, organization) {
  await db.transaction(async (tx) => {
    const [updatedVisit] = await tx.update(visitsTable)
    .set({started: true, updatedAt: new Date()})
    .where(and(
      eq(visitsTable.id, id),
      eq(visitsTable.organization, organization),
      eq(visitsTable.started, false),
      isNull(visitsTable.archivedAt)
    ))
    .returning();

    if (!updatedVisit) {
      throw {error: 'Conflicto de concurrencia: la visita no está en espera', status: 409};
    }

    await tx.update(visitsServiceTable)
    .set({status: 'in_progress', started: true, updatedAt: new Date()})
    .where(and(
      eq(visitsServiceTable.visit, id),
      eq(visitsServiceTable.organization, organization),
      eq(visitsServiceTable.status, 'pending')
    ));
  });
}

async function advanceToDone (id, organization, hasServices) {
  await db.transaction(async (tx) => {
    const [updatedService] = await tx.update(visitsServiceTable)
    .set({status: 'done', updatedAt: new Date()})
    .where(and(
      eq(visitsServiceTable.visit, id),
      eq(visitsServiceTable.organization, organization),
      eq(visitsServiceTable.status, 'in_progress')
    ))
    .returning();

    await tx.update(visitsTable)
    .set({updatedAt: new Date()})
    .where(and(
      eq(visitsTable.id, id),
      eq(visitsTable.organization, organization),
      eq(visitsTable.started, true),
      isNull(visitsTable.archivedAt)
    ));

    if (!updatedService && hasServices) {
      throw {error: 'Conflicto de concurrencia: la visita no está en proceso', status: 409};
    }
  });
}

function buildConditions (organization, params) {
  const conditions = [
    eq(visitsTable.organization, organization),
    isNull(visitsTable.archivedAt)
  ];

  if (params.id) {
    conditions.push(eq(visitsTable.id, params.id));
  }

  if (params.search) {
    conditions.push(searchFilter(params.search));
  }

  if (params.type) {
    conditions.push(typeFilter(params.type));
  }

  if (params.status) {
    conditions.push(statusFilter(params.status));
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

function typeFilter (type) {
  if (type === 'grooming') {
    return eq(visitsServiceTable.type, 'grooming');
  }

  if (type === 'laboratory') {
    return eq(visitsServiceTable.type, 'laboratory');
  }

  return or(
    eq(visitsServiceTable.type, 'veterinary'),
    eq(visitsServiceTable.type, 'medication'),
    eq(visitsServiceTable.type, 'vaccine')
  );
}

function statusFilter (status) {
  if (status === 'pending') {
    return and(
      eq(visitsTable.started, false),
      or(eq(visitsServiceTable.status, 'pending'), isNull(visitsServiceTable.status))
    );
  }

  if (status === 'in-progress') {
    return and(
      eq(visitsTable.started, true),
      isNull(visitsTable.invoice),
      or(eq(visitsServiceTable.status, 'in_progress'), isNull(visitsServiceTable.status))
    );
  }

  return or(
    eq(visitsServiceTable.status, 'done'),
    visitsTable.invoice
  );
}

function toVisitType (serviceType) {
  if (serviceType === 'grooming') {
    return 'grooming';
  }

  if (serviceType === 'laboratory') {
    return 'laboratory';
  }

  return 'ambulatory';
}

function toVisitStatus (visitStarted, serviceStatus, invoice) {
  if (invoice || serviceStatus === 'done') {
    return 'done';
  }

  if (visitStarted || serviceStatus === 'in_progress') {
    return 'in-progress';
  }

  return 'pending';
}

async function findOrganizationEmployees (organization) {
  return db.select({
    id: employeesTable.id,
    firstName: employeesTable.firstName,
    lastName: employeesTable.lastName,
    position: employeesTable.position
  })
  .from(employeesTable)
  .where(and(eq(employeesTable.organization, organization), isNull(employeesTable.archivedAt)));
}

function resolveStaffName (employees, serviceType) {
  const targetPosition = serviceType === 'grooming' ? 'groomer' : 'veterinarian';
  const match = employees.find((emp) => emp.position === targetPosition) || employees[0];

  return match ? `${match.firstName} ${match.lastName}` : '';
}
