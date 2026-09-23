import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import superadminsService from '@/modules/superadmin/superadmins/superadmins.service'
import type { Superadmin } from '@/modules/superadmin/superadmins/superadmins.schema'

export default {
  superadmins: (_params: Readonly<Params>, search: ResolverSearch) => superadminsService.get<Superadmin[]>({ search: search.search, page: search.page }),
}
