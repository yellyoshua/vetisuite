import { useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import useConfirmationDialogStore from '@/stores/confirmation-dialog.store'

export default function ConfirmationDialog() {
  const { isOpen, title, description, confirmText, cancelText, variant, data, confirm, cancel, reset } =
    useConfirmationDialogStore()

  useEffect(() => {
    return () => reset()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resolvedDescription = typeof description === 'function' ? description(data) : description

  return (
    <AlertDialog open={isOpen} onOpenChange={cancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{resolvedDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
