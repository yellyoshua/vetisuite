import {and, asc, eq, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {invoicesItemTable, productsTable} from '@vetisuite/database/schemas/schemas.js';

const AREA_LABELS = {
  clinic: 'Consulta Médica',
  grooming: 'Estética y Peluquería',
  laboratory: 'Laboratorio'
};

export async function getDashboardInventory (organization) {
  const [productsRows, itemRows] = await Promise.all([
    fetchProducts(organization),
    fetchInvoiceItems(organization)
  ]);

  const alertProducts = productsRows.filter((item) => Number(item.stock || 0) <= Number(item.minStock || 0));
  const totalValue = productsRows.reduce((acc, item) => acc + (Number(item.stock || 0) * Number(item.price || 0)), 0);

  const kpis = {
    stockAlerts: {value: String(alertProducts.length), detail: 'productos con stock crítico'},
    inventoryValue: {value: `$${Math.round(totalValue)}`, detail: 'valor estimado en inventario'}
  };

  const consumptionItems = buildConsumptionByArea(itemRows);

  const panels = {
    stockAlerts: {
      meta: `${alertProducts.length} productos bajo mínimo`,
      items: alertProducts.slice(0, 10).map((item) => ({
        name: item.name,
        detail: `Mínimo: ${item.minStock} uds · Precio: $${item.price}`,
        badge: `${item.stock} uds`,
        tone: Number(item.stock || 0) === 0 ? 'red' : 'amber'
      }))
    },
    consumptionByArea: {
      meta: 'cargos por área operativa',
      items: consumptionItems
    }
  };

  return {kpis, panels};
}

async function fetchProducts (organization) {
  return db.select({
    id: productsTable.id,
    name: productsTable.name,
    category: productsTable.category,
    stock: productsTable.stock,
    minStock: productsTable.minStock,
    price: productsTable.price,
    expiry: productsTable.expiry
  })
  .from(productsTable)
  .where(and(
    eq(productsTable.organization, organization),
    isNull(productsTable.archivedAt)
  ))
  .orderBy(asc(productsTable.stock));
}

async function fetchInvoiceItems (organization) {
  return db.select({
    id: invoicesItemTable.id,
    area: invoicesItemTable.area,
    amount: invoicesItemTable.amount
  })
  .from(invoicesItemTable)
  .where(eq(invoicesItemTable.organization, organization));
}

function buildConsumptionByArea (itemRows) {
  const grouped = itemRows.reduce((acc, row) => {
    if (!acc[row.area]) {
      acc[row.area] = {count: 0, amount: 0};
    }

    acc[row.area].count += 1;
    acc[row.area].amount += Number(row.amount || 0);

    return acc;
  }, {});

  return Object.entries(grouped).map(([area, data]) => ({
    name: AREA_LABELS[area] || area,
    detail: `${data.count} cargos generados`,
    badge: `$${Math.round(data.amount)}`,
    tone: 'blue'
  }));
}
