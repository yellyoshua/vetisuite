import WorkspaceLayout from '@/components/layouts/WorkspaceLayout'
import { OWNER_DEFAULT_WORKSPACE_ID, OWNER_WORKSPACE_GROUPS, OWNER_WORKSPACES } from '@/constants/navigation'

export default function OwnerLayout() {
  return (
    <WorkspaceLayout
      workspaces={OWNER_WORKSPACES}
      defaultWorkspaceId={OWNER_DEFAULT_WORKSPACE_ID}
      workspaceGroups={OWNER_WORKSPACE_GROUPS}
      roleLabel="Dueño"
    />
  )
}
