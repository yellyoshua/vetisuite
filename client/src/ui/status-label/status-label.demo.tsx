import StatusLabel from './status-label'

export default function StatusLabelDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <StatusLabel status="confirmada" />
      <StatusLabel status="pendiente" />
      <StatusLabel status="cancelada" />
      <StatusLabel status="atendida" />
      <StatusLabel status="pendiente" label="Esperando al tutor" />
    </div>
  )
}
