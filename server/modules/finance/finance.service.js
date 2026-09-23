import {and, eq, gt, gte, isNull, lte} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {
  clientsTable,
  expensesTable,
  invoicesItemTable,
  invoicesTable
} from '@vetisuite/database/schemas/schemas.js';

const AREA_NAMES = {
  clinic: 'Consulta',
  grooming: 'Estética',
  laboratory: 'Laboratorio'
};

const AREA_KEYS = ['clinic', 'grooming', 'laboratory'];
const PAYMENT_METHODS = ['cash', 'card', 'transfer'];

export async function getFinanceReport (organization, params = {}) {
  const currentRange = resolveRange(params);
  const compRange = resolveComparisonRange(currentRange, params.comparison);

  const [invoices, expenses, invoiceItems, compInvoiceItems, debtorClients] = await Promise.all([
    fetchInvoices(organization, currentRange),
    fetchExpenses(organization, currentRange),
    fetchInvoiceItems(organization, currentRange),
    fetchComparisonInvoiceItems(organization, compRange),
    fetchDebtorClients(organization)
  ]);

  const kpis = computeKpis(invoices, expenses, debtorClients);
  const areasData = computeAreas(invoiceItems, compInvoiceItems, compRange);
  const paymentShares = computePaymentShares(invoices, kpis.income.value);

  return {
    periodLabel: currentRange.periodLabel,
    kpis,
    areas: areasData.areas,
    areaTotals: areasData.totals,
    collectedTotal: kpis.income.value,
    paymentShares
  };
}

function resolveRange (params) {
  const period = params.period || 'month';
  const now = new Date();

  if (period === 'custom' && params.from && params.to) {
    return {
      startDate: new Date(`${params.from}T00:00:00.000Z`),
      endDate: new Date(`${params.to}T23:59:59.999Z`),
      periodLabel: 'personalizado'
    };
  }

  if (period === 'quarter') {
    return resolveQuarterRange(now);
  }

  if (period === 'year') {
    return resolveYearRange(now);
  }

  return resolveMonthRange(now);
}

function resolveMonthRange (referenceDate) {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth();
  const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return {startDate, endDate, periodLabel: 'mes en curso'};
}

function resolveQuarterRange (referenceDate) {
  const year = referenceDate.getUTCFullYear();
  const quarterStartMonth = Math.floor(referenceDate.getUTCMonth() / 3) * 3;
  const startDate = new Date(Date.UTC(year, quarterStartMonth, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, quarterStartMonth + 3, 0, 23, 59, 59, 999));

  return {startDate, endDate, periodLabel: 'trimestre'};
}

function resolveYearRange (referenceDate) {
  const year = referenceDate.getUTCFullYear();
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  return {startDate, endDate, periodLabel: 'año'};
}

function resolveComparisonRange (currentRange, comparison) {
  if (comparison === 'none') {
    return null;
  }

  const {startDate, endDate} = currentRange;

  if (comparison === 'previous-year') {
    return shiftRangeByYears(startDate, endDate, 1);
  }

  return shiftRangeByMonths(startDate, endDate, 1);
}

function shiftRangeByMonths (startDate, endDate, months) {
  const compStart = new Date(Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth() - months,
    startDate.getUTCDate(),
    0, 0, 0, 0
  ));
  const compEnd = new Date(Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth() - months,
    endDate.getUTCDate(),
    23, 59, 59, 999
  ));

  return {startDate: compStart, endDate: compEnd};
}

function shiftRangeByYears (startDate, endDate, years) {
  const compStart = new Date(Date.UTC(
    startDate.getUTCFullYear() - years,
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
    0, 0, 0, 0
  ));
  const compEnd = new Date(Date.UTC(
    endDate.getUTCFullYear() - years,
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
    23, 59, 59, 999
  ));

  return {startDate: compStart, endDate: compEnd};
}

async function fetchInvoices (organization, range) {
  return db.select({
    id: invoicesTable.id,
    subtotal: invoicesTable.subtotal,
    tax: invoicesTable.tax,
    total: invoicesTable.total,
    method: invoicesTable.method,
    createdAt: invoicesTable.createdAt
  })
  .from(invoicesTable)
  .where(and(
    eq(invoicesTable.organization, organization),
    gte(invoicesTable.createdAt, range.startDate),
    lte(invoicesTable.createdAt, range.endDate)
  ));
}

async function fetchExpenses (organization, range) {
  return db.select({
    id: expensesTable.id,
    amount: expensesTable.amount
  })
  .from(expensesTable)
  .where(and(
    eq(expensesTable.organization, organization),
    isNull(expensesTable.archivedAt),
    gte(expensesTable.createdAt, range.startDate),
    lte(expensesTable.createdAt, range.endDate)
  ));
}

async function fetchInvoiceItems (organization, range) {
  return db.select({
    id: invoicesItemTable.id,
    invoice: invoicesItemTable.invoice,
    amount: invoicesItemTable.amount,
    area: invoicesItemTable.area
  })
  .from(invoicesItemTable)
  .where(and(
    eq(invoicesItemTable.organization, organization),
    gte(invoicesItemTable.createdAt, range.startDate),
    lte(invoicesItemTable.createdAt, range.endDate)
  ));
}

