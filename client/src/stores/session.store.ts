import { create } from 'zustand'

export type SessionRole = 'superadmin' | 'owner' | 'employee' | 'public'

export type SessionState = {
  role: SessionRole
  setRole: (role: SessionRole) => void
}

const useSessionStore = create<SessionState>((set) => ({
  role: 'employee',
  setRole: (role) => set({ role }),
}))

export default useSessionStore
