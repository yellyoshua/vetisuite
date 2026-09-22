import type { ChangeEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import {
  buildDisplayNamesMap,
  DEFAULT_ACCEPT,
  getButtonLabel,
  getFileNameFromPath,
  getFilesToUpload,
  getStatusDescription,
  getStatusTitle,
  getStoredFiles,
  mergeDisplayNames,
  normalizeMultiValue,
  normalizeSingleValue,
  removeDisplayName,
  sizeStyles,
  splitFileName,
  uploadSelectedFiles,
  type DisplayNames,
  type UploadSize,
} from './FormUploadFiles.utils'

type FormUploadFilesProps<TValues extends FieldValues> = {
  accept?: string
  className?: string
  control: Control<TValues>
  description?: ReactNode
  disabled?: boolean
  label?: ReactNode
  labelClassName?: string
  multiple?: boolean
  name: FieldPath<TValues>
  onUploadingChange?: (isUploading: boolean) => void
  size?: UploadSize
}

export function FormUploadFiles<TValues extends FieldValues>({
  accept = DEFAULT_ACCEPT,
  className,
  control,
  description,
  disabled,
  label,
  labelClassName,
  multiple = false,
  name,
  onUploadingChange,
  size = 'md',
}: FormUploadFilesProps<TValues>) {
  const { field, fieldState } = useController({ name, control })
  const { ref: fieldRef, name: fieldName } = field
  const [displayNames, setDisplayNames] = useState<DisplayNames>({})
  const [uploadError, setUploadError] = useState('')
  const [uploadingFilesCount, setUploadingFilesCount] = useState(0)

  const normalizedValue = multiple ? normalizeMultiValue(field.value) : normalizeSingleValue(field.value)
  const storedFiles = getStoredFiles({ multiple, value: normalizedValue })
  const currentSize = sizeStyles[size] || sizeStyles.md
  const isUploading = uploadingFilesCount > 0
  const isDisabled = disabled || isUploading
  const totalFiles = storedFiles.length
  const buttonLabel = getButtonLabel({ isUploading, multiple, totalFiles })
  const statusTitle = getStatusTitle({ isUploading, totalFiles })
  const statusDescription = getStatusDescription({ accept, isUploading, multiple, totalFiles, uploadingFilesCount })

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const filesToUpload = getFilesToUpload({ event, multiple })

    if (!filesToUpload.length) {
      return
    }

    setUploadError('')
    setUploadingFilesCount(filesToUpload.length)
    onUploadingChange?.(true)

    const uploadResult = await uploadFiles(filesToUpload, setUploadingFilesCount)
    onUploadingChange?.(false)
    const { failedMessages, successfulUploads } = uploadResult

    if (failedMessages.length) {
      setUploadError(failedMessages[0])
    }

    if (!successfulUploads.length) {
      return
    }

    const nextDisplayNames = buildDisplayNamesMap(successfulUploads)

    setDisplayNames((currentDisplayNames) => mergeDisplayNames({
      currentDisplayNames,
      multiple,
      nextDisplayNames,
      previousValue: normalizedValue,
    }))

    if (multiple) {
      field.onChange([
        ...(normalizedValue as string[]),
        ...successfulUploads.map((uploadedFile) => uploadedFile.path),
      ])

      return
    }

    field.onChange(successfulUploads[0].path)
  }

  const handleRemove = (path: string) => {
    setUploadError('')
    setDisplayNames((currentDisplayNames) => removeDisplayName(currentDisplayNames, path))

    if (multiple) {
      field.onChange((normalizedValue as string[]).filter((value) => value !== path))

      return
    }

    field.onChange(null)
  }

  return (
    <Field data-disabled={isDisabled} data-invalid={fieldState.invalid}>
      <div className={cn('flex flex-col gap-3', className)}>
        {label && <FieldLabel htmlFor={name} className={labelClassName}>{label}</FieldLabel>}

        <div
          className={cn(
            'border border-dashed border-border bg-muted/20 backdrop-blur-sm transition-colors',
            currentSize.panel,
            (fieldState.invalid || uploadError) && 'border-destructive/60',
            isDisabled && 'opacity-80',
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className={cn('flex min-w-0 items-start', currentSize.statusWrapper)} aria-live="polite">
              <div
                className={cn(
                  'flex shrink-0 items-center justify-center border border-border/60 bg-background text-primary shadow-xs',
                  currentSize.statusIconBox,
                )}
              >
                {isUploading ? (
                  <Loader2 className={cn('animate-spin', currentSize.statusIcon)} />
                ) : (
                  <Upload className={cn(currentSize.statusIcon)} />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{statusTitle}</p>
                <p className="text-sm text-muted-foreground">{statusDescription}</p>
              </div>
            </div>

            <input
              ref={fieldRef}
              id={name}
              name={fieldName}
              type="file"
              accept={accept}
              multiple={multiple}
              disabled={isDisabled}
              onChange={handleFileChange}
              className="sr-only"
              aria-invalid={fieldState.invalid}
            />

            <label htmlFor={name} className={cn('shrink-0', isDisabled && 'pointer-events-none')}>
              <Button
                type="button"
                asChild
                variant="outline"
                size={currentSize.buttonSize}
                disabled={isDisabled}
                className={cn(
                  'cursor-pointer rounded-xl border-border bg-background/90 shadow-sm hover:bg-background',
                  currentSize.buttonClass,
                )}
              >
                <span>
                  {isUploading ? (
                    <Loader2 className={cn('animate-spin', currentSize.buttonIcon)} />
                  ) : (
                    <Upload className={cn(currentSize.buttonIcon)} />
                  )}
                  {buttonLabel}
                </span>
              </Button>
            </label>
          </div>

          {totalFiles > 0 ? (
            <div className={cn('mt-4 grid', currentSize.list)}>
              {storedFiles.map((path) => {
                const fileName = displayNames[path] || getFileNameFromPath(path)
                const fileParts = splitFileName(fileName)

                return (
                  <div
                    key={path}
                    className={cn(
                      'flex min-w-0 items-center gap-3 border border-border/60 bg-background/80',
                      currentSize.item,
                    )}
                  >
                    <div
                      className={cn(
                        'flex shrink-0 items-center justify-center bg-muted text-muted-foreground',
                        currentSize.fileIconBox,
                      )}
                    >
                      <FileText className={cn(currentSize.fileIcon)} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className={cn('min-w-0 flex-1 truncate font-medium text-foreground', currentSize.fileName)}>
                          {fileParts.baseName}
                        </p>

                        {fileParts.extension && (
                          <span className="shrink-0 rounded-full border border-border/70 bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {fileParts.extension}
                          </span>
                        )}
                      </div>

                      <p className={cn('text-muted-foreground', currentSize.meta)}>
                        Archivo listo para enviar
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isDisabled}
                      onClick={() => handleRemove(path)}
                      className={cn('shrink-0 rounded-full text-muted-foreground hover:text-foreground', currentSize.removeButton)}
                      aria-label={`Quitar ${fileName}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className={cn(
                'mt-4 flex items-center justify-center border border-dashed border-border/70 bg-background/60 text-center text-muted-foreground',
                currentSize.emptyState,
              )}
            >
              <p className={cn(currentSize.emptyStateText)}>
                No hay archivos cargados todavía.
              </p>
            </div>
          )}
        </div>

        {description && <FieldDescription>{description}</FieldDescription>}
        {uploadError && <FieldError>{uploadError}</FieldError>}
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </div>
    </Field>
  )
}

async function uploadFiles(filesToUpload: File[], setUploadingFilesCount: (count: number) => void) {
  try {
    return await uploadSelectedFiles(filesToUpload)
  } finally {
    setUploadingFilesCount(0)
  }
}
