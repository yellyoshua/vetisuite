import Dialog from './dialog'

const triggerClassName =
  'inline-flex h-8 cursor-pointer items-center gap-2 rounded-control border border-border bg-card px-2.5 text-sm text-foreground shadow-control transition-colors motion-reduce:transition-none duration-200 hover:bg-accent dark:shadow-none [&_svg]:size-4'

export default function DialogDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog
        trigger="Abrir diálogo"
        triggerClassName={triggerClassName}
        title="Eliminar cita"
        description="Esta acción no se puede deshacer."
      >
        {(close) => (
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={close} className={triggerClassName}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-8 cursor-pointer items-center rounded-control bg-danger px-2.5 text-sm text-primary-foreground transition-colors motion-reduce:transition-none duration-200 hover:bg-danger/90"
            >
              Eliminar
            </button>
          </div>
        )}
      </Dialog>
    </div>
  )
}
