import { create } from 'zustand'
import { DEFAULT_WORKSPACE_ID, type WorkspaceId } from '@/constants/navigation'

type WorkspaceState = {
  workspaceId: WorkspaceId
  setWorkspaceId: (workspaceId: WorkspaceId) => void
}

const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: DEFAULT_WORKSPACE_ID,
  setWorkspaceId: (workspaceId) => set({ workspaceId }),
}))

export default useWorkspaceStore
