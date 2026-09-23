import WorkspaceLayout from '@/components/layouts/WorkspaceLayout'
import {
  SUPERADMIN_DEFAULT_WORKSPACE_ID,
  SUPERADMIN_WORKSPACE_GROUPS,
  SUPERADMIN_WORKSPACES,
} from '@/constants/navigation'

export default function SuperadminLayout() {
  return (
    <WorkspaceLayout
      workspaces={SUPERADMIN_WORKSPACES}
      defaultWorkspaceId={SUPERADMIN_DEFAULT_WORKSPACE_ID}
      workspaceGroups={SUPERADMIN_WORKSPACE_GROUPS}
      roleLabel="Superadministrador"
    />
  )
}
