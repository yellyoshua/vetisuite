import WorkspaceLayout from '@/components/layouts/WorkspaceLayout'
import { WORKSPACES, DEFAULT_WORKSPACE_ID, WORKSPACE_GROUPS } from '@/constants/navigation'
import resolveEmployeeLayout from './resolvers'

export default function EmployeeLayout() {
  return (
    <WorkspaceLayout
      workspaces={WORKSPACES}
      defaultWorkspaceId={DEFAULT_WORKSPACE_ID}
      workspaceGroups={WORKSPACE_GROUPS}
      roleLabel="Empleado"
      resolveData={resolveEmployeeLayout}
    />
  )
}
