import { Link } from 'react-router'
import Icon, { type IconName } from '@/components/legacy-ui/Icon'
import Tooltip from '@/components/legacy-ui/Tooltip'
import type { NavEntry } from '@/constants/navigation'
import { OWNER_WORKSPACE } from './navigation'

type BreadcrumbsProps = {
  pathname: string
  activeEntry: NavEntry | null
}

type Crumb = {
  label: string
  icon: IconName
  path: string
  isCurrent: boolean
}

function buildCrumbs(pathname: string, activeEntry: NavEntry | null): Crumb[] {
  const workspace = OWNER_WORKSPACE
  const summaryPath = workspace.entries[0].path
  const workspaceCrumb: Crumb = {
    label: workspace.label,
    icon: workspace.icon,
    path: summaryPath,
    isCurrent: pathname === summaryPath,
  }
  if (!activeEntry || activeEntry.path === summaryPath) {
    return [workspaceCrumb]
  }

  return [
    workspaceCrumb,
    { label: activeEntry.label, icon: activeEntry.icon, path: activeEntry.path, isCurrent: pathname === activeEntry.path },
  ]
}

export default function Breadcrumbs({ pathname, activeEntry }: BreadcrumbsProps) {
  const crumbs = buildCrumbs(pathname, activeEntry)

  return (
    <nav
      aria-label="Migas de pan"
      className="flex h-[38px] shrink-0 items-center overflow-x-auto border-b border-line bg-card px-5"
    >
      <ol className="flex items-center gap-2">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex shrink-0 items-center gap-2">
            {index > 0 && (
              <span className="text-line">
                <Icon name="chevron-right" size={13} />
              </span>
            )}
            {crumb.isCurrent ? (
              <span
                aria-current="page"
                className="flex items-center gap-1.5 font-head text-[12.5px] font-semibold text-ink"
              >
                <span className="text-green">
                  <Icon name={crumb.icon} size={13} />
                </span>
                {crumb.label}
              </span>
            ) : (
              <Tooltip content={`Ir a ${crumb.label}`}>
                {(describedById) => (
                  <Link
                    to={crumb.path}
                    aria-describedby={describedById}
                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-sub"
                  >
                    <Icon name={crumb.icon} size={13} />
                    {crumb.label}
                  </Link>
                )}
              </Tooltip>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
