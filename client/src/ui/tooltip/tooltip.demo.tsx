import { Info } from 'lucide-react'
import Tooltip from './tooltip'

const triggerClassName =
  'inline-flex h-8 cursor-pointer items-center gap-2 rounded-control border border-border bg-card px-2.5 text-sm text-foreground shadow-control transition-colors motion-reduce:transition-none duration-200 hover:bg-accent dark:shadow-none [&_svg]:size-4'

export default function TooltipDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-8">
      <Tooltip content="Guarda los cambios de la ficha">
        <button type="button" className={triggerClassName}>
          Arriba
        </button>
      </Tooltip>
      <Tooltip side="bottom" content="Información del paciente">
        <button type="button" aria-label="Información" className={triggerClassName}>
          <Info />
        </button>
      </Tooltip>
    </div>
  )
}
