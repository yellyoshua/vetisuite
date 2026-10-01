import { useState } from 'react'
import type { ToastVariant } from './toast.handlers'

export default function useToastDemo() {
  const [open, setOpen] = useState(false)
  const [variant, setVariant] = useState<ToastVariant>('default')

  const show = (next: ToastVariant) => {
    setVariant(next)
    setOpen(true)
  }

  return { open, setOpen, variant, show }
}
