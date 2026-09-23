import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VISIT_STATUS_DOT_CLASS_NAMES } from '@/constants/visits'
import type { Visit, VisitStatus } from '@/modules/employee/visits/visits.schema'
import VisitCard from './VisitCard'

type VisitBoardColumnProps = {
  status: VisitStatus
  visits: Visit[]
  label: string
  advanceLabel: string
  isTypeVisible: boolean
  isAdvancing: boolean
  onAdvance: (visitId: string) => void
}

export default function VisitBoardColumn({
  status,
  visits,
  label,
  advanceLabel,
  isTypeVisible,
  isAdvancing,
  onAdvance,
}: VisitBoardColumnProps) {
  return (
    <section className="rounded-card border border-line bg-card p-3.5">
      <div className="flex items-center gap-2 px-0.5 pt-0.5 pb-3">
        <span aria-hidden="true" className={`size-[9px] shrink-0 rounded-full ${VISIT_STATUS_DOT_CLASS_NAMES[status]}`} />
        <h2 className="m-0 min-w-0 flex-1 font-head text-[13px] font-semibold tracking-[0.2px] text-sub uppercase">{label}</h2>
        <span className="font-head text-[12.5px] font-bold text-ink tabular-nums">{visits.length}</span>
        {status === 'pending' && (
          <Button variant="secondary" size="icon-sm" aria-label="Añadir a esta etapa" disabled>
            <PlusIcon />
          </Button>
        )}
      </div>
      {visits.length === 0 && (
        <p className="rounded-row border border-dashed border-line px-3 py-5 text-center text-xs text-sub">
          Sin pacientes en esta etapa
        </p>
      )}
      <ul className="flex flex-col gap-2.5">
        {visits.map((visit) => (
          <VisitCard
            key={visit.id}
            visit={visit}
            advanceLabel={advanceLabel}
            isTypeVisible={isTypeVisible}
            isAdvancing={isAdvancing}
            onAdvance={onAdvance}
          />
        ))}
      </ul>
    </section>
  )
}
