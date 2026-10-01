import { PawPrint } from 'lucide-react'
import List, { ListItem } from './list'

const patients = [
  { name: 'Luna', detail: 'Golden Retriever · 4 años' },
  { name: 'Michi', detail: 'Gato europeo · 2 años' },
  { name: 'Rocky', detail: 'Bulldog francés · 7 años' },
]

export default function ListDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <List variant="bordered">
        {patients.map((patient) => (
          <ListItem key={patient.name}>
            <PawPrint aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate font-medium">{patient.name}</p>
              <p className="truncate text-xs text-muted-foreground">{patient.detail}</p>
            </div>
          </ListItem>
        ))}
      </List>
      <List variant="plain">
        <ListItem className="px-0">Desparasitación interna</ListItem>
        <ListItem className="px-0">Vacuna polivalente</ListItem>
        <ListItem className="px-0 font-medium text-primary">className externo gana</ListItem>
      </List>
    </div>
  )
}
