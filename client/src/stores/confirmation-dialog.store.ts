import type { ReactNode } from 'react'
import { create } from 'zustand'

export type ConfirmationVariant = 'destructive' | 'default'

export type ConfirmationConfig = {
  title?: string
  description?: ReactNode | ((data: unknown) => ReactNode)
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationVariant
  data?: unknown
}

type ConfirmationDialogState = {
  isOpen: boolean
  title: string
  description: ReactNode | ((data: unknown) => ReactNode)
  confirmText: string
  cancelText: string
  variant: ConfirmationVariant
  data: unknown
  _resolve: ((confirmed: boolean) => void) | null
  open: (config: ConfirmationConfig) => Promise<boolean>
  confirm: () => void
  cancel: () => void
  reset: () => void
}

const useConfirmationDialogStore = create<ConfirmationDialogState>((set, get) => ({
  isOpen: false,
  title: '',
  description: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'destructive',
  data: null,
  _resolve: null,

  open: (config) => new Promise((resolve) => {
    get()._resolve?.(false)
    set({
      isOpen: true,
      title: config.title || '¿Estás seguro de realizar esta acción?',
      description: config.description || 'Esta acción no se puede deshacer.',
      confirmText: config.confirmText || 'Confirmar',
      cancelText: config.cancelText || 'Cancelar',
      variant: config.variant || 'destructive',
      data: config.data || null,
      _resolve: resolve,
    })
  }),

  confirm: () => {
    get()._resolve?.(true)
    set({ isOpen: false, _resolve: null })
  },

  cancel: () => {
    get()._resolve?.(false)
    set({ isOpen: false, _resolve: null })
  },

  reset: () => {
    get()._resolve?.(false)
    set({ isOpen: false, _resolve: null, data: null })
  },
}))

export default useConfirmationDialogStore
