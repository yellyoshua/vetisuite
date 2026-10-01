import useDropdownMenu, { type DropdownMenuProps } from './dropdown-menu.handlers'

export default function DropdownMenu(props: DropdownMenuProps) {
  const { rootProps, triggerProps, menuProps, items } = useDropdownMenu(props)

  return (
    <div {...rootProps}>
      <button {...triggerProps}>{props.trigger}</button>
      <div {...menuProps}>
        {items.map((item) => (
          <button key={item.key} {...item.props}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
