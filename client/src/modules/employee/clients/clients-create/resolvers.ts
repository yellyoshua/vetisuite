import { parseInput } from '@/lib/parse-input'
import { toIsoDate } from '@/lib/to-iso-date'
import { clientSchema, type Client, type ClientInput } from '../clients.schema'
import { CLIENTS } from '../clients-list/resolvers'

export function createClient(input: ClientInput): Promise<Client> {
  return Promise.resolve().then(() => {
    const client: Client = {
      ...parseInput(clientSchema, input),
      id: crypto.randomUUID(),
      status: 'active',
      hasOpenAccount: false,
      createdAt: toIsoDate(new Date()),
      lastVisitAt: null,
      petNames: [],
    }
    CLIENTS.unshift(client)

    return client
  })
}
