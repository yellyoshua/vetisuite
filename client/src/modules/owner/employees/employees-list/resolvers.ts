import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import employeesService from '@/modules/owner/employees/employees.service'
import type { Employee } from '@/modules/owner/employees/employees.schema'

export default {
  employees: (_params: Readonly<Params>, search: ResolverSearch) => employeesService.get<Employee[]>({ search: search.search, page: search.page }),
}
