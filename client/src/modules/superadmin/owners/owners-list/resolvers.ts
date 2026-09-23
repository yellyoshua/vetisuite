import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import ownersService from '@/modules/superadmin/owners/owners.service'
import type { Owner } from '@/modules/superadmin/owners/owners.schema'

export default {
  owners: (_params: Readonly<Params>, search: ResolverSearch) => ownersService.get<Owner[]>({ search: search.search, page: search.page }),
}
