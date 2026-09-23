import {and, desc, eq, inArray, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {patientsTable, visitsServiceTable} from '@vetisuite/database/schemas/schemas.js';

export async function getDashboardLaboratory (organization) {
  const [labServicesRows, pendingLabRows] = await Promise.all([
    fetchLabServices(organization),
    fetchPendingLabOrders(organization)
  ]);

  const openOrdersCount = labServicesRows.filter((row) => row.status === 'requested').length;
  const inAnalysisCount = labServicesRows.filter((row) => row.status === 'waiting' || row.status === 'in_progress').length;
  const todayResultsCount = labServicesRows.filter((row) => row.status === 'resulted').length;

  const kpis = {
    openOrders: {value: String(openOrdersCount), detail: 'solicitadas'},
    inAnalysis: {value: String(inAnalysisCount), detail: 'en procesamiento'},
    todayResults: {value: String(todayResultsCount), detail: 'resultados emitidos'}
  };

  const topExams = buildTopExams(labServicesRows);

  const panels = {
    pendingOrders: {
      meta: `${pendingLabRows.length} pendientes`,
      items: pendingLabRows.map((row) => ({
        name: `${row.patientName} · ${row.label}`,
        detail: `Orden creada: ${row.createdAt.toISOString().slice(0, 10)}`,
        badge: row.status === 'requested' ? 'solicitado' : 'en análisis',
        tone: row.status === 'requested' ? 'amber' : 'blue'
      }))
    },
    topExams: {
      meta: 'exámenes frecuentes',
      items: topExams
    }
  };

  return {kpis, panels};
}

async function fetchLabServices (organization) {
  return db.select({
    id: visitsServiceTable.id,
    label: visitsServiceTable.label,
    status: visitsServiceTable.status,
    createdAt: visitsServiceTable.createdAt
  })
  .from(visitsServiceTable)
  .where(and(
    eq(visitsServiceTable.organization, organization),
    eq(visitsServiceTable.type, 'laboratory'),
    isNull(visitsServiceTable.archivedAt)
  ))
  .orderBy(desc(visitsServiceTable.createdAt));
}

async function fetchPendingLabOrders (organization) {
  return db.select({
    id: visitsServiceTable.id,
    label: visitsServiceTable.label,
    status: visitsServiceTable.status,
    createdAt: visitsServiceTable.createdAt,
    patientName: patientsTable.name
  })
  .from(visitsServiceTable)
  .innerJoin(patientsTable, eq(visitsServiceTable.patient, patientsTable.id))
  .where(and(
    eq(visitsServiceTable.organization, organization),
    eq(visitsServiceTable.type, 'laboratory'),
    inArray(visitsServiceTable.status, ['requested', 'waiting', 'in_progress']),
    isNull(visitsServiceTable.archivedAt)
  ))
  .orderBy(desc(visitsServiceTable.createdAt))
  .limit(10);
}

function buildTopExams (rows) {
  const countByLabel = rows.reduce((acc, row) => {
    acc[row.label] = (acc[row.label] || 0) + 1;

    return acc;
  }, {});

  const total = rows.length || 1;

  return Object.entries(countByLabel)
  .sort(([, aCount], [, bCount]) => bCount - aCount)
  .slice(0, 5)
  .map(([name, examCount]) => {
    const share = Math.round((examCount / total) * 100);

    return {
      name,
      detail: `${examCount} solicitados (${share}%)`,
      badge: `${share}%`,
      tone: 'green'
    };
  });
}
