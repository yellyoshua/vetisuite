import { describe, expect, it } from 'bun:test'
import {
  DEFAULT_WORKSPACE_ID,
  SUPERADMIN_DEFAULT_WORKSPACE_ID,
  SUPERADMIN_WORKSPACES,
  WORKSPACES,
} from '@/constants/navigation'
import { findActiveNavigation } from '../find-active-navigation'

describe('findActiveNavigation', () => {
  describe('Employee / Owner workspaces', () => {
    it('resolves unique entry to its owning workspace', () => {
      const result = findActiveNavigation('/appointments', DEFAULT_WORKSPACE_ID, WORKSPACES)

      expect(result.workspace.id).toBe('reception')
      expect(result.entry?.label).toBe('Citas')
      expect(result.entry?.path).toBe('/appointments')
    })

    it('retains selected workspace when entry is shared across multiple workspaces', () => {
      const marketingClients = findActiveNavigation('/clients', 'marketing', WORKSPACES)
      expect(marketingClients.workspace.id).toBe('marketing')
      expect(marketingClients.entry?.label).toBe('Clientes y Pacientes')

      const billingClients = findActiveNavigation('/clients', 'billing', WORKSPACES)
      expect(billingClients.workspace.id).toBe('billing')
      expect(billingClients.entry?.label).toBe('Clientes y Pacientes')
    })

    it('matches subroutes of an entry', () => {
      const result = findActiveNavigation('/clients/client-123/edit', 'reception', WORKSPACES)

      expect(result.entry?.path).toBe('/clients')
      expect(result.workspace.id).toBe('reception')
    })

    it('falls back to selected workspace when pathname does not match any entry', () => {
      const result = findActiveNavigation('/non-existent-path', 'care', WORKSPACES)

      expect(result.workspace.id).toBe('care')
      expect(result.entry).toBeNull()
    })
  })

  describe('Superadmin workspaces', () => {
    it('matches exact root path for Panel general without matching child paths mistakenly', () => {
      const rootResult = findActiveNavigation('/', SUPERADMIN_DEFAULT_WORKSPACE_ID, SUPERADMIN_WORKSPACES)

      expect(rootResult.workspace.id).toBe('administration')
      expect(rootResult.entry?.label).toBe('Panel general')
      expect(rootResult.entry?.path).toBe('/')
    })

    it('resolves superadmins list and subroutes', () => {
      const listResult = findActiveNavigation('/superadmins', SUPERADMIN_DEFAULT_WORKSPACE_ID, SUPERADMIN_WORKSPACES)
      expect(listResult.entry?.label).toBe('Superadmins')

      const editResult = findActiveNavigation('/superadmins/id-456/edit', SUPERADMIN_DEFAULT_WORKSPACE_ID, SUPERADMIN_WORKSPACES)
      expect(editResult.entry?.label).toBe('Superadmins')
    })

    it('resolves owners list and subroutes', () => {
      const listResult = findActiveNavigation('/owners', SUPERADMIN_DEFAULT_WORKSPACE_ID, SUPERADMIN_WORKSPACES)
      expect(listResult.entry?.label).toBe('Dueños')

      const createResult = findActiveNavigation('/owners/create', SUPERADMIN_DEFAULT_WORKSPACE_ID, SUPERADMIN_WORKSPACES)
      expect(createResult.entry?.label).toBe('Dueños')
    })

    it('resolves profile and subroutes', () => {
      const profileResult = findActiveNavigation('/profile', SUPERADMIN_DEFAULT_WORKSPACE_ID, SUPERADMIN_WORKSPACES)
      expect(profileResult.entry?.label).toBe('Perfil')

      const passwordResult = findActiveNavigation('/profile/password', SUPERADMIN_DEFAULT_WORKSPACE_ID, SUPERADMIN_WORKSPACES)
      expect(passwordResult.entry?.label).toBe('Perfil')
    })

    it('has only one workspace enabled for administration', () => {
      expect(SUPERADMIN_WORKSPACES).toHaveLength(1)
      expect(SUPERADMIN_WORKSPACES[0].id).toBe('administration')
      expect(SUPERADMIN_WORKSPACES[0].label).toBe('Administración')
      expect(SUPERADMIN_WORKSPACES[0].entries.map((item) => item.path)).toEqual([
        '/',
        '/superadmins',
        '/owners',
        '/profile',
      ])
    })
  })
})
