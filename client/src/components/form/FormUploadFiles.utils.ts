import type { ChangeEvent } from 'react'
import uploadFile from '@/core/upload'

type UploadFailure = {
  error?: string
  message?: string
}

export type UploadSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type UploadSizeStyle = {
  panel: string
  statusWrapper: string
  statusIconBox: string
  statusIcon: string
  buttonSize: 'sm' | 'default' | 'lg'
  buttonClass: string
  buttonIcon: string
  list: string
  item: string
  fileIconBox: string
  fileIcon: string
  fileName: string
  meta: string
  removeButton: string
  emptyState: string
  emptyStateText: string
}

export type UploadedFile = {
  path: string
  name: string
}

export type DisplayNames = Record<string, string>

const UUID_REGEXP = (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

export const DEFAULT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx'

export const sizeStyles: Record<UploadSize, UploadSizeStyle> = {
  xs: {
    panel: 'rounded-xl p-3',
    statusWrapper: 'gap-2.5',
    statusIconBox: 'h-9 w-9 rounded-lg',
    statusIcon: 'h-4 w-4',
    buttonSize: 'sm',
    buttonClass: 'h-8 px-3 text-xs',
    buttonIcon: 'h-3.5 w-3.5',
    list: 'gap-2',
    item: 'rounded-lg px-3 py-2',
    fileIconBox: 'h-8 w-8 rounded-lg',
    fileIcon: 'h-4 w-4',
    fileName: 'text-xs',
    meta: 'text-[11px]',
    removeButton: 'h-7 w-7',
    emptyState: 'rounded-lg px-3 py-2',
    emptyStateText: 'text-xs',
  },
  sm: {
    panel: 'rounded-xl p-4',
    statusWrapper: 'gap-3',
    statusIconBox: 'h-10 w-10 rounded-xl',
    statusIcon: 'h-4 w-4',
    buttonSize: 'sm',
    buttonClass: 'h-9 px-3.5 text-sm',
    buttonIcon: 'h-4 w-4',
    list: 'gap-2.5',
    item: 'rounded-xl px-3.5 py-2.5',
    fileIconBox: 'h-9 w-9 rounded-lg',
    fileIcon: 'h-4 w-4',
    fileName: 'text-sm',
    meta: 'text-xs',
    removeButton: 'h-8 w-8',
    emptyState: 'rounded-xl px-3.5 py-3',
    emptyStateText: 'text-sm',
  },
  md: {
    panel: 'rounded-2xl p-5',
    statusWrapper: 'gap-3',
    statusIconBox: 'h-11 w-11 rounded-xl',
    statusIcon: 'h-5 w-5',
    buttonSize: 'default',
    buttonClass: 'h-10 px-4 text-sm',
    buttonIcon: 'h-4 w-4',
    list: 'gap-3',
    item: 'rounded-xl px-4 py-3',
    fileIconBox: 'h-10 w-10 rounded-xl',
    fileIcon: 'h-4 w-4',
    fileName: 'text-sm',
    meta: 'text-xs',
    removeButton: 'h-8 w-8',
    emptyState: 'rounded-xl px-4 py-3',
    emptyStateText: 'text-sm',
  },
  lg: {
    panel: 'rounded-2xl p-6',
    statusWrapper: 'gap-4',
    statusIconBox: 'h-12 w-12 rounded-2xl',
    statusIcon: 'h-5 w-5',
    buttonSize: 'lg',
    buttonClass: 'h-11 px-5 text-sm',
    buttonIcon: 'h-4 w-4',
    list: 'gap-3',
    item: 'rounded-2xl px-4 py-3.5',
    fileIconBox: 'h-11 w-11 rounded-xl',
    fileIcon: 'h-5 w-5',
    fileName: 'text-sm',
    meta: 'text-xs',
    removeButton: 'h-9 w-9',
    emptyState: 'rounded-2xl px-4 py-3.5',
    emptyStateText: 'text-sm',
  },
  xl: {
    panel: 'rounded-[1.5rem] p-7',
    statusWrapper: 'gap-4',
    statusIconBox: 'h-14 w-14 rounded-2xl',
    statusIcon: 'h-6 w-6',
    buttonSize: 'lg',
    buttonClass: 'h-12 px-6 text-base',
    buttonIcon: 'h-5 w-5',
    list: 'gap-3.5',
    item: 'rounded-2xl px-5 py-4',
    fileIconBox: 'h-12 w-12 rounded-2xl',
    fileIcon: 'h-5 w-5',
    fileName: 'text-base',
    meta: 'text-sm',
    removeButton: 'h-10 w-10',
    emptyState: 'rounded-2xl px-5 py-4',
    emptyStateText: 'text-sm',
  },
}

export function normalizeMultiValue(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string' && Boolean(item))
}

export function getStoredFiles({ multiple, value }: { multiple: boolean, value: string[] | string | null }): string[] {
  if (multiple) {
    return value as string[]
  }

  if (!value) {
    return []
  }

  return [value as string]
}

export function getButtonLabel({ isUploading, multiple, totalFiles }: { isUploading: boolean, multiple: boolean, totalFiles: number }): string {
  if (isUploading) {
    return 'Subiendo...'
  }

  if (multiple) {
    return totalFiles ? 'Agregar archivos' : 'Seleccionar archivos'
  }

  return totalFiles ? 'Cambiar archivo' : 'Seleccionar archivo'
}

export function getStatusTitle({ isUploading, totalFiles }: { isUploading: boolean, totalFiles: number }): string {
  if (isUploading) {
    return 'Subiendo archivos'
  }

  if (totalFiles) {
    return 'Archivos cargados'
  }

  return 'Sube tus archivos'
}

export function getStatusDescription({ accept, isUploading, multiple, totalFiles, uploadingFilesCount }: {
  accept: string
  isUploading: boolean
  multiple: boolean
  totalFiles: number
  uploadingFilesCount: number
}): string {
  if (isUploading) {
    return uploadingFilesCount === 1 ? 'Subiendo 1 archivo...' : `Subiendo ${uploadingFilesCount} archivos...`
  }

  if (!totalFiles) {
    return `Acepta ${formatAcceptHint(accept)}`
  }

  if (!multiple) {
    return '1 archivo listo para enviar'
  }

  return totalFiles === 1 ? '1 archivo listo para enviar' : `${totalFiles} archivos listos para enviar`
}

function formatAcceptHint(accept: string): string {
  const formattedExtensions = String(accept || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace('.', '').toUpperCase())

  if (!formattedExtensions.length) {
    return 'archivos compatibles'
  }

  return formattedExtensions.join(', ')
}

export function normalizeSingleValue(value: unknown): string | null {
  if (Array.isArray(value)) {
    return normalizeSingleValue(value[0])
  }

  if (typeof value !== 'string' || !value) {
    return null
  }

  return value
}

export function getFilesToUpload({ event, multiple }: { event: ChangeEvent<HTMLInputElement>, multiple: boolean }): File[] {
  const selectedFiles = Array.from(event.target.files || [])

  event.target.value = ''

  if (multiple) {
    return selectedFiles
  }

  return selectedFiles.slice(0, 1)
}

export async function uploadSelectedFiles(filesToUpload: File[]) {
  const successfulUploads: UploadedFile[] = []
  const failedMessages: string[] = []

  for (const file of filesToUpload) {
    try {
      const path = await uploadFile(file)

      successfulUploads.push({ path, name: file.name })
    } catch (reason) {
      const failure = reason as UploadFailure

      failedMessages.push(failure?.error || failure?.message || `Error al subir ${file.name}`)
    }
  }

  return { successfulUploads, failedMessages }
}

export function buildDisplayNamesMap(successfulUploads: UploadedFile[]): DisplayNames {
  return successfulUploads.reduce((result, uploadedFile) => ({
    ...result,
    [uploadedFile.path]: uploadedFile.name,
  }), {})
}

export function mergeDisplayNames({ currentDisplayNames, multiple, nextDisplayNames, previousValue }: {
  currentDisplayNames: DisplayNames
  multiple: boolean
  nextDisplayNames: DisplayNames
  previousValue: string[] | string | null
}): DisplayNames {
  if (multiple) {
    return {
      ...currentDisplayNames,
      ...nextDisplayNames,
    }
  }

  const cleanedDisplayNames = previousValue
    ? removeDisplayName(currentDisplayNames, previousValue as string)
    : currentDisplayNames

  return {
    ...cleanedDisplayNames,
    ...nextDisplayNames,
  }
}

export function removeDisplayName(displayNames: DisplayNames, path: string): DisplayNames {
  return Object.fromEntries(Object.entries(displayNames).filter(([key]) => key !== path))
}

export function getFileNameFromPath(path: string): string {
  const lastSegment = decodeURIComponent(String(path || '').split('/').filter(Boolean).pop() || '')
  const cleanSegment = lastSegment.split('?')[0]
  const parts = cleanSegment.split('.')

  if (parts.length >= 3 && UUID_REGEXP.test(parts[0])) {
    return `${parts.slice(1, -1).join('.')}.${parts[parts.length - 1]}`
  }

  return cleanSegment
}

export function splitFileName(fileName: string) {
  const normalizedName = String(fileName || '').trim()
  const lastDotIndex = normalizedName.lastIndexOf('.')

  if (lastDotIndex <= 0 || lastDotIndex === normalizedName.length - 1) {
    return {
      baseName: normalizedName || 'Archivo sin nombre',
      extension: '',
    }
  }

  return {
    baseName: normalizedName.slice(0, lastDotIndex),
    extension: normalizedName.slice(lastDotIndex + 1),
  }
}
