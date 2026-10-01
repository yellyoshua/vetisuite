import useTableToolbar, { type TableToolbarProps } from './table-toolbar.handlers'

export default function TableToolbar(props: TableToolbarProps) {
  const { title, icon, search, actions, rootProps, titleClassName, controlsClassName } = useTableToolbar(props)

  return (
    <div {...rootProps}>
      <h3 className={titleClassName}>
        {icon}
        <span className="truncate">{title}</span>
      </h3>
      {(search || actions) && (
        <div className={controlsClassName}>
          {search}
          {actions}
        </div>
      )}
    </div>
  )
}
