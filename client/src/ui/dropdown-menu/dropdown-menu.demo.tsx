import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import DropdownMenu from './dropdown-menu'

const triggerClassName =
  'inline-flex h-8 cursor-pointer items-center gap-2 rounded-control border border-border bg-card px-2.5 text-sm text-foreground shadow-control transition-colors motion-reduce:transition-none duration-200 hover:bg-accent dark:shadow-none [&_svg]:size-4'

export default function DropdownMenuDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownMenu
        triggerClassName={triggerClassName}
        trigger={
          <>
            Acciones
            <ChevronDown />
          </>
        }
        items={[
          { label: <><Pencil />Editar</> },
          { label: 'Duplicar' },
          { label: 'Archivar', disabled: true },
          { label: <><Trash2 />Eliminar</>, destructive: true },
        ]}
      />
      <DropdownMenu
        align="end"
        triggerClassName={triggerClassName}
        trigger="Alineado al final"
        items={[{ label: 'Perfil' }, { label: 'Ajustes' }, { label: 'Cerrar sesión' }]}
      />
    </div>
  )
}
