import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import type { ReactNode } from 'react'
import SidebarGroup from './components/sidebar-group'
import useSidebar, { type SidebarProps } from './sidebar.handlers'

type SidebarState = ReturnType<typeof useSidebar>
type RenderedSection = SidebarState['desktopSections'][number]

function renderSections(sections: RenderedSection[], s: SidebarState): ReactNode {
  return sections.map((section) => (
    <div key={section.key} className="flex flex-col">
      {section.label && <p className={s.sectionLabelClassName}>{section.label}</p>}
      <ul className="flex flex-col gap-0.5">
        {section.items.map((entry) => (
          <li key={entry.key}>
            {entry.item.children?.length ? (
              <SidebarGroup item={entry.item} groupId={entry.groupId} compact={entry.compact} onExpand={s.expand} badgeClassName={s.itemBadgeClassName} />
            ) : (
              <a {...entry.props}>
                {entry.item.icon && <span aria-hidden="true">{entry.item.icon}</span>}
                <span className={entry.labelClassName}>{entry.item.label}</span>
                {!entry.compact && entry.item.badge && <span className={s.itemBadgeClassName}>{entry.item.badge}</span>}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  ))
}

export default function Sidebar(props: SidebarProps) {
  const s = useSidebar(props)

  return (
    <>
      <button {...s.triggerProps}>
        <Menu aria-hidden="true" />
      </button>
      <dialog {...s.dialogProps}>
        <div className={s.headerClassName}>
          {s.header}
          <button {...s.drawerCloseProps}>
            <X aria-hidden="true" />
          </button>
        </div>
        {s.drawerSearch && <div className={s.slotClassName}>{s.drawerSearch}</div>}
        <nav {...s.drawerNavProps}>{renderSections(s.drawerSections, s)}</nav>
        {s.drawerFooter && <div className={s.footerClassName}>{s.drawerFooter}</div>}
      </dialog>
      <aside {...s.rootProps}>
        <div className={s.headerClassName}>
          {s.header}
          <button {...s.collapseProps}>{s.isCollapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}</button>
        </div>
        {s.search && <div className={s.slotClassName}>{s.search}</div>}
        <nav {...s.navProps}>{renderSections(s.desktopSections, s)}</nav>
        {s.footer && <div className={s.footerClassName}>{s.footer}</div>}
      </aside>
    </>
  )
}
