import { create } from 'zustand'
import { combine, createJSONStorage, persist } from 'zustand/middleware'

export type SessionRole = 'superadmin' | 'owner' | 'employee'

export type SessionUser = {
  id: string
  email: string
  role: SessionRole
  emailConfirmed: boolean
  disabled: boolean
  bannedUntil: string | null
}

export type SessionProfile = {
  id: string
  firstName: string
  lastName: string
  avatar: string | null
  user: SessionUser
}

type SessionState = {
  profile: SessionProfile | null
}

const initialState: SessionState = { profile: null }

export const useSessionStore = create(persist(combine(
  initialState,
  (set) => ({
    setSession: ({ profile }: { profile: SessionProfile }) => set({ profile }),
    clear: () => set({ profile: null }),
  }),
), {
  name: 'vetisuite.session',
  storage: createJSONStorage(() => localStorage),
  version: 2,
  migrate: () => ({ profile: null }),
}))
