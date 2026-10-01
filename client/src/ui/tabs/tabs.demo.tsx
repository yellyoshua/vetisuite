import Tabs from './tabs'

const items = [
  { value: 'history', label: 'Historial', content: 'Consulta general el 3 de septiembre: control de peso y revisión dental.' },
  { value: 'vaccines', label: 'Vacunas', content: 'Antirrábica aplicada el 12/10/2025. Polivalente pendiente.' },
  { value: 'lab', label: 'Laboratorio', content: 'Hemograma completo sin alteraciones.' },
  { value: 'billing', label: 'Facturación', content: 'Sin saldos pendientes.', disabled: true },
]

export default function TabsDemo() {
  return <Tabs aria-label="Ficha del paciente" items={items} defaultValue="vaccines" />
}
