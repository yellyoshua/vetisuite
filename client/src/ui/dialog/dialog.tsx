import { X } from 'lucide-react'
import useDialog, { type DialogProps } from './dialog.handlers'

export default function Dialog(props: DialogProps) {
  const { titleId, descriptionId, content, triggerProps, dialogProps, closeProps } = useDialog(props)

  return (
    <>
      <button {...triggerProps}>{props.trigger}</button>
      <dialog {...dialogProps}>
        <div className="relative flex flex-col">
          <div className="flex flex-col gap-1 p-3 pr-11">
            <h2 id={titleId} className="font-body text-sm font-medium text-balance text-foreground">
              {props.title}
            </h2>
            {props.description && (
              <p id={descriptionId} className="text-[13px] text-muted-foreground">
                {props.description}
              </p>
            )}
          </div>
          {content && <div className="rounded-row border border-border bg-card p-3 text-[13px]">{content}</div>}
          <button {...closeProps}>
            <X aria-hidden="true" />
          </button>
        </div>
      </dialog>
    </>
  )
}
