import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'

export default {
  token: async (_params: Readonly<Params>, search: ResolverSearch) => String(search.token || ''),
}
