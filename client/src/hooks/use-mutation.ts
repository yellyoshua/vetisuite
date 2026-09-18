import { useState } from 'react'

type MutationState<TInput> = [isLoading: boolean, submit: (input: TInput) => Promise<void>, error: Error | null]

type MutationOptions<TResult> = {
  onSuccess: (result: TResult) => void
}

function toError(reason: unknown): Error {
  if (reason instanceof Error) {
    return reason
  }

  return new Error('No se pudo guardar el cambio', { cause: reason })
}

export default function useMutation<TInput, TResult>(
  mutation: (input: TInput) => Promise<TResult>,
  { onSuccess }: MutationOptions<TResult>,
): MutationState<TInput> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  async function submit(input: TInput) {
    setIsLoading(true)
    setError(null)
    try {
      onSuccess(await mutation(input))
    } catch (reason) {
      setError(toError(reason))
    } finally {
      setIsLoading(false)
    }
  }

  return [isLoading, submit, error]
}
