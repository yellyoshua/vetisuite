import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { ImageUp, Loader2, Trash2, UserRound } from 'lucide-react'
import { cn, getPictureSrc } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import uploadFile from '@/core/upload'

type UploadFailure = {
  error?: string
  message?: string
}

type FormUploadAvatarProps<TValues extends FieldValues> = {
  className?: string
  control: Control<TValues>
  disabled?: boolean
  label?: string
  name: FieldPath<TValues>
}

const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

export function FormUploadAvatar<TValues extends FieldValues>({ className, control, disabled, label, name }: FormUploadAvatarProps<TValues>) {
  const { field, fieldState } = useController({ name, control })
  const { ref: fieldRef, name: fieldName } = field
  const [uploadError, setUploadError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const value = typeof field.value === 'string' && field.value ? field.value : null
  const hasFile = Boolean(value)
  const isDisabled = disabled || isUploading
  const avatarSrc = localPreview || (hasFile ? getPictureSrc(value) : null)

  useEffect(() => {
    if (!localPreview) {
      return undefined
    }

    return () => URL.revokeObjectURL(localPreview)
  }, [localPreview])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file) {
      return
    }

    setUploadError('')
    setIsUploading(true)

    setLocalPreview(URL.createObjectURL(file))

    try {
      field.onChange(await uploadFile(file))
    } catch (reason) {
      const failure = reason as UploadFailure

      setLocalPreview(null)
      setUploadError(failure.error || failure.message || `Error al subir ${file.name}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setUploadError('')
    setLocalPreview(null)
    field.onChange(null)
  }

  return (
    <Field data-disabled={isDisabled} data-invalid={fieldState.invalid}>
      <div className={cn('my-1 flex flex-col gap-3', className)}>
        {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}

        <div className="flex w-fit flex-col items-center gap-3">
          <div className={cn('inline-flex w-fit p-4 transition-colors', isDisabled && 'opacity-80')}>
            <input
              ref={fieldRef}
              id={name}
              name={fieldName}
              type="file"
              accept={AVATAR_ACCEPT}
              disabled={isDisabled}
              onChange={handleFileChange}
              className="sr-only"
              aria-invalid={fieldState.invalid}
            />

            <div className="flex flex-col items-center text-center">
              <div className="relative inline-flex" aria-live="polite">
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-400/20 to-blue-600/20 blur-xl" />
                <Avatar className="relative h-28 w-28 border-4 border-background shadow-lg ring-1 ring-border/60">
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={label || 'Foto de perfil'} className="object-cover" />}
                  <AvatarFallback className="bg-linear-to-br from-blue-400 to-blue-600 text-white">
                    <UserRound className="h-11 w-11" />
                  </AvatarFallback>
                </Avatar>

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                )}

                {hasFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={isDisabled}
                    onClick={handleRemove}
                    className="absolute -top-1 -right-1 h-9 w-9 cursor-pointer rounded-full border-border bg-background/95 text-muted-foreground shadow-md hover:bg-background hover:text-destructive"
                    aria-label="Quitar foto de perfil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <label htmlFor={name} className={cn('absolute -bottom-1 -right-1', isDisabled && 'pointer-events-none')}>
                  <Button
                    type="button"
                    asChild
                    variant="default"
                    size="icon-sm"
                    disabled={isDisabled}
                    className="h-10 w-10 cursor-pointer rounded-full shadow-lg"
                  >
                    <span aria-hidden="true">
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImageUp className="h-4 w-4" />
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </div>

        {uploadError && <FieldError>{uploadError}</FieldError>}
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </div>
    </Field>
  )
}
