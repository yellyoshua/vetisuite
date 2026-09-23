import { useMemo } from 'react'
import { PlusIcon, SearchIcon } from 'lucide-react'
import useMutation from '@/hooks/use-mutation'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import OptionSelect from '@/components/OptionSelect/OptionSelect'
import { Button } from '@/components/ui/button'
import { VISIT_BOARD_SCOPES, VISIT_STATUS_VALUES } from '@/constants/visits'
import type { Visit, VisitScope } from '@/modules/employee/visits/visits.schema'
import { advanceVisit } from '../resolvers'
import VisitBoardColumn from './VisitBoardColumn'

type VisitsProps = {
  scope: VisitScope
  visits: Visit[]
  refetch: () => void
}

export default function Visits({ scope, visits, refetch }: VisitsProps) {
  const boardScope = VISIT_BOARD_SCOPES[scope]
  const { search, changeQuery, query } = useQueryParams()
  const [isAdvancing, advance] = useMutation((visitId: string) => advanceVisit({ visitId }), {
    skipConfirm: true,
    successMessage: 'Visita actualizada correctamente',
    onSuccess: () => refetch(),
  })
  const scopedVisits = useMemo(() => visits.filter((visit) => scope === 'all' || visit.type === scope), [visits, scope])
  const billableCount = scopedVisits.filter((visit) => visit.status === 'done').length
  const teamNames = useMemo(() => {
    return Array.from(new Set(visits.map((visit) => visit.staffName).filter(Boolean)))
  }, [visits])
  const staffOptions = [{ value: '', label: 'Todo el equipo' }, ...teamNames.map((staffName) => ({ value: staffName, label: staffName }))]

  return (
    <CustomPage
      title={boardScope.title}
      description={boardScope.description}
      actions={
        <Button disabled>
          <PlusIcon /> {boardScope.actionLabel}
        </Button>
      }
    >
      <CustomPageContainer>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              aria-label="Buscar visitas"
              placeholder="Busca por paciente o dueño…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Responsable" value={query.staff || ''} options={staffOptions} onChange={(staff) => changeQuery({ staff })} />
          <span className="text-xs text-sub tabular-nums sm:ml-auto">
            {scopedVisits.length - billableCount} visitas abiertas · {billableCount} listas para facturar
          </span>
        </div>
      </CustomPageContainer>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(272px,100%),1fr))] items-start gap-3.5">
        {VISIT_STATUS_VALUES.map((status) => (
          <VisitBoardColumn
            key={status}
            status={status}
            visits={scopedVisits.filter((visit) => visit.status === status)}
            label={boardScope.columnLabels[status]}
            advanceLabel={boardScope.advanceLabels[status]}
            isTypeVisible={boardScope.isTypeVisible}
            isAdvancing={isAdvancing}
            onAdvance={advance}
          />
        ))}
      </div>
    </CustomPage>
  )
}
