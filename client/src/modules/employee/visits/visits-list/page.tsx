import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import { VISIT_BOARD_SCOPES } from '@/constants/visits'
import useListQuery from '@/hooks/use-list-query'
import useMutation from '@/hooks/legacy/use-mutation'
import useResolver from '@/hooks/legacy/use-resolver'
import type { VisitFilterKey, VisitScope } from '../visits.schema'
import VisitBoardColumn from './components/VisitBoardColumn'
import VisitBoardToolbar from './components/VisitBoardToolbar'
import { advanceVisit, resolveVisitBoard } from './resolvers'

const FILTER_KEYS: VisitFilterKey[] = ['staff']

type VisitsListPageProps = {
  scope: VisitScope
}

export default function VisitsListPage({ scope }: VisitsListPageProps) {
  const boardScope = VISIT_BOARD_SCOPES[scope]
  const { query, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading, refetch } = useResolver(resolveVisitBoard, {
    scope,
    search: query.search,
    staff: query.filters.staff,
  })
  const [isAdvancing, advance, advanceError] = useMutation(advanceVisit, { onSuccess: refetch })

  return (
    <>
      <PageHeader
        title={boardScope.title}
        description={boardScope.description}
        actions={
          <Button isDisabled>
            <Icon name="plus" size={14} /> {boardScope.actionLabel}
          </Button>
        }
      />
      <VisitBoardToolbar
        search={query.search}
        staff={query.filters.staff}
        staffNames={data?.staffNames ?? []}
        summary={data?.summary ?? null}
        onSearchChange={setSearch}
        onStaffChange={(staff) => setFilter('staff', staff)}
      />
      {advanceError && (
        <p role="alert" className="mb-3 text-[12.5px] text-red">
          {advanceError.message}
        </p>
      )}
      {isLoading && !data && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(272px,100%),1fr))] items-start gap-3.5">
          {data.columns.map((column) => (
            <VisitBoardColumn
              key={column.status}
              column={column}
              label={boardScope.columnLabels[column.status]}
              advanceLabel={boardScope.advanceLabels[column.status]}
              isTypeVisible={boardScope.isTypeVisible}
              isAdvancing={isAdvancing}
              onAdvance={(visitId) => advance({ visitId })}
            />
          ))}
        </div>
      )}
    </>
  )
}
