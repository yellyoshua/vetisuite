import { CalendarDays, ChevronDown, EllipsisVertical, ListFilter, Plus, Trash2 } from 'lucide-react'
import Button from './button'

export default function ButtonDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button>
          <Plus aria-hidden="true" />
          Nueva cita
        </Button>
        <Button variant="outline">
          <CalendarDays aria-hidden="true" />
          Semana pasada
          <ChevronDown aria-hidden="true" />
        </Button>
        <Button variant="outline">
          <ListFilter aria-hidden="true" />
          Filtrar
        </Button>
        <Button variant="outline" size="icon" aria-label="Más acciones">
          <EllipsisVertical aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary">Borrador</Button>
        <Button variant="ghost">Omitir</Button>
        <Button variant="destructive">
          <Trash2 aria-hidden="true" />
          Eliminar
        </Button>
        <Button disabled>Deshabilitado</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Pequeño</Button>
        <Button size="md">Mediano</Button>
        <Button size="lg">Grande</Button>
        <Button className="bg-foreground text-background">className externo gana</Button>
      </div>
    </div>
  )
}
