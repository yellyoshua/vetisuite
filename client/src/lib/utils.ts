import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { apiDomain } from '@/lib/environment'

type InitialValue = string | number | null | undefined

type InitialPart = InitialValue | InitialValue[]

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function getPictureSrc(picture?: string | null): string | undefined {
  if (!picture) {
    return undefined
  }

  if (['http://', 'https://', 'data:', 'blob:', '/'].some((prefix) => picture.startsWith(prefix))) {
    return picture
  }

  return `${apiDomain}/api/files/${picture}`
}

export function getInitials(...parts: InitialPart[]): string {
  return parts
    .flat()
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
