import useTableSelectionBar, { type TableSelectionBarProps } from './table-selection-bar.handlers'

export default function TableSelectionBar(props: TableSelectionBarProps) {
  const { visible, children, statusText, barProps, statusProps, actionsProps, clearProps } = useTableSelectionBar(props)

  return (
    <>
      <span {...statusProps} className="sr-only">{visible ? statusText : ''}</span>
      {visible && (
        <div {...barProps}>
          <span aria-hidden="true" className={statusProps.className}>{statusText}</span>
          <div {...actionsProps}>{children}</div>
          <button {...clearProps}>Deseleccionar todo</button>
        </div>
      )}
    </>
  )
}