async function fetchComparisonInvoiceItems (organization, compRange) {
  if (!compRange) {
    return [];
  }

  return fetchInvoiceItems(organization, compRange);
}

async function fetchDebtorClients (organization) {
  return db.select({
    id: clientsTable.id,
    debt: clientsTable.debt
  })
  .from(clientsTable)
  .where(and(
    eq(clientsTable.organization, organization),
    isNull(clientsTable.archivedAt),
    gt(clientsTable.debt, 0)
  ));
}

function computeKpis (invoices, expenses, debtorClients) {
  const totalIncome = round2(invoices.reduce((sum, inv) => sum + Number(inv.total), 0));
  const totalSubtotal = round2(invoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0));
  const totalVat = round2(invoices.reduce((sum, inv) => sum + Number(inv.tax), 0));
  const totalExpenses = round2(expenses.reduce((sum, exp) => sum + Number(exp.amount), 0));
  const profit = round2(totalIncome - totalExpenses);
  const profitMargin = totalIncome > 0 ? Math.round((profit / totalIncome) * 100) : 0;
  const vatRate = totalSubtotal > 0 ? Math.round((totalVat / totalSubtotal) * 100) : 15;
  const totalReceivable = round2(debtorClients.reduce((sum, client) => sum + Number(client.debt), 0));

  return {
    income: {value: totalIncome, count: invoices.length},
    profit: {value: profit, margin: profitMargin},
    vat: {value: totalVat, rate: vatRate},
    receivable: {value: totalReceivable, count: debtorClients.length}
  };
}

function computeAreas (items, compItems, compRange) {
  if (items.length === 0) {
    return {
      areas: [],
      totals: {invoiceCount: 0, amount: 0, share: 0, delta: 0, trend: 'up'}
    };
  }

  const rawAreas = AREA_KEYS.map((areaKey) => buildAreaEntry(areaKey, items, compItems, compRange));
  const filteredAreas = rawAreas.filter((item) => item.invoiceCount > 0 || item.amount > 0);
  const sortedAreas = filteredAreas.sort((first, second) => second.amount - first.amount);
  const maxAmount = Math.max(...sortedAreas.map((entry) => entry.amount), 0);
  const totalAmount = round2(sortedAreas.reduce((sum, entry) => sum + entry.amount, 0));

  const areasWithPercent = sortedAreas.map((area) => ({
    ...area,
    share: totalAmount > 0 ? Math.round((area.amount / totalAmount) * 100) : 0,
    barPercent: maxAmount > 0 ? Math.round((area.amount / maxAmount) * 100) : 0
  }));

  const totals = buildAreaTotals(items, compItems, compRange, totalAmount);

  return {areas: areasWithPercent, totals};
}

function buildAreaEntry (areaKey, items, compItems, compRange) {
  const areaItems = items.filter((item) => item.area === areaKey);
  const amount = round2(areaItems.reduce((sum, item) => sum + Number(item.amount), 0));
  const uniqueInvoices = new Set(areaItems.map((item) => item.invoice));
  const compAreaItems = compItems.filter((item) => item.area === areaKey);
  const compAmount = round2(compAreaItems.reduce((sum, item) => sum + Number(item.amount), 0));
  const {delta, trend} = calculateDelta(amount, compAmount, compRange);

  return {
    name: AREA_NAMES[areaKey] || areaKey,
    invoiceCount: uniqueInvoices.size,
    amount,
    delta,
    trend
  };
}

function buildAreaTotals (items, compItems, compRange, totalAmount) {
  const uniqueInvoices = new Set(items.map((item) => item.invoice));
  const compTotalAmount = round2(compItems.reduce((sum, item) => sum + Number(item.amount), 0));
  const {delta, trend} = calculateDelta(totalAmount, compTotalAmount, compRange);

  return {
    invoiceCount: uniqueInvoices.size,
    amount: totalAmount,
    share: 100,
    delta,
    trend
  };
}

function calculateDelta (currentAmount, compAmount, compRange) {
  if (!compRange) {
    return {delta: 0, trend: 'up'};
  }

  if (compAmount === 0) {
    const delta = currentAmount > 0 ? 100 : 0;

    return {delta, trend: 'up'};
  }

  const rawDelta = ((currentAmount - compAmount) / compAmount) * 100;
  const delta = Math.round(rawDelta * 10) / 10;

  return {delta, trend: delta >= 0 ? 'up' : 'down'};
}

function computePaymentShares (invoices, collectedTotal) {
  return PAYMENT_METHODS.map((method) => {
    const methodInvoices = invoices.filter((inv) => inv.method === method);
    const methodTotal = round2(methodInvoices.reduce((sum, inv) => sum + Number(inv.total), 0));
    const percent = collectedTotal > 0 ? Math.round((methodTotal / collectedTotal) * 100) : 0;

    return {method, percent};
  });
}

function round2 (value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
