import { WORKSPACES, type NavEntry, type Workspace, type WorkspaceId } from '@/constants/navigation'

type ActiveNavigation = {
  workspace: Workspace
  entry: NavEntry | null
}

function matchesEntry(pathname: string, entry: NavEntry): boolean {
  return pathname === entry.path || pathname.startsWith(`${entry.path}/`)
}

export default function findActiveNavigation(pathname: string, selectedWorkspaceId: WorkspaceId): ActiveNavigation {
  const owners = WORKSPACES.filter((workspace) => workspace.entries.some((entry) => matchesEntry(pathname, entry)))
  const selectedWorkspace = WORKSPACES.find((workspace) => workspace.id === selectedWorkspaceId)
  const workspace = owners.length === 1 ? owners[0] : selectedWorkspace
  if (!workspace) {
    throw new Error(`Unknown workspace: ${selectedWorkspaceId}`)
  }

  return {
    workspace,
    entry: workspace.entries.find((entry) => matchesEntry(pathname, entry)) ?? null,
  }
}
