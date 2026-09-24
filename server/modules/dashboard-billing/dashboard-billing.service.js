import {desc, eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {clientsTable, invoicesTable} from '@vetisuite/database/schemas/schemas.js';
import {dateInTimeZone, todayInTimeZone} from '@/utils/timezone.js';

export async function getDashboardBilling (organization, timezone) {
  const invoicesRows = await fetchInvoices(organization);

  const todayStr = todayInTimeZone(timezone);
  const todayInvoices = invoicesRows.filter((row) => dateInTimeZone(row.createdAt, timezone) === todayStr);
  const todayRevenue = todayInvoices.reduce((acc, row) => acc + Number(row.total || 0), 0);

  const openInvoices = invoicesRows.filter((row) => Number(row.total || 0) === 0);
  const receivableInvoices = invoicesRows.filter((row) => Number(row.previousDebt || 0) > 0);
  const receivablesTotal = receivableInvoices.reduce((acc, row) => acc + Number(row.previousDebt || 0), 0);

  const paidInvoices = invoicesRows.filter((row) => Number(row.total || 0) > 0);
  const paidTotal = paidInvoices.reduce((acc, row) => acc + Number(row.total || 0), 0);
  const avgTicket = paidInvoices.length > 0 ? Math.round(paidTotal / paidInvoices.length) : 0;

  const kpis = {
    todayRevenue: {value: `$${Math.round(todayRevenue)}`, detail: 'cobrado hoy'},
    openAccounts: {value: String(openInvoices.length), detail: 'cuentas sin facturar'},
    receivables: {value: `$${Math.round(receivablesTotal)}`, detail: `${receivableInvoices.length} clientes con deuda`},
    averageTicket: {value: `$${avgTicket}`, detail: 'por factura emitida'}
  };

  const panels = {
    accountsToClose: {
      meta: `${openInvoices.length} abiertas`,
      items: openInvoices.slice(0, 10).map((row) => ({
        name: `${row.clientName} · #${row.number}`,
        detail: `Abierta el ${row.createdAt.toISOString().slice(0, 10)}`,
        badge: 'abierta',
        tone: 'blue'
      }))
    },
    pendingCollections: {
      meta: `${receivableInvoices.length} pendientes`,
      items: receivableInvoices.slice(0, 10).map((row) => ({
        name: `${row.clientName} · #${row.number}`,
        detail: `Deuda acumulada: $${row.previousDebt}`,
        badge: `$${row.previousDebt}`,
        tone: 'red'
      }))
    }
  };

  return {kpis, panels};
}

async function fetchInvoices (organization) {
  return db.select({
    id: invoicesTable.id,
    number: invoicesTable.number,
    subtotal: invoicesTable.subtotal,
    previousDebt: invoicesTable.previousDebt,
    total: invoicesTable.total,
    createdAt: invoicesTable.createdAt,
    clientName: clientsTable.name
  })
  .from(invoicesTable)
  .innerJoin(clientsTable, eq(invoicesTable.client, clientsTable.id))
  .where(eq(invoicesTable.organization, organization))
  .orderBy(desc(invoicesTable.createdAt));
}
