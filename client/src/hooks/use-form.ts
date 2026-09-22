import type { FormEvent } from 'react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useForm as useHookForm, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import logger from '@/lib/logger'

type FormFailure = {
  error?: string
  message?: string
  fields?: string[]
}

export type FormError = {
  message: string
  fields?: string[]
}

type FormOptions<TValues extends FieldValues, TResponse> = {
  schema: z.ZodType<TValues, TValues>
  onSubmit: (body: TValues) => Promise<TResponse>
  redirectTo?: string
  onSuccess?: (response: TResponse) => void
  successMessage?: string
  disableToast?: boolean
}

export default function useForm<TValues extends FieldValues, TResponse = unknown>(
  content: TValues,
  { onSubmit, schema, redirectTo, onSuccess, successMessage, disableToast }: FormOptions<TValues, TResponse>,
) {
  const navigate = useNavigate()
  const form = useHookForm<TValues, unknown, TValues>({ values: content, shouldFocusError: true, mode: 'onChange', resolver: zodResolver(schema) })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<FormError | null>(null)
  const busyRef = useRef(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (busyRef.current) {
      return
    }

    busyRef.current = true

    const isValid = await form.trigger()

    if (!isValid) {
      busyRef.current = false
      logger.warning('[useForm] Validation errors', { fields: Object.keys(form.formState.errors) })

      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await onSubmit(form.getValues())

      if (!disableToast) {
        toast.success(successMessage || 'Operación realizada correctamente')
      }

      if (onSuccess) {
        onSuccess(response)

        return
      }

      if (redirectTo) {
        navigate(redirectTo)

        return
      }

      form.reset(content)
    } catch (reason) {
      const failure = reason as FormFailure

      logger.error('[useForm] Falló el envío', failure)

      const message = failure.error || failure.message || 'Ocurrió un error inesperado'

      setError({ message, fields: failure.fields })

      if (!disableToast) {
        toast.error(message)
      }

      applyServerFieldErrors(form, message, failure.fields)
    } finally {
      busyRef.current = false
      setIsSubmitting(false)
    }
  }

  return {
    control: form.control,
    watch: form.watch,
    setValue: form.setValue,
    trigger: form.trigger,
    reset: form.reset,
    formState: form.formState,
    isSubmitting,
    handleSubmit,
    error,
  }
}

function applyServerFieldErrors<TValues extends FieldValues>(form: UseFormReturn<TValues, unknown, TValues>, message: string, fields?: string[]) {
  if (!Array.isArray(fields)) {
    return
  }

  fields.forEach((name, index) => {
    form.setError(name as Path<TValues>, { type: 'server', message }, { shouldFocus: index === 0 })
  })
}
