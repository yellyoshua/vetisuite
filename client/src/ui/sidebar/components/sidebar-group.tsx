import { ChevronRight } from 'lucide-react'
import useSidebarGroup, { type SidebarGroupProps } from './sidebar-group.handlers'

export default function SidebarGroup(props: SidebarGroupProps & { badgeClassName: string }) {
  const g = useSidebarGroup(props)

  return (
    <>
      <button {...g.buttonProps}>
        {g.item.icon && <span aria-hidden="true">{g.item.icon}</span>}
        <span className={g.labelClassName}>{g.item.label}</span>
        {!g.compact && <ChevronRight aria-hidden="true" className={g.chevronClassName} />}
      </button>
      {!g.compact && (
        <ul {...g.listProps} hidden={!g.open}>
          {g.subItems.map((sub) => (
            <li key={sub.key}>
              <a {...sub.props}>
                <span className="min-w-0 flex-1 truncate">{sub.label}</span>
                {sub.badge && <span className={props.badgeClassName}>{sub.badge}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
