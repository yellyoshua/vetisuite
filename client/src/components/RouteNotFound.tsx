import ErrorState from '@/components/ErrorState'
import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import { NotFoundError } from '@/lib/not-found-error'

const ROUTE_NOT_FOUND_ERROR = new NotFoundError('La dirección no corresponde a ninguna pantalla. Usa el menú para continuar.')

export default function RouteNotFound() {
  return (
    <>
      <PageHeader title="Página no encontrada" description="Revisa la dirección o elige un módulo en el menú." />
      <Card>
        <ErrorState error={ROUTE_NOT_FOUND_ERROR} />
      </Card>
    </>
  )
}
