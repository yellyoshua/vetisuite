import type { NavEntry, Workspace } from '@/constants/navigation'

export type ActiveNavigation = {
  workspace: Workspace
  entry: NavEntry | null
}

function matchesEntry(pathname: string, entry: NavEntry): boolean {
  if (entry.path === '/') {
    return pathname === '/'
  }

  return pathname === entry.path || pathname.startsWith(`${entry.path}/`)
}

export function findActiveNavigation(
  pathname: string,
  selectedWorkspaceId: string,
  workspaces: Workspace[],
): ActiveNavigation {
  const matchingWorkspaces = workspaces.filter((workspace) =>
    workspace.entries.some((entry) => matchesEntry(pathname, entry)),
  )
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
  const workspace = matchingWorkspaces.length === 1
    ? matchingWorkspaces[0]
    : (selectedWorkspace ?? matchingWorkspaces[0] ?? workspaces[0])

  if (!workspace) {
    throw new Error(`Unknown workspace for path: ${pathname}`)
  }

  return {
    workspace,
    entry: workspace.entries.find((entry) => matchesEntry(pathname, entry)) ?? null,
  }
}

export default findActiveNavigation
