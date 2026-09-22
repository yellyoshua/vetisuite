import { useRef, useState } from 'react'
import { toast } from 'sonner'
import logger from '@/lib/logger'
import useConfirmationDialogStore, { type ConfirmationConfig } from '@/stores/confirmation-dialog.store'

type MutationFailure = {
  error?: string
  message?: string
  fields?: string[]
}

export type MutationError = {
  message: string
  fields?: string[]
}

type MutationOptions<TResponse> = {
  onSuccess?: (response: TResponse) => void
  onError?: (error: MutationError) => void
  confirm?: Omit<ConfirmationConfig, 'data'>
  skipConfirm?: boolean
  successMessage?: string
  disableToast?: boolean
}

export default function useMutation<TData = void, TResponse = unknown>(
  request: (data: TData) => Promise<TResponse>,
  { onSuccess, onError, confirm, skipConfirm, successMessage, disableToast }: MutationOptions<TResponse> = {},
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<MutationError | null>(null)
  const busyRef = useRef(false)

  const submit = async (data: TData) => {
    if (busyRef.current) {
      return
    }

    busyRef.current = true

    const confirmed = skipConfirm || await useConfirmationDialogStore.getState().open({ ...confirm, data })

    if (!confirmed) {
      busyRef.current = false

      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await request(data)

      if (!disableToast) {
        toast.success(successMessage || 'Operación realizada correctamente')
      }

      onSuccess?.(response)
    } catch (reason) {
      const failure = reason as MutationFailure

      logger.error('[useMutation] Falló la mutación', failure)

      const message = failure.error || failure.message || 'Ocurrió un error inesperado'

      setError({ message, fields: failure.fields })

      if (!disableToast) {
        toast.error(message)
      }

      onError?.({ message, fields: failure.fields })
    } finally {
      busyRef.current = false
      setIsLoading(false)
    }
  }

  return [isLoading, submit, error] as const
}
