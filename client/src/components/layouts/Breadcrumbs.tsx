import { Link } from 'react-router'
import { ChevronRightIcon, type LucideIcon } from 'lucide-react'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip'
import type { NavEntry, Workspace } from '@/constants/navigation'

export type BreadcrumbsProps = {
  pathname: string
  workspace: Workspace
  activeEntry: NavEntry | null
}

type Crumb = {
  label: string
  icon: LucideIcon
  path: string
  isCurrent: boolean
}

function buildCrumbs(pathname: string, workspace: Workspace, activeEntry: NavEntry | null): Crumb[] {
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

export default function Breadcrumbs({ pathname, workspace, activeEntry }: BreadcrumbsProps) {
  const crumbs = buildCrumbs(pathname, workspace, activeEntry)

  return (
    <nav
      aria-label="Migas de pan"
      className="flex h-[38px] shrink-0 items-center overflow-x-auto border-b border-line bg-card px-5"
    >
      <ol className="flex items-center gap-2">
        {crumbs.map((crumb, index) => {
          const CrumbIcon = crumb.icon

          return (
          <li key={crumb.path} className="flex shrink-0 items-center gap-2">
            {index > 0 && (
              <span className="text-line">
                <ChevronRightIcon className="size-[13px]" aria-hidden="true" />
              </span>
            )}
            {crumb.isCurrent ? (
              <span
                aria-current="page"
                className="flex items-center gap-1.5 font-head text-[12.5px] font-semibold text-ink"
              >
                <span className="text-green">
                  <CrumbIcon className="size-[13px]" aria-hidden="true" />
                </span>
                {crumb.label}
              </span>
            ) : (
              <CustomTooltip content={`Ir a ${crumb.label}`}>
                  <Link
                    to={crumb.path}
                    className="flex items-center gap-1.5 text-[12.5px] font-medium text-sub"
                  >
                    <CrumbIcon className="size-[13px]" aria-hidden="true" />
                    {crumb.label}
                  </Link>
              </CustomTooltip>
            )}
          </li>
          )
        })}
      </ol>
    </nav>
  )
}
