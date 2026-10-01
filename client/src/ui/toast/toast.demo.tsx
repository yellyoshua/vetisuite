import Toast from './toast'
import useToastDemo from './toast.demo.handlers'

const triggerClassName =
  'inline-flex h-8 cursor-pointer items-center gap-2 rounded-control border border-border bg-card px-2.5 text-sm text-foreground shadow-control transition-colors motion-reduce:transition-none duration-200 hover:bg-accent dark:shadow-none'

const content = {
  default: { title: 'Recordatorio enviado', description: 'El cliente recibirá el aviso de la cita.' },
  success: { title: 'Cita guardada', description: 'Max · jueves 10:30 con la Dra. Paredes.' },
  destructive: { title: 'No se pudo guardar', description: 'Revisa los campos marcados e inténtalo de nuevo.' },
}

export default function ToastDemo() {
  const { open, setOpen, variant, show } = useToastDemo()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={triggerClassName} onClick={() => show('default')}>
        Mostrar aviso
      </button>
      <button type="button" className={triggerClassName} onClick={() => show('success')}>
        Éxito
      </button>
      <button type="button" className={triggerClassName} onClick={() => show('destructive')}>
        Error
      </button>
      <div className="fixed inset-x-4 bottom-4 z-50 flex justify-center sm:right-4 sm:left-auto sm:justify-end">
        <Toast
          key={variant}
          open={open}
          onOpenChange={setOpen}
          variant={variant}
          duration={5000}
          title={content[variant].title}
          description={content[variant].description}
        />
      </div>
    </div>
  )
}
