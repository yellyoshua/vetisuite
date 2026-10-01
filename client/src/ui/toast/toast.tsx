import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import useToast, { type ToastProps } from './toast.handlers'

const icons = { default: Info, success: CircleCheck, destructive: CircleAlert }

export default function Toast(props: ToastProps) {
  const { isOpen, variant, regionProps, toastProps, closeProps } = useToast(props)
  const Icon = icons[variant]

  return (
    <div {...regionProps}>
      {isOpen && (
        <div {...toastProps}>
          <Icon data-toast-icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-sm font-medium break-words">{props.title}</p>
            {props.description && <p className="break-words text-muted-foreground">{props.description}</p>}
          </div>
          <button {...closeProps}>
            <X aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
