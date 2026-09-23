import {and, desc, eq, inArray, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {
  employeesTable,
  patientsTable,
  visitsServiceGroomingTable,
  visitsServiceTable
} from '@vetisuite/database/schemas/schemas.js';

export async function getDashboardGrooming (organization) {
  const [servicesRows, activeGroomingRows] = await Promise.all([
    fetchGroomingServices(organization),
    fetchActiveGroomingJobs(organization)
  ]);

  const inProgressCount = servicesRows.filter((row) => row.status === 'in_progress').length;
  const finishedCount = servicesRows.filter((row) => row.status === 'done' || row.status === 'delivered').length;
  const totalPrices = servicesRows.reduce((acc, row) => acc + Number(row.price || 0), 0);
  const avgTicket = servicesRows.length > 0 ? Math.round(totalPrices / servicesRows.length) : 0;

  const kpis = {
    todayServices: {value: String(servicesRows.length), detail: 'servicios programados'},
    inProgress: {value: String(inProgressCount), detail: 'en mesa o tina'},
    finished: {value: String(finishedCount), detail: 'listos o entregados'},
    averageTicket: {value: `$${avgTicket}`, detail: 'por servicio'}
  };

  const topServices = buildTopServices(servicesRows);

  const panels = {
    groomingRoom: {
      meta: `${activeGroomingRows.length} en sala`,
      items: activeGroomingRows.map((row) => ({
        name: `${row.patientName} · ${row.label}`,
        detail: resolveGroomerDetail(row),
        badge: row.status === 'in_progress' ? 'en proceso' : 'en espera',
        tone: row.status === 'in_progress' ? 'blue' : 'amber'
      }))
    },
    topServices: {
      meta: 'histórico reciente',
      items: topServices
    }
  };

  return {kpis, panels};
}

async function fetchGroomingServices (organization) {
  return db.select({
    id: visitsServiceTable.id,
    label: visitsServiceTable.label,
    price: visitsServiceTable.price,
    status: visitsServiceTable.status,
    createdAt: visitsServiceTable.createdAt
  })
  .from(visitsServiceTable)
  .where(and(
    eq(visitsServiceTable.organization, organization),
    eq(visitsServiceTable.type, 'grooming'),
    isNull(visitsServiceTable.archivedAt)
  ))
  .orderBy(desc(visitsServiceTable.createdAt));
}

async function fetchActiveGroomingJobs (organization) {
  return db.select({
    id: visitsServiceTable.id,
    label: visitsServiceTable.label,
    status: visitsServiceTable.status,
    patientName: patientsTable.name,
    belongings: visitsServiceGroomingTable.belongings,
    groomerFirstName: employeesTable.firstName,
    groomerLastName: employeesTable.lastName
  })
  .from(visitsServiceTable)
  .innerJoin(patientsTable, eq(visitsServiceTable.patient, patientsTable.id))
  .leftJoin(visitsServiceGroomingTable, eq(visitsServiceGroomingTable.visitService, visitsServiceTable.id))
  .leftJoin(employeesTable, eq(visitsServiceGroomingTable.groomer, employeesTable.id))
  .where(and(
    eq(visitsServiceTable.organization, organization),
    eq(visitsServiceTable.type, 'grooming'),
    inArray(visitsServiceTable.status, ['pending', 'in_progress']),
    isNull(visitsServiceTable.archivedAt)
  ))
  .orderBy(desc(visitsServiceTable.createdAt))
  .limit(10);
}

function resolveGroomerDetail (row) {
  const groomerName = [row.groomerFirstName, row.groomerLastName].filter(Boolean).join(' ');
  const parts = [groomerName ? `Estilista: ${groomerName}` : 'Sin estilista'];

  if (row.belongings) {
    parts.push(row.belongings);
  }

  return parts.join(' · ');
}

function buildTopServices (rows) {
  const countByLabel = rows.reduce((acc, row) => {
    acc[row.label] = (acc[row.label] || 0) + 1;

    return acc;
  }, {});

  const total = rows.length || 1;

  return Object.entries(countByLabel)
  .sort(([, aCount], [, bCount]) => bCount - aCount)
  .slice(0, 5)
  .map(([name, svcCount]) => {
    const share = Math.round((svcCount / total) * 100);

    return {
      name,
      detail: `${svcCount} pedidos (${share}%)`,
      badge: `${share}%`,
      tone: 'green'
    };
  });
}
