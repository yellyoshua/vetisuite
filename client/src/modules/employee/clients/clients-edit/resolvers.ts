import { NotFoundError } from '@/lib/not-found-error'
import { parseInput } from '@/lib/parse-input'
import { clientSchema, type Client, type ClientInput } from '../clients.schema'
import { CLIENTS } from '../clients-list/resolvers'

type ClientParams = {
  clientId: string
}

type ClientUpdate = ClientParams & {
  input: ClientInput
}

function findClient(clientId: string): Client {
  const client = CLIENTS.find((candidate) => candidate.id === clientId)
  if (!client) {
    throw new NotFoundError('No encontramos el cliente que buscas.')
  }

  return client
}

export function resolveClientEdit({ clientId }: ClientParams): Promise<Client> {
  return Promise.resolve().then(() => findClient(clientId))
}

export function updateClient({ clientId, input }: ClientUpdate): Promise<Client> {
  return Promise.resolve().then(() => {
    const client = findClient(clientId)
    const updatedClient: Client = { ...client, ...parseInput(clientSchema, input) }
    CLIENTS.splice(CLIENTS.indexOf(client), 1, updatedClient)

    return updatedClient
  })
}
