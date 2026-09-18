import type { GroomingSummary } from '../dashboard.schema'

const GROOMING_SUMMARY: GroomingSummary = {
  kpis: {
    todayServices: { value: '3', detail: 'pacientes en estética' },
    inProgress: { value: '1', detail: 'en la mesa ahora' },
    finished: { value: '1', detail: 'por entregar al dueño' },
    averageTicket: { value: '$16.50', detail: 'últimos 30 días' },
  },
  panels: {
    groomingRoom: {
      meta: 'hoy',
      items: [
        { name: 'Nala · Jorge Paredes', detail: 'Corte + baño · David Coro · 09:30', badge: 'en proceso', tone: 'blue' },
        { name: 'Luna · Carolina Ríos', detail: 'Baño completo · Sofía Mena · 08:45', badge: 'pendiente', tone: 'amber' },
        { name: 'Toby · Andrés Lema', detail: 'Baño medicado · Sofía Mena · 08:10', badge: 'terminado', tone: 'green' },
        { name: 'Coco · Paula Andrade', detail: 'Corte de uñas · David Coro · 07:50', badge: 'entregado', tone: 'gray' },
      ],
    },
    topServices: {
      meta: 'últimos 30 días',
      items: [
        { name: 'Baño completo', detail: '42 servicios · $14.00 promedio', badge: '42', tone: 'green' },
        { name: 'Corte + baño', detail: '28 servicios · $22.00 promedio', badge: '28', tone: 'green' },
        { name: 'Baño medicado', detail: '17 servicios · $18.00 promedio', badge: '17', tone: 'blue' },
        { name: 'Corte de uñas', detail: '11 servicios · $6.00 promedio', badge: '11', tone: 'gray' },
      ],
    },
  },
}

export function resolveGroomingSummary(): Promise<GroomingSummary> {
  return Promise.resolve().then(() => GROOMING_SUMMARY)
}
