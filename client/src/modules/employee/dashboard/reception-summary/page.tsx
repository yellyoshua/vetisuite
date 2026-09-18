import DonutChart from '@/components/DonutChart'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/ui/Badge'
import ButtonLink from '@/components/ui/ButtonLink'
import Meter from '@/components/ui/Meter'
import useResolver from '@/hooks/use-resolver'
import DailyBarChart from '../components/DailyBarChart'
import SummaryKpis, { type KpiDefinition } from '../components/SummaryKpis'
import SummaryPanel from '../components/SummaryPanel'
import type { AgendaEntry, DemandHour, ReceptionKpiKey, ReceptionSummary } from '../dashboard.schema'
import { resolveReceptionSummary } from './resolvers'

const KPIS: KpiDefinition<ReceptionKpiKey>[] = [
  { key: 'todayAppointments', label: 'Citas de hoy', icon: 'calendar-days', tone: 'green' },
  { key: 'confirmed', label: 'Confirmadas', icon: 'check', tone: 'green' },
  { key: 'pending', label: 'Pendientes', icon: 'clock', tone: 'amber' },
  { key: 'attendance', label: 'Asistencia', icon: 'trending-up', tone: 'blue' },
]

function TodayStatusChart({ statuses }: { statuses: ReceptionSummary['todayStatuses'] }) {
  return (
    <DonutChart
      total={statuses.total}
      unit="citas"
      segments={statuses.segments}
      legendFooter={
        <p className="flex items-center gap-2 border-t border-line-soft pt-2 text-[12.5px]">
          <span className="flex-1 text-sub">Canceladas y no asistió</span>
          <b className="tabular-nums">{statuses.cancelledOrNoShow}</b>
        </p>
      }
    />
  )
}

function DemandHours({ hours }: { hours: DemandHour[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-[11px]">
      {hours.map((hour) => (
        <li key={hour.label} className="flex items-center gap-2.5">
          <span className="w-[52px] text-[11.5px] text-sub tabular-nums">{hour.label}</span>
          <Meter percent={hour.percent} />
          <span className="w-6 text-right text-[11.5px] font-semibold tabular-nums">{hour.value}</span>
        </li>
      ))}
    </ul>
  )
}

function TodayAgenda({ entries }: { entries: AgendaEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState title="Sin citas para hoy" hint="Las citas agendadas para hoy aparecerán aquí." />
  }

  return (
    <ul className="mt-2.5">
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line-soft py-[11px]">
          <span className="w-11 font-head text-[13px] font-semibold text-ink tabular-nums">{entry.time}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-ink">
              {entry.patientName} <span className="font-normal text-sub">· {entry.ownerName}</span>
            </p>
            <p className="text-[12px] text-sub">{entry.detail}</p>
          </div>
          <Badge tone={entry.tone}>{entry.status}</Badge>
        </li>
      ))}
    </ul>
  )
}

function ReceptionSummaryContent({ summary }: { summary: ReceptionSummary }) {
  return (
    <>
      <SummaryKpis definitions={KPIS} values={summary.kpis} />
      <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-3.5">
        <SummaryPanel title="Citas por día" meta="últimos 7 días">
          <DailyBarChart bars={summary.dailyAppointments} />
        </SummaryPanel>
        <SummaryPanel title="Estado de las citas de hoy">
          <TodayStatusChart statuses={summary.todayStatuses} />
        </SummaryPanel>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-3.5">
        <SummaryPanel title="Horas con más demanda" meta="últimos 30 días">
          <DemandHours hours={summary.demandHours} />
        </SummaryPanel>
        <SummaryPanel
          title="Agenda de hoy"
          action={
            <ButtonLink to="/appointments" variant="ghost" size="sm">
              Ver citas
            </ButtonLink>
          }
        >
          <TodayAgenda entries={summary.agenda} />
        </SummaryPanel>
      </div>
    </>
  )
}

export default function ReceptionSummaryPage() {
  const { data, error, isLoading } = useResolver(resolveReceptionSummary, {})

  return (
    <>
      <PageHeader
        title="Recepción"
        description="Ingesta y reparto: agenda del día y el tablero maestro de visitas desde el que se deriva a cada área de atención."
      />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && <ReceptionSummaryContent summary={data} />}
    </>
  )
}
