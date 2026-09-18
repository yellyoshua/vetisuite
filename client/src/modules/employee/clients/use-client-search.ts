import type { Client } from './clients.schema'

export type ClientSearchState = {
  search: string
  clients: Client[]
  isSearching: boolean
  setSearch: (search: string) => void
}

export default function useClientSearch(): ClientSearchState {
  throw new Error('Not implemented: useClientSearch')
}
