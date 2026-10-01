import Separator from './separator'

export default function SeparatorDemo() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p>Datos del paciente</p>
      <Separator />
      <div className="flex h-5 items-center gap-3">
        <span>Consultas</span>
        <Separator orientation="vertical" />
        <span>Vacunas</span>
        <Separator orientation="vertical" decorative />
        <span>Laboratorio</span>
      </div>
      <Separator className="h-0.5 bg-primary" />
    </div>
  )
}
