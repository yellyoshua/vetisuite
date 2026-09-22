import { Toaster } from 'sonner'
import { CheckCircleIcon, InfoIcon, TriangleAlertIcon, XCircleIcon } from 'lucide-react'
import Authorization from '@/components/Authorization/Authorization'
import ConfirmationDialog from '@/components/confirmation-dialog'

export default function App() {
  return (
    <>
      <Authorization />
      <Toaster position="top-right" closeButton={true} icons={{
        success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
        error: <XCircleIcon className="w-5 h-5 text-red-500" />,
        warning: <TriangleAlertIcon className="w-5 h-5 text-yellow-500" />,
        info: <InfoIcon className="w-5 h-5 text-blue-500" />,
      }} duration={5000} richColors={true} />
      <ConfirmationDialog />
    </>
  )
}
