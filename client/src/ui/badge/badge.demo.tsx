import { Check } from 'lucide-react'
import Badge from './badge'

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="primary">
        <Check />
        confirmada
      </Badge>
      <Badge>pendiente</Badge>
      <Badge variant="outline">Canino</Badge>
      <Badge variant="muted">Sin historial</Badge>
      <Badge variant="destructive">cancelada</Badge>
      <Badge size="sm">Pequeño</Badge>
      <Badge className="bg-foreground text-background">className externo gana</Badge>
    </div>
  )
}
