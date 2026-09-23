import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import { parseInput } from '@/lib/parse-input'
import { visitAdvanceSchema, type Visit, type VisitAdvanceInput } from '@/modules/employee/visits/visits.schema'
import visitsService from '@/modules/employee/visits/visits.service'
import visitsCountService from '@/modules/employee/visits/visits-count.service'
import visitsStatusService from '@/modules/employee/visits/visits-status.service'

export async function advanceVisit(input: VisitAdvanceInput): Promise<{ success: boolean; visit?: unknown }> {
  const parsed = parseInput(visitAdvanceSchema, input)

  return visitsStatusService.put<{ success: boolean; visit?: unknown }>({ id: parsed.visitId })
}

export default {
  visits: async (_params: Readonly<Params>, search: ResolverSearch) => {
    const [visits] = await Promise.all([
      visitsService.get<Visit[]>({
        search: search.search ? String(search.search) : undefined,
        staff: search.staff ? String(search.staff) : undefined,
        limit: 100,
      }),
      visitsCountService.get<{ value: number }>({
        search: search.search ? String(search.search) : undefined,
        staff: search.staff ? String(search.staff) : undefined,
      }),
    ])

    return visits || []
  },
}
