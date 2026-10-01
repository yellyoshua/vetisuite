import { X } from 'lucide-react'
import useAlert, { type AlertProps } from './alert.handlers'

export default function Alert(props: AlertProps) {
  const { isOpen, title, description, icon, rootProps, closeProps, ...classes } = useAlert(props)

  if (!isOpen) return null

  return (
    <div {...rootProps}>
      {icon && (
        <span data-alert-icon aria-hidden="true" className={classes.iconClassName}>
          {icon}
        </span>
      )}
      <div className={classes.bodyClassName}>
        <p className={classes.titleClassName}>{title}</p>
        {description && <p className={classes.descriptionClassName}>{description}</p>}
      </div>
      <button {...closeProps}>
        <X aria-hidden="true" />
      </button>
    </div>
  )
}
