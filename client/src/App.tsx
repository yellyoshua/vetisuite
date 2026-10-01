import { Toaster } from 'sonner'
import { CheckCircleIcon, InfoIcon, TriangleAlertIcon, XCircleIcon } from 'lucide-react'
import Authorization from '@/components/Authorization/Authorization'
import ConfirmationDialog from '@/components/confirmation-dialog'

export default function App() {
  return (
    <>
      <Authorization />
      <Toaster position="top-right" closeButton={true} icons={{
        success: <CheckCircleIcon className="w-5 h-5 text-primary" />,
        error: <XCircleIcon className="w-5 h-5 text-danger" />,
        warning: <TriangleAlertIcon className="w-5 h-5 text-warning" />,
        info: <InfoIcon className="w-5 h-5 text-info" />,
      }} duration={5000} richColors={true} />
      <ConfirmationDialog />
    </>
  )
}
