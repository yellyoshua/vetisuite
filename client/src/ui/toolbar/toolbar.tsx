import useToolbar, { type ToolbarProps } from './toolbar.handlers'

export default function Toolbar(props: ToolbarProps) {
  const { start, end, children, rootProps, startClassName, endClassName } = useToolbar(props)

  return (
    <div {...rootProps}>
      {start && <div className={startClassName}>{start}</div>}
      {children}
      {end && <div className={endClassName}>{end}</div>}
    </div>
  )
}
