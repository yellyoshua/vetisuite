import Input from '@/components/legacy-ui/Input'
import Select from '@/components/legacy-ui/Select'
import type { VisitBoardSummary } from '../../visits.schema'

const SEARCH_PLACEHOLDER = 'Busca por paciente o dueño…'

type VisitBoardToolbarProps = {
  search: string
  staff: string
  staffNames: string[]
  summary: VisitBoardSummary | null
  onSearchChange: (search: string) => void
  onStaffChange: (staff: string) => void
}

export default function VisitBoardToolbar({
  search,
  staff,
  staffNames,
  summary,
  onSearchChange,
  onStaffChange,
}: VisitBoardToolbarProps) {
  return (
    <search className="mb-3.5 flex flex-wrap items-center gap-2">
      <div className="min-w-0 flex-[1_1_220px]">
        <Input
          type="search"
          name="search"
          autoComplete="off"
          aria-label={SEARCH_PLACEHOLDER}
          placeholder={SEARCH_PLACEHOLDER}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="w-[200px] flex-[0_0_200px]">
        <Select name="staff" aria-label="Responsable" value={staff} onChange={(event) => onStaffChange(event.target.value)}>
          <option value="">Todo el equipo</option>
          {staffNames.map((staffName) => (
            <option key={staffName} value={staffName}>
              {staffName}
            </option>
          ))}
        </Select>
      </div>
      {summary && (
        <span className="ml-auto text-xs text-sub tabular-nums">
          {summary.openCount} visitas abiertas · {summary.billableCount} listas para facturar
        </span>
      )}
    </search>
  )
}
