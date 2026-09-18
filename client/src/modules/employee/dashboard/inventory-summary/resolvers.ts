import type { InventorySummary } from '../dashboard.schema'

const INVENTORY_SUMMARY: InventorySummary = {
  kpis: {
    stockAlerts: { value: '4', detail: '1 bajo · 1 vencido · 2 por caducar' },
    inventoryValue: { value: '$3 420', detail: '94 productos activos' },
    monthlyOutflows: { value: '168', detail: 'consumidas por las visitas' },
    expiringBatches: { value: '2', detail: 'en los próximos 60 días' },
  },
  panels: {
    stockAlerts: {
      meta: '4 productos',
      items: [
        { name: 'Vacuna Antirrábica', detail: '3 uds · mínimo 5', badge: 'stock bajo', tone: 'red' },
        { name: 'Amoxicilina 250 mg', detail: 'vencido hace 36 días', badge: 'vencido', tone: 'red' },
        { name: 'Vacuna Séxtuple', detail: 'caduca en 9 días', badge: 'por caducar', tone: 'amber' },
        { name: 'Alimento renal 2 kg', detail: 'caduca en 59 días', badge: 'por caducar', tone: 'amber' },
      ],
    },
    consumptionByArea: {
      meta: 'mes en curso',
      items: [
        { name: 'Atención', detail: '84 salidas · $610 en productos', badge: '84', tone: 'blue' },
        { name: 'Estética', detail: '47 salidas · $290 en productos', badge: '47', tone: 'blue' },
        { name: 'Laboratorio', detail: '23 salidas · $140 en insumos', badge: '23', tone: 'blue' },
        { name: 'Bajas por caducidad', detail: '14 unidades descartadas', badge: '14', tone: 'red' },
      ],
    },
  },
}

export function resolveInventorySummary(): Promise<InventorySummary> {
  return Promise.resolve().then(() => INVENTORY_SUMMARY)
}
