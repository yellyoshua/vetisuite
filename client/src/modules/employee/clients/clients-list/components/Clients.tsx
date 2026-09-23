import { Link } from 'react-router'
import { PawPrintIcon, PencilIcon, PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/date'
import type { Client } from '@/modules/employee/clients/clients.schema'

type ClientsProps = {
  clients: Client[]
}

export default function Clients({ clients }: ClientsProps) {
  const { nextPage, prevPage, search, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Clientes y Pacientes"
      description="Dueños y sus mascotas."
      actions={
        <Button asChild>
          <Link to="/clients/create">
            <PlusIcon className="w-5 h-5" />
            Nuevo cliente
          </Link>
        </Button>
      }
    >
      <CustomPageContainer>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />

          <input
            type="text"
            aria-label="Buscar clientes"
            placeholder="Busca por nombre, teléfono o correo…"
            defaultValue={query.search || ''}
            onChange={({ target }) => search(target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
          />
        </div>
      </CustomPageContainer>

      <CustomTable dataSize={clients.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Cliente</CustomTable.TheadItem>
            <CustomTable.TheadItem>Teléfono</CustomTable.TheadItem>
            <CustomTable.TheadItem>Correo</CustomTable.TheadItem>
            <CustomTable.TheadItem>Registrado</CustomTable.TheadItem>
            <CustomTable.TheadItem className="text-right">Acciones</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {clients.map((client) => (
            <CustomTable.TableRow key={client.id}>
              <CustomTable.TBodyItem className="font-medium">{client.name}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{client.phone}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{client.email || '—'}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{formatDate(client.createdAt)}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem type="actions">
                <CustomTooltip content="Mascotas">
                  <Button asChild variant="outline" size="icon">
                    <Link to={`/clients/${client.id}/patients`} aria-label={`Ver mascotas de ${client.name}`}>
                      <PawPrintIcon className="w-4 h-4 text-green" />
                    </Link>
                  </Button>
                </CustomTooltip>
                <CustomTooltip content="Editar">
                  <Button asChild variant="outline" size="icon">
                    <Link to={`/clients/${client.id}/edit`} aria-label={`Editar a ${client.name}`}>
                      <PencilIcon className="w-4 h-4 text-blue" />
                    </Link>
                  </Button>
                </CustomTooltip>
              </CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
